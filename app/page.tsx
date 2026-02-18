"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Header from "./components/Header";
import ReviewForm from "./components/ReviewForm";
import ImageModal from "./components/ImageModal";
import DatePicker from "./components/DatePicker";
import { formatDateShort } from "@/lib/utils/dateFormat";

// Dynamic import for ServiceBookingFormEnhanced
const ServiceBookingFormEnhanced = dynamic(
  () => import("./components/ServiceBookingFormEnhanced"),
  {
    ssr: false,
    loading: () => (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading form...
      </div>
    ),
  },
);

// Types
interface Service {
  _id?: string;
  id?: string;
  icon: string;
  title: string;
  description: string;
  href: string;
  image: string;
}

interface Review {
  _id?: string;
  id?: string;
  userId: string;
  userName: string;
  userImage: string;
  propertyId: string;
  propertyName: string;
  propertyType: string;
  rating: number;
  reviewText: string;
  reviewImages: string[];
  createdAt: string;
  verified: boolean;
  active: boolean;
}

interface WhyUs {
  _id?: string;
  id?: string;
  icon: string;
  title: string;
  description: string;
  order: number;
  active: boolean;
}

interface Event {
  _id?: string;
  id?: string;
  eventName: string;
  description: string;
  location: string;
  state: string;
  city: string;
  startDate: string;
  endDate: string;
  profileImage: string;
  galleryImages: string[];
  organizer: string;
  category: string;
  ticketPrice: number;
  registrationLink: string;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

// All data will be fetched from database via API endpoints

export default function Home() {
  const router = useRouter();

  // Services State
  const [services, setServices] = useState<Service[]>([]);
  const [servicesLoading, setServicesLoading] = useState(true);

  // Reviews State
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(true);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [selectedPropertyForReview, setSelectedPropertyForReview] = useState<{
    id: string;
    name: string;
    type: string;
  } | null>(null);
  const [selectedImageModal, setSelectedImageModal] = useState<{
    images: string[];
    index: number;
  } | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);

  // Why Us State
  const [whyUs, setWhyUs] = useState<WhyUs[]>([]);
  const [whyUsLoading, setWhyUsLoading] = useState(true);

