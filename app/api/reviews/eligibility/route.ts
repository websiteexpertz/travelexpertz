import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { validateReviewEligibility } from "@/lib/services/reviews/eligibility";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");
    const token = searchParams.get("token") || undefined;
    const propertyId = searchParams.get("propertyId") || undefined;

    if (!bookingId && !token) {
      return NextResponse.json(
        { eligible: false, errorCode: "MISSING_PARAM", error: "bookingId or token is required" },
        { status: 400 }
      );
    }

    const db = await getDb();

    let targetBookingId = bookingId || "";
    if (!targetBookingId && token) {
      // Decode bookingId from token if not provided separately
      try {
        const payloadBase64 = token.split(".")[0];
        const payload = JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf-8"));
        targetBookingId = payload.bookingId;
      } catch {
        return NextResponse.json(
          { eligible: false, errorCode: "TOKEN_INVALID", error: "Malformed review invitation token" },
          { status: 400 }
        );
      }
    }

    const result = await validateReviewEligibility(targetBookingId, {
      token,
      propertyId,
      database: db,
    });

    if (!result.eligible) {
      return NextResponse.json(
        {
          eligible: false,
          errorCode: result.errorCode,
          error: result.reason,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      eligible: true,
      booking: result.booking,
    });
  } catch (error: unknown) {
    console.error("Error validating review eligibility:", error);
    return NextResponse.json(
      { eligible: false, error: "Failed to validate review eligibility" },
      { status: 500 }
    );
  }
}
