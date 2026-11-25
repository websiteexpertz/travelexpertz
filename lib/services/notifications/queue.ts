/**
 * Distributed Notification Queue Engine
 * Collection: booking_notifications
 */

import { Db, ObjectId, ClientSession } from "mongodb";
import { createHash, randomUUID } from "crypto";
import { getDb, getClientPromise } from "../../db";
import {
  BookingNotification,
  NotificationChannel,
  NotificationType,
  NotificationStatus,
} from "../../models/notification";
import { calculateReminderTimes } from "./reminder-calculator";
import { buildBookingCommunicationData } from "./data-builder";
import { scheduleRemindersForBooking } from "./reminders";

/**
 * Generates a stable deterministic idempotency key.
 */
export function generateIdempotencyKey(
  type: NotificationType,
  bookingId: string,
  bookingVersion: number,
  channel: NotificationChannel
): string {
  const rawKey = `${type}:${bookingId}:v${bookingVersion}:${channel}`;
  return createHash("sha256").update(rawKey).digest("hex");
}

/**
 * Enqueues booking confirmation and reminder notification jobs.
 * Enforces transactional consistency where available or durable outbox pattern.
 */
export async function enqueueBookingConfirmedNotifications(
  bookingId: string,
  options: {
    database?: Db;
    session?: ClientSession;
  } = {}
): Promise<{ enqueuedCount: number; jobIds: string[] }> {
  const db = options.database || (await getDb());
  const collection = db.collection<BookingNotification>("booking_notifications");

  // Fetch booking details
  const booking = await db.collection("bookings").findOne(
    { _id: new ObjectId(bookingId) },
    options.session ? { session: options.session } : {}
  );

  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  const bookingVersion = Number(booking.bookingVersion || 1);
  const now = new Date();
  const propertyId = (booking.hotelId || booking.homestayId || "").toString();

  const customerEmail = (
    booking.guestEmail ||
    booking.customerDetails?.email ||
    ""
  ).trim();

  const customerPhone = (
    booking.guestPhone ||
    booking.customerDetails?.phone ||
    ""
  ).trim();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const isEmailValid = emailRegex.test(customerEmail);

  // Validate phone: 10-15 digits
  const cleanPhone = customerPhone.replace(/[^\d+]/g, "");
  const isPhoneValid = cleanPhone.length >= 10 && cleanPhone.length <= 15;

  const jobsToCreate: BookingNotification[] = [];

  // 1. Email Confirmation Job
  const emailIdempotencyKey = generateIdempotencyKey(
    "BOOKING_CONFIRMATION",
    bookingId,
    bookingVersion,
    "EMAIL"
  );

  jobsToCreate.push({
    bookingId,
    bookingVersion,
    customerId: booking.userId?.toString(),
    propertyId,
    type: "BOOKING_CONFIRMATION",
    channel: "EMAIL",
    recipient: customerEmail,
    status: isEmailValid ? "PENDING" : "BLOCKED",
    scheduledAt: now,
    nextAttemptAt: now,
    attempts: 0,
    maxAttempts: 3,
    idempotencyKey: emailIdempotencyKey,
    lastErrorCode: isEmailValid ? undefined : "INVALID_EMAIL_RECIPIENT",
    lastErrorMessage: isEmailValid
      ? undefined
      : `Missing or invalid email: ${customerEmail}`,
    createdAt: now,
    updatedAt: now,
    metadata: {
      bookingReference: booking.bookingReference,
      guestName: booking.guestName,
      checkin: booking.checkin,
      checkout: booking.checkout,
      amount: booking.price,
    },
  });

  // 2. WhatsApp Confirmation Job
  const waIdempotencyKey = generateIdempotencyKey(
    "BOOKING_CONFIRMATION",
    bookingId,
    bookingVersion,
    "WHATSAPP"
  );

  jobsToCreate.push({
    bookingId,
    bookingVersion,
    customerId: booking.userId?.toString(),
    propertyId,
    type: "BOOKING_CONFIRMATION",
    channel: "WHATSAPP",
    recipient: customerPhone,
    status: isPhoneValid ? "PENDING" : "BLOCKED",
    scheduledAt: now,
    nextAttemptAt: now,
    attempts: 0,
    maxAttempts: 3,
    idempotencyKey: waIdempotencyKey,
    lastErrorCode: isPhoneValid ? undefined : "INVALID_PHONE_RECIPIENT",
    lastErrorMessage: isPhoneValid
      ? undefined
      : `Missing or invalid phone number: ${customerPhone}`,
    createdAt: now,
    updatedAt: now,
    metadata: {
      bookingReference: booking.bookingReference,
      guestName: booking.guestName,
      checkin: booking.checkin,
      checkout: booking.checkout,
      amount: booking.price,
    },
  });

  // 3. Reminders calculation (48h, 24h, 2h before check-in)
  let remindersEnqueued = 0;
  if (booking.checkin) {
    try {
      const reminderResult = await scheduleRemindersForBooking(bookingId, {
        database: db,
        session: options.session,
        now,
        forceConfirmed: true,
      });
      remindersEnqueued = reminderResult.enqueuedCount;
    } catch (reminderErr) {
      console.error(`[Queue] Failed to schedule reminders for booking ${bookingId}:`, reminderErr);
    }
  }

  // Insert confirmation jobs
  const insertedIds: string[] = [];
  for (const job of jobsToCreate) {
    try {
      const res = await collection.updateOne(
        { idempotencyKey: job.idempotencyKey },
        { $setOnInsert: job },
        {
          upsert: true,
          session: options.session,
        }
      );
      if (res.upsertedId) {
        insertedIds.push(res.upsertedId.toString());
      }
    } catch (err: any) {
      // Duplicate key error is safely absorbed (idempotent guarantee)
      if (err?.code !== 11000) {
        throw err;
      }
    }
  }

  return {
    enqueuedCount: insertedIds.length + remindersEnqueued,
    jobIds: insertedIds,
  };
}

