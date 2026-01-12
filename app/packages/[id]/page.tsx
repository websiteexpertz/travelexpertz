"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";

interface PackageDetail {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  price: number;
  currency: string;
  duration: string;
  location: string;
  highlights: string[];
  itinerary: Array<{ day: number; title: string; description: string }>;
  inclusions: string[];
  exclusions: string[];
  bestTime: string;
  difficulty: string;
  groupSize: string;
  longDetails?: Array<{ title: string; content: string }>;
  notes?: string;
  customFields?: Array<{ label: string; value: string }>;
  featured: boolean;
  active: boolean;
}

export default function PackageDetailPage() {
  const params = useParams();
  const packageId = params.id as string;
  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        console.log(`Fetching package details for ID: ${packageId}`);
        const response = await fetch(`/api/packages/${packageId}`, {
          method: "GET",
          cache: "no-store",
        });

        console.log(`Response status: ${response.status}, ok: ${response.ok}`);

        if (response.ok) {
          const data = await response.json();
          console.log(`Received package data:`, data);

          // Ensure all array fields exist
          const packageData = {
            ...data,
            highlights: data.highlights || [],
            itinerary: data.itinerary || [],
            inclusions: data.inclusions || [],
            exclusions: data.exclusions || [],
            longDetails: data.longDetails || [],
            customFields: data.customFields || [],
            notes: data.notes || "",
          };
          console.log(`Setting package with data:`, packageData);
          setPkg(packageData as PackageDetail);
        } else {
          console.error(`Failed to fetch package: ${response.status}`);
        }
      } catch (error) {
        console.error("Error fetching package:", error);
      } finally {
        setLoading(false);
      }
    };

    if (packageId) {
      fetchPackage();
    }
  }, [packageId]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "50px",
              height: "50px",
              border: "4px solid rgba(0, 102, 204, 0.2)",
              borderTop: "4px solid #0066cc",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
              margin: "0 auto 1rem",
            }}
          />
          <p style={{ color: "#666", fontSize: "1rem" }}>Loading package...</p>
          <style>{`
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          `}</style>
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "white",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h1 style={{ color: "#1a1a2e", marginBottom: "1rem" }}>
            Package Not Found
          </h1>
          <p style={{ color: "#666", marginBottom: "2rem" }}>
            Sorry, we couldn't find the package you're looking for.
          </p>
          <a
            href="/"
            style={{
              display: "inline-block",
              padding: "0.75rem 1.5rem",
              background: "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
              color: "white",
              textDecoration: "none",
              borderRadius: "12px",
              fontWeight: 700,
              transition: "all 0.3s ease",
            }}
          >
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const overviewItems = [
    { label: "Duration", value: pkg.duration },
    { label: "Difficulty", value: pkg.difficulty },
    { label: "Best Time", value: pkg.bestTime },
    { label: "Group Size", value: pkg.groupSize },
    ...(pkg.customFields || [])
      .filter((cf) => cf.label && cf.value)
      .map((cf) => ({ label: cf.label, value: cf.value })),
  ];

  return (
    <div style={{ background: "white", minHeight: "100vh" }}>
      {/* Hero Section */}
      <section
        className="package-hero"
        style={{
          position: "relative",
          height: "500px",
          overflow: "hidden",
        }}
      >
        {/* Hero Image */}
        <img
          src={pkg.image}
          alt={pkg.title}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
        />

        {/* Dark Overlay */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.6) 100%)",
            zIndex: 1,
          }}
        />

        {/* Navigation Back Button */}
        <div
          className="package-back-btn"
          style={{
            position: "absolute",
            top: "2rem",
            left: "2rem",
            zIndex: 3,
          }}
        >
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(10px)",
              borderRadius: "999px",
              color: "#0066cc",
              textDecoration: "none",
              fontWeight: 600,
              transition: "all 0.3s ease",
              boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow =
                "0 8px 25px rgba(0, 0, 0, 0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 4px 15px rgba(0, 0, 0, 0.1)";
            }}
          >
            ← Back
          </a>
        </div>

        {/* Hero Content */}
        <div
          style={{
            position: "absolute",
            bottom: "3rem",
            left: "0",
            right: "0",
            zIndex: 2,
            color: "white",
            textAlign: "center",
            padding: "0 1rem",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2.2rem, 5vw, 2.7rem)",
              fontWeight: 900,
              margin: "0 0 1rem 0",
              textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
              letterSpacing: "-0.5px",
            }}
          >
            {pkg.title}
          </h1>
          <p
            style={{
              fontSize: "1.3rem",
              fontWeight: 600,
              margin: "0",
              textShadow: "0 2px 4px rgba(0, 0, 0, 0.3)",
              opacity: 0.95,
            }}
          >
            {pkg.location}
          </p>
        </div>

        {/* Featured Badge */}
        {pkg.featured && (
          <div
            className="package-featured-badge"
            style={{
              position: "absolute",
              top: "2rem",
              right: "2rem",
              background: "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
              color: "white",
              padding: "0.75rem 1.5rem",
              borderRadius: "999px",
              fontSize: "0.85rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
              boxShadow: "0 6px 20px rgba(0, 102, 204, 0.3)",
              zIndex: 2,
            }}
          >
            Featured Package
          </div>
        )}
      </section>

      {/* Main Content */}
      <section
        className="package-content-section"
        style={{ padding: "3rem 1rem", maxWidth: "1200px", margin: "0 auto" }}
      >
        <div
          className="package-main-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 350px",
            gap: "3rem",
            marginBottom: "3rem",
          }}
        >
          {/* Left Column - Content */}
          <div>
            {/* Overview Cards */}
            <div
              className="package-overview-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1rem",
                marginBottom: "3rem",
              }}
            >
              {overviewItems.map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    padding: "1.5rem",
                    background: "rgba(0, 102, 204, 0.08)",
                    borderRadius: "16px",
                    border: "1px solid rgba(0, 102, 204, 0.15)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#999",
                      fontWeight: 600,
                      textTransform: "uppercase",
                      letterSpacing: "0.3px",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "#1a1a2e",
                    }}
                  >
                    {item.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Full Description */}
            <div style={{ marginBottom: "3rem" }}>
              <h2
                style={{
                  fontSize: "1.8rem",
                  fontWeight: 900,
                  color: "#1a1a2e",
                  marginBottom: "1rem",
                  marginTop: 0,
                }}
              >
                About This Package
              </h2>
              <p
                style={{
                  fontSize: "1rem",
                  lineHeight: 1.8,
                  color: "#666",
                  marginBottom: "1.5rem",
                }}
              >
                {pkg.fullDescription}
              </p>
            </div>

            {/* Highlights */}
            {pkg.highlights && pkg.highlights.length > 0 && (
              <div style={{ marginBottom: "3rem" }}>
                <h2
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 900,
                    color: "#1a1a2e",
                    marginBottom: "1.5rem",
                    marginTop: 0,
                  }}
                >
                  Highlights
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "1rem",
                  }}
                >
                  {pkg.highlights.map((highlight, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "1rem",
                        background: "rgba(0, 102, 204, 0.08)",
                        borderRadius: "12px",
                        display: "flex",
                        gap: "0.75rem",
                        alignItems: "flex-start",
                        border: "1px solid rgba(0, 102, 204, 0.15)",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "1.5rem",
                          color: "#0066cc",
                          lineHeight: 1,
                          marginTop: "0.2rem",
                        }}
                      >
                        ✓
                      </span>
                      <span style={{ fontSize: "0.95rem", color: "#666" }}>
                        {highlight}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Itinerary */}
            {pkg.itinerary && pkg.itinerary.length > 0 && (
              <div style={{ marginBottom: "3rem" }}>
                <h2
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 900,
                    color: "#1a1a2e",
                    marginBottom: "1.5rem",
                    marginTop: 0,
                  }}
                >
                  Detailed Itinerary
                </h2>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.75rem",
                  }}
                >
                  {pkg.itinerary.map((item, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: "1.5rem",
                        background:
                          expandedDay === idx
                            ? "linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(0, 153, 255, 0.08) 100%)"
                            : "rgba(255, 255, 255, 0.8)",
                        border: "1px solid rgba(0, 102, 204, 0.15)",
                        borderRadius: "16px",
                        cursor: "pointer",
                        transition: "all 0.3s ease",
                      }}
                      onClick={() =>
                        setExpandedDay(expandedDay === idx ? null : idx)
                      }
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          expandedDay === idx
                            ? "linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(0, 153, 255, 0.08) 100%)"
                            : "rgba(0, 102, 204, 0.04)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          expandedDay === idx
                            ? "linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(0, 153, 255, 0.08) 100%)"
                            : "rgba(255, 255, 255, 0.8)";
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: expandedDay === idx ? "1rem" : "0",
                        }}
                      >
                        <div>
                          <div
                            style={{
                              display: "inline-block",
                              background:
                                "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                              color: "white",
                              padding: "0.5rem 1rem",
                              borderRadius: "8px",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              marginBottom: "0.75rem",
                            }}
                          >
                            Day {item.day}
                          </div>
                          <h3
                            style={{
                              fontSize: "1.2rem",
                              fontWeight: 700,
                              color: "#1a1a2e",
                              margin: "0",
                            }}
                          >
                            {item.title}
                          </h3>
                        </div>
                        <span
                          style={{
                            fontSize: "1.5rem",
                            color: "#0066cc",
                            transition: "transform 0.3s ease",
                            transform:
                              expandedDay === idx
                                ? "rotate(180deg)"
                                : "rotate(0deg)",
                          }}
                        >
                          ▼
                        </span>
                      </div>

                      {expandedDay === idx && (
                        <p
                          style={{
                            fontSize: "0.95rem",
                            color: "#666",
                            margin: "0",
                            lineHeight: 1.7,
                            paddingTop: "0.5rem",
                            borderTop: "1px solid rgba(0, 102, 204, 0.2)",
                          }}
                        >
                          {item.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Inclusions & Exclusions */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
              }}
            >
              {pkg.inclusions && pkg.inclusions.length > 0 && (
                <div>
                  <h2
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 900,
                      color: "#1a1a2e",
                      marginBottom: "1rem",
                      marginTop: 0,
                    }}
                  >
                    Inclusions
                  </h2>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    {pkg.inclusions.map((item, idx) => (
                      <li
                        key={idx}
                        style={{
                          padding: "0.75rem 0",
                          display: "flex",
                          gap: "0.75rem",
                          alignItems: "flex-start",
                          color: "#666",
                          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                        }}
                      >
                        <span
                          style={{
                            color: "#0066cc",
                            fontWeight: 700,
                            marginTop: "0.1rem",
                          }}
                        >
                          ✓
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pkg.exclusions && pkg.exclusions.length > 0 && (
                <div>
                  <h2
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 900,
                      color: "#1a1a2e",
                      marginBottom: "1rem",
                      marginTop: 0,
                    }}
                  >
                    Exclusions
                  </h2>
                  <ul
                    style={{
                      listStyle: "none",
                      padding: 0,
                      margin: 0,
                    }}
                  >
                    {pkg.exclusions.map((item, idx) => (
                      <li
                        key={idx}
                        style={{
                          padding: "0.75rem 0",
                          display: "flex",
                          gap: "0.75rem",
                          alignItems: "flex-start",
                          color: "#999",
                          borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
                        }}
                      >
                        <span
                          style={{
                            color: "#ccc",
                            fontWeight: 700,
                            marginTop: "0.1rem",
                          }}
                        >
                          ×
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Notes / Other */}
            {pkg.notes && pkg.notes.trim().length > 0 && (
              <div style={{ marginTop: "3rem", marginBottom: "3rem" }}>
                <h2
                  style={{
                    fontSize: "1.6rem",
                    fontWeight: 900,
                    color: "#1a1a2e",
                    marginBottom: "1rem",
                    marginTop: 0,
                  }}
                >
                  Notes
                </h2>
                <div
                  style={{
                    padding: "1.25rem",
                    background: "rgba(0, 102, 204, 0.05)",
                    borderRadius: "12px",
                    border: "1px solid rgba(0, 102, 204, 0.15)",
                    color: "#444",
                    lineHeight: 1.7,
                  }}
                >
                  {pkg.notes}
                </div>
              </div>
            )}

            {pkg.longDetails && pkg.longDetails.length > 0 && (
              <div style={{ marginTop: "3rem", marginBottom: "3rem" }}>
                <h2
                  style={{
                    fontSize: "1.8rem",
                    fontWeight: 900,
                    color: "#1a1a2e",
                    marginBottom: "1.25rem",
                    marginTop: 0,
                  }}
                >
                  More Details
                </h2>
                <div style={{ display: "grid", gap: "1rem" }}>
                  {pkg.longDetails.map((detail, idx) => (
                    <div
                      key={idx}
                      style={{
                        border: "1px solid rgba(0, 0, 0, 0.08)",
                        borderRadius: "12px",
                        padding: "1rem",
                        background: "#f9fafb",
                        boxShadow: "0 8px 18px rgba(0,0,0,0.04)",
                      }}
                    >
                      {detail.title ? (
                        <h3
                          style={{
                            margin: "0 0 0.5rem 0",
                            fontSize: "1.1rem",
                            color: "#1a1a2e",
                          }}
                        >
                          {detail.title}
                        </h3>
                      ) : null}
                      {detail.content ? (
                        <p
                          style={{
                            margin: 0,
                            color: "#555",
                            lineHeight: 1.7,
                            whiteSpace: "pre-wrap",
                          }}
                        >
                          {detail.content}
                        </p>
                      ) : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar - Booking Card */}
          <div
            style={{ position: "sticky", top: "2rem", height: "fit-content" }}
          >
            <div
              style={{
                background: "rgba(255, 255, 255, 0.95)",
                backdropFilter: "blur(20px)",
                borderRadius: "24px",
                padding: "2rem",
                border: "1px solid rgba(0, 102, 204, 0.15)",
                boxShadow: "0 10px 40px rgba(0, 102, 204, 0.1)",
              }}
            >
              <div style={{ marginBottom: "1.5rem" }}>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#999",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                    marginBottom: "0.5rem",
                  }}
                >
                  {pkg.price === 0 ? "Price" : "Starting From"}
                </div>
                <div
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: 900,
                    background:
                      "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    margin: "0",
                  }}
                >
                  {pkg.price === 0
                    ? "On Request"
                    : `${pkg.currency}${pkg.price}`}
                </div>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#999",
                    margin: "0.5rem 0 0 0",
                  }}
                >
                  {pkg.price === 0 ? "" : "Per person"}
                </p>
              </div>

              <button
                style={{
                  width: "100%",
                  padding: "1rem",
                  background:
                    pkg.price === 0
                      ? "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)"
                      : "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  boxShadow:
                    pkg.price === 0
                      ? "0 6px 20px rgba(245, 158, 11, 0.3)"
                      : "0 6px 20px rgba(0, 102, 204, 0.3)",
                  marginBottom: "1rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow =
                    pkg.price === 0
                      ? "0 10px 30px rgba(245, 158, 11, 0.4)"
                      : "0 10px 30px rgba(0, 102, 204, 0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    pkg.price === 0
                      ? "0 6px 20px rgba(245, 158, 11, 0.3)"
                      : "0 6px 20px rgba(0, 102, 204, 0.3)";
                }}
                onClick={() => {
                  const phoneNumber = "918923992522";
                  const customFieldsText = (pkg.customFields || [])
                    .filter((cf) => cf.label && cf.value)
                    .map((cf) => `${cf.label}: ${cf.value}`)
                    .join("\n");
                  const packageDetails = `📦 *${pkg.title}*
📍 Location: ${pkg.location}
⏱️ Duration: ${pkg.duration}
💪 Difficulty: ${pkg.difficulty}
👥 Group Size: ${pkg.groupSize}
⭐ Best Time: ${pkg.bestTime}
${customFieldsText ? "\n" + customFieldsText : ""}
${
  pkg.price === 0
    ? "💰 Price: On Request"
    : `💰 Price: ${pkg.currency}${pkg.price}`
}

${pkg.description}`;
                  const message =
                    pkg.price === 0
                      ? `Hi, I'm interested in the following package:\n\n${packageDetails}\n\nPlease provide pricing details.`
                      : `Hi, I'm interested in booking the following package:\n\n${packageDetails}`;
                  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(
                    message
                  )}`;
                  window.open(whatsappUrl, "_blank");
                }}
              >
                {pkg.price === 0 ? "Get Price" : "Book Now"}
              </button>

              {/* Share Package Section */}
              <div style={{ marginTop: "1.5rem" }}>
                <p
                  style={{
                    fontSize: "0.8rem",
                    color: "#999",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                    marginBottom: "1rem",
                    marginTop: 0,
                  }}
                >
                  Share Package
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                  }}
                >
                  {/* WhatsApp Share */}
                  <button
                    onClick={() => {
                      const phoneNumber = "918923992522";
                      const shareMessage = `Check out this amazing package: *${
                        pkg.title
                      }*\n\n📍 Location: ${pkg.location}\n⏱️ Duration: ${
                        pkg.duration
                      }\n${
                        pkg.price === 0
                          ? "💰 Price: On Request"
                          : `💰 Price: ${pkg.currency}${pkg.price}`
                      }\n\nView full details here: ${
                        typeof window !== "undefined"
                          ? window.location.href
                          : ""
                      }`;
                      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(
                        shareMessage
                      )}`;
                      window.open(whatsappUrl, "_blank");
                    }}
                    style={{
                      flex: 1,
                      padding: "0.6rem",
                      background: "#25D366",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#1fbb50";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#25D366";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "1rem" }}
                    >
                      share
                    </span>
                    WhatsApp
                  </button>

                  {/* Facebook Share */}
                  <button
                    onClick={() => {
                      const shareUrl =
                        typeof window !== "undefined"
                          ? window.location.href
                          : "";
                      const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                        shareUrl
                      )}`;
                      window.open(facebookUrl, "_blank");
                    }}
                    style={{
                      flex: 1,
                      padding: "0.6rem",
                      background: "#1877F2",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#0a66c2";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#1877F2";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "1rem" }}
                    >
                      share
                    </span>
                    Facebook
                  </button>

                  {/* Copy Link */}
                  <button
                    onClick={() => {
                      const url =
                        typeof window !== "undefined"
                          ? window.location.href
                          : "";
                      navigator.clipboard.writeText(url);
                      alert("Package link copied to clipboard!");
                    }}
                    style={{
                      flex: 1,
                      padding: "0.6rem",
                      background: "rgba(0, 102, 204, 0.1)",
                      color: "#0066cc",
                      border: "2px solid rgba(0, 102, 204, 0.3)",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "0.5rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(0, 102, 204, 0.2)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background =
                        "rgba(0, 102, 204, 0.1)";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "1rem" }}
                    >
                      link
                    </span>
                    Copy Link
                  </button>
                </div>
              </div>

              <div
                style={{
                  marginTop: "2rem",
                  paddingTop: "2rem",
                  borderTop: "1px solid rgba(0, 0, 0, 0.08)",
                }}
              >
                <h4
                  style={{
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "#1a1a2e",
                    textTransform: "uppercase",
                    letterSpacing: "0.3px",
                    marginBottom: "1rem",
                    marginTop: 0,
                  }}
                >
                  Package Info
                </h4>

                {[
                  { icon: "🌍", label: "Duration", value: pkg.duration },
                  { icon: "📍", label: "Location", value: pkg.location },
                  { icon: "⭐", label: "Difficulty", value: pkg.difficulty },
                  { icon: "👥", label: "Group Size", value: pkg.groupSize },
                  { icon: "📅", label: "Best Time", value: pkg.bestTime },
                ].map((info, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "0.75rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <span style={{ fontSize: "1.2rem" }}>{info.icon}</span>
                    <div>
                      <div style={{ color: "#999", fontSize: "0.8rem" }}>
                        {info.label}
                      </div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#1a1a2e",
                        }}
                      >
                        {info.value}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 1024px) {
          .package-main-grid {
            grid-template-columns: 1fr !important;
          }
          
          .package-sidebar {
            position: relative !important;
            top: 0 !important;
          }
        }
        
        @media (max-width: 768px) {
          .package-overview-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
          
          .package-hero {
            height: 350px !important;
          }
          
          .package-hero-content h1 {
            font-size: 1.75rem !important;
          }
          
          .package-section-title {
            font-size: 1.5rem !important;
          }
          
          .package-content-section {
            padding: 2rem 1rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .package-overview-grid {
            grid-template-columns: 1fr !important;
            gap: 0.75rem !important;
          }
          
          .package-hero {
            height: 280px !important;
          }
          
          .package-back-btn {
            top: 1rem !important;
            left: 1rem !important;
            padding: 0.5rem 1rem !important;
            font-size: 0.875rem !important;
          }
          
          .package-featured-badge {
            top: 1rem !important;
            right: 1rem !important;
            padding: 0.5rem 1rem !important;
            font-size: 0.75rem !important;
          }
          
          .package-price-card {
            padding: 1.5rem !important;
            border-radius: 16px !important;
          }
          
          .package-section-title {
            font-size: 1.25rem !important;
          }
        }
      `}</style>
    </div>
  );
}
