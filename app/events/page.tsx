"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "../components/Header";

interface Event {
  _id: string;
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
}

const eventCategories = [
  "Festival",
  "Cultural",
  "Adventure",
  "Music",
  "Food",
  "Sports",
  "Wellness",
  "Other",
];

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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [sortBy, setSortBy] = useState("soonest");
  const [animateCards, setAnimateCards] = useState(false);
  const [states, setStates] = useState<string[]>([]);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    setAnimateCards(false);
    try {
      const res = await fetch("/api/events", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : [];
        setEvents(list);

        // Extract unique states
        const uniqueStates = [
          ...new Set(list.map((e: Event) => e.state).filter(Boolean)),
        ].sort() as string[];
        setStates(uniqueStates);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
      setTimeout(() => setAnimateCards(true), 50);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // Client-side filtering
  useEffect(() => {
    let result = [...events];

    // Search filter
    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (e) =>
          e.eventName?.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q) ||
          e.city?.toLowerCase().includes(q) ||
          e.state?.toLowerCase().includes(q) ||
          e.organizer?.toLowerCase().includes(q),
      );
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((e) => e.category === selectedCategory);
    }

    // State filter
    if (selectedState) {
      result = result.filter((e) => e.state === selectedState);
    }

    // Sort
    if (sortBy === "soonest") {
      result.sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime(),
      );
    } else if (sortBy === "latest") {
      result.sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
      );
    } else if (sortBy === "price-low") {
      result.sort((a, b) => (a.ticketPrice || 0) - (b.ticketPrice || 0));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => (b.ticketPrice || 0) - (a.ticketPrice || 0));
    } else if (sortBy === "name") {
      result.sort((a, b) => a.eventName.localeCompare(b.eventName));
    }

    setFilteredEvents(result);
    setAnimateCards(false);
    setTimeout(() => setAnimateCards(true), 50);
  }, [events, search, selectedCategory, selectedState, sortBy]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateShort = (dateStr: string) => {
    if (!dateStr) return { day: "", month: "" };
    const d = new Date(dateStr);
    return {
      day: d.getDate().toString(),
      month: d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase(),
    };
  };

  const getDaysUntil = (dateStr: string) => {
    const now = new Date();
    const start = new Date(dateStr);
    const diff = Math.ceil(
      (start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    );
    if (diff < 0) return "Ongoing";
    if (diff === 0) return "Today!";
    if (diff === 1) return "Tomorrow";
    return `In ${diff} days`;
  };

  const stripHtml = (html: string) => {
    if (!html) return "";
    return html.replace(/<[^>]*>/g, "");
  };

  const truncate = (text: string, len: number) => {
    const clean = stripHtml(text);
    return clean.length > len ? clean.slice(0, len) + "..." : clean;
  };

  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setSelectedCategory("");
    setSelectedState("");
    setSortBy("soonest");
  };

  const hasFilters =
    search || selectedCategory || selectedState || sortBy !== "soonest";

  return (
    <>
      <Header />
      <main style={{ minHeight: "100vh", background: "var(--gray-50)" }}>
        {/* ===== HERO SECTION ===== */}
        <section
          style={{
            position: "relative",
            background:
              "linear-gradient(135deg, #0a66c2 0%, #004c99 40%, #003366 70%, #001d3d 100%)",
            padding: "6rem 1.5rem 5rem",
            overflow: "hidden",
          }}
        >
          {/* === Animated Aurora Mesh Background === */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            {/* Orb 1 - Large Pulsing */}
            <div
              style={{
                position: "absolute",
                top: "-15%",
                right: "-10%",
                width: "600px",
                height: "600px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(0,212,255,0.12) 0%, rgba(0,212,255,0.04) 40%, transparent 70%)",
                animation: "heroOrb1 8s ease-in-out infinite",
              }}
            />
            {/* Orb 2 - Mid Floating */}
            <div
              style={{
                position: "absolute",
                bottom: "-20%",
                left: "-8%",
                width: "500px",
                height: "500px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(118,75,162,0.1) 0%, rgba(118,75,162,0.03) 50%, transparent 70%)",
                animation: "heroOrb2 10s ease-in-out infinite",
              }}
            />
            {/* Orb 3 - Small Accent */}
            <div
              style={{
                position: "absolute",
                top: "20%",
                left: "50%",
                width: "300px",
                height: "300px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 60%)",
                animation: "heroOrb3 12s ease-in-out infinite",
              }}
            />
            {/* Orb 4 - Tiny spark */}
            <div
              style={{
                position: "absolute",
                top: "60%",
                right: "20%",
                width: "150px",
                height: "150px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)",
                animation: "heroOrb1 6s ease-in-out infinite reverse",
              }}
            />

            {/* Animated Grid */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
                backgroundSize: "60px 60px",
                animation: "gridShift 20s linear infinite",
              }}
            />

            {/* Dot pattern overlay */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                backgroundImage:
                  "radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)",
                backgroundSize: "24px 24px",
              }}
            />

            {/* Diagonal shimmer streak */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: "-100%",
                width: "50%",
                height: "100%",
                background:
                  "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.03) 45%, rgba(255,255,255,0.06) 50%, rgba(255,255,255,0.03) 55%, transparent 60%)",
                animation: "heroShimmer 6s ease-in-out infinite",
              }}
            />

            {/* Bottom gradient fade */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                height: "120px",
                background:
                  "linear-gradient(to top, var(--gray-50), transparent)",
                pointerEvents: "none",
              }}
            />
          </div>

          {/* === Floating Icon Particles === */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            {["🎪", "🎭", "🎵", "🏔️", "🍽️", "⚽", "🧘", "🎉"].map((icon, i) => (
              <span
                key={i}
                style={{
                  position: "absolute",
                  fontSize: `${14 + (i % 3) * 6}px`,
                  opacity: 0.08 + (i % 4) * 0.03,
                  left: `${8 + i * 12}%`,
                  top: `${15 + ((i * 17) % 60)}%`,
                  animation: `particleFloat ${7 + i * 1.5}s ease-in-out infinite ${i * 0.8}s`,
                }}
              >
                {icon}
              </span>
            ))}
          </div>

          {/* === HERO CONTENT === */}
          <div
            style={{
              maxWidth: "820px",
              margin: "0 auto",
              textAlign: "center",
              position: "relative",
              zIndex: 2,
            }}
          >
            {/* Animated Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(16px)",
                WebkitBackdropFilter: "blur(16px)",
                borderRadius: "999px",
                padding: "0.45rem 1.4rem",
                marginBottom: "1.5rem",
                fontSize: "0.82rem",
                color: "rgba(255,255,255,0.95)",
                fontWeight: 600,
                letterSpacing: "0.03em",
                border: "1px solid rgba(255,255,255,0.12)",
                boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                animation: "fadeSlideDown 0.8s ease-out both",
              }}
            >
              <span
                style={{
                  display: "inline-block",
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#00d4ff",
                  boxShadow: "0 0 8px #00d4ff",
                  animation: "livePulse 2s ease-in-out infinite",
                }}
              />
              Discover Experiences Near You
            </div>

            {/* Title with gradient text */}
            <h1
              style={{
                fontSize: "clamp(2.2rem, 6vw, 3.8rem)",
                fontWeight: 900,
                color: "white",
                marginBottom: "1rem",
                lineHeight: 1.1,
                letterSpacing: "-0.03em",
                animation: "fadeSlideUp 0.8s ease-out 0.15s both",
              }}
            >
              Upcoming{" "}
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #00d4ff 0%, #7c3aed 50%, #00d4ff 100%)",
                  backgroundSize: "200% auto",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  animation: "gradientShift 4s ease-in-out infinite",
                }}
              >
                Events
              </span>
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: "clamp(1rem, 2.2vw, 1.2rem)",
                color: "rgba(255,255,255,0.75)",
                maxWidth: "580px",
                margin: "0 auto 2.5rem",
                lineHeight: 1.65,
                animation: "fadeSlideUp 0.8s ease-out 0.3s both",
              }}
            >
              Explore festivals, cultural shows, adventure activities, and more
              happening across India
            </p>

            {/* Search Bar — Enhanced Glass */}
            <form
              onSubmit={handleSearch}
              style={{
                display: "flex",
                maxWidth: "620px",
                margin: "0 auto",
                gap: "0.5rem",
                animation: "fadeSlideUp 0.8s ease-out 0.45s both",
              }}
            >
              <div style={{ flex: 1, position: "relative" }}>
                <span
                  className="material-symbols-outlined"
                  style={{
                    position: "absolute",
                    left: "1.1rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "rgba(255,255,255,0.5)",
                    fontSize: "1.25rem",
                    transition: "color 0.3s ease",
                  }}
                >
                  search
                </span>
                <input
                  type="text"
                  placeholder="Search events, locations, organizers..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.95rem 1rem 0.95rem 3rem",
                    borderRadius: "14px",
                    border: "1.5px solid rgba(255,255,255,0.15)",
                    background: "rgba(255,255,255,0.08)",
                    color: "white",
                    fontSize: "0.95rem",
                    outline: "none",
                    backdropFilter: "blur(16px)",
                    WebkitBackdropFilter: "blur(16px)",
                    transition:
                      "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                    fontFamily: "inherit",
                    boxShadow:
                      "0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
                  }}
                  onFocus={(e) => {
                    e.currentTarget.style.borderColor = "rgba(0,212,255,0.5)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.14)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 30px rgba(0,212,255,0.15), inset 0 1px 0 rgba(255,255,255,0.08)";
                  }}
                  onBlur={(e) => {
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.15)";
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.05)";
                  }}
                />
              </div>
              <button
                type="submit"
                style={{
                  padding: "0.95rem 2rem",
                  borderRadius: "14px",
                  border: "none",
                  background:
                    "linear-gradient(135deg, #ffffff 0%, #e8f4ff 100%)",
                  color: "#0a66c2",
                  fontSize: "0.95rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                  whiteSpace: "nowrap",
                  boxShadow: "0 4px 15px rgba(0,0,0,0.15)",
                  letterSpacing: "0.01em",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform =
                    "translateY(-2px) scale(1.02)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 25px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0) scale(1)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 15px rgba(0,0,0,0.15)";
                }}
              >
                Search
              </button>
            </form>

            {/* Quick Category Pills */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginTop: "2rem",
                animation: "fadeSlideUp 0.8s ease-out 0.6s both",
              }}
            >
              {eventCategories.slice(0, 6).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(selectedCategory === cat ? "" : cat);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    padding: "0.4rem 0.9rem",
                    borderRadius: "999px",
                    border:
                      selectedCategory === cat
                        ? "1.5px solid rgba(0,212,255,0.6)"
                        : "1.5px solid rgba(255,255,255,0.15)",
                    background:
                      selectedCategory === cat
                        ? "rgba(0,212,255,0.15)"
                        : "rgba(255,255,255,0.06)",
                    color:
                      selectedCategory === cat
                        ? "#00d4ff"
                        : "rgba(255,255,255,0.7)",
                    fontSize: "0.78rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                    transition: "all 0.25s ease",
                    backdropFilter: "blur(8px)",
                  }}
                  onMouseEnter={(e) => {
                    if (selectedCategory !== cat) {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.12)";
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.3)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.95)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedCategory !== cat) {
                      e.currentTarget.style.background =
                        "rgba(255,255,255,0.06)";
                      e.currentTarget.style.borderColor =
                        "rgba(255,255,255,0.15)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.7)";
                    }
                  }}
                >
                  <span style={{ fontSize: "0.85rem" }}>
                    {categoryIcons[cat]}
                  </span>
                  {cat}
                </button>
              ))}
            </div>

            {/* Stats Row */}
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: "2.5rem",
                marginTop: "2.5rem",
                animation: "fadeSlideUp 0.8s ease-out 0.75s both",
              }}
            >
              {[
                { value: events.length.toString(), label: "Events" },
                { value: states.length.toString(), label: "States" },
                {
                  value: eventCategories.length.toString(),
                  label: "Categories",
                },
              ].map((stat, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div
                    style={{
                      fontSize: "1.6rem",
                      fontWeight: 800,
                      color: "white",
                      lineHeight: 1.1,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {stat.value}+
                  </div>
                  <div
                    style={{
                      fontSize: "0.72rem",
                      color: "rgba(255,255,255,0.5)",
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      marginTop: "0.2rem",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== FILTER BAR ===== */}
        <section
          style={{
            background: "white",
            borderBottom: "1px solid var(--gray-200)",
            padding: "1rem 1.5rem",
            position: "sticky",
            top: 0,
            zIndex: 30,
            boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
          }}
        >
          <div
            style={{
              maxWidth: "1200px",
              margin: "0 auto",
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            {/* Category Dropdown */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{
                padding: "0.55rem 1rem",
                borderRadius: "10px",
                border: selectedCategory
                  ? "1.5px solid var(--primary)"
                  : "1.5px solid var(--gray-200)",
                fontSize: "0.875rem",
                color: selectedCategory ? "var(--primary)" : "var(--gray-700)",
                background: selectedCategory ? "#f0f7ff" : "var(--gray-50)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 500,
                outline: "none",
                transition: "all 0.2s ease",
                minWidth: "160px",
              }}
            >
              <option value="">All Categories</option>
              {eventCategories.map((cat) => (
                <option key={cat} value={cat}>
                  {categoryIcons[cat] || "✨"} {cat}
                </option>
              ))}
            </select>

            {/* State Dropdown */}
            <select
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
              style={{
                padding: "0.55rem 1rem",
                borderRadius: "10px",
                border: selectedState
                  ? "1.5px solid var(--primary)"
                  : "1.5px solid var(--gray-200)",
                fontSize: "0.875rem",
                color: selectedState ? "var(--primary)" : "var(--gray-700)",
                background: selectedState ? "#f0f7ff" : "var(--gray-50)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 500,
                outline: "none",
                transition: "all 0.2s ease",
                minWidth: "160px",
              }}
            >
              <option value="">All States</option>
              {states.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: "0.55rem 1rem",
                borderRadius: "10px",
                border: "1.5px solid var(--gray-200)",
                fontSize: "0.875rem",
                color: "var(--gray-700)",
                background: "var(--gray-50)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 500,
                outline: "none",
                transition: "all 0.2s ease",
                minWidth: "140px",
              }}
            >
              <option value="soonest">Soonest First</option>
              <option value="latest">Latest First</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="name">Name A → Z</option>
            </select>

            {/* Results Count */}
            <div
              style={{
                marginLeft: "auto",
                fontSize: "0.85rem",
                color: "var(--gray-500)",
                fontWeight: 500,
              }}
            >
              {filteredEvents.length}{" "}
              {filteredEvents.length === 1 ? "event" : "events"} found
            </div>

            {/* Clear Filters */}
            {hasFilters && (
              <button
                onClick={clearFilters}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "10px",
                  border: "1.5px solid var(--gray-200)",
                  background: "white",
                  color: "var(--gray-600)",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  transition: "all 0.2s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "0.9rem" }}
                >
                  close
                </span>
                Clear
              </button>
            )}
          </div>
        </section>

        {/* ===== EVENT CARDS ===== */}
        <section
          style={{
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "2rem 1.5rem 4rem",
          }}
        >
          {/* Loading Skeleton */}
          {loading && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: "white",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      height: "200px",
                      background:
                        "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                      backgroundSize: "200% 100%",
                      animation: "shimmer 1.5s infinite",
                    }}
                  />
                  <div style={{ padding: "1.2rem" }}>
                    <div
                      style={{
                        height: "20px",
                        width: "70%",
                        background:
                          "linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%)",
                        backgroundSize: "200% 100%",
                        borderRadius: "6px",
                        marginBottom: "0.8rem",
                        animation: "shimmer 1.5s infinite",
                      }}
                    />
                    <div
                      style={{
                        height: "14px",
                        width: "50%",
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
          )}

          {/* No results */}
          {!loading && filteredEvents.length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "5rem 1rem",
                color: "var(--gray-500)",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "4rem",
                  marginBottom: "1rem",
                  display: "block",
                  opacity: 0.4,
                }}
              >
                event_busy
              </span>
              <h3
                style={{
                  fontSize: "1.4rem",
                  fontWeight: 700,
                  color: "var(--gray-700)",
                  marginBottom: "0.5rem",
                }}
              >
                No events found
              </h3>
              <p style={{ fontSize: "0.95rem", marginBottom: "1.5rem" }}>
                Try adjusting your search or filters
              </p>
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  style={{
                    padding: "0.7rem 1.5rem",
                    borderRadius: "10px",
                    border: "none",
                    background: "var(--primary)",
                    color: "white",
                    fontSize: "0.9rem",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Clear All Filters
                </button>
              )}
            </div>
          )}

          {/* Events Grid */}
          {!loading && filteredEvents.length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {filteredEvents.map((event, index) => {
                const dateInfo = formatDateShort(event.startDate);
                const daysUntil = getDaysUntil(event.startDate);
                const isToday = daysUntil === "Today!";
                const isOngoing = daysUntil === "Ongoing";

                return (
                  <Link
                    key={event._id}
                    href={`/events/${event._id}`}
                    style={{
                      textDecoration: "none",
                      color: "inherit",
                      opacity: animateCards ? 1 : 0,
                      transform: animateCards
                        ? "translateY(0)"
                        : "translateY(20px)",
                      transition: `all 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${index * 0.06}s`,
                    }}
                  >
                    <div
                      style={{
                        background: "white",
                        borderRadius: "16px",
                        overflow: "hidden",
                        boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                        transition:
                          "all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)",
                        cursor: "pointer",
                        height: "100%",
                        display: "flex",
                        flexDirection: "column",
                        border: "1px solid rgba(0,0,0,0.04)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = "translateY(-6px)";
                        e.currentTarget.style.boxShadow =
                          "0 16px 40px rgba(0,0,0,0.12)";
                        e.currentTarget.style.borderColor =
                          "rgba(10,102,194,0.15)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow =
                          "0 1px 4px rgba(0,0,0,0.06)";
                        e.currentTarget.style.borderColor = "rgba(0,0,0,0.04)";
                      }}
                    >
                      {/* Image */}
                      <div
                        style={{
                          position: "relative",
                          height: "200px",
                          overflow: "hidden",
                        }}
                      >
                        <img
                          src={event.profileImage || "/placeholder-event.jpg"}
                          alt={event.eventName}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            transition: "transform 0.5s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = "scale(1.05)";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = "scale(1)";
                          }}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src =
                              "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600";
                          }}
                        />

                        {/* Date Badge */}
                        <div
                          style={{
                            position: "absolute",
                            top: "12px",
                            left: "12px",
                            background: "white",
                            borderRadius: "12px",
                            padding: "0.4rem 0.6rem",
                            textAlign: "center",
                            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                            minWidth: "50px",
                          }}
                        >
                          <div
                            style={{
                              fontSize: "1.3rem",
                              fontWeight: 800,
                              color: "var(--primary)",
                              lineHeight: 1,
                            }}
                          >
                            {dateInfo.day}
                          </div>
                          <div
                            style={{
                              fontSize: "0.65rem",
                              fontWeight: 700,
                              color: "var(--gray-500)",
                              textTransform: "uppercase",
                              letterSpacing: "0.05em",
                            }}
                          >
                            {dateInfo.month}
                          </div>
                        </div>

                        {/* Countdown Badge */}
                        <div
                          style={{
                            position: "absolute",
                            top: "12px",
                            right: "12px",
                            background: isToday
                              ? "linear-gradient(135deg, #ef4444, #dc2626)"
                              : isOngoing
                                ? "linear-gradient(135deg, #10b981, #059669)"
                                : "linear-gradient(135deg, var(--primary), var(--primary-dark))",
                            color: "white",
                            borderRadius: "999px",
                            padding: "0.3rem 0.8rem",
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
                            letterSpacing: "0.02em",
                          }}
                        >
                          {daysUntil}
                        </div>

                        {/* Category Badge */}
                        <div
                          style={{
                            position: "absolute",
                            bottom: "12px",
                            left: "12px",
                            background: "rgba(0,0,0,0.65)",
                            backdropFilter: "blur(8px)",
                            color: "white",
                            borderRadius: "8px",
                            padding: "0.25rem 0.7rem",
                            fontSize: "0.72rem",
                            fontWeight: 600,
                          }}
                        >
                          {categoryIcons[event.category] || "✨"}{" "}
                          {event.category}
                        </div>
                      </div>

                      {/* Content */}
                      <div
                        style={{
                          padding: "1.2rem 1.2rem 1rem",
                          flex: 1,
                          display: "flex",
                          flexDirection: "column",
                        }}
                      >
                        <h3
                          style={{
                            fontSize: "1.1rem",
                            fontWeight: 700,
                            color: "var(--gray-900)",
                            marginBottom: "0.5rem",
                            lineHeight: 1.3,
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {event.eventName}
                        </h3>

                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "var(--gray-500)",
                            lineHeight: 1.5,
                            marginBottom: "0.8rem",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                          }}
                        >
                          {truncate(event.description, 120)}
                        </p>

                        {/* Details */}
                        <div
                          style={{
                            marginTop: "auto",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.4rem",
                          }}
                        >
                          {/* Location */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              fontSize: "0.8rem",
                              color: "var(--gray-500)",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{
                                fontSize: "0.95rem",
                                color: "var(--primary)",
                              }}
                            >
                              location_on
                            </span>
                            {event.city && event.state
                              ? `${event.city}, ${event.state}`
                              : event.location || event.state}
                          </div>

                          {/* Date Range */}
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.4rem",
                              fontSize: "0.8rem",
                              color: "var(--gray-500)",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{
                                fontSize: "0.95rem",
                                color: "var(--primary)",
                              }}
                            >
                              calendar_today
                            </span>
                            {formatDate(event.startDate)}
                            {event.endDate && ` — ${formatDate(event.endDate)}`}
                          </div>
                        </div>
                      </div>

                      {/* Footer */}
                      <div
                        style={{
                          padding: "0.8rem 1.2rem",
                          borderTop: "1px solid var(--gray-100)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                      >
                        <div
                          style={{
                            fontSize: "0.8rem",
                            color: "var(--gray-500)",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "0.9rem" }}
                          >
                            person
                          </span>
                          {event.organizer || "TravelExpertz"}
                        </div>
                        <div
                          style={{
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            color:
                              event.ticketPrice > 0
                                ? "var(--primary)"
                                : "#10b981",
                          }}
                        >
                          {event.ticketPrice > 0
                            ? `₹${event.ticketPrice.toLocaleString("en-IN")}`
                            : "Free"}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* ===== KEYFRAMES ===== */}
        <style>{`
          @keyframes shimmer {
            0% { background-position: 200% 0; }
            100% { background-position: -200% 0; }
          }
          @keyframes heroOrb1 {
            0%, 100% { transform: translate(0, 0) scale(1); opacity: 0.7; }
            33% { transform: translate(-30px, 20px) scale(1.08); opacity: 1; }
            66% { transform: translate(20px, -15px) scale(0.95); opacity: 0.8; }
          }
          @keyframes heroOrb2 {
            0%, 100% { transform: translate(0, 0) scale(1); }
            50% { transform: translate(40px, -30px) scale(1.1); }
          }
          @keyframes heroOrb3 {
            0%, 100% { transform: translate(0, 0) scale(1) rotate(0deg); }
            33% { transform: translate(-20px, 30px) scale(1.15) rotate(120deg); }
            66% { transform: translate(30px, -20px) scale(0.9) rotate(240deg); }
          }
          @keyframes gridShift {
            0% { transform: translate(0, 0); }
            100% { transform: translate(60px, 60px); }
          }
          @keyframes heroShimmer {
            0% { left: -100%; }
            50%, 100% { left: 200%; }
          }
          @keyframes particleFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.08; }
            25% { transform: translateY(-18px) rotate(5deg); opacity: 0.14; }
            50% { transform: translateY(-8px) rotate(-3deg); opacity: 0.06; }
            75% { transform: translateY(-22px) rotate(4deg); opacity: 0.12; }
          }
          @keyframes fadeSlideDown {
            0% { opacity: 0; transform: translateY(-16px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes fadeSlideUp {
            0% { opacity: 0; transform: translateY(20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes livePulse {
            0%, 100% { opacity: 1; box-shadow: 0 0 8px #00d4ff; }
            50% { opacity: 0.4; box-shadow: 0 0 2px #00d4ff; }
          }
          @keyframes gradientShift {
            0%, 100% { background-position: 0% center; }
            50% { background-position: 200% center; }
          }
          input::placeholder {
            color: rgba(255,255,255,0.45) !important;
          }
          @media (max-width: 768px) {
            .events-filter-bar {
              flex-direction: column;
            }
          }
        `}</style>
      </main>
    </>
  );
}
