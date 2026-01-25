"use client";

import React, { useEffect, useState } from "react";

interface FormField {
  _id?: string;
  fieldName: string;
  fieldType: "text" | "textarea" | "number" | "list" | "select" | "checkbox";
  section: string;
  entityType: string;
  placeholder?: string;
  helpText?: string;
  required: boolean;
  options: string[];
  active: boolean;
  order: number;
}

const emptyField: FormField = {
  fieldName: "",
  fieldType: "text",
  section: "overview",
  entityType: "package",
  placeholder: "",
  helpText: "",
  required: false,
  options: [],
  active: true,
  order: 0,
};

const ENTITY_TYPES = [
  { value: "package", label: "Packages" },
  { value: "hotel", label: "Hotels" },
  { value: "homestay", label: "Homestays" },
];

const SECTIONS = {
  package: [
    { value: "overview", label: "Overview" },
    { value: "itinerary", label: "Itinerary" },
    { value: "inclusions", label: "Inclusions/Exclusions" },
    { value: "essentials", label: "Things to Carry" },
    { value: "policies", label: "Policies & Notes" },
  ],
  hotel: [
    { value: "overview", label: "Overview" },
    { value: "amenities", label: "Amenities" },
    { value: "rooms", label: "Rooms" },
    { value: "policies", label: "Policies" },
  ],
  homestay: [
    { value: "overview", label: "Overview" },
    { value: "amenities", label: "Amenities" },
    { value: "policies", label: "Policies" },
  ],
};

const FIELD_TYPES = [
  { value: "text", label: "Text (Single Line)" },
  { value: "textarea", label: "Textarea (Multiple Lines)" },
  { value: "number", label: "Number" },
  { value: "list", label: "List (Bullet Points)" },
  { value: "select", label: "Select Dropdown" },
  { value: "checkbox", label: "Checkbox" },
];

