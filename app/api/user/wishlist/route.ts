import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserFromRequest } from "@/lib/middleware/auth";
import { ObjectId } from "mongodb";

/**
 * GET /api/user/wishlist
 * Get user's wishlist
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const wishlistCollection = db.collection("wishlist");

    const wishlist = await wishlistCollection
      .find({ userId: new ObjectId(user.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      wishlist,
      count: wishlist.length,
    });
  } catch (error) {
    console.error("Get wishlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/wishlist
 * Add property to wishlist
 * 
 * Request Body:
 * {
 *   "propertyId": "507f1f77bcf86cd799439011",
 *   "propertyType": "hotel",
 *   "propertyName": "Grand Hotel",
 *   "city": "Mumbai",
 *   "price": 5000,
 *   "image": "/images/hotel.jpg",
 *   "rating": 4.5
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { propertyId, propertyType, propertyName, city, price, image, rating } = data;

    if (!propertyId || !propertyType || !propertyName) {
      return NextResponse.json(
        { error: "Property details are required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const wishlistCollection = db.collection("wishlist");

    // Check if already in wishlist
    const existing = await wishlistCollection.findOne({
      userId: new ObjectId(user.userId),
      propertyId: new ObjectId(propertyId),
    });

    if (existing) {
      return NextResponse.json(
        { error: "Property already in wishlist" },
        { status: 400 }
      );
    }

    // Add to wishlist
    await wishlistCollection.insertOne({
      userId: new ObjectId(user.userId),
      propertyId: new ObjectId(propertyId),
      propertyType,
      propertyName,
      city,
      price,
      image,
      rating,
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: "Added to wishlist",
    });
  } catch (error) {
    console.error("Add to wishlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/user/wishlist/[id]
 * Remove property from wishlist
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const wishlistId = searchParams.get("id");

    if (!wishlistId) {
      return NextResponse.json(
        { error: "Wishlist ID is required" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const wishlistCollection = db.collection("wishlist");

    const result = await wishlistCollection.deleteOne({
      _id: new ObjectId(wishlistId),
      userId: new ObjectId(user.userId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Wishlist item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Removed from wishlist",
    });
  } catch (error) {
    console.error("Remove from wishlist error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
