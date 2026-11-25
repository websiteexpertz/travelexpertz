import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { ObjectId } from "mongodb";
import { ModerationStatus, ReviewMediaItem } from "@/lib/services/reviews/types";
import { markReviewMediaApproval } from "@/lib/services/reviews/media";

export const dynamic = "force-dynamic";

interface ReviewModerationBody {
  action?: "approve" | "reject" | "hide" | "restore" | "changes_requested";
  moderationStatus?: ModerationStatus;
  moderationReason?: string;
  active?: boolean;
  verified?: boolean;
  featuredOnHomepage?: boolean;
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as ReviewModerationBody;

    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
    }

    // Role check: If requested by property owner, block moderation actions
    const isOwner = request.headers.get("x-owner-request") === "true";
    if (isOwner) {
      return NextResponse.json(
        { error: "Property owners are not authorized to moderate or approve reviews." },
        { status: 403 }
      );
    }

    const db = await getDb();
    const reviewsCollection = db.collection("reviews");

    const existingReview = await reviewsCollection.findOne({ _id: new ObjectId(id) });
    if (!existingReview) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    // Determine target moderation status from action or explicit status
    let targetStatus: ModerationStatus | undefined = body.moderationStatus;
    if (body.action) {
      switch (body.action) {
        case "approve":
          targetStatus = "APPROVED";
          break;
        case "reject":
          targetStatus = "REJECTED";
          break;
        case "hide":
          targetStatus = "HIDDEN";
          break;
        case "restore":
          targetStatus = "APPROVED";
          break;
        case "changes_requested":
          targetStatus = "CHANGES_REQUESTED";
          break;
      }
    } else if (typeof body.active === "boolean") {
      targetStatus = body.active ? "APPROVED" : "HIDDEN";
    }

    const now = new Date();

    if (targetStatus) {
      // Rejection or hiding requires a reason
      if ((targetStatus === "REJECTED" || targetStatus === "HIDDEN") && !body.moderationReason?.trim()) {
        return NextResponse.json(
          { error: `A moderation reason is required when setting review to ${targetStatus}` },
          { status: 400 }
        );
      }

      updateData.moderationStatus = targetStatus;
      updateData.active = targetStatus === "APPROVED";
      updateData.moderatedAt = now;
      updateData.moderatedBy = request.headers.get("x-admin-username") || "administrator";
      if (body.moderationReason) {
        updateData.moderationReason = body.moderationReason.trim();
      }

      if (targetStatus === "APPROVED" && !existingReview.publishedAt) {
        updateData.publishedAt = now;
      }

      // Synchronize media approval in GridFS
      const mediaList: ReviewMediaItem[] = existingReview.media || [];
      const fileIds = mediaList
        .filter((m) => Boolean(m.fileId))
        .map((m) => m.fileId as string);

      if (fileIds.length > 0) {
        try {
          await markReviewMediaApproval(fileIds, targetStatus === "APPROVED", db);
        } catch (mErr) {
          console.warn("[ReviewModeration] Failed to synchronize media approval:", mErr);
        }
      }
    }

    if (typeof body.verified === "boolean") {
      updateData.verified = body.verified;
      updateData.verifiedStay = body.verified;
    }

    if (typeof body.featuredOnHomepage === "boolean") {
      updateData.featuredOnHomepage = body.featuredOnHomepage;
    }

    const result = await reviewsCollection.findOneAndUpdate(
      { _id: new ObjectId(id) },
      { $set: updateData },
      { returnDocument: "after" }
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating review:", error);
    return NextResponse.json({ error: "Failed to update review" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid review ID" }, { status: 400 });
    }

    // Role check: Property owners cannot delete reviews
    const isOwner = request.headers.get("x-owner-request") === "true";
    if (isOwner) {
      return NextResponse.json(
        { error: "Property owners cannot delete reviews." },
        { status: 403 }
      );
    }

    const db = await getDb();
    const reviewsCollection = db.collection("reviews");

    const result = await reviewsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    return NextResponse.json({
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json({ error: "Failed to delete review" }, { status: 500 });
  }
}
