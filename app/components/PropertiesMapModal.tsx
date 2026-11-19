"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import "leaflet/dist/leaflet.css";

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

interface PropertiesMapModalProps {
  isOpen: boolean;
  onClose: () => void;
  properties: PropertyMapItem[];
}

// Well-known coordinates for Indian cities and popular travel destinations
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

// Deterministic jitter so multiple hotels in the same city don't completely overlap
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
      // Small deterministic spiral offset based on index
      const angle = index * 1.35;
      const radius = 0.012 + (index % 5) * 0.008;
      const latOffset = Math.sin(angle) * radius;
      const lngOffset = Math.cos(angle) * radius;
      return [coords[0] + latOffset, coords[1] + lngOffset];
    }
  }

  // Fallback to Northern/Central India region with jitter
  const fallbackAngle = index * 1.5;
  const fallbackRadius = 0.03 * (index + 1);
  return [26.9124 + Math.sin(fallbackAngle) * fallbackRadius, 75.7873 + Math.cos(fallbackAngle) * fallbackRadius];
}

export default function PropertiesMapModal({ isOpen, onClose, properties }: PropertiesMapModalProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersGroupRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter properties by search query
  const filteredProperties = useMemo(() => {
    if (!searchQuery.trim()) return properties;
    const q = searchQuery.toLowerCase().trim();
    return properties.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.city && p.city.toLowerCase().includes(q)) ||
        (p.location && p.location.toLowerCase().includes(q)) ||
        (p.state && p.state.toLowerCase().includes(q))
    );
  }, [properties, searchQuery]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose]);

  // Initialize and update Leaflet Map
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      if (!isOpen || !mapContainerRef.current || typeof window === "undefined") return;

      const L = await import("leaflet");

      // Inject custom leaflet popup styling overrides
      if (!document.getElementById("leaflet-custom-popup-styles")) {
        const style = document.createElement("style");
        style.id = "leaflet-custom-popup-styles";
        style.innerHTML = `
          .custom-property-leaflet-popup .leaflet-popup-content-wrapper {
            padding: 0 !important;
            border-radius: 16px !important;
            overflow: hidden !important;
            box-shadow: 0 12px 30px rgba(0, 0, 0, 0.22) !important;
            border: 1px solid #e2e8f0 !important;
          }
          .custom-property-leaflet-popup .leaflet-popup-content {
            margin: 0 !important;
            line-height: normal !important;
          }
          .custom-property-leaflet-popup .leaflet-popup-tip {
            background: #ffffff !important;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15) !important;
          }
          .custom-property-leaflet-popup a.leaflet-popup-close-button {
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
        `;
        document.head.appendChild(style);
      }

      // Initialize map instance if not exists
      if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current, {
          center: [26.9124, 75.7873],
          zoom: 6,
          zoomControl: false,
        });

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          maxZoom: 19,
          attribution: 'Leaflet | &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        L.control.zoom({ position: "bottomright" }).addTo(map);

        mapInstanceRef.current = map;
      }

      const map = mapInstanceRef.current;

      // Clear existing markers
      if (markersGroupRef.current) {
        markersGroupRef.current.clearLayers();
      } else {
        markersGroupRef.current = L.layerGroup().addTo(map);
      }

      // Dark blue navy pin matching Reference Image 2 & 3
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
          transition: transform 0.15s ease;
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
          className: "property-map-pin",
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
        }).format(hotel.price || 0);

        const categoryTag =
          hotel.propertyType || (hotel.type === "homestay" ? "Homestay" : "Boutique Stays");

        // Custom Popup Card matching Reference Image 3
        const popupContent = `
          <div style="width: 290px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
            <div style="position: relative; width: 100%; height: 135px; overflow: hidden; background: #e2e8f0;">
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
                  <span style="color: #f59e0b; font-size: 0.95rem;">★</span> ${hotel.rating ? hotel.rating.toFixed(1) : "4.8"}
                </span>
              </div>
              <h4 style="
                margin: 0 0 3px;
                font-size: 1rem;
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
                font-size: 0.8rem;
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
                  <div style="font-size: 0.65rem; color: #94a3b8; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">
                    STARTING AT
                  </div>
                  <div style="font-size: 1.15rem; font-weight: 800; color: #0f172a;">
                    ${formattedPrice}
                  </div>
                </div>
                <a
                  href="/hotels/${hotel._id || ""}"
                  style="
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    padding: 6px 18px;
                    background: #00827f;
                    color: #ffffff;
                    font-size: 0.85rem;
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

        const marker = L.marker(coords, { icon: customIcon }).addTo(markersGroupRef.current);
        marker.bindPopup(popupContent, {
          className: "custom-property-leaflet-popup",
          maxWidth: 310,
          minWidth: 290,
          closeButton: true,
        });
      });

      // Fit map bounds to show all markers
      if (markerBounds.length > 0) {
        const bounds = L.latLngBounds(markerBounds);
        map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
      }
    }

    if (isOpen) {
      // Small timeout to let DOM render
      const timer = setTimeout(() => {
        initMap();
      }, 50);
      return () => clearTimeout(timer);
    } else {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    }
  }, [isOpen, filteredProperties]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* MAP CANVAS (Full Viewport) */}
      <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden" }}>
        <div ref={mapContainerRef} style={{ width: "100%", height: "100%", zIndex: 1 }} />

        {/* TOP FLOATING SEARCH BAR (Image 2) */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 1000,
            width: "min(340px, calc(100vw - 160px))",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              background: "#ffffff",
              padding: "0.6rem 1rem",
              borderRadius: "12px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
              border: "1px solid #e2e8f0",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.2rem", color: "#64748b" }}>
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
                fontSize: "0.9rem",
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
                  display: "flex",
                  padding: 0,
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>
                  close
                </span>
              </button>
            )}
          </div>
        </div>

        {/* TOP-RIGHT FLOATING CLOSE BUTTON (Image 2) */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
            zIndex: 1000,
          }}
        >
          <button
            onClick={onClose}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.45rem",
              padding: "0.65rem 1.15rem",
              background: "#ffffff",
              border: "1px solid #cbd5e1",
              borderRadius: "12px",
              color: "#1e293b",
              fontSize: "0.875rem",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.12)",
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
            <span className="material-symbols-outlined" style={{ fontSize: "1.1rem", color: "#64748b" }}>
              close
            </span>
          </button>
        </div>

        {/* BOTTOM-LEFT FLOATING DARK PILL BADGE (Image 3) */}
        <div
          style={{
            position: "absolute",
            bottom: "24px",
            left: "24px",
            zIndex: 1000,
            background: "rgba(15, 23, 42, 0.9)",
            backdropFilter: "blur(8px)",
            color: "#ffffff",
            padding: "0.55rem 1.15rem",
            borderRadius: "9999px",
            display: "flex",
            alignItems: "center",
            gap: "0.6rem",
            fontSize: "0.85rem",
            fontWeight: 700,
            boxShadow: "0 4px 16px rgba(0, 0, 0, 0.25)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "1.1rem", color: "#2dd4bf" }}>
            location_on
          </span>
          <span>
            {filteredProperties.length} {filteredProperties.length === 1 ? "stay" : "stays"} pinned across locations
          </span>
        </div>
      </div>
    </div>
  );
}
