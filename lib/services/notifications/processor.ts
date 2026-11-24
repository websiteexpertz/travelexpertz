/**
 * Notification Processing Engine
 * Claims and executes pending jobs in parallel with bounded concurrency and strict channel isolation.
 */

import { Db } from "mongodb";
import { getDb } from "../../db";
import {
  claimNotificationBatch,
  markNotificationAccepted,
  markNotificationDelivered,
  scheduleNotificationRetry,
  markNotificationFailed,
  markNotificationDeliveryUnknown,
} from "./queue";
import { buildBookingCommunicationData } from "./data-builder";
import { EmailNotificationAdapter } from "./adapters/email";
import { WhatsAppNotificationAdapter } from "./adapters/whatsapp";
import { NotificationAdapter, SendNotificationResult } from "./adapters/types";
import { BookingNotification } from "../../models/notification";

export interface ProcessingStats {
  claimed: number;
  accepted: number;
  delivered: number;
  retried: number;
  failed: number;
  blocked: number;
  unknown: number;
  durationMs: number;
}

export class NotificationProcessor {
  private emailAdapter: NotificationAdapter;
  private whatsappAdapter: NotificationAdapter;
  private database?: Db;

  constructor(options: { database?: Db } = {}) {
    this.database = options.database;
    this.emailAdapter = new EmailNotificationAdapter();
    this.whatsappAdapter = new WhatsAppNotificationAdapter();
  }

  async processBatch(
    options: {
      batchSize?: number;
      maxExecutionTimeMs?: number;
      workerId?: string;
    } = {}
  ): Promise<ProcessingStats> {
    const startTime = Date.now();
    const batchSize = options.batchSize || 20;
    const maxExecutionTimeMs = options.maxExecutionTimeMs || 25_000; // Leave 5s buffer for 30s lambda timeout
    const workerId =
      options.workerId ||
      `worker-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const stats: ProcessingStats = {
      claimed: 0,
      accepted: 0,
      delivered: 0,
      retried: 0,
      failed: 0,
      blocked: 0,
      unknown: 0,
      durationMs: 0,
    };

    const db = this.database || (await getDb());

    // 1. Claim batch of jobs
    const jobs = await claimNotificationBatch(batchSize, workerId, 120_000, db);
    stats.claimed = jobs.length;

    if (jobs.length === 0) {
      stats.durationMs = Date.now() - startTime;
      return stats;
    }

    // 2. Process concurrently with bounded Promise.allSettled
    const executionPromises = jobs.map(async (job) => {
      // Check execution deadline
      if (Date.now() - startTime > maxExecutionTimeMs) {
        console.warn(`[Worker] Execution deadline approaching. Aborting job ${job._id}`);
        return;
      }

      const claimToken = job.claimToken || workerId;
      const notificationId = job._id?.toString() || "";

      try {
        // Fetch canonical booking data
        const bookingData = await buildBookingCommunicationData(job.bookingId, db);
        if (!bookingData) {
          await markNotificationFailed(
            notificationId,
            claimToken,
            {
              code: "BOOKING_DATA_NOT_FOUND",
              message: `Associated booking ${job.bookingId} could not be retrieved`,
            },
            db
          );
          stats.failed++;
          return;
        }

        // Select channel adapter
        const adapter =
          job.channel === "EMAIL" ? this.emailAdapter : this.whatsappAdapter;

        const result: SendNotificationResult = await adapter.send({
          notificationId,
          bookingId: job.bookingId,
          recipient: job.recipient,
          type: job.type,
          channel: job.channel,
          bookingData,
          attempt: job.attempts,
        });

        // Handle outcomes
        if (result.status === "ACCEPTED") {
          await markNotificationAccepted(
            notificationId,
            claimToken,
            result.providerMessageId,
            db
          );
          stats.accepted++;
        } else if (result.status === "DELIVERED") {
          await markNotificationDelivered(notificationId, claimToken, db);
          stats.delivered++;
        } else if (result.status === "BLOCKED") {
          await markNotificationFailed(
            notificationId,
            claimToken,
            {
              code: result.errorCode || "RECIPIENT_BLOCKED",
              message: result.errorMessage || "Notification blocked by policy",
            },
            db
          );
          stats.blocked++;
        } else if (result.status === "DELIVERY_UNKNOWN") {
          await markNotificationDeliveryUnknown(
            notificationId,
            claimToken,
            {
              code: result.errorCode,
              message: result.errorMessage,
            },
            db
          );
          stats.unknown++;
        } else {
          // FAILED
          if (result.retryable) {
            await scheduleNotificationRetry(
              notificationId,
              claimToken,
              job.attempts,
              job.maxAttempts || 3,
              { code: result.errorCode, message: result.errorMessage },
              result.retryAfterMs,
              db
            );
            stats.retried++;
          } else {
            await markNotificationFailed(
              notificationId,
              claimToken,
              {
                code: result.errorCode || "PERMANENT_SEND_ERROR",
                message: result.errorMessage || "Non-retryable send failure",
              },
              db
            );
            stats.failed++;
          }
        }
      } catch (err: any) {
        console.error(`[Worker] Uncaught exception processing job ${job._id}:`, err);
        await scheduleNotificationRetry(
          notificationId,
          claimToken,
          job.attempts,
          job.maxAttempts || 3,
          {
            code: "UNCAUGHT_PROCESSOR_EXCEPTION",
            message: err?.message || "Internal processor error",
          },
          undefined,
          db
        );
        stats.retried++;
      }
    });

    await Promise.allSettled(executionPromises);
    stats.durationMs = Date.now() - startTime;
    return stats;
  }
}
