"use client";

import { useEffect, useMemo, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "../../components/Header";

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
  type?: "hotel" | "homestay";
  propertyType?: string;
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
  const typeValue = (hotel as any).type || (hotel as any).propertyType;
  const normalizedType = typeValue ? String(typeValue).toLowerCase() : "hotel";
  const imageSrc = hotel.image ?? (hotel as any).images?.[0] ?? "";
  return {
    _id: typeof rawId === "string" ? rawId : rawId ? String(rawId) : undefined,
    name: hotel.name ?? "",
    location: hotel.location ?? "",
    price: Number((hotel as { price?: unknown }).price ?? 0) || 0,
    rating: Number((hotel as { rating?: unknown }).rating ?? 0) || 0,
    reviews: Number((hotel as { reviews?: unknown }).reviews ?? 0) || 0,
    image: imageSrc || "https://via.placeholder.com/220x180?text=Hotel+Image",
    amenities: Array.isArray(hotel.amenities) ? hotel.amenities : [],
    popular: typeof hotel.popular === "boolean" ? hotel.popular : false,
    active: typeof hotel.active === "boolean" ? hotel.active : true,
    hostName: hotel.hostName ?? "",
    hostEmail: hotel.hostEmail ?? "",
    hostPhone: hotel.hostPhone ?? "",
    type: normalizedType as Hotel["type"],
    propertyType: normalizedType,
  };
};

const normalizeHomestay = (homestay: any): Hotel => {
  const rawId = homestay._id;
  const normalizedType = "homestay";
  const imageSrc = homestay.image ?? homestay.images?.[0] ?? "";
  return {
    _id: typeof rawId === "string" ? rawId : rawId ? String(rawId) : undefined,
    name: homestay.name ?? homestay.propertyName ?? "",
    location: homestay.location ?? homestay.address ?? "",
    price: Number(homestay.price ?? homestay.rooms?.[0]?.price ?? 0) || 0,
    rating: Number(homestay.rating ?? 4.5) || 0,
    reviews: Number(homestay.reviews ?? 0) || 0,
    image:
      imageSrc || "https://via.placeholder.com/220x180?text=Homestay+Image",
    amenities: Array.isArray(homestay.amenities) ? homestay.amenities : [],
    popular: Boolean(homestay.popular),
    active: true,
    hostName: homestay.hostName ?? "",
    hostEmail: homestay.hostEmail ?? "",
    hostPhone: homestay.hostPhone ?? "",
    type: normalizedType,
    propertyType: normalizedType,
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
  { label: "5 Star", value: 5, minRating: 4.5, maxRating: 5.01 },
  { label: "4 Star", value: 4, minRating: 3.5, maxRating: 4.5 },
  { label: "3 Star", value: 3, minRating: 2.5, maxRating: 3.5 },
];

// Top attractions data - can be fetched from API
const ATTRACTIONS = {
  Goa: [
    "Baga Beach",
    "Fort Aguada",
    "Calangute Beach",
    "Panjim Old Town",
    "Dudhsagar Waterfall",
  ],
  Mumbai: [
    "Gateway of India",
    "Marine Drive",
    "Taj Mahal Hotel",
    "Colaba Causeway",
    "Juhu Beach",
  ],
  Delhi: [
    "Red Fort",
    "India Gate",
    "Jama Masjid",
    "Humayun's Tomb",
    "Raj Ghat",
  ],
  Jaipur: [
    "City Palace",
    "Hawa Mahal",
    "Jantar Mantar",
    "Albert Hall Museum",
    "Govind Dev Ji Temple",
  ],
  Bangalore: [
    "Vidhana Soudha",
    "Cubbon Park",
    "Lalbagh Botanical Garden",
    "Tipu Sultan's Summer Palace",
    "Indira Nagar Layout",
  ],
  Hyderabad: [
    "Charminar",
    "Hussain Sagar Lake",
    "Golconda Fort",
    "Mecca Masjid",
    "Qutb Shahi Tombs",
  ],
  Pune: [
    "Shaniwarwada Fort",
    "Aga Khan Palace",
    "Osho Ashram",
    "Parvati Hill",
    "Rajgad Fort",
  ],
  Kolkata: [
    "Victoria Memorial",
    "Howrah Bridge",
    "St. Paul's Cathedral",
    "Indian Museum",
    "Dakshineswar Temple",
  ],
} as const;

export default function HotelSearch() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HotelSearchContent />
    </Suspense>
  );
}

function HotelSearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Initialize filters from URL params or defaults
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
    location: searchParams.get("location") || "",
    checkIn: searchParams.get("checkIn") || getTodayDate(),
    checkOut: searchParams.get("checkOut") || getTwoDaysLater(),
    guests: searchParams.get("guests") || "2",
    rooms: searchParams.get("rooms") || "1",
    priceRange: searchParams.get("priceRange") || "all",
    rating: "all",
    amenities: [] as string[],
  });

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [selectedStars, setSelectedStars] = useState<number[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
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
  const clearSidebarFilters = () => {
    setSelectedStars([]);
    setSelectedPriceRanges([]);
    setSelectedAmenities([]);
    setShowPopularOnly(false);
  };
  const [isSearchBarSticky, setIsSearchBarSticky] = useState(false);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("down");
  const [lastScrollY, setLastScrollY] = useState(0);
  const initialType =
    (searchParams.get("type") as "hotels" | "homestays") || "hotels";
  const [propertyType, setPropertyType] = useState<"hotels" | "homestays">(
    initialType,
  );
  const [destinationData, setDestinationData] = useState<any>(null);
  const [allDestinations, setAllDestinations] = useState<any[]>([]);
  const [destinationTabActive, setDestinationTabActive] = useState<
    "topDestinations" | "topAttractions" | "thingsToDo"
  >("topDestinations");

  // Fetch hotel-destinations
  useEffect(() => {
    const fetchDestinations = async () => {
      try {
        const response = await fetch("/api/hotel-destinations", {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setAllDestinations(data || []);
        }
      } catch (error) {
        console.error("Failed to fetch destinations:", error);
      }
    };
    fetchDestinations();
  }, []);

  // Fetch hotels and homestays so the search page can toggle between both
  useEffect(() => {
    const fetchHotelsAndHomestays = async () => {
      setLoading(true);
      try {
        const [hotelsRes, homestaysRes] = await Promise.all([
          fetch("/api/hotels", { cache: "no-store" }),
          fetch("/api/homestays", { cache: "no-store" }),
        ]);

        const hotelsData = hotelsRes.ok ? await hotelsRes.json() : [];
        const homestaysData = homestaysRes.ok ? await homestaysRes.json() : [];

        const normalizedHotels = (
          Array.isArray(hotelsData) ? hotelsData : []
        ).map((item) => normalizeHotel(item));
        const normalizedHomestays = (
          Array.isArray(homestaysData) ? homestaysData : []
        ).map((item) => normalizeHomestay(item));

        setHotels([...normalizedHotels, ...normalizedHomestays]);
      } catch (error) {
        console.error("Failed to fetch hotels/homestays:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHotelsAndHomestays();
  }, []);

  // Handle scroll event for sticky header
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Detect scroll direction
      if (currentScrollY > lastScrollY) {
        // Scrolling down
        setScrollDirection("down");
      } else {
        // Scrolling up
        setScrollDirection("up");
      }

      // Make search bar sticky after scrolling 150px down
      // But only if scrolling down
      if (currentScrollY > 150 && scrollDirection === "down") {
        setIsSearchBarSticky(true);
      } else if (currentScrollY < 100) {
        // Return to normal when near top
        setIsSearchBarSticky(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, scrollDirection]);

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
      5: hotels.filter((h) => h.rating >= 4.5).length,
      4: hotels.filter((h) => h.rating >= 3.5 && h.rating < 4.5).length,
      3: hotels.filter((h) => h.rating >= 2.5 && h.rating < 3.5).length,
    }),
    [hotels],
  );

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
    showPopularOnly;

  // Filter hotels based on search criteria
  const filteredHotels = useMemo(() => {
    return hotels
      .filter((hotel) => {
        const itemType =
          (hotel as any).type || (hotel as any).propertyType || "hotel";
        const normalizedType = String(itemType).toLowerCase();
        const propertyTypeMatch =
          propertyType === "hotels"
            ? normalizedType !== "homestay"
            : normalizedType === "homestay";

        const matchesLocation = filters.location
          ? hotel.location
              .toLowerCase()
              .includes(filters.location.toLowerCase())
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

        const matchesRating = (() => {
          if (filters.rating === "all") return true;
          const minRating = parseFloat(filters.rating);
          return hotel.rating >= minRating;
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
        const matchesPopular = !showPopularOnly || hotel.popular;

        return (
          propertyTypeMatch &&
          matchesLocation &&
          matchesPrice &&
          matchesRating &&
          matchesSidebarPrice &&
          matchesStars &&
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
    filters,
    hotels,
    sortBy,
    propertyType,
    selectedStars,
    selectedPriceRanges,
    selectedAmenities,
    showPopularOnly,
  ]);

  // Get destination data based on search location
  const getDestinationData = () => {
    if (!filters.location || !allDestinations.length) return null;

    const searchLocation = filters.location.toLowerCase();
    const destination = allDestinations.find((d) => {
      const stateName = d.stateName?.toLowerCase() || "";
      const cityName = d.cityName?.toLowerCase() || "";
      const areas = d.areas?.map((a: any) => a.name.toLowerCase()) || [];
      const subareas =
        d.areas?.flatMap((a: any) =>
          (a.subareas || []).map((s: any) => s.name.toLowerCase()),
        ) || [];

      return (
        stateName.includes(searchLocation) ||
        cityName.includes(searchLocation) ||
        areas.some((area: string) => area.includes(searchLocation)) ||
        subareas.some((subarea: string) => subarea.includes(searchLocation)) ||
        searchLocation.includes(stateName) ||
        searchLocation.includes(cityName)
      );
    });

    if (!destination) return null;

    // Determine what level of data to show
    if (searchLocation.includes(destination.stateName?.toLowerCase() || "")) {
      // Show state level data
      return {
        type: "state",
        name: destination.stateName,
        data: destination.stateData,
      };
    } else if (
      searchLocation.includes(destination.cityName?.toLowerCase() || "")
    ) {
      // Show city level data
      return {
        type: "city",
        name: destination.cityName,
        data: destination.cityData,
      };
    } else {
      // Show area/subarea level data
      const area = destination.areas?.find(
        (a: any) =>
          a.name.toLowerCase().includes(searchLocation) ||
          searchLocation.includes(a.name.toLowerCase()),
      );

      if (area) {
        const subarea = area.subareas?.find(
          (s: any) =>
            s.name.toLowerCase().includes(searchLocation) ||
            searchLocation.includes(s.name.toLowerCase()),
        );

        return {
          type: subarea ? "subarea" : "area",
          name: subarea?.name || area.name,
          data: subarea || area,
        };
      }
    }

    return null;
  };

  const destinationInfo = getDestinationData();

  // Get attractions for the searched location
  const getAttractions = () => {
    if (!filters.location) return [];
    for (const [key, value] of Object.entries(ATTRACTIONS)) {
      if (
        filters.location.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(filters.location.toLowerCase())
      ) {
        return value;
      }
    }
    return [];
  };

  const attractions = getAttractions();

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-white">
      <div
        style={{
          opacity: isSearchBarSticky ? 0 : 1,
          visibility: isSearchBarSticky ? "hidden" : "visible",
          transform: isSearchBarSticky ? "translateY(-100%)" : "translateY(0)",
          transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "top",
        }}
      >
        <Header currentPage="hotels" />
      </div>

      <main
        className="flex flex-col items-center w-full justify-center"
        style={{ minHeight: "100vh" }}
      >
        {/* Search Bar at Top - Secondary Header */}
        <div
          id="searchBarSection"
          style={{
            width: "100vw",
            marginLeft: "calc(-50vw + 50%)",
            background: "white",
            padding: isSearchBarSticky ? "0.75rem 1.5rem" : "1.25rem 1.5rem",
            marginBottom: "2rem",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 50,
            boxShadow: isSearchBarSticky
              ? "0 4px 20px rgba(0, 0, 0, 0.1)"
              : "0 1px 4px rgba(0, 0, 0, 0.06)",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          <div
            style={{
              maxWidth: "1400px",
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              background: "#f8fafc",
              borderRadius: "16px",
              padding: "0.5rem",
              border: "1.5px solid #e2e8f0",
              transition: "all 0.3s ease",
            }}
          >
            {/* Destination */}
            <div style={{ flex: 1.5, minWidth: 0, position: "relative" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 1rem",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
                  cursor: "text",
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
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
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
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
            <div style={{ flex: 0.8, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
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
            <div style={{ flex: 0.7, minWidth: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 0.75rem",
                  borderRadius: "12px",
                  transition: "all 0.3s ease",
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

            {/* Property Type Toggle */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.6rem 0.75rem",
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: propertyType === "hotels" ? "#0066cc" : "#ea580c",
                  whiteSpace: "nowrap",
                  transition: "color 0.3s ease",
                }}
              >
                {propertyType === "hotels" ? "Hotels" : "Homestays"}
              </span>
              <button
                onClick={() =>
                  setPropertyType(
                    propertyType === "hotels" ? "homestays" : "hotels",
                  )
                }
                style={{
                  width: "48px",
                  height: "26px",
                  borderRadius: "13px",
                  border: "none",
                  background:
                    propertyType === "hotels"
                      ? "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)"
                      : "linear-gradient(135deg, #f97316 0%, #ea580c 100%)",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.3s ease",
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "11px",
                    background: "white",
                    position: "absolute",
                    top: "2px",
                    left: propertyType === "hotels" ? "2px" : "24px",
                    transition: "left 0.3s ease",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.2)",
                  }}
                />
              </button>
            </div>

            {/* Search Button */}
            <button
              style={{
                padding: "0.7rem 1.75rem",
                background: "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontSize: "0.9rem",
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 2px 8px rgba(0, 102, 204, 0.3)",
                flexShrink: 0,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.03)";
                e.currentTarget.style.boxShadow =
                  "0 4px 16px rgba(0, 102, 204, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "scale(1)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0, 102, 204, 0.3)";
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

        {/* Top Attractions Section OR Featured Destinations */}
        {attractions.length > 0 ? (
          <div
            style={{
              width: "100%",
              maxWidth: "1400px",
              padding: "0 1.5rem",
              marginBottom: "2rem",
              opacity: isSearchBarSticky ? 0.7 : 1,
              transform: isSearchBarSticky
                ? "translateY(-20px) scale(0.98)"
                : "translateY(0) scale(1)",
              transition:
                "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              pointerEvents: "auto",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderRadius: "16px",
                padding: "2rem",
                color: "white",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginBottom: "1.5rem",
                }}
              >
                {destinationInfo?.type === "state"
                  ? `Top Destinations in ${destinationInfo?.name}`
                  : destinationInfo?.type === "city"
                    ? `Things to Do in ${destinationInfo?.name}`
                    : `Attractions in ${destinationInfo?.name}`}
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "1rem",
                }}
              >
                {destinationInfo ? (
                  <>
                    {/* State Level: Top Destinations */}
                    {destinationInfo.type === "state" &&
                      destinationInfo.data?.topDestinations?.map(
                        (item: any, index: number) => (
                          <div
                            key={index}
                            style={{
                              background: "rgba(255, 255, 255, 0.1)",
                              backdropFilter: "blur(10px)",
                              borderRadius: "12px",
                              padding: "1rem",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "1.5rem" }}
                            >
                              star
                            </span>
                            <div>
                              <div style={{ fontWeight: 600 }}>{item.name}</div>
                              {item.description && (
                                <div
                                  style={{
                                    fontSize: "0.8rem",
                                    opacity: 0.85,
                                  }}
                                >
                                  {item.description.substring(0, 50)}...
                                </div>
                              )}
                            </div>
                          </div>
                        ),
                      )}

                    {/* City Level: Things to Do */}
                    {destinationInfo.type === "city" &&
                      destinationInfo.data?.thingsToDo?.map(
                        (item: any, index: number) => (
                          <div
                            key={index}
                            style={{
                              background: "rgba(255, 255, 255, 0.1)",
                              backdropFilter: "blur(10px)",
                              borderRadius: "12px",
                              padding: "1rem",
                              border: "1px solid rgba(255, 255, 255, 0.2)",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.75rem",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "1.5rem" }}
                            >
                              place
                            </span>
                            <div>
                              <div style={{ fontWeight: 600 }}>{item.name}</div>
                              {item.description && (
                                <div
                                  style={{
                                    fontSize: "0.8rem",
                                    opacity: 0.85,
                                  }}
                                >
                                  {item.description.substring(0, 50)}...
                                </div>
                              )}
                            </div>
                          </div>
                        ),
                      )}

                    {/* Area/Subarea Level: Top Attractions */}
                    {(destinationInfo.type === "area" ||
                      destinationInfo.type === "subarea") &&
                      (
                        destinationInfo.data?.topAttractions ||
                        destinationInfo.data?.famousAttractions ||
                        []
                      )?.map((item: any, index: number) => (
                        <div
                          key={index}
                          style={{
                            background: "rgba(255, 255, 255, 0.1)",
                            backdropFilter: "blur(10px)",
                            borderRadius: "12px",
                            padding: "1rem",
                            border: "1px solid rgba(255, 255, 255, 0.2)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "1.5rem" }}
                          >
                            star
                          </span>
                          <div>
                            <div style={{ fontWeight: 600 }}>{item.name}</div>
                            {item.description && (
                              <div
                                style={{
                                  fontSize: "0.8rem",
                                  opacity: 0.85,
                                }}
                              >
                                {item.description.substring(0, 50)}...
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </>
                ) : (
                  attractions.map((attraction, index) => (
                    <div
                      key={index}
                      style={{
                        background: "rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(10px)",
                        borderRadius: "12px",
                        padding: "1rem",
                        border: "1px solid rgba(255, 255, 255, 0.2)",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.75rem",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "1.5rem" }}
                      >
                        star
                      </span>
                      <span style={{ fontWeight: 600 }}>{attraction}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              maxWidth: "1400px",
              padding: "0 1.5rem",
              marginBottom: "2rem",
              opacity: isSearchBarSticky ? 0.7 : 1,
              transform: isSearchBarSticky
                ? "translateY(-20px) scale(0.98)"
                : "translateY(0) scale(1)",
              transition:
                "opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1), transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          >
            <div
              style={{
                background: "linear-gradient(135deg, #E0F6FF 0%, #B0E0E6 100%)",
                borderRadius: "16px",
                padding: "2rem",
                color: "#1f2937",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  marginBottom: "1.5rem",
                }}
              >
                Explore Destinations
              </h2>

              {/* Tab Buttons */}
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginBottom: "1.5rem",
                  flexWrap: "wrap",
                }}
              >
                <button
                  type="button"
                  onClick={() => setDestinationTabActive("topDestinations")}
                  style={{
                    padding: "0.6rem 1.2rem",
                    background:
                      destinationTabActive === "topDestinations"
                        ? "#667eea"
                        : "rgba(102, 126, 234, 0.15)",
                    border: "1px solid #667eea",
                    borderRadius: "8px",
                    color:
                      destinationTabActive === "topDestinations"
                        ? "white"
                        : "#1f2937",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (destinationTabActive !== "topDestinations") {
                      e.currentTarget.style.background =
                        "rgba(102, 126, 234, 0.25)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (destinationTabActive !== "topDestinations") {
                      e.currentTarget.style.background =
                        "rgba(102, 126, 234, 0.15)";
                    }
                  }}
                >
                  🏛️ Top Destinations
                </button>
                <button
                  type="button"
                  onClick={() => setDestinationTabActive("topAttractions")}
                  style={{
                    padding: "0.6rem 1.2rem",
                    background:
                      destinationTabActive === "topAttractions"
                        ? "#667eea"
                        : "rgba(102, 126, 234, 0.15)",
                    border: "1px solid #667eea",
                    borderRadius: "8px",
                    color:
                      destinationTabActive === "topAttractions"
                        ? "white"
                        : "#1f2937",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (destinationTabActive !== "topAttractions") {
                      e.currentTarget.style.background =
                        "rgba(102, 126, 234, 0.25)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (destinationTabActive !== "topAttractions") {
                      e.currentTarget.style.background =
                        "rgba(102, 126, 234, 0.15)";
                    }
                  }}
                >
                  ✨ Top Attractions
                </button>
                <button
                  type="button"
                  onClick={() => setDestinationTabActive("thingsToDo")}
                  style={{
                    padding: "0.6rem 1.2rem",
                    background:
                      destinationTabActive === "thingsToDo"
                        ? "#667eea"
                        : "rgba(102, 126, 234, 0.15)",
                    border: "1px solid #667eea",
                    borderRadius: "8px",
                    color:
                      destinationTabActive === "thingsToDo"
                        ? "white"
                        : "#1f2937",
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (destinationTabActive !== "thingsToDo") {
                      e.currentTarget.style.background =
                        "rgba(102, 126, 234, 0.25)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (destinationTabActive !== "thingsToDo") {
                      e.currentTarget.style.background =
                        "rgba(102, 126, 234, 0.15)";
                    }
                  }}
                >
                  🎯 Things to Do
                </button>
              </div>

              {/* Content Carousel */}
              {(() => {
                let allItems: any[] = [];

                if (filters.location && destinationInfo) {
                  if (destinationInfo.type === "state") {
                    if (destinationTabActive === "topDestinations") {
                      allItems = destinationInfo.data?.topDestinations || [];
                    } else if (destinationTabActive === "topAttractions") {
                      allItems = destinationInfo.data?.topAttractions || [];
                    } else if (destinationTabActive === "thingsToDo") {
                      allItems = destinationInfo.data?.thingsToDo || [];
                    }
                  } else if (destinationInfo.type === "city") {
                    if (destinationTabActive === "topDestinations") {
                      allItems = destinationInfo.data?.topDestinations || [];
                    } else if (destinationTabActive === "topAttractions") {
                      allItems =
                        destinationInfo.data?.topAttractions ||
                        destinationInfo.data?.famousAttractions ||
                        [];
                    } else if (destinationTabActive === "thingsToDo") {
                      allItems = destinationInfo.data?.thingsToDo || [];
                    }
                  } else if (
                    destinationInfo.type === "area" ||
                    destinationInfo.type === "subarea"
                  ) {
                    if (destinationTabActive === "topDestinations") {
                      allItems = destinationInfo.data?.topDestinations || [];
                    } else if (destinationTabActive === "topAttractions") {
                      allItems =
                        destinationInfo.data?.topAttractions ||
                        destinationInfo.data?.famousAttractions ||
                        [];
                    } else if (destinationTabActive === "thingsToDo") {
                      allItems = destinationInfo.data?.thingsToDo || [];
                    }
                  }
                } else if (allDestinations.length > 0) {
                  allDestinations.forEach((dest) => {
                    let items: any[] = [];
                    if (destinationTabActive === "topDestinations") {
                      items = dest.stateData?.topDestinations || [];
                    } else if (destinationTabActive === "topAttractions") {
                      items = dest.stateData?.topAttractions || [];
                    } else if (destinationTabActive === "thingsToDo") {
                      items = dest.cityData?.thingsToDo || [];
                    }
                    allItems.push(...items);
                  });
                }

                const useCarousel = allItems.length >= 10;

                return allItems.length > 0 ? (
                  <div
                    style={{
                      display: useCarousel ? "flex" : "grid",
                      gridTemplateColumns: useCarousel
                        ? undefined
                        : "repeat(auto-fill, minmax(280px, 1fr))",
                      overflowX: useCarousel ? "auto" : undefined,
                      gap: "1.5rem",
                      paddingBottom: useCarousel ? "0.5rem" : undefined,
                      scrollBehavior: "smooth",
                    }}
                  >
                    {allItems.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        style={{
                          background: "white",
                          borderRadius: "16px",
                          overflow: "hidden",
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          cursor: "pointer",
                          transition:
                            "transform 0.3s ease, box-shadow 0.3s ease",
                          flex: useCarousel ? "0 0 280px" : undefined,
                          minWidth: useCarousel ? "280px" : undefined,
                        }}
                        onClick={() => {
                          router.push(
                            `/destinations/${encodeURIComponent(item.name)}`,
                          );
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-8px)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 24px rgba(0, 0, 0, 0.15)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 12px rgba(0, 0, 0, 0.1)";
                        }}
                      >
                        {/* Image Container */}
                        <div
                          style={{
                            height: "160px",
                            overflow: "hidden",
                            background: "#f0f0f0",
                          }}
                        >
                          <img
                            src={
                              item.images && item.images.length > 0
                                ? item.images[0]
                                : `https://via.placeholder.com/400x300?text=${encodeURIComponent(item.name)}`
                            }
                            alt={item.name}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                            }}
                            onError={(e) => {
                              e.currentTarget.src =
                                "https://via.placeholder.com/400x300?text=" +
                                encodeURIComponent(item.name);
                            }}
                          />
                        </div>

                        {/* Content */}
                        <div style={{ padding: "1.5rem" }}>
                          <h3
                            style={{
                              fontSize: "1.2rem",
                              fontWeight: 700,
                              marginBottom: "0.5rem",
                              color: "#1f2937",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {item.name}
                          </h3>

                          {item.description && (
                            <p
                              style={{
                                fontSize: "0.85rem",
                                color: "#6b7280",
                                marginBottom: "0.75rem",
                                lineHeight: "1.4",
                                display: "-webkit-box",
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: "vertical",
                                overflow: "hidden",
                              }}
                            >
                              {item.description}
                            </p>
                          )}

                          {item.images && item.images.length > 0 && (
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                                fontSize: "0.8rem",
                                color: "#9ca3af",
                                paddingTop: "0.75rem",
                                borderTop: "1px solid #e5e7eb",
                              }}
                            >
                              <span>📷 {item.images.length} images</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      paddingTop: "2rem",
                      paddingRight: "2rem",
                      paddingBottom: "2rem",
                      paddingLeft: "2rem",
                      gridColumn: "1 / -1",
                    }}
                  >
                    <p>
                      No{" "}
                      {destinationTabActive === "topDestinations"
                        ? "top destinations"
                        : destinationTabActive === "topAttractions"
                          ? "top attractions"
                          : "things to do"}{" "}
                      {filters.location
                        ? `available for ${filters.location}`
                        : "configured yet."}
                      .
                    </p>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Main Content - Hotels List + Filters Layout */}
        <div
          className="search-main-layout"
          style={{
            width: "100%",
            maxWidth: "1400px",
            padding: "4rem 1.5rem",
            marginBottom: "2rem",
            display: "grid",
            gridTemplateColumns: "1fr 320px",
            gap: "1.5rem",
            transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        >
          {/* LEFT: Hotels List */}
          <div>
            {/* Results Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1.5rem",
                flexWrap: "wrap",
                gap: "1rem",
              }}
            >
              <div>
                <h2
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 700,
                    color: "#1f2937",
                    marginBottom: "0.25rem",
                  }}
                >
                  {filters.location
                    ? `${propertyType === "hotels" ? "Hotels" : "Homestays"} in ${filters.location}`
                    : `All Available ${propertyType === "hotels" ? "Hotels" : "Homestays"}`}
                </h2>
                <p
                  style={{
                    fontSize: "0.9rem",
                    color: "#64748b",
                  }}
                >
                  {filteredHotels.length}{" "}
                  {filteredHotels.length === 1
                    ? propertyType === "hotels"
                      ? "hotel"
                      : "homestay"
                    : propertyType === "hotels"
                      ? "hotels"
                      : "homestays"}{" "}
                  available for{" "}
                  {new Date(filters.checkIn).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })}{" "}
                  -{" "}
                  {new Date(filters.checkOut).toLocaleDateString("en-IN", {
                    month: "short",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* Sort Dropdown */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: "0.75rem 1rem",
                  borderRadius: "12px",
                  border: "2px solid #e2e8f0",
                  fontSize: "0.9rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  backgroundColor: "#f8fafc",
                  color: "#1e293b",
                }}
              >
                <option value="featured">Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>

            {/* Hotels List */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}
            >
              {loading ? (
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
              ) : filteredHotels.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "3rem",
                    fontSize: "1rem",
                    color: "#64748b",
                    background: "#f8fafc",
                    borderRadius: "12px",
                    border: "2px dashed #cbd5e1",
                  }}
                >
                  No hotels found matching your criteria
                </div>
              ) : (
                filteredHotels.map((hotel) => (
                  <a
                    key={hotel._id || hotel.name}
                    href={`/hotels/${hotel._id || encodeURIComponent(hotel.name)}`}
                    style={{
                      display: "flex",
                      gap: "1.5rem",
                      padding: "1.5rem",
                      background: "white",
                      borderRadius: "12px",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
                      transition:
                        "all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                      cursor: "pointer",
                      textDecoration: "none",
                      color: "inherit",
                      willChange: "transform, box-shadow, border-color",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 8px 20px rgba(0, 0, 0, 0.12)";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.borderColor = "#bfdbfe";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0, 0, 0, 0.05)";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                  >
                    {/* Hotel Image */}
                    <div
                      style={{
                        flex: "0 0 220px",
                        borderRadius: "12px",
                        overflow: "hidden",
                        height: "180px",
                      }}
                    >
                      <img
                        src={
                          hotel.image ||
                          "https://via.placeholder.com/220x180?text=Hotel+Image"
                        }
                        alt={hotel.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/220x180?text=Hotel+Image";
                        }}
                      />
                    </div>

                    {/* Hotel Details */}
                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      {/* Top Info */}
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "start",
                            marginBottom: "0.75rem",
                            gap: "1rem",
                          }}
                        >
                          <div>
                            <h3
                              style={{
                                fontSize: "1.1rem",
                                fontWeight: 700,
                                color: "#1f2937",
                                marginBottom: "0.25rem",
                              }}
                            >
                              {hotel.name}
                            </h3>
                            <p
                              style={{
                                fontSize: "0.9rem",
                                color: "#6b7280",
                                display: "flex",
                                alignItems: "center",
                                gap: "0.5rem",
                              }}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{ fontSize: "1rem" }}
                              >
                                location_on
                              </span>
                              {hotel.location}
                            </p>
                          </div>

                          {/* Price */}
                          <div
                            style={{
                              textAlign: "right",
                            }}
                          >
                            <div
                              style={{
                                fontSize: "1.3rem",
                                fontWeight: 700,
                                color: "#059669",
                              }}
                            >
                              {formatInr(hotel.price)}
                            </div>
                            <p
                              style={{
                                fontSize: "0.8rem",
                                color: "#6b7280",
                              }}
                            >
                              per night
                            </p>
                          </div>
                        </div>

                        {/* Amenities */}
                        {hotel.amenities && hotel.amenities.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "0.5rem",
                              marginBottom: "0.75rem",
                            }}
                          >
                            {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                              <span
                                key={idx}
                                style={{
                                  fontSize: "0.8rem",
                                  background: "#f0fdf4",
                                  color: "#059669",
                                  padding: "0.25rem 0.75rem",
                                  borderRadius: "20px",
                                  border: "1px solid #bbf7d0",
                                  fontWeight: 500,
                                }}
                              >
                                {amenity}
                              </span>
                            ))}
                            {hotel.amenities.length > 3 && (
                              <span
                                style={{
                                  fontSize: "0.8rem",
                                  color: "#6b7280",
                                  padding: "0.25rem 0.75rem",
                                }}
                              >
                                +{hotel.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Bottom Info */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        {/* Rating */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "1rem",
                              fontWeight: 700,
                              color: "#f59e0b",
                            }}
                          >
                            ★
                          </span>
                          <span
                            style={{
                              fontSize: "0.9rem",
                              fontWeight: 600,
                              color: "#1f2937",
                            }}
                          >
                            {hotel.rating.toFixed(1)}
                          </span>
                          <span
                            style={{
                              fontSize: "0.8rem",
                              color: "#6b7280",
                            }}
                          >
                            ({hotel.reviews} reviews)
                          </span>
                        </div>

                        {/* View Button */}
                        <button
                          style={{
                            padding: "0.5rem 1.25rem",
                            background:
                              "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                          }}
                          onClick={(e) => {
                            e.preventDefault();
                            window.location.href = `/hotels/${
                              hotel._id || encodeURIComponent(hotel.name)
                            }`;
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 12px rgba(0, 102, 204, 0.3)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow = "none";
                          }}
                        >
                          View Details
                        </button>
                      </div>
                    </div>
                  </a>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Advanced Filters Sidebar */}
          <div
            className="search-filter-sidebar"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0",
              position: "sticky",
              top: "5rem",
              maxHeight: "calc(100vh - 6rem)",
              overflowY: "auto",
            }}
          >
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

              {/* Amenities */}
              {allAmenities.length > 0 && (
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

              {/* Search Tips */}
              <div
                style={{
                  background:
                    "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)",
                  borderRadius: "10px",
                  padding: "1rem",
                  border: "1px solid #bae6fd",
                }}
              >
                <h4
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: 700,
                    color: "#0369a1",
                    marginBottom: "0.5rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1rem" }}
                  >
                    info
                  </span>
                  Tips
                </h4>
                <ul
                  style={{
                    fontSize: "0.8rem",
                    color: "#0c4a6e",
                    lineHeight: "1.6",
                    paddingLeft: "1.25rem",
                    margin: 0,
                  }}
                >
                  <li>Adjust dates for better prices</li>
                  <li>Filter by rating for quality</li>
                  <li>Compare amenities & reviews</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        /* Filter Sidebar Scrollbar */
        .search-filter-sidebar {
          scrollbar-width: thin;
          scrollbar-color: #cbd5e1 transparent;
        }
        .search-filter-sidebar::-webkit-scrollbar {
          width: 4px;
        }
        .search-filter-sidebar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }

        @media (max-width: 868px) {
          .search-filter-sidebar {
            display: none !important;
          }
          .search-main-layout {
            grid-template-columns: 1fr !important;
          }
        }

        /* Carousel Scrollbar Styling */
        div[style*="overflowX: auto"] {
          scroll-snap-type: x mandatory;
        }

        div[style*="overflowX: auto"]::-webkit-scrollbar {
          height: 8px;
        }

        div[style*="overflowX: auto"]::-webkit-scrollbar-track {
          background: rgba(102, 126, 234, 0.1);
          border-radius: 10px;
        }

        div[style*="overflowX: auto"]::-webkit-scrollbar-thumb {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 10px;
          transition: background 0.3s ease;
        }

        div[style*="overflowX: auto"]::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(135deg, #764ba2 0%, #667eea 100%);
        }

        /* Firefox Scrollbar */
        div[style*="overflowX: auto"] {
          scrollbar-width: thin;
          scrollbar-color: #667eea rgba(102, 126, 234, 0.1);
        }
      `}</style>
    </div>
  );
}
