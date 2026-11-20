"use client";

import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import HotelAvailabilityCalendar from "../../components/HotelAvailabilityCalendar";
import {
  Sparkles,
  ShieldCheck,
  Users,
  Bed,
  Bath,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  MapPin,
  Star,
  Heart,
  Share2,
  Check,
  CheckCircle2,
  X,
  Camera,
  Send,
  Home,
  DoorOpen,
} from "lucide-react";

const HotelLocationMap = dynamic(() => import("../../components/HotelLocationMap"), {
  ssr: false,
  loading: () => (
    <div
      style={{
        height: "440px",
        background: "#f8fafc",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#64748b",
        border: "1px solid #e2e8f0",
      }}
    >
      Loading map...
    </div>
  ),
});

const CITY_COORDS: Record<string, [number, number]> = {
  dehradun: [30.3165, 78.0322],
  mussoorie: [30.4598, 78.0644],
  rishikesh: [30.0869, 78.2676],
  haridwar: [29.9457, 78.1642],
  nainital: [29.3803, 79.4636],
  jaipur: [26.9124, 75.7873],
  udaipur: [24.5854, 73.7125],
  delhi: [28.6139, 77.209],
  mumbai: [19.076, 72.8777],
  goa: [15.2993, 74.124],
};

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatInr = (val: number) => inrFormatter.format(Math.max(0, Math.round(val)));

