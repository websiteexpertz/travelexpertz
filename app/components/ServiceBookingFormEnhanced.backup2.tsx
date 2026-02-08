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

// Input Field Component with Icon - MEMOIZED to prevent re-renders
const InputField = memo(({
  icon,
  label,
  name,
  type = "text",
  required = false,
  placeholder = "",
  value,
  min,
  max,
  maxLength,
  onChange,
}: {
  icon: string;
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
  value?: any;
  min?: string | number;
  max?: string | number;
  maxLength?: number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) => (
  <div className="enhanced-field">
    <label className="field-label">
      <span className="field-icon">{icon}</span>
      {label} {required && <span className="required">*</span>}
    </label>
    <div className="input-wrapper">
      <span className="input-icon">{icon}</span>
      <input
        type={type}
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        min={min}
        max={max}
        maxLength={maxLength}
        className="enhanced-input"
      />
    </div>
  </div>
));

// Select Field Component with Icon - MEMOIZED
const SelectField = memo(({
  icon,
  label,
  name,
  required = false,
  options,
  value,
  onChange,
}: {
  icon: string;
  label: string;
  name: string;
  required?: boolean;
  options: { value: string; label: string }[];
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}) => (
  <div className="enhanced-field">
    <label className="field-label">
      <span className="field-icon">{icon}</span>
      {label} {required && <span className="required">*</span>}
    </label>
    <div className="input-wrapper select-wrapper">
      <span className="input-icon">{icon}</span>
      <select
        name={name}
        value={value || ""}
        onChange={onChange}
        required={required}
        className="enhanced-select"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <span className="select-arrow">▼</span>
    </div>
  </div>
));

// Textarea Field Component - MEMOIZED
const TextareaField = memo(({
  icon,
  label,
  name,
  required = false,
  placeholder = "",
  rows = 3,
  value,
  onChange,
}: {
  icon: string;
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
  value?: any;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) => (
  <div className="enhanced-field full-width">
    <label className="field-label">
      <span className="field-icon">{icon}</span>
      {label} {required && <span className="required">*</span>}
    </label>
    <div className="textarea-wrapper">
      <span className="textarea-icon">{icon}</span>
      <textarea
        name={name}
        value={value || ""}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
        className="enhanced-textarea"
      />
    </div>
  </div>
));

const serviceConfig: Record<
  ServiceType,
  {
    title: string;
    icon: string;
    color: string;
    gradient: string;
    lightBg: string;
  }
> = {
  "car-rental": {
    title: "Car Rental Booking",
    icon: "🚗",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
    lightBg: "rgba(59, 130, 246, 0.08)",
  },
  flight: {
    title: "Flight Booking",
    icon: "✈️",
    color: "#8b5cf6",
    gradient: "linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)",
    lightBg: "rgba(139, 92, 246, 0.08)",
  },
  bus: {
    title: "Bus Ticket Booking",
    icon: "🚌",
    color: "#10b981",
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    lightBg: "rgba(16, 185, 129, 0.08)",
  },
  train: {
    title: "Train Ticket Booking",
    icon: "🚄",
    color: "#f59e0b",
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    lightBg: "rgba(245, 158, 11, 0.08)",
  },
  visa: {
    title: "Visa Application",
    icon: "📋",
    color: "#ef4444",
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    lightBg: "rgba(239, 68, 68, 0.08)",
  },
  forex: {
    title: "Forex & Currency Exchange",
    icon: "💱",
    color: "#06b6d4",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)",
    lightBg: "rgba(6, 182, 212, 0.08)",
  },
  insurance: {
    title: "Travel Insurance",
    icon: "🛡️",
    color: "#ec4899",
    gradient: "linear-gradient(135deg, #ec4899 0%, #db2777 100%)",
    lightBg: "rgba(236, 72, 153, 0.08)",
  },
};

export default function ServiceBookingFormEnhanced({
  serviceType,
  onClose,
}: ServiceBookingFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({
    serviceType,
    fullName: "",
    mobile: "",
    email: "",
    message: "",
    agreeContact: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const today = new Date().toISOString().split("T")[0];
  const config = serviceConfig[serviceType];

  const handleChange = useCallback(
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      const { name, value, type } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]:
          type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
      }));
      setError("");
    },
    [],
  );

  const validateStep1 = () => {
    if (!formData.fullName?.trim()) {
      setError("Please enter your full name");
      return false;
    }
    if (!formData.mobile?.trim() || formData.mobile.length < 10) {
      setError("Please enter a valid mobile number");
      return false;
    }
    if (!formData.email?.trim() || !formData.email.includes("@")) {
      setError("Please enter a valid email address");
      return false;
    }
    return true;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
      setError("");
    }
  };

  const handleBack = () => {
    setStep(1);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.agreeContact) {
      setError("Please agree to be contacted");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/service-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to submit booking");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Memoize renderServiceFields to prevent re-renders
  const serviceFields = useMemo(() => renderServiceFields(), [serviceType, formData, handleChange]);

  // Success Screen
  if (success) {
    return (
      <div className="booking-form-container">
        <div className="success-screen">
          <div className="success-animation">
            <div
              className="success-circle"
              style={{ background: config.gradient }}
            >
              <svg
                className="checkmark"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 52 52"
              >
                <path
                  className="checkmark-check"
                  fill="none"
                  d="M14.1 27.2l7.1 7.2 16.7-16.8"
                />
              </svg>
            </div>
          </div>
          <h2>Request Submitted! 🎉</h2>
          <p>Thank you for your {config.title.toLowerCase()} request.</p>
          <p className="sub-text">
            Our team will contact you within 2 hours via WhatsApp, call, or
            email.
          </p>
          <div className="contact-info">
            <div className="contact-item">
              <span className="icon">📞</span>
              <span>+91-8923992522</span>
            </div>
            <div className="contact-item">
              <span className="icon">💬</span>
              <span>+91-8923992522</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="close-button"
            style={{ background: config.gradient }}
          >
            Close
          </button>
        </div>
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .booking-form-container {
            background: white;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          .success-screen {
            padding: 3rem 2rem;
            text-align: center;
          }
          .success-animation {
            margin-bottom: 1.5rem;
          }
          .success-circle {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            animation: scaleIn 0.5s ease;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          }
          .checkmark {
            width: 50px;
            height: 50px;
          }
          .checkmark-check {
            stroke: white;
            stroke-width: 4;
            stroke-linecap: round;
            stroke-linejoin: round;
            animation: draw 0.6s ease 0.3s forwards;
            stroke-dasharray: 50;
            stroke-dashoffset: 50;
          }
          @keyframes scaleIn {
            from {
              transform: scale(0);
            }
            to {
              transform: scale(1);
            }
          }
          @keyframes draw {
            to {
              stroke-dashoffset: 0;
            }
          }
          h2 {
            color: #0f172a;
            font-size: 1.75rem;
            margin-bottom: 0.5rem;
          }
          p {
            color: #6b7280;
            margin-bottom: 0.5rem;
          }
          .sub-text {
            font-size: 0.875rem;
            color: #9ca3af;
            margin-bottom: 1.5rem;
          }
          .contact-info {
            display: flex;
            justify-content: center;
            gap: 2rem;
            margin-bottom: 2rem;
          }
          .contact-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #374151;
            font-weight: 500;
          }
          .icon {
            font-size: 1.25rem;
          }
          .close-button {
            padding: 1rem 3rem;
            color: white;
            border: none;
            border-radius: 12px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
            transition:
              transform 0.2s,
              box-shadow 0.2s;
          }
          .close-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
          }
        `,
          }}
        />
      </div>
    );
  }

  return (
    <div className="booking-form-container">
      {/* Header */}
      <div className="form-header" style={{ background: config.gradient }}>
        <div className="header-pattern"></div>
        <div className="header-content">
          <div className="header-icon">{config.icon}</div>
          <h2>{config.title}</h2>
          <p>Fill in the details below and we'll get back to you shortly</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        <div className={`step ${step >= 1 ? "active" : ""}`}>
          <div
            className="step-number"
            style={{
              background: step >= 1 ? config.gradient : "#e5e7eb",
              boxShadow: step >= 1 ? `0 4px 15px ${config.color}40` : "none",
            }}
          >
            {step > 1 ? "✓" : "1"}
          </div>
          <div className="step-info">
            <span className="step-label">Step 1</span>
            <span className="step-title">Personal Info</span>
          </div>
        </div>
        <div
          className="step-connector"
          style={{ background: step >= 2 ? config.gradient : "#e5e7eb" }}
        ></div>
        <div className={`step ${step >= 2 ? "active" : ""}`}>
          <div
            className="step-number"
            style={{
              background: step >= 2 ? config.gradient : "#e5e7eb",
              boxShadow: step >= 2 ? `0 4px 15px ${config.color}40` : "none",
            }}
          >
            2
          </div>
          <div className="step-info">
            <span className="step-label">Step 2</span>
            <span className="step-title">Service Details</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="form-content">
        {/* Step 1: Personal Information */}
        {step === 1 && (
          <div className="step-content">
            <div
              className="section-card"
              style={{ borderColor: `${config.color}30` }}
            >
              <div
                className="section-header"
                style={{ background: config.lightBg }}
              >
                <span className="section-icon">👤</span>
                <h3>Personal Information</h3>
              </div>
              <div className="section-body">
                <div className="fields-grid">
                  <InputField
                    icon="📝"
                    label="Full Name"
                    name="fullName"
                    required
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={handleChange}
                  />
                  <div className="enhanced-field">
                    <label className="field-label">
                      <span className="field-icon">📱</span>
                      Mobile (WhatsApp) <span className="required">*</span>
                    </label>
                    <div className="input-wrapper phone-wrapper">
                      <span className="country-code">+91</span>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleChange}
                        placeholder="Enter 10-digit number"
                        maxLength={10}
                        required
                        className="enhanced-input phone-input"
                      />
                    </div>
                  </div>
                  <div className="enhanced-field full-width">
                    <label className="field-label">
                      <span className="field-icon">✉️</span>
                      Email Address <span className="required">*</span>
                    </label>
                    <div className="input-wrapper">
                      <span className="input-icon">✉️</span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter your email address"
                        required
                        className="enhanced-input"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-actions">
              <button
                type="button"
                onClick={handleNext}
                className="primary-button"
                style={{ background: config.gradient }}
              >
                Continue to Service Details
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Service Details */}
        {step === 2 && (
          <div className="step-content">
            <div
              className="section-card"
              style={{ borderColor: `${config.color}30` }}
            >
              <div
                className="section-header"
                style={{ background: config.lightBg }}
              >
                <span className="section-icon">{config.icon}</span>
                <h3>{config.title} Details</h3>
              </div>
              <div className="section-body">
                <div className="fields-grid">{serviceFields}</div>
              </div>
            </div>

            <div
              className="section-card"
              style={{
                borderColor: `${config.color}30`,
                background: `linear-gradient(135deg, ${config.lightBg} 0%, rgba(255,255,255,0.6) 100%)`,
              }}
            >
              <div
                className="section-header"
                style={{
                  background: `linear-gradient(135deg, ${config.color}15 0%, ${config.color}08 100%)`,
                  borderBottom: `2px solid ${config.color}20`,
                }}
              >
                <span className="section-icon" style={{ fontSize: "1.5rem" }}>
                  💬
                </span>
                <h3
                  style={{
                    background: config.gradient,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    fontSize: "1.25rem",
                    fontWeight: 700,
                  }}
                >
                  Additional Information
                </h3>
              </div>
              <div className="section-body" style={{ padding: "1.5rem" }}>
                <div
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "1rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
                    border: `1px solid ${config.color}20`,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "0.75rem",
                    }}
                  >
                    <span style={{ fontSize: "1.25rem" }}>📝</span>
                    <label
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "#374151",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      Message / Special Requirements
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                          fontWeight: 400,
                        }}
                      >
                        (Optional)
                      </span>
                    </label>
                  </div>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="✨ Tell us about any special requirements, preferences, or questions...

Examples:
• Specific pickup/drop-off locations
• Preferred travel times
• Special assistance needed
• Dietary preferences
• Any other special requests"
                    style={{
                      width: "100%",
                      padding: "1rem",
                      fontSize: "0.95rem",
                      lineHeight: "1.6",
                      border: `2px solid ${config.color}20`,
                      borderRadius: "10px",
                      resize: "vertical",
                      minHeight: "140px",
                      fontFamily: "inherit",
                      transition: "all 0.2s ease",
                      background: "#f9fafb",
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = config.color;
                      e.target.style.background = "white";
                      e.target.style.boxShadow = `0 0 0 4px ${config.color}15`;
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = `${config.color}20`;
                      e.target.style.background = "#f9fafb";
                      e.target.style.boxShadow = "none";
                    }}
                  />
                  <div
                    style={{
                      marginTop: "0.75rem",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      fontSize: "0.8rem",
                      color: "#6b7280",
                    }}
                  >
                    <span>💡</span>
                    <span>
                      The more details you provide, the better we can serve you!
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="agreement-card"
              style={{
                borderColor: `${config.color}30`,
                background: config.lightBg,
              }}
            >
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="agreeContact"
                  checked={formData.agreeContact}
                  onChange={handleChange}
                />
                <span
                  className="custom-checkbox"
                  style={{
                    borderColor: formData.agreeContact
                      ? config.color
                      : "#d1d5db",
                    background: formData.agreeContact
                      ? config.gradient
                      : "white",
                  }}
                >
                  {formData.agreeContact && <span className="check">✓</span>}
                </span>
                <span className="agreement-text">
                  I agree to be contacted via call, WhatsApp, or email regarding
                  this booking request
                </span>
              </label>
            </div>

            {error && (
              <div className="error-message">
                <span className="error-icon">⚠️</span>
                {error}
              </div>
            )}

            <div className="form-actions two-buttons">
              <button
                type="button"
                onClick={handleBack}
                className="secondary-button"
              >
                <span className="btn-arrow">←</span>
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="primary-button"
                style={{ background: config.gradient }}
              >
                {loading ? (
                  <>
                    <span className="spinner"></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Request
                    <span className="btn-arrow">→</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .booking-form-container {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          max-width: 900px;
          margin: 0 auto;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
        }

        .form-header {
          padding: 2.5rem 2rem;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .header-pattern {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-image:
            radial-gradient(
              circle at 20% 50%,
              rgba(255, 255, 255, 0.1) 1px,
              transparent 1px
            ),
            radial-gradient(
              circle at 80% 50%,
              rgba(255, 255, 255, 0.1) 1px,
              transparent 1px
            );
          background-size: 30px 30px;
        }

        .header-content {
          position: relative;
          z-index: 1;
        }

        .header-icon {
          font-size: 3.5rem;
          margin-bottom: 0.75rem;
          animation: float 3s ease-in-out infinite;
          filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .form-header h2 {
          font-size: 1.875rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .form-header p {
          opacity: 0.9;
          font-size: 1rem;
        }

        .step-indicator {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 1.75rem 2rem;
          background: linear-gradient(to bottom, #f8fafc, #f1f5f9);
          border-bottom: 1px solid #e2e8f0;
        }

        .step {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .step-number {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 700;
          font-size: 0.9rem;
          transition: all 0.3s ease;
        }

        .step-info {
          display: flex;
          flex-direction: column;
        }

        .step-label {
          font-size: 0.7rem;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .step-title {
          font-weight: 600;
          color: #374151;
          font-size: 0.9rem;
        }

        .step-connector {
          width: 80px;
          height: 4px;
          margin: 0 1.25rem;
          border-radius: 2px;
          transition: all 0.3s ease;
        }

        .form-content {
          padding: 2rem;
        }

        .step-content {
          animation: fadeSlideIn 0.4s ease;
        }

        @keyframes fadeSlideIn {
          from {
            opacity: 0;
            transform: translateY(15px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .section-card {
          background: white;
          border-radius: 16px;
          border: 2px solid #e5e7eb;
          overflow: hidden;
          margin-bottom: 1.5rem;
          transition: border-color 0.2s;
        }

        .section-card:hover {
          border-color: ${config.color}50;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .section-icon {
          font-size: 1.5rem;
        }

        .section-header h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: #1f2937;
          margin: 0;
        }

        .section-body {
          padding: 1.5rem;
        }

        .fields-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.25rem;
        }

        .enhanced-field {
          display: flex;
          flex-direction: column;
        }

        .enhanced-field.full-width {
          grid-column: 1 / -1;
        }

        .field-label {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.6rem;
          font-size: 0.9rem;
        }

        .field-icon {
          font-size: 1.1rem;
        }

        .required {
          color: #ef4444;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          font-size: 1.1rem;
          z-index: 1;
          opacity: 0.7;
        }

        .enhanced-input {
          width: 100%;
          padding: 0.9rem 1rem 0.9rem 3rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: #fafafa;
          color: #1f2937;
        }

        .enhanced-input:hover {
          border-color: #d1d5db;
          background: white;
        }

        .enhanced-input:focus {
          outline: none;
          border-color: ${config.color};
          background: white;
          box-shadow:
            0 0 0 4px ${config.color}15,
            0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .enhanced-input::placeholder {
          color: #9ca3af;
        }

        .phone-wrapper {
          position: relative;
        }

        .country-code {
          position: absolute;
          left: 0;
          top: 0;
          bottom: 0;
          display: flex;
          align-items: center;
          padding: 0 1rem;
          background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
          border: 2px solid #e5e7eb;
          border-right: none;
          border-radius: 12px 0 0 12px;
          font-weight: 600;
          color: #374151;
          font-size: 0.95rem;
        }

        .phone-input {
          padding-left: 4.5rem !important;
          border-radius: 0 12px 12px 0 !important;
          border-left: none !important;
        }

        .select-wrapper {
          position: relative;
        }

        .enhanced-select {
          width: 100%;
          padding: 0.9rem 2.5rem 0.9rem 3rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: #fafafa;
          color: #1f2937;
          appearance: none;
          cursor: pointer;
        }

        .enhanced-select:hover {
          border-color: #d1d5db;
          background: white;
        }

        .enhanced-select:focus {
          outline: none;
          border-color: ${config.color};
          background: white;
          box-shadow:
            0 0 0 4px ${config.color}15,
            0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .select-arrow {
          position: absolute;
          right: 1rem;
          color: #9ca3af;
          font-size: 0.7rem;
          pointer-events: none;
          transition: transform 0.2s;
        }

        .select-wrapper:focus-within .select-arrow {
          color: ${config.color};
        }

        .textarea-wrapper {
          position: relative;
        }

        .textarea-icon {
          position: absolute;
          left: 1rem;
          top: 0.9rem;
          font-size: 1.1rem;
          opacity: 0.7;
        }

        .enhanced-textarea {
          width: 100%;
          padding: 0.9rem 1rem 0.9rem 3rem;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          transition: all 0.2s ease;
          background: #fafafa;
          color: #1f2937;
          resize: vertical;
          min-height: 100px;
          font-family: inherit;
        }

        .enhanced-textarea:hover {
          border-color: #d1d5db;
          background: white;
        }

        .enhanced-textarea:focus {
          outline: none;
          border-color: ${config.color};
          background: white;
          box-shadow:
            0 0 0 4px ${config.color}15,
            0 4px 12px rgba(0, 0, 0, 0.05);
        }

        .enhanced-textarea::placeholder {
          color: #9ca3af;
        }

        .agreement-card {
          padding: 1.25rem;
          border-radius: 12px;
          border: 2px solid #e5e7eb;
          margin-bottom: 1.5rem;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.875rem;
          cursor: pointer;
        }

        .checkbox-label input {
          display: none;
        }

        .custom-checkbox {
          width: 24px;
          height: 24px;
          border: 2px solid #d1d5db;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
        }

        .check {
          color: white;
          font-size: 0.85rem;
          font-weight: bold;
        }

        .agreement-text {
          font-size: 0.9rem;
          color: #4b5563;
          line-height: 1.5;
        }

        .error-message {
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          border: 2px solid #fecaca;
          color: #dc2626;
          padding: 1rem 1.25rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-weight: 500;
          animation: shake 0.5s ease;
        }

        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-5px);
          }
          75% {
            transform: translateX(5px);
          }
        }

        .error-icon {
          font-size: 1.25rem;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 0.5rem;
        }

        .form-actions.two-buttons {
          justify-content: space-between;
        }

        .primary-button {
          padding: 1rem 2rem;
          color: white;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          transition: all 0.2s ease;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
        }

        .primary-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
        }

        .primary-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .secondary-button {
          padding: 1rem 2rem;
          background: white;
          border: 2px solid #e5e7eb;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.6rem;
          color: #374151;
          transition: all 0.2s ease;
        }

        .secondary-button:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        .btn-arrow {
          transition: transform 0.2s ease;
        }

        .primary-button:hover:not(:disabled) .btn-arrow {
          transform: translateX(4px);
        }

        .secondary-button:hover .btn-arrow {
          transform: translateX(-4px);
        }

        .spinner {
          width: 20px;
          height: 20px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 768px) {
          .form-header {
            padding: 2rem 1.5rem;
          }
          .header-icon {
            font-size: 2.75rem;
          }
          .form-header h2 {
            font-size: 1.5rem;
          }
          .step-indicator {
            padding: 1.25rem 1rem;
          }
          .step-info {
            display: none;
          }
          .step-connector {
            width: 50px;
            margin: 0 0.75rem;
          }
          .form-content {
            padding: 1.5rem 1rem;
          }
          .section-body {
            padding: 1.25rem;
          }
          .fields-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }
          .form-actions.two-buttons {
            flex-direction: column-reverse;
            gap: 0.75rem;
          }
          .secondary-button,
          .primary-button {
            width: 100%;
            justify-content: center;
          }
        }
      `,
        }}
      />
    </div>
  );

  function renderServiceFields() {
    switch (serviceType) {
      case "car-rental":
        return (
          <>
            <InputField
              icon="👥"
              label="Number of Passengers"
              name="passengers"
              type="number"
              required
              placeholder="Enter number"
              min={1}
              value={formData.passengers}
              onChange={handleChange}
            />
            <InputField
              icon="📅"
              label="Pickup Date"
              name="pickupDate"
              type="date"
              required
              min={today}
              value={formData.pickupDate}
              onChange={handleChange}
            />
            <InputField
              icon="🕐"
              label="Pickup Time"
              name="pickupTime"
              type="time"
              required
              value={formData.pickupTime}
              onChange={handleChange}
            />
            <SelectField
              icon="🚗"
              label="Service Type"
              name="rentalType"
              required
              value={formData.rentalType}
              onChange={handleChange}
              options={[
                { value: "", label: "Select service type" },
                { value: "local", label: "🏙️ Local" },
                { value: "outstation", label: "🛣️ Outstation" },
                { value: "airport", label: "✈️ Airport Transfer" },
                { value: "hourly", label: "⏰ Hourly Rental" },
              ]}
            />
            <InputField
              icon="📍"
              label="Pickup Location"
              name="pickupLocation"
              required
              placeholder="Enter pickup address"
              value={formData.pickupLocation}
              onChange={handleChange}
            />
            <InputField
              icon="🏁"
              label="Drop Off Location"
              name="dropOffLocation"
              required
              placeholder="Enter drop-off address"
              value={formData.dropOffLocation}
              onChange={handleChange}
            />
            <SelectField
              icon="🚙"
              label="Car Type"
              name="carType"
              required
              value={formData.carType}
              onChange={handleChange}
              options={[
                { value: "", label: "Select car type" },
                { value: "hatchback", label: "🚗 Hatchback" },
                { value: "sedan", label: "🚘 Sedan" },
                { value: "suv", label: "🚙 SUV" },
                { value: "tempo", label: "🚐 Tempo Traveller" },
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
                { value: "yes", label: "✅ Yes" },
                { value: "no", label: "❌ No" },
              ]}
            />
            <div className="enhanced-field full-width">
              <label className="field-label">
                <span className="field-icon">🧳</span>
                Additional Luggage
              </label>
              <div className="input-wrapper">
                <span className="input-icon">🧳</span>
                <input
                  type="text"
                  name="luggage"
                  value={formData.luggage || ""}
                  onChange={handleChange}
                  placeholder="Describe any additional luggage requirements"
                  className="enhanced-input"
                />
              </div>
            </div>
          </>
        );

      case "flight":
        return (
          <>
            <SelectField
              icon="↔️"
              label="Trip Type"
              name="tripType"
              required
              options={[
                { value: "", label: "Select trip type" },
                { value: "oneway", label: "➡️ One Way" },
                { value: "round", label: "🔄 Round Trip" },
              ]}
            />
            <InputField
              icon="📅"
              label="Departure Date"
              name="departureDate"
              type="date"
              required
              min={today}
              value={formData.departureDate}
              onChange={handleChange}
            />
            <InputField
              icon="🛫"
              label="Departure City"
              name="departureCity"
              required
              placeholder="e.g., Mumbai"
              value={formData.departureCity}
              onChange={handleChange}
            />
            <InputField
              icon="🛬"
              label="Destination City"
              name="destinationCity"
              required
              placeholder="e.g., Delhi"
              value={formData.destinationCity}
              onChange={handleChange}
            />
            {formData.tripType === "round" && (
              <InputField
                icon="📅"
                label="Return Date"
                name="returnDate"
                type="date"
                required
                min={formData.departureDate || today}
                value={formData.returnDate}
                onChange={handleChange}
              />
            )}
            <SelectField
              icon="💺"
              label="Preferred Class"
              name="flightClass"
              required
              value={formData.flightClass}
              onChange={handleChange}
              options={[
                { value: "", label: "Select class" },
                { value: "economy", label: "💺 Economy" },
                { value: "premium-economy", label: "🎫 Premium Economy" },
                { value: "business", label: "💼 Business" },
                { value: "first", label: "👑 First Class" },
              ]}
            />
            <InputField
              icon="✈️"
              label="Preferred Airlines"
              name="preferredAirlines"
              placeholder="e.g., IndiGo, Air India"
              value={formData.preferredAirlines}
              onChange={handleChange}
            />
            <InputField
              icon="👨"
              label="Adults"
              name="adults"
              type="number"
              required
              placeholder="Number of adults"
              min={1}
              value={formData.adults}
              onChange={handleChange}
            />
            <InputField
              icon="👦"
              label="Children (2-12 yrs)"
              name="children"
              type="number"
              placeholder="0"
              min={0}
              value={formData.children || 0}
              onChange={handleChange}
            />
            <InputField
              icon="👶"
              label="Infants (0-2 yrs)"
              name="infants"
              type="number"
              placeholder="0"
              min={0}
              value={formData.infants || 0}
              onChange={handleChange}
            />
            <SelectField
              icon="🍽️"
              label="Meal Preference"
              name="mealPreference"
              value={formData.mealPreference}
              onChange={handleChange}
              options={[
                { value: "any", label: "🍽️ Any" },
                { value: "veg", label: "🥗 Vegetarian" },
                { value: "non-veg", label: "🍖 Non-Vegetarian" },
                { value: "jain", label: "🥬 Jain" },
                { value: "special", label: "⭐ Special" },
              ]}
            />
          </>
        );

      case "bus":
        return (
          <>
            <InputField
              icon="📍"
              label="From (City)"
              name="fromCity"
              required
              placeholder="Departure city"
            />
            <InputField
              icon="🏁"
              label="To (City)"
              name="toCity"
              required
              placeholder="Destination city"
            />
            <InputField
              icon="📅"
              label="Journey Date"
              name="journeyDate"
              type="date"
              required
              min={today}
            />
            <SelectField
              icon="↔️"
              label="Trip Type"
              name="tripType"
              required
              options={[
                { value: "", label: "Select trip type" },
                { value: "oneway", label: "➡️ One Way" },
                { value: "round", label: "🔄 Round Trip" },
              ]}
            />
            {formData.tripType === "round" && (
              <InputField
                icon="📅"
                label="Return Date"
                name="returnDate"
                type="date"
                required
                min={formData.journeyDate || today}
              />
            )}
            <InputField
              icon="👥"
              label="Number of Passengers"
              name="passengers"
              type="number"
              required
              placeholder="Enter number"
              min={1}
            />
            <SelectField
              icon="🚌"
              label="Bus Type"
              name="busType"
              options={[
                { value: "any", label: "🚌 Any" },
                { value: "ac", label: "❄️ AC" },
                { value: "non-ac", label: "🌡️ Non-AC" },
                { value: "sleeper", label: "🛏️ Sleeper" },
                { value: "seater", label: "💺 Seater" },
                { value: "volvo", label: "🚍 Volvo" },
              ]}
            />
          </>
        );

      case "train":
        return (
          <>
            <InputField
              icon="🚉"
              label="From (Station/City)"
              name="fromStation"
              required
              placeholder="Departure station"
            />
            <InputField
              icon="🏁"
              label="To (Station/City)"
              name="toStation"
              required
              placeholder="Destination station"
            />
            <InputField
              icon="📅"
              label="Journey Date"
              name="journeyDate"
              type="date"
              required
              min={today}
            />
            <SelectField
              icon="↔️"
              label="Trip Type"
              name="tripType"
              required
              options={[
                { value: "", label: "Select trip type" },
                { value: "oneway", label: "➡️ One Way" },
                { value: "round", label: "🔄 Round Trip" },
              ]}
            />
            {formData.tripType === "round" && (
              <InputField
                icon="📅"
                label="Return Date"
                name="returnDate"
                type="date"
                required
                min={formData.journeyDate || today}
              />
            )}
            <InputField
              icon="👥"
              label="Number of Passengers"
              name="passengers"
              type="number"
              required
              placeholder="Enter number"
              min={1}
            />
            <InputField
              icon="🚄"
              label="Preferred Train"
              name="preferredTrain"
              placeholder="Train name/number (if known)"
            />
            <SelectField
              icon="💺"
              label="Preferred Class"
              name="trainClass"
              required
              options={[
                { value: "", label: "Select class" },
                { value: "SL", label: "🛏️ Sleeper (SL)" },
                { value: "3A", label: "❄️ 3-Tier AC (3A)" },
                { value: "2A", label: "❄️ 2-Tier AC (2A)" },
                { value: "1A", label: "👑 1st AC (1A)" },
                { value: "CC", label: "💺 Chair Car (CC)" },
                { value: "EC", label: "✨ Executive Class (EC)" },
              ]}
            />
            <SelectField
              icon="🎫"
              label="Booking Quota"
              name="quota"
              options={[
                { value: "general", label: "📋 General" },
                { value: "tatkal", label: "⚡ Tatkal" },
                { value: "senior", label: "👴 Senior Citizen" },
                { value: "ladies", label: "👩 Ladies" },
              ]}
            />
            <SelectField
              icon="🛏️"
              label="Seat Preference"
              name="seatPreference"
              options={[
                { value: "any", label: "📋 Any" },
                { value: "lower", label: "⬇️ Lower" },
                { value: "middle", label: "↔️ Middle" },
                { value: "upper", label: "⬆️ Upper" },
                { value: "side", label: "↗️ Side" },
              ]}
            />
          </>
        );

      case "visa":
        return (
          <>
            <InputField
              icon="🏠"
              label="City of Residence"
              name="city"
              required
              placeholder="Your current city"
            />
            <InputField
              icon="🌍"
              label="Nationality"
              name="nationality"
              required
              placeholder="e.g., Indian"
            />
            <InputField
              icon="✈️"
              label="Destination Country"
              name="destinationCountry"
              required
              placeholder="Country applying for"
            />
            <SelectField
              icon="📋"
              label="Visa Type"
              name="visaType"
              required
              options={[
                { value: "", label: "Select visa type" },
                { value: "tourist", label: "🏖️ Tourist" },
                { value: "business", label: "💼 Business" },
                { value: "student", label: "🎓 Student" },
                { value: "work", label: "👔 Work" },
                { value: "transit", label: "🔄 Transit" },
              ]}
            />
            <InputField
              icon="📅"
              label="Intended Travel Date"
              name="travelDate"
              type="date"
              required
              min={today}
            />
            <InputField
              icon="⏱️"
              label="Duration of Stay"
              name="durationOfStay"
              placeholder="e.g., 7 days, 2 weeks"
            />
            <InputField
              icon="👥"
              label="Number of Applicants"
              name="applicants"
              type="number"
              required
              placeholder="Enter number"
              min={1}
            />
            <SelectField
              icon="📘"
              label="Passport Type"
              name="passportType"
              options={[
                { value: "ordinary", label: "📘 Ordinary" },
                { value: "official", label: "📗 Official" },
                { value: "diplomatic", label: "📕 Diplomatic" },
              ]}
            />
            <InputField
              icon="📅"
              label="Passport Expiry Date"
              name="passportExpiry"
              type="date"
              min={today}
            />
            <SelectField
              icon="❌"
              label="Previous Visa Rejection"
              name="previousRejection"
              options={[
                { value: "no", label: "✅ No" },
                { value: "yes", label: "❌ Yes" },
              ]}
            />
            <InputField
              icon="🎯"
              label="Purpose of Travel"
              name="purposeOfTravel"
              placeholder="Brief purpose"
            />
            <InputField
              icon="💼"
              label="Occupation"
              name="occupation"
              placeholder="Your occupation"
            />
            <TextareaField
              icon="🗺️"
              label="Travel History (Last 5 years)"
              name="travelHistory"
              placeholder="Countries visited in the last 5 years"
              rows={2}
            />
            <SelectField
              icon="📝"
              label="Visa Filing Assistance"
              name="visaFilingAssistance"
              options={[
                { value: "yes", label: "✅ Yes" },
                { value: "no", label: "❌ No" },
              ]}
            />
            <SelectField
              icon="📁"
              label="Documentation Support"
              name="documentationSupport"
              options={[
                { value: "yes", label: "✅ Yes" },
                { value: "no", label: "❌ No" },
              ]}
            />
            <SelectField
              icon="🗓️"
              label="Appointment Booking"
              name="appointmentBooking"
              options={[
                { value: "yes", label: "✅ Yes" },
                { value: "no", label: "❌ No" },
              ]}
            />
          </>
        );

      case "forex":
        return (
          <>
            <InputField
              icon="🏠"
              label="City of Residence"
              name="city"
              required
              placeholder="Your current city"
            />
            <SelectField
              icon="🎯"
              label="Purpose"
              name="purpose"
              required
              options={[
                { value: "", label: "Select purpose" },
                { value: "travel", label: "✈️ Travel" },
                { value: "education", label: "🎓 Education" },
                { value: "business", label: "💼 Business" },
                { value: "medical", label: "🏥 Medical" },
                { value: "remittance", label: "💸 Remittance" },
              ]}
            />
            <SelectField
              icon="💱"
              label="Currency Required"
              name="currency"
              required
              options={[
                { value: "", label: "Select currency" },
                { value: "USD", label: "🇺🇸 USD - US Dollar" },
                { value: "EUR", label: "🇪🇺 EUR - Euro" },
                { value: "GBP", label: "🇬🇧 GBP - British Pound" },
                { value: "AED", label: "🇦🇪 AED - UAE Dirham" },
                { value: "SGD", label: "🇸🇬 SGD - Singapore Dollar" },
                { value: "AUD", label: "🇦🇺 AUD - Australian Dollar" },
                { value: "CAD", label: "🇨🇦 CAD - Canadian Dollar" },
                { value: "THB", label: "🇹🇭 THB - Thai Baht" },
              ]}
            />
            <InputField
              icon="💰"
              label="Amount Required"
              name="amount"
              required
              placeholder="e.g., 1000"
            />
            <SelectField
              icon="💳"
              label="Mode of Forex"
              name="forexMode"
              required
              options={[
                { value: "", label: "Select mode" },
                { value: "cash", label: "💵 Cash" },
                { value: "card", label: "💳 Forex Card" },
                { value: "transfer", label: "🏦 Wire Transfer" },
              ]}
            />
            <InputField
              icon="✈️"
              label="Destination Country"
              name="destinationCountry"
              placeholder="Where you're traveling"
            />
            <InputField
              icon="📅"
              label="Travel Date"
              name="travelDate"
              type="date"
              min={today}
            />
            <SelectField
              icon="🆔"
              label="PAN Card Available"
              name="panAvailable"
              options={[
                { value: "yes", label: "✅ Yes" },
                { value: "no", label: "❌ No" },
              ]}
            />
            <SelectField
              icon="📘"
              label="Passport Available"
              name="passportAvailable"
              options={[
                { value: "yes", label: "✅ Yes" },
                { value: "no", label: "❌ No" },
              ]}
            />
          </>
        );

      case "insurance":
        return (
          <>
            <InputField
              icon="🏠"
              label="City of Residence"
              name="city"
              required
              placeholder="Your current city"
            />
            <InputField
              icon="✈️"
              label="Destination Countries"
              name="destinationCountries"
              required
              placeholder="e.g., USA, UK, France"
            />
            <InputField
              icon="📅"
              label="Travel Start Date"
              name="travelStartDate"
              type="date"
              required
              min={today}
            />
            <InputField
              icon="📅"
              label="Travel End Date"
              name="travelEndDate"
              type="date"
              required
              min={formData.travelStartDate || today}
            />
            <SelectField
              icon="🎯"
              label="Purpose of Travel"
              name="purpose"
              required
              options={[
                { value: "", label: "Select purpose" },
                { value: "leisure", label: "🏖️ Leisure" },
                { value: "business", label: "💼 Business" },
                { value: "study", label: "🎓 Study" },
                { value: "work", label: "👔 Work" },
              ]}
            />
            <InputField
              icon="👥"
              label="Number of Travellers"
              name="travellers"
              type="number"
              required
              placeholder="Enter number"
              min={1}
            />
            <InputField
              icon="🎂"
              label="Traveller Age(s)"
              name="travellerAges"
              placeholder="e.g., 30, 28, 5"
            />
            <SelectField
              icon="👴"
              label="Senior Citizen Traveller"
              name="seniorCitizen"
              options={[
                { value: "no", label: "❌ No" },
                { value: "yes", label: "✅ Yes" },
              ]}
            />
            <SelectField
              icon="🛡️"
              label="Coverage Type"
              name="coverageType"
              required
              options={[
                { value: "", label: "Select type" },
                { value: "individual", label: "👤 Individual" },
                { value: "family", label: "👨‍👩‍👧‍👦 Family" },
                { value: "group", label: "👥 Group" },
              ]}
            />
            <SelectField
              icon="💰"
              label="Coverage Amount"
              name="coverageAmount"
              options={[
                { value: "50000", label: "💵 $50,000" },
                { value: "100000", label: "💵 $100,000" },
                { value: "250000", label: "💵 $250,000" },
                { value: "500000", label: "💵 $500,000" },
                { value: "1000000", label: "💵 $1,000,000" },
              ]}
            />
            <SelectField
              icon="🏥"
              label="Pre-Existing Medical Condition"
              name="preExistingCondition"
              options={[
                { value: "no", label: "❌ No" },
                { value: "yes", label: "✅ Yes" },
              ]}
            />
            <SelectField
              icon="❌"
              label="Trip Cancellation Coverage"
              name="tripCancellation"
              options={[
                { value: "yes", label: "✅ Yes" },
                { value: "no", label: "❌ No" },
              ]}
            />
            <SelectField
              icon="🚑"
              label="Medical Emergency Coverage"
              name="medicalEmergency"
              options={[
                { value: "yes", label: "✅ Yes" },
                { value: "no", label: "❌ No" },
              ]}
            />
            <SelectField
              icon="🧳"
              label="Baggage Loss/Delay Coverage"
              name="baggageCoverage"
              options={[
                { value: "yes", label: "✅ Yes" },
                { value: "no", label: "❌ No" },
              ]}
            />
            <TextareaField
              icon="⭐"
              label="Special Coverage Requirements"
              name="specialCoverage"
              placeholder="Any special coverage needs?"
              rows={2}
            />
          </>
        );

      default:
        return null;
    }
  }
}

