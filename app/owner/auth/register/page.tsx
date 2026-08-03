"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Link from "next/link";

export default function OwnerRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: details
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
    ownerName: "",
    businessName: "",
    phone: "",
    businessType: "hotel",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const sendOTP = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          purpose: "signup",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP sent to your email address!");
        setStep(2);
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOTP = async () => {
    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp: formData.otp,
          purpose: "signup",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP verified successfully!");
        setStep(3);
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const completeSignup = async () => {
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setError("");
    setMessage("");
    setLoading(true);

    try {
      const response = await fetch("/api/owner/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          ownerName: formData.ownerName,
          businessName: formData.businessName,
          phone: formData.phone,
          businessType: formData.businessType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store owner data and tokens
        if (data.owner) {
          localStorage.setItem(
            "owner",
            JSON.stringify({
              ...data.owner,
              role: "owner",
            }),
          );
        }

        // Store tokens for authentication
        if (data.accessToken) {
          localStorage.setItem("accessToken", data.accessToken);
        }
        if (data.refreshToken) {
          localStorage.setItem("refreshToken", data.refreshToken);
        }

        setMessage("Account created successfully! Logging you in...");

        // Auto-login after registration
        setTimeout(() => {
          router.push("/owner/dashboard");
        }, 1000);
      } else {
        setError(data.error || "Registration failed");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (
    field: string,
    value: string | React.ChangeEvent<HTMLSelectElement>,
  ) => {
    if (typeof value === "string") {
      setFormData((prev) => ({ ...prev, [field]: value }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value.target.value }));
    }
    setError("");
    setMessage("");
  };

  return (
    <>
      <Header solidHeader={true} />
      <div
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          paddingBottom: "2rem",
        }}
      >
        <div style={{ maxWidth: "400px", margin: "0 auto", padding: "0 1rem" }}>
          {/* Progress Indicator */}
          <div style={{ marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "0.5rem",
              }}
            >
              {[1, 2, 3].map((num) => (
                <div
                  key={num}
                  style={{
                    flex: 1,
                    height: "4px",
                    background: step >= num ? "#0066cc" : "#d1d5db",
                    margin: "0 4px",
                    borderRadius: "2px",
                  }}
                />
              ))}
            </div>
            <p
              style={{
                textAlign: "center",
                color: "#6b7280",
                fontSize: "0.9rem",
              }}
            >
              Step {step} of 3
            </p>
          </div>

          {/* Main Card */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "1.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h1
              style={{
                margin: "0 0 0.5rem",
                fontSize: "1.375rem",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              Owner Register
            </h1>
            <p
              style={{
                margin: "0 0 1.5rem",
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              Start managing your properties
            </p>

            {/* Error Message */}
            {error && (
              <div
                style={{
                  padding: "0.75rem",
                  background: "#fee2e2",
                  color: "#991b1b",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                {error}
              </div>
            )}

            {/* Success Message */}
            {message && (
              <div
                style={{
                  padding: "0.75rem",
                  background: "#dcfce7",
                  color: "#15803d",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                {message}
              </div>
            )}

            {/* Step 1: Email */}
            {step === 1 && (
              <div>
                <div style={{ marginBottom: "1.25rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter your email"
                    required
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <button
                  onClick={sendOTP}
                  disabled={loading || !formData.email}
                  style={{
                    width: "100%",
                    padding: "0.625rem",
                    background:
                      loading || !formData.email ? "#9ca3af" : "#0066cc",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor:
                      loading || !formData.email ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Sending..." : "Send OTP"}
                </button>
              </div>
            )}

            {/* Step 2: OTP */}
            {step === 2 && (
              <div>
                <div style={{ marginBottom: "1.25rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Verification Code
                  </label>
                  <input
                    type="text"
                    value={formData.otp}
                    onChange={(e) => handleInputChange("otp", e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  />
                  <p
                    style={{
                      margin: "0.5rem 0 0",
                      fontSize: "0.8rem",
                      color: "#6b7280",
                    }}
                  >
                    Check your email inbox for the verification code
                  </p>
                </div>

                <button
                  onClick={verifyOTP}
                  disabled={loading || formData.otp.length !== 6}
                  style={{
                    width: "100%",
                    padding: "0.625rem",
                    background:
                      loading || formData.otp.length !== 6
                        ? "#9ca3af"
                        : "#0066cc",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor:
                      loading || formData.otp.length !== 6
                        ? "not-allowed"
                        : "pointer",
                    marginBottom: "0.75rem",
                  }}
                >
                  {loading ? "Verifying..." : "Verify OTP"}
                </button>

                <button
                  onClick={sendOTP}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "0.625rem",
                    background: "white",
                    color: "#0066cc",
                    border: "1px solid #0066cc",
                    borderRadius: "8px",
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  Resend OTP
                </button>
              </div>
            )}

            {/* Step 3: Owner Details and Password */}
            {step === 3 && (
              <div>
                <div style={{ marginBottom: "1.25rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={formData.ownerName}
                    onChange={(e) =>
                      handleInputChange("ownerName", e.target.value)
                    }
                    placeholder="Enter your name"
                    required
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Business Name
                  </label>
                  <input
                    type="text"
                    value={formData.businessName}
                    onChange={(e) =>
                      handleInputChange("businessName", e.target.value)
                    }
                    placeholder="Hotel/Homestay name"
                    required
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Business Type
                  </label>
                  <select
                    value={formData.businessType}
                    onChange={(e) =>
                      handleInputChange("businessType", e as any)
                    }
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  >
                    <option value="hotel">Hotel</option>
                    <option value="homestay">Homestay</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    placeholder="Enter your phone"
                    required
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Create a strong password"
                      required
                      style={{
                        width: "100%",
                        padding: "0.625rem",
                        paddingRight: "2.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: "absolute",
                        right: "0.5rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        color: "#6b7280",
                        padding: "0.25rem",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: "1.25rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.875rem",
                    }}
                  >
                    Confirm Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      placeholder="Re-enter your password"
                      required
                      style={{
                        width: "100%",
                        padding: "0.625rem",
                        paddingRight: "2.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
                        boxSizing: "border-box",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={{
                        position: "absolute",
                        right: "0.5rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        color: "#6b7280",
                        padding: "0.25rem",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      {showConfirmPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>

                <button
                  onClick={completeSignup}
                  disabled={
                    loading ||
                    !formData.ownerName ||
                    !formData.businessName ||
                    !formData.phone ||
                    !formData.password ||
                    !formData.confirmPassword
                  }
                  style={{
                    width: "100%",
                    padding: "0.625rem",
                    background:
                      loading ||
                      !formData.ownerName ||
                      !formData.businessName ||
                      !formData.phone ||
                      !formData.password ||
                      !formData.confirmPassword
                        ? "#9ca3af"
                        : "#0066cc",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor:
                      loading ||
                      !formData.ownerName ||
                      !formData.businessName ||
                      !formData.phone ||
                      !formData.password ||
                      !formData.confirmPassword
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </div>
            )}
          </div>

          {/* Login Link */}
          <p
            style={{
              marginTop: "1.25rem",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "0.875rem",
            }}
          >
            Already have an account?{" "}
            <Link
              href="/owner/auth/login"
              style={{
                color: "#0066cc",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Login
            </Link>
          </p>

          {/* Back to Guest Register Link */}
          <p
            style={{
              marginTop: "1rem",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "0.875rem",
            }}
          >
            Are you a guest?{" "}
            <Link
              href="/auth/register"
              style={{
                color: "#16a34a",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Guest Register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
