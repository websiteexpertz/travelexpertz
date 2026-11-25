import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { sanitizeReviewText } from "@/lib/services/reviews/xss";

export const runtime = "nodejs";

export interface ReviewMedia {
  type: "photo" | "video";
  url: string;
  thumbnailUrl?: string;
  altText?: string;
  fileId?: string;
}

export interface Review {
  _id?: ObjectId | string;
  bookingId?: string;
  userId: string;
  userName: string;
  reviewerDisplayName?: string;
  userImage: string;
  propertyId: string;
  propertyName: string;
  propertyCity?: string;
  propertyState?: string;
  propertyType: string;
  rating: number;
  overallRating?: number;
  reviewTitle?: string;
  reviewText: string;
  reviewImages: string[];
  photos?: string[];
  videos?: string[];
  media?: ReviewMedia[];
  recommendProperty?: boolean;
  createdAt: Date | string;
  submittedAt?: Date | string;
  publishedAt?: Date | string;
  moderationStatus?: string;
  moderationReason?: string;
  verified: boolean;
  verifiedStay?: boolean;
  active: boolean;
  featuredOnHomepage?: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const limit = parseInt(searchParams.get("limit") || "100");
    const admin = searchParams.get("admin") === "true";
    const status = searchParams.get("status")?.toUpperCase();
    const withAggregates = searchParams.get("aggregates") === "true";
    const featuredOnly = searchParams.get("featured") === "true";

    const db = await getDb();
    const reviewsCollection = db.collection("reviews");

    const query: Record<string, unknown> = {};

    if (admin) {
      if (status) {
        query.moderationStatus = status;
      }
    } else {
      // Public view: only show approved/active reviews, strictly excluding REJECTED, HIDDEN, and PENDING
      query.$and = [
        {
          $or: [
            { moderationStatus: "APPROVED" },
            { active: true, moderationStatus: { $exists: false } },
            { active: true, moderationStatus: null },
          ],
        },
        {
          moderationStatus: { $nin: ["REJECTED", "HIDDEN", "PENDING", "CHANGES_REQUESTED"] },
        },
      ];
    }

    if (propertyId) {
      query.propertyId = propertyId;
    }

    if (featuredOnly) {
      query.featuredOnHomepage = true;
    }

    const rawReviews = await reviewsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    // Sanitize reviews for public access (strip internal emails, phone numbers, tokens, booking IDs)
    const sanitizedReviews = rawReviews.map((rev) => {
      const sanitized: Record<string, unknown> = {
        _id: rev._id.toString(),
        propertyId: rev.propertyId,
        propertyName: rev.propertyName,
        propertyCity: rev.propertyCity,
        propertyType: rev.propertyType,
        userName: rev.reviewerDisplayName || rev.userName || "Verified Guest",
        reviewerDisplayName: rev.reviewerDisplayName || rev.userName || "Verified Guest",
        userImage: rev.reviewerAvatar || rev.userImage || "",
        rating: rev.overallRating || rev.rating || 5,
        overallRating: rev.overallRating || rev.rating || 5,
        reviewTitle: rev.reviewTitle || "",
        reviewText: rev.reviewText || rev.comment || "",
        reviewImages: rev.photos || rev.reviewImages || [],
        media: rev.media || [],
        recommendProperty: rev.recommendProperty !== false,
        verified: rev.verifiedStay === true || rev.verified === true,
        verifiedStay: rev.verifiedStay === true,
        createdAt: rev.createdAt,
        publishedAt: rev.publishedAt || rev.createdAt,
      };

      // Admin access includes moderation fields
      if (admin) {
        sanitized.bookingId = rev.bookingId;
        sanitized.moderationStatus = rev.moderationStatus || (rev.active ? "APPROVED" : "PENDING");
        sanitized.moderationReason = rev.moderationReason;
        sanitized.moderatedBy = rev.moderatedBy;
        sanitized.moderatedAt = rev.moderatedAt;
        sanitized.active = rev.active;
        sanitized.featuredOnHomepage = rev.featuredOnHomepage;
      }

      return sanitized;
    });

