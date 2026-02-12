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

export default function OwnerProfilePage() {
  const [profile, setProfile] = useState<OwnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
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
