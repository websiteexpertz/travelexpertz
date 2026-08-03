import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json(
        { error: "Database not configured", data: [] },
        { status: 503 }
      );
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const statesCollection = db.collection("hotel_destination_states");

    // Get all states
    const states = await statesCollection
      .find({})
      .project({ stateName: 1 })
      .toArray();

    const stateNames = states.map((s: any) => s.stateName);
    
    // Remove duplicates - only return unique state names
    const uniqueStateNames = [...new Set(stateNames)];

    return NextResponse.json(uniqueStateNames);
  } catch (error) {
    console.error("Error fetching states:", error);
    return NextResponse.json(
      { error: "Failed to fetch states", data: [] },
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
        { status: 503 }
      );
    }

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

    // Check if state-city combination already exists (not just state)
    const existingState = await statesCollection.findOne({
      stateName: stateName.trim(),
      cityName: cityName?.trim() || "",
    });

    if (existingState) {
      return NextResponse.json(
        { error: `State-City combination "${stateName.trim()}-${cityName?.trim() || ""}" already exists` },
        { status: 400 }
      );
    }

    // Add new state
    const result = await statesCollection.insertOne({
      stateName: stateName.trim(),
      cityName: cityName?.trim() || "",
      createdAt: new Date(),
    });

    return NextResponse.json(
      { message: "State added successfully", id: result.insertedId },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error adding state:", error);
    return NextResponse.json(
      { error: "Failed to add state", details: String(error) },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
