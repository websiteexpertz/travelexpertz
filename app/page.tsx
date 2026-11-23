"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  ChevronRight,
  Compass,
  Headphones,
  Heart,
  Hotel,
  MapPin,
  ShieldCheck,
  Sparkles,
  Star,
} from "lucide-react";
import Header from "./components/Header";
import { LocationDropdown } from "./components/LocationDropdown";
import ServiceEnquiryModal, {
  ServiceId,
} from "./components/ServiceEnquiryModal";
import TestimonialCarousel from "./components/TestimonialCarousel";
import AddReviewModal from "./components/AddReviewModal";
import MarqueeSlider from "./components/MarqueeSlider";
import { SAMPLE_BLOGS } from "./data/sampleBlogs";
import "./styles/homepage.css";

const services: Array<{
  id: ServiceId;
  title: string;
  tagline: string;
  description: string;
  cta: string;
  image: string;
}> = [
  {
    id: "visa",
    title: "Visa Assistance",
    tagline: "Your Visa. Your Destination. Your World of Possibilities.",
    description:
      "Make international travel easier with visa assistance. Get guidance on visa requirements, documentation, application procedures and appointment support for your chosen destination.",
    cta: "Get Visa Assistance",
    image: "/New-images/Visa Assitance.jpg",
  },
  {
    id: "forex",
    title: "Forex Card & Currency",
    tagline: "Travel Globally. Exchange Easily.",
    description:
      "Travel internationally with confidence using foreign exchange services. Get assistance with forex cards and foreign currency for convenient and secure overseas transactions.",
    cta: "Explore Forex Services",
    image: "/New-images/Forex and Currency.jpg",
  },
  {
    id: "insurance",
    title: "Travel Insurance",
    tagline: "Travel with Confidence. We've Got You Covered.",
    description:
      "Travel with greater peace of mind through suitable travel insurance options. Get coverage assistance for medical emergencies, trip cancellations, baggage loss and other travel-related uncertainties, as per policy terms.",
    cta: "Get Insurance Assistance",
    image: "/New-images/Travel Insurance.jpg",
  },
  {
    id: "wedding",
    title: "Destination Wedding",
    tagline: "Your Dream Wedding. A Perfect Destination. Memories Forever.",
    description:
      "Turn your dream wedding into an unforgettable celebration at a beautiful destination. From venue selection and accommodation to guest transportation and travel coordination, we help plan seamless destination wedding experiences.",
    cta: "Plan Your Wedding",
    image: "/New-images/Destination Wedding.jpg",
  },
];

const collections = [
  {
    title: "Romantic Retreats",
    location: "Udaipur & Goa",
    image: "/hero2.jpeg",
  },
  {
    title: "Mountain Escapes",
    location: "Himachal & Uttarakhand",
    image: "/hero1.jpeg",
  },
  { title: "Culture & Heritage", location: "Rajasthan", image: "/hero4.jpeg" },
  {
    title: "Sunlit Coastlines",
    location: "Kerala & Goa",
    image: "/hero3.jpeg",
  },
];

const gems = [
  { title: "Majuli", state: "Assam", image: "/hero4.jpeg" },
  { title: "Ziro Valley", state: "Arunachal Pradesh", image: "/hero1.jpeg" },
  { title: "Tawang", state: "Arunachal Pradesh", image: "/hero2.jpeg" },
  { title: "Gokarna", state: "Karnataka", image: "/hero3.jpeg" },
  { title: "Chopta", state: "Uttarakhand", image: "/hero-bg.jpg" },
  { title: "Spiti Valley", state: "Himachal Pradesh", image: "/hero1.jpeg" },
  { title: "Dhanushkodi", state: "Tamil Nadu", image: "/hero3.jpeg" },
  { title: "Orchha", state: "Madhya Pradesh", image: "/hero4.jpeg" },
];

