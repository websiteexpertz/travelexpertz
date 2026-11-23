"use client";

import React, { useState, useEffect } from "react";
import {
  Star,
  Camera,
  Video,
  Play,
  Trash2,
  Edit2,
  Building2,
  MapPin,
  CheckCircle2,
  XCircle,
  Plus,
  UploadCloud,
} from "lucide-react";

export interface TestimonialMedia {
  type: "photo" | "video";
  url: string;
  thumbnailUrl?: string;
  altText?: string;
}

export interface AdminTestimonial {
  _id?: string;
  reviewerName: string;
  reviewerAvatarUrl?: string;
  rating: number;
  reviewText: string;
  propertyId?: string;
  propertyName: string;
  propertyCity: string;
  propertyState: string;
  propertyType?: string;
  media: TestimonialMedia[];
  isPublished: boolean;
  createdAt?: string | Date;
  // Legacy compatibility
  name?: string;
  image?: string;
  location?: string;
  text?: string;
  verified?: boolean;
}

interface PropertyOption {
  _id: string;
  name: string;
  city: string;
  state: string;
  type: "Hotel" | "Homestay";
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<AdminTestimonial[]>([]);
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<AdminTestimonial>({
    reviewerName: "",
    reviewerAvatarUrl: "",
    rating: 5,
    reviewText: "",
    propertyId: "",
    propertyName: "",
    propertyCity: "",
    propertyState: "",
    propertyType: "Hotel",
    media: [],
    isPublished: true,
  });

