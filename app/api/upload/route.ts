import { NextRequest, NextResponse } from "next/server";
import { MongoClient, GridFSBucket, ObjectId } from "mongodb";
import { Readable } from "stream";

const MONGODB_URI = process.env.MONGODB_URI || "";
const MONGODB_DB = process.env.MONGODB_DB || "travelexpertz";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  let client: MongoClient | null = null;
  
  try {
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

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

    const uploadedFiles = [];

    // Upload each file
    for (const file of files) {
      // Generate unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(7);
      const safeName = file.name
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9.-]/g, "");
      const filename = `${timestamp}-${randomStr}-${safeName}`;

      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Create readable stream from buffer
      const readableStream = Readable.from(buffer);

      // Upload to GridFS
      const uploadStream = bucket.openUploadStream(filename, {
        contentType: file.type,
        metadata: {
          originalName: file.name,
          uploadedAt: new Date(),
        },
      });

      // Pipe the file to GridFS
      await new Promise((resolve, reject) => {
        readableStream.pipe(uploadStream)
          .on("error", reject)
          .on("finish", resolve);
      });

      const url = `/api/files/${uploadStream.id}`;
      uploadedFiles.push({ url, fileId: uploadStream.id });
      console.log(`File uploaded successfully to GridFS: ${url}`);
    }

    // Return single file or array based on input
    if (uploadedFiles.length === 1) {
      return NextResponse.json(uploadedFiles[0], { status: 200 });
    } else {
      return NextResponse.json({ files: uploadedFiles }, { status: 200 });
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  } finally {
    if (client) {
      await client.close();
    }
  }
}
