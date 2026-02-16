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
 * POST /api/admin/auto-link-bookings
 * Automatically link bookings to properties and their owners
 * Scans all bookings without ownerId and tries to find the property's owner
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
    const homestaysCollection = db.collection("homestays");
    const hotelsCollection = db.collection("hotels");
    const ownerPropertiesCollection = db.collection("ownerproperties");

    console.log("[Auto-Link] Starting automatic linking of bookings...");

    // Find all bookings
    const bookings = await bookingsCollection.find({}).toArray();
    console.log(`[Auto-Link] Found ${bookings.length} total bookings`);

    let linkedCount = 0;
    let alreadyLinkedCount = 0;
    let failedCount = 0;

    for (const booking of bookings) {
      try {
        // Skip if already has ownerId
        if (booking.ownerId) {
          alreadyLinkedCount++;
          continue;
        }

        const propertyId = booking.hotelId || booking.homestayId;
        if (!propertyId) {
          console.warn(`[Auto-Link] Booking ${booking._id} has no propertyId`);
          failedCount++;
          continue;
        }

        let ownerId = null;

        // Check ownerproperties first
        const ownerProp = await ownerPropertiesCollection.findOne({
          _id: new ObjectId(propertyId),
        });

        if (ownerProp && ownerProp.ownerId) {
          ownerId = ownerProp.ownerId;
        } else {
          // Check homestays/hotels
          const isHotel = !!booking.hotelId;
          const collection = isHotel ? hotelsCollection : homestaysCollection;
          const property = await collection.findOne({
            _id: new ObjectId(propertyId),
          });

          if (property && property.ownerId) {
            ownerId = property.ownerId;
          }
        }

        if (ownerId) {
          await bookingsCollection.updateOne(
            { _id: booking._id },
            { $set: { ownerId: new ObjectId(ownerId) } }
          );
          linkedCount++;
          console.log(`[Auto-Link] Linked booking ${booking._id}`);
        } else {
          console.warn(
            `[Auto-Link] Could not find owner for booking ${booking._id}`
          );
          failedCount++;
        }
      } catch (err) {
        console.error(`[Auto-Link] Error processing booking:`, err);
        failedCount++;
      }
    }

    const summary = {
      success: true,
      total: bookings.length,
      linked: linkedCount,
      alreadyLinked: alreadyLinkedCount,
      failed: failedCount,
      message: `Processed ${bookings.length} bookings: ${linkedCount} newly linked, ${alreadyLinkedCount} already linked, ${failedCount} failed`,
    };

    console.log(`[Auto-Link] Complete:`, summary);

    return NextResponse.json(summary);
  } catch (error) {
    console.error("Auto-link error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Auto-link failed" },
      { status: 500 }
    );
  }
}
