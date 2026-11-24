import { NextRequest, NextResponse } from "next/server";
import { getGridFSBucket } from "@/lib/db";
import { Readable } from "stream";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  try {
    const formData = await request.formData();
    const files = formData.getAll("file") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // 1. Reuse shared MongoDB connection pool
    const bucket = await getGridFSBucket("uploads");

    // 2. Upload each file concurrently to GridFS with streaming
    const uploadedFiles = await Promise.all(
      files.map(async (file) => {
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(7);
        const safeName = file.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9.-]/g, "");
        const filename = `${timestamp}-${randomStr}-${safeName}`;

        const uploadStream = bucket.openUploadStream(filename, {
          metadata: {
            contentType: file.type || "application/octet-stream",
            originalName: file.name,
            uploadedAt: new Date(),
            size: file.size,
          },
        });

        await new Promise<void>((resolve, reject) => {
          uploadStream.on("error", reject);
          uploadStream.on("finish", () => resolve());

          // Pipe directly from Web ReadableStream without buffering full file into memory
          if (typeof file.stream === "function") {
            try {
              const nodeStream = Readable.fromWeb(file.stream() as any);
              nodeStream.pipe(uploadStream);
              return;
            } catch {
              // Fallback below
            }
          }

          file
            .arrayBuffer()
            .then((bytes) => {
              uploadStream.end(Buffer.from(bytes));
            })
            .catch(reject);
        });

        const url = `/api/files/${uploadStream.id}`;
        return { url, fileId: uploadStream.id };
      })
    );

    const duration = Date.now() - startTime;
    const responseHeaders = {
      "Server-Timing": `upload;dur=${duration}`,
    };

    // Return single file or array based on input
    if (uploadedFiles.length === 1) {
      return NextResponse.json(uploadedFiles[0], {
        status: 200,
        headers: responseHeaders,
      });
    } else {
      return NextResponse.json(
        { files: uploadedFiles },
        { status: 200, headers: responseHeaders }
      );
    }
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}
