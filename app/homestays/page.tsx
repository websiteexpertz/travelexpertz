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

const SIDEBAR_PRICE_RANGES = [
  { key: "0-2500", label: "₹0 - ₹2,500", min: 0, max: 2500 },
  { key: "2500-5000", label: "₹2,500 - ₹5,000", min: 2500, max: 5000 },
  { key: "5000-8500", label: "₹5,000 - ₹8,500", min: 5000, max: 8500 },
  { key: "8500-12000", label: "₹8,500 - ₹12,000", min: 8500, max: 12000 },
  { key: "12000-15000", label: "₹12,000 - ₹15,000", min: 12000, max: 15000 },
  { key: "15000-30000", label: "₹15,000 - ₹30,000", min: 15000, max: 30000 },
  { key: "30000+", label: "₹30,000+", min: 30000, max: Infinity },
] as const;

const STAR_OPTIONS = [
  { value: 7, label: "7 Star", minRating: 4.8, maxRating: 5 },
  { value: 5, label: "5 Star", minRating: 4.5, maxRating: 4.8 },
  { value: 4, label: "4 Star", minRating: 3.5, maxRating: 4.5 },
  { value: 3, label: "3 Star", minRating: 2.5, maxRating: 3.5 },
] as const;

const RATING_OPTIONS = [
  { key: "4.5+", label: "★ 4.5+", minRating: 4.5 },
  { key: "4.0+", label: "★ 4.0+", minRating: 4.0 },
  { key: "3.5+", label: "★ 3.5+", minRating: 3.5 },
  { key: "3.0+", label: "★ 3.0+", minRating: 3.0 },
] as const;

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

  /* Two Column Layout */
  .hotels-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 2rem;
    width: 100%;
    align-items: start;
  }

  .hotels-main {
    grid-column: 1;
    width: 100%;
  }

  .filter-sidebar {
    grid-column: 2;
    width: 100%;
    height: fit-content;
    position: sticky;
    top: 100px;
  }

  @media (max-width: 1200px) {
    .hotels-layout {
      grid-template-columns: 1fr 280px;
      gap: 1.5rem;
    }
  }

  @media (max-width: 768px) {
    .hotels-layout {
      grid-template-columns: 1fr;
      gap: 1.5rem;
    }

    .filter-sidebar {
      grid-column: 1;
      position: static;
      order: -1;
    }

    .hotels-main {
      grid-column: 1;
    }
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

  // Sidebar filter states
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<string[]>([]);
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

  const toggleStar = (star: number) =>
    setSelectedStars((prev) =>
      prev.includes(star) ? prev.filter((s) => s !== star) : [...prev, star],
    );
  const togglePriceRange = (key: string) =>
    setSelectedPriceRanges((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  const toggleAmenity = (amenity: string) =>
    setSelectedAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((a) => a !== amenity)
        : [...prev, amenity],
    );
  const toggleRating = (key: string) =>
    setSelectedRatings((prev) =>
      prev.includes(key) ? prev.filter((r) => r !== key) : [...prev, key],
    );
  const clearSidebarFilters = () => {
    setSelectedStars([]);
    setSelectedPriceRanges([]);
    setSelectedAmenities([]);
    setSelectedRatings([]);
    setShowPopularOnly(false);
  };

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

  const allAmenities = useMemo(() => {
    const set = new Set<string>();
    homestays.forEach((h) => h.amenities.forEach((a) => set.add(a)));
    return Array.from(set).sort();
  }, [homestays]);

  const priceRangeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SIDEBAR_PRICE_RANGES.forEach((range) => {
      counts[range.key] = homestays.filter(
        (h) =>
          h.price >= range.min &&
          (range.max === Infinity ? true : h.price < range.max),
      ).length;
    });
    return counts;
  }, [homestays]);

  const starCounts = useMemo<Record<number, number>>(
    () => ({
      7: homestays.filter((h) => h.rating >= 4.8).length,
      5: homestays.filter((h) => h.rating >= 4.5 && h.rating < 4.8).length,
      4: homestays.filter((h) => h.rating >= 3.5 && h.rating < 4.5).length,
      3: homestays.filter((h) => h.rating >= 2.5 && h.rating < 3.5).length,
    }),
    [homestays],
  );

  const ratingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    RATING_OPTIONS.forEach((opt) => {
      counts[opt.key] = homestays.filter(
        (h) => h.rating >= opt.minRating,
      ).length;
    });
    return counts;
  }, [homestays]);

  const amenityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    homestays.forEach((h) =>
      h.amenities.forEach((a) => {
        counts[a] = (counts[a] || 0) + 1;
      }),
    );
    return counts;
  }, [homestays]);

  const hasSidebarFilters =
    selectedStars.length > 0 ||
    selectedPriceRanges.length > 0 ||
    selectedAmenities.length > 0 ||
    selectedRatings.length > 0 ||
    showPopularOnly;

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

        const matchesSidebarPrice =
          selectedPriceRanges.length === 0 ||
          selectedPriceRanges.some((key) => {
            const range = SIDEBAR_PRICE_RANGES.find((r) => r.key === key);
            return range
              ? homestay.price >= range.min &&
                  (range.max === Infinity || homestay.price < range.max)
              : false;
          });

        const matchesStars =
          selectedStars.length === 0 ||
          selectedStars.some((star) => {
            const opt = STAR_OPTIONS.find((s) => s.value === star);
            return opt
              ? homestay.rating >= opt.minRating &&
                  homestay.rating < opt.maxRating
              : false;
          });

        const matchesRating =
          selectedRatings.length === 0 ||
          selectedRatings.some((key) => {
            const opt = RATING_OPTIONS.find((r) => r.key === key);
            return opt ? homestay.rating >= opt.minRating : false;
          });

        const matchesAmenities =
          selectedAmenities.length === 0 ||
          selectedAmenities.every((a) => homestay.amenities.includes(a));
        const matchesPopular = !showPopularOnly || homestay.popular;

        return (
          matchesLocation &&
          matchesPrice &&
          matchesSearch &&
          matchesSidebarPrice &&
          matchesStars &&
          matchesRating &&
          matchesAmenities &&
          matchesPopular
        );
      })
      .sort((a, b) => {
        if (sortBy === "price-low") return a.price - b.price;
        if (sortBy === "price-high") return b.price - a.price;
        if (sortBy === "rating") return b.rating - a.rating;
        return (b.popular ? 1 : 0) - (a.popular ? 1 : 0);
      });
  }, [
    filters.location,
    filters.priceRange,
    homestays,
    searchQuery,
    sortBy,
    selectedStars,
    selectedPriceRanges,
    selectedAmenities,
    selectedRatings,
    showPopularOnly,
  ]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: homestayHeroStyles }} />
      <Header currentPage="homestays" isHeroPage={true} />

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
              style={{
                position: "relative",
                zIndex: 2,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                width: "100%",
                height: "100%",
              }}
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

              <h1
                style={{
                  fontSize: "clamp(1.25rem, 5vw, 3rem)",
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
          </div>
        </div>

        {/* Filters and Hotels Grid */}
        <div
          style={{
            margin: "0 auto",
            padding: "0 1.5rem",
            maxWidth: "100rem",
            width: "100%",
            marginTop: "1.5rem",
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
            ></div>
          </div>

          {/* Two Column Layout: Homestays + Filter Sidebar */}
          <div className="hotels-layout">
            {/* Left: Homestays Section */}
            <div className="hotels-main">
              <div
                style={{
                  width: "100%",
                  background:
                    "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
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
                        <div
                          style={{ position: "relative", flex: "0 0 250px" }}
                        >
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
                            {homestay.amenities
                              .slice(0, 3)
                              .map((amenity, idx) => (
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
                                e.currentTarget.style.backgroundColor =
                                  "#084ba8";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#0a66c2";
                              }}
                              onClick={(e) => {
                                e.preventDefault();
                                window.location.href = `/homestays/${
                                  homestay._id ||
                                  encodeURIComponent(homestay.name)
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

            {/* Right: Filter Sidebar */}
            <div className="filter-sidebar">
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  padding: "1.5rem",
                  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
                  border: "1px solid #f1f5f9",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.5rem",
                    paddingBottom: "1rem",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 700,
                      color: "#1e293b",
                      margin: 0,
                    }}
                  >
                    Filters
                  </h3>
                  {hasSidebarFilters && (
                    <button
                      onClick={clearSidebarFilters}
                      style={{
                        fontSize: "0.8rem",
                        color: "#ef4444",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        padding: "0.4rem 0.6rem",
                        borderRadius: "6px",
                        backgroundColor: "#fef2f2",
                        transition: "all 0.2s",
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Suggested For You */}
                <div
                  style={{
                    marginBottom: "1.5rem",
                    paddingBottom: "1.25rem",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: "#1e293b",
                      marginBottom: "0.75rem",
                    }}
                  >
                    Suggested For You
                  </h4>
                </div>

                {/* 🔥 Popular Homestays */}
                <div
                  style={{
                    marginBottom: "1.5rem",
                    paddingBottom: "1.25rem",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.75rem",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ position: "relative", display: "flex" }}>
                      <input
                        type="checkbox"
                        checked={showPopularOnly}
                        onChange={(e) => setShowPopularOnly(e.target.checked)}
                        style={{
                          width: "42px",
                          height: "22px",
                          appearance: "none",
                          backgroundColor: showPopularOnly
                            ? "#3b82f6"
                            : "#e2e8f0",
                          borderRadius: "11px",
                          cursor: "pointer",
                          transition: "background 0.3s",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          left: showPopularOnly ? "22px" : "2px",
                          top: "2px",
                          width: "18px",
                          height: "18px",
                          backgroundColor: "#ffffff",
                          borderRadius: "50%",
                          transition: "left 0.3s",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                        }}
                      />
                    </div>
                    <span
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        color: "#334155",
                      }}
                    >
                      🔥 Popular Homestays
                    </span>
                  </label>
                </div>

                {/* Price Range Section */}
                <div
                  style={{
                    marginBottom: "1.25rem",
                    paddingBottom: "1.25rem",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#1e293b",
                      marginBottom: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Price Per Night
                  </h4>
                  {SIDEBAR_PRICE_RANGES.map((range) => (
                    <label
                      key={range.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                        padding: "0.35rem 0.5rem",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        color: "#374151",
                        borderRadius: "8px",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedPriceRanges.includes(range.key)}
                        onChange={() => togglePriceRange(range.key)}
                        style={{
                          width: "16px",
                          height: "16px",
                          accentColor: "#3b82f6",
                          cursor: "pointer",
                        }}
                      />
                      <span>{range.label}</span>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                        }}
                      >
                        ({priceRangeCounts[range.key] || 0})
                      </span>
                    </label>
                  ))}
                </div>

                {/* Star Category */}
                <div
                  style={{
                    marginBottom: "1.25rem",
                    paddingBottom: "1.25rem",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#1e293b",
                      marginBottom: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Star Category
                  </h4>
                  {STAR_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                        padding: "0.35rem 0.5rem",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        color: "#374151",
                        borderRadius: "8px",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedStars.includes(opt.value)}
                        onChange={() => toggleStar(opt.value)}
                        style={{
                          width: "16px",
                          height: "16px",
                          accentColor: "#3b82f6",
                          cursor: "pointer",
                        }}
                      />
                      <span>
                        {"⭐".repeat(Math.min(opt.value, 5))} {opt.label}
                      </span>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                        }}
                      >
                        ({starCounts[opt.value] || 0})
                      </span>
                    </label>
                  ))}
                </div>

                {/* Rating */}
                <div
                  style={{
                    marginBottom: "1.25rem",
                    paddingBottom: "1.25rem",
                    borderBottom: "1px solid #f1f5f9",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "0.8rem",
                      fontWeight: 700,
                      color: "#1e293b",
                      marginBottom: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Rating
                  </h4>
                  {RATING_OPTIONS.map((opt) => (
                    <label
                      key={opt.key}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.625rem",
                        padding: "0.35rem 0.5rem",
                        cursor: "pointer",
                        fontSize: "0.85rem",
                        color: "#374151",
                        borderRadius: "8px",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#f8fafc";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(opt.key)}
                        onChange={() => toggleRating(opt.key)}
                        style={{
                          width: "16px",
                          height: "16px",
                          accentColor: "#3b82f6",
                          cursor: "pointer",
                        }}
                      />
                      <span>{opt.label}</span>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                        }}
                      >
                        ({ratingCounts[opt.key] || 0})
                      </span>
                    </label>
                  ))}
                </div>

                {/* Amenities */}
                {allAmenities.length > 0 && (
                  <div>
                    <h4
                      style={{
                        fontSize: "0.8rem",
                        fontWeight: 700,
                        color: "#1e293b",
                        marginBottom: "0.75rem",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Amenities
                    </h4>
                    {(showAllAmenities
                      ? allAmenities
                      : allAmenities.slice(0, 5)
                    ).map((amenity) => (
                      <label
                        key={amenity}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.625rem",
                          padding: "0.35rem 0.5rem",
                          cursor: "pointer",
                          fontSize: "0.85rem",
                          color: "#374151",
                          borderRadius: "8px",
                          transition: "background 0.15s",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#f8fafc";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selectedAmenities.includes(amenity)}
                          onChange={() => toggleAmenity(amenity)}
                          style={{
                            width: "16px",
                            height: "16px",
                            accentColor: "#3b82f6",
                            cursor: "pointer",
                          }}
                        />
                        <span>{amenity}</span>
                        <span
                          style={{
                            marginLeft: "auto",
                            fontSize: "0.75rem",
                            color: "#9ca3af",
                          }}
                        >
                          ({amenityCounts[amenity] || 0})
                        </span>
                      </label>
                    ))}
                    {allAmenities.length > 5 && (
                      <button
                        onClick={() => setShowAllAmenities(!showAllAmenities)}
                        style={{
                          fontSize: "0.8rem",
                          color: "#3b82f6",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                          fontWeight: 600,
                          padding: "0.5rem 0",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.25rem",
                          marginTop: "0.25rem",
                        }}
                      >
                        {showAllAmenities
                          ? "Show Less"
                          : `Show ${allAmenities.length - 5} more`}
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "1rem" }}
                        >
                          {showAllAmenities ? "expand_less" : "expand_more"}
                        </span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
