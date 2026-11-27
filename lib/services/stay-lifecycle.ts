/**
 * Yatra Expertz — Stay Lifecycle & Billing Finalization Service
 * Implements actual guest check-in, actual checkout, billing finalization,
 * reminder cancellation, and post-stay notification triggers.
 */

import { Db, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";
import { getDb } from "../db";
import { verifyAccessToken } from "../jwt";
import {
  enqueueCheckoutThankYouNotification,
  enqueueFinalInvoiceNotification,
  enqueueReviewInvitationNotification,
  cancelPendingNotificationsForBooking,
} from "./notifications/queue";
import { getOrGenerateFinalInvoice } from "./documents/generator";

export type StayStatus =
  | "NOT_CHECKED_IN"
  | "CHECKED_IN"
  | "CHECKED_OUT"
  | "NO_SHOW";

export type BillingStatus =
  | "OPEN"
  | "PENDING_FINALIZATION"
  | "FINALIZED";

export interface AdditionalServiceItem {
  name: string;
  amount: number;
  quantity?: number;
  addedAt?: Date;
  addedBy?: string;
}

export interface FinalBillingSnapshot {
  originalBookingAmount: number;
  roomCharges: number;
  additionalServices: AdditionalServiceItem[];
  discounts: number;
  taxesAndFees: number;
  totalInvoicedAmount: number;
  totalPaidAmount: number;
  outstandingBalance: number;
  supplierName: string;
  supplierGstin?: string;
  supplierAddress?: string;
  isGstTaxInvoice: boolean;
  paymentMethod?: string;
  transactionReference?: string;
  finalizedAt: Date;
  finalizedBy: string;
}

export interface LifecycleAuthUser {
  id: string;
  role: "admin" | "owner" | "user" | string;
  propertyIds?: string[];
}

export interface CheckInResult {
  success: boolean;
  alreadyCheckedIn?: boolean;
  actualCheckInAt?: Date;
  error?: string;
  errorCode?: string;
}

export interface CheckOutResult {
  success: boolean;
  alreadyCheckedOut?: boolean;
  actualCheckOutAt?: Date;
  outstandingBalance?: number;
  error?: string;
  errorCode?: string;
}

export interface FinalizeBillingResult {
  success: boolean;
  alreadyFinalized?: boolean;
  invoiceNumber?: string;
  invoiceDocumentId?: string;
  billingSnapshot?: FinalBillingSnapshot;
  error?: string;
  errorCode?: string;
}

/**
 * Checks if the requesting user is authorized to manage check-in/out or billing for this booking.
 */
export async function authorizeBookingManagement(
  booking: any,
  user: LifecycleAuthUser,
  database?: Db
): Promise<{ authorized: boolean; reason?: string }> {
  // Administrators have full access
  if (user.role === "admin") {
    return { authorized: true };
  }

  // Customers cannot check themselves in or out
  if (user.role === "user") {
    return {
      authorized: false,
      reason: "Customers are not authorized to perform stay lifecycle actions",
    };
  }

  // Property owners must own the specific property
  const propertyId = booking.hotelId || booking.homestayId;
  if (!propertyId) {
    return { authorized: false, reason: "Booking has no associated property" };
  }

  // Check if user owns this property directly or via ownerproperties collection
  if (booking.ownerId && booking.ownerId.toString() === user.id.toString()) {
    return { authorized: true };
  }

  const db = database || (await getDb());
  const propertyCollectionName = booking.hotelId ? "hotels" : "homestays";
  try {
    const property = await db.collection(propertyCollectionName).findOne({
      _id: ObjectId.isValid(propertyId) ? new ObjectId(propertyId) : (propertyId as any),
    });

    if (property && property.ownerId && property.ownerId.toString() === user.id.toString()) {
      return { authorized: true };
    }

    // Check ownerproperties collection
    const ownerMapping = await db.collection("ownerproperties").findOne({
      ownerId: user.id,
      propertyId: propertyId.toString(),
    });

    if (ownerMapping) {
      return { authorized: true };
    }
  } catch {
    // If DB check fails, proceed with authorization evaluation
  }

  return {
    authorized: false,
    reason: "You do not have management permissions for this property",
  };
}

/**
 * Resolves authenticated user from Next.js request headers or cookies.
 */
export function resolveLifecycleAuthUser(request: Request): LifecycleAuthUser | null {
  let token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    const cookieHeader = request.headers.get("cookie") || "";
    const match = cookieHeader.match(/(?:^|;\s*)(?:accessToken|token|ownerToken|adminToken)=([^;]+)/);
    if (match) token = match[1];
  }
  if (!token) return null;

  // Try standard access secret
  const accessPayload = verifyAccessToken(token);
  if (accessPayload) {
    return {
      id: accessPayload.userId,
      role: accessPayload.role || "user",
    };
  }

  // Try fallback secrets
  const secrets = [
    process.env.JWT_SECRET || "your-secret-key",
    process.env.JWT_ACCESS_SECRET || "access-secret-change-in-production",
  ];

  for (const s of secrets) {
    try {
      const decoded: any = jwt.verify(token, s);
      return {
        id: decoded.userId || decoded.id || decoded._id,
        role: decoded.role || (decoded.isAdmin ? "admin" : "owner"),
      };
    } catch {}
  }

  return null;
}

