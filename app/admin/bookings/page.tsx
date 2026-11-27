"use client";

import { useEffect, useState } from "react";

interface Booking {
  _id: string;
  bookingReference: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  checkin: string;
  checkout: string;
  guests: number;
  nights: number;
  totalPrice: number;
  outstandingAmount?: number;
  paymentStatus: string;
  bookingStatus: string;
  stayStatus?: string;
  billingStatus?: string;
  actualCheckInAt?: string;
  actualCheckOutAt?: string;
  billingFinalizedAt?: string;
  finalInvoiceNumber?: string;
  finalInvoiceDocumentId?: string;
  homestay?: any;
  createdAt: string;
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [communicationsTimeline, setCommunicationsTimeline] = useState<any[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);

  useEffect(() => {
    if (selectedBooking?._id) {
      fetchBookingTimeline(selectedBooking._id);
    } else {
      setCommunicationsTimeline([]);
    }
  }, [selectedBooking?._id]);

  const fetchBookingTimeline = async (bookingId: string) => {
    setTimelineLoading(true);
    try {
      const res = await fetch(`/api/admin/communications/timeline?bookingId=${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setCommunicationsTimeline(data.timeline || []);
      }
    } catch (e) {
      console.error("Failed to fetch communications timeline:", e);
    } finally {
      setTimelineLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      let url = "/api/bookings";
      if (filter !== "all") {
        url += `?status=${filter}`;
      }

      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setBookings(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      alert("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to ${newStatus} this booking?`)) return;

    try {
      const response = await fetch(`/api/bookings?id=${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingStatus: newStatus }),
      });

      if (response.ok) {
        alert(`Booking ${newStatus} successfully!`);
        fetchBookings();
      } else {
        alert("Failed to update booking");
      }
    } catch (error) {
      console.error("Error updating booking:", error);
      alert("An error occurred");
    }
  };

  const handleAdminCheckIn = async (bookingId: string) => {
    if (!confirm("Confirm guest check-in for this booking?")) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/check-in`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Failed to mark check-in");
      else {
        alert("Guest checked in successfully.");
        fetchBookings();
        setSelectedBooking(null);
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    }
  };

  const handleAdminCheckOut = async (bookingId: string) => {
    if (!confirm("Confirm guest checkout? This will complete the stay and trigger thank-you communications.")) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/check-out`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Failed to mark checkout");
      else {
        alert("Guest checked out successfully.");
        fetchBookings();
        setSelectedBooking(null);
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    }
  };

  const handleAdminFinalizeBilling = async (bookingId: string) => {
    if (!confirm("Finalize billing and issue final invoice?")) return;
    try {
      const res = await fetch(`/api/bookings/${bookingId}/finalize-billing`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Failed to finalize billing");
      else {
        alert(`Billing finalized. Invoice: ${data.invoiceNumber || "Generated"}`);
        fetchBookings();
        setSelectedBooking(null);
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return { bg: "#d4edda", text: "#155724" };
      case "pending":
        return { bg: "#fff3cd", text: "#856404" };
      case "cancelled":
        return { bg: "#f8d7da", text: "#721c24" };
      case "completed":
        return { bg: "#d1ecf1", text: "#0c5460" };
      default:
        return { bg: "#e2e3e5", text: "#383d41" };
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return { bg: "#d4edda", text: "#155724" };
      case "pending":
        return { bg: "#fff3cd", text: "#856404" };
      case "failed":
        return { bg: "#f8d7da", text: "#721c24" };
      case "refunded":
        return { bg: "#d1ecf1", text: "#0c5460" };
      default:
        return { bg: "#e2e3e5", text: "#383d41" };
    }
  };

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
        <h1 style={{ fontSize: "2rem", fontWeight: "bold" }}>
          Booking Management
        </h1>

        {/* Filter */}
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: "0.75rem 1rem",
            border: "1px solid #ddd",
            borderRadius: "0.5rem",
            fontSize: "1rem",
            cursor: "pointer",
          }}
        >
          <option value="all">All Bookings</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="cancelled">Cancelled</option>
          <option value="completed">Completed</option>
        </select>
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
            background: "white",
            padding: "1.5rem",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <p
            style={{
              fontSize: "0.875rem",
              color: "#666",
              marginBottom: "0.5rem",
            }}
          >
            Total Bookings
          </p>
          <p style={{ fontSize: "2rem", fontWeight: "bold" }}>
            {bookings.length}
          </p>
        </div>
        <div
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <p
            style={{
              fontSize: "0.875rem",
              color: "#666",
              marginBottom: "0.5rem",
            }}
          >
            Confirmed
          </p>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#22c55e" }}>
            {bookings.filter((b) => b.bookingStatus === "confirmed").length}
          </p>
        </div>
        <div
          style={{
            background: "white",
            padding: "1.5rem",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          <p
            style={{
              fontSize: "0.875rem",
              color: "#666",
              marginBottom: "0.5rem",
            }}
          >
            Total Revenue
          </p>
          <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#0a66c2" }}>
            ₹
            {bookings
              .filter((b) => b.paymentStatus === "paid")
              .reduce((sum, b) => sum + b.totalPrice, 0)
              .toFixed(0)}
          </p>
        </div>
      </div>

      {/* Bookings Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem" }}>
          <p>Loading bookings...</p>
        </div>
      ) : bookings.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#666" }}>
          <p>No bookings found</p>
        </div>
      ) : (
        <div
          style={{
            background: "white",
            borderRadius: "0.5rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            overflow: "hidden",
          }}
        >
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr
                  style={{
                    backgroundColor: "#f8f9fa",
                    borderBottom: "2px solid #dee2e6",
                  }}
                >
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Booking Ref
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Guest
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Homestay
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Dates
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Amount
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Payment
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Status
                  </th>
                  <th
                    style={{
                      padding: "1rem",
                      textAlign: "left",
                      fontWeight: "600",
                    }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => {
                  const statusColor = getStatusColor(booking.bookingStatus);
                  const paymentColor = getPaymentStatusColor(
                    booking.paymentStatus
                  );

                  return (
                    <tr
                      key={booking._id}
                      style={{
                        borderBottom: "1px solid #dee2e6",
                        cursor: "pointer",
                      }}
                      onClick={() => setSelectedBooking(booking)}
                    >
                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{ fontFamily: "monospace", fontWeight: "500" }}
                        >
                          {booking.bookingReference}
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div>
                          <p
                            style={{
                              fontWeight: "500",
                              marginBottom: "0.25rem",
                            }}
                          >
                            {booking.guestName}
                          </p>
                          <p style={{ fontSize: "0.875rem", color: "#666" }}>
                            {booking.guestEmail}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <p style={{ fontWeight: "500" }}>
                          {booking.homestay?.name || "N/A"}
                        </p>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div>
                          <p style={{ fontSize: "0.875rem" }}>
                            {new Date(booking.checkin).toLocaleDateString()}
                          </p>
                          <p style={{ fontSize: "0.875rem", color: "#666" }}>
                            {booking.nights} night(s)
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: "1rem", fontWeight: "600" }}>
                        ₹{booking.totalPrice.toFixed(0)}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "1rem",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            backgroundColor: paymentColor.bg,
                            color: paymentColor.text,
                          }}
                        >
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "1rem",
                            fontSize: "0.75rem",
                            fontWeight: "600",
                            backgroundColor: statusColor.bg,
                            color: statusColor.text,
                          }}
                        >
                          {booking.bookingStatus}
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          {booking.bookingStatus === "pending" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateBookingStatus(booking._id, "confirmed");
                              }}
                              style={{
                                padding: "0.375rem 0.75rem",
                                backgroundColor: "#22c55e",
                                color: "white",
                                border: "none",
                                borderRadius: "0.25rem",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                              }}
                            >
                              Confirm
                            </button>
                          )}
                          {booking.bookingStatus !== "cancelled" && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                updateBookingStatus(booking._id, "cancelled");
                              }}
                              style={{
                                padding: "0.375rem 0.75rem",
                                backgroundColor: "#dc2626",
                                color: "white",
                                border: "none",
                                borderRadius: "0.25rem",
                                fontSize: "0.75rem",
                                cursor: "pointer",
                              }}
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "2rem",
          }}
          onClick={() => setSelectedBooking(null)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "0.75rem",
              padding: "2rem",
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                marginBottom: "1.5rem",
              }}
            >
              Booking Details
            </h2>

            <div style={{ display: "grid", gap: "1rem" }}>
              <div>
                <p style={{ fontSize: "0.875rem", color: "#666" }}>
                  Booking Reference
                </p>
                <p style={{ fontWeight: "600", fontFamily: "monospace" }}>
                  {selectedBooking.bookingReference}
                </p>
              </div>

              <div>
                <p style={{ fontSize: "0.875rem", color: "#666" }}>
                  Guest Name
                </p>
                <p style={{ fontWeight: "500" }}>{selectedBooking.guestName}</p>
              </div>

              <div>
                <p style={{ fontSize: "0.875rem", color: "#666" }}>Contact</p>
                <p>{selectedBooking.guestEmail}</p>
                <p>{selectedBooking.guestPhone}</p>
              </div>

              <div>
                <p style={{ fontSize: "0.875rem", color: "#666" }}>
                  Check-in / Check-out
                </p>
                <p>
                  {new Date(selectedBooking.checkin).toLocaleDateString()} -{" "}
                  {new Date(selectedBooking.checkout).toLocaleDateString()}
                </p>
                <p style={{ fontSize: "0.875rem" }}>
                  {selectedBooking.nights} nights, {selectedBooking.guests}{" "}
                  guests
                </p>
              </div>

              <div>
                <p style={{ fontSize: "0.875rem", color: "#666" }}>
                  Total Amount
                </p>
                <p
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: "#0a66c2",
                  }}
                >
                  ₹{selectedBooking.totalPrice.toFixed(2)}
                </p>
              </div>

              <div>
                <p style={{ fontSize: "0.875rem", color: "#666" }}>
                  Stay & Billing Lifecycle
                </p>
                <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem", borderRadius: "4px", background: "#f1f5f9", fontWeight: 600 }}>
                    Stay: {selectedBooking.stayStatus || "NOT_CHECKED_IN"}
                  </span>
                  <span style={{ fontSize: "0.8rem", padding: "0.25rem 0.5rem", borderRadius: "4px", background: "#f1f5f9", fontWeight: 600 }}>
                    Billing: {selectedBooking.billingStatus || "OPEN"}
                  </span>
                </div>
              </div>

              {/* Operational Actions */}
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.5rem" }}>
                {selectedBooking.bookingStatus === "confirmed" && (!selectedBooking.stayStatus || selectedBooking.stayStatus === "NOT_CHECKED_IN") && (
                  <button
                    onClick={() => handleAdminCheckIn(selectedBooking._id)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#166534",
                      color: "white",
                      border: "none",
                      borderRadius: "0.375rem",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    🏨 Mark Check-In
                  </button>
                )}

                {selectedBooking.stayStatus === "CHECKED_IN" && (
                  <button
                    onClick={() => handleAdminCheckOut(selectedBooking._id)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#6b21a8",
                      color: "white",
                      border: "none",
                      borderRadius: "0.375rem",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    🚪 Mark Checkout
                  </button>
                )}

                {selectedBooking.stayStatus === "CHECKED_OUT" && selectedBooking.billingStatus !== "FINALIZED" && (
                  <button
                    onClick={() => handleAdminFinalizeBilling(selectedBooking._id)}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#0b6dff",
                      color: "white",
                      border: "none",
                      borderRadius: "0.375rem",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    🧾 Finalize Billing
                  </button>
                )}

                {selectedBooking.finalInvoiceNumber && (
                  <span style={{ fontSize: "0.85rem", color: "#166534", fontWeight: 600, alignSelf: "center" }}>
                    ✓ Invoice: {selectedBooking.finalInvoiceNumber}
                  </span>
                )}
              </div>

              {/* Communication History Section */}
              <div style={{ marginTop: "1rem", borderTop: "1px solid #e5e7eb", paddingTop: "1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 700, margin: 0, color: "#111827" }}>
                    📨 Communication History
                  </h3>
                  <a
                    href={`/admin/communications?search=${selectedBooking.bookingReference}`}
                    target="_blank"
                    rel="noreferrer"
                    style={{ fontSize: "0.75rem", color: "#2563eb", textDecoration: "underline", fontWeight: 600 }}
                  >
                    View in Center ↗
                  </a>
                </div>

                {timelineLoading ? (
                  <p style={{ fontSize: "0.85rem", color: "#6b7280" }}>Loading delivery history...</p>
                ) : communicationsTimeline.length === 0 ? (
                  <p style={{ fontSize: "0.85rem", color: "#9ca3af" }}>No communications recorded for this booking yet.</p>
                ) : (
                  <div style={{ display: "grid", gap: "0.5rem", maxHeight: "200px", overflowY: "auto" }}>
                    {communicationsTimeline.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: "0.5rem 0.75rem",
                          borderRadius: "0.375rem",
                          background: "#f8fafc",
                          border: "1px solid #e2e8f0",
                          fontSize: "0.8rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, color: "#1e293b" }}>
                            {item.type} {item.isResend && <span style={{ color: "#d97706" }}>[RESEND]</span>}
                          </div>
                          <div style={{ color: "#64748b", fontSize: "0.75rem" }}>
                            {new Date(item.deliveredAt || item.scheduledFor || item.createdAt).toLocaleString()} • {item.recipientMasked}
                          </div>
                          {item.lastError && (
                            <div style={{ color: "#dc2626", fontSize: "0.7rem", marginTop: "0.1rem" }}>
                              {item.lastError}
                            </div>
                          )}
                        </div>
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            padding: "0.2rem 0.5rem",
                            borderRadius: "9999px",
                            backgroundColor:
                              item.status === "DELIVERED" || item.status === "ACCEPTED"
                                ? "#dcfce7"
                                : item.status === "FAILED"
                                ? "#fee2e2"
                                : "#fef9c3",
                            color:
                              item.status === "DELIVERED" || item.status === "ACCEPTED"
                                ? "#15803d"
                                : item.status === "FAILED"
                                ? "#b91c1c"
                                : "#a16207",
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setSelectedBooking(null)}
              style={{
                marginTop: "1.5rem",
                padding: "0.75rem 1.5rem",
                backgroundColor: "#e5e7eb",
                color: "#374151",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                width: "100%",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
