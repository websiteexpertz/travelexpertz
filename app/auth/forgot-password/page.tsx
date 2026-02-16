"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"user" | "owner">("user");
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: new password
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
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
          purpose: "reset_password",
          accountType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP sent to your email address!");
        setStep(2);
      } else {
        setError(data.error || "Failed to send OTP");
      }
    } catch {
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
          purpose: "reset_password",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("OTP verified! Set your new password.");
        setStep(3);
      } else {
        setError(data.error || "Invalid OTP");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async () => {
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
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          accountType,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Password reset successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/auth/login");
        }, 2000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
    setMessage("");
  };

  return (
    <>
      <Header />
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
            {/* Account Type Toggle */}
            <div
              style={{
                display: "flex",
                background: "#f1f5f9",
                borderRadius: "50px",
                padding: "4px",
                marginBottom: "1.25rem",
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setAccountType("user");
                  setError("");
                }}
                style={{
                  flex: 1,
                  padding: "0.5rem 1rem",
                  borderRadius: "50px",
                  border: "none",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  background:
                    accountType === "user"
                      ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                      : "transparent",
                  color: accountType === "user" ? "white" : "#6b7280",
                  boxShadow:
                    accountType === "user"
                      ? "0 2px 8px rgba(59,130,246,0.3)"
                      : "none",
                }}
              >
                Traveler Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountType("owner");
                  setError("");
                }}
                style={{
                  flex: 1,
                  padding: "0.5rem 1rem",
                  borderRadius: "50px",
                  border: "none",
                  fontSize: "0.8rem",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  background:
                    accountType === "owner"
                      ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                      : "transparent",
                  color: accountType === "owner" ? "white" : "#6b7280",
                  boxShadow:
                    accountType === "owner"
                      ? "0 2px 8px rgba(59,130,246,0.3)"
                      : "none",
                }}
              >
                Property Owner Account
              </button>
            </div>

            <h1
              style={{
                margin: "0 0 0.5rem",
                fontSize: "1.375rem",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              Reset Password
            </h1>
            <p
              style={{
                margin: "0 0 1.5rem",
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              {step === 1
                ? "Enter your email to receive a verification code"
                : step === 2
                  ? "Enter the OTP sent to your email"
                  : "Set your new password"}
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
                  color: "#166534",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  fontSize: "0.9rem",
                }}
              >
                {message}
              </div>
            )}

            {/* Step 1: Email Input */}
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
                    placeholder="Enter your registered email"
                    required
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
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
                  {loading ? "Sending OTP..." : "Send OTP"}
                </button>
              </div>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <div>
                <div
                  style={{
                    marginBottom: "1rem",
                    padding: "0.75rem",
                    background: "#f9fafb",
                    borderRadius: "8px",
                  }}
                >
                  <p
                    style={{ margin: 0, fontSize: "0.8rem", color: "#6b7280" }}
                  >
                    OTP sent to: <strong>{formData.email}</strong>
                  </p>
                  <button
                    onClick={() => setStep(1)}
                    style={{
                      marginTop: "0.5rem",
                      background: "none",
                      border: "none",
                      color: "#0066cc",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                      textDecoration: "underline",
                    }}
                  >
                    Change email
                  </button>
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
                    Enter OTP
                  </label>
                  <input
                    type="text"
                    value={formData.otp}
                    onChange={(e) =>
                      handleInputChange(
                        "otp",
                        e.target.value.replace(/\D/g, "").slice(0, 6),
                      )
                    }
                    placeholder="Enter 6-digit OTP"
                    maxLength={6}
                    required
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "1.25rem",
                      letterSpacing: "0.5rem",
                      textAlign: "center",
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

            {/* Step 3: Set New Password */}
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
                    New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={(e) =>
                        handleInputChange("password", e.target.value)
                      }
                      placeholder="Enter new password"
                      required
                      style={{
                        width: "100%",
                        padding: "0.625rem",
                        paddingRight: "2.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
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
                  <p
                    style={{
                      margin: "0.5rem 0 0",
                      fontSize: "0.8rem",
                      color: "#6b7280",
                    }}
                  >
                    Min 8 characters
                  </p>
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
                    Confirm New Password
                  </label>
                  <div style={{ position: "relative" }}>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={(e) =>
                        handleInputChange("confirmPassword", e.target.value)
                      }
                      placeholder="Re-enter new password"
                      required
                      style={{
                        width: "100%",
                        padding: "0.625rem",
                        paddingRight: "2.5rem",
                        border: "1px solid #d1d5db",
                        borderRadius: "8px",
                        fontSize: "0.875rem",
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
                  onClick={resetPassword}
                  disabled={
                    loading || !formData.password || !formData.confirmPassword
                  }
                  style={{
                    width: "100%",
                    padding: "0.625rem",
                    background:
                      loading || !formData.password || !formData.confirmPassword
                        ? "#9ca3af"
                        : "#0066cc",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    cursor:
                      loading || !formData.password || !formData.confirmPassword
                        ? "not-allowed"
                        : "pointer",
                  }}
                >
                  {loading ? "Resetting..." : "Reset Password"}
                </button>
              </div>
            )}
          </div>

          {/* Back to Login Link */}
          <p
            style={{
              marginTop: "1.25rem",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "0.875rem",
            }}
          >
            Remember your password?{" "}
            <Link
              href="/auth/login"
              style={{
                color: "#0066cc",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Back to Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