/**
 * 1. MARK GUEST CHECK-IN
 * Transitions booking stay status to CHECKED_IN.
 * Cancels remaining arrival reminder notification jobs.
 */
export async function markGuestCheckIn(
  bookingId: string,
  userId: string,
  options: { database?: Db; authUser?: LifecycleAuthUser } = {}
): Promise<CheckInResult> {
  const db = options.database || (await getDb());
  const bookings = db.collection("bookings");

  const booking = await bookings.findOne({
    _id: ObjectId.isValid(bookingId) ? new ObjectId(bookingId) : (bookingId as any),
  });

  if (!booking) {
    return { success: false, error: `Booking ${bookingId} not found`, errorCode: "BOOKING_NOT_FOUND" };
  }

  // Authorization check
  if (options.authUser) {
    const auth = await authorizeBookingManagement(booking, options.authUser, db);
    if (!auth.authorized) {
      return { success: false, error: auth.reason || "Unauthorized", errorCode: "FORBIDDEN" };
    }
  }

  // Booking must be confirmed
  if (booking.bookingStatus !== "confirmed") {
    return {
      success: false,
      error: `Cannot check in booking with status '${booking.bookingStatus}'`,
      errorCode: "INVALID_BOOKING_STATUS",
    };
  }

  // Booking cannot be cancelled
  if (booking.bookingStatus === "cancelled") {
    return {
      success: false,
      error: "Cannot check in a cancelled booking",
      errorCode: "BOOKING_CANCELLED",
    };
  }

  // Cannot check in if already checked out
  if (booking.stayStatus === "CHECKED_OUT") {
    return {
      success: false,
      error: "Guest has already checked out of this booking",
      errorCode: "ALREADY_CHECKED_OUT",
    };
  }

  // Idempotency: if already checked in, return success without duplicate side-effects
  if (booking.stayStatus === "CHECKED_IN") {
    return {
      success: true,
      alreadyCheckedIn: true,
      actualCheckInAt: booking.actualCheckInAt || booking.updatedAt,
    };
  }

  const now = new Date();

  // Atomically update stay status and record audit log
  await bookings.updateOne(
    { _id: ObjectId.isValid(bookingId) ? new ObjectId(bookingId) : (bookingId as any) },
    {
      $set: {
        stayStatus: "CHECKED_IN",
        actualCheckInAt: now,
        checkedInBy: userId,
        updatedAt: now,
      },
      $push: {
        auditLog: {
          action: "GUEST_CHECK_IN",
          timestamp: now,
          userId,
          details: { stayStatus: "CHECKED_IN" },
        },
      } as any,
    }
  );

  // Invalidate all remaining arrival reminders now that guest has checked in
  try {
    await cancelPendingNotificationsForBooking(
      bookingId,
      "Guest already checked in at property",
      db
    );
  } catch (err) {
    console.warn(`[StayLifecycle] Warning cancelling reminders for ${bookingId}:`, err);
  }

  return {
    success: true,
    actualCheckInAt: now,
  };
}

/**
 * 2. MARK GUEST CHECKOUT
 * Transitions stay status to CHECKED_OUT and bookingStatus to completed.
 * Enqueues customer checkout thank-you notification.
 * Sets review eligibility for Phase 6.
 */
