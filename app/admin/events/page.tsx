"use client";

import React, { useState, useEffect } from "react";

export interface EventLocationItem {
  state: string;
  city?: string;
}

interface Event {
  _id?: string;
  eventName: string;
  description: string;
  location: string;
  state: string;
  city: string;
  locations?: EventLocationItem[];
  startDate: string;
  endDate: string;
  profileImage: string;
  galleryImages: string[];
  organizer: string;
  category: string;
  ticketPrice: number;
  registrationLink: string;
  active: boolean;
}

const indianStates = [
  // Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
  "Delhi",
  "Puducherry",
  "Ladakh",
  "Jammu and Kashmir",
  // States
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
];

const eventCategories = [
  "Festival",
  "Cultural",
  "Adventure",
  "Music",
  "Food",
  "Sports",
  "Wellness",
  "Other",
];

export default function AdminEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [galleryPreviews, setGalleryPreviews] = useState<string[]>([]);
  const [formData, setFormData] = useState<Event>({
    eventName: "",
    description: "",
    location: "",
    state: "",
    city: "",
    locations: [],
    startDate: "",
    endDate: "",
    profileImage: "",
    galleryImages: [],
    organizer: "",
    category: "",
    ticketPrice: 0,
    registrationLink: "",
    active: true,
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [destinationsData, setDestinationsData] = useState<
    { stateName: string; cityName: string }[]
  >([]);
  const [newLocState, setNewLocState] = useState("");
  const [newLocCity, setNewLocCity] = useState("");
  const [customStateInput, setCustomStateInput] = useState(false);
  const [customCityInput, setCustomCityInput] = useState(false);
  const [customCategoryInput, setCustomCategoryInput] = useState(false);

  useEffect(() => {
    fetchEvents();
    fetchDestinationHierarchy();
  }, []);

  const fetchDestinationHierarchy = async () => {
    try {
      const res = await fetch("/api/hotel-destinations/states/all");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setDestinationsData(data);
        }
      }
    } catch (e) {
      console.error("Failed to load destination states:", e);
    }
  };

  const allStates = Array.from(
    new Set([
      ...indianStates,
      ...destinationsData.map((d) => d.stateName).filter(Boolean),
    ]),
  ).sort();

  const availableCities = Array.from(
    new Set(
      destinationsData
        .filter(
          (d) =>
            d.stateName?.toLowerCase() === newLocState.toLowerCase() &&
            d.cityName,
        )
        .map((d) => d.cityName),
    ),
  ).sort();

  const handleAddLocation = () => {
    if (!newLocState) {
      alert("Please select a state first.");
      return;
    }
    const cleanCity = newLocCity.trim();
    const cleanState = newLocState.trim();
    const currentLocs = formData.locations || [];

    const isDuplicate = currentLocs.some(
      (l) =>
        l.state.toLowerCase() === cleanState.toLowerCase() &&
        (l.city || "").toLowerCase() === cleanCity.toLowerCase(),
    );
    if (isDuplicate) {
      alert("This city and state location is already added.");
      return;
    }

    const updated = [...currentLocs, { state: cleanState, city: cleanCity }];
    setFormData({
      ...formData,
      locations: updated,
      state: updated[0]?.state || "",
      city: updated[0]?.city || "",
    });
    setNewLocState("");
    setNewLocCity("");
    setCustomCityInput(false);
  };

  const handleRemoveLocation = (index: number) => {
    const currentLocs = formData.locations || [];
    const updated = currentLocs.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      locations: updated,
      state: updated[0]?.state || "",
      city: updated[0]?.city || "",
    });
  };

  const handleEditLocation = (index: number) => {
    const currentLocs = formData.locations || [];
    const item = currentLocs[index];
    if (!item) return;
    setNewLocState(item.state);
    setNewLocCity(item.city || "");
    const updated = currentLocs.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      locations: updated,
      state: updated[0]?.state || "",
      city: updated[0]?.city || "",
    });
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events?admin=true", {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        const sortedEvents = Array.isArray(data)
          ? data.sort(
            (a, b) =>
              new Date(b.startDate).getTime() -
              new Date(a.startDate).getTime(),
          )
          : [];
        setEvents(sortedEvents);
      }
    } catch (error) {
      console.error("Failed to fetch events:", error);
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
    let processedValue: any = value;

    if (type === "checkbox") {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === "ticketPrice") {
      processedValue = parseFloat(value) || 0;
    }

    setFormData({
      ...formData,
      [name]: processedValue,
    });
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
        setFormData({
          ...formData,
          profileImage: data.url,
        });
        setImagePreview(data.url);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGalleryImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = e.target.files;
    if (!files) return;

    setUploadingImage(true);
    const newGalleryImages = [...formData.galleryImages];
    const newPreviews = [...galleryPreviews];

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
          newGalleryImages.push(data.url);
          newPreviews.push(data.url);
        }
      }

      setFormData({
        ...formData,
        galleryImages: newGalleryImages,
      });
      setGalleryPreviews(newPreviews);
    } catch (error) {
      console.error("Failed to upload gallery images:", error);
    } finally {
      setUploadingImage(false);
    }
  };

  const removeGalleryImage = (index: number) => {
    const newGalleryImages = formData.galleryImages.filter(
      (_, i) => i !== index,
    );
    const newPreviews = galleryPreviews.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      galleryImages: newGalleryImages,
    });
    setGalleryPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Synchronize locations array with pending state/city or existing fields
    let finalLocations = [...(formData.locations || [])];
    if (newLocState.trim()) {
      const pendingState = newLocState.trim();
      const pendingCity = newLocCity.trim();
      const exists = finalLocations.some(
        (l) =>
          l.state.toLowerCase() === pendingState.toLowerCase() &&
          (l.city || "").toLowerCase() === pendingCity.toLowerCase(),
      );
      if (!exists) {
        finalLocations.push({ state: pendingState, city: pendingCity });
      }
    }
    if (finalLocations.length === 0 && formData.state) {
      finalLocations = [{ state: formData.state, city: formData.city || "" }];
    }

    const primaryState =
      finalLocations[0]?.state || formData.state || newLocState.trim();
    const primaryCity =
      finalLocations[0]?.city || formData.city || newLocCity.trim();

    if (!formData.eventName.trim()) {
      alert("Please enter the Event Name.");
      return;
    }
    if (!primaryState) {
      alert("Please select or add a State for the event.");
      return;
    }
    if (!formData.startDate) {
      alert("Please select the Start Date for the event.");
      return;
    }

    try {
      const url = editingId ? "/api/events" : "/api/events";
      const method = editingId ? "PATCH" : "POST";
      const body = {
        ...formData,
        eventName: formData.eventName.trim(),
        location:
          formData.location?.trim() ||
          [primaryCity, primaryState].filter(Boolean).join(", ") ||
          "India",
        state: primaryState,
        city: primaryCity,
        locations:
          finalLocations.length > 0
            ? finalLocations
            : [{ state: primaryState, city: primaryCity }],
        category: formData.category?.trim() || "Festival",
        description: formData.description?.trim() || "",
        endDate: formData.endDate || "",
        profileImage: formData.profileImage || "/hero4.jpeg",
        active: formData.active !== undefined ? formData.active : true,
        ...(editingId ? { _id: editingId } : {}),
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
        alert(
          editingId
            ? "Event updated successfully"
            : "Event created successfully",
        );
        handleCancel();
        fetchEvents();
      }
    } catch (error) {
      console.error("Failed to save event:", error);
      alert("Failed to save event");
    }
  };

  const handleEdit = (event: Event) => {
    const locs =
      Array.isArray(event.locations) && event.locations.length > 0
        ? event.locations
        : event.state
          ? [{ state: event.state, city: event.city || "" }]
          : [];
    setFormData({
      ...event,
      locations: locs,
    });
    setNewLocState("");
    setNewLocCity("");
    setCustomStateInput(false);
    setCustomCityInput(false);
    setCustomCategoryInput(false);
    setImagePreview(event.profileImage || "");
    setGalleryPreviews([]);
    setEditingId(event._id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;

    try {
      const response = await fetch(`/api/events?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        alert("Event deleted successfully");
        fetchEvents();
      }
    } catch (error) {
      console.error("Failed to delete event:", error);
      alert("Failed to delete event");
    }
  };

  const handleCancel = () => {
    setFormData({
      eventName: "",
      description: "",
      location: "",
      state: "",
      city: "",
      locations: [],
      startDate: "",
      endDate: "",
      profileImage: "",
      galleryImages: [],
      organizer: "",
      category: "",
      ticketPrice: 0,
      registrationLink: "",
      active: true,
    });
    setNewLocState("");
    setNewLocCity("");
    setCustomStateInput(false);
    setCustomCityInput(false);
    setCustomCategoryInput(false);
    setImagePreview("");
    setGalleryPreviews([]);
    setEditingId(null);
    setShowForm(false);
  };

  const filteredEvents = events.filter(
    (event) =>
      event.eventName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.state.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading events...
      </div>
    );
  }

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            margin: 0,
            color: "#1a1a2e",
          }}
        >
          Upcoming Events
        </h1>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            padding: "0.75rem 1.5rem",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontSize: "0.95rem",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.3s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow =
              "0 4px 12px rgba(102, 126, 234, 0.3)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = "none";
          }}
        >
          {showForm ? "Cancel" : "+ Add Event"}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div
          style={{
            background: "white",
            padding: "2rem",
            borderRadius: "12px",
            marginBottom: "2rem",
            border: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              marginTop: 0,
              marginBottom: "1.5rem",
              color: "#1a1a2e",
            }}
          >
            {editingId ? "Edit Event" : "Add New Event"}
          </h2>

          <form
            onSubmit={handleSubmit}
            style={{ display: "grid", gap: "1.5rem" }}
          >
            {/* Event Name */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Event Name *
              </label>
              <input
                type="text"
                name="eventName"
                value={formData.eventName}
                onChange={handleInputChange}
                placeholder="e.g., Bundi Festival / Goa Carnival"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* Location (Optional) */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Location / Venue (Optional)
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="e.g., Bundi Palace Grounds / Multiple Venues"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            {/* City & State Selection (Supports Single & Multiple Locations) */}
            <div
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                padding: "1rem",
                background: "#f8fafc",
                marginTop: "0.5rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.75rem",
                }}
              >
                <div>
                  <h4
                    style={{
                      margin: 0,
                      fontSize: "0.95rem",
                      fontWeight: 700,
                      color: "#1e293b",
                    }}
                  >
                    Event Cities & States (Multiple Locations Supported)
                  </h4>
                  <p
                    style={{
                      margin: "2px 0 0",
                      fontSize: "0.82rem",
                      color: "#64748b",
                    }}
                  >
                    Select state and city destination pairs. Each city and state
                    becomes individually clickable on the homepage.
                  </p>
                </div>
              </div>

              {/* Location Input Controls */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto",
                  gap: "0.75rem",
                  alignItems: "flex-end",
                  marginBottom: "0.75rem",
                }}
              >
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.35rem",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Select State *
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setCustomStateInput(!customStateInput);
                        setNewLocState("");
                        setNewLocCity("");
                        setCustomCityInput(false);
                      }}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0b6dff",
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        padding: 0,
                        textDecoration: "underline",
                      }}
                    >
                      {customStateInput ? "Select from list" : "Type custom state"}
                    </button>
                  </div>
                  {!customStateInput ? (
                    <select
                      value={newLocState}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setCustomStateInput(true);
                          setNewLocState("");
                          setNewLocCity("");
                          setCustomCityInput(false);
                        } else {
                          setNewLocState(e.target.value);
                          setNewLocCity("");
                          setCustomCityInput(false);
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "0.65rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        background: "white",
                      }}
                    >
                      <option value="">-- Choose State --</option>
                      {allStates.map((st) => (
                        <option key={st} value={st}>
                          {st}
                        </option>
                      ))}
                      <option value="__custom__">+ Add Custom State...</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={newLocState}
                      onChange={(e) => setNewLocState(e.target.value)}
                      placeholder="Enter state name (e.g. Rajasthan, Goa)"
                      style={{
                        width: "100%",
                        padding: "0.65rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        background: "white",
                        boxSizing: "border-box",
                      }}
                    />
                  )}
                </div>

                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "0.35rem",
                    }}
                  >
                    <label
                      style={{
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#374151",
                      }}
                    >
                      Select or Type City (Optional)
                    </label>
                    <button
                      type="button"
                      onClick={() => setCustomCityInput(!customCityInput)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#0b6dff",
                        fontSize: "0.78rem",
                        cursor: "pointer",
                        padding: 0,
                        textDecoration: "underline",
                      }}
                    >
                      {customCityInput
                        ? availableCities.length > 0
                          ? "Select from list"
                          : "Type city"
                        : "Type custom city"}
                    </button>
                  </div>

                  {availableCities.length > 0 && !customCityInput ? (
                    <select
                      value={newLocCity}
                      onChange={(e) => {
                        if (e.target.value === "__custom__") {
                          setCustomCityInput(true);
                          setNewLocCity("");
                        } else {
                          setNewLocCity(e.target.value);
                        }
                      }}
                      style={{
                        width: "100%",
                        padding: "0.65rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        background: "white",
                      }}
                    >
                      <option value="">
                        All State / No Specific City (State-Only)
                      </option>
                      {availableCities.map((ct) => (
                        <option key={ct} value={ct}>
                          {ct}
                        </option>
                      ))}
                      <option value="__custom__">+ Add Custom City...</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={newLocCity}
                      onChange={(e) => setNewLocCity(e.target.value)}
                      placeholder={
                        newLocState
                          ? `City in ${newLocState} (leave empty for state-only)`
                          : "Enter city name (optional)"
                      }
                      style={{
                        width: "100%",
                        padding: "0.65rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.9rem",
                        background: "white",
                        boxSizing: "border-box",
                      }}
                    />
                  )}
                </div>

                <div>
                  <button
                    type="button"
                    onClick={handleAddLocation}
                    style={{
                      padding: "0.65rem 1.25rem",
                      background: "#0b6dff",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                    }}
                  >
                    + Add Location
                  </button>
                </div>
              </div>

              {/* Selected Locations List */}
              {formData.locations && formData.locations.length > 0 ? (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  {formData.locations.map((loc, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        background: "#ffffff",
                        border: "1px solid #cbd5e1",
                        borderRadius: "8px",
                        padding: "0.4rem 0.75rem",
                        fontSize: "0.85rem",
                        color: "#1e293b",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      }}
                    >
                      <span>
                        📍 <strong>{loc.city ? `${loc.city}, ` : ""}</strong>
                        {loc.state}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleEditLocation(idx)}
                        title="Edit location"
                        style={{
                          background: "none",
                          border: "none",
                          color: "#3b82f6",
                          cursor: "pointer",
                          padding: "0 2px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveLocation(idx)}
                        title="Remove location"
                        style={{
                          background: "none",
                          border: "none",
                          color: "#ef4444",
                          cursor: "pointer",
                          padding: "0 2px",
                          fontSize: "1rem",
                          fontWeight: 700,
                          lineHeight: 1,
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p
                  style={{
                    margin: "0.5rem 0 0",
                    fontSize: "0.82rem",
                    color: "#94a3b8",
                    fontStyle: "italic",
                  }}
                >
                  No locations added yet. Select a state above and click "+ Add
                  Location".
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                }}
              >
                <label
                  style={{
                    fontWeight: 600,
                    color: "#374151",
                    fontSize: "0.95rem",
                  }}
                >
                  Category
                </label>
                <button
                  type="button"
                  onClick={() => setCustomCategoryInput(!customCategoryInput)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0b6dff",
                    fontSize: "0.8rem",
                    cursor: "pointer",
                    padding: 0,
                    textDecoration: "underline",
                  }}
                >
                  {customCategoryInput
                    ? "Select from list"
                    : "Type custom category"}
                </button>
              </div>
              {!customCategoryInput ? (
                <select
                  name="category"
                  value={formData.category}
                  onChange={(e) => {
                    if (e.target.value === "__custom__") {
                      setCustomCategoryInput(true);
                      setFormData({ ...formData, category: "" });
                    } else {
                      handleInputChange(e);
                    }
                  }}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                    boxSizing: "border-box",
                    background: "white",
                  }}
                >
                  <option value="">Select Category</option>
                  {eventCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                  <option value="__custom__">+ Add Custom Category...</option>
                </select>
              ) : (
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Spiritual, Food & Wine, Art Exhibition"
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                    boxSizing: "border-box",
                  }}
                />
              )}
            </div>

            {/* Start and End Date */}
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
                    color: "#374151",
                  }}
                >
                  Start Date *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={
                    formData.startDate
                      ? formData.startDate.includes("T")
                        ? formData.startDate.slice(0, 16)
                        : formData.startDate
                      : ""
                  }
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
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
                    color: "#374151",
                  }}
                >
                  End Date (Optional)
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={
                    formData.endDate
                      ? formData.endDate.includes("T")
                        ? formData.endDate.slice(0, 16)
                        : formData.endDate
                      : ""
                  }
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter event details..."
                rows={4}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            {/* Active Toggle */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
                id="active-toggle"
                style={{ cursor: "pointer", width: "18px", height: "18px" }}
              />
              <label
                htmlFor="active-toggle"
                style={{
                  cursor: "pointer",
                  marginBottom: 0,
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Active
              </label>
            </div>

            {/* Form Actions */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1rem" }}>
              <button
                type="submit"
                style={{
                  padding: "0.75rem 1.5rem",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(102, 126, 234, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {editingId ? "Update Event" : "Create Event"}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: "#e5e7eb",
                  color: "#374151",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="Search events by name, city, or state..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "0.95rem",
          }}
        />
      </div>

      {/* Events List */}
      <div
        style={{ display: "grid", gridTemplateColumns: "1fr", gap: "1.5rem" }}
      >
        {filteredEvents.length === 0 ? (
          <div
            style={{
              padding: "2rem",
              textAlign: "center",
              color: "#999",
              background: "white",
              borderRadius: "12px",
            }}
          >
            No events found
          </div>
        ) : (
          filteredEvents.map((event) => (
            <div
              key={event._id}
              style={{
                background: "white",
                borderRadius: "12px",
                overflow: "hidden",
                border: "1px solid #e5e7eb",
                display: "grid",
                gridTemplateColumns: "200px 1fr auto",
                gap: "1.5rem",
                padding: "1.5rem",
                alignItems: "center",
              }}
            >
              {/* Image */}
              <div
                style={{
                  width: "200px",
                  height: "150px",
                  borderRadius: "8px",
                  overflow: "hidden",
                  background: "#f3f4f6",
                }}
              >
                <img
                  src={event.profileImage}
                  alt={event.eventName}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              {/* Content */}
              <div>
                <h3
                  style={{
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    margin: "0 0 0.5rem 0",
                    color: "#1a1a2e",
                  }}
                >
                  {event.eventName}
                </h3>
                <p
                  style={{
                    margin: "0.25rem 0",
                    color: "#666",
                    fontSize: "0.9rem",
                  }}
                >
                  <strong>Location:</strong>{" "}
                  {event.locations && event.locations.length > 0
                    ? event.locations
                      .map((l) => [l.city, l.state].filter(Boolean).join(", "))
                      .join(" | ")
                    : [event.location, event.city, event.state]
                      .filter(Boolean)
                      .join(", ")}
                </p>
                <p
                  style={{
                    margin: "0.25rem 0",
                    color: "#666",
                    fontSize: "0.9rem",
                  }}
                >
                  <strong>Dates:</strong>{" "}
                  {new Date(event.startDate).toLocaleDateString()} -
                  {event.endDate
                    ? ` ${new Date(event.endDate).toLocaleDateString()}`
                    : " Ongoing"}
                </p>
                <p
                  style={{
                    margin: "0.25rem 0",
                    color: "#666",
                    fontSize: "0.9rem",
                  }}
                >
                  <strong>Category:</strong> {event.category || "Not specified"}
                </p>
                <p
                  style={{
                    margin: "0.5rem 0 0 0",
                    color: "#666",
                    fontSize: "0.9rem",
                  }}
                >
                  <strong>Status:</strong>{" "}
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "20px",
                      fontSize: "0.85rem",
                      background: event.active ? "#dcfce7" : "#fee2e2",
                      color: event.active ? "#166534" : "#991b1b",
                    }}
                  >
                    {event.active ? "Active" : "Inactive"}
                  </span>
                </p>
              </div>

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  flexDirection: "column",
                }}
              >
                <button
                  onClick={() => handleEdit(event)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#3b82f6",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#2563eb";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#3b82f6";
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => event._id && handleDelete(event._id)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#ef4444",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#dc2626";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "#ef4444";
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
