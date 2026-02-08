"use client";

import { useEffect, useState } from "react";

interface Booking {
  _id: string;
  serviceType: string;
  fullName: string;
  mobile: string;
  email: string;
  status: string;
  createdAt: string;
  [key: string]: any;
}

export default function ServiceBookingsAdmin() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filterService, setFilterService] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await fetch("/api/service-bookings?limit=1000");
      if (response.ok) {
        const data = await response.json();
        setBookings(data);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/service-bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setBookings(
          bookings.map((b) => (b._id === id ? { ...b, status: newStatus } : b)),
        );
        if (selectedBooking?._id === id) {
          setSelectedBooking({ ...selectedBooking, status: newStatus });
        }
      }
    } catch (error) {
      console.error("Failed to update status:", error);
    }
  };

  const approveBooking = async (id: string) => {
    await updateStatus(id, "confirmed");
  };

  const rejectBooking = async (id: string) => {
    await updateStatus(id, "cancelled");
  };

  const deleteBooking = async (id: string) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;

    try {
      const response = await fetch(`/api/service-bookings/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setBookings(bookings.filter((b) => b._id !== id));
        setSelectedBooking(null);
      }
    } catch (error) {
      console.error("Failed to delete booking:", error);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filterService !== "all" && b.serviceType !== filterService)
      return false;
    if (filterStatus !== "all" && b.status !== filterStatus) return false;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      return (
        b.fullName?.toLowerCase().includes(search) ||
        b.mobile?.toLowerCase().includes(search) ||
        b.email?.toLowerCase().includes(search)
      );
    }
    return true;
  });

  const serviceLabels: Record<string, string> = {
    "car-rental": "Car Rental",
    flight: "Flight",
    bus: "Bus Ticket",
    train: "Train Ticket",
    visa: "Visa",
    forex: "Forex",
    insurance: "Insurance",
  };

  const serviceIcons: Record<string, string> = {
    "car-rental": "🚗",
    flight: "✈️",
    bus: "🚌",
    train: "🚄",
    visa: "📋",
    forex: "💱",
    insurance: "🛡️",
  };

  const statusColors: Record<string, string> = {
    pending: "#f59e0b",
    confirmed: "#10b981",
    cancelled: "#ef4444",
    completed: "#6366f1",
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter((b) => b.status === "pending").length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
  };

  if (loading) {
    return (
      <div style={{ padding: "2rem", textAlign: "center", paddingTop: "6rem" }}>
        <div style={{ fontSize: "2rem", marginBottom: "1rem" }}>⏳</div>
        <div style={{ fontSize: "1.125rem", color: "#6b7280" }}>
          Loading bookings...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem 1.5rem",
        paddingTop: "5rem",
        maxWidth: "1600px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            marginBottom: "0.5rem",
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
          }}
        >
          <span style={{ fontSize: "2.5rem" }}>📋</span>
          Service Bookings Management
        </h1>
        <p style={{ color: "#6b7280", fontSize: "1rem" }}>
          View, approve, and manage all service booking requests
        </p>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <div
          style={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "1.5rem",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>{stats.total}</div>
          <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
            Total Bookings
          </div>
        </div>
        <div
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            padding: "1.5rem",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>
            {stats.pending}
          </div>
          <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>
            ⏳ Pending Approval
          </div>
        </div>
        <div
          style={{
            background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
            padding: "1.5rem",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>
            {stats.confirmed}
          </div>
          <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>✅ Confirmed</div>
        </div>
        <div
          style={{
            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
            padding: "1.5rem",
            borderRadius: "12px",
            color: "white",
            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
          }}
        >
          <div style={{ fontSize: "2rem", fontWeight: 700 }}>
            {stats.completed}
          </div>
          <div style={{ fontSize: "0.875rem", opacity: 0.9 }}>✨ Completed</div>
        </div>
      </div>

      {/* Filters & Search */}
      <div
        style={{
          background: "white",
          padding: "1.5rem",
          borderRadius: "12px",
          marginBottom: "2rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          <div style={{ flex: "1 1 300px" }}>
            <label
              style={{
                fontWeight: 600,
                marginBottom: "0.5rem",
                display: "block",
                fontSize: "0.875rem",
                color: "#374151",
              }}
            >
              🔍 Search Customer
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, mobile, or email..."
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "2px solid #e5e7eb",
                fontSize: "0.95rem",
                transition: "all 0.2s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#667eea")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#e5e7eb")}
            />
          </div>

          <div style={{ flex: "0 1 200px" }}>
            <label
              style={{
                fontWeight: 600,
                marginBottom: "0.5rem",
                display: "block",
                fontSize: "0.875rem",
                color: "#374151",
              }}
            >
              🚗 Service Type
            </label>
            <select
              value={filterService}
              onChange={(e) => setFilterService(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "2px solid #e5e7eb",
                cursor: "pointer",
                fontSize: "0.95rem",
                background: "white",
              }}
            >
              <option value="all">All Services</option>
              {Object.entries(serviceLabels).map(([key, label]) => (
                <option key={key} value={key}>
                  {serviceIcons[key]} {label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ flex: "0 1 200px" }}>
            <label
              style={{
                fontWeight: 600,
                marginBottom: "0.5rem",
                display: "block",
                fontSize: "0.875rem",
                color: "#374151",
              }}
            >
              📊 Status Filter
            </label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "2px solid #e5e7eb",
                cursor: "pointer",
                fontSize: "0.95rem",
                background: "white",
              }}
            >
              <option value="all">All Status</option>
              <option value="pending">⏳ Pending</option>
              <option value="confirmed">✅ Confirmed</option>
              <option value="completed">✨ Completed</option>
              <option value="cancelled">❌ Cancelled</option>
            </select>
          </div>

          <div style={{ flex: "0 1 150px", paddingTop: "1.75rem" }}>
            <div
              style={{ fontWeight: 600, color: "#374151", fontSize: "0.95rem" }}
            >
              Showing:{" "}
              <span style={{ color: "#667eea" }}>
                {filteredBookings.length}
              </span>{" "}
              bookings
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div
        style={{
          background: "white",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      >
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              minWidth: "900px",
            }}
          >
            <thead
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
              }}
            >
              <tr>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  📅 Date
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  🚀 Service
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  👤 Customer
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  📞 Contact
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "left",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  📊 Status
                </th>
                <th
                  style={{
                    padding: "1rem",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: "0.875rem",
                  }}
                >
                  ⚡ Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    style={{
                      padding: "3rem 2rem",
                      textAlign: "center",
                      color: "#9ca3af",
                    }}
                  >
                    <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>
                      📭
                    </div>
                    <div
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: 600,
                        marginBottom: "0.5rem",
                      }}
                    >
                      No bookings found
                    </div>
                    <div style={{ fontSize: "0.875rem" }}>
                      Try adjusting your filters or search terms
                    </div>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((booking, index) => (
                  <tr
                    key={booking._id}
                    style={{
                      borderBottom: "1px solid #f3f4f6",
                      background: index % 2 === 0 ? "white" : "#fafafa",
                      transition: "all 0.2s",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#f9fafb")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        index % 2 === 0 ? "white" : "#fafafa")
                    }
                  >
                    <td style={{ padding: "1rem", fontSize: "0.875rem" }}>
                      <div style={{ fontWeight: 600, color: "#374151" }}>
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                      <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                        {new Date(booking.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          background:
                            "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                          color: "white",
                          padding: "0.4rem 0.875rem",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.4rem",
                        }}
                      >
                        <span>{serviceIcons[booking.serviceType]}</span>
                        {serviceLabels[booking.serviceType] ||
                          booking.serviceType}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div style={{ fontWeight: 600, color: "#1f2937" }}>
                        {booking.fullName}
                      </div>
                    </td>
                    <td
                      style={{
                        padding: "1rem",
                        fontSize: "0.875rem",
                      }}
                    >
                      <div
                        style={{
                          color: "#4b5563",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          marginBottom: "0.25rem",
                        }}
                      >
                        <span>📱</span> {booking.mobile}
                      </div>
                      <div
                        style={{
                          color: "#6b7280",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.4rem",
                          fontSize: "0.8rem",
                        }}
                      >
                        <span>✉️</span> {booking.email}
                      </div>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <span
                        style={{
                          background: `${statusColors[booking.status]}20`,
                          color: statusColors[booking.status],
                          padding: "0.4rem 0.875rem",
                          borderRadius: "20px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          textTransform: "capitalize",
                          display: "inline-block",
                        }}
                      >
                        {booking.status === "pending" && "⏳ "}
                        {booking.status === "confirmed" && "✅ "}
                        {booking.status === "completed" && "✨ "}
                        {booking.status === "cancelled" && "❌ "}
                        {booking.status}
                      </span>
                    </td>
                    <td style={{ padding: "1rem" }}>
                      <div
                        style={{
                          display: "flex",
                          gap: "0.5rem",
                          justifyContent: "center",
                          flexWrap: "wrap",
                        }}
                      >
                        {booking.status === "pending" && (
                          <>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                approveBooking(booking._id);
                              }}
                              style={{
                                padding: "0.5rem 0.875rem",
                                background:
                                  "linear-gradient(135deg, #10b981 0%, #059669 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                boxShadow: "0 2px 6px rgba(16, 185, 129, 0.3)",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.transform =
                                  "translateY(-2px)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.transform =
                                  "translateY(0)")
                              }
                            >
                              <span>✅</span> Approve
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                rejectBooking(booking._id);
                              }}
                              style={{
                                padding: "0.5rem 0.875rem",
                                background:
                                  "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                cursor: "pointer",
                                fontSize: "0.8rem",
                                fontWeight: 600,
                                display: "flex",
                                alignItems: "center",
                                gap: "0.4rem",
                                boxShadow: "0 2px 6px rgba(239, 68, 68, 0.3)",
                                transition: "all 0.2s",
                              }}
                              onMouseEnter={(e) =>
                                (e.currentTarget.style.transform =
                                  "translateY(-2px)")
                              }
                              onMouseLeave={(e) =>
                                (e.currentTarget.style.transform =
                                  "translateY(0)")
                              }
                            >
                              <span>❌</span> Reject
                            </button>
                          </>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedBooking(booking);
                          }}
                          style={{
                            padding: "0.5rem 0.875rem",
                            background:
                              "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.8rem",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "0.4rem",
                            boxShadow: "0 2px 6px rgba(102, 126, 234, 0.3)",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.transform =
                              "translateY(-2px)")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.transform = "translateY(0)")
                          }
                        >
                          <span>👁️</span> View
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
            animation: "fadeIn 0.2s ease",
          }}
          onClick={() => setSelectedBooking(null)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              maxWidth: "900px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              animation: "slideUp 0.3s ease",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                padding: "1.5rem 2rem",
                color: "white",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                  }}
                >
                  <span style={{ fontSize: "1.5rem" }}>
                    {serviceIcons[selectedBooking.serviceType]}
                  </span>
                  {serviceLabels[selectedBooking.serviceType]} Booking Details
                </h2>
                <p style={{ margin: 0, opacity: 0.9, fontSize: "0.875rem" }}>
                  📅 {new Date(selectedBooking.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                style={{
                  background: "rgba(255,255,255,0.2)",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "white",
                  width: "36px",
                  height: "36px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.3)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "rgba(255,255,255,0.2)")
                }
              >
                ×
              </button>
            </div>

            <div style={{ padding: "2rem" }}>
              {/* Status Update */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%)",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  marginBottom: "1.5rem",
                  border: "2px solid #e5e7eb",
                }}
              >
                <label
                  style={{
                    fontWeight: 600,
                    marginBottom: "1rem",
                    display: "block",
                    fontSize: "1rem",
                    color: "#1f2937",
                  }}
                >
                  📊 Booking Status
                </label>
                <div
                  style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}
                >
                  {["pending", "confirmed", "completed", "cancelled"].map(
                    (status) => (
                      <button
                        key={status}
                        onClick={() =>
                          updateStatus(selectedBooking._id, status)
                        }
                        style={{
                          padding: "0.75rem 1.5rem",
                          background:
                            selectedBooking.status === status
                              ? `linear-gradient(135deg, ${statusColors[status]} 0%, ${statusColors[status]}dd 100%)`
                              : "white",
                          color:
                            selectedBooking.status === status
                              ? "white"
                              : statusColors[status],
                          border: `2px solid ${statusColors[status]}`,
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "0.875rem",
                          textTransform: "capitalize",
                          transition: "all 0.2s",
                          boxShadow:
                            selectedBooking.status === status
                              ? `0 4px 12px ${statusColors[status]}40`
                              : "none",
                        }}
                        onMouseEnter={(e) => {
                          if (selectedBooking.status !== status) {
                            e.currentTarget.style.background = `${statusColors[status]}15`;
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedBooking.status !== status) {
                            e.currentTarget.style.background = "white";
                          }
                        }}
                      >
                        {status === "pending" && "⏳ "}
                        {status === "confirmed" && "✅ "}
                        {status === "completed" && "✨ "}
                        {status === "cancelled" && "❌ "}
                        {status}
                      </button>
                    ),
                  )}
                </div>
              </div>

              {/* Customer Information */}
              <div
                style={{
                  background: "#f9fafb",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  marginBottom: "1.5rem",
                  border: "2px solid #e5e7eb",
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: "1rem",
                    fontSize: "1.125rem",
                    color: "#1f2937",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span>👤</span> Customer Information
                </h3>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      background: "white",
                      padding: "1rem",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#9ca3af",
                        marginBottom: "0.25rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Full Name
                    </div>
                    <div style={{ fontWeight: 600, color: "#1f2937" }}>
                      {selectedBooking.fullName}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "white",
                      padding: "1rem",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#9ca3af",
                        marginBottom: "0.25rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      📱 Mobile
                    </div>
                    <div style={{ fontWeight: 600, color: "#1f2937" }}>
                      {selectedBooking.mobile}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "white",
                      padding: "1rem",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "0.75rem",
                        color: "#9ca3af",
                        marginBottom: "0.25rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      ✉️ Email
                    </div>
                    <div
                      style={{
                        fontWeight: 600,
                        color: "#1f2937",
                        fontSize: "0.875rem",
                        wordBreak: "break-all",
                      }}
                    >
                      {selectedBooking.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div
                style={{
                  background: "#f9fafb",
                  padding: "1.5rem",
                  borderRadius: "12px",
                  marginBottom: "1.5rem",
                  border: "2px solid #e5e7eb",
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    marginBottom: "1rem",
                    fontSize: "1.125rem",
                    color: "#1f2937",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                >
                  <span>{serviceIcons[selectedBooking.serviceType]}</span>{" "}
                  Service Details
                </h3>
                <div
                  style={{
                    background: "white",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid #e5e7eb",
                  }}
                >
                  <table style={{ width: "100%" }}>
                    <tbody>
                      {Object.entries(selectedBooking).map(([key, value]) => {
                        if (
                          [
                            "_id",
                            "serviceType",
                            "status",
                            "createdAt",
                            "updatedAt",
                            "agreeContact",
                            "fullName",
                            "mobile",
                            "email",
                          ].includes(key)
                        ) {
                          return null;
                        }
                        const label = key
                          .replace(/([A-Z])/g, " $1")
                          .replace(/^./, (str) => str.toUpperCase());
                        return (
                          <tr
                            key={key}
                            style={{ borderBottom: "1px solid #f3f4f6" }}
                          >
                            <td
                              style={{
                                padding: "0.875rem 1rem",
                                fontWeight: 600,
                                color: "#6b7280",
                                width: "35%",
                                fontSize: "0.875rem",
                                background: "#fafafa",
                              }}
                            >
                              {label}
                            </td>
                            <td
                              style={{
                                padding: "0.875rem 1rem",
                                color: "#1f2937",
                                fontWeight: 500,
                              }}
                            >
                              {String(value) || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                <button
                  onClick={() => setSelectedBooking(null)}
                  style={{
                    flex: 1,
                    minWidth: "150px",
                    padding: "0.875rem 1.5rem",
                    background: "white",
                    color: "#374151",
                    border: "2px solid #e5e7eb",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "#f9fafb";
                    e.currentTarget.style.borderColor = "#d1d5db";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "white";
                    e.currentTarget.style.borderColor = "#e5e7eb";
                  }}
                >
                  Close
                </button>
                <button
                  onClick={() => deleteBooking(selectedBooking._id)}
                  style={{
                    flex: 1,
                    minWidth: "150px",
                    padding: "0.875rem 1.5rem",
                    background:
                      "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "translateY(-2px)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "translateY(0)")
                  }
                >
                  🗑️ Delete Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
