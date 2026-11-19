"use client";

import React, { useEffect, useRef, useState } from "react";

interface HotelLocationMapProps {
  hotelName: string;
  address?: string;
  city?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  nearbyPlaces?: Array<{ name: string; distance: string }>;
}

// Fallback coordinates for major cities if hotel coords are 0/default
const CITY_COORDS: Record<string, [number, number]> = {
  jaipur: [26.9124, 75.7873],
  dehradun: [30.3165, 78.0322],
  udaipur: [24.5854, 73.7125],
  rishikesh: [30.0869, 78.2676],
  haridwar: [29.9457, 78.1642],
  nainital: [29.3803, 79.4636],
  mussoorie: [30.4598, 78.0644],
  delhi: [28.6139, 77.209],
  mumbai: [19.076, 72.8777],
  agra: [27.1767, 78.0081],
  goa: [15.2993, 74.124],
};

async function getLeaflet() {
  if (typeof window === "undefined") return null;
  const win = window as any;

  // Ensure CSS
  if (!document.getElementById("leaflet-cdn-css")) {
    const link = document.createElement("link");
    link.id = "leaflet-cdn-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }

  if (win.L && typeof win.L.map === "function") {
    return win.L;
  }
  try {
    const mod: any = await import("leaflet");
    const leafletInstance = mod?.default?.map ? mod.default : mod?.map ? mod : null;
    if (leafletInstance && typeof leafletInstance.map === "function") {
      win.L = leafletInstance;
      return leafletInstance;
    }
    return win.L || null;
  } catch (err) {
    return win.L || null;
  }
}

export default function HotelLocationMap({
  hotelName,
  address,
  city,
  location,
  latitude,
  longitude,
  nearbyPlaces,
}: HotelLocationMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [zoomLevel, setZoomLevel] = useState(14);
  const [selectedNearby, setSelectedNearby] = useState<string | null>(null);

  // Compute best coordinates
  const cityName = (city || "").toLowerCase().trim();
  const defaultCoords: [number, number] =
    latitude && longitude && latitude > 8 && latitude < 38 && longitude > 68 && longitude < 98
      ? [latitude, longitude]
      : CITY_COORDS[cityName] || [26.9124, 75.7873]; // default Jaipur

  const [coords, setCoords] = useState<[number, number]>(defaultCoords);

  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (typeof window === "undefined" || !mapContainerRef.current) return;

      const L = await getLeaflet();
      if (!L || typeof L.map !== "function") {
        setTimeout(initMap, 100);
        return;
      }

      // Clean existing instance if any
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
      if ((mapContainerRef.current as any)._leaflet_id) {
        (mapContainerRef.current as any)._leaflet_id = null;
      }

      if (!isMounted || !mapContainerRef.current) return;

      // Initialize Leaflet map
      const map = L.map(mapContainerRef.current, {
        center: coords,
        zoom: zoomLevel,
        zoomControl: false, // We place custom zoom controls or let Leaflet place bottom right
      });

      // Add OpenStreetMap tile layer (matching the reference screenshot)
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: 'Leaflet | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      // Add zoom control at bottom-right (as in the screenshot)
      L.control.zoom({ position: "bottomright" }).addTo(map);

      // Custom Teal Hotel Pin matching reference screenshot
      // Teardrop marker rotated -45deg with white inner circle
      const customPinHtml = `
        <div style="
          position: relative;
          width: 34px;
          height: 34px;
          background: #00827f;
          border: 2.5px solid #ffffff;
          border-radius: 50% 50% 50% 0;
          transform: rotate(-45deg);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        ">
          <div style="
            width: 11px;
            height: 11px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `;

      const hotelIcon = L.divIcon({
        className: "hotel-pin-custom",
        html: customPinHtml,
        iconSize: [34, 34],
        iconAnchor: [17, 34],
        popupAnchor: [0, -32],
      });

      const marker = L.marker(coords, { icon: hotelIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: inherit; font-size: 0.85rem; padding: 4px;">
          <strong style="color: #0f172a; font-size: 0.95rem; display: block; margin-bottom: 2px;">${hotelName}</strong>
          <span style="color: #64748b;">${address || location || city || ""}</span>
        </div>
      `);

      map.on("zoomend", () => {
        setZoomLevel(map.getZoom());
      });

      mapInstanceRef.current = map;
    }

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [coords]);

  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView(coords, 14, { animate: true });
      setSelectedNearby(null);
    }
  };

  const hotelSearchQuery = address || `${hotelName}, ${city || location || ""}`;
  const directionsUrl = selectedNearby
    ? `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(selectedNearby + ", " + (city || location || ""))}&destination=${encodeURIComponent(hotelSearchQuery)}`
    : `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(hotelSearchQuery)}`;

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hotelSearchQuery)}`;

  return (
    <section
      id="location"
      style={{
        background: "#ffffff",
        borderRadius: "16px",
        padding: "1.75rem",
        border: "1px solid #e5e7eb",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
      }}
    >
      {/* SECTION TITLE: Location with bottom accent underline */}
      <div style={{ marginBottom: "1.25rem" }}>
        <h2
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            color: "#0f172a",
            margin: 0,
            display: "inline-block",
            borderBottom: "3px solid #0f172a",
            paddingBottom: "4px",
            letterSpacing: "-0.02em",
          }}
        >
          Location
        </h2>
      </div>

      {/* MAP VIEW CONTAINER WITH FLOATING CONTROLS (Exact screenshot design) */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "440px",
          borderRadius: "16px",
          overflow: "hidden",
          border: "1px solid #e2e8f0",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.06)",
        }}
      >
        {/* The Leaflet Map Canvas */}
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%", zIndex: 1 }} />

        {/* TOP-RIGHT FLOATING CONTROLS (Locate, Directions, Google Maps) */}
        <div
          style={{
            position: "absolute",
            top: "14px",
            right: "14px",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          {/* 1. Recenter / Locate Button */}
          <button
            onClick={handleRecenter}
            title="Recenter on Hotel"
            style={{
              width: "38px",
              height: "38px",
              background: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
              transition: "all 0.15s ease",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.25rem", color: "#334155" }}>
              my_location
            </span>
          </button>

          {/* 2. Directions Button */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.5rem 0.95rem",
              background: "#ffffff",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              color: "#1e293b",
              fontSize: "0.85rem",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.12)",
              transition: "all 0.15s ease",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "1.1rem", color: "#00827f", transform: "rotate(45deg)" }}
            >
              navigation
            </span>
            <span>Directions</span>
          </a>

          {/* 3. Google Maps Teal Button */}
          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.35rem",
              padding: "0.5rem 1.05rem",
              background: "#00827f",
              borderRadius: "8px",
              color: "#ffffff",
              fontSize: "0.85rem",
              fontWeight: 700,
              textDecoration: "none",
              boxShadow: "0 2px 8px rgba(0, 130, 127, 0.3)",
              transition: "background 0.15s ease",
            }}
          >
            <span>Google Maps</span>
            <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
              open_in_new
            </span>
          </a>
        </div>

        {/* BOTTOM-LEFT FLOATING DARK PILL BADGE (Location, Lat/Lng, Zoom) */}
        <div
          style={{
            position: "absolute",
            bottom: "16px",
            left: "16px",
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.9)",
            backdropFilter: "blur(8px)",
            color: "#ffffff",
            padding: "0.45rem 1rem",
            borderRadius: "9999px",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontSize: "0.825rem",
            fontWeight: 600,
            boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "1.05rem", color: "#2dd4bf" }}>
            location_on
          </span>
          <span>{city ? `${city}, India` : "India"}</span>
          <span style={{ color: "#2dd4bf", fontFamily: "ui-monospace, monospace", letterSpacing: "0.3px" }}>
            {coords[0].toFixed(4)}°, {coords[1].toFixed(4)}°
          </span>
          <span style={{ color: "rgba(255,255,255,0.3)" }}>|</span>
          <span style={{ color: "#cbd5e1", fontSize: "0.775rem" }}>{zoomLevel}x</span>
        </div>
      </div>

      {/* EXACT ADDRESS ROW BELOW MAP (With teal circular pin icon) */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: "0.65rem",
          marginTop: "1.15rem",
          padding: "0.35rem 0",
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{
            color: "#00827f",
            fontSize: "1.35rem",
            marginTop: "1px",
            flexShrink: 0,
          }}
        >
          location_on
        </span>
        <span
          style={{
            fontSize: "0.95rem",
            color: "#334155",
            fontWeight: 500,
            lineHeight: 1.5,
          }}
        >
          {address || `${hotelName}, ${city || location || ""}`}
        </span>
      </div>

      {/* NEARBY TRANSIT & ATTRACTIONS (Surroundings) */}
      <div style={{ marginTop: "1.5rem", borderTop: "1px solid #f1f5f9", paddingTop: "1.25rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.85rem" }}>
          <span style={{ fontSize: "0.825rem", fontWeight: 700, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Nearby Transit & Landmarks
          </span>
          <span style={{ fontSize: "0.775rem", color: "#00827f", fontWeight: 600 }}>
            Click place to get directions
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "0.85rem" }}>
          {(nearbyPlaces && nearbyPlaces.length > 0
            ? nearbyPlaces
            : [
                { name: "City central market", distance: "1 km" },
                { name: "Railway station", distance: "2 km" },
                { name: "Airport", distance: "8 km" },
              ]
          ).map((place, idx) => {
            const isSelected = selectedNearby === place.name;
            const placeDirectionsUrl = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(place.name + ", " + (city || location || ""))}&destination=${encodeURIComponent(hotelSearchQuery)}`;
            return (
              <a
                key={idx}
                href={placeDirectionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSelectedNearby(isSelected ? null : place.name)}
                style={{
                  padding: "0.85rem 1rem",
                  background: isSelected ? "#f0fdfa" : "#f8fafc",
                  borderRadius: "10px",
                  border: isSelected ? "1.5px solid #00827f" : "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  textDecoration: "none",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? "0 2px 8px rgba(0, 130, 127, 0.15)" : "none",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                  <span
                    className="material-symbols-outlined"
                    style={{
                      color: isSelected ? "#00827f" : "#64748b",
                      fontSize: "1.2rem",
                    }}
                  >
                    near_me
                  </span>
                  <div>
                    <div style={{ fontSize: "0.875rem", fontWeight: 700, color: isSelected ? "#00827f" : "#1e293b" }}>
                      {place.name}
                    </div>
                    <div style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
                      View directions ↗
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: isSelected ? "#00827f" : "#64748b",
                    fontWeight: 700,
                    background: isSelected ? "#ccfbf1" : "#ffffff",
                    padding: "0.25rem 0.55rem",
                    borderRadius: "6px",
                    border: isSelected ? "1px solid #99f6e4" : "1px solid #e2e8f0",
                  }}
                >
                  {place.distance}
                </span>
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
