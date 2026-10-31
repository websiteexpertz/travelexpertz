import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const cashfreeBaseUrl = process.env.CASHFREE_ENV === "production"
  ? "https://api.cashfree.com/pg"
  : "https://sandbox.cashfree.com/pg";

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json();
    if (!bookingId || !ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: "Valid cab booking ID is required" }, { status: 400 });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    if (!appId || !secretKey) {
      return NextResponse.json({ error: "Cashfree credentials are not configured" }, { status: 500 });
    }

    const db = await getDb();
    const booking = await db.collection("cabBookings").findOne({ _id: new ObjectId(bookingId) });
    if (!booking) {
      return NextResponse.json({ error: "Cab booking not found" }, { status: 404 });
    }

    const amount = Number(booking.estimatedFare);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Invalid cab booking amount" }, { status: 400 });
    }

    const origin = process.env.CASHFREE_ENV === "production"
      ? (process.env.NEXT_PUBLIC_APP_URL || "https://travelexpertz.com").replace(/\/$/, "")
      : (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
    if (process.env.CASHFREE_ENV === "production" && !/^https:\/\/[^/]+/.test(origin)) {
      return NextResponse.json({ error: "Cashfree production requires an HTTPS return URL" }, { status: 400 });
    }
    const orderId = `CAB_${bookingId}_${Date.now()}`;
    const response = await fetch(`${cashfreeBaseUrl}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: Number(amount.toFixed(2)),
        order_currency: "INR",
        customer_details: {
          customer_id: String(booking.userId || bookingId).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50),
          customer_name: String(booking.fullName).trim().slice(0, 100),
          customer_email: String(booking.email).trim().toLowerCase(),
          customer_phone: String(booking.phone).replace(/\D/g, "").slice(-15),
        },
        order_meta: {
          return_url: `${origin}/cabs?cabBookingId=${bookingId}&order_id={order_id}`,
        },
      }),
    });

    const cashfreeOrder = await response.json();
    if (!response.ok) {
      console.error("Cashfree cab order creation failed", cashfreeOrder);
      return NextResponse.json({
        error: "Failed to create Cashfree order",
        details: cashfreeOrder.message || cashfreeOrder.error || cashfreeOrder,
      }, { status: 502 });
    }

    await db.collection("cabBookings").updateOne(
      { _id: new ObjectId(bookingId) },
      { $set: { cashfreeOrderId: orderId, paymentStatus: "pending", updatedAt: new Date() } },
    );

    return NextResponse.json({ paymentSessionId: cashfreeOrder.payment_session_id });
  } catch (error) {
    console.error("Cashfree cab checkout initialization failed", error);
    return NextResponse.json({ error: "Failed to initialize cab checkout" }, { status: 500 });
  }
}
