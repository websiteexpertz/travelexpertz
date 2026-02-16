"use client";

import React, { useState, useEffect } from "react";

interface Event {
  _id?: string;
  eventName: string;
  description: string;
  location: string;
  state: string;
  city: string;
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

  useEffect(() => {
    fetchEvents();
  }, []);

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

    if (
      !formData.eventName ||
      !formData.location ||
      !formData.state ||
      !formData.startDate ||
      !formData.profileImage
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const url = editingId ? "/api/events" : "/api/events";
      const method = editingId ? "PATCH" : "POST";
      const body = editingId ? { ...formData, _id: editingId } : formData;

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
        setFormData({
          eventName: "",
          description: "",
          location: "",
          state: "",
          city: "",
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
        setImagePreview("");
        setGalleryPreviews([]);
        setEditingId(null);
        setShowForm(false);
        fetchEvents();
      }
    } catch (error) {
      console.error("Failed to save event:", error);
      alert("Failed to save event");
    }
  };

  const handleEdit = (event: Event) => {
    setFormData(event);
    setImagePreview(event.profileImage);
    setGalleryPreviews(event.galleryImages || []);
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
            {/* Row 1: Event Name and Organizer */}
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
                  Event Name *
                </label>
                <input
                  type="text"
                  name="eventName"
                  value={formData.eventName}
                  onChange={handleInputChange}
                  placeholder="e.g., Holi Festival 2026"
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
                  Organizer
                </label>
                <input
                  type="text"
                  name="organizer"
                  value={formData.organizer}
                  onChange={handleInputChange}
                  placeholder="e.g., Local Organization"
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

            {/* Row 2: Location, State, City */}
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
                    color: "#374151",
                  }}
                >
                  Location Name *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Himalayan Grounds"
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
                  State *
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">Select State</option>
                  {indianStates.map((state) => (
                    <option key={state} value={state}>
                      {state}
                    </option>
                  ))}
                </select>
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
                  City
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="e.g., Dehradun"
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

            {/* Row 3: Category and Ticket Price */}
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
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "0.95rem",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="">Select Category</option>
                  {eventCategories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
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
                  Ticket Price (₹)
                </label>
                <input
                  type="number"
                  name="ticketPrice"
                  value={formData.ticketPrice}
                  onChange={handleInputChange}
                  placeholder="0"
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

            {/* Row 4: Start and End Date */}
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
                  value={formData.startDate}
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
                  End Date
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
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

            {/* Registration Link */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Registration Link
              </label>
              <input
                type="url"
                name="registrationLink"
                value={formData.registrationLink}
                onChange={handleInputChange}
                placeholder="https://..."
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

            {/* Image Upload */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Profile Image * (Main event image)
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                disabled={uploadingImage}
                style={{
                  display: "block",
                  marginBottom: "1rem",
                  padding: "0.5rem",
                }}
              />
              {imagePreview && (
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxWidth: "200px",
                    maxHeight: "200px",
                    borderRadius: "8px",
                    marginBottom: "1rem",
                  }}
                />
              )}
              {uploadingImage && <p>Uploading...</p>}
            </div>

            {/* Gallery Images Upload */}
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: 600,
                  color: "#374151",
                }}
              >
                Gallery Images (Multiple images)
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleGalleryImageUpload}
                disabled={uploadingImage}
                style={{
                  display: "block",
                  marginBottom: "1rem",
                  padding: "0.5rem",
                }}
              />
              {galleryPreviews.length > 0 && (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  {galleryPreviews.map((preview, index) => (
                    <div key={index} style={{ position: "relative" }}>
                      <img
                        src={preview}
                        alt={`Gallery ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "150px",
                          objectFit: "cover",
                          borderRadius: "8px",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => removeGalleryImage(index)}
                        style={{
                          position: "absolute",
                          top: "5px",
                          right: "5px",
                          background: "rgba(255,0,0,0.7)",
                          color: "white",
                          border: "none",
                          borderRadius: "50%",
                          width: "28px",
                          height: "28px",
                          cursor: "pointer",
                          fontSize: "16px",
                          fontWeight: "bold",
                          padding: "0",
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
              {uploadingImage && <p>Uploading...</p>}
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
                style={{ cursor: "pointer" }}
              />
              <label
                htmlFor="active-toggle"
                style={{ cursor: "pointer", marginBottom: 0 }}
              >
                Active
              </label>
            </div>

            {/* Form Actions */}
            <div style={{ display: "flex", gap: "1rem", marginTop: "1.5rem" }}>
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
                  <strong>Location:</strong> {event.location}, {event.city},{" "}
                  {event.state}
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
                    margin: "0.25rem 0",
                    color: "#666",
                    fontSize: "0.9rem",
                  }}
                >
                  <strong>Ticket Price:</strong> ₹{event.ticketPrice}
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
