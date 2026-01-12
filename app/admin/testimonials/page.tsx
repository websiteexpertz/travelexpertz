"use client";

import React, { useState, useEffect } from "react";

interface Testimonial {
  _id?: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  text: string;
  verified: boolean;
  customFields?: Array<{ label: string; value: string; type: string }>;
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState<Testimonial>({
    name: "",
    location: "",
    image: "",
    rating: 5,
    text: "",
    verified: false,
    customFields: [],
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const response = await fetch("/api/testimonials?admin=true", {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setTestimonials(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch testimonials:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : type === "number"
          ? Number(value)
          : name === "rating"
          ? Number(value)
          : value,
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
          image: data.url,
        });
        setImagePreview(data.url);
      }
    } catch (error) {
      console.error("Failed to upload image:", error);
    } finally {
      setUploadingImage(false);
    }
  };

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
    value: string
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) {
      alert("Please upload an image before saving.");
      return;
    }
    try {
      const url = "/api/testimonials";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchTestimonials();
        setShowForm(false);
        setEditingId(null);
        setImagePreview("");
        setFormData({
          name: "",
          location: "",
          image: "",
          rating: 5,
          text: "",
          verified: false,
          customFields: [],
        });
      }
    } catch (error) {
      console.error("Failed to save testimonial:", error);
    }
  };

  const handleEdit = (testimonial: Testimonial) => {
    setFormData({
      ...testimonial,
      customFields: testimonial.customFields || [],
    });
    setEditingId(testimonial._id || null);
    setImagePreview(testimonial.image || "");
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this testimonial?")) {
      try {
        await fetch(`/api/testimonials?id=${id}`, { method: "DELETE" });
        fetchTestimonials();
      } catch (error) {
        console.error("Failed to delete testimonial:", error);
      }
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h1 style={{ margin: 0, color: "#1a1a2e", fontSize: "1.5rem" }}>
          Manage Testimonials
        </h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setImagePreview("");
            setFormData({
              name: "",
              location: "",
              image: "",
              rating: 5,
              text: "",
              verified: false,
              customFields: [],
            });
          }}
          style={{
            padding: "0.5rem 1rem",
            background: "#0066cc",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          {showForm ? "Cancel" : "Add Testimonial"}
        </button>
      </div>

      {showForm && (
        <div
          style={{
            background: "white",
            padding: "1rem",
            borderRadius: "12px",
            marginBottom: "1rem",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <h2>{editingId ? "Edit Testimonial" : "Add New Testimonial"}</h2>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <input
                type="text"
                name="name"
                placeholder="Customer Name"
                value={formData.name}
                onChange={handleInputChange}
                required
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleInputChange}
                required
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
            </div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <div
                style={{
                  padding: "0.75rem",
                  border: "2px dashed #ddd",
                  borderRadius: "8px",
                  textAlign: "center",
                  background: "#f9f9f9",
                }}
              >
                <label style={{ cursor: "pointer", display: "block" }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                    style={{ display: "none" }}
                  />
                  <div style={{ marginBottom: "0.35rem" }}>
                    <strong>
                      {uploadingImage
                        ? "Uploading..."
                        : formData.image
                        ? "Replace image"
                        : "Click to upload image"}
                    </strong>
                  </div>
                  <small style={{ color: "#666" }}>JPG/PNG, up to 50 MB</small>
                </label>
                {imagePreview && (
                  <div style={{ marginTop: "0.75rem" }}>
                    <img
                      src={imagePreview}
                      alt="Preview"
                      style={{
                        maxWidth: "150px",
                        maxHeight: "150px",
                        borderRadius: "8px",
                        objectFit: "cover",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview("");
                        setFormData({ ...formData, image: "" });
                      }}
                      style={{
                        marginTop: "0.5rem",
                        padding: "0.4rem 0.75rem",
                        background: "#ff6b6b",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                      }}
                    >
                      Remove
                    </button>
                  </div>
                )}
              </div>
              <select
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                style={{
                  padding: "0.5rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  alignSelf: "start",
                }}
              >
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
            </div>
            <textarea
              name="text"
              placeholder="Testimonial Text"
              value={formData.text}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "0.9rem",
                marginBottom: "0.75rem",
                minHeight: "60px",
              }}
            />
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                marginBottom: "0.75rem",
                fontSize: "0.9rem",
              }}
            >
              <input
                type="checkbox"
                name="verified"
                checked={formData.verified}
                onChange={handleInputChange}
              />
              Verified
            </label>

            {/* Custom Fields Section */}
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
                <h3 style={{ fontSize: "1rem", margin: 0, fontWeight: 600 }}>
                  Custom Fields
                </h3>
                <button
                  type="button"
                  onClick={addCustomField}
                  style={{
                    padding: "0.5rem 0.75rem",
                    background: "#0066cc",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
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
                Add custom fields like "Company", "Trip Date", or any other
                information you need.
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
                <div style={{ display: "grid", gap: "0.75rem" }}>
                  {(formData.customFields || []).map((field, index) => (
                    <div
                      key={index}
                      style={{
                        padding: "0.75rem",
                        background: "#f9fafb",
                        borderRadius: "6px",
                        border: "1px solid #e5e7eb",
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr auto auto",
                        gap: "0.75rem",
                        alignItems: "center",
                      }}
                    >
                      <input
                        type="text"
                        value={field.label}
                        onChange={(e) =>
                          updateCustomField(index, "label", e.target.value)
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
                        type={field.type}
                        value={field.value}
                        onChange={(e) =>
                          updateCustomField(index, "value", e.target.value)
                        }
                        placeholder="Value"
                        style={{
                          padding: "0.5rem",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                        }}
                      />
                      <select
                        value={field.type}
                        onChange={(e) =>
                          updateCustomField(index, "type", e.target.value)
                        }
                        style={{
                          padding: "0.5rem",
                          border: "1px solid #ddd",
                          borderRadius: "6px",
                          fontSize: "0.85rem",
                          width: "100px",
                        }}
                      >
                        <option value="text">Text</option>
                        <option value="number">Number</option>
                        <option value="date">Date</option>
                        <option value="email">Email</option>
                        <option value="tel">Phone</option>
                        <option value="url">URL</option>
                      </select>
                      <button
                        type="button"
                        onClick={() => removeCustomField(index)}
                        style={{
                          padding: "0.5rem",
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
                  ))}
                </div>
              )}
            </div>

            <button
              type="submit"
              style={{
                padding: "0.5rem 1rem",
                background: "#00b894",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.9rem",
              }}
            >
              {editingId ? "Update Testimonial" : "Create Testimonial"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading testimonials...</p>
      ) : (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#f5f5f5",
                  borderBottom: "2px solid #ddd",
                }}
              >
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Name</th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Image</th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>
                  Location
                </th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Rating</th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Text</th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>
                  Verified
                </th>
                <th style={{ padding: "0.5rem", textAlign: "center" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {testimonials.map((testimonial) => (
                <tr
                  key={testimonial._id}
                  style={{ borderBottom: "1px solid #ddd" }}
                >
                  <td style={{ padding: "0.5rem" }}>{testimonial.name}</td>
                  <td style={{ padding: "0.5rem" }}>
                    {testimonial.image ? (
                      <img
                        src={testimonial.image}
                        alt={testimonial.name}
                        style={{
                          width: "48px",
                          height: "48px",
                          objectFit: "cover",
                          borderRadius: "6px",
                          border: "1px solid #eee",
                        }}
                      />
                    ) : (
                      <span style={{ color: "#999" }}>No image</span>
                    )}
                  </td>
                  <td style={{ padding: "0.5rem" }}>{testimonial.location}</td>
                  <td style={{ padding: "0.5rem", fontSize: "0.9rem" }}>
                    {"⭐".repeat(testimonial.rating)}
                  </td>
                  <td
                    style={{
                      padding: "0.5rem",
                      maxWidth: "180px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: "0.85rem",
                    }}
                  >
                    {testimonial.text}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "20px",
                        background: testimonial.verified
                          ? "#d4edda"
                          : "#f8d7da",
                        color: testimonial.verified ? "#155724" : "#721c24",
                        fontSize: "0.8rem",
                      }}
                    >
                      {testimonial.verified ? "Yes" : "No"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <button
                      onClick={() => handleEdit(testimonial)}
                      style={{
                        padding: "0.5rem 1rem",
                        marginRight: "0.5rem",
                        background: "#0066cc",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial._id || "")}
                      style={{
                        padding: "0.5rem 1rem",
                        background: "#ff6b6b",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