export default function FormFieldsManagement() {
  const [fields, setFields] = useState<FormField[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormField>(emptyField);
  const [filterEntity, setFilterEntity] = useState<string>("all");
  const [filterSection, setFilterSection] = useState<string>("all");

  useEffect(() => {
    fetchFields();
  }, []);

  const fetchFields = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/form-fields?all=true", {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setFields(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch form fields:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const url = editingId
      ? `/api/admin/form-fields?id=${editingId}`
      : "/api/admin/form-fields";
    const method = editingId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        fetchFields();
        setFormData(emptyField);
        setEditingId(null);
        setShowForm(false);
        alert(
          editingId
            ? "Field updated successfully!"
            : "Field created successfully!"
        );
      } else {
        const error = await response.json();
        alert(`Failed: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Error saving field:", error);
      alert("Failed to save field");
    }
  };

  const handleEdit = (field: FormField) => {
    setFormData(field);
    setEditingId(field._id || null);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this field?")) return;

    try {
      const response = await fetch(`/api/admin/form-fields?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchFields();
        alert("Field deleted successfully!");
      } else {
        alert("Failed to delete field");
      }
    } catch (error) {
      console.error("Error deleting field:", error);
      alert("Failed to delete field");
    }
  };

  const handleCancel = () => {
    setFormData(emptyField);
    setEditingId(null);
    setShowForm(false);
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ""],
    });
  };

  const updateOption = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const removeOption = (index: number) => {
    setFormData({
      ...formData,
      options: formData.options.filter((_, i) => i !== index),
    });
  };

  const filteredFields = fields.filter((field) => {
    if (filterEntity !== "all" && field.entityType !== filterEntity) return false;
    if (filterSection !== "all" && field.section !== filterSection) return false;
    return true;
  });

  const getSectionLabel = (entityType: string, section: string) => {
    const sections = SECTIONS[entityType as keyof typeof SECTIONS];
    return sections?.find((s) => s.value === section)?.label || section;
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          padding: "1.5rem 2rem",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          borderRadius: "16px",
        }}
      >
        <div>
          <h1
            style={{
              fontSize: "1.75rem",
              fontWeight: "700",
              color: "#fff",
              margin: 0,
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
            }}
          >
            <span className="material-symbols-outlined">settings</span>
            Form Control Center
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", margin: "0.5rem 0 0" }}>
            Manage reusable form fields across all sections
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          style={{
            background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
            color: "#fff",
            padding: "0.875rem 1.75rem",
            borderRadius: "12px",
            border: "none",
            fontWeight: "600",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span className="material-symbols-outlined">add</span>
          Add New Field
        </button>
      </div>

      {/* Filters */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "1.5rem",
          padding: "1rem",
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
      >
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b", marginBottom: "0.5rem", display: "block" }}>
            Entity Type
          </label>
          <select
            value={filterEntity}
            onChange={(e) => setFilterEntity(e.target.value)}
            style={{
              width: "100%",
              padding: "0.625rem",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "0.95rem",
            }}
          >
            <option value="all">All Types</option>
            {ENTITY_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        <div style={{ flex: 1 }}>
          <label style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b", marginBottom: "0.5rem", display: "block" }}>
            Section
          </label>
          <select
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value)}
            style={{
              width: "100%",
              padding: "0.625rem",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              fontSize: "0.95rem",
            }}
          >
            <option value="all">All Sections</option>
            {filterEntity !== "all" &&
              SECTIONS[filterEntity as keyof typeof SECTIONS]?.map((section) => (
                <option key={section.value} value={section.value}>
                  {section.label}
                </option>
              ))}
          </select>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "16px",
              padding: "2rem",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
          >
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1.5rem", color: "#1a1a2e" }}>
              {editingId ? "Edit Field" : "Add New Field"}
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ display: "grid", gap: "1.25rem" }}>
                {/* Field Name */}
                <div>
                  <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", display: "block" }}>
                    Field Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fieldName}
                    onChange={(e) => setFormData({ ...formData, fieldName: e.target.value })}
                    required
                    placeholder="e.g., Nearby Attractions"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>

                {/* Entity Type */}
                <div>
                  <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", display: "block" }}>
                    Entity Type *
                  </label>
                  <select
                    value={formData.entityType}
                    onChange={(e) => setFormData({ ...formData, entityType: e.target.value, section: "overview" })}
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "0.95rem",
                    }}
                  >
                    {ENTITY_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Section */}
                <div>
                  <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", display: "block" }}>
                    Section *
                  </label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "0.95rem",
                    }}
                  >
                    {SECTIONS[formData.entityType as keyof typeof SECTIONS]?.map((section) => (
                      <option key={section.value} value={section.value}>
                        {section.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Field Type */}
                <div>
                  <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", display: "block" }}>
                    Field Type *
                  </label>
                  <select
                    value={formData.fieldType}
                    onChange={(e) => setFormData({ ...formData, fieldType: e.target.value as any })}
                    required
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "0.95rem",
                    }}
                  >
                    {FIELD_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Placeholder */}
                <div>
                  <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", display: "block" }}>
                    Placeholder
                  </label>
                  <input
                    type="text"
                    value={formData.placeholder}
                    onChange={(e) => setFormData({ ...formData, placeholder: e.target.value })}
                    placeholder="e.g., Enter nearby places..."
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>

                {/* Help Text */}
                <div>
                  <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", display: "block" }}>
                    Help Text
                  </label>
                  <input
                    type="text"
                    value={formData.helpText}
                    onChange={(e) => setFormData({ ...formData, helpText: e.target.value })}
                    placeholder="Additional guidance for users"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>

                {/* Options for select field */}
                {formData.fieldType === "select" && (
                  <div>
                    <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", display: "block" }}>
                      Options
                    </label>
                    {formData.options.map((option, idx) => (
                      <div key={idx} style={{ display: "flex", gap: "0.5rem", marginBottom: "0.5rem" }}>
                        <input
                          type="text"
                          value={option}
                          onChange={(e) => updateOption(idx, e.target.value)}
                          placeholder={`Option ${idx + 1}`}
                          style={{
                            flex: 1,
                            padding: "0.625rem",
                            borderRadius: "8px",
                            border: "1px solid #e2e8f0",
                          }}
                        />
                        <button
                          type="button"
                          onClick={() => removeOption(idx)}
                          style={{
                            padding: "0.625rem",
                            backgroundColor: "#fee2e2",
                            color: "#dc2626",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={addOption}
                      style={{
                        padding: "0.625rem 1rem",
                        backgroundColor: "#f1f5f9",
                        color: "#475569",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontSize: "0.875rem",
                      }}
                    >
                      + Add Option
                    </button>
                  </div>
                )}

                {/* Checkboxes */}
                <div style={{ display: "flex", gap: "1.5rem" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.required}
                      onChange={(e) => setFormData({ ...formData, required: e.target.checked })}
                      style={{ width: "16px", height: "16px" }}
                    />
                    <span style={{ fontSize: "0.9rem", color: "#374151" }}>Required</span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      style={{ width: "16px", height: "16px" }}
                    />
                    <span style={{ fontSize: "0.9rem", color: "#374151" }}>Active</span>
                  </label>
                </div>

                {/* Order */}
                <div>
                  <label style={{ fontSize: "0.9rem", fontWeight: 600, color: "#374151", marginBottom: "0.5rem", display: "block" }}>
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    min="0"
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "0.95rem",
                    }}
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div style={{ display: "flex", gap: "1rem", marginTop: "2rem" }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "0.875rem",
                    backgroundColor: "#0066cc",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {editingId ? "Update Field" : "Create Field"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    flex: 1,
                    padding: "0.875rem",
                    backgroundColor: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Fields Table */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
            Loading fields...
          </div>
        ) : filteredFields.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center", color: "#64748b" }}>
            No form fields found. Create one to get started!
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ backgroundColor: "#f8fafc", borderBottom: "2px solid #e2e8f0" }}>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, color: "#475569" }}>
                  Field Name
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, color: "#475569" }}>
                  Type
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, color: "#475569" }}>
                  Entity
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, color: "#475569" }}>
                  Section
                </th>
                <th style={{ padding: "1rem", textAlign: "left", fontWeight: 600, color: "#475569" }}>
                  Status
                </th>
                <th style={{ padding: "1rem", textAlign: "center", fontWeight: 600, color: "#475569" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredFields.map((field) => (
                <tr key={field._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "1rem" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "#1e293b" }}>{field.fieldName}</div>
                      {field.helpText && (
                        <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "0.25rem" }}>
                          {field.helpText}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: "1rem", color: "#475569" }}>
                    {FIELD_TYPES.find((t) => t.value === field.fieldType)?.label}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        backgroundColor: "#dbeafe",
                        color: "#1e40af",
                        borderRadius: "1rem",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                      }}
                    >
                      {ENTITY_TYPES.find((t) => t.value === field.entityType)?.label}
                    </span>
                  </td>
                  <td style={{ padding: "1rem", color: "#475569" }}>
                    {getSectionLabel(field.entityType, field.section)}
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <span
                      style={{
                        padding: "0.25rem 0.75rem",
                        backgroundColor: field.active ? "#d1fae5" : "#fee2e2",
                        color: field.active ? "#065f46" : "#991b1b",
                        borderRadius: "1rem",
                        fontSize: "0.85rem",
                        fontWeight: 500,
                      }}
                    >
                      {field.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem" }}>
                    <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center" }}>
                      <button
                        onClick={() => handleEdit(field)}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#f0f9ff",
                          color: "#0369a1",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => field._id && handleDelete(field._id)}
                        style={{
                          padding: "0.5rem 1rem",
                          backgroundColor: "#fef2f2",
                          color: "#dc2626",
                          border: "none",
                          borderRadius: "6px",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          fontWeight: 500,
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