export default function HomestayDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const homestayId = params?.id as string;

  const [homestay, setHomestay] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Section Refs for Sticky Tabs
  const [activeTab, setActiveTab] = useState<string>("overview");
  const overviewRef = useRef<HTMLDivElement>(null);
  const amenitiesRef = useRef<HTMLDivElement>(null);
  const ratesRef = useRef<HTMLDivElement>(null);
  const policiesRef = useRef<HTMLDivElement>(null);
  const roomsRef = useRef<HTMLDivElement>(null);
  const availabilityRef = useRef<HTMLDivElement>(null);
  const locationRef = useRef<HTMLDivElement>(null);
  const reviewsRef = useRef<HTMLDivElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  // Lightbox State
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Room modal state
  const [roomForDetails, setRoomForDetails] = useState<any | null>(null);

  // Booking Mode: "homestay" (default) or "room"
  const [bookingMode, setBookingMode] = useState<"homestay" | "room">("homestay");
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);

  // Favorites & Share State
  const [isSaved, setIsSaved] = useState(false);
  const [shareToast, setShareToast] = useState("");

  // Dates & Guests
  const [checkIn, setCheckIn] = useState<string>(searchParams?.get("checkIn") || "");
  const [checkOut, setCheckOut] = useState<string>(searchParams?.get("checkOut") || "");
  const [guestCount, setGuestCount] = useState<number>(Number(searchParams?.get("guests")) || 2);

  // Inquiry Form
  const [inquiryName, setInquiryName] = useState("");
  const [inquiryEmail, setInquiryEmail] = useState("");
  const [inquiryPhone, setInquiryPhone] = useState("");
  const [inquiryMessage, setInquiryMessage] = useState("");
  const [isSubmittingInquiry, setIsSubmittingInquiry] = useState(false);
  const [inquirySuccess, setInquirySuccess] = useState(false);

  // Policies Expand State
  const [expandedPolicies, setExpandedPolicies] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
  });

  const togglePolicy = (idx: number) => {
    setExpandedPolicies((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Fetch Homestay Data
  useEffect(() => {
    if (!homestayId) return;

    let isMounted = true;
    setLoading(true);

    const fetchHomestay = async () => {
      try {
        const res = await fetch(`/api/homestays?id=${homestayId}&t=${Date.now()}`, {
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setHomestay(data);
            if (data.rooms?.[0]?.maxGuests) {
              setGuestCount(data.rooms[0].maxGuests);
            }
            setLoading(false);
          }
        } else {
          throw new Error("Failed to load");
        }
      } catch (err) {
        console.error("Error fetching homestay:", err);
        if (isMounted) setLoading(false);
      }
    };

    fetchHomestay();
    return () => {
      isMounted = false;
    };
  }, [homestayId]);

  // ScrollSpy for Sticky Navigation Tabs
  useEffect(() => {
    const handleScroll = () => {
      const scrollPos = window.scrollY + 130;
      const sections = [
        { id: "overview", ref: overviewRef },
        { id: "amenities", ref: amenitiesRef },
        { id: "rates", ref: ratesRef },
        { id: "policies", ref: policiesRef },
        { id: "rooms", ref: roomsRef },
        { id: "availability", ref: availabilityRef },
        { id: "location", ref: locationRef },
        { id: "reviews", ref: reviewsRef },
        { id: "host", ref: hostRef },
      ];

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = sections[i].ref.current;
        if (el && el.offsetTop <= scrollPos) {
          setActiveTab(sections[i].id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string, ref?: React.RefObject<HTMLDivElement | null>) => {
    setActiveTab(id);
    const targetRef =
      ref ||
      (id === "overview"
        ? overviewRef
        : id === "amenities"
        ? amenitiesRef
        : id === "rates"
        ? ratesRef
        : id === "policies"
        ? policiesRef
        : id === "rooms"
        ? roomsRef
        : id === "availability"
        ? availabilityRef
        : id === "location"
        ? locationRef
        : id === "reviews"
        ? reviewsRef
        : hostRef);

    if (targetRef?.current) {
      const yOffset = -70;
      const y = targetRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // Lightbox keyboard navigation
  const handleNextPhoto = useCallback(() => {
    setActivePhotoIndex((prev) => (prev + 1) % 3);
  }, []);

  const handlePrevPhoto = useCallback(() => {
    setActivePhotoIndex((prev) => (prev - 1 + 3) % 3);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowRight") handleNextPhoto();
      if (e.key === "ArrowLeft") handlePrevPhoto();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen, handleNextPhoto, handlePrevPhoto]);

  // Favorites toggle
  const handleToggleFavorite = () => {
    setIsSaved(!isSaved);
  };

  // Share listing
  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setShareToast("Link copied to clipboard!");
      setTimeout(() => setShareToast(""), 3000);
    }
  };

  // Property details resolution
  const propertyTitle = (homestay?.name || "Villa").trim();
  const propertyType = homestay?.propertyType || "Villa";
  const propertyCity = homestay?.city || "Dehradun";
  const propertyLocation = homestay?.address || "IT-Park, Dehradun, Uttarakhand, India";
  const baseNightlyRate = Number(homestay?.rooms?.[0]?.price || homestay?.price || 1200);

  // Photos resolution
  const rawImages: string[] = useMemo(() => {
    const list: string[] = [];
    if (homestay?.image) list.push(homestay.image);
    if (Array.isArray(homestay?.images)) {
      list.push(...homestay.images);
    }
    const fallbacks = [
      "https://images.unsplash.com/photo-1518241353330-0f7941c2d9b5?auto=format&fit=crop&w=1400&q=80",
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
    ];

    const combined = [...list.filter(Boolean), ...fallbacks];
    return combined.slice(0, 3);
  }, [homestay]);

  // 3 distinct room options with availability counts
  const roomsList = useMemo(() => {
    return [
      {
        id: "room-deluxe-mountain",
        type: "Deluxe Mountain View Suite",
        availabilityCount: 3,
        price: baseNightlyRate,
        originalPrice: Math.round(baseNightlyRate * 1.8),
        maxGuests: 3,
        bedType: "1 King Bed + Balcony",
        size: 320,
        description: "Spacious private suite featuring panoramic views, attached balcony, and modern comforts.",
        amenities: ["Free High-Speed Wi-Fi", "Private Mountain Balcony", "Hot Water Shower", "Air Conditioning"],
        images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80"],
        cancellationPolicy: "Free cancellation up to 24 hours before check-in",
        mealPlan: "Complimentary breakfast & tea included",
        roomView: "Panoramic Mountain & Valley View",
      },
      {
        id: "room-executive-garden",
        type: "Executive Heritage Garden Suite",
        availabilityCount: 2,
        price: Math.round(baseNightlyRate * 1.35),
        originalPrice: Math.round(baseNightlyRate * 2.2),
        maxGuests: 4,
        bedType: "1 King Bed + 1 Daybed",
        size: 440,
        description: "Charming heritage suite with direct courtyard access, study corner, and vintage aesthetics.",
        amenities: ["Courtyard Access", "Dedicated Work Desk", "High-Speed Wi-Fi", "Ensuite Bathtub"],
        images: ["https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80"],
        cancellationPolicy: "Free cancellation up to 24 hours before check-in",
        mealPlan: "Breakfast & evening tea included",
        roomView: "Private Garden & Courtyard View",
      },
      {
        id: "room-family-duplex",
        type: "Family Duplex Attic Suite",
        availabilityCount: 2,
        price: Math.round(baseNightlyRate * 1.7),
        originalPrice: Math.round(baseNightlyRate * 2.8),
        maxGuests: 6,
        bedType: "2 King Beds + Attic Balcony",
        size: 620,
        description: "Expansive 2-level duplex suite ideal for families or traveling groups seeking privacy.",
        amenities: ["Duplex Attic Floor", "Double Ensuite Bathrooms", "Smart TV & Wi-Fi", "Scenic Sunset Balcony"],
        images: ["https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=800&q=80"],
        cancellationPolicy: "Full refund up to 7 days before check-in",
        mealPlan: "Custom home-cooked meals available",
        roomView: "Forest Ridge & Sunset View",
      },
    ];
  }, [baseNightlyRate]);

  // Selected room object (only used when bookingMode === "room")
  const activeRoom = useMemo(() => {
    if (bookingMode === "room" && selectedRoomId) {
      return roomsList.find((r) => r.id === selectedRoomId) || roomsList[0];
    }
    return null;
  }, [bookingMode, selectedRoomId, roomsList]);

  // Active nightly rate: homestay base rate by default, or room price when booking a specific room
  const currentNightlyRate = activeRoom ? activeRoom.price : baseNightlyRate;

  const nightsCount = useMemo(() => {
    if (!checkIn || !checkOut) return 1;
    const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const days = Math.round(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 1;
  }, [checkIn, checkOut]);

  // Handle Enquiry submission
  const handleSendEnquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingInquiry(true);

    try {
      const payload = {
        propertyId: homestayId,
        propertyName: homestay?.name || "Villa",
        bookingType: bookingMode === "room" ? "room" : "entire_homestay",
        roomType: bookingMode === "room" ? activeRoom?.type : "Entire Homestay / Villa",
        checkInDate: checkIn,
        checkOutDate: checkOut,
        guestCount,
        name: inquiryName || "Traveler",
        email: inquiryEmail || "guest@example.com",
        phone: inquiryPhone || "",
        message: inquiryMessage || "",
      };

      await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setIsSubmittingInquiry(false);
      setInquirySuccess(true);
    } catch {
      setIsSubmittingInquiry(false);
      setInquirySuccess(true);
    }
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full flex-col bg-[#f4f5f7] font-sans antialiased text-[#1f2937]">
        <Header currentPage="homestays" />
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-10 h-10 border-3 border-[#0066cc] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-[#64748b]">Loading homestay...</p>
        </div>
      </div>
    );
  }

  const cityKey = propertyCity.toLowerCase().trim();
  const mapCoords: [number, number] =
    homestay?.latitude && homestay?.longitude
      ? [homestay.latitude, homestay.longitude]
      : CITY_COORDS[cityKey] || [30.3165, 78.0322];

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f4f5f7] font-sans antialiased text-[#1f2937]">
      {/* TravelExpertz Header */}
      <Header currentPage="homestays" />

      {/* =========================================================================
          1. TOP BREADCRUMBS, BADGES & PROPERTY HEADER
          ========================================================================= */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "1.25rem 1rem 0", width: "100%" }}>
        {/* Breadcrumb line */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            fontSize: "0.825rem",
            color: "#6b7280",
            marginBottom: "0.75rem",
            flexWrap: "wrap",
          }}
        >
          <Link href="/" style={{ color: "#6b7280", textDecoration: "none" }}>
            Home
          </Link>
          <span>/</span>
          <Link href="/homestays" style={{ color: "#6b7280", textDecoration: "none" }}>
            Vacation Rentals
          </Link>
          <span>/</span>
          <span>India</span>
          <span>/</span>
          <span>{propertyCity}</span>
          <span>/</span>
          <span style={{ color: "#111827", fontWeight: 600 }}>{propertyTitle}</span>
        </div>

        {/* Badges Row (Mint / Teal Pills matching HolidayExpertz) */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", marginBottom: "0.75rem" }}>
          <span
            style={{
              background: "#eff6ff",
              color: "#0066cc",
              border: "1px solid #bfdbfe",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            {propertyType}
          </span>
          <span
            style={{
              background: "#f0fdf4",
              color: "#166534",
              border: "1px solid #bbf7d0",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            ✓ Approved
          </span>
          <span
            style={{
              background: "#eff6ff",
              color: "#0066cc",
              border: "1px solid #bfdbfe",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            ✓ Verified Property
          </span>
          <span
            style={{
              background: "#eff6ff",
              color: "#0066cc",
              border: "1px solid #bfdbfe",
              padding: "0.25rem 0.75rem",
              borderRadius: "9999px",
              fontSize: "0.75rem",
              fontWeight: 600,
            }}
          >
            0% Traveler Service Fee
          </span>
        </div>

        {/* Title, Subtitle & Action Buttons */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "clamp(1.75rem, 2.5vw, 2.25rem)",
                fontWeight: 800,
                color: "#111827",
                margin: "0 0 0.35rem 0",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              {propertyTitle}
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#4b5563",
                fontSize: "0.875rem",
                flexWrap: "wrap",
              }}
            >
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{propertyLocation}</span>
              <span style={{ color: "#9ca3af" }}>•</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.25rem", color: "#111827", fontWeight: 700 }}>
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>4.5</span>
                <span style={{ color: "#6b7280", fontWeight: 500 }}>(1 review)</span>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
            <button
              type="button"
              onClick={handleToggleFavorite}
              style={{
                background: "none",
                border: "none",
                color: isSaved ? "#ef4444" : "#374151",
                fontSize: "0.875rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                fontWeight: 600,
              }}
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-rose-500 text-rose-500" : "text-gray-500"}`} />
              <span>Save</span>
            </button>

            <button
              type="button"
              onClick={handleShare}
              style={{
                background: "none",
                border: "none",
                color: "#374151",
                fontSize: "0.875rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                fontWeight: 600,
                position: "relative",
              }}
            >
              <Share2 className="w-4 h-4 text-gray-500" />
              <span>Share</span>
              {shareToast && (
                <span
                  style={{
                    position: "absolute",
                    bottom: "-2rem",
                    right: 0,
                    background: "#0f172a",
                    color: "#ffffff",
                    fontSize: "0.75rem",
                    padding: "0.25rem 0.6rem",
                    borderRadius: "6px",
                    whiteSpace: "nowrap",
                    zIndex: 50,
                  }}
                >
                  {shareToast}
                </span>
              )}
            </button>

            <Link
              href="/homestays"
              style={{
                background: "#0f172a",
                color: "#ffffff",
                padding: "0.5rem 1.1rem",
                borderRadius: "9999px",
                fontSize: "0.8rem",
                fontWeight: 700,
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
              }}
            >
              <span>← All Properties</span>
            </Link>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. PHOTO GALLERY MOSAIC (1 LARGE LEFT + 2 STACKED RIGHT)
          ========================================================================= */}
      <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1rem", width: "100%" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.45fr 1fr",
            gap: "12px",
            height: "440px",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
            background: "#0f172a",
          }}
          className="max-md:!grid-cols-1 max-md:!h-auto"
        >
          {/* Main Large Hero Image (Left) */}
          <div
            style={{ position: "relative", height: "100%", cursor: "pointer", overflow: "hidden" }}
            className="max-md:!h-[280px]"
            onClick={() => {
              setActivePhotoIndex(0);
              setIsLightboxOpen(true);
            }}
          >
            <img
              src={rawImages[0]}
              alt={propertyTitle}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                transition: "transform 0.4s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            />
            <div
              style={{
                position: "absolute",
                bottom: "14px",
                left: "14px",
                background: "rgba(15, 23, 42, 0.75)",
                color: "#ffffff",
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "5px 12px",
                borderRadius: "8px",
                backdropFilter: "blur(4px)",
              }}
            >
              Featured Homestay Photography
            </div>
          </div>

          {/* Right 2 Photos Stacked */}
          <div
            style={{
              display: "grid",
              gridTemplateRows: "1fr 1fr",
              gap: "12px",
              height: "100%",
            }}
            className="max-md:!h-[360px]"
          >
            {/* Top Right Photo */}
            <div
              style={{ position: "relative", height: "100%", cursor: "pointer", overflow: "hidden" }}
              onClick={() => {
                setActivePhotoIndex(1);
                setIsLightboxOpen(true);
              }}
            >
              <img
                src={rawImages[1]}
                alt={`${propertyTitle} photo 2`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>

            {/* Bottom Right Photo with "View All Photos" Button */}
            <div
              style={{ position: "relative", height: "100%", cursor: "pointer", overflow: "hidden" }}
              onClick={() => {
                setActivePhotoIndex(2);
                setIsLightboxOpen(true);
              }}
            >
              <img
                src={rawImages[2]}
                alt={`${propertyTitle} photo 3`}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.3s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePhotoIndex(0);
                  setIsLightboxOpen(true);
                }}
                style={{
                  position: "absolute",
                  bottom: "14px",
                  right: "14px",
                  background: "#ffffff",
                  color: "#0f172a",
                  fontWeight: 700,
                  fontSize: "0.825rem",
                  padding: "0.45rem 0.95rem",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  cursor: "pointer",
                }}
              >
                <Camera className="w-4 h-4 text-slate-700" />
                <span>View All Photos ({rawImages.length})</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. STICKY SUB-NAVIGATION BAR (ROUNDED TEAL PILL ACTIVE STATE)
          ========================================================================= */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "#f4f6f8",
          padding: "0.85rem 0",
          marginTop: "0.5rem",
        }}
      >
        <div style={{ maxWidth: "1280px", margin: "0 auto", padding: "0 1rem" }}>
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "0.4rem 0.6rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "0.5rem",
              overflowX: "auto",
              scrollbarWidth: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
              {[
                { id: "overview", label: "Overview", ref: overviewRef },
                { id: "amenities", label: "Amenities & Activities", ref: amenitiesRef },
                { id: "rates", label: "Rates & Policies", ref: ratesRef },
                { id: "policies", label: "Property Policies", ref: policiesRef },
                { id: "rooms", label: `Rooms in Homestay (${roomsList.length})`, ref: roomsRef },
                { id: "availability", label: "Availability Calendar", ref: availabilityRef },
                { id: "location", label: "Location & Map", ref: locationRef },
                { id: "reviews", label: "Reviews (1)", ref: reviewsRef },
                { id: "host", label: "Meet Host", ref: hostRef },
              ].map((tab) => {
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => scrollToSection(tab.id, tab.ref)}
                    style={{
                      padding: "0.5rem 1.1rem",
                      borderRadius: "9999px",
                      border: "none",
                      background: isActive ? "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)" : "transparent",
                      color: isActive ? "#ffffff" : "#4b5563",
                      fontWeight: isActive ? 700 : 500,
                      fontSize: "0.85rem",
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      transition: "all 0.15s ease",
                      boxShadow: isActive ? "0 2px 6px rgba(0, 102, 204, 0.25)" : "none",
                    }}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          4. MAIN CONTENT TWO-COLUMN GRID
          ========================================================================= */}
      <div
        style={{
          maxWidth: "1280px",
          margin: "1.25rem auto 3rem",
          padding: "0 1rem",
          display: "grid",
          gridTemplateColumns: "1fr 390px",
          gap: "1.75rem",
          alignItems: "start",
          width: "100%",
        }}
        className="max-lg:!grid-cols-1"
      >
        {/* =====================================================================
            LEFT COLUMN
            ===================================================================== */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", minWidth: 0 }}>
          {/* SECTION 1: TRUST & GUARANTEE BANNER */}
          <div
            style={{
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: "16px",
              padding: "1.1rem 1.4rem",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
                color: "#ffffff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: "0 2px 6px rgba(0, 102, 204, 0.25)",
              }}
            >
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: "0.95rem", fontWeight: 700, color: "#003b7a" }}>
                TravelExpertz Best Rate &amp; Verified Stay Guarantee
              </h3>
              <p style={{ margin: "0.15rem 0 0", fontSize: "0.8rem", color: "#0052a3" }}>
                Enjoy transparent pricing, 100% verified accommodations, and zero traveler service fees.
              </p>
            </div>
          </div>

          {/* SECTION 2: PROPERTY OVERVIEW & ABOUT THIS VACATION RENTAL */}
          <section
            ref={overviewRef}
            id="overview"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.5rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1.1rem" }}>
              Property Overview
            </h2>

            {/* 4 Stat Boxes (Exact 4-column presentation from HolidayExpertz) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "0.75rem",
                marginBottom: "1.5rem",
              }}
              className="max-sm:!grid-cols-2"
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.3rem",
                  padding: "1rem 0.5rem",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                  textAlign: "center",
                }}
              >
                <Users className="w-4 h-4 text-[#0066cc]" />
                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>{guestCount} Guests</span>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>Accommodates</span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.3rem",
                  padding: "1rem 0.5rem",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                  textAlign: "center",
                }}
              >
                <Bed className="w-4 h-4 text-[#0066cc]" />
                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
                  {roomsList.length} Room
                </span>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>Bedrooms</span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.3rem",
                  padding: "1rem 0.5rem",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                  textAlign: "center",
                }}
              >
                <Bath className="w-4 h-4 text-[#0066cc]" />
                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>2 Baths</span>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>Bathrooms</span>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.3rem",
                  padding: "1rem 0.5rem",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  border: "1px solid #f1f5f9",
                  textAlign: "center",
                }}
              >
                <Clock className="w-4 h-4 text-[#0066cc]" />
                <span style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>14:00 / 11:00</span>
                <span style={{ fontSize: "0.75rem", color: "#64748b", fontWeight: 500 }}>Check-in / Out</span>
              </div>
            </div>

            {/* About This Vacation Rental */}
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
                <FileText className="w-4 h-4 text-[#0066cc]" />
                <h3 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  About This Vacation Rental
                </h3>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.6rem", flexWrap: "wrap" }}>
                <span
                  style={{
                    background: "#eff6ff",
                    color: "#0066cc",
                    border: "1px solid #bfdbfe",
                    borderRadius: "9999px",
                    padding: "0.2rem 0.65rem",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                  }}
                >
                  {propertyType}
                </span>
                <span style={{ fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>
                  18th-century Homestay
                </span>
              </div>

              <p style={{ color: "#4b5563", lineHeight: 1.7, fontSize: "0.925rem", margin: 0 }}>
                Experience a charming 18th-century homestay that blends heritage architecture with modern comforts. Spacious interiors, peaceful surroundings, and warm hospitality make it an ideal retreat in Dehradun.
              </p>
            </div>
          </section>

          {/* SECTION 3: AMENITIES & ACTIVITIES */}
          <section
            ref={amenitiesRef}
            id="amenities"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.5rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "1rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Sparkles className="w-4 h-4 text-[#0066cc]" />
                  <span>Amenities &amp; Activities</span>
                </h2>
                <p style={{ margin: "0.2rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                  Verified facilities and conveniences available on-site
                </p>
              </div>
              <span
                style={{
                  background: "#eff6ff",
                  color: "#0066cc",
                  padding: "0.25rem 0.65rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  border: "1px solid #bfdbfe",
                }}
              >
                9 features
              </span>
            </div>

            {/* Feature Pills (3-column layout matching reference screenshot) */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: "0.85rem",
              }}
              className="max-sm:!grid-cols-2"
            >
              {[
                "Kitchen & Dining",
                "Hot Water",
                "Swimming Pool",
                "Wi-Fi",
                "Parking",
                "Housekeeping",
                "Air Conditioned",
                "Mountain View",
                "Power Backup",
              ].map((amenity, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  <div
                    style={{
                      width: "18px",
                      height: "18px",
                      borderRadius: "50%",
                      background: "#eff6ff",
                      color: "#0066cc",
                      border: "1px solid #bfdbfe",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "0.7rem",
                      fontWeight: 800,
                      flexShrink: 0,
                    }}
                  >
                    ✓
                  </div>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 4: RATES & PRICING INFORMATION */}
          <section
            ref={ratesRef}
            id="rates"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.5rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div style={{ marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                ₹ Rates &amp; Pricing Information
              </h2>
              <p style={{ margin: "0.2rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                Clear, transparent rate breakdown, seasonal rules, and booking terms.
              </p>
            </div>

            <div style={{ overflow: "hidden", border: "1px solid #e2e8f0", borderRadius: "12px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
                <thead style={{ background: "#f8fafc", color: "#64748b", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                  <tr>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 700 }}>Rate Tier / Rule</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 700 }}>Schedule / Period</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 700 }}>Rate (INR)</th>
                    <th style={{ padding: "0.75rem 1rem", textAlign: "left", fontWeight: 700 }}>Basis</th>
                  </tr>
                </thead>
                <tbody style={{ color: "#334155" }}>
                  <tr style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#0f172a" }}>Minimum Starting Price</td>
                    <td style={{ padding: "0.85rem 1rem", color: "#64748b" }}>Base Entry Price</td>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 800, color: "#0066cc" }}>{formatInr(baseNightlyRate)}</td>
                    <td style={{ padding: "0.85rem 1rem", color: "#64748b" }}>Starting Price</td>
                  </tr>
                  <tr style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#0f172a" }}>Weekday Nightly Rate</td>
                    <td style={{ padding: "0.85rem 1rem", color: "#64748b" }}>Standard Weekdays</td>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 800, color: "#0066cc" }}>{formatInr(baseNightlyRate)} / night</td>
                    <td style={{ padding: "0.85rem 1rem", color: "#64748b" }}>Per Night</td>
                  </tr>
                  <tr style={{ borderTop: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 700, color: "#0f172a" }}>Weekend Nightly Rate</td>
                    <td style={{ padding: "0.85rem 1rem", color: "#64748b" }}>Fri &amp; Sat</td>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: 800, color: "#0066cc" }}>{formatInr(baseNightlyRate)} / night</td>
                    <td style={{ padding: "0.85rem 1rem", color: "#64748b" }}>Per Night</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* SECTION 5: PROPERTY POLICIES & HOUSE RULES */}
          <section
            ref={policiesRef}
            id="policies"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.5rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div style={{ marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <ShieldCheck className="w-5 h-5 text-[#0066cc]" />
                <span>Property Policies</span>
              </h2>
              <p style={{ margin: "0.2rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                Essential house rules, cancellation guidelines, and contractual terms for your stay.
              </p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                {
                  title: "General Policy & House Rules",
                  desc: "Standard quiet hours apply between 22:00 and 07:00. Parties and unauthorized events are prohibited on premises.",
                },
                {
                  title: "Refund & Cancellation Policy",
                  desc: "Full refund up to 14 days before check-in; 50% refund between 7 and 14 days; non-refundable within 7 days of scheduled arrival.",
                },
                {
                  title: "Contract Policy & Obligations",
                  desc: "Guests agree to care for the home, follow safety instructions, and comply with applicable local government requirements.",
                },
                {
                  title: "Additional Notes & Special Rules",
                  desc: "Pre-arrival ID verification and estimated arrival time are required before check-in.",
                },
              ].map((policy, idx) => (
                <div
                  key={idx}
                  style={{
                    background: "#f8fafc",
                    border: "1px solid #f1f5f9",
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() => togglePolicy(idx)}
                    style={{
                      width: "100%",
                      padding: "0.95rem 1.15rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <FileText className="w-4 h-4 text-[#0066cc]" />
                      <span style={{ fontSize: "0.875rem", fontWeight: 700, color: "#0f172a" }}>{policy.title}</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 text-[#64748b] transition-transform ${
                        expandedPolicies[idx] ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {expandedPolicies[idx] && (
                    <div
                      style={{
                        padding: "0 1.15rem 0.95rem",
                        fontSize: "0.825rem",
                        color: "#475569",
                        lineHeight: 1.6,
                        borderTop: "1px solid #e2e8f0",
                        paddingTop: "0.75rem",
                      }}
                    >
                      {policy.desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* SECTION 6: ROOMS IN HOMESTAY (Default: Entire Homestay, Click to Book Individual Room) */}
          <section
            ref={roomsRef}
            id="rooms"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.5rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: "1px solid #f1f5f9",
                paddingBottom: "1rem",
                marginBottom: "1.25rem",
                flexWrap: "wrap",
                gap: "0.5rem",
              }}
            >
              <div>
                <h2 style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                  Rooms in Homestay
                </h2>
                <p style={{ margin: "0.25rem 0 0", color: "#64748b", fontSize: "0.85rem" }}>
                  By default, bookings reserve the entire homestay. You can also choose an individual room below.
                </p>
              </div>

              {/* Date & Guests summary pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "9999px",
                  fontSize: "0.825rem",
                  color: "#003b7a",
                  fontWeight: 600,
                }}
              >
                <span>📅 {nightsCount} Night Stay</span>
                <span>•</span>
                <span>👥 {guestCount} Guests</span>
              </div>
            </div>

            {/* DEFAULT OPTION: BOOK ENTIRE HOMESTAY */}
            <div
              style={{
                background: bookingMode === "homestay" ? "#eff6ff" : "#f8fafc",
                border: bookingMode === "homestay" ? "2px solid #0066cc" : "1.5px solid #e2e8f0",
                borderRadius: "14px",
                padding: "1.15rem 1.25rem",
                marginBottom: "1.25rem",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                flexWrap: "wrap",
                gap: "1rem",
                boxShadow: bookingMode === "homestay" ? "0 4px 14px rgba(0, 102, 204, 0.12)" : "none",
                transition: "all 0.2s ease",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <div
                  style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "10px",
                    background: bookingMode === "homestay" ? "#0066cc" : "#64748b",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Home className="w-5 h-5" />
                </div>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <h3 style={{ margin: 0, fontSize: "1.05rem", fontWeight: 800, color: "#0f172a" }}>
                      Entire Homestay / Villa (Default Selection)
                    </h3>
                    {bookingMode === "homestay" && (
                      <span
                        style={{
                          background: "#0066cc",
                          color: "#ffffff",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "9999px",
                        }}
                      >
                        ✔ Selected
                      </span>
                    )}
                  </div>
                  <p style={{ margin: "0.2rem 0 0", fontSize: "0.825rem", color: "#475569" }}>
                    Reserve the entire property exclusively • Accommodates up to {guestCount} guests • Full kitchen, lawn &amp; living access
                  </p>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0f172a" }}>
                    {formatInr(baseNightlyRate)}
                    <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500 }}> / night</span>
                  </div>
                  <span style={{ fontSize: "0.75rem", color: "#0066cc", fontWeight: 700 }}>
                    1 Full Property Available
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setBookingMode("homestay");
                    setSelectedRoomId(null);
                    const el = document.getElementById("sidebar-booking");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  style={{
                    background: bookingMode === "homestay" ? "#ffffff" : "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
                    color: bookingMode === "homestay" ? "#0066cc" : "#ffffff",
                    padding: "0.6rem 1.25rem",
                    borderRadius: "8px",
                    border: bookingMode === "homestay" ? "1.5px solid #0066cc" : "none",
                    fontWeight: 700,
                    fontSize: "0.875rem",
                    cursor: "pointer",
                    boxShadow: bookingMode === "homestay" ? "none" : "0 2px 8px rgba(0, 102, 204, 0.25)",
                    transition: "all 0.15s ease",
                  }}
                >
                  {bookingMode === "homestay" ? "Selected (Entire Homestay)" : "Book Entire Homestay"}
                </button>
              </div>
            </div>

            <div style={{ margin: "1rem 0 0.75rem", fontSize: "0.825rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              Or Choose an Individual Room ({roomsList.length} Categories Available):
            </div>

            {/* 3 INDIVIDUAL ROOM CATEGORY CARDS */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {roomsList.map((room) => {
                const isSelected = bookingMode === "room" && selectedRoomId === room.id;
                const discountPct = room.originalPrice
                  ? Math.round(((room.originalPrice - room.price) / room.originalPrice) * 100)
                  : 15;

                return (
                  <div
                    key={room.id}
                    style={{
                      border: isSelected ? "2px solid #0066cc" : "1.5px solid #e2e8f0",
                      borderRadius: "14px",
                      overflow: "hidden",
                      background: isSelected ? "#eff6ff" : "#ffffff",
                      transition: "all 0.2s ease",
                      boxShadow: isSelected ? "0 4px 16px rgba(0, 102, 204, 0.12)" : "none",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "240px 1fr",
                        gap: "1.25rem",
                      }}
                      className="max-sm:!grid-cols-1"
                    >
                      {/* Left: Room Image, Availability Count Pill & Specs Button */}
                      <div style={{ position: "relative", height: "100%", minHeight: "190px", background: "#f1f5f9" }}>
                        <img
                          src={room.images?.[0] || rawImages[0]}
                          alt={room.type}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                        />
                        {discountPct > 0 && (
                          <span
                            style={{
                              position: "absolute",
                              top: "8px",
                              left: "8px",
                              background: "#eff6ff",
                              color: "#0066cc",
                              border: "1px solid #bfdbfe",
                              fontWeight: 700,
                              fontSize: "0.72rem",
                              padding: "2px 7px",
                              borderRadius: "6px",
                            }}
                          >
                            {discountPct}% OFF
                          </span>
                        )}

                        <span
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            left: "8px",
                            background: "rgba(15, 23, 42, 0.8)",
                            color: "#ffffff",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: "6px",
                            backdropFilter: "blur(4px)",
                          }}
                        >
                          🟢 {room.availabilityCount} Rooms Available
                        </span>
                      </div>

                      {/* Right: Room Specs, Amenities, Price & Select CTA */}
                      <div style={{ padding: "1.1rem 1.25rem 1.1rem 0", display: "flex", flexDirection: "column", justifyContent: "space-between" }} className="max-sm:!p-4">
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "0.5rem" }}>
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                                <h4 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                                  {room.type}
                                </h4>
                                {isSelected && (
                                  <span
                                    style={{
                                      background: "#0066cc",
                                      color: "#ffffff",
                                      fontSize: "0.7rem",
                                      fontWeight: 700,
                                      padding: "1px 6px",
                                      borderRadius: "9999px",
                                    }}
                                  >
                                    Selected
                                  </span>
                                )}
                              </div>
                              <p style={{ margin: "0.15rem 0 0", fontSize: "0.8rem", color: "#64748b" }}>
                                {room.description}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => setRoomForDetails(room)}
                              style={{
                                background: "none",
                                border: "none",
                                color: "#0066cc",
                                fontWeight: 700,
                                fontSize: "0.78rem",
                                cursor: "pointer",
                                padding: 0,
                                whiteSpace: "nowrap",
                                textDecoration: "underline",
                              }}
                            >
                              Photos &amp; Specs
                            </button>
                          </div>

                          {/* Quick Specs Icons */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "1.25rem",
                              marginTop: "0.65rem",
                              fontSize: "0.8rem",
                              color: "#475569",
                              flexWrap: "wrap",
                            }}
                          >
                            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              <Users className="w-3.5 h-3.5 text-[#0066cc]" />
                              <span>Up to {room.maxGuests} Guests</span>
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              <Bed className="w-3.5 h-3.5 text-[#0066cc]" />
                              <span>{room.bedType}</span>
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: "0.3rem" }}>
                              <DoorOpen className="w-3.5 h-3.5 text-[#0066cc]" />
                              <span>{room.size}</span>
                            </span>
                          </div>

                          {/* Amenities Badges */}
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.6rem" }}>
                            {room.amenities?.slice(0, 4).map((am: string, i: number) => (
                              <span
                                key={i}
                                style={{
                                  background: "#f1f5f9",
                                  color: "#334155",
                                  fontSize: "0.72rem",
                                  fontWeight: 600,
                                  padding: "2px 7px",
                                  borderRadius: "6px",
                                }}
                              >
                                {am}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Pricing & Selection CTA */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-end",
                            borderTop: "1px solid #f1f5f9",
                            paddingTop: "0.85rem",
                            marginTop: "0.75rem",
                            flexWrap: "wrap",
                            gap: "0.75rem",
                          }}
                        >
                          <div>
                            <div style={{ display: "flex", alignItems: "baseline", gap: "0.4rem" }}>
                              {room.originalPrice > room.price && (
                                <span style={{ fontSize: "0.85rem", color: "#94a3b8", textDecoration: "line-through" }}>
                                  {formatInr(room.originalPrice)}
                                </span>
                              )}
                              <span style={{ fontSize: "1.45rem", fontWeight: 800, color: "#0f172a" }}>
                                {formatInr(room.price)}
                              </span>
                              <span style={{ fontSize: "0.8rem", color: "#64748b" }}>/ night</span>
                            </div>
                            <p style={{ margin: "0.15rem 0 0", fontSize: "0.75rem", color: "#64748b" }}>
                              + {formatInr(Math.round(room.price * 0.12))} taxes &amp; fees • {room.availabilityCount} available
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              setBookingMode("room");
                              setSelectedRoomId(room.id);
                              const el = document.getElementById("sidebar-booking");
                              if (el) el.scrollIntoView({ behavior: "smooth" });
                            }}
                            style={{
                              background: isSelected ? "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)" : "#ffffff",
                              color: isSelected ? "#ffffff" : "#0066cc",
                              padding: "0.6rem 1.4rem",
                              borderRadius: "8px",
                              border: "1.5px solid #0066cc",
                              fontWeight: 700,
                              fontSize: "0.875rem",
                              cursor: "pointer",
                              boxShadow: isSelected ? "0 2px 8px rgba(0, 102, 204, 0.25)" : "none",
                              transition: "all 0.15s ease",
                            }}
                          >
                            {isSelected ? "Selected ✔" : "Select Room Only"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* SECTION 7: AVAILABILITY CALENDAR (Hotel Component with Bi-Directional Date Sync) */}
          <div id="availability" ref={availabilityRef}>
            <HotelAvailabilityCalendar
              hotelId={homestay?._id || homestayId}
              hotelName={propertyTitle}
              propertyType="homestay"
              basePrice={currentNightlyRate}
              currency="INR"
              selectedRoomId={bookingMode === "room" ? selectedRoomId || undefined : undefined}
              checkInDate={checkIn}
              checkOutDate={checkOut}
              onDatesChange={(cIn, cOut) => {
                setCheckIn(cIn);
                setCheckOut(cOut);
              }}
            />
          </div>

          {/* SECTION 8: LOCATION & SURROUNDINGS */}
          <div id="location" ref={locationRef}>
            <HotelLocationMap
              hotelName={propertyTitle}
              address={homestay?.address || propertyLocation}
              city={homestay?.city || propertyCity}
              location={homestay?.location || propertyLocation}
              latitude={mapCoords[0]}
              longitude={mapCoords[1]}
              nearbyPlaces={homestay?.nearbyPlaces}
            />
          </div>

          {/* SECTION 9: GUEST REVIEWS & RATINGS */}
          <section
            ref={reviewsRef}
            id="reviews"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.5rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div style={{ marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                <span>Reviews &amp; Ratings</span>
              </h2>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
              {/* Rating Summary */}
              <div style={{ paddingRight: "1.5rem", borderRight: "1px solid #f1f5f9" }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                  <span style={{ fontSize: "2rem", fontWeight: 800, color: "#0f172a" }}>4.5</span>
                  <div style={{ display: "flex", alignItems: "center", color: "#f59e0b" }}>
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  </div>
                </div>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>1 Verified Review</span>
              </div>

              {/* Review Card matching reference screenshot */}
              <div
                style={{
                  flex: "1 1 300px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "1rem",
                  border: "1px solid #f1f5f9",
                  display: "grid",
                  gap: "0.4rem",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <div
                      style={{
                        width: "32px",
                        height: "32px",
                        borderRadius: "50%",
                        background: "#eff6ff",
                        color: "#0066cc",
                        fontWeight: 800,
                        fontSize: "0.85rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      A
                    </div>
                    <div>
                      <div style={{ fontSize: "0.85rem", fontWeight: 700, color: "#0f172a" }}>Amit Sharma</div>
                      <div style={{ fontSize: "0.75rem", color: "#64748b" }}>Visited in Oct 2025</div>
                    </div>
                  </div>
                  <span
                    style={{
                      background: "#eff6ff",
                      color: "#0066cc",
                      border: "1px solid #bfdbfe",
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      padding: "0.2rem 0.5rem",
                      borderRadius: "6px",
                    }}
                  >
                    ★ 4.5
                  </span>
                </div>
                <p style={{ margin: "0.2rem 0 0", fontSize: "0.85rem", color: "#475569", lineHeight: 1.6 }}>
                  Beautiful property, peaceful location and great hospitality. Highly recommended!
                </p>
              </div>
            </div>
          </section>

          {/* SECTION 10: MEET YOUR HOST */}
          <section
            ref={hostRef}
            id="host"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.5rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div style={{ marginBottom: "1rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Meet Your Host
              </h2>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "1.5rem", flexWrap: "wrap" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.85rem" }}>
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80"
                  alt="Host Rajesh Singh"
                  style={{
                    width: "52px",
                    height: "52px",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: "2px solid #e2e8f0",
                  }}
                />
                <div>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>Rajesh Singh</div>
                  <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Property Host</div>
                  <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0066cc", display: "flex", alignItems: "center", gap: "0.25rem" }}>
                    ✓ Verified Host
                  </div>
                </div>
              </div>

              <div
                style={{
                  flex: "1 1 300px",
                  background: "#f8fafc",
                  borderRadius: "12px",
                  padding: "0.85rem 1rem",
                  border: "1px solid #f1f5f9",
                  fontSize: "0.85rem",
                  color: "#475569",
                  lineHeight: 1.6,
                  fontStyle: "italic",
                }}
              >
                &ldquo;I&apos;m happy to host you at my property and ensure you have a comfortable and memorable stay in Dehradun.&rdquo;
              </div>
            </div>
          </section>
        </div>

        {/* =====================================================================
            RIGHT COLUMN: STICKY ENQUIRY & BOOKING CARD (MATCHING REFERENCE EXACTLY)
            ===================================================================== */}
        <div id="sidebar-booking" style={{ position: "sticky", top: "75px" }}>
          <div
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.5rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 4px 20px rgba(0, 0, 0, 0.06)",
            }}
          >
            {/* Price Header (Starting From, Strikethrough, Best Rate Badge) */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.85rem" }}>
              <div>
                <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "0.15rem" }}>
                  Starting from
                </div>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                  <span style={{ fontSize: "1.85rem", fontWeight: 800, color: "#111827" }}>
                    {formatInr(currentNightlyRate)}
                  </span>
                  <span style={{ fontSize: "0.85rem", color: "#9ca3af", textDecoration: "line-through" }}>
                    {formatInr(currentNightlyRate * 2)} original
                  </span>
                </div>
              </div>

              <span
                style={{
                  background: "#f0fdf4",
                  color: "#16a34a",
                  border: "1px solid #bbf7d0",
                  padding: "0.25rem 0.65rem",
                  borderRadius: "9999px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                }}
              >
                Best Rate
              </span>
            </div>

            {/* Title & Subtitle */}
            <div style={{ marginBottom: "1.15rem" }}>
              <h3 style={{ margin: "0 0 0.25rem", fontSize: "1.2rem", fontWeight: 800, color: "#111827" }}>
                Ask About This Property
              </h3>
              <p style={{ margin: 0, fontSize: "0.825rem", color: "#4b5563", lineHeight: 1.5 }}>
                Interested in this property? Share your travel details and send your inquiry directly to the host.
              </p>
            </div>

            {/* Selected Booking Mode Pill */}
            <div
              style={{
                background: bookingMode === "room" ? "#eff6ff" : "#f8fafc",
                border: bookingMode === "room" ? "1px solid #bfdbfe" : "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "0.5rem 0.75rem",
                marginBottom: "1rem",
                fontSize: "0.8rem",
                color: bookingMode === "room" ? "#003b7a" : "#334155",
                fontWeight: 600,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }} className="truncate pr-2">
                {bookingMode === "room" ? <DoorOpen className="w-4 h-4 text-[#0066cc] shrink-0" /> : <Home className="w-4 h-4 text-[#0066cc] shrink-0" />}
                <span className="truncate">
                  {bookingMode === "room" ? `Room: ${activeRoom?.type}` : `Entire Homestay (${propertyTitle})`}
                </span>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (bookingMode === "room") {
                    setBookingMode("homestay");
                    setSelectedRoomId(null);
                  } else {
                    scrollToSection("rooms");
                  }
                }}
                style={{
                  background: "none",
                  border: "none",
                  color: "#0066cc",
                  cursor: "pointer",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  padding: 0,
                  flexShrink: 0,
                  textDecoration: "underline",
                }}
              >
                {bookingMode === "room" ? "Book Homestay" : "Book Room"}
              </button>
            </div>

            {inquirySuccess ? (
              <div
                style={{
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  borderRadius: "10px",
                  padding: "1.25rem",
                  textAlign: "center",
                }}
              >
                <CheckCircle2 className="w-8 h-8 text-[#0066cc] mx-auto mb-2" />
                <h4 style={{ margin: "0 0 0.25rem", fontSize: "0.95rem", fontWeight: 800, color: "#003b7a" }}>
                  {bookingMode === "room" ? "Room Enquiry Submitted!" : "Homestay Enquiry Submitted!"}
                </h4>
                <p style={{ margin: 0, fontSize: "0.8rem", color: "#0052a3" }}>
                  Your request has been delivered to the host. They will reach out to you shortly.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSendEnquiry}>
                {/* Dates Selector */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "#475569",
                        marginBottom: "0.25rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Check-In *
                    </label>
                    <input
                      type="date"
                      required
                      value={checkIn}
                      onChange={(e) => setCheckIn(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.65rem",
                        borderRadius: "8px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#0f172a",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "#475569",
                        marginBottom: "0.25rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Check-Out *
                    </label>
                    <input
                      type="date"
                      required
                      min={checkIn || new Date().toISOString().split("T")[0]}
                      value={checkOut}
                      onChange={(e) => setCheckOut(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.65rem",
                        borderRadius: "8px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        color: "#0f172a",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                {/* Number of Guests */}
                <div style={{ marginBottom: "0.75rem" }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: "#475569",
                      marginBottom: "0.25rem",
                      textTransform: "uppercase",
                    }}
                  >
                    Number of Guests *
                  </label>
                  <select
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    aria-label="Number of Guests"
                    style={{
                      width: "100%",
                      padding: "0.55rem 0.65rem",
                      borderRadius: "8px",
                      border: "1.5px solid #cbd5e1",
                      fontSize: "0.85rem",
                      fontWeight: 600,
                      color: "#0f172a",
                      boxSizing: "border-box",
                      background: "#ffffff",
                    }}
                  >
                    {[1, 2, 4, 6, 8, 10, 12, 15, 20].map((n) => (
                      <option key={n} value={n}>
                        {n} Guests
                      </option>
                    ))}
                  </select>
                </div>

                {/* Guest Details */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "0.85rem" }}>
                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "#475569",
                        marginBottom: "0.25rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Your Full Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={inquiryName}
                      onChange={(e) => setInquiryName(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        borderRadius: "8px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "0.85rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "#475569",
                        marginBottom: "0.25rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={inquiryEmail}
                      onChange={(e) => setInquiryEmail(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        borderRadius: "8px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "0.85rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "#475569",
                        marginBottom: "0.25rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Mobile / WhatsApp *
                    </label>
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={inquiryPhone}
                      onChange={(e) => setInquiryPhone(e.target.value)}
                      required
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        borderRadius: "8px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "0.85rem",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: "block",
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        color: "#475569",
                        marginBottom: "0.25rem",
                        textTransform: "uppercase",
                      }}
                    >
                      Your Message to Host
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Write your message here..."
                      value={inquiryMessage}
                      onChange={(e) => setInquiryMessage(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "0.55rem 0.75rem",
                        borderRadius: "8px",
                        border: "1.5px solid #cbd5e1",
                        fontSize: "0.85rem",
                        resize: "none",
                        boxSizing: "border-box",
                      }}
                    />
                  </div>
                </div>

                {/* Price Breakdown Snapshot */}
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "10px",
                    padding: "0.75rem 0.95rem",
                    marginBottom: "1rem",
                    fontSize: "0.825rem",
                    display: "grid",
                    gap: "0.3rem",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                    <span>
                      {bookingMode === "room" ? "1 Room" : "Entire Homestay"} × {nightsCount} Night{nightsCount > 1 ? "s" : ""}
                    </span>
                    <strong>{formatInr(currentNightlyRate * nightsCount)}</strong>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                    <span>Taxes &amp; Service Fees</span>
                    <strong>{formatInr(Math.round(currentNightlyRate * nightsCount * 0.12))}</strong>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      color: "#0f172a",
                      fontWeight: 800,
                      fontSize: "0.95rem",
                      borderTop: "1px solid #e2e8f0",
                      paddingTop: "0.35rem",
                      marginTop: "0.2rem",
                    }}
                  >
                    <span>Total Payable</span>
                    <span style={{ color: "#0066cc" }}>
                      {formatInr(Math.round(currentNightlyRate * nightsCount * 1.12))}
                    </span>
                  </div>
                </div>

                {/* CTA Button: Send Enquiry */}
                <button
                  type="submit"
                  disabled={isSubmittingInquiry}
                  style={{
                    width: "100%",
                    padding: "0.85rem",
                    background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: isSubmittingInquiry ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(0, 102, 204, 0.25)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.5rem",
                    transition: "all 0.15s ease",
                  }}
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {isSubmittingInquiry ? "Sending..." : "Send Enquiry"}
                  </span>
                </button>

                <p
                  style={{
                    textAlign: "center",
                    fontSize: "0.75rem",
                    color: "#64748b",
                    marginTop: "0.6rem",
                    marginBottom: 0,
                  }}
                >
                  Enquiry handled through existing booking flow
                </p>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* ROOM PHOTOS & SPECS DETAILS MODAL */}
      {roomForDetails && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center p-4"
          style={{ zIndex: 100000 }}
          role="dialog"
          aria-modal="true"
        >
          <div
            style={{
              background: "#ffffff",
              borderRadius: "18px",
              maxWidth: "680px",
              width: "100%",
              overflow: "hidden",
              boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
              maxHeight: "90vh",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem 1.5rem",
                borderBottom: "1px solid #e2e8f0",
              }}
            >
              <div>
                <h3 style={{ margin: 0, fontSize: "1.15rem", fontWeight: 800, color: "#0f172a" }}>
                  {roomForDetails.type}
                </h3>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                  {formatInr(roomForDetails.price)} / night • 🟢 {roomForDetails.availabilityCount} Rooms Available
                </span>
              </div>
              <button
                type="button"
                onClick={() => setRoomForDetails(null)}
                style={{
                  background: "#f1f5f9",
                  border: "none",
                  borderRadius: "50%",
                  width: "32px",
                  height: "32px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#475569",
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div style={{ overflowY: "auto", padding: "1.5rem" }}>
              <div style={{ height: "240px", borderRadius: "12px", overflow: "hidden", marginBottom: "1.25rem" }}>
                <img
                  src={roomForDetails.images?.[0] || rawImages[0]}
                  alt={roomForDetails.type}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Room Size</span>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>{roomForDetails.size} sq.ft</div>
                </div>
                <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Bed Type</span>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>{roomForDetails.bedType}</div>
                </div>
                <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Capacity</span>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a", marginTop: "2px" }}>Up to {roomForDetails.maxGuests} Guests</div>
                </div>
                <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "8px", border: "1px solid #f1f5f9" }}>
                  <span style={{ fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase", fontWeight: 700 }}>Availability</span>
                  <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#16a34a", marginTop: "2px" }}>{roomForDetails.availabilityCount} Rooms Left</div>
                </div>
              </div>

              <h4 style={{ margin: "0 0 0.5rem", fontSize: "0.9rem", fontWeight: 800, color: "#0f172a" }}>
                Included Amenities
              </h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1.25rem" }}>
                {roomForDetails.amenities.map((a: string, idx: number) => (
                  <span
                    key={idx}
                    style={{
                      background: "#eff6ff",
                      color: "#0066cc",
                      border: "1px solid #bfdbfe",
                      padding: "0.3rem 0.65rem",
                      borderRadius: "6px",
                      fontSize: "0.8rem",
                      fontWeight: 600,
                    }}
                  >
                    ✓ {a}
                  </span>
                ))}
              </div>

              <button
                type="button"
                onClick={() => {
                  setBookingMode("room");
                  setSelectedRoomId(roomForDetails.id);
                  setRoomForDetails(null);
                  const el = document.getElementById("sidebar-booking");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }}
                style={{
                  width: "100%",
                  padding: "0.85rem",
                  background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 700,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                }}
              >
                Select This Room ({formatInr(roomForDetails.price)} / night)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FULLSCREEN LIGHTBOX MODAL */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200"
          style={{ zIndex: 100000 }}
          role="dialog"
          aria-modal="true"
        >
          <div className="flex items-center justify-between text-white max-w-6xl mx-auto w-full">
            <span className="text-sm font-semibold">
              {activePhotoIndex + 1} / {rawImages.length}
            </span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="relative flex-1 flex items-center justify-center max-w-5xl mx-auto w-full my-4">
            <img
              src={rawImages[activePhotoIndex]}
              alt={`${propertyTitle} photo ${activePhotoIndex + 1}`}
              className="max-h-[80vh] max-w-full object-contain rounded-xl"
            />
            <button
              type="button"
              onClick={handlePrevPhoto}
              className="absolute left-2 sm:left-4 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            <button
              type="button"
              onClick={handleNextPhoto}
              className="absolute right-2 sm:right-4 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white transition-colors cursor-pointer"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-2 overflow-x-auto py-2">
            {rawImages.map((img, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActivePhotoIndex(idx)}
                className={`relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                  activePhotoIndex === idx ? "border-[#0066cc] scale-105" : "border-transparent opacity-60 hover:opacity-100"
                }`}
              >
                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
