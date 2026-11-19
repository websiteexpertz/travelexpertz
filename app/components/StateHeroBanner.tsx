"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";

export interface HeroSlide {
  id: string;
  title?: string;
  locationName?: string;
  destinationName?: string;
  headline?: string;
  tagline?: string;
  description: string;
  imageUrl: string;
  altText?: string;
  displayOrder?: number;
  order?: number;
}

const DEFAULT_UTTARAKHAND_SLIDES: HeroSlide[] = [
  {
    id: "dhi_uk_1",
    title: "Mussoorie",
    locationName: "Garhwal Hills, Uttarakhand",
    headline: "Queen of the Hills",
    description:
      "Perched at 2,000 metres above sea level, Mussoorie enchants with its colonial-era charm, misty Himalayan panoramas, cascading Kempty Falls, and cool mountain breeze year-round.",
    imageUrl:
      "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=2400&q=85",
    altText: "Misty pine-covered slopes and mountain ridges of Mussoorie queen of the hills",
    order: 1,
  },
  {
    id: "dhi_uk_2",
    title: "Nainital",
    locationName: "Kumaon Region, Uttarakhand",
    headline: "The Lake District of India",
    description:
      "Cradled by seven emerald hills and anchored by the glimmering Naini Lake, Nainital is Uttarakhand's most beloved hill resort — perfect for boating, hiking, and crisp mountain air.",
    imageUrl:
      "https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=2400&q=85",
    altText: "Picturesque emerald Naini Lake surrounded by forested hill peaks and colonial cottages",
    order: 2,
  },
  {
    id: "dhi_uk_3",
    title: "Auli",
    locationName: "Chamoli, Uttarakhand",
    headline: "India's Premier Ski Destination",
    description:
      "Blanketed in fresh powder with jaw-dropping views of Nanda Devi, Auli's pristine slopes draw skiers and trekkers alike — and host Asia's highest golf course come summer.",
    imageUrl:
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2400&q=85",
    altText: "Snow-dusted alpine meadows and Himalayan ski slopes of Auli facing Nanda Devi",
    order: 3,
  },
  {
    id: "dhi_uk_4",
    title: "Rishikesh",
    locationName: "Ganga Valley, Uttarakhand",
    headline: "The Yoga Capital of the World",
    description:
      "Where the Ganges rushes down from the Himalayas, Rishikesh beckons with sacred ghats, thrilling white-water rafting, ancient ashrams, and a spiritual energy that transforms every visitor.",
    imageUrl:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=2400&q=85",
    altText: "Spiritual twilight Aarti on the sacred banks of the Ganges river in Rishikesh",
    order: 4,
  },
  {
    id: "dhi_uk_5",
    title: "Valley of Flowers",
    locationName: "Chamoli Biosphere, Uttarakhand",
    headline: "A Living Carpet of Himalayan Blooms",
    description:
      "UNESCO-listed and breathtakingly remote, the Valley of Flowers bursts into a riot of 500 species of wildflowers each monsoon season — a sight that feels entirely otherworldly.",
    imageUrl:
      "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=2400&q=85",
    altText: "Vibrant alpine wildflower blossoms carpeting high altitude Himalayan glacial valley",
    order: 5,
  },
];

