"use client";

import React, { useEffect, useState } from "react";

interface Destination {
  _id?: string;
  name: string;
  image: string;
  order: number;
}

const emptyDestination: Destination = {
  name: "",
  image: "",
  order: 0,
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "2rem",
    paddingTop: "5rem",
    maxWidth: "1400px",
    margin: "0 auto",
    minHeight: "100vh",
    background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2rem",
    padding: "1.5rem 2rem",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    borderRadius: "16px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
    flexWrap: "wrap" as const,
    gap: "1rem",
  },
  headerTitle: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#fff",
    margin: 0,
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
  },
  addButton: {
    background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
    color: "#fff",
    padding: "0.875rem 1.75rem",
    borderRadius: "12px",
    border: "none",
    fontWeight: "600",
    fontSize: "0.95rem",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 15px rgba(0,212,255,0.3)",
  },
  tableCard: {
    background: "#fff",
    borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
    overflow: "hidden",
  },
  tableHeader: {
    background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
    padding: "1rem 1.5rem",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tableHeaderTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#334155",
    margin: 0,
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
  },
  th: {
    padding: "1rem 1.25rem",
    textAlign: "left" as const,
    fontSize: "0.75rem",
    fontWeight: "600",
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    color: "#64748b",
    background: "#f8fafc",
    borderBottom: "2px solid #e2e8f0",
  },
  td: {
    padding: "1rem 1.25rem",
    borderBottom: "1px solid #f1f5f9",
    verticalAlign: "middle" as const,
  },
  destinationImage: {
    width: "60px",
    height: "60px",
    objectFit: "cover" as const,
    borderRadius: "50%",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "0.3rem 0.6rem",
    borderRadius: "20px",
    fontSize: "0.7rem",
    fontWeight: "600",
  },
  badgeActive: {
    background: "rgba(16, 185, 129, 0.1)",
    color: "#059669",
  },
  badgeInactive: {
    background: "rgba(239, 68, 68, 0.1)",
    color: "#dc2626",
  },
  actionButton: {
    padding: "0.5rem 0.75rem",
    borderRadius: "8px",
    border: "none",
    fontWeight: "500",
    fontSize: "0.8rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "0.35rem",
    transition: "all 0.2s ease",
    marginRight: "0.5rem",
  },
  editButton: {
    background: "rgba(59, 130, 246, 0.1)",
    color: "#2563eb",
  },
  deleteButton: {
    background: "rgba(239, 68, 68, 0.1)",
    color: "#dc2626",
  },
  modal: {
    position: "fixed" as const,
    inset: 0,
    background: "rgba(0,0,0,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "1rem",
  },
  modalContent: {
    background: "#fff",
    borderRadius: "16px",
    maxWidth: "600px",
    width: "100%",
    maxHeight: "90vh",
    overflow: "auto",
    boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
  },
  modalHeader: {
    padding: "1.5rem",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    borderRadius: "16px 16px 0 0",
  },
  modalTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#fff",
    margin: 0,
  },
  closeButton: {
    background: "rgba(255,255,255,0.1)",
    border: "none",
    color: "#fff",
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "1.25rem",
  },
  modalBody: {
    padding: "1.5rem",
  },
  formGroup: {
    marginBottom: "1.25rem",
  },
  label: {
    display: "block",
    marginBottom: "0.5rem",
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#374151",
  },
  input: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
    outline: "none",
    boxSizing: "border-box" as const,
  },
  textarea: {
    width: "100%",
    padding: "0.75rem 1rem",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
    outline: "none",
    minHeight: "100px",
    resize: "vertical" as const,
    boxSizing: "border-box" as const,
  },
  checkbox: {
    width: "20px",
    height: "20px",
    marginRight: "0.5rem",
    cursor: "pointer",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    fontSize: "0.95rem",
    color: "#374151",
  },
  modalFooter: {
    padding: "1rem 1.5rem",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "flex-end",
    gap: "0.75rem",
    background: "#f9fafb",
    borderRadius: "0 0 16px 16px",
  },
  cancelButton: {
    padding: "0.75rem 1.5rem",
    borderRadius: "10px",
    border: "2px solid #e5e7eb",
    background: "#fff",
    color: "#374151",
    fontWeight: "600",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  saveButton: {
    padding: "0.75rem 1.5rem",
    borderRadius: "10px",
    border: "none",
    background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
    color: "#fff",
    fontWeight: "600",
    fontSize: "0.95rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    boxShadow: "0 4px 15px rgba(0,212,255,0.3)",
  },
  imagePreview: {
    width: "100px",
    height: "100px",
    objectFit: "cover" as const,
    borderRadius: "50%",
    marginTop: "0.75rem",
    boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
  },
  emptyState: {
    padding: "4rem 2rem",
    textAlign: "center" as const,
    color: "#64748b",
  },
  uploadButton: {
    display: "inline-flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.25rem",
    background: "#f3f4f6",
    border: "2px dashed #d1d5db",
    borderRadius: "10px",
    color: "#6b7280",
    fontSize: "0.9rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    marginTop: "0.5rem",
  },
  imageInputGroup: {
    display: "flex",
    gap: "0.5rem",
    alignItems: "flex-start",
    flexWrap: "wrap" as const,
  },
};

