"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: email, 2: OTP, 3: password
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
    confirmPassword: "",
    name: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

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
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          role: "user",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store user data in localStorage
        if (data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify({
              ...data.user,
              role: "user",
            }),
          );
        }

        setMessage("Account created successfully!");

        // Redirect to homepage
        setTimeout(() => {
          router.push("/");
        }, 1500);
      } else {
        setError(data.error || "Signup failed");
      }
    } catch (error) {
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
            <h1
              style={{
                margin: "0 0 0.5rem",
                fontSize: "1.375rem",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              Create Account
            </h1>
            <p
              style={{
                margin: "0 0 1.5rem",
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              Join us for amazing travel experiences
            </p>

            <p
              style={{
                margin: "0 0 2rem",
                color: "#6b7280",
                textAlign: "center",
                fontSize: "0.9rem",
              }}
            >
              Registering as a property owner?{" "}
              <Link
                href="/owner/auth/register"
                style={{
                  color: "#16a34a",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Register here
              </Link>
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
                    placeholder="Enter your email"
                    required
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                    }}
                  />
                  <p
                    style={{
                      margin: "0.5rem 0 0",
                      fontSize: "0.8rem",
                      color: "#6b7280",
                    }}
                  >
                    We'll send a verification code to this email
                  </p>
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

            {/* Step 3: Set Password and Name */}
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
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter your name"
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
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) =>
                      handleInputChange("password", e.target.value)
                    }
                    placeholder="Create a strong password"
                    required
                    style={{
                      width: "100%",
                      padding: "0.625rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontSize: "0.875rem",
                    }}
                  />
                  <p
                    style={{
                      margin: "0.5rem 0 0",
                      fontSize: "0.8rem",
                      color: "#6b7280",
                    }}
                  >
                    Min 8 characters, 1 uppercase, 1 lowercase, 1 number
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
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleInputChange("confirmPassword", e.target.value)
                    }
                    placeholder="Re-enter your password"
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
                  onClick={completeSignup}
                  disabled={
                    loading ||
                    !formData.name ||
                    !formData.password ||
                    !formData.confirmPassword
                  }
                  style={{
                    width: "100%",
                    padding: "0.625rem",
                    background:
                      loading ||
                      !formData.name ||
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
                      !formData.name ||
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
            <a
              href="/auth/login"
              style={{
                color: "#0066cc",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Login
            </a>
          </p>

          {/* Owner Register Link */}
          <p
            style={{
              marginTop: "1.25rem",
              paddingTop: "1.25rem",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "0.875rem",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            Are you a property owner?{" "}
            <Link
              href="/owner/auth/register"
              style={{
                color: "#16a34a",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Owner Register
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
