"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import styles from "./LocationDropdown.module.css";

interface Location {
  _id: string;
  name: string;
  displayName?: string;
  destinationId?: string;
  type?: "state" | "city" | "hotel" | "homestay" | "area" | "location";
  area?: string;
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  source?: string;
  staysCount?: number;
}

interface LocationDropdownProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  transparent?: boolean;
  inputId?: string;
  required?: boolean;
  maxLength?: number;
  providerOnly?: boolean;
  variant?: "default" | "cab" | "hero";
}

export const LocationDropdown: React.FC<LocationDropdownProps> = ({
  value,
  onChange,
  placeholder = "Select or type a location",
  className = "",
  transparent = false,
  inputId,
  required = false,
  maxLength,
  providerOnly = false,
  variant = "default",
}) => {
  const generatedId = useId();
  const id = inputId ?? `location-${generatedId}`;
  const listboxId = `${id}-suggestions`;
  const [locations, setLocations] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [inputValue, setInputValue] = useState(value);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const locationsCacheRef = useRef(new Map<string, Location[]>());
  const lastClickRef = useRef<{ id: string; time: number } | null>(null);
  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
    };
  }, []);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  useEffect(() => {
    const query = inputValue.trim();
    if (!isOpen || query.length < 1) {
      setLocations([]);
      setLoading(false);
      setError("");
      return;
    }

    const cacheKey = `${providerOnly ? "provider:" : "all:"}${query.toLocaleLowerCase()}`;
    const cachedLocations = locationsCacheRef.current.get(cacheKey);
    if (cachedLocations) {
      setLocations(cachedLocations);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timeout = window.setTimeout(async () => {
      try {
        const url = `/api/locations?search=${encodeURIComponent(query)}${providerOnly ? "&source=photon" : ""}`;
        const response = await fetch(url, { signal: controller.signal });
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Location suggestions could not be loaded.",
          );
        }
        const results: Location[] = Array.isArray(data) ? data : [];
        locationsCacheRef.current.set(cacheKey, results);
        if (locationsCacheRef.current.size > 50) {
          const oldestCacheKey = locationsCacheRef.current.keys().next().value;
          if (oldestCacheKey) locationsCacheRef.current.delete(oldestCacheKey);
        }
        setLocations(results);
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        setLocations([]);
        setError(
          fetchError instanceof Error
            ? fetchError.message
            : "Location suggestions could not be loaded.",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 80);

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [inputValue, isOpen, providerOnly]);

  useEffect(() => {
    if (highlightedIndex < 0) return;
    document
      .getElementById(`${listboxId}-option-${highlightedIndex}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [highlightedIndex, listboxId]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const nextValue = event.target.value;
    setInputValue(nextValue);
    setHighlightedIndex(-1);
    setIsOpen(nextValue.trim().length >= 1);
    onChange(nextValue);
  };

  /**
   * Builds the secondary context flow: Area - City - State - Country
   * Ensuring no duplicates of location.name are shown.
   */
  const getContext = (location: Location) => {
    // If displayName already has the full formatted flow "Name, Context..."
    if (location.displayName) {
      const parts = location.displayName.split(",").map((p) => p.trim());
      if (
        parts.length > 1 &&
        parts[0].toLowerCase() === location.name.trim().toLowerCase()
      ) {
        return parts.slice(1).join(", ");
      }
    }

    const parts: string[] = [];
    const nameLower = (location.name || "").trim().toLowerCase();

    // 1. Area / Locality (if different from name)
    const area = (
      location.area ||
      (location.type !== "area" ? location.location : "") ||
      ""
    ).trim();
    if (
      area &&
      area.toLowerCase() !== nameLower &&
      !parts.some((p) => p.toLowerCase() === area.toLowerCase())
    ) {
      parts.push(area);
    }

    // 2. City (if different from name and area)
    const city = (location.city || "").trim();
    if (
      city &&
      city.toLowerCase() !== nameLower &&
      !parts.some((p) => p.toLowerCase() === city.toLowerCase())
    ) {
      parts.push(city);
    }

    // 3. State (if different from name, area, and city)
    const state = (location.state || "").trim();
    if (
      state &&
      state.toLowerCase() !== nameLower &&
      !parts.some((p) => p.toLowerCase() === state.toLowerCase())
    ) {
      parts.push(state);
    }

    // 4. Country
    const country = (location.country || "India").trim();
    if (
      country &&
      country.toLowerCase() !== nameLower &&
      !parts.some((p) => p.toLowerCase() === country.toLowerCase())
    ) {
      parts.push(country);
    }

    return parts.join(", ");
  };

  const openPropertyPage = (location: Location, selectedValue: string) => {
    if (
      location.type === "hotel" &&
      location._id &&
      !String(location._id).startsWith("seed:")
    ) {
      window.location.href = `/hotels/${location._id}`;
      return;
    }
    if (
      location.type === "homestay" &&
      location._id &&
      !String(location._id).startsWith("seed:")
    ) {
      window.location.href = `/homestays/${location._id}`;
      return;
    }

    // Destination (city, state, area, or seed destination): open property search page for that destination
    const locQuery = location.city || location.name || selectedValue;
    window.location.href = `/hotels/search?location=${encodeURIComponent(locQuery)}`;
  };

  /**
   * 1 Click = Select destination into the search input
   * 2 Clicks / Twice = Open the property page for that destination
   */
  const selectOrOpenLocation = (location: Location) => {
    const context = getContext(location);
    const selectedValue =
      location.displayName ||
      (context ? `${location.name}, ${context}` : location.name);

    const locId = String(location._id || location.name);
    const now = Date.now();
    const isDouble =
      (lastClickRef.current &&
        lastClickRef.current.id === locId &&
        now - lastClickRef.current.time < 600) ||
      inputValue.trim().toLowerCase() === selectedValue.trim().toLowerCase();

    if (isDouble) {
      // 2nd click or double click -> Open property page for this destination
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      lastClickRef.current = null;
      setIsOpen(false);
      openPropertyPage(location, selectedValue);
    } else {
      // 1st click -> Select destination
      lastClickRef.current = { id: locId, time: now };
      setInputValue(selectedValue);
      onChange(selectedValue);
      setHighlightedIndex(-1);

      // Keep dropdown responsive for a second click before closing
      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
      clickTimerRef.current = setTimeout(() => {
        setIsOpen(false);
      }, 450);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (isOpen) {
        event.preventDefault();
        setIsOpen(false);
        setHighlightedIndex(-1);
      }
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      if (locations.length === 0) return;
      setHighlightedIndex((current) => {
        if (event.key === "ArrowDown") {
          return current < locations.length - 1 ? current + 1 : 0;
        }
        return current > 0 ? current - 1 : locations.length - 1;
      });
      return;
    }

    if (event.key === "Enter" && isOpen) {
      if (highlightedIndex >= 0 && locations[highlightedIndex]) {
        event.preventDefault();
        selectOrOpenLocation(locations[highlightedIndex]);
      } else if (loading || locations.length > 0) {
        event.preventDefault();
      }
    }
  };

  return (
    <div
      ref={dropdownRef}
      className={`${styles.wrapper} location-dropdown-wrapper${isOpen ? ` ${styles.open}` : ""}${variant === "cab" ? ` ${styles.cabVariant}` : ""}${variant === "hero" ? ` ${styles.heroVariant}` : ""}`}
      style={{ position: "relative" }}
    >
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={inputValue}
        required={required}
        maxLength={maxLength}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (inputValue.trim().length >= 1) {
            setIsOpen(true);
          }
        }}
        onBlur={() => {
          window.setTimeout(() => setIsOpen(false), 150);
        }}
        placeholder={placeholder}
        className={`${styles.input} ${className}${transparent ? ` ${styles.transparent}` : ""}`}
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-controls={listboxId}
        aria-activedescendant={
          highlightedIndex >= 0
            ? `${listboxId}-option-${highlightedIndex}`
            : undefined
        }
        autoComplete="off"
        style={{ paddingRight: inputValue ? "28px" : undefined }}
      />

      {/* Clear Button (×) matching reference screenshot */}
      {inputValue && (
        <button
          type="button"
          tabIndex={-1}
          onClick={(e) => {
            e.stopPropagation();
            setInputValue("");
            onChange("");
            setIsOpen(false);
            setLocations([]);
            inputRef.current?.focus();
          }}
          style={{
            position: "absolute",
            right: "8px",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: "#94a3b8",
            cursor: "pointer",
            padding: "4px 6px",
            fontSize: "1.2rem",
            lineHeight: 1,
            zIndex: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          aria-label="Clear destination"
        >
          ×
        </button>
      )}

      {isOpen && (
        <div
          className={styles.popover}
          style={{
            borderRadius: "16px",
            boxShadow: "0 18px 45px rgba(15,23,42,0.18)",
            border: "1px solid #e2e8f0",
            overflow: "hidden",
            width: "max(100%, 360px)",
            zIndex: 100030,
          }}
        >
          {/* Header matching reference image: DESTINATIONS & PROPERTIES  X found */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "0.75rem 1rem 0.5rem",
              borderBottom: "1px solid #f1f5f9",
              fontSize: "0.72rem",
              fontWeight: 800,
              letterSpacing: "0.06em",
              color: "#64748b",
              textTransform: "uppercase",
            }}
          >
            <span>DESTINATIONS &amp; PROPERTIES</span>
            <span style={{ color: "#0066cc", fontWeight: 700 }}>
              {locations.length > 0 ? `${locations.length} found` : ""}
            </span>
          </div>

          <div
            id={listboxId}
            className={styles.suggestions}
            role="listbox"
            aria-busy={loading}
            aria-label="Location suggestions"
          >
            {loading ? (
              <div className={styles.message} role="status">
                <span className={styles.spinner} aria-hidden="true" />
                Searching destinations &amp; properties...
              </div>
            ) : error ? (
              <div className={styles.message} role="status">
                {error} You can continue with the location you entered.
              </div>
            ) : locations.length === 0 ? (
              <div className={styles.message} role="status">
                No matching destinations or properties found.
              </div>
            ) : (
              locations.map((location, index) => {
                const context = getContext(location);
                const isDestination =
                  location.type === "city" || location.type === "state";
                return (
                  <button
                    key={location._id || `${location.name}-${index}`}
                    id={`${listboxId}-option-${index}`}
                    type="button"
                    tabIndex={-1}
                    className={`${styles.option}${highlightedIndex === index ? ` ${styles.highlighted}` : ""}`}
                    role="option"
                    aria-selected={highlightedIndex === index}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => selectOrOpenLocation(location)}
                    onDoubleClick={(e) => {
                      e.preventDefault();
                      if (clickTimerRef.current) clearTimeout(clickTimerRef.current);
                      const context = getContext(location);
                      const selectedValue =
                        location.displayName ||
                        (context ? `${location.name}, ${context}` : location.name);
                      setIsOpen(false);
                      openPropertyPage(location, selectedValue);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      width: "100%",
                      padding: "0.75rem 1rem",
                      border: "none",
                      borderBottom:
                        index < locations.length - 1
                          ? "1px solid #f8fafc"
                          : "none",
                      background:
                        highlightedIndex === index ? "#f0f7ff" : "transparent",
                      textAlign: "left",
                      cursor: "pointer",
                      gap: "0.85rem",
                      transition: "background 0.15s ease",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.85rem",
                        minWidth: 0,
                        flex: 1,
                      }}
                    >
                      {/* Left icon matching reference */}
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: isDestination ? "10px" : "50%",
                          background: isDestination ? "#0066cc" : "#eff6ff",
                          color: isDestination ? "#ffffff" : "#0066cc",
                          border: isDestination ? "none" : "1px solid #bfdbfe",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                          boxShadow: isDestination
                            ? "0 2px 6px rgba(0,102,204,0.25)"
                            : "none",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "1.25rem" }}
                        >
                          location_on
                        </span>
                      </div>

                      {/* Middle: Bold Name + flow (, Area, City, State, Country) */}
                      <div
                        style={{
                          minWidth: 0,
                          flex: 1,
                          display: "flex",
                          alignItems: "baseline",
                          flexWrap: "wrap",
                          columnGap: "0.3rem",
                          rowGap: "0.1rem",
                        }}
                      >
                        <span
                          style={{
                            fontWeight: 800,
                            fontSize: "0.95rem",
                            color: "#0f172a",
                          }}
                        >
                          {location.name}
                        </span>
                        {context && (
                          <span
                            style={{
                              fontSize: "0.85rem",
                              color: "#64748b",
                              fontWeight: 500,
                            }}
                          >
                            , {context}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Right side: Stays badge and Chevron > */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        flexShrink: 0,
                      }}
                    >
                      {location.staysCount ? (
                        <span
                          style={{
                            background: "#eff6ff",
                            color: "#0066cc",
                            border: "1px solid #bfdbfe",
                            padding: "0.2rem 0.6rem",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                          }}
                        >
                          {location.staysCount} stay
                          {location.staysCount > 1 ? "s" : ""}
                        </span>
                      ) : null}
                      <span
                        style={{
                          color: "#94a3b8",
                          fontSize: "1.1rem",
                          fontWeight: 700,
                        }}
                      >
                        ›
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
          {locations.some((location) => location.source === "photon") && (
            <div className={styles.attribution}>
              Location data ©{" "}
              <a
                href="https://www.openstreetmap.org/copyright"
                target="_blank"
                rel="noreferrer"
              >
                OpenStreetMap contributors
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationDropdown;
