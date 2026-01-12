import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json([], { status: 200 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const hotelsCollection = db.collection("hotels");

    // If ID is provided, fetch single hotel
    if (id) {
      const { ObjectId } = await import("mongodb");
      const hotel = await hotelsCollection.findOne({ 
        _id: new ObjectId(id),
        active: true 
      });
      
      if (!hotel) {
        return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
      }
      
      return NextResponse.json(hotel);
    }

    // Otherwise, fetch all hotels
    const hotels = await hotelsCollection
      .find({ active: true })
      .sort({ popular: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json(hotels);
  } catch (error) {
    console.error("Error fetching hotels:", error);
    return NextResponse.json([], { status: 200 });
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
    const hotelsCollection = db.collection("hotels");

    const now = new Date();
    const result = await hotelsCollection.insertOne({
      ...body,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({ _id: result.insertedId, ...body }, { status: 201 });
  } catch (error) {
    console.error("Failed to create hotel:", error);
    return NextResponse.json(
      { error: "Failed to create hotel" },
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

    const { ObjectId } = await import("mongodb");
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ error: "Hotel ID is required" }, { status: 400 });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const hotelsCollection = db.collection("hotels");

    const result = await hotelsCollection.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Hotel updated successfully" });
  } catch (error) {
    console.error("Failed to update hotel:", error);
    return NextResponse.json(
      { error: "Failed to update hotel" },
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

    const { ObjectId } = await import("mongodb");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Hotel ID is required" }, { status: 400 });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const hotelsCollection = db.collection("hotels");

    const result = await hotelsCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Hotel deleted successfully" });
  } catch (error) {
    console.error("Failed to delete hotel:", error);
    return NextResponse.json(
      { error: "Failed to delete hotel" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
