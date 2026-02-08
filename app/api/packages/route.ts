import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      console.error("MONGODB_URI is not configured");
      return NextResponse.json(
        { error: "Database not configured", packages: [] },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const packagesCollection = db.collection("packages");

    // If ID is provided, fetch single package
    if (id) {
      const packageItem = await packagesCollection.findOne({
        _id: new ObjectId(id),
      });
      
      if (!packageItem) {
        return NextResponse.json({ error: "Package not found" }, { status: 404 });
      }
      
      return NextResponse.json(packageItem);
    }

    // Otherwise, fetch all active packages
    const packages = await packagesCollection
      .find({ active: { $ne: false } })
      .sort({ featured: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json(packages);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching packages:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch packages", details: errorMessage, packages: [] },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function POST(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const packagesCollection = db.collection("packages");

    const now = new Date();
    const result = await packagesCollection.insertOne({
      ...body,
      active: true,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ _id: result.insertedId, ...body }, { status: 201 });
  } catch (error) {
    console.error("Failed to create package:", error);
    return NextResponse.json(
      { error: "Failed to create package" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function PATCH(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Package ID required" }, { status: 400 });
    }

    const body = await request.json();
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const packagesCollection = db.collection("packages");

    const result = await packagesCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...body, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update package:", error);
    return NextResponse.json(
      { error: "Failed to update package" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function DELETE(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Package ID required" }, { status: 400 });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const packagesCollection = db.collection("packages");

    const result = await packagesCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Package not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete package:", error);
    return NextResponse.json(
      { error: "Failed to delete package" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
