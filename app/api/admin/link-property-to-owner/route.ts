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
 * POST /api/admin/link-property-to-owner
 * Link a homestay/hotel to an owner
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

    const body = await request.json();
    const { propertyId, ownerId, propertyType } = body;

    if (!propertyId || !ownerId || !propertyType) {
      return NextResponse.json(
        { error: "propertyId, ownerId, and propertyType are required" },
        { status: 400 }
      );
    }

    const db = await connectDB();

    // Update the property with ownerId
    const collection =
      propertyType === "hotel"
        ? db.collection("hotels")
        : db.collection("homestays");

    const result = await collection.updateOne(
      { _id: new ObjectId(propertyId) },
      { $set: { ownerId: new ObjectId(ownerId) } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Property not found" },
        { status: 404 }
      );
    }

    console.log(
      `[Admin] Linked ${propertyType} ${propertyId} to owner ${ownerId}`
    );

    return NextResponse.json({
      success: true,
      message: `Property linked to owner successfully`,
    });
  } catch (error) {
    console.error("Link property error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to link property" },
      { status: 500 }
    );
  }
}
