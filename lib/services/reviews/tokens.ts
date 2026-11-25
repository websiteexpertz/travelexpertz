import crypto from "crypto";
import { Db } from "mongodb";
import { getDb } from "@/lib/db";
import { ReviewTokenPayload } from "./types";

const TOKEN_SECRET =
  process.env.REVIEW_TOKEN_SECRET ||
  process.env.JWT_SECRET ||
  "yatra-expertz-verified-review-secret-2026";

const DEFAULT_EXPIRATION_DAYS = 30;

export interface TokenVerificationResult {
  valid: boolean;
  errorCode?: "TOKEN_INVALID" | "TOKEN_EXPIRED" | "TOKEN_REVOKED" | "TOKEN_ALREADY_USED" | "PAYLOAD_MISMATCH";
  reason?: string;
  payload?: ReviewTokenPayload;
}

/**
 * Generates a tamper-proof cryptographically signed guest review invitation token.
 */
export function generateGuestReviewToken(
  bookingId: string,
  propertyId: string,
  guestEmail: string,
  validityDays: number = DEFAULT_EXPIRATION_DAYS
): string {
  const expiresAt = Date.now() + validityDays * 24 * 60 * 60 * 1000;
  const payload: ReviewTokenPayload = {
    bookingId,
    propertyId,
    guestEmail: (guestEmail || "").toLowerCase().trim(),
    expiresAt,
  };

  const payloadBase64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(payloadBase64)
    .digest("base64url");

  return `${payloadBase64}.${signature}`;
}

/**
 * Verifies a guest review invitation token and ensures it is neither expired nor revoked/consumed.
 */
export async function verifyGuestReviewToken(
  token: string,
  expectedBookingId?: string,
  database?: Db
): Promise<TokenVerificationResult> {
  if (!token || typeof token !== "string" || !token.includes(".")) {
    return { valid: false, errorCode: "TOKEN_INVALID", reason: "Malformed or missing review invitation token" };
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return { valid: false, errorCode: "TOKEN_INVALID", reason: "Invalid token structure" };
  }

  const [payloadBase64, providedSig] = parts;

  // Verify HMAC signature with timing-safe comparison
  const expectedSig = crypto
    .createHmac("sha256", TOKEN_SECRET)
    .update(payloadBase64)
    .digest("base64url");

  const providedBuf = Buffer.from(providedSig);
  const expectedBuf = Buffer.from(expectedSig);

  if (
    providedBuf.length !== expectedBuf.length ||
    !crypto.timingSafeEqual(providedBuf, expectedBuf)
  ) {
    return { valid: false, errorCode: "TOKEN_INVALID", reason: "Invalid token signature" };
  }

  let payload: ReviewTokenPayload;
  try {
    const jsonStr = Buffer.from(payloadBase64, "base64url").toString("utf-8");
    payload = JSON.parse(jsonStr);
  } catch {
    return { valid: false, errorCode: "TOKEN_INVALID", reason: "Corrupted token payload" };
  }

  // Expiration check
  if (Date.now() > payload.expiresAt) {
    return { valid: false, errorCode: "TOKEN_EXPIRED", reason: "Review invitation token has expired" };
  }

  // Booking match check
  if (expectedBookingId && payload.bookingId !== expectedBookingId) {
    return { valid: false, errorCode: "PAYLOAD_MISMATCH", reason: "Token booking does not match target booking" };
  }

  // Database checks for revocation and consumption
  const db = database || (await getDb());
  const tokenRecord = await db.collection("review_tokens").findOne({ bookingId: payload.bookingId });

  if (tokenRecord) {
    if (tokenRecord.revoked) {
      return { valid: false, errorCode: "TOKEN_REVOKED", reason: tokenRecord.revocationReason || "Token has been revoked" };
    }
    if (tokenRecord.consumed) {
      return { valid: false, errorCode: "TOKEN_ALREADY_USED", reason: "Review has already been submitted using this invitation" };
    }
  }

  // Check if booking already has a review in reviews collection
  const existingReview = await db.collection("reviews").findOne({ bookingId: payload.bookingId });
  if (existingReview) {
    return { valid: false, errorCode: "TOKEN_ALREADY_USED", reason: "A review has already been submitted for this booking" };
  }

  return {
    valid: true,
    payload,
  };
}

/**
 * Revokes a review invitation token for a booking.
 */
export async function revokeGuestReviewToken(
  bookingId: string,
  reason: string = "Revoked by administrator or guest request",
  database?: Db
): Promise<void> {
  const db = database || (await getDb());
  await db.collection("review_tokens").updateOne(
    { bookingId },
    {
      $set: {
        bookingId,
        revoked: true,
        revokedAt: new Date(),
        revocationReason: reason,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}

/**
 * Marks a review invitation token as consumed after successful review creation.
 */
export async function markGuestReviewTokenConsumed(
  bookingId: string,
  reviewId: string,
  database?: Db
): Promise<void> {
  const db = database || (await getDb());
  await db.collection("review_tokens").updateOne(
    { bookingId },
    {
      $set: {
        bookingId,
        consumed: true,
        consumedAt: new Date(),
        reviewId,
        updatedAt: new Date(),
      },
    },
    { upsert: true }
  );
}
