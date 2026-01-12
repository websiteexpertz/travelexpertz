import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getUserFromRequest } from "@/lib/middleware/auth";
import { ObjectId } from "mongodb";

/**
 * GET /api/user/transactions
 * Get user's transaction history
 */
export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const db = await getDb();
    const transactionsCollection = db.collection("transactions");

    const transactions = await transactionsCollection
      .find({ userId: new ObjectId(user.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json({
      transactions,
      count: transactions.length,
    });
  } catch (error) {
    console.error("Get transactions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
