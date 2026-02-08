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
        { error: "Database not configured", destinations: [] },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const all = searchParams.get("all"); // For admin - fetch all including inactive

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const destinationsCollection = db.collection("destinations");

    // If ID is provided, fetch single destination
    if (id) {
      const destination = await destinationsCollection.findOne({
        _id: new ObjectId(id),
      });

      if (!destination) {
        return NextResponse.json({ error: "Destination not found" }, { status: 404 });
      }

      return NextResponse.json(destination);
    }

    // Otherwise, fetch destinations (all for admin, active only for public)
    const query = all === "true" ? {} : { active: { $ne: false } };
    const destinations = await destinationsCollection
      .find(query)
      .sort({ order: 1, name: 1 })
      .toArray();

    return NextResponse.json(destinations);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching destinations:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch destinations", details: errorMessage, destinations: [] },
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
    const destinationsCollection = db.collection("destinations");

    const now = new Date();
    const result = await destinationsCollection.insertOne({
      ...body,
      active: true,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ _id: result.insertedId, ...body }, { status: 201 });
  } catch (error) {
    console.error("Failed to create destination:", error);
    return NextResponse.json(
      { error: "Failed to create destination" },
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

    const body = await request.json();
    console.log("PATCH body received:", body);
    const id = body.id;

    if (!id) {
      console.log("No ID found in body");
      return NextResponse.json({ error: "Destination ID required" }, { status: 400 });
    }

    // Remove id and _id from the update payload (MongoDB doesn't allow updating _id)
    const { id: _id1, _id: _id2, ...updateData } = body;
    console.log("Update data:", updateData);

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const destinationsCollection = db.collection("destinations");

    const result = await destinationsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updateData, updatedAt: new Date() } }
    );

    console.log("Update result:", result);

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to update destination:", error);
    return NextResponse.json(
      { error: "Failed to update destination" },
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

    const body = await request.json();
    const id = body.id;

    if (!id) {
      return NextResponse.json({ error: "Destination ID required" }, { status: 400 });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const destinationsCollection = db.collection("destinations");

    const result = await destinationsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Destination not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete destination:", error);
    return NextResponse.json(
      { error: "Failed to delete destination" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
