"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Header from "./components/Header";

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

interface Testimonial {
  _id?: string;
  id?: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  text: string;
  verified?: boolean;
}

interface FAQ {
  _id?: string;
  id?: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  active: boolean;
}

interface Package {
  _id?: string;
  id?: string;
  title: string;
  description: string;
  fullDescription: string;
  image: string;
  price: number;
  currency: string;
  duration: string;
  location: string;
  highlights: string[];
  itinerary: Array<{ day: number; title: string; description: string }>;
  inclusions: string[];
  exclusions: string[];
  bestTime: string;
  difficulty: string;
  groupSize: string;
  notes?: string;
  customFields?: Array<{ label: string; value: string }>;
  featured: boolean;
  active: boolean;
  createdAt?: string;
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

  // Testimonials State
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [currentTestimonialIndex, setCurrentTestimonialIndex] = useState(0);
  const [testimonialsLoading, setTestimonialsLoading] = useState(true);

  // FAQ State
  const [faqs, setFAQs] = useState<FAQ[]>([]);
  const [expandedFAQIndex, setExpandedFAQIndex] = useState<number | null>(null);
  const [faqSearchQuery, setFAQSearchQuery] = useState("");
  const [selectedFAQCategory, setSelectedFAQCategory] = useState<string | null>(
    null
  );
  const [faqsLoading, setFAQsLoading] = useState(true);