export async function markGuestCheckOut(
  bookingId: string,
  userId: string,
  options: { database?: Db; authUser?: LifecycleAuthUser } = {}
): Promise<CheckOutResult> {
  const db = options.database || (await getDb());
  const bookings = db.collection("bookings");

  const booking = await bookings.findOne({
    _id: ObjectId.isValid(bookingId) ? new ObjectId(bookingId) : (bookingId as any),
  });

  if (!booking) {
    return { success: false, error: `Booking ${bookingId} not found`, errorCode: "BOOKING_NOT_FOUND" };
  }

  // Authorization check
  if (options.authUser) {
    const auth = await authorizeBookingManagement(booking, options.authUser, db);
    if (!auth.authorized) {
      return { success: false, error: auth.reason || "Unauthorized", errorCode: "FORBIDDEN" };
    }
  }

  // Booking cannot be cancelled
  if (booking.bookingStatus === "cancelled") {
    return {
      success: false,
      error: "Cannot check out a cancelled booking",
      errorCode: "BOOKING_CANCELLED",
    };
  }

  // Idempotency: if already checked out, return success
  if (booking.stayStatus === "CHECKED_OUT") {
    return {
      success: true,
      alreadyCheckedOut: true,
      actualCheckOutAt: booking.actualCheckOutAt || booking.updatedAt,
      outstandingBalance: Number(booking.amountToPay ?? booking.outstandingAmount ?? 0),
    };
  }

  // Guest must have actually checked in first
  if (booking.stayStatus !== "CHECKED_IN") {
    return {
      success: false,
      error: "Guest cannot be checked out before check-in has been recorded",
      errorCode: "CHECKIN_REQUIRED_BEFORE_CHECKOUT",
    };
  }

  const now = new Date();
  const outstandingBalance = Number(booking.amountToPay ?? booking.outstandingAmount ?? 0);

  // Atomically update stay lifecycle, booking status, and review eligibility
  await bookings.updateOne(
    { _id: ObjectId.isValid(bookingId) ? new ObjectId(bookingId) : (bookingId as any) },
    {
      $set: {
        stayStatus: "CHECKED_OUT",
        bookingStatus: "completed",
        actualCheckOutAt: now,
        checkedOutBy: userId,
        billingStatus: booking.billingStatus === "FINALIZED" ? "FINALIZED" : "PENDING_FINALIZATION",
        reviewEligible: true,
        updatedAt: now,
      },
      $push: {
        auditLog: {
          action: "GUEST_CHECK_OUT",
          timestamp: now,
          userId,
          details: { stayStatus: "CHECKED_OUT", outstandingBalance },
        },
      } as any,
    }
  );

  // Invalidate any residual arrival reminders
  try {
    await cancelPendingNotificationsForBooking(
      bookingId,
      "Guest already checked out of property",
      db
    );
  } catch (err) {
    console.warn(`[StayLifecycle] Warning cancelling reminders for ${bookingId}:`, err);
  }

  // Enqueue customer checkout thank-you notification
  try {
    await enqueueCheckoutThankYouNotification(bookingId, { database: db });
  } catch (err) {
    console.error(`[StayLifecycle] Failed to enqueue thank-you email for ${bookingId}:`, err);
  }

  // Enqueue customer post-checkout review invitation notification
  try {
    await enqueueReviewInvitationNotification(bookingId, { database: db });
  } catch (err) {
    console.error(`[StayLifecycle] Failed to enqueue review invitation for ${bookingId}:`, err);
  }

  return {
    success: true,
    actualCheckOutAt: now,
    outstandingBalance,
  };
}

/**
 * 3. FINALIZE BOOKING BILLING
 * Validates financial figures, persists final billing snapshot,
 * generates the final invoice PDF, and enqueues invoice email delivery.
 */
