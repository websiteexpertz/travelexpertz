"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Booking {
  _id: string;
  bookingReference?: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  propertyName?: string;
  propertyType?: string;
  roomDetails?: string;
  address?: string;
  city?: string;
  image?: string;
  pricePerNight?: number;
  checkin: string;
  checkout: string;
  guests: number;
  nights: number;
  totalPrice: number;
  paidAmount?: number;
  outstandingAmount?: number;
  bookingStatus: string;
  stayStatus?: string;
  billingStatus?: string;
  actualCheckInAt?: string;
  actualCheckOutAt?: string;
  billingFinalizedAt?: string;
  finalInvoiceNumber?: string;
  finalInvoiceDocumentId?: string;
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "confirmed" | "pending" | "cancelled"
  >("all");
  const [checkoutModalBooking, setCheckoutModalBooking] = useState<Booking | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("ownerToken");
      const res = await fetch("/api/owner/bookings", {
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load bookings");
      } else {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  const getFilteredBookings = () => {
    if (filterStatus === "all") return bookings;
    return bookings.filter((b) => b.bookingStatus === filterStatus);
  };

  const filteredBookings = getFilteredBookings();

  const handleCheckIn = async (bookingId: string) => {
    if (!confirm("Confirm guest arrival and mark as Checked-In?")) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("ownerToken");
      const res = await fetch(`/api/bookings/${bookingId}/check-in`, {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Failed to mark check-in");
      else fetchBookings();
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async (bookingId: string) => {
    setActionLoading(true);
    try {
      const token = localStorage.getItem("ownerToken");
      const res = await fetch(`/api/bookings/${bookingId}/check-out`, {
        method: "POST",
        credentials: "include",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Failed to mark checkout");
      else {
        setCheckoutModalBooking(null);
        fetchBookings();
      }
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleFinalizeBilling = async (bookingId: string) => {
    if (!confirm("Finalize billing and generate the final stay invoice?")) return;
    setActionLoading(true);
    try {
      const token = localStorage.getItem("ownerToken");
      const res = await fetch(`/api/bookings/${bookingId}/finalize-billing`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) alert(data.error || "Failed to finalize billing");
      else fetchBookings();
    } catch (err: any) {
      alert(err.message || "Network error");
    } finally {
      setActionLoading(false);
    }
  };

  const getStayStatusBadge = (stayStatus?: string) => {
    switch (stayStatus) {
      case "CHECKED_IN":
        return { bg: "#dbeafe", color: "#1e40af", label: "🏨 Checked In" };
      case "CHECKED_OUT":
        return { bg: "#f3e8ff", color: "#6b21a8", label: "✓ Checked Out" };
      case "NO_SHOW":
        return { bg: "#fee2e2", color: "#991b1b", label: "✕ No Show" };
      default:
        return { bg: "#f1f5f9", color: "#475467", label: "⏳ Awaiting Arrival" };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return { bg: "#dcfce7", color: "#166534", label: "✓ Confirmed" };
      case "cancelled":
        return { bg: "#fee2e2", color: "#991b1b", label: "✕ Cancelled" };
      case "pending":
        return { bg: "#fef3c7", color: "#92400e", label: "⏳ Pending" };
      default:
        return { bg: "#f3f4f6", color: "#374151", label: status };
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
        }}
      >
        <div>
          <h1 style={{ margin: 0, fontSize: "2rem", fontWeight: 700 }}>
            📅 My Bookings
          </h1>
          <p
            style={{
              margin: "0.5rem 0 0",
              color: "#6b7280",
              fontSize: "0.95rem",
            }}
          >
            Manage and track all your property bookings
          </p>
        </div>
        <div
          style={{
            fontSize: "2rem",
            padding: "0.5rem 1rem",
            background: "#f3f4f6",
            borderRadius: "8px",
          }}
        >
          {bookings.length}
        </div>
      </div>

      {error && (
        <div
          style={{
            background: "#fef2f2",
            color: "#b91c1c",
            padding: "1rem",
            borderRadius: "10px",
            marginBottom: "1rem",
            border: "1px solid #fecaca",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* Filter Tabs */}
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "2rem",
          borderBottom: "2px solid #e5e7eb",
          paddingBottom: "1rem",
        }}
      >
        {["all", "confirmed", "pending", "cancelled"].map((status) => {
          const isActive = filterStatus === status;
          const count =
            status === "all"
              ? bookings.length
              : bookings.filter((b) => b.bookingStatus === status).length;

          return (
            <button
              key={status}
              onClick={() => setFilterStatus(status as any)}
              style={{
                padding: "0.5rem 1rem",
                background: isActive ? "#2563eb" : "#f3f4f6",
                color: isActive ? "#fff" : "#374151",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: isActive ? 700 : 600,
                fontSize: "0.9rem",
                transition: "all 0.3s ease",
              }}
            >
              {status === "all" && `All (${count})`}
              {status === "confirmed" && `✓ Confirmed (${count})`}
              {status === "pending" && `⏳ Pending (${count})`}
              {status === "cancelled" && `✕ Cancelled (${count})`}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            background: "#f9fafb",
            borderRadius: "10px",
            color: "#6b7280",
          }}
        >
          Loading bookings...
        </div>
      ) : filteredBookings.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            background: "#f9fafb",
            borderRadius: "10px",
            color: "#6b7280",
          }}
        >
          <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>📭</div>
          <p style={{ margin: 0, fontSize: "1rem" }}>
            {filterStatus === "all"
              ? "No bookings yet"
              : `No ${filterStatus} bookings`}
          </p>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {filteredBookings.map((booking) => {
            const checkin = new Date(booking.checkin).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              },
            );
            const checkout = new Date(booking.checkout).toLocaleDateString(
              "en-US",
              {
                month: "short",
                day: "numeric",
                year: "numeric",
              },
            );
            const statusInfo = getStatusColor(booking.bookingStatus);

            return (
              <div
                key={booking._id}
                style={{
                  background: "#fff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  overflow: "hidden",
                  transition: "all 0.3s ease",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 10px 25px rgba(0,0,0,0.15)";
                  el.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLElement;
                  el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
                  el.style.transform = "translateY(0)";
                }}
              >
                {/* Header */}
                <div
                  style={{
                    padding: "1rem",
                    background: "#f9fafb",
                    borderBottom: "1px solid #e5e7eb",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "start",
                  }}
                >
                  <div>
                    <h3
                      style={{ margin: 0, fontSize: "1rem", fontWeight: 700 }}
                    >
                      {booking.guestName}
                    </h3>
                    <p
                      style={{
                        margin: "0.25rem 0 0",
                        fontSize: "0.85rem",
                        color: "#6b7280",
                      }}
                    >
                      Ref: {booking.bookingReference || booking._id.slice(0, 8)}
                    </p>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem", alignItems: "flex-end" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.25rem 0.6rem",
                        borderRadius: "6px",
                        background: statusInfo.bg,
                        color: statusInfo.color,
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    >
                      {statusInfo.label}
                    </span>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.25rem 0.6rem",
                        borderRadius: "6px",
                        background: getStayStatusBadge(booking.stayStatus).bg,
                        color: getStayStatusBadge(booking.stayStatus).color,
                        fontWeight: 600,
                        fontSize: "0.75rem",
                      }}
                    >
                      {getStayStatusBadge(booking.stayStatus).label}
                    </span>
                  </div>
                </div>

                {/* Property Details */}
                <div
                  style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }}
                >
                  <div style={{ marginBottom: "0.75rem" }}>
                    <h4
                      style={{
                        margin: 0,
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "#1f2937",
                      }}
                    >
                      {booking.propertyName || "Property"}
                    </h4>
                    {booking.propertyType && (
                      <span
                        style={{
                          display: "inline-block",
                          marginTop: "0.25rem",
                          fontSize: "0.8rem",
                          background: "#e0e7ff",
                          color: "#4f46e5",
                          padding: "0.2rem 0.5rem",
                          borderRadius: "4px",
                        }}
                      >
                        {booking.propertyType}
                      </span>
                    )}
                  </div>

                  {booking.roomDetails && (
                    <p
                      style={{
                        margin: "0.5rem 0",
                        fontSize: "0.9rem",
                        color: "#6b7280",
                      }}
                    >
                      🛏️ {booking.roomDetails}
                    </p>
                  )}

                  {booking.address && (
                    <p
                      style={{
                        margin: "0.5rem 0 0",
                        fontSize: "0.9rem",
                        color: "#6b7280",
                      }}
                    >
                      📍 {booking.city || ""}
                      {booking.address && ` • ${booking.address}`}
                    </p>
                  )}
                </div>

                {/* Dates & Guests */}
                <div
                  style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.5rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: "#6b7280",
                          fontSize: "0.85rem",
                        }}
                      >
                        Check-in
                      </p>
                      <p style={{ margin: "0.2rem 0 0", fontWeight: 600 }}>
                        {checkin}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: "#6b7280",
                          fontSize: "0.85rem",
                        }}
                      >
                        Check-out
                      </p>
                      <p style={{ margin: "0.2rem 0 0", fontWeight: 600 }}>
                        {checkout}
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "0.5rem",
                      marginTop: "0.75rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: "#6b7280",
                          fontSize: "0.85rem",
                        }}
                      >
                        Guests
                      </p>
                      <p style={{ margin: "0.2rem 0 0", fontWeight: 600 }}>
                        {booking.guests} person{booking.guests > 1 ? "s" : ""}
                      </p>
                    </div>
                    <div>
                      <p
                        style={{
                          margin: 0,
                          color: "#6b7280",
                          fontSize: "0.85rem",
                        }}
                      >
                        Duration
                      </p>
                      <p style={{ margin: "0.2rem 0 0", fontWeight: 600 }}>
                        {booking.nights} night{booking.nights > 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price & Payment Summary */}
                <div style={{ padding: "1rem", borderBottom: "1px solid #e5e7eb" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      {booking.pricePerNight && (
                        <p
                          style={{
                            margin: 0,
                            color: "#6b7280",
                            fontSize: "0.85rem",
                          }}
                        >
                          ₹{booking.pricePerNight.toFixed(2)}/night
                        </p>
                      )}
                      <p
                        style={{
                          margin: "0.3rem 0 0",
                          fontSize: "1.2rem",
                          fontWeight: 700,
                          color: "#2563eb",
                        }}
                      >
                        ₹{booking.totalPrice.toFixed(2)}
                      </p>
                    </div>
                    {typeof booking.outstandingAmount === "number" && booking.outstandingAmount > 0 && (
                      <span style={{ fontSize: "0.8rem", color: "#b91c1c", fontWeight: 600, background: "#fee2e2", padding: "0.2rem 0.5rem", borderRadius: "4px" }}>
                        Due: ₹{booking.outstandingAmount.toFixed(0)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Operational Actions */}
                <div style={{ padding: "0.75rem 1rem", background: "#f8fafc", display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                  {booking.bookingStatus === "confirmed" && (!booking.stayStatus || booking.stayStatus === "NOT_CHECKED_IN") && (
                    <button
                      disabled={actionLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckIn(booking._id);
                      }}
                      style={{
                        padding: "0.4rem 0.8rem",
                        background: "#166534",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      🏨 Mark Check-In
                    </button>
                  )}

                  {booking.stayStatus === "CHECKED_IN" && (
                    <button
                      disabled={actionLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        setCheckoutModalBooking(booking);
                      }}
                      style={{
                        padding: "0.4rem 0.8rem",
                        background: "#6b21a8",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      🚪 Mark Checkout
                    </button>
                  )}

                  {booking.stayStatus === "CHECKED_OUT" && booking.billingStatus !== "FINALIZED" && (
                    <button
                      disabled={actionLoading}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleFinalizeBilling(booking._id);
                      }}
                      style={{
                        padding: "0.4rem 0.8rem",
                        background: "#0b6dff",
                        color: "#fff",
                        border: "none",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      🧾 Finalize Billing
                    </button>
                  )}

                  {booking.billingStatus === "FINALIZED" && (
                    <span style={{ fontSize: "0.8rem", color: "#166534", fontWeight: 600 }}>
                      ✓ Billing Finalized
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Checkout Confirmation Dialog (Section 7) */}
      {checkoutModalBooking && (
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
          onClick={() => setCheckoutModalBooking(null)}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              maxWidth: "500px",
              width: "100%",
              padding: "1.5rem",
              boxShadow: "0 20px 25px -5px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 1rem", fontSize: "1.25rem", color: "#0f172a", fontWeight: 700 }}>
              Confirm Guest Checkout
            </h3>

            <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", fontSize: "0.9rem", color: "#334155" }}>
              <p style={{ margin: "0 0 0.5rem" }}>
                <strong>Booking Ref:</strong> {checkoutModalBooking.bookingReference || checkoutModalBooking._id}
              </p>
              <p style={{ margin: "0 0 0.5rem" }}>
                <strong>Guest Name:</strong> {checkoutModalBooking.guestName}
              </p>
              <p style={{ margin: "0 0 0.5rem" }}>
                <strong>Property:</strong> {checkoutModalBooking.propertyName}
              </p>
              <p style={{ margin: "0 0 0.5rem" }}>
                <strong>Scheduled Checkout:</strong> {new Date(checkoutModalBooking.checkout).toLocaleDateString()}
              </p>
              <p style={{ margin: "0 0 0.5rem" }}>
                <strong>Actual Check-in:</strong> {checkoutModalBooking.actualCheckInAt ? new Date(checkoutModalBooking.actualCheckInAt).toLocaleString() : "Recorded"}
              </p>
              <div style={{ borderTop: "1px solid #e2e8f0", paddingTop: "0.5rem", marginTop: "0.5rem" }}>
                <p style={{ margin: "0 0 0.25rem" }}>
                  <strong>Total Amount:</strong> ₹{checkoutModalBooking.totalPrice?.toFixed(2)}
                </p>
                <p style={{ margin: 0, color: (checkoutModalBooking.outstandingAmount || 0) > 0 ? "#b91c1c" : "#166534", fontWeight: 700 }}>
                  <strong>Outstanding Balance:</strong> ₹{(checkoutModalBooking.outstandingAmount || 0).toFixed(2)}
                </p>
              </div>
            </div>

            <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 1.25rem", lineHeight: 1.4 }}>
              Confirming checkout will mark this stay completed, invalidate remaining reminder notifications, and trigger the customer thank-you communication.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => setCheckoutModalBooking(null)}
                style={{
                  padding: "0.5rem 1rem",
                  background: "#f1f5f9",
                  color: "#475467",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={actionLoading}
                onClick={() => handleCheckOut(checkoutModalBooking._id)}
                style={{
                  padding: "0.5rem 1.25rem",
                  background: "#6b21a8",
                  color: "#fff",
                  border: "none",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {actionLoading ? "Processing..." : "Confirm Checkout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
