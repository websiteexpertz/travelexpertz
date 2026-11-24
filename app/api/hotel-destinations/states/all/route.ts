import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

export async function GET(request: NextRequest) {
  try {
    const db = await getDb(MONGODB_DB);
    const statesCollection = db.collection("hotel_destination_states");

    // Get all states with full data
    const states = await statesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    const formattedStates = states.map((s: any) => ({
      _id: s._id.toString(),
      stateName: s.stateName,
      cityName: s.cityName || "",
      createdAt: s.createdAt?.toISOString() || "",
    }));

    return NextResponse.json(formattedStates);
  } catch (error) {
    console.error("Error fetching all states:", error);
    return NextResponse.json(
      { error: "Failed to fetch states" },
      { status: 500 }
    );
  }
}
