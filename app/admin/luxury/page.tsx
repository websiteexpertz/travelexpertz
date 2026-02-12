"use client";

import React, { useEffect, useState } from "react";

interface Property {
  _id: string;
  name: string;
  location: string;
  price: number;
  image: string;
  luxury?: boolean;
  type: "hotel" | "homestay";
}

export default function AdminLuxury() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [homestays, setHomestays] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    "hotel" | "homestay"
  >("hotel");
  const [updating, setUpdating] = useState<string | null>(null);

  const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const formatInr = (value: number) =>
    inrFormatter.format(Math.max(0, Math.round(value)));

  useEffect(() => {
    fetchAllProperties();
  }, []);

  const fetchAllProperties = async () => {
    try {
      const [hotelsRes, homestaysRes] = await Promise.all([
        fetch("/api/hotels", { cache: "no-store" }),
        fetch("/api/homestays", { cache: "no-store" }),
      ]);

      if (hotelsRes.ok) {
        const data = await hotelsRes.json();
        setHotels(Array.isArray(data) ? data : []);
      }
      if (homestaysRes.ok) {
        const data = await homestaysRes.json();
        setHomestays(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch properties:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentProperties = () => {
    return selectedCategory === "hotel" ? hotels : homestays;
  };

  const toggleLuxuryStatus = async (
    propertyId: string,
    currentStatus: boolean,
  ) => {
    setUpdating(propertyId);
    try {
      const endpoint =
        selectedCategory === "hotel" ? "/api/hotels" : "/api/homestays";
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: propertyId,
          isLuxury: !currentStatus,
          luxury: !currentStatus, // Keep for backward compatibility
        }),
      });

      if (response.ok) {
        await fetchAllProperties();
        alert(
          `Property ${
            !currentStatus ? "added to" : "removed from"
          } luxury collection!`,
        );
      } else {
        alert("Failed to update property");
      }
    } catch (error) {
      console.error("Failed to update luxury status:", error);
      alert("Failed to update property");
    } finally {
      setUpdating(null);
    }
  };

  const getLuxuryCount = () => {
    const properties = getCurrentProperties();
    return properties.filter((p) => p.isLuxury === true || p.luxury === true)
      .length;
  };

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "2rem",
              fontWeight: 700,
              color: "#1f2937",
            }}
          >
            Manage Luxury Properties
          </h1>
          <p
            style={{
              margin: "0.5rem 0 0",
              color: "#6b7280",
              fontSize: "0.95rem",
            }}
          >
            Select hotels and homestays to feature in the luxury collection
          </p>
        </div>

        {/* Category Tabs */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            padding: "1rem",
            marginBottom: "2rem",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <button
            onClick={() => setSelectedCategory("hotel")}
            style={{
              padding: "0.75rem 1.5rem",
              background: selectedCategory === "hotel" ? "#d4af37" : "#f9fafb",
              color: selectedCategory === "hotel" ? "white" : "#1f2937",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            Hotels ({hotels.filter((h) => h.luxury).length})
          </button>
          <button
            onClick={() => setSelectedCategory("homestay")}
            style={{
              padding: "0.75rem 1.5rem",
              background:
                selectedCategory === "homestay" ? "#d4af37" : "#f9fafb",
              color: selectedCategory === "homestay" ? "white" : "#1f2937",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: 600,
            }}
          >
            Homestays ({homestays.filter((h) => h.luxury).length})
          </button>
          <div
            style={{
              marginLeft: "auto",
              fontSize: "1.1rem",
              fontWeight: 600,
              color: "#d4af37",
            }}
          >
            ⭐ {getLuxuryCount()} Luxury Properties in{" "}
            {selectedCategory === "hotel" ? "Hotels" : "Homestays"}
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              padding: "3rem",
              textAlign: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            }}
          >
            <p style={{ color: "#6b7280" }}>Loading properties...</p>
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {getCurrentProperties().map((property) => (
              <div
                key={property._id}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  border:
                    property.isLuxury || property.luxury
                      ? "3px solid #d4af37"
                      : "1px solid #e5e7eb",
                  position: "relative",
                }}
              >
                {(property.isLuxury || property.luxury) && (
                  <div
                    style={{
                      position: "absolute",
                      top: "1rem",
                      right: "1rem",
                      background: "#d4af37",
                      color: "white",
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      zIndex: 1,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    ⭐ LUXURY
                  </div>
                )}

                {property.image && (
                  <img
                    src={property.image}
                    alt={property.name}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                    }}
                  />
                )}

                <div style={{ padding: "1.5rem" }}>
                  <h3
                    style={{
                      margin: "0 0 0.5rem",
                      fontSize: "1.2rem",
                      fontWeight: 700,
                    }}
                  >
                    {property.name}
                  </h3>
                  <p
                    style={{
                      margin: "0 0 0.5rem",
                      color: "#6b7280",
                      fontSize: "0.9rem",
                    }}
                  >
                    📍 {property.location}
                  </p>
                  <p
                    style={{
                      margin: "0 0 1rem",
                      color: "#0066cc",
                      fontSize: "1.1rem",
                      fontWeight: 700,
                    }}
                  >
                    {formatInr(property.price)}
                  </p>

                  <button
                    onClick={() =>
                      toggleLuxuryStatus(property._id, property.luxury || false)
                    }
                    disabled={updating === property._id}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: property.luxury ? "#ef4444" : "#d4af37",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor:
                        updating === property._id ? "not-allowed" : "pointer",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      opacity: updating === property._id ? 0.6 : 1,
                    }}
                  >
                    {updating === property._id
                      ? "Updating..."
                      : property.luxury
                        ? "Remove from Luxury"
                        : "Add to Luxury"}
                  </button>
                </div>
              </div>
            ))}

            {getCurrentProperties().length === 0 && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  background: "white",
                  borderRadius: "12px",
                  padding: "3rem",
                  textAlign: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🏨</div>
                <h3 style={{ margin: "0 0 0.5rem", fontSize: "1.2rem" }}>
                  No Properties Found
                </h3>
                <p style={{ margin: 0, color: "#6b7280" }}>
                  No {selectedCategory}s available
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