/**
 * Claims the next eligible notification job atomically.
 * Avoids deadlocks and double claims across concurrent worker instances.
 */
export async function claimNextEligibleNotification(
  workerId: string = randomUUID(),
  leaseDurationMs: number = 120_000,
  database?: Db
): Promise<BookingNotification | null> {
  const db = database || (await getDb());
  const collection = db.collection<BookingNotification>("booking_notifications");

  const now = new Date();
  const leaseExpiration = new Date(now.getTime() + leaseDurationMs);

  const filter = {
    attempts: { $lt: 3 },
    scheduledAt: { $lte: now },
    $or: [
      // Standard pending or scheduled retry due now
      {
        status: { $in: ["PENDING", "RETRY_SCHEDULED"] as NotificationStatus[] },
        nextAttemptAt: { $lte: now },
      },
      // Stale processing lease recovery
      {
        status: "PROCESSING" as NotificationStatus,
        leaseExpiresAt: { $lt: now },
      },
    ],
  };

  const update = {
    $set: {
      status: "PROCESSING" as NotificationStatus,
      claimToken: workerId,
      leaseExpiresAt: leaseExpiration,
      updatedAt: now,
    },
    $inc: { attempts: 1 },
  };

  const result = await collection.findOneAndUpdate(filter, update, {
    returnDocument: "after",
    sort: { scheduledAt: 1 }, // Prioritize oldest scheduled jobs first
  });

  return (result as any)?.value || (result as any) || null;
}

/**
 * Claims a batch of eligible notification jobs up to batchSize.
 */
export async function claimNotificationBatch(
  batchSize: number = 20,
  workerId: string = randomUUID(),
  leaseDurationMs: number = 120_000,
  database?: Db
): Promise<BookingNotification[]> {
  const claimed: BookingNotification[] = [];

  for (let i = 0; i < batchSize; i++) {
    const job = await claimNextEligibleNotification(
      workerId,
      leaseDurationMs,
      database
    );
    if (!job) break; // No more eligible jobs
    claimed.push(job);
  }

  return claimed;
}

/**
 * Marks a notification as accepted by provider. Verifies active claim token.
 */
