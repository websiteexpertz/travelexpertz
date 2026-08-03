import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json(
        { error: "Database not configured", data: { states: [], cities: [] } },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const state = searchParams.get("state");

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const hotelsCollection = db.collection("hotels");

    // Get unique states from active hotels
    const states = await hotelsCollection
      .aggregate([
        { $match: { active: { $ne: false }, state: { $exists: true, $ne: "" } } },
        { $group: { _id: "$state" } },
        { $sort: { _id: 1 } },
      ])
      .toArray();

    if (state) {
      // Get cities for specific state
      const cities = await hotelsCollection
        .aggregate([
          {
            $match: {
              active: { $ne: false },
              state: state,
              city: { $exists: true, $ne: "" },
            },
          },
          { $group: { _id: "$city" } },
          { $sort: { _id: 1 } },
        ])
        .toArray();

      return NextResponse.json({
        state: state,
        cities: cities.map((c: any) => c._id),
      });
    }

    return NextResponse.json({
      states: states.map((s: any) => s._id),
    });
  } catch (error) {
    console.error("Error fetching hotel cities/states:", error);
    return NextResponse.json(
      { error: "Failed to fetch data", data: { states: [], cities: [] } },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
