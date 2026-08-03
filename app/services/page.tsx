"use client";

import { useState, useEffect, useRef } from "react";
import Header from "../components/Header";
import dynamic from "next/dynamic";

const ServiceBookingFormEnhanced = dynamic(
  () => import("../components/ServiceBookingFormEnhanced"),
  { ssr: false },
);

type ServiceType =
  | "car-rental"
  | "flight"
  | "bus"
  | "train"
  | "visa"
  | "forex"
  | "insurance";

const services = [
  {
    id: "car-rental" as ServiceType,
    name: "Car Rental",
    icon: "🚗",
    description:
      "Book cars for local, outstation, airport transfers, and hourly rentals",
    gradient: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
  },
  {
    id: "flight" as ServiceType,
    name: "Flight Booking",
    icon: "✈️",
    description: "Book domestic and international flights with best prices",
    gradient: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
  },
  {
    id: "bus" as ServiceType,
    name: "Bus Tickets",
    icon: "🚌",
    description: "Book bus tickets for intercity and interstate travel",
    gradient: "linear-gradient(135deg, #1e40af 0%, #60a5fa 100%)",
  },
  {
    id: "train" as ServiceType,
    name: "Train Tickets",
    icon: "🚄",
    description: "Book train tickets with hassle-free IRCTC bookings",
    gradient: "linear-gradient(135deg, #1d4ed8 0%, #93c5fd 100%)",
  },
  {
    id: "visa" as ServiceType,
    name: "Visa Assistance",
    icon: "📋",
    description: "Complete visa application support and documentation",
    gradient: "linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)",
  },
  {
    id: "forex" as ServiceType,
    name: "Forex & Currency",
    icon: "💱",
    description: "Foreign exchange and currency services at best rates",
    gradient: "linear-gradient(135deg, #0c4a6e 0%, #0ea5e9 100%)",
  },
  {
    id: "insurance" as ServiceType,
    name: "Travel Insurance",
    icon: "🛡️",
    description: "Comprehensive travel insurance for peace of mind",
    gradient: "linear-gradient(135deg, #1e40af 0%, #6366f1 100%)",
  },
];

const whyUsFeatures = [
  {
    icon: "⚡",
    title: "Lightning Fast",
    description:
      "Instant booking confirmations with real-time availability checks",
    stat: "< 2 min",
    statLabel: "Avg. Booking Time",
  },
  {
    icon: "💰",
    title: "Best Prices",
    description:
      "Price-match guarantee with exclusive deals and seasonal discounts",
    stat: "30%",
    statLabel: "Avg. Savings",
  },
  {
    icon: "🤝",
    title: "24/7 Support",
    description:
      "Round-the-clock multilingual support via chat, call, and email",
    stat: "24/7",
    statLabel: "Always Available",
  },
  {
    icon: "✅",
    title: "Trusted by Many",
    description:
      "Verified reviews and ratings from thousands of happy travelers",
    stat: "50K+",
    statLabel: "Happy Customers",
  },
];

