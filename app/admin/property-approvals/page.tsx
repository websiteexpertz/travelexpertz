"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Property {
  _id: string;
  name: string;
  propertyType: string;
  city: string;
  price: number;
  status: "pending" | "approved" | "rejected";
  ownerName: string;
  ownerEmail: string;
  submittedAt: string;
  description?: string;
}

export default function PropertyApprovalsAdmin() {
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("pending");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetchProperties();
  }, [filter]);

  const fetchProperties = async () => {
    try {
      const res = await fetch(`/api/admin/property-approvals?filter=${filter}`);
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

  const handleApprove = async (id: string) => {
    if (!confirm("Approve this property?")) return;

    try {
      const res = await fetch(`/api/admin/property-approvals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "approved",
          notes,
        }),
      });

      if (res.ok) {
        alert("Property approved!");
        setNotes("");
        setSelectedId(null);
        setShowDetail(false);
        fetchProperties();
      }
    } catch (error) {
      console.error("Error approving:", error);
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason");
      return;
    }

    if (!confirm("Reject this property?")) return;

    try {
      const res = await fetch(`/api/admin/property-approvals/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: "rejected",
          rejectionReason,
          notes,
        }),
      });

      if (res.ok) {
        alert("Property rejected");
        setRejectionReason("");
        setNotes("");
        setSelectedId(null);
        setShowDetail(false);
        fetchProperties();
      }
    } catch (error) {
      console.error("Error rejecting:", error);
    }
  };

  const selectedProperty = properties.find((p) => p._id === selectedId);

  if (loading) {
    return (
      <div
        style={{
          padding: "2rem",
          paddingTop: "5rem",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "2rem",
        paddingTop: "5rem",
        maxWidth: "1400px",
        margin: "0 auto",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%)",
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: "2rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <button
          onClick={() => router.push("/admin")}
          style={{
            background: "#e5e7eb",
            color: "#374151",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          ← Back
        </button>
        <h1
          style={{
            margin: 0,
            fontSize: "1.75rem",
            fontWeight: "700",
            color: "#1a1a2e",
          }}
        >
          ✅ Property Approval Requests
        </h1>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "2rem",
        }}
      >
        {/* Left: Properties List */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
          }}
        >
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: "700",
              marginBottom: "1.5rem",
            }}
          >
            📋 Properties
          </h2>

          {/* Filters */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
            }}
          >
            {(["pending", "approved", "rejected", "all"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  padding: "0.5rem 1rem",
                  background: filter === f ? "#667eea" : "#f3f4f6",
                  color: filter === f ? "#fff" : "#374151",
                  border: "none",
                  borderRadius: "8px",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "0.85rem",
                }}
              >
                {f === "pending"
                  ? "⏳ Pending"
                  : f === "approved"
                    ? "✅ Approved"
                    : f === "rejected"
                      ? "❌ Rejected"
                      : "All"}
              </button>
            ))}
          </div>

          {/* Properties */}
          {properties.length === 0 ? (
            <div
              style={{ textAlign: "center", color: "#999", padding: "2rem 0" }}
            >
              No properties found
            </div>
          ) : (
            <div
              style={{
                maxHeight: "600px",
                overflowY: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              {properties.map((prop) => (
                <div
                  key={prop._id}
                  onClick={() => {
                    setSelectedId(prop._id);
                    setShowDetail(true);
                  }}
                  style={{
                    padding: "1rem",
                    background: selectedId === prop._id ? "#f0f4ff" : "#f9fafb",
                    border:
                      selectedId === prop._id
                        ? "2px solid #667eea"
                        : "1px solid #e0e0e0",
                    borderRadius: "8px",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                >
                  <div
                    style={{
                      fontWeight: "600",
                      marginBottom: "0.25rem",
                    }}
                  >
                    {prop.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#666",
                      marginBottom: "0.5rem",
                    }}
                  >
                    👤 {prop.ownerName} ({prop.ownerEmail})
                  </div>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#666",
                      marginBottom: "0.5rem",
                    }}
                  >
                    📍 {prop.city} · {prop.propertyType}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      gap: "0.5rem",
                      alignItems: "center",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.25rem 0.75rem",
                        background:
                          prop.status === "pending"
                            ? "#fef3c7"
                            : prop.status === "approved"
                              ? "#dcfce7"
                              : "#fee2e2",
                        color:
                          prop.status === "pending"
                            ? "#b45309"
                            : prop.status === "approved"
                              ? "#166534"
                              : "#991b1b",
                        borderRadius: "12px",
                        fontSize: "0.75rem",
                        fontWeight: "600",
                      }}
                    >
                      {prop.status === "pending"
                        ? "⏳ Pending"
                        : prop.status === "approved"
                          ? "✅ Approved"
                          : "❌ Rejected"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Details Panel */}
        <div
          style={{
            background: "#fff",
            borderRadius: "16px",
            padding: "2rem",
            boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
            height: "fit-content",
          }}
        >
          {selectedProperty && showDetail ? (
            <>
              <h2
                style={{
                  fontSize: "1.2rem",
                  fontWeight: "700",
                  marginBottom: "1rem",
                }}
              >
                📝 Property Details
              </h2>

              <div style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#666",
                    marginBottom: "0.25rem",
                  }}
                >
                  Property Name
                </div>
                <div style={{ fontSize: "1.1rem", fontWeight: "700" }}>
                  {selectedProperty.name}
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#666",
                    marginBottom: "0.25rem",
                  }}
                >
                  Owner
                </div>
                <div>
                  <div style={{ fontWeight: "600" }}>
                    {selectedProperty.ownerName}
                  </div>
                  <div style={{ fontSize: "0.9rem", color: "#666" }}>
                    {selectedProperty.ownerEmail}
                  </div>
                </div>
              </div>

              <div style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "#666",
                    marginBottom: "0.25rem",
                  }}
                >
                  Details
                </div>
                <div style={{ fontSize: "0.9rem", lineHeight: "1.6" }}>
                  <div>Type: {selectedProperty.propertyType}</div>
                  <div>City: {selectedProperty.city}</div>
                  <div>Price: ₹{selectedProperty.price}/night</div>
                  <div>
                    Submitted:{" "}
                    {new Date(
                      selectedProperty.submittedAt,
                    ).toLocaleDateString()}
                  </div>
                </div>
              </div>

              {selectedProperty.status === "pending" && (
                <>
                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                      }}
                    >
                      📝 Approval Notes (Optional)
                    </label>
                    <textarea
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add notes..."
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "2px solid #e0e0e0",
                        borderRadius: "8px",
                        minHeight: "80px",
                        boxSizing: "border-box",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>

                  <div style={{ marginBottom: "1.5rem" }}>
                    <label
                      style={{
                        display: "block",
                        marginBottom: "0.5rem",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                      }}
                    >
                      ❌ Rejection Reason (if rejecting)
                    </label>
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Explain why you're rejecting..."
                      style={{
                        width: "100%",
                        padding: "0.75rem",
                        border: "2px solid #e0e0e0",
                        borderRadius: "8px",
                        minHeight: "80px",
                        boxSizing: "border-box",
                        fontSize: "0.9rem",
                      }}
                    />
                  </div>

                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <button
                      onClick={() => handleApprove(selectedProperty._id)}
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        background: "#10b981",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "700",
                        fontSize: "0.9rem",
                      }}
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleReject(selectedProperty._id)}
                      style={{
                        flex: 1,
                        padding: "0.75rem",
                        background: "#ef4444",
                        color: "#fff",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer",
                        fontWeight: "700",
                        fontSize: "0.9rem",
                      }}
                    >
                      ❌ Reject
                    </button>
                  </div>
                </>
              )}

              {selectedProperty.status !== "pending" && (
                <div
                  style={{
                    padding: "1rem",
                    background:
                      selectedProperty.status === "approved"
                        ? "#dcfce7"
                        : "#fee2e2",
                    color:
                      selectedProperty.status === "approved"
                        ? "#166534"
                        : "#991b1b",
                    borderRadius: "8px",
                    fontSize: "0.9rem",
                  }}
                >
                  Status:{" "}
                  {selectedProperty.status === "approved"
                    ? "✅ Approved"
                    : "❌ Rejected"}
                </div>
              )}
            </>
          ) : (
            <div
              style={{
                textAlign: "center",
                color: "#999",
                padding: "2rem",
              }}
            >
              Select a property to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
