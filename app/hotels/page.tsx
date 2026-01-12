"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Header from "../components/Header";

interface Hotel {
  _id?: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  amenities: string[];
  popular?: boolean;
  active?: boolean;
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatInr = (value: number) =>
  inrFormatter.format(Math.max(0, Math.round(value)));

const normalizeHotel = (hotel: Partial<Hotel>): Hotel => {
  const rawId = (hotel as { _id?: unknown })._id;

  return {
    _id: typeof rawId === "string" ? rawId : rawId ? String(rawId) : undefined,
    name: hotel.name ?? "",
    location: hotel.location ?? "",
    price: Number((hotel as { price?: unknown }).price ?? 0) || 0,
    rating: Number((hotel as { rating?: unknown }).rating ?? 0) || 0,
    reviews: Number((hotel as { reviews?: unknown }).reviews ?? 0) || 0,
    image: hotel.image ?? "",
    amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
    popular: typeof hotel.popular === "boolean" ? hotel.popular : false,
    active: typeof hotel.active === "boolean" ? hotel.active : true,
  };
};

const PRICE_THRESHOLDS = {
  budgetMax: 15000,
  midMax: 22000,
} as const;

export default function Hotels() {
  const [filters, setFilters] = useState({
    location: "",
    checkIn: "",
    checkOut: "",
    guests: "1",
    rooms: "1",
    priceRange: "all",
  });

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("featured");

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/hotels", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          const normalized = (Array.isArray(data) ? data : []).map((item) =>
            normalizeHotel(item)
          );
          setHotels(normalized);
        }
      } catch (error) {
        console.error("Failed to fetch hotels:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  const filteredHotels = useMemo(() => {
    return hotels
      .filter((hotel) => {
        const matchesLocation = filters.location
          ? hotel.location
              .toLowerCase()
              .includes(filters.location.toLowerCase())
          : true;

        const matchesSearch = searchQuery
          ? hotel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            hotel.location.toLowerCase().includes(searchQuery.toLowerCase())
          : true;

        const matchesPrice = (() => {
          if (filters.priceRange === "budget") {
            return hotel.price < PRICE_THRESHOLDS.budgetMax;
          }
          if (filters.priceRange === "mid") {
            return (
              hotel.price >= PRICE_THRESHOLDS.budgetMax &&
              hotel.price <= PRICE_THRESHOLDS.midMax
            );
          }
          if (filters.priceRange === "luxury") {
            return hotel.price > PRICE_THRESHOLDS.midMax;
          }
          return true;
        })();

        return matchesLocation && matchesPrice && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      });
  }, [filters.location, filters.priceRange, hotels, searchQuery, sortBy]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Header currentPage="hotels" />

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
              backgroundImage: "url('/hero-banner.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            <div className="hero-content">
              <h1>Find Your Perfect Hotel</h1>
              <p>Search from thousands of hotels across the world</p>
            </div>

            {/* Search Box */}
            <div className="search-box">
              <div className="search-box-content">
                <div className="search-item">
                  <span className="material-symbols-outlined">location_on</span>
                  <input
                    type="text"
                    placeholder="Where to?"
                    value={filters.location}
                    onChange={(e) =>
                      setFilters({ ...filters, location: e.target.value })
                    }
                    style={{
                      border: "none",
                      outline: "none",
                      flex: 1,
                      fontSize: "0.95rem",
                    }}
                  />
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
                  <input
                    type="date"
                    placeholder="Check-in"
                    value={filters.checkIn}
                    onChange={(e) =>
                      setFilters({ ...filters, checkIn: e.target.value })
                    }
                    style={{
                      border: "none",
                      outline: "none",
                      flex: 1,
                      fontSize: "0.95rem",
                    }}
                  />
                </div>
                <div className="search-item">
                  <span className="material-symbols-outlined">
                    calendar_month
                  </span>
                  <input
                    type="date"
                    placeholder="Check-out"
                    value={filters.checkOut}
                    onChange={(e) =>
                      setFilters({ ...filters, checkOut: e.target.value })
                    }
                    style={{
                      border: "none",
                      outline: "none",
                      flex: 1,
                      fontSize: "0.95rem",
                    }}
                  />
                </div>
                <div className="search-item">
                  <span className="material-symbols-outlined">group</span>
                  <select
                    value={filters.guests}
                    onChange={(e) =>
                      setFilters({ ...filters, guests: e.target.value })
                    }
                    style={{
                      border: "none",
                      outline: "none",
                      flex: 1,
                      fontSize: "0.95rem",
                    }}
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4+ Guests</option>
                  </select>
                </div>
                <div className="search-item">
                  <span className="material-symbols-outlined">bed</span>
                  <select
                    value={filters.rooms}
                    onChange={(e) =>
                      setFilters({ ...filters, rooms: e.target.value })
                    }
                    style={{
                      border: "none",
                      outline: "none",
                      flex: 1,
                      fontSize: "0.95rem",
                    }}
                  >
                    <option value="1">1 Room</option>
                    <option value="2">2 Rooms</option>
                    <option value="3">3 Rooms</option>
                    <option value="4">4+ Rooms</option>
                  </select>
                </div>
                <button className="search-btn">Search</button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Hotels Grid */}
        <div
          style={{
            margin: "0 auto",
            padding: "0 1.5rem",
            maxWidth: "100rem",
            width: "100%",
          }}
          className="w-full py-8"
        >
          {/* Filters Section */}
          <div className="filters-section" style={{ marginBottom: "2.5rem" }}>
            {/* Search Bar */}
            <div style={{ position: "relative", marginBottom: "1.5rem" }}>
              <input
                type="text"
                placeholder="Search hotels by name or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: "100%",
                  padding: "1rem 1.25rem 1rem 3.25rem",
                  borderRadius: "16px",
                  border: "2px solid rgba(0, 102, 204, 0.15)",
                  fontSize: "1rem",
                  fontFamily: "inherit",
                  transition: "all 0.3s ease",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
                  backgroundColor: "#ffffff",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0, 102, 204, 0.4)";
                  e.currentTarget.style.boxShadow =
                    "0 6px 20px rgba(0, 102, 204, 0.12)";
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(0, 102, 204, 0.15)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.05)";
                }}
              />
              <span
                className="material-symbols-outlined"
                style={{
                  position: "absolute",
                  left: "1.25rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#0066cc",
                  fontSize: "1.5rem",
                  pointerEvents: "none",
                }}
              >
                search
              </span>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  style={{
                    position: "absolute",
                    right: "1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#64748b",
                    fontSize: "1.25rem",
                    padding: "0.25rem",
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "#dc2626";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "#64748b";
                  }}
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  flexWrap: "wrap",
                  alignItems: "center",
                  flex: 1,
                }}
              >
                {/* Sort Dropdown */}
                <div style={{ position: "relative" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Sort By
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: "0.75rem 2.5rem 0.75rem 1rem",
                      borderRadius: "12px",
                      border: "2px solid #e0e7ff",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      backgroundColor: "#f8fafc",
                      color: "#1e293b",
                      transition: "all 0.3s ease",
                      appearance: "none",
                      WebkitAppearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%230066cc' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.75rem center",
                      minWidth: "180px",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#818cf8";
                      e.currentTarget.style.backgroundColor = "#ffffff";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e0e7ff";
                      e.currentTarget.style.backgroundColor = "#f8fafc";
                    }}
                  >
                    <option value="featured">⭐ Featured</option>
                    <option value="price-low">💰 Price: Low to High</option>
                    <option value="price-high">💎 Price: High to Low</option>
                    <option value="rating">🏆 Top Rated</option>
                  </select>
                </div>

                {/* Price Range Dropdown */}
                <div style={{ position: "relative" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.75rem",
                      marginBottom: "0.5rem",
                      fontWeight: 600,
                      color: "#64748b",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Price Range
                  </label>
                  <select
                    value={filters.priceRange}
                    onChange={(e) =>
                      setFilters({ ...filters, priceRange: e.target.value })
                    }
                    style={{
                      padding: "0.75rem 2.5rem 0.75rem 1rem",
                      borderRadius: "12px",
                      border: "2px solid #fce7f3",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      backgroundColor: "#fdf2f8",
                      color: "#1e293b",
                      transition: "all 0.3s ease",
                      appearance: "none",
                      WebkitAppearance: "none",
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ec4899' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 0.75rem center",
                      minWidth: "180px",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#f9a8d4";
                      e.currentTarget.style.backgroundColor = "#ffffff";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#fce7f3";
                      e.currentTarget.style.backgroundColor = "#fdf2f8";
                    }}
                  >
                    <option value="all">All Prices</option>
                    <option value="budget">Under ₹15,000</option>
                    <option value="mid">₹15,000 - ₹22,000</option>
                    <option value="luxury">₹22,000+</option>
                  </select>
                </div>
              </div>

              {/* Reset & Results Count */}
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "#64748b",
                    fontWeight: 600,
                    padding: "0.75rem 1.25rem",
                    backgroundColor: "#f1f5f9",
                    borderRadius: "12px",
                    border: "2px solid #e2e8f0",
                  }}
                >
                  {filteredHotels.length}{" "}
                  {filteredHotels.length === 1 ? "hotel" : "hotels"}
                </div>
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setFilters({ ...filters, priceRange: "all", location: "" });
                    setSortBy("featured");
                  }}
                  style={{
                    padding: "0.75rem 1.5rem",
                    borderRadius: "12px",
                    border: "2px solid #fee2e2",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    backgroundColor: "#fef2f2",
                    color: "#dc2626",
                    transition: "all 0.3s ease",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#dc2626";
                    e.currentTarget.style.color = "#ffffff";
                    e.currentTarget.style.borderColor = "#dc2626";
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 12px rgba(220, 38, 38, 0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#fef2f2";
                    e.currentTarget.style.color = "#dc2626";
                    e.currentTarget.style.borderColor = "#fee2e2";
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.1rem" }}
                  >
                    restart_alt
                  </span>
                  Reset Filters
                </button>
              </div>
            </div>
          </div>

          {/* Hotels Grid */}
          <div
            className="hotels-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
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
                Loading hotels...
              </div>
            )}
            {!loading && filteredHotels.length === 0 && (
              <div
                style={{
                  gridColumn: "1 / -1",
                  textAlign: "center",
                  padding: "3rem",
                  fontSize: "1rem",
                  color: "#64748b",
                }}
              >
                {hotels.length === 0
                  ? "No hotels available yet. Please add hotels from the admin panel."
                  : "No hotels match the selected filters. Try adjusting your search criteria."}
              </div>
            )}
            {!loading &&
              filteredHotels.map((hotel) => (
                <a
                  key={hotel._id || hotel.name}
                  href={`/hotels/${
                    hotel._id || encodeURIComponent(hotel.name)
                  }`}
                  className="hotel-card"
                  style={{
                    borderRadius: "1rem",
                    overflow: "hidden",
                    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",
                    textDecoration: "none",
                    color: "inherit",
                    display: "block",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 10px 15px rgba(0, 0, 0, 0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 6px rgba(0, 0, 0, 0.1)";
                  }}
                >
                  <div style={{ position: "relative" }}>
                    <img
                      src={hotel.image}
                      alt={hotel.name}
                      style={{
                        width: "100%",
                        height: "200px",
                        objectFit: "cover",
                      }}
                    />
                    {hotel.popular && (
                      <div
                        style={{
                          position: "absolute",
                          top: "0.5rem",
                          right: "0.5rem",
                          backgroundColor: "#d97706",
                          color: "white",
                          padding: "0.25rem 0.75rem",
                          borderRadius: "2rem",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      >
                        Popular
                      </div>
                    )}
                  </div>

                  <div style={{ padding: "1rem" }}>
                    <h3
                      style={{
                        fontSize: "1rem",
                        fontWeight: 600,
                        marginBottom: "0.25rem",
                        color: "#1f2937",
                      }}
                    >
                      {hotel.name}
                    </h3>
                    <p
                      style={{
                        fontSize: "0.875rem",
                        color: "#6b7280",
                        marginBottom: "0.75rem",
                      }}
                    >
                      {hotel.location}
                    </p>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          color: "#f59e0b",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                        }}
                      >
                        ★ {hotel.rating}
                      </span>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                        }}
                      >
                        ({hotel.reviews} reviews)
                      </span>
                    </div>

                    <div
                      style={{
                        fontSize: "0.875rem",
                        marginBottom: "1rem",
                      }}
                    >
                      {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                        <span
                          key={idx}
                          style={{
                            display: "inline-block",
                            backgroundColor: "#e2e8f0",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "0.25rem",
                            marginRight: "0.5rem",
                            marginBottom: "0.25rem",
                            fontSize: "0.7rem",
                          }}
                        >
                          {amenity}
                        </span>
                      ))}
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <span
                          style={{
                            fontSize: "0.875rem",
                            color: "#6b7280",
                          }}
                        >
                          From
                        </span>
                        <p
                          style={{
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            color: "#0a66c2",
                            margin: "0",
                          }}
                        >
                          {formatInr(hotel.price)}
                        </p>
                      </div>
                      <button
                        style={{
                          backgroundColor: "#0a66c2",
                          color: "white",
                          border: "none",
                          padding: "0.5rem 1rem",
                          borderRadius: "0.5rem",
                          cursor: "pointer",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#084ba8";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "#0a66c2";
                        }}
                        onClick={(e) => {
                          e.preventDefault();
                          window.location.href = `/hotels/${
                            hotel._id || encodeURIComponent(hotel.name)
                          }`;
                        }}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </a>
              ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ marginTop: "3rem" }}>
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-brand">
              <h2>
                <Image
                  src="/logo.webp"
                  alt="TravelExpertz"
                  width={32}
                  height={32}
                  className="inline-block"
                  style={{ marginRight: "0.5rem" }}
                />
                TravelExpertz
              </h2>
              <p>
                Your trusted partner in creating unforgettable travel
                experiences.
              </p>
            </div>
            <div>
              <h4>Company</h4>
              <ul className="footer-links">
                <li>
                  <a href="#">About Us</a>
                </li>
                <li>
                  <a href="#">Careers</a>
                </li>
                <li>
                  <a href="#">Press</a>
                </li>
              </ul>
            </div>
            <div>
              <h4>Support</h4>
              <ul className="footer-links">
                <li>
                  <a href="#">Contact Us</a>
                </li>
                <li>
                  <a href="#">FAQ</a>
                </li>
                <li>
                  <a href="#">Help Center</a>
                </li>
              </ul>
            </div>
            <div>
              <h4>Destinations</h4>
              <ul className="footer-links">
                <li>
                  <a href="#">Hotels</a>
                </li>
                <li>
                  <a href="#">Top Cities</a>
                </li>
                <li>
                  <a href="#">Top Hotels</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2024 TravelExpertz. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 1024px) {
          .search-box {
            flex-direction: column !important;
            gap: 0.75rem !important;
            padding: 1.5rem !important;
          }
          
          .search-item {
            width: 100% !important;
            min-height: 48px !important;
          }
          
          .search-btn {
            width: 100% !important;
            min-height: 48px !important;
          }
        }
        
        @media (max-width: 768px) {
          .hotels-grid {
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)) !important;
            gap: 1rem !important;
          }
          
          .hero-section {
            height: 350px !important;
            min-height: 350px !important;
          }
          
          .hero-section h1 {
            font-size: 2rem !important;
          }
          
          .filters-section {
            margin-bottom: 1.5rem !important;
          }
          
          .filter-controls {
            flex-direction: column !important;
            align-items: stretch !important;
          }
          
          .filter-buttons {
            width: 100% !important;
            flex-wrap: wrap !important;
            justify-content: center !important;
          }
          
          .filter-buttons button,
          .filter-buttons select {
            flex: 1 1 calc(50% - 0.5rem) !important;
            min-height: 44px !important;
            font-size: 0.875rem !important;
            padding: 0.5rem 0.75rem !important;
          }
        }
        
        @media (max-width: 480px) {
          .hotels-grid {
            grid-template-columns: 1fr !important;
          }
          
          .hero-section {
            height: 300px !important;
            min-height: 300px !important;
          }
          
          .hero-section h1 {
            font-size: 1.5rem !important;
          }
          
          .hotel-card {
            border-radius: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
