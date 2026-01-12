"use client";

import React, { useEffect, useState } from "react";

interface Room {
  id: string;
  type: string;
  price: number;
  originalPrice?: number;
  maxGuests: number;
  bedType: string;
  size: number;
  amenities: string[];
  images: string[];
  availability: number;
  cancellationPolicy: string;
  mealPlan?: string;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

interface Hotel {
  _id?: string;
  name: string;
  location: string;
  address: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  images: string[];
  description: string;
  amenities: string[];
  nearbyPlaces: { name: string; distance: string }[];
  checkInTime: string;
  checkOutTime: string;
  rooms: Room[];
  userReviews: Review[];
  policies: {
    cancellation: string;
    checkIn: string;
    checkOut: string;
    pets: string;
  };
  popular: boolean;
  active: boolean;
}

const emptyHotel: Hotel = {
  name: "",
  location: "",
  address: "",
  price: 0,
  rating: 4.5,
  reviews: 0,
  image: "",
  images: [],
  description: "",
  amenities: [],
  nearbyPlaces: [],
  checkInTime: "2:00 PM",
  checkOutTime: "11:00 AM",
  rooms: [],
  userReviews: [],
  policies: {
    cancellation: "Free cancellation up to 24 hours before check-in",
    checkIn: "Check-in from 2:00 PM",
    checkOut: "Check-out by 11:00 AM",
    pets: "Pets not allowed",
  },
  popular: false,
  active: true,
};

export default function AdminHotels() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [formData, setFormData] = useState<Hotel>(emptyHotel);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);

  const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const formatInr = (value: number) =>
    inrFormatter.format(Math.max(0, Math.round(value)));

  const normalizeHotel = (hotel: Partial<Hotel>): Hotel => {
    const rawId = (hotel as { _id?: unknown })._id;
    const normalizedId =
      typeof rawId === "string" ? rawId : rawId ? String(rawId) : undefined;

    return {
      ...emptyHotel,
      ...hotel,
      _id: normalizedId,
      price: Number(hotel.price ?? emptyHotel.price) || 0,
      rating: Number(hotel.rating ?? emptyHotel.rating) || 0,
      reviews: Number(hotel.reviews ?? emptyHotel.reviews) || 0,
      amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
      popular: typeof hotel.popular === "boolean" ? hotel.popular : false,
      active: typeof hotel.active === "boolean" ? hotel.active : true,
    };
  };

  const cardStyle = {
    background: "white",
    padding: "1.25rem",
    borderRadius: "12px",
    marginBottom: "1.5rem",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
  } as const;

  const labelStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: "0.4rem",
    fontSize: "0.85rem",
    color: "#1a1a2e",
  };

  const inputStyle = {
    width: "100%",
    padding: "0.5rem 0.75rem",
    border: "1px solid #d6dbe1",
    borderRadius: "8px",
    fontSize: "0.9rem",
  } as const;

  const subtleTextStyle = {
    fontSize: "0.85rem",
    color: "#6b7280",
  };

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await fetch("/api/hotels", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        const normalized = (Array.isArray(data) ? data : []).map((hotel) =>
          normalizeHotel(hotel)
        );
        setHotels(normalized);
      }
    } catch (error) {
      console.error("Failed to fetch hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleAmenitiesChange = (index: number, value: string) => {
    const next = [...(formData.amenities || [])];
    next[index] = value;
    setFormData((prev) => ({ ...prev, amenities: next }));
  };

  const addAmenity = () => {
    setFormData((prev) => ({
      ...prev,
      amenities: [...(prev.amenities || []), ""],
    }));
  };

  const removeAmenity = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      amenities: (prev.amenities || []).filter((_, i) => i !== index),
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formDataForUpload = new FormData();
    formDataForUpload.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formDataForUpload,
      });

      if (response.ok) {
        const data = await response.json();
        setFormData((prev) => ({ ...prev, image: data.url }));
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const resetForm = () => {
    setFormData(emptyHotel);
    setEditingId(null);
  };

  const submitHotel = async () => {
    const method = editingId ? "PATCH" : "POST";
    const payload = editingId ? { ...formData, _id: editingId } : formData;
    const sanitizedPayload = {
      ...payload,
      amenities: (payload.amenities || []).filter(
        (amenity) => amenity.trim().length > 0
      ),
    };

    try {
      const response = await fetch("/api/hotels", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedPayload),
      });

      if (response.ok) {
        await fetchHotels();
        resetForm();
        setShowForm(false);
      }
    } catch (error) {
      console.error("Failed to save hotel:", error);
    }
  };

  const deleteHotel = async (id?: string) => {
    if (!id) return;
    try {
      const response = await fetch(`/api/hotels?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        await fetchHotels();
      }
    } catch (error) {
      console.error("Failed to delete hotel:", error);
    }
  };

  const startEdit = (hotel: Hotel) => {
    setFormData(normalizeHotel(hotel));
    setEditingId(hotel._id || null);
    setShowForm(true);
  };

  const handleCreateClick = () => {
    if (showForm && !editingId) {
      resetForm();
      setShowForm(false);
      return;
    }

    resetForm();
    setShowForm(true);
  };

  const buttonLabel = showForm && !editingId ? "Close Form" : "Add Hotel";

  return (
    <div style={{ padding: "1.5rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1.5rem",
        }}
      >
        <div>
          <h1 style={{ margin: 0, color: "#1a1a2e", fontSize: "1.5rem" }}>
            Manage Hotels
          </h1>
          <p style={subtleTextStyle}>
            Create, update, and publish hotels shown on the Hotels page.
          </p>
        </div>
        <button
          onClick={handleCreateClick}
          style={{
            padding: "0.6rem 1.25rem",
            background: "#0066cc",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "0.95rem",
            boxShadow: "0 2px 6px rgba(0, 102, 204, 0.2)",
          }}
        >
          {buttonLabel}
        </button>
      </div>

      {showForm && (
        <div style={cardStyle}>
          <h2
            style={{
              fontSize: "1.05rem",
              marginBottom: "1rem",
              color: "#1a1a2e",
            }}
          >
            {editingId ? "Edit Hotel" : "Add New Hotel"}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "1rem",
              marginBottom: "1rem",
            }}
          >
            <label style={labelStyle}>
              Name
              <input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Location
              <input
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Price (INR per night)
              <input
                name="price"
                type="number"
                value={formData.price}
                onChange={handleInputChange}
                style={inputStyle}
                min={0}
              />
            </label>
            <label style={labelStyle}>
              Rating
              <input
                name="rating"
                type="number"
                step="0.1"
                value={formData.rating}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Reviews
              <input
                name="reviews"
                type="number"
                value={formData.reviews}
                onChange={handleInputChange}
                style={inputStyle}
              />
            </label>
            <label style={labelStyle}>
              Hotel Image
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  flexDirection: "column",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ fontSize: "0.85rem" }}
                />
                {formData.image && (
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <img
                      src={formData.image}
                      alt="Preview"
                      style={{
                        width: "60px",
                        height: "60px",
                        objectFit: "cover",
                        borderRadius: "6px",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, image: "" }))
                      }
                      style={{
                        padding: "0.25rem 0.5rem",
                        fontSize: "0.75rem",
                        background: "#ef4444",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
                {uploadingImage && (
                  <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                    Uploading...
                  </span>
                )}
              </div>
            </label>
          </div>

          <label style={{ ...labelStyle, marginBottom: "1rem" }}>
            Description
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              style={{
                ...inputStyle,
                minHeight: "80px",
                resize: "vertical" as const,
              }}
            />
          </label>

          <div style={{ marginBottom: "1.25rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.75rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  color: "#1a1a2e",
                }}
              >
                Amenities
              </span>
              <button
                onClick={addAmenity}
                style={{
                  padding: "0.35rem 0.85rem",
                  background: "#eef2ff",
                  color: "#3730a3",
                  border: "1px solid #c7d2fe",
                  borderRadius: "6px",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
                type="button"
              >
                Add amenity
              </button>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem",
              }}
            >
              {(formData.amenities || []).map((amenity, index) => (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    alignItems: "center",
                  }}
                >
                  <input
                    value={amenity}
                    onChange={(e) =>
                      handleAmenitiesChange(index, e.target.value)
                    }
                    style={{ ...inputStyle, flex: 1 }}
                  />
                  <button
                    onClick={() => removeAmenity(index)}
                    style={{
                      padding: "0.35rem 0.85rem",
                      background: "#fff5f5",
                      border: "1px solid #fecaca",
                      color: "#b91c1c",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      cursor: "pointer",
                    }}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {formData.amenities?.length === 0 && (
                <div style={{ ...subtleTextStyle, fontStyle: "italic" }}>
                  No amenities added yet.
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              flexWrap: "wrap",
              marginBottom: "1.25rem",
              fontSize: "0.9rem",
              color: "#1a1a2e",
            }}
          >
            <label
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <input
                type="checkbox"
                name="popular"
                checked={formData.popular}
                onChange={handleCheckboxChange}
              />
              Popular
            </label>
            <label
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleCheckboxChange}
              />
              Active
            </label>
          </div>

          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
            <button
              onClick={submitHotel}
              style={{
                padding: "0.65rem 1.5rem",
                background: "#00b894",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.95rem",
              }}
              type="button"
            >
              {editingId ? "Update Hotel" : "Create Hotel"}
            </button>
            <button
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              style={{
                padding: "0.65rem 1.5rem",
                background: "#f3f4f6",
                color: "#1f2937",
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.95rem",
              }}
              type="button"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p>Loading hotels...</p>
      ) : hotels.length === 0 ? (
        <div style={cardStyle}>
          <h2 style={{ margin: 0, fontSize: "1rem", color: "#1a1a2e" }}>
            Hotels
          </h2>
          <p style={{ ...subtleTextStyle, marginTop: "0.5rem" }}>
            No hotels yet.
          </p>
        </div>
      ) : (
        <div style={{ ...cardStyle, marginBottom: 0 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: "0.75rem",
              marginBottom: "0.75rem",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "1.1rem", color: "#1a1a2e" }}>
                Hotels
              </h2>
              <p style={{ ...subtleTextStyle, marginTop: "0.25rem" }}>
                {hotels.length} total hotels
              </p>
            </div>
            <button
              onClick={fetchHotels}
              style={{
                padding: "0.45rem 1rem",
                background: "#f0f9ff",
                color: "#0369a1",
                border: "1px solid #bae6fd",
                borderRadius: "6px",
                fontSize: "0.85rem",
                cursor: "pointer",
              }}
              type="button"
            >
              Refresh
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: "720px",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f5f5f5",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <th
                    style={{
                      padding: "0.85rem",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#1a1a2e",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      padding: "0.85rem",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#1a1a2e",
                    }}
                  >
                    Location
                  </th>
                  <th
                    style={{
                      padding: "0.85rem",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#1a1a2e",
                    }}
                  >
                    Price
                  </th>
                  <th
                    style={{
                      padding: "0.85rem",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#1a1a2e",
                    }}
                  >
                    Rating
                  </th>
                  <th
                    style={{
                      padding: "0.85rem",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#1a1a2e",
                    }}
                  >
                    Reviews
                  </th>
                  <th
                    style={{
                      padding: "0.85rem",
                      textAlign: "center",
                      fontWeight: 600,
                      color: "#1a1a2e",
                    }}
                  >
                    Popular
                  </th>
                  <th
                    style={{
                      padding: "0.85rem",
                      textAlign: "center",
                      fontWeight: 600,
                      color: "#1a1a2e",
                    }}
                  >
                    Active
                  </th>
                  <th
                    style={{
                      padding: "0.85rem",
                      textAlign: "center",
                      fontWeight: 600,
                      color: "#1a1a2e",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {hotels.map((hotel) => (
                  <tr
                    key={hotel._id || hotel.name}
                    style={{ borderBottom: "1px solid #e5e7eb" }}
                  >
                    <td style={{ padding: "0.85rem", color: "#1f2937" }}>
                      <div style={{ fontWeight: 600 }}>{hotel.name}</div>
                      <div style={{ ...subtleTextStyle, marginTop: "0.2rem" }}>
                        {hotel.description}
                      </div>
                    </td>
                    <td style={{ padding: "0.85rem", color: "#1f2937" }}>
                      {hotel.location}
                    </td>
                    <td style={{ padding: "0.85rem", color: "#1f2937" }}>
                      {formatInr(hotel.price)}
                    </td>
                    <td style={{ padding: "0.85rem", color: "#1f2937" }}>
                      {hotel.rating.toFixed(1)}
                    </td>
                    <td style={{ padding: "0.85rem", color: "#1f2937" }}>
                      {hotel.reviews}
                    </td>
                    <td style={{ padding: "0.85rem", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "999px",
                          background: hotel.popular ? "#d1fae5" : "#fee2e2",
                          color: hotel.popular ? "#047857" : "#b91c1c",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        {hotel.popular ? "Yes" : "No"}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem", textAlign: "center" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          borderRadius: "999px",
                          background: hotel.active ? "#d1fae5" : "#fee2e2",
                          color: hotel.active ? "#047857" : "#b91c1c",
                          fontSize: "0.85rem",
                          fontWeight: 600,
                        }}
                      >
                        {hotel.active ? "Visible" : "Hidden"}
                      </span>
                    </td>
                    <td style={{ padding: "0.85rem", textAlign: "center" }}>
                      <button
                        onClick={() => startEdit(hotel)}
                        style={{
                          padding: "0.45rem 0.85rem",
                          marginRight: "0.5rem",
                          background: "#0066cc",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteHotel(hotel._id)}
                        style={{
                          padding: "0.45rem 0.85rem",
                          background: "#fef2f2",
                          color: "#b91c1c",
                          border: "1px solid #fecaca",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                        }}
                        type="button"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
