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
    const bookings = db.collection("cabBookings");
    const booking = await bookings.findOne({ _id: new ObjectId(bookingId) });
    if (!booking?.cashfreeOrderId) {
      return NextResponse.json({ error: "Cab payment order not found" }, { status: 404 });
    }

    const response = await fetch(`${cashfreeBaseUrl}/orders/${encodeURIComponent(booking.cashfreeOrderId)}`, {
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
      },
    });
    const order = await response.json();
    if (!response.ok) {
      console.error("Cashfree cab payment verification failed", order);
      return NextResponse.json({ error: "Could not verify cab payment" }, { status: 502 });
    }

    if (order.order_status !== "PAID") {
      return NextResponse.json({ status: order.order_status || "PENDING" });
    }

    let paymentId = booking.cashfreeOrderId;
    let paymentMethod = "cashfree";
    const paymentsResponse = await fetch(`${cashfreeBaseUrl}/orders/${encodeURIComponent(booking.cashfreeOrderId)}/payments`, {
      headers: {
        "x-client-id": appId,
        "x-client-secret": secretKey,
        "x-api-version": "2023-08-01",
      },
    });
    if (paymentsResponse.ok) {
      const payments = await paymentsResponse.json();
      const successfulPayment = Array.isArray(payments)
        ? payments.find((payment: { payment_status?: string }) => payment.payment_status === "SUCCESS")
        : undefined;
      if (successfulPayment) {
        paymentId = successfulPayment.cf_payment_id?.toString() || paymentId;
        paymentMethod = successfulPayment.payment_group || paymentMethod;
      }
    }

    await bookings.updateOne(
      { _id: new ObjectId(bookingId), paymentStatus: { $ne: "paid" } },
      {
        $set: {
          paymentStatus: "paid",
          status: "confirmed",
          paymentGateway: "cashfree",
          paymentId,
          paymentMethod,
          paidAt: new Date(),
          updatedAt: new Date(),
        },
      },
    );

    return NextResponse.json({
      status: "PAID",
      bookingReference: booking.bookingReference,
      estimatedFare: Number(booking.estimatedFare),
    });
  } catch (error) {
    console.error("Cashfree cab payment verification failed", error);
    return NextResponse.json({ error: "Cab payment verification failed" }, { status: 500 });
  }
}
