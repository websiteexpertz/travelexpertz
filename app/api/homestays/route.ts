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
        { error: "Database not configured", homestays: [] },
        { status: 503 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const admin = searchParams.get("admin") === "true";

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const homestaysCollection = db.collection("homestays");
    const ownerPropertiesCollection = db.collection("ownerproperties");

    // If ID is provided, fetch single homestay (built-in or owner property)
    if (id) {
      const query = admin
        ? { _id: new ObjectId(id) }
        : { _id: new ObjectId(id), active: true };

      // Try built-in collection first
      const homestay = await homestaysCollection.findOne(query);
      if (homestay) {
        return NextResponse.json(homestay);
      }

      // Try owner properties (approved homestays)
      const ownerHomestay = await ownerPropertiesCollection.findOne({
        _id: new ObjectId(id),
        status: "approved",
        $or: [
          { type: "homestay" },
          { type: "Homestay" },
          { propertyType: "homestay" },
          { propertyType: "Homestay" },
        ],
      });

      if (!ownerHomestay) {
        return NextResponse.json({ error: "Homestay not found" }, { status: 404 });
      }

      const mappedOwnerHomestay = {
        ...ownerHomestay,
        name: ownerHomestay.propertyName || ownerHomestay.name,
        location: ownerHomestay.location || ownerHomestay.address || "",
        price:
          ownerHomestay.price ||
          ownerHomestay.rooms?.[0]?.price ||
          0,
        rating: ownerHomestay.rating || 4.5,
        reviews: ownerHomestay.reviews || 0,
        image: ownerHomestay.images?.[0] || ownerHomestay.image || "",
        amenities: Array.isArray(ownerHomestay.amenities)
          ? ownerHomestay.amenities
          : [],
        popular: Boolean(ownerHomestay.popular),
        active: true,
        propertyType:
          ownerHomestay.type || ownerHomestay.propertyType || "homestay",
      };

      return NextResponse.json(mappedOwnerHomestay);
    }

    // Otherwise, fetch all homestays (built-in + approved owner homestays)
    const query = admin ? {} : { active: true };
    const homestays = await homestaysCollection
      .find(query)
      .sort({ popular: -1, createdAt: -1 })
      .toArray();

    const ownerHomestays = await ownerPropertiesCollection
      .find({
        status: "approved",
        ...(admin ? {} : { active: true }),
        $or: [
          { type: "homestay" },
          { type: "Homestay" },
          { propertyType: "homestay" },
          { propertyType: "Homestay" },
        ],
      })
      .sort({ createdAt: -1 })
      .toArray();

    const mappedOwnerHomestays = ownerHomestays.map((p) => ({
      ...p,
      source: "owner",
      name: p.propertyName || p.name,
      location: p.location || p.address || "",
      price: p.price || p.rooms?.[0]?.price || 0,
      rating: p.rating || 4.5,
      reviews: p.reviews || 0,
      image: p.images?.[0] || p.image || "",
      amenities: Array.isArray(p.amenities) ? p.amenities : [],
      popular: Boolean(p.popular),
      active: true,
      propertyType: p.type || p.propertyType || "homestay",
      hostName: p.hostName || "",
      hostEmail: p.hostEmail || "",
      hostPhone: p.hostPhone || "",
    }));

    const allHomestays = [...homestays, ...mappedOwnerHomestays];

    return NextResponse.json(allHomestays);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Error fetching homestays:", errorMessage);
    return NextResponse.json(
      { error: "Failed to fetch homestays", details: errorMessage, homestays: [] },
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

    const { ObjectId } = await import("mongodb");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const body = await request.json();
    const { _id, source, ...updateData } = body;

    const homestayId = id || _id;
    if (!homestayId) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const homestaysCollection = db.collection("homestays");
    const ownerPropertiesCollection = db.collection("ownerproperties");

    // Determine which collection to update based on source parameter
    const collection = source === "owner" ? ownerPropertiesCollection : homestaysCollection;
    
    let result: any;
    if (source === "owner") {
      result = await collection.updateOne(
        { _id: new ObjectId(homestayId) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );
    } else {
      result = await homestaysCollection.findOneAndUpdate(
        { _id: new ObjectId(homestayId) },
        { $set: { ...updateData, updatedAt: new Date() } },
        { returnDocument: "after" }
      );
    }

    // If not found in intended collection, try the other one
    if (!result && source !== "owner") {
      result = await ownerPropertiesCollection.updateOne(
        { _id: new ObjectId(homestayId) },
        { $set: { ...updateData, updatedAt: new Date() } }
      );
    }

    if (!result || (result.matchedCount !== undefined && result.matchedCount === 0)) {
      return NextResponse.json(
        { error: "Homestay not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Homestay updated successfully" });
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
      console.error("MONGODB_URI is not configured");
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const source = searchParams.get("source") || "builtin";

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const homestaysCollection = db.collection("homestays");
    const ownerPropertiesCollection = db.collection("ownerproperties");

    // Determine which collection to delete from based on source parameter
    const collection = source === "owner" ? ownerPropertiesCollection : homestaysCollection;

    let result;
    try {
      result = await collection.deleteOne({
        _id: new ObjectId(id),
      });
      
      // If not found in intended collection, try the other one
      if (result.deletedCount === 0 && source !== "owner") {
        result = await ownerPropertiesCollection.deleteOne({
          _id: new ObjectId(id),
        });
      } else if (result.deletedCount === 0 && source === "owner") {
        result = await homestaysCollection.deleteOne({
          _id: new ObjectId(id),
        });
      }
    } catch (err) {
      console.error("ObjectId conversion or delete error:", err);
      return NextResponse.json(
        { error: "Invalid ID format or database error" },
        { status: 400 }
      );
    }

    if (result.deletedCount === 0) {
      console.warn(`Homestay not found with ID: ${id}`);
      return NextResponse.json(
        { error: "Homestay not found" },
        { status: 404 }
      );
    }

    console.log(`Homestay deleted successfully: ${id}`);
    return NextResponse.json({ message: "Homestay deleted successfully" });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Failed to delete homestay:", errorMessage);
    return NextResponse.json(
      { error: "Failed to delete homestay", details: errorMessage },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
