import { timingSafeEqual } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { ensureNotificationIndexes } from "@/lib/db/init-notifications";
import { NotificationProcessor } from "@/lib/services/notifications/processor";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";
export const maxDuration = 60;

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  const authorization = request.headers.get("authorization");
  const match = authorization?.match(/^Bearer ([^\s]+)$/i);

  if (!secret || !match) return false;

  const supplied = Buffer.from(match[1], "utf8");
  const expected = Buffer.from(secret, "utf8");
  return (
    supplied.length === expected.length &&
    timingSafeEqual(supplied, expected)
  );
}

export async function POST(request: NextRequest) {
  if (
    process.env.VERCEL_ENV &&
    process.env.VERCEL_ENV !== "production"
  ) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!process.env.CRON_SECRET) {
    return NextResponse.json(
      { error: "Cron authentication is not configured" },
      { status: 503 }
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const requestedBatchSize = Number(
      new URL(request.url).searchParams.get("batchSize")
    );
    const batchSize =
      Number.isInteger(requestedBatchSize) && requestedBatchSize > 0
        ? Math.min(requestedBatchSize, 10)
        : 10;

    await ensureNotificationIndexes();

    const processor = new NotificationProcessor();
    const stats = await processor.processBatch({
      batchSize,
      maxExecutionTimeMs: 45_000,
    });

    return NextResponse.json(
      { success: true, stats, timestamp: new Date().toISOString() },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch {
    return NextResponse.json(
      { success: false, error: "Notification processing failed" },
      { status: 500 }
    );
  }
}
