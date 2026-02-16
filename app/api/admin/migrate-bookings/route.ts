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
 * POST /api/admin/migrate-bookings
 * Migrate existing bookings to populate ownerId field
 * Admin-only endpoint
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
    const ownerPropertiesCollection = db.collection("ownerproperties");
    const homestaysCollection = db.collection("homestays");
    const hotelsCollection = db.collection("hotels");

    console.log("[Migration] Starting booking owner migration...");

    // Find all bookings without ownerId
    const bookingsToMigrate = await bookingsCollection
      .find({ ownerId: { $exists: false } })
      .toArray();

    console.log(`[Migration] Found ${bookingsToMigrate.length} bookings to migrate`);

    let migratedCount = 0;
    let errorCount = 0;

    for (const booking of bookingsToMigrate) {
      try {
        const propertyId = booking.hotelId || booking.homestayId;
        if (!propertyId) {
          console.warn(`[Migration] Booking ${booking._id} has no propertyId`);
          errorCount++;
          continue;
        }

        let ownerId = null;

        // Check in ownerproperties first
        const ownerProperty = await ownerPropertiesCollection.findOne({
          _id: new ObjectId(propertyId),
        });

        if (ownerProperty && ownerProperty.ownerId) {
          ownerId = ownerProperty.ownerId;
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
          migratedCount++;
          console.log(`[Migration] Updated booking ${booking._id} with ownerId`);
        } else {
          console.warn(
            `[Migration] Could not find owner for booking ${booking._id} (property: ${propertyId})`
          );
          errorCount++;
        }
      } catch (err) {
        console.error(`[Migration] Error migrating booking:`, err);
        errorCount++;
      }
    }

    console.log(
      `[Migration] Migration complete - ${migratedCount} migrated, ${errorCount} errors`
    );

    return NextResponse.json({
      success: true,
      message: "Migration completed",
      total: bookingsToMigrate.length,
      migrated: migratedCount,
      errors: errorCount,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return NextResponse.json(
      { error: "Migration failed" },
      { status: 500 }
    );
  }
}
