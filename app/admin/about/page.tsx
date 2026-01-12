"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface AboutItem {
  _id?: string;
  section: string;
  title?: string;
  subtitle?: string;
  content?: string;
  icon?: string;
  image?: string;
  order: number;
  active: boolean;
  paragraphs?: { text: string }[];
  name?: string;
  role?: string;
  number?: string;
  label?: string;
  description?: string;
}

export default function AboutManagement() {
  const router = useRouter();
  const [aboutItems, setAboutItems] = useState<AboutItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<AboutItem | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedSection, setSelectedSection] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const sections = [
    { value: "all", label: "All Sections" },
    { value: "hero", label: "Hero Section" },
    { value: "story", label: "Our Story" },
    { value: "mission", label: "Mission" },
    { value: "vision", label: "Vision" },
    { value: "values", label: "Core Values" },
    { value: "statistics", label: "Statistics" },
    { value: "team", label: "Team Members" },
  ];

  useEffect(() => {
    fetchAboutItems();
  }, []);

  const fetchAboutItems = async () => {
    try {
      const response = await fetch("/api/about?admin=true");
      if (response.ok) {
        const data = await response.json();
        setAboutItems(data);
      }
    } catch (error) {
      console.error("Failed to fetch about items:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingItem) return;

    try {
      const method = editingItem._id ? "PUT" : "POST";
      const response = await fetch("/api/about", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editingItem),
      });

      if (response.ok) {
        await fetchAboutItems();
        setShowModal(false);
        setEditingItem(null);
      }
    } catch (error) {
      console.error("Failed to save about item:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;

    try {
      const response = await fetch(`/api/about?id=${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        await fetchAboutItems();
      }
    } catch (error) {
      console.error("Failed to delete about item:", error);
    }
  };

  const openModal = (item?: AboutItem) => {
    if (item) {
      setEditingItem(item);
    } else {
      setEditingItem({
        section: "hero",
        title: "",
        subtitle: "",
        content: "",
        icon: "",
        image: "",
        order: 0,
        active: true,
      });
    }
    setUploadProgress(0);
    setShowModal(true);
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file || !editingItem) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      setUploadProgress(0);

      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const progress = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(progress);
        }
      });

      xhr.addEventListener("load", () => {
        if (xhr.status === 200) {
          const response = JSON.parse(xhr.responseText);
          setEditingItem({ ...editingItem, image: response.url });
          setUploading(false);
          setUploadProgress(100);
        } else {
          alert("Upload failed");
          setUploading(false);
        }
      });

      xhr.addEventListener("error", () => {
        alert("Upload failed");
        setUploading(false);
      });

      xhr.open("POST", "/api/upload");
      xhr.send(formData);
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed");
      setUploading(false);
    }
  };

  const filteredItems =
    selectedSection === "all"
      ? aboutItems
      : aboutItems.filter((item) => item.section === selectedSection);

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>Loading...</div>
    );
  }

  return (
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ marginBottom: "0.5rem" }}>About Us Management</h1>
          <p style={{ color: "#666" }}>
            Manage all sections of the About Us page
          </p>
        </div>
        <button
          onClick={() => openModal()}
          style={{
            padding: "0.75rem 1.5rem",
            background: "#0066cc",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          + Add New Item
        </button>
      </div>

      {/* Filter */}
      <div style={{ marginBottom: "2rem" }}>
        <select
          value={selectedSection}
          onChange={(e) => setSelectedSection(e.target.value)}
          style={{
            padding: "0.75rem 1rem",
            borderRadius: "8px",
            border: "1px solid #ddd",
            fontSize: "1rem",
          }}
        >
          {sections.map((section) => (
            <option key={section.value} value={section.value}>
              {section.label}
            </option>
          ))}
        </select>
      </div>

      {/* Items Table */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        }}
      >
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8f9fa" }}>
            <tr>
              <th style={{ padding: "1rem", textAlign: "left" }}>Section</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Title/Name</th>
              <th style={{ padding: "1rem", textAlign: "left" }}>Content</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Order</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Status</th>
              <th style={{ padding: "1rem", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.map((item) => (
              <tr key={item._id} style={{ borderTop: "1px solid #eee" }}>
                <td style={{ padding: "1rem" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      background: "#e3f2fd",
                      color: "#1976d2",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    {item.section}
                  </span>
                </td>
                <td style={{ padding: "1rem" }}>
                  {item.title || item.name || "-"}
                </td>
                <td
                  style={{
                    padding: "1rem",
                    maxWidth: "300px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {item.content ||
                    item.description ||
                    item.subtitle ||
                    item.role ||
                    item.label ||
                    "-"}
                </td>
                <td style={{ padding: "1rem", textAlign: "center" }}>
                  {item.order}
                </td>
                <td style={{ padding: "1rem", textAlign: "center" }}>
                  <span
                    style={{
                      padding: "0.25rem 0.75rem",
                      background: item.active ? "#e8f5e9" : "#ffebee",
                      color: item.active ? "#2e7d32" : "#c62828",
                      borderRadius: "4px",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                    }}
                  >
                    {item.active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td style={{ padding: "1rem", textAlign: "center" }}>
                  <button
                    onClick={() => openModal(item)}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#f0f0f0",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      marginRight: "0.5rem",
                    }}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item._id!)}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#ffebee",
                      color: "#c62828",
                      border: "none",
                      borderRadius: "6px",
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

      {/* Modal */}
      {showModal && editingItem && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              maxWidth: "600px",
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ marginBottom: "1.5rem" }}>
              {editingItem._id ? "Edit" : "Add"} About Item
            </h2>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Section *
                </label>
                <select
                  value={editingItem.section}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, section: e.target.value })
                  }
                  required
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                >
                  <option value="hero">Hero Section</option>
                  <option value="story">Our Story</option>
                  <option value="mission">Mission</option>
                  <option value="vision">Vision</option>
                  <option value="values">Core Values</option>
                  <option value="statistics">Statistics</option>
                  <option value="team">Team Members</option>
                </select>
              </div>

              {/* Common Fields */}
              {["hero", "story", "mission", "vision", "values"].includes(
                editingItem.section
              ) && (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>
                      Title
                    </label>
                    <input
                      type="text"
                      value={editingItem.title || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          title: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>
                      Subtitle
                    </label>
                    <input
                      type="text"
                      value={editingItem.subtitle || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          subtitle: e.target.value,
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>
                      Content
                    </label>
                    <textarea
                      value={editingItem.content || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          content: e.target.value,
                        })
                      }
                      rows={4}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                </>
              )}

              {/* Team Fields */}
              {editingItem.section === "team" && (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>
                      Name *
                    </label>
                    <input
                      type="text"
                      value={editingItem.name || ""}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, name: e.target.value })
                      }
                      required
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>
                      Role *
                    </label>
                    <input
                      type="text"
                      value={editingItem.role || ""}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, role: e.target.value })
                      }
                      required
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                </>
              )}

              {/* Statistics Fields */}
              {editingItem.section === "statistics" && (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>
                      Number *
                    </label>
                    <input
                      type="text"
                      value={editingItem.number || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          number: e.target.value,
                        })
                      }
                      required
                      placeholder="e.g., 50,000+"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>
                      Label *
                    </label>
                    <input
                      type="text"
                      value={editingItem.label || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          label: e.target.value,
                        })
                      }
                      required
                      placeholder="e.g., Happy Travelers"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                </>
              )}

              {/* Values Fields */}
              {editingItem.section === "values" && (
                <>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>
                      Icon (emoji)
                    </label>
                    <input
                      type="text"
                      value={editingItem.icon || ""}
                      onChange={(e) =>
                        setEditingItem({ ...editingItem, icon: e.target.value })
                      }
                      placeholder="e.g., ✨"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    <label style={{ display: "block", marginBottom: "0.5rem" }}>
                      Description
                    </label>
                    <textarea
                      value={editingItem.description || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          description: e.target.value,
                        })
                      }
                      rows={3}
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                </>
              )}

              {/* Image Field */}
              {["story", "team"].includes(editingItem.section) && (
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                    }}
                  >
                    Image
                  </label>

                  {/* Image Preview */}
                  {editingItem.image && (
                    <div style={{ marginBottom: "1rem" }}>
                      <img
                        src={editingItem.image}
                        alt="Preview"
                        style={{
                          width: "100%",
                          maxHeight: "200px",
                          objectFit: "cover",
                          borderRadius: "8px",
                          border: "1px solid #ddd",
                        }}
                      />
                    </div>
                  )}

                  {/* Upload Button */}
                  <div style={{ marginBottom: "1rem" }}>
                    <label
                      htmlFor="image-upload"
                      style={{
                        display: "inline-block",
                        padding: "0.75rem 1.5rem",
                        background: uploading ? "#ccc" : "#0066cc",
                        color: "white",
                        borderRadius: "8px",
                        cursor: uploading ? "not-allowed" : "pointer",
                        fontWeight: 600,
                        textAlign: "center",
                      }}
                    >
                      {uploading
                        ? `Uploading... ${uploadProgress}%`
                        : "Upload Image"}
                    </label>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      disabled={uploading}
                      style={{ display: "none" }}
                    />
                  </div>

                  {/* Progress Bar */}
                  {uploading && (
                    <div
                      style={{
                        width: "100%",
                        height: "4px",
                        background: "#e0e0e0",
                        borderRadius: "2px",
                        overflow: "hidden",
                        marginBottom: "1rem",
                      }}
                    >
                      <div
                        style={{
                          width: `${uploadProgress}%`,
                          height: "100%",
                          background: "#0066cc",
                          transition: "width 0.3s ease",
                        }}
                      />
                    </div>
                  )}

                  {/* OR Divider */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      margin: "1rem 0",
                    }}
                  >
                    <div
                      style={{
                        flex: 1,
                        height: "1px",
                        background: "#ddd",
                      }}
                    />
                    <span style={{ color: "#666", fontSize: "0.875rem" }}>
                      OR
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: "1px",
                        background: "#ddd",
                      }}
                    />
                  </div>

                  {/* URL Input */}
                  <div>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      Image URL
                    </label>
                    <input
                      type="text"
                      value={editingItem.image || ""}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          image: e.target.value,
                        })
                      }
                      placeholder="https://example.com/image.jpg"
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        borderRadius: "8px",
                        border: "1px solid #ddd",
                      }}
                    />
                  </div>
                </div>
              )}

              <div style={{ marginBottom: "1rem" }}>
                <label style={{ display: "block", marginBottom: "0.5rem" }}>
                  Order
                </label>
                <input
                  type="number"
                  value={editingItem.order}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      order: parseInt(e.target.value) || 0,
                    })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "1px solid #ddd",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={editingItem.active}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        active: e.target.checked,
                      })
                    }
                  />
                  Active
                </label>
              </div>

              <div style={{ display: "flex", gap: "1rem" }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "#0066cc",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    flex: 1,
                    padding: "0.75rem",
                    background: "#f0f0f0",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
