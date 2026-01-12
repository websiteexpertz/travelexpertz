"use client";

import React, { useState, useEffect } from "react";

interface Service {
  _id?: string;
  title: string;
  description: string;
  href: string;
  image: string;
  order: number;
  active: boolean;
  customFields?: Array<{ label: string; value: string; type: string }>;
}

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [formData, setFormData] = useState<Service>({
    title: "",
    description: "",
    href: "",
    image: "",
    order: 0,
    active: true,
    customFields: [],
  });

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await fetch("/api/services?admin=true", {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        const sortedServices = Array.isArray(data)
          ? data.sort((a, b) => a.order - b.order)
          : [];
        setServices(sortedServices);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
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
    let processedValue: any = value;

    if (type === "checkbox") {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === "order") {
      processedValue = parseInt(value, 10) || 0;
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
    try {
      const url = "/api/services";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          order: parseInt(String(formData.order), 10) || 0,
        }),
      });

      if (response.ok) {
        fetchServices();
        setShowForm(false);
        setEditingId(null);
        setImagePreview("");
        setFormData({
          title: "",
          description: "",
          href: "",
          image: "",
          order: 0,
          active: true,
          customFields: [],
        });
      }
    } catch (error) {
      console.error("Failed to save service:", error);
    }
  };

  const handleEdit = (service: Service) => {
    setFormData({
      ...service,
      customFields: service.customFields || [],
    });
    setEditingId(service._id || null);
    if (service.image) {
      setImagePreview(service.image);
    }
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this service?")) {
      try {
        await fetch(`/api/services?id=${id}`, { method: "DELETE" });
        fetchServices();
      } catch (error) {
        console.error("Failed to delete service:", error);
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
          Manage Services
        </h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setImagePreview("");
            setFormData({
              title: "",
              description: "",
              href: "",
              image: "",
              order: 0,
              active: true,
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
          {showForm ? "Cancel" : "Add Service"}
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
          <h2 style={{ fontSize: "1rem", marginBottom: "0.75rem" }}>
            {editingId ? "Edit Service" : "Add New Service"}
          </h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="title"
              placeholder="Service Title"
              value={formData.title}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "1rem",
                marginBottom: "1rem",
              }}
            />
            <textarea
              name="description"
              placeholder="Description"
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
                minHeight: "60px",
              }}
            />
            <input
              type="text"
              name="href"
              placeholder="URL Path"
              value={formData.href}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "1rem",
                marginBottom: "1rem",
              }}
            />
            <div
              style={{
                marginBottom: "1rem",
                padding: "1rem",
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
                name="order"
                placeholder="Order"
                value={formData.order}
                onChange={handleInputChange}
                style={{
                  padding: "0.75rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "1rem",
                }}
              />
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
                Add custom fields like "Discount", "Special Offer", or any other
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
              {editingId ? "Update Service" : "Create Service"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading services...</p>
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
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Image</th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Title</th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>
                  Description
                </th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Order</th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Active</th>
                <th style={{ padding: "0.5rem", textAlign: "center" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr
                  key={service._id}
                  style={{ borderBottom: "1px solid #ddd" }}
                >
                  <td style={{ padding: "1rem" }}>
                    {service.image ? (
                      <img
                        src={service.image}
                        alt={service.title}
                        style={{
                          width: "60px",
                          height: "60px",
                          objectFit: "cover",
                          borderRadius: "4px",
                        }}
                      />
                    ) : (
                      <span style={{ color: "#999" }}>No image</span>
                    )}
                  </td>
                  <td style={{ padding: "1rem" }}>{service.title}</td>
                  <td
                    style={{
                      padding: "1rem",
                      maxWidth: "300px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {service.description}
                  </td>
                  <td style={{ padding: "1rem" }}>{service.order}</td>
                  <td style={{ padding: "0.5rem" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "20px",
                        background: service.active ? "#d4edda" : "#f8d7da",
                        color: service.active ? "#155724" : "#721c24",
                        fontSize: "0.9rem",
                      }}
                    >
                      {service.active ? "Yes" : "No"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", textAlign: "center" }}>
                    <button
                      onClick={() => handleEdit(service)}
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
                      onClick={() => handleDelete(service._id || "")}
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