const DEFAULT_DEHRADUN_SLIDES: HeroSlide[] = [
  {
    id: "dhi_ddn_1",
    title: "Robber's Cave",
    locationName: "Dehradun, Uttarakhand",
    destinationName: "Robber's Cave – Dehradun, Uttarakhand",
    headline: "The Hidden Wonder of the Doon Valley",
    tagline: "The Hidden Wonder of the Doon Valley",
    description:
      "Discover the natural beauty of Robber's Cave, where cool streams flow through narrow limestone formations, creating an unforgettable escape into nature.",
    imageUrl:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1920&auto=format&fit=crop",
    order: 1,
  },
  {
    id: "dhi_ddn_2",
    title: "Sahastradhara",
    locationName: "Dehradun, Uttarakhand",
    destinationName: "Sahastradhara – Dehradun, Uttarakhand",
    headline: "Where a Thousand Springs Flow",
    tagline: "Where a Thousand Springs Flow",
    description:
      "Experience the beauty of cascading waterfalls, natural springs, and lush green surroundings in one of Dehradun's most scenic destinations.",
    imageUrl:
      "https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1920&auto=format&fit=crop",
    order: 2,
  },
  {
    id: "dhi_ddn_3",
    title: "Forest Research Institute",
    locationName: "Dehradun, Uttarakhand",
    destinationName: "Forest Research Institute – Dehradun, Uttarakhand",
    headline: "An Architectural Jewel of the Doon Valley",
    tagline: "An Architectural Jewel of the Doon Valley",
    description:
      "Explore magnificent colonial architecture, expansive green lawns, and a remarkable heritage campus surrounded by the natural beauty of Dehradun.",
    imageUrl:
      "https://images.unsplash.com/photo-1599661046289-e31897846e41?q=80&w=1920&auto=format&fit=crop",
    order: 3,
  },
  {
    id: "dhi_ddn_4",
    title: "Tapkeshwar Temple",
    locationName: "Dehradun, Uttarakhand",
    destinationName: "Tapkeshwar Temple – Dehradun, Uttarakhand",
    headline: "Where Nature Meets Divine Devotion",
    tagline: "Where Nature Meets Divine Devotion",
    description:
      "Discover a sacred cave temple surrounded by peaceful natural landscapes, where spiritual heritage and natural beauty come together.",
    imageUrl:
      "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=1920&auto=format&fit=crop",
    order: 4,
  },
  {
    id: "dhi_ddn_5",
    title: "Mindrolling Monastery",
    locationName: "Dehradun, Uttarakhand",
    destinationName: "Mindrolling Monastery – Dehradun, Uttarakhand",
    headline: "A Sanctuary of Peace and Spirituality",
    tagline: "A Sanctuary of Peace and Spirituality",
    description:
      "Experience magnificent Buddhist architecture, tranquil gardens, colorful artwork, and a peaceful atmosphere in the heart of Clement Town.",
    imageUrl:
      "https://images.unsplash.com/photo-1615836245337-f5b9b2303f10?q=80&w=1920&auto=format&fit=crop",
    order: 5,
  },
];

interface StateHeroBannerProps {
  searchedLocation?: string;
  allDestinations?: any[];
  hotels?: any[];
  propertyCount?: number;
}

const KNOWN_STATES = [
  "Uttarakhand",
  "Rajasthan",
  "Goa",
  "Himachal Pradesh",
  "Uttar Pradesh",
  "Kerala",
  "Maharashtra",
  "Karnataka",
  "Tamil Nadu",
  "Gujarat",
  "West Bengal",
  "Sikkim",
  "Jammu and Kashmir",
  "Ladakh",
  "Punjab",
  "Madhya Pradesh",
  "Odisha",
  "Assam",
  "Meghalaya",
  "Bihar",
  "Andhra Pradesh",
  "Telangana",
  "Jharkhand",
  "Chhattisgarh",
  "Haryana",
  "Tripura",
  "Manipur",
  "Nagaland",
  "Mizoram",
  "Arunachal Pradesh",
  "Delhi",
  "Puducherry",
  "Chandigarh",
  "Andaman and Nicobar Islands",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Lakshadweep",
];

