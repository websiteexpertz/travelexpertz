import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

// GET - Fetch single package by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { id } = await params;

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const packagesCollection = db.collection("packages");

    const packageItem = await packagesCollection.findOne({ _id: new ObjectId(id) });

    if (!packageItem) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json(packageItem);
  } catch (error) {
    console.error("Error fetching package:", error);
    return NextResponse.json({ error: "Failed to fetch package" }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// PUT - Update package
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { id } = await params;
    const body = await request.json();

    // Remove _id from update data
    const { _id, createdAt, ...updateData } = body;

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const packagesCollection = db.collection("packages");

    const result = await packagesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          // Basic Details
          title: updateData.title || "",
          duration: updateData.duration || "",
          startingPoint: updateData.startingPoint || "",
          category: updateData.category || "",
          badge: updateData.badge || "",
          description: updateData.description || "",
          image: updateData.image || "",
          price: updateData.price || null,
          currency: updateData.currency || "INR",
          featured: updateData.featured || false,
          active: updateData.active !== false,
          
          // Deep Details
          fullDescription: updateData.fullDescription || "",
          importantNotes: updateData.importantNotes || [],
          itinerary: updateData.itinerary || [],
          gallery: updateData.gallery || [],
          inclusions: updateData.inclusions || [],
          exclusions: updateData.exclusions || [],
          thingsToCarry: updateData.thingsToCarry || [],
          refundTiers: updateData.refundTiers || [],
          refundPolicyNotes: updateData.refundPolicyNotes || "",
          customFields: updateData.customFields || [],
          
          // Update timestamp
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Package updated successfully" });
  } catch (error) {
    console.error("Error updating package:", error);
    return NextResponse.json({ error: "Failed to update package" }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// DELETE - Delete package
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { id } = await params;

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const packagesCollection = db.collection("packages");

    const result = await packagesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Package deleted successfully" });
  } catch (error) {
    console.error("Error deleting package:", error);
    return NextResponse.json({ error: "Failed to delete package" }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
