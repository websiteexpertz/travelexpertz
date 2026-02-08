import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";

/**
 * GET /api/package-inquiries/user/[email]
 * Get user's package inquiries
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ email: string }> },
) {
  try {
    const { email } = await params;
    const userEmail = decodeURIComponent(email);
    
    console.log("🔍 Package Inquiry API - Raw email param:", email);
    console.log("🔍 Package Inquiry API - Decoded email:", userEmail);

    if (!userEmail) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 },
      );
    }

    const db = await getDb();
    const inquiriesCollection = db.collection("package_inquiries");

    // Try both exact and case-insensitive queries
    const exactQuery = { "customer.email": userEmail };
    const caseInsensitiveQuery = { "customer.email": { $regex: `^${userEmail.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } };
    
    console.log("🔍 Trying exact query with:", userEmail);
    
    let inquiries = await inquiriesCollection
      .find(exactQuery)
      .sort({ createdAt: -1 })
      .toArray();
    
    console.log("🔍 Found with exact query:", inquiries.length);
    
    // If no results, try case-insensitive
    if (inquiries.length === 0) {
      console.log("🔍 Trying case-insensitive query...");
      inquiries = await inquiriesCollection
        .find(caseInsensitiveQuery)
        .sort({ createdAt: -1 })
        .toArray();
      console.log("🔍 Found with case-insensitive query:", inquiries.length);
    }
    
    console.log("🔍 Final result count:", inquiries.length);

    return NextResponse.json({
      success: true,
      inquiries,
      total: inquiries.length,
    });
  } catch (error) {
    console.error("Fetch user inquiries error:", error);
    return NextResponse.json(
      { error: "Failed to fetch inquiries" },
      { status: 500 },
    );
  }
}
