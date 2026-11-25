import { NextRequest, NextResponse } from "next/server";
import { retryNotification } from "@/lib/services/notifications/admin";
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
    const forceDuplicateDecision = Boolean(body.forceDuplicateDecision);

    const result = await retryNotification(
      id,
      { username: auth.username, id: auth.adminId },
      reason,
      { forceDuplicateDecision }
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, errorCode: result.errorCode },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Notification has been re-enqueued for delivery.",
    });
  } catch (error: unknown) {
    console.error("Error retrying notification:", error);
    return NextResponse.json(
      { error: "Failed to retry notification." },
      { status: 500 }
    );
  }
}
