"use client";

import React, { useState } from "react";

interface ImageModalProps {
  images: string[];
  initialIndex: number;
  onClose: () => void;
}

export default function ImageModal({
  images,
  initialIndex,
  onClose,
}: ImageModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.9)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
      }}
      onClick={onClose}
    >
      {/* Close Button */}
      <button
        onClick={onClose}
        style={{
          position: "absolute",
          top: "2rem",
          right: "2rem",
          width: "50px",
          height: "50px",
          borderRadius: "50%",
          border: "none",
          background: "rgba(255, 255, 255, 0.2)",
          color: "white",
          cursor: "pointer",
          fontSize: "1.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transition: "all 0.3s",
          backdropFilter: "blur(8px)",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
        }}
      >
        ✕
      </button>

      {/* Main Image */}
      <div
        style={{
          position: "relative",
          width: "90%",
          maxWidth: "900px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={images[currentIndex]}
          alt={`Image ${currentIndex + 1}`}
          style={{
            width: "100%",
            height: "auto",
            maxHeight: "80vh",
            borderRadius: "16px",
            objectFit: "contain",
          }}
        />

        {/* Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              style={{
                position: "absolute",
                left: "-80px",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                cursor: "pointer",
                fontSize: "1.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              }}
            >
              ‹
            </button>

            <button
              onClick={handleNext}
              style={{
                position: "absolute",
                right: "-80px",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                border: "none",
                background: "rgba(255, 255, 255, 0.2)",
                color: "white",
                cursor: "pointer",
                fontSize: "1.75rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s",
                backdropFilter: "blur(8px)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(255, 255, 255, 0.2)";
              }}
            >
              ›
            </button>

            {/* Counter */}
            <div
              style={{
                position: "absolute",
                bottom: "1.5rem",
                left: "50%",
                transform: "translateX(-50%)",
                background: "rgba(0, 0, 0, 0.6)",
                color: "white",
                padding: "0.75rem 1.5rem",
                borderRadius: "999px",
                fontSize: "0.95rem",
                fontWeight: 600,
                backdropFilter: "blur(8px)",
              }}
            >
              {currentIndex + 1} / {images.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
