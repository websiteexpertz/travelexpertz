"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";

export interface HotelAvailabilityCalendarProps {
  hotelId: string;
  hotelName?: string;
  propertyType?: "hotel" | "homestay";
  basePrice?: number;
  currency?: string;
  selectedRoomId?: string;
  checkInDate?: string;
  checkOutDate?: string;
  onDatesChange?: (checkIn: string, checkOut: string) => void;
}

interface AvailabilityData {
  nightlyPrice: number;
  currency: string;
  bookedDates: string[];
  totalInventory: number;
  roomType?: string;
}

const DAYS_OF_WEEK = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

// Helper to format date object to YYYY-MM-DD
function formatYMD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Parse YYYY-MM-DD to local Date object (avoids UTC timezone shift)
function parseYMD(s: string): Date | null {
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
}

// Pretty format date for display: "24 Nov 2026"
function formatPrettyDate(s: string): string {
  const d = parseYMD(s);
  if (!d) return s;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function HotelAvailabilityCalendar({
  hotelId,
  hotelName,
  propertyType = "hotel",
  basePrice = 0,
  currency = "INR",
  selectedRoomId,
  checkInDate = "",
  checkOutDate = "",
  onDatesChange,
}: HotelAvailabilityCalendarProps) {
  // Current calendar view (year and month, 0-indexed)
  const today = useMemo(() => new Date(), []);
  const todayStr = useMemo(() => formatYMD(today), [today]);

  const [currentYear, setCurrentYear] = useState<number>(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState<number>(today.getMonth());

  // Availability data from backend
  const [availability, setAvailability] = useState<AvailabilityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Local selection state for immediate reactivity, synchronized with props
  const [localCheckIn, setLocalCheckIn] = useState<string>(checkInDate);
  const [localCheckOut, setLocalCheckOut] = useState<string>(checkOutDate);
  const [hoverDate, setHoverDate] = useState<string | null>(null);

  // Sync when parent props change
  useEffect(() => {
    setLocalCheckIn(checkInDate);
    setLocalCheckOut(checkOutDate);
    // If a valid checkin is passed, set current view to that month
    if (checkInDate) {
      const d = parseYMD(checkInDate);
      if (d) {
        setCurrentYear(d.getFullYear());
        setCurrentMonth(d.getMonth());
      }
    }
  }, [checkInDate, checkOutDate]);

  // Fetch real property availability from backend API
  useEffect(() => {
    if (!hotelId) return;

    let isMounted = true;
    setLoading(true);

    const fetchAvailability = async () => {
      try {
        const query = selectedRoomId ? `?roomId=${encodeURIComponent(selectedRoomId)}` : "";
        const endpoint =
          propertyType === "homestay"
            ? `/api/homestays/${hotelId}/availability${query}`
            : `/api/hotels/${hotelId}/availability${query}`;
        const res = await fetch(endpoint, {
          cache: "no-store",
        });

        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            setAvailability({
              nightlyPrice: Number(data.nightlyPrice ?? basePathFallbackPrice()),
              currency: data.currency || currency,
              bookedDates: Array.isArray(data.bookedDates) ? data.bookedDates : [],
              totalInventory: Number(data.totalInventory ?? 1),
              roomType: data.roomType,
            });
            setLoading(false);
          }
        } else {
          throw new Error("Availability endpoint returned status " + res.status);
        }
      } catch (err) {
        console.warn("Could not fetch real availability, using property defaults", err);
        if (isMounted) {
          setAvailability({
            nightlyPrice: basePathFallbackPrice(),
            currency,
            bookedDates: [],
            totalInventory: 1,
          });
          setLoading(false);
        }
      }
    };

    fetchAvailability();

    return () => {
      isMounted = false;
    };
  }, [hotelId, selectedRoomId]);

  const basePathFallbackPrice = useCallback(() => {
    return Number(basePrice || 0);
  }, [basePrice]);

  const effectiveNightlyPrice = availability?.nightlyPrice || basePathFallbackPrice();
  const bookedDatesSet = useMemo(() => {
    return new Set(availability?.bookedDates || []);
  }, [availability?.bookedDates]);

  // Check if navigation to previous month is allowed (cannot go into past months)
  const isPrevMonthDisabled = useMemo(() => {
    const curMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const viewingMonthStart = new Date(currentYear, currentMonth, 1);
    return viewingMonthStart <= curMonthStart;
  }, [currentYear, currentMonth, today]);

  const handlePrevMonth = () => {
    if (isPrevMonthDisabled) return;
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Calendar dates computation for current viewing month
  const calendarCells = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 for Sun
    const totalDaysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    const cells: Array<{
      dateStr: string;
      dayNum: number;
      isCurrentMonth: boolean;
      isPast: boolean;
      isBooked: boolean;
    }> = [];

    // Empty cells for leading days
    for (let i = 0; i < firstDayIndex; i++) {
      cells.push({
        dateStr: "",
        dayNum: 0,
        isCurrentMonth: false,
        isPast: false,
        isBooked: false,
      });
    }

    // Days of current month
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateObj = new Date(currentYear, currentMonth, d);
      const dateStr = formatYMD(dateObj);
      const isPast = dateStr < todayStr;
      const isBooked = bookedDatesSet.has(dateStr);

      cells.push({
        dateStr,
        dayNum: d,
        isCurrentMonth: true,
        isPast,
        isBooked,
      });
    }

    return cells;
  }, [currentYear, currentMonth, todayStr, bookedDatesSet]);

  // Validate that no booked nights lie strictly between inStr and outStr
  // Check-in inclusive, check-out exclusive: nights are from inStr to day before outStr
  const hasBookedNightInRange = useCallback(
    (inStr: string, outStr: string): boolean => {
      const start = parseYMD(inStr);
      const end = parseYMD(outStr);
      if (!start || !end || start >= end) return false;

      const cur = new Date(start);
      while (cur < end) {
        const curStr = formatYMD(cur);
        if (bookedDatesSet.has(curStr)) {
          return true;
        }
        cur.setDate(cur.getDate() + 1);
      }
      return false;
    },
    [bookedDatesSet]
  );

  // Date click handler
  const handleDateClick = (dateStr: string, isPast: boolean, isBooked: boolean) => {
    if (isPast) return;
    setErrorMessage(null);

    // If no check-in is set yet, or if both check-in and check-out are already set:
    if (!localCheckIn || (localCheckIn && localCheckOut)) {
      if (isBooked) {
        setErrorMessage("This date is reserved. Please pick an available check-in date.");
        return;
      }
      setLocalCheckIn(dateStr);
      setLocalCheckOut("");
      onDatesChange?.(dateStr, "");
      return;
    }

    // A check-in date is already set and we are clicking for check-out:
    if (localCheckIn && !localCheckOut) {
      // If clicking the same date or earlier date, reset check-in to this date
      if (dateStr <= localCheckIn) {
        if (isBooked) {
          setErrorMessage("This date is reserved. Please pick an available date.");
          return;
        }
        setLocalCheckIn(dateStr);
        setLocalCheckOut("");
        onDatesChange?.(dateStr, "");
        return;
      }

      // Check-out date is later than check-in date.
      // Notice: Check-out date itself can be booked for the NEXT guest (checkout-exclusive),
      // BUT all intermediate nights [localCheckIn, dateStr) must be available!
      if (hasBookedNightInRange(localCheckIn, dateStr)) {
        setErrorMessage("Your selected stay includes dates that are already booked. Please choose a continuous available range.");
        // If clicked date is available, offer it as new check-in
        if (!isBooked) {
          setLocalCheckIn(dateStr);
          setLocalCheckOut("");
          onDatesChange?.(dateStr, "");
        }
        return;
      }

      // Valid check-out date selected!
      setLocalCheckOut(dateStr);
      onDatesChange?.(localCheckIn, dateStr);
    }
  };

  const handleClearSelection = () => {
    setLocalCheckIn("");
    setLocalCheckOut("");
    setErrorMessage(null);
    onDatesChange?.("", "");
  };

  // Compute selected stay summary
  const selectedNights = useMemo(() => {
    if (!localCheckIn || !localCheckOut) return 0;
    const s = parseYMD(localCheckIn);
    const e = parseYMD(localCheckOut);
    if (!s || !e || e <= s) return 0;
    return Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
  }, [localCheckIn, localCheckOut]);

  // Price formatting helper
  const formattedPrice = useMemo(() => {
    if (!effectiveNightlyPrice) return "";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(effectiveNightlyPrice);
  }, [effectiveNightlyPrice, currency]);

  return (
    <section
      id="availability-calendar"
      style={{
        background: "#ffffff",
        borderRadius: "20px",
        padding: "1.75rem",
        border: "1px solid #e2e8f0",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        marginTop: "1.5rem",
        marginBottom: "1.5rem",
        fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {/* HEADER SECTION: Title + Instruction & Month Navigation */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "1rem",
          marginBottom: "1.5rem",
          paddingBottom: "1rem",
          borderBottom: "1px solid #f1f5f9",
        }}
      >
        {/* Left: Icon & Heading */}
        <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
          <div
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "12px",
              background: "#f0fdfa",
              border: "1px solid #ccfbf1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#00827f",
              flexShrink: 0,
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.6rem" }}>
              calendar_month
            </span>
          </div>

          <div>
            <h2
              style={{
                fontSize: "1.35rem",
                fontWeight: 800,
                color: "#0f172a",
                margin: "0 0 0.25rem",
                letterSpacing: "-0.01em",
              }}
            >
              Availability Calendar
            </h2>
            <p
              style={{
                fontSize: "0.875rem",
                color: "#64748b",
                margin: 0,
                fontWeight: 500,
              }}
            >
              Click an available date to set Check-In, then click a second date to set Check-Out
            </p>
          </div>
        </div>

        {/* Right: Month Navigation Controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            background: "#f8fafc",
            padding: "0.35rem 0.6rem",
            borderRadius: "12px",
            border: "1px solid #e2e8f0",
          }}
        >
          <button
            type="button"
            onClick={handlePrevMonth}
            disabled={isPrevMonthDisabled}
            aria-label="Previous Month"
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: isPrevMonthDisabled ? "#f1f5f9" : "#ffffff",
              color: isPrevMonthDisabled ? "#cbd5e1" : "#1e293b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isPrevMonthDisabled ? "not-allowed" : "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>
              chevron_left
            </span>
          </button>

          <span
            style={{
              fontSize: "0.95rem",
              fontWeight: 700,
              color: "#0f172a",
              minWidth: "140px",
              textAlign: "center",
            }}
          >
            {MONTH_NAMES[currentMonth]} {currentYear}
          </span>

          <button
            type="button"
            onClick={handleNextMonth}
            aria-label="Next Month"
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              background: "#ffffff",
              color: "#1e293b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>
              chevron_right
            </span>
          </button>
        </div>
      </div>

      {/* SELECTION STATUS BAR (When Dates Are Selected) */}
      {(localCheckIn || errorMessage) && (
        <div
          style={{
            marginBottom: "1.25rem",
            padding: "0.75rem 1rem",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "0.75rem",
            background: errorMessage ? "#fef2f2" : "#f0fdfa",
            border: `1px solid ${errorMessage ? "#fecaca" : "#99f6e4"}`,
            fontSize: "0.875rem",
          }}
        >
          {errorMessage ? (
            <div style={{ color: "#b91c1c", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "1.2rem" }}>
                info
              </span>
              <span>{errorMessage}</span>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
              <span style={{ color: "#00827f", fontWeight: 700 }}>
                {localCheckIn && !localCheckOut && (
                  <>Check-In: <strong>{formatPrettyDate(localCheckIn)}</strong> — Now select Check-Out date</>
                )}
                {localCheckIn && localCheckOut && (
                  <>
                    Stay: <strong>{formatPrettyDate(localCheckIn)}</strong> → <strong>{formatPrettyDate(localCheckOut)}</strong> ({selectedNights} Night{selectedNights > 1 ? "s" : ""})
                  </>
                )}
              </span>

              {localCheckIn && localCheckOut && effectiveNightlyPrice > 0 && (
                <span
                  style={{
                    background: "#00827f",
                    color: "#ffffff",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    padding: "2px 8px",
                    borderRadius: "6px",
                  }}
                >
                  Total Base: {new Intl.NumberFormat("en-IN", { style: "currency", currency: currency || "INR", maximumFractionDigits: 0 }).format(effectiveNightlyPrice * selectedNights)}
                </span>
              )}
            </div>
          )}

          {localCheckIn && (
            <button
              type="button"
              onClick={handleClearSelection}
              style={{
                background: "none",
                border: "none",
                color: "#64748b",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                padding: "0.2rem 0.5rem",
                borderRadius: "6px",
                textDecoration: "underline",
              }}
            >
              Reset Dates
            </button>
          )}
        </div>
      )}

      {/* CALENDAR GRID */}
      <div style={{ width: "100%", overflowX: "auto" }}>
        {/* Days of week header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: "0.5rem",
            marginBottom: "0.5rem",
            textAlign: "center",
          }}
        >
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                color: "#64748b",
                padding: "0.5rem 0",
                letterSpacing: "0.5px",
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days cells */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
            gap: "0.5rem",
          }}
        >
          {calendarCells.map((cell, idx) => {
            if (!cell.isCurrentMonth) {
              return (
                <div
                  key={`empty-${idx}`}
                  style={{
                    minHeight: "68px",
                    background: "transparent",
                  }}
                />
              );
            }

            const { dateStr, dayNum, isPast, isBooked } = cell;

            const isCheckIn = localCheckIn === dateStr;
            const isCheckOut = localCheckOut === dateStr;
            const isEndpoint = isCheckIn || isCheckOut;

            // In range between checkin and checkout (or hover date preview)
            const activeRangeEnd = localCheckOut || (hoverDate && hoverDate > localCheckIn ? hoverDate : null);
            const isInRange =
              localCheckIn &&
              activeRangeEnd &&
              dateStr > localCheckIn &&
              dateStr < activeRangeEnd;

            // Cell Styles according to state
            let bgColor = "#ffffff";
            let borderColor = "#e2e8f0";
            let textColor = "#1e293b";
            let priceColor = "#00827f";
            let cursor = "pointer";
            let boxShadow = "none";

            if (isEndpoint) {
              bgColor = "#00827f";
              borderColor = "#00827f";
              textColor = "#ffffff";
              priceColor = "#ccfbf1";
              boxShadow = "0 4px 12px rgba(0, 130, 127, 0.35)";
            } else if (isInRange) {
              bgColor = "#f0fdfa";
              borderColor = "#99f6e4";
              textColor = "#0f766e";
              priceColor = "#00827f";
            } else if (isPast) {
              bgColor = "#f8fafc";
              borderColor = "#f1f5f9";
              textColor = "#cbd5e1";
              priceColor = "transparent";
              cursor = "not-allowed";
            } else if (isBooked) {
              bgColor = "#f1f5f9";
              borderColor = "#e2e8f0";
              textColor = "#94a3b8";
              priceColor = "#94a3b8";
              cursor = "not-allowed";
            }

            return (
              <div
                key={dateStr}
                onClick={() => handleDateClick(dateStr, isPast, isBooked)}
                onMouseEnter={() => {
                  if (localCheckIn && !localCheckOut && !isPast) {
                    setHoverDate(dateStr);
                  }
                }}
                onMouseLeave={() => setHoverDate(null)}
                style={{
                  minHeight: "68px",
                  borderRadius: "12px",
                  border: `1.5px solid ${borderColor}`,
                  background: bgColor,
                  color: textColor,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: "0.45rem 0.25rem",
                  cursor,
                  boxShadow,
                  transition: "all 0.15s ease",
                  userSelect: "none",
                  position: "relative",
                }}
              >
                {/* Date Number */}
                <span
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: isEndpoint ? 800 : 700,
                    lineHeight: 1.2,
                  }}
                >
                  {dayNum}
                </span>

                {/* Subtext: Price / "Booked" / CheckIn / CheckOut */}
                {isCheckIn && (
                  <span
                    style={{
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      color: "#ffffff",
                      letterSpacing: "0.3px",
                      textTransform: "uppercase",
                      marginTop: "2px",
                    }}
                  >
                    Check-In
                  </span>
                )}

                {isCheckOut && (
                  <span
                    style={{
                      fontSize: "0.62rem",
                      fontWeight: 800,
                      color: "#ffffff",
                      letterSpacing: "0.3px",
                      textTransform: "uppercase",
                      marginTop: "2px",
                    }}
                  >
                    Check-Out
                  </span>
                )}

                {!isEndpoint && isBooked && (
                  <span
                    style={{
                      fontSize: "0.68rem",
                      fontWeight: 600,
                      color: "#94a3b8",
                      marginTop: "2px",
                    }}
                  >
                    Booked
                  </span>
                )}

                {!isEndpoint && !isBooked && !isPast && formattedPrice && (
                  <span
                    style={{
                      fontSize: "0.72rem",
                      fontWeight: 700,
                      color: priceColor,
                      marginTop: "2px",
                      lineHeight: 1.1,
                    }}
                  >
                    {formattedPrice}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* CALENDAR LEGEND (Matching Reference Screenshot) */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "1.75rem",
          marginTop: "1.5rem",
          paddingTop: "1.25rem",
          borderTop: "1px solid #f1f5f9",
          fontSize: "0.85rem",
          color: "#475569",
          fontWeight: 600,
        }}
      >
        {/* 1. Available */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "5px",
              background: "#ffffff",
              border: "1.5px solid #cbd5e1",
              boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            }}
          />
          <span>Available</span>
        </div>

        {/* 2. Selected Dates */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "5px",
              background: "#00827f",
              border: "1.5px solid #00827f",
              boxShadow: "0 2px 4px rgba(0, 130, 127, 0.3)",
            }}
          />
          <span>Selected Dates</span>
        </div>

        {/* 3. Reserved / Booked */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <div
            style={{
              width: "18px",
              height: "18px",
              borderRadius: "5px",
              background: "#f1f5f9",
              border: "1.5px solid #e2e8f0",
            }}
          />
          <span>Reserved / Booked</span>
        </div>
      </div>
    </section>
  );
}
