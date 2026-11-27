"use client";

import React, { useState, useEffect } from "react";

interface ReviewMedia {
  type: "photo" | "video";
  url: string;
  thumbnailUrl?: string;
  fileId?: string;
}

interface Review {
  _id: string;
  bookingId?: string;
  userId: string;
  userName: string;
  reviewerDisplayName?: string;
  userImage: string;
  propertyId: string;
  propertyName: string;
  propertyCity?: string;
  propertyState?: string;
  propertyType: string;
  rating: number;
  overallRating?: number;
  reviewTitle?: string;
  reviewText: string;
  reviewImages: string[];
  photos?: string[];
  videos?: string[];
  media?: ReviewMedia[];
  recommendProperty?: boolean;
  createdAt: string;
  submittedAt?: string;
  moderationStatus?: "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN" | "CHANGES_REQUESTED";
  moderationReason?: string;
  moderatedBy?: string;
  moderatedAt?: string;
  verified: boolean;
  verifiedStay?: boolean;
  active: boolean;
  featuredOnHomepage?: boolean;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN">("all");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "rating-high" | "rating-low">("newest");

  // Rejection/Hide Reason Modal
  const [reasonModalOpen, setReasonModalOpen] = useState(false);
  const [targetReviewId, setTargetReviewId] = useState<string | null>(null);
  const [targetAction, setTargetAction] = useState<"reject" | "hide" | null>(null);
  const [moderationReason, setModerationReason] = useState("");
  const [actionProcessing, setActionProcessing] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/reviews?admin=true&limit=10000", {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setReviews(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = async (
    reviewId: string,
    action: "approve" | "restore"
  ) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        const updated = await response.json();
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId
              ? {
                  ...r,
                  moderationStatus: "APPROVED",
                  active: true,
                  moderatedAt: new Date().toISOString(),
                }
              : r
          )
        );
      }
    } catch (error) {
      console.error("Failed to update review status:", error);
    }
  };

  const handleToggleHomepageFeature = async (
    reviewId: string,
    currentFeatured?: boolean
  ) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ featuredOnHomepage: !currentFeatured }),
      });

      if (response.ok) {
        setReviews((prev) =>
          prev.map((r) =>
            r._id === reviewId ? { ...r, featuredOnHomepage: !currentFeatured } : r
          )
        );
      }
    } catch (error) {
      console.error("Failed to toggle homepage feature:", error);
    }
  };

  const openReasonModal = (reviewId: string, action: "reject" | "hide") => {
    setTargetReviewId(reviewId);
    setTargetAction(action);
    setModerationReason("");
    setReasonModalOpen(true);
  };

  const submitReasonModal = async () => {
    if (!targetReviewId || !targetAction) return;
    if (!moderationReason.trim()) {
      alert("Please provide a moderation reason.");
      return;
    }

    try {
      setActionProcessing(true);
      const response = await fetch(`/api/reviews/${targetReviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: targetAction,
          moderationReason: moderationReason.trim(),
        }),
      });

      if (response.ok) {
        const newStatus = targetAction === "reject" ? "REJECTED" : "HIDDEN";
        setReviews((prev) =>
          prev.map((r) =>
            r._id === targetReviewId
              ? {
                  ...r,
                  moderationStatus: newStatus,
                  active: false,
                  moderationReason: moderationReason.trim(),
                  moderatedAt: new Date().toISOString(),
                }
              : r
          )
        );
        setReasonModalOpen(false);
      } else {
        const err = await response.json();
        alert(err.error || "Failed to update review.");
      }
    } catch (error) {
      console.error("Failed to apply moderation action:", error);
      alert("Failed to apply moderation action.");
    } finally {
      setActionProcessing(false);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to permanently delete this review?")) return;

    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setReviews(reviews.filter((review) => review._id !== reviewId));
      }
    } catch (error) {
      console.error("Failed to delete review:", error);
    }
  };

  const filteredReviews = reviews
    .filter((review) => {
      const status = review.moderationStatus || (review.active ? "APPROVED" : "PENDING");
      if (activeTab === "all") return true;
      return status === activeTab;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "rating-high":
          return (b.overallRating || b.rating) - (a.overallRating || a.rating);
        case "rating-low":
          return (a.overallRating || a.rating) - (b.overallRating || b.rating);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", paddingTop: "5rem" }}>
        <p>Loading guest reviews...</p>
      </div>
    );
  }

  const pendingCount = reviews.filter(
    (r) => (r.moderationStatus === "PENDING" || (!r.active && !r.moderationStatus))
  ).length;
  const approvedCount = reviews.filter(
    (r) => (r.moderationStatus === "APPROVED" || (r.active && !r.moderationStatus))
  ).length;
  const rejectedCount = reviews.filter((r) => r.moderationStatus === "REJECTED").length;
  const hiddenCount = reviews.filter((r) => r.moderationStatus === "HIDDEN").length;

  return (
    <div
      style={{
        padding: "2rem",
        paddingTop: "5rem",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap", gap: "1rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 700, margin: 0 }}>
          Guest Reviews & Moderation Engine
        </h1>
        <button
          onClick={fetchReviews}
          style={{
            padding: "0.5rem 1rem",
            background: "#f1f5f9",
            border: "1px solid #cbd5e1",
            borderRadius: "6px",
            fontSize: "0.85rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          🔄 Refresh Reviews
        </button>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
        }}
      >
        <div
          onClick={() => setActiveTab("PENDING")}
          style={{
            background: "#fef3c7",
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            border: activeTab === "PENDING" ? "2px solid #d97706" : "1px solid #fcd34d",
            cursor: "pointer",
            flex: "1 1 180px",
          }}
        >
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#d97706" }}>
            {pendingCount}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#92400e", fontWeight: 600 }}>
            Pending Moderation
          </div>
        </div>

        <div
          onClick={() => setActiveTab("APPROVED")}
          style={{
            background: "#d1fae5",
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            border: activeTab === "APPROVED" ? "2px solid #059669" : "1px solid #6ee7b7",
            cursor: "pointer",
            flex: "1 1 180px",
          }}
        >
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#059669" }}>
            {approvedCount}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#065f46", fontWeight: 600 }}>
            Approved &amp; Published
          </div>
        </div>

        <div
          onClick={() => setActiveTab("REJECTED")}
          style={{
            background: "#fee2e2",
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            border: activeTab === "REJECTED" ? "2px solid #dc2626" : "1px solid #fca5a5",
            cursor: "pointer",
            flex: "1 1 180px",
          }}
        >
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#dc2626" }}>
            {rejectedCount}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#991b1b", fontWeight: 600 }}>
            Rejected
          </div>
        </div>

        <div
          onClick={() => setActiveTab("HIDDEN")}
          style={{
            background: "#f1f5f9",
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            border: activeTab === "HIDDEN" ? "2px solid #475569" : "1px solid #cbd5e1",
            cursor: "pointer",
            flex: "1 1 180px",
          }}
        >
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#475569" }}>
            {hiddenCount}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#334155", fontWeight: 600 }}>
            Hidden
          </div>
        </div>

        <div
          onClick={() => setActiveTab("all")}
          style={{
            background: "#ffffff",
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            border: activeTab === "all" ? "2px solid #2563eb" : "1px solid #e2e8f0",
            cursor: "pointer",
            flex: "1 1 180px",
          }}
        >
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b" }}>
            {reviews.length}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#64748b", fontWeight: 600 }}>
            Total Reviews
          </div>
        </div>
      </div>

      {/* Tabs & Sorting */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          flexWrap: "wrap",
          alignItems: "center",
          background: "#ffffff",
          padding: "1rem",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {(["all", "PENDING", "APPROVED", "REJECTED", "HIDDEN"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{
                padding: "0.45rem 0.9rem",
                borderRadius: "6px",
                border: "none",
                background: activeTab === tab ? "#0066cc" : "#f1f5f9",
                color: activeTab === tab ? "white" : "#475569",
                fontSize: "0.85rem",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {tab === "all" ? "All Reviews" : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#475569" }}>
            Sort:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: "0.45rem 0.75rem",
              borderRadius: "6px",
              border: "1px solid #cbd5e1",
              fontSize: "0.85rem",
              cursor: "pointer",
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      <div style={{ display: "grid", gap: "1.25rem" }}>
        {filteredReviews.length === 0 ? (
          <div
            style={{
              padding: "3rem 1.5rem",
              textAlign: "center",
              background: "#ffffff",
              borderRadius: "12px",
              border: "1px solid #e2e8f0",
              color: "#64748b",
            }}
          >
            No reviews matching the selected filter.
          </div>
        ) : (
          filteredReviews.map((review) => {
            const status = review.moderationStatus || (review.active ? "APPROVED" : "PENDING");
            const isVerified = review.verifiedStay === true || review.verified === true;
            const starCount = review.overallRating || review.rating || 5;

            return (
              <div
                key={review._id}
                style={{
                  background: "white",
                  border: `1.5px solid ${
                    status === "APPROVED"
                      ? "#10b981"
                      : status === "PENDING"
                      ? "#f59e0b"
                      : status === "REJECTED"
                      ? "#ef4444"
                      : "#94a3b8"
                  }`,
                  borderRadius: "12px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                  position: "relative",
                }}
              >
                {/* Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "0.75rem",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                      <span style={{ fontWeight: 800, fontSize: "1.15rem", color: "#0f172a" }}>
                        {review.propertyName || "YatraExpertz Journey"}
                      </span>
                      {isVerified && (
                        <span
                          style={{
                            background: "#ecfdf5",
                            color: "#059669",
                            border: "1px solid #a7f3d0",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "12px",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          ✓ Verified Stay
                        </span>
                      )}
                      {review.bookingId && (
                        <span style={{ fontSize: "0.75rem", color: "#64748b", background: "#f1f5f9", padding: "2px 6px", borderRadius: "4px" }}>
                          Booking: {review.bookingId}
                        </span>
                      )}
                    </div>
                    <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "2px" }}>
                      {review.propertyCity && <span>📍 {review.propertyCity} • </span>}
                      <span>Type: {review.propertyType || "Hotel"}</span>
                    </div>
                  </div>

                  <div style={{ textAlign: "right" }}>
                    <div style={{ color: "#f59e0b", fontSize: "1.1rem", fontWeight: 700 }}>
                      {"★".repeat(starCount)}
                      <span style={{ color: "#e2e8f0" }}>{"★".repeat(5 - starCount)}</span>
                    </div>
                    <div style={{ fontSize: "0.8rem", color: "#94a3b8", marginTop: "2px" }}>
                      Submitted: {new Date(review.submittedAt || review.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                {/* Reviewer Info */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    marginBottom: "0.75rem",
                    paddingBottom: "0.75rem",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <div
                    style={{
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 700,
                      fontSize: "0.9rem",
                    }}
                  >
                    {(review.reviewerDisplayName || review.userName || "G").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: "0.9rem", color: "#1e293b" }}>
                      {review.reviewerDisplayName || review.userName}
                    </div>
                    {typeof review.recommendProperty === "boolean" && (
                      <div style={{ fontSize: "0.75rem", color: review.recommendProperty ? "#059669" : "#dc2626", fontWeight: 600 }}>
                        {review.recommendProperty ? "👍 Recommends this property" : "👎 Does not recommend"}
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Content */}
                <div style={{ marginBottom: "1rem" }}>
                  {review.reviewTitle && (
                    <h4 style={{ margin: "0 0 0.4rem 0", fontSize: "1rem", fontWeight: 700, color: "#0f172a" }}>
                      {review.reviewTitle}
                    </h4>
                  )}
                  <p style={{ color: "#334155", lineHeight: 1.6, margin: "0 0 0.75rem 0", fontSize: "0.925rem" }}>
                    {review.reviewText}
                  </p>

                  {/* Media Previews */}
                  {((review.media && review.media.length > 0) ||
                    (review.reviewImages && review.reviewImages.length > 0)) && (
                    <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                      {review.media && review.media.length > 0
                        ? review.media.map((m, idx) => (
                            <div
                              key={idx}
                              style={{
                                position: "relative",
                                width: "130px",
                                aspectRatio: "16 / 9",
                                borderRadius: "8px",
                                overflow: "hidden",
                                background: "#0f172a",
                                border: "1px solid #cbd5e1",
                              }}
                            >
                              {m.type === "photo" ? (
                                <img
                                  src={m.url}
                                  alt="Review attachment"
                                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                />
                              ) : (
                                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: "0.75rem", fontWeight: 700 }}>
                                  📹 Video
                                </div>
                              )}
                              <span
                                style={{
                                  position: "absolute",
                                  top: "4px",
                                  left: "4px",
                                  padding: "1px 5px",
                                  borderRadius: "3px",
                                  fontSize: "0.65rem",
                                  fontWeight: 700,
                                  background: m.type === "photo" ? "#0066cc" : "#7c3aed",
                                  color: "white",
                                }}
                              >
                                {m.type === "photo" ? "Photo" : "Video"}
                              </span>
                            </div>
                          ))
                        : review.reviewImages.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt="Review"
                              style={{
                                width: "110px",
                                height: "70px",
                                objectFit: "cover",
                                borderRadius: "6px",
                                border: "1px solid #cbd5e1",
                              }}
                            />
                          ))}
                    </div>
                  )}

                  {/* Moderation Details if Rejected or Hidden */}
                  {review.moderationReason && (
                    <div style={{ marginTop: "0.75rem", padding: "0.5rem 0.75rem", background: "#fef2f2", borderLeft: "3px solid #ef4444", borderRadius: "4px", fontSize: "0.8rem", color: "#991b1b" }}>
                      <strong>Moderation Reason:</strong> {review.moderationReason}
                      {review.moderatedAt && (
                        <span style={{ marginLeft: "8px", color: "#64748b" }}>
                          ({new Date(review.moderatedAt).toLocaleDateString()})
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Moderation Action Buttons */}
                <div
                  style={{
                    display: "flex",
                    gap: "0.6rem",
                    paddingTop: "0.75rem",
                    borderTop: "1px solid #f1f5f9",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  {status !== "APPROVED" && (
                    <button
                      onClick={() => handleModerationAction(review._id, "approve")}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "8px",
                        border: "none",
                        background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                        color: "white",
                        cursor: "pointer",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      ✓ Approve &amp; Publish
                    </button>
                  )}

                  {status !== "REJECTED" && (
                    <button
                      onClick={() => openReasonModal(review._id, "reject")}
                      style={{
                        padding: "0.5rem 0.9rem",
                        borderRadius: "8px",
                        border: "1px solid #fca5a5",
                        background: "#fff1f2",
                        color: "#dc2626",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      ✕ Reject Review
                    </button>
                  )}

                  {status === "APPROVED" && (
                    <button
                      onClick={() => openReasonModal(review._id, "hide")}
                      style={{
                        padding: "0.5rem 0.9rem",
                        borderRadius: "8px",
                        border: "1px solid #cbd5e1",
                        background: "#f8fafc",
                        color: "#475569",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      Hide Review
                    </button>
                  )}

                  {status === "HIDDEN" && (
                    <button
                      onClick={() => handleModerationAction(review._id, "restore")}
                      style={{
                        padding: "0.5rem 0.9rem",
                        borderRadius: "8px",
                        border: "1px solid #6ee7b7",
                        background: "#ecfdf5",
                        color: "#059669",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      Restore to Published
                    </button>
                  )}

                  {/* Feature on Homepage Toggle */}
                  {status === "APPROVED" && (
                    <button
                      onClick={() => handleToggleHomepageFeature(review._id, review.featuredOnHomepage)}
                      style={{
                        padding: "0.5rem 0.9rem",
                        borderRadius: "8px",
                        border: review.featuredOnHomepage ? "1px solid #fcd34d" : "1px solid #e2e8f0",
                        background: review.featuredOnHomepage ? "#fef3c7" : "#ffffff",
                        color: review.featuredOnHomepage ? "#92400e" : "#64748b",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                      }}
                    >
                      {review.featuredOnHomepage ? "⭐ Featured on Home" : "Feature on Home"}
                    </button>
                  )}

                  <button
                    onClick={() => handleDeleteReview(review._id)}
                    style={{
                      padding: "0.5rem 0.75rem",
                      borderRadius: "8px",
                      border: "none",
                      background: "transparent",
                      color: "#94a3b8",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      marginLeft: "auto",
                    }}
                    title="Delete permanently"
                  >
                    Delete
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Moderation Reason Modal */}
      {reasonModalOpen && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(15, 23, 42, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "1.75rem",
              maxWidth: "480px",
              width: "100%",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
          >
            <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.2rem", fontWeight: 700, color: "#0f172a" }}>
              {targetAction === "reject" ? "Reject Review" : "Hide Review"}
            </h3>
            <p style={{ margin: "0 0 1rem 0", fontSize: "0.85rem", color: "#64748b", lineHeight: 1.5 }}>
              Please specify the internal moderation reason for {targetAction === "reject" ? "rejecting" : "hiding"} this review. Moderation policies must apply fairly regardless of positive or negative ratings.
            </p>

            <textarea
              rows={4}
              value={moderationReason}
              onChange={(e) => setModerationReason(e.target.value)}
              placeholder="e.g. Inappropriate language, off-topic spam, or privacy policy violation..."
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #cbd5e1",
                fontSize: "0.85rem",
                boxSizing: "border-box",
                marginBottom: "1rem",
                fontFamily: "inherit",
              }}
            />

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                type="button"
                onClick={() => setReasonModalOpen(false)}
                disabled={actionProcessing}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #cbd5e1",
                  background: "#ffffff",
                  color: "#475569",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submitReasonModal}
                disabled={actionProcessing || !moderationReason.trim()}
                style={{
                  padding: "0.5rem 1.25rem",
                  borderRadius: "8px",
                  border: "none",
                  background: targetAction === "reject" ? "#dc2626" : "#475569",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                {actionProcessing ? "Saving..." : `Confirm ${targetAction === "reject" ? "Rejection" : "Hiding"}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
