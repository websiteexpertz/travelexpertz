import { MongoClient } from "mongodb";
import { NextRequest, NextResponse } from "next/server";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "travelexpertz";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sort = searchParams.get("sort") || "newest";

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const blogsCollection = db.collection("blogs");

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (category) {
      query.categories = { $in: [category] };
    }

    // Sort options — use date field, fallback to createdAt
    let sortOption: any = { date: -1, createdAt: -1 };
    if (sort === "oldest") sortOption = { date: 1, createdAt: 1 };
    if (sort === "title") sortOption = { title: 1 };

    const skip = (page - 1) * limit;
    const total = await blogsCollection.countDocuments(query);
    const blogs = await blogsCollection
      .find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .toArray();

    // Get all unique categories for filter
    const allCategories = await blogsCollection.distinct("categories");

    await client.close();

    return NextResponse.json({
      blogs,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      categories: allCategories.filter(Boolean).sort(),
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
