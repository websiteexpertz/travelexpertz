import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";

/**
 * POST /api/package-inquiries
 * Create a new package travel inquiry
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      packageId,
      packageTitle,
      fullName,
      phone,
      email,
      startDate,
      adults,
      children,
      accommodationType,
      budget,
      modeOfTravel,
      carType,
      additionalDetails,
    } = body;

    // Validation
    if (!packageId || !fullName || !phone || !email) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const inquiriesCollection = db.collection("package_inquiries");

    // Create inquiry
    const inquiry = {
      packageId: new ObjectId(packageId),
      packageTitle,
      customer: {
        fullName,
        phone,
        email,
      },
      travelDetails: {
        startDate: startDate || null,
        adults: adults || 1,
        children: children || 0,
        accommodationType: accommodationType || "Standard",
        budget: budget || "",
        modeOfTravel: modeOfTravel || "Road",
        carType: carType || "Hatchback",
        additionalDetails: additionalDetails || "",
      },
      status: "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await inquiriesCollection.insertOne(inquiry);

    return NextResponse.json({
      success: true,
      message: "Travel inquiry submitted successfully",
      inquiryId: result.insertedId,
    });
  } catch (error) {
    console.error("Package inquiry error:", error);
    return NextResponse.json(
      { error: "Failed to submit inquiry" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/package-inquiries
 * Get package inquiries (admin only)
 */
export async function GET(request: NextRequest) {
  try {
    // TODO: Add authentication check for admin

    const db = await getDb();
    const inquiriesCollection = db.collection("package_inquiries");

    const inquiries = await inquiriesCollection
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      success: true,
      inquiries,
      total: inquiries.length,
    });
  } catch (error) {
    console.error("Fetch inquiries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 },
    );
  }
}
