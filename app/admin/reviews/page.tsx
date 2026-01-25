"use client";

import React, { useState, useEffect } from "react";

interface Review {
  _id: string;
  userId: string;
  userName: string;
  userImage: string;
  propertyId: string;
  propertyName: string;
  propertyType: string;
  rating: number;
  reviewText: string;
  reviewImages: string[];
  createdAt: string;
  verified: boolean;
  active: boolean;
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterActive, setFilterActive] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [sortBy, setSortBy] = useState<
    "newest" | "oldest" | "rating-high" | "rating-low"
  >("newest");

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

  const handleToggleActive = async (
    reviewId: string,
    currentActive: boolean,
  ) => {
    try {
      const response = await fetch(`/api/reviews/${reviewId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (response.ok) {
        setReviews(
          reviews.map((review) =>
            review._id === reviewId
              ? { ...review, active: !currentActive }
              : review,
          ),
        );
      }
    } catch (error) {
      console.error("Failed to update review:", error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm("Are you sure you want to delete this review?")) return;

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
      if (filterActive === "active") return review.active;
      if (filterActive === "inactive") return !review.active;
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case "oldest":
          return (
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          );
        case "rating-high":
          return b.rating - a.rating;
        case "rating-low":
          return a.rating - b.rating;
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Loading reviews...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "2rem" }}>
        Guest Reviews Management
      </h1>

      {/* Filters & Sorting */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <div>
          <label style={{ fontWeight: 600, marginRight: "0.5rem" }}>
            Filter:
          </label>
          <select
            value={filterActive}
            onChange={(e) => setFilterActive(e.target.value as any)}
            style={{
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ddd",
              cursor: "pointer",
            }}
          >
            <option value="all">All Reviews</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>

        <div>
          <label style={{ fontWeight: 600, marginRight: "0.5rem" }}>
            Sort by:
          </label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            style={{
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid #ddd",
              cursor: "pointer",
            }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="rating-high">Highest Rating</option>
            <option value="rating-low">Lowest Rating</option>
          </select>
        </div>

        <div style={{ marginLeft: "auto", fontWeight: 600 }}>
          Total: {filteredReviews.length} reviews
        </div>
      </div>

      {/* Reviews List */}
      <div
        style={{
          display: "grid",
          gap: "1.5rem",
        }}
      >
        {filteredReviews.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              background: "#f5f5f5",
              borderRadius: "8px",
              color: "#666",
            }}
          >
            No reviews found
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div
              key={review._id}
              style={{
                background: "white",
                border: `2px solid ${review.active ? "#10b981" : "#ef4444"}`,
                borderRadius: "8px",
                padding: "1.5rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              }}
            >
              {/* Header */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {review.propertyName}
                  </div>
                  <div style={{ color: "#666", fontSize: "0.9rem" }}>
                    Property Type: {review.propertyType}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div
                    style={{
                      color: "#f59e0b",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                    }}
                  >
                    {"★".repeat(review.rating)}
                    <span style={{ color: "#ddd" }}>
                      {"★".repeat(5 - review.rating)}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#999" }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {/* User Info */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1rem",
                  marginBottom: "1rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid #eee",
                }}
              >
                {review.userImage ? (
                  <img
                    src={review.userImage}
                    alt={review.userName}
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      objectFit: "cover",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "50%",
                      background:
                        "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: 600,
                    }}
                  >
                    {review.userName?.charAt(0).toUpperCase() || "U"}
                  </div>
                )}
                <div>
                  <div style={{ fontWeight: 600 }}>{review.userName}</div>
                  <div style={{ fontSize: "0.85rem", color: "#999" }}>
                    User ID: {review.userId}
                  </div>
                </div>
              </div>

              {/* Review Content */}
              <div style={{ marginBottom: "1rem" }}>
                <p
                  style={{
                    color: "#333",
                    lineHeight: "1.6",
                    margin: "0 0 1rem 0",
                  }}
                >
                  {review.reviewText}
                </p>

                {/* Review Images */}
                {review.reviewImages && review.reviewImages.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fill, minmax(100px, 1fr))",
                      gap: "0.5rem",
                    }}
                  >
                    {review.reviewImages.map((img, idx) => (
                      <img
                        key={idx}
                        src={img}
                        alt={`Review image ${idx + 1}`}
                        style={{
                          width: "100%",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  paddingTop: "1rem",
                  borderTop: "1px solid #eee",
                }}
              >
                <button
                  onClick={() => handleToggleActive(review._id, review.active)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    border: "none",
                    background: review.active ? "#ef4444" : "#10b981",
                    color: "white",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {review.active ? "Deactivate" : "Activate"}
                </button>
                <button
                  onClick={() => handleDeleteReview(review._id)}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "4px",
                    border: "1px solid #ef4444",
                    background: "white",
                    color: "#ef4444",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Delete
                </button>
                <div
                  style={{
                    marginLeft: "auto",
                    padding: "0.5rem 1rem",
                    background: review.active ? "#d1fae5" : "#fee2e2",
                    borderRadius: "4px",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    color: review.active ? "#065f46" : "#991b1b",
                  }}
                >
                  {review.active ? "✓ Active" : "✗ Inactive"}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