  // Events State
  const [events, setEvents] = useState<Event[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [eventCarouselIndex, setEventCarouselIndex] = useState(0);
  const [eventCardsPerView, setEventCardsPerView] = useState(4);
  const [isEventCarouselHovered, setIsEventCarouselHovered] = useState(false);

  // Hero Section State
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const heroImages = [
    { image: "/hero1.jpeg", tagline: "Crafting Journeys, Creating Memories." },
    { image: "/hero2.jpeg", tagline: "Travel Smart. Travel Expertz." },
    {
      image: "/hero3.jpeg",
      tagline: "Beyond Destinations, We Design Experiences.",
    },
    {
      image: "/hero4.jpeg",
      tagline: "Seamless Travel, Unforgettable Experiences.",
    },
  ];

  // Service Booking Modal State
  const [selectedServiceForBooking, setSelectedServiceForBooking] = useState<
    string | null
  >(null);

  // Hotel Search Filters State
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

  // Handler for search
  const handleSearch = () => {
    const params = new URLSearchParams({
      location: filters.location || "",
      checkIn: filters.checkIn || "",
      checkOut: filters.checkOut || "",
      guests: filters.guests || "2",
      rooms: filters.rooms || "1",
      priceRange: filters.priceRange || "all",
    });
    router.push(`/hotels/search?${params.toString()}`);
  };

  // Map service title to booking form type
  const mapServiceToBookingType = (serviceTitle: string): string | null => {
    const title = serviceTitle.toLowerCase();
    if (
      title.includes("car") ||
      title.includes("rental") ||
      title.includes("cab")
    )
      return "car-rental";
    if (title.includes("flight") || title.includes("air")) return "flight";
    if (title.includes("bus")) return "bus";
    if (title.includes("train") || title.includes("railway")) return "train";
    if (title.includes("visa")) return "visa";
    if (
      title.includes("forex") ||
      title.includes("currency") ||
      title.includes("exchange")
    )
      return "forex";
    if (title.includes("insurance")) return "insurance";
    return null; // For services without booking forms
  };

  // Fetch services
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const response = await fetch("/api/services", {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          const serviceList = Array.isArray(data)
            ? data
            : Array.isArray(data.data)
              ? data.data
              : [];
          if (serviceList.length > 0) {
            setServices(serviceList);
          }
        }
      } catch (error) {
        console.log("Failed to fetch services", error);
      } finally {
        setServicesLoading(false);
      }
    };
    fetchServices();
  }, []);

  // Fetch Reviews
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch("/api/reviews?limit=4", {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          const reviewList = Array.isArray(data) ? data : [];
          if (reviewList.length > 0) {
            setReviews(reviewList);
          }
        }
      } catch (error) {
        console.log("Failed to fetch reviews", error);
      } finally {
        setReviewsLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Carousel Auto-Advance
  useEffect(() => {
    if (reviews.length === 0 || carouselPaused) return;

    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % reviews.length);
    }, 5000); // Auto-advance every 5 seconds

    return () => clearInterval(interval);
  }, [reviews.length, carouselPaused]);

  // Fetch Why Us
  useEffect(() => {
    const fetchWhyUs = async () => {
      try {
        const response = await fetch("/api/whyus", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          const whyUsList = Array.isArray(data)
            ? data
            : Array.isArray(data.data)
              ? data.data
              : [];
          if (whyUsList.length > 0) setWhyUs(whyUsList);
        }
      } catch (error) {
        console.log("Failed to fetch Why Us", error);
      } finally {
        setWhyUsLoading(false);
      }
    };
    fetchWhyUs();
  }, []);

  // Fetch Events
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          const eventsList = Array.isArray(data) ? data : [];
          if (eventsList.length > 0) setEvents(eventsList);
        }
      } catch (error) {
        console.log("Failed to fetch events", error);
      } finally {
        setEventsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    const updateCardsPerView = () => {
      if (window.innerWidth < 640) {
        setEventCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setEventCardsPerView(2);
      } else {
        setEventCardsPerView(4);
      }
    };

    updateCardsPerView();
    window.addEventListener("resize", updateCardsPerView);
    return () => window.removeEventListener("resize", updateCardsPerView);
  }, []);

  useEffect(() => {
    const maxIndex = Math.max(0, events.length - eventCardsPerView);
    setEventCarouselIndex((prev) => Math.min(prev, maxIndex));
  }, [events.length, eventCardsPerView]);

  useEffect(() => {
    if (
      eventsLoading ||
      events.length <= eventCardsPerView ||
      isEventCarouselHovered
    )
      return;

    const maxIndex = Math.max(0, events.length - eventCardsPerView);
    const interval = setInterval(() => {
      setEventCarouselIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }, 2800);

    return () => clearInterval(interval);
  }, [eventsLoading, events.length, eventCardsPerView, isEventCarouselHovered]);

  // Hero Image Rotation
  useEffect(() => {
    const interval = setInterval(() => {
      setHeroImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 5000); // Change image every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  // Debug: Monitor service booking modal state
  useEffect(() => {
    console.log(
      "selectedServiceForBooking changed to:",
      selectedServiceForBooking,
    );
  }, [selectedServiceForBooking]);

  // Add escape key handler to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedServiceForBooking) {
        console.log("Escape pressed, closing modal");
        setSelectedServiceForBooking(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedServiceForBooking]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* TopNavBar */}
      <Header currentPage="home" />

      <main className="flex flex-col items-center w-full">
        {/* ========== HERO SECTION ========== */}
        <div
          className="w-full"
          style={{ background: "transparent", padding: 0 }}
        >
          <div
            className="hero-section"
            style={{
              backgroundImage: `url('${heroImages[heroImageIndex].image}')`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              overflow: "hidden",
              transition: "background-image 0.8s ease-in-out",
            }}
          >
            <div
              className="hero-content"
              style={{ position: "relative", zIndex: 10 }}
            >
              {/* Badge pill */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.4rem",
                  padding: "0.4rem 1rem",
                  background: "rgba(255,255,255,0.7)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                  border: "1px solid rgba(59,130,246,0.15)",
                  borderRadius: "50px",
                  marginBottom: "1.2rem",
                  fontSize: "clamp(0.7rem, 2vw, 0.82rem)",
                  color: "#1e40af",
                  fontWeight: 600,
                  boxShadow: "0 2px 12px rgba(59,130,246,0.08)",
                  animation: "fadeInUp 0.8s ease-out",
                  animationDelay: "0.1s",
                  animationFillMode: "both",
                }}
              >
                <span
                  style={{
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#3b82f6",
                    display: "inline-block",
                    boxShadow: "0 0 8px rgba(59,130,246,0.4)",
                    animation: "pulse 2s ease infinite",
                  }}
                />
                India&apos;s Trusted Travel Platform
              </div>

              <h1
                style={{
                  animation: "fadeInUp 0.8s ease-out",
                  animationDelay: "0.25s",
                  animationFillMode: "both",
                  fontSize: "clamp(2rem, 5vw, 3.5rem)",
                  color: "#ffffff",
                  textShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
                  fontWeight: 700,
                  lineHeight: 1.2,
                }}
              >
                {heroImages[heroImageIndex].tagline}
              </h1>

              {/* Trust Indicators */}
              <div
                className="trust-indicators"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "clamp(0.5rem, 2vw, 1rem)",
                  marginTop: "clamp(0.75rem, 2vw, 1.5rem)",
                  flexWrap: "wrap",
                  animation: "fadeInUp 0.8s ease-out",
                  animationDelay: "0.6s",
                  animationFillMode: "both",
                  padding: "0 0.5rem",
                }}
              >
                {[
                  {
                    icon: "verified",
                    text: "Verified",
                    fullText: "Verified Properties",
                  },
                  {
                    icon: "support_agent",
                    text: "24/7",
                    fullText: "24/7 Support",
                  },
                  { icon: "lock", text: "Secure", fullText: "Secure Booking" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="trust-item"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "clamp(0.25rem, 1vw, 0.5rem)",
                      padding:
                        "clamp(0.35rem, 1vw, 0.5rem) clamp(0.6rem, 1.5vw, 1rem)",
                      background: "rgba(255,255,255,0.65)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                      borderRadius: "0.75rem",
                      border: "1px solid rgba(59,130,246,0.12)",
                      boxShadow: "0 2px 8px rgba(59,130,246,0.06)",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 6px 20px rgba(59,130,246,0.12)";
                      e.currentTarget.style.borderColor =
                        "rgba(59,130,246,0.25)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(59,130,246,0.06)";
                      e.currentTarget.style.borderColor =
                        "rgba(59,130,246,0.12)";
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "clamp(0.875rem, 2.5vw, 1.1rem)",
                        color: "#2563eb",
                      }}
                    >
                      {item.icon}
                    </span>
                    <span
                      style={{
                        fontSize: "clamp(0.65rem, 2vw, 0.8rem)",
                        fontWeight: 600,
                        color: "#1e3a8a",
                      }}
                    >
                      {item.fullText}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Search Form Box */}
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
                background: "transparent",
                border: "none",
                boxShadow: "none",
              }}
            >
              <div className="search-box-content">
                <div className="search-item">
                  <span className="material-symbols-outlined">location_on</span>
                  <input
                    type="text"
                    placeholder="Location"
                    value={filters.location}
                    onChange={(e) =>
                      setFilters({ ...filters, location: e.target.value })
                    }
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSearch();
                      }
                    }}
                    style={{
                      border: "none",
                      outline: "none",
                      background: "transparent",
                      flex: 1,
                      fontSize: "0.9rem",
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
                  <DatePicker
                    value={filters.checkIn}
                    onChange={(date) =>
                      setFilters({ ...filters, checkIn: date })
                    }
                    placeholder="Check-in"
                  />
                </div>
                <div className="search-item">
                  <span className="material-symbols-outlined">
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
                      background: "transparent",
                      flex: 1,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                    }}
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="5">5+ Guests</option>
                  </select>
                  <span
                    className="material-symbols-outlined"
                    style={{ marginLeft: "auto" }}
                  >
                    arrow_drop_down
                  </span>
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
                      background: "transparent",
                      flex: 1,
                      fontSize: "0.9rem",
                      cursor: "pointer",
                    }}
                  >
                    <option value="1">1 Room</option>
                    <option value="2">2 Rooms</option>
                    <option value="3">3 Rooms</option>
                    <option value="4">4+ Rooms</option>
                  </select>
                  <span
                    className="material-symbols-outlined"
                    style={{ marginLeft: "auto" }}
                  >
                    arrow_drop_down
                  </span>
                </div>
                <button
                  className="search-btn"
                  onClick={handleSearch}
                  style={{
                    background:
                      "linear-gradient(135deg, var(--primary) 0%, #0052a3 100%)",
                    boxShadow: "0 4px 15px rgba(0, 102, 204, 0.4)",
                    transition: "all 0.3s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 20px rgba(0, 102, 204, 0.5)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 15px rgba(0, 102, 204, 0.4)";
                  }}
                >
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* ========== SERVICES SECTION ========== */}
          <section
            className="services-section"
            style={{
              padding: "clamp(1rem, 2.5vw, 2rem) clamp(0.5rem, 2vw, 1rem)",
              background: "transparent",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                maxWidth: "1200px",
                margin: "0 auto",
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Section Header */}
              <div
                className="services-header"
                style={{
                  textAlign: "center",
                  marginBottom: "clamp(1.5rem, 4vw, 2.5rem)",
                  padding: "0 0.5rem",
                }}
              >
                <h2
                  style={{
                    fontSize: "clamp(1.5rem, 5vw, 2.25rem)",
                    fontWeight: 800,
                    textAlign: "center",
                    margin: "0 0 0.5rem 0",
                    color: "#1a1a2e",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Our Services
                </h2>
                <p
                  className="services-subtitle"
                  style={{
                    fontSize: "clamp(0.85rem, 2.5vw, 1rem)",
                    color: "#666",
                    maxWidth: "500px",
                    margin: "0 auto",
                    lineHeight: 1.5,
                  }}
                >
                  Comprehensive travel solutions for your journey
                </p>
              </div>

              {/* Services Grid - Optimized */}
              <div
                className="services-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "clamp(0.5rem, 2vw, 1rem)",
                }}
              >
                {services.length === 0 && (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      padding: "2rem",
                      textAlign: "center",
                      color: "red",
                    }}
                  >
                    No services found!
                  </div>
                )}
                {services.map((service, index) => (
                  <div
                    key={service._id || service.id || index}
                    className="service-card"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const title = service.title?.toLowerCase() || "";
                      if (title.includes("tour") || title.includes("package")) {
                        window.location.href = "/packages";
                        return;
                      }
                      console.log("Service clicked:", service.title);
                      const bookingType = mapServiceToBookingType(
                        service.title,
                      );
                      console.log("Booking type:", bookingType);
                      if (bookingType) {
                        console.log("Setting modal state to:", bookingType);
                        setSelectedServiceForBooking(bookingType);
                        console.log("Modal state set to:", bookingType);
                      } else {
                        console.log(
                          "No booking type matched for:",
                          service.title,
                        );
                      }
                    }}
                    style={{
                      cursor: "pointer",
                      borderRadius: "clamp(10px, 2vw, 16px)",
                      overflow: "hidden",
                      background: "#fff",
                      border: "1px solid rgba(0, 0, 0, 0.08)",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                      transition: "all 0.3s ease",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.boxShadow =
                        "0 12px 24px rgba(0, 102, 204, 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0, 0, 0, 0.06)";
                    }}
                  >
                    {/* Image */}
                    <div
                      className="service-image-wrapper"
                      style={{
                        width: "100%",
                        aspectRatio: "4/3",
                        overflow: "hidden",
                        background:
                          "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                        position: "relative",
                      }}
                    >
                      <img
                        src={service.image}
                        alt={service.title}
                        loading="lazy"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.05)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      />
                      {/* Gradient Overlay for better text visibility on mobile */}
                      <div
                        className="service-overlay"
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          height: "50%",
                          background:
                            "linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 100%)",
                          opacity: 0,
                          transition: "opacity 0.3s ease",
                          pointerEvents: "none",
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div
                      className="service-content"
                      style={{
                        padding: "clamp(0.625rem, 2vw, 1rem)",
                      }}
                    >
                      <h3
                        className="service-title"
                        style={{
                          fontSize: "clamp(0.8rem, 2.5vw, 1rem)",
                          fontWeight: 700,
                          color: "#1a1a2e",
                          marginBottom: "clamp(0.25rem, 1vw, 0.375rem)",
                          lineHeight: 1.3,
                        }}
                      >
                        {service.title}
                      </h3>
                      <p
                        className="service-description"
                        style={{
                          fontSize: "clamp(0.7rem, 2vw, 0.8rem)",
                          color: "#666",
                          lineHeight: 1.4,
                          margin: 0,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {service.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ========== UPCOMING EVENTS SECTION ========== */}
          <section
            className="upcoming-events-section"
            style={{
              padding: "clamp(1rem, 2.5vw, 2rem) clamp(0.5rem, 2vw, 1.5rem)",
              background: "#fff",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background Decorations */}
            <div
              className="hidden md:block"
              style={{
                position: "absolute",
                top: "-80px",
                left: "-80px",
                width: "300px",
                height: "300px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(102, 126, 234, 0.05) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              className="hidden md:block"
              style={{
                position: "absolute",
                bottom: "-60px",
                right: "-60px",
                width: "250px",
                height: "250px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(118, 75, 162, 0.04) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                maxWidth: "1200px",
                margin: "0 auto",
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Section Header */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "clamp(2rem, 5vw, 3rem)",
                  padding: "0 0.5rem",
                }}
              >
                <h2
                  style={{
                    fontSize: "clamp(1.5rem, 5vw, 2.25rem)",
                    fontWeight: 800,
                    textAlign: "center",
                    margin: "0 0 0.5rem 0",
                    color: "#1a1a2e",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Upcoming Events
                </h2>
                <p
                  style={{
                    fontSize: "clamp(0.85rem, 2.5vw, 1rem)",
                    color: "#666",
                    maxWidth: "600px",
                    margin: "0 auto",
                    lineHeight: 1.5,
                  }}
                >
                  Discover and join exciting travel events happening near you.
                  From festivals to adventure experiences, find your next
                  adventure
                </p>
              </div>

              {/* Events Grid */}
              {eventsLoading ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fill, minmax(260px, 1fr))",
                    gap: "1.25rem",
                  }}
                >
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#fff",
                        borderRadius: "16px",
                        overflow: "hidden",
                        border: "1px solid rgba(0,0,0,0.06)",
                      }}
                    >
                      <div
                        style={{
                          height: "190px",
                          background:
                            "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                          backgroundSize: "200% 100%",
                          animation: "shimmer 1.5s infinite",
                        }}
                      />
                      <div style={{ padding: "1rem" }}>
                        <div
                          style={{
                            height: "18px",
                            width: "75%",
                            background:
                              "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                            backgroundSize: "200% 100%",
                            borderRadius: "6px",
                            marginBottom: "0.6rem",
                            animation: "shimmer 1.5s infinite",
                          }}
                        />
                        <div
                          style={{
                            height: "14px",
                            width: "55%",
                            background:
                              "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                            backgroundSize: "200% 100%",
                            borderRadius: "6px",
                            animation: "shimmer 1.5s infinite",
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div
                  style={{
                    textAlign: "center",
                    padding: "3rem 1rem",
                    background:
                      "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                    borderRadius: "16px",
                    color: "#999",
                  }}
                >
                  <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                    No upcoming events at the moment
                  </p>
                  <p style={{ fontSize: "0.9rem", margin: 0 }}>
                    Check back soon for exciting travel experiences!
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className="events-carousel-viewport"
                    onMouseEnter={() => setIsEventCarouselHovered(true)}
                    onMouseLeave={() => setIsEventCarouselHovered(false)}
                    style={{
                      overflow: "hidden",
                      margin: "0 -0.625rem",
                    }}
                  >
                    <div
                      className="events-carousel-track"
                      style={{
                        display: "flex",
                        transition: "transform 0.7s ease",
                        transform: `translateX(-${(eventCarouselIndex * 100) / eventCardsPerView}%)`,
                        willChange: "transform",
                      }}
                    >
                      {events.map((event, index) => {
                        const categoryIcons: Record<string, string> = {
                          Festival: "🎪",
                          Cultural: "🎭",
                          Adventure: "🏔️",
                          Music: "🎵",
                          Food: "🍽️",
                          Sports: "⚽",
                          Wellness: "🧘",
                          Other: "✨",
                        };
                        const startD = new Date(event.startDate);
                        const day = startD.getDate().toString();
                        const month = startD
                          .toLocaleDateString("en-IN", { month: "short" })
                          .toUpperCase();
                        const now = new Date();
                        const diffDays = Math.ceil(
                          (startD.getTime() - now.getTime()) /
                            (1000 * 60 * 60 * 24),
                        );
                        const countdown =
                          diffDays < 0
                            ? "Ongoing"
                            : diffDays === 0
                              ? "Today!"
                              : diffDays === 1
                                ? "Tomorrow"
                                : `In ${diffDays} days`;
                        const isToday = countdown === "Today!";
                        const isOngoing = countdown === "Ongoing";
                        const desc = (event.description || "").replace(
                          /<[^>]*>/g,
                          "",
                        );
                        const shortDesc =
                          desc.length > 100 ? desc.slice(0, 100) + "..." : desc;

                        return (
                          <div
                            key={event._id || event.id || index}
                            style={{
                              flex: `0 0 ${100 / eventCardsPerView}%`,
                              padding: "0 0.625rem",
                              boxSizing: "border-box",
                            }}
                          >
                            <a
                              href={`/events/${event._id}`}
                              className="event-card"
                              style={{
                                cursor: "pointer",
                                borderRadius: "16px",
                                overflow: "hidden",
                                background: "#fff",
                                border: "1px solid rgba(0, 0, 0, 0.06)",
                                boxShadow: "0 1px 4px rgba(0, 0, 0, 0.06)",
                                transition:
                                  "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                                textDecoration: "none",
                                display: "flex",
                                flexDirection: "column",
                                height: "100%",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(-6px)";
                                e.currentTarget.style.boxShadow =
                                  "0 16px 40px rgba(0, 0, 0, 0.12)";
                                e.currentTarget.style.borderColor =
                                  "rgba(10,102,194,0.15)";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform =
                                  "translateY(0)";
                                e.currentTarget.style.boxShadow =
                                  "0 1px 4px rgba(0, 0, 0, 0.06)";
                                e.currentTarget.style.borderColor =
                                  "rgba(0,0,0,0.06)";
                              }}
                            >
                              {/* Image */}
                              <div
                                style={{
                                  position: "relative",
                                  height: "190px",
                                  overflow: "hidden",
                                }}
                              >
                                <img
                                  src={event.profileImage}
                                  alt={event.eventName}
                                  loading="lazy"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    transition: "transform 0.5s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                      "scale(1.05)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                      "scale(1)";
                                  }}
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src =
                                      "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600";
                                  }}
                                />

                                {/* Date Badge - Top Left */}
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "10px",
                                    left: "10px",
                                    background: "white",
                                    borderRadius: "12px",
                                    padding: "0.35rem 0.55rem",
                                    textAlign: "center",
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                                    minWidth: "46px",
                                  }}
                                >
                                  <div
                                    style={{
                                      fontSize: "1.2rem",
                                      fontWeight: 800,
                                      color: "#0a66c2",
                                      lineHeight: 1,
                                    }}
                                  >
                                    {day}
                                  </div>
                                  <div
                                    style={{
                                      fontSize: "0.6rem",
                                      fontWeight: 700,
                                      color: "#6b7280",
                                      textTransform: "uppercase",
                                      letterSpacing: "0.05em",
                                    }}
                                  >
                                    {month}
                                  </div>
                                </div>

                                {/* Countdown Badge - Top Right */}
                                <div
                                  style={{
                                    position: "absolute",
                                    top: "10px",
                                    right: "10px",
                                    background: isToday
                                      ? "linear-gradient(135deg, #ef4444, #dc2626)"
                                      : isOngoing
                                        ? "linear-gradient(135deg, #10b981, #059669)"
                                        : "linear-gradient(135deg, #0a66c2, #004c99)",
                                    color: "white",
                                    borderRadius: "999px",
                                    padding: "0.25rem 0.7rem",
                                    fontSize: "0.68rem",
                                    fontWeight: 700,
                                    boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                                  }}
                                >
                                  {countdown}
                                </div>

                                {/* Category Badge - Bottom Left */}
                                {event.category && (
                                  <div
                                    style={{
                                      position: "absolute",
                                      bottom: "10px",
                                      left: "10px",
                                      background: "rgba(0,0,0,0.65)",
                                      backdropFilter: "blur(8px)",
                                      color: "white",
                                      borderRadius: "8px",
                                      padding: "0.2rem 0.6rem",
                                      fontSize: "0.7rem",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {categoryIcons[event.category] || "✨"}{" "}
                                    {event.category}
                                  </div>
                                )}
                              </div>

                              {/* Content */}
                              <div
                                style={{
                                  padding: "1rem 1rem 0.7rem",
                                  flex: 1,
                                  display: "flex",
                                  flexDirection: "column",
                                }}
                              >
                                <h3
                                  style={{
                                    fontSize: "1rem",
                                    fontWeight: 700,
                                    color: "#1a1a2e",
                                    marginBottom: "0.4rem",
                                    lineHeight: 1.3,
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                    margin: "0 0 0.4rem 0",
                                  }}
                                >
                                  {event.eventName}
                                </h3>

                                <p
                                  style={{
                                    fontSize: "0.8rem",
                                    color: "#6b7280",
                                    lineHeight: 1.5,
                                    margin: "0 0 0.6rem 0",
                                    display: "-webkit-box",
                                    WebkitLineClamp: 2,
                                    WebkitBoxOrient: "vertical",
                                    overflow: "hidden",
                                  }}
                                >
                                  {shortDesc}
                                </p>

                                {/* Details */}
                                <div
                                  style={{
                                    marginTop: "auto",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: "0.3rem",
                                  }}
                                >
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.35rem",
                                      fontSize: "0.78rem",
                                      color: "#6b7280",
                                    }}
                                  >
                                    <span
                                      className="material-symbols-outlined"
                                      style={{
                                        fontSize: "0.9rem",
                                        color: "#0a66c2",
                                      }}
                                    >
                                      location_on
                                    </span>
                                    {event.city && event.state
                                      ? `${event.city}, ${event.state}`
                                      : event.location || event.state}
                                  </div>
                                  <div
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: "0.35rem",
                                      fontSize: "0.78rem",
                                      color: "#6b7280",
                                    }}
                                  >
                                    <span
                                      className="material-symbols-outlined"
                                      style={{
                                        fontSize: "0.9rem",
                                        color: "#0a66c2",
                                      }}
                                    >
                                      calendar_today
                                    </span>
                                    {new Date(
                                      event.startDate,
                                    ).toLocaleDateString("en-IN", {
                                      year: "numeric",
                                      month: "short",
                                      day: "numeric",
                                    })}
                                    {event.endDate &&
                                      ` — ${new Date(event.endDate).toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}`}
                                  </div>
                                </div>
                              </div>

                              {/* Footer */}
                              <div
                                style={{
                                  padding: "0.65rem 1rem",
                                  borderTop: "1px solid #f3f4f6",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                }}
                              >
                                <div
                                  style={{
                                    fontSize: "0.78rem",
                                    color: "#6b7280",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                  }}
                                >
                                  <span
                                    className="material-symbols-outlined"
                                    style={{ fontSize: "0.85rem" }}
                                  >
                                    person
                                  </span>
                                  {event.organizer || "TravelExpertz"}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.9rem",
                                    fontWeight: 700,
                                    color:
                                      event.ticketPrice > 0
                                        ? "#0a66c2"
                                        : "#10b981",
                                  }}
                                >
                                  {event.ticketPrice > 0
                                    ? `₹${event.ticketPrice.toLocaleString("en-IN")}`
                                    : "Free"}
                                </div>
                              </div>
                            </a>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Show More Button */}
                  {events.length > 0 && (
                    <div style={{ textAlign: "center", marginTop: "2.5rem" }}>
                      <a
                        href="/events"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          padding: "0.85rem 2.2rem",
                          borderRadius: "12px",
                          background:
                            "linear-gradient(135deg, #0a66c2 0%, #004c99 100%)",
                          color: "white",
                          fontSize: "0.95rem",
                          fontWeight: 700,
                          textDecoration: "none",
                          transition: "all 0.3s ease",
                          boxShadow: "0 4px 15px rgba(10, 102, 194, 0.3)",
                          fontFamily: "inherit",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "translateY(-2px)";
                          e.currentTarget.style.boxShadow =
                            "0 8px 25px rgba(10, 102, 194, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "translateY(0)";
                          e.currentTarget.style.boxShadow =
                            "0 4px 15px rgba(10, 102, 194, 0.3)";
                        }}
                      >
                        Show More Events
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "1.1rem" }}
                        >
                          arrow_forward
                        </span>
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>

            <style>{`
              @keyframes shimmer {
                0% { background-position: 200% 0; }
                100% { background-position: -200% 0; }
              }
            `}</style>
          </section>

          {/* ========== WHY US SECTION ========== */}
          <section
            className="why-us-section"
            style={{
              padding: "clamp(1rem, 2.5vw, 2rem) clamp(0.5rem, 2vw, 1.5rem)",
              background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Background Decorations */}
            <div
              className="hidden md:block"
              style={{
                position: "absolute",
                top: "-50px",
                right: "-50px",
                width: "200px",
                height: "200px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(0, 102, 204, 0.05) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              className="hidden md:block"
              style={{
                position: "absolute",
                bottom: "-30px",
                left: "-30px",
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(0, 102, 204, 0.04) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />

            <div
              style={{
                maxWidth: "1200px",
                margin: "0 auto",
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Section Header */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "clamp(1.5rem, 4vw, 3rem)",
                  padding: "0 0.5rem",
                }}
              >
                <h2
                  style={{
                    textAlign: "center",
                    fontSize: "clamp(1.5rem, 5vw, 2.25rem)",
                    fontWeight: 900,
                    color: "#1a1a2e",
                    marginBottom: "clamp(0.5rem, 2vw, 1rem)",
                    textShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Why Travel with Us?
                </h2>
                <p
                  style={{
                    fontSize: "clamp(0.85rem, 2.5vw, 1rem)",
                    color: "#666",
                    maxWidth: "500px",
                    margin: "0 auto",
                    lineHeight: 1.6,
                  }}
                >
                  Discover what makes us your perfect travel partner
                </p>
              </div>

              {/* Why Us Grid */}
              <div
                className="why-us-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "clamp(0.75rem, 2vw, 1.5rem)",
                }}
              >
                {whyUs.map((card, idx) => (
                  <div
                    key={card._id || idx}
                    className="why-us-card"
                    style={{
                      background: "#ffffff",
                      borderRadius: "clamp(12px, 2vw, 16px)",
                      padding: "clamp(1rem, 3vw, 1.5rem)",
                      textAlign: "center",
                      border: "1px solid rgba(0, 0, 0, 0.06)",
                      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.04)",
                      transition: "all 0.3s ease",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-4px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 25px rgba(0, 102, 204, 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 12px rgba(0, 0, 0, 0.04)";
                    }}
                  >
                    {/* Icon Container */}
                    <div
                      style={{
                        width: "clamp(48px, 10vw, 64px)",
                        height: "clamp(48px, 10vw, 64px)",
                        borderRadius: "clamp(12px, 2vw, 16px)",
                        background:
                          "linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(0, 102, 204, 0.05) 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto clamp(0.75rem, 2vw, 1rem)",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: "clamp(1.5rem, 4vw, 2rem)",
                          color: "#0066cc",
                        }}
                      >
                        {card.icon}
                      </span>
                    </div>
                    <h3
                      style={{
                        fontWeight: 700,
                        color: "#1a1a2e",
                        marginBottom: "clamp(0.25rem, 1vw, 0.5rem)",
                        fontSize: "clamp(0.9rem, 2.5vw, 1.125rem)",
                        lineHeight: 1.3,
                      }}
                    >
                      {card.title}
                    </h3>
                    <p
                      style={{
                        fontSize: "clamp(0.75rem, 2vw, 0.9rem)",
                        color: "#666",
                        lineHeight: 1.5,
                        margin: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                      }}
                    >
                      {card.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ========== TESTIMONIALS SECTION ========== */}
          <section
            className="testimonials-section"
            style={{
              padding: "clamp(1rem, 2.5vw, 3rem) clamp(0.75rem, 2vw, 1.5rem)",
              background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Soft background accents - Hidden on mobile */}
            <div
              className="hidden md:block"
              style={{
                position: "absolute",
                top: "-120px",
                left: "-80px",
                width: "260px",
                height: "260px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(0, 102, 204, 0.06) 0%, transparent 70%)",
                zIndex: 0,
              }}
            />
            <div
              className="hidden md:block"
              style={{
                position: "absolute",
                bottom: "-140px",
                right: "-80px",
                width: "320px",
                height: "320px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(15, 23, 42, 0.05) 0%, transparent 70%)",
                zIndex: 0,
              }}
            />
            <div
              style={{
                maxWidth: "1280px",
                margin: "0 auto",
                position: "relative",
                zIndex: 1,
              }}
            >
              {/* Section Header */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "clamp(1.5rem, 4vw, 3rem)",
                  padding: "0 0.5rem",
                }}
              >
                <h2
                  style={{
                    fontSize: "clamp(1.5rem, 5vw, 2.25rem)",
                    fontWeight: 900,
                    textAlign: "center",
                    color: "#1a1a2e",
                    margin: "0 0 clamp(0.5rem, 2vw, 1rem) 0",
                    textShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Souvenirs of the Soul
                </h2>
                <p
                  style={{
                    fontSize: "clamp(0.85rem, 2.5vw, 1.1rem)",
                    textAlign: "center",
                    color: "#666",
                    margin: "0",
                    maxWidth: "700px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    lineHeight: 1.6,
                  }}
                >
                  Discover experiences from real travelers who have explored our
                  properties
                </p>
              </div>

              {/* Write Review Button */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "clamp(1.5rem, 4vw, 3rem)",
                }}
              >
                <button
                  onClick={() => {
                    setShowReviewForm(true);
                    setSelectedPropertyForReview({
                      id: "new",
                      name: "Select Property",
                      type: "Property",
                    });
                  }}
                  style={{
                    padding:
                      "clamp(0.6rem, 2vw, 0.75rem) clamp(1.25rem, 4vw, 2rem)",
                    background:
                      "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "clamp(10px, 2vw, 12px)",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "clamp(0.85rem, 2.5vw, 0.95rem)",
                    transition: "all 0.3s",
                    boxShadow: "0 4px 15px rgba(0, 102, 204, 0.25)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 6px 25px rgba(0, 102, 204, 0.35)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 15px rgba(0, 102, 204, 0.25)";
                  }}
                >
                  + Write a Review
                </button>
              </div>

              {/* Reviews Carousel */}
              <div
                className="reviews-carousel-container"
                style={{
                  maxWidth: "700px",
                  margin: "0 auto",
                  position: "relative",
                }}
                onMouseEnter={() => setCarouselPaused(true)}
                onMouseLeave={() => setCarouselPaused(false)}
              >
                {!reviewsLoading && reviews.length > 0 ? (
                  <>
                    {/* Single Review Card */}
                    <div
                      style={{
                        position: "relative",
                        minHeight: "auto",
                      }}
                    >
                      {/* Review Card */}
                      {(() => {
                        const review = reviews[carouselIndex];
                        return (
                          <div
                            key={`review-${carouselIndex}-${review._id || review.propertyId}`}
                            onClick={() => {
                              window.location.href = `/hotels/${review.propertyId}`;
                            }}
                            className="review-card"
                            style={{
                              background: "rgba(255, 255, 255, 0.98)",
                              borderRadius: "clamp(12px, 2vw, 16px)",
                              overflow: "hidden",
                              boxShadow:
                                "0 4px 20px rgba(0, 102, 204, 0.08), 0 2px 8px rgba(0, 0, 0, 0.04)",
                              border: "1px solid rgba(226, 232, 240, 0.9)",
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-4px)";
                              e.currentTarget.style.boxShadow =
                                "0 12px 35px rgba(0, 102, 204, 0.15)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 20px rgba(0, 102, 204, 0.08)";
                            }}
                          >
                            {/* Image Gallery */}
                            {review.reviewImages &&
                              review.reviewImages.length > 0 && (
                                <div
                                  style={{
                                    position: "relative",
                                    width: "100%",
                                    height: "clamp(180px, 35vw, 280px)",
                                    overflow: "hidden",
                                    background:
                                      "linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(0, 153, 255, 0.05) 100%)",
                                  }}
                                >
                                  <img
                                    src={review.reviewImages[0]}
                                    alt={review.propertyName}
                                    style={{
                                      width: "100%",
                                      height: "100%",
                                      objectFit: "cover",
                                    }}
                                  />
                                  {review.reviewImages.length > 1 && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedImageModal({
                                          images: review.reviewImages,
                                          index: 0,
                                        });
                                      }}
                                      style={{
                                        position: "absolute",
                                        bottom: "0.75rem",
                                        right: "0.75rem",
                                        background: "rgba(0, 0, 0, 0.6)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "8px",
                                        padding: "0.5rem 1rem",
                                        fontSize:
                                          "clamp(0.75rem, 2vw, 0.85rem)",
                                        fontWeight: 600,
                                        cursor: "pointer",
                                        transition: "all 0.3s",
                                        backdropFilter: "blur(8px)",
                                      }}
                                      onMouseEnter={(e) => {
                                        e.currentTarget.style.background =
                                          "rgba(0, 0, 0, 0.8)";
                                      }}
                                      onMouseLeave={(e) => {
                                        e.currentTarget.style.background =
                                          "rgba(0, 0, 0, 0.6)";
                                      }}
                                    >
                                      📷 {review.reviewImages.length}
                                    </button>
                                  )}
                                </div>
                              )}

                            {/* Content */}
                            <div
                              style={{
                                padding: "clamp(1.25rem, 3vw, 1.75rem)",
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              {/* Property Info */}
                              <div
                                style={{
                                  marginBottom: "clamp(0.75rem, 2vw, 1rem)",
                                }}
                              >
                                <h3
                                  style={{
                                    fontSize: "clamp(1rem, 3vw, 1.25rem)",
                                    fontWeight: 700,
                                    color: "#0066cc",
                                    margin: "0 0 0.25rem 0",
                                  }}
                                >
                                  {review.propertyName}
                                </h3>
                                <p
                                  style={{
                                    fontSize: "clamp(0.8rem, 2vw, 0.9rem)",
                                    color: "#999",
                                    margin: 0,
                                  }}
                                >
                                  {review.propertyType}
                                </p>
                              </div>

                              {/* User Info */}
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "clamp(0.75rem, 2vw, 1rem)",
                                  marginBottom: "clamp(0.75rem, 2vw, 1rem)",
                                }}
                              >
                                {review.userImage ? (
                                  <img
                                    src={review.userImage}
                                    alt={review.userName}
                                    style={{
                                      width: "clamp(40px, 10vw, 50px)",
                                      height: "clamp(40px, 10vw, 50px)",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "clamp(40px, 10vw, 50px)",
                                      height: "clamp(40px, 10vw, 50px)",
                                      borderRadius: "50%",
                                      background:
                                        "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "white",
                                      fontWeight: "bold",
                                      fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
                                    }}
                                  >
                                    {review.userName?.charAt(0).toUpperCase() ||
                                      "U"}
                                  </div>
                                )}
                                <div>
                                  <p
                                    style={{
                                      fontWeight: 600,
                                      margin: 0,
                                      color: "#1a1a2e",
                                      fontSize: "clamp(0.9rem, 2.5vw, 1.05rem)",
                                    }}
                                  >
                                    {review.userName}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "clamp(0.75rem, 2vw, 0.85rem)",
                                      color: "#999",
                                      margin: "0.15rem 0 0 0",
                                    }}
                                  >
                                    {new Date(
                                      review.createdAt,
                                    ).toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                              </div>

                              {/* Rating */}
                              <div
                                style={{
                                  marginBottom: "clamp(0.75rem, 2vw, 1rem)",
                                }}
                              >
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      color:
                                        i < review.rating
                                          ? "#fbbf24"
                                          : "#e5e7eb",
                                      fontSize: "clamp(1rem, 3vw, 1.25rem)",
                                    }}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>

                              {/* Review Text */}
                              <p
                                style={{
                                  fontSize: "clamp(0.9rem, 2.5vw, 1rem)",
                                  color: "#555",
                                  lineHeight: 1.7,
                                  margin: 0,
                                  flex: 1,
                                }}
                              >
                                {review.reviewText}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Navigation Arrows - Visible on all devices */}
                    {reviews.length > 1 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "1rem",
                          marginTop: "clamp(1.5rem, 3vw, 2rem)",
                        }}
                      >
                        <button
                          onClick={() =>
                            setCarouselIndex((prev) =>
                              prev === 0 ? reviews.length - 1 : prev - 1,
                            )
                          }
                          style={{
                            background:
                              "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "clamp(40px, 8vw, 48px)",
                            height: "clamp(40px, 8vw, 48px)",
                            fontSize: "clamp(1.1rem, 3vw, 1.35rem)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 15px rgba(0, 102, 204, 0.25)",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.1)";
                            e.currentTarget.style.boxShadow =
                              "0 6px 25px rgba(0, 102, 204, 0.35)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 15px rgba(0, 102, 204, 0.25)";
                          }}
                        >
                          ‹
                        </button>
                        <button
                          onClick={() =>
                            setCarouselIndex((prev) =>
                              prev === reviews.length - 1 ? 0 : prev + 1,
                            )
                          }
                          style={{
                            background:
                              "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "clamp(40px, 8vw, 48px)",
                            height: "clamp(40px, 8vw, 48px)",
                            fontSize: "clamp(1.1rem, 3vw, 1.35rem)",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 4px 15px rgba(0, 102, 204, 0.25)",
                            transition: "all 0.3s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.1)";
                            e.currentTarget.style.boxShadow =
                              "0 6px 25px rgba(0, 102, 204, 0.35)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 15px rgba(0, 102, 204, 0.25)";
                          }}
                        >
                          ›
                        </button>
                      </div>
                    )}

                    {/* Carousel Indicators */}
                    {reviews.length > 1 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "clamp(0.35rem, 1vw, 0.5rem)",
                          marginTop: "clamp(1rem, 2vw, 1.5rem)",
                        }}
                      >
                        {reviews.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCarouselIndex(idx)}
                            style={{
                              width:
                                idx === carouselIndex
                                  ? "clamp(24px, 5vw, 32px)"
                                  : "clamp(8px, 2vw, 12px)",
                              height: "clamp(8px, 2vw, 12px)",
                              borderRadius: "6px",
                              border: "none",
                              background:
                                idx === carouselIndex
                                  ? "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)"
                                  : "#d1d5db",
                              cursor: "pointer",
                              transition: "all 0.3s",
                            }}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : !reviewsLoading ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding:
                        "clamp(1.5rem, 4vw, 3rem) clamp(1rem, 3vw, 2rem)",
                      background: "rgba(255, 255, 255, 0.5)",
                      borderRadius: "clamp(12px, 2vw, 16px)",
                      border: "1px dashed rgba(0, 102, 204, 0.2)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "clamp(0.9rem, 2.5vw, 1.1rem)",
                        color: "#666",
                        margin: 0,
                      }}
                    >
                      No reviews yet. Be the first to share your experience!
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Review Form Modal */}
      {showReviewForm && (
        <ReviewForm
          propertyId={selectedPropertyForReview?.id || ""}
          propertyName={selectedPropertyForReview?.name || ""}
          propertyType={selectedPropertyForReview?.type || ""}
          onSubmit={(newReview: any) => {
            setReviews((prev) => [newReview, ...prev]);
            setShowReviewForm(false);
          }}
          onClose={() => setShowReviewForm(false)}
        />
      )}

      {/* Image Modal */}
      {selectedImageModal && (
        <ImageModal
          images={selectedImageModal.images}
          initialIndex={selectedImageModal.index}
          onClose={() => setSelectedImageModal(null)}
        />
      )}

      {/* Service Booking Modal */}
      {selectedServiceForBooking && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "1rem",
            overflow: "auto",
            animation: "modalBackdropIn 0.3s ease",
          }}
          onClick={() => {
            console.log("Backdrop clicked, closing modal");
            setSelectedServiceForBooking(null);
          }}
        >
          <div
            style={{
              borderRadius: "1.25rem",
              maxWidth: "900px",
              width: "100%",
              maxHeight: "90vh",
              overflow: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                console.log("X button clicked");
                setSelectedServiceForBooking(null);
              }}
              style={{
                position: "absolute",
                top: "0.75rem",
                right: "0.75rem",
                background: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(4px)",
                border: "2px solid rgba(255, 255, 255, 0.2)",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                fontSize: "1.25rem",
                color: "white",
                zIndex: 10000,
                transition: "all 0.2s ease",
                fontWeight: "bold",
                lineHeight: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(239, 68, 68, 0.9)";
                e.currentTarget.style.borderColor = "rgba(239, 68, 68, 0.5)";
                e.currentTarget.style.transform = "scale(1.1) rotate(90deg)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
                e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
                e.currentTarget.style.transform = "scale(1) rotate(0deg)";
              }}
            >
              ×
            </button>
            <div>
              <ServiceBookingFormEnhanced
                serviceType={selectedServiceForBooking as any}
                onClose={() => {
                  console.log("Form onClose called");
                  setSelectedServiceForBooking(null);
                }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideInFromRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideDown {
          0% { opacity: 0; transform: translateY(-12px); max-height: 0; }
          60% { opacity: 1; }
          100% { opacity: 1; transform: translateY(0); max-height: 500px; }
        }
        @keyframes modalBackdropIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          section {
            padding-left: 1rem !important;
            padding-right: 1rem !important;
          }
          
          /* Testimonials section mobile */
          section > div[style*="maxWidth: \"800px\""] {
            padding: 1.5rem 1rem !important;
            border-radius: 16px !important;
          }
          
          /* Why Us cards */
          div[style*="gridTemplateColumns: \"repeat(auto-fit, minmax(250px, 1fr))\""] {
            gap: 1rem !important;
          }
          
          /* Events grid mobile - 2 columns */
          .events-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        
        @media (max-width: 480px) {
          section {
            padding-top: 1.5rem !important;
            padding-bottom: 1.5rem !important;
          }
          
          h2 {
            font-size: 1.75rem !important;
          }
          
          /* Events grid extra small screens - 1 column */
          .events-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
