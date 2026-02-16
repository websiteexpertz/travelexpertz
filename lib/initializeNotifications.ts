/**
 * Initialize missing notifications on app startup
 * This ensures that any confirmed bookings without notifications get them created
 */

import { MongoClient, ObjectId } from "mongodb";

async function initializeNotifications() {
  if (typeof window !== "undefined") {
    // Don't run on client-side
    return;
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
      console.log("[Init] All confirmed bookings have notifications ✅");
      await client.close();
      return;
    }

    console.log(`[Init] Found ${confirmedBookingsWithoutNotifications.length} confirmed bookings without notifications`);

    let created = 0;
    let errors = 0;

    for (const booking of confirmedBookingsWithoutNotifications) {
      try {
        // Get property name
        let propertyName = "Property";
        try {
          const propertyId = booking.hotelId || booking.homestayId;
          const collection = booking.hotelId ? hotelsCollection : homestaysCollection;
          const property = await collection.findOne({ _id: new ObjectId(propertyId) });
          if (property) {
            propertyName = property.name || property.propertyName || "Property";
          }
        } catch (err) {
          console.error("[Init] Error fetching property name:", err);
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
        console.log(`[Init] Created notification ${notificationResult.insertedId} for booking ${booking._id}`);
      } catch (err) {
        errors++;
        console.error(`[Init] Error creating notification for booking ${booking._id}:`, err);
      }
    }

    console.log(
      `[Init] Notification initialization complete: ${created} created, ${errors} errors ✅`
    );
    await client.close();
  } catch (error) {
    console.error("[Init] Error initializing notifications:", error);
  }
}

export { initializeNotifications };
