import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { resolveAdminAuth } from "@/lib/services/notifications/admin-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = resolveAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "50", 10)));
    const bookingId = searchParams.get("bookingId");
    const actionType = searchParams.get("actionType");

    const db = await getDb();
    const query: Record<string, unknown> = {};
    if (bookingId) query.bookingId = bookingId;
    if (actionType) query.actionType = actionType;

    const logs = await db
      .collection("communication_audit_logs")
      .find(query)
      .sort({ timestamp: -1 })
      .limit(limit)
      .toArray();

    return NextResponse.json({ logs });
  } catch (error: unknown) {
    console.error("Error fetching communication audit logs:", error);
    return NextResponse.json(
      { error: "Failed to load communication audit logs." },
      { status: 500 }
    );
  }
}
