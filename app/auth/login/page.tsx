"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [accountType, setAccountType] = useState<"user" | "owner">("user");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const apiUrl =
        accountType === "owner" ? "/api/owner/auth/login" : "/api/user/login";

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
        credentials: "include",
      });

      const data = await response.json();

      if (response.ok) {
        // Clear old localStorage data first
        localStorage.removeItem("user");
        localStorage.removeItem("ownerToken");

        if (accountType === "owner") {
          // Store owner data
          if (data.owner) {
            const userObj = {
              ...data.owner,
              role: "owner",
            };
            localStorage.setItem("user", JSON.stringify(userObj));
            localStorage.setItem("ownerToken", data.accessToken);
          }
          router.push("/owner/dashboard");
        } else {
          console.log("Login successful:", {
            email: data.user.email,
            role: data.user.role,
          });
          localStorage.setItem("user", JSON.stringify(data.user));
          router.push("/");
        }
      } else {
        setError(data.error || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      const errorMsg =
        error instanceof Error
          ? error.message
          : "An error occurred. Please try again.";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setError("");
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
        <div style={{ maxWidth: "350px", margin: "0 auto", padding: "0 1rem" }}>
          {/* Main Card */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "1.75rem",
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
                marginBottom: "1.5rem",
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
                  padding: "0.6rem 1rem",
                  borderRadius: "50px",
                  border: "none",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  background:
                    accountType === "user"
                      ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                      : "transparent",
                  color: accountType === "user" ? "white" : "#64748b",
                  boxShadow:
                    accountType === "user"
                      ? "0 2px 8px rgba(59,130,246,0.3)"
                      : "none",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Personal Account
              </button>
              <button
                type="button"
                onClick={() => {
                  setAccountType("owner");
                  setError("");
                }}
                style={{
                  flex: 1,
                  padding: "0.6rem 1rem",
                  borderRadius: "50px",
                  border: "none",
                  fontSize: "0.85rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  background:
                    accountType === "owner"
                      ? "linear-gradient(135deg, #3b82f6, #2563eb)"
                      : "transparent",
                  color: accountType === "owner" ? "white" : "#64748b",
                  boxShadow:
                    accountType === "owner"
                      ? "0 2px 8px rgba(59,130,246,0.3)"
                      : "none",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Owner Account
              </button>
            </div>

            <h1
              style={{
                margin: "0 0 0.5rem",
                fontSize: "1.5rem",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              Welcome Back
            </h1>
            <p
              style={{
                margin: "0 0 1.5rem",
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              {accountType === "owner"
                ? "Login to manage your properties"
                : "Login to continue your journey"}
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

            {/* Login Form */}
            <form onSubmit={handleLogin}>
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
                    placeholder="Enter your password"
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
              </div>

              <div style={{ marginBottom: "1.5rem", textAlign: "right" }}>
                <a
                  href="/auth/forgot-password"
                  style={{
                    color: "#0066cc",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                  }}
                >
                  Forgot Password?
                </a>
              </div>

              <button
                type="submit"
                disabled={loading || !formData.email || !formData.password}
                style={{
                  width: "100%",
                  padding: "0.625rem",
                  background:
                    loading || !formData.email || !formData.password
                      ? "#9ca3af"
                      : accountType === "owner"
                        ? "#16a34a"
                        : "#0066cc",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  cursor:
                    loading || !formData.email || !formData.password
                      ? "not-allowed"
                      : "pointer",
                }}
              >
                {loading
                  ? "Logging in..."
                  : accountType === "owner"
                    ? "Login as Owner"
                    : "Login"}
              </button>
            </form>
          </div>

          {/* Sign Up Link */}
          <p
            style={{
              marginTop: "1.25rem",
              textAlign: "center",
              color: "#6b7280",
              fontSize: "0.875rem",
            }}
          >
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              style={{
                color: "#0066cc",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
