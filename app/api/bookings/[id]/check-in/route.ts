import { NextRequest, NextResponse } from "next/server";
import { markGuestCheckIn, resolveLifecycleAuthUser } from "@/lib/services/stay-lifecycle";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Booking ID is required" }, { status: 400 });
    }

    const authUser = resolveLifecycleAuthUser(request);
    if (!authUser) {
      return NextResponse.json(
        { error: "Authentication required to mark guest check-in" },
        { status: 401 }
      );
    }

    const result = await markGuestCheckIn(id, authUser.id, {
      authUser,
    });

    if (!result.success) {
      const status = result.errorCode === "FORBIDDEN" ? 403 : 400;
      return NextResponse.json(
        { error: result.error, code: result.errorCode },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      stayStatus: "CHECKED_IN",
      actualCheckInAt: result.actualCheckInAt,
      alreadyCheckedIn: result.alreadyCheckedIn,
    });
  } catch (error: any) {
    console.error("[CheckIn API] Unexpected error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to mark check-in" },
      { status: 500 }
    );
  }
}
