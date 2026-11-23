"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MapPin,
  Search,
  X,
  Compass,
  ArrowRight,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react";
import Header from "../components/Header";

interface Destination {
  _id: string;
  name: string;
  state?: string;
  city?: string;
  image?: string;
  description?: string;
  slug?: string;
  order?: number;
  active?: boolean;
}

const FALLBACK_DESTINATIONS: Destination[] = [
  {
    _id: "dest_khirsu",
    name: "Khirsu, Uttarakhand",
    state: "Uttarakhand",
    city: "Khirsu",
    image: "/hero2.jpeg",
    description:
      "A serene and unexplored hamlet nestled in the Garhwal Himalayas, surrounded by dense pine forests and offering 300km panoramic views of snow-capped peaks.",
  },
  {
    _id: "dest_binsar",
    name: "Binsar, Uttarakhand",
    state: "Uttarakhand",
    city: "Binsar",
    image: "/hero4.jpeg",
    description:
      "Perched on Jhandi Dhar hills, Binsar is a tranquil wildlife sanctuary famed for oak and rhododendron forests, birdwatching, and majestic Himalayan sunsets.",
  },
  {
    _id: "dest_munsiyari",
    name: "Munsiyari, Uttarakhand",
    state: "Uttarakhand",
    city: "Munsiyari",
    image: "/hero1.jpeg",
    description:
      "Known as Little Kashmir, Munsiyari sits at the base of the magnificent Panchachuli peaks and serves as a gateway to high-altitude Himalayan glacier treks.",
  },
  {
    _id: "dest_kanatal",
    name: "Kanatal, Uttarakhand",
    state: "Uttarakhand",
    city: "Kanatal",
    image: "/hero-bg.jpg",
    description:
      "A peaceful hill retreat near Mussoorie surrounded by mist-laden peaks, apple orchards, and pine trails ideal for adventure camping and nature walks.",
  },
  {
    _id: "dest_tawang",
    name: "Tawang, Arunachal Pradesh",
    state: "Arunachal Pradesh",
    city: "Tawang",
    image: "/hero2.jpeg",
    description:
      "Home to India's largest monastery, high-altitude frozen lakes, and breathtaking mountain passes rich in Monpa tribal culture and spiritual heritage.",
  },
  {
    _id: "dest_gokarna",
    name: "Gokarna, Karnataka",
    state: "Karnataka",
    city: "Gokarna",
    image: "/hero3.jpeg",
    description:
      "A peaceful temple town bordered by pristine crescent beaches like Kudle and Om Beach, offering tranquil coastal cliffs and laid-back sunsets.",
  },
  {
    _id: "dest_chopta",
    name: "Chopta, Uttarakhand",
    state: "Uttarakhand",
    city: "Chopta",
    image: "/hero-bg.jpg",
    description:
      "Fondly called the Mini Switzerland of Uttarakhand, Chopta features rolling alpine meadows (bugyals) and is the base for the Tungnath and Chandrashila trek.",
  },
  {
    _id: "dest_spiti",
    name: "Spiti Valley, Himachal Pradesh",
    state: "Himachal Pradesh",
    city: "Spiti Valley",
    image: "/hero1.jpeg",
    description:
      "A high-altitude cold desert valley characterized by ancient Tibetan monasteries, fossil villages, winding rivers, and dramatic moon-like barren mountains.",
  },
  {
    _id: "dest_dhanushkodi",
    name: "Dhanushkodi, Tamil Nadu",
    state: "Tamil Nadu",
    city: "Dhanushkodi",
    image: "/hero3.jpeg",
    description:
      "The ghost town at the southern tip of India where the Bay of Bengal meets the Indian Ocean, steeped in mythology, azure waters, and timeless solitude.",
  },
  {
    _id: "dest_orchha",
    name: "Orchha, Madhya Pradesh",
    state: "Madhya Pradesh",
    city: "Orchha",
    image: "/hero4.jpeg",
    description:
      "A medieval town along the Betwa River filled with grand Mughal-Rajput palaces, cenotaphs, ancient murals, and sacred temples untouched by modern rush.",
  },
  {
    _id: "dest_shangarh",
    name: "Shangarh, Himachal Pradesh",
    state: "Himachal Pradesh",
    city: "Shangarh",
    image: "/hero2.jpeg",
    description:
      "A hidden gem in the Sainj Valley surrounded by the Great Himalayan National Park, famous for its sacred meadows and traditional wooden pagoda temples.",
  },
  {
    _id: "dest_chindi",
    name: "Chindi, Himachal Pradesh",
    state: "Himachal Pradesh",
    city: "Chindi",
    image: "/hero1.jpeg",
    description:
      "An idyllic valley hamlet in the Mandi district adorned with lush apple orchards, deodar forests, ancient stone temples, and untouched tranquility.",
  },
];

