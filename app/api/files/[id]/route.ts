import { NextRequest, NextResponse } from "next/server";
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let client: MongoClient | null = null;

  try {
    const { id } = await params;

    if (!MONGODB_URI) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Connect to MongoDB
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    const db = client.db(MONGODB_DB);

    // Create GridFS bucket
    const bucket = new GridFSBucket(db, { bucketName: "uploads" });

    // Get file metadata
    const files = await bucket
      .find({ _id: new ObjectId(id) })
      .toArray();

    if (files.length === 0) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const file = files[0];

    // Stream the file
    const downloadStream = bucket.openDownloadStream(new ObjectId(id));

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of downloadStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Return the file with proper headers
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": file.metadata?.contentType || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${file.filename}"`,
      },
    });
  } catch (error) {
    console.error("Error fetching file:", error);
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
