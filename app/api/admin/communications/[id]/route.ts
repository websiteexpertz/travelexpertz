import { NextRequest, NextResponse } from "next/server";
import { getNotificationDetail } from "@/lib/services/notifications/admin";
import { resolveAdminAuth } from "@/lib/services/notifications/admin-auth";

export const runtime = "nodejs";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = resolveAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const detail = await getNotificationDetail(id);

    if (!detail) {
      return NextResponse.json({ error: "Notification record not found." }, { status: 404 });
    }

    return NextResponse.json(detail);
  } catch (error: unknown) {
    console.error("Error fetching notification detail:", error);
    return NextResponse.json(
      { error: "Failed to load notification details." },
      { status: 500 }
    );
  }
}
