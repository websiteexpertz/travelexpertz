import { NextRequest, NextResponse } from "next/server";
import { MongoClient, ObjectId } from "mongodb";
import jwt from "jsonwebtoken";

// Middleware to verify token
function verifyToken(req: NextRequest) {
  // First try to get token from Authorization header
  let token = req.headers.get("authorization")?.replace("Bearer ", "");
  
  // If not found, try to get from cookies
  if (!token) {
    token = req.cookies.get("accessToken")?.value;
  }

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;
    return decoded;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

const uri = process.env.MONGODB_URI || "mongodb://localhost:27017";
const dbName = "travelexpertz";

async function connectDB() {
  const client = new MongoClient(uri);
  await client.connect();
  return client.db(dbName);
}

/**
 * GET /api/owner/notifications
 * Fetch notifications for owner
 */
export async function GET(request: NextRequest) {
  try {
    const user = verifyToken(request);

    if (!user || !user.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const db = await connectDB();
    const notificationsCollection = db.collection("owner_notifications");

    // Get all notifications for this owner, sorted by latest first
    const notifications = await notificationsCollection
      .find({ ownerId: new ObjectId(user.userId) })
      .sort({ createdAt: -1 })
      .toArray();

    // Get counts
    const unreadCount = notifications.filter((n) => !n.isRead).length;

    return NextResponse.json({
      notifications,
      unreadCount,
      total: notifications.length,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json(
      { error: "Failed to fetch notifications" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/owner/notifications
 * Mark notification as read
 */
export async function PATCH(request: NextRequest) {
  try {
    const user = verifyToken(request);

    if (!user || !user.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { notificationId, isRead } = body;

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const notificationsCollection = db.collection("owner_notifications");

    // Update notification
    const result = await notificationsCollection.findOneAndUpdate(
      {
        _id: new ObjectId(notificationId),
        ownerId: new ObjectId(user.userId),
      },
      { $set: { isRead: isRead ?? true } },
      { returnDocument: "after" }
    );

    if (!result) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { error: "Failed to update notification" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/owner/notifications
 * Delete a notification
 */
export async function DELETE(request: NextRequest) {
  try {
    const user = verifyToken(request);

    if (!user || !user.userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json(
        { error: "Notification ID is required" },
        { status: 400 }
      );
    }

    const db = await connectDB();
    const notificationsCollection = db.collection("owner_notifications");

    const result = await notificationsCollection.deleteOne({
      _id: new ObjectId(notificationId),
      ownerId: new ObjectId(user.userId),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Notification deleted" });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { error: "Failed to delete notification" },
      { status: 500 }
    );
  }
}
