"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";

export interface PropertyMapItem {
  _id?: string;
  name: string;
  location: string;
  city?: string;
  state?: string;
  price: number;
  rating: number;
  reviews?: number;
  image?: string;
  images?: string[];
  propertyType?: string;
  type?: string;
  latitude?: number;
  longitude?: number;
}

interface InlinePropertiesMapProps {
  properties: PropertyMapItem[];
  onClose: () => void;
}

const CITY_COORDINATES: Record<string, [number, number]> = {
  dehradun: [30.3165, 78.0322],
  mussoorie: [30.4598, 78.0644],
  rishikesh: [30.0869, 78.2676],
  haridwar: [29.9457, 78.1642],
  nainital: [29.3803, 79.4636],
  jaipur: [26.9124, 75.7873],
  udaipur: [24.5854, 73.7125],
  jodhpur: [26.2389, 73.0243],
  jaisalmer: [26.9157, 70.9083],
  delhi: [28.6139, 77.209],
  mumbai: [19.076, 72.8777],
  agra: [27.1767, 78.0081],
  goa: [15.2993, 74.124],
  shimla: [31.1048, 77.1734],
  manali: [32.2432, 77.1892],
  dharamshala: [32.219, 76.3234],
  bengaluru: [12.9716, 77.5946],
  hyderabad: [17.385, 78.4867],
  chennai: [13.0827, 80.2707],
  kolkata: [22.5726, 88.3639],
  kerala: [10.8505, 76.2711],
  kochi: [9.9312, 76.2673],
  munnar: [10.0889, 77.0595],
  alleppey: [9.4981, 76.3388],
  varanasi: [25.3176, 82.9739],
  amritsar: [31.634, 74.8723],
  uttarakhand: [30.0668, 79.0193],
  rajasthan: [27.0238, 74.2179],
};

function getHotelCoordinates(hotel: PropertyMapItem, index: number): [number, number] {
  if (
    hotel.latitude &&
    hotel.longitude &&
    hotel.latitude > 8 &&
    hotel.latitude < 38 &&
    hotel.longitude > 68 &&
    hotel.longitude < 98
  ) {
    return [hotel.latitude, hotel.longitude];
  }

  const query = `${hotel.city || ""} ${hotel.state || ""} ${hotel.location || ""}`.toLowerCase();

  for (const [key, coords] of Object.entries(CITY_COORDINATES)) {
    if (query.includes(key)) {
      const angle = index * 1.35;
      const radius = 0.012 + (index % 5) * 0.008;
      return [coords[0] + Math.sin(angle) * radius, coords[1] + Math.cos(angle) * radius];
    }
  }

  const fallbackAngle = index * 1.5;
  const fallbackRadius = 0.03 * (index + 1);
  return [26.9124 + Math.sin(fallbackAngle) * fallbackRadius, 75.7873 + Math.cos(fallbackAngle) * fallbackRadius];
}

async function getLeafletInstance(): Promise<any> {
  if (typeof window === "undefined") return null;
  const win = window as any;

  // Ensure Leaflet CSS
  if (!document.getElementById("leaflet-cdn-css")) {
    const link = document.createElement("link");
    link.id = "leaflet-cdn-css";
    link.rel = "stylesheet";
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
    document.head.appendChild(link);
  }

  // Ensure base leaflet positioning styles so tiles/panes never collapse
  if (!document.getElementById("leaflet-base-inline-css")) {
    const baseStyle = document.createElement("style");
    baseStyle.id = "leaflet-base-inline-css";
    baseStyle.innerHTML = `
      .leaflet-pane, .leaflet-tile, .leaflet-marker-icon, .leaflet-marker-shadow,
      .leaflet-tile-container, .leaflet-pane > svg, .leaflet-pane > canvas,
      .leaflet-zoom-box, .leaflet-image-layer, .leaflet-layer {
        position: absolute; left: 0; top: 0;
      }
      .leaflet-container {
        overflow: hidden;
        position: relative;
        -webkit-tap-highlight-color: transparent;
        width: 100%;
        height: 100%;
      }
      .leaflet-tile {
        user-select: none;
        -webkit-user-select: none;
      }
      .leaflet-tile-loaded {
        opacity: 1;
      }
    `;
    document.head.appendChild(baseStyle);
  }

  if (win.L && typeof win.L.map === "function") {
    return win.L;
  }

  try {
    const mod: any = await import("leaflet");
    const L = mod?.default?.map ? mod.default : mod?.map ? mod : win.L;
    if (L && typeof L.map === "function") {
      win.L = L;
      return L;
    }
    return win.L || null;
  } catch (err) {
    console.error("Failed to load Leaflet:", err);
    return (window as any).L || null;
  }
}

