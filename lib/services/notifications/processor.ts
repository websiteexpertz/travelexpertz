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
  markNotificationBlocked,
  markNotificationSkipped,
  markNotificationDeliveryUnknown,
  markNotificationIneligible,
  markNotificationSending,
} from "./queue";
import { buildBookingCommunicationData } from "./data-builder";
import { validateReminderPreSendEligibility } from "./reminders";
import { checkEmailSendingCapacity } from "./capacity-limiter";
import { EmailNotificationAdapter } from "./adapters/email";
import { WhatsAppNotificationAdapter } from "./adapters/whatsapp";
import { NotificationAdapter, SendNotificationResult } from "./adapters/types";
import { BookingNotification } from "../../models/notification";
import { getOrGenerateBookingVoucher, getOrGenerateFinalInvoice } from "../documents/generator";
import { recordWorkerRun } from "./admin";
import { calculateReminderTimes } from "./reminder-calculator";

export interface ProcessingStats {
  claimed: number;
  accepted: number;
  delivered: number;
  retried: number;
  failed: number;
  blocked: number;
  skipped: number;
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
    const batchSize = Math.min(Math.max(options.batchSize || 10, 1), 10);
    const maxExecutionTimeMs = options.maxExecutionTimeMs || 45_000;
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
      skipped: 0,
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
        return;
      }

      const claimToken = job.claimToken || workerId;
      const notificationId = job._id?.toString() || "";
      let deliveryStarted = false;

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

        // Pre-send validation for reminder notifications
        if (job.type.startsWith("REMINDER_")) {
          if (bookingData.bookingStatus.toLowerCase() !== "confirmed") {
            await markNotificationIneligible(
              notificationId,
              claimToken,
              "CANCELLED",
              "BOOKING_NOT_CONFIRMED",
              db
            );
            stats.blocked++;
            return;
          }

          if (bookingData.bookingVersion !== job.bookingVersion) {
            await markNotificationIneligible(
              notificationId,
              claimToken,
              "CANCELLED",
              "BOOKING_VERSION_CHANGED",
              db
            );
            stats.blocked++;
            return;
          }

          const checkinAt = calculateReminderTimes(
            bookingData.checkinDate,
            "12:00"
          ).checkinAt;
          if (
            !Number.isFinite(checkinAt.getTime()) ||
            checkinAt.getTime() <= Date.now()
          ) {
            await markNotificationIneligible(
              notificationId,
              claimToken,
              "SKIPPED",
              "REMINDER_WINDOW_EXPIRED",
              db
            );
            stats.skipped++;
            return;
          }
        }

        // Email capacity quota check
        if (job.channel === "EMAIL") {
          const capacity = await checkEmailSendingCapacity(job.type, db);
          if (!capacity.permitted) {
            console.warn(
              `[Worker] Capacity limit reached. Postponing job ${job._id}: ${capacity.reason}`
            );
            await scheduleNotificationRetry(
              notificationId,
              claimToken,
              job.attempts,
              job.maxAttempts || 3,
              { code: "SMTP_CAPACITY_LIMIT_REACHED", message: capacity.reason },
              600_000, // Retry in 10 minutes
              db
            );
            stats.retried++;
            return;
          }
        }

        const deliveryStarted = await markNotificationSending(
          notificationId,
          claimToken,
          db
        );
        if (!deliveryStarted) {
          return;
        }
        // Select channel adapter
        const adapter =
          job.channel === "EMAIL" ? this.emailAdapter : this.whatsappAdapter;

        // Attachment retrieval for booking vouchers
        let documentBuffer: Buffer | undefined;
        let documentFilename: string | undefined;

        if (
          job.channel === "EMAIL" &&
          (job.type === "BOOKING_CONFIRMATION" || job.type === "BOOKING_RESCHEDULED")
        ) {
          try {
            // Retrieve or generate voucher within bounded deadline (3500ms)
            const voucherPromise = getOrGenerateBookingVoucher(job.bookingId, {
              database: db,
              isRescheduled: job.type === "BOOKING_RESCHEDULED",
            });
            const timeoutPromise = new Promise<{ success: false; error: string }>((resolve) =>
              setTimeout(() => resolve({ success: false, error: "Voucher generation deadline reached" }), 3500)
            );
            const voucherRes = await Promise.race([voucherPromise, timeoutPromise]);
            if (voucherRes.success && voucherRes.pdfBuffer) {
              documentBuffer = voucherRes.pdfBuffer;
              documentFilename =
                voucherRes.document?.filename ||
                `Yatra-Expertz-Booking-Voucher-${voucherRes.document?.documentNumber || job.bookingId}.pdf`;
            }
          } catch (vErr) {
            console.warn(`[Worker] Voucher attachment generation failed for ${job.bookingId}, falling back to plain confirmation:`, vErr);
          }
        } else if (job.channel === "EMAIL" && job.type === "FINAL_INVOICE") {
          try {
            const invoicePromise = getOrGenerateFinalInvoice(job.bookingId, { database: db });
            const timeoutPromise = new Promise<{ success: false; error: string }>((resolve) =>
              setTimeout(() => resolve({ success: false, error: "Invoice generation deadline reached" }), 3500)
            );
            const invoiceRes = await Promise.race([invoicePromise, timeoutPromise]);
            if (invoiceRes.success && invoiceRes.pdfBuffer) {
              documentBuffer = invoiceRes.pdfBuffer;
              documentFilename =
                invoiceRes.document?.filename ||
                `Yatra-Expertz-Invoice-${invoiceRes.document?.documentNumber || job.bookingId}.pdf`;
            }
          } catch (iErr) {
            console.warn(`[Worker] Final invoice attachment generation failed for ${job.bookingId}:`, iErr);
          }
        }

        const result: SendNotificationResult = await adapter.send({
          notificationId,
          bookingId: job.bookingId,
          recipient: job.recipient,
          type: job.type,
          channel: job.channel,
          bookingData,
          attempt: job.attempts,
          ...(documentBuffer ? { documentBuffer, documentFilename } : {}),
        } as any);

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
          await markNotificationBlocked(
            notificationId,
            claimToken,
            {
              code: result.errorCode || "RECIPIENT_BLOCKED",
              message: result.errorMessage || "Notification blocked by policy",
            },
            db
          );
          stats.blocked++;
        } else if (result.status === "SKIPPED") {
          await markNotificationSkipped(
            notificationId,
            claimToken,
            {
              code: result.errorCode || "SKIPPED_BY_POLICY",
              message: result.errorMessage || "Notification skipped",
            },
            db
          );
          stats.skipped++;
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
      } catch {
        if (deliveryStarted) {
          await markNotificationDeliveryUnknown(
            notificationId,
            claimToken,
            {
              code: "DELIVERY_OUTCOME_UNKNOWN",
              message: "Delivery outcome requires reconciliation",
            },
            db
          );
          stats.unknown++;
        } else {
          await scheduleNotificationRetry(
            notificationId,
            claimToken,
            job.attempts,
            job.maxAttempts || 3,
            {
              code: "UNCAUGHT_PROCESSOR_EXCEPTION",
              message: "Internal processor error",
            },
            undefined,
            db
          );
          stats.retried++;
        }
      }
    });

    await Promise.allSettled(executionPromises);
    stats.durationMs = Date.now() - startTime;

    try {
      await recordWorkerRun(
        {
          claimed: stats.claimed,
          accepted: stats.accepted,
          delivered: stats.delivered,
          retried: stats.retried,
          failed: stats.failed,
          durationMs: stats.durationMs,
        },
        workerId,
        db
      );
    } catch {
      // In-memory or logging error
    }

    return stats;
  }
}
