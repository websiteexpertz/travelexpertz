"use client";

import React, { useState, useEffect } from "react";

interface User {
  _id: string;
  email: string;
  name?: string;
  role?: string;
  createdAt?: string;
  lastLogin?: string;
  status?: string;
}

export default function UsersManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "user",
    status: "active",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch users
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/admin/users", {
        credentials: "include",
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : data.users || []);
      } else {
        const errorData = await response.json();
        console.error("Fetch error:", response.status, errorData);
        setError(errorData.error || "Failed to fetch users");
      }
    } catch (err) {
      console.error("Error loading users:", err);
      setError("Error loading users");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (mode: "create" | "edit", user?: User) => {
    setModalMode(mode);
    if (mode === "edit" && user) {
      setSelectedUser(user);
      setFormData({
        email: user.email,
        name: user.name || "",
        role: user.role || "user",
        status: user.status || "active",
      });
    } else {
      setFormData({ email: "", name: "", role: "user", status: "active" });
      setSelectedUser(null);
    }
    setError("");
    setSuccess("");
    setShowModal(true);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitLoading(true);

    try {
      if (!formData.email) {
        setError("Email is required");
        setSubmitLoading(false);
        return;
      }

      const url =
        modalMode === "create"
          ? "/api/admin/users"
          : `/api/admin/users/${selectedUser?._id}`;
      const method = modalMode === "create" ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(
          modalMode === "create"
            ? "User created successfully!"
            : "User updated successfully!",
        );
        setShowModal(false);
        fetchUsers();
      } else {
        setError(data.error || "Operation failed");
      }
    } catch (err) {
      setError("Error during operation");
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setSuccess("User deleted successfully!");
        fetchUsers();
      } else {
        setError("Failed to delete user");
      }
    } catch (err) {
      setError("Error deleting user");
    } finally {
      setDeleting(false);
    }
  };

  // Filter and search
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === "all" || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div style={{ padding: "2rem", maxWidth: "1400px", margin: "0 auto" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          gap: "1rem",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: "2rem",
              fontWeight: 700,
              color: "#1f2937",
            }}
          >
            User Management
          </h1>
          <p style={{ margin: "0.5rem 0 0", color: "#6b7280" }}>
            Manage website users and their roles
          </p>
        </div>
        <button
          onClick={() => handleOpenModal("create")}
          style={{
            padding: "0.625rem 1.5rem",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
            border: "none",
            borderRadius: "8px",
            fontWeight: 600,
            fontSize: "0.9rem",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            whiteSpace: "nowrap",
          }}
        >
          <span>➕</span> Add New User
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div
          style={{
            padding: "1rem",
            background: "#fee2e2",
            color: "#991b1b",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {success && (
        <div
          style={{
            padding: "1rem",
            background: "#dcfce7",
            color: "#15803d",
            borderRadius: "8px",
            marginBottom: "1.5rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>{success}</span>
          <button
            onClick={() => setSuccess("")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              fontSize: "1.2rem",
            }}
          >
            ✕
          </button>
        </div>
      )}

      {/* Search and Filter */}
      <div
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "12px",
          marginBottom: "1.5rem",
          display: "flex",
          gap: "1rem",
          flexWrap: "wrap",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        <input
          type="text"
          placeholder="Search by email or name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            flex: 1,
            minWidth: "250px",
            padding: "0.625rem 1rem",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "0.9rem",
          }}
        />
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
          style={{
            padding: "0.625rem 1rem",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "0.9rem",
            minWidth: "150px",
          }}
        >
          <option value="all">All Roles</option>
          <option value="user">User</option>
          <option value="owner">Owner</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Users Table */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        }}
      >
        {loading ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            Loading users...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div
            style={{
              padding: "3rem",
              textAlign: "center",
              color: "#6b7280",
            }}
          >
            No users found
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.9rem",
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                  }}
                >
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Email
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Name
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Role
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Created Date
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "center",
                      fontWeight: 600,
                      color: "#374151",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr
                    key={user._id}
                    style={{
                      borderBottom: "1px solid #e5e7eb",
                      background: index % 2 === 0 ? "white" : "#f9fafb",
                      transition: "background 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        index % 2 === 0 ? "white" : "#f9fafb";
                    }}
                  >
                    <td
                      style={{
                        padding: "1rem",
                        color: "#0066cc",
                        fontWeight: 500,
                      }}
                    >
                      {user.email}
                    </td>
                    <td style={{ padding: "1rem", color: "#1f2937" }}>
                      {user.name || "—"}
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          background:
                            user.role === "admin"
                              ? "#fef3c7"
                              : user.role === "owner"
                                ? "#dbeafe"
                                : "#e0e7ff",
                          color:
                            user.role === "admin"
                              ? "#b45309"
                              : user.role === "owner"
                                ? "#1e40af"
                                : "#4f46e5",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      >
                        {user.role || "user"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          background:
                            user.status === "active" ? "#dcfce7" : "#fee2e2",
                          color:
                            user.status === "active" ? "#15803d" : "#991b1b",
                          borderRadius: "6px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      >
                        {user.status || "active"}
                      </span>
                    </td>
                    <td style={{ padding: "1rem", color: "#6b7280" }}>
                      {user.createdAt
                        ? new Date(user.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        textAlign: "center",
                        display: "flex",
                        gap: "0.5rem",
                        justifyContent: "center",
                      }}
                    >
                      <button
                        onClick={() => handleDelete(user._id)}
                        disabled={deleting}
                        style={{
                          padding: "0.4rem 0.8rem",
                          background: "#fee2e2",
                          color: "#991b1b",
                          border: "none",
                          borderRadius: "6px",
                          cursor: deleting ? "not-allowed" : "pointer",
                          fontWeight: 500,
                          fontSize: "0.8rem",
                          opacity: deleting ? 0.5 : 1,
                        }}
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

        {/* Footer Stats */}
        {filteredUsers.length > 0 && (
          <div
            style={{
              padding: "1rem",
              background: "#f9fafb",
              borderTop: "1px solid #e5e7eb",
              color: "#6b7280",
              fontSize: "0.9rem",
              textAlign: "center",
            }}
          >
            Showing {filteredUsers.length} of {users.length} users
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              maxWidth: "500px",
              width: "90%",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                margin: "0 0 1.5rem",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1f2937",
              }}
            >
              Add New User
            </h2>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="user@example.com"
                  disabled={modalMode === "edit"}
                  required
                  style={{
                    width: "100%",
                    padding: "0.625rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                    opacity: modalMode === "edit" ? 0.6 : 1,
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="User name"
                  style={{
                    width: "100%",
                    padding: "0.625rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "0.625rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="user">User</option>
                  <option value="owner">Owner</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    color: "#374151",
                  }}
                >
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  style={{
                    width: "100%",
                    padding: "0.625rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  justifyContent: "flex-end",
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{
                    padding: "0.625rem 1.5rem",
                    background: "#e5e7eb",
                    color: "#1f2937",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  style={{
                    padding: "0.625rem 1.5rem",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: submitLoading ? "not-allowed" : "pointer",
                    opacity: submitLoading ? 0.7 : 1,
                  }}
                >
                  {submitLoading
                    ? "Saving..."
                    : modalMode === "create"
                      ? "Create User"
                      : "Update User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
