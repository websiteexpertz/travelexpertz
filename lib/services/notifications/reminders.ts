/**
 * Booking Reminder Scheduling & Lifecycle Service
 * Calculates offsets, schedules jobs, manages cancellations/rescheduling,
 * and validates pre-send reminder eligibility.
 */

import { Db, ObjectId, ClientSession } from "mongodb";
import { getDb } from "../../db";
import {
  BookingNotification,
  NotificationChannel,
  NotificationType,
  NotificationStatus,
} from "../../models/notification";
import { generateIdempotencyKey } from "./queue";

export const BUSINESS_DEFAULT_CHECKIN_TIME = "12:00 PM";
export const BUSINESS_DEFAULT_CHECKOUT_TIME = "11:00 AM";
export const REMINDER_GRACE_PERIOD_MS = 15 * 60 * 1000; // 15-minute grace window from scheduled trigger

export interface ReminderOffsetCalculation {
  type: "REMINDER_48_HOURS" | "REMINDER_24_HOURS" | "REMINDER_2_HOURS";
  scheduledAt: Date;
  expiresAt: Date;
  isPast: boolean;
}

export interface ReminderSchedulePlan {
  checkinUtc: Date;
  checkinTimeFormatted: string;
  reminders: ReminderOffsetCalculation[];
}

/**
 * Normalizes user or property check-in time string (e.g., "14:00", "2:00 PM", "12:00 PM")
 * into 24-hour hours and minutes.
 */
export function normalizeCheckinTime(timeStr?: string): {
  hours: number;
  minutes: number;
  formatted: string;
} {
  if (!timeStr) {
    const defaultParts = BUSINESS_DEFAULT_CHECKIN_TIME.split(" ")[0].split(":").map(Number);
    return { hours: defaultParts[0], minutes: defaultParts[1] || 0, formatted: BUSINESS_DEFAULT_CHECKIN_TIME };
  }

  const cleaned = timeStr.trim().toUpperCase();

  // Handle 12-hour AM/PM format (e.g., "2:00 PM", "11:30 AM", "2 PM")
  if (cleaned.includes("AM") || cleaned.includes("PM")) {
    const isPM = cleaned.includes("PM");
    const rawTime = cleaned.replace(/AM|PM/g, "").trim();
    const parts = rawTime.split(":").map((p) => parseInt(p, 10));
    let hours = isNaN(parts[0]) ? 12 : parts[0];
    const minutes = parts.length > 1 && !isNaN(parts[1]) ? parts[1] : 0;

    if (isPM && hours < 12) hours += 12;
    if (!isPM && hours === 12) hours = 0;

    const displayHours = hours % 12 || 12;
    const displayPeriod = hours >= 12 ? "PM" : "AM";
    const formatted = `${displayHours}:${minutes.toString().padStart(2, "0")} ${displayPeriod}`;

    return { hours, minutes, formatted };
  }

  // Handle 24-hour format (e.g., "14:00", "12:00")
  if (cleaned.includes(":")) {
    const parts = cleaned.split(":").map((p) => parseInt(p, 10));
    const hours = isNaN(parts[0]) ? 12 : Math.min(23, Math.max(0, parts[0]));
    const minutes = parts.length > 1 && !isNaN(parts[1]) ? Math.min(59, Math.max(0, parts[1])) : 0;

    const displayHours = hours % 12 || 12;
    const displayPeriod = hours >= 12 ? "PM" : "AM";
    const formatted = `${displayHours}:${minutes.toString().padStart(2, "0")} ${displayPeriod}`;

    return { hours, minutes, formatted };
  }

  return { hours: 12, minutes: 0, formatted: "12:00 PM" };
}

/**
 * Calculates reminder triggers in UTC using property check-in date and time in Asia/Kolkata timezone.
 */
