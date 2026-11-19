"use client";

import React from "react";

interface MapSidebarCardProps {
  pinnedCount: number;
  onOpenMap: () => void;
}

export default function MapSidebarCard({ pinnedCount, onOpenMap }: MapSidebarCardProps) {
  return (
    <div
      onClick={onOpenMap}
      role="button"
      tabIndex={0}
      style={{
        position: "relative",
        width: "100%",
        height: "145px",
        borderRadius: "16px",
        overflow: "hidden",
        marginBottom: "1.25rem",
        border: "1px solid #e2e8f0",
        cursor: "pointer",
        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.05)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.6rem",
        transition: "transform 0.15s ease, box-shadow 0.15s ease",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 6px 20px rgba(0, 0, 0, 0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "0 4px 14px rgba(0, 0, 0, 0.05)";
      }}
    >
      {/* MAP BACKGROUND GRAPHIC (Matches Reference Image 1) */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
        viewBox="0 0 320 145"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background land */}
        <rect width="320" height="145" fill="#e8eee7" />

        {/* Soft greenish / beige terrain patches */}
        <path
          d="M-20 40 Q 60 10 140 50 T 340 30 L 340 160 L -20 160 Z"
          fill="#dce8dd"
        />
        <path
          d="M40 -10 Q 180 80 280 20 L 340 -10 Z"
          fill="#e2ece0"
        />

        {/* Roads & Highways */}
        <path
          d="M-20 85 Q 120 120 220 70 T 340 100"
          stroke="#fde68a"
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M120 -20 Q 130 60 110 160"
          stroke="#fde68a"
          strokeWidth="4"
          fill="none"
        />
        <path
          d="M240 -10 Q 220 80 270 160"
          stroke="#fef3c7"
          strokeWidth="3.5"
          fill="none"
        />
        <path
          d="M-10 30 Q 140 10 330 60"
          stroke="#ffffff"
          strokeWidth="3"
          fill="none"
          strokeDasharray="4 4"
        />

        {/* Soft Pin Dots (as seen in Image 1) */}
        <circle cx="75" cy="45" r="9" fill="#0d9488" opacity="0.35" />
        <circle cx="230" cy="95" r="7.5" fill="#0d9488" opacity="0.8" />
        <circle cx="252" cy="100" r="4.5" fill="#0d9488" opacity="0.6" />
        <circle cx="138" cy="130" r="7" fill="#0d9488" opacity="0.75" />
      </svg>

      {/* CENTER FLOATING BLUE BUTTON: Show on map (Image 1) */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          display: "inline-flex",
          alignItems: "center",
          gap: "0.45rem",
          background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)",
          color: "#ffffff",
          padding: "0.6rem 1.4rem",
          borderRadius: "9999px",
          fontSize: "0.9rem",
          fontWeight: 700,
          boxShadow: "0 4px 14px rgba(37, 99, 235, 0.4)",
          userSelect: "none",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "1.15rem", color: "#ffffff" }}>
          location_on
        </span>
        <span>Show on map</span>
      </div>

      {/* WHITE PILL BADGE: 8 stays pinned (Image 1) */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          background: "rgba(255, 255, 255, 0.95)",
          backdropFilter: "blur(6px)",
          color: "#1e293b",
          padding: "0.25rem 0.85rem",
          borderRadius: "9999px",
          fontSize: "0.78rem",
          fontWeight: 700,
          boxShadow: "0 2px 6px rgba(0, 0, 0, 0.08)",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          userSelect: "none",
        }}
      >
        {pinnedCount} {pinnedCount === 1 ? "stay" : "stays"} pinned
      </div>
    </div>
  );
}
