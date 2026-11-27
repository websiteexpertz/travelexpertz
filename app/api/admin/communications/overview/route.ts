import { NextRequest, NextResponse } from "next/server";
import { getCommunicationOverview } from "@/lib/services/notifications/admin";
import { resolveAdminAuth } from "@/lib/services/notifications/admin-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = resolveAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const dateRangeParam = searchParams.get("dateRange") as "today" | "last7days" | "last30days";
    const dateRange = ["today", "last7days", "last30days"].includes(dateRangeParam)
      ? dateRangeParam
      : "today";

    const overview = await getCommunicationOverview(dateRange);
    return NextResponse.json(overview);
  } catch (error: unknown) {
    console.error("Error fetching communication overview:", error);
    return NextResponse.json(
      { error: "Failed to load communication overview metrics." },
      { status: 500 }
    );
  }
}
