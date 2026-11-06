"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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

export default function Home() {
  const [activeService, setActiveService] = useState<ServiceId | null>(null);
  const [heroImageIndex, setHeroImageIndex] = useState(0);
  const [hotels, setHotels] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [hiddenDestinations, setHiddenDestinations] = useState<any[]>([]);
  const [handpickedHotels, setHandpickedHotels] = useState<any[]>([]);
  const [handpickedHomestays, setHandpickedHomestays] = useState<any[]>([]);
  const [heroLocation, setHeroLocation] = useState("");

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
      fetch("/api/reviews?limit=4").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/destinations").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/hotels?handpicked=true").then((r) => (r.ok ? r.json() : [])),
      fetch("/api/homestays?handpicked=true").then((r) =>
        r.ok ? r.json() : [],
      ),
    ]).then(
      ([
        hotelResult,
        eventResult,
        reviewResult,
        destinationResult,
        handpickedHotelResult,
        handpickedHomestayResult,
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
            (Array.isArray(data) ? data : data.events || []).slice(0, 4),
          );
        }
        if (reviewResult.status === "fulfilled") {
          setReviews(
            Array.isArray(reviewResult.value)
              ? reviewResult.value.slice(0, 3)
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
            (Array.isArray(data) ? data : data.hotels || []).slice(0, 4),
          );
        }
        if (handpickedHomestayResult.status === "fulfilled") {
          const data = handpickedHomestayResult.value;
          setHandpickedHomestays(
            (Array.isArray(data) ? data : data.homestays || []).slice(0, 4),
          );
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
            <div className="why-marquee" aria-label="Why choose Travel Expertz">
              <div className="why-marquee-track">
                {[...whyUs, ...whyUs].map(
                  ({ icon: Icon, title, text }, index) => (
                    <article className="why-card" key={`${title}-${index}`}>
                      <Icon size={27} />
                      <h3>{title}</h3>
                      <p>{text}</p>
                    </article>
                  ),
                )}
              </div>
            </div>
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
            <div className="event-grid">
              {events.map((event) => (
                <article
                  className="event-card"
                  key={event._id || event.id || event.eventName}
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
                    <CalendarDays size={15} />
                    {event.startDate
                      ? new Date(event.startDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Date to be announced"}
                  </p>
                  <p>
                    <MapPin size={15} />
                    {[event.city, event.state].filter(Boolean).join(", ") ||
                      event.location ||
                      "India"}
                  </p>
                </article>
              ))}
            </div>
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
          </div>
          <p className="section-description">
            At Travel Expertz, our greatest reward is the happiness and
            satisfaction of our travellers. Every journey tells a story, and
            every happy traveller inspires us to do better. From memorable
            holidays and exciting adventures to seamless bookings and
            personalized travel assistance, discover what our customers have to
            say about their experiences with us.
          </p>
          <div className="testimonial-grid">
            {(reviews.length
              ? reviews
              : [
                  {
                    userName: "Aarav Mehta",
                    reviewText:
                      "Every detail was handled beautifully. Our family holiday felt effortless from takeoff to checkout.",
                    rating: 5,
                  },
                  {
                    userName: "Riya & Kabir",
                    reviewText:
                      "The team understood exactly what we wanted and found us a wonderful destination wedding venue.",
                    rating: 5,
                  },
                  {
                    userName: "Neha Sharma",
                    reviewText:
                      "Professional, responsive, and genuinely thoughtful. The whole trip felt personal and very well planned.",
                    rating: 5,
                  },
                ]
            ).map((review, index) => (
              <article key={review._id || review.userName || index}>
                <div className="stars">{"★".repeat(review.rating || 5)}</div>
                <blockquote>“{review.reviewText || review.text}”</blockquote>
                <p>{review.userName || review.name}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="home-section database-curations">
          <div className="section-heading">
            <div>
              <h2>Beyond Famous Destinations Lies a World of Wonders</h2>
              <strong>Uncover India&apos;s Beauty</strong>
            </div>
          </div>
          <p className="section-description">
            Explore the hidden treasures of India, from unexplored mountain
            villages and peaceful valleys to secret beaches, charming heritage
            towns and breathtaking natural landscapes. Discover destinations
            beyond the usual tourist trails and experience the beauty, culture
            and traditions of India with Travel Expertz. Every hidden
            destination has a story waiting to be discovered!
          </p>
          {hiddenDestinations.length > 0 ? (
            <div className="curation-grid">
              {hiddenDestinations.slice(0, 6).map((destination, index) => (
                <Link
                  href="/destinations"
                  className="curation-card"
                  key={
                    destination._id ||
                    destination.id ||
                    destination.name ||
                    index
                  }
                >
                  {destination.image && (
                    <img
                      src={destination.image}
                      alt={destination.name || "Indian destination"}
                    />
                  )}
                  <div>
                    <span>Hidden India</span>
                    <h3>{destination.name}</h3>
                    {destination.state && <p>{destination.state}</p>}
                  </div>
                </Link>
              ))}
            </div>
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
          {[...handpickedHotels, ...handpickedHomestays].length > 0 ? (
            <div className="curation-grid">
              {[...handpickedHotels, ...handpickedHomestays]
                .slice(0, 6)
                .map((property, index) => (
                  <Link
                    href={
                      property.propertyType === "homestay" ||
                      property.type === "homestay"
                        ? `/homestays/${property._id}`
                        : `/hotels/${property._id}`
                    }
                    className="curation-card"
                    key={property._id || property.id || property.name || index}
                  >
                    {(property.image || property.images?.[0]) && (
                      <img
                        src={property.image || property.images[0]}
                        alt={property.name || "Handpicked stay"}
                      />
                    )}
                    <div>
                      <span>{property.propertyType || "Hotel"}</span>
                      <h3>{property.name}</h3>
                      {(property.location || property.city) && (
                        <p>{property.location || property.city}</p>
                      )}
                    </div>
                  </Link>
                ))}
            </div>
          ) : (
            <p className="curation-empty">
              No handpicked hotels or homestays have been selected yet.
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
    </div>
  );
}
