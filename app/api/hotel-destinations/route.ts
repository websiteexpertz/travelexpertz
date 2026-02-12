import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

// Helper function to generate slug
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 10)
    + Math.random().toString(36).substring(2, 7);
}

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json(
        { error: "Database not configured", data: [] },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const country = searchParams.get("country");
    const state = searchParams.get("state");
    const city = searchParams.get("city");

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const destinationsCollection = db.collection("hotel_destinations");

    // Get single destination by ID
    if (id) {
      let destination;
      
      // Try ObjectId first
      try {
        destination = await destinationsCollection.findOne({
          _id: new ObjectId(id),
        });
      } catch (e) {
        // If ObjectId parsing fails, try string match (slug)
        destination = await destinationsCollection.findOne({
          slug: id,
        });
      }
      
      if (!destination) {
        return NextResponse.json(
          { error: "Destination not found" },
          { status: 404 }
        );
      }
      return NextResponse.json(destination);
    }

    // Get hierarchical data based on filters
    let query: any = {};
    if (country) query.country = country;
    if (state) query.state = state;
    if (city) query.city = city;

    const destinations = await destinationsCollection
      .find(query)
      .sort({ country: 1, state: 1, city: 1, area: 1 })
      .toArray();

    return NextResponse.json(destinations);
  } catch (error) {
    console.error("Error fetching hotel destinations:", error);
    return NextResponse.json(
      { error: "Failed to fetch destinations" },
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
    const destinationsCollection = db.collection("hotel_destinations");

    const now = new Date();
    const slug = generateSlug(body.stateName + " " + body.cityName);
    
    const result = await destinationsCollection.insertOne({
      ...body,
      slug,
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

export async function PUT(request: NextRequest) {
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
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    
    // Remove _id from the body to prevent updating immutable field
    const { _id, ...updateData } = body;
    
    // Generate or update slug
    const slug = updateData.slug || generateSlug(updateData.stateName + " " + updateData.cityName);
    
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const destinationsCollection = db.collection("hotel_destinations");

    const result = await destinationsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          ...updateData,
          slug,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "Destination not found" },
        { status: 404 }
      );
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

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID is required" },
        { status: 400 }
      );
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const destinationsCollection = db.collection("hotel_destinations");

    const result = await destinationsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Destination not found" },
        { status: 404 }
      );
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
