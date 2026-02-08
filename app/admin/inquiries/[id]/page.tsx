"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface PackageInquiry {
  _id: string;
  packageId: string;
  packageTitle: string;
  customer: {
    fullName: string;
    phone: string;
    email: string;
  };
  travelDetails: {
    startDate: string;
    adults: number;
    children: number;
    accommodationType: string;
    budget: string;
    modeOfTravel: string;
    carType: string;
    additionalDetails: string;
  };
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    padding: "2rem",
    paddingTop: "5rem",
    maxWidth: "1400px",
    margin: "0 auto",
    minHeight: "100vh",
    background: "#f9fafb",
  },
  header: {
    marginBottom: "2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "2rem",
  },
  backButton: {
    background: "none",
    border: "none",
    color: "#0066cc",
    cursor: "pointer",
    fontSize: "0.9rem",
    fontWeight: 600,
    marginBottom: "1rem",
    padding: 0,
  },
  title: {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#1f2937",
    margin: 0,
  },
  statusBadge: {
    padding: "0.875rem 1.75rem",
    borderRadius: "12px",
    fontSize: "0.95rem",
    fontWeight: 700,
    textTransform: "capitalize",
    whiteSpace: "nowrap",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  card: {
    background: "white",
    borderRadius: "12px",
    padding: "1.75rem",
    marginBottom: "1.5rem",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  },
  cardTitle: {
    fontSize: "0.9rem",
    fontWeight: 700,
    color: "#6b7280",
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    marginBottom: "1.5rem",
  },
  twoColumnGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
    marginBottom: "1.5rem",
  },
  infoGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "0.5rem",
  },
  infoLabel: {
    fontSize: "0.85rem",
    fontWeight: 600,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  infoValue: {
    fontSize: "1.05rem",
    fontWeight: 600,
    color: "#1f2937",
  },
  infoLink: {
    fontSize: "1.05rem",
    fontWeight: 600,
    color: "#0066cc",
    textDecoration: "none",
  },
  gridLayout: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1.5rem",
  },
  textarea: {
    width: "100%",
    padding: "1rem",
    border: "2px solid #e5e7eb",
    borderRadius: "10px",
    fontSize: "0.95rem",
    fontFamily: "inherit",
    resize: "vertical",
    minHeight: "120px",
    boxSizing: "border-box",
    outline: "none",
  },
  buttonGroup: {
    display: "flex",
    gap: "1rem",
    flexWrap: "wrap",
    marginTop: "1.5rem",
  },
  button: {
    padding: "0.875rem 1.75rem",
    border: "none",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: "0.95rem",
    transition: "all 0.2s ease",
  },
  approveButton: {
    background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    color: "white",
    boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
  },
  pendingButton: {
    background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "white",
    boxShadow: "0 4px 12px rgba(245, 158, 11, 0.3)",
  },
  rejectButton: {
    background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    color: "white",
    boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
  },
  loadingContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "60vh",
    color: "#6b7280",
    fontSize: "1.1rem",
  },
};

