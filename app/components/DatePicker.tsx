"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface DatePickerProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  placeholder?: string;
  minDate?: string;
}

export default function DatePicker({
  value,
  onChange,
  placeholder = "Select date",
  minDate,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [displayMonth, setDisplayMonth] = useState<Date>(
    value ? new Date(value + "T00:00:00") : new Date(),
  );
  const [popupPosition, setPopupPosition] = useState({ top: 0, left: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        (!popupRef.current || !popupRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const updatePopupPosition = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const CALENDAR_WIDTH = 320;
      const CALENDAR_HEIGHT = popupRef.current?.offsetHeight || 340;
      const VIEWPORT_PADDING = 8;

      const centeredLeft = rect.left + rect.width / 2 - CALENDAR_WIDTH / 2;
      const left = Math.min(
        Math.max(VIEWPORT_PADDING, centeredLeft),
        window.innerWidth - CALENDAR_WIDTH - VIEWPORT_PADDING,
      );

      const top = Math.max(VIEWPORT_PADDING, rect.top - CALENDAR_HEIGHT - 8);

      setPopupPosition({ top, left });
    };

    updatePopupPosition();
    const rafId = window.requestAnimationFrame(updatePopupPosition);
    window.addEventListener("resize", updatePopupPosition);
    window.addEventListener("scroll", updatePopupPosition, true);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("resize", updatePopupPosition);
      window.removeEventListener("scroll", updatePopupPosition, true);
    };
  }, [isOpen]);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = new Date(dateStr + "T00:00:00");
    const day = date.getDate();
    const month = date.toLocaleDateString("en-US", { month: "short" });
    return `${day} ${month}`;
  };

  const handleDateClick = (day: number) => {
    const year = displayMonth.getFullYear();
    const month = String(displayMonth.getMonth() + 1).padStart(2, "0");
    const dateStr = `${year}-${month}-${String(day).padStart(2, "0")}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handlePrevMonth = () => {
    setDisplayMonth(
      new Date(displayMonth.getFullYear(), displayMonth.getMonth() - 1),
    );
  };

  const handleNextMonth = () => {
    setDisplayMonth(
      new Date(displayMonth.getFullYear(), displayMonth.getMonth() + 1),
    );
  };

  const daysInMonth = getDaysInMonth(displayMonth);
  const firstDay = getFirstDayOfMonth(displayMonth);
  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const monthYear = displayMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const isDateDisabled = (day: number): boolean => {
    const today = new Date();
    const todayIso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    const effectiveMinDate = minDate || todayIso;

    const dateStr = `${displayMonth.getFullYear()}-${String(displayMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    return dateStr < effectiveMinDate;
  };

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
      }}
    >
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          cursor: "pointer",
          flex: 1,
          fontSize: "0.9rem",
          fontWeight: value ? 600 : 400,
          color: value ? "#1f2937" : "#999",
          userSelect: "none",
        }}
      >
        {value ? formatDate(value) : placeholder}
      </div>

      {isOpen &&
        typeof window !== "undefined" &&
        createPortal(
          <div
            ref={popupRef}
            style={{
              position: "fixed",
              top: `${popupPosition.top}px`,
              left: `${popupPosition.left}px`,
              background: "white",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
              zIndex: 99999,
              padding: "12px",
              minWidth: "320px",
            }}
          >
            {/* Month/Year Header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "12px",
              }}
            >
              <button
                onClick={handlePrevMonth}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 8px",
                  fontSize: "1.2rem",
                  color: "#666",
                }}
              >
                ‹
              </button>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  color: "#1f2937",
                }}
              >
                {monthYear}
              </div>
              <button
                onClick={handleNextMonth}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px 8px",
                  fontSize: "1.2rem",
                  color: "#666",
                }}
              >
                ›
              </button>
            </div>

            {/* Weekday Headers */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "4px",
                marginBottom: "8px",
              }}
            >
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div
                  key={day}
                  style={{
                    textAlign: "center",
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "#999",
                    padding: "4px 0",
                  }}
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Days Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(7, 1fr)",
                gap: "4px",
              }}
            >
              {days.map((day, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    day && !isDateDisabled(day) && handleDateClick(day)
                  }
                  disabled={!day || isDateDisabled(day)}
                  style={{
                    padding: "8px 4px",
                    border: "none",
                    borderRadius: "4px",
                    background:
                      day &&
                      value ===
                        `${displayMonth.getFullYear()}-${String(displayMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                        ? "#0066cc"
                        : "transparent",
                    color:
                      day &&
                      value ===
                        `${displayMonth.getFullYear()}-${String(displayMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`
                        ? "white"
                        : day && isDateDisabled(day)
                          ? "#ccc"
                          : "#333",
                    cursor:
                      day && !isDateDisabled(day) ? "pointer" : "not-allowed",
                    fontSize: "0.85rem",
                    fontWeight: day ? 500 : 400,
                    opacity: day ? 1 : 0,
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (day && !isDateDisabled(day)) {
                      (e.target as HTMLButtonElement).style.background =
                        "#f0f9ff";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (day && !isDateDisabled(day)) {
                      const dateStr = `${displayMonth.getFullYear()}-${String(displayMonth.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                      (e.target as HTMLButtonElement).style.background =
                        value === dateStr ? "#0066cc" : "transparent";
                    }
                  }}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>,
          document.body,
        )}
    </div>
  );
}
