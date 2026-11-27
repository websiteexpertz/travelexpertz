import { NextRequest, NextResponse } from "next/server";
import { finalizeBookingBilling, resolveLifecycleAuthUser } from "@/lib/services/stay-lifecycle";

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
        { error: "Authentication required to finalize billing" },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));

    const result = await finalizeBookingBilling(id, authUser.id, body, {
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
      billingStatus: "FINALIZED",
      invoiceNumber: result.invoiceNumber,
      invoiceDocumentId: result.invoiceDocumentId,
      billingSnapshot: result.billingSnapshot,
      alreadyFinalized: result.alreadyFinalized,
    });
  } catch (error: any) {
    console.error("[FinalizeBilling API] Unexpected error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to finalize billing" },
      { status: 500 }
    );
  }
}