export function calculateReminderSchedule(
  checkinDateStr: string,
  checkinTimeStr?: string,
  now: Date = new Date()
): ReminderSchedulePlan {
  let year: number;
  let month: number; // 0-based
  let day: number;

  if (checkinDateStr.includes("T")) {
    const d = new Date(checkinDateStr);
    year = d.getUTCFullYear();
    month = d.getUTCMonth();
    day = d.getUTCDate();
  } else if (checkinDateStr.includes("-")) {
    const parts = checkinDateStr.split("-").map(Number);
    year = parts[0];
    month = parts[1] - 1;
    day = parts[2];
  } else if (checkinDateStr.includes("/")) {
    const parts = checkinDateStr.split("/").map(Number);
    day = parts[0];
    month = parts[1] - 1;
    year = parts[2];
  } else {
    const d = new Date(checkinDateStr);
    year = d.getFullYear();
    month = d.getMonth();
    day = d.getDate();
  }

  const { hours, minutes, formatted: checkinTimeFormatted } = normalizeCheckinTime(checkinTimeStr);

  // IST offset is UTC + 5:30. Convert to absolute UTC timestamp:
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const targetCheckInUtcMs = Date.UTC(year, month, day, hours, minutes) - istOffsetMs;
  const checkinUtc = new Date(targetCheckInUtcMs);

  const ms48Hours = 48 * 60 * 60 * 1000;
  const ms24Hours = 24 * 60 * 60 * 1000;
  const ms2Hours = 2 * 60 * 60 * 1000;
  const gracePeriodMs = REMINDER_GRACE_PERIOD_MS;

  const date48h = new Date(targetCheckInUtcMs - ms48Hours);
  const date24h = new Date(targetCheckInUtcMs - ms24Hours);
  const date2h = new Date(targetCheckInUtcMs - ms2Hours);

  const nowMs = now.getTime();

  // 15-minute grace period calculated strictly from each reminder's scheduled timestamp,
  // capped at scheduled check-in time (never send after check-in has arrived).
  const expires48h = new Date(Math.min(date48h.getTime() + gracePeriodMs, targetCheckInUtcMs));
  const expires24h = new Date(Math.min(date24h.getTime() + gracePeriodMs, targetCheckInUtcMs));
  const expires2h = new Date(Math.min(date2h.getTime() + gracePeriodMs, targetCheckInUtcMs));

  const reminders: ReminderOffsetCalculation[] = [
    {
      type: "REMINDER_48_HOURS",
      scheduledAt: date48h,
      expiresAt: expires48h,
      isPast: date48h.getTime() < nowMs,
    },
    {
      type: "REMINDER_24_HOURS",
      scheduledAt: date24h,
      expiresAt: expires24h,
      isPast: date24h.getTime() < nowMs,
    },
    {
      type: "REMINDER_2_HOURS",
      scheduledAt: date2h,
      expiresAt: expires2h,
      isPast: date2h.getTime() < nowMs,
    },
  ];

  return {
    checkinUtc,
    checkinTimeFormatted,
    reminders,
  };
}

/**
 * Enqueues or updates reminder notification jobs for a confirmed booking.
 * Automatically handles last-minute bookings by flagging already-elapsed reminder offsets as SKIPPED.
 */
