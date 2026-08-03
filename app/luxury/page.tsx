"use client";

import React, { useEffect, useState } from "react";
import Header from "../components/Header";

interface Property {
  _id: string;
  name: string;
  location: string;
  price: number;
  image: string;
  description?: string;
  rating?: number;
  amenities?: string[];
  type: "hotel" | "homestay";
}

export default function LuxuryPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "hotel" | "homestay">("all");

  const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const formatInr = (value: number) =>
    inrFormatter.format(Math.max(0, Math.round(value)));

  useEffect(() => {
    fetchLuxuryProperties();
  }, []);

  const fetchLuxuryProperties = async () => {
    try {
      const [hotelsRes, homestaysRes] = await Promise.all([
        fetch("/api/hotels", { cache: "no-store" }),
        fetch("/api/homestays", { cache: "no-store" }),
      ]);

      const allProperties: Property[] = [];

      if (hotelsRes.ok) {
        const hotels = await hotelsRes.json();
        const luxuryHotels = Array.isArray(hotels)
          ? hotels
              .filter((h: any) => h.isLuxury === true || h.luxury === true)
              .map((h: any) => ({ ...h, type: "hotel" as const }))
          : [];
        allProperties.push(...luxuryHotels);
      }

      if (homestaysRes.ok) {
        const homestays = await homestaysRes.json();
        const luxuryHomestays = Array.isArray(homestays)
          ? homestays
              .filter((h: any) => h.isLuxury === true || h.luxury === true)
              .map((h: any) => ({ ...h, type: "homestay" as const }))
          : [];
        allProperties.push(...luxuryHomestays);
      }

      setProperties(allProperties);
    } catch (error) {
      console.error("Failed to fetch luxury properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredProperties = () => {
    if (filter === "all") return properties;
    return properties.filter((p) => p.type === filter);
  };

  const filteredProperties = getFilteredProperties();

  return (
    <>
      <Header solidHeader={true} />
      <div
        style={{
          background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
          minHeight: "100vh",
        }}
      >
        {/* Hero Section */}
        <div
          style={{
            background: "linear-gradient(135deg, #d4af37 0%, #f4e4b0 100%)",
            padding: "4rem 2rem",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              margin: "0 0 1rem",
              fontSize: "3rem",
              fontWeight: 800,
              color: "#1a1a1a",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            ⭐ Luxury Collection ⭐
          </h1>
          <p
            style={{
              margin: 0,
              fontSize: "1.2rem",
              color: "#2d2d2d",
              fontWeight: 500,
            }}
          >
            Experience the finest handpicked luxury properties
          </p>
        </div>

        {/* Filter Tabs */}
        <div
          style={{
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "2rem 2rem 1rem",
            display: "flex",
            gap: "1rem",
            justifyContent: "center",
          }}
        >
          {[
            { value: "all", label: "All Luxury", count: properties.length },
            {
              value: "hotel",
              label: "Hotels",
              count: properties.filter((p) => p.type === "hotel").length,
            },
            {
              value: "homestay",
              label: "Homestays",
              count: properties.filter((p) => p.type === "homestay").length,
            },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as any)}
              style={{
                padding: "0.75rem 1.5rem",
                background: filter === tab.value ? "#d4af37" : "#3a3a3a",
                color: filter === tab.value ? "#1a1a1a" : "#f9fafb",
                border:
                  filter === tab.value
                    ? "2px solid #f4e4b0"
                    : "1px solid #4a4a4a",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.95rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "1px",
                transition: "all 0.3s",
              }}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        {/* Properties Grid */}
        <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "2rem" }}>
          {loading ? (
            <div
              style={{
                background: "#2d2d2d",
                borderRadius: "12px",
                padding: "3rem",
                textAlign: "center",
                border: "1px solid #4a4a4a",
              }}
            >
              <p style={{ color: "#d4af37", fontSize: "1.2rem" }}>
                Loading luxury properties...
              </p>
            </div>
          ) : filteredProperties.length === 0 ? (
            <div
              style={{
                background: "#2d2d2d",
                borderRadius: "12px",
                padding: "3rem",
                textAlign: "center",
                border: "1px solid #4a4a4a",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>⭐</div>
              <h3
                style={{
                  margin: "0 0 0.5rem",
                  fontSize: "1.5rem",
                  color: "#d4af37",
                }}
              >
                No Luxury Properties Available
              </h3>
              <p style={{ margin: 0, color: "#9ca3af" }}>
                Check back soon for exclusive luxury offerings
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))",
                gap: "2rem",
              }}
            >
              {filteredProperties.map((property) => (
                <div
                  key={property._id}
                  onClick={() => {
                    const url =
                      property.type === "hotel"
                        ? `/hotels/${property._id}`
                        : `/homestays/${property._id}`;
                    window.location.href = url;
                  }}
                  style={{
                    background: "#2d2d2d",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: "2px solid #d4af37",
                    cursor: "pointer",
                    transition: "all 0.3s",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 30px rgba(212, 175, 55, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  {/* Luxury Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      background:
                        "linear-gradient(135deg, #d4af37 0%, #f4e4b0 100%)",
                      color: "#1a1a1a",
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      fontWeight: 800,
                      zIndex: 1,
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    }}
                  >
                    ⭐ LUXURY
                  </div>

                  {/* Type Badge */}
                  <div
                    style={{
                      position: "absolute",
                      top: "1rem",
                      left: "1rem",
                      background: "rgba(0, 0, 0, 0.7)",
                      color: "#f9fafb",
                      padding: "0.4rem 0.8rem",
                      borderRadius: "6px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      zIndex: 1,
                      textTransform: "uppercase",
                    }}
                  >
                    {property.type === "hotel" ? "🏨 Hotel" : "🏡 Homestay"}
                  </div>

                  {property.image && (
                    <img
                      src={property.image}
                      alt={property.name}
                      style={{
                        width: "100%",
                        height: "250px",
                        objectFit: "cover",
                      }}
                    />
                  )}

                  <div style={{ padding: "1.5rem" }}>
                    <h3
                      style={{
                        margin: "0 0 0.5rem",
                        fontSize: "1.3rem",
                        fontWeight: 700,
                        color: "#f9fafb",
                      }}
                    >
                      {property.name}
                    </h3>

                    <p
                      style={{
                        margin: "0 0 0.5rem",
                        color: "#d4af37",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                      }}
                    >
                      📍 {property.location}
                    </p>

                    {property.description && (
                      <p
                        style={{
                          margin: "0 0 1rem",
                          color: "#9ca3af",
                          fontSize: "0.85rem",
                          lineHeight: "1.5",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {property.description}
                      </p>
                    )}

                    {property.rating && (
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "1rem",
                        }}
                      >
                        <span style={{ color: "#d4af37", fontSize: "1rem" }}>
                          ⭐
                        </span>
                        <span style={{ color: "#f9fafb", fontWeight: 600 }}>
                          {property.rating}
                        </span>
                      </div>
                    )}

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: "1rem",
                        borderTop: "1px solid #4a4a4a",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#9ca3af",
                            marginBottom: "0.25rem",
                          }}
                        >
                          Starting from
                        </div>
                        <div
                          style={{
                            fontSize: "1.4rem",
                            fontWeight: 800,
                            color: "#d4af37",
                          }}
                        >
                          {formatInr(property.price)}
                        </div>
                      </div>
                      <button
                        style={{
                          padding: "0.75rem 1.5rem",
                          background:
                            "linear-gradient(135deg, #d4af37 0%, #f4e4b0 100%)",
                          color: "#1a1a1a",
                          border: "none",
                          borderRadius: "8px",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "1px",
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