export default function DestinationsAdmin() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDestination, setEditingDestination] =
    useState<Destination | null>(null);
  const [formData, setFormData] = useState<Destination>(emptyDestination);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchDestinations();
  }, []);

  const fetchDestinations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/destinations?all=true");
      if (res.ok) {
        const data = await res.json();
        setDestinations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch destinations:", error);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingDestination(null);
    setFormData({ ...emptyDestination, order: destinations.length });
    setShowModal(true);
  };

  const openEditModal = (destination: Destination) => {
    setEditingDestination(destination);
    setFormData({ ...destination });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingDestination(null);
    setFormData(emptyDestination);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "order") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData((prev) => ({ ...prev, image: data.url }));
      } else {
        alert("Failed to upload image");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      alert("Please enter a destination name");
      return;
    }

    setSaving(true);
    try {
      const method = editingDestination ? "PATCH" : "POST";
      const body = editingDestination
        ? { ...formData, id: editingDestination._id }
        : formData;

      const res = await fetch("/api/destinations", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        await fetchDestinations();
        closeModal();
      } else {
        const errorData = await res.json();
        alert(errorData.error || "Failed to save destination");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save destination");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (destination: Destination) => {
    if (!confirm(`Are you sure you want to delete "${destination.name}"?`)) {
      return;
    }

    try {
      const res = await fetch("/api/destinations", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: destination._id }),
      });

      if (res.ok) {
        await fetchDestinations();
      } else {
        alert("Failed to delete destination");
      }
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete destination");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>
          <span style={{ fontSize: "1.5rem" }}>🌍</span>
          Manage Destinations
        </h1>
        <button style={styles.addButton} onClick={openAddModal}>
          <span style={{ fontSize: "1.25rem" }}>+</span>
          Add Destination
        </button>
      </div>

      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <h3 style={styles.tableHeaderTitle}>
            All Destinations ({destinations.length})
          </h3>
        </div>

        {loading ? (
          <div style={styles.emptyState}>Loading destinations...</div>
        ) : destinations.length === 0 ? (
          <div style={styles.emptyState}>
            <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
              No destinations found
            </p>
            <p style={{ fontSize: "0.9rem" }}>
              Click &quot;Add Destination&quot; to create your first
              destination.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr>
                  <th style={styles.th}>Order</th>
                  <th style={styles.th}>Image</th>
                  <th style={styles.th}>Name</th>
                  <th style={styles.th}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {destinations
                  .sort((a, b) => (a.order || 0) - (b.order || 0))
                  .map((destination) => (
                    <tr key={destination._id}>
                      <td style={styles.td}>
                        <span
                          style={{
                            fontWeight: "600",
                            color: "#6b7280",
                            fontSize: "0.9rem",
                          }}
                        >
                          {destination.order ?? "-"}
                        </span>
                      </td>
                      <td style={styles.td}>
                        {destination.image ? (
                          <img
                            src={destination.image}
                            alt={destination.name}
                            style={styles.destinationImage}
                          />
                        ) : (
                          <div
                            style={{
                              ...styles.destinationImage,
                              background: "#f3f4f6",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "#9ca3af",
                              fontSize: "1.5rem",
                            }}
                          >
                            🏞️
                          </div>
                        )}
                      </td>
                      <td style={styles.td}>
                        <span style={{ fontWeight: "600", color: "#1f2937" }}>
                          {destination.name}
                        </span>
                      </td>
                      <td style={styles.td}>
                        <button
                          style={{
                            ...styles.actionButton,
                            ...styles.editButton,
                          }}
                          onClick={() => openEditModal(destination)}
                        >
                          ✏️ Edit
                        </button>
                        <button
                          style={{
                            ...styles.actionButton,
                            ...styles.deleteButton,
                          }}
                          onClick={() => handleDelete(destination)}
                        >
                          🗑️ Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={styles.modal} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingDestination
                  ? "Edit Destination"
                  : "Add New Destination"}
              </h2>
              <button style={styles.closeButton} onClick={closeModal}>
                ×
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Destination Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Goa, Kerala, Rajasthan"
                  style={styles.input}
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Image</label>
                <div style={styles.imageInputGroup}>
                  <input
                    type="text"
                    name="image"
                    value={formData.image}
                    onChange={handleInputChange}
                    placeholder="Image URL"
                    style={{ ...styles.input, flex: 1 }}
                  />
                  <label style={styles.uploadButton}>
                    {uploading ? "Uploading..." : "📤 Upload"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: "none" }}
                      disabled={uploading}
                    />
                  </label>
                </div>
                {formData.image && (
                  <img
                    src={formData.image}
                    alt="Preview"
                    style={styles.imagePreview}
                  />
                )}
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Display Order</label>
                <input
                  type="number"
                  name="order"
                  value={formData.order}
                  onChange={handleInputChange}
                  placeholder="0"
                  style={{ ...styles.input, maxWidth: "120px" }}
                  min="0"
                />
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#6b7280",
                    marginTop: "0.25rem",
                  }}
                >
                  Lower numbers appear first
                </p>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button style={styles.cancelButton} onClick={closeModal}>
                Cancel
              </button>
              <button
                style={styles.saveButton}
                onClick={handleSave}
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editingDestination
                    ? "Update"
                    : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