export async function markNotificationAccepted(
  notificationId: string | ObjectId,
  claimToken: string,
  providerMessageId?: string,
  database?: Db
): Promise<boolean> {
  const db = database || (await getDb());
  const collection = db.collection("booking_notifications");

  const now = new Date();
  const res = await collection.updateOne(
    {
      _id: new ObjectId(notificationId),
      claimToken,
    },
    {
      $set: {
        status: "ACCEPTED",
        providerMessageId: providerMessageId || undefined,
        acceptedAt: now,
        updatedAt: now,
      },
      $unset: {
        leaseExpiresAt: "",
      },
    }
  );

  return res.modifiedCount > 0;
}

/**
 * Marks a notification as delivered.
 */
export async function markNotificationDelivered(
  notificationId: string | ObjectId,
  claimToken: string,
  database?: Db
): Promise<boolean> {
  const db = database || (await getDb());
  const collection = db.collection("booking_notifications");

  const now = new Date();
  const res = await collection.updateOne(
    {
      _id: new ObjectId(notificationId),
      claimToken,
    },
    {
      $set: {
        status: "DELIVERED",
        deliveredAt: now,
        updatedAt: now,
      },
    }
  );

  return res.modifiedCount > 0;
}

/**
 * Schedules an exponential backoff retry with jitter.
 */
export function calculateNextRetryAttempt(
  attempt: number,
  baseDelayMs: number = 60_000,
  maxDelayMs: number = 1_800_000
): Date {
  // Exponential backoff: baseDelay * 2^(attempt - 1) + jitter (10-30%)
  const exp = Math.min(attempt - 1, 5);
  const rawDelay = baseDelayMs * Math.pow(2, exp);
  const jitter = rawDelay * (0.1 + Math.random() * 0.2);
  const totalDelay = Math.min(rawDelay + jitter, maxDelayMs);

  return new Date(Date.now() + totalDelay);
}

/**
 * Schedules a notification for retry or marks as permanent failure if max attempts reached.
 */
export async function scheduleNotificationRetry(
  notificationId: string | ObjectId,
  claimToken: string,
  currentAttempts: number,
  maxAttempts: number = 3,
  error: { code?: string; message?: string },
  customDelayMs?: number,
  database?: Db
): Promise<boolean> {
  const db = database || (await getDb());
  const collection = db.collection("booking_notifications");

  const now = new Date();
  const hasExhaustedAttempts = currentAttempts >= maxAttempts;

  if (hasExhaustedAttempts) {
    const res = await collection.updateOne(
      {
        _id: new ObjectId(notificationId),
        claimToken,
      },
      {
        $set: {
          status: "FAILED",
          lastErrorCode: error.code || "MAX_ATTEMPTS_EXHAUSTED",
          lastErrorMessage: error.message || "Failed after maximum retry attempts",
          updatedAt: now,
        },
        $unset: {
          leaseExpiresAt: "",
        },
      }
    );
    return res.modifiedCount > 0;
  }

  const nextAttemptAt = customDelayMs
    ? new Date(now.getTime() + customDelayMs)
    : calculateNextRetryAttempt(currentAttempts);

  const res = await collection.updateOne(
    {
      _id: new ObjectId(notificationId),
      claimToken,
    },
    {
      $set: {
        status: "RETRY_SCHEDULED",
        nextAttemptAt,
        lastErrorCode: error.code,
        lastErrorMessage: error.message,
        updatedAt: now,
      },
      $unset: {
        leaseExpiresAt: "",
      },
    }
  );

  return res.modifiedCount > 0;
}

/**
 * Marks a notification as permanently failed.
 */
export async function markNotificationFailed(
  notificationId: string | ObjectId,
  claimToken: string,
  error: { code?: string; message?: string },
  database?: Db
): Promise<boolean> {
  const db = database || (await getDb());
  const collection = db.collection("booking_notifications");

  const now = new Date();
  const res = await collection.updateOne(
    {
      _id: new ObjectId(notificationId),
      claimToken,
    },
    {
      $set: {
        status: "FAILED",
        lastErrorCode: error.code || "PERMANENT_FAILURE",
        lastErrorMessage: error.message,
        updatedAt: now,
      },
      $unset: {
        leaseExpiresAt: "",
      },
    }
  );

  return res.modifiedCount > 0;
}

/**
 * Marks a notification as BLOCKED (e.g. invalid recipient or channel disabled).
 */
