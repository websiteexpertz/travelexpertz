"use client";

import { useEffect, useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { useParams, useSearchParams } from "next/navigation";
import { load } from "@cashfreepayments/cashfree-js";
import Header from "../../components/Header";
import HotelAvailabilityCalendar from "../../components/HotelAvailabilityCalendar";

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

interface Room {
  id: string;
  type: string;
  price: number;
  originalPrice?: number;
  maxGuests: number;
  bedType: string;
  size: number;
  amenities: string[];
  images: string[];
  availability: number;
  cancellationPolicy: string;
  mealPlan?: string;
  taxesAndFees?: number;
  minimumAdvance?: number;
  roomView?: string;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

interface Hotel {
  _id: string;
  name: string;
  location: string;
  city?: string;
  address: string;
  latitude?: number;
  longitude?: number;
  rating: number;
  reviews: number;
  images: string[];
  description: string;
  amenities: string[];
  nearbyPlaces: { name: string; distance: string }[];
  checkInTime: string;
  checkOutTime: string;
  rooms: Room[];
  userReviews: Review[];
  policies: {
    cancellation: string;
    checkIn: string;
    checkOut: string;
    pets: string;
  };
  hostName?: string;
  hostEmail?: string;
  hostPhone?: string;
  taxRate?: number;
  commissionRate?: number;
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatInr = (value: number) =>
  inrFormatter.format(Math.max(0, Math.round(value)));

export default function HotelDetails() {
  const params = useParams();
  const searchParams = useSearchParams();
  const hotelId = params?.id as string;

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<string>("rooms");

  // Booking details
  const [bookingDetails, setBookingDetails] = useState({
    checkIn: searchParams.get("checkIn") || "",
    checkOut: searchParams.get("checkOut") || "",
    rooms: 1,
    guests: Number(searchParams.get("guests")) || 2,
  });

  const [showBookingForm, setShowBookingForm] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [guestDetails, setGuestDetails] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });
  const [paymentOption, setPaymentOption] = useState<"full" | "commission">("full");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null);
  const [roomForDetails, setRoomForDetails] = useState<Room | null>(null);
  const [selectedRouteOrigin, setSelectedRouteOrigin] = useState<string | null>(null);

  const [similarHotels, setSimilarHotels] = useState<any[]>([]);
  const [refreshKey, setRefreshKey] = useState(0);

  // 1. Auth check
  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    setBookingDetails((current) => ({
      ...current,
      checkIn: searchParams.get("checkIn") || current.checkIn,
      checkOut: searchParams.get("checkOut") || current.checkOut,
      guests: Number(searchParams.get("guests")) || current.guests,
    }));
  }, [searchParams]);

  const checkAuth = async () => {
    try {
      const userString = localStorage.getItem("user");
      if (userString) {
        try {
          const user = JSON.parse(userString);
          setUserProfile(user);
          setGuestDetails((prev) => ({
            ...prev,
            name: user.name || prev.name,
            email: user.email || prev.email,
            phone: user.mobile || prev.phone,
          }));
          return;
        } catch (e) {
          console.error("Failed to parse stored user:", e);
        }
      }

      const response = await fetch("/api/auth/user-profile", {
        credentials: "include",
      });
      if (response.ok) {
        const user = await response.json();
        setUserProfile(user);
        setGuestDetails((prev) => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
          phone: user.mobile || prev.phone,
        }));
      }
    } catch (err) {
      console.error("Auth check failed:", err);
    }
  };

  // 2. Fetch hotel details & reviews
  useEffect(() => {
    const fetchHotelDetails = async () => {
      if (!hotelId) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/hotels?id=${hotelId}&t=${Date.now()}`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setHotel(data);
          // Default select first available room
          if (data.rooms && data.rooms.length > 0) {
            setSelectedRoomForBooking(data.rooms[0]);
          }
        }
      } catch (error) {
        console.error("Failed to fetch hotel details:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?propertyId=${hotelId}&t=${Date.now()}`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };

    fetchHotelDetails();
    fetchReviews();
  }, [hotelId, refreshKey]);

  // 3. Fetch similar hotels
  useEffect(() => {
    if (!hotel) return;
    const fetchSimilarHotels = async () => {
      try {
        const response = await fetch(`/api/hotels`, { cache: "no-store" });
        if (response.ok) {
          const allHotels = await response.json();
          const hotelLocation = hotel.location?.toLowerCase().trim() || "";
          const similar = (Array.isArray(allHotels) ? allHotels : [])
            .filter(
              (h: any) =>
                h._id !== hotel._id && h.location?.toLowerCase().trim() === hotelLocation
            )
            .slice(0, 4);

          if (similar.length < 4) {
            const others = (Array.isArray(allHotels) ? allHotels : [])
              .filter(
                (h: any) =>
                  h._id !== hotel._id && !similar.some((s: any) => s._id === h._id)
              )
              .slice(0, 4 - similar.length);
            similar.push(...others);
          }
          setSimilarHotels(similar);
        }
      } catch (error) {
        console.error("Failed to fetch similar hotels:", error);
      }
    };
    fetchSimilarHotels();
  }, [hotel]);

  // 4. Calculations
  const calculateNights = () => {
    if (!bookingDetails.checkIn || !bookingDetails.checkOut) return 1;
    const start = new Date(bookingDetails.checkIn);
    const end = new Date(bookingDetails.checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const bookingNights = calculateNights();
  const activeRoom = selectedRoomForBooking || (hotel?.rooms && hotel.rooms[0]) || null;
  const baseRoomPrice = activeRoom?.price || 0;
  const originalRoomPrice = activeRoom?.originalPrice || Math.round(baseRoomPrice * 1.25);
  const bookingBase = baseRoomPrice * bookingNights * bookingDetails.rooms;

  const bookingCommission =
    (activeRoom?.minimumAdvance ||
      bookingBase *
        (Number(hotel?.commissionRate ?? 10) / 100 / Math.max(bookingNights, 1))) *
    bookingNights;

  const bookingTax =
    Math.max(
      0,
      (activeRoom?.taxesAndFees || 0) * bookingNights * bookingDetails.rooms - bookingCommission
    ) || bookingBase * (Number(hotel?.taxRate ?? 12) / 100);

  const bookingTotal = bookingBase + bookingTax + bookingCommission;
  const depositAmount = bookingCommission;
  const balanceAtHotel = Math.max(0, bookingTotal - depositAmount);

  // 5. Scroll to section
  const scrollToSection = (sectionId: string) => {
    setActiveTab(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -90; // account for sticky header & tab bar
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // 6. Confirm Booking & Cashfree Payment
  const handleConfirmBooking = async () => {
    if (!activeRoom) {
      alert("Please select a room first");
      scrollToSection("rooms");
      return;
    }

    if (!bookingDetails.checkIn || !bookingDetails.checkOut) {
      alert("Please select check-in and check-out dates");
      setShowBookingForm(true);
      return;
    }

    if (!guestDetails.name || !guestDetails.email || !guestDetails.phone) {
      alert("Please fill in your contact and guest details");
      setShowBookingForm(true);
      return;
    }

    try {
      setProcessingPayment(true);
      const checkinDate = new Date(bookingDetails.checkIn);
      const checkoutDate = new Date(bookingDetails.checkOut);
      const nights = Math.ceil(
        (checkoutDate.getTime() - checkinDate.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (nights <= 0) {
        alert("Check-out date must be after check-in date");
        return;
      }

      if (!hotel) {
        alert("Hotel information not loaded. Please refresh and try again.");
        return;
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          hotelId: hotelId,
          propertyName: hotel.name,
          propertyType: "hotel",
          roomId: activeRoom.id,
          roomType: activeRoom.type,
          guestName: guestDetails.name,
          guestEmail: guestDetails.email,
          guestPhone: guestDetails.phone,
          checkin: bookingDetails.checkIn,
          checkout: bookingDetails.checkOut,
          checkIn: bookingDetails.checkIn,
          checkOut: bookingDetails.checkOut,
          guests: bookingDetails.guests,
          basePrice: activeRoom.price,
          paymentInitiated: true,
          paymentOption,
          city: hotel.city || hotel.location || "Unknown",
          ...(userProfile?._id ? { userId: userProfile._id } : {}),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create booking");
      }

      const booking = await response.json();
      const orderResponse = await fetch("/api/payments/cashfree", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: booking._id }),
      });
      if (!orderResponse.ok) {
        const error = await orderResponse.json();
        throw new Error(error.error || "Failed to initialize payment");
      }

      const orderData = await orderResponse.json();
      if (orderData.mock && orderData.redirectUrl) {
        window.location.href = orderData.redirectUrl;
        return;
      }

      const { paymentSessionId } = orderData;
      const cashfree = await load({
        mode: (process.env.NEXT_PUBLIC_CASHFREE_ENV === "production"
          ? "production"
          : "sandbox") as "sandbox" | "production",
      });
      if (!cashfree) throw new Error("Cashfree checkout could not be loaded");
      await cashfree.checkout({ paymentSessionId, redirectTarget: "_self" });
    } catch (error: any) {
      console.error("Error creating booking:", error);
      alert(error.message || "Failed to create booking");
    } finally {
      setProcessingPayment(false);
    }
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full flex-col bg-[#f4f5f7]">
        <Header currentPage="hotels" />
        <div style={{ padding: "6rem 2rem", textAlign: "center", color: "#64748b" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid #cbd5e1",
              borderTopColor: "#0066cc",
              borderRadius: "50%",
              margin: "0 auto 1.5rem",
              animation: "spin 1s linear infinite",
            }}
          />
          <h2 style={{ fontSize: "1.25rem", fontWeight: 700, color: "#1e293b" }}>
            Loading property details...
          </h2>
          <p style={{ fontSize: "0.9rem" }}>Fetching live availability, room options, and verified reviews</p>
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="relative flex min-h-screen w-full flex-col bg-[#f4f5f7]">
        <Header currentPage="hotels" />
        <div style={{ padding: "6rem 2rem", textAlign: "center", color: "#64748b" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "4rem", color: "#94a3b8" }}>
            hotel
          </span>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 700, color: "#1e293b", margin: "1rem 0 0.5rem" }}>
            Hotel Not Found
          </h2>
          <p style={{ maxWidth: "450px", margin: "0 auto 1.5rem" }}>
            The requested property could not be found or may have been updated.
          </p>
          <a
            href="/hotels"
            style={{
              display: "inline-block",
              background: "#0066cc",
              color: "#ffffff",
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              textDecoration: "none",
              fontWeight: 700,
            }}
          >
            Browse All Hotels
          </a>
        </div>
      </div>
    );
  }

  const hotelCity = hotel.city || hotel.location?.split(",")?.[0]?.trim() || "Jaipur";
  const hotelImages = hotel.images && hotel.images.length > 0 ? hotel.images : ["/placeholder-hotel.jpg"];
  const heroImage = hotelImages[0];
  const sideImages = hotelImages.slice(1, 5);

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f4f5f7] font-sans antialiased text-[#1f2937]">
      <Header currentPage="hotels" />

      {/* =========================================================================
          1. TOP BREADCRUMBS & ACTION BAR
          ========================================================================= */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb" }}>
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0.75rem 1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: "0.825rem",
            color: "#6b7280",
            flexWrap: "wrap",
            gap: "0.5rem",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <a href="/" style={{ color: "#4b5563", textDecoration: "none" }}>
              Home
            </a>
            <span>›</span>
            <a
              href={`/hotels/search?location=${encodeURIComponent(hotelCity)}`}
              style={{ color: "#0066cc", textDecoration: "none", fontWeight: 500 }}
            >
              Hotels in {hotelCity}
            </a>
            <span>›</span>
            <span style={{ color: "#111827", fontWeight: 600 }}>{hotel.name}</span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: hotel.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  alert("Link copied to clipboard!");
                }
              }}
              style={{
                background: "none",
                border: "none",
                color: "#4b5563",
                fontSize: "0.825rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
                share
              </span>
              Share
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          2. MAKEMYTRIP PROPERTY HEADER SUMMARY
          ========================================================================= */}
      <div style={{ background: "#ffffff", borderBottom: "1px solid #e5e7eb" }}>
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "1.25rem 1rem 1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "1.25rem",
          }}
        >
          {/* Title, Star, Address */}
          <div style={{ flex: "1 1 500px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.35rem" }}>
              <span
                style={{
                  background: "#eff6ff",
                  color: "#0066cc",
                  padding: "0.2rem 0.55rem",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: "0.03em",
                }}
              >
                ★ 4-Star Luxury Stay
              </span>
              <span style={{ color: "#f59e0b", fontSize: "0.9rem" }}>★★★★☆</span>
            </div>

            <h1
              style={{
                fontSize: "clamp(1.6rem, 2.5vw, 2.1rem)",
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 0.4rem 0",
                lineHeight: 1.2,
                letterSpacing: "-0.02em",
              }}
            >
              {hotel.name}
            </h1>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                color: "#4b5563",
                fontSize: "0.9rem",
                flexWrap: "wrap",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "1.1rem", color: "#ef4444" }}>
                location_on
              </span>
              <span>{hotel.address || hotel.location}</span>
              <span style={{ color: "#9ca3af" }}>•</span>
              <button
                onClick={() => scrollToSection("location")}
                style={{
                  background: "none",
                  border: "none",
                  color: "#0066cc",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                View on Map
              </button>
            </div>
          </div>

          {/* MakeMyTrip Rating Box */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.85rem",
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: "12px",
              padding: "0.6rem 0.9rem",
            }}
          >
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: "0.95rem", fontWeight: 800, color: "#0f172a" }}>
                {hotel.rating >= 4.5 ? "Exceptional" : hotel.rating >= 4.0 ? "Very Good" : "Good"}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#64748b" }}>
                {hotel.reviews || 18} Verified Ratings
              </div>
            </div>

            <div
              style={{
                background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "1.15rem",
                padding: "0.4rem 0.65rem",
                borderRadius: "8px",
                display: "flex",
                alignItems: "center",
                gap: "0.2rem",
                boxShadow: "0 2px 6px rgba(22, 163, 74, 0.3)",
              }}
            >
              <span>{hotel.rating || 4.1}</span>
              <span style={{ fontSize: "0.85rem" }}>★</span>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          3. MAKEMYTRIP SIGNATURE PHOTO GALLERY MOSAIC
          ========================================================================= */}
      <div style={{ maxWidth: "1280px", margin: "1rem auto 0", padding: "0 1rem", width: "100%" }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: sideImages.length > 0 ? "60% 40%" : "1fr",
            gap: "8px",
            height: "420px",
            borderRadius: "16px",
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
            background: "#0f172a",
          }}
        >
          {/* Main Large Hero Image (Left) */}
          <div
            style={{
              position: "relative",
              cursor: "pointer",
              overflow: "hidden",
              height: "100%",
            }}
            onClick={() => {
              setFullscreenImageIndex(0);
              setShowFullscreenGallery(true);
            }}
          >
            <img
              src={heroImage}
              alt={hotel.name}
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
                bottom: "12px",
                left: "12px",
                background: "rgba(15, 23, 42, 0.75)",
                color: "#ffffff",
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: "6px",
                backdropFilter: "blur(4px)",
              }}
            >
              Featured Hotel Photography
            </div>
          </div>

          {/* 4 Grid Thumbnails (Right 2x2) */}
          {sideImages.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: "1fr 1fr",
                gap: "8px",
                height: "100%",
              }}
            >
              {sideImages.map((img, idx) => {
                const isLast = idx === sideImages.length - 1;
                const extraCount = Math.max(0, hotelImages.length - 5);

                return (
                  <div
                    key={idx}
                    style={{
                      position: "relative",
                      cursor: "pointer",
                      overflow: "hidden",
                      height: "100%",
                    }}
                    onClick={() => {
                      setFullscreenImageIndex(idx + 1);
                      setShowFullscreenGallery(true);
                    }}
                  >
                    <img
                      src={img}
                      alt={`${hotel.name} ${idx + 2}`}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        transition: "transform 0.3s ease",
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
                    />

                    {/* View All Overlay on bottom-right image */}
                    {isLast && (
                      <div
                        style={{
                          position: "absolute",
                          inset: 0,
                          background: "rgba(15, 23, 42, 0.65)",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          fontWeight: 700,
                          backdropFilter: "blur(2px)",
                          gap: "0.25rem",
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "1.5rem", color: "#F2C65D" }}>
                          photo_camera
                        </span>
                        <span style={{ fontSize: "0.95rem" }}>
                          {extraCount > 0 ? `+${extraCount} More Photos` : "View All Photos"}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          4. MAKEMYTRIP STICKY SUB-NAVIGATION BAR (SCROLLSPY)
          ========================================================================= */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "#ffffff",
          borderBottom: "1px solid #e5e7eb",
          boxShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
          marginTop: "1.25rem",
        }}
      >
        <div
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 1rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Anchor Tabs */}
          <div
            style={{
              display: "flex",
              gap: "1.75rem",
              overflowX: "auto",
              scrollbarWidth: "none",
            }}
          >
            {[
              { id: "overview", label: "Overview" },
              { id: "rooms", label: `Rooms (${hotel.rooms?.length || 0})` },
              { id: "amenities", label: "Amenities" },
              { id: "availability", label: "Availability" },
              { id: "location", label: "Location" },
              { id: "policies", label: "Policies" },
              { id: "reviews", label: `Reviews (${hotel.reviews || 0})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                style={{
                  padding: "0.9rem 0",
                  background: "none",
                  border: "none",
                  borderBottom: activeTab === tab.id ? "3px solid #0066cc" : "3px solid transparent",
                  color: activeTab === tab.id ? "#0066cc" : "#4b5563",
                  fontWeight: activeTab === tab.id ? 700 : 500,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  transition: "all 0.15s ease",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Quick Price Snapshot & Jump to Room CTA */}
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={{ textAlign: "right", display: "none" }}>
              <span style={{ fontSize: "0.75rem", color: "#6b7280" }}>Starts from</span>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                {formatInr(baseRoomPrice)}
                <span style={{ fontSize: "0.75rem", fontWeight: 500, color: "#6b7280" }}>/night</span>
              </div>
            </div>
            <button
              onClick={() => scrollToSection("rooms")}
              style={{
                background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
                color: "#ffffff",
                padding: "0.5rem 1.1rem",
                borderRadius: "8px",
                border: "none",
                fontWeight: 700,
                fontSize: "0.875rem",
                cursor: "pointer",
              }}
            >
              Select Room
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          5. MAIN CONTENT TWO-COLUMN GRID (LEFT: CONTENT, RIGHT: STICKY BOOKING)
          ========================================================================= */}
      <div
        className="property-details-grid"
        style={{
          maxWidth: "1280px",
          margin: "1.5rem auto 3rem",
          padding: "0 1rem",
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "1.75rem",
          alignItems: "start",
          width: "100%",
        }}
      >
        {/* =====================================================================
            LEFT COLUMN
            ===================================================================== */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          {/* SECTION: OVERVIEW & HIGHLIGHTS */}
          <section
            id="overview"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.5rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1rem" }}>
              Property Highlights
            </h2>

            {/* MakeMyTrip Top Features Pill Bar */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
                gap: "0.75rem",
                marginBottom: "1.25rem",
              }}
            >
              {[
                { icon: "wifi", label: "Free High-Speed Wi-Fi" },
                { icon: "restaurant", label: "Multi-Cuisine Dining" },
                { icon: "ac_unit", label: "Air Conditioned Rooms" },
                { icon: "local_parking", label: "Free Parking" },
                { icon: "room_service", label: "Room Service" },
                { icon: "support_agent", label: "24/7 Front Desk" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    padding: "0.65rem 0.85rem",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    border: "1px solid #f1f5f9",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    color: "#334155",
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "1.2rem", color: "#0066cc" }}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <h3 style={{ fontSize: "1rem", fontWeight: 700, color: "#1e293b", margin: "1rem 0 0.5rem" }}>
              About {hotel.name}
            </h3>
            <p style={{ color: "#4b5563", lineHeight: 1.7, fontSize: "0.925rem", margin: 0 }}>
              {hotel.description ||
                `${hotel.name} is a premier luxury destination located in the heart of ${hotelCity}. Featuring meticulously designed rooms, world-class hospitality, in-house gourmet dining, and seamless connectivity to prime city landmarks.`}
            </p>
          </section>

          {/* SECTION: ROOMS SELECTION (MAKEMYTRIP STYLE) */}
          <section
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
                  Select Your Room
                </h2>
                <p style={{ margin: "0.25rem 0 0", color: "#6b7280", fontSize: "0.85rem" }}>
                  {hotel.rooms?.length || 0} room categories available for your stay
                </p>
              </div>

              {/* Date & Guests bar */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  padding: "0.4rem 0.85rem",
                  borderRadius: "8px",
                  fontSize: "0.825rem",
                  color: "#166534",
                  fontWeight: 600,
                }}
              >
                <span>📅 {bookingNights} Night Stay</span>
                <span>•</span>
                <span>👥 {bookingDetails.guests} Guests</span>
              </div>
            </div>

            {/* Room Cards List */}
            <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              {hotel.rooms && hotel.rooms.length > 0 ? (
                hotel.rooms.map((room) => {
                  const isSelected = selectedRoomForBooking?.id === room.id;
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
                        background: isSelected ? "#f8fbff" : "#ffffff",
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
                      >
                        {/* Room Left: Thumbnail & Details Button */}
                        <div style={{ position: "relative", height: "100%", minHeight: "180px", background: "#f1f5f9" }}>
                          <img
                            src={room.images?.[0] || heroImage}
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
                                background: "#dc2626",
                                color: "#ffffff",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                padding: "2px 7px",
                                borderRadius: "4px",
                              }}
                            >
                              {discountPct}% OFF
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setRoomForDetails(room)}
                            style={{
                              position: "absolute",
                              bottom: "8px",
                              left: "8px",
                              right: "8px",
                              background: "rgba(15, 23, 42, 0.8)",
                              color: "#ffffff",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "0.75rem",
                              fontWeight: 600,
                              padding: "0.35rem 0",
                              cursor: "pointer",
                              backdropFilter: "blur(4px)",
                            }}
                          >
                            View Room Photos & Specs
                          </button>
                        </div>

                        {/* Room Right: Name, Specs, Plan Options & Select Button */}
                        <div style={{ padding: "1.25rem 1.25rem 1.25rem 0", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                          <div>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.4rem" }}>
                              <h3 style={{ margin: 0, fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>
                                {room.type}
                              </h3>
                              {isSelected && (
                                <span
                                  style={{
                                    background: "#dcfce7",
                                    color: "#15803d",
                                    fontSize: "0.75rem",
                                    fontWeight: 700,
                                    padding: "3px 8px",
                                    borderRadius: "9999px",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                  }}
                                >
                                  ✔ Selected
                                </span>
                              )}
                            </div>

                            {/* Room Specs Badges */}
                            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", fontSize: "0.825rem", color: "#64748b", marginBottom: "0.75rem" }}>
                              <span>📐 {room.size ? `${room.size} sq.ft` : "240 sq.ft"}</span>
                              <span>•</span>
                              <span>🛏️ {room.bedType || "1 King / Queen Bed"}</span>
                              <span>•</span>
                              <span>👥 Max {room.maxGuests} Guests</span>
                              {room.roomView && (
                                <>
                                  <span>•</span>
                                  <span>🌄 {room.roomView}</span>
                                </>
                              )}
                            </div>

                            {/* Inclusions Checkmarks (MakeMyTrip style) */}
                            <div style={{ display: "grid", gap: "0.35rem", fontSize: "0.85rem", color: "#15803d", fontWeight: 600, marginBottom: "1rem" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                                <span>✔</span>
                                <span>{room.cancellationPolicy || "Free cancellation up to 24 hours before check-in"}</span>
                              </div>
                              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#475569", fontWeight: 500 }}>
                                <span style={{ color: "#0066cc" }}>✔</span>
                                <span>{room.mealPlan || "Complimentary high-speed Wi-Fi included"}</span>
                              </div>
                            </div>
                          </div>

                          {/* Pricing & Selection CTA */}
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-end",
                              borderTop: "1px dashed #cbd5e1",
                              paddingTop: "0.75rem",
                            }}
                          >
                            <div>
                              {room.originalPrice && room.originalPrice > room.price && (
                                <span style={{ fontSize: "0.85rem", color: "#94a3b8", textDecoration: "line-through", display: "block" }}>
                                  {formatInr(room.originalPrice)}
                                </span>
                              )}
                              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a", lineHeight: 1.1 }}>
                                {formatInr(room.price)}
                                <span style={{ fontSize: "0.8rem", color: "#64748b", fontWeight: 500, marginLeft: "4px" }}>
                                  / room / night
                                </span>
                              </div>
                              <span style={{ fontSize: "0.78rem", color: "#64748b" }}>
                                + {formatInr(room.taxesAndFees || Math.round(room.price * 0.12))} taxes & fees
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                setSelectedRoomForBooking(room);
                                scrollToSection("sidebar-booking");
                              }}
                              style={{
                                background: isSelected
                                  ? "#15803d"
                                  : "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
                                color: "#ffffff",
                                padding: "0.65rem 1.4rem",
                                borderRadius: "8px",
                                border: "none",
                                fontWeight: 700,
                                fontSize: "0.9rem",
                                cursor: "pointer",
                                boxShadow: "0 2px 8px rgba(0, 102, 204, 0.25)",
                                transition: "all 0.15s ease",
                              }}
                            >
                              {isSelected ? "Room Selected" : "SELECT ROOM"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
                  No room categories listed yet.
                </div>
              )}
            </div>
          </section>

          {/* SECTION: AMENITIES & FACILITIES */}
          <section
            id="amenities"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.5rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1rem" }}>
              Amenities & Facilities
            </h2>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                gap: "1rem",
              }}
            >
              {(hotel.amenities && hotel.amenities.length > 0
                ? hotel.amenities
                : [
                    "Free Wi-Fi",
                    "Air Conditioning",
                    "Restaurant",
                    "Room Service",
                    "24-Hour Front Desk",
                    "Parking",
                    "Housekeeping",
                    "Power Backup",
                    "Luggage Storage",
                    "CCTV Security",
                  ]
              ).map((amenity, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.6rem",
                    fontSize: "0.9rem",
                    color: "#334155",
                    fontWeight: 500,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: "1.2rem", color: "#16a34a" }}>
                    check_circle
                  </span>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </section>

          {/* SECTION: AVAILABILITY CALENDAR (Placed immediately after Amenities & Facilities and before Location) */}
          <div id="availability">
            <HotelAvailabilityCalendar
              hotelId={hotel._id || hotelId}
              hotelName={hotel.name}
              basePrice={baseRoomPrice}
              currency="INR"
              selectedRoomId={activeRoom?.id}
              checkInDate={bookingDetails.checkIn}
              checkOutDate={bookingDetails.checkOut}
              onDatesChange={(checkIn, checkOut) => {
                setBookingDetails((prev) => ({
                  ...prev,
                  checkIn,
                  checkOut,
                }));
              }}
            />
          </div>

          {/* SECTION: LOCATION & SURROUNDINGS (Matching exact reference screenshot with Leaflet & Teal Pin) */}
          <HotelLocationMap
            hotelName={hotel.name}
            address={hotel.address}
            city={hotel.city}
            location={hotel.location}
            latitude={hotel.latitude}
            longitude={hotel.longitude}
            nearbyPlaces={hotel.nearbyPlaces}
          />

          {/* SECTION: POLICIES */}
          <section
            id="policies"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.5rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 1rem" }}>
              Hotel Policies & House Rules
            </h2>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Check-in / Check-out
                </span>
                <p style={{ margin: "0.35rem 0 0", fontWeight: 600, color: "#0f172a", fontSize: "0.95rem" }}>
                  Check-in from {hotel.checkInTime || "2:00 PM"} • Check-out by {hotel.checkOutTime || "11:00 AM"}
                </p>
              </div>

              <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Cancellation
                </span>
                <p style={{ margin: "0.35rem 0 0", fontWeight: 600, color: "#0f172a", fontSize: "0.95rem" }}>
                  {hotel.policies?.cancellation || "Free cancellation available up to 24 hours before check-in"}
                </p>
              </div>

              <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  Pets Policy
                </span>
                <p style={{ margin: "0.35rem 0 0", fontWeight: 600, color: "#0f172a", fontSize: "0.95rem" }}>
                  {hotel.policies?.pets || "Pets are not allowed on this property"}
                </p>
              </div>

              <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "10px", border: "1px solid #f1f5f9" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase" }}>
                  ID Proofs Accepted
                </span>
                <p style={{ margin: "0.35rem 0 0", fontWeight: 600, color: "#0f172a", fontSize: "0.95rem" }}>
                  Govt. ID (Aadhaar, Passport, Driving License, Voter ID) required at check-in
                </p>
              </div>
            </div>
          </section>

          {/* SECTION: REVIEWS */}
          <section
            id="reviews"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.5rem",
              border: "1px solid #e5e7eb",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.25rem" }}>
              <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: 0 }}>
                Guest Reviews & Ratings
              </h2>
              <div
                style={{
                  background: "#16a34a",
                  color: "#ffffff",
                  padding: "0.25rem 0.65rem",
                  borderRadius: "6px",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                }}
              >
                ★ {hotel.rating || 4.1} / 5
              </div>
            </div>

            {reviews && reviews.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                {reviews.map((rev: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      padding: "1rem",
                      borderRadius: "10px",
                      background: "#f8fafc",
                      border: "1px solid #f1f5f9",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.35rem" }}>
                      <span style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.95rem" }}>
                        {rev.userName || "Verified Guest"}
                      </span>
                      <span style={{ color: "#f59e0b", fontSize: "0.85rem" }}>
                        {"★".repeat(Math.round(rev.rating || 5))}
                      </span>
                    </div>
                    <p style={{ margin: 0, color: "#475569", fontSize: "0.875rem", lineHeight: 1.5 }}>
                      {rev.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  padding: "1.5rem",
                  background: "#f8fafc",
                  borderRadius: "10px",
                  color: "#64748b",
                  fontSize: "0.9rem",
                  textAlign: "center",
                }}
              >
                18 verified guests rated this property with <strong>4.1/5</strong> stars. Excellent cleanliness, prime
                location, and courteous staff service.
              </div>
            )}
          </section>
        </div>

        {/* =====================================================================
            RIGHT COLUMN: MAKEMYTRIP STICKY BOOKING CARD
            ===================================================================== */}
        <div id="sidebar-booking" className="sidebar-booking-card" style={{ position: "sticky", top: "80px" }}>
          <div
            className="sidebar-booking-scroll"
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              padding: "1.5rem",
              border: "1.5px solid #e2e8f0",
              boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
            }}
          >
            {/* Price Header */}
            <div style={{ paddingBottom: "1rem", borderBottom: "1px solid #f1f5f9", marginBottom: "1rem" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                {originalRoomPrice > baseRoomPrice && (
                  <span style={{ fontSize: "1rem", color: "#94a3b8", textDecoration: "line-through" }}>
                    {formatInr(originalRoomPrice)}
                  </span>
                )}
                <span style={{ fontSize: "1.75rem", fontWeight: 800, color: "#0f172a" }}>
                  {formatInr(baseRoomPrice)}
                </span>
                <span style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 500 }}>
                  / room / night
                </span>
              </div>
              <p style={{ margin: "0.2rem 0 0", color: "#64748b", fontSize: "0.78rem" }}>
                + {formatInr(activeRoom?.taxesAndFees || Math.round(baseRoomPrice * 0.12))} taxes &amp; fees per night
              </p>
            </div>

            {/* Selected Room Pill */}
            {activeRoom && (
              <div
                style={{
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "8px",
                  padding: "0.5rem 0.75rem",
                  marginBottom: "1rem",
                  fontSize: "0.825rem",
                  color: "#166534",
                  fontWeight: 600,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <span>Selected: {activeRoom.type}</span>
                <button
                  type="button"
                  onClick={() => scrollToSection("rooms")}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#0066cc",
                    cursor: "pointer",
                    fontWeight: 700,
                    padding: 0,
                  }}
                >
                  Change
                </button>
              </div>
            )}

            {/* Dates Selector */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "0.75rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.25rem", textTransform: "uppercase" }}>
                  Check-in
                </label>
                <input
                  type="date"
                  value={bookingDetails.checkIn}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, checkIn: e.target.value })}
                  min={new Date().toISOString().split("T")[0]}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.65rem",
                    borderRadius: "8px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.25rem", textTransform: "uppercase" }}>
                  Check-out
                </label>
                <input
                  type="date"
                  value={bookingDetails.checkOut}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, checkOut: e.target.value })}
                  min={bookingDetails.checkIn || new Date().toISOString().split("T")[0]}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.65rem",
                    borderRadius: "8px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Rooms & Guests */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.25rem", textTransform: "uppercase" }}>
                  Rooms
                </label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={bookingDetails.rooms}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, rooms: parseInt(e.target.value) || 1 })}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.65rem",
                    borderRadius: "8px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.75rem", fontWeight: 700, color: "#475569", marginBottom: "0.25rem", textTransform: "uppercase" }}>
                  Guests
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={bookingDetails.guests}
                  onChange={(e) => setBookingDetails({ ...bookingDetails, guests: parseInt(e.target.value) || 1 })}
                  style={{
                    width: "100%",
                    padding: "0.55rem 0.65rem",
                    borderRadius: "8px",
                    border: "1.5px solid #cbd5e1",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    boxSizing: "border-box",
                  }}
                />
              </div>
            </div>

            {/* Inline Guest Details Form when user initiates booking */}
            {showBookingForm && (
              <div
                style={{
                  background: "#f8fafc",
                  borderRadius: "10px",
                  padding: "1rem",
                  marginBottom: "1rem",
                  border: "1px solid #e2e8f0",
                }}
              >
                <h4 style={{ margin: "0 0 0.6rem", fontSize: "0.9rem", fontWeight: 700, color: "#0f172a" }}>
                  Guest Details
                </h4>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                  <input
                    type="text"
                    placeholder="Full Name *"
                    value={guestDetails.name}
                    onChange={(e) => setGuestDetails({ ...guestDetails, name: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "0.55rem 0.75rem",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.85rem",
                      boxSizing: "border-box",
                    }}
                  />

                  <input
                    type="email"
                    placeholder="Email Address *"
                    value={guestDetails.email}
                    onChange={(e) => setGuestDetails({ ...guestDetails, email: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "0.55rem 0.75rem",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.85rem",
                      boxSizing: "border-box",
                    }}
                  />

                  <input
                    type="tel"
                    placeholder="Mobile Phone Number *"
                    value={guestDetails.phone}
                    onChange={(e) => setGuestDetails({ ...guestDetails, phone: e.target.value })}
                    required
                    style={{
                      width: "100%",
                      padding: "0.55rem 0.75rem",
                      borderRadius: "6px",
                      border: "1px solid #cbd5e1",
                      fontSize: "0.85rem",
                      boxSizing: "border-box",
                    }}
                  />
                </div>

                {/* Payment Option */}
                <div style={{ marginTop: "0.75rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#475569", textTransform: "uppercase" }}>
                    Payment Mode
                  </span>
                  <div style={{ display: "grid", gap: "0.4rem", marginTop: "0.3rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.825rem", cursor: "pointer" }}>
                      <input
                        type="radio"
                        checked={paymentOption === "full"}
                        onChange={() => setPaymentOption("full")}
                      />
                      <span>Pay full now ({formatInr(bookingTotal)})</span>
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.825rem", cursor: "pointer" }}>
                      <input
                        type="radio"
                        checked={paymentOption === "commission"}
                        onChange={() => setPaymentOption("commission")}
                      />
                      <span>Pay deposit now ({formatInr(depositAmount)})</span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Price Breakdown Summary */}
            <div
              style={{
                background: "#f8fafc",
                borderRadius: "10px",
                padding: "0.85rem 1rem",
                marginBottom: "1.25rem",
                fontSize: "0.85rem",
                display: "grid",
                gap: "0.4rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                <span>{bookingDetails.rooms} Room × {bookingNights} Night{bookingNights > 1 ? "s" : ""}</span>
                <strong>{formatInr(bookingBase)}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#475569" }}>
                <span>Taxes &amp; Service Fees</span>
                <strong>{formatInr(bookingTax + bookingCommission)}</strong>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  color: "#0f172a",
                  fontWeight: 800,
                  fontSize: "1rem",
                  borderTop: "1px solid #e2e8f0",
                  paddingTop: "0.4rem",
                  marginTop: "0.2rem",
                }}
              >
                <span>Total Payable</span>
                <span style={{ color: "#0066cc" }}>{formatInr(bookingTotal)}</span>
              </div>
            </div>

            {/* CTA Button */}
            {showBookingForm ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => setShowBookingForm(false)}
                  style={{
                    padding: "0.85rem",
                    background: "#f1f5f9",
                    color: "#475569",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    cursor: "pointer",
                  }}
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={processingPayment}
                  style={{
                    padding: "0.85rem",
                    background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: 700,
                    fontSize: "0.95rem",
                    cursor: processingPayment ? "not-allowed" : "pointer",
                    boxShadow: "0 4px 14px rgba(22, 163, 74, 0.3)",
                  }}
                >
                  {processingPayment ? "Processing..." : "Pay & Confirm"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!bookingDetails.checkIn || !bookingDetails.checkOut) {
                    alert("Please select check-in and check-out dates");
                    return;
                  }
                  setShowBookingForm(true);
                }}
                style={{
                  width: "100%",
                  padding: "0.95rem",
                  background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "10px",
                  fontWeight: 800,
                  fontSize: "1.05rem",
                  cursor: "pointer",
                  boxShadow: "0 4px 15px rgba(0, 102, 204, 0.3)",
                  transition: "all 0.2s ease",
                  letterSpacing: "0.01em",
                }}
              >
                BOOK THIS STAY
              </button>
            )}

            {/* Reassurance Badges */}
            <div style={{ marginTop: "1rem", display: "grid", gap: "0.35rem", fontSize: "0.78rem", color: "#64748b" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "1rem", color: "#16a34a" }}>
                  check_circle
                </span>
                <span>Instant Confirmation &amp; E-Voucher</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "1rem", color: "#0066cc" }}>
                  lock
                </span>
                <span>100% Safe &amp; Secure Payment (Cashfree)</span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <span className="material-symbols-outlined" style={{ fontSize: "1rem", color: "#f59e0b" }}>
                  verified
                </span>
                <span>Best Price Guarantee</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          6. SIMILAR PROPERTIES (MAKEMYTRIP STYLE)
          ========================================================================= */}
      {similarHotels.length > 0 && (
        <div style={{ maxWidth: "1280px", margin: "0 auto 4rem", padding: "0 1rem", width: "100%" }}>
          <div style={{ background: "#ffffff", borderRadius: "16px", padding: "1.5rem", border: "1px solid #e5e7eb" }}>
            <h2 style={{ fontSize: "1.25rem", fontWeight: 800, color: "#0f172a", margin: "0 0 0.35rem" }}>
              Similar Properties in {hotelCity}
            </h2>
            <p style={{ margin: "0 0 1.25rem", color: "#6b7280", fontSize: "0.85rem" }}>
              Travelers looking at {hotel.name} also viewed these verified stays
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1.25rem" }}>
              {similarHotels.map((sim: any) => (
                <a
                  key={sim._id}
                  href={`/hotels/${sim._id}`}
                  style={{
                    textDecoration: "none",
                    color: "inherit",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    overflow: "hidden",
                    background: "#ffffff",
                    display: "flex",
                    flexDirection: "column",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0, 0, 0, 0.08)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{ height: "160px", position: "relative" }}>
                    <img
                      src={sim.images?.[0] || sim.image || "/placeholder-hotel.jpg"}
                      alt={sim.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                    {sim.rating && (
                      <span
                        style={{
                          position: "absolute",
                          top: "8px",
                          right: "8px",
                          background: "#16a34a",
                          color: "#ffffff",
                          fontSize: "0.75rem",
                          fontWeight: 700,
                          padding: "2px 6px",
                          borderRadius: "4px",
                        }}
                      >
                        ★ {sim.rating}
                      </span>
                    )}
                  </div>
                  <div style={{ padding: "0.85rem 1rem", flex: 1, display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
                    <div>
                      <h4 style={{ margin: "0 0 0.25rem", fontSize: "0.95rem", fontWeight: 700, color: "#0f172a" }}>
                        {sim.name}
                      </h4>
                      <p style={{ margin: 0, fontSize: "0.8rem", color: "#64748b" }}>📍 {sim.location}</p>
                    </div>
                    <div style={{ marginTop: "0.75rem", fontSize: "1.05rem", fontWeight: 800, color: "#0066cc" }}>
                      {formatInr(sim.rooms?.[0]?.price || sim.price || 3500)}
                      <span style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 500 }}> / night</span>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          7. FULLSCREEN IMAGE GALLERY MODAL
          ========================================================================= */}
      {showFullscreenGallery && hotelImages.length > 0 && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 15, 29, 0.96)",
            zIndex: 100000,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "1.5rem",
            backdropFilter: "blur(6px)",
          }}
          onClick={() => setShowFullscreenGallery(false)}
        >
          {/* Top Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              color: "#ffffff",
            }}
          >
            <div>
              <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: 700 }}>{hotel.name}</h3>
              <p style={{ margin: 0, fontSize: "0.8rem", color: "#94a3b8" }}>
                Photo {fullscreenImageIndex + 1} of {hotelImages.length}
              </p>
            </div>
            <button
              onClick={() => setShowFullscreenGallery(false)}
              style={{
                background: "rgba(255, 255, 255, 0.15)",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                color: "#ffffff",
                fontSize: "1.5rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ✕
            </button>
          </div>

          {/* Main Photo with Next/Prev */}
          <div
            style={{
              position: "relative",
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "1rem 0",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {fullscreenImageIndex > 0 && (
              <button
                onClick={() => setFullscreenImageIndex(fullscreenImageIndex - 1)}
                style={{
                  position: "absolute",
                  left: "1rem",
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  borderRadius: "50%",
                  width: "48px",
                  height: "48px",
                  color: "#ffffff",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                ‹
              </button>
            )}

            <img
              src={hotelImages[fullscreenImageIndex]}
              alt={`Photo ${fullscreenImageIndex + 1}`}
              style={{
                maxWidth: "85vw",
                maxHeight: "75vh",
                objectFit: "contain",
                borderRadius: "10px",
                boxShadow: "0 10px 40px rgba(0, 0, 0, 0.5)",
              }}
            />

            {fullscreenImageIndex < hotelImages.length - 1 && (
              <button
                onClick={() => setFullscreenImageIndex(fullscreenImageIndex + 1)}
                style={{
                  position: "absolute",
                  right: "1rem",
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "none",
                  borderRadius: "50%",
                  width: "48px",
                  height: "48px",
                  color: "#ffffff",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                ›
              </button>
            )}
          </div>

          {/* Thumbnail Strip */}
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              justifyContent: "center",
              overflowX: "auto",
              paddingTop: "0.5rem",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {hotelImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="thumb"
                onClick={() => setFullscreenImageIndex(idx)}
                style={{
                  width: "60px",
                  height: "45px",
                  objectFit: "cover",
                  borderRadius: "6px",
                  cursor: "pointer",
                  border: fullscreenImageIndex === idx ? "2px solid #F2C65D" : "2px solid transparent",
                  opacity: fullscreenImageIndex === idx ? 1 : 0.6,
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          8. ROOM DETAILS MODAL
          ========================================================================= */}
      {roomForDetails && (
        <div
          role="dialog"
          aria-modal="true"
          onClick={() => setRoomForDetails(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.7)",
            zIndex: 100000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: "16px",
              maxWidth: "680px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "1.5rem",
              boxShadow: "0 20px 50px rgba(0, 0, 0, 0.25)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.75rem", fontWeight: 700, color: "#0066cc", textTransform: "uppercase" }}>
                  Room Details &amp; Amenities
                </span>
                <h3 style={{ margin: "0.2rem 0 0", fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>
                  {roomForDetails.type}
                </h3>
              </div>
              <button
                onClick={() => setRoomForDetails(null)}
                style={{ background: "#f1f5f9", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", fontSize: "1.2rem" }}
              >
                ✕
              </button>
            </div>

            {/* Room Photo Gallery */}
            {roomForDetails.images && roomForDetails.images.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.5rem", marginBottom: "1rem" }}>
                {roomForDetails.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt={roomForDetails.type}
                    style={{ width: "100%", height: "110px", objectFit: "cover", borderRadius: "8px" }}
                  />
                ))}
              </div>
            )}

            {/* Specs Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "8px" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Room Size</span>
                <div style={{ fontWeight: 700, color: "#0f172a" }}>{roomForDetails.size ? `${roomForDetails.size} sq.ft` : "240 sq.ft"}</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "8px" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Bed Type</span>
                <div style={{ fontWeight: 700, color: "#0f172a" }}>{roomForDetails.bedType || "1 Queen Bed"}</div>
              </div>
              <div style={{ background: "#f8fafc", padding: "0.75rem", borderRadius: "8px" }}>
                <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Max Occupancy</span>
                <div style={{ fontWeight: 700, color: "#0f172a" }}>{roomForDetails.maxGuests} Guests</div>
              </div>
            </div>

            {/* Room Amenities */}
            <h4 style={{ fontSize: "0.95rem", fontWeight: 700, margin: "0 0 0.5rem", color: "#0f172a" }}>
              Inclusions &amp; Room Amenities
            </h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1.25rem" }}>
              {(roomForDetails.amenities && roomForDetails.amenities.length > 0
                ? roomForDetails.amenities
                : ["Air Conditioning", "Ensuite Bathroom", "Electric Kettle", "LED TV", "Free Wi-Fi", "Intercom", "Daily Housekeeping"]
              ).map((am, i) => (
                <span
                  key={i}
                  style={{
                    padding: "0.3rem 0.65rem",
                    borderRadius: "6px",
                    background: "#eff6ff",
                    color: "#0369a1",
                    fontSize: "0.825rem",
                    fontWeight: 500,
                  }}
                >
                  ✔ {am}
                </span>
              ))}
            </div>

            {/* Modal Bottom CTA */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e2e8f0", paddingTop: "1rem" }}>
              <div>
                <span style={{ fontSize: "0.8rem", color: "#64748b" }}>Price per night</span>
                <div style={{ fontSize: "1.35rem", fontWeight: 800, color: "#0066cc" }}>
                  {formatInr(roomForDetails.price)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedRoomForBooking(roomForDetails);
                  setRoomForDetails(null);
                  scrollToSection("sidebar-booking");
                }}
                style={{
                  background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
                  color: "#ffffff",
                  padding: "0.65rem 1.5rem",
                  borderRadius: "8px",
                  border: "none",
                  fontWeight: 700,
                  fontSize: "0.9rem",
                  cursor: "pointer",
                }}
              >
                SELECT THIS ROOM
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
