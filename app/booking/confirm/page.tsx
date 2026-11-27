"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";
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
  amountToPay?: number;
  bookingStatus: string;
  paymentStatus: string;
  homestay?: any;
  hotel?: any;
  room?: any;
}

function BookingConfirmationContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [booking, setBooking] = useState<Booking | null>(null);

  useEffect(() => {
    loadBooking();
  }, []);

  const loadBooking = async () => {
    try {
      const bookingId = searchParams.get("bookingId");
      const orderId = searchParams.get("order_id");

      if (!bookingId) {
        router.push("/");
        return;
      }

      if (orderId) {
        try {
          await fetch("/api/payments/cashfree/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ bookingId }),
          });
        } catch (verifyErr) {
          console.error("Verification error:", verifyErr);
        }
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

  const handleRetryPayment = async () => {
    if (!booking) return;
    try {
      setRetrying(true);
      const orderResponse = await fetch("/api/payments/cashfree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking._id }),
      });

      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.error || "Failed to initialize payment");
      }

      const orderData = await orderResponse.json();
      if (orderData.mock && orderData.redirectUrl) {
        window.location.href = orderData.redirectUrl;
        return;
      }

      const { paymentSessionId } = orderData;
      const cashfree = await load({
        mode: (process.env.NEXT_PUBLIC_CASHFREE_ENV === "production"
          ? "production"
          : "sandbox") as "sandbox" | "production",
      });

      if (!cashfree) throw new Error("Cashfree checkout could not be loaded");

      await cashfree.checkout({
        paymentSessionId,
        redirectTarget: "_self",
      });
    } catch (error: any) {
      console.error("Error retrying payment:", error);
      alert(error.message || "Failed to restart payment. Please try again.");
    } finally {
      setRetrying(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Header solidHeader={true} />
        <div style={{ padding: "4rem", textAlign: "center" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #e2e8f0",
              borderTopColor: "#0b6dff",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1.5rem",
            }}
          />
          <p style={{ fontSize: "1.1rem", color: "#64748b", fontWeight: 500 }}>
            Verifying payment & loading booking details...
          </p>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div>
        <Header solidHeader={true} />
        <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
          <p style={{ fontSize: "1.2rem", color: "#64748b" }}>Booking not found</p>
          <button
            onClick={() => router.push("/")}
            style={{
              marginTop: "1.5rem",
              padding: "0.75rem 1.75rem",
              backgroundColor: "#0b6dff",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const isPaid =
    booking.paymentStatus === "paid" &&
    (booking.bookingStatus === "confirmed" || booking.bookingStatus === "active");

  const property = booking.hotel || booking.homestay;
  const propertyName =
    property?.name ||
    property?.propertyName ||
    property?.hotelName ||
    "Selected Property";
  const propertyLocation =
    property?.city || property?.location || property?.address || "India";
  const propertyImage =
    property?.image || property?.images?.[0] || property?.thumbnail || "";
  const roomType =
    booking.room?.type || booking.room?.name || "Standard Room";
  const amountDisplay = Number(booking.amountToPay || booking.totalPrice || 0);

  return (
    <div style={{ backgroundColor: "#f8fafc", minHeight: "100vh", paddingBottom: "4rem" }}>
      <Header solidHeader={true} />

      <div
        style={{
          maxWidth: "800px",
          margin: "2.5rem auto",
          padding: "0 1.5rem",
        }}
      >
        {/* Status Header */}
        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div
            style={{
              width: "76px",
              height: "76px",
              borderRadius: "50%",
              backgroundColor: isPaid ? "#22c55e" : "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 1.25rem",
              fontSize: "2.5rem",
              color: "white",
              boxShadow: isPaid
                ? "0 8px 24px rgba(34, 197, 94, 0.25)"
                : "0 8px 24px rgba(245, 158, 11, 0.25)",
            }}
          >
            {isPaid ? "✓" : "!"}
          </div>

          <h1
            style={{
              fontSize: "2.1rem",
              fontWeight: "800",
              color: isPaid ? "#0f172a" : "#b45309",
              marginBottom: "0.5rem",
              letterSpacing: "-0.5px",
            }}
          >
            {isPaid ? "Booking Confirmed!" : "Payment Incomplete / Cancelled"}
          </h1>

          <p style={{ fontSize: "1.05rem", color: "#64748b", maxWidth: "560px", margin: "0 auto" }}>
            {isPaid
              ? "Your booking has been successfully confirmed and payment received."
              : "Your payment was not completed or was cancelled on Cashfree. Your booking is on hold and is not yet confirmed."}
          </p>
        </div>

        {/* Action Warning Card (When Payment Incomplete) */}
        {!isPaid && (
          <div
            style={{
              backgroundColor: "#fffbeb",
              border: "1px solid #fde68a",
              borderRadius: "0.75rem",
              padding: "1.25rem 1.5rem",
              marginBottom: "2rem",
              boxShadow: "0 2px 8px rgba(245, 158, 11, 0.08)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: "1rem" }}>
              <span style={{ fontSize: "1.5rem", lineHeight: 1 }}>⚠️</span>
              <div>
                <h3
                  style={{
                    fontSize: "1rem",
                    fontWeight: "700",
                    color: "#92400e",
                    margin: "0 0 0.25rem",
                  }}
                >
                  Payment Required to Confirm Your Reservation
                </h3>
                <p style={{ fontSize: "0.925rem", color: "#78350f", margin: 0, lineHeight: 1.5 }}>
                  We did not receive a completed payment from Cashfree. Your selected room is held temporarily, but will not be guaranteed until payment is completed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Booking Details Card */}
        <div
          style={{
            background: "white",
            borderRadius: "0.875rem",
            padding: "2rem",
            boxShadow: "0 4px 16px rgba(15, 23, 42, 0.06)",
            border: "1px solid #e2e8f0",
          }}
        >
          {/* Booking Reference Bar */}
          <div
            style={{
              background: "#f8fafc",
              padding: "1.25rem",
              borderRadius: "0.625rem",
              marginBottom: "2rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              border: "1px solid #e2e8f0",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.8rem",
                  color: "#64748b",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  fontWeight: 600,
                  margin: "0 0 0.25rem",
                }}
              >
                Booking Reference
              </p>
              <p
                style={{
                  fontSize: "1.35rem",
                  fontWeight: "800",
                  color: "#0b6dff",
                  margin: 0,
                  letterSpacing: "0.5px",
                }}
              >
                {booking.bookingReference}
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  backgroundColor: isPaid ? "#dcfce7" : "#fef3c7",
                  color: isPaid ? "#15803d" : "#b45309",
                  border: isPaid ? "1px solid #bbf7d0" : "1px solid #fde68a",
                }}
              >
                {isPaid ? "✓ Confirmed & Paid" : "⏳ Payment Pending"}
              </span>
            </div>
          </div>

          {/* Property Info */}
          <div style={{ marginBottom: "2rem" }}>
            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "1rem",
              }}
            >
              Property Details
            </h2>
            <div style={{ display: "flex", gap: "1.25rem", alignItems: "center", flexWrap: "wrap" }}>
              {propertyImage && (
                <img
                  src={propertyImage}
                  alt={propertyName}
                  style={{
                    width: "140px",
                    height: "100px",
                    objectFit: "cover",
                    borderRadius: "0.5rem",
                    border: "1px solid #e2e8f0",
                  }}
                />
              )}
              <div>
                <h3
                  style={{
                    fontSize: "1.15rem",
                    fontWeight: "700",
                    color: "#1e293b",
                    margin: "0 0 0.4rem",
                  }}
                >
                  {propertyName}
                </h3>
                <p style={{ color: "#64748b", margin: "0 0 0.35rem", fontSize: "0.95rem" }}>
                  📍 {propertyLocation}
                </p>
                <p style={{ color: "#0f172a", margin: 0, fontSize: "0.95rem", fontWeight: 500 }}>
                  🏡 Room Type: {roomType}
                </p>
              </div>
            </div>
          </div>

          {/* Booking Info Grid */}
          <div style={{ marginBottom: "2rem", borderTop: "1px solid #f1f5f9", paddingTop: "1.5rem" }}>
            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "1rem",
              }}
            >
              Reservation Information
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                gap: "1.25rem",
              }}
            >
              <div style={{ background: "#f8fafc", padding: "0.85rem", borderRadius: "0.5rem" }}>
                <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 0.25rem" }}>Check-in</p>
                <p style={{ fontWeight: "700", color: "#0f172a", margin: 0, fontSize: "0.95rem" }}>
                  {new Date(booking.checkin).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div style={{ background: "#f8fafc", padding: "0.85rem", borderRadius: "0.5rem" }}>
                <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 0.25rem" }}>Check-out</p>
                <p style={{ fontWeight: "700", color: "#0f172a", margin: 0, fontSize: "0.95rem" }}>
                  {new Date(booking.checkout).toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div style={{ background: "#f8fafc", padding: "0.85rem", borderRadius: "0.5rem" }}>
                <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 0.25rem" }}>Guests</p>
                <p style={{ fontWeight: "700", color: "#0f172a", margin: 0, fontSize: "0.95rem" }}>
                  {booking.guests} Guests
                </p>
              </div>

              <div style={{ background: "#f8fafc", padding: "0.85rem", borderRadius: "0.5rem" }}>
                <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0 0 0.25rem" }}>Duration</p>
                <p style={{ fontWeight: "700", color: "#0f172a", margin: 0, fontSize: "0.95rem" }}>
                  {booking.nights} {booking.nights === 1 ? "Night" : "Nights"}
                </p>
              </div>
            </div>
          </div>

          {/* Guest Details */}
          <div style={{ marginBottom: "2rem", borderTop: "1px solid #f1f5f9", paddingTop: "1.5rem" }}>
            <h2
              style={{
                fontSize: "1.15rem",
                fontWeight: "700",
                color: "#0f172a",
                marginBottom: "1rem",
              }}
            >
              Guest Details
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", fontSize: "0.95rem" }}>
              <p style={{ margin: 0, color: "#475467" }}>
                <strong style={{ color: "#0f172a" }}>Guest Name:</strong> {booking.guestName}
              </p>
              <p style={{ margin: 0, color: "#475467" }}>
                <strong style={{ color: "#0f172a" }}>Email:</strong> {booking.guestEmail}
              </p>
              <p style={{ margin: 0, color: "#475467" }}>
                <strong style={{ color: "#0f172a" }}>Phone:</strong> {booking.guestPhone}
              </p>
            </div>
          </div>

          {/* Payment Summary */}
          <div
            style={{
              borderTop: "2px solid #e2e8f0",
              paddingTop: "1.25rem",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p style={{ margin: 0, fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>
                {isPaid ? "PAYMENT SUMMARY" : "AMOUNT PENDING"}
              </p>
              <p style={{ margin: "2px 0 0", fontSize: "1.1rem", fontWeight: 700, color: "#0f172a" }}>
                {isPaid ? "Total Paid" : "Total Outstanding"}
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <span
                style={{
                  fontSize: "1.6rem",
                  fontWeight: "800",
                  color: isPaid ? "#16a34a" : "#b45309",
                }}
              >
                ₹{amountDisplay.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Next Steps Guidance */}
        {isPaid ? (
          <div
            style={{
              background: "#eff6ff",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              marginTop: "2rem",
              border: "1px solid #bfdbfe",
            }}
          >
            <h3
              style={{
                fontSize: "1.05rem",
                fontWeight: "700",
                marginBottom: "0.75rem",
                color: "#1e3a8a",
              }}
            >
              What's Next?
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#1e40af", fontSize: "0.95rem" }}>
              <li style={{ marginBottom: "0.5rem" }}>
                ✓ An official booking confirmation email has been sent to <strong>{booking.guestEmail}</strong> with your PDF voucher.
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                ✓ The property host has received your reservation details.
              </li>
              <li>
                ✓ Please keep your booking reference handy during check-in.
              </li>
            </ul>
          </div>
        ) : (
          <div
            style={{
              background: "#fef3c7",
              borderRadius: "0.75rem",
              padding: "1.5rem",
              marginTop: "2rem",
              border: "1px solid #fde68a",
            }}
          >
            <h3
              style={{
                fontSize: "1.05rem",
                fontWeight: "700",
                marginBottom: "0.75rem",
                color: "#92400e",
              }}
            >
              Next Steps to Secure Your Stay
            </h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, color: "#78350f", fontSize: "0.95rem" }}>
              <li style={{ marginBottom: "0.5rem" }}>
                • Click the button below to restart your payment via Cashfree (UPI, Cards, or Net Banking).
              </li>
              <li style={{ marginBottom: "0.5rem" }}>
                • Your room is temporarily reserved for you and will be confirmed immediately once payment succeeds.
              </li>
              <li>
                • If amount was debited from your bank, our system will auto-verify within a few minutes.
              </li>
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginTop: "2rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {!isPaid ? (
            <>
              <button
                onClick={handleRetryPayment}
                disabled={retrying}
                style={{
                  padding: "0.85rem 2.25rem",
                  backgroundColor: "#0b6dff",
                  color: "white",
                  border: "none",
                  borderRadius: "0.5rem",
                  fontSize: "1.05rem",
                  fontWeight: "700",
                  cursor: retrying ? "not-allowed" : "pointer",
                  boxShadow: "0 4px 14px rgba(11, 109, 255, 0.3)",
                  opacity: retrying ? 0.7 : 1,
                }}
              >
                {retrying ? "Opening Checkout..." : "Complete Payment Now →"}
              </button>

              <button
                onClick={() => router.push("/")}
                style={{
                  padding: "0.85rem 1.75rem",
                  backgroundColor: "white",
                  color: "#475467",
                  border: "1px solid #d0d5dd",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Back to Home
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => router.push("/")}
                style={{
                  padding: "0.85rem 2rem",
                  backgroundColor: "#0b6dff",
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
                  padding: "0.85rem 2rem",
                  backgroundColor: "white",
                  color: "#0b6dff",
                  border: "2px solid #0b6dff",
                  borderRadius: "0.5rem",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                Print Confirmation
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingConfirmation() {
  return (
    <Suspense
      fallback={
        <div style={{ padding: "4rem", textAlign: "center", color: "#64748b" }}>
          Loading...
        </div>
      }
    >
      <BookingConfirmationContent />
    </Suspense>
  );
}