export async function markNotificationBlocked(
  notificationId: string | ObjectId,
  claimToken: string,
  error: { code?: string; message?: string },
  database?: Db
): Promise<boolean> {
  const db = database || (await getDb());
  const collection = db.collection("booking_notifications");

  const now = new Date();
  const res = await collection.updateOne(
    {
      _id: new ObjectId(notificationId),
      claimToken,
    },
    {
      $set: {
        status: "BLOCKED",
        lastErrorCode: error.code || "BLOCKED_BY_POLICY",
        lastErrorMessage: error.message,
        updatedAt: now,
      },
      $unset: {
        leaseExpiresAt: "",
      },
    }
  );

  return res.modifiedCount > 0;
}

/**
 * Marks a notification as SKIPPED (e.g. historical notification or disabled channel).
 */
export async function markNotificationSkipped(
  notificationId: string | ObjectId,
  claimToken: string,
  reason: { code?: string; message?: string },
  database?: Db
): Promise<boolean> {
  const db = database || (await getDb());
  const collection = db.collection("booking_notifications");

  const now = new Date();
  const res = await collection.updateOne(
    {
      _id: new ObjectId(notificationId),
      claimToken,
    },
    {
      $set: {
        status: "SKIPPED",
        lastErrorCode: reason.code || "SKIPPED_BY_POLICY",
        lastErrorMessage: reason.message,
        updatedAt: now,
      },
      $unset: {
        leaseExpiresAt: "",
      },
    }
  );

  return res.modifiedCount > 0;
}

/**
 * Marks an ambiguous outcome as DELIVERY_UNKNOWN.
 */
export async function markNotificationDeliveryUnknown(
  notificationId: string | ObjectId,
  claimToken: string,
  error: { code?: string; message?: string },
  database?: Db
): Promise<boolean> {
  const db = database || (await getDb());
  const collection = db.collection("booking_notifications");

  const now = new Date();
  const res = await collection.updateOne(
    {
      _id: new ObjectId(notificationId),
      claimToken,
    },
    {
      $set: {
        status: "DELIVERY_UNKNOWN",
        lastErrorCode: error.code || "DELIVERY_OUTCOME_UNKNOWN",
        lastErrorMessage: error.message,
        updatedAt: now,
      },
      $unset: {
        leaseExpiresAt: "",
      },
    }
  );

  return res.modifiedCount > 0;
}

/**
 * Cancels all pending notifications for a cancelled or rescheduled booking.
 */
