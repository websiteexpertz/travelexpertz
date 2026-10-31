import { MongoClient, ObjectId } from "mongodb";
import { NextResponse } from "next/server";

const cashfreeBaseUrl =
  process.env.CASHFREE_ENV === "production"
    ? "https://api.cashfree.com/pg"
    : "https://sandbox.cashfree.com/pg";

export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json();
    if (!bookingId || !ObjectId.isValid(bookingId)) {
      return NextResponse.json({ error: "Valid booking ID is required" }, { status: 400 });
    }

    const appId = process.env.CASHFREE_APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY;
    if (!appId || !secretKey) {
      return NextResponse.json({ error: "Cashfree credentials are not configured" }, { status: 500 });
    }

    const client = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || "travelexpertz");
    const booking = await db.collection("bookings").findOne({ _id: new ObjectId(bookingId) });
    await client.close();

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const totalPrice = Number(booking.totalPrice);
    const origin = process.env.CASHFREE_ENV === "production"
      ? (process.env.NEXT_PUBLIC_APP_URL || "https://travelexpertz.com").replace(/\/$/, "")
      : (process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin).replace(/\/$/, "");
    if (process.env.CASHFREE_ENV === "production" && !/^https:\/\/[^/]+/.test(origin)) {
      return NextResponse.json({ error: "Cashfree production requires an HTTPS return URL" }, { status: 400 });
    }
    const orderId = `TXZ_${bookingId}_${Date.now()}`;

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
        order_amount: Number(totalPrice.toFixed(2)),
        order_currency: "INR",
        customer_details: {
          customer_id: String(booking.userId || bookingId).replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 50),
          customer_name: booking.guestName,
          customer_email: booking.guestEmail,
          customer_phone: booking.guestPhone,
        },
        order_meta: {
          return_url: `${origin}/booking/confirm?bookingId=${bookingId}&order_id={order_id}`,
        },
      }),
    });

    const cashfreeOrder = await response.json();
    if (!response.ok) {
      console.error("Cashfree order creation failed", cashfreeOrder);
      return NextResponse.json({
        error: "Failed to create Cashfree order",
        details: cashfreeOrder.message || cashfreeOrder.error || cashfreeOrder,
      }, { status: 502 });
    }

    const mongoClient = new MongoClient(process.env.MONGODB_URI || "mongodb://localhost:27017");
    await mongoClient.connect();
    await mongoClient.db(process.env.MONGODB_DB || "travelexpertz").collection("bookings").updateOne(
      { _id: new ObjectId(bookingId) },
      { $set: { cashfreeOrderId: orderId, updatedAt: new Date() } }
    );
    await mongoClient.close();

    return NextResponse.json({ paymentSessionId: cashfreeOrder.payment_session_id });
  } catch (error) {
    console.error("Cashfree checkout initialization failed", error);
    return NextResponse.json({ error: "Failed to initialize checkout" }, { status: 500 });
  }
}
