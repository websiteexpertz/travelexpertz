"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Link from "next/link";

export default function OwnerLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/owner/auth/login", {
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

        console.log("=== OWNER LOGIN SUCCESS ===");
        console.log("Response data:", data);
        console.log("Owner data:", data.owner);

        // Store owner data in localStorage
        if (data.owner) {
          const userObj = {
            ...data.owner,
            role: "owner",
          };
          console.log("Storing user object:", userObj);
          localStorage.setItem("user", JSON.stringify(userObj));
          localStorage.setItem("ownerToken", data.accessToken);
        }

        // Redirect to owner dashboard
        router.push("/owner/dashboard");
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
            <h1
              style={{
                margin: "0 0 0.5rem",
                fontSize: "1.5rem",
                fontWeight: 700,
                textAlign: "center",
              }}
            >
              Owner Login
            </h1>
            <p
              style={{
                margin: "0 0 1.5rem",
                color: "#6b7280",
                textAlign: "center",
              }}
            >
              Manage your properties
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
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    handleInputChange("password", e.target.value)
                  }
                  placeholder="Enter your password"
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

              <div style={{ marginBottom: "1.5rem", textAlign: "right" }}>
                <a
                  href="/owner/auth/forgot-password"
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
                {loading ? "Logging in..." : "Login"}
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
              href="/owner/auth/register"
              style={{
                color: "#0066cc",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Sign Up
            </Link>
          </p>

          {/* Back to Guest Login Link */}
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
              href="/auth/login"
              style={{
                color: "#16a34a",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Guest Login
            </Link>
          </p>
        </div>
      </div>
    </>
  );
}
