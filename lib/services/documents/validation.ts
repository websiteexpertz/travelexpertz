/**
 * Document Authorization & Guest Token Security Service
 * Enforces ownership verification, role-based checks, and expiring guest tokens.
 */

import { Db, ObjectId } from "mongodb";
import { createHmac } from "crypto";
import { BookingDocument } from "./types";
import { getDb } from "../../db";

const TOKEN_SECRET = process.env.JWT_SECRET || process.env.CRON_SECRET || "yatra-expertz-document-auth-secret-key-2026";

export interface DocumentAuthUser {
  id?: string;
  role?: string;
  email?: string;
}

export interface GuestTokenPayload {
  bookingId: string;
  email: string;
  expiresAt: number;
}

/**
 * Generates an expiring, cryptographically signed guest access token for document download.
 */
export function generateGuestDocumentToken(
  bookingId: string,
  email: string,
  expiresInDays: number = 30,
  secret: string = TOKEN_SECRET
): string {
  const expiresAt = Date.now() + expiresInDays * 24 * 60 * 60 * 1000;
  const payload: GuestTokenPayload = {
    bookingId,
    email: email.trim().toLowerCase(),
    expiresAt,
  };
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(payloadB64).digest("hex");
  return `${payloadB64}.${signature}`;
}

/**
 * Validates a guest document token against the target booking.
 */
export function verifyGuestDocumentToken(
  token: string,
  bookingId: string,
  secret: string = TOKEN_SECRET
): { valid: boolean; reason?: string; payload?: GuestTokenPayload } {
  if (!token || !token.includes(".")) {
    return { valid: false, reason: "INVALID_TOKEN_FORMAT" };
  }

  const [payloadB64, signature] = token.split(".");
  const expectedSig = createHmac("sha256", secret).update(payloadB64).digest("hex");

  if (signature !== expectedSig) {
    return { valid: false, reason: "INVALID_SIGNATURE" };
  }

  try {
    const payload: GuestTokenPayload = JSON.parse(
      Buffer.from(payloadB64, "base64url").toString("utf8")
    );

    if (payload.bookingId !== bookingId) {
      return { valid: false, reason: "BOOKING_ID_MISMATCH" };
    }

    if (Date.now() > payload.expiresAt) {
      return { valid: false, reason: "TOKEN_EXPIRED" };
    }

    return { valid: true, payload };
  } catch {
    return { valid: false, reason: "MALFORMED_TOKEN_PAYLOAD" };
  }
}

/**
 * Server-side authorization check before allowing document download or streaming.
 */
export async function authorizeDocumentAccess(
  document: BookingDocument,
  user?: DocumentAuthUser,
  guestToken?: string,
  database?: Db
): Promise<{ authorized: boolean; reason?: string; role?: string }> {
  // 1. Admin access
  if (user?.role === "admin") {
    return { authorized: true, role: "admin" };
  }

  // 2. Booking owner (customer account match)
  if (user?.id && document.customerId && user.id.toString() === document.customerId.toString()) {
    return { authorized: true, role: "customer" };
  }

  // Check booking document owner if customerId was not directly on document
  try {
    const db = database || (await getDb());
    if (db && typeof db.collection === "function") {
      const bookingsCollection = db.collection("bookings");
      const booking = await bookingsCollection.findOne({
        _id: ObjectId.isValid(document.bookingId) ? new ObjectId(document.bookingId) : (document.bookingId as any),
      });

      if (booking) {
        if (user?.id && booking.userId && user.id.toString() === booking.userId.toString()) {
          return { authorized: true, role: "customer" };
        }

        // Property owner access
        if (user?.id) {
          const propertyId = booking.hotelId || booking.homestayId;
          if (propertyId) {
            const propertyCollection = booking.hotelId ? "hotels" : "homestays";
            const property = await db.collection(propertyCollection).findOne({
              _id: ObjectId.isValid(propertyId) ? new ObjectId(propertyId) : (propertyId as any),
            });
            if (property && property.ownerId && property.ownerId.toString() === user.id.toString()) {
              return { authorized: true, role: "owner" };
            }
          }
        }
      }
    }
  } catch {
    // Proceed to token check if DB is unavailable
  }

  // 3. Guest token access
  if (guestToken) {
    const tokenCheck = verifyGuestDocumentToken(guestToken, document.bookingId);
    if (tokenCheck.valid) {
      return { authorized: true, role: "guest" };
    }
    return { authorized: false, reason: `GUEST_TOKEN_${tokenCheck.reason}` };
  }

  // 4. Default: Unauthorized
  return {
    authorized: false,
    reason: "UNAUTHORIZED_DOCUMENT_ACCESS",
  };
}
