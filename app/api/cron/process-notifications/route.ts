/**
 * Protected Background Notification Worker Endpoint
 * Route: /api/cron/process-notifications
 * Supports GET (Vercel Cron) and POST (External Pinger / QStash / Manual Test)
 */

import { NextRequest, NextResponse } from "next/server";
import { NotificationProcessor } from "@/lib/services/notifications/processor";
import { ensureNotificationIndexes } from "@/lib/db/init-notifications";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function isAuthorized(request: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;

  // In test mode with no CRON_SECRET configured, permit local verification
  if (!cronSecret && process.env.NODE_ENV !== "production") {
    return true;
  }

  // Check Bearer token in Authorization header
  const authHeader = request.headers.get("authorization");
  if (authHeader && cronSecret) {
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();
    if (token === cronSecret) return true;
  }

  // Check ?secret= query param
  const { searchParams } = new URL(request.url);
  const secretParam = searchParams.get("secret");
  if (secretParam && cronSecret && secretParam === cronSecret) {
    return true;
  }

  return false;
}

async function handleProcessing(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { error: "Unauthorized: Invalid or missing CRON_SECRET" },
      { status: 401 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const batchSize = Math.min(
      parseInt(searchParams.get("batchSize") || "20", 10),
      50
    );

    // Ensure database indexes exist (idempotent)
    await ensureNotificationIndexes();

    const processor = new NotificationProcessor();
    const stats = await processor.processBatch({ batchSize });

    return NextResponse.json(
      {
        success: true,
        stats,
        timestamp: new Date().toISOString(),
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("[Cron:process-notifications] Unhandled error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Notification processing encountered an internal error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  return handleProcessing(request);
}

export async function POST(request: NextRequest) {
  return handleProcessing(request);
}