export default function InlinePropertiesMap({ properties, onClose }: InlinePropertiesMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return properties;
    const q = searchQuery.toLowerCase().trim();
    return properties.filter(
      (p) =>
        (p.name && p.name.toLowerCase().includes(q)) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.state && p.state.toLowerCase().includes(q))
    );
  }, [properties, searchQuery]);

  useEffect(() => {
    let isMounted = true;
    let resizeObserver: ResizeObserver | null = null;

    async function initMap() {
      if (!mapContainerRef.current || typeof window === "undefined") return;

      const L = await getLeafletInstance();
      if (!L || typeof L.map !== "function" || !isMounted || !mapContainerRef.current) return;

      // Inject custom popup styling once
      if (!document.getElementById("leaflet-inline-popup-styles")) {
        const style = document.createElement("style");
        style.id = "leaflet-inline-popup-styles";
        style.innerHTML = `
          .custom-inline-leaflet-popup .leaflet-popup-content-wrapper {
            padding: 0 !important;
            border-radius: 16px !important;
            overflow: hidden !important;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22) !important;
            border: 1px solid #e2e8f0 !important;
          }
          .custom-inline-leaflet-popup .leaflet-popup-content {
            margin: 0 !important;
            line-height: normal !important;
          }
          .custom-inline-leaflet-popup .leaflet-popup-tip {
            background: #ffffff !important;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15) !important;
          }
          .custom-inline-leaflet-popup a.leaflet-popup-close-button {
            top: 8px !important;
            right: 8px !important;
            color: #ffffff !important;
            background: rgba(0, 0, 0, 0.45) !important;
            border-radius: 50% !important;
            width: 24px !important;
            height: 24px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 14px !important;
            border: 1px solid rgba(255, 255, 255, 0.3) !important;
          }
          .custom-inline-leaflet-popup a.leaflet-popup-close-button:hover {
            background: rgba(0, 0, 0, 0.7) !important;
          }
        `;
        document.head.appendChild(style);
      }

      // Initialize map instance if not already created
      if (!mapInstanceRef.current) {
        if ((mapContainerRef.current as any)._leaflet_id) {
          (mapContainerRef.current as any)._leaflet_id = null;
        }

        const map = L.map(mapContainerRef.current, {
          center: [20.5937, 78.9629],
          zoom: 5,
          zoomControl: false,
          scrollWheelZoom: true,
        });

        // High quality CartoDB Voyager tiles matching HolidayExpertz aesthetic
        L.tileLayer(
          "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
          {
            maxZoom: 19,
            subdomains: "abcd",
            attribution: '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
          }
        ).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        markersGroupRef.current = L.layerGroup().addTo(map);
        mapInstanceRef.current = map;
        setIsLoading(false);

        // Keep map properly sized during grid/window changes
        if (typeof ResizeObserver !== "undefined") {
          resizeObserver = new ResizeObserver(() => {
            if (mapInstanceRef.current) {
              mapInstanceRef.current.invalidateSize();
            }
          });
          resizeObserver.observe(mapContainerRef.current);
        }
      }

      const map = mapInstanceRef.current;
      if (!map) return;

      // Invalidate size immediately
      map.invalidateSize();

      // Clear existing markers
      if (markersGroupRef.current) {
        markersGroupRef.current.clearLayers();
      }

      // Exact teardrop navy pin matching HolidayExpertz design
      const pinHtml = `
        <div style="
          position: relative;
          width: 32px;
          height: 32px;
          background: #1e3a8a;
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
            width: 10px;
            height: 10px;
            background: #ffffff;
            border-radius: 50%;
            transform: rotate(45deg);
          "></div>
        </div>
      `;

      const markerBounds: [number, number][] = [];

      filteredProperties.forEach((hotel, idx) => {
        const coords = getHotelCoordinates(hotel, idx);
        markerBounds.push(coords);

        const customIcon = L.divIcon({
          className: "inline-property-pin",
          html: pinHtml,
          iconSize: [32, 32],
          iconAnchor: [16, 32],
          popupAnchor: [0, -32],
        });

        const imageSrc =
          hotel.image ||
          (hotel.images && hotel.images[0]) ||
          "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop";

        const formattedPrice = new Intl.NumberFormat("en-IN", {
          style: "currency",
          currency: "INR",
          maximumFractionDigits: 0,
        }).format(Number(hotel.price) || 0);

        const categoryTag =
          hotel.propertyType || (hotel.type === "homestay" ? "Homestay" : "Boutique Stays");

        const ratingVal = Number(hotel.rating) > 0 ? Number(hotel.rating).toFixed(1) : "4.8";

        const popupContent = `
          <div style="width: 280px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="position: relative; width: 100%; height: 130px; overflow: hidden; background: #e2e8f0;">
              <img
                src="${imageSrc}"
                alt="${hotel.name}"
                style="width: 100%; height: 100%; object-fit: cover; display: block;"
                onerror="this.src='https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&auto=format&fit=crop'"
              />
            </div>
            <div style="padding: 12px 14px 14px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
                <span style="
                  background: #ecfdf5;
                  color: #065f46;
                  font-size: 0.72rem;
                  font-weight: 700;
                  padding: 2px 8px;
                  border-radius: 9999px;
                  border: 1px solid #a7f3d0;
                ">
                  ${categoryTag}
                </span>
                <span style="font-size: 0.85rem; font-weight: 700; color: #0f172a; display: flex; align-items: center; gap: 2px;">
                  <span style="color: #f59e0b; font-size: 0.95rem;">★</span> ${ratingVal}
                </span>
              </div>
              <h4 style="
                margin: 0 0 3px;
                font-size: 0.975rem;
                font-weight: 800;
                color: #0f172a;
                line-height: 1.3;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              ">
                ${hotel.name}
              </h4>
              <p style="
                margin: 0 0 10px;
                font-size: 0.78rem;
                color: #64748b;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              ">
                ${hotel.city ? `${hotel.city}, India` : hotel.location || "India"}
              </p>
              <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-top: 1px solid #f1f5f9;
                padding-top: 8px;
              ">
                <div>
                  <div style="font-size: 0.62rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                    STARTING AT
                  </div>
                  <div style="font-size: 1.1rem; font-weight: 800; color: #0f172a;">
                    ${formattedPrice}
                  </div>
                </div>
                <a
                  href="/hotels/${hotel._id || ""}"
                  style="
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 5px 16px;
                    background: #00827f;
                    color: #ffffff;
                    font-size: 0.825rem;
                    font-weight: 700;
                    border-radius: 8px;
                    text-decoration: none;
                    box-shadow: 0 2px 6px rgba(0, 130, 127, 0.3);
                  "
                >
                  View
                </a>
              </div>
            </div>
          </div>
        `;

        if (markersGroupRef.current) {
          const marker = L.marker(coords, { icon: customIcon }).addTo(markersGroupRef.current);
          marker.bindPopup(popupContent, {
            className: "custom-inline-leaflet-popup",
            maxWidth: 300,
            minWidth: 280,
            closeButton: true,
          });
        }
      });

      if (markerBounds.length > 0) {
        try {
          const bounds = L.latLngBounds(markerBounds);
          map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
        } catch (e) {
          map.setView([20.5937, 78.9629], 5);
        }
      } else {
        map.setView([20.5937, 78.9629], 5);
      }

      // Ensure proper layout rendering
      setTimeout(() => map && map.invalidateSize(), 50);
      setTimeout(() => map && map.invalidateSize(), 200);
      setTimeout(() => map && map.invalidateSize(), 500);
    }

    initMap();

    return () => {
      isMounted = false;
      if (resizeObserver && mapContainerRef.current) {
        resizeObserver.disconnect();
      }
    };
  }, [filteredProperties]);

  // Cleanup map instance on component destruction
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch (e) {}
        mapInstanceRef.current = null;
      }
    };
  }, []);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        minHeight: "560px",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Loading Placeholder */}
      {isLoading && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#f8fafc",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            zIndex: 10,
            color: "#64748b",
            fontSize: "0.9rem",
            fontWeight: 600,
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "2rem", color: "#0066cc" }}>
            map
          </span>
          <span>Loading interactive map...</span>
        </div>
      )}

      {/* Map Canvas */}
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "100%",
          minHeight: "560px",
          zIndex: 1,
          flex: 1,
        }}
      />

      {/* TOP-LEFT FLOATING SEARCH (Matches HolidayExpertz Reference) */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          left: "14px",
          zIndex: 1000,
          width: "min(280px, calc(100% - 150px))",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.45rem",
            background: "#ffffff",
            padding: "0.5rem 0.85rem",
            borderRadius: "10px",
            boxShadow: "0 3px 12px rgba(0, 0, 0, 0.12)",
            border: "1px solid #e2e8f0",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "1.1rem", color: "#64748b" }}>
            search
          </span>
          <input
            type="text"
            placeholder="Search on map..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              border: "none",
              outline: "none",
              fontSize: "0.85rem",
              color: "#1e293b",
              background: "transparent",
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: 0,
                display: "flex",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>
                close
              </span>
            </button>
          )}
        </div>
      </div>

      {/* TOP-RIGHT FLOATING CLOSE BUTTON (Matches HolidayExpertz Reference) */}
      <div
        style={{
          position: "absolute",
          top: "14px",
          right: "14px",
          zIndex: 1000,
        }}
      >
        <button
          onClick={onClose}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.35rem",
            padding: "0.5rem 0.95rem",
            background: "#ffffff",
            border: "1px solid #cbd5e1",
            borderRadius: "10px",
            color: "#1e293b",
            fontSize: "0.825rem",
            fontWeight: 700,
            cursor: "pointer",
            boxShadow: "0 3px 12px rgba(0, 0, 0, 0.12)",
            transition: "all 0.15s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "#f8fafc";
            e.currentTarget.style.borderColor = "#94a3b8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "#ffffff";
            e.currentTarget.style.borderColor = "#cbd5e1";
          }}
        >
          <span>Close map</span>
          <span className="material-symbols-outlined" style={{ fontSize: "1rem", color: "#64748b" }}>
            close
          </span>
        </button>
      </div>

      {/* BOTTOM-LEFT FLOATING DARK PILL BADGE */}
      <div
        style={{
          position: "absolute",
          bottom: "16px",
          left: "16px",
          zIndex: 1000,
          background: "rgba(15, 23, 42, 0.9)",
          backdropFilter: "blur(6px)",
          color: "#ffffff",
          padding: "0.45rem 0.95rem",
          borderRadius: "9999px",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.8rem",
          fontWeight: 700,
          boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "1rem", color: "#2dd4bf" }}>
          location_on
        </span>
        <span>
          {filteredProperties.length} {filteredProperties.length === 1 ? "stay" : "stays"} pinned
        </span>
      </div>
    </div>
  );
}
