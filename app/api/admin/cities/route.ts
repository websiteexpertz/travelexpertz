import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

export const dynamic = "force-dynamic";

function generateSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 15) +
    "-" +
    Math.random().toString(36).substring(2, 6)
  );
}

// GET: list cities for a state
export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { searchParams } = new URL(request.url);
    const stateName = searchParams.get("state")?.trim() || "";
    const countryName = searchParams.get("country")?.trim() || "India";

    const db = await getDb();
    const collection = db.collection("hotel_destinations");

    const query: any = {};
    if (stateName) {
      query.stateName = { $regex: new RegExp(`^${stateName}$`, "i") };
    }
    if (countryName) {
      query.$or = [
        { country: { $regex: new RegExp(`^${countryName}$`, "i") } },
        { country: { $exists: false } },
        { country: null },
      ];
    }

    const cityDocs = await collection
      .find(query)
      .project({
        cityName: 1,
        stateName: 1,
        country: 1,
        active: 1,
        slug: 1,
        createdAt: 1,
        updatedAt: 1,
      })
      .sort({ cityName: 1 })
      .toArray();

    // Deduplicate cities by name
    const seen = new Set<string>();
    const cities: any[] = [];

    for (const doc of cityDocs) {
      const cName = doc.cityName?.trim();
      if (!cName) continue;
      const key = `${doc.stateName?.toLowerCase()}__${cName.toLowerCase()}`;
      if (seen.has(key)) continue;
      seen.add(key);

      cities.push({
        _id: doc._id.toString(),
        name: cName,
        cityName: cName,
        stateName: doc.stateName,
        countryName: doc.country || "India",
        active: doc.active !== false,
        slug: doc.slug || cName.toLowerCase().replace(/\s+/g, "-"),
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
      });
    }

    return NextResponse.json({ cities, total: cities.length });
  } catch (error) {
    console.error("Error fetching admin cities:", error);
    return NextResponse.json(
      { error: "Failed to fetch cities", cities: [] },
      { status: 500 }
    );
  }
}

// POST: create a new city
export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const cityName = body.cityName?.trim() || body.name?.trim() || "";
    const stateName = body.stateName?.trim() || "";
    const countryName = body.countryName?.trim() || body.country?.trim() || "India";
    const active = body.active !== undefined ? Boolean(body.active) : true;

    if (!cityName) {
      return NextResponse.json({ error: "City name is required." }, { status: 400 });
    }
    if (!stateName) {
      return NextResponse.json({ error: "State name is required." }, { status: 400 });
    }

    const db = await getDb();
    const collection = db.collection("hotel_destinations");

    // Check for duplicate city within the same state
    const existing = await collection.findOne({
      stateName: { $regex: new RegExp(`^${stateName}$`, "i") },
      cityName: { $regex: new RegExp(`^${cityName}$`, "i") },
    });

    if (existing) {
      return NextResponse.json(
        { error: `City "${cityName}" already exists under ${stateName}.` },
        { status: 409 }
      );
    }

    const now = new Date();
    const slug = body.slug?.trim() || generateSlug(`${stateName} ${cityName}`);

    const newCityDoc = {
      country: countryName,
      stateName,
      cityName,
      slug,
      active,
      cityData: {
        thingsToDo: [],
        famousCafes: [],
        famousAttractions: [],
        shopping: [],
      },
      areas: [],
      createdAt: now,
      updatedAt: now,
    };

    const result = await collection.insertOne(newCityDoc);

    return NextResponse.json(
      {
        message: "City created successfully.",
        city: {
          _id: result.insertedId.toString(),
          name: cityName,
          cityName,
          stateName,
          countryName,
          slug,
          active,
          createdAt: now,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating city:", error);
    return NextResponse.json({ error: "Failed to create city." }, { status: 500 });
  }
}
