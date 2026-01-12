"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface BookingCardProps {
  homestayId: string;
  basePrice: number;
  rating: number;
  reviews: number;
  rooms: any[];
}

export default function BookingCard({
  homestayId,
  basePrice,
  rating,
  reviews,
  rooms,
}: BookingCardProps) {
  const router = useRouter();
  const [checkin, setCheckin] = useState("");
  const [checkout, setCheckout] = useState("");
  const [guests, setGuests] = useState(2);
  const [selectedRoom, setSelectedRoom] = useState("");

  const handleBookNow = () => {
    if (!checkin || !checkout) {
      alert("Please select check-in and check-out dates");
      return;
    }

    if (!selectedRoom && rooms.length > 0) {
      alert("Please select a room");
      return;
    }

    const roomId = selectedRoom || rooms[0]?.id;

    router.push(
      `/booking?homestayId=${homestayId}&roomId=${roomId}&checkin=${checkin}&checkout=${checkout}&guests=${guests}`
    );
  };

  const calculateNights = () => {
    if (!checkin || !checkout) return 0;
    const start = new Date(checkin);
    const end = new Date(checkout);
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const nights = calculateNights();
  const totalPrice = basePrice * nights;

  return (
    <div
      style={{
        background: "white",
        borderRadius: "0.75rem",
        padding: "1.5rem",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        border: "1px solid #e5e7eb",
        position: "sticky",
        top: "2rem",
      }}
    >
      {/* Price */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.75rem", fontWeight: "bold" }}>
            ₹{basePrice.toLocaleString()}
          </span>
          <span style={{ color: "#666" }}>/ night</span>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "0.5rem",
          }}
        >
          <span style={{ color: "#f59e0b", fontWeight: "600" }}>
            ⭐ {rating}
          </span>
          <span style={{ color: "#666", fontSize: "0.875rem" }}>
            ({reviews} reviews)
          </span>
        </div>
      </div>

      {/* Dates */}
      <div style={{ marginBottom: "1rem" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5rem",
            border: "1px solid #ddd",
            borderRadius: "0.5rem",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "0.75rem", borderRight: "1px solid #ddd" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: "600",
                marginBottom: "0.25rem",
              }}
            >
              CHECK-IN
            </label>
            <input
              type="date"
              value={checkin}
              onChange={(e) => setCheckin(e.target.value)}
              min={new Date().toISOString().split("T")[0]}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "0.875rem",
              }}
            />
          </div>
          <div style={{ padding: "0.75rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: "600",
                marginBottom: "0.25rem",
              }}
            >
              CHECKOUT
            </label>
            <input
              type="date"
              value={checkout}
              onChange={(e) => setCheckout(e.target.value)}
              min={checkin || new Date().toISOString().split("T")[0]}
              style={{
                border: "none",
                outline: "none",
                width: "100%",
                fontSize: "0.875rem",
              }}
            />
          </div>
        </div>
      </div>

      {/* Guests */}
      <div style={{ marginBottom: "1.5rem" }}>
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "0.5rem",
            padding: "0.75rem",
          }}
        >
          <label
            style={{
              display: "block",
              fontSize: "0.75rem",
              fontWeight: "600",
              marginBottom: "0.25rem",
            }}
          >
            GUESTS
          </label>
          <select
            value={guests}
            onChange={(e) => setGuests(parseInt(e.target.value))}
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? "guest" : "guests"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Room Selection */}
      {rooms && rooms.length > 0 && (
        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.875rem",
              fontWeight: "600",
              marginBottom: "0.5rem",
            }}
          >
            Select Room
          </label>
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            style={{
              width: "100%",
              padding: "0.75rem",
              border: "1px solid #ddd",
              borderRadius: "0.5rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            <option value="">Choose a room...</option>
            {rooms.map((room) => (
              <option key={room.id} value={room.id}>
                {room.type} - ₹{room.price}/night
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Book Button */}
      <button
        onClick={handleBookNow}
        style={{
          width: "100%",
          padding: "1rem",
          backgroundColor: "#e11d48",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          fontSize: "1rem",
          fontWeight: "600",
          cursor: "pointer",
          transition: "background-color 0.2s",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = "#be123c";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#e11d48";
        }}
      >
        Reserve
      </button>

      {/* Price Breakdown */}
      {nights > 0 && (
        <div
          style={{
            marginTop: "1.5rem",
            paddingTop: "1.5rem",
            borderTop: "1px solid #e5e7eb",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            <span>
              ₹{basePrice} × {nights} nights
            </span>
            <span>₹{totalPrice.toLocaleString()}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
            }}
          >
            <span>Service fee</span>
            <span>₹{Math.round(totalPrice * 0.05).toLocaleString()}</span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              paddingTop: "0.75rem",
              borderTop: "1px solid #e5e7eb",
              fontWeight: "600",
            }}
          >
            <span>Total</span>
            <span>₹{Math.round(totalPrice * 1.05).toLocaleString()}</span>
          </div>
        </div>
      )}

      <p
        style={{
          fontSize: "0.75rem",
          color: "#666",
          textAlign: "center",
          marginTop: "1rem",
        }}
      >
        You won't be charged yet
      </p>
    </div>
  );
}