const whyUs = [
  {
    icon: ShieldCheck,
    title: "Complete Travel Solutions",
    text: "From flights, hotels and cabs to visas, forex, insurance and customized holiday packages, find all your travel essentials in one place.",
  },
  {
    icon: Heart,
    title: "Personalized Travel Experiences",
    text: "Every traveller is different. We create travel experiences tailored to your preferences, interests, budget and travel style.",
  },
  {
    icon: Sparkles,
    title: "Affordable & Flexible Packages",
    text: "Explore handpicked travel options and customized packages that offer great value without compromising on comfort and experiences.",
  },
  {
    icon: Headphones,
    title: "Trusted Travel Assistance",
    text: "Our team supports you throughout your travel planning and helps make your journey smooth and convenient.",
  },
  {
    icon: Compass,
    title: "Domestic & International Destinations",
    text: "Discover incredible destinations across India and explore beautiful places around the world with our travel solutions.",
  },
  {
    icon: Hotel,
    title: "Hassle-Free Booking Experience",
    text: "Enjoy convenient booking assistance, organized travel arrangements and support at every step of your journey.",
  },
  {
    icon: Star,
    title: "Memorable Experiences",
    text: "We go beyond bookings to help you discover new destinations, enjoy unique experiences and create memories that last a lifetime.",
  },
];

function formatEventDate(dateStr?: string) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatEventDateRange(startDate?: string, endDate?: string) {
  const start = formatEventDate(startDate);
  const end = formatEventDate(endDate);

  if (start && end && start !== end) {
    return `${start} — ${end}`;
  }
  return start || end || "Date to be announced";
}

interface EventLocationItem {
  city?: string;
  state?: string;
  raw?: string;
}

function parseEventLocations(event: any): EventLocationItem[] {
  // 1. If structured locations array is provided
  if (Array.isArray(event.locations) && event.locations.length > 0) {
    const valid = event.locations
      .map((loc: any) => ({
        city: typeof loc.city === "string" ? loc.city.trim() : "",
        state: typeof loc.state === "string" ? loc.state.trim() : "",
      }))
      .filter((loc: any) => loc.city || loc.state);
    if (valid.length > 0) return valid;
  }

  // 2. If single city and/or state are provided
  const city = typeof event.city === "string" ? event.city.trim() : "";
  const state = typeof event.state === "string" ? event.state.trim() : "";
  if (city || state) {
    return [{ city, state }];
  }

  // 3. Fallback: Parse location string
  const locStr =
    typeof event.location === "string" ? event.location.trim() : "";
  if (!locStr) {
    return [{ raw: "India" }];
  }

  // Check if multiple locations are separated by | or ;
  const parts = locStr
    .split(/[|;]/)
    .map((p: string) => p.trim())
    .filter(Boolean);
  if (parts.length > 1) {
    return parts.map((part: string) => {
      const subParts = part
        .split(",")
        .map((s: string) => s.trim())
        .filter(Boolean);
      if (subParts.length === 2) {
        return { city: subParts[0], state: subParts[1] };
      }
      return { raw: part };
    });
  }

  // Single location string with comma (e.g., "Bundi, Rajasthan")
  const commaParts = locStr
    .split(",")
    .map((s: string) => s.trim())
    .filter(Boolean);
  if (commaParts.length === 2) {
    return [{ city: commaParts[0], state: commaParts[1] }];
  }

  return [{ raw: locStr }];
}

