"use client";

import { useState } from "react";

type ServiceType =
  | "car-rental"
  | "flight"
  | "bus"
  | "train"
  | "visa"
  | "forex"
  | "insurance";

interface ServiceBookingFormProps {
  serviceType: ServiceType;
  onClose?: () => void;
}

const serviceConfig: Record<
  ServiceType,
  { icon: string; title: string; color: string; gradient: string }
> = {
  "car-rental": {
    icon: "🚗",
    title: "Car Rental",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
  },
  flight: {
    icon: "✈️",
    title: "Flight",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
  },
  bus: {
    icon: "🚌",
    title: "Bus",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
  },
  train: {
    icon: "🚄",
    title: "Train",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
  },
  visa: {
    icon: "📋",
    title: "Visa",
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
  },
  forex: {
    icon: "💱",
    title: "Forex",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
  },
  insurance: {
    icon: "🛡️",
    title: "Insurance",
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
  },
};

export default function ServiceBookingFormSimple({
  serviceType,
  onClose,
}: ServiceBookingFormProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    fullName: "",
    mobile: "",
    email: "",
    travelDate: "",
    destination: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const config = serviceConfig[serviceType];
  const today = new Date().toISOString().split("T")[0];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!formData.mobile.trim() || formData.mobile.length < 10) {
      setError("Please enter a valid mobile number");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          serviceType,
        }),
      });

      if (response.ok) {
        alert("Booking request submitted successfully!");
        onClose?.();
      } else {
        setError("Failed to submit booking request");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error submitting booking request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        background: "white",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: config.gradient,
          color: "white",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>
          {config.icon}
        </div>
        <h2
          style={{
            margin: "0 0 0.5rem 0",
            fontSize: "1.75rem",
            fontWeight: "700",
          }}
        >
          {config.title} Booking
        </h2>
        <p style={{ margin: 0, opacity: 0.95 }}>
          Fill in your details to book now
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} style={{ padding: "2rem" }}>
        {error && (
          <div
            style={{
              padding: "1rem",
              background: "#fee2e2",
              color: "#991b1b",
              borderLeft: "4px solid #ef4444",
              borderRadius: "8px",
              marginBottom: "1.5rem",
              fontSize: "0.9rem",
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: Personal Info */}
        {step === 1 && (
          <div>
            <h3
              style={{
                marginBottom: "1.5rem",
                color: "#1f2937",
                fontSize: "1.125rem",
              }}
            >
              📝 Your Information
            </h3>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Mobile Number *
              </label>
              <input
                type="tel"
                name="mobile"
                value={formData.mobile}
                onChange={handleChange}
                placeholder="Enter your mobile number"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (formData.fullName && formData.mobile && formData.email) {
                  setStep(2);
                } else {
                  setError("Please fill in all fields");
                }
              }}
              style={{
                width: "100%",
                padding: "1rem",
                background: config.gradient,
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
              }}
            >
              Continue to Details →
            </button>
          </div>
        )}

        {/* Step 2: Trip Details */}
        {step === 2 && (
          <div>
            <h3
              style={{
                marginBottom: "1.5rem",
                color: "#1f2937",
                fontSize: "1.125rem",
              }}
            >
              📅 {config.title} Details
            </h3>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Travel Date
              </label>
              <input
                type="date"
                name="travelDate"
                value={formData.travelDate}
                onChange={handleChange}
                min={today}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "1.5rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Destination / Route
              </label>
              <input
                type="text"
                name="destination"
                value={formData.destination}
                onChange={handleChange}
                placeholder={`e.g., ${serviceType === "flight" ? "New York, USA" : "Destination"}`}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "2rem" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "0.5rem",
                  fontWeight: "600",
                  color: "#374151",
                }}
              >
                Special Requests / Notes
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Any special requirements or preferences..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  boxSizing: "border-box",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "1rem",
              }}
            >
              <button
                type="button"
                onClick={() => setStep(1)}
                style={{
                  padding: "1rem 2rem",
                  background: "white",
                  color: "#6b7280",
                  border: "2px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: "pointer",
                }}
              >
                ← Back
              </button>
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "1rem 2rem",
                  background: config.gradient,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "1rem",
                  fontWeight: "600",
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                }}
              >
                {loading ? "Submitting..." : "Submit Request →"}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