const stats = [
  { value: "50K+", label: "Happy Travelers" },
  { value: "200+", label: "Destinations" },
  { value: "99%", label: "Satisfaction Rate" },
  { value: "24/7", label: "Customer Support" },
];

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    null,
  );
  const [visibleCards, setVisibleCards] = useState<Set<number>>(new Set());
  const [heroLoaded, setHeroLoaded] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHeroLoaded(true);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = Number(entry.target.getAttribute("data-index"));
            setVisibleCards((prev) => new Set([...prev, index]));
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -50px 0px" },
    );

    const cards = cardsRef.current?.querySelectorAll("[data-index]");
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, [selectedService]);

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(100vh) scale(0); opacity: 0; }
          10% { opacity: 0.6; }
          90% { opacity: 0.3; }
          100% { transform: translateY(-10vh) scale(1); opacity: 0; }
        }
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        @keyframes pulseGlow {
          0%, 100% { box-shadow: 0 0 20px rgba(59,130,246,0.3); }
          50% { box-shadow: 0 0 40px rgba(59,130,246,0.6); }
        }
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes rotateGlow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes waveMove {
          0% { transform: translateX(0) translateY(0); }
          50% { transform: translateX(-25px) translateY(-10px); }
          100% { transform: translateX(0) translateY(0); }
        }
        @keyframes iconBounce {
          0%, 100% { transform: scale(1) translateY(0); }
          50% { transform: scale(1.15) translateY(-6px); }
        }
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.85); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes borderRotate {
          0% { --angle: 0deg; }
          100% { --angle: 360deg; }
        }
        .svc-card {
          position: relative;
          background: #ffffff;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2.2rem 1.8rem;
          cursor: pointer;
          transition: all 0.45s cubic-bezier(0.23, 1, 0.320, 1);
          border: 1px solid #e2e8f0;
          overflow: hidden;
          isolation: isolate;
        }
        .svc-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(59,130,246,0.02), rgba(37,99,235,0.01));
          border-radius: 20px;
          z-index: -1;
          transition: all 0.45s ease;
        }
        .svc-card::after {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: conic-gradient(from 0deg, transparent 0%, rgba(59,130,246,0.04) 25%, transparent 50%);
          animation: rotateGlow 8s linear infinite;
          z-index: -2;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .svc-card:hover {
          transform: translateY(-12px) scale(1.02);
          border-color: rgba(59,130,246,0.5);
          box-shadow: 0 25px 60px rgba(59,130,246,0.12), 0 8px 24px rgba(0,0,0,0.06);
        }
        .svc-card:hover::before {
          background: linear-gradient(135deg, rgba(59,130,246,0.06), rgba(37,99,235,0.03));
        }
        .svc-card:hover::after {
          opacity: 1;
        }
        .svc-card:hover .svc-icon {
          animation: iconBounce 0.6s ease;
        }
        .svc-card:hover .svc-arrow {
          transform: translateX(6px);
          opacity: 1;
        }
        .svc-card:hover .svc-btn-glow {
          opacity: 1;
          transform: scaleX(1);
        }
        .svc-icon {
          transition: transform 0.4s ease;
        }
        .svc-arrow {
          transition: all 0.35s ease;
          opacity: 0.7;
          transform: translateX(0);
        }
        .svc-btn-glow {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: linear-gradient(90deg, transparent, #3b82f6, transparent);
          opacity: 0;
          transform: scaleX(0);
          transition: all 0.45s ease;
          border-radius: 0 0 20px 20px;
        }
        .feature-card {
          position: relative;
          background: #ffffff;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid #e2e8f0;
          border-radius: 20px;
          padding: 2rem;
          text-align: center;
          transition: all 0.4s cubic-bezier(0.23, 1, 0.320, 1);
          overflow: hidden;
        }
        .feature-card::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at 50% 0%, rgba(59,130,246,0.06) 0%, transparent 60%);
          border-radius: 20px;
          opacity: 0;
          transition: opacity 0.4s ease;
        }
        .feature-card:hover {
          transform: translateY(-8px);
          border-color: rgba(59,130,246,0.4);
          box-shadow: 0 20px 50px rgba(59,130,246,0.1), 0 8px 24px rgba(0,0,0,0.05);
        }
        .feature-card:hover::before {
          opacity: 1;
        }
        .stat-item {
          text-align: center;
          transition: all 0.3s ease;
        }
        .stat-item:hover .stat-value {
          transform: scale(1.1);
          text-shadow: 0 0 20px rgba(255,255,255,0.4);
        }
        .stat-value {
          transition: all 0.3s ease;
        }
        .back-btn {
          background: #eff6ff;
          backdrop-filter: blur(10px);
          border: 1px solid #bfdbfe;
          padding: 0.85rem 1.8rem;
          border-radius: 12px;
          cursor: pointer;
          font-weight: 600;
          font-size: 1.1rem;
          color: #2563eb;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
          margin-bottom: 2rem;
        }
        .back-btn:hover {
          background: #dbeafe;
          border-color: #93c5fd;
          transform: translateX(-4px);
          box-shadow: 0 8px 25px rgba(59,130,246,0.12);
        }
        .particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
        }
        @media (max-width: 768px) {
          .svc-grid {
            grid-template-columns: 1fr !important;
          }
          .feature-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .stats-grid {
            grid-template-columns: 1fr 1fr !important;
          }
        }
        @media (max-width: 480px) {
          .feature-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <Header solidHeader={true} />
      <main style={{ background: "#f8fafc", minHeight: "100vh" }}>
        {/* Hero Section */}
        <section
          onMouseMove={handleMouseMove}
          style={{
            position: "relative",
            background:
              "linear-gradient(160deg, #1e3a8a 0%, #1d4ed8 30%, #2563eb 60%, #1e40af 100%)",
            color: "white",
            padding: "7rem 1.5rem 5rem",
            textAlign: "center",
            overflow: "hidden",
          }}
        >
          {/* Animated gradient orbs */}
          <div
            style={{
              position: "absolute",
              top: "-20%",
              left: "-10%",
              width: "500px",
              height: "500px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.12) 0%, transparent 70%)",
              filter: "blur(60px)",
              animation: "waveMove 8s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: "-30%",
              right: "-10%",
              width: "600px",
              height: "600px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,255,255,0.08) 0%, transparent 70%)",
              filter: "blur(80px)",
              animation: "waveMove 10s ease-in-out infinite reverse",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "40%",
              left: "60%",
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(147,197,253,0.15) 0%, transparent 70%)",
              filter: "blur(50px)",
              animation: "waveMove 12s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />

          {/* Mouse-follow spotlight */}
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `radial-gradient(circle 400px at ${mousePos.x}% ${mousePos.y}%, rgba(255,255,255,0.08) 0%, transparent 100%)`,
              pointerEvents: "none",
              transition: "background 0.2s ease",
            }}
          />

          {/* Floating particles */}
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                width: `${Math.random() * 4 + 2}px`,
                height: `${Math.random() * 4 + 2}px`,
                left: `${Math.random() * 100}%`,
                background: `rgba(255, 255, 255, ${0.15 + Math.random() * 0.3})`,
                boxShadow: "0 0 6px rgba(255,255,255,0.2)",
                animation: `floatUp ${8 + Math.random() * 12}s linear infinite`,
                animationDelay: `${Math.random() * 10}s`,
              }}
            />
          ))}

          {/* Grid pattern overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
              pointerEvents: "none",
            }}
          />

          <div
            style={{
              maxWidth: "900px",
              margin: "0 auto",
              position: "relative",
              zIndex: 1,
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? "translateY(0)" : "translateY(30px)",
              transition: "all 0.8s cubic-bezier(0.23, 1, 0.320, 1)",
            }}
          >
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1.2rem",
                background: "rgba(255,255,255,0.15)",
                border: "1px solid rgba(255,255,255,0.25)",
                borderRadius: "50px",
                marginBottom: "1.5rem",
                fontSize: "1rem",
                color: "#ffffff",
                backdropFilter: "blur(10px)",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  background: "#3b82f6",
                  display: "inline-block",
                  animation: "pulseGlow 2s ease infinite",
                }}
              />
              All-in-One Travel Platform
            </div>
            <h1
              style={{
                fontSize: "clamp(2.75rem, 6vw, 4.25rem)",
                fontWeight: 800,
                marginBottom: "1.2rem",
                lineHeight: 1.1,
                letterSpacing: "-0.02em",
                background:
                  "linear-gradient(135deg, #ffffff 0%, #e0edff 50%, #bfdbfe 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Premium Travel
              <br />
              Services
            </h1>
            <p
              style={{
                fontSize: "1.3rem",
                color: "rgba(219,234,254,0.9)",
                maxWidth: "600px",
                margin: "0 auto 2.5rem",
                lineHeight: 1.7,
              }}
            >
              Your complete travel companion — from flights and trains to visa
              assistance, currency exchange, and comprehensive insurance
              coverage.
            </p>

            {/* Stats bar */}
            <div
              className="stats-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "1rem",
                maxWidth: "700px",
                margin: "0 auto",
                padding: "1.5rem 2rem",
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                borderRadius: "16px",
                border: "1px solid rgba(255,255,255,0.15)",
              }}
            >
              {stats.map((stat, i) => (
                <div key={i} className="stat-item">
                  <div
                    className="stat-value"
                    style={{
                      fontSize: "1.65rem",
                      fontWeight: 800,
                      color: "#ffffff",
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {stat.value}
                  </div>
                  <div
                    style={{
                      fontSize: "0.875rem",
                      color: "rgba(219,234,254,0.7)",
                      fontWeight: 500,
                      marginTop: "0.25rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.05em",
                    }}
                  >
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom gradient fade */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "120px",
              background: "linear-gradient(to top, #f8fafc, transparent)",
              pointerEvents: "none",
            }}
          />
        </section>

        {/* Services Grid */}
        {!selectedService ? (
          <section
            style={{
              padding: "4rem 1.5rem 5rem",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
              <h2
                style={{
                  fontSize: "clamp(2rem, 4vw, 2.75rem)",
                  fontWeight: 800,
                  color: "#0f172a",
                  marginBottom: "0.75rem",
                  letterSpacing: "-0.02em",
                }}
              >
                Choose Your Service
              </h2>
              <p
                style={{
                  color: "#64748b",
                  fontSize: "1.2rem",
                  maxWidth: "500px",
                  margin: "0 auto",
                }}
              >
                Select a service below to get started with your booking
              </p>
            </div>
            <div
              ref={cardsRef}
              className="svc-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {services.map((service, index) => (
                <div
                  key={service.id}
                  data-index={index}
                  className="svc-card"
                  onClick={() => setSelectedService(service.id)}
                  style={{
                    opacity: visibleCards.has(index) ? 1 : 0,
                    transform: visibleCards.has(index)
                      ? "translateY(0) scale(1)"
                      : "translateY(30px) scale(0.95)",
                    transition: `all 0.6s cubic-bezier(0.23, 1, 0.320, 1) ${index * 0.08}s`,
                  }}
                >
                  {/* Top gradient line */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "10%",
                      right: "10%",
                      height: "1px",
                      background:
                        "linear-gradient(90deg, transparent, rgba(59,130,246,0.3), transparent)",
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "1.2rem",
                    }}
                  >
                    {/* Icon container */}
                    <div
                      className="svc-icon"
                      style={{
                        width: "60px",
                        height: "60px",
                        borderRadius: "16px",
                        background: service.gradient,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "1.75rem",
                        flexShrink: 0,
                        boxShadow: "0 8px 25px rgba(59,130,246,0.2)",
                      }}
                    >
                      {service.icon}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3
                        style={{
                          fontSize: "1.3rem",
                          fontWeight: 700,
                          color: "#0f172a",
                          marginBottom: "0.4rem",
                          letterSpacing: "-0.01em",
                        }}
                      >
                        {service.name}
                      </h3>
                      <p
                        style={{
                          color: "#64748b",
                          fontSize: "1rem",
                          lineHeight: 1.6,
                          margin: 0,
                        }}
                      >
                        {service.description}
                      </p>
                    </div>
                  </div>

                  {/* Bottom CTA */}
                  <div
                    style={{
                      marginTop: "1.4rem",
                      paddingTop: "1.2rem",
                      borderTop: "1px solid #e2e8f0",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <span
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: 600,
                        color: "#2563eb",
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                      }}
                    >
                      Book Now
                    </span>
                    <span
                      className="svc-arrow"
                      style={{
                        fontSize: "1.25rem",
                        color: "#2563eb",
                      }}
                    >
                      →
                    </span>
                  </div>

                  {/* Bottom glow line */}
                  <div className="svc-btn-glow" />
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section
            style={{
              padding: "3rem 1.5rem",
              maxWidth: "900px",
              margin: "0 auto",
              animation: "fadeInScale 0.4s ease",
            }}
          >
            <button
              className="back-btn"
              onClick={() => setSelectedService(null)}
            >
              <svg
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
              >
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Back to Services
            </button>
            <ServiceBookingFormEnhanced
              serviceType={selectedService}
              onClose={() => setSelectedService(null)}
            />
          </section>
        )}

        {/* Why Choose Us Section */}
        {!selectedService && (
          <section
            style={{
              padding: "5rem 1.5rem",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Subtle background gradient */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                background:
                  "linear-gradient(180deg, #f8fafc 0%, #eff6ff 50%, #f8fafc 100%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                width: "600px",
                height: "600px",
                borderRadius: "50%",
                background:
                  "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
                filter: "blur(80px)",
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
              <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    padding: "0.4rem 1rem",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "50px",
                    marginBottom: "1.2rem",
                    fontSize: "0.95rem",
                    color: "#2563eb",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 600,
                  }}
                >
                  Why Travel Expertz
                </div>
                <h2
                  style={{
                    fontSize: "clamp(2rem, 4vw, 2.75rem)",
                    fontWeight: 800,
                    color: "#0f172a",
                    letterSpacing: "-0.02em",
                    marginBottom: "0.75rem",
                  }}
                >
                  Why Choose Our Services?
                </h2>
                <p
                  style={{
                    color: "#64748b",
                    fontSize: "1.2rem",
                    maxWidth: "500px",
                    margin: "0 auto",
                  }}
                >
                  We deliver excellence at every step of your journey
                </p>
              </div>

              <div
                className="feature-grid"
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "1.5rem",
                }}
              >
                {whyUsFeatures.map((feature, i) => (
                  <div key={i} className="feature-card">
                    <div
                      style={{
                        fontSize: "2.35rem",
                        marginBottom: "1rem",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: "56px",
                        height: "56px",
                        borderRadius: "14px",
                        background: "#eff6ff",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      {feature.icon}
                    </div>
                    <h3
                      style={{
                        fontSize: "1.25rem",
                        fontWeight: 700,
                        color: "#0f172a",
                        marginBottom: "0.5rem",
                      }}
                    >
                      {feature.title}
                    </h3>
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "1rem",
                        lineHeight: 1.6,
                        marginBottom: "1.2rem",
                      }}
                    >
                      {feature.description}
                    </p>
                    <div
                      style={{
                        paddingTop: "1rem",
                        borderTop: "1px solid #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "1.65rem",
                          fontWeight: 800,
                          color: "#2563eb",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {feature.stat}
                      </div>
                      <div
                        style={{
                          fontSize: "0.825rem",
                          color: "#94a3b8",
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          fontWeight: 600,
                          marginTop: "0.2rem",
                        }}
                      >
                        {feature.statLabel}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Banner */}
        {!selectedService && (
          <section style={{ padding: "0 1.5rem 5rem", position: "relative" }}>
            <div
              style={{
                maxWidth: "1000px",
                margin: "0 auto",
                padding: "3rem",
                borderRadius: "24px",
                background: "linear-gradient(135deg, #1e40af 0%, #2563eb 100%)",
                backdropFilter: "blur(20px)",
                WebkitBackdropFilter: "blur(20px)",
                border: "none",
                textAlign: "center",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Inner glow */}
              <div
                style={{
                  position: "absolute",
                  top: "-50%",
                  left: "50%",
                  transform: "translateX(-50%)",
                  width: "400px",
                  height: "400px",
                  borderRadius: "50%",
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
                  pointerEvents: "none",
                }}
              />
              <div style={{ position: "relative", zIndex: 1 }}>
                <h2
                  style={{
                    fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
                    fontWeight: 800,
                    color: "#ffffff",
                    marginBottom: "0.75rem",
                    letterSpacing: "-0.02em",
                  }}
                >
                  Ready to Start Your Journey?
                </h2>
                <p
                  style={{
                    color: "rgba(219,234,254,0.85)",
                    fontSize: "1.15rem",
                    marginBottom: "2rem",
                    maxWidth: "500px",
                    margin: "0 auto 2rem",
                  }}
                >
                  Choose any service above and book in under 2 minutes. Our team
                  is here to help you every step of the way.
                </p>
                <button
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                  style={{
                    padding: "0.9rem 2.5rem",
                    background: "#ffffff",
                    color: "#1e40af",
                    border: "none",
                    borderRadius: "12px",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.15)",
                    letterSpacing: "0.02em",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 40px rgba(0,0,0,0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 30px rgba(0,0,0,0.15)";
                  }}
                >
                  Explore Services ↑
                </button>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
