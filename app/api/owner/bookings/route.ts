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
    const ownerPropertiesCollection = db.collection("ownerproperties");

    console.log(`[Owner Bookings] Fetching for userId: ${user.userId}`);

    // Method 1: Get bookings with ownerId directly
    let bookings = await bookingsCollection
      .find({
        ownerId: new ObjectId(user.userId),
      })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(`[Owner Bookings] Found ${bookings.length} bookings with ownerId`);

    // Method 2: If no bookings found with ownerId, try getting from owner properties
    if (bookings.length === 0) {
      try {
        const properties = await ownerPropertiesCollection
          .find({ ownerId: new ObjectId(user.userId) })
          .project({ _id: 1 })
          .toArray();

        console.log(`[Owner Bookings] Found ${properties.length} owner properties`);

        if (properties.length > 0) {
          const propertyIds = properties.map((p) => p._id);
          bookings = await bookingsCollection
            .find({
              $or: [
                { hotelId: { $in: propertyIds } },
                { homestayId: { $in: propertyIds } },
              ],
            })
            .sort({ createdAt: -1 })
            .toArray();

          console.log(`[Owner Bookings] Found ${bookings.length} bookings from properties`);
        }
      } catch (fallbackErr) {
        console.error("[Owner Bookings] Fallback query error:", fallbackErr);
      }
    }

    // Enrich bookings with property information
    const homestaysCollection = db.collection("homestays");
    const hotelsCollection = db.collection("hotels");

    const enrichedBookings = await Promise.all(
      bookings.map(async (booking: any) => {
        let propertyName = "Property";
        let propertyType = "Unknown";
        let roomDetails = "";
        let address = "";
        let city = "";
        let price = 0;
        let image = "";

        try {
          const propertyId = booking.hotelId || booking.homestayId;
          const isHotel = !!booking.hotelId;
          
          if (propertyId) {
            try {
              const collection = isHotel ? hotelsCollection : homestaysCollection;
              const property = await collection.findOne({ _id: new ObjectId(propertyId) });
              
              if (property) {
                propertyName = property.name || property.propertyName || property.hotelName || "Property";
                propertyType = isHotel ? "Hotel" : "Homestay";
                address = property.address || property.location || property.street || "";
                city = property.city || property.destination || "";
                image = property.image || property.images?.[0] || property.thumbnail || "";

                // Get room/property details
                if (isHotel) {
                  // For hotels, get room type and amenities
                  const roomType = property.roomType || property.room_type || "Standard";
                  roomDetails = `${roomType} Room`;
                  if (property.amenities && Array.isArray(property.amenities)) {
                    roomDetails += ` • ${property.amenities.slice(0, 2).join(", ")}`;
                  } else if (property.facilities && Array.isArray(property.facilities)) {
                    roomDetails += ` • ${property.facilities.slice(0, 2).join(", ")}`;
                  }
                  price = property.pricePerNight || property.price || booking.basePrice || 0;
                } else {
                  // For homestays, get bedroom/bathroom info
                  const bedrooms = property.bedrooms || property.beds || 0;
                  const bathrooms = property.bathrooms || property.baths || 0;
                  roomDetails = `${bedrooms}BR • ${bathrooms}BA`;
                  if (property.guests) {
                    roomDetails += ` • Max ${property.guests} guests`;
                  }
                  price = property.pricePerNight || property.price || booking.basePrice || 0;
                }
              } else {
                console.warn(`[Owner Bookings] Property not found: ${propertyId}`);
                propertyName = isHotel ? "Hotel" : "Homestay";
              }
            } catch (lookupErr) {
              console.error(`[Owner Bookings] Error looking up property ${propertyId}:`, lookupErr);
              propertyName = isHotel ? "Hotel" : "Homestay";
            }
          }
        } catch (err) {
          console.error("Error fetching property details:", err);
        }

        return {
          _id: booking._id,
          guestName: booking.guestName,
          propertyName: propertyName,
          propertyType: propertyType,
          roomDetails: roomDetails,
          address: address,
          city: city,
          image: image,
          pricePerNight: price,
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

    console.log(`[Owner Bookings] Returning ${enrichedBookings.length} enriched bookings`);

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
