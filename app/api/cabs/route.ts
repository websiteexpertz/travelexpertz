import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";

export async function GET() {
  try {
    const db = await getDb();
    const cabs = await db
      .collection("cabs")
      .find({ status: "Available" })
      .sort({ category: 1, model: 1 })
      .toArray();

    return NextResponse.json(
      cabs.map((cab) => ({
        _id: cab._id.toString(),
        model: cab.model,
        category: cab.category,
        seats: Number(cab.seats) || 4,
        luggageCapacity: Number.isInteger(Number(cab.luggageCapacity))
          ? Number(cab.luggageCapacity)
          : 2,
        baseFare: Number(cab.baseFare) || 500,
        perKmRate: Number(cab.perKmRate) || 18,
        taxPercent: Number(cab.taxPercent) || 0,
      })),
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("Error fetching public cab fleet:", error);
    return NextResponse.json({ error: "Could not load available vehicles." }, { status: 500 });
  }
}