import { NextRequest, NextResponse } from "next/server";
import { Document } from "mongodb";
import { getDb } from "@/lib/db";
import { validateReviewEligibility } from "@/lib/services/reviews/eligibility";
import { markGuestReviewTokenConsumed } from "@/lib/services/reviews/tokens";
import { sanitizeReviewText } from "@/lib/services/reviews/xss";
import { ReviewMediaItem, VerifiedReview } from "@/lib/services/reviews/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const token = typeof body.token === "string" ? body.token.trim() : undefined;
    let bookingId = typeof body.bookingId === "string" ? body.bookingId.trim() : "";
    const propertyId = typeof body.propertyId === "string" ? body.propertyId.trim() : undefined;
    const rating = Number(body.rating);
    const rawTitle = typeof body.reviewTitle === "string" ? body.reviewTitle : body.title || "";
    const rawText = typeof body.reviewText === "string" ? body.reviewText : body.text || "";
    const recommendProperty = typeof body.recommendProperty === "boolean" ? body.recommendProperty : true;
    const reviewerDisplayName = typeof body.reviewerDisplayName === "string" ? body.reviewerDisplayName.trim() : body.userName || "";
    const reviewerAvatar = typeof body.reviewerAvatar === "string" ? body.reviewerAvatar : "";
    const media: ReviewMediaItem[] = Array.isArray(body.media) ? body.media : [];

    // If bookingId wasn't passed directly, decode it from token if token is present
    if (!bookingId && token) {
      try {
        const payloadBase64 = token.split(".")[0];
        const payload = JSON.parse(Buffer.from(payloadBase64, "base64url").toString("utf-8"));
        bookingId = payload.bookingId;
      } catch {
        return NextResponse.json({ error: "Malformed review invitation token" }, { status: 400 });
      }
    }

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    // 1. Rating validation (1 to 5)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: "Overall rating must be an integer between 1 and 5 stars" },
        { status: 400 }
      );
    }

    // 2. Sanitize and validate review title (max 100 characters)
    const reviewTitle = sanitizeReviewText(rawTitle);
    if (reviewTitle.length > 100) {
      return NextResponse.json(
        { error: "Review title cannot exceed 100 characters" },
        { status: 400 }
      );
    }

    // 3. Sanitize and validate review text (10 to 2000 characters)
    const reviewText = sanitizeReviewText(rawText);
    if (!reviewText || reviewText.length < 10) {
      return NextResponse.json(
        { error: "Written feedback must be at least 10 characters long" },
        { status: 400 }
      );
    }
    if (reviewText.length > 2000) {
      return NextResponse.json(
        { error: "Written feedback cannot exceed 2,000 characters" },
        { status: 400 }
      );
    }

    // 4. Validate media counts
    const photos = media.filter((m) => m.type === "photo");
    const videos = media.filter((m) => m.type === "video");

    if (photos.length > 5) {
      return NextResponse.json(
        { error: "A maximum of 5 photographs can be attached per review" },
        { status: 400 }
      );
    }
    if (videos.length > 2) {
      return NextResponse.json(
        { error: "A maximum of 2 videos can be attached per review" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const reviewsCol = db.collection("reviews");

    // Ensure partial unique index on bookingId exists
    try {
      await reviewsCol.createIndex(
        { bookingId: 1 },
        {
          unique: true,
          partialFilterExpression: { bookingId: { $exists: true, $type: "string" } },
        }
      );
    } catch {
      // Index already exists or in-memory
    }

    // 5. Authoritatively validate review eligibility
    const eligibility = await validateReviewEligibility(bookingId, {
      token,
      propertyId,
      database: db,
    });

    if (!eligibility.eligible) {
      return NextResponse.json(
        {
          error: eligibility.reason || "Booking is not eligible for a verified guest review",
          errorCode: eligibility.errorCode,
        },
        { status: 403 }
      );
    }

    const booking = eligibility.booking!;
    const now = new Date();

    const displayName = reviewerDisplayName || booking.guestName || "Verified Guest";
    const resolvedPropertyId = booking.propertyId || propertyId || "general_review";
    const resolvedPropertyName = booking.propertyName || "Yatra Expertz Journey";

    const photoUrls = photos.map((p) => p.url);
    const videoUrls = videos.map((v) => v.url);

    // 6. Construct Verified Review document
    const newReview: VerifiedReview = {
      bookingId: booking._id,
      propertyId: resolvedPropertyId,
      propertyName: resolvedPropertyName,
      propertyCity: booking.propertyCity || "",
      propertyState: "",
      propertyType: "Hotel",
      customerId: booking.userId,
      userId: booking.userId || `guest_${booking._id}`,
      verifiedStay: true,
      reviewerDisplayName: displayName,
      userName: displayName,
      reviewerAvatar: reviewerAvatar || "",
      userImage: reviewerAvatar || "",
      overallRating: rating,
      rating,
      reviewTitle,
      reviewText,
      recommendProperty,
      photos: photoUrls,
      videos: videoUrls,
      reviewImages: photoUrls,
      media,
      moderationStatus: "PENDING",
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
      active: false, // Inactive until approved by administrator
      verified: true,
      featuredOnHomepage: false,
    };

    // Insert into database with duplicate prevention
    let insertedId: string;
    try {
      const insertResult = await reviewsCol.insertOne(newReview as unknown as Document);
      insertedId = insertResult.insertedId.toString();
    } catch (err: unknown) {
      const mongoErr = err as { code?: number };
      if (mongoErr.code === 11000) {
        return NextResponse.json(
          { error: "A review has already been submitted for this booking", errorCode: "ALREADY_REVIEWED" },
          { status: 409 }
        );
      }
      throw err;
    }

    // 7. Consume guest token if token was used
    if (token) {
      try {
        await markGuestReviewTokenConsumed(booking._id, insertedId, db);
      } catch (tErr) {
        console.warn(`[ReviewService] Failed to mark review token consumed for ${booking._id}:`, tErr);
      }
    }

    // 8. Cancel pending review invitation notifications
    try {
      await db.collection("booking_notifications").updateMany(
        {
          bookingId: booking._id,
          type: "REVIEW_REQUEST",
          status: "PENDING",
        },
        {
          $set: {
            status: "CANCELLED",
            cancelReason: "Review submitted by guest",
            updatedAt: now,
          },
        }
      );
    } catch (nErr) {
      console.warn(`[ReviewService] Failed to cancel pending review notifications:`, nErr);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for sharing your experience! Your review has been submitted successfully and will be published after moderation.",
        reviewId: insertedId,
        moderationStatus: "PENDING",
        propertyName: resolvedPropertyName,
        submittedRating: rating,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("Error creating verified review:", error);
    const msg = error instanceof Error ? error.message : "Failed to submit verified review";
    return NextResponse.json(
      { error: msg },
      { status: 500 }
    );
  }
}
