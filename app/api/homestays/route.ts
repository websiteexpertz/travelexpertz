import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

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
    const admin = searchParams.get("admin") === "true";

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const homestaysCollection = db.collection("homestays");

    // If ID is provided, fetch single homestay
    if (id) {
      const query = admin ? { _id: new ObjectId(id) } : { _id: new ObjectId(id), active: true };
      const homestay = await homestaysCollection.findOne(query);
      
      if (!homestay) {
        return NextResponse.json({ error: "Homestay not found" }, { status: 404 });
      }
      
      return NextResponse.json(homestay);
    }

    // Otherwise, fetch all homestays
    const query = admin ? {} : { active: true };
    const homestays = await homestaysCollection
      .find(query)
      .sort({ popular: -1, createdAt: -1 })
      .toArray();

    return NextResponse.json(homestays);
  } catch (error) {
    console.error("Error fetching homestays:", error);
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
    const homestaysCollection = db.collection("homestays");

    const now = new Date();
    const result = await homestaysCollection.insertOne({
      ...body,
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json(
      { _id: result.insertedId, ...body },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create homestay:", error);
    return NextResponse.json(
      { error: "Failed to create homestay" },
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
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const homestaysCollection = db.collection("homestays");

    const result = await homestaysCollection.findOneAndUpdate(
      { _id: new ObjectId(_id) },
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Homestay not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update homestay:", error);
    return NextResponse.json(
      { error: "Failed to update homestay" },
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
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const homestaysCollection = db.collection("homestays");

    const result = await homestaysCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Homestay not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Homestay deleted successfully" });
  } catch (error) {
    console.error("Failed to delete homestay:", error);
    return NextResponse.json(
      { error: "Failed to delete homestay" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
