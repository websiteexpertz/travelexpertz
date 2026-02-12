"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/app/components/Header";

interface Event {
  _id?: string;
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

export default function EventDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);

  useEffect(() => {
    if (!eventId) {
      setError("Event ID not found");
      setLoading(false);
      return;
    }

    const fetchEvent = async () => {
      try {
        const response = await fetch(`/api/events?id=${eventId}`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          if (data) {
            setEvent(data);
          } else {
            setError("Event not found");
          }
        } else {
          setError("Failed to load event");
        }
      } catch (error) {
        console.error("Failed to fetch event:", error);
        setError("Failed to load event details");
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [eventId]);

  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <Header />
        <main className="flex flex-col items-center w-full pt-24">
          <div style={{ padding: "4rem 2rem", textAlign: "center" }}>
            <p style={{ fontSize: "1.1rem", color: "#666" }}>
              Loading event details...
            </p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <Header />
        <main className="flex flex-col items-center w-full pt-24">
          <div
            style={{
              padding: "4rem 2rem",
              textAlign: "center",
              maxWidth: "600px",
            }}
          >
            <h1
              style={{
                fontSize: "2rem",
                color: "#1a1a2e",
                marginBottom: "1rem",
              }}
            >
              Event Not Found
            </h1>
            <p
              style={{ fontSize: "1rem", color: "#666", marginBottom: "2rem" }}
            >
              {error ||
                "The event you're looking for doesn't exist or has been removed."}
            </p>
            <button
              onClick={() => router.push("/")}
              style={{
                padding: "0.75rem 1.5rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                fontSize: "0.95rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(102, 126, 234, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              Back to Home
            </button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
      <Header />

      <main
        className="flex flex-col items-center w-full"
        style={{ paddingTop: "4rem" }}
      >
        {/* Gallery Section - Main Display */}
        {event.galleryImages && event.galleryImages.length > 0 ? (
          <div
            style={{
              width: "100%",
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "1.5rem 1rem",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  event.galleryImages.length === 1 ? "1fr" : "2fr 1fr 1fr",
                gridTemplateRows:
                  event.galleryImages.length === 1 ? "auto" : "1fr 1fr",
                gap: "0.5rem",
                height: event.galleryImages.length === 1 ? "auto" : "400px",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              {/* Main large image */}
              <div
                style={{
                  gridRow: event.galleryImages.length > 1 ? "1 / 3" : "1",
                  gridColumn: event.galleryImages.length > 1 ? "1" : "1 / -1",
                  position: "relative",
                  cursor: "pointer",
                  overflow: "hidden",
                  aspectRatio:
                    event.galleryImages.length === 1 ? "16/9" : "auto",
                }}
                onClick={() => {
                  setFullscreenImageIndex(0);
                  setShowFullscreenGallery(true);
                }}
              >
                <img
                  src={event.galleryImages[0]}
                  alt={`${event.eventName} gallery 1`}
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
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/800x400?text=Image+Not+Found";
                  }}
                />
              </div>

              {/* Smaller images grid */}
              {event.galleryImages.length > 1 && (
                <div
                  style={{
                    gridColumn: "2 / -1",
                    gridRow: "1 / -1",
                    display: "grid",
                    gridTemplateColumns: "repeat(2, 1fr)",
                    gap: "0.5rem",
                  }}
                >
                  {event.galleryImages.slice(1, 5).map((img, idx) => (
                    <div
                      key={idx}
                      style={{
                        position: "relative",
                        cursor: "pointer",
                        overflow: "hidden",
                      }}
                      onClick={() => {
                        setFullscreenImageIndex(idx + 1);
                        setShowFullscreenGallery(true);
                      }}
                    >
                      <img
                        src={img}
                        alt={`${event.eventName} gallery ${idx + 2}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.3s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/400x200?text=Image+Not+Found";
                        }}
                      />
                      {idx === 3 && event.galleryImages.length > 5 && (
                        <div
                          style={{
                            position: "absolute",
                            inset: 0,
                            background: "rgba(0, 0, 0, 0.6)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontSize: "1.5rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          +{event.galleryImages.length - 5} more
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div
            style={{
              width: "100%",
              maxWidth: "1200px",
              margin: "0 auto",
              padding: "1.5rem 1rem",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "400px",
                borderRadius: "16px",
                overflow: "hidden",
                background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#999",
                fontSize: "1rem",
              }}
            >
              No images available
            </div>
          </div>
        )}

        {/* Content Section */}
        <div
          style={{
            width: "100%",
            padding: "clamp(2rem, 5vw, 4rem) clamp(1rem, 2vw, 1.5rem)",
            background: "#fff",
          }}
        >
          <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
            {/* Main Content Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "clamp(2rem, 5vw, 4rem)",
              }}
            >
              {/* Left Column - Details */}
              <div>
                {/* Event Title Section */}
                <div style={{ marginBottom: "2rem" }}>
                  {event.category && (
                    <div
                      style={{
                        display: "inline-block",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        padding: "0.5rem 1rem",
                        borderRadius: "20px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        marginBottom: "1rem",
                        color: "white",
                      }}
                    >
                      {event.category}
                    </div>
                  )}
                  <h1
                    style={{
                      fontSize: "clamp(1.75rem, 5vw, 2.5rem)",
                      fontWeight: 800,
                      margin: "0 0 0.5rem 0",
                      lineHeight: 1.2,
                      color: "#1a1a2e",
                    }}
                  >
                    {event.eventName}
                  </h1>
                  {event.organizer && (
                    <p
                      style={{
                        fontSize: "1rem",
                        color: "#666",
                        margin: "0.5rem 0 0 0",
                      }}
                    >
                      Organized by <strong>{event.organizer}</strong>
                    </p>
                  )}
                </div>

                {/* Event Details */}
                <div
                  style={{
                    background:
                      "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                    borderRadius: "16px",
                    padding: "clamp(1.5rem, 3vw, 2.5rem)",
                    marginBottom: "2rem",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#1a1a2e",
                      margin: "0 0 1.5rem 0",
                    }}
                  >
                    Event Details
                  </h2>

                  {/* Date */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#999",
                        margin: "0 0 0.5rem 0",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      📅 Dates
                    </p>
                    <p
                      style={{
                        fontSize: "1.1rem",
                        color: "#1a1a2e",
                        margin: 0,
                        fontWeight: 600,
                      }}
                    >
                      {new Date(event.startDate).toLocaleDateString("en-IN", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {event.endDate && event.endDate !== event.startDate && (
                        <>
                          {" - "}
                          {new Date(event.endDate).toLocaleDateString("en-IN", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </>
                      )}
                    </p>
                  </div>

                  {/* Location */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#999",
                        margin: "0 0 0.5rem 0",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      📍 Location
                    </p>
                    <a
                      href={`https://www.google.com/maps/search/${encodeURIComponent(event.location + " " + event.city + " " + event.state)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        fontSize: "1.1rem",
                        color: "#667eea",
                        margin: 0,
                        fontWeight: 600,
                        textDecoration: "none",
                        transition: "all 0.2s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.textDecoration = "underline";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.textDecoration = "none";
                      }}
                    >
                      {event.location}
                      <br />
                      {event.city}, {event.state}
                    </a>
                  </div>

                  {/* Price */}
                  <div style={{ marginBottom: "1.5rem" }}>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#999",
                        margin: "0 0 0.5rem 0",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      💰 Price
                    </p>
                    <p
                      style={{
                        fontSize: "1.5rem",
                        color: "#667eea",
                        margin: 0,
                        fontWeight: 700,
                      }}
                    >
                      {event.ticketPrice === 0
                        ? "Free"
                        : `₹${event.ticketPrice.toLocaleString()}`}
                    </p>
                  </div>

                  {/* Category */}
                  <div>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#999",
                        margin: "0 0 0.5rem 0",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      🏷️ Category
                    </p>
                    <p
                      style={{
                        fontSize: "1.1rem",
                        color: "#1a1a2e",
                        margin: 0,
                        fontWeight: 600,
                      }}
                    >
                      {event.category || "Not specified"}
                    </p>
                  </div>
                </div>

                {/* Description */}
                {event.description && (
                  <div>
                    <h2
                      style={{
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        color: "#1a1a2e",
                        margin: "0 0 1rem 0",
                      }}
                    >
                      About This Event
                    </h2>
                    <p
                      style={{
                        fontSize: "1rem",
                        color: "#666",
                        lineHeight: 1.8,
                        margin: 0,
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {event.description}
                    </p>
                  </div>
                )}
              </div>

              {/* Right Column - Booking */}
              <div>
                {/* Booking Card */}
                <div
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    border: "2px solid rgba(102, 126, 234, 0.1)",
                    padding: "clamp(1.5rem, 3vw, 2.5rem)",
                    position: "sticky",
                    top: "120px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      color: "#1a1a2e",
                      margin: "0 0 1.5rem 0",
                    }}
                  >
                    Ready to Join?
                  </h2>

                  {/* Summary */}
                  <div
                    style={{
                      background:
                        "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      marginBottom: "2rem",
                    }}
                  >
                    <div style={{ marginBottom: "1rem" }}>
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#999",
                          margin: "0 0 0.25rem 0",
                          fontWeight: 600,
                        }}
                      >
                        Price
                      </p>
                      <p
                        style={{
                          fontSize: "1.8rem",
                          color: "#667eea",
                          margin: 0,
                          fontWeight: 700,
                        }}
                      >
                        {event.ticketPrice === 0
                          ? "Free"
                          : `₹${event.ticketPrice.toLocaleString()}`}
                      </p>
                    </div>

                    <div
                      style={{
                        paddingTop: "1rem",
                        borderTop: "1px solid rgba(0, 0, 0, 0.1)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: "0.85rem",
                          color: "#666",
                          margin: 0,
                        }}
                      >
                        📅{" "}
                        {new Date(event.startDate).toLocaleDateString("en-IN", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>

                  {/* CTA Button */}
                  {event.registrationLink ? (
                    <a
                      href={event.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        display: "block",
                        width: "100%",
                        padding: "1rem",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        borderRadius: "12px",
                        textDecoration: "none",
                        fontWeight: 700,
                        fontSize: "1rem",
                        textAlign: "center",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        border: "none",
                        marginBottom: "1rem",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 8px 20px rgba(102, 126, 234, 0.4)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      Register Now →
                    </a>
                  ) : (
                    <button
                      style={{
                        width: "100%",
                        padding: "1rem",
                        background:
                          "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                        color: "white",
                        borderRadius: "12px",
                        fontWeight: 700,
                        fontSize: "1rem",
                        transition: "all 0.3s ease",
                        cursor: "pointer",
                        border: "none",
                        marginBottom: "1rem",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.boxShadow =
                          "0 8px 20px rgba(102, 126, 234, 0.4)";
                        e.currentTarget.style.transform = "translateY(-2px)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.boxShadow = "none";
                        e.currentTarget.style.transform = "translateY(0)";
                      }}
                    >
                      Get More Info →
                    </button>
                  )}

                  {/* Share Button */}
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: event.eventName,
                          text: `Check out ${event.eventName}!`,
                          url: window.location.href,
                        });
                      }
                    }}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "transparent",
                      color: "#667eea",
                      borderRadius: "12px",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      border: "2px solid #667eea",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background =
                        "rgba(102, 126, 234, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    Share Event
                  </button>

                  {/* Back Button */}
                  <button
                    onClick={() => router.back()}
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      background: "transparent",
                      color: "#666",
                      borderRadius: "12px",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      transition: "all 0.3s ease",
                      cursor: "pointer",
                      border: "2px solid #e5e7eb",
                      marginTop: "1rem",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#f3f4f6";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    ← Back
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Responsive Styles */}
        <style>{`
          @media (max-width: 768px) {
            div[style*="gridTemplateColumns: \"1fr 1fr\""] {
              grid-template-columns: 1fr !important;
            }

            div[style*="position: sticky"] {
              position: static !important;
              margin-top: 2rem;
            }
          }
        `}</style>
      </main>

      {/* Fullscreen Image Gallery Modal */}
      {showFullscreenGallery && event?.galleryImages && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.95)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowFullscreenGallery(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowFullscreenGallery(false)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              color: "white",
              fontSize: "2rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10001,
            }}
          >
            ×
          </button>

          {/* Image Counter */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0, 0, 0, 0.7)",
              color: "white",
              padding: "10px 20px",
              borderRadius: "20px",
              fontSize: "1rem",
              zIndex: 10001,
            }}
          >
            {fullscreenImageIndex + 1} / {event.galleryImages.length}
          </div>

          {/* Previous Button */}
          {fullscreenImageIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImageIndex(fullscreenImageIndex - 1);
              }}
              style={{
                position: "absolute",
                left: "20px",
                background: "rgba(255, 255, 255, 0.2)",
                border: "none",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                color: "white",
                fontSize: "2rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10001,
              }}
            >
              ‹
            </button>
          )}

          {/* Image */}
          <img
            src={event.galleryImages[fullscreenImageIndex]}
            alt={`${event.eventName} ${fullscreenImageIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              objectFit: "contain",
            }}
          />

          {/* Next Button */}
          {fullscreenImageIndex < event.galleryImages.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImageIndex(fullscreenImageIndex + 1);
              }}
              style={{
                position: "absolute",
                right: "20px",
                background: "rgba(255, 255, 255, 0.2)",
                border: "none",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                color: "white",
                fontSize: "2rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10001,
              }}
            >
              ›
            </button>
          )}
        </div>
      )}
    </div>
  );
}
