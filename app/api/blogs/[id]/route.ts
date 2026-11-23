import { MongoClient, ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { SAMPLE_BLOGS } from "@/app/data/sampleBlogs";

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = process.env.MONGODB_DB || "travelexpertz";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check sample blogs first
    const sample = SAMPLE_BLOGS.find((b) => b._id === id);

    if (!id) {
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    if (!ObjectId.isValid(id)) {
      if (sample) {
        return NextResponse.json({
          blog: sample,
          latestBlogs: SAMPLE_BLOGS.filter((b) => b._id !== sample._id).slice(0, 5),
        });
      }
      return NextResponse.json({ error: "Invalid blog ID" }, { status: 400 });
    }

    const client = new MongoClient(uri);
    await client.connect();
    const db = client.db(dbName);
    const blogsCollection = db.collection("blogs");

    const blog = await blogsCollection.findOne({ _id: new ObjectId(id) });

    if (!blog) {
      await client.close();
      if (sample) {
        return NextResponse.json({
          blog: sample,
          latestBlogs: SAMPLE_BLOGS.filter((b) => b._id !== sample._id).slice(0, 5),
        });
      }
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Fetch latest 5 blogs excluding current one
    const latestBlogs = await blogsCollection
      .find({ _id: { $ne: new ObjectId(id) } })
      .sort({ createdAt: -1 })
      .limit(5)
      .project({ title: 1, image: 1, date: 1, categories: 1, createdAt: 1 })
      .toArray();

    await client.close();

    // If fewer than 5 latest blogs, fill from sample blogs
    const mergedLatest = [...latestBlogs];
    if (mergedLatest.length < 5) {
      SAMPLE_BLOGS.forEach((sb) => {
        if (mergedLatest.length < 5 && String(sb._id) !== String(id)) {
          mergedLatest.push(sb as any);
        }
      });
    }

    return NextResponse.json({
      blog,
      latestBlogs: mergedLatest,
    });
  } catch (error) {
    console.error("Error fetching blog:", error);
    return NextResponse.json(
      { error: "Failed to fetch blog" },
      { status: 500 }
    );
  }
}
