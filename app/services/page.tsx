"use client";

import { useState } from "react";
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
    color: "#3b82f6",
  },
  {
    id: "flight" as ServiceType,
    name: "Flight Booking",
    icon: "✈️",
    description: "Book domestic and international flights with best prices",
    color: "#8b5cf6",
  },
  {
    id: "bus" as ServiceType,
    name: "Bus Tickets",
    icon: "🚌",
    description: "Book bus tickets for intercity and interstate travel",
    color: "#10b981",
  },
  {
    id: "train" as ServiceType,
    name: "Train Tickets",
    icon: "🚄",
    description: "Book train tickets with hassle-free IRCTC bookings",
    color: "#f59e0b",
  },
  {
    id: "visa" as ServiceType,
    name: "Visa Assistance",
    icon: "📋",
    description: "Complete visa application support and documentation",
    color: "#ef4444",
  },
  {
    id: "forex" as ServiceType,
    name: "Forex & Currency",
    icon: "💱",
    description: "Foreign exchange and currency services at best rates",
    color: "#06b6d4",
  },
  {
    id: "insurance" as ServiceType,
    name: "Travel Insurance",
    icon: "🛡️",
    description: "Comprehensive travel insurance for peace of mind",
    color: "#ec4899",
  },
];

export default function ServicesPage() {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(
    null,
  );

  return (
    <>
      <Header />
      <main>
        {/* Hero Section */}
        <section
          style={{
            background: "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
            color: "white",
            padding: "4rem 1rem",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "800px", margin: "0 auto" }}>
            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3rem)",
                fontWeight: 800,
                marginBottom: "1rem",
              }}
            >
              Travel Services
            </h1>
            <p style={{ fontSize: "1.125rem", opacity: 0.9 }}>
              Complete travel solutions for all your needs - flights, trains,
              buses, car rentals, visa, forex, and insurance
            </p>
          </div>
        </section>

        {/* Services Grid */}
        {!selectedService ? (
          <section
            style={{
              padding: "4rem 1rem",
              maxWidth: "1200px",
              margin: "0 auto",
            }}
          >
            <h2
              style={{
                textAlign: "center",
                fontSize: "2rem",
                fontWeight: 700,
                marginBottom: "3rem",
              }}
            >
              Choose a Service
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "2rem",
              }}
            >
              {services.map((service) => (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service.id)}
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "2rem",
                    boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    border: "2px solid transparent",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-8px)";
                    e.currentTarget.style.boxShadow =
                      "0 12px 24px rgba(0,0,0,0.15)";
                    e.currentTarget.style.borderColor = service.color;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 4px 6px rgba(0,0,0,0.1)";
                    e.currentTarget.style.borderColor = "transparent";
                  }}
                >
                  <div
                    style={{
                      fontSize: "3rem",
                      marginBottom: "1rem",
                      textAlign: "center",
                    }}
                  >
                    {service.icon}
                  </div>
                  <h3
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                      marginBottom: "0.5rem",
                      textAlign: "center",
                      color: service.color,
                    }}
                  >
                    {service.name}
                  </h3>
                  <p
                    style={{
                      color: "#6b7280",
                      textAlign: "center",
                      lineHeight: "1.6",
                    }}
                  >
                    {service.description}
                  </p>
                  <div
                    style={{
                      marginTop: "1.5rem",
                      textAlign: "center",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.5rem 1.5rem",
                        background: `${service.color}15`,
                        color: service.color,
                        borderRadius: "6px",
                        fontWeight: 600,
                        fontSize: "0.875rem",
                      }}
                    >
                      Book Now →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : (
          <section
            style={{
              padding: "3rem 1rem",
              maxWidth: "900px",
              margin: "0 auto",
            }}
          >
            <button
              onClick={() => setSelectedService(null)}
              style={{
                background: "#f3f4f6",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: 600,
                marginBottom: "2rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              ← Back to Services
            </button>
            <ServiceBookingFormEnhanced
              serviceType={selectedService}
              onClose={() => setSelectedService(null)}
            />
          </section>
        )}

        {/* Features Section */}
        {!selectedService && (
          <section style={{ background: "#f9fafb", padding: "4rem 1rem" }}>
            <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
              <h2
                style={{
                  textAlign: "center",
                  fontSize: "2rem",
                  fontWeight: 700,
                  marginBottom: "3rem",
                }}
              >
                Why Choose Our Services?
              </h2>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                  gap: "2rem",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                    ⚡
                  </div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                    }}
                  >
                    Quick Processing
                  </h3>
                  <p style={{ color: "#6b7280" }}>
                    Fast and efficient booking process
                  </p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                    💰
                  </div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                    }}
                  >
                    Best Prices
                  </h3>
                  <p style={{ color: "#6b7280" }}>
                    Competitive rates and exclusive deals
                  </p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                    🤝
                  </div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                    }}
                  >
                    24/7 Support
                  </h3>
                  <p style={{ color: "#6b7280" }}>
                    Round-the-clock customer assistance
                  </p>
                </div>
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "2.5rem", marginBottom: "1rem" }}>
                    ✅
                  </div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                    }}
                  >
                    Trusted Service
                  </h3>
                  <p style={{ color: "#6b7280" }}>
                    Thousands of satisfied customers
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
