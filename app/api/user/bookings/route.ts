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
        // Use either checkIn or checkin field
        query.$or = [
          { checkIn: { $gte: new Date() } },
          { checkin: { $gte: new Date() } }
        ];
      } else if (status === "completed") {
        query.bookingStatus = "completed";
      } else if (status === "cancelled") {
        query.bookingStatus = "cancelled";
      }
    } else {
      // Default filter to show confirmed bookings only
      query.bookingStatus = "confirmed";
    }

    const bookings = await bookingsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    // Transform bookings to match frontend expectations
    const transformedBookings = bookings.map((booking: any) => ({
      _id: booking._id,
      bookingId: booking.bookingReference || booking._id,
      propertyId:
        booking.propertyId?.toString() ||
        booking.homestayId?.toString() ||
        booking.hotelId?.toString() ||
        "",
      propertyName: booking.propertyName || "Property",
      propertyType: booking.propertyType || "Homestay",
      city: booking.city || "City",
      checkIn: booking.checkIn || booking.checkin,
      checkOut: booking.checkOut || booking.checkout,
      guests: booking.guests || 1,
      rooms: 1,
      totalAmount: booking.totalPrice,
      bookingStatus: booking.bookingStatus,
      paymentStatus: booking.paymentStatus,
      createdAt: booking.createdAt,
    }));

    return NextResponse.json({
      bookings: transformedBookings,
      count: transformedBookings.length,
    });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
