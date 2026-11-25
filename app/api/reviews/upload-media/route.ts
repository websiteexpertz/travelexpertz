import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { validateMediaBuffer, storeReviewMedia } from "@/lib/services/reviews/media";
import { verifyGuestReviewToken } from "@/lib/services/reviews/tokens";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const token = formData.get("token") as string | null;
    const bookingId = formData.get("bookingId") as string | null;
    const propertyId = (formData.get("propertyId") as string | null) || undefined;

    if (!file) {
      return NextResponse.json({ error: "No media file provided" }, { status: 400 });
    }

    const db = await getDb();

    // Verify token or booking authorization
    let authorizedBookingId = bookingId || "";
    if (token) {
      const tokenRes = await verifyGuestReviewToken(token, bookingId || undefined, db);
      if (!tokenRes.valid) {
        return NextResponse.json(
          { error: tokenRes.reason || "Invalid or expired review invitation token" },
          { status: 401 }
        );
      }
      authorizedBookingId = tokenRes.payload!.bookingId;
    } else if (!bookingId) {
      return NextResponse.json(
        { error: "Review invitation token or booking ID is required for media upload" },
        { status: 401 }
      );
    }

    // Convert file to buffer
    const arrayBuf = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    // Validate media
    const validation = validateMediaBuffer(buffer, file.name, file.type);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error || "Invalid media file" },
        { status: 400 }
      );
    }

    // Store in GridFS
    const storedMedia = await storeReviewMedia(
      buffer,
      {
        originalName: file.name,
        mimeType: validation.mimeType,
        mediaType: validation.type,
        bookingId: authorizedBookingId,
        propertyId,
      },
      db
    );

    return NextResponse.json(storedMedia, { status: 201 });
  } catch (error: unknown) {
    console.error("Error uploading review media:", error);
    const msg = error instanceof Error ? error.message : "Failed to upload review media";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