const CITY_TO_STATE_MAP: Record<string, string> = {
  // Uttarakhand
  rishikesh: "Uttarakhand",
  haridwar: "Uttarakhand",
  dehradun: "Uttarakhand",
  nainital: "Uttarakhand",
  mussoorie: "Uttarakhand",
  kedarnath: "Uttarakhand",
  badrinath: "Uttarakhand",
  auli: "Uttarakhand",
  almora: "Uttarakhand",
  "jim corbett": "Uttarakhand",
  corbett: "Uttarakhand",
  ranikhet: "Uttarakhand",
  // Rajasthan
  jaipur: "Rajasthan",
  udaipur: "Rajasthan",
  jodhpur: "Rajasthan",
  jaisalmer: "Rajasthan",
  pushkar: "Rajasthan",
  bikaner: "Rajasthan",
  "mount abu": "Rajasthan",
  ajmer: "Rajasthan",
  // Goa
  goa: "Goa",
  baga: "Goa",
  calangute: "Goa",
  panaji: "Goa",
  candolim: "Goa",
  anjuna: "Goa",
  palolem: "Goa",
  arambol: "Goa",
  morjim: "Goa",
  vagator: "Goa",
  // Himachal Pradesh
  shimla: "Himachal Pradesh",
  manali: "Himachal Pradesh",
  dharamshala: "Himachal Pradesh",
  dharamsala: "Himachal Pradesh",
  "mcleod ganj": "Himachal Pradesh",
  mcleodganj: "Himachal Pradesh",
  kullu: "Himachal Pradesh",
  kasol: "Himachal Pradesh",
  dalhousie: "Himachal Pradesh",
  kasauli: "Himachal Pradesh",
  spiti: "Himachal Pradesh",
  "spiti valley": "Himachal Pradesh",
  jibhi: "Himachal Pradesh",
  tirthan: "Himachal Pradesh",
  // Uttar Pradesh
  agra: "Uttar Pradesh",
  varanasi: "Uttar Pradesh",
  lucknow: "Uttar Pradesh",
  ayodhya: "Uttar Pradesh",
  mathura: "Uttar Pradesh",
  vrindavan: "Uttar Pradesh",
  prayagraj: "Uttar Pradesh",
  // Kerala
  kochi: "Kerala",
  munnar: "Kerala",
  alappuzha: "Kerala",
  alleppey: "Kerala",
  wayanad: "Kerala",
  kovalam: "Kerala",
  varkala: "Kerala",
  thekkady: "Kerala",
  // Maharashtra
  mumbai: "Maharashtra",
  pune: "Maharashtra",
  lonavala: "Maharashtra",
  khandala: "Maharashtra",
  mahabaleshwar: "Maharashtra",
  alibaug: "Maharashtra",
  shirdi: "Maharashtra",
  nashik: "Maharashtra",
  // Karnataka
  bengaluru: "Karnataka",
  bangalore: "Karnataka",
  mysuru: "Karnataka",
  mysore: "Karnataka",
  coorg: "Karnataka",
  hampi: "Karnataka",
  gokarna: "Karnataka",
  chikmagalur: "Karnataka",
};

/**
 * Extracts location details (state and optional city) from search input
 */
function parseLocation(
  locationInput: string,
  allDestinations: any[] = [],
  hotels: any[] = []
): { state: string; city: string; displayLocation: string } {
  if (!locationInput || !locationInput.trim()) {
    return { state: "", city: "", displayLocation: "India" };
  }

  const raw = locationInput.trim();
  const lower = raw.toLowerCase();

  const tokens = raw
    .split(/[,;/]+/)
    .map((t) => t.trim())
    .filter(Boolean);

  let detectedCity = "";
  let detectedState = "";

  // 1. Check for city in CITY_TO_STATE_MAP
  for (const token of tokens) {
    const tLower = token.toLowerCase();
    if (CITY_TO_STATE_MAP[tLower]) {
      detectedCity = token.charAt(0).toUpperCase() + token.slice(1);
      detectedState = CITY_TO_STATE_MAP[tLower];
      break;
    }
  }

  // 2. Check for known states
  if (!detectedState) {
    const sortedStates = [...KNOWN_STATES].sort((a, b) => b.length - a.length);
    for (const st of sortedStates) {
      const stLower = st.toLowerCase();
      const regex = new RegExp(`(^|[\\s,;/-])${stLower}([\\s,;/-]|$)`, "i");
      if (regex.test(raw) || lower === stLower) {
        detectedState = st;
        break;
      }
    }
  }

  // 3. Check allDestinations
  if (allDestinations && allDestinations.length > 0) {
    for (const dest of allDestinations) {
      const destState = (dest.stateName || dest.state || "").trim();
      const destCity = (dest.cityName || dest.city || "").trim();

      if (destCity && (lower.includes(destCity.toLowerCase()) || tokens.some((t) => t.toLowerCase() === destCity.toLowerCase()))) {
        detectedCity = destCity;
        if (destState) detectedState = destState;
        break;
      }

      if (destState && (lower.includes(destState.toLowerCase()) || tokens.some((t) => t.toLowerCase() === destState.toLowerCase()))) {
        if (!detectedState) detectedState = destState;
      }
    }
  }

  // 4. Check hotels
  if (!detectedState && hotels && hotels.length > 0) {
    for (const h of hotels) {
      const hCity = (h.city || "").trim();
      const hState = (h.state || "").trim();
      if (hCity && lower.includes(hCity.toLowerCase())) {
        detectedCity = hCity;
        if (hState) detectedState = hState;
        break;
      }
      if (hState && lower.includes(hState.toLowerCase())) {
        detectedState = hState;
        break;
      }
    }
  }

  const displayLocation = detectedCity || detectedState || tokens[0] || "India";

  return {
    state: detectedState,
    city: detectedCity,
    displayLocation,
  };
}

