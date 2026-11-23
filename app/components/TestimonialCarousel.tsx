"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import {
  Star,
  Camera,
  Video,
  Play,
  Building2,
  MapPin,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  X,
  Maximize2,
} from "lucide-react";
import MarqueeSlider from "./MarqueeSlider";

export interface TestimonialMedia {
  type: "photo" | "video";
  url: string;
  thumbnailUrl?: string;
  altText?: string;
}

export interface TestimonialItem {
  _id?: string;
  id?: string;
  reviewerName?: string;
  name?: string;
  userName?: string;
  reviewerAvatarUrl?: string;
  image?: string;
  userImage?: string;
  rating?: number;
  reviewText?: string;
  text?: string;
  propertyId?: string;
  propertyName?: string;
  propertyCity?: string;
  propertyState?: string;
  propertyType?: string;
  location?: string;
  media?: TestimonialMedia[];
  isPublished?: boolean;
  verified?: boolean;
  active?: boolean;
  createdAt?: string | Date;
}

interface TestimonialCarouselProps {
  testimonials: TestimonialItem[];
  loading?: boolean;
}

const DEFAULT_TESTIMONIALS: TestimonialItem[] = [
  {
    _id: "testm_1",
    reviewerName: "Aarav Mehta",
    reviewerAvatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    reviewText:
      "Our family trip to Manali was truly unforgettable. The morning views of the snow-capped valley right from our balcony were breathtaking. Every detail was handled seamlessly by TravelExpertz from cab pickup to checkout.",
    propertyId: "prop_manali_retreat",
    propertyName: "The Himalayan Retreat Homestay",
    propertyCity: "Manali",
    propertyState: "Himachal Pradesh",
    propertyType: "Homestay",
    media: [
      {
        type: "photo",
        url: "/hero1.jpeg",
        thumbnailUrl: "/hero1.jpeg",
        altText: "Breathtaking mountain sunrise at The Himalayan Retreat Homestay in Manali",
      },
    ],
    isPublished: true,
  },
  {
    _id: "testm_2",
    reviewerName: "Riya & Kabir",
    reviewerAvatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    reviewText:
      "We hosted our pre-wedding retreat at this stunning heritage property in Jaipur. The royal courtyards, traditional folk music in the evenings, and impeccable hospitality exceeded all our expectations!",
    propertyId: "prop_jaipur_palace",
    propertyName: "Heritage Palace & Spa Resort",
    propertyCity: "Jaipur",
    propertyState: "Rajasthan",
    propertyType: "Hotel",
    media: [
      {
        type: "video",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        thumbnailUrl: "/hero4.jpeg",
        altText: "Tour of Heritage Palace & Spa Resort grounds in Jaipur",
      },
    ],
    isPublished: true,
  },
  {
    _id: "testm_3",
    reviewerName: "Neha Sharma",
    reviewerAvatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    reviewText:
      "Waking up to the sound of ocean waves at this beachfront villa in Goa was bliss. Clean private pool, sunset drinks on the deck, and super helpful staff. Highly recommend booking through TravelExpertz!",
    propertyId: "prop_goa_villa",
    propertyName: "Sea Breeze Luxury Beachfront Villa",
    propertyCity: "Calangute",
    propertyState: "Goa",
    propertyType: "Hotel",
    media: [
      {
        type: "photo",
        url: "/hero3.jpeg",
        thumbnailUrl: "/hero3.jpeg",
        altText: "Calangute beachfront villa pool and sea view",
      },
    ],
    isPublished: true,
  },
  {
    _id: "testm_4",
    reviewerName: "Vikramaditya Sen",
    reviewerAvatarUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
    rating: 4,
    reviewText:
      "Munnar's lush tea estates and misty mornings are therapeutic. Whispering Pines provided peaceful luxury surrounded by cardamom plantations. Trekking assistance arranged by the hosts was top-notch.",
    propertyId: "prop_munnar_pines",
    propertyName: "Whispering Pines Nature Resort",
    propertyCity: "Munnar",
    propertyState: "Kerala",
    propertyType: "Hotel",
    media: [
      {
        type: "video",
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        thumbnailUrl: "/hero2.jpeg",
        altText: "Misty tea garden views from Whispering Pines resort in Munnar",
      },
    ],
    isPublished: true,
  },
  {
    _id: "testm_5",
    reviewerName: "Ananya Deshmukh",
    reviewerAvatarUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80",
    rating: 5,
    reviewText:
      "A magical weekend in Udaipur! Watching the sun set over Lake Pichola from the heritage rooftop dining area is an experience I will cherish forever. Everything was effortless.",
    propertyId: "prop_udaipur_haveli",
    propertyName: "Lakeview Heritage Haveli",
    propertyCity: "Udaipur",
    propertyState: "Rajasthan",
    propertyType: "Homestay",
    media: [
      {
        type: "photo",
        url: "/hero-bg.jpg",
        thumbnailUrl: "/hero-bg.jpg",
        altText: "Rooftop dining view of Lake Pichola Udaipur",
      },
    ],
    isPublished: true,
  },
];

