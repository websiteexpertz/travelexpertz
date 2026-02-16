import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

// Middleware to verify token
function verifyToken(req: NextRequest) {
  let token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) {
    token = req.cookies.get("accessToken")?.value;
  }

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
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
 * GET /api/owner/bookings
 * Fetch all bookings for owner's properties
 */
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);

    if (!user || !user.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = await connectDB();
    const bookingsCollection = db.collection("bookings");

    // Get all bookings where ownerId matches
    const bookings = await bookingsCollection
      .find({
        ownerId: new ObjectId(user.userId),
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Enrich bookings with property information
    const homestaysCollection = db.collection("homestays");
    const hotelsCollection = db.collection("hotels");

    const enrichedBookings = await Promise.all(
      bookings.map(async (booking: any) => {
        let propertyName = "Property";
        try {
          const propertyId = booking.hotelId || booking.homestayId;
          if (propertyId) {
            const collection = booking.hotelId ? hotelsCollection : homestaysCollection;
            const property = await collection.findOne({ _id: new ObjectId(propertyId) });
            if (property) {
              propertyName = property.name || property.propertyName || "Property";
            }
          }
        } catch (err) {
          console.error("Error fetching property name:", err);
        }

        return {
          _id: booking._id,
          guestName: booking.guestName,
          propertyName: propertyName,
          checkin: booking.checkin,
          checkout: booking.checkout,
          guests: booking.guests,
          nights: booking.nights,
          totalPrice: booking.totalPrice,
          bookingStatus: booking.bookingStatus,
          createdAt: booking.createdAt,
        };
      })
    );

    return NextResponse.json({
      bookings: enrichedBookings,
      total: enrichedBookings.length,
    });
  } catch (error) {
    console.error("Error fetching bookings:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