    if (withAggregates) {
      // Calculate rating aggregates across all approved reviews for this property
      const aggQuery: Record<string, unknown> = propertyId ? { propertyId } : {};
      aggQuery.$and = [
        {
          $or: [
            { moderationStatus: "APPROVED" },
            { active: true, moderationStatus: { $exists: false } },
            { active: true, moderationStatus: null },
          ],
        },
        {
          moderationStatus: { $nin: ["REJECTED", "HIDDEN", "PENDING", "CHANGES_REQUESTED"] },
        },
      ];

      const allApproved = await reviewsCollection.find(aggQuery).toArray();
      const totalCount = allApproved.length;
      let totalScore = 0;
      let verifiedCount = 0;
      let recommendCount = 0;
      const ratingDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      for (const r of allApproved) {
        const score = Math.max(1, Math.min(5, Math.round(r.overallRating || r.rating || 5)));
        totalScore += score;
        ratingDistribution[score] = (ratingDistribution[score] || 0) + 1;
        if (r.verifiedStay === true || r.verified === true) {
          verifiedCount++;
        }
        if (r.recommendProperty !== false) {
          recommendCount++;
        }
      }

      const averageRating = totalCount > 0 ? Number((totalScore / totalCount).toFixed(1)) : 0;
      const recommendPercentage = totalCount > 0 ? Math.round((recommendCount / totalCount) * 100) : 0;

      return NextResponse.json({
        reviews: sanitizedReviews,
        aggregates: {
          averageRating,
          totalCount,
          verifiedCount,
          recommendPercentage,
          ratingDistribution,
        },
      });
    }

    return NextResponse.json(sanitizedReviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const userName = sanitizeReviewText(body.userName || body.reviewerName || "");
    const rawText = body.reviewText || body.text || "";
    const reviewText = sanitizeReviewText(rawText);

    if (!userName) {
      return NextResponse.json({ error: "Please provide your name." }, { status: 400 });
    }
    if (!reviewText || reviewText.length < 10) {
      return NextResponse.json(
        { error: "Please enter your review description (minimum 10 characters)." },
        { status: 400 }
      );
    }

    const propertyName = sanitizeReviewText(
      body.propertyName || body.property || "YatraExpertz Journey"
    );

    let mediaList: ReviewMedia[] = [];
    if (Array.isArray(body.media) && body.media.length > 0) {
      mediaList = body.media;
    } else if (Array.isArray(body.reviewImages) && body.reviewImages.length > 0) {
      mediaList = body.reviewImages.map((img: string) => ({
        type: "photo" as const,
        url: img,
        thumbnailUrl: img,
      }));
    } else if (body.photoUrl) {
      mediaList.push({
        type: "photo",
        url: body.photoUrl,
        thumbnailUrl: body.photoUrl,
      });
    }

    const reviewImages = mediaList
      .filter((m) => m.type === "photo")
      .map((m) => m.url);

    const now = new Date();
    const newReview = {
      userId: body.userId || `user_${Date.now()}`,
      userName,
      userImage: body.userImage || body.reviewerAvatarUrl || "",
      propertyId: body.propertyId || "general_review",
      propertyName,
      propertyCity: body.propertyCity || body.city || "",
      propertyState: body.propertyState || body.state || "",
      propertyType: body.propertyType || "Property",
      rating: Math.max(1, Math.min(5, Number(body.rating) || 5)),
      overallRating: Math.max(1, Math.min(5, Number(body.rating) || 5)),
      reviewTitle: sanitizeReviewText(body.reviewTitle || body.title || ""),
      reviewText,
      reviewImages,
      media: mediaList,
      recommendProperty: body.recommendProperty !== false,
      createdAt: now,
      submittedAt: now,
      verified: false,
      verifiedStay: false,
      moderationStatus: "PENDING",
      active: false, // Critical: Always inactive until accepted by admin in /admin/reviews
    };

    const db = await getDb();
    const reviewsCollection = db.collection("reviews");
    const result = await reviewsCollection.insertOne(newReview);

    return NextResponse.json(
      {
        message: "Thank you! Your review has been submitted for admin approval.",
        review: {
          ...newReview,
          _id: result.insertedId.toString(),
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