export async function finalizeBookingBilling(
  bookingId: string,
  userId: string,
  billingInput: {
    roomCharges?: number;
    additionalServices?: AdditionalServiceItem[];
    discounts?: number;
    taxesAndFees?: number;
    totalAmount?: number;
    paidAmount?: number;
    supplierName?: string;
    supplierGstin?: string;
    supplierAddress?: string;
    isGstTaxInvoice?: boolean;
    paymentMethod?: string;
    transactionReference?: string;
  },
  options: { database?: Db; authUser?: LifecycleAuthUser } = {}
): Promise<FinalizeBillingResult> {
  const db = options.database || (await getDb());
  const bookings = db.collection("bookings");

  const booking = await bookings.findOne({
    _id: ObjectId.isValid(bookingId) ? new ObjectId(bookingId) : (bookingId as any),
  });

  if (!booking) {
    return { success: false, error: `Booking ${bookingId} not found`, errorCode: "BOOKING_NOT_FOUND" };
  }

  // Authorization check
  if (options.authUser) {
    const auth = await authorizeBookingManagement(booking, options.authUser, db);
    if (!auth.authorized) {
      return { success: false, error: auth.reason || "Unauthorized", errorCode: "FORBIDDEN" };
    }
  }

  // Guest must have actually checked out before billing can be finalized
  if (booking.stayStatus !== "CHECKED_OUT") {
    return {
      success: false,
      error: "Billing cannot be finalized before guest checkout has been confirmed",
      errorCode: "CHECKOUT_REQUIRED_BEFORE_FINALIZATION",
    };
  }

  // Idempotency: if already finalized, return existing finalized record
  if (booking.billingStatus === "FINALIZED" && booking.finalBillingSnapshot) {
    return {
      success: true,
      alreadyFinalized: true,
      billingSnapshot: booking.finalBillingSnapshot,
      invoiceNumber: booking.finalInvoiceNumber,
    };
  }

  // Financial Reconciliation
  const roomCharges = Number(billingInput.roomCharges ?? booking.price ?? booking.totalPrice ?? 0);
  const additionalServices = billingInput.additionalServices || [];
  const addServicesTotal = additionalServices.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const discounts = Number(billingInput.discounts ?? 0);
  const taxesAndFees = Number(billingInput.taxesAndFees ?? 0);

  const calculatedTotal = roomCharges + addServicesTotal - discounts + taxesAndFees;
  const providedTotal = billingInput.totalAmount ?? calculatedTotal;

  // Verify mathematical reconciliation
  if (Math.abs(calculatedTotal - providedTotal) > 0.01) {
    return {
      success: false,
      error: `Billing reconciliation mismatch: charges (${calculatedTotal}) != total (${providedTotal})`,
      errorCode: "BILLING_RECONCILIATION_ERROR",
    };
  }

  const totalPaid = Number(billingInput.paidAmount ?? booking.amountPaid ?? booking.totalPrice ?? 0);
  const outstandingBalance = Math.max(0, calculatedTotal - totalPaid);

  const supplierName = (
    billingInput.supplierName ||
    booking.hotelName ||
    booking.homestayName ||
    "Yatra Expertz Hospitality"
  ).trim();

  // If GSTIN provided, must be valid 15-char format
  let isGstTaxInvoice = Boolean(billingInput.isGstTaxInvoice && billingInput.supplierGstin);
  if (billingInput.supplierGstin && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(billingInput.supplierGstin)) {
    // Malformed GSTIN: fallback to commercial invoice rather than fabricating tax invoice
    isGstTaxInvoice = false;
  }

  const now = new Date();
  const snapshot: FinalBillingSnapshot = {
    originalBookingAmount: Number(booking.totalPrice || booking.price || 0),
    roomCharges,
    additionalServices,
    discounts,
    taxesAndFees,
    totalInvoicedAmount: calculatedTotal,
    totalPaidAmount: totalPaid,
    outstandingBalance,
    supplierName,
    supplierGstin: billingInput.supplierGstin,
    supplierAddress: billingInput.supplierAddress,
    isGstTaxInvoice,
    paymentMethod: billingInput.paymentMethod || "Cashfree / Online",
    transactionReference: billingInput.transactionReference || booking.cashfreeOrderId,
    finalizedAt: now,
    finalizedBy: userId,
  };

  // 1. Generate Final Invoice PDF (reusing Phase 4 Document Engine)
  const invoiceDocRes = await getOrGenerateFinalInvoice(bookingId, {
    database: db,
    billingSnapshot: snapshot,
  });

  if (!invoiceDocRes.success) {
    return {
      success: false,
      error: `Invoice generation failed: ${invoiceDocRes.error}`,
      errorCode: "INVOICE_GENERATION_FAILED",
    };
  }

  const invoiceNumber = invoiceDocRes.document?.documentNumber;
  const invoiceDocumentId = invoiceDocRes.document?.documentId;

  // 2. Atomically persist finalized billing state
  await bookings.updateOne(
    { _id: ObjectId.isValid(bookingId) ? new ObjectId(bookingId) : (bookingId as any) },
    {
      $set: {
        billingStatus: "FINALIZED",
        billingFinalizedAt: now,
        billingFinalizedBy: userId,
        finalBillingSnapshot: snapshot,
        finalInvoiceNumber: invoiceNumber,
        finalInvoiceDocumentId: invoiceDocumentId,
        updatedAt: now,
      },
      $push: {
        auditLog: {
          action: "BILLING_FINALIZED",
          timestamp: now,
          userId,
          details: { invoiceNumber, totalInvoicedAmount: calculatedTotal, outstandingBalance },
        },
      } as any,
    }
  );

  // 3. Enqueue final invoice email delivery notification
  if (invoiceNumber) {
    try {
      await enqueueFinalInvoiceNotification(bookingId, invoiceNumber, { database: db });
    } catch (err) {
      console.error(`[StayLifecycle] Failed to enqueue invoice email for ${bookingId}:`, err);
    }
  }

  return {
    success: true,
    invoiceNumber,
    invoiceDocumentId,
    billingSnapshot: snapshot,
  };
}
