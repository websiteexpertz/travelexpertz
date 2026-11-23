"use client";

import React, { useRef, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MarqueeSliderProps {
  children: React.ReactNode;
  className?: string;
  trackClassName?: string;
  ariaLabel?: string;
  secondsPerCard?: number; // Default: 17s per card
  showControls?: boolean;
}

export default function MarqueeSlider({
  children,
  className = "",
  trackClassName = "",
  ariaLabel,
  secondsPerCard = 17,
  showControls = true,
}: MarqueeSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  // Interaction & animation refs
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);
  const isInteractingRef = useRef(false);
  const resumeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animFrameIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());

  // Mark interaction active and schedule auto-scroll resume
  const notifyInteraction = useCallback(() => {
    isInteractingRef.current = true;
    if (resumeTimeoutRef.current) {
      clearTimeout(resumeTimeoutRef.current);
    }
    resumeTimeoutRef.current = setTimeout(() => {
      isInteractingRef.current = false;
    }, 1500);
  }, []);

  // Main animation loop
  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    // Initialize scroll position to the middle third
    const initScroll = () => {
      if (track.scrollWidth > 0) {
        const singleSetWidth = track.scrollWidth / 3;
        container.scrollLeft = singleSetWidth;
      }
    };

    // Wait a tick for child elements to lay out
    const initTimer = setTimeout(initScroll, 50);

    lastTimeRef.current = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(now - lastTimeRef.current, 100); // Guard against huge delta on tab switch
      lastTimeRef.current = now;

      if (!isInteractingRef.current && container && track && track.scrollWidth > 0) {
        const singleSetWidth = track.scrollWidth / 3;
        // Estimate 1 card + gap width
        const firstChild = track.firstElementChild as HTMLElement | null;
        const cardWidth = firstChild ? firstChild.offsetWidth + 24 : 380;
        const speedPxPerMs = cardWidth / (secondsPerCard * 1000);

        container.scrollLeft += speedPxPerMs * dt;

        // Infinite wrap forward
        if (container.scrollLeft >= singleSetWidth * 2) {
          container.scrollLeft -= singleSetWidth;
        } else if (container.scrollLeft <= 0) {
          container.scrollLeft += singleSetWidth;
        }
      }

      animFrameIdRef.current = requestAnimationFrame(tick);
    };

    animFrameIdRef.current = requestAnimationFrame(tick);

    return () => {
      clearTimeout(initTimer);
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (resumeTimeoutRef.current) clearTimeout(resumeTimeoutRef.current);
    };
  }, [secondsPerCard]);

  // Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    const container = containerRef.current;
    if (!container) return;

    isDownRef.current = true;
    hasMovedRef.current = false;
    isInteractingRef.current = true;
    startXRef.current = e.pageX - container.offsetLeft;
    startScrollLeftRef.current = container.scrollLeft;
    container.style.cursor = "grabbing";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDownRef.current) return;
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const x = e.pageX - container.offsetLeft;
    const walk = x - startXRef.current;

    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true;
    }

    container.scrollLeft = startScrollLeftRef.current - walk;

    // Wrap seamlessly while dragging
    const singleSetWidth = track.scrollWidth / 3;
    if (singleSetWidth > 0) {
      if (container.scrollLeft >= singleSetWidth * 2) {
        container.scrollLeft -= singleSetWidth;
        startScrollLeftRef.current -= singleSetWidth;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += singleSetWidth;
        startScrollLeftRef.current += singleSetWidth;
      }
    }
  };

  const handleMouseUpOrLeave = () => {
    if (!isDownRef.current) return;
    isDownRef.current = false;
    if (containerRef.current) {
      containerRef.current.style.cursor = "grab";
    }
    notifyInteraction();
  };

  // Prevent link click if user was dragging
  const handleClickCapture = (e: React.MouseEvent) => {
    if (hasMovedRef.current) {
      e.preventDefault();
      e.stopPropagation();
      hasMovedRef.current = false;
    }
  };

  // Wheel / Trackpad handler
  const handleWheel = (e: React.WheelEvent) => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    notifyInteraction();

    // Support horizontal scroll from trackpad or Shift+wheel
    if (e.deltaX !== 0) {
      container.scrollLeft += e.deltaX;
    } else if (e.shiftKey && e.deltaY !== 0) {
      container.scrollLeft += e.deltaY;
    }

    const singleSetWidth = track.scrollWidth / 3;
    if (singleSetWidth > 0) {
      if (container.scrollLeft >= singleSetWidth * 2) {
        container.scrollLeft -= singleSetWidth;
      } else if (container.scrollLeft <= 0) {
        container.scrollLeft += singleSetWidth;
      }
    }
  };

  // Button navigation (scroll back / forward)
  const scrollByCard = (direction: "left" | "right") => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    notifyInteraction();

    const firstChild = track.firstElementChild as HTMLElement | null;
    const cardStep = firstChild ? firstChild.offsetWidth + 24 : 380;
    const delta = direction === "left" ? -cardStep : cardStep;

    container.scrollBy({ left: delta, behavior: "smooth" });

    // Ensure infinite bounds after smooth scroll
    setTimeout(() => {
      const singleSetWidth = track.scrollWidth / 3;
      if (singleSetWidth > 0 && container) {
        if (container.scrollLeft >= singleSetWidth * 2) {
          container.scrollLeft -= singleSetWidth;
        } else if (container.scrollLeft <= 0) {
          container.scrollLeft += singleSetWidth;
        }
      }
    }, 400);
  };

  return (
    <div className="marquee-slider-wrapper">
      {showControls && (
        <button
          type="button"
          className="slider-control-btn prev"
          onClick={() => scrollByCard("left")}
          aria-label="Scroll backward"
        >
          <ChevronLeft size={22} />
        </button>
      )}

      <div
        ref={containerRef}
        className={`marquee-slider-scroll ${className}`}
        aria-label={ariaLabel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUpOrLeave}
        onMouseLeave={handleMouseUpOrLeave}
        onClickCapture={handleClickCapture}
        onWheel={handleWheel}
        style={{
          overflowX: "auto",
          scrollbarWidth: "none",
          cursor: "grab",
          userSelect: "none",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div
          ref={trackRef}
          className={`marquee-slider-content ${trackClassName}`}
          style={{
            display: "flex",
            width: "max-content",
            animation: "none",
            transform: "none",
          }}
        >
          {/* 3 identical copies guarantee continuous seamless infinite looping back and forward */}
          {children}
          {children}
          {children}
        </div>
      </div>

      {showControls && (
        <button
          type="button"
          className="slider-control-btn next"
          onClick={() => scrollByCard("right")}
          aria-label="Scroll forward"
        >
          <ChevronRight size={22} />
        </button>
      )}
    </div>
  );
}
