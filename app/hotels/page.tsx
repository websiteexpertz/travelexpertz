"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Header from "../components/Header";
import DatePicker from "../components/DatePicker";
import { formatDateShort } from "@/lib/utils/dateFormat";

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

const SIDEBAR_PRICE_RANGES = [
  { label: "₹0 - ₹2,500", min: 0, max: 2500, key: "0-2500" },
  { label: "₹2,500 - ₹5,000", min: 2500, max: 5000, key: "2500-5000" },
  { label: "₹5,000 - ₹8,500", min: 5000, max: 8500, key: "5000-8500" },
  { label: "₹8,500 - ₹12,000", min: 8500, max: 12000, key: "8500-12000" },
  { label: "₹12,000 - ₹15,000", min: 12000, max: 15000, key: "12000-15000" },
  { label: "₹15,000 - ₹30,000", min: 15000, max: 30000, key: "15000-30000" },
  { label: "₹30,000+", min: 30000, max: Infinity, key: "30000+" },
];

const STAR_OPTIONS = [
  { label: "7 Star", value: 7, minRating: 4.8, maxRating: 5.01 },
  { label: "5 Star", value: 5, minRating: 4.5, maxRating: 5.01 },
  { label: "4 Star", value: 4, minRating: 3.5, maxRating: 4.5 },
  { label: "3 Star", value: 3, minRating: 2.5, maxRating: 3.5 },
];

const RATING_OPTIONS = [
  { label: "★ 4.5+", value: 4.5 },
  { label: "★ 4.0+", value: 4.0 },
  { label: "★ 3.5+", value: 3.5 },
  { label: "★ 3.0+", value: 3.0 },
];

