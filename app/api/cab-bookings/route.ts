import { ObjectId } from "mongodb";
import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserFromRequest } from "@/lib/middleware/auth";
import { calculateCabRoute } from "@/lib/cabRoute";

const MAX_BOOKING_DAYS_AHEAD = 365;
const ROOF_CARRIER_FARE = 209;

function isValidText(value: unknown, maximumLength: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.trim().length <= maximumLength;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const requiredText: Array<[string, unknown, number]> = [
      ["Pickup location", body.pickupLocation, 180],
      ["Drop-off location", body.dropoffLocation, 180],
      ["Name", body.fullName, 100],
      ["Phone", body.phone, 30],
      ["Email", body.email, 254],
      ["Pickup date", body.pickupDate, 10],
      ["Pickup time", body.pickupTime, 5],
    ];
    const missing = requiredText.find(([, value, max]) => !isValidText(value, max));
    if (missing) {
      return NextResponse.json({ error: `${missing[0]} is required.` }, { status: 400 });
    }

    if (!ObjectId.isValid(body.cabId)) {
      return NextResponse.json({ error: "Choose a valid vehicle." }, { status: 400 });
    }
    const passengers = Number(body.passengers);
    const luggage = Number(body.luggage);
    if (!Number.isInteger(passengers) || passengers < 1 || passengers > 20) {
      return NextResponse.json({ error: "Passenger count must be between 1 and 20." }, { status: 400 });
    }
    if (!Number.isInteger(luggage) || luggage < 0 || luggage > 20) {
      return NextResponse.json({ error: "Luggage count must be between 0 and 20." }, { status: 400 });
    }
    if (!["one-way", "round-trip", "airport-transfer"].includes(body.tripType)) {
      return NextResponse.json({ error: "Choose one-way, round trip, or airport transfer." }, { status: 400 });
    }
    const stops = body.stops ?? [];
    if (
      !Array.isArray(stops) ||
      stops.length > 5 ||
      stops.some((stop: unknown) => !isValidText(stop, 180))
    ) {
      return NextResponse.json({ error: "Add up to five valid intermediate stops." }, { status: 400 });
    }
    if (body.roofCarrier !== undefined && typeof body.roofCarrier !== "boolean") {
      return NextResponse.json({ error: "Choose a valid roof carrier option." }, { status: 400 });
    }

    const pickupAt = typeof body.pickupAt === "string"
      ? new Date(body.pickupAt)
      : new Date(`${body.pickupDate}T${body.pickupTime}:00`);
    const maximumDate = new Date();
    maximumDate.setDate(maximumDate.getDate() + MAX_BOOKING_DAYS_AHEAD);
    if (Number.isNaN(pickupAt.getTime()) || pickupAt <= new Date() || pickupAt > maximumDate) {
      return NextResponse.json({ error: "Choose a future pickup time within the next year." }, { status: 400 });
    }

    let returnAt: Date | null = null;
    if (body.tripType === "round-trip") {
      if (!isValidText(body.returnDate, 10)) {
        return NextResponse.json({ error: "Return date is required for a round trip." }, { status: 400 });
      }
      returnAt = typeof body.returnAt === "string"
        ? new Date(body.returnAt)
        : new Date(`${body.returnDate}T${body.returnTime || body.pickupTime}:00`);
      if (Number.isNaN(returnAt.getTime()) || returnAt <= pickupAt || returnAt > maximumDate) {
        return NextResponse.json({ error: "Return time must be after pickup time." }, { status: 400 });
      }
    }

    const email = String(body.email).trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
    }

    let route: Awaited<ReturnType<typeof calculateCabRoute>>;
    try {
      route = await calculateCabRoute(
        body.pickupLocation.trim(),
        body.dropoffLocation.trim(),
        stops.map((stop: string) => stop.trim()),
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Could not calculate the route.";
      return NextResponse.json({ error: message }, { status: 502 });
    }
    const distanceKm = route.distanceKm;

    const db = await getDb();
    const cab = await db.collection("cabs").findOne({
      _id: new ObjectId(body.cabId),
      status: "Available",
    });
    if (!cab) {
      return NextResponse.json({ error: "This vehicle is no longer available. Please choose another." }, { status: 409 });
    }
    if (body.roofCarrier && cab.roofCarrierAvailable !== true) {
      return NextResponse.json(
        { error: "The roof carrier is not available for this vehicle." },
        { status: 400 },
      );
    }

    const seats = Number(cab.seats) || 4;
    if (passengers > seats) {
      return NextResponse.json({ error: `This vehicle seats up to ${seats} passengers.` }, { status: 400 });
    }
    const luggageCapacity = Number.isInteger(Number(cab.luggageCapacity))
      ? Number(cab.luggageCapacity)
      : 2;
    if (luggage > luggageCapacity) {
      return NextResponse.json({ error: `This vehicle can carry up to ${luggageCapacity} luggage bags.` }, { status: 400 });
    }

    const baseFare = Math.max(0, Number(cab.baseFare ?? 500) || 0);
    const perKmRate = Math.max(0, Number(cab.perKmRate ?? 18) || 0);
    const driverAllowance = Math.max(0, Number(cab.driverAllowance) || 0);
    const taxPercent = Math.min(100, Math.max(0, Number(cab.taxPercent) || 0));
    const fareDistanceKm = distanceKm * (body.tripType === "round-trip" ? 2 : 1);
    const fareSubtotal = Math.round(baseFare + fareDistanceKm * perKmRate + driverAllowance);
    const governmentTax = Math.round(fareSubtotal * taxPercent / 100);
    const roofCarrierFare = body.roofCarrier ? ROOF_CARRIER_FARE : 0;
    const estimatedFare = fareSubtotal + governmentTax + roofCarrierFare;
    const serviceEndAt =
      returnAt ||
      new Date(
        pickupAt.getTime() +
          Math.max(2, route.durationMinutes / 60) * 60 * 60 * 1000,
      );
    const conflict = await db.collection("cabBookings").findOne({
      cabId: cab._id,
      status: { $in: ["pending", "confirmed"] },
      serviceStartAt: { $lt: serviceEndAt },
      serviceEndAt: { $gt: pickupAt },
    });
    if (conflict) {
      return NextResponse.json(
        { error: "This vehicle has a booking request during that time. Please choose another cab or time." },
        { status: 409 },
      );
    }
    const bookingReference = `CAB-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
    const authenticatedUser = getUserFromRequest(request);

    const booking = {
      bookingReference,
      cabId: cab._id,
      vehicleModel: cab.model,
      vehicleCategory: cab.category,
      vehicleFuelType: typeof cab.fuelType === "string" ? cab.fuelType : "",
      vehicleColor: typeof cab.color === "string" ? cab.color : "",
      seats,
      luggageCapacity,
      driverName: cab.driverName || cab.assignedDriver || "",
      driverPhone: cab.driverPhone || "",
      driverLicense: cab.driverLicense || "",
      pickupLocation: body.pickupLocation.trim(),
      dropoffLocation: body.dropoffLocation.trim(),
      stops: stops.map((stop: string) => stop.trim()),
      pickupAt,
      returnAt,
      serviceStartAt: pickupAt,
      serviceEndAt,
      tripType: body.tripType,
      passengers,
      luggage,
      distanceKm,
      fareBase: baseFare,
      farePerKm: perKmRate,
      driverAllowance,
      fareSubtotal,
      governmentTaxPercent: taxPercent,
      governmentTax,
      roofCarrier: Boolean(body.roofCarrier),
      roofCarrierFare,
      estimatedFare,
      fareCurrency: "INR",
      fullName: body.fullName.trim(),
      phone: body.phone.trim(),
      email,
      notes: typeof body.notes === "string" ? body.notes.trim().slice(0, 1000) : "",
      ...(authenticatedUser?.userId && ObjectId.isValid(authenticatedUser.userId)
        ? { userId: new ObjectId(authenticatedUser.userId) }
        : {}),
      status: "pending",
      paymentStatus: "unpaid",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection("cabBookings").insertOne(booking);
    return NextResponse.json(
      {
        success: true,
        bookingReference,
        estimatedFare,
        roofCarrierFare,
        message: "Your cab request is received. Our team will confirm the final fare and availability shortly.",
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating cab booking request:", error);
    return NextResponse.json({ error: "Could not submit your cab request. Please try again." }, { status: 500 });
  }
}