  useEffect(() => {
    fetchTestimonials();
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const [hotelsRes, homestaysRes] = await Promise.allSettled([
        fetch("/api/hotels?admin=true").then((r) => (r.ok ? r.json() : [])),
        fetch("/api/homestays?admin=true").then((r) => (r.ok ? r.json() : [])),
      ]);

      const hotelList: any[] =
        hotelsRes.status === "fulfilled" && Array.isArray(hotelsRes.value)
          ? hotelsRes.value
          : [];
      const homestayList: any[] =
        homestaysRes.status === "fulfilled" && Array.isArray(homestaysRes.value)
          ? homestaysRes.value
          : [];

      const combined: PropertyOption[] = [
        ...hotelList.map((h) => ({
          _id: h._id || h.id || "",
          name: h.name || h.hotelName || "",
          city: h.city || "",
          state: h.state || "",
          type: "Hotel" as const,
        })),
        ...homestayList.map((hs) => ({
          _id: hs._id || hs.id || "",
          name: hs.name || hs.homestayName || "",
          city: hs.city || "",
          state: hs.state || "",
          type: "Homestay" as const,
        })),
      ].filter((p) => p.name);

      setProperties(combined);
    } catch (e) {
      console.error("Failed to fetch properties:", e);
    }
  };

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/testimonials?admin=true", {
        cache: "no-store",
      });
      if (res.ok) {
        const data = await res.json();
        setTestimonials(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePropertySelect = (propertyId: string) => {
    if (!propertyId) {
      setFormData({
        ...formData,
        propertyId: "",
      });
      return;
    }
    const selected = properties.find((p) => p._id === propertyId);
    if (selected) {
      setFormData({
        ...formData,
        propertyId: selected._id,
        propertyName: selected.name,
        propertyCity: selected.city,
        propertyState: selected.state,
        propertyType: selected.type,
      });
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
        setFormData((prev) => ({
          ...prev,
          reviewerAvatarUrl: data.url,
        }));
      }
    } catch (err) {
      console.error("Avatar upload failed:", err);
      alert("Failed to upload avatar image");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleMediaUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "photo" | "video",
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    try {
      const newMediaList: TestimonialMedia[] = [...formData.media];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const body = new FormData();
        body.append("file", file);

        const res = await fetch("/api/upload", { method: "POST", body });
        if (res.ok) {
          const data = await res.json();
          newMediaList.push({
            type,
            url: data.url,
            thumbnailUrl: type === "photo" ? data.url : "/hero4.jpeg",
            altText: `${formData.propertyName || "Property"} ${type} review`,
          });
        }
      }

      setFormData((prev) => ({
        ...prev,
        media: newMediaList,
      }));
    } catch (err) {
      console.error("Media upload error:", err);
      alert("Failed to upload media file(s)");
    } finally {
      setUploadingMedia(false);
      // Reset input
      e.target.value = "";
    }
  };

  const handleRemoveMedia = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.reviewerName.trim()) {
      alert("Please enter the reviewer's name.");
      return;
    }
    if (!formData.reviewText.trim()) {
      alert("Please enter the review description.");
      return;
    }

    try {
      const method = editingId ? "PATCH" : "POST";
      const payload = {
        ...formData,
        ...(editingId ? { _id: editingId } : {}),
      };

      const res = await fetch("/api/testimonials", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(
          editingId
            ? "Testimonial updated successfully!"
            : "Testimonial created successfully!",
        );
        handleCancel();
        fetchTestimonials();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save testimonial");
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert("An error occurred while saving.");
    }
  };

  const handleEdit = (item: AdminTestimonial) => {
    const rawMedia = Array.isArray(item.media)
      ? item.media
      : item.image
      ? [{ type: "photo" as const, url: item.image, thumbnailUrl: item.image }]
      : [];

    setFormData({
      _id: item._id,
      reviewerName: item.reviewerName || item.name || "",
      reviewerAvatarUrl: item.reviewerAvatarUrl || item.image || "",
      rating: Number(item.rating) || 5,
      reviewText: item.reviewText || item.text || "",
      propertyId: item.propertyId || "",
      propertyName: item.propertyName || "",
      propertyCity: item.propertyCity || "",
      propertyState: item.propertyState || "",
      propertyType: item.propertyType || "Hotel",
      media: rawMedia,
      isPublished:
        item.isPublished !== undefined
          ? item.isPublished
          : item.verified !== undefined
          ? item.verified
          : true,
    });
    setEditingId(item._id || null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      const res = await fetch(`/api/testimonials?id=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        alert("Testimonial deleted successfully!");
        fetchTestimonials();
      }
    } catch (e) {
      console.error("Delete failed:", e);
      alert("Failed to delete testimonial");
    }
  };

  const handleTogglePublish = async (
    id: string,
    currentPublished: boolean,
  ) => {
    try {
      const res = await fetch("/api/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ _id: id, isPublished: !currentPublished }),
      });
      if (res.ok) {
        setTestimonials((prev) =>
          prev.map((t) =>
            t._id === id ? { ...t, isPublished: !currentPublished } : t,
          ),
        );
      }
    } catch (e) {
      console.error("Toggle publish failed:", e);
    }
  };

  const handleCancel = () => {
    setFormData({
      reviewerName: "",
      reviewerAvatarUrl: "",
      rating: 5,
      reviewText: "",
      propertyId: "",
      propertyName: "",
      propertyCity: "",
      propertyState: "",
      propertyType: "Hotel",
      media: [],
      isPublished: true,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const filteredTestimonials = testimonials.filter((t) => {
    const q = searchTerm.toLowerCase();
    const name = (t.reviewerName || t.name || "").toLowerCase();
    const prop = (t.propertyName || "").toLowerCase();
    const loc = (
      [t.propertyCity, t.propertyState].filter(Boolean).join(" ") ||
      t.location ||
      ""
    ).toLowerCase();
    const text = (t.reviewText || t.text || "").toLowerCase();
    return (
      name.includes(q) || prop.includes(q) || loc.includes(q) || text.includes(q)
    );
  });

  return (
    <div style={{ padding: "2rem", maxWidth: "1350px", margin: "0 auto" }}>
      {/* Top Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.85rem",
              fontWeight: 700,
              margin: 0,
              color: "#1e293b",
            }}
          >
            Stories of Happy Journeys — Testimonials
          </h1>
          <p style={{ margin: "4px 0 0", color: "#64748b", fontSize: "0.95rem" }}>
            Manage customer photo & video reviews displayed on the homepage.
          </p>
        </div>

        <button
          onClick={() => {
            if (showForm) {
              handleCancel();
            } else {
              setShowForm(true);
            }
          }}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "0.75rem 1.5rem",
            background: "linear-gradient(135deg, #0b6dff 0%, #0052cc 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "0.95rem",
            cursor: "pointer",
            boxShadow: "0 4px 12px rgba(11, 109, 255, 0.25)",
          }}
        >
          {showForm ? "Cancel" : <><Plus size={18} /> Add New Testimonial</>}
        </button>
      </div>

      {/* Form Section */}
      {showForm && (
        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "16px",
            border: "1px solid #e2e8f0",
            marginBottom: "2.5rem",
            boxShadow: "0 10px 25px rgba(0, 0, 0, 0.04)",
          }}
        >
          <h2
            style={{
              margin: "0 0 1.5rem",
              fontSize: "1.35rem",
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            {editingId ? "Edit Testimonial" : "Create New Photo / Video Testimonial"}
          </h2>

          <form onSubmit={handleSubmit} style={{ display: "grid", gap: "1.5rem" }}>
            {/* Row 1: Reviewer Name & Profile Photo */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    color: "#334155",
                    fontSize: "0.9rem",
                  }}
                >
                  Reviewer Name *
                </label>
                <input
                  type="text"
                  value={formData.reviewerName}
                  onChange={(e) =>
                    setFormData({ ...formData, reviewerName: e.target.value })
                  }
                  placeholder="e.g. Aarav Mehta / Riya & Kabir"
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    color: "#334155",
                    fontSize: "0.9rem",
                  }}
                >
                  Reviewer Profile Photo (Optional)
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  {formData.reviewerAvatarUrl ? (
                    <img
                      src={formData.reviewerAvatarUrl}
                      alt="Reviewer avatar"
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "2px solid #e2e8f0",
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: "48px",
                        height: "48px",
                        borderRadius: "50%",
                        background: "#e2e8f0",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#64748b",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                      }}
                    >
                      {formData.reviewerName
                        ? formData.reviewerName.charAt(0).toUpperCase()
                        : "U"}
                    </div>
                  )}

                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "0.55rem 1rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      background: "#f8fafc",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#334155",
                      cursor: "pointer",
                    }}
                  >
                    <UploadCloud size={16} />
                    {uploadingAvatar ? "Uploading..." : "Upload Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      style={{ display: "none" }}
                    />
                  </label>

                  {formData.reviewerAvatarUrl && (
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, reviewerAvatarUrl: "" })
                      }
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ef4444",
                        fontSize: "0.8rem",
                        cursor: "pointer",
                        textDecoration: "underline",
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Row 2: Star Rating & Publish status */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1.5rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    color: "#334155",
                    fontSize: "0.9rem",
                  }}
                >
                  Star Rating (1 to 5) *
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        padding: "2px",
                      }}
                      title={`${star} Star${star > 1 ? "s" : ""}`}
                    >
                      <Star
                        size={28}
                        fill={star <= formData.rating ? "#f59e0b" : "none"}
                        color={star <= formData.rating ? "#f59e0b" : "#cbd5e1"}
                      />
                    </button>
                  ))}
                  <span
                    style={{
                      marginLeft: "8px",
                      fontWeight: 700,
                      color: "#1e293b",
                      fontSize: "0.95rem",
                    }}
                  >
                    {formData.rating} out of 5 stars
                  </span>
                </div>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    color: "#334155",
                    fontSize: "0.9rem",
                  }}
                >
                  Visibility
                </label>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    cursor: "pointer",
                    padding: "0.5rem 0",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={formData.isPublished}
                    onChange={(e) =>
                      setFormData({ ...formData, isPublished: e.target.checked })
                    }
                    style={{ width: "18px", height: "18px", cursor: "pointer" }}
                  />
                  <span
                    style={{
                      fontWeight: 600,
                      color: formData.isPublished ? "#166534" : "#64748b",
                      fontSize: "0.95rem",
                    }}
                  >
                    {formData.isPublished
                      ? "Published (Visible on Homepage)"
                      : "Unpublished (Draft / Hidden)"}
                  </span>
                </label>
              </div>
            </div>

            {/* Row 3: Property Selection (from Database) */}
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "1.25rem",
                background: "#f8fafc",
              }}
            >
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.4rem",
                    fontWeight: 700,
                    color: "#1e293b",
                    fontSize: "0.95rem",
                  }}
                >
                  Select Reviewed Property from Database
                </label>
                <p
                  style={{
                    margin: "0 0 0.5rem",
                    fontSize: "0.82rem",
                    color: "#64748b",
                  }}
                >
                  Selecting a property automatically retrieves its name, city, state,
                  and links the card directly to its booking page.
                </p>
                <select
                  value={formData.propertyId || ""}
                  onChange={(e) => handlePropertySelect(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    background: "white",
                    fontSize: "0.95rem",
                  }}
                >
                  <option value="">-- Choose Existing Property (Optional) --</option>
                  <optgroup label="Hotels & Resorts">
                    {properties
                      .filter((p) => p.type === "Hotel")
                      .map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} — {p.city}, {p.state}
                        </option>
                      ))}
                  </optgroup>
                  <optgroup label="Homestays">
                    {properties
                      .filter((p) => p.type === "Homestay")
                      .map((p) => (
                        <option key={p._id} value={p._id}>
                          {p.name} — {p.city}, {p.state}
                        </option>
                      ))}
                  </optgroup>
                </select>
              </div>

              {/* Property Details Display / Customization */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "2fr 1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.35rem",
                      fontWeight: 600,
                      color: "#475569",
                      fontSize: "0.85rem",
                    }}
                  >
                    Property Name
                  </label>
                  <input
                    type="text"
                    value={formData.propertyName}
                    onChange={(e) =>
                      setFormData({ ...formData, propertyName: e.target.value })
                    }
                    placeholder="e.g. The Himalayan Retreat Homestay"
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      background: "white",
                      fontSize: "0.9rem",
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
                      color: "#475569",
                      fontSize: "0.85rem",
                    }}
                  >
                    City
                  </label>
                  <input
                    type="text"
                    value={formData.propertyCity}
                    onChange={(e) =>
                      setFormData({ ...formData, propertyCity: e.target.value })
                    }
                    placeholder="e.g. Manali / Jaipur"
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      background: "white",
                      fontSize: "0.9rem",
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
                      color: "#475569",
                      fontSize: "0.85rem",
                    }}
                  >
                    State
                  </label>
                  <input
                    type="text"
                    value={formData.propertyState}
                    onChange={(e) =>
                      setFormData({ ...formData, propertyState: e.target.value })
                    }
                    placeholder="e.g. Himachal Pradesh"
                    style={{
                      width: "100%",
                      padding: "0.65rem",
                      border: "1px solid #cbd5e1",
                      borderRadius: "6px",
                      background: "white",
                      fontSize: "0.9rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Row 4: Review Description */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  color: "#334155",
                  fontSize: "0.9rem",
                }}
              >
                Review Description *
              </label>
              <textarea
                rows={4}
                value={formData.reviewText}
                onChange={(e) =>
                  setFormData({ ...formData, reviewText: e.target.value })
                }
                placeholder="Share the guest's detailed story and experience..."
                required
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #cbd5e1",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                  lineHeight: 1.5,
                }}
              />
            </div>

            {/* Row 5: Media Files (Photos and Videos) */}
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "1.25rem",
                background: "#f8fafc",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                  flexWrap: "wrap",
                  gap: "0.75rem",
                }}
              >
                <div>
                  <h4
                    style={{
                      margin: 0,
                      fontWeight: 700,
                      color: "#1e293b",
                      fontSize: "0.95rem",
                    }}
                  >
                    Review Media (Photos & Videos)
                  </h4>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "0.82rem",
                      color: "#64748b",
                    }}
                  >
                    Upload property photos (JPEG, PNG, WebP) or video reviews
                    (MP4, WebM) shown at the top of the card.
                  </p>
                </div>

                <div style={{ display: "flex", gap: "10px" }}>
                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "0.55rem 0.95rem",
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#0b6dff",
                      cursor: "pointer",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Camera size={16} />
                    + Add Photo
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleMediaUpload(e, "photo")}
                      disabled={uploadingMedia}
                      style={{ display: "none" }}
                    />
                  </label>

                  <label
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "0.55rem 0.95rem",
                      background: "#ffffff",
                      border: "1px solid #cbd5e1",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#7c3aed",
                      cursor: "pointer",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                    }}
                  >
                    <Video size={16} />
                    + Add Video
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/quicktime"
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
                    color: "#0b6dff",
                    fontSize: "0.88rem",
                    fontWeight: 600,
                  }}
                >
                  Uploading media... please wait.
                </p>
              )}

              {/* Uploaded Media Items Grid */}
              {formData.media.length > 0 ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                    gap: "1rem",
                    marginTop: "0.75rem",
                  }}
                >
                  {formData.media.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        position: "relative",
                        background: "white",
                        borderRadius: "10px",
                        border: "1px solid #cbd5e1",
                        overflow: "hidden",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.04)",
                      }}
                    >
                      {/* Media container */}
                      <div
                        style={{
                          width: "100%",
                          aspectRatio: "16 / 9",
                          background: "#0f172a",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        {item.type === "photo" ? (
                          <img
                            src={item.url}
                            alt="Media preview"
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        ) : (
                          <video
                            src={item.url}
                            controls
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                          />
                        )}

                        {/* Badge */}
                        <span
                          style={{
                            position: "absolute",
                            top: "8px",
                            left: "8px",
                            padding: "3px 8px",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            letterSpacing: "0.03em",
                            background:
                              item.type === "photo"
                                ? "rgba(11, 109, 255, 0.9)"
                                : "rgba(124, 58, 237, 0.9)",
                            color: "white",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          {item.type === "photo" ? (
                            <Camera size={12} />
                          ) : (
                            <Video size={12} />
                          )}
                          {item.type === "photo" ? "Photo" : "Video"}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <div
                        style={{
                          padding: "0.5rem 0.75rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.8rem",
                            color: "#64748b",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: "140px",
                          }}
                        >
                          Item {index + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveMedia(index)}
                          style={{
                            background: "none",
                            border: "none",
                            color: "#ef4444",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px",
                            padding: "2px",
                          }}
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    margin: "0.5rem 0 0",
                    fontSize: "0.85rem",
                    color: "#94a3b8",
                    fontStyle: "italic",
                  }}
                >
                  No media uploaded yet. Click "+ Add Photo" or "+ Add Video" above
                  to add media to this testimonial.
                </p>
              )}
            </div>

            {/* Submit / Cancel Buttons */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
              <button
                type="submit"
                style={{
                  padding: "0.75rem 1.75rem",
                  background:
                    "linear-gradient(135deg, #0b6dff 0%, #0052cc 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  boxShadow: "0 4px 12px rgba(11, 109, 255, 0.25)",
                }}
              >
                {editingId ? "Update Testimonial" : "Create Testimonial"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#e2e8f0",
                  color: "#334155",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search Bar */}
      <div style={{ marginBottom: "1.5rem" }}>
        <input
          type="text"
          placeholder="Search testimonials by reviewer, property, city, or review text..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            border: "1px solid #cbd5e1",
            borderRadius: "8px",
            fontSize: "0.95rem",
            background: "white",
            boxSizing: "border-box",
          }}
        />
      </div>

      {/* Testimonials List */}
      {loading ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
          Loading testimonials...
        </div>
      ) : filteredTestimonials.length === 0 ? (
        <div
          style={{
            padding: "3rem",
            textAlign: "center",
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
            color: "#64748b",
          }}
        >
          No testimonials found. Click "+ Add New Testimonial" to create one.
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.25rem" }}>
          {filteredTestimonials.map((item) => {
            const mediaList = Array.isArray(item.media)
              ? item.media
              : item.image
              ? [{ type: "photo" as const, url: item.image, thumbnailUrl: item.image }]
              : [];
            const primaryMedia = mediaList[0];
            const name = item.reviewerName || item.name || "Anonymous";
            const locationText =
              [item.propertyCity, item.propertyState]
                .filter(Boolean)
                .join(", ") ||
              item.location ||
              "";
            const isPub =
              item.isPublished !== undefined
                ? item.isPublished
                : item.verified !== undefined
                ? item.verified
                : true;

            return (
              <div
                key={item._id}
                style={{
                  background: "white",
                  borderRadius: "14px",
                  border: "1px solid #e2e8f0",
                  padding: "1.25rem",
                  display: "grid",
                  gridTemplateColumns: "180px 1fr auto",
                  gap: "1.5rem",
                  alignItems: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
                }}
              >
                {/* Media Preview Box */}
                <div
                  style={{
                    width: "180px",
                    aspectRatio: "16 / 9",
                    borderRadius: "10px",
                    overflow: "hidden",
                    background: "#0f172a",
                    position: "relative",
                  }}
                >
                  {primaryMedia ? (
                    primaryMedia.type === "photo" ? (
                      <img
                        src={primaryMedia.thumbnailUrl || primaryMedia.url}
                        alt="Media preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <img
                          src={primaryMedia.thumbnailUrl || "/hero4.jpeg"}
                          alt="Video poster"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            opacity: 0.85,
                          }}
                        />
                        <div
                          style={{
                            position: "absolute",
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: "rgba(0,0,0,0.65)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                          }}
                        >
                          <Play size={16} fill="white" />
                        </div>
                      </div>
                    )
                  ) : (
                    <div
                      style={{
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#94a3b8",
                        fontSize: "0.8rem",
                      }}
                    >
                      No Media
                    </div>
                  )}

                  {primaryMedia && (
                    <span
                      style={{
                        position: "absolute",
                        top: "6px",
                        left: "6px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        letterSpacing: "0.03em",
                        background:
                          primaryMedia.type === "photo"
                            ? "rgba(11, 109, 255, 0.9)"
                            : "rgba(124, 58, 237, 0.9)",
                        color: "white",
                      }}
                    >
                      {primaryMedia.type === "photo" ? "Photo" : "Video"}
                    </span>
                  )}

                  {mediaList.length > 1 && (
                    <span
                      style={{
                        position: "absolute",
                        bottom: "6px",
                        right: "6px",
                        padding: "2px 6px",
                        borderRadius: "4px",
                        fontSize: "0.68rem",
                        fontWeight: 700,
                        background: "rgba(0, 0, 0, 0.75)",
                        color: "white",
                      }}
                    >
                      +{mediaList.length - 1} more
                    </span>
                  )}
                </div>

                {/* Content details */}
                <div>
                  {/* Rating Stars */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      marginBottom: "6px",
                    }}
                  >
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={15}
                        fill={s <= (item.rating || 5) ? "#f59e0b" : "none"}
                        color={s <= (item.rating || 5) ? "#f59e0b" : "#cbd5e1"}
                      />
                    ))}
                    <span
                      style={{
                        fontSize: "0.82rem",
                        color: "#64748b",
                        marginLeft: "4px",
                      }}
                    >
                      ({item.rating || 5}/5)
                    </span>
                  </div>

                  {/* Review Text */}
                  <p
                    style={{
                      margin: "0 0 8px",
                      color: "#1e293b",
                      fontSize: "0.95rem",
                      lineHeight: 1.45,
                    }}
                  >
                    &ldquo;{item.reviewText || item.text}&rdquo;
                  </p>

                  {/* Property & Reviewer info */}
                  <div
                    style={{
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "16px",
                      alignItems: "center",
                      fontSize: "0.85rem",
                      color: "#64748b",
                    }}
                  >
                    {item.propertyName && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                          fontWeight: 600,
                          color: "#0f172a",
                        }}
                      >
                        <Building2 size={14} color="#0b6dff" />
                        {item.propertyName}
                      </span>
                    )}

                    {locationText && (
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <MapPin size={13} color="#64748b" />
                        {locationText}
                      </span>
                    )}

                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        marginLeft: "auto",
                      }}
                    >
                      {item.reviewerAvatarUrl || item.image ? (
                        <img
                          src={item.reviewerAvatarUrl || item.image}
                          alt={name}
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: "22px",
                            height: "22px",
                            borderRadius: "50%",
                            background: "#0b6dff",
                            color: "white",
                            fontSize: "0.68rem",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontWeight: 700,
                          }}
                        >
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <strong>{name}</strong>
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: "10px",
                  }}
                >
                  {/* Publish Toggle Button */}
                  <button
                    type="button"
                    onClick={() => handleTogglePublish(item._id!, isPub)}
                    title="Click to toggle publish status"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      padding: "4px 10px",
                      borderRadius: "20px",
                      fontSize: "0.78rem",
                      fontWeight: 600,
                      border: "none",
                      cursor: "pointer",
                      background: isPub ? "#dcfce7" : "#fee2e2",
                      color: isPub ? "#166534" : "#991b1b",
                    }}
                  >
                    {isPub ? (
                      <>
                        <CheckCircle2 size={13} /> Published
                      </>
                    ) : (
                      <>
                        <XCircle size={13} /> Unpublished
                      </>
                    )}
                  </button>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      onClick={() => handleEdit(item)}
                      title="Edit"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "6px 12px",
                        background: "#f1f5f9",
                        color: "#0f172a",
                        border: "1px solid #cbd5e1",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id || "")}
                      title="Delete"
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                        padding: "6px 12px",
                        background: "#fff1f2",
                        color: "#e11d48",
                        border: "1px solid #fecdd3",
                        borderRadius: "6px",
                        fontSize: "0.82rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}