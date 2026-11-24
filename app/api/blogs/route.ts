import { getDb } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { SAMPLE_BLOGS } from "@/app/data/sampleBlogs";

const dbName = process.env.MONGODB_DB || "travelexpertz";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const category = searchParams.get("category") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const sort = searchParams.get("sort") || "newest";

    const db = await getDb(dbName);
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

    const dbBlogs = await blogsCollection
      .find(query)
      .sort(sortOption)
      .toArray();

    // Get all unique categories for filter
    const allCategories = await blogsCollection.distinct("categories");

    // Merge database blogs with sample blogs so all blogs (new and existing) are shown
    const map = new Map<string, any>();
    dbBlogs.forEach((b) => {
      map.set(String(b._id || b.title), b);
    });

    SAMPLE_BLOGS.forEach((sb) => {
      if (search) {
        const s = search.toLowerCase();
        const matchesTitle = (sb.title || "").toLowerCase().includes(s);
        const matchesDesc = (sb.description || "").toLowerCase().includes(s);
        if (!matchesTitle && !matchesDesc) return;
      }
      if (category && (!sb.categories || !sb.categories.includes(category))) {
        return;
      }
      if (!map.has(sb._id)) {
        map.set(sb._id, sb);
      }
    });

    const combinedBlogs = Array.from(map.values());
    const total = combinedBlogs.length;
    const skip = (page - 1) * limit;
    const paginatedBlogs = combinedBlogs.slice(skip, skip + limit);

    const mergedCategories = Array.from(
      new Set([
        ...allCategories.filter(Boolean),
        ...SAMPLE_BLOGS.flatMap((s) => s.categories || []),
      ])
    ).sort();

    return NextResponse.json({
      blogs: paginatedBlogs,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
      categories: mergedCategories,
    });
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return NextResponse.json(
      { error: "Failed to fetch blogs" },
      { status: 500 }
    );
  }
}
