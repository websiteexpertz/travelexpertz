"use client";

import { useState } from "react";

type ImageSlideshowProps = {
  images?: string[];
  alt: string;
};

export default function ImageSlideshow({ images = [], alt }: ImageSlideshowProps) {
  const slides = images.filter(Boolean).slice(0, 10);
  const [activeIndex, setActiveIndex] = useState(0);

  if (slides.length === 0) {
    return <div className="listing-image-placeholder">No image</div>;
  }

  return (
    <div
      onMouseEnter={() => {
        if (slides.length > 1) {
          setActiveIndex(1);
        }
      }}
      onMouseLeave={() => setActiveIndex(0)}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background: "#f1f5f9",
      }}
    >
      <img
        src={slides[activeIndex]}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          transition: "opacity 180ms ease-in-out",
        }}
      />
      {slides.length > 1 && (
        <>
          <span
            style={{
              position: "absolute",
              top: "8px",
              right: "8px",
              padding: "4px 8px",
              borderRadius: "999px",
              background: "rgba(0,0,0,.62)",
              color: "#ffffff",
              fontSize: "11px",
              fontWeight: 700,
              lineHeight: 1.2,
              whiteSpace: "nowrap",
            }}
          >
            {slides.length - 1}+ more images
          </span>
          <div
            aria-label={`${alt} photos`}
            style={{
              position: "absolute",
              bottom: "8px",
              left: "50%",
              display: "flex",
              gap: "4px",
              transform: "translateX(-50%)",
            }}
          >
            {slides.map((slide, index) => (
              <button
                key={`${slide}-${index}`}
                type="button"
                aria-label={`Show photo ${index + 1}`}
                aria-current={index === activeIndex}
                onClick={(event) => {
                  event.preventDefault();
                  event.stopPropagation();
                  setActiveIndex(index);
                }}
                style={{
                  width: "6px",
                  height: "6px",
                  padding: 0,
                  border: 0,
                  borderRadius: "50%",
                  background:
                    index === activeIndex
                      ? "#ffffff"
                      : "rgba(255,255,255,.55)",
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