function EventLocationDisplay({ event }: { event: any }) {
  const [expanded, setExpanded] = useState(false);
  const locations = parseEventLocations(event);

  // For lengthy location lists (> 2), show preview with View all locations toggle
  const isLengthy = locations.length > 2;
  const displayedLocations =
    isLengthy && !expanded ? locations.slice(0, 2) : locations;

  return (
    <p
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "6px",
        margin: "7px 16px 18px",
        color: "#667085",
        fontSize: "0.82rem",
      }}
    >
      <MapPin
        size={15}
        style={{
          flexShrink: 0,
          minWidth: "15px",
          marginTop: "2px",
          color: "#667085",
        }}
      />
      <span style={{ display: "inline", lineHeight: "1.4" }}>
        {displayedLocations.map((loc, idx) => {
          const hasCity = Boolean(loc.city);
          const hasState = Boolean(loc.state);

          return (
            <span key={idx} style={{ display: "inline" }}>
              {idx > 0 && <span style={{ color: "#667085" }}>; </span>}
              {hasCity && (
                <Link
                  href={`/hotels/search?location=${encodeURIComponent(loc.city!)}`}
                  className="event-location-link"
                  onClick={(e) => e.stopPropagation()}
                  title={`View properties in ${loc.city}`}
                >
                  {loc.city}
                </Link>
              )}
              {hasCity && hasState && (
                <span style={{ color: "#667085" }}>, </span>
              )}
              {hasState && (
                <Link
                  href={`/hotels/search?location=${encodeURIComponent(loc.state!)}`}
                  className="event-location-link"
                  onClick={(e) => e.stopPropagation()}
                  title={`View properties in ${loc.state}`}
                >
                  {loc.state}
                </Link>
              )}
              {!hasCity && !hasState && (
                <span style={{ color: "#667085" }}>{loc.raw || "India"}</span>
              )}
            </span>
          );
        })}
        {isLengthy && (
          <button
            type="button"
            className="event-location-more-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            aria-label={
              expanded ? "Show fewer locations" : "View all locations"
            }
          >
            {expanded ? "Show less" : `+${locations.length - 2} more`}
          </button>
        )}
      </span>
    </p>
  );
}

const DESTINATION_STATE_MAP: Record<string, string> = {
  majuli: "Assam",
  "ziro valley": "Arunachal Pradesh",
  ziro: "Arunachal Pradesh",
  tawang: "Arunachal Pradesh",
  gokarna: "Karnataka",
  chopta: "Uttarakhand",
  "spiti valley": "Himachal Pradesh",
  spiti: "Himachal Pradesh",
  dhanushkodi: "Tamil Nadu",
  orchha: "Madhya Pradesh",
  manali: "Himachal Pradesh",
  shimla: "Himachal Pradesh",
  dharamshala: "Himachal Pradesh",
  kasol: "Himachal Pradesh",
  kullu: "Himachal Pradesh",
  rishikesh: "Uttarakhand",
  mussoorie: "Uttarakhand",
  dehradun: "Uttarakhand",
  nainital: "Uttarakhand",
  jaipur: "Rajasthan",
  udaipur: "Rajasthan",
  jodhpur: "Rajasthan",
  jaisalmer: "Rajasthan",
  pushkar: "Rajasthan",
  bundi: "Rajasthan",
  goa: "Goa",
  calangute: "Goa",
  candolim: "Goa",
  panaji: "Goa",
  munnar: "Kerala",
  wayanad: "Kerala",
  alleppey: "Kerala",
  kochi: "Kerala",
  varanasi: "Uttar Pradesh",
  agra: "Uttar Pradesh",
  lucknow: "Uttar Pradesh",
  ooty: "Tamil Nadu",
  kodaikanal: "Tamil Nadu",
  coorg: "Karnataka",
  hampi: "Karnataka",
  darjeeling: "West Bengal",
  kalimpong: "West Bengal",
  gangtok: "Sikkim",
  shillong: "Meghalaya",
  cherrapunji: "Meghalaya",
  leh: "Ladakh",
  ladakh: "Ladakh",
  srinagar: "Jammu and Kashmir",
  gulmarg: "Jammu and Kashmir",
  pahalgam: "Jammu and Kashmir",
};

