"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "../components/Header";

interface Package {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  duration: string;
  location: string;
  featured: boolean;
  active: boolean;
}

export default function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"price-low" | "price-high" | "featured">(
    "featured"
  );

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch("/api/packages", {
          method: "GET",
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          setPackages(data);
          setFilteredPackages(data);
        } else {
          console.error("Failed to fetch packages");
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  // Filter and sort packages
  useEffect(() => {
    let filtered = packages.filter(
      (pkg) =>
        pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pkg.location.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      if (sortBy === "price-low") {
        return a.price - b.price;
      } else if (sortBy === "price-high") {
        return b.price - a.price;
      } else {
        // Featured first
        if (a.featured && !b.featured) return -1;
        if (!a.featured && b.featured) return 1;
        return 0;
      }
    });

    setFilteredPackages(filtered);
  }, [searchTerm, sortBy, packages]);

  if (loading) {
    return (
      <>
        <Header currentPage="packages" />
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
            <p style={{ fontSize: "1.1rem", color: "#666" }}>
              Loading packages...
            </p>
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header currentPage="packages" />
      <div style={{ minHeight: "100vh", background: "#f5f7fa" }}>
        {/* ========== HERO SECTION ========== */}
        <div
          className="w-full"
          style={{ background: "transparent", padding: "0 1.5rem" }}
        >
          <div
            className="hero-section"
            style={{
              backgroundImage: "url('/hero-banner.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="hero-content">
              <h1>Explore Our Travel Packages</h1>
              <p>
                Discover curated travel experiences designed for unforgettable
                adventures
              </p>
            </div>

            {/* Search Form Box */}
            <div className="search-box">
              <div className="search-box-content">
                <div className="search-item">
                  <span className="material-symbols-outlined">location_on</span>
                  <span>Location</span>
                  <span
                    className="material-symbols-outlined"
                    style={{ marginLeft: "auto" }}
                  >
                    arrow_drop_down
                  </span>
                </div>
                <div className="search-item">
                  <span className="material-symbols-outlined">
                    calendar_month
                  </span>
                  <span>Start Date</span>
                  <span
                    className="material-symbols-outlined"
                    style={{ marginLeft: "auto" }}
                  >
                    arrow_drop_down
                  </span>
                </div>
                <div className="search-item">
                  <span className="material-symbols-outlined">
                    calendar_month
                  </span>
                  <span>End Date</span>
                  <span
                    className="material-symbols-outlined"
                    style={{ marginLeft: "auto" }}
                  >
                    arrow_drop_down
                  </span>
                </div>
                <div className="search-item">
                  <span className="material-symbols-outlined">group</span>
                  <span>Guests</span>
                  <span
                    className="material-symbols-outlined"
                    style={{ marginLeft: "auto" }}
                  >
                    arrow_drop_down
                  </span>
                </div>
                <div className="search-item">
                  <span className="material-symbols-outlined">trending_up</span>
                  <span>Budget</span>
                  <span
                    className="material-symbols-outlined"
                    style={{ marginLeft: "auto" }}
                  >
                    arrow_drop_down
                  </span>
                </div>
                <button className="search-btn">Search</button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div
          style={{
            maxWidth: "100rem",
            margin: "0 auto 3rem",
            padding: "0 1.5rem",
            display: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: "1.5rem",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search by package name or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: "1",
                minWidth: "250px",
                padding: "0.75rem 1rem",
                fontSize: "1rem",
                border: "2px solid #ddd",
                borderRadius: "0.5rem",
                fontFamily: "inherit",
                transition: "border-color 0.3s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#0a66c2")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#ddd")}
            />

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "price-low" | "price-high" | "featured"
                )
              }
              style={{
                padding: "0.75rem 1rem",
                fontSize: "1rem",
                border: "2px solid #ddd",
                borderRadius: "0.5rem",
                background: "white",
                cursor: "pointer",
                fontFamily: "inherit",
                transition: "border-color 0.3s",
              }}
            >
              <option value="featured">Featured First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>

          {/* Results Count */}
          <p
            style={{
              marginTop: "1rem",
              color: "#666",
              fontSize: "0.95rem",
            }}
          >
            Showing {filteredPackages.length} package
            {filteredPackages.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Packages Grid */}
        <div
          style={{
            maxWidth: "100rem",
            margin: "0 auto",
            padding: "0 1.5rem 3rem",
          }}
        >
          {filteredPackages.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                gap: "2rem",
              }}
            >
              {filteredPackages.map((pkg) => (
                <Link
                  key={pkg._id || pkg.id}
                  href={`/packages/${pkg._id || pkg.id}`}
                  style={{ textDecoration: "none" }}
                >
                  <div
                    style={{
                      background: "white",
                      borderRadius: "1rem",
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                    onMouseEnter={(e) => {
                      const elem = e.currentTarget;
                      elem.style.boxShadow = "0 12px 24px rgba(0, 0, 0, 0.15)";
                      elem.style.transform = "translateY(-8px)";
                    }}
                    onMouseLeave={(e) => {
                      const elem = e.currentTarget;
                      elem.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.1)";
                      elem.style.transform = "translateY(0)";
                    }}
                  >
                    {/* Image */}
                    <div
                      style={{
                        position: "relative",
                        overflow: "hidden",
                        height: "200px",
                        background:
                          "linear-gradient(135deg, #e0e7ff 0%, #f3e8ff 100%)",
                      }}
                    >
                      <img
                        src={pkg.image}
                        alt={pkg.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                        }}
                        onMouseEnter={(e) =>
                          ((e.target as HTMLImageElement).style.transform =
                            "scale(1.1)")
                        }
                        onMouseLeave={(e) =>
                          ((e.target as HTMLImageElement).style.transform =
                            "scale(1)")
                        }
                      />

                      {/* Featured Badge */}
                      {pkg.featured && (
                        <div
                          style={{
                            position: "absolute",
                            top: "1rem",
                            right: "1rem",
                            background: "#fbbf24",
                            color: "#000",
                            padding: "0.5rem 1rem",
                            borderRadius: "9999px",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
                          }}
                        >
                          ⭐ Featured
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div
                      style={{
                        padding: "1.5rem",
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                      }}
                    >
                      {/* Title */}
                      <h3
                        style={{
                          fontSize: "1.25rem",
                          fontWeight: 700,
                          color: "#1a1a2e",
                          marginBottom: "0.5rem",
                          margin: "0 0 0.5rem 0",
                        }}
                      >
                        {pkg.title}
                      </h3>

                      {/* Location */}
                      <p
                        style={{
                          fontSize: "0.95rem",
                          color: "#0a66c2",
                          fontWeight: 600,
                          marginBottom: "0.75rem",
                          margin: "0 0 0.75rem 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        📍 {pkg.location}
                      </p>

                      {/* Description */}
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "#666",
                          lineHeight: 1.6,
                          marginBottom: "1rem",
                          flex: 1,
                          overflow: "hidden",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {pkg.description}
                      </p>

                      {/* Duration */}
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "#666",
                          marginBottom: "1rem",
                          margin: "0 0 1rem 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        ⏱️ {pkg.duration}
                      </p>

                      {/* Price Section */}
                      <div
                        style={{
                          borderTop: "1px solid #eee",
                          paddingTop: "1rem",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <p
                            style={{
                              fontSize: "0.85rem",
                              color: "#999",
                              margin: "0 0 0.25rem 0",
                            }}
                          >
                            Starting From
                          </p>
                          <p
                            style={{
                              fontSize: "1.5rem",
                              fontWeight: 700,
                              color: "#0a66c2",
                              margin: 0,
                            }}
                          >
                            {pkg.currency}
                            {pkg.price.toLocaleString()}
                          </p>
                        </div>
                        <div
                          style={{
                            background: "#0a66c2",
                            color: "white",
                            padding: "0.5rem 1rem",
                            borderRadius: "0.5rem",
                            fontSize: "0.9rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "background 0.3s",
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.background = "#0052a3")
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.background = "#0a66c2")
                          }
                        >
                          View Details
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "4rem 2rem",
                background: "white",
                borderRadius: "1rem",
                color: "#666",
              }}
            >
              <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                No packages found matching your search.
              </p>
              <p style={{ color: "#999" }}>
                Try adjusting your filters or search terms.
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
