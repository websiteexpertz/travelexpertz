"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Camera,
  Video,
  X,
  UploadCloud,
  CheckCircle2,
  Building2,
  MapPin,
  Sparkles,
} from "lucide-react";

interface AddReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface PropertyOption {
  id: string;
  name: string;
  city: string;
  state: string;
  type: string;
}

export default function AddReviewModal({
  isOpen,
  onClose,
  onSuccess,
}: AddReviewModalProps) {
  const [userName, setUserName] = useState("");
  const [userImage, setUserImage] = useState("");
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [propertyName, setPropertyName] = useState("");
  const [propertyCity, setPropertyCity] = useState("");
  const [propertyState, setPropertyState] = useState("");
  const [propertyId, setPropertyId] = useState("");
  const [propertyType, setPropertyType] = useState("Property");
  const [reviewText, setReviewText] = useState("");

  const [mediaList, setMediaList] = useState<
    Array<{ type: "photo" | "video"; url: string; thumbnailUrl?: string }>
  >([]);

  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchProperties();
      setSubmitted(false);
      setErrorMsg("");
    }
  }, [isOpen]);

  const fetchProperties = async () => {
    try {
      const [hotelsRes, homestaysRes] = await Promise.allSettled([
        fetch("/api/hotels").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/homestays").then((r) => (r.ok ? r.json() : [])),
      ]);

      const hList =
        hotelsRes.status === "fulfilled" && Array.isArray(hotelsRes.value)
          ? hotelsRes.value
          : [];
      const hsList =
        homestaysRes.status === "fulfilled" && Array.isArray(homestaysRes.value)
          ? homestaysRes.value
          : [];

      const combined: PropertyOption[] = [
        ...hList.map((h: any) => ({
          id: h._id || h.id || "",
          name: h.name || h.hotelName || "",
          city: h.city || "",
          state: h.state || "",
          type: "Hotel",
        })),
        ...hsList.map((hs: any) => ({
          id: hs._id || hs.id || "",
          name: hs.name || hs.homestayName || "",
          city: hs.city || "",
          state: hs.state || "",
          type: "Homestay",
        })),
      ].filter((p) => p.name);

      setProperties(combined);
    } catch (e) {
      console.error("Failed to load properties for review form:", e);
    }
  };

  const handlePropertySelect = (pId: string) => {
    if (!pId) {
      setPropertyId("");
      return;
    }
    const prop = properties.find((p) => p.id === pId);
    if (prop) {
      setPropertyId(prop.id);
      setPropertyName(prop.name);
      setPropertyCity(prop.city);
      setPropertyState(prop.state);
      setPropertyType(prop.type);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      if (res.ok) {
        const data = await res.json();
        setUserImage(data.url);
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "photo" | "video",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingMedia(true);
    const body = new FormData();
    body.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body });
      if (res.ok) {
        const data = await res.json();
        setMediaList((prev) => [
          ...prev,
          {
            type,
            url: data.url,
            thumbnailUrl: type === "photo" ? data.url : "/hero4.jpeg",
          },
        ]);
      }
    } catch (err) {
      console.error("Media upload failed:", err);
      alert("Failed to upload media. Please try again.");
    } finally {
      setUploadingMedia(false);
      e.target.value = "";
    }
  };

  const removeMedia = (index: number) => {
    setMediaList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userName.trim()) {
      setErrorMsg("Please enter your name.");
      return;
    }
    if (!reviewText.trim()) {
      setErrorMsg("Please write your review description.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const payload = {
        userName: userName.trim(),
        userImage,
        rating,
        reviewText: reviewText.trim(),
        propertyId: propertyId || "homepage_review",
        propertyName: propertyName.trim() || "YatraExpertz Journey",
        propertyCity: propertyCity.trim(),
        propertyState: propertyState.trim(),
        propertyType,
        media: mediaList,
        reviewImages: mediaList
          .filter((m) => m.type === "photo")
          .map((m) => m.url),
      };

      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setSubmitted(true);
        if (onSuccess) onSuccess();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to submit review.");
      }
    } catch (err) {
      console.error("Review submission error:", err);
      setErrorMsg("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setUserName("");
    setUserImage("");
    setRating(5);
    setPropertyName("");
    setPropertyCity("");
    setPropertyState("");
    setPropertyId("");
    setReviewText("");
    setMediaList([]);
    setSubmitted(false);
    setErrorMsg("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        overflowY: "auto",
      }}
      onClick={resetForm}
    >
      <div
        style={{
          background: "white",
          borderRadius: "20px",
          width: "100%",
          maxWidth: "600px",
          padding: "2rem",
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto",
          boxSizing: "border-box",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={resetForm}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "#f1f5f9",
            border: "none",
            borderRadius: "50%",
            width: "36px",
            height: "36px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748b",
            transition: "all 0.2s ease",
          }}
          aria-label="Close review modal"
        >
          <X size={18} />
        </button>

        {submitted ? (
          /* Success Screen */
          <div style={{ textAlign: "center", padding: "2rem 1rem" }}>
            <div
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "50%",
                background: "#dcfce7",
                color: "#16a34a",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1.25rem",
              }}
            >
              <CheckCircle2 size={38} />
            </div>

            <h3
              style={{
                margin: "0 0 0.5rem",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              Thank You for Sharing Your Journey!
            </h3>

            <p
              style={{
                color: "#475569",
                fontSize: "0.95rem",
                lineHeight: 1.6,
                maxWidth: "460px",
                margin: "0 auto 1.5rem",
              }}
            >
              Your review has been submitted for verification. To maintain authentic
              and reliable community stories, our admin team will review and approve
              it at <strong>/admin/reviews</strong> before it appears on the
              homepage!
            </p>

            <button
              type="button"
              onClick={resetForm}
              style={{
                padding: "0.75rem 2rem",
                background: "#0b6dff",
                color: "white",
                border: "none",
                borderRadius: "10px",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
                boxShadow: "0 4px 14px rgba(11, 109, 255, 0.3)",
              }}
            >
              Done
            </button>
          </div>
        ) : (
          /* Review Form */
          <div>
            <div style={{ marginBottom: "1.5rem", paddingRight: "2rem" }}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "4px 10px",
                  borderRadius: "20px",
                  background: "#eff6ff",
                  color: "#0b6dff",
                  fontSize: "0.78rem",
                  fontWeight: 700,
                  marginBottom: "0.5rem",
                }}
              >
                <Sparkles size={13} />
                Stories of Happy Journeys
              </div>
              <h2
                style={{
                  margin: "0 0 0.4rem",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#0f172a",
                }}
              >
                Share Your Experience
              </h2>
              <p style={{ margin: 0, color: "#64748b", fontSize: "0.88rem" }}>
                Inspire fellow travellers! All submitted reviews are verified by our
                admin team before appearing on the homepage.
              </p>
            </div>

            {errorMsg && (
              <div
                style={{
                  padding: "0.75rem 1rem",
                  background: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: "8px",
                  fontSize: "0.85rem",
                  marginBottom: "1rem",
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.1rem" }}>
              {/* Row 1: Name and Avatar */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr auto",
                  gap: "1rem",
                  alignItems: "flex-end",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.35rem",
                      fontWeight: 600,
                      color: "#334155",
                      fontSize: "0.88rem",
                    }}
                  >
                    Your Name *
                  </label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="e.g. Rahul Sharma / Priya Patel"
                    required
                    style={{
                      width: "100%",
                      padding: "0.7rem 0.9rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "0.92rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.35rem",
                      fontWeight: 600,
                      color: "#334155",
                      fontSize: "0.88rem",
                    }}
                  >
                    Photo (Optional)
                  </label>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "0.65rem 0.9rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      background: "#f8fafc",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      color: "#475569",
                      cursor: "pointer",
                    }}
                  >
                    {userImage ? (
                      <img
                        src={userImage}
                        alt="Profile avatar"
                        style={{
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <UploadCloud size={16} />
                    )}
                    {uploadingAvatar
                      ? "Uploading..."
                      : userImage
                      ? "Change"
                      : "Add Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      style={{ display: "none" }}
                    />
                  </label>
                </div>
              </div>

              {/* Row 2: Star Rating */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.35rem",
                    fontWeight: 600,
                    color: "#334155",
                    fontSize: "0.88rem",
                  }}
                >
                  Your Rating *
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px",
                        transition: "transform 0.15s ease",
                      }}
                      title={`${s} Star${s > 1 ? "s" : ""}`}
                    >
                      <Star
                        size={28}
                        fill={
                          s <= (hoverRating || rating) ? "#f59e0b" : "none"
                        }
                        color={
                          s <= (hoverRating || rating) ? "#f59e0b" : "#cbd5e1"
                        }
                      />
                    </button>
                  ))}
                  <span
                    style={{
                      marginLeft: "8px",
                      fontWeight: 700,
                      color: "#1e293b",
                      fontSize: "0.9rem",
                    }}
                  >
                    {rating === 5
                      ? "5.0 — Outstanding!"
                      : rating === 4
                      ? "4.0 — Very Good!"
                      : rating === 3
                      ? "3.0 — Good"
                      : rating === 2
                      ? "2.0 — Fair"
                      : "1.0 — Poor"}
                  </span>
                </div>
              </div>

              {/* Row 3: Property Selection or Manual Entry */}
              <div
                style={{
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "10px",
                  padding: "0.9rem",
                }}
              >
                <div style={{ marginBottom: "0.6rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.3rem",
                      fontWeight: 600,
                      color: "#1e293b",
                      fontSize: "0.85rem",
                    }}
                  >
                    Select Visited Property / Stay (Optional)
                  </label>
                  <select
                    value={propertyId}
                    onChange={(e) => handlePropertySelect(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.6rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      background: "white",
                      fontSize: "0.88rem",
                    }}
                  >
                    <option value="">-- Choose from our verified stays --</option>
                    {properties.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.city}, {p.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1.5fr 1fr 1fr",
                    gap: "0.6rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.25rem",
                        fontSize: "0.78rem",
                        color: "#475569",
                        fontWeight: 600,
                      }}
                    >
                      Property Name
                    </label>
                    <input
                      type="text"
                      value={propertyName}
                      onChange={(e) => setPropertyName(e.target.value)}
                      placeholder="e.g. Manali Himalayan Homestay"
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        background: "white",
                        fontSize: "0.85rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.25rem",
                        fontSize: "0.78rem",
                        color: "#475569",
                        fontWeight: 600,
                      }}
                    >
                      City
                    </label>
                    <input
                      type="text"
                      value={propertyCity}
                      onChange={(e) => setPropertyCity(e.target.value)}
                      placeholder="e.g. Manali"
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        background: "white",
                        fontSize: "0.85rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.25rem",
                        fontSize: "0.78rem",
                        color: "#475569",
                        fontWeight: 600,
                      }}
                    >
                      State
                    </label>
                    <input
                      type="text"
                      value={propertyState}
                      onChange={(e) => setPropertyState(e.target.value)}
                      placeholder="e.g. Himachal"
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        background: "white",
                        fontSize: "0.85rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* Row 4: Review Text */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.35rem",
                    fontWeight: 600,
                    color: "#334155",
                    fontSize: "0.88rem",
                  }}
                >
                  Your Review / Story *
                </label>
                <textarea
                  rows={4}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share details of your journey — the hospitality, stunning views, ease of booking, or memorable highlights..."
                  required
                  style={{
                    width: "100%",
                    padding: "0.7rem 0.9rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "0.92rem",
                    fontFamily: "inherit",
                    lineHeight: 1.5,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Row 5: Attach Photos or Video */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "0.4rem",
                  }}
                >
                  <label
                    style={{
                      fontWeight: 600,
                      color: "#334155",
                      fontSize: "0.88rem",
                    }}
                  >
                    Add Photos or Video (Optional)
                  </label>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "4px 10px",
                        background: "#f1f5f9",
                        borderRadius: "6px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "#0b6dff",
                        cursor: "pointer",
                      }}
                    >
                      <Camera size={14} /> + Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleMediaUpload(e, "photo")}
                        disabled={uploadingMedia}
                        style={{ display: "none" }}
                      />
                    </label>

                    <label
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        padding: "4px 10px",
                        background: "#f1f5f9",
                        borderRadius: "6px",
                        fontSize: "0.78rem",
                        fontWeight: 600,
                        color: "#7c3aed",
                        cursor: "pointer",
                      }}
                    >
                      <Video size={14} /> + Video
                      <input
                        type="file"
                        accept="video/mp4,video/webm"
                        onChange={(e) => handleMediaUpload(e, "video")}
                        disabled={uploadingMedia}
                        style={{ display: "none" }}
                      />
                    </label>
                  </div>
                </div>

                {uploadingMedia && (
                  <p
                    style={{
                      margin: "4px 0",
                      fontSize: "0.8rem",
                      color: "#0b6dff",
                    }}
                  >
                    Uploading media... please wait.
                  </p>
                )}

                {/* Uploaded Previews */}
                {mediaList.length > 0 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      flexWrap: "wrap",
                      marginTop: "6px",
                    }}
                  >
                    {mediaList.map((m, idx) => (
                      <div
                        key={idx}
                        style={{
                          position: "relative",
                          width: "90px",
                          height: "60px",
                          borderRadius: "6px",
                          overflow: "hidden",
                          background: "#0f172a",
                          border: "1px solid #cbd5e1",
                        }}
                      >
                        {m.type === "photo" ? (
                          <img
                            src={m.url}
                            alt="preview"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <video
                            src={m.url}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        )}
                        <span
                          style={{
                            position: "absolute",
                            top: "3px",
                            left: "3px",
                            padding: "1px 5px",
                            borderRadius: "3px",
                            fontSize: "0.62rem",
                            fontWeight: 700,
                            background:
                              m.type === "photo" ? "#0b6dff" : "#7c3aed",
                            color: "white",
                          }}
                        >
                          {m.type === "photo" ? "Photo" : "Video"}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeMedia(idx)}
                          style={{
                            position: "absolute",
                            top: "3px",
                            right: "3px",
                            width: "16px",
                            height: "16px",
                            borderRadius: "50%",
                            background: "rgba(0,0,0,0.7)",
                            color: "white",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "10px",
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

              {/* Submit Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginTop: "0.5rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={resetForm}
                  style={{
                    padding: "0.65rem 1.25rem",
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    padding: "0.65rem 1.5rem",
                    background:
                      "linear-gradient(135deg, #0b6dff 0%, #0052cc 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 12px rgba(11, 109, 255, 0.25)",
                    opacity: isSubmitting ? 0.7 : 1,
                  }}
                >
                  {isSubmitting ? "Submitting..." : "Submit Review for Approval"}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}