"use client";

import React, { useState, useEffect } from "react";

interface WhyUs {
  _id?: string;
  icon: string;
  title: string;
  description: string;
  order: number;
  active: boolean;
  customFields?: Array<{ label: string; value: string; type: string }>;
}

export default function AdminWhyUs() {
  const [whyus, setWhyUs] = useState<WhyUs[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<WhyUs>({
    icon: "",
    title: "",
    description: "",
    order: 0,
    active: true,
    customFields: [],
  });

  useEffect(() => {
    fetchWhyUs();
  }, []);

  const fetchWhyUs = async () => {
    try {
      const response = await fetch("/api/whyus?admin=true", {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        const sortedData = Array.isArray(data)
          ? data.sort((a, b) => a.order - b.order)
          : [];
        setWhyUs(sortedData);
      }
    } catch (error) {
      console.error("Failed to fetch Why Us:", error);
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
      const url = "/api/whyus";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchWhyUs();
        setShowForm(false);
        setEditingId(null);
        setFormData({
          icon: "",
          title: "",
          description: "",
          order: 0,
          active: true,
          customFields: [],
        });
      }
    } catch (error) {
      console.error("Failed to save Why Us:", error);
    }
  };

  const handleEdit = (item: WhyUs) => {
    setFormData({
      ...item,
      customFields: item.customFields || [],
    });
    setEditingId(item._id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this Why Us entry?")) {
      try {
        await fetch(`/api/whyus?id=${id}`, { method: "DELETE" });
        fetchWhyUs();
      } catch (error) {
        console.error("Failed to delete Why Us entry:", error);
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
          Manage Why Us
        </h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              icon: "",
              title: "",
              description: "",
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
          {showForm ? "Cancel" : "Add Why Us"}
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
          <h2>{editingId ? "Edit Why Us" : "Add New Why Us"}</h2>
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
                name="icon"
                placeholder="Icon (emoji or Material icon name)"
                value={formData.icon}
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
                name="title"
                placeholder="Title"
                value={formData.title}
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
                name="order"
                placeholder="Order"
                value={formData.order}
                onChange={handleInputChange}
                style={{
                  padding: "0.5rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                }}
              />
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem",
                  fontSize: "0.9rem",
                }}
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
                Add custom fields like "Stats Number", "Link", or any other
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
              {editingId ? "Update Why Us" : "Create Why Us"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading Why Us...</p>
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
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Icon</th>
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
              {whyus.map((item) => (
                <tr key={item._id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "0.5rem", fontSize: "1.2rem" }}>
                    {item.icon}
                  </td>
                  <td style={{ padding: "0.5rem", fontSize: "0.85rem" }}>
                    {item.title}
                  </td>
                  <td
                    style={{
                      padding: "0.5rem",
                      maxWidth: "200px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: "0.8rem",
                    }}
                  >
                    {item.description}
                  </td>
                  <td style={{ padding: "0.5rem", fontSize: "0.85rem" }}>
                    {item.order}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "20px",
                        background: item.active ? "#d4edda" : "#f8d7da",
                        color: item.active ? "#155724" : "#721c24",
                        fontSize: "0.75rem",
                      }}
                    >
                      {item.active ? "Yes" : "No"}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem", textAlign: "center" }}>
                    <button
                      onClick={() => handleEdit(item)}
                      style={{
                        padding: "0.35rem 0.75rem",
                        marginRight: "0.35rem",
                        background: "#0066cc",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.8rem",
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(item._id || "")}
                      style={{
                        padding: "0.35rem 0.75rem",
                        background: "#ff6b6b",
                        color: "white",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        fontSize: "0.8rem",
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
