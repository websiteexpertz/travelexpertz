"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";

interface Booking {
  _id: string;
  bookingId: string;
  propertyName: string;
  propertyType: string;
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  createdAt: string;
}

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "upcoming" | "completed" | "cancelled" | "all"
  >("all");

  useEffect(() => {
    fetchBookings();
  }, [filter]);

  const fetchBookings = async () => {
    try {
      const url =
        filter === "all"
          ? "/api/user/bookings"
          : `/api/user/bookings?status=${filter}`;
      const response = await fetch(url, {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setBookings(data.bookings);
      } else if (response.status === 401) {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return { bg: "#dcfce7", color: "#166534" };
      case "completed":
        return { bg: "#dbeafe", color: "#1e40af" };
      case "cancelled":
        return { bg: "#fee2e2", color: "#991b1b" };
      case "pending":
        return { bg: "#fef3c7", color: "#92400e" };
      default:
        return { bg: "#f3f4f6", color: "#6b7280" };
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return { bg: "#dcfce7", color: "#166534" };
      case "pending":
        return { bg: "#fef3c7", color: "#92400e" };
      case "failed":
        return { bg: "#fee2e2", color: "#991b1b" };
      case "refunded":
        return { bg: "#dbeafe", color: "#1e40af" };
      default:
        return { bg: "#f3f4f6", color: "#6b7280" };
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div
          style={{
            minHeight: "100vh",
            background: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p>Loading bookings...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          paddingTop: "2rem",
          paddingBottom: "4rem",
        }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}
        >
          <h1 style={{ margin: "0 0 2rem", fontSize: "2rem", fontWeight: 700 }}>
            My Bookings
          </h1>

          {/* Filter Tabs */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "2rem",
              flexWrap: "wrap",
            }}
          >
            {[
              { value: "all", label: "All Bookings" },
              { value: "upcoming", label: "Upcoming" },
              { value: "completed", label: "Completed" },
              { value: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilter(tab.value as any)}
                style={{
                  padding: "0.75rem 1.5rem",
                  background: filter === tab.value ? "#0066cc" : "white",
                  color: filter === tab.value ? "white" : "#1f2937",
                  border: filter === tab.value ? "none" : "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                  fontSize: "0.95rem",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Bookings List */}
          {bookings.length === 0 ? (
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "3rem",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📅</div>
              <h3
                style={{
                  margin: "0 0 0.5rem",
                  fontSize: "1.3rem",
                  fontWeight: 600,
                }}
              >
                No Bookings Found
              </h3>
              <p style={{ margin: "0", color: "#6b7280" }}>
                {filter === "all"
                  ? "You haven't made any bookings yet."
                  : `No ${filter} bookings.`}
              </p>
              <a href="/">
                <button
                  style={{
                    marginTop: "1.5rem",
                    padding: "0.75rem 2rem",
                    background: "#0066cc",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Explore Properties
                </button>
              </a>
            </div>
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {bookings.map((booking) => {
                const statusStyle = getStatusColor(booking.bookingStatus);
                const paymentStyle = getPaymentStatusColor(
                  booking.paymentStatus
                );

                return (
                  <div
                    key={booking._id}
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      border: "1px solid #e5e7eb",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "start",
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <h3
                          style={{
                            margin: "0 0 0.5rem",
                            fontSize: "1.2rem",
                            fontWeight: 700,
                          }}
                        >
                          {booking.propertyName}
                        </h3>
                        <p
                          style={{
                            margin: "0",
                            color: "#6b7280",
                            fontSize: "0.9rem",
                          }}
                        >
                          📍 {booking.city} •{" "}
                          {booking.propertyType === "hotel"
                            ? "🏨"
                            : booking.propertyType === "homestay"
                            ? "🏡"
                            : "📦"}{" "}
                          {booking.propertyType}
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#6b7280",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Booking ID: <strong>{booking.bookingId}</strong>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            justifyContent: "flex-end",
                          }}
                        >
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              background: statusStyle.bg,
                              color: statusStyle.color,
                              borderRadius: "12px",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              textTransform: "capitalize",
                            }}
                          >
                            {booking.bookingStatus}
                          </span>
                          <span
                            style={{
                              padding: "0.25rem 0.75rem",
                              background: paymentStyle.bg,
                              color: paymentStyle.color,
                              borderRadius: "12px",
                              fontSize: "0.8rem",
                              fontWeight: 600,
                              textTransform: "capitalize",
                            }}
                          >
                            {booking.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(150px, 1fr))",
                        gap: "1rem",
                        padding: "1rem 0",
                        borderTop: "1px solid #f3f4f6",
                        borderBottom: "1px solid #f3f4f6",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#6b7280",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Check-in
                        </div>
                        <div style={{ fontWeight: 600 }}>
                          {formatDate(booking.checkIn)}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#6b7280",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Check-out
                        </div>
                        <div style={{ fontWeight: 600 }}>
                          {formatDate(booking.checkOut)}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#6b7280",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Guests
                        </div>
                        <div style={{ fontWeight: 600 }}>
                          {booking.guests} Guests
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#6b7280",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Rooms
                        </div>
                        <div style={{ fontWeight: 600 }}>
                          {booking.rooms} Room(s)
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "#6b7280",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Total Amount
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#0066cc",
                            fontSize: "1.1rem",
                          }}
                        >
                          {formatCurrency(booking.totalAmount)}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: "1rem",
                        fontSize: "0.8rem",
                        color: "#9ca3af",
                      }}
                    >
                      Booked on {formatDate(booking.createdAt)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