export default function StateHeroBanner({
  searchedLocation = "",
  allDestinations = [],
  hotels = [],
  propertyCount = 0,
}: StateHeroBannerProps) {
  const searchParams = useSearchParams();
  const locationFromQuery =
    searchParams?.get("location") ||
    searchParams?.get("destination") ||
    searchParams?.get("state") ||
    searchParams?.get("city") ||
    "";
  const effectiveLocation = searchedLocation || locationFromQuery;

  const [locationMeta, setLocationMeta] = useState<{
    state: string;
    city: string;
    displayLocation: string;
  }>({ state: "", city: "", displayLocation: "India" });

  const [slides, setSlides] = useState<HeroSlide[]>(DEFAULT_UTTARAKHAND_SLIDES);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check accessibility reduced-motion preference
  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      setPrefersReducedMotion(mediaQuery.matches);
      const listener = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener("change", listener);
      return () => mediaQuery.removeEventListener("change", listener);
    }
  }, []);

  // 1. Parse Location
  useEffect(() => {
    const meta = parseLocation(effectiveLocation, allDestinations, hotels);
    setLocationMeta(meta);
  }, [effectiveLocation, allDestinations, hotels]);

  // 2. Fetch slides when location changes
  useEffect(() => {
    let isMounted = true;

    async function fetchHeroSlides() {
      const queryParam = locationMeta.city || locationMeta.state;
      if (!queryParam) {
        setSlides([]);
        setCurrentIndex(0);
        return;
      }

      try {
        const queryUrl = locationMeta.city
          ? `/api/hero-banners?city=${encodeURIComponent(locationMeta.city)}&state=${encodeURIComponent(locationMeta.state)}`
          : `/api/hero-banners?state=${encodeURIComponent(locationMeta.state)}`;

        const res = await fetch(queryUrl, { cache: "no-store" });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            const fetchedSlides = Array.isArray(data.slides) ? data.slides : [];
            if (fetchedSlides.length > 0) {
              setSlides(fetchedSlides);
            } else if (locationMeta.city.toLowerCase() === "dehradun") {
              setSlides(DEFAULT_DEHRADUN_SLIDES);
            } else if (locationMeta.state.toLowerCase() === "uttarakhand") {
              setSlides(DEFAULT_UTTARAKHAND_SLIDES);
            } else {
              setSlides([]);
            }
            setCurrentIndex(0);
          }
        } else {
          if (isMounted) {
            if (locationMeta.city.toLowerCase() === "dehradun") {
              setSlides(DEFAULT_DEHRADUN_SLIDES);
            } else if (locationMeta.state.toLowerCase() === "uttarakhand") {
              setSlides(DEFAULT_UTTARAKHAND_SLIDES);
            } else {
              setSlides([]);
            }
          }
        }
      } catch (err) {
        console.error("Error fetching hero slides:", err);
        if (isMounted) {
          if (locationMeta.city.toLowerCase() === "dehradun") {
            setSlides(DEFAULT_DEHRADUN_SLIDES);
          } else if (locationMeta.state.toLowerCase() === "uttarakhand") {
            setSlides(DEFAULT_UTTARAKHAND_SLIDES);
          } else {
            setSlides([]);
          }
        }
      }
    }

    fetchHeroSlides();

    return () => {
      isMounted = false;
    };
  }, [locationMeta.state, locationMeta.city]);

  // 3. Slide transition timer (Transitions every 4.8s, crossfades over 1.35s)
  const nextSlide = useCallback(() => {
    setSlides((currentSlides) => {
      if (currentSlides.length <= 1) return currentSlides;
      setCurrentIndex((prev) => (prev + 1) % currentSlides.length);
      return currentSlides;
    });
  }, []);

  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (slides.length > 1) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 4800);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [slides.length, nextSlide]);

  const handleSelectSlide = (idx: number) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    setCurrentIndex(idx);
    if (slides.length > 1) {
      timerRef.current = setInterval(() => {
        nextSlide();
      }, 4800);
    }
  };

  const hasActiveSlides = slides.length > 0;
  const currentSlide = hasActiveSlides ? slides[currentIndex] : null;

  // Extract display values (supports both HolidayExpertz title/headline and destinationName/tagline)
  let title = currentSlide?.title || "";
  let locationName = currentSlide?.locationName || "";
  if (!title && currentSlide?.destinationName) {
    const parts = currentSlide.destinationName.split(/–|-/);
    title = parts[0]?.trim() || currentSlide.destinationName;
    locationName = parts[1]?.trim() || "";
  }

  const headline = currentSlide?.headline || currentSlide?.tagline || "";
  const description = currentSlide?.description || "";
  const destinationFullName =
    currentSlide?.destinationName ||
    (title && locationName ? `${title} – ${locationName}` : title || "");
  const displayLocation = locationMeta.displayLocation || "India";

  const headingText = displayLocation ? `Explore Stays in ${displayLocation}` : "Explore Properties";
  const supportingText = displayLocation
    ? `Browse handpicked luxury villas, royal palaces, and boutique resorts across ${displayLocation}.`
    : "Browse handpicked villas, heritage hotels, and luxury resorts across iconic destinations.";

  return (
    <section
      aria-label="Properties Destination Hero"
      style={{
        position: "relative",
        width: "100%",
        height: "560px",
        minHeight: "500px",
        maxHeight: "620px",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        backgroundColor: "#08192b",
        color: "#ffffff",
        boxSizing: "border-box",
      }}
      className="select-none"
    >
      {/* Background Slides - One shown at a time with smooth 900ms crossfade and Ken Burns zoom */}
      {hasActiveSlides ? (
        <div
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            overflow: "hidden",
            backgroundColor: "#08192b",
          }}
        >
          {slides.map((slide, index) => {
            const isCurrent = index === currentIndex;
            return (
              <div
                key={slide.id || index}
                aria-hidden={!isCurrent}
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  opacity: isCurrent ? 1 : 0,
                  transition: prefersReducedMotion
                    ? "opacity 300ms ease"
                    : "opacity 900ms ease-in-out",
                  zIndex: isCurrent ? 1 : 0,
                  pointerEvents: isCurrent ? "auto" : "none",
                }}
              >
                <img
                  src={slide.imageUrl}
                  alt={slide.altText || slide.title || slide.destinationName || "Destination photography"}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: "center",
                    transformOrigin: "center center",
                    transform: isCurrent && !prefersReducedMotion ? "scale(1.08)" : "scale(1.0)",
                    transition: prefersReducedMotion
                      ? "none"
                      : "transform 5.2s cubic-bezier(0.25, 1, 0.5, 1)",
                  }}
                  loading={index === 0 ? "eager" : "lazy"}
                />
              </div>
            );
          })}
          {/* Cinematic Multi-Directional Gradients for Maximum Legibility and Visual Brilliance */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 2,
              pointerEvents: "none",
              background: `
                linear-gradient(to top, rgba(4, 18, 33, 0.95) 0%, rgba(4, 18, 33, 0.6) 30%, transparent 65%),
                linear-gradient(270deg, rgba(4, 18, 33, 0.88) 0%, rgba(4, 18, 33, 0.5) 32%, transparent 60%),
                linear-gradient(90deg, rgba(4, 18, 33, 0.82) 0%, rgba(4, 18, 33, 0.4) 30%, transparent 55%)
              `,
            }}
          />
        </div>
      ) : (
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 0,
            background: "linear-gradient(to bottom, #041526, #08192b, #0f172a)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Foreground Content: Left Overview + Right Destination Details */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "1360px",
          margin: "0 auto",
          padding: "2rem 2.5rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          boxSizing: "border-box",
          flexWrap: "wrap",
          gap: "2rem",
        }}
      >
        {/* ===================== LEFT SIDE ===================== */}
        <div style={{ maxWidth: "620px", flex: "1 1 360px" }}>
          {/* Breadcrumbs */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.6rem",
              fontSize: "0.825rem",
              fontWeight: 600,
              color: "rgba(255, 255, 255, 0.75)",
              textShadow: "0 1px 4px rgba(0, 0, 0, 0.8)",
              marginBottom: "0.5rem",
            }}
          >
            <a href="/" style={{ color: "rgba(255, 255, 255, 0.85)", textDecoration: "none" }}>
              Home
            </a>
            <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>/</span>
            <a href="/hotels" style={{ color: "rgba(255, 255, 255, 0.85)", textDecoration: "none" }}>
              Properties
            </a>
            {displayLocation && (
              <>
                <span style={{ color: "rgba(255, 255, 255, 0.5)" }}>/</span>
                <span style={{ color: "#2dd4bf", fontWeight: 700, textTransform: "capitalize" }}>
                  {displayLocation}
                </span>
              </>
            )}
          </div>

          {/* Heading in Bold White + Available Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.85rem",
              flexWrap: "wrap",
              marginTop: "0.25rem",
              marginBottom: "0.6rem",
            }}
          >
            <h1
              style={{
                color: "#ffffff",
                fontWeight: 800,
                fontSize: "clamp(2rem, 3.2vw, 2.75rem)",
                lineHeight: 1.15,
                margin: 0,
                letterSpacing: "-0.02em",
                textShadow: "0 2px 14px rgba(0, 0, 0, 0.85)",
              }}
            >
              {headingText}
            </h1>

            {propertyCount !== undefined && (
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  color: "#2dd4bf",
                  fontWeight: 700,
                  fontSize: "0.78rem",
                  padding: "0.25rem 0.8rem",
                  borderRadius: "9999px",
                  background: "rgba(13, 148, 136, 0.3)",
                  border: "1px solid rgba(45, 212, 191, 0.45)",
                  backdropFilter: "blur(6px)",
                  boxShadow: "0 2px 6px rgba(0, 0, 0, 0.3)",
                  letterSpacing: "0.01em",
                }}
              >
                {propertyCount} Available
              </span>
            )}
          </div>

          {/* Subtitle */}
          <p
            style={{
              margin: "0 0 1.25rem 0",
              color: "rgba(255, 255, 255, 0.85)",
              fontSize: "0.95rem",
              lineHeight: 1.5,
              fontWeight: 400,
              textShadow: "0 1px 6px rgba(0, 0, 0, 0.7)",
            }}
          >
            {supportingText}
          </p>

          {/* Slide Indicator Bars */}
          {hasActiveSlides && slides.length > 1 && (
            <div className="flex items-center gap-2" role="tablist" aria-label="Slide indicators">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSlide(idx)}
                  className="transition-all duration-300 rounded-full focus:outline-none"
                  style={{
                    width: idx === currentIndex ? "32px" : "8px",
                    height: "5px",
                    borderRadius: "3px",
                    backgroundColor: idx === currentIndex ? "#F2C65D" : "rgba(255, 255, 255, 0.4)",
                    cursor: "pointer",
                    border: "none",
                    padding: 0,
                    boxShadow: idx === currentIndex ? "0 0 8px rgba(242, 198, 93, 0.6)" : "none",
                  }}
                  aria-label={`Go to slide ${idx + 1}`}
                  aria-selected={idx === currentIndex}
                  role="tab"
                />
              ))}
            </div>
          )}
        </div>

        {/* ===================== RIGHT SIDE ===================== */}
        {hasActiveSlides && (destinationFullName || headline || description) && (
          <div
            key={currentIndex}
            style={{
              maxWidth: "460px",
              flex: "1 1 320px",
              textAlign: "left",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-start",
              animation: "fadeIn 700ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
          >
            {/* Location Pin & Destination Name */}
            {destinationFullName && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  color: "rgba(255, 255, 255, 0.95)",
                  fontSize: "0.95rem",
                  fontWeight: 600,
                  textShadow: "0 2px 10px rgba(0, 0, 0, 0.8)",
                  marginBottom: "0.6rem",
                }}
              >
                <span style={{ color: "#f87171", fontSize: "1.1rem" }}>📍</span>
                <span>{destinationFullName}</span>
              </div>
            )}

            {/* Golden Horizontal Line Divider */}
            <div
              style={{
                width: "55px",
                height: "1.5px",
                backgroundColor: "#F2C65D",
                marginBottom: "0.85rem",
                borderRadius: "1px",
                boxShadow: "0 0 6px rgba(242, 198, 93, 0.5)",
              }}
            />

            {/* Destination Tagline in Golden Italic Serif */}
            {headline && (
              <h2
                style={{
                  margin: "0 0 0.75rem 0",
                  fontFamily: "Georgia, 'Times New Roman', serif",
                  fontStyle: "italic",
                  color: "#F2C65D",
                  fontSize: "clamp(1.4rem, 2vw, 1.75rem)",
                  fontWeight: 400,
                  lineHeight: 1.3,
                  letterSpacing: "-0.01em",
                  textShadow: "0 2px 10px rgba(0, 0, 0, 0.8)",
                }}
              >
                {headline}
              </h2>
            )}

            {/* Destination Description */}
            {description && (
              <p
                style={{
                  margin: 0,
                  color: "rgba(255, 255, 255, 0.85)",
                  fontSize: "0.875rem",
                  lineHeight: 1.6,
                  fontWeight: 300,
                  maxWidth: "440px",
                  textShadow: "0 2px 8px rgba(0, 0, 0, 0.8)",
                }}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