export default function TestimonialCarousel({
  testimonials = [],
  loading = false,
}: TestimonialCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [expandedReviews, setExpandedReviews] = useState<Record<string, boolean>>({});

  const touchStartXRef = useRef<number | null>(null);
  const touchEndXRef = useRef<number | null>(null);
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({});

  // Responsive cards per view (3 on desktop, 2 on tablet, 1 on mobile)
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width < 640) {
        setCardsPerView(1);
      } else if (width < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Merge incoming testimonials with DEFAULT_TESTIMONIALS so approved user reviews
  // are displayed together with the existing published reviews on the website.
  const rawList = useMemo(() => {
    if (!testimonials || testimonials.length === 0) {
      return DEFAULT_TESTIMONIALS;
    }
    const map = new Map<string, any>();
    // Put incoming server testimonials first (newly approved reviews appear at the top)
    testimonials.forEach((t) => {
      const id = t._id || t.id;
      if (id) map.set(id, t);
    });
    // Add default published reviews if not already present
    DEFAULT_TESTIMONIALS.forEach((d) => {
      const id = d._id || d.id;
      if (id && !map.has(id)) {
        map.set(id, d);
      }
    });
    return Array.from(map.values());
  }, [testimonials]);

  const items = rawList.filter((t) =>
    t.isPublished !== undefined
      ? t.isPublished
      : t.verified !== undefined
      ? t.verified
      : t.active !== undefined
      ? t.active
      : true,
  );

  const totalItems = items.length;
  const maxIndex = Math.max(0, totalItems - cardsPerView);

  // Auto-pause any active video when navigating slides
  const pauseAllVideos = () => {
    Object.values(videoRefs.current).forEach((video) => {
      if (video && !video.paused) {
        video.pause();
      }
    });
    setActiveVideoId(null);
  };

  const handlePrev = () => {
    pauseAllVideos();
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const handleNext = () => {
    pauseAllVideos();
    setCurrentIndex((prev) => Math.min(maxIndex, prev + 1));
  };

  const handleDotClick = (index: number) => {
    pauseAllVideos();
    setCurrentIndex(Math.min(maxIndex, index));
  };

  // Touch swipe support
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndXRef.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartXRef.current === null || touchEndXRef.current === null) return;
    const diff = touchStartXRef.current - touchEndXRef.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
    touchStartXRef.current = null;
    touchEndXRef.current = null;
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowLeft") {
      handlePrev();
    } else if (e.key === "ArrowRight") {
      handleNext();
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handlePlayVideo = (id: string) => {
    pauseAllVideos();
    setActiveVideoId(id);
    setTimeout(() => {
      const vid = videoRefs.current[id];
      if (vid) {
        vid.play().catch(() => {});
      }
    }, 50);
  };

  // Skeleton loading state
  if (loading) {
    return (
      <div className="testimonial-carousel-wrap">
        <div className="testimonial-grid-skeleton">
          {[1, 2, 3].map((n) => (
            <div key={n} className="testimonial-card skeleton-card">
              <div className="skeleton-media" />
              <div className="skeleton-stars" />
              <div className="skeleton-text" />
              <div className="skeleton-text short" />
              <div className="skeleton-divider" />
              <div className="skeleton-footer" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (totalItems === 0) {
    return (
      <div className="testimonial-empty-state">
        <p>No customer reviews available at the moment. Please check back soon!</p>
      </div>
    );
  }

  // Calculate pages for pagination dots
  const totalPages = maxIndex + 1;

  return (
    <>
      <MarqueeSlider
        className="testimonial-marquee"
        trackClassName="testimonial-marquee-track"
        ariaLabel="Stories of Happy Journeys Testimonials"
        secondsPerCard={17}
      >
        {items.map((item, index) => {
          const itemId = item._id || item.id || `item_${index}`;
            const reviewerName =
              item.reviewerName || item.name || item.userName || "Happy Traveller";
            const avatarUrl =
              item.reviewerAvatarUrl || item.image || item.userImage || "";
            const rating = Number(item.rating) || 5;
            const fullText = item.reviewText || item.text || "";
            const isLong = fullText.length > 160;
            const isExpanded = !!expandedReviews[itemId];
            const displayedText =
              isLong && !isExpanded
                ? fullText.slice(0, 155).trim() + "..."
                : fullText;

            const mediaList: TestimonialMedia[] =
              Array.isArray(item.media) && item.media.length > 0
                ? item.media
                : item.image && !item.image.includes("unsplash.com/photo-")
                ? [{ type: "photo", url: item.image, thumbnailUrl: item.image }]
                : [
                    {
                      type: "photo",
                      url: "/hero4.jpeg",
                      thumbnailUrl: "/hero4.jpeg",
                      altText: "TravelExpertz Happy Journey",
                    },
                  ];

            const activeMedia = mediaList[0];
            const isVideo = activeMedia?.type === "video";
            const isPlayingThisVideo = isVideo && activeVideoId === itemId;

            // Property details
            const propertyName = item.propertyName || "";
            let city = (item.propertyCity || "").trim();
            let state = (item.propertyState || "").trim();

            if (!city && !state && item.location) {
              const parts = item.location
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean);
              if (parts.length >= 2) {
                city = parts[0];
                state = parts[1];
              } else if (parts.length === 1) {
                city = parts[0];
              }
            } else if (city && !state && item.location && item.location.includes(",")) {
              const parts = item.location
                .split(",")
                .map((s: string) => s.trim())
                .filter(Boolean);
              if (parts.length >= 2) {
                state = parts[1];
              }
            }
            const rawLocationFallback = !city && !state ? item.location : "";
            const propertyId = item.propertyId;
            const propertyType = (item.propertyType || "Hotel").toLowerCase();
            const propertyDetailUrl = propertyId
              ? propertyType.includes("homestay")
                ? `/homestays/${propertyId}`
                : `/hotels/${propertyId}`
              : null;

            return (
              <div
                key={`${itemId}-${index}`}
                className="testimonial-slide-cell"
              >
                <article className="premium-testimonial-card">
                  {/* A. Media Area — Top (16:9) */}
                  <div className="card-media-wrapper">
                    {isVideo ? (
                      isPlayingThisVideo ? (
                        <video
                          ref={(el) => {
                            videoRefs.current[itemId] = el;
                          }}
                          src={activeMedia.url}
                          controls
                          playsInline
                          className="card-media-video"
                          onEnded={() => setActiveVideoId(null)}
                        />
                      ) : (
                        <div
                          className="card-video-poster-wrap"
                          onClick={() => handlePlayVideo(itemId)}
                          role="button"
                          tabIndex={0}
                          aria-label={`Play video review by ${reviewerName}`}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handlePlayVideo(itemId);
                            }
                          }}
                        >
                          <img
                            src={activeMedia.thumbnailUrl || "/hero4.jpeg"}
                            alt={activeMedia.altText || `Video review by ${reviewerName}`}
                            className="card-media-img"
                            loading="lazy"
                          />
                          <div className="video-play-overlay">
                            <div className="play-button-circle">
                              <Play size={22} fill="#0b6dff" color="#0b6dff" />
                            </div>
                          </div>
                          <span className="media-badge video-badge">
                            <Video size={12} /> Video
                          </span>
                        </div>
                      )
                    ) : (
                      <div
                        className="card-photo-wrap"
                        onClick={() =>
                          setLightboxImage(activeMedia.url || activeMedia.thumbnailUrl || "")
                        }
                        role="button"
                        tabIndex={0}
                        aria-label={`View full photo review by ${reviewerName}`}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            setLightboxImage(activeMedia.url || activeMedia.thumbnailUrl || "");
                          }
                        }}
                      >
                        <img
                          src={activeMedia.url || activeMedia.thumbnailUrl || "/hero4.jpeg"}
                          alt={activeMedia.altText || `Photo review by ${reviewerName}`}
                          className="card-media-img"
                          loading="lazy"
                        />
                        <span className="media-badge photo-badge">
                          <Camera size={12} /> Photo
                        </span>
                        <div className="photo-expand-hint" title="View full photo">
                          <Maximize2 size={14} />
                        </div>
                      </div>
                    )}

                    {/* Multi-media counter badge */}
                    {mediaList.length > 1 && (
                      <span className="multi-media-pill">
                        +{mediaList.length - 1} more
                      </span>
                    )}
                  </div>

                  {/* B. Star Rating */}
                  <div
                    className="card-star-rating"
                    aria-label={`Rated ${rating} out of 5 stars`}
                  >
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        size={17}
                        className={star <= rating ? "star-gold" : "star-muted"}
                        fill={star <= rating ? "#f59e0b" : "none"}
                        color={star <= rating ? "#f59e0b" : "#cbd5e1"}
                      />
                    ))}
                    <span className="rating-number">{rating.toFixed(1)}</span>
                  </div>

                  {/* C. Review Description */}
                  <div className="card-description-box">
                    <p className="card-review-text">
                      &ldquo;{displayedText}&rdquo;
                    </p>
                    {isLong && (
                      <button
                        type="button"
                        onClick={() => toggleExpand(itemId)}
                        className="read-more-toggle"
                      >
                        {isExpanded ? "Read less" : "Read more"}
                      </button>
                    )}
                  </div>

                  {/* Spacer to push Property & Reviewer info uniformly to bottom */}
                  <div className="card-flex-spacer" />

                  {/* D. Property Information with Subtle Divider */}
                  <div className="card-property-section">
                    {propertyName ? (
                      <div className="property-name-row">
                        <Building2 size={15} className="property-icon" />
                        {propertyDetailUrl ? (
                          <Link
                            href={propertyDetailUrl}
                            className="property-name-link"
                            title={`View details for ${propertyName}`}
                          >
                            {propertyName}
                          </Link>
                        ) : (
                          <span className="property-name-text">{propertyName}</span>
                        )}
                      </div>
                    ) : (
                      <div className="property-name-row">
                        <Building2 size={15} className="property-icon" />
                        <span className="property-name-text">TravelExpertz Verified Stay</span>
                      </div>
                    )}

                    {(city || state || rawLocationFallback) && (
                      <div className="property-location-row">
                        <MapPin size={13} className="location-pin-icon" />
                        <span className="location-text">
                          {city && (
                            <Link
                              href={`/hotels/search?location=${encodeURIComponent(city)}`}
                              className="event-location-link"
                              onClick={(e) => e.stopPropagation()}
                              title={`View properties in ${city}`}
                            >
                              {city}
                            </Link>
                          )}
                          {city && state && (
                            <span style={{ color: "#64748b" }}>, </span>
                          )}
                          {state && (
                            <Link
                              href={`/hotels/search?location=${encodeURIComponent(state)}`}
                              className="event-location-link"
                              onClick={(e) => e.stopPropagation()}
                              title={`View properties in ${state}`}
                            >
                              {state}
                            </Link>
                          )}
                          {rawLocationFallback && (
                            <Link
                              href={`/hotels/search?location=${encodeURIComponent(rawLocationFallback)}`}
                              className="event-location-link"
                              onClick={(e) => e.stopPropagation()}
                              title={`View properties in ${rawLocationFallback}`}
                            >
                              {rawLocationFallback}
                            </Link>
                          )}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* E. Reviewer Information */}
                  <div className="card-reviewer-footer">
                    <div className="reviewer-avatar-wrap">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt={reviewerName}
                          className="reviewer-avatar-img"
                          loading="lazy"
                        />
                      ) : (
                        <div className="reviewer-initials-avatar">
                          {reviewerName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="reviewer-meta">
                      <h4 className="reviewer-name">{reviewerName}</h4>
                      <div className="verified-badge">
                        <CheckCircle2 size={12} className="verified-icon" />
                        <span>Verified Traveller</span>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            );
          })}
      </MarqueeSlider>

      {/* Photo Lightbox Modal */}
      {lightboxImage && (
        <div
          className="testimonial-lightbox-backdrop"
          onClick={() => setLightboxImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="testimonial-lightbox-content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setLightboxImage(null)}
              aria-label="Close photo preview"
            >
              <X size={20} />
            </button>
            <img
              src={lightboxImage}
              alt="Customer review photo"
              className="lightbox-img"
            />
          </div>
        </div>
      )}
    </>
  );
}