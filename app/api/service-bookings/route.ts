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
    const service = String(body.serviceType || "");
    const normalized = {
      ...body,
      fullName: String(body.fullName || body.yourFullName || "").trim(),
      email: String(body.email || body.emailAddress || "").trim(),
      mobile: String(body.mobile || body.mobileNumber || "").trim(),
    };

    const supportedServices = ["visa", "forex", "insurance", "destination-wedding"];
    if (!supportedServices.includes(service) || !normalized.fullName || !normalized.mobile || !normalized.email) {
      return NextResponse.json(
        { error: "Missing required enquiry fields." },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized.email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (body.consent !== true && String(body.consent).toLowerCase() !== "true") {
      return NextResponse.json({ error: "Consent is required to submit this enquiry." }, { status: 400 });
    }

    const db = await getDb();
    const bookingsCollection = db.collection("serviceBookings");

    const newBooking = {
      ...normalized,
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
