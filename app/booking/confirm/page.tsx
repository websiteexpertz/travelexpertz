"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "../../components/Header";

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
  bookingStatus: string;
  homestay: any;
  room: any;
}

export default function BookingConfirmation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    loadBooking();
  }, []);

  const loadBooking = async () => {
    try {
      const bookingId = searchParams.get("bookingId");

      if (!bookingId) {
        router.push("/");
        return;
      }

      const response = await fetch(`/api/bookings?id=${bookingId}`);
      if (!response.ok) throw new Error("Failed to fetch booking");

      const data = await response.json();
      setBooking(data);
    } catch (error) {
      console.error("Error loading booking:", error);
      alert("Failed to load booking details");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ padding: "3rem", textAlign: "center" }}>
          <p>Loading booking confirmation...</p>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div>
        <Header />
        <div style={{ padding: "3rem", textAlign: "center" }}>
          <p>Booking not found</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />

      <div
        style={{
          maxWidth: "800px",
          margin: "3rem auto",
          padding: "0 1.5rem",
        }}
      >
        {/* Success Icon */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              backgroundColor: "#22c55e",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1rem",
              fontSize: "2.5rem",
              color: "white",
            }}
          >
            ✓
          </div>
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: "bold",
              marginBottom: "0.5rem",
            }}
          >
            Booking Confirmed!
          </h1>
          <p style={{ fontSize: "1.125rem", color: "#666" }}>
            Your booking has been successfully created
          </p>
        </div>

        {/* Booking Details */}
        <div
          style={{
            background: "white",
            borderRadius: "0.75rem",
            padding: "2rem",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          {/* Booking Reference */}
          <div
            style={{
              background: "#f8f9fa",
              padding: "1rem",
              borderRadius: "0.5rem",
              marginBottom: "2rem",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "0.875rem",
                color: "#666",
                marginBottom: "0.25rem",
              }}
            >
              Booking Reference
            </p>
            <p
              style={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "#0a66c2",
              }}
            >
              {booking.bookingReference}
            </p>
          </div>

          {/* Homestay Info */}
          <div style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "1rem",
              }}
            >
              Homestay Details
            </h2>
            <div style={{ display: "flex", gap: "1rem" }}>
              {booking.homestay?.image && (
                <img
                  src={booking.homestay.image}
                  alt={booking.homestay.name}
                  style={{
                    width: "150px",
                    height: "120px",
                    objectFit: "cover",
                    borderRadius: "0.5rem",
                  }}
                />
              )}
              <div>
                <h3
                  style={{
                    fontSize: "1.125rem",
                    fontWeight: "600",
                    marginBottom: "0.5rem",
                  }}
                >
                  {booking.homestay?.name || "Homestay"}
                </h3>
                <p style={{ color: "#666", marginBottom: "0.25rem" }}>
                  📍 {booking.homestay?.location}
                </p>
                <p style={{ color: "#666" }}>
                  🏡 Room Type: {booking.room?.type || "Standard Room"}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Info */}
          <div style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "1rem",
              }}
            >
              Booking Information
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "1rem",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#666",
                    marginBottom: "0.25rem",
                  }}
                >
                  Check-in
                </p>
                <p style={{ fontWeight: "500" }}>
                  {new Date(booking.checkin).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#666",
                    marginBottom: "0.25rem",
                  }}
                >
                  Check-out
                </p>
                <p style={{ fontWeight: "500" }}>
                  {new Date(booking.checkout).toLocaleDateString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#666",
                    marginBottom: "0.25rem",
                  }}
                >
                  Guests
                </p>
                <p style={{ fontWeight: "500" }}>{booking.guests}</p>
              </div>
              <div>
                <p
                  style={{
                    fontSize: "0.875rem",
                    color: "#666",
                    marginBottom: "0.25rem",
                  }}
                >
                  Nights
                </p>
                <p style={{ fontWeight: "500" }}>{booking.nights}</p>
              </div>
            </div>
          </div>

          {/* Guest Details */}
          <div style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.25rem",
                fontWeight: "600",
                marginBottom: "1rem",
              }}
            >
              Guest Details
            </h2>
            <p style={{ marginBottom: "0.5rem" }}>
              <strong>Name:</strong> {booking.guestName}
            </p>
            <p style={{ marginBottom: "0.5rem" }}>
              <strong>Email:</strong> {booking.guestEmail}
            </p>
            <p>
              <strong>Phone:</strong> {booking.guestPhone}
            </p>
          </div>

          {/* Payment Summary */}
          <div
            style={{
              borderTop: "2px solid #eee",
              paddingTop: "1rem",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontSize: "1.25rem",
                fontWeight: "bold",
              }}
            >
              <span>Total Paid</span>
              <span style={{ color: "#22c55e" }}>
                ₹{booking.totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div
          style={{
            background: "#e3f2fd",
            borderRadius: "0.5rem",
            padding: "1.5rem",
            marginTop: "2rem",
          }}
        >
          <h3
            style={{
              fontSize: "1.125rem",
              fontWeight: "600",
              marginBottom: "1rem",
              color: "#0d47a1",
            }}
          >
            What's Next?
          </h3>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              color: "#1565c0",
            }}
          >
            <li
              style={{
                marginBottom: "0.5rem",
                paddingLeft: "1.5rem",
                position: "relative",
              }}
            >
              <span style={{ position: "absolute", left: 0 }}>✓</span>A
              confirmation email has been sent to {booking.guestEmail}
            </li>
            <li
              style={{
                marginBottom: "0.5rem",
                paddingLeft: "1.5rem",
                position: "relative",
              }}
            >
              <span style={{ position: "absolute", left: 0 }}>✓</span>
              The host will contact you shortly
            </li>
            <li style={{ paddingLeft: "1.5rem", position: "relative" }}>
              <span style={{ position: "absolute", left: 0 }}>✓</span>
              Keep your booking reference handy for check-in
            </li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "2rem",
            justifyContent: "center",
          }}
        >
          <button
            onClick={() => router.push("/")}
            style={{
              padding: "0.75rem 2rem",
              backgroundColor: "#0a66c2",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Back to Home
          </button>
          <button
            onClick={() => window.print()}
            style={{
              padding: "0.75rem 2rem",
              backgroundColor: "white",
              color: "#0a66c2",
              border: "2px solid #0a66c2",
              borderRadius: "0.5rem",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: "pointer",
            }}
          >
            Print Invoice
          </button>
        </div>
      </div>
    </div>
  );
}
