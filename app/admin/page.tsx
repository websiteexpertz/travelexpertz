"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface Stats {
  services: number;
  testimonials: number;
  faqs: number;
  packages: number;
  whyus: number;
  hotels: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    services: 0,
    testimonials: 0,
    faqs: 0,
    packages: 0,
    whyus: 0,
    hotels: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          servicesRes,
          testimonialsRes,
          faqsRes,
          packagesRes,
          whyusRes,
          hotelsRes,
        ] = await Promise.all([
          fetch("/api/services", { cache: "no-store" }),
          fetch("/api/testimonials", { cache: "no-store" }),
          fetch("/api/faqs", { cache: "no-store" }),
          fetch("/api/packages", { cache: "no-store" }),
          fetch("/api/whyus", { cache: "no-store" }),
          fetch("/api/hotels", { cache: "no-store" }),
        ]);

        const servicesData = servicesRes.ok ? await servicesRes.json() : [];
        const testimonialsData = testimonialsRes.ok
          ? await testimonialsRes.json()
          : [];
        const faqsData = faqsRes.ok ? await faqsRes.json() : [];
        const packagesData = packagesRes.ok ? await packagesRes.json() : [];
        const whyusData = whyusRes.ok ? await whyusRes.json() : [];
        const hotelsData = hotelsRes.ok ? await hotelsRes.json() : [];

        setStats({
          services: (Array.isArray(servicesData) ? servicesData : []).length,
          testimonials: (Array.isArray(testimonialsData)
            ? testimonialsData
            : []
          ).length,
          faqs: (Array.isArray(faqsData) ? faqsData : []).length,
          packages: (Array.isArray(packagesData) ? packagesData : []).length,
          whyus: (Array.isArray(whyusData) ? whyusData : []).length,
          hotels: (Array.isArray(hotelsData) ? hotelsData : []).length,
        });
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const cards = [
    {
      label: "Hotels",
      count: stats.hotels,
      href: "/admin/hotels/manage",
      color: "#0066cc",
      icon: "🏨",
    },
    {
      label: "Services",
      count: stats.services,
      href: "/admin/services",
      color: "#00b894",
      icon: "✈️",
    },
    {
      label: "Packages",
      count: stats.packages,
      href: "/admin/packages",
      color: "#6c5ce7",
      icon: "📦",
    },
    {
      label: "Testimonials",
      count: stats.testimonials,
      href: "/admin/testimonials",
      color: "#ff6b6b",
      icon: "⭐",
    },
    {
      label: "FAQs",
      count: stats.faqs,
      href: "/admin/faqs",
      color: "#ffa500",
      icon: "❓",
    },
    {
      label: "Why Us",
      count: stats.whyus,
      href: "/admin/whyus",
      color: "#e74c3c",
      icon: "💡",
    },
  ];

  return (
    <div>
      <h1
        style={{ fontSize: "1.5rem", marginBottom: "1rem", color: "#1a1a2e" }}
      >
        Admin Dashboard
      </h1>

      {loading ? (
        <p>Loading statistics...</p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
          }}
        >
          {cards.map((card) => (
            <Link
              key={card.href}
              href={card.href}
              style={{
                textDecoration: "none",
              }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "1rem",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  borderLeft: `4px solid ${card.color}`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(0, 0, 0, 0.15)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.1)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{ fontSize: "2rem", marginBottom: "0.75rem" }}>
                  {card.icon}
                </div>
                <h3
                  style={{
                    margin: "0 0 0.75rem 0",
                    color: "#1a1a2e",
                    fontSize: "0.95rem",
                  }}
                >
                  {card.label}
                </h3>
                <div
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: "bold",
                    color: card.color,
                  }}
                >
                  {card.count}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
