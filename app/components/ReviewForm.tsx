"use client";

import React, { useState, useEffect } from "react";

interface ReviewFormProps {
  propertyId?: string;
  propertyName?: string;
  propertyType?: string;
  onSubmit: (review: any) => void;
  onClose: () => void;
}

interface BookedProperty {
  _id: string;
  name: string;
  type: string;
}

interface UserProfile {
  _id: string;
  name: string;
  image?: string;
  email: string;
}

export default function ReviewForm({
  propertyId: initialPropertyId,
  propertyName: initialPropertyName,
  propertyType: initialPropertyType,
  onSubmit,
  onClose,
}: ReviewFormProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authChecking, setAuthChecking] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bookedProperties, setBookedProperties] = useState<BookedProperty[]>(
    [],
  );
  const [loadingProperties, setLoadingProperties] = useState(false);

  const [selectedProperty, setSelectedProperty] = useState({
    id: initialPropertyId || "",
    name: initialPropertyName || "",
    type: initialPropertyType || "",
  });

  const [formData, setFormData] = useState({
    userName: "",
    userImage: "",
    rating: 5,
    reviewText: "",
    reviewImages: [] as string[],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Try the user profile endpoint (same as profile page)
        const response = await fetch("/api/user/profile", {
          method: "GET",
          credentials: "include", // Include cookies (for accessToken)
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("User profile data:", data); // Debug log

          // Extract user info from the response
          const userData = data.user || data;
          const profileData = data.profile || {};

          const userInfo = {
            _id: userData._id || userData.id,
            name: userData.name || profileData.name || userData.email || "User",
            email: userData.email || "",
            image:
              userData.image ||
              userData.profileImage ||
              profileData.profileImage ||
              "",
          };

          setUserProfile(userInfo);
          setIsAuthenticated(true);
          setFormData((prev) => ({
            ...prev,
            userName: userInfo.name,
            userImage: userInfo.image || "",
          }));
          fetchBookedProperties();
        } else {
          console.log("Auth response not ok:", response.status); // Debug log
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        setIsAuthenticated(false);
      } finally {
        setAuthChecking(false);
      }
    };
    checkAuth();
  }, []);

  const fetchBookedProperties = async () => {
    setLoadingProperties(true);
    try {
      const response = await fetch("/api/user/bookings", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        const properties = Array.from(
          new Map(
            (data.bookings || [])
              .filter((booking: any) => booking.propertyId)
              .map((booking: any) => [
                booking.propertyId,
                {
                  _id: booking.propertyId,
                  name: booking.propertyName,
                  type: booking.propertyType || "Homestay",
                },
              ]),
          ).values(),
        );
        setBookedProperties(properties as BookedProperty[]);
      }
    } catch (err) {
      console.error("Failed to fetch booked properties:", err);
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "rating" ? parseInt(value) : value,
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    try {
      const uploadFormData = new FormData();

      // Add all files to FormData at once
      for (let i = 0; i < files.length; i++) {
        uploadFormData.append("file", files[i]);
      }

      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();

        // Handle single or multiple file response
        const urls = data.files
          ? data.files.map((f: any) => f.url)
          : [data.url];

        // Add uploaded URLs to form data
        setFormData((prev) => ({
          ...prev,
          reviewImages: [...prev.reviewImages, ...urls],
        }));

        console.log("Images uploaded:", urls);
      } else {
        console.error("Failed to upload images");
        setError("Failed to upload images. Please try again.");
      }
    } catch (err) {
      console.error("Image upload error:", err);
      setError("Failed to upload images. Please try again.");
    }

    // Reset input so same files can be selected again
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      reviewImages: prev.reviewImages.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    if (!selectedProperty.id) {
      setError("Please select a property");
      setIsSubmitting(false);
      return;
    }

    if (!formData.reviewText.trim()) {
      setError("Please write your review");
      setIsSubmitting(false);
      return;
    }

    try {
      const reviewData = {
        ...formData,
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.name,
        propertyType: selectedProperty.type,
        userId: userProfile?._id,
      };

      console.log("Submitting review:", reviewData);

      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });

      const data = await response.json();
      console.log("Review submission response:", {
        status: response.status,
        data,
      });

      if (response.ok) {
        onSubmit(data.review);
        onClose();
      } else {
        setError(data.error || "Failed to submit review. Please try again.");
      }
    } catch (err) {
      console.error("Review submission error:", err);
      setError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't render anything while checking auth (silent check on backend)
  if (authChecking) {
    return null;
  }

  // Show login prompt if not authenticated (only after auth check is complete)
  if (!authChecking && !isAuthenticated) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 9999,
        }}
        onClick={onClose}
      >
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "24px",
            padding: "2rem",
            maxWidth: "500px",
            textAlign: "center",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: 900,
              marginBottom: "1rem",
            }}
          >
            Login Required
          </h2>
          <p style={{ color: "#666", marginBottom: "2rem" }}>
            Please log in to write a review.
          </p>
          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              onClick={() => {
                window.location.href = "/auth/login";
              }}
              style={{
                flex: 1,
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Log In
            </button>
            <button
              onClick={onClose}
              style={{
                flex: 1,
                padding: "0.75rem 1.5rem",
                background: "#f3f4f6",
                color: "#1a1a2e",
                border: "none",
                borderRadius: "12px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "24px",
          padding: "2rem",
          maxWidth: "600px",
          width: "90%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0, 0, 0, 0.3)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "1rem",
            right: "1rem",
            width: "40px",
            height: "40px",
            borderRadius: "50%",
            border: "none",
            background: "#f3f4f6",
            cursor: "pointer",
            fontSize: "1.5rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#e5e7eb";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#f3f4f6";
          }}
        >
          ✕
        </button>

        <h2
          style={{
            fontSize: "1.75rem",
            fontWeight: 900,
            color: "#1a1a2e",
            marginBottom: "0.5rem",
          }}
        >
          Share Your Experience
        </h2>
        <p
          style={{ color: "#666", marginBottom: "1.5rem", fontSize: "0.95rem" }}
        >
          Reviewing a property you've booked
        </p>

        {error && (
          <div
            style={{
              backgroundColor: "#fee2e2",
              color: "#dc2626",
              padding: "1rem",
              borderRadius: "12px",
              marginBottom: "1.5rem",
              fontSize: "0.9rem",
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "#1a1a2e",
                fontSize: "0.95rem",
              }}
            >
              Select Property *
            </label>
            {loadingProperties ? (
              <div style={{ color: "#666", padding: "0.75rem" }}>
                Loading your booked properties...
              </div>
            ) : bookedProperties.length === 0 ? (
              <div style={{ color: "#dc2626", padding: "0.75rem" }}>
                No booked properties found. Please book a property first.
              </div>
            ) : (
              <select
                value={selectedProperty.id}
                onChange={(e) => {
                  const property = bookedProperties.find(
                    (p) => p._id === e.target.value,
                  );
                  if (property) {
                    setSelectedProperty({
                      id: property._id,
                      name: property.name,
                      type: property.type,
                    });
                  }
                }}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
              >
                <option value="">-- Choose a property --</option>
                {bookedProperties.map((property) => (
                  <option key={property._id} value={property._id}>
                    {property.name} ({property.type})
                  </option>
                ))}
              </select>
            )}
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "#1a1a2e",
                fontSize: "0.95rem",
              }}
            >
              Your Name
            </label>
            <input
              type="text"
              value={formData.userName}
              disabled
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "0.95rem",
                background: "#f9fafb",
                color: "#1a1a2e",
                fontWeight: 500,
              }}
            />
            <p
              style={{
                color: "#999",
                fontSize: "0.8rem",
                marginTop: "0.25rem",
              }}
            >
              From your profile
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "#1a1a2e",
                fontSize: "0.95rem",
              }}
            >
              Rating *
            </label>
            <div style={{ display: "flex", gap: "0.5rem" }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, rating: star }))
                  }
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "12px",
                    border: "2px solid",
                    borderColor:
                      star <= formData.rating ? "#fbbf24" : "#e5e7eb",
                    background:
                      star <= formData.rating ? "#fef3c7" : "transparent",
                    cursor: "pointer",
                    fontSize: "1.5rem",
                    transition: "all 0.3s",
                  }}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "#1a1a2e",
                fontSize: "0.95rem",
              }}
            >
              Your Review *
            </label>
            <textarea
              name="reviewText"
              value={formData.reviewText}
              onChange={handleInputChange}
              placeholder="Share your experience..."
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                border: "1px solid #e5e7eb",
                borderRadius: "12px",
                fontSize: "0.95rem",
                boxSizing: "border-box",
                fontFamily: "inherit",
                minHeight: "120px",
                resize: "vertical",
              }}
            />
            <p
              style={{
                color: "#999",
                fontSize: "0.85rem",
                marginTop: "0.25rem",
              }}
            >
              {formData.reviewText.length} characters
            </p>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontWeight: 600,
                marginBottom: "0.5rem",
                color: "#1a1a2e",
                fontSize: "0.95rem",
              }}
            >
              Upload Photos (Optional)
            </label>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              style={{
                display: "block",
                width: "100%",
                padding: "1rem",
                border: "2px dashed #e5e7eb",
                borderRadius: "12px",
                cursor: "pointer",
              }}
            />
            {formData.reviewImages.length > 0 && (
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginTop: "1rem",
                  flexWrap: "wrap",
                }}
              >
                {formData.reviewImages.map((image, index) => (
                  <div
                    key={index}
                    style={{
                      position: "relative",
                      width: "80px",
                      height: "80px",
                      borderRadius: "12px",
                      overflow: "hidden",
                    }}
                  >
                    <img
                      src={image}
                      alt={`Upload ${index}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      style={{
                        position: "absolute",
                        top: "4px",
                        right: "4px",
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: "rgba(0, 0, 0, 0.6)",
                        color: "white",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !selectedProperty.id ||
              bookedProperties.length === 0
            }
            style={{
              width: "100%",
              padding: "1rem",
              background:
                isSubmitting ||
                !selectedProperty.id ||
                bookedProperties.length === 0
                  ? "#d1d5db"
                  : "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
              color: "white",
              border: "none",
              borderRadius: "12px",
              fontSize: "1rem",
              fontWeight: 700,
              cursor:
                isSubmitting ||
                !selectedProperty.id ||
                bookedProperties.length === 0
                  ? "not-allowed"
                  : "pointer",
              transition: "all 0.3s",
              boxShadow: "0 4px 15px rgba(0, 102, 204, 0.25)",
            }}
          >
            {isSubmitting ? "Submitting..." : "Submit Review"}
          </button>
        </form>
      </div>
    </div>
  );
}
