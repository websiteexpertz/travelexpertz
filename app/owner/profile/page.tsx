"use client";

import { useEffect, useState } from "react";

interface OwnerProfile {
  _id: string;
  email: string;
  ownerName: string;
  businessName: string;
  businessType: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  languages: string;
  verified: boolean;
  active: boolean;
}

interface Booking {
  _id: string;
  guestName: string;
  propertyName?: string;
  hotelId?: string;
  homestayId?: string;
  checkin: string;
  checkout: string;
  guests: number;
  nights: number;
  totalPrice: number;
  bookingStatus: string;
  createdAt: string;
}

export default function OwnerProfilePage() {
  const [activeTab, setActiveTab] = useState<"profile" | "bookings">("profile");
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("ownerToken");
        const res = await fetch("/api/owner/profile", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          credentials: "include",
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || "Failed to load profile");
        } else {
          setProfile(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const fetchBookings = async () => {
    if (bookingsLoading) return;
    setBookingsLoading(true);
    try {
      const res = await fetch("/api/owner/bookings", {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to load bookings");
      } else {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load bookings");
    } finally {
      setBookingsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "bookings" && bookings.length === 0 && !bookingsLoading) {
      fetchBookings();
    }
  }, [activeTab]);

  const handleChange = (field: keyof OwnerProfile, value: string) => {
    if (!profile) return;
    setProfile({ ...profile, [field]: value });
    setError("");
    setSuccess("");
  };

  const handleSave = async () => {
    if (!profile) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const token = localStorage.getItem("ownerToken");
      const res = await fetch("/api/owner/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        credentials: "include",
        body: JSON.stringify({
          ownerName: profile.ownerName,
          businessName: profile.businessName,
          businessType: profile.businessType,
          phone: profile.phone,
          address: profile.address,
          city: profile.city,
          state: profile.state,
          languages: profile.languages,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save profile");
      } else {
        setProfile(data);
        localStorage.setItem("owner", JSON.stringify(data));
        localStorage.setItem(
          "user",
          JSON.stringify({ ...data, role: "owner" }),
        );
        setSuccess("Profile updated successfully");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: "2rem" }}>Loading profile...</div>;
  }

  if (error && !profile) {
    return <div style={{ padding: "2rem", color: "#b91c1c" }}>{error}</div>;
  }

  if (!profile) return null;

  return (
    <div
      style={{
        background: "#fff",
        padding: "2rem",
        borderRadius: "12px",
        boxShadow: "0 6px 18px rgba(0,0,0,0.08)",
      }}
    >
      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: "2rem",
          borderBottom: "2px solid #e5e7eb",
          marginBottom: "2rem",
        }}
      >
        <button
          onClick={() => {
            setActiveTab("profile");
            setError("");
          }}
          style={{
            padding: "1rem 0",
            border: "none",
            background: "none",
            fontSize: "1rem",
            fontWeight: activeTab === "profile" ? 700 : 600,
            color: activeTab === "profile" ? "#2563eb" : "#6b7280",
            cursor: "pointer",
            borderBottom: activeTab === "profile" ? "3px solid #2563eb" : "none",
            marginBottom: "-2px",
            transition: "all 0.3s ease",
          }}
        >
          👤 Profile
        </button>
        <button
          onClick={() => {
            setActiveTab("bookings");
            setError("");
          }}
          style={{
            padding: "1rem 0",
            border: "none",
            background: "none",
            fontSize: "1rem",
            fontWeight: activeTab === "bookings" ? 700 : 600,
            color: activeTab === "bookings" ? "#2563eb" : "#6b7280",
            cursor: "pointer",
            borderBottom: activeTab === "bookings" ? "3px solid #2563eb" : "none",
            marginBottom: "-2px",
            transition: "all 0.3s ease",
          }}
        >
          📅 Bookings
        </button>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1.5rem",
            }}
          >
            <div>
              <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700 }}>
                Owner Profile
              </h2>
              <p style={{ margin: "0.3rem 0 0", color: "#6b7280" }}>
                Update your personal and business information
              </p>
            </div>
            <div
              style={{
                padding: "0.35rem 0.75rem",
                borderRadius: "999px",
                background: profile.verified ? "#dcfce7" : "#fef9c3",
                color: profile.verified ? "#166534" : "#92400e",
                fontWeight: 600,
                fontSize: "0.85rem",
              }}
            >
              {profile.verified ? "Verified" : "Pending Verification"}
            </div>
          </div>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                color: "#b91c1c",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                marginBottom: "1rem",
              }}
            >
              {error}
            </div>
          )}

          {success && (
            <div
              style={{
                background: "#ecfdf3",
                color: "#166534",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                marginBottom: "1rem",
              }}
            >
              {success}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1rem",
            }}
          >
            <Field
              label="Owner Name"
              value={profile.ownerName}
              onChange={(v) => handleChange("ownerName", v)}
              required
            />
            <Field
              label="Business Name"
              value={profile.businessName}
              onChange={(v) => handleChange("businessName", v)}
              required
            />
            <Field
              label="Business Type"
              value={profile.businessType}
              onChange={(v) => handleChange("businessType", v)}
              placeholder="hotel / homestay / both"
            />
            <Field
              label="Phone"
              value={profile.phone}
              onChange={(v) => handleChange("phone", v)}
              placeholder="Contact number"
            />
            <Field
              label="City"
              value={profile.city}
              onChange={(v) => handleChange("city", v)}
            />
            <Field
              label="State"
              value={profile.state}
              onChange={(v) => handleChange("state", v)}
            />
            <Field
              label="Address"
              value={profile.address}
              onChange={(v) => handleChange("address", v)}
              textarea
              fullWidth
            />
            <Field
              label="Languages Spoken"
              value={profile.languages}
              onChange={(v) => handleChange("languages", v)}
              placeholder="English, Hindi"
              fullWidth
              helper="Comma-separated list"
            />
            <Field
              label="Email"
              value={profile.email}
              disabled
              helper="Email cannot be changed"
            />
          </div>

          <div style={{ marginTop: "1.5rem", display: "flex", gap: "0.75rem" }}>
            <button
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
                color: "#fff",
                border: "none",
                borderRadius: "10px",
                fontWeight: 700,
                cursor: saving ? "not-allowed" : "pointer",
                boxShadow: "0 8px 20px rgba(37, 99, 235, 0.25)",
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === "bookings" && (
        <div>
          <h2 style={{ margin: 0, fontSize: "1.4rem", fontWeight: 700, marginBottom: "1rem" }}>
            📅 My Bookings
          </h2>

          {error && (
            <div
              style={{
                background: "#fef2f2",
                color: "#b91c1c",
                padding: "0.75rem 1rem",
                borderRadius: "10px",
                marginBottom: "1rem",
              }}
            >
              {error}
            </div>
          )}

          {bookingsLoading ? (
            <div style={{ textAlign: "center", padding: "2rem", color: "#6b7280" }}>
              Loading bookings...
            </div>
          ) : bookings.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                background: "#f9fafb",
                borderRadius: "10px",
                color: "#6b7280",
              }}
            >
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
              <p>No bookings yet</p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.95rem",
                }}
              >
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb" }}>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700 }}>Guest Name</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700 }}>Property</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700 }}>Check-in</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700 }}>Check-out</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700 }}>Nights</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700 }}>Guests</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700 }}>Amount</th>
                    <th style={{ padding: "1rem", textAlign: "left", fontWeight: 700 }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking, idx) => {
                    const checkin = new Date(booking.checkin).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                    const checkout = new Date(booking.checkout).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    });
                    const statusColor =
                      booking.bookingStatus === "confirmed"
                        ? "#10b981"
                        : booking.bookingStatus === "cancelled"
                          ? "#ef4444"
                          : "#f59e0b";

                    return (
                      <tr
                        key={booking._id}
                        style={{
                          borderBottom: "1px solid #e5e7eb",
                          background: idx % 2 === 0 ? "#fff" : "#f9fafb",
                        }}
                      >
                        <td style={{ padding: "1rem" }}>{booking.guestName}</td>
                        <td style={{ padding: "1rem" }}>{booking.propertyName || "Property"}</td>
                        <td style={{ padding: "1rem" }}>{checkin}</td>
                        <td style={{ padding: "1rem" }}>{checkout}</td>
                        <td style={{ padding: "1rem", textAlign: "center" }}>{booking.nights}</td>
                        <td style={{ padding: "1rem", textAlign: "center" }}>{booking.guests}</td>
                        <td style={{ padding: "1rem", fontWeight: 700 }}>₹{booking.totalPrice.toFixed(2)}</td>
                        <td style={{ padding: "1rem" }}>
                          <span
                            style={{
                              display: "inline-block",
                              padding: "0.35rem 0.75rem",
                              borderRadius: "999px",
                              background: statusColor + "22",
                              color: statusColor,
                              fontWeight: 600,
                              fontSize: "0.85rem",
                              textTransform: "capitalize",
                            }}
                          >
                            {booking.bookingStatus}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  required,
  textarea,
  fullWidth,
  helper,
}: {
  label: string;
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  textarea?: boolean;
  fullWidth?: boolean;
  helper?: string;
}) {
  return (
    <div style={{ gridColumn: fullWidth ? "1 / -1" : undefined }}>
      <label
        style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem" }}
      >
        {label}
      </label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          style={{
            width: "100%",
            minHeight: "90px",
            padding: "0.65rem 0.75rem",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            fontSize: "0.95rem",
            resize: "vertical",
            background: disabled ? "#f9fafb" : "white",
          }}
        />
      ) : (
        <input
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          style={{
            width: "100%",
            padding: "0.65rem 0.75rem",
            borderRadius: "10px",
            border: "1px solid #e5e7eb",
            fontSize: "0.95rem",
            background: disabled ? "#f9fafb" : "white",
            boxSizing: "border-box",
          }}
        />
      )}
      {helper && (
        <p
          style={{
            margin: "0.35rem 0 0",
            color: "#9ca3af",
            fontSize: "0.85rem",
          }}
        >
          {helper}
        </p>
      )}
    </div>
  );
}
