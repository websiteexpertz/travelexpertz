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
  hostName?: string;
  hostEmail?: string;
  hostPhone?: string;
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
    hostName: hotel.hostName ?? "",
    hostEmail: hotel.hostEmail ?? "",
    hostPhone: hotel.hostPhone ?? "",
  };
};

const PRICE_THRESHOLDS = {
  budgetMax: 15000,
  midMax: 22000,
} as const;

export default function Hotels() {
  // Get today's date and 2 days later
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const getTwoDaysLater = () => {
    const date = new Date();
    date.setDate(date.getDate() + 2);
    return date.toISOString().split("T")[0];
  };

  const [filters, setFilters] = useState({
    location: "",
    checkIn: getTodayDate(),
    checkOut: getTwoDaysLater(),
    guests: "2",
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
            normalizeHotel(item),
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
        {/* Hero Section - Premium Design */}
        <div
          className="w-full"
          style={{
            background: "transparent",
            padding: "0 1.5rem",
            marginTop: "0",
          }}
        >
          <div
            className="hero-section"
            style={{
              position: "relative",
              height: "480px",
              borderRadius: "24px",
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "2rem 1.5rem",
            }}
          >
            {/* Background with Gradient Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage: "url('/hero-banner.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0, 0, 0, 0.35) 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.5) 100%)",
              }}
            />

            {/* Floating Decorative Elements */}
            <div
              className="floating-element"
              style={{
                position: "absolute",
                top: "15%",
                left: "8%",
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                animation: "float 6s ease-in-out infinite",
              }}
            />
            <div
              className="floating-element"
              style={{
                position: "absolute",
                bottom: "20%",
                right: "10%",
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(10px)",
                animation: "float 8s ease-in-out infinite reverse",
              }}
            />
            <div
              className="floating-element"
              style={{
                position: "absolute",
                top: "60%",
                left: "15%",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(10px)",
                animation: "float 5s ease-in-out infinite 1s",
              }}
            />

            {/* Hero Content */}
            <div
              className="hero-content"
              style={{
                position: "relative",
                zIndex: 10,
                textAlign: "center",
                color: "white",
                padding: "0 1.5rem",
                maxWidth: "800px",
                marginBottom: "2rem",
              }}
            >
              {/* Toggle Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginBottom: "1.5rem",
                }}
              >
                <button
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: "2px solid rgba(255, 255, 255, 0.8)",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    color: "white",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "default",
                  }}
                >
                  🏨 Hotels
                </button>
                <button
                  onClick={() => {
                    window.location.href = "/homestays";
                  }}
                  style={{
                    padding: "0.5rem 1rem",
                    borderRadius: "8px",
                    border: "2px solid rgba(255, 255, 255, 0.3)",
                    backgroundColor: "transparent",
                    color: "white",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 0.1)";
                    e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.3)";
                  }}
                >
                  🏠 Homestays
                </button>
              </div>

              <h1
                style={{
                  fontSize: "clamp(1.75rem, 5vw, 3rem)",
                  fontWeight: 800,
                  marginBottom: "0.75rem",
                  lineHeight: 1.15,
                  textShadow: "0 4px 20px rgba(0, 0, 0, 0.3)",
                  letterSpacing: "-0.02em",
                  margin: "0 auto 0.75rem",
                  display: "block",
                  animation: "fadeInUp 0.8s ease-out",
                }}
              >
                Discover Your Perfect
                <span
                  style={{
                    background:
                      "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    marginLeft: "0.5rem",
                  }}
                >
                  Hotel Stay
                </span>
              </h1>
              <p
                style={{
                  fontSize: "clamp(0.9rem, 2vw, 1.1rem)",
                  opacity: 0.95,
                  maxWidth: "600px",
                  margin: "0 auto 0",
                  lineHeight: 1.5,
                  fontWeight: 500,
                  letterSpacing: "0.3px",
                  animation: "fadeInUp 0.8s ease-out 0.2s both",
                }}
              >
                Explore handpicked hotels with stunning views and unbeatable
                prices
              </p>
            </div>

            {/* Search Box - Inside Hero */}
            <div
              className="search-box"
              style={{
                background: "rgba(255, 255, 255, 0.97)",
                backdropFilter: "blur(20px)",
                borderRadius: "16px",
                padding: "0.5rem",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
                maxWidth: "1000px",
                width: "100%",
                position: "relative",
                zIndex: 20,
                border: "1.5px solid rgba(255, 255, 255, 0.4)",
                animation: "fadeInUp 0.8s ease-out 0.4s both",
              }}
            >
              <div
                className="search-box-content"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0",
                }}
              >
                {/* Location */}
                <div
                  className="search-item"
                  style={{
                    flex: 1.3,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.7rem 1rem",
                    borderRadius: "12px",
                    transition: "background 0.25s ease",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: "#0066cc",
                      fontSize: "1.25rem",
                      flexShrink: 0,
                    }}
                  >
                    location_on
                  </span>
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
                      width: "100%",
                      fontSize: "0.9rem",
                      background: "transparent",
                      fontWeight: 600,
                      color: "#1f2937",
                    }}
                  />
                </div>

                {/* Divider */}
                <div
                  style={{
                    width: "1px",
                    height: "28px",
                    background: "#d1d5db",
                    flexShrink: 0,
                  }}
                />

                {/* Check-in */}
                <div
                  className="search-item"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.7rem 0.75rem",
                    borderRadius: "12px",
                    transition: "background 0.25s ease",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: "#0066cc",
                      fontSize: "1.25rem",
                      flexShrink: 0,
                    }}
                  >
                    calendar_month
                  </span>
                  <input
                    type="date"
                    value={filters.checkIn}
                    onChange={(e) =>
                      setFilters({ ...filters, checkIn: e.target.value })
                    }
                    style={{
                      border: "none",
                      outline: "none",
                      width: "100%",
                      fontSize: "0.85rem",
                      background: "transparent",
                      fontWeight: 600,
                      color: "#1f2937",
                      cursor: "pointer",
                    }}
                  />
                </div>

                {/* Divider */}
                <div
                  style={{
                    width: "1px",
                    height: "28px",
                    background: "#d1d5db",
                    flexShrink: 0,
                  }}
                />

                {/* Check-out */}
                <div
                  className="search-item"
                  style={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.7rem 0.75rem",
                    borderRadius: "12px",
                    transition: "background 0.25s ease",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: "#0066cc",
                      fontSize: "1.25rem",
                      flexShrink: 0,
                    }}
                  >
                    calendar_month
                  </span>
                  <input
                    type="date"
                    value={filters.checkOut}
                    onChange={(e) =>
                      setFilters({ ...filters, checkOut: e.target.value })
                    }
                    style={{
                      border: "none",
                      outline: "none",
                      width: "100%",
                      fontSize: "0.85rem",
                      background: "transparent",
                      fontWeight: 600,
                      color: "#1f2937",
                      cursor: "pointer",
                    }}
                  />
                </div>

                {/* Divider */}
                <div
                  style={{
                    width: "1px",
                    height: "28px",
                    background: "#d1d5db",
                    flexShrink: 0,
                  }}
                />

                {/* Guests */}
                <div
                  className="search-item"
                  style={{
                    flex: 0.75,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.7rem 0.75rem",
                    borderRadius: "12px",
                    transition: "background 0.25s ease",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: "#0066cc",
                      fontSize: "1.25rem",
                      flexShrink: 0,
                    }}
                  >
                    group
                  </span>
                  <select
                    value={filters.guests}
                    onChange={(e) =>
                      setFilters({ ...filters, guests: e.target.value })
                    }
                    style={{
                      border: "none",
                      outline: "none",
                      width: "100%",
                      fontSize: "0.85rem",
                      background: "transparent",
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "#1f2937",
                    }}
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4+ Guests</option>
                  </select>
                </div>

                {/* Divider */}
                <div
                  style={{
                    width: "1px",
                    height: "28px",
                    background: "#d1d5db",
                    flexShrink: 0,
                  }}
                />

                {/* Rooms */}
                <div
                  className="search-item"
                  style={{
                    flex: 0.7,
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.7rem 0.75rem",
                    borderRadius: "12px",
                    transition: "background 0.25s ease",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: "#0066cc",
                      fontSize: "1.25rem",
                      flexShrink: 0,
                    }}
                  >
                    bed
                  </span>
                  <select
                    value={filters.rooms}
                    onChange={(e) =>
                      setFilters({ ...filters, rooms: e.target.value })
                    }
                    style={{
                      border: "none",
                      outline: "none",
                      width: "100%",
                      fontSize: "0.85rem",
                      background: "transparent",
                      fontWeight: 600,
                      cursor: "pointer",
                      color: "#1f2937",
                    }}
                  >
                    <option value="1">1 Room</option>
                    <option value="2">2 Rooms</option>
                    <option value="3">3 Rooms</option>
                    <option value="4">4+ Rooms</option>
                  </select>
                </div>

                {/* Search Button */}
                <button
                  className="search-btn"
                  onClick={() => {
                    const params = new URLSearchParams({
                      location: filters.location || "",
                      checkIn: filters.checkIn || "",
                      checkOut: filters.checkOut || "",
                      guests: filters.guests || "2",
                      rooms: filters.rooms || "1",
                      priceRange: filters.priceRange || "all",
                    });
                    window.location.href = `/hotels/search?${params.toString()}`;
                  }}
                  style={{
                    background:
                      "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                    color: "white",
                    border: "none",
                    padding: "0.7rem 1.75rem",
                    borderRadius: "12px",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    transition: "all 0.3s ease",
                    boxShadow: "0 2px 10px rgba(0, 102, 204, 0.35)",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.03)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 16px rgba(0, 102, 204, 0.45)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 10px rgba(0, 102, 204, 0.35)";
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.1rem" }}
                  >
                    search
                  </span>
                  Search
                </button>
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

          {/* Hotels Carousel Strip */}
          <div
            style={{
              width: "100%",
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
              borderRadius: "16px",
              padding: "1.5rem",
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
              marginTop: "1rem",
            }}
          >
            <h2
              style={{
                fontSize: "1.3rem",
                fontWeight: 700,
                marginBottom: "1.5rem",
                color: "#1f2937",
              }}
            >
              Featured Hotels
            </h2>
            <div
              className="hotels-grid"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                paddingBottom: "0.5rem",
              }}
            >
              {loading && (
                <div
                  style={{
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
                      display: "flex",
                      width: "100%",
                      minHeight: "200px",
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
                    <div style={{ position: "relative", flex: "0 0 250px" }}>
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        style={{
                          width: "100%",
                          height: "100%",
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

                    <div
                      style={{
                        padding: "1rem",
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
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

                      {/* Host Profile */}
                      {hotel.hostName && (
                        <div
                          style={{
                            background: "#f8fafc",
                            padding: "0.75rem",
                            borderRadius: "0.5rem",
                            marginBottom: "0.75rem",
                          }}
                        >
                          <p
                            style={{
                              fontSize: "0.75rem",
                              color: "#6b7280",
                              margin: "0 0 0.25rem",
                              fontWeight: 600,
                            }}
                          >
                            Hosted by
                          </p>
                          <p
                            style={{
                              fontSize: "0.9rem",
                              color: "#1f2937",
                              margin: "0",
                              fontWeight: 600,
                            }}
                          >
                            {hotel.hostName}
                          </p>
                          {hotel.hostEmail && (
                            <p
                              style={{
                                fontSize: "0.75rem",
                                color: "#6b7280",
                                margin: "0.25rem 0 0",
                              }}
                            >
                              📧 {hotel.hostEmail}
                            </p>
                          )}
                          {hotel.hostPhone && (
                            <p
                              style={{
                                fontSize: "0.75rem",
                                color: "#6b7280",
                                margin: "0.25rem 0 0",
                              }}
                            >
                              📞 {hotel.hostPhone}
                            </p>
                          )}
                        </div>
                      )}

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
        </div>
      </main>

      {/* Mobile Responsive Styles */}
      <style>{`
        /* ===== HOTELS PAGE - PREMIUM MOBILE RESPONSIVE ===== */
        
        /* Floating Animation */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        /* Fade In Up Animation */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Base Mobile Optimizations */
        @media (max-width: 1024px) {
          .search-box {
            flex-direction: column !important;
            gap: 0.75rem !important;
            padding: 1.5rem !important;
          }
          
          .search-box-content {
            flex-direction: column !important;
            gap: 0.75rem !important;
          }
          
          .search-item {
            width: 100% !important;
            min-height: 52px !important;
            border-radius: 12px !important;
            flex: none !important;
          }
          
          .search-btn {
            width: 100% !important;
            min-height: 52px !important;
            border-radius: 12px !important;
            font-size: 1rem !important;
            font-weight: 700 !important;
            justify-content: center !important;
          }
          
          .hero-stats {
            gap: 1.5rem !important;
          }
          
          .filters-section > div:last-child {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: 1rem !important;
          }
        }
        
        @media (max-width: 768px) {
          /* Hero Section Mobile */
          .hero-section {
            height: clamp(320px, 60vw, 400px) !important;
            min-height: clamp(320px, 60vw, 400px) !important;
            border-radius: clamp(16px, 3vw, 24px) !important;
          }
          
          .hero-section h1 {
            font-size: clamp(1.5rem, 6vw, 2.25rem) !important;
            line-height: 1.2 !important;
            padding: 0 0.5rem !important;
          }
          
          .hero-section p {
            font-size: clamp(0.85rem, 2.5vw, 1rem) !important;
            padding: 0 0.5rem !important;
          }
          
          .hero-stats {
            gap: 1rem !important;
            flex-wrap: wrap !important;
          }
          
          .hero-stats > div:not(:last-child):not([style*="width: 1px"]) {
            flex: 1 1 auto !important;
            min-width: 80px !important;
          }
          
          .hero-stats > div[style*="width: 1px"] {
            display: none !important;
          }
          
          .hero-content > div:first-child {
            padding: 0.4rem 0.75rem !important;
            font-size: 0.75rem !important;
          }
          
          .floating-element {
            display: none !important;
          }
          
          /* Search Box Mobile */
          .search-box {
            margin: -2.5rem 0.5rem 0 !important;
            padding: clamp(1rem, 3vw, 1.5rem) !important;
            border-radius: clamp(16px, 3vw, 20px) !important;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
          }
          
          .search-box-content {
            flex-direction: column !important;
            gap: 0.65rem !important;
          }
          
          .search-item {
            padding: clamp(0.7rem, 2vw, 0.875rem) clamp(0.875rem, 2.5vw, 1rem) !important;
            font-size: clamp(0.85rem, 2.5vw, 0.95rem) !important;
            border-radius: 12px !important;
            background: #f8fafc !important;
            border: 2px solid #e2e8f0 !important;
            transition: all 0.3s ease !important;
            min-height: 50px !important;
          }
          
          .search-item:focus-within {
            border-color: #0066cc !important;
            background: #ffffff !important;
            box-shadow: 0 0 0 4px rgba(0, 102, 204, 0.1) !important;
          }
          
          .search-item input,
          .search-item select {
            font-size: clamp(0.85rem, 2.5vw, 0.95rem) !important;
          }
          
          .search-btn {
            padding: clamp(0.875rem, 2.5vw, 1rem) !important;
            font-size: clamp(0.9rem, 2.5vw, 1rem) !important;
            background: linear-gradient(135deg, #0066cc 0%, #0099ff 100%) !important;
            box-shadow: 0 4px 15px rgba(0, 102, 204, 0.3) !important;
            border-radius: 12px !important;
            min-height: 52px !important;
          }
          
          /* Filters Section Mobile */
          .filters-section {
            margin-bottom: clamp(1.25rem, 3vw, 2rem) !important;
            padding: 0 !important;
          }
          
          .filters-section > div:first-child input {
            padding: clamp(0.875rem, 2.5vw, 1rem) clamp(1rem, 3vw, 1.25rem) clamp(0.875rem, 2.5vw, 1rem) clamp(2.75rem, 8vw, 3.25rem) !important;
            font-size: clamp(0.9rem, 2.5vw, 1rem) !important;
            border-radius: 14px !important;
          }
          
          .filters-section select {
            padding: clamp(0.65rem, 2vw, 0.75rem) clamp(2rem, 6vw, 2.5rem) clamp(0.65rem, 2vw, 0.75rem) clamp(0.75rem, 2vw, 1rem) !important;
            font-size: clamp(0.8rem, 2.2vw, 0.9rem) !important;
            border-radius: 10px !important;
            min-width: auto !important;
            width: 100% !important;
          }
          
          .filters-section > div > div {
            width: 100% !important;
          }
          
          .filters-section > div > div > label {
            font-size: clamp(0.65rem, 1.8vw, 0.75rem) !important;
            margin-bottom: clamp(0.35rem, 1vw, 0.5rem) !important;
          }
          
          /* Filter Controls Row */
          .filters-section > div:nth-child(2) {
            flex-direction: column !important;
            gap: clamp(1rem, 3vw, 1.5rem) !important;
          }
          
          .filters-section > div:nth-child(2) > div:first-child {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: clamp(0.75rem, 2vw, 1rem) !important;
            width: 100% !important;
          }
          
          /* Results Count & Reset */
          .filters-section > div:nth-child(2) > div:last-child {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: clamp(0.75rem, 2vw, 1rem) !important;
            width: 100% !important;
          }
          
          .filters-section > div:nth-child(2) > div:last-child > div,
          .filters-section > div:nth-child(2) > div:last-child > button {
            font-size: clamp(0.8rem, 2.2vw, 0.9rem) !important;
            padding: clamp(0.65rem, 2vw, 0.75rem) clamp(0.875rem, 2.5vw, 1rem) !important;
            border-radius: 10px !important;
            justify-content: center !important;
          }
          
          /* Hotels Grid Mobile */
          .hotels-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: clamp(0.75rem, 2vw, 1rem) !important;
            padding: 0 !important;
          }
          
          /* Hotel Card Mobile */
          .hotel-card {
            border-radius: clamp(12px, 2.5vw, 16px) !important;
            overflow: hidden !important;
            background: #ffffff !important;
            box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08) !important;
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          
          .hotel-card:active {
            transform: scale(0.98) !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          }
          
          .hotel-card img {
            height: clamp(120px, 30vw, 160px) !important;
            object-fit: cover !important;
          }
          
          .hotel-card > div:last-child {
            padding: clamp(0.65rem, 2vw, 0.875rem) !important;
          }
          
          .hotel-card h3 {
            font-size: clamp(0.8rem, 2.5vw, 0.95rem) !important;
            margin-bottom: clamp(0.2rem, 0.5vw, 0.35rem) !important;
            line-height: 1.3 !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 2 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          
          .hotel-card p {
            font-size: clamp(0.7rem, 2vw, 0.8rem) !important;
            margin-bottom: clamp(0.35rem, 1vw, 0.5rem) !important;
            display: -webkit-box !important;
            -webkit-line-clamp: 1 !important;
            -webkit-box-orient: vertical !important;
            overflow: hidden !important;
          }
          
          /* Rating on Card */
          .hotel-card > div:last-child > div:nth-child(3) {
            margin-bottom: clamp(0.35rem, 1vw, 0.5rem) !important;
          }
          
          .hotel-card > div:last-child > div:nth-child(3) span:first-child {
            font-size: clamp(0.7rem, 2vw, 0.8rem) !important;
          }
          
          .hotel-card > div:last-child > div:nth-child(3) span:last-child {
            font-size: clamp(0.6rem, 1.6vw, 0.7rem) !important;
          }
          
          /* Amenities Tags */
          .hotel-card > div:last-child > div:nth-child(4) {
            display: none !important;
          }
          
          /* Price Section */
          .hotel-card > div:last-child > div:last-child {
            flex-direction: column !important;
            align-items: stretch !important;
            gap: clamp(0.5rem, 1.5vw, 0.75rem) !important;
          }
          
          .hotel-card > div:last-child > div:last-child > div span {
            font-size: clamp(0.65rem, 1.8vw, 0.75rem) !important;
          }
          
          .hotel-card > div:last-child > div:last-child > div p {
            font-size: clamp(1rem, 3vw, 1.2rem) !important;
            margin: 0 !important;
          }
          
          .hotel-card > div:last-child > div:last-child button {
            padding: clamp(0.5rem, 1.5vw, 0.65rem) clamp(0.75rem, 2vw, 1rem) !important;
            font-size: clamp(0.7rem, 2vw, 0.8rem) !important;
            border-radius: 8px !important;
            width: 100% !important;
          }
          
          /* Popular Badge */
          .hotel-card > div:first-child > div {
            padding: clamp(0.2rem, 0.6vw, 0.3rem) clamp(0.5rem, 1.5vw, 0.65rem) !important;
            font-size: clamp(0.55rem, 1.6vw, 0.65rem) !important;
            border-radius: clamp(1rem, 3vw, 1.5rem) !important;
            top: clamp(0.35rem, 1vw, 0.5rem) !important;
            right: clamp(0.35rem, 1vw, 0.5rem) !important;
          }
        }
        
        @media (max-width: 480px) {
          /* Single Column for Small Phones */
          .hotels-grid {
            grid-template-columns: 1fr !important;
            gap: clamp(0.875rem, 2.5vw, 1rem) !important;
          }
          
          .hotel-card {
            display: flex !important;
            flex-direction: row !important;
            height: auto !important;
          }
          
          .hotel-card > div:first-child {
            width: clamp(110px, 30vw, 140px) !important;
            min-width: clamp(110px, 30vw, 140px) !important;
            flex-shrink: 0 !important;
          }
          
          .hotel-card > div:first-child img {
            height: 100% !important;
            min-height: clamp(130px, 35vw, 160px) !important;
          }
          
          .hotel-card > div:last-child {
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: space-between !important;
            padding: clamp(0.65rem, 2vw, 0.875rem) !important;
          }
          
          .hotel-card h3 {
            font-size: clamp(0.85rem, 2.8vw, 1rem) !important;
            -webkit-line-clamp: 2 !important;
          }
          
          .hotel-card > div:last-child > div:last-child {
            flex-direction: row !important;
            justify-content: space-between !important;
            align-items: center !important;
          }
          
          .hotel-card > div:last-child > div:last-child button {
            width: auto !important;
            padding: clamp(0.4rem, 1.2vw, 0.5rem) clamp(0.6rem, 1.8vw, 0.8rem) !important;
          }
          
          /* Hero adjustments */
          .hero-section {
            height: clamp(220px, 45vw, 280px) !important;
            min-height: clamp(220px, 45vw, 280px) !important;
          }
          
          .hero-section h1 {
            font-size: clamp(1.25rem, 5vw, 1.75rem) !important;
          }
          
          /* Search Box */
          .search-box {
            margin: -1.5rem 0.5rem 0 !important;
            padding: clamp(0.875rem, 2.5vw, 1rem) !important;
          }
          
          .search-item {
            min-height: 46px !important;
            padding: clamp(0.55rem, 1.5vw, 0.65rem) clamp(0.65rem, 1.8vw, 0.8rem) !important;
          }
          
          .search-btn {
            min-height: 48px !important;
          }
        }
        
        @media (max-width: 375px) {
          .hotel-card > div:first-child {
            width: clamp(100px, 28vw, 120px) !important;
            min-width: clamp(100px, 28vw, 120px) !important;
          }
          
          .hotel-card h3 {
            font-size: clamp(0.8rem, 2.5vw, 0.9rem) !important;
          }
          
          .hotel-card > div:last-child > div:last-child > div p {
            font-size: clamp(0.9rem, 2.8vw, 1rem) !important;
          }
        }
        
        /* Touch Optimizations */
        @media (hover: none) and (pointer: coarse) {
          .hotel-card {
            transition: transform 0.15s ease !important;
          }
          
          .hotel-card:active {
            transform: scale(0.98) !important;
          }
          
          .search-btn:active,
          .filters-section button:active {
            transform: scale(0.97) !important;
          }
          
          select,
          input {
            font-size: 16px !important; /* Prevents iOS zoom */
          }
        }
        
        /* Dark Mode Support */
        @media (prefers-color-scheme: dark) {
          .hotel-card {
            background: #1e293b !important;
            border-color: #334155 !important;
          }
          
          .hotel-card h3 {
            color: #f1f5f9 !important;
          }
          
          .hotel-card p {
            color: #94a3b8 !important;
          }
        }
        
        /* Reduced Motion */
        @media (prefers-reduced-motion: reduce) {
          .hotel-card,
          .search-btn,
          button {
            transition: none !important;
          }
        }
      `}</style>
    </div>
  );
}