function HotelsContent() {
  const searchParams = useSearchParams();
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

  // Initialize location filter from URL params
  useEffect(() => {
    const locationParam = searchParams.get("location");
    if (locationParam) {
      setFilters((prev) => ({
        ...prev,
        location: decodeURIComponent(locationParam),
      }));
    }
  }, [searchParams]);

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
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
  const toggleRating = (rating: number) =>
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating],
    );
  const clearSidebarFilters = () => {
    setSelectedStars([]);
    setSelectedPriceRanges([]);
    setSelectedAmenities([]);
    setSelectedRatings([]);
    setShowPopularOnly(false);
  };

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

  const allAmenities = useMemo(() => {
    const set = new Set<string>();
    hotels.forEach((h) => h.amenities.forEach((a) => set.add(a)));
    return Array.from(set).sort();
  }, [hotels]);

  const priceRangeCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SIDEBAR_PRICE_RANGES.forEach((range) => {
      counts[range.key] = hotels.filter(
        (h) =>
          h.price >= range.min &&
          (range.max === Infinity ? true : h.price < range.max),
      ).length;
    });
    return counts;
  }, [hotels]);

  const starCounts = useMemo<Record<number, number>>(
    () => ({
      7: hotels.filter((h) => h.rating >= 4.8).length,
      5: hotels.filter((h) => h.rating >= 4.5).length,
      4: hotels.filter((h) => h.rating >= 3.5 && h.rating < 4.5).length,
      3: hotels.filter((h) => h.rating >= 2.5 && h.rating < 3.5).length,
    }),
    [hotels],
  );

  const ratingCounts = useMemo(() => {
    const counts: Record<number, number> = {};
    RATING_OPTIONS.forEach((option) => {
      counts[option.value] = hotels.filter(
        (h) => h.rating >= option.value,
      ).length;
    });
    return counts;
  }, [hotels]);

  const amenityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    hotels.forEach((h) =>
      h.amenities.forEach((a) => {
        counts[a] = (counts[a] || 0) + 1;
      }),
    );
    return counts;
  }, [hotels]);

  const hasSidebarFilters =
    selectedStars.length > 0 ||
    selectedPriceRanges.length > 0 ||
    selectedAmenities.length > 0 ||
    selectedRatings.length > 0 ||
    showPopularOnly;

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
          if (filters.priceRange === "budget")
            return hotel.price < PRICE_THRESHOLDS.budgetMax;
          if (filters.priceRange === "mid")
            return (
              hotel.price >= PRICE_THRESHOLDS.budgetMax &&
              hotel.price <= PRICE_THRESHOLDS.midMax
            );
          if (filters.priceRange === "luxury")
            return hotel.price > PRICE_THRESHOLDS.midMax;
          return true;
        })();

        const matchesSidebarPrice =
          selectedPriceRanges.length === 0 ||
          selectedPriceRanges.some((key) => {
            const range = SIDEBAR_PRICE_RANGES.find((r) => r.key === key);
            return range
              ? hotel.price >= range.min &&
                  (range.max === Infinity || hotel.price < range.max)
              : false;
          });

        const matchesStars =
          selectedStars.length === 0 ||
          selectedStars.some((star) => {
            const opt = STAR_OPTIONS.find((s) => s.value === star);
            return opt
              ? hotel.rating >= opt.minRating && hotel.rating < opt.maxRating
              : false;
          });

        const matchesAmenities =
          selectedAmenities.length === 0 ||
          selectedAmenities.every((a) => hotel.amenities.includes(a));

        const matchesRatings =
          selectedRatings.length === 0 ||
          selectedRatings.some((rating) => hotel.rating >= rating);

        const matchesPopular = !showPopularOnly || hotel.popular;

        return (
          matchesLocation &&
          matchesPrice &&
          matchesSearch &&
          matchesSidebarPrice &&
          matchesStars &&
          matchesAmenities &&
          matchesRatings &&
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
    hotels,
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
      <Header currentPage="hotels" />

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
              backgroundImage: "url('/hotel-hero.jpeg')",
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
                  🏨 Hotels & 🏠 Homestays
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
                Your Perfect Stay, Just a Click Away.
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
            ></div>
          </div>

          {/* Two Column Layout: Hotels + Filter Sidebar */}
          <div className="hotels-layout">
            {/* Left: Hotels Section */}
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
                          background: "#ffffff",
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
                                e.currentTarget.style.backgroundColor =
                                  "#084ba8";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor =
                                  "#0a66c2";
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

            {/* Right: Filter Sidebar */}
            <div className="filter-sidebar">
              <div
                style={{
                  background: "#ffffff",
                  borderRadius: "16px",
                  boxShadow: "0 2px 12px rgba(0, 0, 0, 0.08)",
                  border: "1px solid #e2e8f0",
                  padding: "1.25rem",
                }}
              >
                {/* Sidebar Header */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.25rem",
                    paddingBottom: "0.75rem",
                    borderBottom: "2px solid #e2e8f0",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      color: "#1e293b",
                      margin: 0,
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "1.1rem", color: "#3b82f6" }}
                    >
                      tune
                    </span>
                    Filters
                  </h3>
                  {hasSidebarFilters && (
                    <button
                      onClick={clearSidebarFilters}
                      style={{
                        fontSize: "0.8rem",
                        color: "#dc2626",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontWeight: 600,
                        padding: "0.25rem 0.5rem",
                        borderRadius: "6px",
                        transition: "background 0.2s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#fef2f2";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "none";
                      }}
                    >
                      Clear All
                    </button>
                  )}
                </div>

                {/* Suggested For You */}
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
                    Suggested For You
                  </h4>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.625rem",
                      padding: "0.4rem 0.5rem",
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
                      checked={showPopularOnly}
                      onChange={() => setShowPopularOnly(!showPopularOnly)}
                      style={{
                        width: "16px",
                        height: "16px",
                        accentColor: "#3b82f6",
                        cursor: "pointer",
                      }}
                    />
                    <span>🔥 Popular Hotels</span>
                  </label>
                </div>

                {/* Price Per Night */}
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
                    Guest Rating
                  </h4>
                  {RATING_OPTIONS.map((opt) => (
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
                        checked={selectedRatings.includes(opt.value)}
                        onChange={() => toggleRating(opt.value)}
                        style={{
                          width: "16px",
                          height: "16px",
                          accentColor: "#3b82f6",
                          cursor: "pointer",
                        }}
                      />
                      <span>{opt.label} & Up</span>
                      <span
                        style={{
                          marginLeft: "auto",
                          fontSize: "0.75rem",
                          color: "#9ca3af",
                        }}
                      >
                        ({ratingCounts[opt.value] || 0})
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
        
        /* Hotels Two-Column Layout */
        .hotels-layout {
          display: flex;
          gap: 1.5rem;
          margin-top: 1rem;
          align-items: flex-start;
        }
        
        .hotels-main {
          flex: 1 1 0%;
          min-width: 0;
        }
        
        .filter-sidebar {
          width: 320px;
          flex-shrink: 0;
          position: sticky;
          top: 5rem;
          max-height: calc(100vh - 6rem);
          overflow-y: auto;
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        
        .filter-sidebar::-webkit-scrollbar {
          width: 4px;
        }
        
        .filter-sidebar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        
        @media (max-width: 1100px) {
          .filter-sidebar {
            width: 280px;
          }
        }
        
        @media (max-width: 868px) {
          .hotels-layout {
            flex-direction: column !important;
          }
          .filter-sidebar {
            display: none !important;
          }
          .hotels-main {
            width: 100% !important;
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
        
        /* Force Light Mode for Hotel Cards */
        @media (prefers-color-scheme: dark) {
          .hotel-card {
            background: #ffffff !important;
            border-color: rgba(0, 0, 0, 0.08) !important;
          }
          
          .hotel-card h3 {
            color: #1f2937 !important;
          }
          
          .hotel-card p {
            color: #6b7280 !important;
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

export default function Hotels() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh" }} />}>
      <HotelsContent />
    </Suspense>
  );
}
