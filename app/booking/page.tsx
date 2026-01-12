"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "../components/Header";

interface BookingData {
  homestay: any;
  room: any;
  checkin: string;
  checkout: string;
  guests: number;
  nights: number;
  basePrice: number;
  taxes: number;
  platformFee: number;
  totalPrice: number;
}

export default function BookingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [guestDetails, setGuestDetails] = useState({
    name: "",
    email: "",
    phone: "",
    specialRequests: "",
  });
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadBookingData();
  }, []);

  const loadBookingData = async () => {
    try {
      const homestayId = searchParams.get("homestayId");
      const roomId = searchParams.get("roomId");
      const checkin = searchParams.get("checkin");
      const checkout = searchParams.get("checkout");
      const guests = searchParams.get("guests");

      if (!homestayId || !roomId || !checkin || !checkout) {
        alert("Missing booking information");
        router.push("/homestays");
        return;
      }

      // Fetch homestay details
      const response = await fetch(`/api/homestays?id=${homestayId}`);
      if (!response.ok) throw new Error("Failed to fetch homestay");

      const homestay = await response.json();
      const room = homestay.rooms?.find((r: any) => r.id === roomId);

      if (!room) {
        alert("Room not found");
        router.push(`/homestays/${homestayId}`);
        return;
      }

      // Calculate prices
      const checkinDate = new Date(checkin);
      const checkoutDate = new Date(checkout);
      const nights = Math.ceil(
        (checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      const basePrice = room.price * nights;
      const taxes = basePrice * 0.12;
      const platformFee = basePrice * 0.05;
      const totalPrice = basePrice + taxes + platformFee;

      setBookingData({
        homestay,
        room,
        checkin,
        checkout,
        guests: parseInt(guests || "1"),
        nights,
        basePrice,
        taxes,
        platformFee,
        totalPrice,
      });
    } catch (error) {
      console.error("Error loading booking data:", error);
      alert("Failed to load booking information");
      router.push("/homestays");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!guestDetails.name || !guestDetails.email || !guestDetails.phone) {
      alert("Please fill in all required fields");
      return;
    }

    if (!bookingData) return;

    setProcessing(true);

    try {
      // Create booking
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          homestayId: bookingData.homestay._id,
          roomId: bookingData.room.id,
          guestName: guestDetails.name,
          guestEmail: guestDetails.email,
          guestPhone: guestDetails.phone,
          specialRequests: guestDetails.specialRequests,
          checkin: bookingData.checkin,
          checkout: bookingData.checkout,
          guests: bookingData.guests,
          basePrice: bookingData.room.price,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create booking");
      }

      const booking = await response.json();

      // Redirect to payment (for now, just confirmation)
      router.push(`/booking/confirm?bookingId=${booking._id}`);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      alert(error.message || "Failed to create booking");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header />
        <div style={{ padding: "3rem", textAlign: "center" }}>
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  if (!bookingData) return null;

  return (
    <div>
      <Header />

      <div
        style={{
          maxWidth: "1200px",
          margin: "2rem auto",
          padding: "0 1.5rem",
        }}
      >
        <h1
          style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "2rem" }}
        >
          Confirm Your Booking
        </h1>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 400px",
            gap: "2rem",
          }}
        >
          {/* Left: Guest Details */}
          <div>
            <div
              style={{
                background: "white",
                borderRadius: "0.5rem",
                padding: "2rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                marginBottom: "1.5rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  marginBottom: "1.5rem",
                }}
              >
                Guest Details
              </h2>

              <div style={{ display: "grid", gap: "1rem" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                    }}
                  >
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={guestDetails.name}
                    onChange={(e) =>
                      setGuestDetails({ ...guestDetails, name: e.target.value })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "0.375rem",
                      fontSize: "1rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                    }}
                  >
                    Email *
                  </label>
                  <input
                    type="email"
                    value={guestDetails.email}
                    onChange={(e) =>
                      setGuestDetails({
                        ...guestDetails,
                        email: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "0.375rem",
                      fontSize: "1rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                    }}
                  >
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={guestDetails.phone}
                    onChange={(e) =>
                      setGuestDetails({
                        ...guestDetails,
                        phone: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "0.375rem",
                      fontSize: "1rem",
                    }}
                  />
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: "500",
                    }}
                  >
                    Special Requests (Optional)
                  </label>
                  <textarea
                    value={guestDetails.specialRequests}
                    onChange={(e) =>
                      setGuestDetails({
                        ...guestDetails,
                        specialRequests: e.target.value,
                      })
                    }
                    rows={4}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #ddd",
                      borderRadius: "0.375rem",
                      fontSize: "1rem",
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Cancellation Policy */}
            <div
              style={{
                background: "white",
                borderRadius: "0.5rem",
                padding: "2rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "600",
                  marginBottom: "1rem",
                }}
              >
                Cancellation Policy
              </h3>
              <p style={{ color: "#666", lineHeight: "1.6" }}>
                {bookingData.room.cancellationPolicy ||
                  "Free cancellation up to 48 hours before check-in. 50% refund for cancellations within 48 hours."}
              </p>
            </div>
          </div>

          {/* Right: Booking Summary */}
          <div>
            <div
              style={{
                background: "white",
                borderRadius: "0.5rem",
                padding: "2rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                position: "sticky",
                top: "2rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: "600",
                  marginBottom: "1.5rem",
                }}
              >
                Booking Summary
              </h2>

              {/* Homestay Info */}
              <div
                style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}
              >
                <img
                  src={bookingData.homestay.image}
                  alt={bookingData.homestay.name}
                  style={{
                    width: "100px",
                    height: "80px",
                    objectFit: "cover",
                    borderRadius: "0.375rem",
                  }}
                />
                <div>
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: "600",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {bookingData.homestay.name}
                  </h3>
                  <p style={{ fontSize: "0.875rem", color: "#666" }}>
                    {bookingData.homestay.location}
                  </p>
                  <p style={{ fontSize: "0.875rem", color: "#666" }}>
                    {bookingData.room.type}
                  </p>
                </div>
              </div>

              <div
                style={{
                  borderTop: "1px solid #eee",
                  paddingTop: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>Check-in:</span>
                  <span style={{ fontWeight: "500" }}>
                    {new Date(bookingData.checkin).toLocaleDateString()}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>Check-out:</span>
                  <span style={{ fontWeight: "500" }}>
                    {new Date(bookingData.checkout).toLocaleDateString()}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>Guests:</span>
                  <span style={{ fontWeight: "500" }}>
                    {bookingData.guests}
                  </span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Nights:</span>
                  <span style={{ fontWeight: "500" }}>
                    {bookingData.nights}
                  </span>
                </div>
              </div>

              {/* Price Breakup */}
              <div
                style={{
                  borderTop: "1px solid #eee",
                  paddingTop: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>
                    ₹{bookingData.room.price} × {bookingData.nights} nights
                  </span>
                  <span>₹{bookingData.basePrice.toFixed(2)}</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>Taxes (12%)</span>
                  <span>₹{bookingData.taxes.toFixed(2)}</span>
                </div>
                <div
                  style={{ display: "flex", justifyContent: "space-between" }}
                >
                  <span>Platform Fee</span>
                  <span>₹{bookingData.platformFee.toFixed(2)}</span>
                </div>
              </div>

              {/* Total */}
              <div
                style={{
                  borderTop: "2px solid #eee",
                  paddingTop: "1rem",
                  marginBottom: "1.5rem",
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
                  <span>Total</span>
                  <span style={{ color: "#0a66c2" }}>
                    ₹{bookingData.totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Confirm Button */}
              <button
                onClick={handleConfirmBooking}
                disabled={processing}
                style={{
                  width: "100%",
                  padding: "1rem",
                  backgroundColor: processing ? "#ccc" : "#0a66c2",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: processing ? "not-allowed" : "pointer",
                }}
              >
                {processing ? "Processing..." : "Confirm & Pay"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
