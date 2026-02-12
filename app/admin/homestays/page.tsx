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

interface Homestay {
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
  propertyType: string;
  hostName: string;
  hostEmail?: string;
  hostPhone?: string;
  latitude?: number;
  longitude?: number;
  mapUrl?: string;
  popular: boolean;
  active: boolean;
  isLuxury?: boolean;
  isTeVerified?: boolean;
  isDeal?: boolean;
  dealDescription?: string;
  customFields?: { [key: string]: any };
}

const emptyHomestay: Homestay = {
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
    pets: "Pets allowed with prior approval",
  },
  propertyType: "Entire Place",
  hostName: "",
  hostEmail: "",
  hostPhone: "",
  latitude: 0,
  longitude: 0,
  mapUrl: "",
  popular: false,
  active: true,
  isLuxury: false,
  isTeVerified: false,
  isDeal: false,
  dealDescription: "",
  customFields: {},
};

type TabType = "basic" | "details" | "rooms" | "reviews" | "policies";

export default function AdminHomestays() {
  const [homestays, setHomestays] = useState<Homestay[]>([]);
  const [formData, setFormData] = useState<Homestay>(emptyHomestay);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<TabType>("basic");
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);
  const [customFieldKey, setCustomFieldKey] = useState<string>("");
  const [customFieldValue, setCustomFieldValue] = useState<string>("");
  const [customFieldType, setCustomFieldType] = useState<string>("basic");
  const [nearbyPlaceName, setNearbyPlaceName] = useState<string>("");
  const [nearbyPlaceDistance, setNearbyPlaceDistance] = useState<string>("");
  const [uploadingImages, setUploadingImages] = useState<boolean>(false);
  const [roomFormData, setRoomFormData] = useState<Room>({
    id: "",
    type: "",
    price: 0,
    originalPrice: 0,
    maxGuests: 2,
    bedType: "",
    size: 0,
    amenities: [],
    images: [],
    availability: 1,
    cancellationPolicy: "",
    mealPlan: "",
  });

  const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const formatInr = (value: number) =>
    inrFormatter.format(Math.max(0, Math.round(value)));

  useEffect(() => {
    fetchHomestays();
  }, []);

  const fetchHomestays = async () => {
    try {
      const response = await fetch("/api/homestays", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        const normalized = (Array.isArray(data) ? data : []).map((h: any) => ({
          ...emptyHomestay,
          ...h,
          _id: h._id ? String(h._id) : undefined,
          policies: h.policies || emptyHomestay.policies,
          nearbyPlaces: h.nearbyPlaces || [],
          rooms: h.rooms || [],
          userReviews: h.userReviews || [],
          images: Array.isArray(h.images) ? h.images : [],
        }));
        setHomestays(normalized);
      }
    } catch (error) {
      console.error("Failed to fetch homestays:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
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
    setFormData(emptyHomestay);
    setEditingId(null);
    setActiveTab("basic");
    setEditingRoomIndex(null);
    setRoomFormData({
      id: "",
      type: "",
      price: 0,
      originalPrice: 0,
      maxGuests: 2,
      bedType: "",
      size: 0,
      amenities: [],
      images: [],
      availability: 1,
      cancellationPolicy: "",
      mealPlan: "",
    });
  };

  const addRoom = () => {
    if (!roomFormData.type || !roomFormData.price) {
      alert("Please fill in room type and price");
      return;
    }
    const newRoom = {
      ...roomFormData,
      id:
        editingRoomIndex !== null
          ? formData.rooms[editingRoomIndex].id
          : Date.now().toString(),
    };

    if (editingRoomIndex !== null) {
      const updatedRooms = [...formData.rooms];
      updatedRooms[editingRoomIndex] = newRoom;
      setFormData((prev) => ({ ...prev, rooms: updatedRooms }));
    } else {
      setFormData((prev) => ({ ...prev, rooms: [...prev.rooms, newRoom] }));
    }

    setEditingRoomIndex(null);
    setRoomFormData({
      id: "",
      type: "",
      price: 0,
      originalPrice: 0,
      maxGuests: 2,
      bedType: "",
      size: 0,
      amenities: [],
      images: [],
      availability: 1,
      cancellationPolicy: "",
      mealPlan: "",
    });
  };

  const editRoom = (index: number) => {
    setRoomFormData(formData.rooms[index]);
    setEditingRoomIndex(index);
  };

  const deleteRoom = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rooms: prev.rooms.filter((_, i) => i !== index),
    }));
  };

  const handleRoomAmenityChange = (index: number, value: string) => {
    const next = [...roomFormData.amenities];
    next[index] = value;
    setRoomFormData((prev) => ({ ...prev, amenities: next }));
  };

  const addRoomAmenity = () => {
    setRoomFormData((prev) => ({
      ...prev,
      amenities: [...prev.amenities, ""],
    }));
  };

  const removeRoomAmenity = (index: number) => {
    setRoomFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.filter((_, i) => i !== index),
    }));
  };

  const addCustomField = () => {
    if (!customFieldKey.trim()) {
      alert("Please enter a field name");
      return;
    }

    const section = customFieldType;
    const fieldKey = `${section}_${customFieldKey
      .replace(/\s+/g, "_")
      .toLowerCase()}`;

    setFormData((prev) => ({
      ...prev,
      customFields: {
        ...(prev.customFields || {}),
        [fieldKey]: customFieldValue,
      },
    }));

    setCustomFieldKey("");
    setCustomFieldValue("");
  };

  const removeCustomField = (key: string) => {
    setFormData((prev) => {
      const updated = { ...(prev.customFields || {}) };
      delete updated[key];
      return { ...prev, customFields: updated };
    });
  };

  const getCustomFieldsForTab = (tab: string) => {
    const fields = formData.customFields || {};
    return Object.entries(fields).filter(([key]) => key.startsWith(`${tab}_`));
  };

  const addNearbyPlace = () => {
    if (!nearbyPlaceName.trim()) {
      alert("Please enter a place name");
      return;
    }
    setFormData((prev) => ({
      ...prev,
      nearbyPlaces: [
        ...(prev.nearbyPlaces || []),
        { name: nearbyPlaceName, distance: nearbyPlaceDistance },
      ],
    }));
    setNearbyPlaceName("");
    setNearbyPlaceDistance("");
  };

  const removeNearbyPlace = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      nearbyPlaces: (prev.nearbyPlaces || []).filter((_, i) => i !== index),
    }));
  };

  const handleMultipleImagesUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImages(true);
    const uploadedUrls: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const formDataForUpload = new FormData();
        formDataForUpload.append("file", files[i]);

        const response = await fetch("/api/upload", {
          method: "POST",
          body: formDataForUpload,
        });

        if (response.ok) {
          const data = await response.json();
          uploadedUrls.push(data.url);
        }
      }

      setFormData((prev) => ({
        ...prev,
        images: [...(prev.images || []), ...uploadedUrls],
      }));
    } catch (error) {
      console.error("Failed to upload images:", error);
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: (prev.images || []).filter((_, i) => i !== index),
    }));
  };

  const submitHomestay = async () => {
    const method = editingId ? "PATCH" : "POST";
    const payload = editingId ? { ...formData, _id: editingId } : formData;
    const sanitizedPayload = {
      ...payload,
      amenities: (payload.amenities || []).filter((a) => a.trim().length > 0),
    };

    try {
      const response = await fetch("/api/homestays", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sanitizedPayload),
      });

      if (response.ok) {
        await fetchHomestays();
        resetForm();
        setShowForm(false);
      }
    } catch (error) {
      console.error("Failed to save homestay:", error);
    }
  };

  const deleteHomestay = async (id?: string) => {
    if (!id || !confirm("Are you sure you want to delete this homestay?"))
      return;
    try {
      const response = await fetch(`/api/homestays?id=${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        alert("Homestay deleted successfully!");
        await fetchHomestays();
      } else {
        const errorData = await response.json();
        alert(`Failed to delete: ${errorData.error || "Unknown error"}`);
        console.error("Delete failed:", errorData);
      }
    } catch (error) {
      alert(
        "Error deleting homestay: " +
          (error instanceof Error ? error.message : String(error)),
      );
      console.error("Failed to delete homestay:", error);
    }
  };

  const startEdit = (homestay: Homestay) => {
    setFormData({
      ...emptyHomestay,
      ...homestay,
      policies: homestay.policies || emptyHomestay.policies,
      nearbyPlaces: homestay.nearbyPlaces || [],
      rooms: homestay.rooms || [],
      userReviews: homestay.userReviews || [],
    });
    setEditingId(homestay._id || null);
    setShowForm(true);
    setActiveTab("basic");
  };

  const tabs = [
    { id: "basic" as TabType, label: "Basic Info", icon: "ℹ️" },
    { id: "details" as TabType, label: "Details & Amenities", icon: "📋" },
    { id: "rooms" as TabType, label: "Rooms", icon: "🛏️" },
    { id: "reviews" as TabType, label: "Reviews", icon: "⭐" },
    { id: "policies" as TabType, label: "Policies", icon: "📜" },
  ];

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "2rem",
                fontWeight: 700,
                color: "#1f2937",
              }}
            >
              Manage Homestays
            </h1>
            <p
              style={{
                margin: "0.5rem 0 0",
                color: "#6b7280",
                fontSize: "0.95rem",
              }}
            >
              Manage all homestay listings, rooms, and details
            </p>
          </div>
          {!showForm && (
            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#0066cc",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              + Add Homestay
            </button>
          )}
          {showForm && (
            <button
              onClick={() => {
                resetForm();
                setShowForm(false);
              }}
              style={{
                padding: "0.75rem 1.5rem",
                background: "#6b7280",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
                fontWeight: 600,
              }}
            >
              Cancel
            </button>
          )}
        </div>

        {showForm && (
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              marginBottom: "2rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "1.5rem",
              }}
            >
              {editingId ? "Edit Homestay" : "Add New Homestay"}
            </h2>

            {/* Tabs */}
            <div
              style={{
                borderBottom: "2px solid #e5e7eb",
                marginBottom: "2rem",
              }}
            >
              <div style={{ display: "flex", gap: "2rem" }}>
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    style={{
                      background: "none",
                      border: "none",
                      padding: "1rem 0",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color: activeTab === tab.id ? "#0066cc" : "#6b7280",
                      borderBottom:
                        activeTab === tab.id
                          ? "3px solid #0066cc"
                          : "3px solid transparent",
                      marginBottom: "-2px",
                      transition: "all 0.3s",
                    }}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Basic Info Tab */}
            {activeTab === "basic" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
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
                        fontSize: "0.9rem",
                      }}
                    >
                      Homestay Name *
                    </label>
                    <input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Enter homestay name"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      Location *
                    </label>
                    <input
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, Country"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    Full Address *
                  </label>
                  <input
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Complete address"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe the homestay..."
                    rows={5}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "0.95rem",
                      resize: "vertical",
                    }}
                  />
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "1.5rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      Starting Price (₹) *
                    </label>
                    <input
                      name="price"
                      type="number"
                      value={formData.price}
                      onChange={handleInputChange}
                      placeholder="0"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      Rating (1-5)
                    </label>
                    <input
                      name="rating"
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      value={formData.rating}
                      onChange={handleInputChange}
                      placeholder="4.5"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      Number of Reviews
                    </label>
                    <input
                      name="reviews"
                      type="number"
                      value={formData.reviews}
                      onChange={handleInputChange}
                      placeholder="0"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                </div>

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
                        fontSize: "0.9rem",
                      }}
                    >
                      Check-in Time
                    </label>
                    <input
                      name="checkInTime"
                      value={formData.checkInTime}
                      onChange={handleInputChange}
                      placeholder="2:00 PM"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      Check-out Time
                    </label>
                    <input
                      name="checkOutTime"
                      value={formData.checkOutTime}
                      onChange={handleInputChange}
                      placeholder="11:00 AM"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "1.5rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      Property Type
                    </label>
                    <select
                      name="propertyType"
                      value={formData.propertyType}
                      onChange={handleInputChange}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                      }}
                    >
                      <option value="Entire Place">Entire Place</option>
                      <option value="Private Room">Private Room</option>
                      <option value="Shared Room">Shared Room</option>
                    </select>
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      Host Name *
                    </label>
                    <input
                      name="hostName"
                      value={formData.hostName}
                      onChange={handleInputChange}
                      placeholder="Host name"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      Host Email
                    </label>
                    <input
                      name="hostEmail"
                      type="email"
                      value={formData.hostEmail || ""}
                      onChange={handleInputChange}
                      placeholder="host@example.com"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    Host Phone
                  </label>
                  <input
                    name="hostPhone"
                    type="tel"
                    value={formData.hostPhone || ""}
                    onChange={handleInputChange}
                    placeholder="+91 1234567890"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    Homestay Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    style={{ marginBottom: "0.5rem" }}
                  />
                  {formData.image && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      <img
                        src={formData.image}
                        alt="Preview"
                        style={{
                          width: "100px",
                          height: "100px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setFormData((prev) => ({ ...prev, image: "" }))
                        }
                        style={{
                          padding: "0.5rem 1rem",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  {uploadingImage && (
                    <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                      Uploading...
                    </p>
                  )}
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    Gallery Images (Multiple)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleMultipleImagesUpload}
                    style={{ marginBottom: "0.5rem" }}
                  />
                  {uploadingImages && (
                    <p style={{ color: "#6b7280", fontSize: "0.85rem" }}>
                      Uploading images...
                    </p>
                  )}
                  {formData.images && formData.images.length > 0 && (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(100px, 1fr))",
                        gap: "0.5rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      {formData.images.map((img, index) => (
                        <div
                          key={index}
                          style={{
                            position: "relative",
                            width: "100px",
                            height: "100px",
                          }}
                        >
                          <img
                            src={img}
                            alt={`Gallery ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              borderRadius: "8px",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            style={{
                              position: "absolute",
                              top: "-8px",
                              right: "-8px",
                              padding: "0.3rem",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              cursor: "pointer",
                              fontSize: "0.75rem",
                              width: "24px",
                              height: "24px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr 1fr",
                    gap: "1.5rem",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      Latitude
                    </label>
                    <input
                      name="latitude"
                      type="number"
                      step="0.000001"
                      value={formData.latitude || 0}
                      onChange={handleInputChange}
                      placeholder="e.g., 28.6139"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      Longitude
                    </label>
                    <input
                      name="longitude"
                      type="number"
                      step="0.000001"
                      value={formData.longitude || 0}
                      onChange={handleInputChange}
                      placeholder="e.g., 77.2090"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      Map URL
                    </label>
                    <input
                      name="mapUrl"
                      value={formData.mapUrl || ""}
                      onChange={handleInputChange}
                      placeholder="Google Maps embed URL"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                </div>

                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.popular}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          popular: e.target.checked,
                        }))
                      }
                    />
                    Popular
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          active: e.target.checked,
                        }))
                      }
                    />
                    Active
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.isLuxury}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isLuxury: e.target.checked,
                        }))
                      }
                    />
                    Luxury Property
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.isTeVerified}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isTeVerified: e.target.checked,
                        }))
                      }
                    />
                    TE Verified
                  </label>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={formData.isDeal}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          isDeal: e.target.checked,
                        }))
                      }
                    />
                    Is Deal
                  </label>
                </div>

                {/* Deal Description - Show only when isDeal is checked */}
                {formData.isDeal && (
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: 600,
                        fontSize: "0.9rem",
                      }}
                    >
                      What is the Deal?
                    </label>
                    <input
                      value={formData.dealDescription || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          dealDescription: e.target.value,
                        }))
                      }
                      placeholder="Describe the deal offer (e.g., 20% discount, Free breakfast, etc.)"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.95rem",
                      }}
                    />
                  </div>
                )}

                {/* Custom Fields Section */}
                <div
                  style={{
                    marginTop: "2rem",
                    paddingTop: "2rem",
                    borderTop: "2px solid #e5e7eb",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                    }}
                  >
                    Custom Fields
                  </h3>

                  {/* Display existing custom fields for this tab */}
                  {getCustomFieldsForTab("basic").length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      {getCustomFieldsForTab("basic").map(([key, value]) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.75rem",
                            background: "#f9fafb",
                            borderRadius: "6px",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: "0.9rem" }}>
                              {key
                                .replace("basic_", "")
                                .replace(/_/g, " ")
                                .toUpperCase()}
                              :
                            </strong>{" "}
                            <span style={{ color: "#6b7280" }}>
                              {String(value)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCustomField(key)}
                            style={{
                              padding: "0.4rem 0.8rem",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add new custom field */}
                  <div
                    style={{
                      background: "#f9fafb",
                      padding: "1rem",
                      borderRadius: "8px",
                      border: "1px dashed #d1d5db",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr auto",
                        gap: "1rem",
                        alignItems: "end",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          Field Name
                        </label>
                        <input
                          value={customFieldKey}
                          onChange={(e) => {
                            setCustomFieldKey(e.target.value);
                            setCustomFieldType("basic");
                          }}
                          placeholder="e.g., Property Age, Parking Slots"
                          style={{
                            width: "100%",
                            padding: "0.6rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "0.9rem",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          Value
                        </label>
                        <input
                          value={customFieldValue}
                          onChange={(e) => setCustomFieldValue(e.target.value)}
                          placeholder="Enter value"
                          style={{
                            width: "100%",
                            padding: "0.6rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "0.9rem",
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addCustomField}
                        style={{
                          padding: "0.6rem 1.5rem",
                          background: "#0066cc",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        + Add Field
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Details & Amenities Tab */}
            {activeTab === "details" && (
              <div>
                <h3
                  style={{
                    fontSize: "1.2rem",
                    fontWeight: 600,
                    marginBottom: "1rem",
                  }}
                >
                  Amenities
                </h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                  }}
                >
                  {(formData.amenities || []).map((amenity, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "center",
                      }}
                    >
                      <input
                        value={amenity}
                        onChange={(e) =>
                          handleAmenitiesChange(index, e.target.value)
                        }
                        placeholder="e.g., WiFi, Parking, Kitchen"
                        style={{
                          flex: 1,
                          padding: "0.75rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "0.95rem",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeAmenity(index)}
                        style={{
                          padding: "0.75rem 1rem",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                        }}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAmenity}
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: "#0066cc",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      alignSelf: "flex-start",
                    }}
                  >
                    + Add Amenity
                  </button>
                </div>

                {/* Nearby Places Section */}
                <div
                  style={{
                    marginTop: "2rem",
                    paddingTop: "2rem",
                    borderTop: "2px solid #e5e7eb",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.2rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                    }}
                  >
                    Nearby Places
                  </h3>

                  {/* Existing Nearby Places */}
                  {formData.nearbyPlaces &&
                    formData.nearbyPlaces.length > 0 && (
                      <div style={{ marginBottom: "1rem" }}>
                        {formData.nearbyPlaces.map((place, index) => (
                          <div
                            key={index}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "0.75rem",
                              background: "#f9fafb",
                              borderRadius: "6px",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <div>
                              <strong style={{ fontSize: "0.9rem" }}>
                                {place.name}
                              </strong>
                              <span
                                style={{
                                  color: "#6b7280",
                                  marginLeft: "0.5rem",
                                }}
                              >
                                - {place.distance}
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeNearbyPlace(index)}
                              style={{
                                padding: "0.5rem 1rem",
                                background: "#ef4444",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                              }}
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                  {/* Add New Nearby Place */}
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr auto",
                      gap: "1rem",
                      alignItems: "end",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                      >
                        Place Name
                      </label>
                      <input
                        value={nearbyPlaceName}
                        onChange={(e) => setNearbyPlaceName(e.target.value)}
                        placeholder="e.g., Airport, Railway Station"
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "0.95rem",
                        }}
                      />
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                      >
                        Distance
                      </label>
                      <input
                        value={nearbyPlaceDistance}
                        onChange={(e) => setNearbyPlaceDistance(e.target.value)}
                        placeholder="e.g., 5 km, 10 min walk"
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "0.95rem",
                        }}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={addNearbyPlace}
                      style={{
                        padding: "0.75rem 1.5rem",
                        background: "#0066cc",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      + Add Place
                    </button>
                  </div>
                </div>

                {/* Custom Fields Section */}
                <div
                  style={{
                    marginTop: "2rem",
                    paddingTop: "2rem",
                    borderTop: "2px solid #e5e7eb",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                    }}
                  >
                    Custom Fields
                  </h3>

                  {getCustomFieldsForTab("details").length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      {getCustomFieldsForTab("details").map(([key, value]) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.75rem",
                            background: "#f9fafb",
                            borderRadius: "6px",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: "0.9rem" }}>
                              {key
                                .replace("details_", "")
                                .replace(/_/g, " ")
                                .toUpperCase()}
                              :
                            </strong>{" "}
                            <span style={{ color: "#6b7280" }}>
                              {String(value)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCustomField(key)}
                            style={{
                              padding: "0.4rem 0.8rem",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      background: "#f9fafb",
                      padding: "1rem",
                      borderRadius: "8px",
                      border: "1px dashed #d1d5db",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr auto",
                        gap: "1rem",
                        alignItems: "end",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          Field Name
                        </label>
                        <input
                          value={customFieldKey}
                          onChange={(e) => {
                            setCustomFieldKey(e.target.value);
                            setCustomFieldType("details");
                          }}
                          placeholder="e.g., Special Features, Accessibility"
                          style={{
                            width: "100%",
                            padding: "0.6rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "0.9rem",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          Value
                        </label>
                        <input
                          value={customFieldValue}
                          onChange={(e) => setCustomFieldValue(e.target.value)}
                          placeholder="Enter value"
                          style={{
                            width: "100%",
                            padding: "0.6rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "0.9rem",
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addCustomField}
                        style={{
                          padding: "0.6rem 1.5rem",
                          background: "#0066cc",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        + Add Field
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Rooms Tab */}
            {activeTab === "rooms" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "2rem",
                }}
              >
                {/* Room Form */}
                <div
                  style={{
                    background: "#f9fafb",
                    padding: "1.5rem",
                    borderRadius: "8px",
                    border: "2px solid #e5e7eb",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      marginBottom: "1.5rem",
                    }}
                  >
                    {editingRoomIndex !== null ? "Edit Room" : "Add New Room"}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          Room Type *
                        </label>
                        <input
                          value={roomFormData.type}
                          onChange={(e) =>
                            setRoomFormData((prev) => ({
                              ...prev,
                              type: e.target.value,
                            }))
                          }
                          placeholder="e.g., Deluxe Room, Suite"
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "0.95rem",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          Bed Type
                        </label>
                        <input
                          value={roomFormData.bedType}
                          onChange={(e) =>
                            setRoomFormData((prev) => ({
                              ...prev,
                              bedType: e.target.value,
                            }))
                          }
                          placeholder="e.g., King Bed, Twin Beds"
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "0.95rem",
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          Price (₹/night) *
                        </label>
                        <input
                          type="number"
                          value={roomFormData.price}
                          onChange={(e) =>
                            setRoomFormData((prev) => ({
                              ...prev,
                              price: Number(e.target.value),
                            }))
                          }
                          placeholder="0"
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "0.95rem",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          Original Price (₹)
                        </label>
                        <input
                          type="number"
                          value={roomFormData.originalPrice || 0}
                          onChange={(e) =>
                            setRoomFormData((prev) => ({
                              ...prev,
                              originalPrice: Number(e.target.value),
                            }))
                          }
                          placeholder="0"
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "0.95rem",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          Availability
                        </label>
                        <input
                          type="number"
                          value={roomFormData.availability}
                          onChange={(e) =>
                            setRoomFormData((prev) => ({
                              ...prev,
                              availability: Number(e.target.value),
                            }))
                          }
                          placeholder="1"
                          min="0"
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "0.95rem",
                          }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr 1fr",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          Max Guests
                        </label>
                        <input
                          type="number"
                          value={roomFormData.maxGuests}
                          onChange={(e) =>
                            setRoomFormData((prev) => ({
                              ...prev,
                              maxGuests: Number(e.target.value),
                            }))
                          }
                          placeholder="2"
                          min="1"
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "0.95rem",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          Size (sq ft)
                        </label>
                        <input
                          type="number"
                          value={roomFormData.size}
                          onChange={(e) =>
                            setRoomFormData((prev) => ({
                              ...prev,
                              size: Number(e.target.value),
                            }))
                          }
                          placeholder="0"
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "0.95rem",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          Meal Plan
                        </label>
                        <select
                          value={roomFormData.mealPlan || ""}
                          onChange={(e) =>
                            setRoomFormData((prev) => ({
                              ...prev,
                              mealPlan: e.target.value,
                            }))
                          }
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "0.95rem",
                          }}
                        >
                          <option value="">None</option>
                          <option value="Breakfast">Breakfast</option>
                          <option value="Half Board">Half Board</option>
                          <option value="Full Board">Full Board</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                      >
                        Cancellation Policy
                      </label>
                      <input
                        value={roomFormData.cancellationPolicy}
                        onChange={(e) =>
                          setRoomFormData((prev) => ({
                            ...prev,
                            cancellationPolicy: e.target.value,
                          }))
                        }
                        placeholder="Free cancellation up to 48 hours"
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          border: "1px solid #d1d5db",
                          borderRadius: "8px",
                          fontSize: "0.95rem",
                        }}
                      />
                    </div>

                    <div>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.75rem",
                          fontWeight: 600,
                          fontSize: "0.9rem",
                        }}
                      >
                        Room Amenities
                      </label>
                      {roomFormData.amenities.map((amenity, index) => (
                        <div
                          key={index}
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <input
                            value={amenity}
                            onChange={(e) =>
                              handleRoomAmenityChange(index, e.target.value)
                            }
                            placeholder="e.g., Mini Bar, TV, AC"
                            style={{
                              flex: 1,
                              padding: "0.6rem",
                              border: "1px solid #d1d5db",
                              borderRadius: "6px",
                              fontSize: "0.9rem",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeRoomAmenity(index)}
                            style={{
                              padding: "0.6rem 1rem",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "6px",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={addRoomAmenity}
                        style={{
                          padding: "0.6rem 1rem",
                          background: "#6b7280",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          marginTop: "0.5rem",
                        }}
                      >
                        + Add Amenity
                      </button>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        paddingTop: "1rem",
                        borderTop: "1px solid #d1d5db",
                      }}
                    >
                      <button
                        type="button"
                        onClick={addRoom}
                        style={{
                          padding: "0.75rem 1.5rem",
                          background: "#00b894",
                          color: "white",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.95rem",
                          fontWeight: 600,
                        }}
                      >
                        {editingRoomIndex !== null ? "Update Room" : "Add Room"}
                      </button>
                      {editingRoomIndex !== null && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingRoomIndex(null);
                            setRoomFormData({
                              id: "",
                              type: "",
                              price: 0,
                              originalPrice: 0,
                              maxGuests: 2,
                              bedType: "",
                              size: 0,
                              amenities: [],
                              images: [],
                              availability: 1,
                              cancellationPolicy: "",
                              mealPlan: "",
                            });
                          }}
                          style={{
                            padding: "0.75rem 1.5rem",
                            background: "#6b7280",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.95rem",
                            fontWeight: 600,
                          }}
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Rooms List */}
                <div>
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                    }}
                  >
                    Current Rooms ({formData.rooms.length})
                  </h3>
                  {formData.rooms.length === 0 ? (
                    <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                      No rooms added yet. Use the form above to add rooms.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      {formData.rooms.map((room, index) => (
                        <div
                          key={room.id}
                          style={{
                            background: "white",
                            padding: "1.5rem",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "start",
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <h4
                                style={{
                                  margin: "0 0 0.75rem",
                                  fontSize: "1.1rem",
                                  fontWeight: 600,
                                }}
                              >
                                {room.type}
                              </h4>
                              <div
                                style={{
                                  color: "#6b7280",
                                  fontSize: "0.9rem",
                                  lineHeight: "1.8",
                                }}
                              >
                                <div>
                                  💰 {formatInr(room.price)}/night{" "}
                                  {room.originalPrice &&
                                    room.originalPrice > room.price && (
                                      <span
                                        style={{
                                          textDecoration: "line-through",
                                          marginLeft: "0.5rem",
                                        }}
                                      >
                                        {formatInr(room.originalPrice)}
                                      </span>
                                    )}
                                </div>
                                <div>
                                  🛏️ {room.bedType} • 👥 Max {room.maxGuests}{" "}
                                  guests • 📐 {room.size} sq ft
                                </div>
                                <div>
                                  🍽️ {room.mealPlan || "No meals"} • 📦
                                  Available: {room.availability}
                                </div>
                                {room.amenities.length > 0 && (
                                  <div>
                                    ✨{" "}
                                    {room.amenities
                                      .filter((a) => a.trim())
                                      .join(", ")}
                                  </div>
                                )}
                                {room.cancellationPolicy && (
                                  <div>🔄 {room.cancellationPolicy}</div>
                                )}
                              </div>
                            </div>
                            <div style={{ display: "flex", gap: "0.5rem" }}>
                              <button
                                onClick={() => editRoom(index)}
                                style={{
                                  padding: "0.5rem 1rem",
                                  background: "#3b82f6",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "0.85rem",
                                  fontWeight: 600,
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => deleteRoom(index)}
                                style={{
                                  padding: "0.5rem 1rem",
                                  background: "#ef4444",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "0.85rem",
                                  fontWeight: 600,
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Custom Fields Section */}
                <div
                  style={{
                    marginTop: "2rem",
                    paddingTop: "2rem",
                    borderTop: "2px solid #e5e7eb",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                    }}
                  >
                    Custom Fields
                  </h3>

                  {getCustomFieldsForTab("rooms").length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      {getCustomFieldsForTab("rooms").map(([key, value]) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.75rem",
                            background: "#f9fafb",
                            borderRadius: "6px",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: "0.9rem" }}>
                              {key
                                .replace("rooms_", "")
                                .replace(/_/g, " ")
                                .toUpperCase()}
                              :
                            </strong>{" "}
                            <span style={{ color: "#6b7280" }}>
                              {String(value)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCustomField(key)}
                            style={{
                              padding: "0.4rem 0.8rem",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      background: "#f9fafb",
                      padding: "1rem",
                      borderRadius: "8px",
                      border: "1px dashed #d1d5db",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr auto",
                        gap: "1rem",
                        alignItems: "end",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          Field Name
                        </label>
                        <input
                          value={customFieldKey}
                          onChange={(e) => {
                            setCustomFieldKey(e.target.value);
                            setCustomFieldType("rooms");
                          }}
                          placeholder="e.g., Total Rooms, Floor Range"
                          style={{
                            width: "100%",
                            padding: "0.6rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "0.9rem",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          Value
                        </label>
                        <input
                          value={customFieldValue}
                          onChange={(e) => setCustomFieldValue(e.target.value)}
                          placeholder="Enter value"
                          style={{
                            width: "100%",
                            padding: "0.6rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "0.9rem",
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addCustomField}
                        style={{
                          padding: "0.6rem 1.5rem",
                          background: "#0066cc",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        + Add Field
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Tab */}
            {activeTab === "reviews" && (
              <div>
                <p style={{ color: "#6b7280", fontSize: "0.95rem" }}>
                  Reviews are managed automatically through the booking system.
                </p>

                {/* Custom Fields Section */}
                <div
                  style={{
                    marginTop: "2rem",
                    paddingTop: "2rem",
                    borderTop: "2px solid #e5e7eb",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                    }}
                  >
                    Custom Fields
                  </h3>

                  {getCustomFieldsForTab("reviews").length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      {getCustomFieldsForTab("reviews").map(([key, value]) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.75rem",
                            background: "#f9fafb",
                            borderRadius: "6px",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: "0.9rem" }}>
                              {key
                                .replace("reviews_", "")
                                .replace(/_/g, " ")
                                .toUpperCase()}
                              :
                            </strong>{" "}
                            <span style={{ color: "#6b7280" }}>
                              {String(value)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCustomField(key)}
                            style={{
                              padding: "0.4rem 0.8rem",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      background: "#f9fafb",
                      padding: "1rem",
                      borderRadius: "8px",
                      border: "1px dashed #d1d5db",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr auto",
                        gap: "1rem",
                        alignItems: "end",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          Field Name
                        </label>
                        <input
                          value={customFieldKey}
                          onChange={(e) => {
                            setCustomFieldKey(e.target.value);
                            setCustomFieldType("reviews");
                          }}
                          placeholder="e.g., Average Response Time"
                          style={{
                            width: "100%",
                            padding: "0.6rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "0.9rem",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          Value
                        </label>
                        <input
                          value={customFieldValue}
                          onChange={(e) => setCustomFieldValue(e.target.value)}
                          placeholder="Enter value"
                          style={{
                            width: "100%",
                            padding: "0.6rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "0.9rem",
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addCustomField}
                        style={{
                          padding: "0.6rem 1.5rem",
                          background: "#0066cc",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        + Add Field
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Policies Tab */}
            {activeTab === "policies" && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    Cancellation Policy
                  </label>
                  <input
                    value={formData.policies?.cancellation || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        policies: {
                          ...(prev.policies || emptyHomestay.policies),
                          cancellation: e.target.value,
                        },
                      }))
                    }
                    placeholder="Free cancellation up to 24 hours before check-in"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    Pet Policy
                  </label>
                  <input
                    value={formData.policies?.pets || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        policies: {
                          ...(prev.policies || emptyHomestay.policies),
                          pets: e.target.value,
                        },
                      }))
                    }
                    placeholder="Pets allowed with prior approval"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>

                {/* Custom Fields Section */}
                <div
                  style={{
                    marginTop: "2rem",
                    paddingTop: "2rem",
                    borderTop: "2px solid #e5e7eb",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                      marginBottom: "1rem",
                    }}
                  >
                    Custom Fields
                  </h3>

                  {getCustomFieldsForTab("policies").length > 0 && (
                    <div style={{ marginBottom: "1.5rem" }}>
                      {getCustomFieldsForTab("policies").map(([key, value]) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "0.75rem",
                            background: "#f9fafb",
                            borderRadius: "6px",
                            marginBottom: "0.5rem",
                          }}
                        >
                          <div>
                            <strong style={{ fontSize: "0.9rem" }}>
                              {key
                                .replace("policies_", "")
                                .replace(/_/g, " ")
                                .toUpperCase()}
                              :
                            </strong>{" "}
                            <span style={{ color: "#6b7280" }}>
                              {String(value)}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCustomField(key)}
                            style={{
                              padding: "0.4rem 0.8rem",
                              background: "#ef4444",
                              color: "white",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontSize: "0.8rem",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div
                    style={{
                      background: "#f9fafb",
                      padding: "1rem",
                      borderRadius: "8px",
                      border: "1px dashed #d1d5db",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr auto",
                        gap: "1rem",
                        alignItems: "end",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          Field Name
                        </label>
                        <input
                          value={customFieldKey}
                          onChange={(e) => {
                            setCustomFieldKey(e.target.value);
                            setCustomFieldType("policies");
                          }}
                          placeholder="e.g., Smoking Policy, Children Policy"
                          style={{
                            width: "100%",
                            padding: "0.6rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "0.9rem",
                          }}
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.85rem",
                          }}
                        >
                          Value
                        </label>
                        <input
                          value={customFieldValue}
                          onChange={(e) => setCustomFieldValue(e.target.value)}
                          placeholder="Enter value"
                          style={{
                            width: "100%",
                            padding: "0.6rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "6px",
                            fontSize: "0.9rem",
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={addCustomField}
                        style={{
                          padding: "0.6rem 1.5rem",
                          background: "#0066cc",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                          whiteSpace: "nowrap",
                        }}
                      >
                        + Add Field
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                marginTop: "2rem",
                paddingTop: "2rem",
                borderTop: "1px solid #e5e7eb",
              }}
            >
              <button
                onClick={submitHomestay}
                style={{
                  padding: "0.75rem 2rem",
                  background: "#00b894",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                {editingId ? "Update Homestay" : "Create Homestay"}
              </button>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(false);
                }}
                style={{
                  padding: "0.75rem 2rem",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: 600,
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Homestay List */}
        {!showForm && (
          <div>
            {loading ? (
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "2rem",
                  textAlign: "center",
                }}
              >
                Loading homestays...
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                {homestays.map((homestay) => (
                  <div
                    key={homestay._id}
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      display: "grid",
                      gridTemplateColumns: "120px 1fr auto",
                      gap: "1.5rem",
                      alignItems: "center",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}
                  >
                    <img
                      src={homestay.image || "https://via.placeholder.com/120"}
                      alt={homestay.name}
                      style={{
                        width: "120px",
                        height: "120px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <div>
                      <h3
                        style={{
                          margin: "0 0 0.5rem",
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          color: "#1f2937",
                        }}
                      >
                        {homestay.name}
                      </h3>
                      <div
                        style={{
                          color: "#6b7280",
                          fontSize: "0.9rem",
                          lineHeight: "1.6",
                        }}
                      >
                        <div>📍 {homestay.location}</div>
                        <div>
                          💰 {formatInr(homestay.price)}/night • ⭐{" "}
                          {homestay.rating} ({homestay.reviews} reviews)
                        </div>
                        <div>
                          🏠 {homestay.propertyType} • Host: {homestay.hostName}
                        </div>
                        <div style={{ marginTop: "0.5rem" }}>
                          {homestay.popular && (
                            <span
                              style={{
                                background: "#fef3c7",
                                color: "#92400e",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                marginRight: "0.5rem",
                                fontWeight: 600,
                              }}
                            >
                              Popular
                            </span>
                          )}
                          {homestay.active ? (
                            <span
                              style={{
                                background: "#d1fae5",
                                color: "#065f46",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                marginRight: "0.5rem",
                                fontWeight: 600,
                              }}
                            >
                              Active
                            </span>
                          ) : (
                            <span
                              style={{
                                background: "#fee2e2",
                                color: "#991b1b",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                marginRight: "0.5rem",
                                fontWeight: 600,
                              }}
                            >
                              Inactive
                            </span>
                          )}
                          {homestay.isLuxury && (
                            <span
                              style={{
                                background: "#e0e7ff",
                                color: "#3730a3",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                marginRight: "0.5rem",
                                fontWeight: 600,
                              }}
                            >
                              💎 Luxury
                            </span>
                          )}
                          {homestay.isTeVerified && (
                            <span
                              style={{
                                background: "#dbeafe",
                                color: "#0c4a6e",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                marginRight: "0.5rem",
                                fontWeight: 600,
                              }}
                            >
                              ✓ TE Verified
                            </span>
                          )}
                          {homestay.isDeal && (
                            <span
                              style={{
                                background: "#fecaca",
                                color: "#7c2d12",
                                padding: "0.25rem 0.75rem",
                                borderRadius: "6px",
                                fontSize: "0.75rem",
                                marginRight: "0.5rem",
                                fontWeight: 600,
                              }}
                            >
                              🎁 Deal
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                      }}
                    >
                      <button
                        onClick={() => startEdit(homestay)}
                        style={{
                          padding: "0.5rem 1.5rem",
                          background: "#3b82f6",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => deleteHomestay(homestay._id)}
                        style={{
                          padding: "0.5rem 1.5rem",
                          background: "#ef4444",
                          color: "white",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: 600,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
                {homestays.length === 0 && (
                  <div
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "3rem",
                      textAlign: "center",
                      color: "#6b7280",
                    }}
                  >
                    No homestays found. Click &quot;Add Homestay&quot; to create
                    one.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
