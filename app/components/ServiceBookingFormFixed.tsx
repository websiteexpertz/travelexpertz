"use client";

import { useState, useCallback, useMemo, memo } from "react";

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

// Memoized Input Field
const InputField = memo(
  ({
    icon,
    label,
    name,
    type = "text",
    required = false,
    placeholder = "",
    value = "",
    min,
    max,
    onChange,
  }: any) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        marginBottom: "1rem",
      }}
    >
      <label
        style={{
          fontWeight: "600",
          color: "#374151",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span>{icon}</span>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        style={{
          padding: "0.75rem 1rem",
          border: "2px solid #e5e7eb",
          borderRadius: "8px",
          fontSize: "1rem",
          fontFamily: "inherit",
        }}
      />
    </div>
  ),
);

// Memoized Select Field
const SelectField = memo(
  ({
    icon,
    label,
    name,
    required = false,
    options = [],
    value = "",
    onChange,
  }: any) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        marginBottom: "1rem",
      }}
    >
      <label
        style={{
          fontWeight: "600",
          color: "#374151",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span>{icon}</span>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        style={{
          padding: "0.75rem 1rem",
          border: "2px solid #e5e7eb",
          borderRadius: "8px",
          fontSize: "1rem",
          fontFamily: "inherit",
          backgroundColor: "white",
          cursor: "pointer",
        }}
      >
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  ),
);

// Memoized Textarea Field
const TextareaField = memo(
  ({
    icon,
    label,
    name,
    required = false,
    placeholder = "",
    value = "",
    onChange,
    rows = 3,
  }: any) => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.5rem",
        marginBottom: "1rem",
      }}
    >
      <label
        style={{
          fontWeight: "600",
          color: "#374151",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <span>{icon}</span>
        {label} {required && <span style={{ color: "#ef4444" }}>*</span>}
      </label>
      <textarea
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        style={{
          padding: "0.75rem 1rem",
          border: "2px solid #e5e7eb",
          borderRadius: "8px",
          fontSize: "1rem",
          fontFamily: "inherit",
          minHeight: "100px",
          resize: "vertical",
        }}
      />
    </div>
  ),
);

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

export default function ServiceBookingFormFixed({
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
    passengers: "",
    carType: "",
    acRequired: "",
    visaType: "",
    fromCountry: "",
    toCountry: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const config = serviceConfig[serviceType];
  const today = new Date().toISOString().split("T")[0];

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
      setError("");
    },
    [],
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.fullName.trim()) {
      setError("Please enter your full name");
      return;
    }
    if (!formData.mobile.trim() || formData.mobile.length < 10) {
      setError("Please enter a valid mobile number (10+ digits)");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, serviceType }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          onClose?.();
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to submit booking request");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("Error submitting booking request");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div
        style={{
          padding: "3rem 2rem",
          textAlign: "center",
          background: "white",
          borderRadius: "16px",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>✅</div>
        <h2
          style={{
            marginBottom: "0.5rem",
            color: "#0f172a",
            fontSize: "1.75rem",
          }}
        >
          Booking Submitted!
        </h2>
        <p style={{ color: "#6b7280", marginBottom: "2rem" }}>
          We'll contact you shortly at {formData.mobile}
        </p>
        <button
          onClick={onClose}
          style={{
            padding: "1rem 2rem",
            background: config.gradient,
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Close
        </button>
      </div>
    );
  }

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
        <div style={{ fontSize: "3rem", marginBottom: "0.5rem" }}>
          {config.icon}
        </div>
        <h2
          style={{
            margin: "0 0 0.5rem 0",
            fontSize: "1.75rem",
            fontWeight: "700",
          }}
        >
          {config.title} Booking - Step {step} of 2
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
            }}
          >
            ⚠️ {error}
          </div>
        )}

        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div>
            <h3 style={{ marginBottom: "1.5rem", color: "#1f2937" }}>
              📝 Your Information
            </h3>

            <InputField
              icon="👤"
              label="Full Name"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
            />

            <InputField
              icon="📱"
              label="Mobile Number"
              name="mobile"
              type="tel"
              value={formData.mobile}
              onChange={handleChange}
              placeholder="10-digit mobile number"
              required
            />

            <InputField
              icon="📧"
              label="Email Address"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "1rem",
                marginTop: "2rem",
              }}
            >
              <button
                type="button"
                onClick={() => setStep(2)}
                style={{
                  padding: "1rem 2rem",
                  background: config.gradient,
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Service Details */}
        {step === 2 && (
          <div>
            <h3 style={{ marginBottom: "1.5rem", color: "#1f2937" }}>
              📅 {config.title} Details
            </h3>

            <InputField
              icon="📅"
              label="Travel Date"
              name="travelDate"
              type="date"
              value={formData.travelDate}
              onChange={handleChange}
              min={today}
            />

            <InputField
              icon="📍"
              label="Destination / Route"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="Enter destination"
            />

            {/* Service-specific fields */}
            {serviceType === "car-rental" && (
              <>
                <InputField
                  icon="👥"
                  label="Number of Passengers"
                  name="passengers"
                  type="number"
                  value={formData.passengers}
                  onChange={handleChange}
                  min={1}
                />
                <SelectField
                  icon="🚙"
                  label="Car Type"
                  name="carType"
                  value={formData.carType}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "Select car type" },
                    { value: "hatchback", label: "🚗 Hatchback" },
                    { value: "sedan", label: "🚘 Sedan" },
                    { value: "suv", label: "🚙 SUV" },
                    { value: "luxury", label: "🏎️ Luxury" },
                  ]}
                />
                <SelectField
                  icon="❄️"
                  label="AC Required"
                  name="acRequired"
                  value={formData.acRequired}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "Select option" },
                    { value: "yes", label: "✅ Yes" },
                    { value: "no", label: "❌ No" },
                  ]}
                />
              </>
            )}

            {serviceType === "flight" && (
              <>
                <InputField
                  icon="👥"
                  label="Number of Passengers"
                  name="passengers"
                  type="number"
                  value={formData.passengers}
                  onChange={handleChange}
                  min={1}
                />
              </>
            )}

            {serviceType === "visa" && (
              <>
                <SelectField
                  icon="📋"
                  label="Visa Type"
                  name="visaType"
                  value={formData.visaType}
                  onChange={handleChange}
                  options={[
                    { value: "", label: "Select visa type" },
                    { value: "tourist", label: "🎒 Tourist" },
                    { value: "business", label: "💼 Business" },
                    { value: "student", label: "🎓 Student" },
                    { value: "work", label: "💼 Work" },
                  ]}
                />
              </>
            )}

            <TextareaField
              icon="📝"
              label="Special Requests / Notes"
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder="Any special requirements..."
            />

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "auto 1fr",
                gap: "1rem",
                marginTop: "2rem",
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
                  cursor: "pointer",
                  fontWeight: "600",
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
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.6 : 1,
                  fontWeight: "600",
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
