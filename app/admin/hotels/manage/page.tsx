"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

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
  city?: string;
  state?: string;
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
  customFields?: Array<{ label: string; value: string; type: string }>;
}

const emptyHotel: Hotel = {
  name: "",
  location: "",
  city: "",
  state: "",
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
  customFields: [],
};

const emptyRoom: Room = {
  id: "",
  type: "",
  price: 0,
  maxGuests: 2,
  bedType: "King Bed",
  size: 35,
  amenities: [],
  images: [],
  availability: 5,
  cancellationPolicy: "Free cancellation up to 24 hours before check-in",
  mealPlan: "Room Only",
};

export default function ManageHotels() {
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [formData, setFormData] = useState<Hotel>(emptyHotel);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showForm, setShowForm] = useState<boolean>(false);
  const [uploadingImage, setUploadingImage] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<
    "basic" | "details" | "rooms" | "reviews" | "policies"
  >("basic");

  // Room management state
  const [currentRoom, setCurrentRoom] = useState<Room>(emptyRoom);
  const [editingRoomIndex, setEditingRoomIndex] = useState<number | null>(null);
  const [showRoomForm, setShowRoomForm] = useState(false);

  // Nearby place state
  const [nearbyPlaceName, setNearbyPlaceName] = useState("");
  const [nearbyPlaceDistance, setNearbyPlaceDistance] = useState("");

  // Amenity input
  const [amenityInput, setAmenityInput] = useState("");
  const [roomAmenityInput, setRoomAmenityInput] = useState("");

  // Image inputs
  const [imageUrlInput, setImageUrlInput] = useState("");
  const [roomImageInput, setRoomImageInput] = useState("");

  // File input refs
  const mainImageInputRef = React.useRef<HTMLInputElement>(null);
  const galleryImageInputRef = React.useRef<HTMLInputElement>(null);
  const roomImageInputRef = React.useRef<HTMLInputElement>(null);

  const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const formatInr = (value: number) =>
    inrFormatter.format(Math.max(0, Math.round(value)));

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/hotels");
      if (response.ok) {
        const data = await response.json();
        setHotels(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching hotels:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/hotels";
      const method = editingId ? "PATCH" : "POST";
      const payload = editingId ? { _id: editingId, ...formData } : formData;

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(
          editingId
            ? "Hotel updated successfully!"
            : "Hotel added successfully!",
        );
        setShowForm(false);
        setFormData(emptyHotel);
        setEditingId(null);
        fetchHotels();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to save hotel"}`);
      }
    } catch (error) {
      console.error("Error saving hotel:", error);
      alert("Error saving hotel");
    }
  };

  const handleEdit = (hotel: Hotel) => {
    setFormData({
      ...hotel,
      customFields: hotel.customFields || [],
    });
    setEditingId(hotel._id || null);
    setShowForm(true);
    setActiveTab("basic");
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this hotel?")) return;

    try {
      const response = await fetch(`/api/hotels?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Hotel deleted successfully!");
        fetchHotels();
      } else {
        alert("Failed to delete hotel");
      }
    } catch (error) {
      console.error("Error deleting hotel:", error);
      alert("Error deleting hotel");
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "main" | "gallery" | "room",
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (response.ok) {
        const data = await response.json();
        if (type === "main") {
          setFormData({ ...formData, image: data.url });
        } else if (type === "gallery") {
          setFormData({
            ...formData,
            images: [...formData.images, data.url],
          });
        } else if (type === "room") {
          setCurrentRoom({
            ...currentRoom,
            images: [...currentRoom.images, data.url],
          });
        }
        alert("Image uploaded successfully!");
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Error uploading image");
    } finally {
      setUploadingImage(false);
      // Reset the input
      e.target.value = "";
    }
  };

  // Room management functions
  const addRoom = () => {
    if (!currentRoom.type || currentRoom.price <= 0) {
      alert("Please fill in room type and price");
      return;
    }

    const roomWithId = { ...currentRoom, id: Date.now().toString() };

    if (editingRoomIndex !== null) {
      const updatedRooms = [...formData.rooms];
      updatedRooms[editingRoomIndex] = roomWithId;
      setFormData({ ...formData, rooms: updatedRooms });
      setEditingRoomIndex(null);
    } else {
      setFormData({ ...formData, rooms: [...formData.rooms, roomWithId] });
    }

    setCurrentRoom(emptyRoom);
    setShowRoomForm(false);
  };

  const editRoom = (index: number) => {
    setCurrentRoom(formData.rooms[index]);
    setEditingRoomIndex(index);
    setShowRoomForm(true);
  };

  const deleteRoom = (index: number) => {
    const updatedRooms = formData.rooms.filter((_, i) => i !== index);
    setFormData({ ...formData, rooms: updatedRooms });
  };

  // Amenity management
  const addAmenity = () => {
    if (amenityInput.trim()) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()],
      });
      setAmenityInput("");
    }
  };

  const removeAmenity = (index: number) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((_, i) => i !== index),
    });
  };

  const addRoomAmenity = () => {
    if (roomAmenityInput.trim()) {
      setCurrentRoom({
        ...currentRoom,
        amenities: [...currentRoom.amenities, roomAmenityInput.trim()],
      });
      setRoomAmenityInput("");
    }
  };

  const removeRoomAmenity = (index: number) => {
    setCurrentRoom({
      ...currentRoom,
      amenities: currentRoom.amenities.filter((_, i) => i !== index),
    });
  };

  // Image management
  const addHotelImage = () => {
    if (imageUrlInput.trim()) {
      setFormData({
        ...formData,
        images: [...formData.images, imageUrlInput.trim()],
      });
      setImageUrlInput("");
    }
  };

  const removeHotelImage = (index: number) => {
    setFormData({
      ...formData,
      images: formData.images.filter((_, i) => i !== index),
    });
  };

  const addRoomImage = () => {
    if (roomImageInput.trim()) {
      setCurrentRoom({
        ...currentRoom,
        images: [...currentRoom.images, roomImageInput.trim()],
      });
      setRoomImageInput("");
    }
  };

  const removeRoomImage = (index: number) => {
    setCurrentRoom({
      ...currentRoom,
      images: currentRoom.images.filter((_, i) => i !== index),
    });
  };

  // Nearby place management
  const addNearbyPlace = () => {
    if (nearbyPlaceName.trim() && nearbyPlaceDistance.trim()) {
      setFormData({
        ...formData,
        nearbyPlaces: [
          ...formData.nearbyPlaces,
          {
            name: nearbyPlaceName.trim(),
            distance: nearbyPlaceDistance.trim(),
          },
        ],
      });
      setNearbyPlaceName("");
      setNearbyPlaceDistance("");
    }
  };

  const removeNearbyPlace = (index: number) => {
    setFormData({
      ...formData,
      nearbyPlaces: formData.nearbyPlaces.filter((_, i) => i !== index),
    });
  };

  // Custom field management
  const addCustomField = () => {
    setFormData({
      ...formData,
      customFields: [
        ...(formData.customFields || []),
        { label: "", value: "", type: "text" },
      ],
    });
  };

  const updateCustomField = (
    index: number,
    field: "label" | "value" | "type",
    value: string,
  ) => {
    const updatedFields = [...(formData.customFields || [])];
    updatedFields[index] = { ...updatedFields[index], [field]: value };
    setFormData({ ...formData, customFields: updatedFields });
  };

  const removeCustomField = (index: number) => {
    setFormData({
      ...formData,
      customFields: (formData.customFields || []).filter((_, i) => i !== index),
    });
  };

  const styles = {
    container: {
      minHeight: "100vh",
      backgroundColor: "#f3f4f6",
      padding: "2rem 1rem",
    },
    header: {
      maxWidth: "1400px",
      margin: "0 auto 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
    },
    mainContent: {
      maxWidth: "1400px",
      margin: "0 auto",
    },
    card: {
      backgroundColor: "#ffffff",
      borderRadius: "12px",
      padding: "1.5rem",
      marginBottom: "1.5rem",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
    },
    button: {
      padding: "0.75rem 1.5rem",
      borderRadius: "8px",
      border: "none",
      fontSize: "0.95rem",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    primaryButton: {
      backgroundColor: "#0066cc",
      color: "white",
    },
    secondaryButton: {
      backgroundColor: "#f3f4f6",
      color: "#1f2937",
    },
    dangerButton: {
      backgroundColor: "#dc2626",
      color: "white",
    },
    input: {
      width: "100%",
      padding: "0.75rem",
      borderRadius: "8px",
      border: "2px solid #e5e7eb",
      fontSize: "0.95rem",
      fontFamily: "inherit",
    },
    label: {
      display: "block",
      marginBottom: "0.5rem",
      fontSize: "0.9rem",
      fontWeight: 600,
      color: "#374151",
    },
    tabButton: {
      padding: "0.75rem 1.5rem",
      background: "none",
      border: "none",
      borderBottom: "3px solid transparent",
      fontSize: "1rem",
      fontWeight: 600,
      cursor: "pointer",
      color: "#64748b",
      transition: "all 0.3s ease",
    },
    activeTab: {
      color: "#0066cc",
      borderBottomColor: "#0066cc",
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              marginBottom: "0.5rem",
            }}
          >
            Hotels Management
          </h1>
          <p style={{ color: "#64748b" }}>
            Manage all hotel listings, rooms, and details
          </p>
        </div>
        <div style={{ display: "flex", gap: "1rem" }}>
          <button
            onClick={() => router.push("/admin")}
            style={{ ...styles.button, ...styles.secondaryButton }}
          >
            ← Back to Admin
          </button>
          <button
            onClick={() => {
              setShowForm(!showForm);
              setFormData(emptyHotel);
              setEditingId(null);
              setActiveTab("basic");
            }}
            style={{ ...styles.button, ...styles.primaryButton }}
          >
            {showForm ? "Cancel" : "+ Add New Hotel"}
          </button>
        </div>
      </div>

      <div style={styles.mainContent}>
        {showForm && (
          <div style={styles.card}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "1.5rem",
              }}
            >
              {editingId ? "Edit Hotel" : "Add New Hotel"}
            </h2>

            {/* Tabs */}
            <div
              style={{
                borderBottom: "2px solid #e5e7eb",
                marginBottom: "2rem",
                display: "flex",
                gap: "1rem",
              }}
            >
              {[
                { id: "basic", label: "Basic Info", icon: "info" },
                { id: "details", label: "Details & Amenities", icon: "list" },
                { id: "rooms", label: "Rooms", icon: "hotel" },
                { id: "reviews", label: "Reviews", icon: "star" },
                { id: "policies", label: "Policies", icon: "policy" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as typeof activeTab)}
                  style={{
                    ...styles.tabButton,
                    ...(activeTab === (tab.id as typeof activeTab)
                      ? styles.activeTab
                      : {}),
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "1.2rem",
                      verticalAlign: "middle",
                      marginRight: "0.5rem",
                    }}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit}>
              {/* Basic Info Tab */}
              {activeTab === "basic" && (
                <div style={{ display: "grid", gap: "1.5rem" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "1.5rem",
                    }}
                  >
                    <div>
                      <label style={styles.label}>Hotel Name *</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        style={styles.input}
                        placeholder="Enter hotel name"
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Location *</label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) =>
                          setFormData({ ...formData, location: e.target.value })
                        }
                        style={styles.input}
                        placeholder="City, Country"
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
                      <label style={styles.label}>City</label>
                      <input
                        type="text"
                        value={formData.city || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, city: e.target.value })
                        }
                        style={styles.input}
                        placeholder="e.g., Mumbai, Jaipur"
                      />
                    </div>
                    <div>
                      <label style={styles.label}>State</label>
                      <input
                        type="text"
                        value={formData.state || ""}
                        onChange={(e) =>
                          setFormData({ ...formData, state: e.target.value })
                        }
                        style={styles.input}
                        placeholder="e.g., Maharashtra, Rajasthan"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={styles.label}>Full Address *</label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) =>
                        setFormData({ ...formData, address: e.target.value })
                      }
                      style={styles.input}
                      placeholder="Complete address"
                    />
                  </div>

                  <div>
                    <label style={styles.label}>Description *</label>
                    <textarea
                      required
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      style={{
                        ...styles.input,
                        minHeight: "120px",
                        resize: "vertical",
                      }}
                      placeholder="Describe the hotel..."
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
                      <label style={styles.label}>Starting Price (₹) *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        value={formData.price}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            price: parseFloat(e.target.value) || 0,
                          })
                        }
                        style={styles.input}
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Rating (1-5)</label>
                      <input
                        type="number"
                        min="1"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            rating: parseFloat(e.target.value) || 4.5,
                          })
                        }
                        style={styles.input}
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Number of Reviews</label>
                      <input
                        type="number"
                        min="0"
                        value={formData.reviews}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            reviews: parseInt(e.target.value) || 0,
                          })
                        }
                        style={styles.input}
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
                      <label style={styles.label}>Check-in Time</label>
                      <input
                        type="text"
                        value={formData.checkInTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            checkInTime: e.target.value,
                          })
                        }
                        style={styles.input}
                        placeholder="e.g., 2:00 PM"
                      />
                    </div>
                    <div>
                      <label style={styles.label}>Check-out Time</label>
                      <input
                        type="text"
                        value={formData.checkOutTime}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            checkOutTime: e.target.value,
                          })
                        }
                        style={styles.input}
                        placeholder="e.g., 11:00 AM"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={styles.label}>Main Image *</label>
                    <input
                      type="file"
                      ref={mainImageInputRef}
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "main")}
                      style={{ display: "none" }}
                    />
                    <div
                      style={{
                        display: "flex",
                        gap: "1rem",
                        alignItems: "start",
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => mainImageInputRef.current?.click()}
                        disabled={uploadingImage}
                        style={{
                          ...styles.button,
                          ...styles.primaryButton,
                          opacity: uploadingImage ? 0.6 : 1,
                          cursor: uploadingImage ? "not-allowed" : "pointer",
                        }}
                      >
                        {uploadingImage ? "Uploading..." : "📤 Upload Image"}
                      </button>
                      {formData.image && (
                        <button
                          type="button"
                          onClick={() =>
                            setFormData({ ...formData, image: "" })
                          }
                          style={{ ...styles.button, ...styles.dangerButton }}
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    {formData.image && (
                      <img
                        src={formData.image}
                        alt="Preview"
                        style={{
                          width: "200px",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          marginTop: "1rem",
                          border: "2px solid #e5e7eb",
                        }}
                      />
                    )}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      alignItems: "center",
                    }}
                  >
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.popular}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            popular: e.target.checked,
                          })
                        }
                        style={{ width: "20px", height: "20px" }}
                      />
                      <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                        Mark as Popular
                      </span>
                    </label>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) =>
                          setFormData({ ...formData, active: e.target.checked })
                        }
                        style={{ width: "20px", height: "20px" }}
                      />
                      <span style={{ fontSize: "0.95rem", fontWeight: 600 }}>
                        Active
                      </span>
                    </label>
                  </div>

                  {/* Custom Fields Section */}
                  <div
                    style={{
                      marginTop: "2rem",
                      paddingTop: "2rem",
                      borderTop: "2px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "1rem",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "1.1rem",
                          margin: 0,
                          color: "#1a1a2e",
                          fontWeight: 600,
                        }}
                      >
                        Custom Fields
                      </h3>
                      <button
                        type="button"
                        onClick={addCustomField}
                        style={{
                          ...styles.button,
                          ...styles.primaryButton,
                          padding: "0.5rem 1rem",
                          fontSize: "0.9rem",
                        }}
                      >
                        + Add Custom Column
                      </button>
                    </div>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "#6b7280",
                        marginBottom: "1rem",
                      }}
                    >
                      Add custom fields like "Rooms Available", "Discount", or
                      any other information you need.
                    </p>

                    {(formData.customFields || []).length === 0 && (
                      <div
                        style={{
                          padding: "2rem",
                          textAlign: "center",
                          background: "#f9fafb",
                          borderRadius: "8px",
                          color: "#6b7280",
                          border: "2px dashed #e5e7eb",
                        }}
                      >
                        No custom fields added yet. Click "Add Custom Column" to
                        create one.
                      </div>
                    )}

                    <div style={{ display: "grid", gap: "1rem" }}>
                      {(formData.customFields || []).map((field, index) => (
                        <div
                          key={index}
                          style={{
                            padding: "1rem",
                            background: "#f9fafb",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr auto",
                            gap: "1rem",
                            alignItems: "end",
                          }}
                        >
                          <div>
                            <label style={styles.label}>Field Name</label>
                            <input
                              type="text"
                              value={field.label}
                              onChange={(e) =>
                                updateCustomField(
                                  index,
                                  "label",
                                  e.target.value,
                                )
                              }
                              style={styles.input}
                              placeholder="e.g., Rooms Available"
                            />
                          </div>
                          <div>
                            <label style={styles.label}>Field Value</label>
                            <input
                              type="text"
                              value={field.value}
                              onChange={(e) =>
                                updateCustomField(
                                  index,
                                  "value",
                                  e.target.value,
                                )
                              }
                              style={styles.input}
                              placeholder="e.g., 20 rooms"
                            />
                          </div>
                          <button
                            type="button"
                            onClick={() => removeCustomField(index)}
                            style={{
                              ...styles.button,
                              ...styles.dangerButton,
                              padding: "0.6rem 1rem",
                              height: "fit-content",
                            }}
                          >
                            🗑️
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Details & Amenities Tab */}
              {activeTab === "details" && (
                <div style={{ display: "grid", gap: "2rem" }}>
                  {/* Gallery Images */}
                  <div>
                    <label style={styles.label}>Gallery Images</label>
                    <input
                      type="file"
                      ref={galleryImageInputRef}
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "gallery")}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      onClick={() => galleryImageInputRef.current?.click()}
                      disabled={uploadingImage}
                      style={{
                        ...styles.button,
                        ...styles.primaryButton,
                        marginBottom: "1rem",
                        opacity: uploadingImage ? 0.6 : 1,
                        cursor: uploadingImage ? "not-allowed" : "pointer",
                      }}
                    >
                      {uploadingImage
                        ? "Uploading..."
                        : "📤 Upload Gallery Image"}
                    </button>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fill, minmax(150px, 1fr))",
                        gap: "1rem",
                      }}
                    >
                      {formData.images.map((img, idx) => (
                        <div
                          key={idx}
                          style={{
                            position: "relative",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          <img
                            src={img}
                            alt={`Gallery ${idx + 1}`}
                            style={{
                              width: "100%",
                              height: "120px",
                              objectFit: "cover",
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => removeHotelImage(idx)}
                            style={{
                              position: "absolute",
                              top: "0.5rem",
                              right: "0.5rem",
                              background: "#dc2626",
                              color: "white",
                              border: "none",
                              borderRadius: "50%",
                              width: "30px",
                              height: "30px",
                              cursor: "pointer",
                              fontSize: "1rem",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Hotel Amenities */}
                  <div>
                    <label style={styles.label}>Hotel Amenities</label>
                    <div
                      style={{
                        display: "flex",
                        gap: "0.75rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <input
                        type="text"
                        value={amenityInput}
                        onChange={(e) => setAmenityInput(e.target.value)}
                        style={{ ...styles.input, flex: 1 }}
                        placeholder="e.g., Free WiFi, Swimming Pool"
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addAmenity();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addAmenity}
                        style={{ ...styles.button, ...styles.primaryButton }}
                      >
                        Add
                      </button>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "0.75rem",
                      }}
                    >
                      {formData.amenities.map((amenity, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            padding: "0.5rem 1rem",
                            background: "#f0f9ff",
                            borderRadius: "8px",
                            border: "1px solid #bfdbfe",
                          }}
                        >
                          <span>{amenity}</span>
                          <button
                            type="button"
                            onClick={() => removeAmenity(idx)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#dc2626",
                              cursor: "pointer",
                              fontSize: "1.2rem",
                              padding: "0",
                              lineHeight: "1",
                            }}
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Nearby Places */}
                  <div>
                    <label style={styles.label}>Nearby Places</label>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "2fr 1fr auto",
                        gap: "0.75rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <input
                        type="text"
                        value={nearbyPlaceName}
                        onChange={(e) => setNearbyPlaceName(e.target.value)}
                        style={styles.input}
                        placeholder="Place name"
                      />
                      <input
                        type="text"
                        value={nearbyPlaceDistance}
                        onChange={(e) => setNearbyPlaceDistance(e.target.value)}
                        style={styles.input}
                        placeholder="Distance (e.g., 5 km)"
                      />
                      <button
                        type="button"
                        onClick={addNearbyPlace}
                        style={{ ...styles.button, ...styles.primaryButton }}
                      >
                        Add
                      </button>
                    </div>
                    <div style={{ display: "grid", gap: "0.75rem" }}>
                      {formData.nearbyPlaces.map((place, idx) => (
                        <div
                          key={idx}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "1rem",
                            background: "#f9fafb",
                            borderRadius: "8px",
                            border: "1px solid #e5e7eb",
                          }}
                        >
                          <div>
                            <strong>{place.name}</strong>
                            <span
                              style={{ marginLeft: "1rem", color: "#64748b" }}
                            >
                              {place.distance}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeNearbyPlace(idx)}
                            style={{
                              ...styles.button,
                              ...styles.dangerButton,
                              padding: "0.5rem 1rem",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      ))}
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "1.1rem",
                          margin: 0,
                          color: "#1a1a2e",
                          fontWeight: 600,
                        }}
                      >
                        Custom Fields
                      </h3>
                      <button
                        type="button"
                        onClick={addCustomField}
                        style={{
                          ...styles.button,
                          ...styles.primaryButton,
                          padding: "0.5rem 1rem",
                          fontSize: "0.9rem",
                        }}
                      >
                        + Add Custom Column
                      </button>
                    </div>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "#6b7280",
                        marginBottom: "1rem",
                      }}
                    >
                      Add custom fields like "Rooms Available", "Discount", or
                      any other information you need.
                    </p>

                    {(formData.customFields || []).length === 0 ? (
                      <div
                        style={{
                          padding: "2rem",
                          textAlign: "center",
                          background: "#f9fafb",
                          borderRadius: "8px",
                          color: "#6b7280",
                          border: "2px dashed #e5e7eb",
                        }}
                      >
                        No custom fields added yet. Click "Add Custom Column" to
                        create one.
                      </div>
                    ) : (
                      <div style={{ display: "grid", gap: "1rem" }}>
                        {(formData.customFields || []).map((field, index) => (
                          <div
                            key={index}
                            style={{
                              padding: "1rem",
                              background: "#f9fafb",
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr auto",
                              gap: "1rem",
                              alignItems: "end",
                            }}
                          >
                            <div>
                              <label style={styles.label}>Field Name</label>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) =>
                                  updateCustomField(
                                    index,
                                    "label",
                                    e.target.value,
                                  )
                                }
                                style={styles.input}
                                placeholder="e.g., Rooms Available"
                              />
                            </div>
                            <div>
                              <label style={styles.label}>Field Value</label>
                              <input
                                type="text"
                                value={field.value}
                                onChange={(e) =>
                                  updateCustomField(
                                    index,
                                    "value",
                                    e.target.value,
                                  )
                                }
                                style={styles.input}
                                placeholder="e.g., 20 rooms"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCustomField(index)}
                              style={{
                                ...styles.button,
                                ...styles.dangerButton,
                                padding: "0.6rem 1rem",
                                height: "fit-content",
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Rooms Tab */}
              {activeTab === "rooms" && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <h3 style={{ fontSize: "1.25rem", fontWeight: 700 }}>
                      Room Types ({formData.rooms.length})
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowRoomForm(!showRoomForm);
                        setCurrentRoom(emptyRoom);
                        setEditingRoomIndex(null);
                      }}
                      style={{ ...styles.button, ...styles.primaryButton }}
                    >
                      {showRoomForm ? "Cancel" : "+ Add Room"}
                    </button>
                  </div>

                  {showRoomForm && (
                    <div
                      style={{
                        background: "#f9fafb",
                        padding: "1.5rem",
                        borderRadius: "12px",
                        marginBottom: "2rem",
                        border: "2px solid #e5e7eb",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          marginBottom: "1.5rem",
                        }}
                      >
                        {editingRoomIndex !== null ? "Edit Room" : "New Room"}
                      </h4>

                      <div style={{ display: "grid", gap: "1.5rem" }}>
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "2fr 1fr",
                            gap: "1rem",
                          }}
                        >
                          <div>
                            <label style={styles.label}>Room Type *</label>
                            <input
                              type="text"
                              value={currentRoom.type}
                              onChange={(e) =>
                                setCurrentRoom({
                                  ...currentRoom,
                                  type: e.target.value,
                                })
                              }
                              style={styles.input}
                              placeholder="e.g., Deluxe Room, Suite"
                            />
                          </div>
                          <div>
                            <label style={styles.label}>
                              Price per Night (₹) *
                            </label>
                            <input
                              type="number"
                              min="0"
                              value={currentRoom.price}
                              onChange={(e) =>
                                setCurrentRoom({
                                  ...currentRoom,
                                  price: parseFloat(e.target.value) || 0,
                                })
                              }
                              style={styles.input}
                            />
                          </div>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "repeat(4, 1fr)",
                            gap: "1rem",
                          }}
                        >
                          <div>
                            <label style={styles.label}>Original Price</label>
                            <input
                              type="number"
                              min="0"
                              value={currentRoom.originalPrice || ""}
                              onChange={(e) =>
                                setCurrentRoom({
                                  ...currentRoom,
                                  originalPrice:
                                    parseFloat(e.target.value) || undefined,
                                })
                              }
                              style={styles.input}
                              placeholder="Optional"
                            />
                          </div>
                          <div>
                            <label style={styles.label}>Max Guests</label>
                            <input
                              type="number"
                              min="1"
                              value={currentRoom.maxGuests}
                              onChange={(e) =>
                                setCurrentRoom({
                                  ...currentRoom,
                                  maxGuests: parseInt(e.target.value) || 2,
                                })
                              }
                              style={styles.input}
                            />
                          </div>
                          <div>
                            <label style={styles.label}>Room Size (m²)</label>
                            <input
                              type="number"
                              min="0"
                              value={currentRoom.size}
                              onChange={(e) =>
                                setCurrentRoom({
                                  ...currentRoom,
                                  size: parseFloat(e.target.value) || 35,
                                })
                              }
                              style={styles.input}
                            />
                          </div>
                          <div>
                            <label style={styles.label}>Availability</label>
                            <input
                              type="number"
                              min="0"
                              value={currentRoom.availability}
                              onChange={(e) =>
                                setCurrentRoom({
                                  ...currentRoom,
                                  availability: parseInt(e.target.value) || 5,
                                })
                              }
                              style={styles.input}
                            />
                          </div>
                        </div>

                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "1rem",
                          }}
                        >
                          <div>
                            <label style={styles.label}>Bed Type</label>
                            <select
                              value={currentRoom.bedType}
                              onChange={(e) =>
                                setCurrentRoom({
                                  ...currentRoom,
                                  bedType: e.target.value,
                                })
                              }
                              style={styles.input}
                            >
                              <option value="King Bed">King Bed</option>
                              <option value="Queen Bed">Queen Bed</option>
                              <option value="Twin Beds">Twin Beds</option>
                              <option value="2 King Beds">2 King Beds</option>
                              <option value="King Bed + Sofa">
                                King Bed + Sofa
                              </option>
                            </select>
                          </div>
                          <div>
                            <label style={styles.label}>Meal Plan</label>
                            <select
                              value={currentRoom.mealPlan}
                              onChange={(e) =>
                                setCurrentRoom({
                                  ...currentRoom,
                                  mealPlan: e.target.value,
                                })
                              }
                              style={styles.input}
                            >
                              <option value="Room Only">Room Only</option>
                              <option value="Breakfast Included">
                                Breakfast Included
                              </option>
                              <option value="Half Board">Half Board</option>
                              <option value="All Meals Included">
                                All Meals Included
                              </option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label style={styles.label}>
                            Cancellation Policy
                          </label>
                          <input
                            type="text"
                            value={currentRoom.cancellationPolicy}
                            onChange={(e) =>
                              setCurrentRoom({
                                ...currentRoom,
                                cancellationPolicy: e.target.value,
                              })
                            }
                            style={styles.input}
                            placeholder="e.g., Free cancellation up to 24 hours"
                          />
                        </div>

                        {/* Room Amenities */}
                        <div>
                          <label style={styles.label}>Room Amenities</label>
                          <div
                            style={{
                              display: "flex",
                              gap: "0.75rem",
                              marginBottom: "1rem",
                            }}
                          >
                            <input
                              type="text"
                              value={roomAmenityInput}
                              onChange={(e) =>
                                setRoomAmenityInput(e.target.value)
                              }
                              style={{ ...styles.input, flex: 1 }}
                              placeholder="e.g., WiFi, TV, Mini Bar"
                              onKeyPress={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  addRoomAmenity();
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={addRoomAmenity}
                              style={{
                                ...styles.button,
                                ...styles.secondaryButton,
                              }}
                            >
                              Add
                            </button>
                          </div>
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "0.5rem",
                            }}
                          >
                            {currentRoom.amenities.map((amenity, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                  padding: "0.4rem 0.8rem",
                                  background: "#e0f2fe",
                                  borderRadius: "6px",
                                  fontSize: "0.9rem",
                                }}
                              >
                                <span>{amenity}</span>
                                <button
                                  type="button"
                                  onClick={() => removeRoomAmenity(idx)}
                                  style={{
                                    background: "none",
                                    border: "none",
                                    color: "#dc2626",
                                    cursor: "pointer",
                                    fontSize: "1.1rem",
                                    padding: "0",
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Room Images */}
                        <div>
                          <label style={styles.label}>Room Images</label>
                          <input
                            type="file"
                            ref={roomImageInputRef}
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "room")}
                            style={{ display: "none" }}
                          />
                          <button
                            type="button"
                            onClick={() => roomImageInputRef.current?.click()}
                            disabled={uploadingImage}
                            style={{
                              ...styles.button,
                              ...styles.secondaryButton,
                              marginBottom: "1rem",
                              opacity: uploadingImage ? 0.6 : 1,
                              cursor: uploadingImage
                                ? "not-allowed"
                                : "pointer",
                            }}
                          >
                            {uploadingImage
                              ? "Uploading..."
                              : "📤 Upload Room Image"}
                          </button>
                          <div
                            style={{
                              display: "flex",
                              gap: "1rem",
                              flexWrap: "wrap",
                            }}
                          >
                            {currentRoom.images.map((img, idx) => (
                              <div key={idx} style={{ position: "relative" }}>
                                <img
                                  src={img}
                                  alt={`Room ${idx + 1}`}
                                  style={{
                                    width: "120px",
                                    height: "90px",
                                    objectFit: "cover",
                                    borderRadius: "8px",
                                  }}
                                />
                                <button
                                  type="button"
                                  onClick={() => removeRoomImage(idx)}
                                  style={{
                                    position: "absolute",
                                    top: "0.25rem",
                                    right: "0.25rem",
                                    background: "#dc2626",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "24px",
                                    height: "24px",
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                  }}
                                >
                                  ×
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Custom Fields Section in Room Form */}
                        <div
                          style={{
                            marginTop: "1.5rem",
                            paddingTop: "1.5rem",
                            borderTop: "2px solid #e5e7eb",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              marginBottom: "0.5rem",
                            }}
                          >
                            <h4
                              style={{
                                fontSize: "1rem",
                                margin: 0,
                                fontWeight: 600,
                              }}
                            >
                              Room Custom Fields
                            </h4>
                            <button
                              type="button"
                              onClick={addCustomField}
                              style={{
                                ...styles.button,
                                ...styles.primaryButton,
                                padding: "0.4rem 0.75rem",
                                fontSize: "0.85rem",
                              }}
                            >
                              + Add Column
                            </button>
                          </div>
                          <p
                            style={{
                              fontSize: "0.8rem",
                              color: "#6b7280",
                              marginBottom: "0.75rem",
                            }}
                          >
                            Add custom room-specific fields like "Floor Number",
                            "View Type", etc.
                          </p>

                          {(formData.customFields || []).length === 0 ? (
                            <div
                              style={{
                                padding: "1.5rem",
                                textAlign: "center",
                                background: "#f9fafb",
                                borderRadius: "6px",
                                color: "#6b7280",
                                fontSize: "0.85rem",
                                border: "2px dashed #e5e7eb",
                              }}
                            >
                              No custom fields. Click "Add Column" to create
                              one.
                            </div>
                          ) : (
                            <div style={{ display: "grid", gap: "0.75rem" }}>
                              {(formData.customFields || []).map(
                                (field, index) => (
                                  <div
                                    key={index}
                                    style={{
                                      padding: "0.75rem",
                                      background: "#f9fafb",
                                      borderRadius: "6px",
                                      border: "1px solid #e5e7eb",
                                      display: "grid",
                                      gridTemplateColumns: "1fr 1fr auto",
                                      gap: "0.75rem",
                                      alignItems: "center",
                                    }}
                                  >
                                    <input
                                      type="text"
                                      value={field.label}
                                      onChange={(e) =>
                                        updateCustomField(
                                          index,
                                          "label",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Field Name"
                                      style={{
                                        padding: "0.5rem",
                                        border: "1px solid #ddd",
                                        borderRadius: "6px",
                                        fontSize: "0.85rem",
                                      }}
                                    />
                                    <input
                                      type="text"
                                      value={field.value}
                                      onChange={(e) =>
                                        updateCustomField(
                                          index,
                                          "value",
                                          e.target.value,
                                        )
                                      }
                                      placeholder="Value"
                                      style={{
                                        padding: "0.5rem",
                                        border: "1px solid #ddd",
                                        borderRadius: "6px",
                                        fontSize: "0.85rem",
                                      }}
                                    />
                                    <button
                                      type="button"
                                      onClick={() => removeCustomField(index)}
                                      style={{
                                        padding: "0.4rem 0.6rem",
                                        background: "#ff6b6b",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "4px",
                                        cursor: "pointer",
                                        fontSize: "0.85rem",
                                      }}
                                    >
                                      🗑️
                                    </button>
                                  </div>
                                ),
                              )}
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={addRoom}
                          style={{ ...styles.button, ...styles.primaryButton }}
                        >
                          {editingRoomIndex !== null
                            ? "Update Room"
                            : "Add Room"}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Room List */}
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {formData.rooms.map((room, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "1.5rem",
                          background: "#ffffff",
                          border: "2px solid #e5e7eb",
                          borderRadius: "12px",
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
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                marginBottom: "0.5rem",
                              }}
                            >
                              {room.type}
                            </h4>
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(150px, 1fr))",
                                gap: "0.75rem",
                                color: "#64748b",
                                fontSize: "0.9rem",
                                marginBottom: "0.75rem",
                              }}
                            >
                              <div>💰 {formatInr(room.price)}/night</div>
                              <div>👥 {room.maxGuests} guests</div>
                              <div>🛏️ {room.bedType}</div>
                              <div>📏 {room.size} m²</div>
                              <div>🏠 {room.availability} available</div>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                flexWrap: "wrap",
                                gap: "0.5rem",
                                marginBottom: "0.75rem",
                              }}
                            >
                              {room.amenities.map((amenity, i) => (
                                <span
                                  key={i}
                                  style={{
                                    padding: "0.25rem 0.6rem",
                                    background: "#f0f9ff",
                                    borderRadius: "6px",
                                    fontSize: "0.8rem",
                                    color: "#0369a1",
                                  }}
                                >
                                  {amenity}
                                </span>
                              ))}
                            </div>
                            <div
                              style={{ fontSize: "0.85rem", color: "#64748b" }}
                            >
                              🍽️ {room.mealPlan} • 🔄 {room.cancellationPolicy}
                            </div>
                          </div>
                          <div style={{ display: "flex", gap: "0.75rem" }}>
                            <button
                              type="button"
                              onClick={() => editRoom(idx)}
                              style={{
                                ...styles.button,
                                ...styles.secondaryButton,
                                padding: "0.5rem 1rem",
                              }}
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => deleteRoom(idx)}
                              style={{
                                ...styles.button,
                                ...styles.dangerButton,
                                padding: "0.5rem 1rem",
                              }}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Policies Tab */}
              {activeTab === "policies" && (
                <div style={{ display: "grid", gap: "1.5rem" }}>
                  <div>
                    <label style={styles.label}>Cancellation Policy</label>
                    <textarea
                      value={formData.policies.cancellation}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          policies: {
                            ...formData.policies,
                            cancellation: e.target.value,
                          },
                        })
                      }
                      style={{
                        ...styles.input,
                        minHeight: "80px",
                        resize: "vertical",
                      }}
                      placeholder="Cancellation policy details..."
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Check-in Policy</label>
                    <textarea
                      value={formData.policies.checkIn}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          policies: {
                            ...formData.policies,
                            checkIn: e.target.value,
                          },
                        })
                      }
                      style={{
                        ...styles.input,
                        minHeight: "80px",
                        resize: "vertical",
                      }}
                      placeholder="Check-in policy details..."
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Check-out Policy</label>
                    <textarea
                      value={formData.policies.checkOut}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          policies: {
                            ...formData.policies,
                            checkOut: e.target.value,
                          },
                        })
                      }
                      style={{
                        ...styles.input,
                        minHeight: "80px",
                        resize: "vertical",
                      }}
                      placeholder="Check-out policy details..."
                    />
                  </div>
                  <div>
                    <label style={styles.label}>Pet Policy</label>
                    <textarea
                      value={formData.policies.pets}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          policies: {
                            ...formData.policies,
                            pets: e.target.value,
                          },
                        })
                      }
                      style={{
                        ...styles.input,
                        minHeight: "80px",
                        resize: "vertical",
                      }}
                      placeholder="Pet policy details..."
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
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <h3
                        style={{
                          fontSize: "1.1rem",
                          margin: 0,
                          color: "#1a1a2e",
                          fontWeight: 600,
                        }}
                      >
                        Custom Fields
                      </h3>
                      <button
                        type="button"
                        onClick={addCustomField}
                        style={{
                          ...styles.button,
                          ...styles.primaryButton,
                          padding: "0.5rem 1rem",
                          fontSize: "0.9rem",
                        }}
                      >
                        + Add Custom Column
                      </button>
                    </div>
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "#6b7280",
                        marginBottom: "1rem",
                      }}
                    >
                      Add custom fields like "Rooms Available", "Discount", or
                      any other information you need.
                    </p>

                    {(formData.customFields || []).length === 0 ? (
                      <div
                        style={{
                          padding: "2rem",
                          textAlign: "center",
                          background: "#f9fafb",
                          borderRadius: "8px",
                          color: "#6b7280",
                          border: "2px dashed #e5e7eb",
                        }}
                      >
                        No custom fields added yet. Click "Add Custom Column" to
                        create one.
                      </div>
                    ) : (
                      <div style={{ display: "grid", gap: "1rem" }}>
                        {(formData.customFields || []).map((field, index) => (
                          <div
                            key={index}
                            style={{
                              padding: "1rem",
                              background: "#f9fafb",
                              borderRadius: "8px",
                              border: "1px solid #e5e7eb",
                              display: "grid",
                              gridTemplateColumns: "1fr 1fr auto",
                              gap: "1rem",
                              alignItems: "end",
                            }}
                          >
                            <div>
                              <label style={styles.label}>Field Name</label>
                              <input
                                type="text"
                                value={field.label}
                                onChange={(e) =>
                                  updateCustomField(
                                    index,
                                    "label",
                                    e.target.value,
                                  )
                                }
                                style={styles.input}
                                placeholder="e.g., Rooms Available"
                              />
                            </div>
                            <div>
                              <label style={styles.label}>Field Value</label>
                              <input
                                type="text"
                                value={field.value}
                                onChange={(e) =>
                                  updateCustomField(
                                    index,
                                    "value",
                                    e.target.value,
                                  )
                                }
                                style={styles.input}
                                placeholder="e.g., 20 rooms"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => removeCustomField(index)}
                              style={{
                                ...styles.button,
                                ...styles.dangerButton,
                                padding: "0.6rem 1rem",
                                height: "fit-content",
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === "reviews" && (
                <div>
                  <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
                    Reviews are automatically generated from guest feedback. You
                    can manage review visibility and moderate content here in
                    future updates.
                  </p>
                  <div
                    style={{
                      marginTop: "2rem",
                      padding: "2rem",
                      background: "#f9fafb",
                      borderRadius: "8px",
                      textAlign: "center",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "3rem", color: "#cbd5e1" }}
                    >
                      rate_review
                    </span>
                    <p style={{ marginTop: "1rem", color: "#64748b" }}>
                      Review management features coming soon
                    </p>
                  </div>
                </div>
              )}

              {/* Form Actions */}
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "flex-end",
                  marginTop: "2rem",
                  paddingTop: "2rem",
                  borderTop: "2px solid #e5e7eb",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setFormData(emptyHotel);
                    setEditingId(null);
                  }}
                  style={{ ...styles.button, ...styles.secondaryButton }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{ ...styles.button, ...styles.primaryButton }}
                >
                  {editingId ? "Update Hotel" : "Create Hotel"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Hotels List */}
        {!showForm && (
          <div style={styles.card}>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                marginBottom: "1.5rem",
              }}
            >
              All Hotels ({hotels.length})
            </h2>

            {loading ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "#64748b",
                }}
              >
                Loading hotels...
              </div>
            ) : hotels.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "3rem",
                  color: "#64748b",
                  background: "#f9fafb",
                  borderRadius: "8px",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "4rem", color: "#cbd5e1" }}
                >
                  hotel
                </span>
                <p style={{ marginTop: "1rem" }}>
                  No hotels found. Add your first hotel!
                </p>
              </div>
            ) : (
              <div style={{ display: "grid", gap: "1.5rem" }}>
                {hotels.map((hotel) => (
                  <div
                    key={hotel._id}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "250px 1fr auto",
                      gap: "1.5rem",
                      padding: "1.5rem",
                      border: "2px solid #e5e7eb",
                      borderRadius: "12px",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      style={{
                        width: "100%",
                        height: "180px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "start",
                          gap: "1rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            flex: 1,
                          }}
                        >
                          {hotel.name}
                        </h3>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          {hotel.popular && (
                            <span
                              style={{
                                padding: "0.25rem 0.75rem",
                                background: "#fef3c7",
                                color: "#92400e",
                                borderRadius: "6px",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                              }}
                            >
                              ⭐ Popular
                            </span>
                          )}
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              background: hotel.active ? "#d1fae5" : "#fee2e2",
                              color: hotel.active ? "#065f46" : "#991b1b",
                              borderRadius: "6px",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                            }}
                          >
                            {hotel.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>
                      <p style={{ color: "#64748b", marginBottom: "0.75rem" }}>
                        📍 {hotel.location}{" "}
                        {hotel.address && `• ${hotel.address}`}
                      </p>
                      <div
                        style={{
                          display: "flex",
                          gap: "1.5rem",
                          marginBottom: "0.75rem",
                          fontSize: "0.9rem",
                          color: "#64748b",
                        }}
                      >
                        <span>
                          ⭐ {hotel.rating} ({hotel.reviews} reviews)
                        </span>
                        <span>💰 Starting from {formatInr(hotel.price)}</span>
                        {hotel.rooms && (
                          <span>🏠 {hotel.rooms.length} room types</span>
                        )}
                      </div>
                      {hotel.description && (
                        <p
                          style={{
                            color: "#64748b",
                            fontSize: "0.9rem",
                            lineHeight: "1.6",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {hotel.description}
                        </p>
                      )}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.75rem",
                      }}
                    >
                      <button
                        onClick={() => handleEdit(hotel)}
                        style={{
                          ...styles.button,
                          ...styles.primaryButton,
                          padding: "0.6rem 1.25rem",
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => hotel._id && handleDelete(hotel._id)}
                        style={{
                          ...styles.button,
                          ...styles.dangerButton,
                          padding: "0.6rem 1.25rem",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
