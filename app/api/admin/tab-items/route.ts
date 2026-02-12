import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    return NextResponse.json({ message: "Tab items endpoint" });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch tab items" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    return NextResponse.json({ success: true, data: body });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to create tab item" },
      { status: 500 }
    );
  }
}
