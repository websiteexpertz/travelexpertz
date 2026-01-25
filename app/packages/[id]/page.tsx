"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";

interface PackageDetail {
  _id: string;
  title: string;
  description: string;
  fullDescription?: string;
  duration: string;
  startingPoint: string;
  category: string;
  badge?: string;
  image: string;
  gallery?: string[];
  price?: number;
  currency?: string;
  featured?: boolean;
  active?: boolean;
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: {
    day: number;
    title: string;
    description?: string;
  }[];
  importantNotes?: string[];
  thingsToCarry?:
    | string[]
    | {
        category: string;
        items: string[];
      }[];
  refundTiers?: {
    timeframe: string;
    refundInfo: string;
  }[];
  refundPolicyNotes?: string;
  customFields?: {
    id: string;
    section:
      | "overview"
      | "itinerary"
      | "inclusions"
      | "essentials"
      | "policies";
    fieldName: string;
    fieldType: "text" | "textarea" | "list";
    value: string | string[];
  }[];
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatInr = (value: number) =>
  inrFormatter.format(Math.max(0, Math.round(value)));

export default function PackageDetails() {
  const params = useParams();
  const router = useRouter();
  const packageId = params?.id as string;

  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "overview" | "itinerary" | "inclusions" | "essentials" | "policies"
  >("overview");

  // Booking form state
  const [bookingDetails, setBookingDetails] = useState({
    travelDate: "",
    travelers: 2,
    name: "",
    email: "",
    phone: "",
  });

  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      if (!packageId) return;
      setLoading(true);
      try {
        // Fetch package data using dynamic route
        const response = await fetch(`/api/packages/${packageId}`, {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched complete package data:", data);
          console.log("Itinerary:", data.itinerary);
          console.log("Custom Fields:", data.customFields);
          if (data.customFields) {
            console.log("Number of custom fields:", data.customFields.length);
            data.customFields.forEach((field: any) => {
              console.log(
                `Field: ${field.fieldName}, Section: ${field.section}, Type: ${field.fieldType}`,
              );
            });
          } else {
            console.log("No custom fields found in package data");
          }
          setPkg(data);
        } else {
          console.error(
            "Failed to fetch package:",
            response.status,
            response.statusText,
          );
        }
      } catch (error) {
        console.error("Failed to fetch package details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [packageId]);

  const totalPrice =
    pkg && pkg.price ? pkg.price * bookingDetails.travelers : 0;

  const handleBooking = async () => {
    // Handle booking submission
    console.log("Booking details:", {
      packageId,
      ...bookingDetails,
      totalPrice,
    });
    // Redirect to booking page or show confirmation
    router.push(
      `/booking?type=package&id=${packageId}&travelers=${bookingDetails.travelers}&date=${bookingDetails.travelDate}`,
    );
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <Header currentPage="packages" />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            fontSize: "1.2rem",
            color: "#64748b",
          }}
        >
          Loading package details...
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <Header currentPage="packages" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            gap: "1rem",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "4rem", color: "#94a3b8" }}
          >
            hiking
          </span>
          <div style={{ fontSize: "1.2rem", color: "#64748b" }}>
            Package not found
          </div>
          <Link
            href="/packages"
            style={{
              padding: "0.75rem 1.5rem",
              background: "#0066cc",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "1rem",
            }}
          >
            Browse All Packages
          </Link>
        </div>
      </div>
    );
  }

  const images =
    pkg.gallery && pkg.gallery.length > 0
      ? pkg.gallery
      : pkg.image
        ? [pkg.image]
        : [];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
      <Header currentPage="packages" />
      <main className="flex flex-col items-center w-full">
        {/* Image Gallery */}
        {images.length > 0 && (
          <div
            style={{
              width: "100%",
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "1.5rem 1rem",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: images.length > 1 ? "2fr 1fr 1fr" : "1fr",
                gap: "0.5rem",
                height: "400px",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  gridRow: images.length > 1 ? "1 / 3" : "1",
                  position: "relative",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setFullscreenImageIndex(0);
                  setShowFullscreenGallery(true);
                }}
              >
                <img
                  src={images[0]}
                  alt={pkg.title}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                {pkg.badge && (
                  <span
                    style={{
                      position: "absolute",
                      top: "1rem",
                      left: "1rem",
                      backgroundColor: "#0066cc",
                      color: "white",
                      padding: "0.5rem 1rem",
                      borderRadius: "0.5rem",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                    }}
                  >
                    {pkg.badge}
                  </span>
                )}
              </div>
              {images.slice(1, 5).map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: "relative",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                  onClick={() => {
                    setFullscreenImageIndex(idx + 1);
                    setShowFullscreenGallery(true);
                  }}
                >
                  <img
                    src={img}
                    alt={`${pkg.title} ${idx + 2}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                  />
                  {idx === 3 && images.length > 5 && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "1.5rem",
                        fontWeight: 700,
                      }}
                    >
                      +{images.length - 5} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fullscreen Gallery Modal */}
        {showFullscreenGallery && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.95)",
              zIndex: 1000,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => setShowFullscreenGallery(false)}
          >
            <button
              onClick={() => setShowFullscreenGallery(false)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                backgroundColor: "transparent",
                border: "none",
                color: "white",
                fontSize: "2rem",
                cursor: "pointer",
                zIndex: 1001,
              }}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImageIndex((prev) =>
                  prev > 0 ? prev - 1 : images.length - 1,
                );
              }}
              style={{
                position: "absolute",
                left: "1rem",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                border: "none",
                color: "white",
                fontSize: "2rem",
                cursor: "pointer",
                padding: "0.5rem",
                borderRadius: "50%",
              }}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <img
              src={images[fullscreenImageIndex]}
              alt={`${pkg.title} ${fullscreenImageIndex + 1}`}
              style={{
                maxWidth: "90%",
                maxHeight: "90vh",
                objectFit: "contain",
              }}
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImageIndex((prev) =>
                  prev < images.length - 1 ? prev + 1 : 0,
                );
              }}
              style={{
                position: "absolute",
                right: "1rem",
                backgroundColor: "rgba(255, 255, 255, 0.2)",
                border: "none",
                color: "white",
                fontSize: "2rem",
                cursor: "pointer",
                padding: "0.5rem",
                borderRadius: "50%",
              }}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            <div
              style={{
                position: "absolute",
                bottom: "1rem",
                display: "flex",
                gap: "0.5rem",
              }}
            >
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenImageIndex(idx);
                  }}
                  style={{
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    backgroundColor:
                      idx === fullscreenImageIndex
                        ? "white"
                        : "rgba(255, 255, 255, 0.4)",
                    border: "none",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div
          style={{
            width: "100%",
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 1rem 2rem",
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "2rem",
          }}
        >
          {/* Left Column - Details */}
          <div>
            {/* Package Header */}
            <div style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                  flexWrap: "wrap",
                  gap: "1rem",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      marginBottom: "0.5rem",
                      flexWrap: "wrap",
                    }}
                  >
                    {pkg.category && (
                      <span
                        style={{
                          backgroundColor: "#10b981",
                          color: "white",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "1rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {pkg.category}
                      </span>
                    )}
                    {pkg.badge && (
                      <span
                        style={{
                          backgroundColor: "#dbeafe",
                          color: "#1e40af",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "1rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        {pkg.badge}
                      </span>
                    )}
                  </div>
                  <h1
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      marginBottom: "0.75rem",
                      color: "#1a1a2e",
                      lineHeight: 1.2,
                    }}
                  >
                    {pkg.title}
                  </h1>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1.5rem",
                      color: "#64748b",
                      fontSize: "0.95rem",
                      flexWrap: "wrap",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ color: "#f43f5e", fontSize: "1.25rem" }}
                      >
                        location_on
                      </span>
                      <span>{pkg.startingPoint}</span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.35rem",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ color: "#0066cc", fontSize: "1.25rem" }}
                      >
                        schedule
                      </span>
                      <span>{pkg.duration}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div
              style={{
                display: "flex",
                gap: "0.5rem",
                marginBottom: "1.5rem",
                borderBottom: "2px solid #e5e7eb",
                paddingBottom: "0",
                overflowX: "auto",
              }}
            >
              {(
                [
                  { key: "overview", label: "Overview", icon: "info" },
                  { key: "itinerary", label: "Itinerary", icon: "route" },
                  {
                    key: "inclusions",
                    label: "Inclusions",
                    icon: "check_circle",
                  },
                  {
                    key: "essentials",
                    label: "Things to Carry",
                    icon: "backpack",
                  },
                  {
                    key: "policies",
                    label: "Notes & Policies",
                    icon: "description",
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  style={{
                    padding: "0.75rem 1.25rem",
                    fontSize: "0.95rem",
                    fontWeight: activeTab === tab.key ? 700 : 500,
                    color: activeTab === tab.key ? "#0066cc" : "#64748b",
                    backgroundColor: "transparent",
                    border: "none",
                    borderBottom:
                      activeTab === tab.key
                        ? "3px solid #0066cc"
                        : "3px solid transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    whiteSpace: "nowrap",
                    marginBottom: "-2px",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.1rem" }}
                  >
                    {tab.icon}
                  </span>
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                padding: "1.5rem",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
              }}
            >
              {activeTab === "overview" && (
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      marginBottom: "1rem",
                      color: "#1f2937",
                    }}
                  >
                    About This Package
                  </h3>
                  <p
                    style={{
                      color: "#4b5563",
                      lineHeight: 1.7,
                      marginBottom: "1.5rem",
                      whiteSpace: "pre-line",
                    }}
                  >
                    {pkg.fullDescription || pkg.description}
                  </p>

                  {/* Important Notes */}
                  {pkg.importantNotes && pkg.importantNotes.length > 0 && (
                    <div style={{ marginTop: "1.5rem" }}>
                      <h4
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          marginBottom: "1rem",
                          color: "#1f2937",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ color: "#f59e0b" }}
                        >
                          info
                        </span>
                        Important Notes
                      </h4>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fill, minmax(250px, 1fr))",
                          gap: "0.75rem",
                        }}
                      >
                        {pkg.importantNotes.map((note, idx) => (
                          <li
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "0.5rem",
                              color: "#4b5563",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{
                                color: "#f59e0b",
                                fontSize: "1.25rem",
                                flexShrink: 0,
                              }}
                            >
                              warning
                            </span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Starting Point Info */}
                  <div
                    style={{
                      marginTop: "1.5rem",
                      padding: "1rem",
                      backgroundColor: "#f8fafc",
                      borderRadius: "0.75rem",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: "0.8rem",
                          color: "#64748b",
                          marginBottom: "0.25rem",
                        }}
                      >
                        Starting Point
                      </div>
                      <div
                        style={{
                          fontWeight: 600,
                          color: "#1f2937",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ color: "#10b981", fontSize: "1.1rem" }}
                        >
                          trip_origin
                        </span>
                        {pkg.startingPoint || "To be announced"}
                      </div>
                    </div>
                  </div>

                  {/* Custom Fields */}
                  {pkg.customFields &&
                    pkg.customFields
                      .filter((f) => f.section === "overview")
                      .map((field) => (
                        <div
                          key={field.id}
                          style={{
                            marginTop: "1.5rem",
                            padding: "1.25rem",
                            backgroundColor: "#f8fafc",
                            borderRadius: "0.75rem",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "1.05rem",
                              fontWeight: 700,
                              marginBottom: "0.75rem",
                              color: "#0066cc",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "1.1rem" }}
                            >
                              info
                            </span>
                            {field.fieldName}
                          </h4>
                          {field.fieldType === "list" &&
                          Array.isArray(field.value) ? (
                            <ul
                              style={{
                                listStyle: "none",
                                padding: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                              }}
                            >
                              {field.value.map((item, idx) => (
                                <li
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "0.5rem",
                                    color: "#4b5563",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#10b981",
                                      fontSize: "0.75rem",
                                      marginTop: "0.4rem",
                                    }}
                                  >
                                    •
                                  </span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p
                              style={{
                                color: "#4b5563",
                                lineHeight: 1.7,
                                whiteSpace: "pre-line",
                                margin: 0,
                              }}
                            >
                              {field.value}
                            </p>
                          )}
                        </div>
                      ))}
                </div>
              )}

              {activeTab === "itinerary" && (
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      marginBottom: "1.5rem",
                      color: "#1f2937",
                    }}
                  >
                    Day-by-Day Itinerary
                  </h3>

                  {pkg.itinerary &&
                  Array.isArray(pkg.itinerary) &&
                  pkg.itinerary.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      {pkg.itinerary.map((day, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "1.5rem",
                            backgroundColor: "#f8fafc",
                            borderRadius: "0.75rem",
                            borderLeft: "4px solid #0066cc",
                            marginBottom: "1rem",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "1.2rem",
                              fontWeight: 700,
                              color: "#0066cc",
                              marginBottom: "1rem",
                            }}
                          >
                            Day {day.day || idx + 1}:{" "}
                            {day.title || `Day ${day.day || idx + 1}`}
                          </h4>
                          <p
                            style={{
                              color: "#4b5563",
                              fontSize: "1rem",
                              lineHeight: 1.7,
                              whiteSpace: "pre-line",
                            }}
                          >
                            {day.description || "No details available"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "0.9rem",
                      }}
                    >
                      Detailed itinerary will be shared upon booking.
                    </p>
                  )}

                  {/* Custom Fields for Itinerary */}
                  {pkg.customFields &&
                    pkg.customFields
                      .filter((f) => f.section === "itinerary")
                      .map((field) => (
                        <div
                          key={field.id}
                          style={{
                            marginTop: "1.5rem",
                            padding: "1.25rem",
                            backgroundColor: "#f8fafc",
                            borderRadius: "0.75rem",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "1.05rem",
                              fontWeight: 700,
                              marginBottom: "0.75rem",
                              color: "#0066cc",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "1.1rem" }}
                            >
                              info
                            </span>
                            {field.fieldName}
                          </h4>
                          {field.fieldType === "list" &&
                          Array.isArray(field.value) ? (
                            <ul
                              style={{
                                listStyle: "none",
                                padding: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                              }}
                            >
                              {field.value.map((item, idx) => (
                                <li
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "0.5rem",
                                    color: "#4b5563",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#10b981",
                                      fontSize: "0.75rem",
                                      marginTop: "0.4rem",
                                    }}
                                  >
                                    •
                                  </span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p
                              style={{
                                color: "#4b5563",
                                lineHeight: 1.7,
                                whiteSpace: "pre-line",
                                margin: 0,
                              }}
                            >
                              {field.value}
                            </p>
                          )}
                        </div>
                      ))}
                </div>
              )}

              {activeTab === "inclusions" && (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "2rem",
                    }}
                  >
                    {/* Inclusions */}
                    <div>
                      <h3
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          marginBottom: "1rem",
                          color: "#059669",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span className="material-symbols-outlined">
                          check_circle
                        </span>
                        What&apos;s Included
                      </h3>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                        }}
                      >
                        {pkg.inclusions && pkg.inclusions.length > 0 ? (
                          pkg.inclusions.map((item, idx) => (
                            <li
                              key={idx}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "0.5rem",
                                color: "#4b5563",
                                fontSize: "0.9rem",
                              }}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{
                                  color: "#10b981",
                                  fontSize: "1.1rem",
                                  flexShrink: 0,
                                }}
                              >
                                check
                              </span>
                              {item}
                            </li>
                          ))
                        ) : (
                          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                            Inclusions will be shared upon inquiry.
                          </p>
                        )}
                      </ul>
                    </div>

                    {/* Exclusions */}
                    <div>
                      <h3
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          marginBottom: "1rem",
                          color: "#dc2626",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span className="material-symbols-outlined">
                          cancel
                        </span>
                        What&apos;s Not Included
                      </h3>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                        }}
                      >
                        {pkg.exclusions && pkg.exclusions.length > 0 ? (
                          pkg.exclusions.map((item, idx) => (
                            <li
                              key={idx}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "0.5rem",
                                color: "#4b5563",
                                fontSize: "0.9rem",
                              }}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{
                                  color: "#ef4444",
                                  fontSize: "1.1rem",
                                  flexShrink: 0,
                                }}
                              >
                                close
                              </span>
                              {item}
                            </li>
                          ))
                        ) : (
                          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                            Exclusions will be shared upon inquiry.
                          </p>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Custom Fields for Inclusions */}
                  {pkg.customFields &&
                    pkg.customFields
                      .filter((f) => f.section === "inclusions")
                      .map((field) => (
                        <div
                          key={field.id}
                          style={{
                            marginTop: "1.5rem",
                            padding: "1.25rem",
                            backgroundColor: "#f8fafc",
                            borderRadius: "0.75rem",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "1.05rem",
                              fontWeight: 700,
                              marginBottom: "0.75rem",
                              color: "#0066cc",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "1.1rem" }}
                            >
                              info
                            </span>
                            {field.fieldName}
                          </h4>
                          {field.fieldType === "list" &&
                          Array.isArray(field.value) ? (
                            <ul
                              style={{
                                listStyle: "none",
                                padding: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                              }}
                            >
                              {field.value.map((item, idx) => (
                                <li
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "0.5rem",
                                    color: "#4b5563",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#10b981",
                                      fontSize: "0.75rem",
                                      marginTop: "0.4rem",
                                    }}
                                  >
                                    •
                                  </span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p
                              style={{
                                color: "#4b5563",
                                lineHeight: 1.7,
                                whiteSpace: "pre-line",
                                margin: 0,
                              }}
                            >
                              {field.value}
                            </p>
                          )}
                        </div>
                      ))}
                </div>
              )}

              {activeTab === "essentials" && (
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      marginBottom: "1.5rem",
                      color: "#1f2937",
                    }}
                  >
                    Things to Carry
                  </h3>

                  {pkg.thingsToCarry && pkg.thingsToCarry.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.5rem",
                      }}
                    >
                      {/* Check if it's the new format (array of objects) or old format (array of strings) */}
                      {typeof pkg.thingsToCarry[0] === "string" ? (
                        // Old format: array of strings
                        <div
                          style={{
                            backgroundColor: "#f0fdf4",
                            padding: "1.25rem",
                            borderRadius: "0.75rem",
                            border: "1px solid #bbf7d0",
                          }}
                        >
                          <ul
                            style={{
                              listStyle: "none",
                              padding: 0,
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(280px, 1fr))",
                              gap: "0.75rem",
                            }}
                          >
                            {pkg.thingsToCarry.map((item, idx) => {
                              // Only render if item is a string
                              if (typeof item !== "string") return null;

                              return (
                                <li
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "0.5rem",
                                    color: "#374151",
                                    fontSize: "0.925rem",
                                    lineHeight: "1.5",
                                  }}
                                >
                                  <span
                                    className="material-symbols-outlined"
                                    style={{
                                      color: "#22c55e",
                                      fontSize: "1.1rem",
                                      flexShrink: 0,
                                    }}
                                  >
                                    check_box
                                  </span>
                                  {item}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : (
                        // New format: array of category objects
                        pkg.thingsToCarry.map((carryCategory, catIdx) => {
                          // Type guard to ensure carryCategory is an object
                          if (typeof carryCategory === "string") return null;

                          const categoryObj = carryCategory as {
                            category: string;
                            items: string[];
                          };

                          return (
                            <div
                              key={catIdx}
                              style={{
                                backgroundColor: "#f8fafc",
                                padding: "1.25rem",
                                borderRadius: "0.75rem",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              <h4
                                style={{
                                  fontSize: "1.05rem",
                                  fontWeight: 700,
                                  marginBottom: "1rem",
                                  color: "#0066cc",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <span
                                  className="material-symbols-outlined"
                                  style={{ fontSize: "1.2rem" }}
                                >
                                  backpack
                                </span>
                                {categoryObj.category}
                              </h4>
                              <ul
                                style={{
                                  listStyle: "none",
                                  padding: 0,
                                  display: "grid",
                                  gridTemplateColumns:
                                    "repeat(auto-fit, minmax(280px, 1fr))",
                                  gap: "0.75rem",
                                }}
                              >
                                {categoryObj.items &&
                                  categoryObj.items.map((item, itemIdx) => (
                                    <li
                                      key={itemIdx}
                                      style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "0.5rem",
                                        color: "#374151",
                                        fontSize: "0.925rem",
                                        lineHeight: "1.5",
                                      }}
                                    >
                                      <span
                                        style={{
                                          color: "#22c55e",
                                          fontSize: "0.75rem",
                                          flexShrink: 0,
                                          marginTop: "0.35rem",
                                        }}
                                      >
                                        •
                                      </span>
                                      {item}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          );
                        })
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        backgroundColor: "#f0fdf4",
                        padding: "1.25rem",
                        borderRadius: "0.75rem",
                        border: "1px solid #bbf7d0",
                      }}
                    >
                      <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                        No items specified.
                      </p>
                    </div>
                  )}

                  {/* Custom Fields for Things to Carry */}
                  {pkg.customFields &&
                    pkg.customFields
                      .filter((f) => f.section === "essentials")
                      .map((field) => (
                        <div
                          key={field.id}
                          style={{
                            marginTop: "1.5rem",
                            padding: "1.25rem",
                            backgroundColor: "#f8fafc",
                            borderRadius: "0.75rem",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "1.05rem",
                              fontWeight: 700,
                              marginBottom: "0.75rem",
                              color: "#0066cc",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "1.1rem" }}
                            >
                              info
                            </span>
                            {field.fieldName}
                          </h4>
                          {field.fieldType === "list" &&
                          Array.isArray(field.value) ? (
                            <ul
                              style={{
                                listStyle: "none",
                                padding: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                              }}
                            >
                              {field.value.map((item, idx) => (
                                <li
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "0.5rem",
                                    color: "#4b5563",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#10b981",
                                      fontSize: "0.75rem",
                                      marginTop: "0.4rem",
                                    }}
                                  >
                                    •
                                  </span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p
                              style={{
                                color: "#4b5563",
                                lineHeight: 1.7,
                                whiteSpace: "pre-line",
                                margin: 0,
                              }}
                            >
                              {field.value}
                            </p>
                          )}
                        </div>
                      ))}
                </div>
              )}

              {activeTab === "policies" && (
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      marginBottom: "1.5rem",
                      color: "#1f2937",
                    }}
                  >
                    Notes & Policies
                  </h3>

                  {/* Important Notes */}
                  {pkg.importantNotes && pkg.importantNotes.length > 0 && (
                    <div
                      style={{
                        backgroundColor: "#fef3c7",
                        padding: "1.25rem",
                        borderRadius: "0.75rem",
                        marginBottom: "1.5rem",
                        border: "1px solid #fcd34d",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          marginBottom: "1rem",
                          color: "#92400e",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span className="material-symbols-outlined">
                          warning
                        </span>
                        Important Notes
                      </h4>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                        }}
                      >
                        {pkg.importantNotes.map((note, idx) => (
                          <li
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "0.5rem",
                              color: "#374151",
                              fontSize: "0.9rem",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{
                                color: "#d97706",
                                fontSize: "1rem",
                                flexShrink: 0,
                              }}
                            >
                              arrow_right
                            </span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Refund & Cancellation Policy */}
                  <div
                    style={{
                      backgroundColor: "#fef2f2",
                      padding: "1.25rem",
                      borderRadius: "0.75rem",
                      border: "1px solid #fecaca",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        marginBottom: "1rem",
                        color: "#991b1b",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span className="material-symbols-outlined">
                        event_busy
                      </span>
                      Refund & Cancellation Policy
                    </h4>

                    {/* Refund Tiers Table */}
                    {pkg.refundTiers && pkg.refundTiers.length > 0 && (
                      <div style={{ marginBottom: "1.5rem" }}>
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            backgroundColor: "white",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          <thead>
                            <tr style={{ backgroundColor: "#fee2e2" }}>
                              <th
                                style={{
                                  padding: "0.75rem 1rem",
                                  textAlign: "left",
                                  fontWeight: 600,
                                  color: "#991b1b",
                                  fontSize: "0.85rem",
                                  borderBottom: "1px solid #fecaca",
                                }}
                              >
                                Cancellation Period
                              </th>
                              <th
                                style={{
                                  padding: "0.75rem 1rem",
                                  textAlign: "left",
                                  fontWeight: 600,
                                  color: "#991b1b",
                                  fontSize: "0.85rem",
                                  borderBottom: "1px solid #fecaca",
                                }}
                              >
                                Refund Policy
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pkg.refundTiers.map((tier, idx) => (
                              <tr
                                key={idx}
                                style={{
                                  backgroundColor:
                                    idx % 2 === 0 ? "#fff" : "#fef2f2",
                                }}
                              >
                                <td
                                  style={{
                                    padding: "0.75rem 1rem",
                                    fontSize: "0.9rem",
                                    color: "#374151",
                                    fontWeight: 500,
                                    borderBottom: "1px solid #fecaca",
                                  }}
                                >
                                  {tier.timeframe}
                                </td>
                                <td
                                  style={{
                                    padding: "0.75rem 1rem",
                                    fontSize: "0.9rem",
                                    color: "#374151",
                                    borderBottom: "1px solid #fecaca",
                                  }}
                                >
                                  {tier.refundInfo}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Policy Notes */}
                    {pkg.refundPolicyNotes ? (
                      <div
                        style={{
                          color: "#374151",
                          fontSize: "0.85rem",
                          lineHeight: 1.7,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {pkg.refundPolicyNotes}
                      </div>
                    ) : (
                      !pkg.refundTiers?.length && (
                        <p
                          style={{
                            color: "#64748b",
                            fontSize: "0.9rem",
                          }}
                        >
                          Refund and cancellation policy will be shared upon
                          booking.
                        </p>
                      )
                    )}
                  </div>

                  {/* Custom Fields for Policies */}
                  {pkg.customFields &&
                    pkg.customFields
                      .filter((f) => f.section === "policies")
                      .map((field) => (
                        <div
                          key={field.id}
                          style={{
                            marginTop: "1.5rem",
                            padding: "1.25rem",
                            backgroundColor: "#f8fafc",
                            borderRadius: "0.75rem",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "1.05rem",
                              fontWeight: 700,
                              marginBottom: "0.75rem",
                              color: "#0066cc",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "1.1rem" }}
                            >
                              info
                            </span>
                            {field.fieldName}
                          </h4>
                          {field.fieldType === "list" &&
                          Array.isArray(field.value) ? (
                            <ul
                              style={{
                                listStyle: "none",
                                padding: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                              }}
                            >
                              {field.value.map((item, idx) => (
                                <li
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "0.5rem",
                                    color: "#4b5563",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#10b981",
                                      fontSize: "0.75rem",
                                      marginTop: "0.4rem",
                                    }}
                                  >
                                    •
                                  </span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p
                              style={{
                                color: "#4b5563",
                                lineHeight: 1.7,
                                whiteSpace: "pre-line",
                                margin: 0,
                              }}
                            >
                              {field.value}
                            </p>
                          )}
                        </div>
                      ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card */}
          <div>
            <div
              style={{
                position: "sticky",
                top: "100px",
                backgroundColor: "white",
                borderRadius: "1rem",
                padding: "1.5rem",
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e5e7eb",
              }}
            >
              {/* Price */}
              <div
                style={{
                  marginBottom: "1.5rem",
                  paddingBottom: "1rem",
                  borderBottom: "1px solid #e5e7eb",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    gap: "0.5rem",
                  }}
                >
                  {pkg.price && pkg.price > 0 ? (
                    <>
                      <span
                        style={{
                          fontSize: "2rem",
                          fontWeight: 800,
                          color: "#1f2937",
                        }}
                      >
                        {formatInr(pkg.price)}
                      </span>
                      <span style={{ color: "#64748b", fontSize: "0.9rem" }}>
                        /person
                      </span>
                    </>
                  ) : (
                    <span
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#0066cc",
                      }}
                    >
                      Contact for Price
                    </span>
                  )}
                </div>
              </div>

              {/* Booking Form */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Travel Date
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        position: "absolute",
                        left: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#9ca3af",
                        fontSize: "1.25rem",
                      }}
                    >
                      calendar_month
                    </span>
                    <input
                      type="date"
                      value={bookingDetails.travelDate}
                      onChange={(e) =>
                        setBookingDetails({
                          ...bookingDetails,
                          travelDate: e.target.value,
                        })
                      }
                      min={new Date().toISOString().split("T")[0]}
                      style={{
                        width: "100%",
                        padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                        borderRadius: "0.5rem",
                        border: "1px solid #d1d5db",
                        fontSize: "0.95rem",
                        outline: "none",
                      }}
                    />
                  </div>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                      color: "#374151",
                      marginBottom: "0.5rem",
                    }}
                  >
                    Number of Travelers
                  </label>
                  <div style={{ position: "relative" }}>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        position: "absolute",
                        left: "0.75rem",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#9ca3af",
                        fontSize: "1.25rem",
                      }}
                    >
                      group
                    </span>
                    <select
                      value={bookingDetails.travelers}
                      onChange={(e) =>
                        setBookingDetails({
                          ...bookingDetails,
                          travelers: parseInt(e.target.value),
                        })
                      }
                      style={{
                        width: "100%",
                        padding: "0.75rem 0.75rem 0.75rem 2.5rem",
                        borderRadius: "0.5rem",
                        border: "1px solid #d1d5db",
                        fontSize: "0.95rem",
                        outline: "none",
                        backgroundColor: "white",
                        cursor: "pointer",
                      }}
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Traveler" : "Travelers"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Total */}
                <div
                  style={{
                    backgroundColor: "#f8fafc",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                      color: "#6b7280",
                    }}
                  >
                    <span>
                      {formatInr(pkg.price || 0)} × {bookingDetails.travelers}{" "}
                      {bookingDetails.travelers === 1 ? "person" : "people"}
                    </span>
                    <span>{formatInr(totalPrice)}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "#1f2937",
                      paddingTop: "0.5rem",
                      borderTop: "1px dashed #d1d5db",
                    }}
                  >
                    <span>Total</span>
                    <span>{formatInr(totalPrice)}</span>
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={!bookingDetails.travelDate}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    backgroundColor: bookingDetails.travelDate
                      ? "#0066cc"
                      : "#94a3b8",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    fontSize: "1rem",
                    fontWeight: 700,
                    cursor: bookingDetails.travelDate
                      ? "pointer"
                      : "not-allowed",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "background-color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (bookingDetails.travelDate) {
                      e.currentTarget.style.backgroundColor = "#0052a3";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (bookingDetails.travelDate) {
                      e.currentTarget.style.backgroundColor = "#0066cc";
                    }
                  }}
                >
                  <span className="material-symbols-outlined">
                    flight_takeoff
                  </span>
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
