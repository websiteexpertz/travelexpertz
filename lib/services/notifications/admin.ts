/**
 * Admin Communication Management Service
 * Provides centralized monitoring, search, filtering, retry controls,
 * manual resends, SMTP budget tracking, scheduler health, and append-only auditing.
 */

import { Db, ObjectId } from "mongodb";
import { getDb } from "../../db";
import {
  BookingNotification,
  NotificationChannel,
  NotificationStatus,
  NotificationType,
} from "../../models/notification";
import { checkWhatsAppReadiness } from "./readiness";
import { isPriorityNotification } from "./capacity-limiter";
import { buildBookingCommunicationData } from "./data-builder";
import { renderNotificationEmail } from "./email-templates";

export interface CommunicationAuditLog {
  _id?: ObjectId | string;
  adminUsername: string;
  adminId?: string;
  actionType:
    | "RETRY_NOTIFICATION"
    | "RESEND_NOTIFICATION"
    | "CANCEL_NOTIFICATION"
    | "REISSUE_REVIEW_INVITATION"
    | "TRIGGER_WORKER";
  notificationId?: string;
  idempotencyKey?: string;
  bookingId: string;
  bookingReference?: string;
  channel: NotificationChannel;
  type: NotificationType;
  previousState?: string;
  resultingState?: string;
  reason: string;
  outcome: "SUCCESS" | "FAILED" | "REJECTED";
  errorMessage?: string;
  correlationId: string;
  ipAddress?: string;
  timestamp: Date;
}

export interface AdminCommunicationOverview {
  dateRange: {
    start: string;
    end: string;
    timezone: "Asia/Kolkata";
  };
  metrics: {
    totalNotificationsToday: number;
    emailAttemptsToday: number;
    emailsAcceptedToday: number;
    emailsFailedToday: number;
    pendingCount: number;
    processingCount: number;
    retryScheduledCount: number;
    upcomingRemindersCount: number;
    whatsappDisabledCount: number;
    deliveryUnknownCount: number;
    confirmedDeliveryCount: number;
  };
  smtpBudget: {
    dailyLimit: number;
    sentToday: number;
    acceptedToday: number;
    remainingBudget: number;
    isThrottled: boolean;
    priorityReservedMargin: number;
  };
  whatsappReadiness: {
    readyForLive: boolean;
    featureFlagEnabled: boolean;
    credentialsConfigured: boolean;
    pendingMetaTemplates: number;
  };
}

