"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

export default function AdminInquiries() {
  const [inquiries, setInquiries] = useState<PackageInquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<
    "all" | "pending" | "approved" | "rejected"
  >("all");

  useEffect(() => {
    const fetchInquiries = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/package-inquiries");
        if (response.ok) {
          const data = await response.json();
          setInquiries(data.inquiries || []);
        } else {
          const errorData = await response.json();
          console.error(
            "Failed to fetch inquiries:",
            response.status,
            errorData,
          );
        }
      } catch (error) {
        console.error("Error fetching inquiries:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, []);

  const filteredInquiries =
    selectedStatus === "all"
      ? inquiries
      : inquiries.filter((inquiry) => inquiry.status === selectedStatus);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
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
          badgeBg: "#fbbf24",
        };
      case "approved":
        return {
          background: "linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)",
          color: "#065f46",
          badgeBg: "#6ee7b7",
        };
      case "rejected":
        return {
          background: "linear-gradient(135deg, #fee2e2 0%, #fecaca 100%)",
          color: "#7f1d1d",
          badgeBg: "#fca5a5",
        };
      default:
        return {
          background: "#f3f4f6",
          color: "#6b7280",
          badgeBg: "#d1d5db",
        };
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        paddingTop: "5rem",
        maxWidth: "1400px",
        margin: "0 auto",
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: "2rem" }}>
        <h1
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            margin: 0,
            color: "#1f2937",
          }}
        >
          Package Inquiries Management
        </h1>
        <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
          Manage and respond to customer package travel inquiries
        </p>
      </div>

      {/* Stats Cards */}
      <div
        style={{
          display: "flex",
          gap: "1rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            background: "#fef3c7",
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            border: "1px solid #fcd34d",
            flex: 1,
            minWidth: "200px",
          }}
        >
          <div
            style={{ fontSize: "1.5rem", fontWeight: 700, color: "#d97706" }}
          >
            {inquiries.filter((i) => i.status === "pending").length}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#92400e" }}>
            Pending Inquiries
          </div>
        </div>
        <div
          style={{
            background: "#d1fae5",
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            border: "1px solid #6ee7b7",
            flex: 1,
            minWidth: "200px",
          }}
        >
          <div
            style={{ fontSize: "1.5rem", fontWeight: 700, color: "#059669" }}
          >
            {inquiries.filter((i) => i.status === "approved").length}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#065f46" }}>Approved</div>
        </div>
        <div
          style={{
            background: "#fee2e2",
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            border: "1px solid #fca5a5",
            flex: 1,
            minWidth: "200px",
          }}
        >
          <div
            style={{ fontSize: "1.5rem", fontWeight: 700, color: "#dc2626" }}
          >
            {inquiries.filter((i) => i.status === "rejected").length}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#7f1d1d" }}>Rejected</div>
        </div>
        <div
          style={{
            background: "#f3f4f6",
            padding: "1rem 1.5rem",
            borderRadius: "8px",
            border: "1px solid #d1d5db",
            flex: 1,
            minWidth: "200px",
          }}
        >
          <div
            style={{ fontSize: "1.5rem", fontWeight: 700, color: "#374151" }}
          >
            {inquiries.length}
          </div>
          <div style={{ fontSize: "0.875rem", color: "#6b7280" }}>
            Total Inquiries
          </div>
        </div>
      </div>

      {/* Status Filter */}
      <div
        style={{
          display: "flex",
          gap: "0.75rem",
          marginBottom: "2rem",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <label
          style={{ fontWeight: 600, marginRight: "0.5rem", color: "#374151" }}
        >
          Filter by Status:
        </label>
        {(["all", "pending", "approved", "rejected"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setSelectedStatus(status)}
            style={{
              padding: "0.6rem 1.2rem",
              border:
                selectedStatus === status
                  ? "2px solid #0066cc"
                  : "2px solid #e5e7eb",
              borderRadius: "8px",
              cursor: "pointer",
              backgroundColor:
                selectedStatus === status
                  ? "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)"
                  : "white",
              color: selectedStatus === status ? "white" : "#374151",
              fontWeight: 600,
              fontSize: "0.875rem",
              transition: "all 0.2s ease",
            }}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
        <div style={{ marginLeft: "auto", fontWeight: 600, color: "#6b7280" }}>
          Showing: {filteredInquiries.length} inquiries
        </div>
      </div>

      {/* Inquiries List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem", color: "#6b7280" }}>
          <p style={{ fontSize: "1rem" }}>Loading inquiries...</p>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div
          style={{
            textAlign: "center",
            padding: "3rem",
            background: "#f5f5f5",
            borderRadius: "8px",
            color: "#6b7280",
          }}
        >
          <p style={{ fontSize: "1rem" }}>
            No {selectedStatus !== "all" ? selectedStatus : ""} inquiries found.
          </p>
        </div>
      ) : (
        <div style={{ display: "grid", gap: "1.5rem" }}>
          {filteredInquiries.map((inquiry) => {
            const statusStyles = getStatusStyles(inquiry.status);
            return (
              <Link key={inquiry._id} href={`/admin/inquiries/${inquiry._id}`}>
                <div
                  style={{
                    background: statusStyles.background,
                    border: `2px solid ${statusStyles.badgeBg}`,
                    borderRadius: "12px",
                    padding: "1.5rem",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    gap: "1.5rem",
                    alignItems: "center",
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.12)";
                    el.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLElement;
                    el.style.boxShadow = "none";
                    el.style.transform = "translateY(0)";
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontSize: "1.125rem",
                        fontWeight: 700,
                        color: statusStyles.color,
                        margin: "0 0 0.75rem 0",
                      }}
                    >
                      {inquiry.packageTitle}
                    </h3>
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "auto 1fr",
                        gap: "1.5rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <div>
                        <p
                          style={{
                            color: statusStyles.color,
                            fontSize: "0.875rem",
                            margin: "0 0 0.5rem 0",
                            fontWeight: 500,
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>Customer:</span>{" "}
                          {inquiry.customer.fullName}
                        </p>
                        <p
                          style={{
                            color: statusStyles.color,
                            fontSize: "0.875rem",
                            margin: "0",
                            opacity: 0.8,
                          }}
                        >
                          {inquiry.customer.email} • {inquiry.customer.phone}
                        </p>
                      </div>
                      <div>
                        <p
                          style={{
                            color: statusStyles.color,
                            fontSize: "0.875rem",
                            margin: "0 0 0.5rem 0",
                            fontWeight: 500,
                          }}
                        >
                          <span style={{ fontWeight: 700 }}>
                            Travel Details:
                          </span>
                        </p>
                        <p
                          style={{
                            color: statusStyles.color,
                            fontSize: "0.875rem",
                            margin: "0",
                            opacity: 0.8,
                          }}
                        >
                          {inquiry.travelDetails.startDate
                            ? new Date(
                                inquiry.travelDetails.startDate,
                              ).toLocaleDateString("en-IN")
                            : "TBD"}{" "}
                          • {inquiry.travelDetails.adults} adults,{" "}
                          {inquiry.travelDetails.children} children
                        </p>
                      </div>
                    </div>
                    <p
                      style={{
                        color: statusStyles.color,
                        fontSize: "0.8rem",
                        margin: "0.5rem 0 0 0",
                        opacity: 0.7,
                      }}
                    >
                      Submitted: {formatDate(inquiry.createdAt)}
                    </p>
                  </div>

                  <div style={{ textAlign: "right", minWidth: "fit-content" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.75rem 1.5rem",
                        borderRadius: "12px",
                        backgroundColor: statusStyles.badgeBg,
                        color: statusStyles.color,
                        fontSize: "0.875rem",
                        fontWeight: 700,
                        textTransform: "capitalize",
                        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      {inquiry.status}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
