"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ReviewForm from "./components/ReviewForm";
import ImageModal from "./components/ImageModal";

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

// All data will be fetched from database via API endpoints

export default function Home() {
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

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      {/* TopNavBar */}
      <Header currentPage="home" />

      <main className="flex flex-col items-center w-full">
        {/* ========== HERO SECTION ========== */}
        <div
          className="w-full"
          style={{ background: "transparent", padding: "0 0.75rem" }}
        >
          <div
            className="hero-section"
            style={{
              backgroundImage: "url('/hero-banner.png')",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Animated Background Overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(135deg, rgba(10, 102, 194, 0.1) 0%, rgba(0, 82, 163, 0.2) 100%)",
                zIndex: 0,
              }}
            />

            {/* Floating Decorative Elements - Hidden on very small screens */}
            <div
              className="hidden sm:block"
              style={{
                position: "absolute",
                top: "10%",
                left: "5%",
                width: "clamp(40px, 8vw, 80px)",
                height: "clamp(40px, 8vw, 80px)",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
                backdropFilter: "blur(10px)",
                animation: "float 6s ease-in-out infinite",
                zIndex: 1,
              }}
            />
            <div
              className="hidden md:block"
              style={{
                position: "absolute",
                bottom: "15%",
                right: "8%",
                width: "clamp(30px, 6vw, 60px)",
                height: "clamp(30px, 6vw, 60px)",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.08)",
                backdropFilter: "blur(8px)",
                animation: "float 8s ease-in-out infinite reverse",
                zIndex: 1,
              }}
            />
            <div
              className="hidden lg:block"
              style={{
                position: "absolute",
                top: "40%",
                right: "15%",
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.06)",
                backdropFilter: "blur(6px)",
                animation: "float 5s ease-in-out infinite",
                animationDelay: "1s",
                zIndex: 1,
              }}
            />

            <div
              className="hero-content"
              style={{ position: "relative", zIndex: 2 }}
            >
              <h1
                style={{
                  animation: "fadeInUp 0.8s ease-out",
                  animationDelay: "0.2s",
                  animationFillMode: "both",
                }}
              >
                Find and Book Your Perfect Stay
              </h1>
              <p
                style={{
                  animation: "fadeInUp 0.8s ease-out",
                  animationDelay: "0.4s",
                  animationFillMode: "both",
                }}
              >
                Discover the best hotels, homestays, and luxury accommodations
                around the world.
              </p>

              {/* Trust Indicators */}
              <div
                className="trust-indicators"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "clamp(0.5rem, 2vw, 1.5rem)",
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
                      gap: "clamp(0.25rem, 1vw, 0.4rem)",
                      padding:
                        "clamp(0.3rem, 1vw, 0.4rem) clamp(0.5rem, 1.5vw, 0.8rem)",
                      background: "rgba(255, 255, 255, 0.2)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "0.5rem",
                      border: "1px solid rgba(255, 255, 255, 0.3)",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{
                        fontSize: "clamp(0.875rem, 2.5vw, 1rem)",
                        color: "white",
                        textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      {item.icon}
                    </span>
                    <span
                      style={{
                        fontSize: "clamp(0.65rem, 2vw, 0.8rem)",
                        fontWeight: 600,
                        color: "white",
                        textShadow: "0 1px 2px rgba(0, 0, 0, 0.3)",
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
                backdropFilter: "blur(10px)",
                background: "rgba(255, 255, 255, 0.95)",
              }}
            >
              <div className="search-box-content">
                <div className="search-item">
                  <span className="material-symbols-outlined">location_on</span>
                  <span>Location</span>
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
                  <span>Check-in</span>
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
                  <span>Check-out</span>
                  <span
                    className="material-symbols-outlined"
                    style={{ marginLeft: "auto" }}
                  >
                    arrow_drop_down
                  </span>
                </div>
                <div className="search-item">
                  <span className="material-symbols-outlined">group</span>
                  <span>Guests</span>
                  <span
                    className="material-symbols-outlined"
                    style={{ marginLeft: "auto" }}
                  >
                    arrow_drop_down
                  </span>
                </div>
                <div className="search-item">
                  <span className="material-symbols-outlined">bed</span>
                  <span>Rooms</span>
                  <span
                    className="material-symbols-outlined"
                    style={{ marginLeft: "auto" }}
                  >
                    arrow_drop_down
                  </span>
                </div>
                <button
                  className="search-btn"
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
              padding: "clamp(2rem, 5vw, 4rem) clamp(0.5rem, 2vw, 1rem)",
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
                {services.map((service, index) => (
                  <div
                    key={service._id || service.id || index}
                    className="service-card"
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

          {/* ========== WHY US SECTION ========== */}
          <section
            className="why-us-section"
            style={{
              padding: "clamp(2rem, 5vw, 4rem) clamp(0.5rem, 2vw, 1.5rem)",
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
                  gridTemplateColumns: "repeat(2, 1fr)",
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
              padding: "clamp(2rem, 5vw, 6rem) clamp(0.75rem, 2vw, 1.5rem)",
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

      <Footer />

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
        }
        
        @media (max-width: 480px) {
          section {
            padding-top: 3rem !important;
            padding-bottom: 3rem !important;
          }
          
          h2 {
            font-size: 1.75rem !important;
          }
        }
      `}</style>
    </div>
  );
}
