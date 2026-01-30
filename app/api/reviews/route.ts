import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

// Types
interface Review {
  _id?: ObjectId;
  userId: string;
  userName: string;
  userImage: string;
  propertyId: string;
  propertyName: string;
  propertyType: string;
  rating: number;
  reviewText: string;
  reviewImages: string[];
  createdAt: Date | string;
  verified: boolean;
  active: boolean;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const propertyId = searchParams.get("propertyId");
    const limit = parseInt(searchParams.get("limit") || "4");
    const admin = searchParams.get("admin") === "true"; // Add admin flag

    const db = await getDb();
    const reviewsCollection = db.collection("reviews");

    const query: any = admin ? {} : { active: true }; // Show all reviews for admin, only active for public

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
    return NextResponse.json(
      { error: "Failed to fetch reviews" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.userName || !body.propertyId || !body.reviewText) {
      return NextResponse.json(
        { error: "Missing required fields: userName, propertyId, reviewText" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const reviewsCollection = db.collection("reviews");

    const newReview: Review = {
      userId: body.userId || "",
      userName: body.userName,
      userImage: body.userImage || "",
      propertyId: body.propertyId,
      propertyName: body.propertyName || "",
      propertyType: body.propertyType || "Property",
      rating: body.rating || 5,
      reviewText: body.reviewText,
      reviewImages: body.reviewImages || [],
      createdAt: new Date(),
      verified: false,
      active: false, // Reviews require admin approval before being visible
    };

    const result = await reviewsCollection.insertOne(newReview);

    return NextResponse.json(
      {
        message: "Review submitted successfully! It will be visible after admin approval.",
        review: {
          ...newReview,
          _id: result.insertedId,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { error: "Failed to submit review" },
      { status: 500 },
    );
  }
}
