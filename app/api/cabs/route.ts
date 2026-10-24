import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const db = await getDb();
    const includeUnavailable = request.nextUrl.searchParams.get("includeUnavailable") === "true";
    const cabs = await db
      .collection("cabs")
      .find(includeUnavailable ? {} : { status: "Available" })
      .sort({ category: 1, model: 1 })
      .toArray();
    const startAtValue = request.nextUrl.searchParams.get("startAt");
    const endAtValue = request.nextUrl.searchParams.get("endAt");
    const startAt = startAtValue ? new Date(startAtValue) : null;
    const endAt = endAtValue ? new Date(endAtValue) : null;

    if ((startAtValue && Number.isNaN(startAt?.getTime())) || (endAtValue && Number.isNaN(endAt?.getTime()))) {
      return NextResponse.json({ error: "Choose a valid pickup and return time." }, { status: 400 });
    }
    if ((startAt && !endAt) || (!startAt && endAt) || (startAt && endAt && endAt <= startAt)) {
      return NextResponse.json({ error: "Choose a valid pickup and return time." }, { status: 400 });
    }

    const bookedCabIds = startAt && endAt
      ? new Set(
          (await db.collection("cabBookings").find({
            cabId: { $in: cabs.map((cab) => cab._id) },
            status: { $in: ["pending", "confirmed"] },
            serviceStartAt: { $lt: endAt },
            serviceEndAt: { $gt: startAt },
          }).project({ cabId: 1 }).toArray()).map((booking) => booking.cabId.toString()),
        )
      : new Set<string>();

    return NextResponse.json(
      cabs.map((cab) => ({
        _id: cab._id.toString(),
        model: cab.model,
        category: cab.category,
        seats: Number(cab.seats) || 4,
        luggageCapacity: Number.isInteger(Number(cab.luggageCapacity))
          ? Number(cab.luggageCapacity)
          : 2,
        baseFare: Math.max(0, Number(cab.baseFare ?? 500) || 0),
        perKmRate: Math.max(0, Number(cab.perKmRate ?? 18) || 0),
        taxPercent: Math.min(100, Math.max(0, Number(cab.taxPercent) || 0)),
        driverAllowance: Math.max(0, Number(cab.driverAllowance) || 0),
        rating: Number.isFinite(Number(cab.rating)) && Number(cab.rating) > 0
          ? Math.min(5, Number(cab.rating))
          : null,
        isAvailable: cab.status === "Available" && !bookedCabIds.has(cab._id.toString()),
      })),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Error fetching public cab fleet:", error);
    return NextResponse.json({ error: "Could not load available vehicles." }, { status: 500 });
  }
}