export async function scheduleRemindersForBooking(
  bookingId: string,
  options: {
    database?: Db;
    session?: ClientSession;
    now?: Date;
    forceConfirmed?: boolean;
  } = {}
): Promise<{
  enqueuedCount: number;
  skippedCount: number;
  scheduledReminders: Array<{ type: NotificationType; channel: NotificationChannel; status: NotificationStatus }>;
}> {
  const db = options.database || (await getDb());
  const bookingsCollection = db.collection("bookings");
  const notificationsCollection = db.collection<BookingNotification>("booking_notifications");

  const booking = await bookingsCollection.findOne(
    { _id: ObjectId.isValid(bookingId) ? new ObjectId(bookingId) : (bookingId as any) },
    options.session ? { session: options.session } : {}
  );

  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  // Only confirmed bookings are eligible for reminders
  if (booking.bookingStatus !== "confirmed" && !options.forceConfirmed) {
    return { enqueuedCount: 0, skippedCount: 0, scheduledReminders: [] };
  }

  if (!booking.checkin) {
    console.warn(`[Reminders] Booking ${bookingId} has no checkin date. Skipping reminder scheduling.`);
    return { enqueuedCount: 0, skippedCount: 0, scheduledReminders: [] };
  }

  // Resolve property-specific check-in time if available
  let propertyCheckinTime: string | undefined = booking.checkinTime || booking.checkInTime;
  if (!propertyCheckinTime) {
    const propertyCollectionName = booking.hotelId ? "hotels" : "homestays";
    const propertyId = booking.hotelId || booking.homestayId;
    if (propertyId) {
      try {
        const prop = await db.collection(propertyCollectionName).findOne(
          { _id: ObjectId.isValid(propertyId) ? new ObjectId(propertyId) : (propertyId as any) },
          options.session ? { session: options.session } : {}
        );
        propertyCheckinTime = prop?.checkInTime || prop?.checkinTime;
      } catch {
        // Fallback to default
      }
    }
  }

  const now = options.now || new Date();
  const schedulePlan = calculateReminderSchedule(booking.checkin, propertyCheckinTime, now);

  const bookingVersion = Number(booking.bookingVersion || 1);
  const propertyId = (booking.hotelId || booking.homestayId || "").toString();

  const customerEmail = (booking.guestEmail || booking.customerDetails?.email || "").trim();
  const customerPhone = (booking.guestPhone || booking.customerDetails?.phone || "").trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(customerEmail);
  const cleanPhone = customerPhone.replace(/[^\d+]/g, "");
  const isPhoneValid = cleanPhone.length >= 10 && cleanPhone.length <= 15;

  let enqueuedCount = 0;
  let skippedCount = 0;
  const scheduledReminders: Array<{ type: NotificationType; channel: NotificationChannel; status: NotificationStatus }> = [];

  for (const reminder of schedulePlan.reminders) {
    const channels: Array<{ channel: NotificationChannel; recipient: string; isValid: boolean }> = [
      { channel: "EMAIL", recipient: customerEmail, isValid: isEmailValid },
      { channel: "WHATSAPP", recipient: customerPhone, isValid: isPhoneValid },
    ];

    for (const { channel, recipient, isValid } of channels) {
      const idempotencyKey = generateIdempotencyKey(
        reminder.type,
        bookingId,
        bookingVersion,
        channel
      );

      let status: NotificationStatus;
      let lastErrorCode: string | undefined;
      let lastErrorMessage: string | undefined;

      if (reminder.isPast) {
        status = "SKIPPED";
        lastErrorCode = "REMINDER_TIME_ELAPSED";
        lastErrorMessage = "Reminder scheduled time has already elapsed prior to booking confirmation";
        skippedCount++;
      } else if (!isValid) {
        status = "BLOCKED";
        lastErrorCode = channel === "EMAIL" ? "INVALID_EMAIL" : "INVALID_PHONE";
        lastErrorMessage = `Recipient for ${channel} is invalid: ${recipient}`;
      } else {
        status = "PENDING";
        enqueuedCount++;
      }

      const notificationDoc: BookingNotification = {
        bookingId,
        bookingVersion,
        customerId: booking.userId?.toString(),
        propertyId,
        type: reminder.type,
        channel,
        recipient,
        status,
        scheduledAt: reminder.scheduledAt,
        nextAttemptAt: reminder.scheduledAt,
        attempts: 0,
        maxAttempts: 3,
        idempotencyKey,
        lastErrorCode,
        lastErrorMessage,
        createdAt: now,
        updatedAt: now,
        metadata: {
          bookingReference: booking.bookingReference,
          checkinUtc: schedulePlan.checkinUtc,
          checkinTime: schedulePlan.checkinTimeFormatted,
          expiresAt: reminder.expiresAt,
        },
      };

      try {
        await notificationsCollection.updateOne(
          { idempotencyKey },
          { $setOnInsert: notificationDoc },
          { upsert: true, session: options.session }
        );
        scheduledReminders.push({ type: reminder.type, channel, status });
      } catch (err: any) {
        if (err?.code !== 11000) throw err;
      }
    }
  }

  return {
    enqueuedCount,
    skippedCount,
    scheduledReminders,
  };
}

/**
 * Invalidates (cancels) all pending or scheduled reminders for a cancelled booking.
 */
export async function cancelRemindersForBooking(
  bookingId: string,
  reason: string = "Booking cancelled by customer or administrator",
  database?: Db
): Promise<number> {
  const db = database || (await getDb());
  const collection = db.collection("booking_notifications");

  const now = new Date();
  const res = await collection.updateMany(
    {
      bookingId,
      type: { $in: ["REMINDER_48_HOURS", "REMINDER_24_HOURS", "REMINDER_2_HOURS"] },
      status: { $in: ["PENDING", "RETRY_SCHEDULED", "PROCESSING"] },
    },
    {
      $set: {
        status: "CANCELLED",
        lastErrorCode: "BOOKING_CANCELLED",
        lastErrorMessage: reason,
        updatedAt: now,
      },
      $unset: {
        leaseExpiresAt: "",
      },
    }
  );

  return res.modifiedCount;
}

/**
 * Reschedules reminders when an existing booking's check-in date or time changes.
 * Atomically cancels previous revision reminders, increments version, and creates new schedule.
 */
