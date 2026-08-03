"use client";

import React, { useState, useEffect, useRef } from "react";

interface Location {
  _id: string;
  name: string;
  destinationId?: string;
  type?: "state" | "city" | "hotel";
  location?: string;
}

interface LocationDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  transparent?: boolean;
}

export const LocationDropdown: React.FC<LocationDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select or type a location",
  className = "",
  transparent = false,
}) => {
  const [locations, setLocations] = useState<Location[]>([]);
  const [filteredLocations, setFilteredLocations] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch locations on mount
  useEffect(() => {
    fetchLocations();
  }, []);

  // Update input when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/locations");
      if (res.ok) {
        const data = await res.json();
        const locationArray = Array.isArray(data) ? data : [];
        console.log("Locations loaded:", locationArray.length, locationArray);
        setLocations(locationArray);
        setFilteredLocations(locationArray);
      } else {
        console.error(
          "Failed to fetch locations: ",
          res.status,
          await res.text(),
        );
      }
    } catch (error) {
      console.error("Failed to fetch locations:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    setHighlightedIndex(-1);

    if (!val.trim()) {
      // Don't show dropdown when input is empty
      setFilteredLocations([]);
      setIsOpen(false);
      return;
    }

    // Fetch with optimized search (partial matching + spell correction)
    searchLocations(val);
  };

  const searchLocations = async (searchTerm: string) => {
    try {
      const res = await fetch(
        `/api/locations?search=${encodeURIComponent(searchTerm)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setFilteredLocations(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Search error:", error);
    }
    setIsOpen(true);
  };

  const handleSelectLocation = (location: Location) => {
    setInputValue(location.name);
    onChange(location.name);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === "ArrowDown") {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < filteredLocations.length - 1 ? prev + 1 : 0,
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredLocations.length - 1,
        );
        break;
      case "Enter":
        e.preventDefault();
        if (
          highlightedIndex >= 0 &&
          highlightedIndex < filteredLocations.length
        ) {
          handleSelectLocation(filteredLocations[highlightedIndex]);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
    }
  };

  const handleFocus = () => {
    // Only show dropdown if there's already text
    if (inputValue.trim()) {
      setIsOpen(true);
    }
  };

  return (
    <div
      ref={dropdownRef}
      style={{
        position: "relative",
        width: "100%",
        display: "flex",
        alignItems: "center",
      }}
      className="location-dropdown-wrapper"
    >
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={className}
        style={{
          width: "100%",
          padding: transparent ? "0" : "0.75rem 1rem",
          borderRadius: transparent ? "0" : "8px",
          border: transparent ? "none" : "2px solid #e5e7eb",
          fontSize: "1rem",
          transition: "all 0.2s ease",
          background: transparent ? "transparent" : "#fff",
          outline: "none",
          color: "#1f2937",
        }}
        autoComplete="off"
      />

      {isOpen && (
        <div
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: "0.5rem",
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: "8px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            zIndex: 10000,
            maxHeight: "320px",
            overflowY: "auto" as const,
            minWidth: "280px",
          }}
        >
          {loading ? (
            <div
              style={{
                padding: "1.25rem",
                textAlign: "center",
                color: "#9ca3af",
              }}
            >
              <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                Searching locations...
              </div>
            </div>
          ) : filteredLocations.length === 0 ? (
            <div style={{ padding: "1.25rem", textAlign: "center" }}>
              {locations.length === 0 ? (
                <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                  <div style={{ fontWeight: 500, marginBottom: "0.5rem" }}>
                    No locations available
                  </div>
                  <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                    Add states and cities in admin panel to see them here
                  </div>
                </div>
              ) : (
                <div
                  style={{
                    color: "#9ca3af",
                    fontSize: "0.9rem",
                    fontWeight: 500,
                  }}
                >
                  No matching locations found
                </div>
              )}
            </div>
          ) : (
            filteredLocations.map((location, index) => (
              <div
                key={location._id}
                onClick={() => handleSelectLocation(location)}
                style={{
                  padding: "0.875rem 1rem",
                  cursor: "pointer",
                  background: highlightedIndex === index ? "#f0fdf4" : "#fff",
                  borderBottom:
                    index < filteredLocations.length - 1
                      ? "1px solid #f3f4f6"
                      : "none",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
                onMouseEnter={() => setHighlightedIndex(index)}
                onMouseLeave={() => setHighlightedIndex(-1)}
              >
                <div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#1f2937",
                      fontSize: "0.95rem",
                    }}
                  >
                    {location.name}
                  </div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#9ca3af",
                      marginTop: "0.25rem",
                    }}
                  >
                    {location.type === "state"
                      ? "📍 State"
                      : location.type === "city"
                        ? "🏙️ City"
                        : location.type === "hotel"
                          ? "🏨 Hotel"
                          : ""}
                  </div>
                  {location.type === "hotel" && (
                    <div
                      style={{
                        fontSize: "0.7rem",
                        color: "#6b7280",
                        marginTop: "0.3rem",
                      }}
                    >
                      {(location as any).location ||
                        ((location as any).city && (location as any).state
                          ? `${(location as any).city}, ${(location as any).state}`
                          : (location as any).city || "")}
                    </div>
                  )}
                </div>
                {highlightedIndex === index && (
                  <div style={{ color: "#059669", fontSize: "1.1rem" }}>→</div>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default LocationDropdown;
