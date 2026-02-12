"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Property {
  _id: string;
  name: string;
  city: string;
  price: number;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export default function OwnerProperties() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  useEffect(() => {
    fetchProperties();
  }, [filter]);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem("ownerToken");
      if (!token) {
        router.push("/owner/auth/login");
        return;
      }

      const res = await fetch(`/api/owner/properties?filter=${filter}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setProperties(data);
      }
    } catch (error) {
      console.error("Error fetching properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this property?")) return;

    try {
      const token = localStorage.getItem("ownerToken");
      const res = await fetch(`/api/owner/properties/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        setProperties(properties.filter((p) => p._id !== id));
        alert("Property deleted");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const getStatusBadge = (status: string, reason?: string) => {
    const badges: Record<string, { bg: string; color: string; icon: string }> =
      {
        pending: { bg: "#fef3c7", color: "#b45309", icon: "⏳" },
        approved: { bg: "#dcfce7", color: "#166534", icon: "✅" },
        rejected: { bg: "#fee2e2", color: "#991b1b", icon: "❌" },
      };

    const badge = badges[status] || badges.pending;
    return (
      <div style={{ marginBottom: "0.5rem" }}>
        <span
          style={{
            display: "inline-block",
            background: badge.bg,
            color: badge.color,
            padding: "0.25rem 0.75rem",
            borderRadius: "12px",
            fontSize: "0.85rem",
            fontWeight: "600",
          }}
        >
          {badge.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
        {reason && (
          <p
            style={{
              fontSize: "0.85rem",
              color: "#666",
              margin: "0.5rem 0 0 0",
            }}
          >
            Reason: {reason}
          </p>
        )}
      </div>
    );
  };

  if (loading) {
    return <div>Loading properties...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            margin: "0 0 1rem 0",
          }}
        >
          🏠 My Properties
        </h1>

        {/* Filters */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            flexWrap: "wrap",
            marginBottom: "1.5rem",
          }}
        >
          {(["all", "pending", "approved", "rejected"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "0.5rem 1rem",
                background:
                  filter === f
                    ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                    : "#f3f4f6",
                color: filter === f ? "#fff" : "#374151",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.9rem",
              }}
            >
              {f === "all"
                ? "All"
                : f === "pending"
                  ? "⏳ Pending"
                  : f === "approved"
                    ? "✅ Approved"
                    : "❌ Rejected"}
            </button>
          ))}
        </div>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div
          style={{
            background: "#fff",
            padding: "3rem",
            borderRadius: "12px",
            textAlign: "center",
            color: "#666",
          }}
        >
          <p style={{ fontSize: "1.1rem", margin: 0 }}>No properties found</p>
          <Link
            href="/owner/properties/add"
            style={{
              display: "inline-block",
              marginTop: "1rem",
              padding: "0.75rem 1.5rem",
              background: "#667eea",
              color: "#fff",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: "600",
            }}
          >
            ➕ Add First Property
          </Link>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: "1.5rem",
          }}
        >
          {properties.map((property) => (
            <div
              key={property._id}
              style={{
                background: "#fff",
                borderRadius: "12px",
                padding: "1.5rem",
                boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                border: `2px solid ${
                  property.status === "approved"
                    ? "#10b981"
                    : property.status === "pending"
                      ? "#f59e0b"
                      : "#ef4444"
                }`,
              }}
            >
              <div
                style={{
                  fontSize: "1.1rem",
                  fontWeight: "700",
                  marginBottom: "0.5rem",
                }}
              >
                {property.name}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "#666",
                  marginBottom: "1rem",
                }}
              >
                📍 {property.city}
              </div>

              {getStatusBadge(property.status, property.rejectionReason)}

              <div
                style={{
                  fontSize: "1rem",
                  fontWeight: "700",
                  color: "#667eea",
                  marginBottom: "1rem",
                }}
              >
                ₹{property.price}/night
              </div>

              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button
                  onClick={() =>
                    router.push(`/owner/properties/${property._id}`)
                  }
                  style={{
                    flex: 1,
                    padding: "0.5rem 1rem",
                    background: "#667eea",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                  }}
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => handleDelete(property._id)}
                  style={{
                    flex: 1,
                    padding: "0.5rem 1rem",
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
