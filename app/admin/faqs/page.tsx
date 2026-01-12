"use client";

import React, { useState, useEffect } from "react";

interface FAQ {
  _id?: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  active: boolean;
  customFields?: Array<{ label: string; value: string; type: string }>;
}

export default function AdminFAQs() {
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<FAQ>({
    question: "",
    answer: "",
    category: "Booking",
    order: 0,
    active: true,
    customFields: [],
  });

  useEffect(() => {
    fetchFAQs();
  }, []);

  const fetchFAQs = async () => {
    try {
      const response = await fetch("/api/faqs", { cache: "no-store" });
      if (response.ok) {
        const data = await response.json();
        setFAQs(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch FAQs:", error);
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
      const url = "/api/faqs";
      const method = editingId ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchFAQs();
        setShowForm(false);
        setEditingId(null);
        setFormData({
          question: "",
          answer: "",
          category: "Booking",
          order: 0,
          active: true,
          customFields: [],
        });
      }
    } catch (error) {
      console.error("Failed to save FAQ:", error);
    }
  };

  const handleEdit = (faq: FAQ) => {
    setFormData({
      ...faq,
      customFields: faq.customFields || [],
    });
    setEditingId(faq._id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this FAQ?")) {
      try {
        await fetch(`/api/faqs?id=${id}`, { method: "DELETE" });
        fetchFAQs();
      } catch (error) {
        console.error("Failed to delete FAQ:", error);
      }
    }
  };

  const categories = ["Booking", "Payment", "Refunds", "Support", "Insurance"];

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
          Manage FAQs
        </h1>
        <button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            setFormData({
              question: "",
              answer: "",
              category: "Booking",
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
          {showForm ? "Cancel" : "Add FAQ"}
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
          <h2>{editingId ? "Edit FAQ" : "Add New FAQ"}</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="question"
              placeholder="Question"
              value={formData.question}
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
              name="answer"
              placeholder="Answer"
              value={formData.answer}
              onChange={handleInputChange}
              required
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #ddd",
                borderRadius: "8px",
                fontSize: "1rem",
                marginBottom: "1rem",
                minHeight: "120px",
              }}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
                marginBottom: "1rem",
              }}
            >
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                style={{
                  padding: "0.5rem",
                  border: "1px solid #ddd",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                }}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
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
            </div>
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
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
              />
              Active
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
                Add custom fields like "Related Link", "Video URL", or any other
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
              {editingId ? "Update FAQ" : "Create FAQ"}
            </button>
          </form>
        </div>
      )}

      {loading ? (
        <p>Loading FAQs...</p>
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
                <th style={{ padding: "0.5rem", textAlign: "left" }}>
                  Question
                </th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>
                  Category
                </th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Order</th>
                <th style={{ padding: "0.5rem", textAlign: "left" }}>Active</th>
                <th style={{ padding: "0.5rem", textAlign: "center" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {faqs.map((faq) => (
                <tr key={faq._id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td
                    style={{
                      padding: "0.5rem",
                      maxWidth: "300px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      fontSize: "0.85rem",
                    }}
                  >
                    {faq.question}
                  </td>
                  <td style={{ padding: "0.5rem", fontSize: "0.85rem" }}>
                    {faq.category}
                  </td>
                  <td style={{ padding: "0.5rem", fontSize: "0.85rem" }}>
                    {faq.order}
                  </td>
                  <td style={{ padding: "0.5rem" }}>
                    <span
                      style={{
                        padding: "0.2rem 0.5rem",
                        borderRadius: "20px",
                        background: faq.active ? "#d4edda" : "#f8d7da",
                        color: faq.active ? "#155724" : "#721c24",
                        fontSize: "0.75rem",
                      }}
                    >
                      {faq.active ? "Yes" : "No"}
                    </span>
                  </td>
                  <td style={{ padding: "0.5rem", textAlign: "center" }}>
                    <button
                      onClick={() => handleEdit(faq)}
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
                      onClick={() => handleDelete(faq._id || "")}
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