function parseCurationLocation(item: any) {
  let city = (item.city || "").trim();
  let state = (item.state || "").trim();
  const name = (item.name || item.title || item.destinationName || "").trim();

  // 1. If item has a location string (e.g. "Jaipur, Rajasthan")
  const locStr = (item.location || "").trim();
  if (locStr) {
    const parts = locStr
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      if (!city) city = parts[0];
      if (!state) state = parts[1];
    } else if (parts.length === 1 && !city && !state) {
      city = parts[0];
    }
  }

  // 2. If name itself has a comma (e.g. "Bundi, Rajasthan")
  if (name.includes(",") && (!city || !state)) {
    const parts = name
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean);
    if (parts.length >= 2) {
      if (!city) city = parts[0];
      if (!state) state = parts[1];
    }
  }

  // 3. Look up state from DESTINATION_STATE_MAP if state is empty
  const lookupKey = (city || name).toLowerCase();
  if (!state && DESTINATION_STATE_MAP[lookupKey]) {
    state = DESTINATION_STATE_MAP[lookupKey];
  }

  // 4. If city is empty but name exists
  if (!city && name) {
    if (state && name.toLowerCase() !== state.toLowerCase()) {
      city = name;
    } else if (!state) {
      city = name;
    }
  }

  // 5. Avoid repeating e.g. "Goa, Goa"
  if (city && state && city.toLowerCase() === state.toLowerCase()) {
    state = "";
  }

  const rawLocation =
    !city && !state ? name || locStr || item.state || item.city || "India" : "";

  return { city, state, rawLocation };
}

function CurationLocationDisplay({ item }: { item: any }) {
  const { city, state, rawLocation } = parseCurationLocation(item);

  if (!city && !state && !rawLocation) return null;

  return (
    <p className="curation-location-row">
      <MapPin size={13} className="curation-location-icon" />
      {city && (
        <Link
          href={`/hotels/search?location=${encodeURIComponent(city)}`}
          className="curation-location-link"
          onClick={(e) => e.stopPropagation()}
          title={`View properties in ${city}`}
        >
          {city}
        </Link>
      )}
      {city && state && <span className="curation-location-sep">, </span>}
      {state && (
        <Link
          href={`/hotels/search?location=${encodeURIComponent(state)}`}
          className="curation-location-link"
          onClick={(e) => e.stopPropagation()}
          title={`View properties in ${state}`}
        >
          {state}
        </Link>
      )}
      {!city && !state && rawLocation && (
        <Link
          href={`/hotels/search?location=${encodeURIComponent(rawLocation)}`}
          className="curation-location-link"
          onClick={(e) => e.stopPropagation()}
          title={`View properties in ${rawLocation}`}
        >
          {rawLocation}
        </Link>
      )}
    </p>
  );
}