const KNOWN_STATES = [
  "Uttarakhand",
  "Himachal Pradesh",
  "Rajasthan",
  "Goa",
  "Kerala",
  "Karnataka",
  "Tamil Nadu",
  "Madhya Pradesh",
  "Arunachal Pradesh",
  "Meghalaya",
  "Sikkim",
  "Jammu & Kashmir",
  "Ladakh",
];

function parseDestinationLocation(dest: Destination) {
  let city = (dest.city || "").trim();
  let state = (dest.state || "").trim();
  const name = (dest.name || "").trim();

  if (!city || !state) {
    if (name.includes(",")) {
      const parts = name.split(",").map((s) => s.trim());
      city = parts[0];
      state = parts[1];
    } else {
      const matchedState = KNOWN_STATES.find((s) =>
        name.toLowerCase().includes(s.toLowerCase()),
      );
      if (matchedState) {
        state = matchedState;
        city = name.replace(new RegExp(matchedState, "i"), "").trim();
      } else {
        city = name;
      }
    }
  }

  const rawLocation = !city && !state ? name || "India" : "";
  return { city, state, rawLocation };
}

export default function DestinationsPage() {
  const router = useRouter();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [sortBy, setSortBy] = useState("recommended");
  const [animateCards, setAnimateCards] = useState(false);

  // Fetch destinations
  const fetchDestinations = useCallback(async () => {
    setLoading(true);
    setAnimateCards(false);
    try {
      const res = await fetch("/api/destinations", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.destinations || [];

        // Merge database destinations with fallback gems so there's always a full rich list
        const map = new Map<string, Destination>();
        list.forEach((d: Destination) => {
          if (d.name) map.set(d.name.toLowerCase().trim(), d);
        });
        FALLBACK_DESTINATIONS.forEach((fb) => {
          const key = fb.name.toLowerCase().trim();
          if (!map.has(key)) {
            map.set(key, fb);
          }
        });
        setDestinations(Array.from(map.values()));
      } else {
        setDestinations(FALLBACK_DESTINATIONS);
      }
    } catch (err) {
      console.error("Error fetching destinations:", err);
      setDestinations(FALLBACK_DESTINATIONS);
    } finally {
      setLoading(false);
      setTimeout(() => setAnimateCards(true), 50);
    }
  }, []);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  // Extract all unique states
  const availableStates = useMemo(() => {
    const set = new Set<string>();
    destinations.forEach((d) => {
      const { state } = parseDestinationLocation(d);
      if (state) set.add(state);
    });
    return Array.from(set).sort();
  }, [destinations]);

  // Filtered and sorted destinations
  const filteredDestinations = useMemo(() => {
    let result = [...destinations];

    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter((d) => {
        const { city, state } = parseDestinationLocation(d);
        return (
          d.name?.toLowerCase().includes(q) ||
          city.toLowerCase().includes(q) ||
          state.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q)
        );
      });
    }

    if (selectedState) {
      result = result.filter((d) => {
        const { state } = parseDestinationLocation(d);
        return state.toLowerCase() === selectedState.toLowerCase();
      });
    }

    if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "state") {
      result.sort((a, b) => {
        const stateA = parseDestinationLocation(a).state;
        const stateB = parseDestinationLocation(b).state;
        return stateA.localeCompare(stateB);
      });
    }

    return result;
  }, [destinations, search, selectedState, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const clearFilters = () => {
    setSearch("");
    setSearchInput("");
    setSelectedState("");
    setSortBy("recommended");
  };

  const hasActiveFilters = Boolean(
    search || selectedState || sortBy !== "recommended",
  );

  return (
    <>
      <Header solidHeader={true} />
      <main style={{ minHeight: "100vh", background: "#f8fafc" }}>
        {/* ===== HERO SECTION ===== */}
        <section
          style={{
            position: "relative",
            background:
              "linear-gradient(135deg, #0a66c2 0%, #004c99 40%, #003366 70%, #001d3d 100%)",
            padding: "6rem 1.5rem 5rem",
            overflow: "hidden",
            color: "#ffffff",
          }}
        >
          {/* Animated Background Mesh */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              overflow: "hidden",
              pointerEvents: "none",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-15%",
                right: "-10%",
                width: "600px",
                height: "600px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(0,212,255,0.14) 0%, rgba(0,212,255,0.03) 50%, transparent 70%)",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-20%",
                left: "-8%",
                width: "520px",
                height: "520px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(168,85,247,0.12) 0%, rgba(168,85,247,0.02) 50%, transparent 70%)",
              }}
            />
          </div>

          <div
            style={{
              position: "relative",
              maxWidth: "1280px",
              margin: "0 auto",
              textAlign: "center",
            }}
          >
            {/* Pill Badge */}
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                borderRadius: "999px",
                background: "rgba(255, 255, 255, 0.12)",
                backdropFilter: "blur(12px)",
                border: "1px solid rgba(255, 255, 255, 0.22)",
                fontSize: "0.85rem",
                fontWeight: 600,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginBottom: "20px",
              }}
            >
              <Sparkles size={15} color="#38bdf8" />
              <span>Uncover India&apos;s Beauty</span>
            </div>

            <h1
              style={{
                fontSize: "clamp(2.2rem, 5vw, 3.8rem)",
                fontWeight: 700,
                lineHeight: 1.15,
                margin: "0 0 18px",
                fontFamily: "var(--font-heading, inherit)",
              }}
            >
              Beyond Famous Destinations Lies a World of Wonders
            </h1>

            <p
              style={{
                maxWidth: "760px",
                margin: "0 auto 36px",
                fontSize: "clamp(1rem, 2vw, 1.22rem)",
                color: "rgba(255, 255, 255, 0.88)",
                lineHeight: 1.65,
                fontWeight: 300,
              }}
            >
              Explore the hidden treasures of India, from unexplored mountain
              villages and peaceful valleys to secret beaches, charming heritage
              towns and breathtaking natural landscapes.
            </p>

            {/* Search Input Box */}
            <form
              onSubmit={handleSearchSubmit}
              style={{
                maxWidth: "680px",
                margin: "0 auto 28px",
                display: "flex",
                background: "rgba(255, 255, 255, 0.98)",
                borderRadius: "999px",
                padding: "6px 8px 6px 20px",
                boxShadow: "0 20px 45px rgba(0, 0, 0, 0.28)",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <Search size={20} color="#0b6dff" style={{ flexShrink: 0 }} />
              <input
                type="text"
                placeholder="Search by destination name, state, or mountain village..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{
                  flex: 1,
                  border: "none",
                  outline: "none",
                  fontSize: "1rem",
                  color: "#0f172a",
                  background: "transparent",
                  padding: "8px 0",
                }}
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchInput("");
                    setSearch("");
                  }}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    color: "#94a3b8",
                    padding: "4px",
                  }}
                  aria-label="Clear search text"
                >
                  <X size={18} />
                </button>
              )}
              <button
                type="submit"
                style={{
                  background: "#0b6dff",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "999px",
                  padding: "12px 26px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  transition: "background 0.2s ease",
                  flexShrink: 0,
                }}
              >
                Search
              </button>
            </form>

            {/* Quick State Filter Pills */}
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "8px",
                maxWidth: "900px",
                margin: "0 auto",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedState("")}
                style={{
                  padding: "6px 14px",
                  borderRadius: "999px",
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  cursor: "pointer",
                  border: "1px solid",
                  borderColor:
                    selectedState === ""
                      ? "#38bdf8"
                      : "rgba(255, 255, 255, 0.25)",
                  background:
                    selectedState === ""
                      ? "#38bdf8"
                      : "rgba(255, 255, 255, 0.12)",
                  color: selectedState === "" ? "#003366" : "#ffffff",
                  backdropFilter: "blur(8px)",
                  transition: "all 0.2s ease",
                }}
              >
                All States
              </button>
              {availableStates.map((st) => {
                const isSelected = selectedState.toLowerCase() === st.toLowerCase();
                return (
                  <button
                    key={st}
                    type="button"
                    onClick={() =>
                      setSelectedState(isSelected ? "" : st)
                    }
                    style={{
                      padding: "6px 14px",
                      borderRadius: "999px",
                      fontSize: "0.82rem",
                      fontWeight: 600,
                      cursor: "pointer",
                      border: "1px solid",
                      borderColor: isSelected
                        ? "#38bdf8"
                        : "rgba(255, 255, 255, 0.22)",
                      background: isSelected
                        ? "#38bdf8"
                        : "rgba(255, 255, 255, 0.1)",
                      color: isSelected ? "#003366" : "#ffffff",
                      backdropFilter: "blur(8px)",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {st}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* ===== CONTENT SECTION ===== */}
        <section
          style={{
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "40px 24px 80px",
          }}
        >
          {/* Controls & Stats Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "16px",
              marginBottom: "32px",
              paddingBottom: "16px",
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <div>
              <p
                style={{
                  margin: 0,
                  fontSize: "1rem",
                  color: "#334155",
                  fontWeight: 600,
                }}
              >
                Showing{" "}
                <span style={{ color: "#0b6dff" }}>
                  {filteredDestinations.length}
                </span>{" "}
                hidden destination{filteredDestinations.length === 1 ? "" : "s"}
                {selectedState ? ` in ${selectedState}` : ""}
              </p>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                    background: "#f1f5f9",
                    border: "1px solid #cbd5e1",
                    borderRadius: "8px",
                    padding: "7px 14px",
                    fontSize: "0.85rem",
                    color: "#475569",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  <X size={14} /> Clear filters
                </button>
              )}

              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <SlidersHorizontal size={16} color="#64748b" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  style={{
                    padding: "7px 12px",
                    borderRadius: "8px",
                    border: "1px solid #cbd5e1",
                    background: "#ffffff",
                    fontSize: "0.88rem",
                    color: "#334155",
                    outline: "none",
                    cursor: "pointer",
                  }}
                  aria-label="Sort destinations"
                >
                  <option value="recommended">Sort: Recommended</option>
                  <option value="name">Sort: Name (A-Z)</option>
                  <option value="state">Sort: By State</option>
                </select>
              </div>
            </div>
          </div>

          {/* Destinations Grid */}
          {loading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "28px",
              }}
            >
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div
                  key={n}
                  style={{
                    height: "380px",
                    borderRadius: "20px",
                    background: "#e2e8f0",
                    animation: "pulse 1.5s infinite",
                  }}
                />
              ))}
            </div>
          ) : filteredDestinations.length > 0 ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "28px",
              }}
            >
              {filteredDestinations.map((dest, idx) => {
                const { city, state, rawLocation } = parseDestinationLocation(dest);
                const propertyTarget = city || state || rawLocation || dest.name;
                const propertySearchHref = `/hotels/search?location=${encodeURIComponent(propertyTarget)}`;

                return (
                  <article
                    key={`${dest._id || dest.name}-${idx}`}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      borderRadius: "20px",
                      overflow: "hidden",
                      background: "#ffffff",
                      border: "1px solid #e2e8f0",
                      boxShadow: "0 10px 30px rgba(15, 23, 42, 0.05)",
                      transition:
                        "transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease",
                      cursor: "pointer",
                    }}
                    onClick={() => router.push(propertySearchHref)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-6px)";
                      e.currentTarget.style.boxShadow =
                        "0 20px 40px rgba(15, 23, 42, 0.12)";
                      e.currentTarget.style.borderColor = "#cbd5e1";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 10px 30px rgba(15, 23, 42, 0.05)";
                      e.currentTarget.style.borderColor = "#e2e8f0";
                    }}
                  >
                    {/* Image Area */}
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        height: "230px",
                        overflow: "hidden",
                        background: "#0f172a",
                      }}
                    >
                      <img
                        src={dest.image || "/hero1.jpeg"}
                        alt={dest.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          transition: "transform 0.6s cubic-bezier(0.2, 0.7, 0.2, 1)",
                        }}
                      />
                      <span
                        style={{
                          position: "absolute",
                          top: "14px",
                          left: "14px",
                          padding: "6px 14px",
                          borderRadius: "999px",
                          background: "rgba(11, 109, 255, 0.88)",
                          backdropFilter: "blur(8px)",
                          color: "#ffffff",
                          fontSize: "0.74rem",
                          fontWeight: 700,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                          boxShadow: "0 4px 12px rgba(11, 109, 255, 0.3)",
                        }}
                      >
                        {state || "Hidden India"}
                      </span>
                    </div>

                    {/* Body Area */}
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        flex: 1,
                        padding: "22px",
                      }}
                    >
                      <h3
                        style={{
                          margin: "0 0 10px",
                          fontSize: "1.32rem",
                          color: "#0f172a",
                          fontWeight: 600,
                          lineHeight: 1.3,
                        }}
                      >
                        {dest.name}
                      </h3>

                      {/* Location link row */}
                      <p
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "5px",
                          margin: "0 0 14px",
                          fontSize: "0.88rem",
                          color: "#64748b",
                        }}
                      >
                        <MapPin
                          size={15}
                          color="#0b6dff"
                          style={{ flexShrink: 0 }}
                        />
                        {city && (
                          <Link
                            href={`/hotels/search?location=${encodeURIComponent(city)}`}
                            style={{
                              color: "#0b6dff",
                              textDecoration: "none",
                              fontWeight: 500,
                            }}
                            onClick={(e) => e.stopPropagation()}
                            title={`View properties in ${city}`}
                          >
                            {city}
                          </Link>
                        )}
                        {city && state && <span>, </span>}
                        {state && (
                          <Link
                            href={`/hotels/search?location=${encodeURIComponent(state)}`}
                            style={{
                              color: "#0b6dff",
                              textDecoration: "none",
                              fontWeight: 500,
                            }}
                            onClick={(e) => e.stopPropagation()}
                            title={`View properties in ${state}`}
                          >
                            {state}
                          </Link>
                        )}
                        {!city && !state && rawLocation && (
                          <Link
                            href={`/hotels/search?location=${encodeURIComponent(rawLocation)}`}
                            style={{
                              color: "#0b6dff",
                              textDecoration: "none",
                              fontWeight: 500,
                            }}
                            onClick={(e) => e.stopPropagation()}
                            title={`View properties in ${rawLocation}`}
                          >
                            {rawLocation}
                          </Link>
                        )}
                      </p>

                      <p
                        style={{
                          margin: "0 0 20px",
                          color: "#64748b",
                          fontSize: "0.92rem",
                          lineHeight: 1.6,
                          flex: 1,
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          lineClamp: 3,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                        }}
                      >
                        {dest.description ||
                          "Discover untouched natural landscapes, serene mountain trails, and rich local cultural traditions in this hidden paradise."}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          paddingTop: "16px",
                          borderTop: "1px solid #f1f5f9",
                        }}
                      >
                        <Link
                          href={propertySearchHref}
                          onClick={(e) => e.stopPropagation()}
                          style={{
                            color: "#0b6dff",
                            fontSize: "0.9rem",
                            fontWeight: 700,
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "6px",
                            textDecoration: "none",
                          }}
                        >
                          View all properties <ArrowRight size={15} />
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "80px 20px",
                background: "#ffffff",
                borderRadius: "20px",
                border: "1px dashed #cbd5e1",
              }}
            >
              <Compass
                size={48}
                color="#94a3b8"
                style={{ margin: "0 auto 16px" }}
              />
              <h3
                style={{
                  fontSize: "1.4rem",
                  color: "#0f172a",
                  margin: "0 0 8px",
                }}
              >
                No destinations found
              </h3>
              <p
                style={{
                  color: "#64748b",
                  maxWidth: "500px",
                  margin: "0 auto 20px",
                }}
              >
                We couldn&apos;t find any hidden destinations matching your
                current search or filter criteria. Try adjusting your query or
                resetting filters.
              </p>
              <button
                type="button"
                onClick={clearFilters}
                style={{
                  background: "#0b6dff",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "999px",
                  padding: "10px 24px",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                Reset All Filters
              </button>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
