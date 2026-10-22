import { MongoClient, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "travelexpertz";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    const body = await request.json();
    const { title, description, categories, image, date } = body;

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const blogsCollection = db.collection("blogs");

    console.log(`Attempting to update blog with ID: ${id}`);

    const result = await blogsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      {
        $set: {
          title,
          description,
          categories: categories || [],
          image: image || "",
          date: date ? new Date(date) : new Date(),
          updatedAt: new Date(),
        },
      },
      { returnDocument: "after" }
    );

    await client.close();

    if (!result || !result.value) {
      console.error(`Blog not found with ID: ${id}`);
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(result.value);
  } catch (error) {
    console.error("Error updating blog:", error);
    return NextResponse.json(
      { error: "Failed to update blog", details: String(error) },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const { id } = await params;
    
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const blogsCollection = db.collection("blogs");

    console.log(`Attempting to delete blog with ID: ${id}`);

    const result = await blogsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    await client.close();

    if (result.deletedCount === 0) {
      console.error(`Blog not found with ID: ${id}`);
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting blog:", error);
    return NextResponse.json(
      { error: "Failed to delete blog", details: String(error) },
      { status: 500 }
    );
  }
}
