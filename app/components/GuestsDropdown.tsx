"use client";

import React, { useState, useRef, useEffect } from "react";
import { Users, Baby, BedDouble, Minus, Plus, ChevronDown } from "lucide-react";

export interface GuestsValue {
  adults: number;
  children: number;
  rooms: number;
}

interface GuestsDropdownProps {
  value: GuestsValue;
  onChange: (value: GuestsValue) => void;
}

export default function GuestsDropdown({ value, onChange }: GuestsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const totalGuests = value.adults + value.children;

  const updateCount = (
    field: keyof GuestsValue,
    delta: number,
    min: number
  ) => {
    const nextVal = Math.max(min, value[field] + delta);
    onChange({
      ...value,
      [field]: nextVal,
    });
  };

  return (
    <div className="guests-dropdown-container" ref={dropdownRef}>
      <button
        type="button"
        className="guests-dropdown-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <span className="guests-summary-text">
          {totalGuests} Guest{totalGuests !== 1 ? "s" : ""}, {value.rooms} Room
          {value.rooms !== 1 ? "s" : ""}
        </span>
        <ChevronDown
          size={16}
          className={`guests-chevron ${isOpen ? "rotate" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          className="guests-popover-card"
          role="dialog"
          aria-label="Guests and Rooms Selector"
        >
          {/* Header matching website dropdown style: GUESTS & ROOMS  X found / badge */}
          <div className="guests-popover-header">
            <span>GUESTS &amp; ROOMS</span>
            <span className="guests-popover-badge">
              {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"},{" "}
              {value.rooms} {value.rooms === 1 ? "Room" : "Rooms"}
            </span>
          </div>

          <div className="guests-popover-body">
            {/* Adults row */}
            <div className="guests-item-row">
              <div className="guests-item-icon">
                <Users size={18} />
              </div>
              <div className="guests-item-info">
                <span className="guests-item-title">Adults</span>
                <span className="guests-item-desc">Ages 13 and above</span>
              </div>
              <div className="guests-counter-wrap">
                <button
                  type="button"
                  className="guests-counter-btn"
                  disabled={value.adults <= 1}
                  onClick={() => updateCount("adults", -1, 1)}
                  aria-label="Decrease Adults"
                >
                  <Minus size={14} />
                </button>
                <span className="guests-count-val">{value.adults}</span>
                <button
                  type="button"
                  className="guests-counter-btn"
                  onClick={() => updateCount("adults", 1, 1)}
                  aria-label="Increase Adults"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Children row */}
            <div className="guests-item-row">
              <div className="guests-item-icon">
                <Baby size={18} />
              </div>
              <div className="guests-item-info">
                <span className="guests-item-title">Children</span>
                <span className="guests-item-desc">Ages 0 to 12</span>
              </div>
              <div className="guests-counter-wrap">
                <button
                  type="button"
                  className="guests-counter-btn"
                  disabled={value.children <= 0}
                  onClick={() => updateCount("children", -1, 0)}
                  aria-label="Decrease Children"
                >
                  <Minus size={14} />
                </button>
                <span className="guests-count-val">{value.children}</span>
                <button
                  type="button"
                  className="guests-counter-btn"
                  onClick={() => updateCount("children", 1, 0)}
                  aria-label="Increase Children"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Rooms row */}
            <div className="guests-item-row">
              <div className="guests-item-icon">
                <BedDouble size={18} />
              </div>
              <div className="guests-item-info">
                <span className="guests-item-title">Rooms</span>
                <span className="guests-item-desc">Total suites / rooms</span>
              </div>
              <div className="guests-counter-wrap">
                <button
                  type="button"
                  className="guests-counter-btn"
                  disabled={value.rooms <= 1}
                  onClick={() => updateCount("rooms", -1, 1)}
                  aria-label="Decrease Rooms"
                >
                  <Minus size={14} />
                </button>
                <span className="guests-count-val">{value.rooms}</span>
                <button
                  type="button"
                  className="guests-counter-btn"
                  onClick={() => updateCount("rooms", 1, 1)}
                  aria-label="Increase Rooms"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Footer with summary and website-styled primary Done button */}
          <div className="guests-popover-footer">
            <div className="guests-footer-summary">
              {totalGuests} {totalGuests === 1 ? "Guest" : "Guests"} •{" "}
              {value.rooms} {value.rooms === 1 ? "Room" : "Rooms"}
            </div>
            <button
              type="button"
              className="guests-done-btn"
              onClick={() => setIsOpen(false)}
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
