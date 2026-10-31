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
    const bookings = db.collection("bookings");
    const booking = await bookings.findOne({ _id: new ObjectId(bookingId) });

    if (!booking?.cashfreeOrderId) {
      await client.close();
      return NextResponse.json({ error: "Payment order not found" }, { status: 404 });
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
      await client.close();
      console.error("Cashfree payment verification failed", order);
      return NextResponse.json({ error: "Could not verify payment" }, { status: 502 });
    }

    if (order.order_status === "PAID") {
      const paymentsResponse = await fetch(`${cashfreeBaseUrl}/orders/${encodeURIComponent(booking.cashfreeOrderId)}/payments`, {
        headers: {
          "x-client-id": appId,
          "x-client-secret": secretKey,
          "x-api-version": "2023-08-01",
        },
      });
      const payments = await paymentsResponse.json();
      const successfulPayment = Array.isArray(payments)
        ? payments.find((payment: { payment_status?: string }) => payment.payment_status === "SUCCESS")
        : undefined;

      await bookings.updateOne(
        { _id: new ObjectId(bookingId) },
        {
          $set: {
            paymentStatus: "paid",
            bookingStatus: "confirmed",
            paymentGateway: "cashfree",
            paymentId: successfulPayment?.cf_payment_id?.toString() || booking.cashfreeOrderId,
            paymentMethod: successfulPayment?.payment_group || "cashfree",
            paidAt: new Date(),
            updatedAt: new Date(),
          },
        }
      );

      if (booking.paymentStatus !== "paid") {
        const propertyId = booking.hotelId || booking.homestayId;
        const propertyCollection = booking.hotelId ? "hotels" : "homestays";
        await db.collection(propertyCollection).updateOne(
          { _id: new ObjectId(propertyId), "rooms.id": booking.roomId },
          { $inc: { "rooms.$.availability": -1 } }
        );
      }

      await client.close();
      return NextResponse.json({ status: "PAID" });
    }

    await client.close();
    return NextResponse.json({ status: order.order_status || "PENDING" });
  } catch (error) {
    console.error("Cashfree payment verification failed", error);
    return NextResponse.json({ error: "Payment verification failed" }, { status: 500 });
  }
}
