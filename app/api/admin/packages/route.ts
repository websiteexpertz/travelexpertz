import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

// GET - Fetch all packages
export async function GET() {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const packagesCollection = db.collection("packages");

    const packages = await packagesCollection.find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json(packages);
  } catch (error) {
    console.error("Error fetching packages:", error);
    return NextResponse.json({ error: "Failed to fetch packages" }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}

// POST - Create new package
export async function POST(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const packagesCollection = db.collection("packages");

    // Create package document with all fields in single collection
    const packageDocument = {
      // Basic Details
      title: body.title || "",
      duration: body.duration || "",
      startingPoint: body.startingPoint || "",
      category: body.category || "",
      badge: body.badge || "",
      description: body.description || "",
      image: body.image || "",
      price: body.price || null, // null means "Enquire for price"
      currency: body.currency || "INR",
      featured: body.featured || false,
      active: body.active !== false,
      
      // Deep Details
      fullDescription: body.fullDescription || "",
      importantNotes: body.importantNotes || [],
      itinerary: body.itinerary || [],
      gallery: body.gallery || [],
      inclusions: body.inclusions || [],
      exclusions: body.exclusions || [],
      thingsToCarry: body.thingsToCarry || [],
      refundTiers: body.refundTiers || [],
      refundPolicyNotes: body.refundPolicyNotes || "",
      customFields: body.customFields || [],
      
      // Timestamps
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await packagesCollection.insertOne(packageDocument);

    return NextResponse.json(
      { message: "Package created successfully", id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating package:", error);
    return NextResponse.json({ error: "Failed to create package" }, { status: 500 });
  } finally {
    if (client) {
      await client.close();
    }
  }
}
