"use client";

import React, { useState, useEffect } from "react";

interface Package {
  _id?: string;
  title: string;
  description: string;
  fullDescription: string;
  price: number;
  currency: string;
  duration: string;
  location: string;
  image: string;
  featured: boolean;
  active: boolean;
  highlights?: string[];
  itinerary?: Array<{
    day: number;
    title: string;
    description: string;
  }>;
  inclusions?: string[];
  exclusions?: string[];
  bestTime?: string;
  difficulty?: string;
  groupSize?: string;
  notes?: string;
  customFields?: Array<{ label: string; value: string }>;
  longDetails?: Array<{ title: string; content: string }>;
  createdAt?: string;
}

export default function AdminPackages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState<Package>({
    title: "",
    description: "",
    fullDescription: "",
    price: 0,
    currency: "₹",
    duration: "",
    location: "",
    image: "",
    featured: false,
    active: true,
    highlights: [],
    itinerary: [],
    inclusions: [],
    exclusions: [],
    bestTime: "Year Round",
    difficulty: "Moderate",
    groupSize: "2-15 People",
    customFields: [],
    longDetails: [],
  });

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const response = await fetch("/api/packages", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setPackages(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
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

  const addArrayItem = (
    field: "highlights" | "inclusions" | "exclusions" | "itinerary"
  ) => {
    if (field === "itinerary") {
      setFormData({
        ...formData,
        itinerary: [
          ...(formData.itinerary || []),
          {
            day: (formData.itinerary?.length || 0) + 1,
            title: "",
            description: "",
          },
        ],
      });
    } else {
      setFormData({
        ...formData,
        [field]: [...(formData[field] || []), ""],
      });
    }
  };

  const removeArrayItem = (
    field: "highlights" | "inclusions" | "exclusions" | "itinerary",
    index: number
  ) => {
    if (field === "itinerary") {
      setFormData({
        ...formData,
        itinerary: (formData.itinerary || []).filter((_, i) => i !== index),
      });
    } else {
      setFormData({
        ...formData,
        [field]: (formData[field] || []).filter((_, i) => i !== index),
      });
    }
  };

  const updateArrayItem = (
    field: "highlights" | "inclusions" | "exclusions" | "itinerary",
    index: number,
    value: any
  ) => {
    const newArray = [...(formData[field] || [])];
    newArray[index] = value;
    setFormData({
      ...formData,
      [field]: newArray,
    });
  };

  const addCustomField = () => {
    setFormData({
      ...formData,
      customFields: [
        ...(formData.customFields || []),
        { label: "", value: "" },
      ],
    });
  };

  const addLongDetail = () => {
    setFormData({
      ...formData,
      longDetails: [
        ...(formData.longDetails || []),
        { title: "", content: "" },
      ],
    });
  };

  const updateLongDetail = (
    index: number,
    key: "title" | "content",
    value: string
  ) => {
    const details = [...(formData.longDetails || [])];
    details[index] = { ...details[index], [key]: value };
    setFormData({ ...formData, longDetails: details });
  };

  const removeLongDetail = (index: number) => {
    setFormData({
      ...formData,
      longDetails: (formData.longDetails || []).filter((_, i) => i !== index),
    });
  };

  const updateCustomField = (
    index: number,
    key: "label" | "value",
    value: string
  ) => {
    const fields = [...(formData.customFields || [])];
    fields[index] = { ...fields[index], [key]: value };
    setFormData({ ...formData, customFields: fields });
  };

  const removeCustomField = (index: number) => {
    setFormData({
      ...formData,
      customFields: (formData.customFields || []).filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const url = "/api/packages";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          customFields: formData.customFields || [],
        }),
      });

      if (response.ok) {
        fetchPackages();
        setShowForm(false);
        setEditingId(null);
        setImagePreview("");
        setFormData({
          title: "",
          description: "",
          fullDescription: "",
          price: 0,
          currency: "₹",
          duration: "",
          location: "",
          image: "",
          featured: false,
          active: true,
          highlights: [],
          itinerary: [],
          inclusions: [],
          exclusions: [],
          bestTime: "Year Round",
          difficulty: "Moderate",
          groupSize: "2-15 People",
          customFields: [],
          longDetails: [],
        });
      }
    } catch (error) {
      console.error("Failed to save package:", error);
    }
  };

  const handleEdit = (pkg: Package) => {
    setFormData({
      ...pkg,
      customFields: pkg.customFields || [],
      longDetails: pkg.longDetails || [],
    });
    setEditingId(pkg._id || null);
    if (pkg.image) {
      setImagePreview(pkg.image);
    }
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this package?")) {
      try {
        await fetch(`/api/packages?id=${id}`, { method: "DELETE" });
        fetchPackages();
      } catch (error) {
        console.error("Failed to delete package:", error);
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
          Manage Packages
        </h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setImagePreview("");
            setFormData({
              title: "",
              description: "",
              fullDescription: "",
              price: 0,
              currency: "₹",
              duration: "",
              location: "",
              image: "",
              featured: false,
              active: true,
              highlights: [],
              itinerary: [],
              inclusions: [],
              exclusions: [],
              bestTime: "Year Round",
              difficulty: "Moderate",
              groupSize: "2-15 People",
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
          {showForm ? "Cancel" : "Add Package"}
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
            maxHeight: "90vh",
            overflowY: "auto",
          }}
        >
          <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
            {editingId ? "Edit Package" : "Add New Package"}
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Basic Info */}
            <h3
              style={{
                marginTop: "0.75rem",
                marginBottom: "0.75rem",
                fontSize: "0.95rem",
              }}
            >
              Basic Information
            </h3>
            <input
              type="text"
              name="title"
              placeholder="Package Title"
              value={formData.title}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "0.9rem",
                marginBottom: "0.75rem",
              }}
            />
            <textarea
              name="description"
              placeholder="Short Description"
              value={formData.description}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "0.5rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "0.9rem",
                marginBottom: "0.75rem",
                minHeight: "50px",
              }}
            />
            <textarea
              name="fullDescription"
              placeholder="Full Description"
              value={formData.fullDescription}
              onChange={handleInputChange}
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

            {/* Price and Duration */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleInputChange}
                required
                style={{
                  padding: "0.5rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                }}
              />
              <select
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                style={{
                  padding: "0.5rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                }}
              >
                <option value="₹">₹ INR</option>
                <option value="$">$ USD</option>
                <option value="€">€ EUR</option>
              </select>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "0.75rem",
                marginBottom: "0.75rem",
              }}
            >
              <input
                type="text"
                name="duration"
                placeholder="Duration (e.g., 12 days)"
                value={formData.duration}
                onChange={handleInputChange}
                required
                style={{
                  padding: "0.5rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
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
                  padding: "0.5rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                }}
              />
            </div>

            {/* Image Upload */}
            <div
              style={{
                marginBottom: "0.75rem",
                padding: "0.75rem",
                border: "2px dashed #ddd",
                borderRadius: "8px",
                textAlign: "center",
                cursor: "pointer",
                background: "#f9f9f9",
              }}
            >
              <label
                style={{
                  cursor: "pointer",
                  display: "block",
                }}
              >
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  style={{
                    display: "none",
                  }}
                />
                <div style={{ marginBottom: "0.5rem" }}>
                  <strong>
                    {uploadingImage ? "Uploading..." : "Click to upload image"}
                  </strong>
                </div>
              </label>
              {imagePreview && (
                <div
                  style={{
                    marginTop: "1rem",
                    position: "relative",
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: "200px",
                      maxHeight: "200px",
                      borderRadius: "8px",
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
                      padding: "0.5rem 1rem",
                      background: "#ff6b6b",
                      color: "white",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Remove Image
                  </button>
                </div>
              )}
            </div>

            {/* Additional Details */}
            <h3 style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
              Additional Details
            </h3>
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
                name="bestTime"
                placeholder="Best Time to Visit"
                value={formData.bestTime || ""}
                onChange={handleInputChange}
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
              <select
                name="difficulty"
                value={formData.difficulty || "Moderate"}
                onChange={handleInputChange}
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              >
                <option value="Easy">Easy</option>
                <option value="Moderate">Moderate</option>
                <option value="Difficult">Difficult</option>
              </select>
            </div>

            <input
              type="text"
              name="groupSize"
              placeholder="Group Size"
              value={formData.groupSize || ""}
              onChange={handleInputChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "1rem",
                marginBottom: "1rem",
              }}
            />

            {/* Custom Fields */}
            <h3 style={{ marginTop: "1.25rem", marginBottom: "0.75rem" }}>
              Custom Fields (add or remove any extra info)
            </h3>
            {(formData.customFields || []).map((field, index) => (
              <div
                key={index}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr auto",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <input
                  type="text"
                  placeholder="Label (e.g., Seats Left)"
                  value={field.label}
                  onChange={(e) =>
                    updateCustomField(index, "label", e.target.value)
                  }
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />
                <input
                  type="text"
                  placeholder="Value (e.g., 12)"
                  value={field.value}
                  onChange={(e) =>
                    updateCustomField(index, "value", e.target.value)
                  }
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeCustomField(index)}
                  style={{
                    padding: "0.75rem 1rem",
                    background: "#ff6b6b",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={addCustomField}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "#0066cc",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "1rem",
              }}
            >
              + Add Custom Field
            </button>

            {/* Highlights */}
            <h3 style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
              Highlights
            </h3>
            {(formData.highlights || []).map((highlight, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <input
                  type="text"
                  placeholder={`Highlight ${index + 1}`}
                  value={highlight}
                  onChange={(e) =>
                    updateArrayItem("highlights", index, e.target.value)
                  }
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem("highlights", index)}
                  style={{
                    padding: "0.75rem 1rem",
                    background: "#ff6b6b",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem("highlights")}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "#0066cc",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "1rem",
              }}
            >
              + Add Highlight
            </button>

            {/* Inclusions */}
            <h3 style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
              Inclusions
            </h3>
            {(formData.inclusions || []).map((inclusion, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <input
                  type="text"
                  placeholder={`Inclusion ${index + 1}`}
                  value={inclusion}
                  onChange={(e) =>
                    updateArrayItem("inclusions", index, e.target.value)
                  }
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem("inclusions", index)}
                  style={{
                    padding: "0.75rem 1rem",
                    background: "#ff6b6b",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem("inclusions")}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "#0066cc",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "1rem",
              }}
            >
              + Add Inclusion
            </button>

            {/* Exclusions */}
            <h3 style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
              Exclusions
            </h3>
            {(formData.exclusions || []).map((exclusion, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  marginBottom: "0.5rem",
                }}
              >
                <input
                  type="text"
                  placeholder={`Exclusion ${index + 1}`}
                  value={exclusion}
                  onChange={(e) =>
                    updateArrayItem("exclusions", index, e.target.value)
                  }
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem("exclusions", index)}
                  style={{
                    padding: "0.75rem 1rem",
                    background: "#ff6b6b",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem("exclusions")}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "#0066cc",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "1rem",
              }}
            >
              + Add Exclusion
            </button>

            {/* Itinerary */}
            <h3 style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
              Itinerary
            </h3>
            {(formData.itinerary || []).map((item, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  padding: "1rem",
                  marginBottom: "1rem",
                  background: "#f9f9f9",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <input
                    type="number"
                    placeholder={`Day ${index + 1}`}
                    value={item.day}
                    onChange={(e) => {
                      const newItem = {
                        ...item,
                        day: parseInt(e.target.value),
                      };
                      updateArrayItem("itinerary", index, newItem);
                    }}
                    style={{
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "1rem",
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Day Title"
                    value={item.title}
                    onChange={(e) => {
                      const newItem = { ...item, title: e.target.value };
                      updateArrayItem("itinerary", index, newItem);
                    }}
                    style={{
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      fontSize: "1rem",
                    }}
                  />
                </div>
                <textarea
                  placeholder="Day Description"
                  value={item.description}
                  onChange={(e) => {
                    const newItem = { ...item, description: e.target.value };
                    updateArrayItem("itinerary", index, newItem);
                  }}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    minHeight: "60px",
                    marginBottom: "1rem",
                  }}
                />
                <button
                  type="button"
                  onClick={() => removeArrayItem("itinerary", index)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    background: "#ff6b6b",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Remove Day
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addArrayItem("itinerary")}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "#0066cc",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "1rem",
              }}
            >
              + Add Itinerary Day
            </button>

            {/* Long Detail Sections */}
            <h3 style={{ marginTop: "1.5rem", marginBottom: "0.75rem" }}>
              Long Detail Sections
            </h3>
            {(formData.longDetails || []).map((detail, index) => (
              <div
                key={index}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "10px",
                  padding: "0.75rem",
                  marginBottom: "0.75rem",
                  background: "#f9f9f9",
                }}
              >
                <input
                  type="text"
                  placeholder="Section Title (e.g., Important Notes)"
                  value={detail.title}
                  onChange={(e) =>
                    updateLongDetail(index, "title", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    marginBottom: "0.5rem",
                  }}
                />
                <textarea
                  placeholder="Section Content"
                  value={detail.content}
                  onChange={(e) =>
                    updateLongDetail(index, "content", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #ddd",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    minHeight: "90px",
                    marginBottom: "0.5rem",
                  }}
                />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <button
                    type="button"
                    onClick={() => removeLongDetail(index)}
                    style={{
                      padding: "0.6rem 1rem",
                      background: "#ff6b6b",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Remove Section
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addLongDetail}
              style={{
                width: "100%",
                padding: "0.75rem",
                background: "#0066cc",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                marginBottom: "1rem",
              }}
            >
              + Add Long Detail Section
            </button>

            {/* Status Checkboxes */}
            <h3 style={{ marginTop: "1.5rem", marginBottom: "1rem" }}>
              Status
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                />
                Featured
              </label>
              <label
                style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input
                  type="checkbox"
                  name="active"
                  checked={formData.active}
                  onChange={handleInputChange}
                />
                Active
              </label>
            </div>

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "0.75rem 2rem",
                background: "#00b894",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "1rem",
              }}
            >
              {editingId ? "Update Package" : "Create Package"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading packages...</p>
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
                <th style={{ padding: "1rem", textAlign: "left" }}>Title</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Price</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Duration</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Location</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>
                  Custom Fields
                </th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Featured</th>
                <th style={{ padding: "1rem", textAlign: "left" }}>Active</th>
                <th style={{ padding: "1rem", textAlign: "center" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {packages.map((pkg) => (
                <tr key={pkg._id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "1rem" }}>{pkg.title}</td>
                  <td style={{ padding: "1rem" }}>
                    {pkg.currency}
                    {pkg.price}
                  </td>
                  <td style={{ padding: "1rem" }}>{pkg.duration}</td>
                  <td style={{ padding: "1rem" }}>{pkg.location}</td>
                  <td style={{ padding: "1rem", maxWidth: "200px" }}>
                    {(pkg.customFields || []).length === 0 ? (
                      <span style={{ color: "#999" }}>None</span>
                    ) : (
                      <div
                        style={{
                          display: "flex",
                          flexWrap: "wrap",
                          gap: "0.25rem",
                        }}
                      >
                        {(pkg.customFields || []).map((cf, idx) => (
                          <span
                            key={idx}
                            style={{
                              padding: "0.15rem 0.5rem",
                              borderRadius: "999px",
                              background: "#eef2ff",
                              color: "#312e81",
                              fontSize: "0.8rem",
                              border: "1px solid #c7d2fe",
                            }}
                          >
                            {cf.label || "(no label)"}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "20px",
                        background: pkg.featured ? "#d4edda" : "#f8d7da",
                        color: pkg.featured ? "#155724" : "#721c24",
                        fontSize: "0.9rem",
                      }}
                    >
                      {pkg.featured ? "Yes" : "No"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        borderRadius: "20px",
                        background: pkg.active ? "#d4edda" : "#f8d7da",
                        color: pkg.active ? "#155724" : "#721c24",
                        fontSize: "0.9rem",
                      }}
                    >
                      {pkg.active ? "Yes" : "No"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <button
                      onClick={() => handleEdit(pkg)}
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
                      onClick={() => handleDelete(pkg._id || "")}
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
