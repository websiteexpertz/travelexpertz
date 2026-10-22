import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

const bookingStatuses = ["pending", "confirmed", "cancelled", "completed"] as const;

function isAdminRequest(request: NextRequest): boolean {
  try {
    const token = request.cookies.get("adminToken")?.value;
    if (!token) return false;

    const [header, payload, signature, extra] = token.split(".");
    if (!header || !payload || !signature || extra !== undefined) return false;
    const secret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    const expected = btoa(`${secret}${header}${payload}`).replace(/=/g, "");
    if (signature.replace(/=/g, "") !== expected) return false;

    const decoded = JSON.parse(atob(payload)) as { exp?: number };
    return typeof decoded.exp === "number" && decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const status = request.nextUrl.searchParams.get("status");
    const query = status && bookingStatuses.includes(status as (typeof bookingStatuses)[number])
      ? { status }
      : {};
    const db = await getDb();
    const bookings = await db.collection("cabBookings").find(query).sort({ createdAt: -1 }).limit(300).toArray();
    return NextResponse.json(bookings);
  } catch (error) {
    console.error("Error fetching cab bookings:", error);
    return NextResponse.json({ error: "Failed to fetch cab booking requests." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = request.nextUrl.searchParams.get("id");
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "A valid booking ID is required." }, { status: 400 });
  }

  try {
    const body = (await request.json()) as { status?: string };
    if (!body.status || !bookingStatuses.includes(body.status as (typeof bookingStatuses)[number])) {
      return NextResponse.json({ error: "Choose a valid booking status." }, { status: 400 });
    }

    const db = await getDb();
    const result = await db.collection("cabBookings").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status: body.status, updatedAt: new Date() } },
    );
    if (!result.matchedCount) {
      return NextResponse.json({ error: "Cab booking not found." }, { status: 404 });
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating cab booking:", error);
    return NextResponse.json({ error: "Failed to update cab booking." }, { status: 500 });
  }
}