  // Packages State
  const [packages, setPackages] = useState<Package[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(true);
  const [packageSearchQuery, setPackageSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(
    null
  );
  const [selectedDuration, setSelectedDuration] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("featured");
  const [priceSort, setPriceSort] = useState<string | null>(null);
  const [packageSlide, setPackageSlide] = useState(0);

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

  // Fetch testimonials
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials", {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          const testimonialList = Array.isArray(data)
            ? data
            : Array.isArray(data.data)
            ? data.data
            : [];
          if (testimonialList.length > 0) {
            setTestimonials(testimonialList);
            const randomIndex = Math.floor(
              Math.random() * testimonialList.length
            );
            setCurrentTestimonialIndex(randomIndex);
          }
        }
      } catch (error) {
        console.log("Using default testimonials", error);
      } finally {
        setTestimonialsLoading(false);
      }
    };
    fetchTestimonials();
  }, []);

  // Testimonials auto-play
  useEffect(() => {
    if (testimonials.length === 0) return;
    const interval = setInterval(() => {
      setCurrentTestimonialIndex((prev) => (prev + 1) % testimonials.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  // Fetch FAQs
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch("/api/faqs", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          const faqList = Array.isArray(data)
            ? data
            : Array.isArray(data.data)
            ? data.data
            : [];
          if (faqList.length > 0) setFAQs(faqList);
        }
      } catch (error) {
        console.log("Using default FAQs", error);
      } finally {
        setFAQsLoading(false);
      }
    };
    fetchFAQs();
  }, []);

  // Fetch packages
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch("/api/packages", { cache: "no-store" });
        if (response.ok) {
          const data = await response.json();
          const packageList = Array.isArray(data)
            ? data
            : Array.isArray(data.data)
            ? data.data
            : [];
          if (packageList.length > 0) setPackages(packageList);
        }
      } catch (error) {
        console.log("Failed to fetch packages", error);
      } finally {
        setPackagesLoading(false);
      }
    };
    fetchPackages();
  }, []);

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

  // Smart FAQ search - matches individual words and related terms
  const smartSearch = (text: string, query: string): boolean => {
    if (!query.trim()) return true;

    const searchText = text.toLowerCase();
    const searchQuery = query.toLowerCase().trim();

    // Direct match
    if (searchText.includes(searchQuery)) return true;

    // Split query into individual words (remove common stop words)
    const stopWords = [
      "how",
      "do",
      "i",
      "can",
      "what",
      "is",
      "the",
      "a",
      "an",
      "to",
      "for",
      "of",
      "and",
      "or",
      "my",
      "your",
      "we",
      "you",
      "are",
      "there",
      "want",
      "need",
      "would",
      "like",
      "about",
    ];
    const queryWords = searchQuery
      .split(/\s+/)
      .filter((word) => word.length > 1 && !stopWords.includes(word));

    // Match if any significant word from query is found
    if (queryWords.length > 0) {
      const matchCount = queryWords.filter((word) =>
        searchText.includes(word)
      ).length;
      // Match if at least one keyword matches, or partial match for longer queries
      if (matchCount > 0) return true;
    }

    // Synonym/related word matching
    const synonyms: { [key: string]: string[] } = {
      book: [
        "booking",
        "reserve",
        "reservation",
        "purchase",
        "buy",
        "get",
        "order",
      ],
      cancel: ["cancellation", "cancelled", "refund", "void", "terminate"],
      modify: ["change", "edit", "update", "alter", "modification", "amend"],
      pay: ["payment", "paying", "paid", "charge", "fee", "cost", "price"],
      flight: [
        "flights",
        "fly",
        "flying",
        "plane",
        "airplane",
        "air",
        "ticket",
      ],
      hotel: ["hotels", "stay", "room", "accommodation", "lodge", "lodging"],
      refund: ["refunds", "money back", "reimburse", "return", "reimbursement"],
      support: [
        "help",
        "contact",
        "assistance",
        "customer service",
        "reach",
        "call",
      ],
      insurance: ["insure", "insured", "protection", "coverage", "policy"],
      visa: ["visas", "travel document", "documentation", "passport"],
    };

    // Check if any query word has a synonym match in the text
    for (const word of queryWords) {
      for (const [key, syns] of Object.entries(synonyms)) {
        if (
          word.includes(key) ||
          key.includes(word) ||
          syns.some((s) => word.includes(s))
        ) {
          if (
            searchText.includes(key) ||
            syns.some((s) => searchText.includes(s))
          ) {
            return true;
          }
        }
      }
    }

    return false;
  };

  // Filter FAQs
  const faqCategories = Array.from(
    new Set(faqs.map((faq) => faq.category))
  ).sort();
  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      smartSearch(faq.question, faqSearchQuery) ||
      smartSearch(faq.answer, faqSearchQuery);
    const matchesCategory =
      !selectedFAQCategory || faq.category === selectedFAQCategory;
    return matchesSearch && matchesCategory;
  });

  // Limit to 5 FAQs when "All" is selected and no search query
  const displayedFAQs =
    !selectedFAQCategory && !faqSearchQuery
      ? filteredFAQs.slice(0, 5)
      : filteredFAQs;

  // Filter packages
  const filteredPackages = packages
    .filter((pkg) => {
      const matchesSearch =
        smartSearch(pkg.title, packageSearchQuery) ||
        smartSearch(pkg.description, packageSearchQuery) ||
        smartSearch(pkg.location, packageSearchQuery);
      const matchesDifficulty =
        !selectedDifficulty || pkg.difficulty === selectedDifficulty;

      // Duration filters
      let matchesDuration = true;
      if (selectedDuration) {
        const durationDays = parseInt(pkg.duration);
        switch (selectedDuration) {
          case "1day":
            matchesDuration = durationDays === 1;
            break;
          case "under5":
            matchesDuration = durationDays < 5;
            break;
          case "under7":
            matchesDuration = durationDays < 7;
            break;
          default:
            matchesDuration = true;
        }
      }

      return matchesSearch && matchesDifficulty && matchesDuration;
    })
    .sort((a, b) => {
      // Sorting logic
      if (priceSort === "low-high") {
        return a.price - b.price;
      } else if (priceSort === "high-low") {
        return b.price - a.price;
      } else if (sortBy === "newest") {
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      }
      // Default: featured first
      return (b.featured ? 1 : 0) - (a.featured ? 1 : 0);
    });

  const visiblePackages = 3;
  const usePackageCarousel = filteredPackages.length >= 4;
  const maxPackageSlide = Math.max(
    0,
    filteredPackages.length - visiblePackages
  );

  useEffect(() => {
    if (packageSlide > maxPackageSlide) {
      setPackageSlide(0);
    }
  }, [packageSlide, maxPackageSlide]);

  const displayedPackages = usePackageCarousel
    ? filteredPackages.slice(packageSlide, packageSlide + visiblePackages)
    : filteredPackages;

  const currentTestimonial = testimonials[currentTestimonialIndex];

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

          {/* ========== OUR PACKAGES SECTION ========== */}
          <section
            style={{
              padding: "4rem 1rem",
              background: "transparent",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Soft radial background accents */}
            <div
              style={{
                position: "absolute",
                top: "-100px",
                right: "-100px",
                width: "400px",
                height: "400px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(0, 102, 204, 0.08) 0%, transparent 70%)",
                zIndex: 0,
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-150px",
                left: "-150px",
                width: "500px",
                height: "500px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(0, 102, 204, 0.06) 0%, transparent 70%)",
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
                    color: "#1a1a2e",
                    margin: "0 0 1rem 0",
                    textShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                    letterSpacing: "-0.5px",
                  }}
                >
                  Our Packages
                </h2>
                <p
                  style={{
                    fontSize: "1.1rem",
                    color: "#666",
                    maxWidth: "600px",
                    margin: "0 auto",
                    lineHeight: 1.6,
                  }}
                >
                  Explore our curated travel packages designed for unforgettable
                  experiences
                </p>
              </div>

              {/* Modern Filter & Search Bar */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1.5rem",
                  marginBottom: "2.5rem",
                  maxWidth: "1000px",
                  margin: "0 auto 2.5rem",
                }}
              >
                {/* Search Bar */}
                <div style={{ position: "relative" }}>
                  <input
                    type="text"
                    placeholder="Search packages by name, location..."
                    value={packageSearchQuery}
                    onChange={(e) => setPackageSearchQuery(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "1rem 1.25rem 1rem 3rem",
                      borderRadius: "12px",
                      border: "2px solid rgba(0, 102, 204, 0.2)",
                      fontSize: "1rem",
                      fontFamily: "inherit",
                      transition: "all 0.3s ease",
                      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(0, 102, 204, 0.5)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 16px rgba(0, 102, 204, 0.15)";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor =
                        "rgba(0, 102, 204, 0.2)";
                      e.currentTarget.style.boxShadow =
                        "0 2px 8px rgba(0, 0, 0, 0.04)";
                    }}
                  />
                  <span
                    className="material-symbols-outlined"
                    style={{
                      position: "absolute",
                      left: "1rem",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#0066cc",
                      fontSize: "1.25rem",
                      pointerEvents: "none",
                    }}
                  >
                    search
                  </span>
                </div>

                {/* Filter Buttons */}
                <div
                  className="filter-buttons"
                  style={{
                    display: "flex",
                    gap: "0.75rem",
                    flexWrap: "wrap",
                    alignItems: "center",
                  }}
                >
                  {/* Sort Dropdown */}
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    style={{
                      padding: "0.6rem 1rem",
                      borderRadius: "50px",
                      border: "2px solid #e0e7ff",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      backgroundColor: "#f0f4ff",
                      color: "#1f2937",
                      transition: "all 0.3s ease",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#6366f1";
                      e.currentTarget.style.backgroundColor = "#e0e7ff";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#e0e7ff";
                      e.currentTarget.style.backgroundColor = "#f0f4ff";
                    }}
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                  </select>

                  {/* Price Sort Dropdown */}
                  <select
                    value={priceSort || ""}
                    onChange={(e) => setPriceSort(e.target.value || null)}
                    style={{
                      padding: "0.6rem 1rem",
                      borderRadius: "50px",
                      border: "2px solid #fce7f3",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      backgroundColor: "#fdf2f8",
                      color: "#1f2937",
                      transition: "all 0.3s ease",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#ec4899";
                      e.currentTarget.style.backgroundColor = "#fce7f3";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#fce7f3";
                      e.currentTarget.style.backgroundColor = "#fdf2f8";
                    }}
                  >
                    <option value="">Price: All</option>
                    <option value="low-high">Price: Low to High</option>
                    <option value="high-low">Price: High to Low</option>
                  </select>

                  {/* Difficulty Dropdown */}
                  <select
                    value={selectedDifficulty || ""}
                    onChange={(e) =>
                      setSelectedDifficulty(e.target.value || null)
                    }
                    style={{
                      padding: "0.6rem 1rem",
                      borderRadius: "50px",
                      border: "2px solid #dbeafe",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      backgroundColor: "#f0f9ff",
                      color: "#1f2937",
                      transition: "all 0.3s ease",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#0284c7";
                      e.currentTarget.style.backgroundColor = "#e0f2fe";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#dbeafe";
                      e.currentTarget.style.backgroundColor = "#f0f9ff";
                    }}
                  >
                    <option value="">Difficulty: All</option>
                    <option value="Easy">Easy</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Difficult">Difficult</option>
                  </select>

                  {/* Duration Dropdown */}
                  <select
                    value={selectedDuration || ""}
                    onChange={(e) =>
                      setSelectedDuration(e.target.value || null)
                    }
                    style={{
                      padding: "0.6rem 1rem",
                      borderRadius: "50px",
                      border: "2px solid #dcfce7",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      backgroundColor: "#f0fdf4",
                      color: "#1f2937",
                      transition: "all 0.3s ease",
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#16a34a";
                      e.currentTarget.style.backgroundColor = "#dcfce7";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#dcfce7";
                      e.currentTarget.style.backgroundColor = "#f0fdf4";
                    }}
                  >
                    <option value="">Duration: All</option>
                    <option value="1day">1 Day</option>
                    <option value="under5">Under 5 Days</option>
                    <option value="under7">Under 7 Days</option>
                  </select>

                  {/* Reset Filters Button */}
                  <button
                    onClick={() => {
                      setPackageSearchQuery("");
                      setSelectedDifficulty(null);
                      setSelectedDuration(null);
                      setSortBy("featured");
                      setPriceSort(null);
                    }}
                    style={{
                      padding: "0.6rem 1.5rem",
                      borderRadius: "50px",
                      border: "2px solid #fca5a5",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      backgroundColor: "#fef2f2",
                      color: "#dc2626",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "#fee2e2";
                      e.currentTarget.style.borderColor = "#dc2626";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "#fef2f2";
                      e.currentTarget.style.borderColor = "#fca5a5";
                    }}
                    onFocus={(e) => {
                      e.currentTarget.style.borderColor = "#dc2626";
                      e.currentTarget.style.backgroundColor = "#fee2e2";
                    }}
                    onBlur={(e) => {
                      e.currentTarget.style.borderColor = "#fca5a5";
                      e.currentTarget.style.backgroundColor = "#fef2f2";
                    }}
                  >
                    ✕ Reset
                  </button>
                </div>
              </div>

              {/* Packages Grid */}
              <div
                className="packages-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "1rem",
                  maxWidth: "1000px",
                  margin: "0 auto",
                }}
              >
                {displayedPackages.map((pkg, index) => {
                  const customFields = (pkg.customFields || []).filter(
                    (cf) => cf.label && cf.value
                  );
                  const globalIndex = usePackageCarousel
                    ? packageSlide + index
                    : index;

                  return (
                    <div
                      key={pkg._id || pkg.id || index}
                      className="package-card"
                      style={{
                        cursor: "pointer",
                        borderRadius: "24px",
                        overflow: "hidden",
                        background: "rgba(255, 255, 255, 0.85)",
                        backdropFilter: "blur(20px)",
                        WebkitBackdropFilter: "blur(20px)",
                        border: "1px solid rgba(255, 255, 255, 0.9)",
                        boxShadow:
                          "0 12px 40px rgba(0, 102, 204, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)",
                        transition:
                          "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
                        position: "relative",
                        animation: `fadeInUp 0.6s ease-out ${
                          globalIndex * 0.1
                        }s both`,
                        display: "flex",
                        flexDirection: "column",
                        height: "100%",
                      }}
                      onClick={() => {
                        window.location.href = `/packages/${pkg._id || pkg.id}`;
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(-16px) scale(1.02)";
                        e.currentTarget.style.boxShadow =
                          "0 24px 60px rgba(0, 102, 204, 0.18), 0 8px 24px rgba(0, 0, 0, 0.1)";
                        e.currentTarget.style.border =
                          "1px solid rgba(0, 102, 204, 0.3)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform =
                          "translateY(0) scale(1)";
                        e.currentTarget.style.boxShadow =
                          "0 12px 40px rgba(0, 102, 204, 0.1), 0 2px 8px rgba(0, 0, 0, 0.05)";
                        e.currentTarget.style.border =
                          "1px solid rgba(255, 255, 255, 0.9)";
                      }}
                    >
                      {/* Image Container */}
                      <div
                        style={{
                          width: "100%",
                          height: "160px",
                          overflow: "hidden",
                          position: "relative",
                          background:
                            "linear-gradient(135deg, rgba(0, 102, 204, 0.1) 0%, rgba(0, 153, 255, 0.05) 100%)",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background:
                              "linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.05) 100%)",
                            zIndex: 1,
                          }}
                        />
                        <img
                          src={pkg.image}
                          alt={pkg.title}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.5s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.08)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                        />

                        {/* Featured Badge */}
                        {pkg.featured && (
                          <div
                            style={{
                              position: "absolute",
                              top: "8px",
                              right: "8px",
                              background:
                                "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                              color: "white",
                              padding: "0.35rem 0.75rem",
                              borderRadius: "999px",
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              textTransform: "uppercase",
                              letterSpacing: "0.3px",
                              boxShadow: "0 2px 10px rgba(0, 102, 204, 0.2)",
                              zIndex: 2,
                            }}
                          >
                            Featured
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div
                        style={{
                          padding: "1.25rem",
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: "#1a1a2e",
                            margin: "0 0 0.5rem 0",
                            transition: "color 0.3s ease",
                          }}
                        >
                          {pkg.title}
                        </h3>

                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#666",
                            margin: "0 0 1rem 0",
                            lineHeight: 1.5,
                            flex: 1,
                          }}
                        >
                          {pkg.description}
                        </p>

                        {customFields.length > 0 && (
                          <div
                            style={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: "0.35rem",
                              marginBottom: "0.9rem",
                            }}
                          >
                            {customFields.slice(0, 3).map((cf, idx) => (
                              <span
                                key={idx}
                                style={{
                                  padding: "0.3rem 0.6rem",
                                  borderRadius: "999px",
                                  background: "#eef2ff",
                                  color: "#312e81",
                                  fontSize: "0.8rem",
                                  border: "1px solid #c7d2fe",
                                }}
                              >
                                {cf.label}: {cf.value}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Package Details Grid */}
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr",
                            gap: "0.75rem",
                            marginBottom: "1rem",
                            paddingBottom: "1rem",
                            borderBottom: "1px solid rgba(0, 0, 0, 0.08)",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: "0.7rem",
                                color: "#999",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.3px",
                                marginBottom: "0.2rem",
                              }}
                            >
                              Duration
                            </div>
                            <div
                              style={{
                                fontSize: "0.9rem",
                                fontWeight: 700,
                                color: "#0066cc",
                              }}
                            >
                              {pkg.duration}
                            </div>
                          </div>
                          <div>
                            <div
                              style={{
                                fontSize: "0.7rem",
                                color: "#999",
                                fontWeight: 600,
                                textTransform: "uppercase",
                                letterSpacing: "0.3px",
                                marginBottom: "0.2rem",
                              }}
                            >
                              Location
                            </div>
                            <div
                              style={{
                                fontSize: "0.9rem",
                                fontWeight: 700,
                                color: "#1a1a2e",
                              }}
                            >
                              {pkg.location}
                            </div>
                          </div>
                        </div>

                        {/* Price and CTA */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            gap: "0.75rem",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontSize: "0.7rem",
                                color: "#999",
                                fontWeight: 600,
                                marginBottom: "0.15rem",
                              }}
                            >
                              {pkg.price === 0 ? "Price" : "Starting From"}
                            </div>
                            <div
                              style={{
                                fontSize: "1.2rem",
                                fontWeight: 900,
                                background:
                                  "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                                WebkitBackgroundClip: "text",
                                WebkitTextFillColor: "transparent",
                                backgroundClip: "text",
                              }}
                            >
                              {pkg.price === 0
                                ? "On Request"
                                : `${pkg.currency}${pkg.price}`}
                            </div>
                          </div>
                          <button
                            style={{
                              padding: "0.75rem 1.5rem",
                              background:
                                "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                              color: "white",
                              border: "none",
                              borderRadius: "12px",
                              fontSize: "0.9rem",
                              fontWeight: 700,
                              cursor: "pointer",
                              transition: "all 0.3s ease",
                              boxShadow: "0 4px 15px rgba(0, 102, 204, 0.25)",
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              window.location.href = `/packages/${
                                pkg._id || pkg.id
                              }`;
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-2px)";
                              e.currentTarget.style.boxShadow =
                                "0 6px 25px rgba(0, 102, 204, 0.35)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform = "translateY(0)";
                              e.currentTarget.style.boxShadow =
                                "0 4px 15px rgba(0, 102, 204, 0.25)";
                            }}
                          >
                            {pkg.price === 0 ? "View Details" : "View Details"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {usePackageCarousel && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.75rem",
                    marginTop: "1rem",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setPackageSlide((prev) =>
                        prev === 0 ? maxPackageSlide : prev - 1
                      )
                    }
                    style={{
                      padding: "0.5rem 0.9rem",
                      borderRadius: "999px",
                      border: "1px solid #ddd",
                      background: "white",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  >
                    ‹
                  </button>
                  <span style={{ color: "#666", fontSize: "0.9rem" }}>
                    {packageSlide + 1} / {maxPackageSlide + 1}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setPackageSlide((prev) =>
                        prev === maxPackageSlide ? 0 : prev + 1
                      )
                    }
                    style={{
                      padding: "0.5rem 0.9rem",
                      borderRadius: "999px",
                      border: "1px solid #ddd",
                      background: "white",
                      cursor: "pointer",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                    }}
                  >
                    ›
                  </button>
                </div>
              )}
            </div>

            <style>{`
              @keyframes fadeInUp {
                from {
                  opacity: 0;
                  transform: translateY(40px);
                }
                to {
                  opacity: 1;
                  transform: translateY(0);
                }
              }
              
              /* Mobile responsive styles for packages */
              @media (max-width: 768px) {
                .packages-grid {
                  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)) !important;
                  gap: 0.75rem !important;
                  padding: 0 0.5rem;
                }
                
                .package-card {
                  border-radius: 16px !important;
                }
                
                .filter-buttons {
                  gap: 0.5rem !important;
                  justify-content: center;
                }
                
                .filter-buttons button,
                .filter-buttons select {
                  padding: 0.5rem 0.75rem !important;
                  font-size: 0.875rem !important;
                  min-height: 44px !important;
                }
              }
              
              @media (max-width: 480px) {
                .packages-grid {
                  grid-template-columns: 1fr !important;
                  gap: 0.75rem !important;
                }
                
                .filter-buttons {
                  width: 100%;
                }
                
                .filter-buttons button,
                .filter-buttons select {
                  flex: 1;
                  min-width: calc(50% - 0.25rem);
                  text-align: center;
                  justify-content: center;
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
                  Create Your Next Memory
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
                  Join thousands of travelers who have experienced exceptional
                  travel moments with us.
                </p>
              </div>

              {!testimonialsLoading && currentTestimonial && (
                <div
                  style={{
                    maxWidth: "800px",
                    margin: "0 auto",
                    background: "rgba(255, 255, 255, 0.96)",
                    borderRadius: "24px",
                    padding: "2.5rem 2.75rem",
                    boxShadow:
                      "0 18px 45px rgba(15, 23, 42, 0.08), 0 8px 20px rgba(15, 23, 42, 0.05)",
                    border: "1px solid rgba(226, 232, 240, 0.9)",
                    backdropFilter: "blur(18px)",
                    WebkitBackdropFilter: "blur(18px)",
                    animation:
                      "slideInFromRight 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Decorative quote mark */}
                  <div
                    style={{
                      position: "absolute",
                      top: "-10px",
                      right: "1.5rem",
                      fontSize: "5rem",
                      color: "rgba(0, 102, 204, 0.06)",
                      pointerEvents: "none",
                    }}
                  >
                    “
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "1rem",
                      marginBottom: "1.5rem",
                    }}
                  >
                    <div
                      style={{
                        width: "70px",
                        height: "70px",
                        borderRadius: "999px",
                        background:
                          "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow:
                          "0 10px 30px rgba(0, 102, 204, 0.25), 0 0 0 4px rgba(255, 255, 255, 0.9)",
                      }}
                    >
                      <img
                        src={currentTestimonial.image}
                        alt={currentTestimonial.name}
                        style={{
                          width: "60px",
                          height: "60px",
                          borderRadius: "50%",
                          border: "2px solid rgba(255, 255, 255, 0.9)",
                        }}
                      />
                    </div>
                    <div>
                      <h3
                        style={{
                          fontWeight: 700,
                          margin: 0,
                          fontSize: "1.1rem",
                          color: "#111827",
                        }}
                      >
                        {currentTestimonial.name}
                      </h3>
                      <p
                        style={{
                          fontSize: "0.9rem",
                          color: "#6b7280",
                          margin: "0.1rem 0 0.3rem 0",
                        }}
                      >
                        {currentTestimonial.location}
                      </p>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "0.35rem",
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.14em",
                          color: "#059669",
                          background:
                            "linear-gradient(135deg, rgba(16, 185, 129, 0.09) 0%, rgba(16, 185, 129, 0.02) 100%)",
                          borderRadius: "999px",
                          padding: "0.2rem 0.7rem",
                        }}
                      >
                        <span
                          style={{
                            width: "6px",
                            height: "6px",
                            borderRadius: "50%",
                            backgroundColor: "#22c55e",
                          }}
                        />
                        Verified traveler
                      </span>
                    </div>
                  </div>
                  <div style={{ marginBottom: "1rem" }}>
                    {[...Array(currentTestimonial.rating)].map((_, i) => (
                      <span
                        key={i}
                        style={{ color: "#fbbf24", fontSize: "1.25rem" }}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                  <p
                    style={{
                      fontSize: "1.02rem",
                      color: "#4b5563",
                      lineHeight: 1.8,
                      margin: 0,
                    }}
                  >
                    {currentTestimonial.text}
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* ========== FAQ SECTION ========== */}
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
                right: "-80px",
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
                left: "-80px",
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
                padding: "3rem 2rem",
                borderRadius: "24px",
                background: "rgba(255, 255, 255, 0.96)",
                boxShadow:
                  "0 18px 45px rgba(15, 23, 42, 0.06), 0 8px 20px rgba(15, 23, 42, 0.04)",
                border: "1px solid rgba(226, 232, 240, 0.9)",
              }}
            >
              <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
                <h2
                  style={{
                    fontSize: "clamp(1.75rem, 4vw, 2.25rem)",
                    fontWeight: 900,
                    textAlign: "center",
                    color: "#000000",
                    margin: "0 0 0.75rem 0",
                    letterSpacing: "-1px",
                    display: "inline-block",
                    width: "100%",
                  }}
                >
                  Frequently Asked Questions
                </h2>
              </div>
              <p
                style={{
                  fontSize: "1.1rem",
                  textAlign: "center",
                  color: "#666",
                  margin: "0 0 2.5rem 0",
                  maxWidth: "700px",
                  marginLeft: "auto",
                  marginRight: "auto",
                  lineHeight: 1.8,
                }}
              >
                Find answers to common questions about booking flights, hotels,
                and managing your travel plans.
              </p>

              {/* Search Bar */}
              <div
                style={{
                  position: "relative",
                  maxWidth: "600px",
                  margin: "0 auto 2rem",
                  display: "flex",
                  alignItems: "center",
                }}
              >
                <input
                  type="text"
                  placeholder="Search FAQs..."
                  value={faqSearchQuery}
                  onChange={(e) => {
                    setFAQSearchQuery(e.target.value);
                    setExpandedFAQIndex(null);
                  }}
                  style={{
                    width: "100%",
                    padding: "1.2rem 1.5rem 1.2rem 3.5rem",
                    border: "1px solid rgba(0, 102, 204, 0.2)",
                    borderRadius: "16px",
                    fontSize: "1rem",
                    color: "#333",
                    background: "rgba(255, 255, 255, 0.8)",
                    transition: "all 0.4s",
                    fontWeight: 500,
                    letterSpacing: "0.3px",
                    boxShadow: "0 4px 24px rgba(0, 102, 204, 0.08)",
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: "1.2rem",
                    fontSize: "1.2rem",
                    color: "#0066cc",
                    pointerEvents: "none",
                  }}
                >
                  🔍
                </span>
              </div>

              {/* Category Filters */}
              {faqCategories.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "0.6rem",
                    justifyContent: "center",
                    marginBottom: "2rem",
                    maxWidth: "700px",
                    marginLeft: "auto",
                    marginRight: "auto",
                  }}
                >
                  <button
                    onClick={() => {
                      setSelectedFAQCategory(null);
                      setExpandedFAQIndex(null);
                    }}
                    style={{
                      padding: "0.5rem 1.2rem",
                      border: "none",
                      background: !selectedFAQCategory
                        ? "linear-gradient(135deg, #0066cc 0%, #0088ee 100%)"
                        : "rgba(255, 255, 255, 0.9)",
                      color: !selectedFAQCategory ? "white" : "#555",
                      borderRadius: "50px",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.85rem",
                      transition: "all 0.3s",
                      boxShadow: !selectedFAQCategory
                        ? "0 4px 16px rgba(0, 102, 204, 0.3)"
                        : "0 2px 8px rgba(0, 0, 0, 0.06)",
                    }}
                  >
                    All
                  </button>
                  {faqCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => {
                        setSelectedFAQCategory(category);
                        setExpandedFAQIndex(null);
                      }}
                      style={{
                        padding: "0.5rem 1.2rem",
                        border: "none",
                        background:
                          selectedFAQCategory === category
                            ? "linear-gradient(135deg, #0066cc 0%, #0088ee 100%)"
                            : "rgba(255, 255, 255, 0.9)",
                        color:
                          selectedFAQCategory === category ? "white" : "#555",
                        borderRadius: "50px",
                        cursor: "pointer",
                        fontWeight: 600,
                        fontSize: "0.85rem",
                        transition: "all 0.3s",
                        boxShadow:
                          selectedFAQCategory === category
                            ? "0 4px 16px rgba(0, 102, 204, 0.3)"
                            : "0 2px 8px rgba(0, 0, 0, 0.06)",
                      }}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              )}

              {/* FAQ Items */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: "1.2rem",
                  maxWidth: "850px",
                  margin: "0 auto",
                }}
              >
                {displayedFAQs.length > 0 ? (
                  displayedFAQs.map((faq, index) => (
                    <div
                      key={faq._id || faq.id || index}
                      style={{
                        borderRadius: "20px",
                        overflow: "hidden",
                        background: "rgba(255, 255, 255, 0.85)",
                        boxShadow:
                          "0 4px 24px rgba(0, 102, 204, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)",
                        transition: "all 0.4s",
                        position: "relative",
                        border: "1px solid rgba(255, 255, 255, 0.9)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-4px)";
                        e.currentTarget.style.boxShadow =
                          "0 10px 30px rgba(15, 23, 42, 0.12)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 4px 24px rgba(0, 102, 204, 0.06), 0 1px 3px rgba(0, 0, 0, 0.04)";
                      }}
                    >
                      <button
                        onClick={() =>
                          setExpandedFAQIndex(
                            expandedFAQIndex === index ? null : index
                          )
                        }
                        style={{
                          width: "100%",
                          padding: "1.6rem 1.8rem",
                          border: "none",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          gap: "1.5rem",
                          fontSize: "1.1rem",
                          fontWeight: 600,
                          color:
                            expandedFAQIndex === index ? "white" : "#1a1a2e",
                          textAlign: "left",
                          transition: "all 0.4s",
                          position: "relative",
                          zIndex: 1,
                          letterSpacing: "-0.2px",
                          minHeight: "72px",
                          background:
                            expandedFAQIndex === index
                              ? "linear-gradient(135deg, #0066cc 0%, #0077dd 100%)"
                              : "transparent",
                        }}
                      >
                        <span
                          style={{
                            flex: 1,
                            fontSize: "1rem",
                            lineHeight: 1.6,
                            display: "block",
                            transition: "color 0.3s",
                          }}
                        >
                          {faq.question}
                        </span>
                        <span
                          style={{
                            fontSize: "1.4rem",
                            fontWeight: 500,
                            transition: "transform 0.2s ease, color 0.2s ease",
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color:
                              expandedFAQIndex === index
                                ? "#ffffff"
                                : "#0066cc",
                            transform:
                              expandedFAQIndex === index
                                ? "rotate(45deg)"
                                : "rotate(0deg)",
                          }}
                        >
                          +
                        </span>
                      </button>
                      {expandedFAQIndex === index && (
                        <div
                          style={{
                            padding: "0 2rem",
                            background:
                              "linear-gradient(180deg, rgba(0, 102, 204, 0.02) 0%, rgba(255, 255, 255, 0.9) 100%)",
                            borderTop: "1px solid rgba(0, 102, 204, 0.1)",
                            animation: "slideDown 0.5s",
                            lineHeight: 1.8,
                            color: "#555",
                            maxHeight: "500px",
                            overflow: "hidden",
                            position: "relative",
                            zIndex: 1,
                          }}
                        >
                          <p
                            style={{
                              margin: "1.5rem 0 1.75rem 0",
                              fontSize: "0.95rem",
                              color: "#555",
                              fontWeight: 450,
                              letterSpacing: "0.1px",
                              lineHeight: 1.8,
                            }}
                          >
                            {faq.answer}
                          </p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "4rem 2rem",
                      background: "rgba(255, 255, 255, 0.6)",
                      borderRadius: "20px",
                      border: "1px solid rgba(255, 255, 255, 0.8)",
                    }}
                  >
                    <p
                      style={{
                        fontSize: "3rem",
                        margin: "0 0 1rem 0",
                        opacity: 0.5,
                      }}
                    >
                      🔍
                    </p>
                    <p
                      style={{
                        fontSize: "1.1rem",
                        margin: "0 0 0.8rem 0",
                        fontWeight: 600,
                        color: "#1a1a2e",
                      }}
                    >
                      No FAQs found matching your search.
                    </p>
                    <p
                      style={{
                        fontSize: "0.9rem",
                        color: "#777",
                        fontWeight: 400,
                      }}
                    >
                      Try different keywords or select another category.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

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
          
          /* FAQ section mobile */
          section > div[style*="maxWidth: \"1280px\""] {
            padding: 1.5rem 1rem !important;
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
