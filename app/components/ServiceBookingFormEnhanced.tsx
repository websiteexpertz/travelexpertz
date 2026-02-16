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
const InputField = memo(
  ({
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
  ),
);

// Select Field Component with Icon - MEMOIZED
const SelectField = memo(
  ({
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
  ),
);

// Textarea Field Component - MEMOIZED
const TextareaField = memo(
  ({
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
  ),
);

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

  const validateForm = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!validateForm()) {
      setLoading(false);
      return;
    }

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
  const serviceFields = useMemo(
    () => renderServiceFields(),
    [serviceType, formData, handleChange],
  );

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
            border-radius: 1.25rem;
            overflow: hidden;
            box-shadow: 0 0 0 1px rgba(0,0,0,0.03), 0 20px 50px -12px rgba(0,0,0,0.18);
            animation: formSlideIn 0.45s cubic-bezier(0.16, 1, 0.3, 1);
          }
          @keyframes formSlideIn {
            from { opacity: 0; transform: translateY(24px) scale(0.97); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .success-screen {
            padding: 3rem 2rem;
            text-align: center;
          }
          .success-animation {
            margin-bottom: 1.75rem;
          }
          .success-circle {
            width: 88px;
            height: 88px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto;
            animation: successPop 0.5s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
          }
          @keyframes successPop {
            0% { transform: scale(0) rotate(-10deg); }
            60% { transform: scale(1.1) rotate(2deg); }
            100% { transform: scale(1) rotate(0); }
          }
          .checkmark {
            width: 44px;
            height: 44px;
          }
          .checkmark-check {
            stroke: white;
            stroke-width: 4;
            stroke-linecap: round;
            stroke-linejoin: round;
            animation: drawCheck 0.5s ease 0.3s forwards;
            stroke-dasharray: 50;
            stroke-dashoffset: 50;
          }
          @keyframes drawCheck {
            to { stroke-dashoffset: 0; }
          }
          h2 {
            color: #0f172a;
            font-size: 1.5rem;
            font-weight: 700;
            margin-bottom: 0.5rem;
          }
          p {
            color: #6b7280;
            margin-bottom: 0.5rem;
            font-size: 0.95rem;
          }
          .sub-text {
            font-size: 0.85rem;
            color: #9ca3af;
            margin-bottom: 1.5rem;
          }
          .contact-info {
            display: flex;
            justify-content: center;
            gap: 1.5rem;
            margin-bottom: 1.75rem;
            flex-wrap: wrap;
          }
          .contact-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: #374151;
            font-weight: 500;
            font-size: 0.9rem;
          }
          .icon {
            font-size: 1.15rem;
          }
          .close-button {
            padding: 0.75rem 2rem;
            color: white;
            border: none;
            border-radius: 0.75rem;
            font-size: 0.9rem;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 4px 14px rgba(0,0,0,0.12);
          }
          .close-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.18);
          }
          @media (max-width: 768px) {
            .success-screen { padding: 2.5rem 1.5rem; }
            .contact-info { flex-direction: column; gap: 0.75rem; align-items: center; }
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

      <form onSubmit={handleSubmit} className="form-content">
        <div className="combined-form">
          {/* Combined: All Fields in One Section */}
          <div
            className="section-card"
            style={{ borderColor: `${config.color}30` }}
          >
            {/* Personal Information Section */}
            <div
              className="section-header"
              style={{ background: config.lightBg }}
            >
              <span className="section-icon">👤</span>
              <h3>Your Details</h3>
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

                {/* Service Details Section */}
                <div className="section-divider"></div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <h4 className="subsection-title">{config.title} Details</h4>
                </div>
                {serviceFields}
              </div>
            </div>
          </div>

          {/* Message Section */}
          <div
            className="section-card"
            style={{
              borderColor: `${config.color}25`,
            }}
          >
            <div
              className="section-header"
              style={{
                background: config.lightBg,
                borderBottom: `1.5px solid ${config.color}15`,
              }}
            >
              <span className="section-icon">💬</span>
              <h3>Special Requests</h3>
            </div>
            <div className="section-body" style={{ padding: "1.125rem" }}>
              <div
                style={{
                  background: "#fafbfc",
                  borderRadius: "0.75rem",
                  padding: "0.875rem",
                  border: `1.5px solid ${config.color}15`,
                  transition: "all 0.2s ease",
                }}
              >
                <label
                  style={{
                    fontSize: "0.925rem",
                    fontWeight: 600,
                    color: "#374151",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.375rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <span>📝</span>
                  Message / Special Requirements (Optional)
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  placeholder="✨ Tell us about any special requirements, preferences, or questions..."
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    fontSize: "1rem",
                    lineHeight: "1.6",
                    border: `1.5px solid ${config.color}20`,
                    borderRadius: "0.625rem",
                    resize: "vertical",
                    minHeight: "100px",
                    fontFamily: "inherit",
                    transition: "all 0.2s ease",
                    background: "white",
                    color: "#1e293b",
                    outline: "none",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = config.color;
                    e.target.style.boxShadow = `0 0 0 3px ${config.color}18`;
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = `${config.color}20`;
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>
          </div>

          {/* Agreement Card */}
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
                  borderColor: formData.agreeContact ? config.color : "#d1d5db",
                  background: formData.agreeContact ? config.gradient : "white",
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

          {/* Error Message */}
          {error && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {error}
            </div>
          )}

          {/* Action Buttons */}
          <div className="form-actions">
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
                  Submit Booking Request
                  <span className="btn-arrow">→</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      <style
        dangerouslySetInnerHTML={{
          __html: `
        .booking-form-container {
          background: white;
          border-radius: 1.25rem;
          overflow: hidden;
          max-width: 900px;
          margin: 0 auto;
          box-shadow: 0 0 0 1px rgba(0,0,0,0.03), 0 20px 50px -12px rgba(0,0,0,0.18);
          animation: formSlideIn 0.45s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes formSlideIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .form-header {
          padding: 2rem 2rem 1.75rem;
          text-align: center;
          color: white;
          position: relative;
          overflow: hidden;
        }

        .header-pattern {
          position: absolute;
          inset: 0;
          background-image:
            radial-gradient(circle at 15% 80%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 85% 20%, rgba(255,255,255,0.1) 0%, transparent 50%),
            radial-gradient(circle at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 60%);
          pointer-events: none;
        }

        .header-content {
          position: relative;
          z-index: 1;
        }

        .header-icon {
          font-size: 2.5rem;
          margin-bottom: 0.5rem;
          display: inline-block;
          animation: headerFloat 3s ease-in-out infinite;
          filter: drop-shadow(0 6px 12px rgba(0,0,0,0.25));
        }

        @keyframes headerFloat {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-6px) scale(1.05); }
        }

        .form-header h2 {
          font-size: 1.35rem;
          font-weight: 700;
          margin-bottom: 0.35rem;
          letter-spacing: -0.01em;
          text-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        .form-header p {
          opacity: 0.9;
          font-size: 0.875rem;
          letter-spacing: 0.01em;
        }

        .step-indicator { display: none; }

        .form-content {
          padding: 1.75rem;
        }

        .combined-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        @keyframes sectionFadeIn {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .section-card {
          background: white;
          border-radius: 1rem;
          border: 1.5px solid #e5e7eb;
          overflow: hidden;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
          animation: sectionFadeIn 0.4s ease both;
        }

        .section-card:nth-child(1) { animation-delay: 0.05s; }
        .section-card:nth-child(2) { animation-delay: 0.12s; }
        .section-card:nth-child(3) { animation-delay: 0.19s; }

        .section-card:hover {
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
          border-color: ${config.color}50;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 0.625rem;
          padding: 0.875rem 1.125rem;
          border-bottom: 1.5px solid #f1f5f9;
        }

        .section-icon {
          font-size: 1.1rem;
        }

        .section-header h3 {
          font-size: 0.95rem;
          font-weight: 650;
          color: #1e293b;
          margin: 0;
          letter-spacing: -0.01em;
        }

        .section-body {
          padding: 1.125rem;
        }

        .fields-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.125rem;
        }

        .enhanced-field {
          display: flex;
          flex-direction: column;
          animation: fieldFadeIn 0.3s ease both;
        }

        @keyframes fieldFadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .enhanced-field.full-width {
          grid-column: 1 / -1;
        }

        .field-label {
          display: flex;
          align-items: center;
          gap: 0.375rem;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.4rem;
          font-size: 0.8rem;
        }

        .field-icon {
          font-size: 0.875rem;
          line-height: 1;
        }

        .required {
          color: #ef4444;
          font-weight: 500;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 0.875rem;
          font-size: 1rem;
          z-index: 1;
          opacity: 0.5;
          transition: opacity 0.2s ease;
          pointer-events: none;
        }

        .input-wrapper:focus-within .input-icon {
          opacity: 0.85;
        }

        .enhanced-input {
          width: 100%;
          padding: 0.7rem 0.875rem 0.7rem 2.5rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          background: #fafbfc;
          color: #1e293b;
          font-family: inherit;
          outline: none;
        }

        .enhanced-input:hover {
          border-color: #d1d5db;
          background: white;
        }

        .enhanced-input:focus {
          border-color: ${config.color};
          background: white;
          box-shadow: 0 0 0 3px ${config.color}18, 0 2px 8px rgba(0,0,0,0.04);
        }

        .enhanced-input::placeholder {
          color: #9ca3af;
          font-weight: 400;
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
          padding: 0 0.75rem;
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border: 1.5px solid #e5e7eb;
          border-right: none;
          border-radius: 0.75rem 0 0 0.75rem;
          font-weight: 600;
          color: #475569;
          font-size: 0.8rem;
          letter-spacing: 0.02em;
        }

        .phone-input {
          padding-left: 4rem !important;
          border-radius: 0 0.75rem 0.75rem 0 !important;
          border-left: none !important;
        }

        .select-wrapper {
          position: relative;
        }

        .enhanced-select {
          width: 100%;
          padding: 0.7rem 2rem 0.7rem 2.5rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          background: #fafbfc;
          color: #1e293b;
          appearance: none;
          cursor: pointer;
          font-family: inherit;
          outline: none;
        }

        .enhanced-select:hover {
          border-color: #d1d5db;
          background: white;
        }

        .enhanced-select:focus {
          border-color: ${config.color};
          background: white;
          box-shadow: 0 0 0 3px ${config.color}18, 0 2px 8px rgba(0,0,0,0.04);
        }

        .select-arrow {
          position: absolute;
          right: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
          font-size: 0.6rem;
          pointer-events: none;
          transition: color 0.2s ease;
        }

        .select-wrapper:focus-within .select-arrow {
          color: ${config.color};
        }

        .textarea-wrapper {
          position: relative;
        }

        .textarea-icon {
          position: absolute;
          left: 0.75rem;
          top: 0.75rem;
          font-size: 1rem;
          opacity: 0.5;
          pointer-events: none;
        }

        .enhanced-textarea {
          width: 100%;
          padding: 0.75rem 0.875rem 0.75rem 2.5rem;
          border: 1.5px solid #e5e7eb;
          border-radius: 0.75rem;
          font-size: 0.875rem;
          transition: all 0.2s ease;
          background: #fafbfc;
          color: #1e293b;
          resize: vertical;
          min-height: 80px;
          font-family: inherit;
          outline: none;
        }

        .enhanced-textarea:hover {
          border-color: #d1d5db;
          background: white;
        }

        .enhanced-textarea:focus {
          border-color: ${config.color};
          background: white;
          box-shadow: 0 0 0 3px ${config.color}18, 0 2px 8px rgba(0,0,0,0.04);
        }

        .enhanced-textarea::placeholder {
          color: #9ca3af;
          font-weight: 400;
        }

        .section-divider {
          grid-column: 1 / -1;
          height: 1px;
          background: linear-gradient(90deg, transparent, #e2e8f0 20%, #e2e8f0 80%, transparent);
          margin: 0.375rem 0;
        }

        .subsection-title {
          color: #1e293b;
          font-size: 0.875rem;
          font-weight: 650;
          margin: 0.25rem 0 0;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .agreement-card {
          padding: 1rem 1.125rem;
          border-radius: 0.875rem;
          border: 1.5px solid #e5e7eb;
          transition: border-color 0.2s ease;
          animation: sectionFadeIn 0.4s ease 0.25s both;
        }

        .checkbox-label {
          display: flex;
          align-items: flex-start;
          gap: 0.75rem;
          cursor: pointer;
        }

        .checkbox-label input {
          display: none;
        }

        .custom-checkbox {
          width: 22px;
          height: 22px;
          min-width: 22px;
          border: 2px solid #d1d5db;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: all 0.2s ease;
          margin-top: 1px;
        }

        .check {
          color: white;
          font-size: 0.75rem;
          font-weight: bold;
          line-height: 1;
        }

        .agreement-text {
          font-size: 0.825rem;
          color: #4b5563;
          line-height: 1.55;
        }

        .error-message {
          background: linear-gradient(135deg, #fef2f2, #fee2e2);
          border: 1.5px solid #fecaca;
          color: #dc2626;
          padding: 0.875rem 1.125rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          gap: 0.625rem;
          font-weight: 500;
          font-size: 0.85rem;
          animation: errorShake 0.4s ease;
        }

        @keyframes errorShake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-4px); }
          40% { transform: translateX(4px); }
          60% { transform: translateX(-3px); }
          80% { transform: translateX(3px); }
        }

        .error-icon {
          font-size: 1.1rem;
          flex-shrink: 0;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          padding-top: 0.25rem;
          animation: sectionFadeIn 0.4s ease 0.3s both;
        }

        .primary-button {
          padding: 0.875rem 2rem;
          color: white;
          border: none;
          border-radius: 0.75rem;
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          box-shadow: 0 4px 14px rgba(0,0,0,0.12);
          letter-spacing: 0.01em;
          width: 100%;
          justify-content: center;
        }

        .primary-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.18);
          filter: brightness(1.05);
        }

        .primary-button:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }

        .primary-button:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
        }

        .btn-arrow {
          font-size: 1rem;
          transition: transform 0.2s ease;
        }

        .primary-button:hover:not(:disabled) .btn-arrow {
          transform: translateX(3px);
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2.5px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .full-width {
          grid-column: 1 / -1;
        }

        @media (max-width: 768px) {
          .form-header {
            padding: 1.5rem 1.25rem 1.35rem;
          }
          .header-icon {
            font-size: 2rem;
          }
          .form-header h2 {
            font-size: 1.15rem;
          }
          .form-header p {
            font-size: 0.8rem;
          }
          .form-content {
            padding: 1.25rem 1rem;
          }
          .section-body {
            padding: 0.875rem;
          }
          .fields-grid {
            grid-template-columns: 1fr;
            gap: 0.875rem;
          }
          .primary-button {
            width: 100%;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .form-header { padding: 1.25rem 1rem; }
          .form-content { padding: 1rem 0.875rem; }
          .section-header { padding: 0.75rem 0.875rem; }
          .section-body { padding: 0.75rem; }
          .enhanced-input, .enhanced-select { font-size: 16px; }
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
              value={formData.tripType}
              onChange={handleChange}
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
              value={formData.fromCity}
              onChange={handleChange}
            />
            <InputField
              icon="🏁"
              label="To (City)"
              name="toCity"
              required
              placeholder="Destination city"
              value={formData.toCity}
              onChange={handleChange}
            />
            <InputField
              icon="📅"
              label="Journey Date"
              name="journeyDate"
              type="date"
              required
              min={today}
              value={formData.journeyDate}
              onChange={handleChange}
            />
            <SelectField
              icon="↔️"
              label="Trip Type"
              name="tripType"
              required
              value={formData.tripType}
              onChange={handleChange}
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
                value={formData.returnDate}
                onChange={handleChange}
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
              value={formData.passengers}
              onChange={handleChange}
            />
            <SelectField
              icon="🚌"
              label="Bus Type"
              name="busType"
              value={formData.busType}
              onChange={handleChange}
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
              value={formData.fromStation}
              onChange={handleChange}
            />
            <InputField
              icon="🏁"
              label="To (Station/City)"
              name="toStation"
              required
              placeholder="Destination station"
              value={formData.toStation}
              onChange={handleChange}
            />
            <InputField
              icon="📅"
              label="Journey Date"
              name="journeyDate"
              type="date"
              required
              min={today}
              value={formData.journeyDate}
              onChange={handleChange}
            />
            <SelectField
              icon="↔️"
              label="Trip Type"
              name="tripType"
              required
              value={formData.tripType}
              onChange={handleChange}
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
                value={formData.returnDate}
                onChange={handleChange}
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
              value={formData.passengers}
              onChange={handleChange}
            />
            <InputField
              icon="🚄"
              label="Preferred Train"
              name="preferredTrain"
              placeholder="Train name/number (if known)"
              value={formData.preferredTrain}
              onChange={handleChange}
            />
            <SelectField
              icon="💺"
              label="Preferred Class"
              name="trainClass"
              required
              value={formData.trainClass}
              onChange={handleChange}
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
              value={formData.quota}
              onChange={handleChange}
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
              value={formData.seatPreference}
              onChange={handleChange}
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
              value={formData.city}
              onChange={handleChange}
            />
            <InputField
              icon="🌍"
              label="Nationality"
              name="nationality"
              required
              placeholder="e.g., Indian"
              value={formData.nationality}
              onChange={handleChange}
            />
            <InputField
              icon="✈️"
              label="Destination Country"
              name="destinationCountry"
              required
              placeholder="Country applying for"
              value={formData.destinationCountry}
              onChange={handleChange}
            />
            <SelectField
              icon="📋"
              label="Visa Type"
              name="visaType"
              required
              value={formData.visaType}
              onChange={handleChange}
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
              value={formData.travelDate}
              onChange={handleChange}
            />
            <InputField
              icon="⏱️"
              label="Duration of Stay"
              name="durationOfStay"
              placeholder="e.g., 7 days, 2 weeks"
              value={formData.durationOfStay}
              onChange={handleChange}
            />
            <InputField
              icon="👥"
              label="Number of Applicants"
              name="applicants"
              type="number"
              required
              placeholder="Enter number"
              min={1}
              value={formData.applicants}
              onChange={handleChange}
            />
            <SelectField
              icon="📘"
              label="Passport Type"
              name="passportType"
              value={formData.passportType}
              onChange={handleChange}
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
              value={formData.passportExpiry}
              onChange={handleChange}
            />
            <SelectField
              icon="❌"
              label="Previous Visa Rejection"
              name="previousRejection"
              value={formData.previousRejection}
              onChange={handleChange}
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
              value={formData.purposeOfTravel}
              onChange={handleChange}
            />
            <InputField
              icon="💼"
              label="Occupation"
              name="occupation"
              placeholder="Your occupation"
              value={formData.occupation}
              onChange={handleChange}
            />
            <TextareaField
              icon="🗺️"
              label="Travel History (Last 5 years)"
              name="travelHistory"
              placeholder="Countries visited in the last 5 years"
              rows={2}
              value={formData.travelHistory}
              onChange={handleChange}
            />
            <SelectField
              icon="📝"
              label="Visa Filing Assistance"
              name="visaFilingAssistance"
              value={formData.visaFilingAssistance}
              onChange={handleChange}
              options={[
                { value: "yes", label: "✅ Yes" },
                { value: "no", label: "❌ No" },
              ]}
            />
            <SelectField
              icon="📁"
              label="Documentation Support"
              name="documentationSupport"
              value={formData.documentationSupport}
              onChange={handleChange}
              options={[
                { value: "yes", label: "✅ Yes" },
                { value: "no", label: "❌ No" },
              ]}
            />
            <SelectField
              icon="🗓️"
              label="Appointment Booking"
              name="appointmentBooking"
              value={formData.appointmentBooking}
              onChange={handleChange}
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
              value={formData.city}
              onChange={handleChange}
            />
            <SelectField
              icon="🎯"
              label="Purpose"
              name="purpose"
              required
              value={formData.purpose}
              onChange={handleChange}
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
              value={formData.currency}
              onChange={handleChange}
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
              value={formData.amount}
              onChange={handleChange}
            />
            <SelectField
              icon="💳"
              label="Mode of Forex"
              name="forexMode"
              required
              value={formData.forexMode}
              onChange={handleChange}
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
              value={formData.destinationCountry}
              onChange={handleChange}
            />
            <InputField
              icon="📅"
              label="Travel Date"
              name="travelDate"
              type="date"
              min={today}
              value={formData.travelDate}
              onChange={handleChange}
            />
            <SelectField
              icon="🆔"
              label="PAN Card Available"
              name="panAvailable"
              value={formData.panAvailable}
              onChange={handleChange}
              options={[
                { value: "yes", label: "✅ Yes" },
                { value: "no", label: "❌ No" },
              ]}
            />
            <SelectField
              icon="📘"
              label="Passport Available"
              name="passportAvailable"
              value={formData.passportAvailable}
              onChange={handleChange}
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
              value={formData.city}
              onChange={handleChange}
            />
            <InputField
              icon="✈️"
              label="Destination Countries"
              name="destinationCountries"
              required
              placeholder="e.g., USA, UK, France"
              value={formData.destinationCountries}
              onChange={handleChange}
            />
            <InputField
              icon="📅"
              label="Travel Start Date"
              name="travelStartDate"
              type="date"
              required
              min={today}
              value={formData.travelStartDate}
              onChange={handleChange}
            />
            <InputField
              icon="📅"
              label="Travel End Date"
              name="travelEndDate"
              type="date"
              required
              min={formData.travelStartDate || today}
              value={formData.travelEndDate}
              onChange={handleChange}
            />
            <SelectField
              icon="🎯"
              label="Purpose of Travel"
              name="purpose"
              required
              value={formData.purpose}
              onChange={handleChange}
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
              value={formData.travellers}
              onChange={handleChange}
            />
            <InputField
              icon="🎂"
              label="Traveller Age(s)"
              name="travellerAges"
              placeholder="e.g., 30, 28, 5"
              value={formData.travellerAges}
              onChange={handleChange}
            />
            <SelectField
              icon="👴"
              label="Senior Citizen Traveller"
              name="seniorCitizen"
              value={formData.seniorCitizen}
              onChange={handleChange}
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
              value={formData.coverageType}
              onChange={handleChange}
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
              value={formData.coverageAmount}
              onChange={handleChange}
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
              value={formData.preExistingCondition}
              onChange={handleChange}
              options={[
                { value: "no", label: "❌ No" },
                { value: "yes", label: "✅ Yes" },
              ]}
            />
            <SelectField
              icon="❌"
              label="Trip Cancellation Coverage"
              name="tripCancellation"
              value={formData.tripCancellation}
              onChange={handleChange}
              options={[
                { value: "yes", label: "✅ Yes" },
                { value: "no", label: "❌ No" },
              ]}
            />
            <SelectField
              icon="🚑"
              label="Medical Emergency Coverage"
              name="medicalEmergency"
              value={formData.medicalEmergency}
              onChange={handleChange}
              options={[
                { value: "yes", label: "✅ Yes" },
                { value: "no", label: "❌ No" },
              ]}
            />
            <SelectField
              icon="🧳"
              label="Baggage Loss/Delay Coverage"
              name="baggageCoverage"
              value={formData.baggageCoverage}
              onChange={handleChange}
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
              value={formData.specialCoverage}
              onChange={handleChange}
            />
          </>
        );

      default:
        return null;
    }
  }
}
