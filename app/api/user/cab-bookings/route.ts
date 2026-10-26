import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserFromRequest } from "@/lib/middleware/auth";

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || !ObjectId.isValid(user.userId)) {
    return NextResponse.json({ error: "Sign in to view your cab bookings." }, { status: 401 });
  }

  try {
    const db = await getDb();
    const bookings = await db.collection("cabBookings")
      .find({ userId: new ObjectId(user.userId) })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();

    return NextResponse.json(bookings.map((booking) => ({
      _id: booking._id.toString(),
      bookingReference: booking.bookingReference,
      vehicleModel: booking.vehicleModel,
      vehicleCategory: booking.vehicleCategory,
      vehicleFuelType: booking.vehicleFuelType || "",
      vehicleColor: booking.vehicleColor || "",
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      pickupAt: booking.pickupAt,
      returnAt: booking.returnAt,
      tripType: booking.tripType,
      passengers: booking.passengers,
      distanceKm: booking.distanceKm,
      fareBase: booking.fareBase,
      farePerKm: booking.farePerKm,
      driverAllowance: booking.driverAllowance || 0,
      governmentTax: booking.governmentTax,
      governmentTaxPercent: booking.governmentTaxPercent,
      estimatedFare: booking.estimatedFare,
      status: booking.status,
      createdAt: booking.createdAt,
    })));
  } catch (error) {
    console.error("Error fetching customer's cab bookings:", error);
    return NextResponse.json({ error: "Could not load your cab bookings." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user || !ObjectId.isValid(user.userId)) {
    return NextResponse.json({ error: "Sign in to manage your cab bookings." }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "A valid booking ID is required." }, { status: 400 });
  }

  try {
    const result = await (await getDb()).collection("cabBookings").updateOne(
      {
        _id: new ObjectId(id),
        userId: new ObjectId(user.userId),
        status: "pending",
      },
      { $set: { status: "cancelled", updatedAt: new Date() } },
    );

    if (!result.matchedCount) {
      return NextResponse.json(
        { error: "Only your pending cab requests can be cancelled." },
        { status: 409 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling customer's cab booking:", error);
    return NextResponse.json({ error: "Could not cancel this cab request." }, { status: 500 });
  }
}
