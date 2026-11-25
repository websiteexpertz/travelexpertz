import { NextRequest, NextResponse } from "next/server";
import { cancelScheduledNotification } from "@/lib/services/notifications/admin";
import { resolveAdminAuth } from "@/lib/services/notifications/admin-auth";

export const runtime = "nodejs";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = resolveAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const reason = typeof body.reason === "string" ? body.reason : "";

    const result = await cancelScheduledNotification(
      id,
      { username: auth.username, id: auth.adminId },
      reason
    );

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: "Scheduled communication has been cancelled.",
    });
  } catch (error: unknown) {
    console.error("Error cancelling scheduled notification:", error);
    return NextResponse.json(
      { error: "Failed to cancel scheduled communication." },
      { status: 500 }
    );
  }
}
