import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = "travelexpertz";

async function connectDB() {
  const client = new MongoClient(uri);
  await client.connect();
  return client.db(dbName);
}

/**
 * GET /api/debug/bookings-by-email?email=xxx@xxx.com
 * Debug endpoint to check bookings for a specific email
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json(
        { error: "Email parameter required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const bookingsCollection = db.collection("bookings");
    const notificationsCollection = db.collection("owner_notifications");
    const homestaysCollection = db.collection("homestays");
    const hotelsCollection = db.collection("hotels");

    console.log(`[Debug] Searching for bookings with email: ${email}`);

    // Find all bookings for this guest email
    const bookings = await bookingsCollection
      .find({ guestEmail: email })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`[Debug] Found ${bookings.length} bookings for ${email}`);

    // Get details for each booking
    const bookingDetails = await Promise.all(
      bookings.map(async (booking: any) => {
        let propertyName = "Unknown";
        let propertyOwner = "Unknown";

        try {
          const isHotel = !!booking.hotelId;
          const collection = isHotel ? hotelsCollection : homestaysCollection;
          const propertyId = booking.hotelId || booking.homestayId;

          const property = await collection.findOne({ _id: propertyId });
          if (property) {
            propertyName = property.name || property.propertyName || "Unknown";
          }
        } catch (err) {
          console.error("Error fetching property:", err);
        }

        // Check if notification exists for this booking
        const notification = await notificationsCollection.findOne({
          bookingId: booking._id,
        });

        return {
          _id: booking._id,
          guestName: booking.guestName,
          guestEmail: booking.guestEmail,
          propertyName: propertyName,
          hotelId: booking.hotelId || null,
          homestayId: booking.homestayId || null,
          ownerId: booking.ownerId || null,
          checkin: booking.checkin,
          checkout: booking.checkout,
          guests: booking.guests,
          nights: booking.nights,
          totalPrice: booking.totalPrice,
          bookingStatus: booking.bookingStatus,
          paymentStatus: booking.paymentStatus,
          createdAt: booking.createdAt,
          hasNotification: !!notification,
          notificationCreatedAt: notification?.createdAt || null,
        };
      })
    );

    // Check if any notifications exist for these bookings
    const allNotifications = await notificationsCollection
      .find({
        bookingId: {
          $in: bookings.map((b) => b._id),
        },
      })
      .toArray();

    return NextResponse.json({
      email,
      totalBookings: bookings.length,
      bookings: bookingDetails,
      totalNotifications: allNotifications.length,
      notifications: allNotifications.map((n) => ({
        _id: n._id,
        ownerId: n.ownerId,
        bookingId: n.bookingId,
        type: n.type,
        title: n.title,
        isRead: n.isRead,
        createdAt: n.createdAt,
      })),
    });
  } catch (error) {
    console.error("Debug error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Debug failed" },
      { status: 500 }
    );
  }
}
