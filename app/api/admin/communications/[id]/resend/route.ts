import { NextRequest, NextResponse } from "next/server";
import { resendNotification } from "@/lib/services/notifications/admin";
import { resolveAdminAuth } from "@/lib/services/notifications/admin-auth";
import { NotificationChannel, NotificationType } from "@/lib/models/notification";

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

    const { id: bookingId } = await params;
    const body = await request.json().catch(() => ({}));
    const type = body.type as NotificationType;
    const channel = (body.channel as NotificationChannel) || "EMAIL";
    const reason = typeof body.reason === "string" ? body.reason : "";

    if (!type) {
      return NextResponse.json({ error: "Notification type is required." }, { status: 400 });
    }

    const result = await resendNotification(
      bookingId,
      type,
      channel,
      { username: auth.username, id: auth.adminId },
      reason
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error, errorCode: result.errorCode },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Communication resend has been enqueued successfully.",
      newNotificationId: result.newNotificationId,
    });
  } catch (error: unknown) {
    console.error("Error resending notification:", error);
    return NextResponse.json(
      { error: "Failed to resend communication." },
      { status: 500 }
    );
  }
}