export async function rescheduleRemindersForBooking(
  bookingId: string,
  newCheckinDate: string,
  newCheckinTime?: string,
  options: {
    database?: Db;
    session?: ClientSession;
    now?: Date;
  } = {}
): Promise<{
  cancelledPreviousCount: number;
  newEnqueuedCount: number;
  newSkippedCount: number;
}> {
  const db = options.database || (await getDb());
  const bookingsCollection = db.collection("bookings");

  // 1. Cancel previous pending reminders
  const cancelledPreviousCount = await cancelRemindersForBooking(
    bookingId,
    `Rescheduled to new check-in date: ${newCheckinDate}`,
    db
  );

  // 2. Increment booking version in booking document
  const updateRes = await bookingsCollection.findOneAndUpdate(
    { _id: ObjectId.isValid(bookingId) ? new ObjectId(bookingId) : (bookingId as any) },
    {
      $set: {
        checkin: newCheckinDate,
        ...(newCheckinTime ? { checkinTime: newCheckinTime } : {}),
        updatedAt: new Date(),
      },
      $inc: { bookingVersion: 1 },
    },
    {
      returnDocument: "after",
      session: options.session,
    }
  );

  // 3. Schedule new reminders for newly updated booking
  const result = await scheduleRemindersForBooking(bookingId, options);

  return {
    cancelledPreviousCount,
    newEnqueuedCount: result.enqueuedCount,
    newSkippedCount: result.skippedCount,
  };
}

/**
 * Validates reminder eligibility against live authoritative booking state immediately before dispatch.
 */
export async function validateReminderPreSendEligibility(
  job: BookingNotification,
  database?: Db,
  now: Date = new Date()
): Promise<{ eligible: boolean; statusIfIneligible?: NotificationStatus; errorCode?: string; reason?: string }> {
  const db = database || (await getDb());
  const booking = await db.collection("bookings").findOne({
    _id: ObjectId.isValid(job.bookingId) ? new ObjectId(job.bookingId) : (job.bookingId as any),
  });

  if (!booking) {
    return {
      eligible: false,
      statusIfIneligible: "FAILED",
      errorCode: "BOOKING_NOT_FOUND",
      reason: "Booking document could not be found in database",
    };
  }

  // 1. Re-validate booking status (must be confirmed)
  if (booking.bookingStatus === "cancelled" || booking.status === "cancelled") {
    return {
      eligible: false,
      statusIfIneligible: "CANCELLED",
      errorCode: "BOOKING_WAS_CANCELLED",
      reason: "Booking has been cancelled; unsent reminder voided",
    };
  }

  if (booking.bookingStatus !== "confirmed") {
    return {
      eligible: false,
      statusIfIneligible: "SKIPPED",
      errorCode: "BOOKING_NOT_CONFIRMED",
      reason: `Booking is in ${booking.bookingStatus || "unconfirmed"} state`,
    };
  }

  // 2. Check if guest is already checked-in
  if (booking.checkinStatus === "checked_in" || booking.checkedIn === true) {
    return {
      eligible: false,
      statusIfIneligible: "SKIPPED",
      errorCode: "GUEST_ALREADY_CHECKED_IN",
      reason: "Guest has already checked in; arrival reminder is redundant",
    };
  }

  // 3. Check for stale booking revision / version mismatch
  const currentVersion = Number(booking.bookingVersion || 1);
  if (job.bookingVersion < currentVersion) {
    return {
      eligible: false,
      statusIfIneligible: "SKIPPED",
      errorCode: "STALE_BOOKING_REVISION",
      reason: `Reminder belongs to booking version ${job.bookingVersion}, but active version is ${currentVersion}`,
    };
  }

  // 4. Check delivery expiration window
  // If reminder has passed its usefulness (e.g. check-in has already arrived), skip it
  const expiresAtRaw = job.expiresAt || (job.metadata?.expiresAt as any);
  if (expiresAtRaw) {
    const expiresAt = new Date(expiresAtRaw);
    if (now.getTime() > expiresAt.getTime()) {
      return {
        eligible: false,
        statusIfIneligible: "SKIPPED",
        errorCode: "REMINDER_DELIVERY_WINDOW_EXPIRED",
        reason: `Reminder delivery window expired at ${expiresAt.toISOString()}`,
      };
    }
  }

  // 5. Absolute safety: Never send an arrival reminder at or after scheduled check-in
  if (booking.checkin) {
    const { hours, minutes } = normalizeCheckinTime(booking.checkinTime || booking.checkInTime);
    let checkinDate: Date;
    if (booking.checkin.includes("T")) {
      const d = new Date(booking.checkin);
      checkinDate = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), hours, minutes) - 5.5 * 3600 * 1000);
    } else if (booking.checkin.includes("-")) {
      const [y, m, d] = booking.checkin.split("-").map(Number);
      checkinDate = new Date(Date.UTC(y, m - 1, d, hours, minutes) - 5.5 * 3600 * 1000);
    } else {
      checkinDate = new Date(booking.checkin);
    }
    if (now.getTime() >= checkinDate.getTime()) {
      return {
        eligible: false,
        statusIfIneligible: "SKIPPED",
        errorCode: "CHECKIN_TIME_ARRIVED",
        reason: "Scheduled check-in time has arrived or passed; arrival reminders are suppressed",
      };
    }
  }

  return { eligible: true };
}
