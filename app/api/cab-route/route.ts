import { NextRequest, NextResponse } from "next/server";
import { calculateCabRoute } from "@/lib/cabRoute";

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Send valid JSON with pickup and drop-off locations." },
      { status: 400 },
    );
  }
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { error: "Enter valid pickup and drop-off locations." },
      { status: 400 },
    );
  }

  try {
    const locations = body as Record<string, unknown>;
    if (
      typeof locations.pickupLocation !== "string" ||
      typeof locations.dropoffLocation !== "string" ||
      !locations.pickupLocation.trim() ||
      !locations.dropoffLocation.trim() ||
      locations.pickupLocation.trim().length > 180 ||
      locations.dropoffLocation.trim().length > 180
    ) {
      return NextResponse.json(
        { error: "Enter valid pickup and drop-off locations." },
        { status: 400 },
      );
    }

    const stops = locations.stops ?? [];
    if (
      !Array.isArray(stops) ||
      stops.length > 5 ||
      stops.some(
        (stop) =>
          typeof stop !== "string" ||
          !stop.trim() ||
          stop.trim().length > 180,
      )
    ) {
      return NextResponse.json(
        { error: "Add up to five valid intermediate stops." },
        { status: 400 },
      );
    }

    const route = await calculateCabRoute(
      locations.pickupLocation.trim(),
      locations.dropoffLocation.trim(),
      stops.map((stop: string) => stop.trim()),
    );
    return NextResponse.json(route, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Could not calculate the driving route.";
    console.error("Could not calculate cab route:", message);
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
