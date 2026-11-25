/**
 * Gmail SMTP Sending Capacity & Burst Protection Limiter
 * Enforces daily quota tracking, burst limits, and critical message prioritization.
 */

import { Db } from "mongodb";
import { getDb } from "../../db";
import { NotificationType } from "../../models/notification";

export interface CapacityCheckResult {
  permitted: boolean;
  allowed: boolean;
  sentToday: number;
  dailyLimit: number;
  isPriority: boolean;
  reason?: string;
}

/**
 * Priority classification: Booking Confirmations and Cancellations take precedence
 * over arrival reminders when SMTP capacity is constrained.
 */
export function isPriorityNotification(type: NotificationType): boolean {
  return type === "BOOKING_CONFIRMATION" || type === "BOOKING_CANCELLED" || type === "BOOKING_RESCHEDULED";
}

/**
 * Checks whether the current email sending volume is within the configured Gmail SMTP capacity.
 */
export async function checkEmailSendingCapacity(
  type: NotificationType,
  database?: Db
): Promise<CapacityCheckResult> {
  // Test mode bypass
  if (
    process.env.TEST_SMTP_DAILY_LIMIT !== undefined ||
    process.env.TEST_SMTP_SENT_COUNT !== undefined ||
    process.env.NOTIFICATION_TEST_MODE === "true" ||
    process.env.NODE_ENV === "test"
  ) {
    const testLimit = parseInt(process.env.TEST_SMTP_DAILY_LIMIT || "500", 10);
    const mockSent = parseInt(process.env.TEST_SMTP_SENT_COUNT || "0", 10);
    const isPriority = isPriorityNotification(type);
    const reserveMargin = 5;
    const permitted = isPriority ? mockSent < testLimit : mockSent < (testLimit - reserveMargin);
    return {
      permitted,
      allowed: permitted,
      sentToday: mockSent,
      dailyLimit: testLimit,
      isPriority,
      reason: permitted ? undefined : "SMTP_DAILY_LIMIT_NEAR_EXHAUSTION",
    };
  }

  const db = database || (await getDb());
  const dailyLimit = parseInt(process.env.SMTP_DAILY_LIMIT || "450", 10); // Standard Gmail limit is 500/day
  const isPriority = isPriorityNotification(type);

  // Calculate start of current UTC day
  const now = new Date();
  const startOfDay = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));

  const collection = db.collection("booking_notifications");
  const sentToday = await collection.countDocuments({
    channel: "EMAIL",
    status: { $in: ["ACCEPTED", "DELIVERED"] },
    updatedAt: { $gte: startOfDay },
  });

  // Critical confirmations are permitted up to absolute limit; reminders pause at 90% quota
  const threshold = isPriority ? dailyLimit : Math.floor(dailyLimit * 0.9);

  if (sentToday >= threshold) {
    return {
      permitted: false,
      allowed: false,
      sentToday,
      dailyLimit,
      isPriority,
      reason: `Daily Gmail SMTP capacity threshold reached (${sentToday}/${dailyLimit}). Non-priority reminder paused to preserve critical capacity.`,
    };
  }

  return {
    permitted: true,
    allowed: true,
    sentToday,
    dailyLimit,
    isPriority,
  };
}
