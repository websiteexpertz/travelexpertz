/**
 * Automatic Notification Generator
 * Run this to backfill notifications for existing confirmed bookings
 * Usage: node scripts/generate-missing-notifications.js
 */

const { MongoClient, ObjectId } = require("mongodb");

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = "travelexpertz";

async function generateMissingNotifications() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db(dbName);

    const bookingsCollection = db.collection("bookings");
    const notificationsCollection = db.collection("owner_notifications");
    const homestaysCollection = db.collection("homestays");
    const hotelsCollection = db.collection("hotels");

    console.log("🔄 Starting automatic notification generation...\n");

    // Find all confirmed bookings with ownerId that don't have notifications
    const confirmedBookings = await bookingsCollection
      .find({
        bookingStatus: "confirmed",
        ownerId: { $exists: true, $ne: null },
      })
      .toArray();

    console.log(
      `📊 Found ${confirmedBookings.length} confirmed bookings with ownerId`
    );

    let createdCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    for (const booking of confirmedBookings) {
      try {
        // Check if notification already exists
        const existingNotification = await notificationsCollection.findOne({
          bookingId: booking._id,
        });

        if (existingNotification) {
          skippedCount++;
          continue;
        }

        // Get property name
        let propertyName = "Property";
        try {
          const isHotel = !!booking.hotelId;
          const collection = isHotel ? hotelsCollection : homestaysCollection;
          if (booking.hotelId || booking.homestayId) {
            const propertyId = booking.hotelId || booking.homestayId;
            const property = await collection.findOne({
              _id: new ObjectId(propertyId),
            });
            if (property) {
              propertyName = property.name || property.propertyName || "Property";
            }
          }
        } catch (err) {
          console.error("  ⚠️  Error fetching property name:", err.message);
        }

        // Create notification
        const result = await notificationsCollection.insertOne({
          ownerId: new ObjectId(booking.ownerId),
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
          createdAt: new Date(),
        });

        createdCount++;
        console.log(
          `✅ Notification created for: ${booking.guestName} @ ${propertyName}`
        );
      } catch (err) {
        console.error(
          `❌ Error creating notification for booking ${booking._id}:`,
          err.message
        );
        errorCount++;
      }
    }

    console.log("\n📈 Summary:");
    console.log(`  Total bookings processed: ${confirmedBookings.length}`);
    console.log(`  Notifications created: ${createdCount}`);
    console.log(`  Already had notifications: ${skippedCount}`);
    console.log(`  Errors: ${errorCount}`);

    if (createdCount > 0) {
      console.log(`\n🎉 Successfully created ${createdCount} notifications!`);
    }
  } catch (error) {
    console.error("❌ Migration error:", error);
  } finally {
    await client.close();
  }
}

// Run if called directly
if (require.main === module) {
  generateMissingNotifications().catch(console.error);
}

module.exports = { generateMissingNotifications };