export default function Home() {
  const router = useRouter();
  const [activeService, setActiveService] = useState<ServiceId | null>(null);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [hotels, setHotels] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [hiddenDestinations, setHiddenDestinations] = useState<any[]>([]);
  const [handpickedHotels, setHandpickedHotels] = useState<any[]>([]);
  const [handpickedHomestays, setHandpickedHomestays] = useState<any[]>([]);
  const [blogs, setBlogs] = useState<any[]>([]);
  const [heroLocation, setHeroLocation] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);

  const heroSlides = [
    {
      image: "/New-images/Banner 1.jpg",
      tagline: "Your Dream Destination Is Just a Journey Away.",
    },
    {
      image: "/New-images/Banner 2.jpg",
      tagline: "From Mountains to Beaches, We Take You Everywhere.",
    },
    {
      image: "/New-images/Banner 3.jpg",
      tagline: "Safar Aapka, Planning Hamari!",
    },
    {
      image: "/New-images/Banner 4.jpg",
      tagline: "Your Travel Dreams, Our Expert Planning.",
    },
  ];

  useEffect(() => {
    const interval = window.setInterval(() => {
      setHeroImageIndex((current) => (current + 1) % heroSlides.length);
    }, 5000);
    return () => window.clearInterval(interval);
  }, [heroSlides.length]);

  useEffect(() => {
    Promise.allSettled([
      fetch("/api/hotels").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/events").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/testimonials").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/destinations").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/hotels?handpicked=true").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/homestays?handpicked=true").then((r) =>
        r.ok ? r.json() : [],
      ),
      fetch("/api/blogs?limit=8").then((r) =>
        r.ok ? r.json() : { blogs: [] },
      ),
    ]).then(
      ([
        hotelResult,
        eventResult,
        reviewResult,
        destinationResult,
        handpickedHotelResult,
        handpickedHomestayResult,
        blogResult,
      ]) => {
        if (hotelResult.status === "fulfilled") {
          const data = hotelResult.value;
          setHotels(
            (Array.isArray(data) ? data : data.hotels || []).slice(0, 4),
          );
        }
        if (eventResult.status === "fulfilled") {
          const data = eventResult.value;
          setEvents(
            (Array.isArray(data) ? data : data.events || []).slice(0, 12),
          );
        }
        if (reviewResult.status === "fulfilled") {
          setReviews(
            Array.isArray(reviewResult.value)
              ? reviewResult.value
              : [],
          );
        }
        if (destinationResult.status === "fulfilled") {
          setHiddenDestinations(
            Array.isArray(destinationResult.value)
              ? destinationResult.value
              : [],
          );
        }
        if (handpickedHotelResult.status === "fulfilled") {
          const data = handpickedHotelResult.value;
          setHandpickedHotels(
            (Array.isArray(data) ? data : data.hotels || []).slice(0, 8),
          );
        }
        if (handpickedHomestayResult.status === "fulfilled") {
          const data = handpickedHomestayResult.value;
          setHandpickedHomestays(
            (Array.isArray(data) ? data : data.homestays || []).slice(0, 8),
          );
        }
        if (blogResult && blogResult.status === "fulfilled") {
          const data = blogResult.value;
          setBlogs(Array.isArray(data) ? data : data.blogs || []);
        }
      },
    );
  }, []);

  const searchStay = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const params = new URLSearchParams({
      location: String(data.get("location") || ""),
      checkIn: String(data.get("checkIn") || ""),
      checkOut: String(data.get("checkOut") || ""),
      guests: "2",
    });
    window.location.href = `/hotels/search?${params}`;
  };

  const displayDestinations =
    hiddenDestinations.length >= 4
      ? hiddenDestinations
      : gems.map((g, i) => ({
          _id: `gem_${i}`,
          name: g.title,
          state: g.state,
          image: g.image,
        }));

  const displayGetaways =
    [...handpickedHotels, ...handpickedHomestays].length >= 4
      ? [...handpickedHotels, ...handpickedHomestays]
      : [...handpickedHotels, ...handpickedHomestays, ...hotels];

  // Merge newly added database blogs with existing sample blogs so new blogs
  // are shown together with existing blogs, not as a single card.
  const displayBlogs = useMemo(() => {
    const map = new Map<string, any>();
    // Put newly added / database blogs first
    blogs.forEach((b) => {
      const key = String(b._id || b.id || b.title);
      if (key) map.set(key, b);
    });
    // Add existing blogs so they always appear together
    SAMPLE_BLOGS.forEach((sb) => {
      const key = String(sb._id || sb.title);
      if (!map.has(key)) {
        map.set(key, sb);
      }
    });
    return Array.from(map.values());
  }, [blogs]);

  return (
    <div className="home-redesign">
      <Header currentPage="home" isHeroPage />

      <main>
        <section className="premium-hero">
          {heroSlides.map((slide, index) => (
            <Image
              key={slide.image}
              src={slide.image}
              alt={
                index === 0
                  ? "Scenic Indian mountain retreat"
                  : "Travel destination"
              }
              fill
              priority={index === 0}
              sizes="100vw"
              className={`premium-hero-image ${heroImageIndex === index ? "active" : ""}`}
            />
          ))}
          <div className="premium-hero-shade" />
          <div className="premium-hero-content">
            <h1 key={heroSlides[heroImageIndex].tagline}>
              {heroSlides[heroImageIndex].tagline}
            </h1>
            <p>
              Discover remarkable places, beautiful stays, and thoughtfully
              planned journeys.
            </p>
          </div>
        </section>

        <section className="stay-search-wrap" aria-label="Search stays">
          <form className="stay-search" onSubmit={searchStay}>
            <label>
              <span>
                <MapPin size={17} /> Destination
              </span>
              <LocationDropdown
                value={heroLocation}
                onChange={setHeroLocation}
                placeholder="Where do you want to go?"
                transparent
                variant="hero"
                inputId="hero-destination"
                required
              />
              <input type="hidden" name="location" value={heroLocation} />
            </label>
            <label>
              <span>
                <CalendarDays size={17} /> Check in
              </span>
              <input name="checkIn" type="date" />
            </label>
            <label>
              <span>
                <CalendarDays size={17} /> Check out
              </span>
              <input name="checkOut" type="date" />
            </label>
            <button type="submit">
              Search stays <ArrowRight size={18} />
            </button>
          </form>
        </section>

        <section className="home-section" id="services">
          <div className="section-heading">
            <div>
              <h2>Explore Our Travel Solutions</h2>
              <p>One trusted team for every important part of your journey.</p>
            </div>
          </div>
          <div className="service-grid">
            {services.map((service) => (
              <article className="service-card" key={service.id}>
                <div className="service-card-image">
                  <img src={service.image} alt={service.title} />
                </div>
                <div className="service-card-body">
                  <span className="service-kicker">{service.title}</span>
                  <h3>{service.tagline}</h3>
                  <p>{service.description}</p>
                  <button onClick={() => setActiveService(service.id)}>
                    {service.cta}
                    <ArrowRight size={17} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="why-section">
          <div className="home-section">
            <div className="section-heading">
              <div>
                <h2>Why Choose Travel Expertz</h2>
              </div>
            </div>
            <p className="section-description">
              At Travel Expertz, we believe every journey should be exciting,
              comfortable and memorable. From flights and hotels to holiday
              packages and personalized arrangements, we make travel planning
              simple, seamless and stress-free.
            </p>
            <MarqueeSlider
              className="why-marquee"
              trackClassName="why-marquee-track"
              ariaLabel="Why choose Travel Expertz"
              secondsPerCard={17}
            >
              {whyUs.map(({ icon: Icon, title, text }, index) => (
                <article className="why-card" key={`${title}-${index}`}>
                  <Icon size={27} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </MarqueeSlider>
          </div>
        </section>

        <section className="home-section">
          <div className="section-heading">
            <div>
              <h2>Experience India. Celebrate Every Moment.</h2>
            </div>
            <Link href="/events">
              All events <ChevronRight size={18} />
            </Link>
          </div>
          <p className="section-description">
            From vibrant festivals and cultural celebrations to concerts,
            exhibitions, sporting events and grand celebrations, discover what
            is happening across India and let Travel Expertz plan your visit.
          </p>
          {events.length > 0 ? (
            <MarqueeSlider
              className="events-marquee"
              trackClassName="events-marquee-track"
              ariaLabel="Upcoming Events"
              secondsPerCard={17}
            >
              {events.map((event, index) => (
                <article
                  className="event-card"
                  key={`${event._id || event.id || event.eventName}-${index}`}
                >
                  <div>
                    <Image
                      src={event.profileImage || "/hero4.jpeg"}
                      alt={event.eventName || event.name || "Upcoming event"}
                      fill
                      sizes="25vw"
                    />
                  </div>
                  <span>{event.category || "Experience"}</span>
                  <h3>{event.eventName || event.name}</h3>
                  <p>
                    <CalendarDays size={15} style={{ flexShrink: 0 }} />
                    <span>{formatEventDateRange(event.startDate, event.endDate)}</span>
                  </p>
                  <EventLocationDisplay event={event} />
                </article>
              ))}
            </MarqueeSlider>
          ) : (
            <div className="events-empty">
              No upcoming events are available right now. Please check back
              soon.
            </div>
          )}
        </section>

        <section className="home-section testimonials-section">
          <div className="section-heading">
            <div>
              <h2>Stories of Happy Journeys</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="write-review-heading-btn"
            >
              + Write a Review
            </button>
          </div>
          <p className="section-description">
            At Travel Expertz, our greatest reward is the happiness and
            satisfaction of our travellers. Every journey tells a story, and
            every happy traveller inspires us to do better. From memorable
            holidays and exciting adventures to seamless bookings and
            personalized travel assistance, discover what our customers have to
            say about their experiences with us.
          </p>
          <TestimonialCarousel testimonials={reviews} />
        </section>

        <section className="home-section database-curations">
          <div className="section-heading">
            <div>
              <h2>Beyond Famous Destinations Lies a World of Wonders</h2>
              <strong>Uncover India&apos;s Beauty</strong>
            </div>
            <Link href="/destinations">
              All destinations <ChevronRight size={18} />
            </Link>
          </div>
          <p className="section-description">
            Explore the hidden treasures of India, from unexplored mountain
            villages and peaceful valleys to secret beaches, charming heritage
            towns and breathtaking natural landscapes. Discover destinations
            beyond the usual tourist trails and experience the beauty, culture
            and traditions of India with Travel Expertz. Every hidden
            destination has a story waiting to be discovered!
          </p>
          {displayDestinations.length > 0 ? (
            <MarqueeSlider
              className="curation-marquee"
              trackClassName="curation-marquee-track"
              ariaLabel="Beyond Famous Destinations"
              secondsPerCard={17}
            >
              {displayDestinations.map((destination, index) => {
                const { city, state, rawLocation } = parseCurationLocation(destination);
                const propertyTarget = city || state || rawLocation || destination.name;
                const cardHref = `/hotels/search?location=${encodeURIComponent(propertyTarget)}`;

                return (
                  <div
                    className="curation-card"
                    key={`${destination._id || destination.name}-${index}`}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push(cardHref)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        router.push(cardHref);
                      }
                    }}
                  >
                    {destination.image && (
                      <img
                        src={destination.image}
                        alt={destination.name || "Indian destination"}
                      />
                    )}
                    <div>
                      <span className="curation-badge">Hidden India</span>
                      <h3>{destination.name}</h3>
                      {destination.description && (
                        <p className="curation-description">
                          {destination.description.length > 120
                            ? `${destination.description.substring(0, 120)}...`
                            : destination.description}
                        </p>
                      )}
                      <CurationLocationDisplay item={destination} />
                    </div>
                  </div>
                );
              })}
            </MarqueeSlider>
          ) : (
            <p className="curation-empty">
              No hidden destinations have been added yet.
            </p>
          )}
        </section>

        <section className="home-section database-curations">
          <div className="section-heading">
            <div>
              <h2>Specially Selected Getaways</h2>
            </div>
            <Link href="/hotels">
              Explore stays <ChevronRight size={18} />
            </Link>
          </div>
          <p className="section-description">
            Discover travel experiences thoughtfully selected for every kind of
            traveller. From breathtaking mountain escapes and relaxing beach
            holidays to romantic getaways, family vacations, adventure treks and
            spiritual journeys, explore our handpicked collections designed to
            inspire your next adventure. Find the perfect trip, create beautiful
            memories and experience every destination your way with Travel
            Expertz.
          </p>
          {displayGetaways.length > 0 ? (
            <MarqueeSlider
              className="curation-marquee"
              trackClassName="curation-marquee-track"
              ariaLabel="Specially Selected Getaways"
              secondsPerCard={17}
            >
              {displayGetaways.map((property, index) => {
                const isHomestay =
                  property.propertyType === "homestay" ||
                  property.type === "homestay";
                const cardHref = isHomestay
                  ? `/homestays/${property._id}`
                  : `/hotels/${property._id}`;

                return (
                  <div
                    className="curation-card"
                    key={`${property._id || property.name}-${index}`}
                    role="button"
                    tabIndex={0}
                    style={{ cursor: "pointer" }}
                    onClick={() => router.push(cardHref)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        router.push(cardHref);
                      }
                    }}
                  >
                    {(property.image || property.images?.[0]) && (
                      <img
                        src={property.image || property.images[0]}
                        alt={property.name || "Handpicked stay"}
                      />
                    )}
                    <div>
                      <span className="curation-badge">
                        {property.propertyType || "Hotel"}
                      </span>
                      <h3>{property.name}</h3>
                      <CurationLocationDisplay item={property} />
                    </div>
                  </div>
                );
              })}
            </MarqueeSlider>
          ) : (
            <p className="curation-empty">
              No handpicked hotels or homestays have been selected yet.
            </p>
          )}
        </section>

        <section className="home-section blogs-section" id="blogs">
          <div className="section-heading">
            <div>
              <h2>Travel Stories &amp; Expert Guides</h2>
              <p className="section-subheading">
                Inspiration, destination guides and expert tips for your next journey.
              </p>
            </div>
            <Link href="/blogs">
              All blogs <ChevronRight size={18} />
            </Link>
          </div>
          <p className="section-description">
            Discover travel tips, expert guides, packing essentials, and captivating
            stories from our travel specialists to help you plan your next
            unforgettable journey.
          </p>
          {displayBlogs.length > 0 ? (
            <MarqueeSlider
              className="blogs-marquee"
              trackClassName="blogs-marquee-track"
              ariaLabel="Travel Blogs and Guides"
              secondsPerCard={17}
            >
              {displayBlogs.map((blog, index) => {
                const blogHref = blog._id ? `/blogs/${blog._id}` : `/blogs`;
                const categoryName =
                  Array.isArray(blog.categories) && blog.categories[0]
                    ? blog.categories[0]
                    : "Travel Guide";
                const cleanDesc = blog.description
                  ? blog.description.replace(/<[^>]*>/g, "")
                  : "Explore comprehensive travel guides, recommended itineraries, and insider tips from Travel Expertz.";

                return (
                  <Link
                    href={blogHref}
                    className="blog-home-card"
                    key={`${blog._id || blog.title}-${index}`}
                  >
                    <div className="blog-home-image-wrap">
                      <img
                        src={blog.image || "/hero1.jpeg"}
                        alt={blog.title || "Travel blog"}
                      />
                      <span className="blog-home-badge">{categoryName}</span>
                    </div>
                    <div className="blog-home-body">
                      {blog.date && (
                        <div className="blog-home-date">
                          <CalendarDays size={13} />
                          <span>
                            {new Date(blog.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                      )}
                      <h3>{blog.title}</h3>
                      <p>{cleanDesc}</p>
                      <span className="blog-home-cta">
                        Read Story <ArrowRight size={14} />
                      </span>
                    </div>
                  </Link>
                );
              })}
            </MarqueeSlider>
          ) : (
            <p className="curation-empty">
              No blog posts available right now. Please check back soon.
            </p>
          )}
        </section>

        <section className="final-cta">
          <div>
            <Compass size={34} />
            <span>Where to next?</span>
            <h2>Let&apos;s turn your travel dreams into plans.</h2>
            <p>
              Speak with a Travel Expertz specialist and start your journey
              today.
            </p>
          </div>
          <Link href="/packages">
            Explore packages <ArrowRight size={18} />
          </Link>
        </section>
      </main>

      {activeService && (
        <ServiceEnquiryModal
          service={activeService}
          onClose={() => setActiveService(null)}
        />
      )}

      <AddReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
      />
    </div>
  );
}
