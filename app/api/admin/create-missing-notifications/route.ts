import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

function verifyToken(req: NextRequest) {
  let token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    token = req.cookies.get("accessToken")?.value;
  }
  if (!token) return null;
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;
    return decoded;
  } catch (error) {
    return null;
  }
}

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = "travelexpertz";

async function connectDB() {
  const client = new MongoClient(uri);
  await client.connect();
  return client.db(dbName);
}

/**
 * POST /api/admin/create-missing-notifications
 * Create notifications for confirmed bookings that don't have them
 * Admin only
 */
export async function POST(request: NextRequest) {
  try {
    const user = verifyToken(request);

    if (!user || user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized - Admin only" },
        { status: 401 }
      );
    }

    const db = await connectDB();
    const bookingsCollection = db.collection("bookings");
    const notificationsCollection = db.collection("owner_notifications");
    const homestaysCollection = db.collection("homestays");
    const hotelsCollection = db.collection("hotels");

    console.log("[Migration] Starting notification creation for confirmed bookings...");

    // Find all confirmed bookings with ownerId that don't have notifications
    const confirmedBookings = await bookingsCollection
      .find({
        bookingStatus: "confirmed",
        ownerId: { $exists: true, $ne: null },
      })
      .toArray();

    console.log(`[Migration] Found ${confirmedBookings.length} confirmed bookings with ownerId`);

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
            const property = await collection.findOne({ _id: new ObjectId(propertyId) });
            if (property) {
              propertyName = property.name || property.propertyName || "Property";
            }
          }
        } catch (err) {
          console.error("Error fetching property name:", err);
        }

        // Create notification
        await notificationsCollection.insertOne({
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
        console.log(`[Migration] Created notification for booking ${booking._id}`);
      } catch (err) {
        console.error(`[Migration] Error creating notification for booking ${booking._id}:`, err);
        errorCount++;
      }
    }

    const summary = {
      success: true,
      total: confirmedBookings.length,
      created: createdCount,
      skipped: skippedCount,
      errors: errorCount,
      message: `Processed ${confirmedBookings.length} bookings: ${createdCount} notifications created, ${skippedCount} already had notifications, ${errorCount} errors`,
    };

    console.log(`[Migration] Complete:`, summary);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Migration failed" },
      { status: 500 }
    );
  }
}