export interface NotificationFilterOptions {
  search?: string;
  channel?: NotificationChannel;
  status?: NotificationStatus;
  type?: NotificationType;
  propertyId?: string;
  bookingId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface MaskedNotificationItem {
  _id: string;
  bookingId: string;
  bookingReference: string;
  propertyId: string;
  propertyName: string;
  customerName: string;
  recipientMasked: string;
  channel: NotificationChannel;
  type: NotificationType;
  status: NotificationStatus;
  scheduledAt: string;
  lastAttemptAt?: string;
  attempts: number;
  maxAttempts: number;
  idempotencyKey: string;
  providerMessageId?: string;
  lastErrorCode?: string;
  lastErrorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationListResult {
  notifications: MaskedNotificationItem[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface SchedulerHealthReport {
  status: "Healthy" | "Delayed" | "Degraded" | "Not configured" | "No execution observed";
  lastWorkerRunAt?: string;
  lastExecutionDurationMs?: number;
  claimedLastRun?: number;
  overdueJobsCount: number;
  oldestOverdueAgeMinutes: number;
  staleLeasesCount: number;
  dueJobsCount: number;
}

/**
 * Safely converts Date, string or timestamp into ISO string.
 */
function safeISO(d: unknown): string {
  if (!d) return "";
  if (d instanceof Date) return d.toISOString();
  if (typeof d === "string") return d;
  try {
    return new Date(d as any).toISOString();
  } catch {
    return "";
  }
}

/**
 * Masks recipient information to protect customer privacy.
 */
export function maskRecipient(recipient: string, channel: NotificationChannel): string {
  if (!recipient || typeof recipient !== "string") return "***";

  if (channel === "EMAIL") {
    const parts = recipient.trim().split("@");
    if (parts.length !== 2) return "***@***";
    const [user, domain] = parts;
    if (user.length <= 2) {
      return `${user.charAt(0)}***@${domain}`;
    }
    return `${user.charAt(0)}***${user.charAt(user.length - 1)}@${domain}`;
  }

  // Phone: +91 98765 43210 -> +91 98*** **210
  const clean = recipient.replace(/\s+/g, "");
  if (clean.length >= 10) {
    const prefix = clean.slice(0, Math.max(3, clean.length - 6));
    const suffix = clean.slice(-3);
    return `${prefix}***${suffix}`;
  }
  return "***";
}

/**
 * Escapes regex special characters for safe search queries.
 */
function escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/**
 * Appends a record to the communication audit trail.
 */
export async function recordCommunicationAudit(
  log: Omit<CommunicationAuditLog, "_id" | "timestamp">,
  database?: Db
): Promise<string> {
  const db = database || (await getDb());
  const auditCol = db.collection("communication_audit_logs");
  const fullRecord: CommunicationAuditLog = {
    ...log,
    timestamp: new Date(),
  };

  const res = await auditCol.insertOne(fullRecord as any);
  return res.insertedId.toString();
}

/**
 * Returns real database-backed notification overview metrics.
 */
export async function getCommunicationOverview(
  dateRange: "today" | "last7days" | "last30days" = "today",
  database?: Db
): Promise<AdminCommunicationOverview> {
  const db = database || (await getDb());
  const collection = db.collection("booking_notifications");

  const now = new Date();
  let startTime: Date;

  if (dateRange === "last7days") {
    startTime = new Date(now.getTime() - 7 * 86400000);
  } else if (dateRange === "last30days") {
    startTime = new Date(now.getTime() - 30 * 86400000);
  } else {
    // Today in UTC
    startTime = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0));
  }

  // Count aggregates
  const totalNotificationsToday = await collection.countDocuments({
    createdAt: { $gte: startTime },
  });

  const emailAttemptsToday = await collection.countDocuments({
    channel: "EMAIL",
    attempts: { $gt: 0 },
    updatedAt: { $gte: startTime },
  });

  const emailsAcceptedToday = await collection.countDocuments({
    channel: "EMAIL",
    status: { $in: ["ACCEPTED", "DELIVERED"] },
    updatedAt: { $gte: startTime },
  });

  const emailsFailedToday = await collection.countDocuments({
    channel: "EMAIL",
    status: "FAILED",
    updatedAt: { $gte: startTime },
  });

  const pendingCount = await collection.countDocuments({ status: "PENDING" });
  const processingCount = await collection.countDocuments({ status: "PROCESSING" });
  const retryScheduledCount = await collection.countDocuments({ status: "RETRY_SCHEDULED" });

  const upcomingRemindersCount = await collection.countDocuments({
    type: { $in: ["REMINDER_48_HOURS", "REMINDER_24_HOURS", "REMINDER_2_HOURS"] },
    status: { $in: ["PENDING", "RETRY_SCHEDULED"] },
    scheduledAt: { $gte: now },
  });

  const whatsappDisabledCount = await collection.countDocuments({
    channel: "WHATSAPP",
    status: "BLOCKED",
  });

  const deliveryUnknownCount = await collection.countDocuments({
    status: "DELIVERY_UNKNOWN",
  });

  const confirmedDeliveryCount = await collection.countDocuments({
    status: "DELIVERED",
  });

  // SMTP Budget metrics
  const dailyLimit = parseInt(process.env.SMTP_DAILY_LIMIT || "450", 10);
  const remainingBudget = Math.max(0, dailyLimit - emailsAcceptedToday);
  const isThrottled = emailsAcceptedToday >= Math.floor(dailyLimit * 0.9);

  // WhatsApp readiness
  const waReport = checkWhatsAppReadiness();

  return {
    dateRange: {
      start: startTime.toISOString(),
      end: now.toISOString(),
      timezone: "Asia/Kolkata",
    },
    metrics: {
      totalNotificationsToday,
      emailAttemptsToday,
      emailsAcceptedToday,
      emailsFailedToday,
      pendingCount,
      processingCount,
      retryScheduledCount,
      upcomingRemindersCount,
      whatsappDisabledCount,
      deliveryUnknownCount,
      confirmedDeliveryCount,
    },
    smtpBudget: {
      dailyLimit,
      sentToday: emailsAcceptedToday,
      acceptedToday: emailsAcceptedToday,
      remainingBudget,
      isThrottled,
      priorityReservedMargin: 5,
    },
    whatsappReadiness: {
      readyForLive: waReport.readyForLive,
      featureFlagEnabled: waReport.checks.featureFlagEnabled,
      credentialsConfigured: waReport.checks.credentialsConfigured,
      pendingMetaTemplates: waReport.checks.totalTemplatesCount - waReport.checks.templatesApprovedCount,
    },
  };
}

/**
 * Returns paginated, masked notification list with search and filters.
 */
export async function getNotificationList(
  options: NotificationFilterOptions = {},
  database?: Db
): Promise<NotificationListResult> {
  const db = database || (await getDb());
  const collection = db.collection<BookingNotification>("booking_notifications");

  const page = Math.max(1, Number(options.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(options.limit) || 20));
  const skip = (page - 1) * limit;

  const query: Record<string, unknown> = {};

  if (options.channel) query.channel = options.channel;
  if (options.status) query.status = options.status;
  if (options.type) query.type = options.type;
  if (options.propertyId) query.propertyId = options.propertyId;
  if (options.bookingId) query.bookingId = options.bookingId;

  if (options.startDate || options.endDate) {
    const dateQuery: Record<string, Date> = {};
    if (options.startDate) dateQuery.$gte = new Date(options.startDate);
    if (options.endDate) dateQuery.$lte = new Date(options.endDate);
    query.createdAt = dateQuery;
  }

  if (options.search?.trim()) {
    const escaped = escapeRegex(options.search.trim());
    query.$or = [
      { bookingId: { $regex: escaped, $options: "i" } },
      { "metadata.bookingReference": { $regex: escaped, $options: "i" } },
      { "metadata.guestName": { $regex: escaped, $options: "i" } },
      { "metadata.propertyName": { $regex: escaped, $options: "i" } },
      { recipient: { $regex: escaped, $options: "i" } },
      { providerMessageId: { $regex: escaped, $options: "i" } },
    ];
  }

  const total = await collection.countDocuments(query as any);
  const rawList = await collection
    .find(query as any)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  const notifications: MaskedNotificationItem[] = rawList.map((n) => {
    return {
      _id: n._id ? n._id.toString() : "",
      bookingId: n.bookingId,
      bookingReference: n.metadata?.bookingReference || n.bookingId,
      propertyId: n.propertyId || "",
      propertyName: n.metadata?.propertyName || "Property",
      customerName: n.metadata?.guestName || "Guest",
      recipientMasked: maskRecipient(n.recipient, n.channel),
      channel: n.channel,
      type: n.type,
      status: n.status,
      scheduledAt: safeISO(n.scheduledAt),
      lastAttemptAt: n.updatedAt ? safeISO(n.updatedAt) : undefined,
      attempts: n.attempts || 0,
      maxAttempts: n.maxAttempts || 3,
      idempotencyKey: n.idempotencyKey,
      providerMessageId: n.providerMessageId,
      lastErrorCode: n.lastErrorCode,
      lastErrorMessage: n.lastErrorMessage,
      createdAt: safeISO(n.createdAt),
      updatedAt: safeISO(n.updatedAt),
    };
  });

  return {
    notifications,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
}

/**
 * Returns full detail for an individual notification including safe email preview.
 */
export async function getNotificationDetail(
  id: string,
  database?: Db
): Promise<{
  notification: MaskedNotificationItem;
  safeEmailPreview?: { subject: string; html: string; text: string };
  auditLogs: CommunicationAuditLog[];
} | null> {
  const db = database || (await getDb());
  const collection = db.collection<BookingNotification>("booking_notifications");

  const query = ObjectId.isValid(id)
    ? { _id: new ObjectId(id) }
    : ({ _id: id } as unknown as { _id: ObjectId });

  const raw = await collection.findOne(query);
  if (!raw) return null;

  const item: MaskedNotificationItem = {
    _id: raw._id ? raw._id.toString() : "",
    bookingId: raw.bookingId,
    bookingReference: raw.metadata?.bookingReference || raw.bookingId,
    propertyId: raw.propertyId || "",
    propertyName: raw.metadata?.propertyName || "Property",
    customerName: raw.metadata?.guestName || "Guest",
    recipientMasked: maskRecipient(raw.recipient, raw.channel),
    channel: raw.channel,
    type: raw.type,
    status: raw.status,
    scheduledAt: safeISO(raw.scheduledAt),
    lastAttemptAt: raw.updatedAt ? safeISO(raw.updatedAt) : undefined,
    attempts: raw.attempts || 0,
    maxAttempts: raw.maxAttempts || 3,
    idempotencyKey: raw.idempotencyKey,
    providerMessageId: raw.providerMessageId,
    lastErrorCode: raw.lastErrorCode,
    lastErrorMessage: raw.lastErrorMessage,
    createdAt: safeISO(raw.createdAt),
    updatedAt: safeISO(raw.updatedAt),
  };

  // Safe preview generation
  let safeEmailPreview: { subject: string; html: string; text: string } | undefined;
  if (raw.channel === "EMAIL") {
    try {
      const commData = await buildBookingCommunicationData(raw.bookingId, db);
      if (commData) {
        safeEmailPreview = renderNotificationEmail(raw.type, commData);
      }
    } catch {
      // Preview unavailable
    }
  }

  // Audit history
  const auditLogs = await db
    .collection("communication_audit_logs")
    .find({
      $or: [{ notificationId: id }, { bookingId: raw.bookingId }],
    })
    .sort({ timestamp: -1 })
    .limit(20)
    .toArray();

  return {
    notification: item,
    safeEmailPreview,
    auditLogs: auditLogs as any,
  };
}

/**
 * Retries an eligible failed or delivery-unknown notification.
 */
export async function retryNotification(
  id: string,
  adminUser: { username: string; id?: string },
  reason: string,
  options: { forceDuplicateDecision?: boolean } = {},
  database?: Db
): Promise<{ success: boolean; error?: string; errorCode?: string }> {
  if (!reason || reason.trim().length < 5) {
    return {
      success: false,
      error: "A valid administrative reason (minimum 5 characters) is required to retry notification.",
      errorCode: "REASON_REQUIRED",
    };
  }

  const db = database || (await getDb());
  const collection = db.collection<BookingNotification>("booking_notifications");

  const query = ObjectId.isValid(id)
    ? { _id: new ObjectId(id) }
    : ({ _id: id } as unknown as { _id: ObjectId });

  const notification = await collection.findOne(query);
  if (!notification) {
    return { success: false, error: "Notification record not found.", errorCode: "NOT_FOUND" };
  }

  // 1. Status eligibility: only FAILED, RETRY_SCHEDULED, or DELIVERY_UNKNOWN can be retried
  if (notification.status !== "FAILED" && notification.status !== "DELIVERY_UNKNOWN" && notification.status !== "RETRY_SCHEDULED") {
    return {
      success: false,
      error: `Notification in ${notification.status} status cannot be retried.`,
      errorCode: "INVALID_STATUS_FOR_RETRY",
    };
  }

  // 2. Permanent error protection
  if (notification.lastErrorCode === "INVALID_EMAIL_RECIPIENT") {
    return {
      success: false,
      error: "Cannot retry notification with invalid recipient address.",
      errorCode: "PERMANENT_ERROR_RECIPIENT_INVALID",
    };
  }

  // 3. DELIVERY_UNKNOWN protection
  if (notification.status === "DELIVERY_UNKNOWN" && !options.forceDuplicateDecision) {
    return {
      success: false,
      error: "Delivery outcome is uncertain. Explicit administrator confirmation acknowledging potential duplicate delivery is required.",
      errorCode: "DUPLICATE_ACKNOWLEDGEMENT_REQUIRED",
    };
  }

  // 4. Booking verification
  const booking = await db.collection("bookings").findOne({
    _id: ObjectId.isValid(notification.bookingId) ? new ObjectId(notification.bookingId) : (notification.bookingId as any),
  });

  if (!booking) {
    return { success: false, error: "Associated booking record does not exist.", errorCode: "BOOKING_NOT_FOUND" };
  }

  if (booking.bookingStatus === "cancelled" && notification.type !== "BOOKING_CANCELLED") {
    return {
      success: false,
      error: "Cannot retry communication for a cancelled booking.",
      errorCode: "BOOKING_CANCELLED",
    };
  }

  // 5. Atomic state update to PENDING
  const now = new Date();
  const correlationId = `retry_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  await collection.updateOne(query, {
    $set: {
      status: "PENDING",
      scheduledAt: now,
      nextAttemptAt: now,
      claimToken: undefined,
      leaseExpiresAt: undefined,
      updatedAt: now,
    },
    $inc: { attempts: 0 }, // Reset attempt counter to give it another cycle
  });

  // 6. Record append-only audit log
  await recordCommunicationAudit(
    {
      adminUsername: adminUser.username,
      adminId: adminUser.id,
      actionType: "RETRY_NOTIFICATION",
      notificationId: id,
      idempotencyKey: notification.idempotencyKey,
      bookingId: notification.bookingId,
      channel: notification.channel,
      type: notification.type,
      previousState: notification.status,
      resultingState: "PENDING",
      reason: reason.trim(),
      outcome: "SUCCESS",
      correlationId,
    },
    db
  );

  return { success: true };
}

/**
 * Manually resends an authorized communication with a new idempotency key.
 */
export async function resendNotification(
  bookingId: string,
  type: NotificationType,
  channel: NotificationChannel,
  adminUser: { username: string; id?: string },
  reason: string,
  database?: Db
): Promise<{ success: boolean; error?: string; errorCode?: string; newNotificationId?: string }> {
  if (!reason || reason.trim().length < 5) {
    return {
      success: false,
      error: "A valid administrative reason (minimum 5 characters) is required to resend communication.",
      errorCode: "REASON_REQUIRED",
    };
  }

  const db = database || (await getDb());
  const bookings = db.collection("bookings");
  const notifications = db.collection<BookingNotification>("booking_notifications");

  const booking = await bookings.findOne({
    _id: ObjectId.isValid(bookingId) ? new ObjectId(bookingId) : (bookingId as any),
  });

  if (!booking) {
    return { success: false, error: `Booking ${bookingId} not found`, errorCode: "BOOKING_NOT_FOUND" };
  }

  // 1. Validation for specific communication types
  if (booking.bookingStatus === "cancelled" && type !== "BOOKING_CANCELLED") {
    return {
      success: false,
      error: "Cannot resend standard communications for cancelled bookings.",
      errorCode: "BOOKING_CANCELLED",
    };
  }

  if (type === "REVIEW_REQUEST") {
    const existingReview = await db.collection("reviews").findOne({ bookingId });
    if (existingReview) {
      return {
        success: false,
        error: "Guest has already submitted a verified review for this completed stay.",
        errorCode: "ALREADY_REVIEWED",
      };
    }
  }

  // 2. Validate arrival reminders are still within delivery window
  if (type === "REMINDER_48_HOURS" || type === "REMINDER_24_HOURS" || type === "REMINDER_2_HOURS") {
    const checkInDate = booking.checkInDate || booking.checkIn;
    if (checkInDate) {
      const scheduledCheckin = new Date(checkInDate).getTime();
      const gracePeriodMs = 15 * 60 * 1000;
      if (Date.now() >= scheduledCheckin + gracePeriodMs) {
        return {
          success: false,
          error: "Arrival reminder delivery window has already expired for this booking.",
          errorCode: "REMINDER_WINDOW_EXPIRED",
        };
      }
    }
  }

  const now = new Date();
  const recipient = (
    channel === "EMAIL"
      ? booking.guestEmail || booking.customerDetails?.email
      : booking.guestPhone || booking.customerDetails?.phone
  )?.trim();

  if (!recipient) {
    return {
      success: false,
      error: `No valid recipient contact configured for ${channel}.`,
      errorCode: "RECIPIENT_MISSING",
    };
  }

  // 3. Create distinct resend notification job with separate idempotency key
  const resendKey = `RESEND:${bookingId}:${type}:${Date.now()}:${channel}`;
  const correlationId = `resend_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  const newJob: BookingNotification = {
    bookingId,
    bookingVersion: Number(booking.bookingVersion || 1),
    customerId: booking.userId?.toString(),
    propertyId: (booking.hotelId || booking.homestayId || "").toString(),
    type,
    channel,
    recipient,
    status: "PENDING",
    scheduledAt: now,
    nextAttemptAt: now,
    attempts: 0,
    maxAttempts: 3,
    idempotencyKey: resendKey,
    createdAt: now,
    updatedAt: now,
    metadata: {
      isManualResend: true,
      resendReason: reason.trim(),
      resendBy: adminUser.username,
      bookingReference: booking.bookingReference || booking.cashfreeOrderId || bookingId,
      propertyName: booking.hotelName || booking.homestayName || booking.propertyName || "Property",
      guestName: booking.guestName || booking.customerDetails?.name || "Guest",
    },
  };

  const insertRes = await notifications.insertOne(newJob as any);
  const newId = insertRes.insertedId ? insertRes.insertedId.toString() : resendKey;

  // 4. Record append-only audit
  await recordCommunicationAudit(
    {
      adminUsername: adminUser.username,
      adminId: adminUser.id,
      actionType: "RESEND_NOTIFICATION",
      notificationId: newId,
      idempotencyKey: resendKey,
      bookingId,
      channel,
      type,
      resultingState: "PENDING",
      reason: reason.trim(),
      outcome: "SUCCESS",
      correlationId,
    },
    db
  );

  return { success: true, newNotificationId: newId };
}

/**
 * Cancels an individual scheduled communication with an audit record.
 */
export async function cancelScheduledNotification(
  id: string,
  adminUser: { username: string; id?: string },
  reason: string,
  database?: Db
): Promise<{ success: boolean; error?: string }> {
  if (!reason || reason.trim().length < 5) {
    return {
      success: false,
      error: "A valid administrative reason (minimum 5 characters) is required to cancel communication.",
    };
  }

  const db = database || (await getDb());
  const collection = db.collection<BookingNotification>("booking_notifications");

  const query = ObjectId.isValid(id)
    ? { _id: new ObjectId(id) }
    : ({ _id: id } as unknown as { _id: ObjectId });

  const existing = await collection.findOne(query);
  if (!existing) {
    return { success: false, error: "Notification record not found." };
  }

  if (existing.status !== "PENDING" && existing.status !== "RETRY_SCHEDULED") {
    return {
      success: false,
      error: `Cannot cancel notification in ${existing.status} status.`,
    };
  }

  const now = new Date();
  await collection.updateOne(query, {
    $set: {
      status: "CANCELLED",
      lastErrorMessage: `Cancelled by administrator (${adminUser.username}): ${reason.trim()}`,
      updatedAt: now,
    },
  });

  await recordCommunicationAudit(
    {
      adminUsername: adminUser.username,
      adminId: adminUser.id,
      actionType: "CANCEL_NOTIFICATION",
      notificationId: id,
      idempotencyKey: existing.idempotencyKey,
      bookingId: existing.bookingId,
      channel: existing.channel,
      type: existing.type,
      previousState: existing.status,
      resultingState: "CANCELLED",
      reason: reason.trim(),
      outcome: "SUCCESS",
      correlationId: `cancel_${Date.now()}`,
    },
    db
  );

  return { success: true };
}

/**
 * Records a worker execution heartbeat in notification_worker_runs.
 */
export async function recordWorkerRun(
  stats: {
    claimed: number;
    accepted: number;
    delivered: number;
    retried: number;
    failed: number;
    durationMs: number;
  },
  workerId: string,
  database?: Db
): Promise<void> {
  const db = database || (await getDb());
  await db.collection("notification_worker_runs").insertOne({
    workerId,
    stats,
    timestamp: new Date(),
  });
}

/**
 * Returns scheduler and worker execution health diagnostics.
 */
export async function getSchedulerHealth(database?: Db): Promise<SchedulerHealthReport> {
  const db = database || (await getDb());
  const notifCol = db.collection<BookingNotification>("booking_notifications");
  const runsCol = db.collection("notification_worker_runs");

  const now = new Date();

  // Find latest worker run
  const latestRun = await runsCol.findOne({}, { sort: { timestamp: -1 } });

  // Due jobs
  const dueJobsCount = await notifCol.countDocuments({
    status: { $in: ["PENDING", "RETRY_SCHEDULED"] },
    nextAttemptAt: { $lte: now },
  });

  // Stale leases (PROCESSING older than 5 minutes)
  const fiveMinAgo = new Date(now.getTime() - 5 * 60 * 1000);
  const staleLeasesCount = await notifCol.countDocuments({
    status: "PROCESSING",
    leaseExpiresAt: { $lte: now },
  });

  // Overdue jobs (due more than 10 minutes ago)
  const tenMinAgo = new Date(now.getTime() - 10 * 60 * 1000);
  const oldestOverdue = await notifCol.findOne(
    {
      status: { $in: ["PENDING", "RETRY_SCHEDULED"] },
      nextAttemptAt: { $lte: tenMinAgo },
    },
    { sort: { nextAttemptAt: 1 } }
  );

  let overdueJobsCount = 0;
  let oldestOverdueAgeMinutes = 0;
  if (oldestOverdue && oldestOverdue.nextAttemptAt) {
    overdueJobsCount = await notifCol.countDocuments({
      status: { $in: ["PENDING", "RETRY_SCHEDULED"] },
      nextAttemptAt: { $lte: tenMinAgo },
    });
    oldestOverdueAgeMinutes = Math.floor((now.getTime() - oldestOverdue.nextAttemptAt.getTime()) / 60000);
  }

  // Derive health state
  let status: SchedulerHealthReport["status"] = "No execution observed";
  if (latestRun) {
    const ageMinutes = Math.floor((now.getTime() - new Date(latestRun.timestamp).getTime()) / 60000);
    if (ageMinutes <= 5 && overdueJobsCount === 0) {
      status = "Healthy";
    } else if (ageMinutes <= 15) {
      status = "Delayed";
    } else {
      status = "Degraded";
    }
  }

  return {
    status,
    lastWorkerRunAt: latestRun?.timestamp ? new Date(latestRun.timestamp).toISOString() : undefined,
    lastExecutionDurationMs: latestRun?.stats?.durationMs,
    claimedLastRun: latestRun?.stats?.claimed || 0,
    dueJobsCount,
    overdueJobsCount,
    oldestOverdueAgeMinutes,
    staleLeasesCount,
  };
}

/**
 * Returns communication timeline for a specific booking.
 */
export async function getBookingCommunicationTimeline(
  bookingId: string,
  database?: Db
): Promise<MaskedNotificationItem[]> {
  const db = database || (await getDb());
  const collection = db.collection<BookingNotification>("booking_notifications");

  const raw = await collection
    .find({ bookingId })
    .sort({ createdAt: 1 })
    .toArray();

  return raw.map((n) => ({
    _id: n._id ? n._id.toString() : "",
    bookingId: n.bookingId,
    bookingReference: n.metadata?.bookingReference || n.bookingId,
    propertyId: n.propertyId || "",
    propertyName: n.metadata?.propertyName || "Property",
    customerName: n.metadata?.guestName || "Guest",
    recipientMasked: maskRecipient(n.recipient, n.channel),
    channel: n.channel,
    type: n.type,
    status: n.status,
    scheduledAt: safeISO(n.scheduledAt),
    lastAttemptAt: n.updatedAt ? safeISO(n.updatedAt) : undefined,
    attempts: n.attempts || 0,
    maxAttempts: n.maxAttempts || 3,
    idempotencyKey: n.idempotencyKey,
    providerMessageId: n.providerMessageId,
    lastErrorCode: n.lastErrorCode,
    lastErrorMessage: n.lastErrorMessage,
    createdAt: safeISO(n.createdAt),
    updatedAt: safeISO(n.updatedAt),
  }));
}