export async function cancelPendingNotificationsForBooking(
  bookingId: string,
  reasonOrDb?: string | Db,
  database?: Db
): Promise<number> {
  let reason = "Booking cancelled or rescheduled";
  let db: Db;
  if (typeof reasonOrDb === "string") {
    reason = reasonOrDb;
    db = database || (await getDb());
  } else if (reasonOrDb) {
    db = reasonOrDb as Db;
  } else {
    db = database || (await getDb());
  }
  const collection = db.collection("booking_notifications");

  const now = new Date();
  const res = await collection.updateMany(
    {
      bookingId,
      status: { $in: ["PENDING", "RETRY_SCHEDULED"] },
    },
    {
      $set: {
        status: "CANCELLED",
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
 * Enqueues customer checkout thank-you notification.
 */
export async function enqueueCheckoutThankYouNotification(
  bookingId: string,
  options: {
    database?: Db;
  } = {}
): Promise<{ enqueuedCount: number; jobIds: string[] }> {
  const db = options.database || (await getDb());
  const collection = db.collection<BookingNotification>("booking_notifications");

  const booking = await db.collection("bookings").findOne({
    _id: ObjectId.isValid(bookingId) ? new ObjectId(bookingId) : (bookingId as any),
  });

  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  const bookingVersion = Number(booking.bookingVersion || 1);
  const now = new Date();
  const propertyId = (booking.hotelId || booking.homestayId || "").toString();

  const customerEmail = (
    booking.guestEmail ||
    booking.customerDetails?.email ||
    ""
  ).trim();

  const customerPhone = (
    booking.guestPhone ||
    booking.customerDetails?.phone ||
    ""
  ).trim();

  const jobsToCreate: BookingNotification[] = [];

  // 1. Email Job
  if (customerEmail) {
    const emailKey = `CHECKOUT_THANK_YOU:${bookingId}:${bookingVersion}:EMAIL`;
    jobsToCreate.push({
      bookingId,
      bookingVersion,
      customerId: booking.userId?.toString(),
      propertyId,
      type: "CHECKOUT_THANK_YOU",
      channel: "EMAIL",
      recipient: customerEmail,
      status: "PENDING",
      scheduledAt: now,
      nextAttemptAt: now,
      attempts: 0,
      maxAttempts: 3,
      idempotencyKey: emailKey,
      createdAt: now,
      updatedAt: now,
    });
  }

  // 2. WhatsApp Job (Dormant)
  if (customerPhone) {
    const waKey = `CHECKOUT_THANK_YOU:${bookingId}:${bookingVersion}:WHATSAPP`;
    jobsToCreate.push({
      bookingId,
      bookingVersion,
      customerId: booking.userId?.toString(),
      propertyId,
      type: "CHECKOUT_THANK_YOU",
      channel: "WHATSAPP",
      recipient: customerPhone,
      status: "PENDING",
      scheduledAt: now,
      nextAttemptAt: now,
      attempts: 0,
      maxAttempts: 3,
      idempotencyKey: waKey,
      createdAt: now,
      updatedAt: now,
    });
  }

  const createdJobIds: string[] = [];
  for (const job of jobsToCreate) {
    try {
      const existing = await collection.findOne({ idempotencyKey: job.idempotencyKey });
      if (!existing) {
        const insertRes = await collection.insertOne(job as any);
        createdJobIds.push(insertRes.insertedId?.toString() || job.idempotencyKey);
      }
    } catch {
      // In-memory or duplicate key
    }
  }

  return { enqueuedCount: createdJobIds.length, jobIds: createdJobIds };
}

/**
 * Enqueues final invoice delivery notification.
 */
export async function enqueueFinalInvoiceNotification(
  bookingId: string,
  invoiceNumber: string,
  options: {
    database?: Db;
  } = {}
): Promise<{ enqueuedCount: number; jobIds: string[] }> {
  const db = options.database || (await getDb());
  const collection = db.collection<BookingNotification>("booking_notifications");

  const booking = await db.collection("bookings").findOne({
    _id: ObjectId.isValid(bookingId) ? new ObjectId(bookingId) : (bookingId as any),
  });

  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  const bookingVersion = Number(booking.bookingVersion || 1);
  const now = new Date();
  const propertyId = (booking.hotelId || booking.homestayId || "").toString();

  const customerEmail = (
    booking.guestEmail ||
    booking.customerDetails?.email ||
    ""
  ).trim();

  const customerPhone = (
    booking.guestPhone ||
    booking.customerDetails?.phone ||
    ""
  ).trim();

  const jobsToCreate: BookingNotification[] = [];

  // 1. Email Job
  if (customerEmail) {
    const emailKey = `FINAL_INVOICE:${bookingId}:${invoiceNumber}:EMAIL`;
    jobsToCreate.push({
      bookingId,
      bookingVersion,
      customerId: booking.userId?.toString(),
      propertyId,
      type: "FINAL_INVOICE",
      channel: "EMAIL",
      recipient: customerEmail,
      status: "PENDING",
      scheduledAt: now,
      nextAttemptAt: now,
      attempts: 0,
      maxAttempts: 3,
      idempotencyKey: emailKey,
      createdAt: now,
      updatedAt: now,
    });
  }

  // 2. WhatsApp Job (Dormant)
  if (customerPhone) {
    const waKey = `FINAL_INVOICE:${bookingId}:${invoiceNumber}:WHATSAPP`;
    jobsToCreate.push({
      bookingId,
      bookingVersion,
      customerId: booking.userId?.toString(),
      propertyId,
      type: "FINAL_INVOICE",
      channel: "WHATSAPP",
      recipient: customerPhone,
      status: "PENDING",
      scheduledAt: now,
      nextAttemptAt: now,
      attempts: 0,
      maxAttempts: 3,
      idempotencyKey: waKey,
      createdAt: now,
      updatedAt: now,
    });
  }

  const createdJobIds: string[] = [];
  for (const job of jobsToCreate) {
    try {
      const existing = await collection.findOne({ idempotencyKey: job.idempotencyKey });
      if (!existing) {
        const insertRes = await collection.insertOne(job as any);
        createdJobIds.push(insertRes.insertedId?.toString() || job.idempotencyKey);
      }
    } catch {
      // In-memory or duplicate key
    }
  }

  return { enqueuedCount: createdJobIds.length, jobIds: createdJobIds };
}

/**
 * Enqueues customer post-checkout review invitation notification.
 */
export async function enqueueReviewInvitationNotification(
  bookingId: string,
  options: {
    database?: Db;
    delayMinutes?: number;
  } = {}
): Promise<{ enqueuedCount: number; jobIds: string[]; skipped?: boolean; reason?: string }> {
  const db = options.database || (await getDb());
  const collection = db.collection<BookingNotification>("booking_notifications");

  const booking = await db.collection("bookings").findOne({
    _id: ObjectId.isValid(bookingId) ? new ObjectId(bookingId) : (bookingId as any),
  });

  if (!booking) {
    throw new Error(`Booking ${bookingId} not found`);
  }

  // If the booking is not completed or guest did not check out, do not invite
  if (booking.stayStatus !== "CHECKED_OUT" || booking.bookingStatus === "cancelled") {
    return {
      enqueuedCount: 0,
      jobIds: [],
      skipped: true,
      reason: "Booking is not in completed CHECKED_OUT status",
    };
  }

  // If a review has already been submitted, skip invitation
  const existingReview = await db.collection("reviews").findOne({ bookingId });
  if (existingReview) {
    return {
      enqueuedCount: 0,
      jobIds: [],
      skipped: true,
      reason: "Review already submitted for this booking",
    };
  }

  const bookingVersion = Number(booking.bookingVersion || 1);
  const now = new Date();
  const delayMs = (options.delayMinutes || 0) * 60 * 1000;
  const scheduledAt = new Date(now.getTime() + delayMs);
  const propertyId = (booking.hotelId || booking.homestayId || "").toString();

  const customerEmail = (
    booking.guestEmail ||
    booking.customerDetails?.email ||
    ""
  ).trim();

  const customerPhone = (
    booking.guestPhone ||
    booking.customerDetails?.phone ||
    ""
  ).trim();

  const jobsToCreate: BookingNotification[] = [];

  // 1. Email Job
  if (customerEmail) {
    const emailKey = `REVIEW_REQUEST:${bookingId}:${bookingVersion}:EMAIL`;
    jobsToCreate.push({
      bookingId,
      bookingVersion,
      customerId: booking.userId?.toString(),
      propertyId,
      type: "REVIEW_REQUEST",
      channel: "EMAIL",
      recipient: customerEmail,
      status: "PENDING",
      scheduledAt,
      nextAttemptAt: scheduledAt,
      attempts: 0,
      maxAttempts: 3,
      idempotencyKey: emailKey,
      createdAt: now,
      updatedAt: now,
    });
  }

  // 2. WhatsApp Job (Dormant)
  if (customerPhone) {
    const waKey = `REVIEW_REQUEST:${bookingId}:${bookingVersion}:WHATSAPP`;
    jobsToCreate.push({
      bookingId,
      bookingVersion,
      customerId: booking.userId?.toString(),
      propertyId,
      type: "REVIEW_REQUEST",
      channel: "WHATSAPP",
      recipient: customerPhone,
      status: "PENDING",
      scheduledAt,
      nextAttemptAt: scheduledAt,
      attempts: 0,
      maxAttempts: 3,
      idempotencyKey: waKey,
      createdAt: now,
      updatedAt: now,
    });
  }

  const createdJobIds: string[] = [];
  for (const job of jobsToCreate) {
    try {
      const existing = await collection.findOne({ idempotencyKey: job.idempotencyKey });
      if (!existing) {
        const insertRes = await collection.insertOne(job as any);
        createdJobIds.push(insertRes.insertedId?.toString() || job.idempotencyKey);
      }
    } catch {
      // In-memory or duplicate key
    }
  }

  return { enqueuedCount: createdJobIds.length, jobIds: createdJobIds };
}
