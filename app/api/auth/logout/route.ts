import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  // The logout is handled client-side by removing the token
  // This endpoint is here for completeness and future server-side cleanup if needed
  return NextResponse.json(
    { message: "Logged out successfully" },
    { status: 200 }
  );
}
