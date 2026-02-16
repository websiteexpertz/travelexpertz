import { NextRequest, NextResponse } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      console.error("MONGODB_URI is not configured");
      return NextResponse.json(
        { error: "Database not configured", hotels: [] },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const admin = searchParams.get("admin") === "true";

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const hotelsCollection = db.collection("hotels");
    const ownerPropertiesCollection = db.collection("ownerproperties");

    // If ID is provided, fetch single hotel (exclude homestays)
    if (id) {
      const { ObjectId } = await import("mongodb");

      // Try to find in built-in hotels first
      let hotel = await hotelsCollection.findOne({
        _id: new ObjectId(id),
        ...(admin ? {} : { active: true }),
      });

      // If not found, try approved owner properties that are hotels only
      if (!hotel) {
        hotel = await ownerPropertiesCollection.findOne({
          _id: new ObjectId(id),
          status: "approved",
          $or: [
            { type: "hotel" },
            { type: "Hotel" },
            { propertyType: "hotel" },
            { propertyType: "Hotel" },
          ],
        });
      }

      if (!hotel) {
        return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
      }

      // Format owner property to match hotel format if needed
      if (!hotel.active && hotel.status === "approved") {
        hotel.name = hotel.propertyName || hotel.name;
        hotel.image = hotel.images?.[0] || hotel.image || "";
        hotel.rating = hotel.rating || 4.5;
        hotel.reviews = hotel.reviews || 0;
        hotel.propertyType = hotel.type || hotel.propertyType || "hotel";
        hotel.type = hotel.type || hotel.propertyType || "hotel";
      }

      return NextResponse.json(hotel);
    }

    // Otherwise, fetch all hotels from built-in collection
    const builtInHotels = await hotelsCollection
      .find(admin ? {} : { active: true })
      .sort({ popular: -1, createdAt: -1 })
      .toArray();

    // Also fetch approved owner properties that are hotels (exclude homestays)
    const ownerProperties = await ownerPropertiesCollection
      .find({
        status: "approved",
        ...(admin ? {} : { active: true }),
        $or: [
          { type: "hotel" },
          { type: "Hotel" },
          { propertyType: "hotel" },
          { propertyType: "Hotel" },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    // Combine and sort by featured (popular first, then by creation date)
    const allHotels = [
      ...builtInHotels.map((h) => ({
        ...h,
        source: "builtin",
        propertyType: "hotel",
        type: "hotel",
      })),
      ...ownerProperties.map((p) => ({
        ...p,
        source: "owner",
        name: p.propertyName || p.name,
        image: p.images?.[0] || p.image || "",
        amenities: p.amenities || [],
        rating: p.rating || 4.5,
        reviews: p.reviews || 0,
        propertyType: p.type || p.propertyType || "hotel",
        type: p.type || p.propertyType || "hotel",
      })),
    ];

    return NextResponse.json(allHotels);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching hotels:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch hotels", details: errorMessage, hotels: [] },
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();
    const { _id, source, ...updateData } = body;

    const hotelId = id || _id;
    if (!hotelId) {
      return NextResponse.json({ error: "Hotel ID is required" }, { status: 400 });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const hotelsCollection = db.collection("hotels");
    const ownerPropertiesCollection = db.collection("ownerproperties");

    // Determine which collection to update based on source parameter
    const collection = source === "owner" ? ownerPropertiesCollection : hotelsCollection;
    
    const result = await collection.updateOne(
      { _id: new ObjectId(hotelId) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    // If not found in intended collection, try the other one
    if (result.matchedCount === 0 && source !== "owner") {
      const result2 = await ownerPropertiesCollection.updateOne(
        { _id: new ObjectId(hotelId) },
        {
          $set: {
            ...updateData,
            updatedAt: new Date(),
          },
        }
      );
      if (result2.matchedCount === 0) {
        return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
      }
      return NextResponse.json({ message: "Hotel updated successfully" });
    }

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
    const source = searchParams.get("source") || "builtin";

    if (!id) {
      return NextResponse.json({ error: "Hotel ID is required" }, { status: 400 });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const hotelsCollection = db.collection("hotels");
    const ownerPropertiesCollection = db.collection("ownerproperties");

    // Determine which collection to delete from based on source parameter
    const collection = source === "owner" ? ownerPropertiesCollection : hotelsCollection;
    
    let result = await collection.deleteOne({ _id: new ObjectId(id) });

    // If not found in intended collection, try the other one
    if (result.deletedCount === 0 && source !== "owner") {
      result = await ownerPropertiesCollection.deleteOne({ _id: new ObjectId(id) });
    } else if (result.deletedCount === 0 && source === "owner") {
      result = await hotelsCollection.deleteOne({ _id: new ObjectId(id) });
    }

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
