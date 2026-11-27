import { NextRequest, NextResponse } from "next/server";
import { getNotificationList } from "@/lib/services/notifications/admin";
import { resolveAdminAuth } from "@/lib/services/notifications/admin-auth";
import { NotificationChannel, NotificationStatus, NotificationType } from "@/lib/models/notification";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = resolveAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);

    const search = searchParams.get("search") || undefined;
    const channel = (searchParams.get("channel") as NotificationChannel) || undefined;
    const status = (searchParams.get("status") as NotificationStatus) || undefined;
    const type = (searchParams.get("type") as NotificationType) || undefined;
    const propertyId = searchParams.get("propertyId") || undefined;
    const bookingId = searchParams.get("bookingId") || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    const result = await getNotificationList({
      search,
      channel,
      status,
      type,
      propertyId,
      bookingId,
      startDate,
      endDate,
      page,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("Error fetching notification list:", error);
    return NextResponse.json(
      { error: "Failed to fetch notification list." },
      { status: 500 }
    );
  }
}
