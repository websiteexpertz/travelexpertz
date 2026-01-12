import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserFromRequest } from "@/lib/middleware/auth";
import { ObjectId } from "mongodb";

/**
 * GET /api/user/bookings?status=upcoming|completed|cancelled
 * Get user bookings filtered by status
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

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const db = await getDb();
    const bookingsCollection = db.collection("bookings");

    const query: any = { userId: new ObjectId(user.userId) };

    if (status) {
      if (status === "upcoming") {
        query.bookingStatus = "confirmed";
        query.checkIn = { $gte: new Date() };
      } else if (status === "completed") {
        query.bookingStatus = "completed";
      } else if (status === "cancelled") {
        query.bookingStatus = "cancelled";
      }
    }

    const bookings = await bookingsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      bookings,
      count: bookings.length,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
