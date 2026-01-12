import { NextResponse, NextRequest } from "next/server";
import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

export async function GET(request: NextRequest) {
  let client: MongoClient | null = null;
  try {
    if (!MONGODB_URI) {
      return NextResponse.json([], { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get("section");
    const admin = searchParams.get("admin") === "true";

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const aboutCollection = db.collection("abouts");

    let query: any = {};
    if (section) {
      query.section = section;
    }
    if (!admin) {
      query.active = true;
    }

    const aboutItems = await aboutCollection
      .find(query)
      .sort({ section: 1, order: 1 })
      .toArray();

    return NextResponse.json(aboutItems);
  } catch (error) {
    console.error("Error fetching about items:", error);
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
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const aboutCollection = db.collection("abouts");

    const result = await aboutCollection.insertOne({
      ...body,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const newItem = await aboutCollection.findOne({ _id: result.insertedId });

    return NextResponse.json(newItem, { status: 201 });
  } catch (error) {
    console.error("Error creating about item:", error);
    return NextResponse.json(
      { error: "Failed to create about item" },
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

    const body = await request.json();
    const { _id, ...updateData } = body;

    if (!_id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 });
    }

    client = new MongoClient(MONGODB_URI);
    await client.connect();

    const db = client.db(MONGODB_DB);
    const aboutCollection = db.collection("abouts");

    const result = await aboutCollection.findOneAndUpdate(
      { _id: new ObjectId(_id) },
      { $set: { ...updateData, updatedAt: new Date() } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "About item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating about item:", error);
    return NextResponse.json(
      { error: "Failed to update about item" },
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
    const aboutCollection = db.collection("abouts");

    const result = await aboutCollection.deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "About item not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "About item deleted successfully" });
  } catch (error) {
    console.error("Error deleting about item:", error);
    return NextResponse.json(
      { error: "Failed to delete about item" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
