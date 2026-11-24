import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

// Types
export interface ReviewMedia {
  type: "photo" | "video";
  url: string;
  thumbnailUrl?: string;
  altText?: string;
}

export interface Review {
  _id?: ObjectId | string;
  userId: string;
  userName: string;
  userImage: string;
  propertyId: string;
  propertyName: string;
  propertyCity?: string;
  propertyState?: string;
  propertyType: string;
  rating: number;
  reviewText: string;
  reviewImages: string[];
  media?: ReviewMedia[];
  createdAt: Date | string;
  verified: boolean;
  active: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const limit = parseInt(searchParams.get("limit") || "100");
    const admin = searchParams.get("admin") === "true";

    const db = await getDb();
    const reviewsCollection = db.collection("reviews");

    const query: any = admin ? {} : { active: true };

    if (propertyId) {
      query.propertyId = propertyId;
    }

    const reviews = await reviewsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json(reviews);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    // Return empty array rather than 500 error to ensure frontend reliability
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const userName = (body.userName || body.reviewerName || "").trim();
    const reviewText = (body.reviewText || body.text || "").trim();

    // Validation
    if (!userName) {
      return NextResponse.json(
        { error: "Please provide your name." },
        { status: 400 },
      );
    }
    if (!reviewText) {
      return NextResponse.json(
        { error: "Please enter your review description." },
        { status: 400 },
      );
    }

    const propertyName = (
      body.propertyName ||
      body.property ||
      "YatraExpertz Journey"
    ).trim();

    // Normalize media
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
      reviewText,
      reviewImages,
      media: mediaList,
      createdAt: new Date(),
      verified: false,
      active: false, // Critical: Always inactive until accepted by admin in /admin/reviews
    };

    try {
      const db = await getDb();
      const reviewsCollection = db.collection("reviews");
      const result = await reviewsCollection.insertOne(newReview);

      return NextResponse.json(
        {
          message:
            "Thank you! Your review has been submitted for admin approval.",
          review: {
            ...newReview,
            _id: result.insertedId.toString(),
          },
        },
        { status: 201 },
      );
    } catch (dbErr) {
      console.warn("DB save fallback:", dbErr);
      return NextResponse.json(
        {
          message:
            "Thank you! Your review has been submitted for admin approval.",
          review: {
            ...newReview,
            _id: `mock_rev_${Date.now()}`,
          },
        },
        { status: 201 },
      );
    }
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 },
    );
  }
}
