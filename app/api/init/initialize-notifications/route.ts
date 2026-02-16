import { MongoClient, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Optional: Add a secret token to prevent unauthorized access
  const token = request.headers.get("x-init-token");
  const validToken = process.env.INIT_TOKEN;

  if (validToken && token !== validToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = new MongoClient(process.env.MONGODB_URI!);
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || "travel");

    const bookingsCollection = db.collection("bookings");
    const notificationsCollection = db.collection("owner_notifications");
    const homestaysCollection = db.collection("homestays");
    const hotelsCollection = db.collection("hotels");

    // Find confirmed bookings with ownerId but no notifications
    const confirmedBookingsWithoutNotifications = await bookingsCollection
      .aggregate([
        {
          $match: {
            bookingStatus: "confirmed",
            ownerId: { $exists: true, $ne: null },
          },
        },
        {
          $lookup: {
            from: "owner_notifications",
            let: { bookingId: "$_id" },
            pipeline: [{ $match: { $expr: { $eq: ["$bookingId", "$$bookingId"] } } }],
            as: "notifications",
          },
        },
        {
          $match: {
            notifications: { $size: 0 },
          },
        },
      ])
      .toArray();

    if (confirmedBookingsWithoutNotifications.length === 0) {
      await client.close();
      return NextResponse.json({
        status: "success",
        message: "All confirmed bookings have notifications",
        created: 0,
        errors: 0,
      });
    }

    console.log(
      `[API] Found ${confirmedBookingsWithoutNotifications.length} confirmed bookings without notifications`
    );

    let created = 0;
    let errors = 0;
    const createdNotifications: any[] = [];

    for (const booking of confirmedBookingsWithoutNotifications) {
      try {
        // Get property name
        let propertyName = "Property";
        try {
          const propertyId = booking.hotelId || booking.homestayId;
          if (propertyId) {
            const collection = booking.hotelId ? hotelsCollection : homestaysCollection;
            const property = await collection.findOne({
              _id: new ObjectId(propertyId),
            });
            if (property) {
              propertyName = property.name || property.propertyName || "Property";
            }
          }
        } catch (err) {
          console.error("[API] Error fetching property name:", err);
        }

        // Create notification
        const notificationResult = await notificationsCollection.insertOne({
          ownerId: booking.ownerId,
          bookingId: booking._id,
          type: "booking",
          title: "New Booking Received",
          message: `${booking.guestName} has booked ${propertyName}`,
          data: {
            guestName: booking.guestName,
            propertyName: propertyName,
            checkin: booking.checkin,
            checkout: booking.checkout,
            nights: booking.nights,
            totalPrice: booking.totalPrice,
            guestMessage: booking.guestMessage || "",
          },
          isRead: false,
          createdAt: new Date(booking.createdAt),
        });

        created++;
        createdNotifications.push({
          notificationId: notificationResult.insertedId,
          bookingId: booking._id,
          ownerId: booking.ownerId,
          guestName: booking.guestName,
        });
        console.log(
          `[API] Created notification ${notificationResult.insertedId} for booking ${booking._id}`
        );
      } catch (err) {
        errors++;
        console.error(`[API] Error creating notification for booking ${booking._id}:`, err);
      }
    }

    await client.close();

    return NextResponse.json({
      status: "success",
      message: "Initialization complete",
      created,
      errors,
      totalFound: confirmedBookingsWithoutNotifications.length,
      createdNotifications: createdNotifications.slice(0, 10), // Return first 10 for verification
    });
  } catch (error) {
    console.error("[API] Initialization error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
