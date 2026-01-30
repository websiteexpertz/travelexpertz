"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";

interface UserProfile {
  name?: string;
  email?: string;
  gender?: string;
  dateOfBirth?: string;
  nationality?: string;
  maritalStatus?: string;
  anniversaryDate?: string;
  alternateContact?: string;
  city?: string;
  state?: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile>({});
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await fetch("/api/user/profile", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        setProfile({
          ...data.profile,
          dateOfBirth: data.profile?.dateOfBirth
            ? new Date(data.profile.dateOfBirth).toISOString().split("T")[0]
            : "",
          anniversaryDate: data.profile?.anniversaryDate
            ? new Date(data.profile.anniversaryDate).toISOString().split("T")[0]
            : "",
        });
      } else {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(profile),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Profile updated successfully!");
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError("New passwords do not match");
      return;
    }

    setError("");
    setMessage("");
    setSaving(true);

    try {
      const response = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Password changed successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setShowPasswordForm(false);
        setTimeout(() => setMessage(""), 3000);
      } else {
        setError(data.error || "Failed to change password");
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div
          style={{
            minHeight: "100vh",
            background: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p>Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          paddingTop: "2rem",
          paddingBottom: "4rem",
        }}
      >
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "0 1rem" }}>
          <h1 style={{ margin: "0 0 2rem", fontSize: "2rem", fontWeight: 700 }}>
            My Profile
          </h1>

          {error && (
            <div
              style={{
                padding: "0.75rem",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                borderRadius: "8px",
                color: "#dc2626",
                marginBottom: "1.5rem",
              }}
            >
              {error}
            </div>
          )}

          {message && (
            <div
              style={{
                padding: "0.75rem",
                background: "#f0fdf4",
                border: "1px solid #86efac",
                borderRadius: "8px",
                color: "#16a34a",
                marginBottom: "1.5rem",
              }}
            >
              {message}
            </div>
          )}

          {/* Account Info */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              marginBottom: "1.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                margin: "0 0 1rem",
                fontSize: "1.3rem",
                fontWeight: 600,
              }}
            >
              Account Information
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "150px 1fr",
                gap: "1rem",
                fontSize: "0.95rem",
              }}
            >
              <div style={{ color: "#6b7280", fontWeight: 600 }}>Mobile:</div>
              <div>{user?.mobile || "N/A"}</div>
              <div style={{ color: "#6b7280", fontWeight: 600 }}>Status:</div>
              <div>
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    background: "#dcfce7",
                    color: "#166534",
                    borderRadius: "12px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  {user?.mobileVerified ? "Verified" : "Not Verified"}
                </span>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              marginBottom: "1.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                margin: "0 0 1.5rem",
                fontSize: "1.3rem",
                fontWeight: 600,
              }}
            >
              Personal Information
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1.5rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, name: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  Email
                </label>
                <input
                  type="email"
                  value={profile.email || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, email: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  Gender
                </label>
                <select
                  value={profile.gender || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, gender: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                >
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={profile.dateOfBirth || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, dateOfBirth: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  Nationality
                </label>
                <input
                  type="text"
                  value={profile.nationality || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, nationality: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  Marital Status
                </label>
                <select
                  value={profile.maritalStatus || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, maritalStatus: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                >
                  <option value="">Select</option>
                  <option value="single">Single</option>
                  <option value="married">Married</option>
                  <option value="divorced">Divorced</option>
                  <option value="widowed">Widowed</option>
                </select>
              </div>

              {profile.maritalStatus === "married" && (
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    Anniversary Date
                  </label>
                  <input
                    type="date"
                    value={profile.anniversaryDate || ""}
                    onChange={(e) =>
                      setProfile({
                        ...profile,
                        anniversaryDate: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                    }}
                  />
                </div>
              )}
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              style={{
                marginTop: "1.5rem",
                padding: "0.75rem 2rem",
                background: saving ? "#9ca3af" : "#0066cc",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Contact Info */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              marginBottom: "1.5rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                margin: "0 0 1.5rem",
                fontSize: "1.3rem",
                fontWeight: 600,
              }}
            >
              Contact Information
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: "1.5rem",
              }}
            >
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  Alternate Contact
                </label>
                <input
                  type="tel"
                  value={profile.alternateContact || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, alternateContact: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  City
                </label>
                <input
                  type="text"
                  value={profile.city || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, city: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: "0.5rem",
                    fontWeight: 600,
                    fontSize: "0.9rem",
                  }}
                >
                  State
                </label>
                <input
                  type="text"
                  value={profile.state || ""}
                  onChange={(e) =>
                    setProfile({ ...profile, state: e.target.value })
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </div>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              style={{
                marginTop: "1.5rem",
                padding: "0.75rem 2rem",
                background: saving ? "#9ca3af" : "#0066cc",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: saving ? "not-allowed" : "pointer",
              }}
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>

          {/* Password Change */}
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "2rem",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <h2
              style={{
                margin: "0 0 1rem",
                fontSize: "1.3rem",
                fontWeight: 600,
              }}
            >
              Change Password
            </h2>

            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                style={{
                  padding: "0.75rem 2rem",
                  background: "#6b7280",
                  color: "white",
                  border: "none",
                  borderRadius: "8px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Change Password
              </button>
            ) : (
              <div>
                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div style={{ marginBottom: "1.5rem" }}>
                  <label
                    style={{
                      display: "block",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      fontSize: "0.9rem",
                    }}
                  >
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                    }}
                  />
                </div>

                <div style={{ display: "flex", gap: "1rem" }}>
                  <button
                    onClick={handleChangePassword}
                    disabled={saving}
                    style={{
                      padding: "0.75rem 2rem",
                      background: saving ? "#9ca3af" : "#0066cc",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontWeight: 600,
                      cursor: saving ? "not-allowed" : "pointer",
                    }}
                  >
                    {saving ? "Changing..." : "Update Password"}
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordForm(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    style={{
                      padding: "0.75rem 2rem",
                      background: "transparent",
                      color: "#6b7280",
                      border: "1px solid #d1d5db",
                      borderRadius: "8px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
