import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserFromRequest } from "@/lib/middleware/auth";
import { ObjectId } from "mongodb";

/**
 * POST /api/package-bookings
 * Create a booking for a package (for authenticated users)
 */
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    // Require authentication for package bookings
    if (!user || !user.userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }
    
    const body = await request.json();

    // Validate required fields
    const required = [
      "packageId",
      "packageTitle",
      "fullName",
      "email",
      "phone",
      "startDate",
    ];

    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const db = await getDb();
    const bookingsCollection = db.collection("bookings");

    // Generate booking reference
    const bookingReference = `PKG${Date.now()}${Math.random()
      .toString(36)
      .substr(2, 9)
      .toUpperCase()}`;

    // For packages, we'll create a booking record even if not fully confirmed
    // This makes it visible in the user's bookings
    const booking = {
      packageId: new ObjectId(body.packageId),
      packageTitle: body.packageTitle,
      guestName: body.fullName,
      guestEmail: body.email,
      guestPhone: body.phone,
      propertyName: body.packageTitle,
      propertyType: "package",
      city: body.startingPoint || body.location || "TBD",
      checkin: new Date(body.startDate),
      checkIn: new Date(body.startDate),
      checkout: new Date(body.endDate || body.startDate),
      checkOut: new Date(body.endDate || body.startDate),
      guests: (body.adults || 1) + (body.children || 0),
      nights: Math.ceil(
        (new Date(body.endDate || body.startDate).getTime() -
          new Date(body.startDate).getTime()) /
          (1000 * 60 * 60 * 24),
      ) || 1,
      basePrice: body.price || 0,
      taxes: 0,
      platformFee: 0,
      totalPrice: body.price || 0,
      bookingReference,
      paymentStatus: "pending",
      bookingStatus: "pending", // Package bookings are pending until admin confirms pricing
      refundStatus: "none",
      userId: new ObjectId(user.userId), // Ensure userId is always set
      // Store package inquiry details
      accommodationType: body.accommodationType,
      budget: body.budget,
      modeOfTravel: body.modeOfTravel,
      carType: body.carType,
      additionalDetails: body.additionalDetails,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await bookingsCollection.insertOne(booking);

    return NextResponse.json(
      {
        ...booking,
        _id: result.insertedId,
        message: "Package booking created. You can track it in My Bookings.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating package booking:", error);
    return NextResponse.json(
      { error: "Failed to create package booking" },
      { status: 500 }
    );
  }
}
