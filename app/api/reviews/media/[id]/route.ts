import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb, getGridFSBucket } from "@/lib/db";
import { verifyGuestReviewToken } from "@/lib/services/reviews/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid media file ID" }, { status: 400 });
    }

    const db = await getDb();
    const file = await db.collection("review_media.files").findOne({ _id: new ObjectId(id) });

    if (!file) {
      return NextResponse.json({ error: "Media file not found" }, { status: 404 });
    }

    const isApproved = file.metadata?.approved === true;

    // If media is not yet approved, authorization is required (admin session or matching guest token)
    if (!isApproved) {
      const searchParams = new URL(request.url).searchParams;
      const adminHeader = request.headers.get("x-admin-request") === "true";
      const token = searchParams.get("token") || request.headers.get("x-review-token");

      let authorized = adminHeader;

      if (!authorized && token && file.metadata?.bookingId) {
        const verifyRes = await verifyGuestReviewToken(token, file.metadata.bookingId, db);
        if (verifyRes.valid) {
          authorized = true;
        }
      }

      if (!authorized) {
        return NextResponse.json(
          { error: "Access denied. This media file is pending moderation." },
          { status: 403 }
        );
      }
    }

    const bucket = await getGridFSBucket("review_media");
    const downloadStream = bucket.openDownloadStream(new ObjectId(id));

    const webStream = new ReadableStream({
      start(controller) {
        downloadStream.on("data", (chunk) => controller.enqueue(chunk));
        downloadStream.on("end", () => controller.close());
        downloadStream.on("error", (err) => controller.error(err));
      },
    });

    const contentType = file.metadata?.contentType || "application/octet-stream";
    const headers = new Headers();
    headers.set("Content-Type", contentType);
    headers.set("Content-Length", String(file.length));
    if (isApproved) {
      headers.set("Cache-Control", "public, max-age=86400, stale-while-revalidate=43200");
    } else {
      headers.set("Cache-Control", "private, no-cache, no-store");
    }

    return new Response(webStream, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error("Error streaming review media:", error);
    return NextResponse.json({ error: "Failed to stream media" }, { status: 500 });
  }
}
