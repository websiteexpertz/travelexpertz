"use client";

import { useState, useEffect } from "react";

interface TravelInquiryFormProps {
  packageId: string;
  packageTitle: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function TravelInquiryForm({
  packageId,
  packageTitle,
  onClose,
  onSuccess,
}: TravelInquiryFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    startDate: "",
    endDate: "",
    adults: 1,
    children: 0,
    accommodationType: "Standard",
    budget: "",
    modeOfTravel: "Road",
    carType: "Hatchback",
    additionalDetails: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/user-profile", {
        credentials: "include",
      });
      if (response.ok) {
        const user = await response.json();
        setUserProfile(user);
        setIsAuthenticated(true);
        setFormData((prev) => ({
          ...prev,
          fullName: user.name || prev.fullName,
          email: user.email || prev.email,
          phone: user.mobile || prev.phone,
        }));
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setIsAuthenticated(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "adults" || name === "children" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.fullName || !formData.phone || !formData.email) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (!formData.startDate) {
      setError("Please select a start date");
      setLoading(false);
      return;
    }

    try {
      // If user is authenticated, create a booking for easier tracking
      if (isAuthenticated && userProfile) {
        const bookingResponse = await fetch("/api/package-bookings", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            packageId,
            packageTitle,
            ...formData,
          }),
        });

        if (!bookingResponse.ok) {
          const data = await bookingResponse.json();
          throw new Error(data.error || "Failed to create booking");
        }
      }

      // Also submit as inquiry for admin to handle
      const inquiryResponse = await fetch("/api/package-inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId,
          packageTitle,
          ...formData,
        }),
      });

      if (inquiryResponse.ok) {
        setFormData({
          fullName: "",
          phone: "",
          email: "",
          startDate: "",
          endDate: "",
          adults: 1,
          children: 0,
          accommodationType: "Standard",
          budget: "",
          modeOfTravel: "Road",
          carType: "Hatchback",
          additionalDetails: "",
        });
        onSuccess();
      } else {
        const data = await inquiryResponse.json();
        setError(data.error || "Failed to submit inquiry");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.5)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "1.5rem",
          padding: "2rem",
          maxWidth: "600px",
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1f2937",
                margin: 0,
              }}
            >
              Travel Inquiry
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#6b7280",
                margin: "0.5rem 0 0 0",
              }}
            >
              {packageTitle}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "0.5rem",
              fontSize: "1.5rem",
              color: "#6b7280",
            }}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div
              style={{
                backgroundColor: "#fee2e2",
                color: "#991b1b",
                padding: "1rem",
                borderRadius: "0.5rem",
                marginBottom: "1rem",
                fontSize: "0.875rem",
              }}
            >
              {error}
            </div>
          )}

          <div style={{ marginBottom: "1.25rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#1f2937",
                marginBottom: "0.5rem",
              }}
            >
              Full Name <span style={{ color: "#dc2626" }}>*</span>
            </label>
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleChange}
              placeholder="Enter your full name"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.95rem",
                boxSizing: "border-box",
              }}
              required
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#1f2937",
                  marginBottom: "0.5rem",
                }}
              >
                Phone Number <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="10-digit number"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#1f2937",
                  marginBottom: "0.5rem",
                }}
              >
                Email <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#1f2937",
                  marginBottom: "0.5rem",
                }}
              >
                Travel Start Date <span style={{ color: "#dc2626" }}>*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                min={new Date().toISOString().split("T")[0]}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#1f2937",
                  marginBottom: "0.5rem",
                }}
              >
                Travel End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                min={
                  formData.startDate || new Date().toISOString().split("T")[0]
                }
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#1f2937",
                  marginBottom: "0.5rem",
                }}
              >
                Number of Travelers
              </label>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "0.5rem",
                }}
              >
                <select
                  name="adults"
                  value={formData.adults}
                  onChange={handleChange}
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: "0.9rem",
                  }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                    <option key={num} value={num}>
                      {num} Adults
                    </option>
                  ))}
                </select>
                <select
                  name="children"
                  value={formData.children}
                  onChange={handleChange}
                  style={{
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "0.5rem",
                    fontSize: "0.9rem",
                  }}
                >
                  {[0, 1, 2, 3, 4, 5].map((num) => (
                    <option key={num} value={num}>
                      {num} Kids
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#1f2937",
                  marginBottom: "0.5rem",
                }}
              >
                Accommodation Type
              </label>
              <select
                name="accommodationType"
                value={formData.accommodationType}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
              >
                <option value="Standard">Standard</option>
                <option value="Deluxe">Deluxe</option>
                <option value="Super Deluxe">Super Deluxe</option>
                <option value="Luxury">Luxury</option>
                <option value="Premium">Premium</option>
                <option value="Homestay">Homestay</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#1f2937",
                  marginBottom: "0.5rem",
                }}
              >
                Budget (Approx)
              </label>
              <input
                type="text"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                placeholder="e.g. 1,25,000"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
              />
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "1rem",
              marginBottom: "1.25rem",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#1f2937",
                  marginBottom: "0.5rem",
                }}
              >
                Mode of Yatra
              </label>
              <select
                name="modeOfTravel"
                value={formData.modeOfTravel}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
              >
                <option value="Road">Road</option>
                <option value="Helicopter">Helicopter</option>
              </select>
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: 600,
                  color: "#1f2937",
                  marginBottom: "0.5rem",
                }}
              >
                Type of Car
              </label>
              <select
                name="carType"
                value={formData.carType}
                onChange={handleChange}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                  fontSize: "0.95rem",
                  boxSizing: "border-box",
                }}
              >
                <option value="Hatchback">Hatchback</option>
                <option value="Sedan">Sedan</option>
                <option value="SUV 4 Seater">SUV 4 Seater</option>
                <option value="SUV 6 Seater">SUV 6 Seater</option>
                <option value="Tempo Traveller">Tempo Traveller</option>
              </select>
            </div>
          </div>

          <div style={{ marginBottom: "1.5rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: 600,
                color: "#1f2937",
                marginBottom: "0.5rem",
              }}
            >
              Additional Details
            </label>
            <textarea
              name="additionalDetails"
              value={formData.additionalDetails}
              onChange={handleChange}
              placeholder="Share travel dates, special requests, or other notes"
              rows={4}
              style={{
                width: "100%",
                padding: "0.75rem",
                border: "1px solid #d1d5db",
                borderRadius: "0.5rem",
                fontSize: "0.95rem",
                fontFamily: "inherit",
                boxSizing: "border-box",
                resize: "vertical",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "0.875rem",
              background: "#0066cc",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? "Submitting..." : "Submit Inquiry"}
          </button>
        </form>
      </div>
    </div>
  );
}
