import { Db, ObjectId } from "mongodb";
import { getDb } from "@/lib/db";
import { ReviewEligibilityResult } from "./types";
import { verifyGuestReviewToken } from "./tokens";

export interface ReviewEligibilityOptions {
  propertyId?: string;
  userId?: string;
  guestEmail?: string;
  token?: string;
  database?: Db;
}

/**
 * Authoritatively verifies whether a booking is eligible for a verified guest review.
 */
export async function validateReviewEligibility(
  bookingId: string,
  options: ReviewEligibilityOptions = {}
): Promise<ReviewEligibilityResult> {
  const db = options.database || (await getDb());
  const bookings = db.collection("bookings");
  const reviews = db.collection("reviews");

  const query = ObjectId.isValid(bookingId)
    ? { _id: new ObjectId(bookingId) }
    : ({ _id: bookingId } as unknown as { _id: ObjectId });
  const booking = await bookings.findOne(query);

  if (!booking) {
    return {
      eligible: false,
      errorCode: "BOOKING_NOT_FOUND",
      reason: `Booking ${bookingId} does not exist`,
    };
  }

  // 1. Check for cancellation
  if (booking.bookingStatus === "cancelled" || booking.status === "cancelled") {
    return {
      eligible: false,
      errorCode: "BOOKING_CANCELLED",
      reason: "Cancelled bookings are not eligible for guest reviews",
    };
  }

  // 2. Check for no-show
  if (booking.stayStatus === "NO_SHOW" || booking.noShow === true) {
    return {
      eligible: false,
      errorCode: "NO_SHOW",
      reason: "No-show bookings did not complete an actual stay and cannot be reviewed",
    };
  }

  // 3. Check for pending / failed booking status
  if (booking.bookingStatus === "pending" || booking.paymentStatus === "failed") {
    return {
      eligible: false,
      errorCode: "BOOKING_NOT_CONFIRMED",
      reason: "Unconfirmed or pending bookings are not eligible for reviews",
    };
  }

  // 4. Must have actually checked in
  if (!booking.actualCheckInAt && booking.stayStatus !== "CHECKED_IN" && booking.stayStatus !== "CHECKED_OUT") {
    return {
      eligible: false,
      errorCode: "CHECKIN_REQUIRED",
      reason: "Guest check-in was never recorded for this booking",
    };
  }

  // 5. Must have actually checked out
  if (booking.stayStatus !== "CHECKED_OUT" || !booking.actualCheckOutAt) {
    return {
      eligible: false,
      errorCode: "CHECKOUT_REQUIRED",
      reason: "Guest has not completed actual checkout from the property",
    };
  }

  // 6. Property verification
  const bookingPropertyId = (booking.hotelId || booking.homestayId || booking.propertyId || "").toString();
  if (options.propertyId && options.propertyId !== bookingPropertyId) {
    return {
      eligible: false,
      errorCode: "PROPERTY_MISMATCH",
      reason: "The target property does not match the property on the booking record",
    };
  }

  // 7. Check if already reviewed (1 review per booking)
  const existingReview = await reviews.findOne({
    bookingId: bookingId.toString(),
  });
  if (existingReview) {
    return {
      eligible: false,
      errorCode: "ALREADY_REVIEWED",
      reason: "A verified review has already been submitted for this completed stay",
    };
  }

  // 8. Authorization check (via token or logged-in user / guest email)
  if (options.token) {
    const tokenResult = await verifyGuestReviewToken(options.token, bookingId.toString(), db);
    if (!tokenResult.valid) {
      return {
        eligible: false,
        errorCode: tokenResult.errorCode === "TOKEN_EXPIRED" ? "TOKEN_EXPIRED" : tokenResult.errorCode === "TOKEN_REVOKED" ? "TOKEN_REVOKED" : "TOKEN_INVALID",
        reason: tokenResult.reason || "Invalid review invitation token",
      };
    }
  } else if (options.userId) {
    const bookingUserId = booking.userId?.toString();
    if (bookingUserId && bookingUserId !== options.userId.toString()) {
      return {
        eligible: false,
        errorCode: "UNAUTHORIZED",
        reason: "User account does not match the booking guest account",
      };
    }
  } else if (options.guestEmail) {
    const normProvided = options.guestEmail.toLowerCase().trim();
    const normBookingEmail = (booking.guestEmail || booking.customerDetails?.email || "").toLowerCase().trim();
    if (normProvided !== normBookingEmail) {
      return {
        eligible: false,
        errorCode: "UNAUTHORIZED",
        reason: "Provided email address does not match booking guest record",
      };
    }
  }

  // Note: Outstanding balance is intentionally NOT a disqualifier
  // Guests who completed an actual stay can review even if an outstanding balance exists.

  return {
    eligible: true,
    booking: {
      _id: booking._id.toString(),
      bookingReference: booking.bookingReference || booking.cashfreeOrderId || booking._id.toString(),
      propertyId: bookingPropertyId,
      propertyName: booking.hotelName || booking.homestayName || booking.propertyName || "Property",
      propertyCity: booking.city || booking.propertyCity || "",
      propertyImage: booking.propertyImage || booking.hotelImage || "",
      checkInDate: booking.checkInDate || booking.checkIn,
      checkOutDate: booking.checkOutDate || booking.checkOut,
      actualCheckInAt: booking.actualCheckInAt,
      actualCheckOutAt: booking.actualCheckOutAt,
      guestName: booking.guestName || booking.customerDetails?.name || "Guest",
      guestEmail: booking.guestEmail || booking.customerDetails?.email,
      userId: booking.userId?.toString(),
      stayStatus: booking.stayStatus,
      bookingStatus: booking.bookingStatus,
    },
  };
}
