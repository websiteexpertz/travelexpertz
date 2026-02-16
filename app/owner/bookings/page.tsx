"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Booking {
  _id: string;
  guestName: string;
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
  bookingStatus: string;
  createdAt: string;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "confirmed" | "pending" | "cancelled"
  >("all");

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
                      Booking ID: {booking._id.slice(0, 8)}...
                    </p>
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "0.35rem 0.75rem",
                      borderRadius: "6px",
                      background: statusInfo.bg,
                      color: statusInfo.color,
                      fontWeight: 600,
                      fontSize: "0.8rem",
                    }}
                  >
                    {statusInfo.label}
                  </span>
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

                {/* Price */}
                <div style={{ padding: "1rem" }}>
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
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
