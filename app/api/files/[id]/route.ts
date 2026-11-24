import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { Readable } from "stream";
import { getGridFSBucket } from "@/lib/db";

export const runtime = "nodejs";

// In-memory metadata cache to eliminate repetitive MongoDB Atlas roundtrips
interface CachedFileMeta {
  contentType: string;
  filename: string;
  length: number;
}
const metaCache = new Map<string, CachedFileMeta>();
const MAX_CACHE_SIZE = 1000;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const startTime = Date.now();
  try {
    const { id } = await params;

    // 1. Validate file ID before querying
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid file ID format" },
        { status: 400 }
      );
    }

    // 2. HTTP 304 Not Modified:
    // If browser already has this immutable file cached, return 304 in < 1ms
    const ifNoneMatch = request.headers.get("if-none-match");
    if (ifNoneMatch === `"${id}"` || ifNoneMatch === id) {
      return new Response(null, {
        status: 304,
        headers: {
          "Cache-Control": "public, max-age=31536000, immutable",
          ETag: `"${id}"`,
        },
      });
    }

    const objectId = new ObjectId(id);

    // 3. Fast-path: Check in-memory metadata cache first
    let fileMeta = metaCache.get(id);

    // 4. Reuse shared connection pool to get GridFS bucket
    const bucket = await getGridFSBucket("uploads");

    if (!fileMeta) {
      const files = await bucket.find({ _id: objectId }).limit(1).toArray();
      if (!files || files.length === 0) {
        return NextResponse.json({ error: "File not found" }, { status: 404 });
      }

      const file = files[0];
      fileMeta = {
        contentType: file.metadata?.contentType || "application/octet-stream",
        filename: file.filename || "file",
        length: file.length,
      };

      if (metaCache.size >= MAX_CACHE_SIZE) {
        const firstKey = metaCache.keys().next().value;
        if (firstKey) metaCache.delete(firstKey);
      }
      metaCache.set(id, fileMeta);
    }

    const metadataDuration = Date.now() - startTime;

    // 5. Create GridFS download stream and convert to Web-compatible ReadableStream
    const downloadStream = bucket.openDownloadStream(objectId);
    const webStream = Readable.toWeb(downloadStream) as ReadableStream<Uint8Array>;

    // 6. Return streaming response with proper HTTP headers
    return new Response(webStream, {
      status: 200,
      headers: {
        "Content-Type": fileMeta.contentType,
        "Content-Length": String(fileMeta.length),
        "Content-Disposition": `inline; filename="${encodeURIComponent(fileMeta.filename)}"`,
        "Cache-Control": "public, max-age=31536000, immutable",
        ETag: `"${id}"`,
        "Accept-Ranges": "bytes",
        "Server-Timing": `meta;dur=${metadataDuration}`,
      },
    });
  } catch (error) {
    console.error("Error streaming GridFS file:", error);
    return NextResponse.json(
      { error: "Failed to fetch file" },
      { status: 500 }
    );
  }
}
