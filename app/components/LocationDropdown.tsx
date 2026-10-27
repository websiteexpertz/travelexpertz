"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import styles from "./LocationDropdown.module.css";

interface Location {
  _id: string;
  name: string;
  displayName?: string;
  destinationId?: string;
  type?: "state" | "city" | "hotel" | "location";
  location?: string;
  city?: string;
  state?: string;
  country?: string;
  source?: string;
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
    if (!isOpen || !query) {
      setLocations([]);
      setLoading(false);
      setError("");
      return;
    }

    const controller = new AbortController();
    setLoading(true);
    setError("");
    const timeout = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/locations?search=${encodeURIComponent(query)}${providerOnly ? "&source=photon" : ""}`,
          { signal: controller.signal },
        );
        const data = await response.json();
        if (!response.ok) {
          throw new Error(
            typeof data.error === "string"
              ? data.error
              : "Location suggestions could not be loaded.",
          );
        }
        setLocations(Array.isArray(data) ? data : []);
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
    }, 180);

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
    setIsOpen(Boolean(nextValue.trim()));
    onChange(nextValue);
  };

  const selectLocation = (location: Location) => {
    const selectedValue = location.displayName || location.name;
    setInputValue(selectedValue);
    onChange(selectedValue);
    setIsOpen(false);
    setHighlightedIndex(-1);
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
        selectLocation(locations[highlightedIndex]);
      } else if (loading || locations.length > 0) {
        event.preventDefault();
      }
    }
  };

  const getContext = (location: Location) =>
    location.location ||
    [location.city, location.state, location.country]
      .filter(Boolean)
      .join(", ");

  return (
    <div
      ref={dropdownRef}
      className={`${styles.wrapper} location-dropdown-wrapper${isOpen ? ` ${styles.open}` : ""}`}
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
          if (inputValue.trim()) setIsOpen(true);
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
      />

      {isOpen && (
        <div
          className={styles.popover}
        >
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
                Searching real locations...
              </div>
            ) : error ? (
              <div className={styles.message} role="status">
                {error} You can continue with the location you entered.
              </div>
            ) : locations.length === 0 ? (
              <div className={styles.message} role="status">
                No matching locations found.
              </div>
            ) : (
              locations.map((location, index) => (
                <button
                  key={location._id}
                  id={`${listboxId}-option-${index}`}
                  type="button"
                  tabIndex={-1}
                  className={`${styles.option}${highlightedIndex === index ? ` ${styles.highlighted}` : ""}`}
                  role="option"
                  aria-selected={highlightedIndex === index}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => selectLocation(location)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                >
                  <span className={styles.optionIcon} aria-hidden="true">
                    <span className="material-symbols-outlined">
                      location_on
                    </span>
                  </span>
                  <span className={styles.optionText}>
                    <span className={styles.optionName}>{location.name}</span>
                    {getContext(location) && (
                      <span className={styles.optionContext}>
                        {getContext(location)}
                      </span>
                    )}
                  </span>
                  {highlightedIndex === index && (
                    <span className={styles.optionHint} aria-hidden="true">
                      Enter
                    </span>
                  )}
                </button>
              ))
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
