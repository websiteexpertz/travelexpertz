import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serviceType = searchParams.get("serviceType");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "100");

    const db = await getDb();
    const bookingsCollection = db.collection("serviceBookings");

    const query: any = {};
    if (serviceType) query.serviceType = serviceType;
    if (status) query.status = status;

    const bookings = await bookingsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching service bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validation
    if (!body.serviceType || !body.fullName || !body.mobile || !body.email) {
      return NextResponse.json(
        { error: "Missing required fields: serviceType, fullName, mobile, email" },
        { status: 400 }
      );
    }

    const db = await getDb();
    const bookingsCollection = db.collection("serviceBookings");

    const newBooking = {
      ...body,
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await bookingsCollection.insertOne(newBooking);

    // Send email notification
    try {
      await fetch(`${request.nextUrl.origin}/api/service-bookings/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newBooking, _id: result.insertedId }),
      });
    } catch (emailError) {
      console.error("Failed to send email:", emailError);
    }

    return NextResponse.json({
      success: true,
      message: "Booking request submitted successfully! We will contact you soon.",
      bookingId: result.insertedId,
    });
  } catch (error) {
    console.error("Error creating service booking:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
