"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export interface ComingSoonFeature {
  title: string;
  icon: React.ReactNode;
  description?: string;
}

export interface ComingSoonServiceProps {
  title: string;
  description: string;
  statusLabel: string;
  imageSrc: string;
  imageAlt: string;
  features: ComingSoonFeature[];
  ctaLabel: string;
  ctaHref: string;
  note: string;
}

export default function ComingSoonServicePage({
  title,
  description,
  statusLabel,
  imageSrc,
  imageAlt,
  features,
  ctaLabel,
  ctaHref,
  note,
}: ComingSoonServiceProps) {
  return (
    <>
      <style>{`
        .coming-soon-wrapper {
          padding-top: calc(var(--navbar-height-desktop, 72px) + 3.5rem) !important;
        }
        @media (max-width: 1024px) {
          .coming-soon-wrapper {
            padding-top: calc(var(--navbar-height-tablet, 68px) + 3rem) !important;
          }
        }
        @media (max-width: 768px) {
          .coming-soon-wrapper {
            padding-top: calc(var(--navbar-height-mobile, 64px) + 2.5rem) !important;
          }
        }
      `}</style>
      <div
        style={{
          backgroundColor: "#0B1D31",
          color: "#ffffff",
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
        }}
        className="coming-soon-wrapper flex flex-col items-center justify-start pb-16 sm:pb-20 lg:pb-24 px-4 sm:px-6 lg:px-8"
      >
      {/* Background Decorative Ambient Glows */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          top: "-10%",
          left: "50%",
          transform: "translateX(-50%)",
          width: "700px",
          height: "400px",
          background:
            "radial-gradient(circle, rgba(12, 151, 140, 0.22) 0%, rgba(11, 29, 49, 0) 70%)",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: "5%",
          right: "5%",
          width: "500px",
          height: "350px",
          background:
            "radial-gradient(circle, rgba(14, 165, 233, 0.12) 0%, rgba(11, 29, 49, 0) 70%)",
          filter: "blur(70px)",
          pointerEvents: "none",
        }}
      />

      <div className="relative z-10 w-full max-w-5xl mx-auto flex flex-col items-center text-center">
        {/* Status Badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.65rem 1.85rem",
            borderRadius: "9999px",
            backgroundColor: "rgba(12, 151, 140, 0.22)",
            border: "1.5px solid rgba(45, 212, 191, 0.7)",
            color: "#5eead4",
            fontSize: "1.05rem",
            fontWeight: 800,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: "1.85rem",
            boxShadow:
              "0 0 30px rgba(12, 151, 140, 0.45), 0 4px 15px rgba(0, 0, 0, 0.35)",
            backdropFilter: "blur(12px)",
          }}
          className="transition-transform duration-300 hover:scale-105"
        >
          <span
            style={{
              width: "11px",
              height: "11px",
              borderRadius: "50%",
              backgroundColor: "#2dd4bf",
              boxShadow: "0 0 12px #2dd4bf, 0 0 4px #ffffff",
            }}
            className="animate-pulse"
          />
          {statusLabel}
        </div>

        {/* Main Heading */}
        <h1
          style={{
            color: "#ffffff",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            lineHeight: 1.15,
          }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl max-w-3xl"
        >
          {title}
        </h1>

        {/* Description */}
        <p
          style={{
            color: "#cbd5e1",
            lineHeight: 1.6,
          }}
          className="text-base sm:text-lg md:text-xl max-w-2xl mt-4 sm:mt-5 font-normal"
        >
          {description}
        </p>

        {/* Hero Image Presentation */}
        <div
          style={{
            position: "relative",
            width: "100%",
            borderRadius: "1.5rem",
            overflow: "hidden",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            boxShadow:
              "0 25px 60px -15px rgba(0, 0, 0, 0.65), 0 0 35px rgba(12, 151, 140, 0.15)",
            margin: "2.5rem 0 2rem",
          }}
          className="h-64 sm:h-80 md:h-96 lg:h-[440px] group"
        >
          <Image
            src={imageSrc}
            alt={imageAlt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1024px"
            style={{ objectFit: "cover" }}
            className="transition-transform duration-700 ease-out group-hover:scale-105"
          />
          {/* Subtle gradient overlay at base for contrast */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, rgba(11, 29, 49, 0.75) 0%, rgba(11, 29, 49, 0.1) 40%, transparent 100%)",
              pointerEvents: "none",
            }}
          />
        </div>

        {/* Call to Action & Supporting Note */}
        <div className="flex flex-col items-center gap-3 mt-2">
          <Link
            href={ctaHref}
            style={{
              backgroundColor: "#0C978C",
              color: "#ffffff",
              padding: "0.95rem 2.25rem",
              borderRadius: "0.75rem",
              fontWeight: 700,
              fontSize: "1.05rem",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.6rem",
              boxShadow: "0 10px 25px rgba(12, 151, 140, 0.35)",
              transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            className="hover:scale-105 active:scale-95 group cursor-pointer"
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#0a7e75";
              e.currentTarget.style.boxShadow =
                "0 14px 30px rgba(12, 151, 140, 0.5)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#0C978C";
              e.currentTarget.style.boxShadow =
                "0 10px 25px rgba(12, 151, 140, 0.35)";
            }}
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "0.875rem",
              fontWeight: 500,
              letterSpacing: "0.01em",
            }}
          >
            {note}
          </p>
        </div>

        {/* Three Compact Feature Cards */}
        <div
          style={{
            width: "100%",
            marginTop: "3rem",
            paddingTop: "2.5rem",
            borderTop: "1px solid rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6 w-full">
            {features.map((feature, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.07)",
                  borderRadius: "1.25rem",
                  padding: "1.75rem 1.5rem",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  transition: "all 0.3s ease",
                  backdropFilter: "blur(12px)",
                }}
                className="hover:-translate-y-1 hover:border-[#0C978C]/40 hover:bg-white/[0.05] group"
              >
                <div
                  style={{
                    width: "3.5rem",
                    height: "3.5rem",
                    borderRadius: "1rem",
                    backgroundColor: "rgba(12, 151, 140, 0.12)",
                    border: "1px solid rgba(12, 151, 140, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#2dd4bf",
                    marginBottom: "1rem",
                    transition: "transform 0.3s ease",
                  }}
                  className="group-hover:scale-110"
                >
                  {feature.icon}
                </div>
                <h3
                  style={{
                    color: "#ffffff",
                    fontSize: "1.125rem",
                    fontWeight: 700,
                    letterSpacing: "-0.01em",
                  }}
                >
                  {feature.title}
                </h3>
                {feature.description && (
                  <p
                    style={{
                      color: "#94a3b8",
                      fontSize: "0.85rem",
                      marginTop: "0.35rem",
                      lineHeight: 1.4,
                    }}
                  >
                    {feature.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
