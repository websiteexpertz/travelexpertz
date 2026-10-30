import { NextRequest, NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/db";

type CabStatus = "Available" | "On Trip" | "Maintenance";
const fuelTypes = ["Petrol", "Diesel", "CNG", "Electric", "Hybrid"] as const;

interface CabInput {
  model?: unknown;
  fuelType?: unknown;
  color?: unknown;
  licensePlate?: unknown;
  category?: unknown;
  assignedDriver?: unknown;
  status?: unknown;
  seats?: unknown;
  baseFare?: unknown;
  perKmRate?: unknown;
  driverAllowance?: unknown;
  taxPercent?: unknown;
  rating?: unknown;
  luggageCapacity?: unknown;
  driverName?: unknown;
  driverPhone?: unknown;
  driverLicense?: unknown;
  imageUrl?: unknown;
  roofCarrierAvailable?: unknown;
}

function isAdminRequest(request: NextRequest): boolean {
  try {
    const token = request.cookies.get("adminToken")?.value;
    if (!token) return false;

    const [header, payload, signature, extra] = token.split(".");
    if (!header || !payload || !signature || extra !== undefined) return false;

    const secret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    const expectedSignature = btoa(`${secret}${header}${payload}`).replace(/=/g, "");
    if (signature.replace(/=/g, "") !== expectedSignature) return false;

    const decoded = JSON.parse(atob(payload)) as { exp?: number };
    return typeof decoded.exp === "number" && decoded.exp > Math.floor(Date.now() / 1000);
  } catch {
    return false;
  }
}

function normalizeCab(input: CabInput, requireVehicleDetails: boolean) {
  const model = typeof input.model === "string" ? input.model.trim() : "";
  const fuelType = typeof input.fuelType === "string" ? input.fuelType.trim() : "";
  const color = typeof input.color === "string" ? input.color.trim() : "";
  const licensePlate =
    typeof input.licensePlate === "string"
      ? input.licensePlate.trim().toUpperCase()
      : "";
  const category = typeof input.category === "string" ? input.category.trim() : "";
  const assignedDriver =
    typeof input.assignedDriver === "string" ? input.assignedDriver.trim() : "";
  const status = input.status;
  const seats = Number(input.seats);
  const baseFare = Number(input.baseFare);
  const perKmRate = Number(input.perKmRate);
  const driverAllowance = Number(input.driverAllowance);
  const taxPercent = Number(input.taxPercent);
  const rating = input.rating === "" || input.rating === null || input.rating === undefined
    ? null
    : Number(input.rating);
  const luggageCapacity = Number(input.luggageCapacity);
  const driverName = typeof input.driverName === "string" ? input.driverName.trim() : "";
  const driverPhone = typeof input.driverPhone === "string" ? input.driverPhone.trim() : "";
  const driverLicense = typeof input.driverLicense === "string" ? input.driverLicense.trim() : "";
  const imageUrl = typeof input.imageUrl === "string" ? input.imageUrl.trim() : "";
  if (
    input.roofCarrierAvailable !== undefined &&
    typeof input.roofCarrierAvailable !== "boolean"
  ) {
    return { error: "Choose a valid roof carrier option." };
  }

  if (!model || !licensePlate || !category) {
    return { error: "Model, license plate, and category are required." };
  }
  if (model.length > 100 || licensePlate.length > 20 || category.length > 60) {
    return { error: "Car model, registration number, or car type exceeds the allowed length." };
  }
  if (requireVehicleDetails && (!fuelType || !color)) {
    return { error: "Fuel type and car color are required." };
  }
  if (
    imageUrl &&
    (imageUrl.length > 100 ||
      !/^\/api\/files\/[a-f\d]{24}$/i.test(imageUrl))
  ) {
    return { error: "Upload a valid vehicle photo." };
  }
  if (requireVehicleDetails && !imageUrl) {
    return { error: "Upload a photo of this vehicle." };
  }
  if (fuelType && !fuelTypes.includes(fuelType as (typeof fuelTypes)[number])) {
    return { error: "Choose a valid fuel type." };
  }
  if (color.length > 40) {
    return { error: "Car color must be 40 characters or fewer." };
  }
  if (!["Available", "On Trip", "Maintenance"].includes(String(status))) {
    return { error: "Choose a valid operational status." };
  }
  if (!Number.isInteger(seats) || seats < 1 || seats > 20) {
    return { error: "Passenger capacity must be between 1 and 20." };
  }
  if (!Number.isFinite(baseFare) || baseFare < 0 || baseFare > 100000) {
    return { error: "Base fare must be between 0 and 100,000." };
  }
  if (!Number.isFinite(perKmRate) || perKmRate < 0 || perKmRate > 10000) {
    return { error: "Per-kilometre rate must be between 0 and 10,000." };
  }
  if (!Number.isFinite(driverAllowance) || driverAllowance < 0 || driverAllowance > 100000) {
    return { error: "Driver allowance must be between 0 and 100,000." };
  }
  if (rating !== null && (!Number.isFinite(rating) || rating < 0 || rating > 5)) {
    return { error: "Rating must be between 0 and 5." };
  }
  if (!Number.isFinite(taxPercent) || taxPercent < 0 || taxPercent > 100) {
    return { error: "Government tax must be between 0% and 100%." };
  }
  if (!Number.isInteger(luggageCapacity) || luggageCapacity < 0 || luggageCapacity > 50) {
    return { error: "Luggage capacity must be between 0 and 50 bags." };
  }
  if (driverName.length > 100 || driverPhone.length > 30 || driverLicense.length > 50) {
    return { error: "Driver details exceed the allowed length." };
  }

  return {
    value: {
      model,
      ...(fuelType ? { fuelType } : {}),
      ...(color ? { color } : {}),
      licensePlate,
      category,
      assignedDriver,
      status: status as CabStatus,
      seats,
      baseFare,
      perKmRate,
      driverAllowance,
      taxPercent,
      rating: rating || null,
      luggageCapacity,
      driverName,
      driverPhone,
      driverLicense,
      ...(imageUrl ? { imageUrl } : {}),
      roofCarrierAvailable: input.roofCarrierAvailable === true,
    },
  };
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const db = await getDb();
    const cabs = await db.collection("cabs").find({}).sort({ createdAt: -1 }).toArray();
    return NextResponse.json(cabs.map((cab) => ({
      ...cab,
      fuelType: typeof cab.fuelType === "string" ? cab.fuelType : "",
      color: typeof cab.color === "string" ? cab.color : "",
    })));
  } catch (error) {
    console.error("Error fetching cab fleet:", error);
    return NextResponse.json({ error: "Failed to fetch cab fleet." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const normalized = normalizeCab((await request.json()) as CabInput, true);
    if ("error" in normalized) {
      return NextResponse.json({ error: normalized.error }, { status: 400 });
    }

    const db = await getDb();
    const cabs = db.collection("cabs");
    const duplicate = await cabs.findOne({
      licensePlate: { $regex: `^${escapeRegex(normalized.value.licensePlate)}$`, $options: "i" },
    });
    if (duplicate) {
      return NextResponse.json({ error: "A vehicle with this license plate already exists." }, { status: 409 });
    }

    const now = new Date();
    const result = await cabs.insertOne({
      ...normalized.value,
      createdAt: now,
      updatedAt: now,
    });
    return NextResponse.json({ _id: result.insertedId, ...normalized.value }, { status: 201 });
  } catch (error) {
    console.error("Error creating cab:", error);
    return NextResponse.json({ error: "Failed to create vehicle." }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "A valid vehicle ID is required." }, { status: 400 });
  }

  try {
    const normalized = normalizeCab((await request.json()) as CabInput, false);
    if ("error" in normalized) {
      return NextResponse.json({ error: normalized.error }, { status: 400 });
    }

    const db = await getDb();
    const cabs = db.collection("cabs");
    const vehicleId = new ObjectId(id);
    const duplicate = await cabs.findOne({
      _id: { $ne: vehicleId },
      licensePlate: { $regex: `^${escapeRegex(normalized.value.licensePlate)}$`, $options: "i" },
    });
    if (duplicate) {
      return NextResponse.json({ error: "A vehicle with this license plate already exists." }, { status: 409 });
    }

    const result = await cabs.updateOne(
      { _id: vehicleId },
      { $set: { ...normalized.value, updatedAt: new Date() } },
    );
    if (!result.matchedCount) {
      return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Vehicle updated successfully." });
  } catch (error) {
    console.error("Error updating cab:", error);
    return NextResponse.json({ error: "Failed to update vehicle." }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = new URL(request.url).searchParams.get("id");
  if (!id || !ObjectId.isValid(id)) {
    return NextResponse.json({ error: "A valid vehicle ID is required." }, { status: 400 });
  }

  try {
    const db = await getDb();
    const result = await db.collection("cabs").deleteOne({ _id: new ObjectId(id) });
    if (!result.deletedCount) {
      return NextResponse.json({ error: "Vehicle not found." }, { status: 404 });
    }
    return NextResponse.json({ message: "Vehicle deleted successfully." });
  } catch (error) {
    console.error("Error deleting cab:", error);
    return NextResponse.json({ error: "Failed to delete vehicle." }, { status: 500 });
  }
}