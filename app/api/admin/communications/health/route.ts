import { NextRequest, NextResponse } from "next/server";
import { getSchedulerHealth } from "@/lib/services/notifications/admin";
import { resolveAdminAuth } from "@/lib/services/notifications/admin-auth";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const auth = resolveAdminAuth(request);
    if (!auth.authorized) {
      return NextResponse.json({ error: auth.error || "Unauthorized" }, { status: 401 });
    }

    const health = await getSchedulerHealth();
    return NextResponse.json(health);
  } catch (error: unknown) {
    console.error("Error fetching scheduler health:", error);
    return NextResponse.json(
      { error: "Failed to retrieve scheduler health diagnostics." },
      { status: 500 }
    );
  }
}
