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
 * GET /api/owner/debug
 * Debug endpoint to see owner's data
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
    
    // Get owner info
    const propertyownersCollection = db.collection("propertyowners");
    const owner = await propertyownersCollection.findOne({
      _id: new ObjectId(user.userId),
    });

    // Get owner properties
    const ownerPropertiesCollection = db.collection("ownerproperties");
    const ownerProperties = await ownerPropertiesCollection
      .find({ ownerId: new ObjectId(user.userId) })
      .toArray();

    // Get bookings with ownerId
    const bookingsCollection = db.collection("bookings");
    const bookingsWithOwnerId = await bookingsCollection
      .find({ ownerId: new ObjectId(user.userId) })
      .limit(5)
      .toArray();

    // Get all bookings (to see if any exist)
    const totalBookings = await bookingsCollection.countDocuments({});

    // Get homestays (check if they have ownerId)
    const homestaysCollection = db.collection("homestays");
    const homestays = await homestaysCollection.find({}).limit(3).toArray();

    // Get hotels (check if they have ownerId)
    const hotelsCollection = db.collection("hotels");
    const hotels = await hotelsCollection.find({}).limit(3).toArray();

    return NextResponse.json({
      owner: owner ? { _id: owner._id, ownerName: owner.ownerName, email: owner.email } : null,
      ownerProperties: ownerProperties.map((p) => ({
        _id: p._id,
        ownerId: p.ownerId,
        name: p.propertyName || p.name,
      })),
      bookingsWithOwnerId: bookingsWithOwnerId.map((b) => ({
        _id: b._id,
        ownerId: b.ownerId,
        guestName: b.guestName,
        hotelId: b.hotelId,
        homestayId: b.homestayId,
      })),
      totalBookings,
      homestaysSample: homestays.map((h) => ({
        _id: h._id,
        name: h.name,
        ownerId: h.ownerId,
      })),
      hotelsSample: hotels.map((h) => ({
        _id: h._id,
        name: h.name,
        ownerId: h.ownerId,
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