export default function InquiryDetail() {
  const params = useParams();
  const router = useRouter();
  const inquiryId = params?.id as string;

  const [inquiry, setInquiry] = useState<PackageInquiry | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [adminNotes, setAdminNotes] = useState("");

  useEffect(() => {
    const fetchInquiry = async () => {
      if (!inquiryId) return;
      try {
        setLoading(true);
        const response = await fetch(`/api/package-inquiries/${inquiryId}`);
        if (response.ok) {
          const data = await response.json();
          setInquiry(data.inquiry);
        } else {
          console.error("Failed to fetch inquiry");
        }
      } catch (error) {
        console.error("Error fetching inquiry:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiry();
  }, [inquiryId]);

  const updateStatus = async (
    newStatus: "pending" | "approved" | "rejected",
  ) => {
    if (!inquiry) return;
    try {
      setUpdating(true);
      const response = await fetch(`/api/package-inquiries/${inquiryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          adminNotes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setInquiry(data.inquiry);
        setAdminNotes("");
        alert("Inquiry status updated successfully!");
      } else {
        alert("Failed to update inquiry status");
      }
    } catch (error) {
      console.error("Error updating inquiry:", error);
      alert("Error updating inquiry");
    } finally {
      setUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "pending":
        return {
          background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)",
          color: "#92400e",
        };
      case "approved":
        return {
          background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
          color: "#065f46",
        };
      case "rejected":
        return {
          background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
          color: "#7f1d1d",
        };
      default:
        return {
          background: "#f3f4f6",
          color: "#6b7280",
        };
    }
  };

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <p>Loading inquiry details...</p>
        </div>
      </div>
    );
  }

  if (!inquiry) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingContainer}>
          <p>Inquiry not found</p>
        </div>
      </div>
    );
  }

  const statusStyles = getStatusStyles(inquiry.status);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ flex: 1 }}>
          <button onClick={() => router.back()} style={styles.backButton}>
            ← Back to Inquiries
          </button>
          <h1 style={styles.title}>{inquiry.packageTitle}</h1>
        </div>
        <span style={{ ...styles.statusBadge, ...statusStyles }}>
          {inquiry.status}
        </span>
      </div>

      {/* Customer Information */}
      <div style={styles.twoColumnGrid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>👤 Customer Details</h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div style={styles.infoGroup}>
              <span style={styles.infoLabel}>Full Name</span>
              <span style={styles.infoValue}>{inquiry.customer.fullName}</span>
            </div>
            <div style={styles.infoGroup}>
              <span style={styles.infoLabel}>Email Address</span>
              <a
                href={`mailto:${inquiry.customer.email}`}
                style={styles.infoLink}
              >
                {inquiry.customer.email}
              </a>
            </div>
            <div style={styles.infoGroup}>
              <span style={styles.infoLabel}>Phone Number</span>
              <a href={`tel:${inquiry.customer.phone}`} style={styles.infoLink}>
                {inquiry.customer.phone}
              </a>
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardTitle}>📅 Inquiry Timeline</h3>
          <div
            style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
          >
            <div style={styles.infoGroup}>
              <span style={styles.infoLabel}>Submitted On</span>
              <span style={styles.infoValue}>
                {formatDate(inquiry.createdAt)}
              </span>
            </div>
            <div style={styles.infoGroup}>
              <span style={styles.infoLabel}>Last Updated</span>
              <span style={styles.infoValue}>
                {formatDate(inquiry.updatedAt)}
              </span>
            </div>
            <div style={styles.infoGroup}>
              <span style={styles.infoLabel}>Status</span>
              <span
                style={{
                  ...styles.statusBadge,
                  ...getStatusStyles(inquiry.status),
                  padding: "0.5rem 1rem",
                  fontSize: "0.9rem",
                }}
              >
                {inquiry.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Travel Details */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>✈️ Travel Details</h3>
        <div style={styles.gridLayout}>
          <div style={styles.infoGroup}>
            <span style={styles.infoLabel}>Travel Date</span>
            <span style={styles.infoValue}>
              {new Date(inquiry.travelDetails.startDate).toLocaleDateString(
                "en-IN",
              )}
            </span>
          </div>
          <div style={styles.infoGroup}>
            <span style={styles.infoLabel}>Adults</span>
            <span style={styles.infoValue}>{inquiry.travelDetails.adults}</span>
          </div>
          <div style={styles.infoGroup}>
            <span style={styles.infoLabel}>Children</span>
            <span style={styles.infoValue}>
              {inquiry.travelDetails.children}
            </span>
          </div>
          <div style={styles.infoGroup}>
            <span style={styles.infoLabel}>Accommodation</span>
            <span style={styles.infoValue}>
              {inquiry.travelDetails.accommodationType}
            </span>
          </div>
          <div style={styles.infoGroup}>
            <span style={styles.infoLabel}>Budget</span>
            <span style={styles.infoValue}>{inquiry.travelDetails.budget}</span>
          </div>
          <div style={styles.infoGroup}>
            <span style={styles.infoLabel}>Mode of Travel</span>
            <span style={styles.infoValue}>
              {inquiry.travelDetails.modeOfTravel}
            </span>
          </div>
          <div style={styles.infoGroup}>
            <span style={styles.infoLabel}>Car Type</span>
            <span style={styles.infoValue}>
              {inquiry.travelDetails.carType}
            </span>
          </div>
        </div>

        {inquiry.travelDetails.additionalDetails && (
          <div
            style={{
              marginTop: "2rem",
              paddingTop: "1.5rem",
              borderTop: "1px solid #e5e7eb",
            }}
          >
            <span style={styles.cardTitle}>📝 Additional Details</span>
            <p
              style={{
                color: "#374151",
                lineHeight: 1.7,
                whiteSpace: "pre-wrap",
                margin: 0,
              }}
            >
              {inquiry.travelDetails.additionalDetails}
            </p>
          </div>
        )}
      </div>

      {/* Admin Notes & Status Update */}
      <div style={styles.card}>
        <h3 style={styles.cardTitle}>⚙️ Update Status & Notes</h3>

        <div style={{ marginBottom: "1.5rem" }}>
          <label
            style={{
              display: "block",
              fontSize: "0.9rem",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "0.75rem",
            }}
          >
            Admin Notes
          </label>
          <textarea
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add notes about this inquiry (optional)..."
            style={styles.textarea}
          />
        </div>

        <div style={styles.buttonGroup}>
          <button
            onClick={() => updateStatus("approved")}
            disabled={updating}
            style={{
              ...styles.button,
              ...styles.approveButton,
              opacity: updating ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = "translateY(-2px)";
              (e.target as HTMLElement).style.boxShadow =
                "0 6px 20px rgba(16, 185, 129, 0.4)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = "translateY(0)";
              (e.target as HTMLElement).style.boxShadow =
                "0 4px 12px rgba(16, 185, 129, 0.3)";
            }}
          >
            ✓ Approve Inquiry
          </button>
          <button
            onClick={() => updateStatus("pending")}
            disabled={updating}
            style={{
              ...styles.button,
              ...styles.pendingButton,
              opacity: updating ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = "translateY(-2px)";
              (e.target as HTMLElement).style.boxShadow =
                "0 6px 20px rgba(245, 158, 11, 0.4)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = "translateY(0)";
              (e.target as HTMLElement).style.boxShadow =
                "0 4px 12px rgba(245, 158, 11, 0.3)";
            }}
          >
            ⏳ Keep Pending
          </button>
          <button
            onClick={() => updateStatus("rejected")}
            disabled={updating}
            style={{
              ...styles.button,
              ...styles.rejectButton,
              opacity: updating ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLElement).style.transform = "translateY(-2px)";
              (e.target as HTMLElement).style.boxShadow =
                "0 6px 20px rgba(239, 68, 68, 0.4)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLElement).style.transform = "translateY(0)";
              (e.target as HTMLElement).style.boxShadow =
                "0 4px 12px rgba(239, 68, 68, 0.3)";
            }}
          >
            ✕ Reject Inquiry
          </button>
        </div>
      </div>
    </div>
  );
}
