"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";

interface Package {
  _id?: string;
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
}

interface Destination {
  _id?: string;
  name: string;
  image: string;
  packageCount?: number;
  active?: boolean;
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatInr = (value: number) =>
  inrFormatter.format(Math.max(0, Math.round(value)));

export default function Packages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDestination, setSelectedDestination] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [priceRange, setPriceRange] = useState<string>("all");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [packagesRes, destinationsRes] = await Promise.all([
          fetch("/api/packages", { cache: "no-store" }),
          fetch("/api/destinations", { cache: "no-store" }),
        ]);

        if (packagesRes.ok) {
          const data = await packagesRes.json();
          setPackages(Array.isArray(data) ? data : []);
        }

        if (destinationsRes.ok) {
          const data = await destinationsRes.json();
          setDestinations(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredPackages = useMemo(() => {
    return packages
      .filter((pkg) => {
        const matchesSearch = searchQuery
          ? pkg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            pkg.startingPoint
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            pkg.badge?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            pkg.category?.toLowerCase().includes(searchQuery.toLowerCase())
          : true;

        const matchesDestination = selectedDestination
          ? pkg.badge?.toLowerCase() === selectedDestination.toLowerCase()
          : true;

        const matchesPrice = (() => {
          const price = pkg.price || 0;
          if (priceRange === "budget") return price < 15000;
          if (priceRange === "mid") return price >= 15000 && price <= 30000;
          if (priceRange === "luxury") return price > 30000;
          return true;
        })();

        return matchesSearch && matchesDestination && matchesPrice;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return (a.price || 0) - (b.price || 0);
        if (sortBy === "price-high") return (b.price || 0) - (a.price || 0);
        if (sortBy === "duration") {
          const durationA = parseInt(a.duration) || 0;
          const durationB = parseInt(b.duration) || 0;
          return durationA - durationB;
        }
        return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
      });
  }, [packages, searchQuery, priceRange, sortBy, selectedDestination]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Header currentPage="packages" />

      <main className="flex flex-col items-center w-full">
        {/* Hero Section */}
        <div
          className="w-full"
          style={{
            background: "transparent",
            padding: "0 1.5rem",
          }}
        >
          <div
            className="hero-section"
            style={{
              backgroundImage: "url('/hero-background.webp')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="hero-content">
              <h1>Explore Our Travel Packages</h1>
              <p>
                Discover handpicked adventures across India&apos;s most
                beautiful destinations
              </p>
            </div>

            {/* Search Box */}
            <div className="search-box">
              <div className="search-box-content">
                <div className="search-item">
                  <span className="material-symbols-outlined">location_on</span>
                  <input
                    type="text"
                    placeholder="Search destinations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      flex: 1,
                      fontSize: "0.95rem",
                      background: "transparent",
                    }}
                  />
                </div>
                <div className="search-item">
                  <span className="material-symbols-outlined">category</span>
                  <select
                    value={priceRange}
                    onChange={(e) => setPriceRange(e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      flex: 1,
                      fontSize: "0.95rem",
                      background: "transparent",
                    }}
                  >
                    <option value="all">All Budgets</option>
                    <option value="budget">Under ₹15,000</option>
                    <option value="mid">₹15,000 - ₹30,000</option>
                    <option value="luxury">Above ₹30,000</option>
                  </select>
                </div>
                <div className="search-item">
                  <span className="material-symbols-outlined">sort</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      border: "none",
                      outline: "none",
                      flex: 1,
                      fontSize: "0.95rem",
                      background: "transparent",
                    }}
                  >
                    <option value="featured">Featured</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                    <option value="duration">Duration</option>
                  </select>
                </div>
                <button className="search-btn" onClick={() => {}}>
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Destinations Section */}
        <section
          style={{
            padding: "3rem 1.5rem",
            maxWidth: "100rem",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              <span style={{ fontSize: "2rem" }}>🌍</span>
              <h2
                style={{
                  fontSize: "1.75rem",
                  fontWeight: 700,
                  color: "#1f2937",
                }}
              >
                Destinations
              </h2>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "2rem",
              flexWrap: "wrap",
            }}
          >
            {loading && (
              <div style={{ textAlign: "center", color: "#64748b" }}>
                Loading destinations...
              </div>
            )}
            {!loading && destinations.length === 0 && (
              <div style={{ textAlign: "center", color: "#64748b" }}>
                No destinations available yet.
              </div>
            )}
            {!loading &&
              destinations.map((destination) => (
                <div
                  key={destination._id || destination.name}
                  onClick={() =>
                    setSelectedDestination(
                      selectedDestination === destination.name
                        ? ""
                        : destination.name,
                    )
                  }
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    cursor: "pointer",
                    transition: "transform 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                >
                  <div
                    style={{
                      width: "120px",
                      height: "120px",
                      borderRadius: "50%",
                      overflow: "hidden",
                      border:
                        selectedDestination === destination.name
                          ? "4px solid #0066cc"
                          : "4px solid transparent",
                      boxShadow:
                        selectedDestination === destination.name
                          ? "0 8px 25px rgba(0, 102, 204, 0.3)"
                          : "0 4px 15px rgba(0, 0, 0, 0.1)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <img
                      src={destination.image || "/placeholder-destination.jpg"}
                      alt={destination.name}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      marginTop: "0.75rem",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      color:
                        selectedDestination === destination.name
                          ? "#0066cc"
                          : "#374151",
                      textAlign: "center",
                    }}
                  >
                    {destination.name}
                  </span>
                </div>
              ))}
          </div>

          {selectedDestination && (
            <div
              style={{
                textAlign: "center",
                marginTop: "1.5rem",
              }}
            >
              <button
                onClick={() => setSelectedDestination("")}
                style={{
                  padding: "0.5rem 1.5rem",
                  backgroundColor: "#f3f4f6",
                  border: "1px solid #d1d5db",
                  borderRadius: "2rem",
                  fontSize: "0.875rem",
                  fontWeight: 500,
                  color: "#4b5563",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  transition: "all 0.2s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#e5e7eb";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "#f3f4f6";
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1rem" }}
                >
                  close
                </span>
                Clear filter: {selectedDestination}
              </button>
            </div>
          )}
        </section>

        {/* Packages Grid */}
        <section
          style={{
            padding: "0 1.5rem 3rem",
            maxWidth: "100rem",
            width: "100%",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: "1.5rem",
              flexWrap: "wrap",
              gap: "1rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#1f2937",
              }}
            >
              {selectedDestination
                ? `Packages in ${selectedDestination}`
                : "All Packages"}
            </h2>
            <div
              style={{
                fontSize: "0.9rem",
                color: "#64748b",
                fontWeight: 600,
                padding: "0.5rem 1rem",
                backgroundColor: "#f1f5f9",
                borderRadius: "8px",
              }}
            >
              {filteredPackages.length}{" "}
              {filteredPackages.length === 1 ? "package" : "packages"} found
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: "1.5rem",
            }}
          >
            {loading && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "3rem",
                  fontSize: "1rem",
                  color: "#64748b",
                }}
              >
                Loading packages...
              </div>
            )}
            {!loading && filteredPackages.length === 0 && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "3rem",
                  fontSize: "1rem",
                  color: "#64748b",
                }}
              >
                {packages.length === 0
                  ? "No packages available yet. Please add packages from the admin panel."
                  : "No packages match the selected filters. Try adjusting your search criteria."}
              </div>
            )}
            {!loading &&
              filteredPackages.map((pkg) => (
                <Link
                  key={pkg._id || pkg.title}
                  href={`/packages/${pkg._id || encodeURIComponent(pkg.title)}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div
                    className="package-card"
                    style={{
                      backgroundColor: "#ffffff",
                      borderRadius: "1rem",
                      overflow: "hidden",
                      boxShadow: "0 4px 6px rgba(0, 0, 0, 0.08)",
                      transition: "transform 0.3s ease, box-shadow 0.3s ease",
                      cursor: "pointer",
                      border: "1px solid #e5e7eb",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.boxShadow =
                        "0 20px 40px rgba(0, 0, 0, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 6px rgba(0, 0, 0, 0.08)";
                    }}
                  >
                    {/* Image */}
                    <div style={{ position: "relative", height: "200px" }}>
                      <img
                        src={
                          pkg.image ||
                          pkg.gallery?.[0] ||
                          "/placeholder-package.jpg"
                        }
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
                            right: "1rem",
                            backgroundColor: "#0066cc",
                            color: "white",
                            padding: "0.35rem 0.75rem",
                            borderRadius: "0.5rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          {pkg.badge}
                        </span>
                      )}
                      {pkg.category && (
                        <span
                          style={{
                            position: "absolute",
                            top: "1rem",
                            left: "1rem",
                            backgroundColor: "#10b981",
                            color: "white",
                            padding: "0.35rem 0.75rem",
                            borderRadius: "0.5rem",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                          }}
                        >
                          {pkg.category}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div style={{ padding: "1.25rem" }}>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "flex-start",
                          justifyContent: "space-between",
                          gap: "0.5rem",
                          marginBottom: "0.5rem",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: "#1f2937",
                            lineHeight: 1.3,
                            flex: 1,
                          }}
                        >
                          {pkg.title}
                        </h3>
                      </div>

                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "#6b7280",
                          marginBottom: "1rem",
                          lineHeight: 1.5,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {pkg.description}
                      </p>

                      {/* Details Row */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          marginBottom: "1rem",
                          fontSize: "0.85rem",
                          color: "#6b7280",
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
                            style={{ fontSize: "1.1rem", color: "#9ca3af" }}
                          >
                            schedule
                          </span>
                          {pkg.duration}
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
                            style={{ fontSize: "1.1rem", color: "#f43f5e" }}
                          >
                            location_on
                          </span>
                          {pkg.startingPoint}
                        </div>
                      </div>

                      {/* Price & CTA */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingTop: "1rem",
                          borderTop: "1px solid #f3f4f6",
                        }}
                      >
                        <div>
                          {pkg.price && pkg.price > 0 ? (
                            <>
                              <span
                                style={{
                                  fontSize: "1.1rem",
                                  fontWeight: 700,
                                  color: "#1f2937",
                                }}
                              >
                                {formatInr(pkg.price)}
                              </span>
                              <span
                                style={{
                                  fontSize: "0.75rem",
                                  color: "#6b7280",
                                  marginLeft: "0.25rem",
                                }}
                              >
                                /person
                              </span>
                            </>
                          ) : (
                            <span
                              style={{
                                fontSize: "1rem",
                                fontWeight: 600,
                                color: "#0066cc",
                              }}
                            >
                              Enquire
                            </span>
                          )}
                        </div>
                        <button
                          style={{
                            backgroundColor: "#0066cc",
                            color: "white",
                            border: "none",
                            padding: "0.6rem 1.25rem",
                            borderRadius: "0.5rem",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.35rem",
                            transition: "background-color 0.2s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = "#0052a3";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = "#0066cc";
                          }}
                        >
                          View Details
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "1rem" }}
                          >
                            arrow_forward
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          backgroundColor: "#1f2937",
          color: "white",
          padding: "2rem 1.5rem",
          textAlign: "center",
          marginTop: "auto",
        }}
      >
        <p style={{ fontSize: "0.875rem", color: "#9ca3af" }}>
          © {new Date().getFullYear()} TravelExpertz. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
