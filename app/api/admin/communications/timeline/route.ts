import { NextRequest, NextResponse } from "next/server";
import { getBookingCommunicationTimeline } from "@/lib/services/notifications/admin";
import { resolveAdminAuth } from "@/lib/services/notifications/admin-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = resolveAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");

    if (!bookingId) {
      return NextResponse.json({ error: "Booking ID is required." }, { status: 400 });
    }

    const timeline = await getBookingCommunicationTimeline(bookingId);
    return NextResponse.json({ timeline });
  } catch (error: unknown) {
    console.error("Error fetching booking communication timeline:", error);
    return NextResponse.json(
      { error: "Failed to load booking communication timeline." },
      { status: 500 }
    );
  }
}
