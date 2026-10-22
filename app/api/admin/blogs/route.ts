import { MongoClient, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/admin-auth";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "travelexpertz";

export async function GET(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const blogsCollection = db.collection("blogs");

    const blogs = await blogsCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    await client.close();

    return NextResponse.json({
      blogs,
      total: blogs.length,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const unauthorized = requireAdmin(request);
  if (unauthorized) return unauthorized;

  try {
    const body = await request.json();
    const { title, description, categories, image, date } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: "Title and description are required" },
        { status: 400 }
      );
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const blogsCollection = db.collection("blogs");

    const blogData = {
      title,
      description,
      categories: categories || [],
      image: image || "",
      date: date ? new Date(date) : new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await blogsCollection.insertOne(blogData);
    await client.close();

    return NextResponse.json(
      {
        _id: result.insertedId,
        ...blogData,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating blog:", error);
    return NextResponse.json(
      { error: "Failed to create blog" },
      { status: 500 }
    );
  }
}
