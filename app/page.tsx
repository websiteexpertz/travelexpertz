"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Header from "./components/Header";
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
          style={{ background: "transparent", padding: "0 1.5rem" }}
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
              <h1>Find and Book Your Perfect Stay</h1>
              <p>
                Discover the best hotels, homestays, and luxury accommodations
                around the world.
              </p>
            </div>

            {/* Search Form Box */}
            <div className="search-box">
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
                <button className="search-btn">Search</button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          {/* ========== SERVICES SECTION ========== */}
          <section
            className="services-section"
            style={{
              padding: "4rem 1rem",
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
              <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                <h2
                  style={{
                    fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                    fontWeight: 800,
                    textAlign: "center",
                    margin: "0 0 0.75rem 0",
                    color: "#1a1a2e",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Our Services
                </h2>
                <p
                  style={{
                    fontSize: "1rem",
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
                  gap: "1rem",
                }}
              >
                {services.map((service, index) => (
                  <div
                    key={service._id || service.id || index}
                    className="service-card"
                    style={{
                      cursor: "pointer",
                      borderRadius: "16px",
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
                      style={{
                        width: "100%",
                        aspectRatio: "4/3",
                        overflow: "hidden",
                        background: "#f8fafc",
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
                    </div>

                    {/* Content */}
                    <div style={{ padding: "1rem" }}>
                      <h3
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "#1a1a2e",
                          marginBottom: "0.375rem",
                        }}
                      >
                        {service.title}
                      </h3>
                      <p
                        style={{
                          fontSize: "0.8rem",
                          color: "#666",
                          lineHeight: 1.4,
                          margin: 0,
                        }}
                      >
                        {service.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mobile responsive styles */}
            <style jsx>{`
              @media (max-width: 1024px) {
                .services-grid {
                  grid-template-columns: repeat(3, 1fr) !important;
                }
              }
              @media (max-width: 768px) {
                .services-grid {
                  grid-template-columns: repeat(2, 1fr) !important;
                  gap: 0.75rem !important;
                }
                .service-card {
                  border-radius: 12px !important;
                }
              }
              @media (max-width: 480px) {
                .services-grid {
                  gap: 0.5rem !important;
                }
                .service-card h3 {
                  font-size: 0.875rem !important;
                }
                .service-card p {
                  font-size: 0.75rem !important;
                }
              }
            `}</style>
          </section>

          {/* ========== WHY US SECTION ========== */}
          <section style={{ padding: "3rem 1rem", background: "transparent" }}>
            <h2
              style={{
                textAlign: "center",
                fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                fontWeight: 900,
                color: "#1a1a2e",
                marginBottom: "3rem",
                textShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                letterSpacing: "-0.5px",
              }}
            >
              Why Travel with Us?
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "2rem",
                maxWidth: "80rem",
                margin: "0 auto",
              }}
            >
              {whyUs.map((card, idx) => (
                <div
                  key={card._id || idx}
                  style={{
                    background: "rgba(255, 255, 255, 0.15)",
                    borderRadius: "0.75rem",
                    padding: "1.5rem",
                    textAlign: "center",
                    border: "1px solid rgba(255, 255, 255, 0.25)",
                  }}
                >
                  <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                    <span className="material-symbols-outlined">
                      {card.icon}
                    </span>
                  </div>
                  <h3
                    style={{
                      fontWeight: 700,
                      color: "#1a1a2e",
                      marginBottom: "0.5rem",
                    }}
                  >
                    {card.title}
                  </h3>
                  <p style={{ fontSize: "0.9rem", color: "#666" }}>
                    {card.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* ========== TESTIMONIALS SECTION ========== */}
          <section
            style={{
              padding: "6rem 1.5rem",
              background: "transparent",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Soft background accents */}
            <div
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
              <div style={{ textAlign: "center", marginBottom: "3rem" }}>
                <h2
                  style={{
                    fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                    fontWeight: 900,
                    textAlign: "center",
                    color: "#1a1a2e",
                    margin: "0 0 1rem 0",
                    textShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Souvenirs of the Soul
                </h2>
                <p
                  style={{
                    fontSize: "1.1rem",
                    textAlign: "center",
                    color: "#666",
                    margin: "0",
                    maxWidth: "700px",
                    marginLeft: "auto",
                    marginRight: "auto",
                    lineHeight: 1.8,
                  }}
                >
                  Discover experiences from real travelers who have explored our
                  properties
                </p>
              </div>

              {/* Write Review Button */}
              <div style={{ textAlign: "center", marginBottom: "3rem" }}>
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
                    padding: "0.75rem 2rem",
                    background:
                      "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "12px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "0.95rem",
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

              {/* Reviews Carousel - 2 Cards */}
              <div
                style={{
                  maxWidth: "1200px",
                  margin: "0 auto",
                  position: "relative",
                }}
                onMouseEnter={() => setCarouselPaused(true)}
                onMouseLeave={() => setCarouselPaused(false)}
              >
                {!reviewsLoading && reviews.length > 0 ? (
                  <>
                    {/* Carousel Container - Grid for 2 cards */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        gap: "2rem",
                        position: "relative",
                        minHeight: "550px",
                      }}
                    >
                      {/* First Review Card */}
                      {(() => {
                        const review = reviews[carouselIndex];
                        return (
                          <div
                            key={`review-first-${carouselIndex}-${review._id || review.propertyId}`}
                            onClick={() => {
                              window.location.href = `/hotels/${review.propertyId}`;
                            }}
                            style={{
                              background: "rgba(255, 255, 255, 0.96)",
                              borderRadius: "16px",
                              overflow: "hidden",
                              boxShadow:
                                "0 10px 30px rgba(0, 102, 204, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)",
                              border: "1px solid rgba(226, 232, 240, 0.9)",
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              transition: "all 0.6s ease-in-out",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-8px)";
                              e.currentTarget.style.boxShadow =
                                "0 20px 50px rgba(0, 102, 204, 0.2)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 10px 30px rgba(0, 102, 204, 0.1)";
                            }}
                          >
                            {/* Image Gallery */}
                            {review.reviewImages &&
                              review.reviewImages.length > 0 && (
                                <div
                                  style={{
                                    position: "relative",
                                    width: "100%",
                                    height: "200px",
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
                                        fontSize: "0.85rem",
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
                                padding: "1.5rem",
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              {/* Property Info */}
                              <div style={{ marginBottom: "1rem" }}>
                                <h3
                                  style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    color: "#0066cc",
                                    margin: "0 0 0.25rem 0",
                                  }}
                                >
                                  {review.propertyName}
                                </h3>
                                <p
                                  style={{
                                    fontSize: "0.85rem",
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
                                  gap: "0.75rem",
                                  marginBottom: "1rem",
                                }}
                              >
                                {review.userImage ? (
                                  <img
                                    src={review.userImage}
                                    alt={review.userName}
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "50%",
                                      background:
                                        "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "white",
                                      fontWeight: "bold",
                                      fontSize: "0.9rem",
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
                                      fontSize: "0.95rem",
                                    }}
                                  >
                                    {review.userName}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#999",
                                      margin: "0.1rem 0 0 0",
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
                              <div style={{ marginBottom: "0.75rem" }}>
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      color:
                                        i < review.rating
                                          ? "#fbbf24"
                                          : "#e5e7eb",
                                      fontSize: "1rem",
                                    }}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>

                              {/* Review Text */}
                              <p
                                style={{
                                  fontSize: "0.95rem",
                                  color: "#555",
                                  lineHeight: 1.6,
                                  margin: 0,
                                  flex: 1,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {review.reviewText}
                              </p>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Second Review Card */}
                      {(() => {
                        const nextIndex = (carouselIndex + 1) % reviews.length;
                        const review = reviews[nextIndex];
                        return (
                          <div
                            key={`review-second-${nextIndex}-${review._id || review.propertyId}`}
                            onClick={() => {
                              window.location.href = `/hotels/${review.propertyId}`;
                            }}
                            style={{
                              background: "rgba(255, 255, 255, 0.96)",
                              borderRadius: "16px",
                              overflow: "hidden",
                              boxShadow:
                                "0 10px 30px rgba(0, 102, 204, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)",
                              border: "1px solid rgba(226, 232, 240, 0.9)",
                              cursor: "pointer",
                              display: "flex",
                              flexDirection: "column",
                              transition: "all 0.6s ease-in-out",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-8px)";
                              e.currentTarget.style.boxShadow =
                                "0 20px 50px rgba(0, 102, 204, 0.2)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 10px 30px rgba(0, 102, 204, 0.1)";
                            }}
                          >
                            {/* Image Gallery */}
                            {review.reviewImages &&
                              review.reviewImages.length > 0 && (
                                <div
                                  style={{
                                    position: "relative",
                                    width: "100%",
                                    height: "200px",
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
                                        fontSize: "0.85rem",
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
                                padding: "1.5rem",
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                              }}
                            >
                              {/* Property Info */}
                              <div style={{ marginBottom: "1rem" }}>
                                <h3
                                  style={{
                                    fontSize: "1.1rem",
                                    fontWeight: 700,
                                    color: "#0066cc",
                                    margin: "0 0 0.25rem 0",
                                  }}
                                >
                                  {review.propertyName}
                                </h3>
                                <p
                                  style={{
                                    fontSize: "0.85rem",
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
                                  gap: "0.75rem",
                                  marginBottom: "1rem",
                                }}
                              >
                                {review.userImage ? (
                                  <img
                                    src={review.userImage}
                                    alt={review.userName}
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "50%",
                                      objectFit: "cover",
                                    }}
                                  />
                                ) : (
                                  <div
                                    style={{
                                      width: "40px",
                                      height: "40px",
                                      borderRadius: "50%",
                                      background:
                                        "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "white",
                                      fontWeight: "bold",
                                      fontSize: "0.9rem",
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
                                      fontSize: "0.95rem",
                                    }}
                                  >
                                    {review.userName}
                                  </p>
                                  <p
                                    style={{
                                      fontSize: "0.8rem",
                                      color: "#999",
                                      margin: "0.1rem 0 0 0",
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
                              <div style={{ marginBottom: "0.75rem" }}>
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    style={{
                                      color:
                                        i < review.rating
                                          ? "#fbbf24"
                                          : "#e5e7eb",
                                      fontSize: "1rem",
                                    }}
                                  >
                                    ★
                                  </span>
                                ))}
                              </div>

                              {/* Review Text */}
                              <p
                                style={{
                                  fontSize: "0.95rem",
                                  color: "#555",
                                  lineHeight: 1.6,
                                  margin: 0,
                                  flex: 1,
                                  display: "-webkit-box",
                                  WebkitLineClamp: 3,
                                  WebkitBoxOrient: "vertical",
                                  overflow: "hidden",
                                }}
                              >
                                {review.reviewText}
                              </p>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Navigation Arrows */}
                    {reviews.length > 2 && (
                      <>
                        <button
                          onClick={() =>
                            setCarouselIndex((prev) =>
                              prev === 0 ? reviews.length - 1 : prev - 1,
                            )
                          }
                          style={{
                            position: "absolute",
                            left: "-70px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background:
                              "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "50px",
                            height: "50px",
                            fontSize: "1.5rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.3s",
                            boxShadow: "0 4px 15px rgba(0, 102, 204, 0.25)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-50%) scale(1.1)";
                            e.currentTarget.style.boxShadow =
                              "0 6px 25px rgba(0, 102, 204, 0.35)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-50%) scale(1)";
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
                            position: "absolute",
                            right: "-70px",
                            top: "50%",
                            transform: "translateY(-50%)",
                            background:
                              "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "50%",
                            width: "50px",
                            height: "50px",
                            fontSize: "1.5rem",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            transition: "all 0.3s",
                            boxShadow: "0 4px 15px rgba(0, 102, 204, 0.25)",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-50%) scale(1.1)";
                            e.currentTarget.style.boxShadow =
                              "0 6px 25px rgba(0, 102, 204, 0.35)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform =
                              "translateY(-50%) scale(1)";
                            e.currentTarget.style.boxShadow =
                              "0 4px 15px rgba(0, 102, 204, 0.25)";
                          }}
                        >
                          ›
                        </button>
                      </>
                    )}

                    {/* Carousel Indicators */}
                    {reviews.length > 2 && (
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: "0.5rem",
                          marginTop: "2rem",
                        }}
                      >
                        {reviews.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCarouselIndex(idx)}
                            style={{
                              width: idx === carouselIndex ? "32px" : "12px",
                              height: "12px",
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
                      padding: "3rem 2rem",
                      background: "rgba(255, 255, 255, 0.5)",
                      borderRadius: "16px",
                      border: "1px dashed rgba(0, 102, 204, 0.2)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "1.1rem",
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

      {/* ========== FOOTER ========== */}
      <footer>
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
                  <a href="/about">About Us</a>
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
                  <a href="#">Countries</a>
                </li>
                <li>
                  <a href="#">Cities</a>
                </li>
                <li>
                  <a href="#">Top Hotels</a>
                </li>
              </ul>
            </div>
            <div>
              <h4>Legal</h4>
              <ul className="footer-links">
                <li>
                  <a href="#">Privacy Policy</a>
                </li>
                <li>
                  <a href="#">Terms of Service</a>
                </li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p className="footer-copyright">
              © 2024 TravelExpertz. All rights reserved.
            </p>
            <div className="footer-social">
              <a href="#">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    clipRule="evenodd"
                    d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </a>
              <a href="#">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.71v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                </svg>
              </a>
              <a href="#">
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    clipRule="evenodd"
                    d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.024.06 1.378.06 3.808s-.012 2.784-.06 3.808c-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.024.048-1.378.06-3.808.06s-2.784-.013-3.808-.06c-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.048-1.024-.06-1.378-.06-3.808s.012-2.784.06-3.808c.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 016.345 2.525c.636-.247 1.363-.416 2.427-.465C9.795 2.013 10.148 2 12.315 2zm-1.163 1.943c-1.049.045-1.71.218-2.227.427A3.396 3.396 0 006.944 6.944c-.21.517-.382 1.178-.427 2.227-.045 1.025-.058 1.35-.058 3.829s.013 2.803.058 3.829c.045 1.049.218 1.71.427 2.227a3.396 3.396 0 002.373 2.373c.517.21.98.382 2.227.427 1.025.045 1.35.058 3.829.058s2.803-.013 3.829-.058c1.049-.045 1.71-.218 2.227-.427a3.396 3.396 0 002.373-2.373c.21-.517.382-1.178.427-2.227.045-1.025.058-1.35.058-3.829s-.013-2.803-.058-3.829c-.045-1.049-.218-1.71-.427-2.227a3.396 3.396 0 00-2.373-2.373c-.517-.21-1.178-.382-2.227-.427C15.118 3.956 14.789 3.943 12.315 3.943h-1.163zM12 8.118c-2.147 0-3.882 1.735-3.882 3.882s1.735 3.882 3.882 3.882 3.882-1.735 3.882-3.882S14.147 8.118 12 8.118zm0 6.162c-1.258 0-2.28-1.022-2.28-2.28s1.022-2.28 2.28-2.28 2.28 1.022 2.28 2.28-1.022 2.28-2.28 2.28zm4.965-6.402c-.78 0-1.418.638-1.418 1.418s.638 1.418 1.418 1.418 1.418-.638 1.418-1.418-.638-1.418-1.418-1.418z"
                    fillRule="evenodd"
                  ></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>

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
