import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { stateName, cityName } = body;

    if (!stateName || !stateName.trim()) {
      return NextResponse.json(
        { error: "State name is required" },
        { status: 400 }
      );
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const statesCollection = db.collection("hotel_destination_states");

    const result = await statesCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          stateName: stateName.trim(),
          cityName: cityName?.trim() || "",
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "State not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "State updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating state:", error);
    return NextResponse.json(
      { error: "Failed to update state", details: String(error) },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 503 }
      );
    }

    const { id } = await params;

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const statesCollection = db.collection("hotel_destination_states");

    const result = await statesCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "State not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { message: "State deleted successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting state:", error);
    return NextResponse.json(
      { error: "Failed to delete state", details: String(error) },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
