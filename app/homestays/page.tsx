"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Header from "../components/Header";
import DatePicker from "../components/DatePicker";
import { formatDateShort } from "@/lib/utils/dateFormat";

interface Homestay {
  _id?: string;
  name: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  images?: string[];
  amenities: string[];
  popular?: boolean;
  active?: boolean;
  propertyType?: string;
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

const normalizeHomestay = (homestay: Partial<Homestay>): Homestay => {
  const rawId = (homestay as { _id?: unknown })._id;
  const images = Array.isArray(homestay.images) ? homestay.images : [];
  const primaryImage = images.length > 0 ? images[0] : (homestay.image ?? "");

  return {
    _id: typeof rawId === "string" ? rawId : rawId ? String(rawId) : undefined,
    name: homestay.name ?? "",
    location: homestay.location ?? "",
    price: Number((homestay as { price?: unknown }).price ?? 0) || 0,
    rating: Number((homestay as { rating?: unknown }).rating ?? 0) || 0,
    reviews: Number((homestay as { reviews?: unknown }).reviews ?? 0) || 0,
    image: primaryImage,
    images: images,
    amenities: Array.isArray(homestay.amenities) ? homestay.amenities : [],
    popular: typeof homestay.popular === "boolean" ? homestay.popular : false,
    active: typeof homestay.active === "boolean" ? homestay.active : true,
    propertyType: homestay.propertyType ?? "Entire Place",
    hostName: homestay.hostName ?? "",
    hostEmail: homestay.hostEmail ?? "",
    hostPhone: homestay.hostPhone ?? "",
  };
};

const PRICE_THRESHOLDS = {
  budgetMax: 15000,
  midMax: 22000,
} as const;

// Hero animations
const homestayHeroStyles = `
  @keyframes float {
    0%, 100% { transform: translateY(0px) rotate(0deg); }
    50% { transform: translateY(-20px) rotate(5deg); }
  }

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

  @keyframes heroBlob1 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(30px, -30px) scale(1.05); }
    66% { transform: translate(-20px, 20px) scale(0.95); }
  }
  @keyframes heroBlob2 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    33% { transform: translate(-25px, 25px) scale(1.03); }
    66% { transform: translate(15px, -15px) scale(0.97); }
  }
  @keyframes heroBlob3 {
    0%, 100% { transform: translate(0, 0) scale(1); }
    50% { transform: translate(20px, -20px) scale(1.05); }
  }
  @keyframes heroSparkle {
    0%, 100% { opacity: 0.3; transform: scale(1); }
    50% { opacity: 1; transform: scale(1.5); }
  }
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

export default function Homestays() {
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

  const [homestays, setHomestays] = useState<Homestay[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("featured");

  useEffect(() => {
    const fetchHomestays = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/homestays", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          const normalized = (Array.isArray(data) ? data : []).map((item) =>
            normalizeHomestay(item),
          );
          setHomestays(normalized);
        }
      } catch (error) {
        console.error("Failed to fetch homestays:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomestays();
  }, []);

  const filteredHomestays = useMemo(() => {
    return homestays
      .filter((homestay) => {
        const matchesLocation = filters.location
          ? homestay.location
              .toLowerCase()
              .includes(filters.location.toLowerCase())
          : true;

        const matchesSearch = searchQuery
          ? homestay.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            homestay.location.toLowerCase().includes(searchQuery.toLowerCase())
          : true;

        const matchesPrice = (() => {
          if (filters.priceRange === "budget") {
            return homestay.price < PRICE_THRESHOLDS.budgetMax;
          }
          if (filters.priceRange === "mid") {
            return (
              homestay.price >= PRICE_THRESHOLDS.budgetMax &&
              homestay.price <= PRICE_THRESHOLDS.midMax
            );
          }
          if (filters.priceRange === "luxury") {
            return homestay.price > PRICE_THRESHOLDS.midMax;
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
  }, [filters.location, filters.priceRange, homestays, searchQuery, sortBy]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: homestayHeroStyles }} />
      <Header currentPage="homestays" />

      <main className="flex flex-col items-center w-full">
        {/* Hero Section - Premium Design */}
        <div
          className="w-full"
          style={{
            background: "transparent",
            padding: "0",
            marginTop: "0",
          }}
        >
          <div
            className="hero-section"
            style={{
              backgroundImage: "url('/homestay-hero.jpeg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle Dark Overlay for Text Readability */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 50%, rgba(0,0,0,0.08) 100%)",
                zIndex: 1,
              }}
            />

            {/* Removed Animated Blobs */}

            {/* Hero Content */}
            <div
              className="hero-content"
              style={{ position: "relative", zIndex: 2 }}
            >
              {/* Badge Pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.4rem 1rem",
                  borderRadius: "9999px",
                  background: "rgba(255,255,255,0.2)",
                  border: "1px solid rgba(255,255,255,0.4)",
                  marginBottom: "1.25rem",
                  animation: "fadeInUp 0.8s ease-out",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#ffffff",
                    animation: "pulse 2s ease-in-out infinite",
                  }}
                />
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#ffffff",
                    letterSpacing: "0.02em",
                  }}
                >
                  Authentic Home Experiences
                </span>
              </div>

              {/* Toggle Buttons */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "0.5rem",
                  marginBottom: "1.25rem",
                  animation: "fadeInUp 0.8s ease-out",
                  animationDelay: "0.1s",
                  animationFillMode: "both",
                }}
              >
                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      location: filters.location,
                      checkIn: filters.checkIn,
                      checkOut: filters.checkOut,
                      guests: filters.guests,
                      rooms: filters.rooms,
                      priceRange: filters.priceRange,
                      type: "hotels",
                    });
                    window.location.href = `/hotels/search?${params.toString()}`;
                  }}
                  style={{
                    padding: "0.5rem 1.25rem",
                    borderRadius: "9999px",
                    border: "1px solid rgba(59,130,246,0.2)",
                    background: "rgba(255,255,255,0.7)",
                    color: "#3b82f6",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    backdropFilter: "blur(8px)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "rgba(59,130,246,0.08)";
                    e.currentTarget.style.borderColor = "rgba(59,130,246,0.3)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "rgba(255,255,255,0.7)";
                    e.currentTarget.style.borderColor = "rgba(59,130,246,0.2)";
                  }}
                >
                  🏨 Hotels
                </button>
                <button
                  onClick={() => {
                    const params = new URLSearchParams({
                      location: filters.location,
                      checkIn: filters.checkIn,
                      checkOut: filters.checkOut,
                      guests: filters.guests,
                      rooms: filters.rooms,
                      priceRange: filters.priceRange,
                      type: "homestays",
                    });
                    window.location.href = `/hotels/search?${params.toString()}`;
                  }}
                  style={{
                    padding: "0.5rem 1.25rem",
                    borderRadius: "9999px",
                    border: "none",
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    color: "white",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "default",
                    boxShadow: "0 2px 8px rgba(59,130,246,0.3)",
                  }}
                >
                  🏠 Homestays
                </button>
              </div>

              <h1
                style={{
                  fontSize: "clamp(1.5rem, 6vw, 4rem)",
                  fontWeight: 900,
                  marginBottom: "0.5rem",
                  lineHeight: 1.1,
                  letterSpacing: "-0.03em",
                  margin: "0 auto 0.5rem",
                  display: "block",
                  animation: "fadeInUp 0.8s ease-out",
                  animationDelay: "0.2s",
                  animationFillMode: "both",
                  color: "#ffffff",
                  textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                  padding: "0 0.25rem",
                }}
              >
                Where Comfort Feels Like Home.
              </h1>
              <p
                style={{
                  fontSize: "clamp(0.8rem, 3vw, 1.25rem)",
                  maxWidth: "600px",
                  margin: "0 auto",
                  lineHeight: 1.6,
                  fontWeight: 500,
                  padding: "0 0.5rem",
                  animation: "fadeInUp 0.8s ease-out",
                  animationDelay: "0.45s",
                  animationFillMode: "both",
                  color: "#ffffff",
                  textShadow: "0 1px 4px rgba(0, 0, 0, 0.2)",
                }}
              >
                Experience authentic comfort with local hosts
              </p>

              {/* Trust Indicators */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "1.5rem",
                  marginTop: "1.25rem",
                  flexWrap: "wrap",
                  animation: "fadeInUp 0.8s ease-out",
                  animationDelay: "0.6s",
                  animationFillMode: "both",
                }}
              >
                {[
                  { icon: "verified", label: "Verified Properties" },
                  { icon: "support_agent", label: "24/7 Support" },
                  { icon: "lock", label: "Secure Booking" },
                ].map((item) => (
                  <div
                    key={item.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.35rem",
                      fontSize: "0.8rem",
                      color: "#ffffff",
                      fontWeight: 500,
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "1rem", color: "#ffffff" }}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                ))}
              </div>
            </div>

            {/* Search Box - Inside Hero */}
            <div
              className="search-box"
              style={{
                position: "relative",
                zIndex: 2,
                animation: "fadeInUp 0.8s ease-out",
                animationDelay: "0.8s",
                animationFillMode: "both",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                background: "rgba(255, 255, 255, 0.85)",
                border: "1px solid rgba(59,130,246,0.1)",
                boxShadow:
                  "0 8px 32px rgba(59,130,246,0.08), 0 2px 8px rgba(0,0,0,0.04)",
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
                  <DatePicker
                    value={filters.checkIn}
                    onChange={(date) =>
                      setFilters({ ...filters, checkIn: date })
                    }
                    placeholder="Check-in"
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
                  <DatePicker
                    value={filters.checkOut}
                    onChange={(date) =>
                      setFilters({ ...filters, checkOut: date })
                    }
                    placeholder="Check-out"
                    minDate={filters.checkIn}
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
                    window.location.href = `/homestays/search?${params.toString()}`;
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
                placeholder="Search homestays by name or location..."
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
                  {filteredHomestays.length}{" "}
                  {filteredHomestays.length === 1 ? "homestay" : "homestays"}
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
          {/* Homestays Carousel Strip */}
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
              Featured Homestays
            </h2>
            <div
              className="homestays-grid"
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
                  Loading homestays...
                </div>
              )}
              {!loading && filteredHomestays.length === 0 && (
                <div
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    fontSize: "1rem",
                    color: "#64748b",
                  }}
                >
                  {homestays.length === 0
                    ? "No homestays available yet. Please add homestays from the admin panel."
                    : "No homestays match the selected filters. Try adjusting your search criteria."}
                </div>
              )}
              {!loading &&
                filteredHomestays.map((homestay) => (
                  <a
                    key={homestay._id || homestay.name}
                    href={`/homestays/${
                      homestay._id || encodeURIComponent(homestay.name)
                    }`}
                    className="homestay-card"
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
                        src={
                          homestay.image ||
                          "https://via.placeholder.com/400x200?text=No+Image"
                        }
                        alt={homestay.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          backgroundColor: "#f3f4f6",
                        }}
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/400x200?text=Image+Not+Found";
                        }}
                      />
                      {homestay.popular && (
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
                        {homestay.name}
                      </h3>
                      <p
                        style={{
                          fontSize: "0.875rem",
                          color: "#6b7280",
                          marginBottom: "0.75rem",
                        }}
                      >
                        {homestay.location}
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
                          ★ {homestay.rating}
                        </span>
                        <span
                          style={{
                            fontSize: "0.75rem",
                            color: "#9ca3af",
                          }}
                        >
                          ({homestay.reviews} reviews)
                        </span>
                      </div>

                      <div
                        style={{
                          fontSize: "0.875rem",
                          marginBottom: "1rem",
                        }}
                      >
                        {homestay.amenities.slice(0, 3).map((amenity, idx) => (
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
                      {homestay.hostName && (
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
                            {homestay.hostName}
                          </p>
                          {homestay.hostEmail && (
                            <p
                              style={{
                                fontSize: "0.75rem",
                                color: "#6b7280",
                                margin: "0.25rem 0 0",
                              }}
                            >
                              📧 {homestay.hostEmail}
                            </p>
                          )}
                          {homestay.hostPhone && (
                            <p
                              style={{
                                fontSize: "0.75rem",
                                color: "#6b7280",
                                margin: "0.25rem 0 0",
                              }}
                            >
                              📞 {homestay.hostPhone}
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
                            {formatInr(homestay.price)}
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
                            window.location.href = `/homestays/${
                              homestay._id || encodeURIComponent(homestay.name)
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
    </div>
  );
}
