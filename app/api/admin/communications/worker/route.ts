import { NextRequest, NextResponse } from "next/server";
import { NotificationProcessor } from "@/lib/services/notifications/processor";
import { recordCommunicationAudit } from "@/lib/services/notifications/admin";
import { resolveAdminAuth } from "@/lib/services/notifications/admin-auth";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const auth = resolveAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
    }

    const workerId = `admin-manual-${auth.username}-${Date.now()}`;
    const processor = new NotificationProcessor();
    const stats = await processor.processBatch({
      batchSize: 20,
      maxExecutionTimeMs: 20_000,
      workerId,
    });

    await recordCommunicationAudit({
      adminUsername: auth.username,
      adminId: auth.adminId,
      actionType: "TRIGGER_WORKER",
      bookingId: "system",
      channel: "EMAIL",
      type: "BOOKING_CONFIRMATION",
      reason: "Manual administrative execution trigger from Admin Communication Center",
      outcome: "SUCCESS",
      correlationId: workerId,
    });

    return NextResponse.json({
      success: true,
      message: "Notification worker executed successfully.",
      stats,
    });
  } catch (error: unknown) {
    console.error("Error triggering notification worker:", error);
    return NextResponse.json(
      { error: "Failed to execute notification worker." },
      { status: 500 }
    );
  }
}
