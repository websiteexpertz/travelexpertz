import { NextResponse, NextRequest } from "next/server";
import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json([], { status: 500 });
    }

    const adminView = request.nextUrl.searchParams.get("admin") === "true";

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const testimonialsCollection = db.collection("testimonials");

    const testimonials = adminView
      ? await testimonialsCollection
          .find({})
          .sort({ createdAt: -1 })
          .limit(200)
          .toArray()
      : await testimonialsCollection
          .aggregate([
            { $match: { verified: true } },
            { $sample: { size: 100 } }, // Get random testimonials
          ])
          .toArray();

    return NextResponse.json(testimonials);
  } catch (error) {
    console.error("Error fetching testimonials:", error);
    return NextResponse.json([], { status: 500 });
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
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const body = await request.json();
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const testimonialsCollection = db.collection("testimonials");

    const result = await testimonialsCollection.insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return NextResponse.json({ _id: result.insertedId, ...body }, { status: 201 });
  } catch (error) {
    console.error("Failed to create testimonial:", error);
    return NextResponse.json(
      { error: "Failed to create testimonial" },
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
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { ObjectId } = await import("mongodb");
    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ error: "Testimonial ID is required" }, { status: 400 });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const testimonialsCollection = db.collection("testimonials");

    const result = await testimonialsCollection.updateOne(
      { _id: new ObjectId(_id) },
      {
        $set: {
          ...updateData,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Testimonial updated successfully" });
  } catch (error) {
    console.error("Failed to update testimonial:", error);
    return NextResponse.json(
      { error: "Failed to update testimonial" },
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
      return NextResponse.json({ error: "Database not configured" }, { status: 500 });
    }

    const { ObjectId } = await import("mongodb");
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Testimonial ID is required" }, { status: 400 });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const testimonialsCollection = db.collection("testimonials");

    const result = await testimonialsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Testimonial not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Testimonial deleted successfully" });
  } catch (error) {
    console.error("Failed to delete testimonial:", error);
    return NextResponse.json(
      { error: "Failed to delete testimonial" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
