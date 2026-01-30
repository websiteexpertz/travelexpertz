"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

// Comprehensive responsive styles for package details page
const packageDetailsStyles = `
  /* ===== PACKAGE DETAILS PAGE RESPONSIVE STYLES ===== */
  
  /* Gallery Section */
  .pkg-detail-gallery {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  .pkg-detail-gallery-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.375rem;
    height: auto;
    border-radius: 1rem;
    overflow: hidden;
  }
  
  .pkg-detail-gallery-main {
    position: relative;
    cursor: pointer;
    aspect-ratio: 16/10;
    min-height: 220px;
  }
  
  .pkg-detail-gallery-main img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .pkg-detail-gallery-thumbs {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 0.375rem;
  }
  
  .pkg-detail-gallery-thumb {
    position: relative;
    cursor: pointer;
    overflow: hidden;
    aspect-ratio: 1;
  }
  
  .pkg-detail-gallery-thumb img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  .pkg-detail-gallery-thumb:hover img {
    transform: scale(1.1);
  }
  
  .pkg-detail-gallery-overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.1rem;
    font-weight: 700;
  }
  
  .pkg-detail-badge {
    position: absolute;
    top: 0.75rem;
    left: 0.75rem;
    background: #0066cc;
    color: white;
    padding: 0.375rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    z-index: 2;
  }
  
  /* Main Content Layout */
  .pkg-detail-content {
    width: 100%;
    max-width: 1280px;
    margin: 0 auto;
    padding: 0 1rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }
  
  /* Package Header */
  .pkg-detail-header {
    margin-bottom: 0;
  }
  
  .pkg-detail-tags {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
    flex-wrap: wrap;
  }
  
  .pkg-detail-tag {
    padding: 0.25rem 0.625rem;
    border-radius: 1rem;
    font-size: 0.7rem;
    font-weight: 600;
  }
  
  .pkg-detail-tag-category {
    background: #10b981;
    color: white;
  }
  
  .pkg-detail-tag-badge {
    background: #dbeafe;
    color: #1e40af;
  }
  
  .pkg-detail-title {
    font-size: clamp(1.5rem, 5vw, 2rem);
    font-weight: 800;
    margin-bottom: 0.75rem;
    color: #1a1a2e;
    line-height: 1.2;
  }
  
  .pkg-detail-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    color: #64748b;
    font-size: 0.875rem;
    flex-wrap: wrap;
  }
  
  .pkg-detail-meta-item {
    display: flex;
    align-items: center;
    gap: 0.25rem;
  }
  
  /* Tabs Navigation */
  .pkg-detail-tabs {
    display: flex;
    gap: 0;
    border-bottom: 2px solid #e5e7eb;
    padding-bottom: 0;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
    margin-bottom: 1rem;
  }
  
  .pkg-detail-tabs::-webkit-scrollbar {
    display: none;
  }
  
  .pkg-detail-tab {
    padding: 0.625rem 0.875rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: #64748b;
    background: transparent;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    white-space: nowrap;
    margin-bottom: -2px;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }
  
  .pkg-detail-tab.active {
    font-weight: 700;
    color: #0066cc;
    border-bottom-color: #0066cc;
  }
  
  .pkg-detail-tab .material-symbols-outlined {
    font-size: 1rem;
  }
  
  /* Tab Content */
  .pkg-detail-tab-content {
    background: white;
    border-radius: 1rem;
    padding: 1.25rem;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  }
  
  .pkg-detail-section-title {
    font-size: 1.1rem;
    font-weight: 700;
    margin-bottom: 0.875rem;
    color: #1f2937;
  }
  
  .pkg-detail-description {
    color: #4b5563;
    line-height: 1.7;
    font-size: 0.9rem;
    white-space: pre-line;
  }
  
  /* Booking Card */
  .pkg-detail-booking-card {
    background: white;
    border-radius: 1rem;
    padding: 1.25rem;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border: 1px solid #e5e7eb;
    position: relative;
  }
  
  .pkg-detail-price-section {
    margin-bottom: 1.25rem;
  }
  
  .pkg-detail-price {
    font-size: clamp(1.5rem, 5vw, 1.75rem);
    font-weight: 800;
    color: #1f2937;
  }
  
  .pkg-detail-price-suffix {
    font-size: 0.875rem;
    font-weight: 400;
    color: #6b7280;
  }
  
  .pkg-detail-form-group {
    margin-bottom: 1rem;
  }
  
  .pkg-detail-form-label {
    display: block;
    font-size: 0.8rem;
    font-weight: 600;
    color: #374151;
    margin-bottom: 0.375rem;
  }
  
  .pkg-detail-form-input-wrapper {
    position: relative;
  }
  
  .pkg-detail-form-input-wrapper .material-symbols-outlined {
    position: absolute;
    left: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    color: #9ca3af;
    font-size: 1.125rem;
    pointer-events: none;
  }
  
  .pkg-detail-form-input,
  .pkg-detail-form-select {
    width: 100%;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
    border-radius: 0.5rem;
    border: 1px solid #d1d5db;
    font-size: 0.9rem;
    outline: none;
    background: white;
  }
  
  .pkg-detail-form-input:focus,
  .pkg-detail-form-select:focus {
    border-color: #0066cc;
    box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
  }
  
  .pkg-detail-total-section {
    background: #f8fafc;
    padding: 1rem;
    border-radius: 0.5rem;
    margin: 1rem 0;
  }
  
  .pkg-detail-total-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    font-size: 0.85rem;
    color: #6b7280;
  }
  
  .pkg-detail-total-final {
    display: flex;
    justify-content: space-between;
    font-size: 1.05rem;
    font-weight: 700;
    color: #1f2937;
    padding-top: 0.5rem;
    border-top: 1px dashed #d1d5db;
  }
  
  .pkg-detail-book-btn {
    width: 100%;
    padding: 0.875rem;
    background: #0066cc;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    transition: background-color 0.2s ease;
  }
  
  .pkg-detail-book-btn:hover {
    background: #0052a3;
  }
  
  .pkg-detail-book-btn:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
  
  /* Mobile Fixed Booking Bar */
  .pkg-detail-mobile-booking-bar {
    display: flex;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: white;
    padding: 1rem;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.1);
    border-top: 1px solid #e5e7eb;
    z-index: 100;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }
  
  .pkg-detail-mobile-price {
    display: flex;
    flex-direction: column;
  }
  
  .pkg-detail-mobile-price-value {
    font-size: 1.25rem;
    font-weight: 800;
    color: #1f2937;
  }
  
  .pkg-detail-mobile-price-suffix {
    font-size: 0.75rem;
    color: #6b7280;
  }
  
  .pkg-detail-mobile-book-btn {
    padding: 0.875rem 1.5rem;
    background: #0066cc;
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    white-space: nowrap;
    transition: background-color 0.2s ease;
  }
  
  .pkg-detail-mobile-book-btn:hover {
    background: #0052a3;
  }
  
  /* Desktop: Hide mobile bar, show sidebar booking */
  .pkg-detail-sidebar {
    display: none;
  }
  
  /* Fullscreen Gallery Modal */
  .pkg-fullscreen-gallery {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.95);
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .pkg-fullscreen-close {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: transparent;
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    z-index: 1001;
    padding: 0.5rem;
  }
  
  .pkg-fullscreen-nav {
    position: absolute;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    font-size: 2rem;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: background 0.2s ease;
  }
  
  .pkg-fullscreen-nav:hover {
    background: rgba(255, 255, 255, 0.3);
  }
  
  .pkg-fullscreen-nav-prev {
    left: 0.5rem;
  }
  
  .pkg-fullscreen-nav-next {
    right: 0.5rem;
  }
  
  .pkg-fullscreen-image {
    max-width: 95%;
    max-height: 85vh;
    object-fit: contain;
  }
  
  .pkg-fullscreen-dots {
    position: absolute;
    bottom: 1rem;
    display: flex;
    gap: 0.5rem;
  }
  
  .pkg-fullscreen-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.4);
    border: none;
    cursor: pointer;
    transition: background 0.2s ease;
  }
  
  .pkg-fullscreen-dot.active {
    background: white;
  }
  
  /* Itinerary Styles */
  .pkg-itinerary-day {
    display: flex;
    gap: 1rem;
    margin-bottom: 1.5rem;
    position: relative;
  }
  
  .pkg-itinerary-day:not(:last-child)::after {
    content: '';
    position: absolute;
    left: 20px;
    top: 40px;
    bottom: -1rem;
    width: 2px;
    background: #e5e7eb;
  }
  
  .pkg-itinerary-day-badge {
    width: 40px;
    height: 40px;
    background: linear-gradient(135deg, #0066cc, #0052a3);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 700;
    font-size: 0.875rem;
    flex-shrink: 0;
    z-index: 1;
  }
  
  .pkg-itinerary-day-content {
    flex: 1;
    padding-bottom: 0.5rem;
  }
  
  .pkg-itinerary-day-title {
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 0.375rem;
    font-size: 0.95rem;
  }
  
  .pkg-itinerary-day-desc {
    color: #6b7280;
    font-size: 0.85rem;
    line-height: 1.6;
  }
  
  /* List Styles */
  .pkg-detail-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .pkg-detail-list-item {
    display: flex;
    align-items: flex-start;
    gap: 0.5rem;
    padding: 0.5rem 0;
    font-size: 0.875rem;
    color: #374151;
    border-bottom: 1px solid #f3f4f6;
  }
  
  .pkg-detail-list-item:last-child {
    border-bottom: none;
  }
  
  .pkg-detail-list-item .material-symbols-outlined {
    font-size: 1.125rem;
    flex-shrink: 0;
    margin-top: 0.125rem;
  }
  
  .pkg-detail-list-item.inclusion .material-symbols-outlined {
    color: #10b981;
  }
  
  .pkg-detail-list-item.exclusion .material-symbols-outlined {
    color: #ef4444;
  }
  
  /* Info Box */
  .pkg-detail-info-box {
    margin-top: 1rem;
    padding: 0.875rem;
    background: #f8fafc;
    border-radius: 0.75rem;
  }
  
  .pkg-detail-info-box-label {
    font-size: 0.75rem;
    color: #64748b;
    margin-bottom: 0.25rem;
  }
  
  .pkg-detail-info-box-value {
    font-weight: 600;
    color: #1f2937;
    display: flex;
    align-items: center;
    gap: 0.35rem;
    font-size: 0.9rem;
  }
  
  /* Add padding at bottom for mobile fixed bar */
  .pkg-detail-main {
    padding-bottom: 100px;
  }
  
  /* ===== TABLET BREAKPOINT (640px+) ===== */
  @media (min-width: 640px) {
    .pkg-detail-gallery {
      padding: 1.25rem;
    }
    
    .pkg-detail-gallery-grid {
      grid-template-columns: 1fr 1fr;
      grid-template-rows: auto auto;
      gap: 0.5rem;
      height: auto;
    }
    
    .pkg-detail-gallery-main {
      grid-column: 1 / -1;
      aspect-ratio: 16/9;
      min-height: 280px;
    }
    
    .pkg-detail-gallery-thumbs {
      grid-column: 1 / -1;
      grid-template-columns: repeat(4, 1fr);
    }
    
    .pkg-detail-content {
      padding: 0 1.25rem 2rem;
    }
    
    .pkg-detail-tab {
      padding: 0.75rem 1rem;
      font-size: 0.85rem;
    }
    
    .pkg-detail-tab-content {
      padding: 1.5rem;
    }
    
    .pkg-detail-section-title {
      font-size: 1.2rem;
    }
    
    .pkg-fullscreen-nav-prev {
      left: 1rem;
    }
    
    .pkg-fullscreen-nav-next {
      right: 1rem;
    }
    
    .pkg-fullscreen-image {
      max-width: 90%;
      max-height: 90vh;
    }
  }
  
  /* ===== DESKTOP BREAKPOINT (768px+) ===== */
  @media (min-width: 768px) {
    .pkg-detail-gallery-grid {
      grid-template-columns: 2fr 1fr 1fr;
      grid-template-rows: 1fr 1fr;
      height: 350px;
    }
    
    .pkg-detail-gallery-main {
      grid-column: 1;
      grid-row: 1 / 3;
      aspect-ratio: auto;
      min-height: auto;
    }
    
    .pkg-detail-gallery-thumbs {
      display: contents;
    }
    
    .pkg-detail-gallery-thumb {
      aspect-ratio: auto;
    }
    
    .pkg-detail-mobile-booking-bar {
      display: none;
    }
    
    .pkg-detail-main {
      padding-bottom: 2rem;
    }
    
    .pkg-detail-content {
      display: grid;
      grid-template-columns: 1fr 340px;
      gap: 2rem;
    }
    
    .pkg-detail-left {
      order: 1;
    }
    
    .pkg-detail-sidebar {
      order: 2;
      display: block;
    }
    
    .pkg-detail-booking-card {
      position: sticky;
      top: 1rem;
    }
    
    .pkg-detail-tab {
      padding: 0.75rem 1.25rem;
      font-size: 0.9rem;
    }
  }
  
  /* ===== LARGE DESKTOP (1024px+) ===== */
  @media (min-width: 1024px) {
    .pkg-detail-gallery {
      padding: 1.5rem 1.5rem;
    }
    
    .pkg-detail-gallery-grid {
      height: 400px;
      border-radius: 1rem;
    }
    
    .pkg-detail-content {
      grid-template-columns: 1fr 380px;
      padding: 0 1.5rem 2rem;
    }
    
    .pkg-detail-tab-content {
      padding: 1.75rem;
    }
    
    .pkg-detail-section-title {
      font-size: 1.25rem;
    }
    
    .pkg-detail-footer {
      margin-bottom: 0 !important;
    }
  }
  
  /* ===== TOUCH DEVICE OPTIMIZATIONS ===== */
  @media (hover: none) {
    .pkg-detail-gallery-thumb:hover img {
      transform: none;
    }
    
    .pkg-detail-gallery-thumb:active img {
      transform: scale(1.05);
    }
    
    .pkg-detail-book-btn:hover,
    .pkg-detail-mobile-book-btn:hover {
      background: #0066cc;
    }
    
    .pkg-detail-book-btn:active,
    .pkg-detail-mobile-book-btn:active {
      background: #0052a3;
    }
  }
`;

interface PackageDetail {
  _id: string;
  title: string;
  description: string;
  fullDescription?: string;
  duration: string;
  startingPoint: string;
  category: string;
  badge?: string;
  image: string;
  gallery?: string[];
  price?: number;
  currency?: string;
  featured?: boolean;
  active?: boolean;
  inclusions?: string[];
  exclusions?: string[];
  itinerary?: {
    day: number;
    title: string;
    description?: string;
  }[];
  importantNotes?: string[];
  termsConditions?: string[];
  thingsToCarry?:
    | string[]
    | {
        category: string;
        items: string[];
      }[];
  refundTiers?: {
    timeframe: string;
    refundInfo: string;
  }[];
  refundPolicyNotes?: string;
  customFields?: {
    id: string;
    section:
      | "overview"
      | "itinerary"
      | "inclusions"
      | "essentials"
      | "policies";
    fieldName: string;
    fieldType: "text" | "textarea" | "list";
    value: string | string[];
  }[];
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatInr = (value: number) =>
  inrFormatter.format(Math.max(0, Math.round(value)));

export default function PackageDetails() {
  const params = useParams();
  const router = useRouter();
  const packageId = params?.id as string;

  const [pkg, setPkg] = useState<PackageDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "overview" | "itinerary" | "inclusions" | "essentials" | "policies"
  >("overview");

  // Booking form state
  const [bookingDetails, setBookingDetails] = useState({
    travelDate: "",
    travelers: 2,
    name: "",
    email: "",
    phone: "",
  });

  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    const fetchPackageDetails = async () => {
      if (!packageId) return;
      setLoading(true);
      try {
        // Fetch package data using dynamic route
        const response = await fetch(`/api/packages/${packageId}`, {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched complete package data:", data);
          console.log("Itinerary:", data.itinerary);
          console.log("Custom Fields:", data.customFields);
          if (data.customFields) {
            console.log("Number of custom fields:", data.customFields.length);
            data.customFields.forEach((field: any) => {
              console.log(
                `Field: ${field.fieldName}, Section: ${field.section}, Type: ${field.fieldType}`,
              );
            });
          } else {
            console.log("No custom fields found in package data");
          }
          setPkg(data);
        } else {
          console.error(
            "Failed to fetch package:",
            response.status,
            response.statusText,
          );
        }
      } catch (error) {
        console.error("Failed to fetch package details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackageDetails();
  }, [packageId]);

  const totalPrice =
    pkg && pkg.price ? pkg.price * bookingDetails.travelers : 0;

  const handleBooking = async () => {
    // Handle booking submission
    console.log("Booking details:", {
      packageId,
      ...bookingDetails,
      totalPrice,
    });
    // Redirect to booking page or show confirmation
    router.push(
      `/booking?type=package&id=${packageId}&travelers=${bookingDetails.travelers}&date=${bookingDetails.travelDate}`,
    );
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <Header currentPage="packages" />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            fontSize: "1.2rem",
            color: "#64748b",
          }}
        >
          Loading package details...
        </div>
      </div>
    );
  }

  if (!pkg) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <Header currentPage="packages" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            gap: "1rem",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "4rem", color: "#94a3b8" }}
          >
            hiking
          </span>
          <div style={{ fontSize: "1.2rem", color: "#64748b" }}>
            Package not found
          </div>
          <Link
            href="/packages"
            style={{
              padding: "0.75rem 1.5rem",
              background: "#0066cc",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "1rem",
            }}
          >
            Browse All Packages
          </Link>
        </div>
      </div>
    );
  }

  const images =
    pkg.gallery && pkg.gallery.length > 0
      ? pkg.gallery
      : pkg.image
        ? [pkg.image]
        : [];

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
      <style>{packageDetailsStyles}</style>
      <Header currentPage="packages" />
      <main className="pkg-detail-main flex flex-col items-center w-full">
        {/* Image Gallery */}
        {images.length > 0 && (
          <div className="pkg-detail-gallery">
            <div className="pkg-detail-gallery-grid">
              <div
                className="pkg-detail-gallery-main"
                onClick={() => {
                  setFullscreenImageIndex(0);
                  setShowFullscreenGallery(true);
                }}
              >
                <img src={images[0]} alt={pkg.title} />
                {pkg.badge && (
                  <span className="pkg-detail-badge">{pkg.badge}</span>
                )}
              </div>
              <div className="pkg-detail-gallery-thumbs">
                {images.slice(1, 5).map((img, idx) => (
                  <div
                    key={idx}
                    className="pkg-detail-gallery-thumb"
                    onClick={() => {
                      setFullscreenImageIndex(idx + 1);
                      setShowFullscreenGallery(true);
                    }}
                  >
                    <img src={img} alt={`${pkg.title} ${idx + 2}`} />
                    {idx === 3 && images.length > 5 && (
                      <div className="pkg-detail-gallery-overlay">
                        +{images.length - 5} more
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Fullscreen Gallery Modal */}
        {showFullscreenGallery && (
          <div
            className="pkg-fullscreen-gallery"
            onClick={() => setShowFullscreenGallery(false)}
          >
            <button
              className="pkg-fullscreen-close"
              onClick={() => setShowFullscreenGallery(false)}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
            <button
              className="pkg-fullscreen-nav pkg-fullscreen-nav-prev"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImageIndex((prev) =>
                  prev > 0 ? prev - 1 : images.length - 1,
                );
              }}
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <img
              src={images[fullscreenImageIndex]}
              alt={`${pkg.title} ${fullscreenImageIndex + 1}`}
              className="pkg-fullscreen-image"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              className="pkg-fullscreen-nav pkg-fullscreen-nav-next"
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImageIndex((prev) =>
                  prev < images.length - 1 ? prev + 1 : 0,
                );
              }}
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
            <div className="pkg-fullscreen-dots">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  className={`pkg-fullscreen-dot ${idx === fullscreenImageIndex ? "active" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFullscreenImageIndex(idx);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div className="pkg-detail-content">
          {/* Left Column - Details */}
          <div className="pkg-detail-left">
            {/* Package Header */}
            <div className="pkg-detail-header">
              <div className="pkg-detail-tags">
                {pkg.category && (
                  <span className="pkg-detail-tag pkg-detail-tag-category">
                    {pkg.category}
                  </span>
                )}
                {pkg.badge && (
                  <span className="pkg-detail-tag pkg-detail-tag-badge">
                    {pkg.badge}
                  </span>
                )}
              </div>
              <h1 className="pkg-detail-title">{pkg.title}</h1>
              <div className="pkg-detail-meta">
                <div className="pkg-detail-meta-item">
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#f43f5e", fontSize: "1.25rem" }}
                  >
                    location_on
                  </span>
                  <span>{pkg.startingPoint}</span>
                </div>
                <div className="pkg-detail-meta-item">
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "#0066cc", fontSize: "1.25rem" }}
                  >
                    schedule
                  </span>
                  <span>{pkg.duration}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="pkg-detail-tabs">
              {(
                [
                  { key: "overview", label: "Overview", icon: "info" },
                  { key: "itinerary", label: "Itinerary", icon: "route" },
                  {
                    key: "inclusions",
                    label: "Inclusions",
                    icon: "check_circle",
                  },
                  {
                    key: "essentials",
                    label: "Things to Carry",
                    icon: "backpack",
                  },
                  {
                    key: "policies",
                    label: "Notes & Policies",
                    icon: "description",
                  },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`pkg-detail-tab ${activeTab === tab.key ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="pkg-detail-tab-content">
              {activeTab === "overview" && (
                <div>
                  <h3 className="pkg-detail-section-title">
                    About This Package
                  </h3>
                  <p className="pkg-detail-description">
                    {pkg.fullDescription || pkg.description}
                  </p>

                  {/* Starting Point Info */}
                  <div className="pkg-detail-info-box">
                    <div className="pkg-detail-info-box-label">
                      Starting Point
                    </div>
                    <div className="pkg-detail-info-box-value">
                      <span
                        className="material-symbols-outlined"
                        style={{ color: "#10b981", fontSize: "1.1rem" }}
                      >
                        trip_origin
                      </span>
                      {pkg.startingPoint || "To be announced"}
                    </div>
                  </div>

                  {/* Custom Fields */}
                  {pkg.customFields &&
                    pkg.customFields
                      .filter((f) => f.section === "overview")
                      .map((field) => (
                        <div
                          key={field.id}
                          style={{
                            marginTop: "1.5rem",
                            padding: "1.25rem",
                            backgroundColor: "#f8fafc",
                            borderRadius: "0.75rem",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "1.05rem",
                              fontWeight: 700,
                              marginBottom: "0.75rem",
                              color: "#0066cc",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "1.1rem" }}
                            >
                              info
                            </span>
                            {field.fieldName}
                          </h4>
                          {field.fieldType === "list" ? (
                            <ul
                              style={{
                                listStyle: "none",
                                padding: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                              }}
                            >
                              {(() => {
                                // Handle both array and string with bullets
                                let items: string[] = [];
                                if (Array.isArray(field.value)) {
                                  items = field.value;
                                } else if (typeof field.value === "string") {
                                  // Split by bullets or newlines
                                  if (field.value.includes("•")) {
                                    items = field.value.split("•");
                                  } else if (field.value.includes("\n")) {
                                    items = field.value.split("\n");
                                  } else {
                                    items = [field.value];
                                  }
                                  // Clean up items
                                  items = items
                                    .map((item) => item.trim())
                                    .filter((item) => item.length > 0)
                                    .map((item) =>
                                      item
                                        .replace(/^[•\-*]\s*/, "")
                                        .replace(/^\d+\.\s*/, "")
                                        .trim(),
                                    )
                                    .filter((item) => item.length > 0);
                                }
                                return items.map((item, idx) => (
                                  <li
                                    key={idx}
                                    style={{
                                      display: "flex",
                                      alignItems: "flex-start",
                                      gap: "0.5rem",
                                      color: "#4b5563",
                                      fontSize: "0.95rem",
                                    }}
                                  >
                                    <span
                                      style={{
                                        color: "#10b981",
                                        fontSize: "0.75rem",
                                        marginTop: "0.4rem",
                                      }}
                                    >
                                      •
                                    </span>
                                    {item}
                                  </li>
                                ));
                              })()}
                            </ul>
                          ) : (
                            <p
                              style={{
                                color: "#4b5563",
                                lineHeight: 1.7,
                                whiteSpace: "pre-line",
                                margin: 0,
                              }}
                            >
                              {field.value}
                            </p>
                          )}
                        </div>
                      ))}
                </div>
              )}

              {activeTab === "itinerary" && (
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      marginBottom: "1.5rem",
                      color: "#1f2937",
                    }}
                  >
                    Day-by-Day Itinerary
                  </h3>

                  {pkg.itinerary &&
                  Array.isArray(pkg.itinerary) &&
                  pkg.itinerary.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      {pkg.itinerary.map((day, idx) => (
                        <div
                          key={idx}
                          style={{
                            padding: "1.5rem",
                            backgroundColor: "#f8fafc",
                            borderRadius: "0.75rem",
                            borderLeft: "4px solid #0066cc",
                            marginBottom: "1rem",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "1.2rem",
                              fontWeight: 700,
                              color: "#0066cc",
                              marginBottom: "1rem",
                            }}
                          >
                            Day {day.day || idx + 1}:{" "}
                            {day.title || `Day ${day.day || idx + 1}`}
                          </h4>
                          <p
                            style={{
                              color: "#4b5563",
                              fontSize: "1rem",
                              lineHeight: 1.7,
                              whiteSpace: "pre-line",
                            }}
                          >
                            {day.description || "No details available"}
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p
                      style={{
                        color: "#64748b",
                        fontSize: "0.9rem",
                      }}
                    >
                      Detailed itinerary will be shared upon booking.
                    </p>
                  )}

                  {/* Custom Fields for Itinerary */}
                  {pkg.customFields &&
                    pkg.customFields
                      .filter((f) => f.section === "itinerary")
                      .map((field) => (
                        <div
                          key={field.id}
                          style={{
                            marginTop: "1.5rem",
                            padding: "1.25rem",
                            backgroundColor: "#f8fafc",
                            borderRadius: "0.75rem",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "1.05rem",
                              fontWeight: 700,
                              marginBottom: "0.75rem",
                              color: "#0066cc",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "1.1rem" }}
                            >
                              info
                            </span>
                            {field.fieldName}
                          </h4>
                          {field.fieldType === "list" &&
                          Array.isArray(field.value) ? (
                            <ul
                              style={{
                                listStyle: "none",
                                padding: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                              }}
                            >
                              {field.value.map((item, idx) => (
                                <li
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "0.5rem",
                                    color: "#4b5563",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#10b981",
                                      fontSize: "0.75rem",
                                      marginTop: "0.4rem",
                                    }}
                                  >
                                    •
                                  </span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p
                              style={{
                                color: "#4b5563",
                                lineHeight: 1.7,
                                whiteSpace: "pre-line",
                                margin: 0,
                              }}
                            >
                              {field.value}
                            </p>
                          )}
                        </div>
                      ))}
                </div>
              )}

              {activeTab === "inclusions" && (
                <div>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: "2rem",
                    }}
                  >
                    {/* Inclusions */}
                    <div>
                      <h3
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          marginBottom: "1rem",
                          color: "#059669",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span className="material-symbols-outlined">
                          check_circle
                        </span>
                        What&apos;s Included
                      </h3>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                        }}
                      >
                        {pkg.inclusions && pkg.inclusions.length > 0 ? (
                          pkg.inclusions.map((item, idx) => (
                            <li
                              key={idx}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "0.5rem",
                                color: "#4b5563",
                                fontSize: "0.9rem",
                              }}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{
                                  color: "#10b981",
                                  fontSize: "1.1rem",
                                  flexShrink: 0,
                                }}
                              >
                                check
                              </span>
                              {item}
                            </li>
                          ))
                        ) : (
                          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                            Inclusions will be shared upon inquiry.
                          </p>
                        )}
                      </ul>
                    </div>

                    {/* Exclusions */}
                    <div>
                      <h3
                        style={{
                          fontSize: "1.1rem",
                          fontWeight: 700,
                          marginBottom: "1rem",
                          color: "#dc2626",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span className="material-symbols-outlined">
                          cancel
                        </span>
                        What&apos;s Not Included
                      </h3>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                        }}
                      >
                        {pkg.exclusions && pkg.exclusions.length > 0 ? (
                          pkg.exclusions.map((item, idx) => (
                            <li
                              key={idx}
                              style={{
                                display: "flex",
                                alignItems: "flex-start",
                                gap: "0.5rem",
                                color: "#4b5563",
                                fontSize: "0.9rem",
                              }}
                            >
                              <span
                                className="material-symbols-outlined"
                                style={{
                                  color: "#ef4444",
                                  fontSize: "1.1rem",
                                  flexShrink: 0,
                                }}
                              >
                                close
                              </span>
                              {item}
                            </li>
                          ))
                        ) : (
                          <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                            Exclusions will be shared upon inquiry.
                          </p>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Custom Fields for Inclusions */}
                  {pkg.customFields &&
                    pkg.customFields
                      .filter((f) => f.section === "inclusions")
                      .map((field) => (
                        <div
                          key={field.id}
                          style={{
                            marginTop: "1.5rem",
                            padding: "1.25rem",
                            backgroundColor: "#f8fafc",
                            borderRadius: "0.75rem",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "1.05rem",
                              fontWeight: 700,
                              marginBottom: "0.75rem",
                              color: "#0066cc",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "1.1rem" }}
                            >
                              info
                            </span>
                            {field.fieldName}
                          </h4>
                          {field.fieldType === "list" &&
                          Array.isArray(field.value) ? (
                            <ul
                              style={{
                                listStyle: "none",
                                padding: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                              }}
                            >
                              {field.value.map((item, idx) => (
                                <li
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "0.5rem",
                                    color: "#4b5563",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#10b981",
                                      fontSize: "0.75rem",
                                      marginTop: "0.4rem",
                                    }}
                                  >
                                    •
                                  </span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p
                              style={{
                                color: "#4b5563",
                                lineHeight: 1.7,
                                whiteSpace: "pre-line",
                                margin: 0,
                              }}
                            >
                              {field.value}
                            </p>
                          )}
                        </div>
                      ))}
                </div>
              )}

              {activeTab === "essentials" && (
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      marginBottom: "1.5rem",
                      color: "#1f2937",
                    }}
                  >
                    Things to Carry
                  </h3>

                  {pkg.thingsToCarry && pkg.thingsToCarry.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1.5rem",
                      }}
                    >
                      {/* Check if it's the new format (array of objects) or old format (array of strings) */}
                      {typeof pkg.thingsToCarry[0] === "string" ? (
                        // Old format: array of strings
                        <div
                          style={{
                            backgroundColor: "#f0fdf4",
                            padding: "1.25rem",
                            borderRadius: "0.75rem",
                            border: "1px solid #bbf7d0",
                          }}
                        >
                          <ul
                            style={{
                              listStyle: "none",
                              padding: 0,
                              display: "grid",
                              gridTemplateColumns:
                                "repeat(auto-fit, minmax(280px, 1fr))",
                              gap: "0.75rem",
                            }}
                          >
                            {pkg.thingsToCarry.map((item, idx) => {
                              // Only render if item is a string
                              if (typeof item !== "string") return null;

                              return (
                                <li
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "0.5rem",
                                    color: "#374151",
                                    fontSize: "0.925rem",
                                    lineHeight: "1.5",
                                  }}
                                >
                                  <span
                                    className="material-symbols-outlined"
                                    style={{
                                      color: "#22c55e",
                                      fontSize: "1.1rem",
                                      flexShrink: 0,
                                    }}
                                  >
                                    check_box
                                  </span>
                                  {item}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : (
                        // New format: array of category objects
                        pkg.thingsToCarry.map((carryCategory, catIdx) => {
                          // Type guard to ensure carryCategory is an object
                          if (typeof carryCategory === "string") return null;

                          const categoryObj = carryCategory as {
                            category: string;
                            items: string[];
                          };

                          return (
                            <div
                              key={catIdx}
                              style={{
                                backgroundColor: "#f8fafc",
                                padding: "1.25rem",
                                borderRadius: "0.75rem",
                                border: "1px solid #e2e8f0",
                              }}
                            >
                              <h4
                                style={{
                                  fontSize: "1.05rem",
                                  fontWeight: 700,
                                  marginBottom: "1rem",
                                  color: "#0066cc",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.5rem",
                                }}
                              >
                                <span
                                  className="material-symbols-outlined"
                                  style={{ fontSize: "1.2rem" }}
                                >
                                  backpack
                                </span>
                                {categoryObj.category}
                              </h4>
                              <ul
                                style={{
                                  listStyle: "none",
                                  padding: 0,
                                  display: "grid",
                                  gridTemplateColumns:
                                    "repeat(auto-fit, minmax(280px, 1fr))",
                                  gap: "0.75rem",
                                }}
                              >
                                {categoryObj.items &&
                                  categoryObj.items.map((item, itemIdx) => (
                                    <li
                                      key={itemIdx}
                                      style={{
                                        display: "flex",
                                        alignItems: "flex-start",
                                        gap: "0.5rem",
                                        color: "#374151",
                                        fontSize: "0.925rem",
                                        lineHeight: "1.5",
                                      }}
                                    >
                                      <span
                                        style={{
                                          color: "#22c55e",
                                          fontSize: "0.75rem",
                                          flexShrink: 0,
                                          marginTop: "0.35rem",
                                        }}
                                      >
                                        •
                                      </span>
                                      {item}
                                    </li>
                                  ))}
                              </ul>
                            </div>
                          );
                        })
                      )}
                    </div>
                  ) : (
                    <div
                      style={{
                        backgroundColor: "#f0fdf4",
                        padding: "1.25rem",
                        borderRadius: "0.75rem",
                        border: "1px solid #bbf7d0",
                      }}
                    >
                      <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                        No items specified.
                      </p>
                    </div>
                  )}

                  {/* Custom Fields for Things to Carry */}
                  {pkg.customFields &&
                    pkg.customFields
                      .filter((f) => f.section === "essentials")
                      .map((field) => (
                        <div
                          key={field.id}
                          style={{
                            marginTop: "1.5rem",
                            padding: "1.25rem",
                            backgroundColor: "#f8fafc",
                            borderRadius: "0.75rem",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "1.05rem",
                              fontWeight: 700,
                              marginBottom: "0.75rem",
                              color: "#0066cc",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "1.1rem" }}
                            >
                              info
                            </span>
                            {field.fieldName}
                          </h4>
                          {field.fieldType === "list" &&
                          Array.isArray(field.value) ? (
                            <ul
                              style={{
                                listStyle: "none",
                                padding: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                              }}
                            >
                              {field.value.map((item, idx) => (
                                <li
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "0.5rem",
                                    color: "#4b5563",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#10b981",
                                      fontSize: "0.75rem",
                                      marginTop: "0.4rem",
                                    }}
                                  >
                                    •
                                  </span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p
                              style={{
                                color: "#4b5563",
                                lineHeight: 1.7,
                                whiteSpace: "pre-line",
                                margin: 0,
                              }}
                            >
                              {field.value}
                            </p>
                          )}
                        </div>
                      ))}
                </div>
              )}

              {activeTab === "policies" && (
                <div>
                  <h3
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      marginBottom: "1.5rem",
                      color: "#1f2937",
                    }}
                  >
                    Notes & Policies
                  </h3>

                  {/* Important Notes */}
                  {pkg.importantNotes && pkg.importantNotes.length > 0 && (
                    <div
                      style={{
                        backgroundColor: "#fef3c7",
                        padding: "1.25rem",
                        borderRadius: "0.75rem",
                        marginBottom: "1.5rem",
                        border: "1px solid #fcd34d",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          marginBottom: "1rem",
                          color: "#92400e",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span className="material-symbols-outlined">
                          warning
                        </span>
                        Important Notes
                      </h4>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                        }}
                      >
                        {pkg.importantNotes.map((note, idx) => (
                          <li
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "0.5rem",
                              color: "#374151",
                              fontSize: "0.9rem",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{
                                color: "#d97706",
                                fontSize: "1rem",
                                flexShrink: 0,
                              }}
                            >
                              arrow_right
                            </span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Refund & Cancellation Policy */}
                  <div
                    style={{
                      backgroundColor: "#fef2f2",
                      padding: "1.25rem",
                      borderRadius: "0.75rem",
                      border: "1px solid #fecaca",
                    }}
                  >
                    <h4
                      style={{
                        fontSize: "1rem",
                        fontWeight: 700,
                        marginBottom: "1rem",
                        color: "#991b1b",
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                      }}
                    >
                      <span className="material-symbols-outlined">
                        event_busy
                      </span>
                      Refund & Cancellation Policy
                    </h4>

                    {/* Refund Tiers Table */}
                    {pkg.refundTiers && pkg.refundTiers.length > 0 && (
                      <div style={{ marginBottom: "1.5rem" }}>
                        <table
                          style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            backgroundColor: "white",
                            borderRadius: "8px",
                            overflow: "hidden",
                          }}
                        >
                          <thead>
                            <tr style={{ backgroundColor: "#fee2e2" }}>
                              <th
                                style={{
                                  padding: "0.75rem 1rem",
                                  textAlign: "left",
                                  fontWeight: 600,
                                  color: "#991b1b",
                                  fontSize: "0.85rem",
                                  borderBottom: "1px solid #fecaca",
                                }}
                              >
                                Cancellation Period
                              </th>
                              <th
                                style={{
                                  padding: "0.75rem 1rem",
                                  textAlign: "left",
                                  fontWeight: 600,
                                  color: "#991b1b",
                                  fontSize: "0.85rem",
                                  borderBottom: "1px solid #fecaca",
                                }}
                              >
                                Refund Policy
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {pkg.refundTiers.map((tier, idx) => (
                              <tr
                                key={idx}
                                style={{
                                  backgroundColor:
                                    idx % 2 === 0 ? "#fff" : "#fef2f2",
                                }}
                              >
                                <td
                                  style={{
                                    padding: "0.75rem 1rem",
                                    fontSize: "0.9rem",
                                    color: "#374151",
                                    fontWeight: 500,
                                    borderBottom: "1px solid #fecaca",
                                  }}
                                >
                                  {tier.timeframe}
                                </td>
                                <td
                                  style={{
                                    padding: "0.75rem 1rem",
                                    fontSize: "0.9rem",
                                    color: "#374151",
                                    borderBottom: "1px solid #fecaca",
                                  }}
                                >
                                  {tier.refundInfo}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* Policy Notes */}
                    {pkg.refundPolicyNotes ? (
                      <div
                        style={{
                          color: "#374151",
                          fontSize: "0.85rem",
                          lineHeight: 1.7,
                          whiteSpace: "pre-line",
                        }}
                      >
                        {pkg.refundPolicyNotes}
                      </div>
                    ) : (
                      !pkg.refundTiers?.length && (
                        <p
                          style={{
                            color: "#64748b",
                            fontSize: "0.9rem",
                          }}
                        >
                          Refund and cancellation policy will be shared upon
                          booking.
                        </p>
                      )
                    )}
                  </div>

                  {/* Terms & Conditions */}
                  {pkg.termsConditions && pkg.termsConditions.length > 0 && (
                    <div
                      style={{
                        backgroundColor: "#eff6ff",
                        padding: "1.25rem",
                        borderRadius: "0.75rem",
                        marginBottom: "1.5rem",
                        border: "1px solid #bfdbfe",
                      }}
                    >
                      <h4
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          marginBottom: "1rem",
                          color: "#1e40af",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                        }}
                      >
                        <span className="material-symbols-outlined">
                          description
                        </span>
                        Terms & Conditions
                      </h4>
                      <ul
                        style={{
                          listStyle: "none",
                          padding: 0,
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                        }}
                      >
                        {pkg.termsConditions.map((term, idx) => (
                          <li
                            key={idx}
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "0.5rem",
                              color: "#374151",
                              fontSize: "0.9rem",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{
                                color: "#3b82f6",
                                fontSize: "1rem",
                                flexShrink: 0,
                              }}
                            >
                              arrow_right
                            </span>
                            {term}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Custom Fields for Policies */}
                  {pkg.customFields &&
                    pkg.customFields
                      .filter((f) => f.section === "policies")
                      .map((field) => (
                        <div
                          key={field.id}
                          style={{
                            marginTop: "1.5rem",
                            padding: "1.25rem",
                            backgroundColor: "#f8fafc",
                            borderRadius: "0.75rem",
                            border: "1px solid #e2e8f0",
                          }}
                        >
                          <h4
                            style={{
                              fontSize: "1.05rem",
                              fontWeight: 700,
                              marginBottom: "0.75rem",
                              color: "#0066cc",
                              display: "flex",
                              alignItems: "center",
                              gap: "0.5rem",
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "1.1rem" }}
                            >
                              info
                            </span>
                            {field.fieldName}
                          </h4>
                          {field.fieldType === "list" &&
                          Array.isArray(field.value) ? (
                            <ul
                              style={{
                                listStyle: "none",
                                padding: 0,
                                display: "flex",
                                flexDirection: "column",
                                gap: "0.5rem",
                              }}
                            >
                              {field.value.map((item, idx) => (
                                <li
                                  key={idx}
                                  style={{
                                    display: "flex",
                                    alignItems: "flex-start",
                                    gap: "0.5rem",
                                    color: "#4b5563",
                                    fontSize: "0.95rem",
                                  }}
                                >
                                  <span
                                    style={{
                                      color: "#10b981",
                                      fontSize: "0.75rem",
                                      marginTop: "0.4rem",
                                    }}
                                  >
                                    •
                                  </span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p
                              style={{
                                color: "#4b5563",
                                lineHeight: 1.7,
                                whiteSpace: "pre-line",
                                margin: 0,
                              }}
                            >
                              {field.value}
                            </p>
                          )}
                        </div>
                      ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Booking Card (Desktop Sidebar) */}
          <div className="pkg-detail-sidebar">
            <div className="pkg-detail-booking-card">
              {/* Price */}
              <div
                className="pkg-detail-price-section"
                style={{
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "1rem",
                }}
              >
                {pkg.price && pkg.price > 0 ? (
                  <div>
                    <span className="pkg-detail-price">
                      {formatInr(pkg.price)}
                    </span>
                    <span className="pkg-detail-price-suffix"> /person</span>
                  </div>
                ) : (
                  <span
                    style={{
                      fontSize: "1.25rem",
                      fontWeight: 700,
                      color: "#0066cc",
                    }}
                  >
                    Contact for Price
                  </span>
                )}
              </div>

              {/* Booking Form */}
              <div
                style={{
                  marginTop: "1rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <div className="pkg-detail-form-group">
                  <label className="pkg-detail-form-label">Travel Date</label>
                  <div className="pkg-detail-form-input-wrapper">
                    <span className="material-symbols-outlined">
                      calendar_month
                    </span>
                    <input
                      type="date"
                      value={bookingDetails.travelDate}
                      onChange={(e) =>
                        setBookingDetails({
                          ...bookingDetails,
                          travelDate: e.target.value,
                        })
                      }
                      min={new Date().toISOString().split("T")[0]}
                      className="pkg-detail-form-input"
                    />
                  </div>
                </div>

                <div className="pkg-detail-form-group">
                  <label className="pkg-detail-form-label">
                    Number of Travelers
                  </label>
                  <div className="pkg-detail-form-input-wrapper">
                    <span className="material-symbols-outlined">group</span>
                    <select
                      value={bookingDetails.travelers}
                      onChange={(e) =>
                        setBookingDetails({
                          ...bookingDetails,
                          travelers: parseInt(e.target.value),
                        })
                      }
                      className="pkg-detail-form-select"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Traveler" : "Travelers"}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Total */}
                <div className="pkg-detail-total-section">
                  <div className="pkg-detail-total-row">
                    <span>
                      {formatInr(pkg.price || 0)} × {bookingDetails.travelers}{" "}
                      {bookingDetails.travelers === 1 ? "person" : "people"}
                    </span>
                    <span>{formatInr(totalPrice)}</span>
                  </div>
                  <div className="pkg-detail-total-final">
                    <span>Total</span>
                    <span>{formatInr(totalPrice)}</span>
                  </div>
                </div>

                <button
                  onClick={handleBooking}
                  disabled={!bookingDetails.travelDate}
                  className="pkg-detail-book-btn"
                  style={{
                    backgroundColor: bookingDetails.travelDate
                      ? "#0066cc"
                      : "#94a3b8",
                    cursor: bookingDetails.travelDate
                      ? "pointer"
                      : "not-allowed",
                  }}
                >
                  <span className="material-symbols-outlined">
                    flight_takeoff
                  </span>
                  Book Now
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fixed Booking Bar */}
        <div className="pkg-detail-mobile-booking-bar">
          <div className="pkg-detail-mobile-price">
            {pkg.price && pkg.price > 0 ? (
              <>
                <span className="pkg-detail-mobile-price-value">
                  {formatInr(pkg.price)}
                </span>
                <span className="pkg-detail-mobile-price-suffix">/person</span>
              </>
            ) : (
              <span style={{ fontWeight: 600, color: "#0066cc" }}>
                Contact for Price
              </span>
            )}
          </div>
          <button
            onClick={() => setShowBookingForm(true)}
            className="pkg-detail-mobile-book-btn"
          >
            <span className="material-symbols-outlined">flight_takeoff</span>
            Book Now
          </button>
        </div>

        {/* Mobile Booking Modal */}
        {showBookingForm && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0, 0, 0, 0.5)",
              zIndex: 200,
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
            onClick={() => setShowBookingForm(false)}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "1.5rem 1.5rem 0 0",
                padding: "1.5rem",
                width: "100%",
                maxWidth: "500px",
                maxHeight: "85vh",
                overflow: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    color: "#1f2937",
                  }}
                >
                  Book This Package
                </h3>
                <button
                  onClick={() => setShowBookingForm(false)}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0.5rem",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.5rem", color: "#6b7280" }}
                  >
                    close
                  </span>
                </button>
              </div>

              <div
                className="pkg-detail-price-section"
                style={{
                  borderBottom: "1px solid #e5e7eb",
                  paddingBottom: "1rem",
                  marginBottom: "1rem",
                }}
              >
                {pkg.price && pkg.price > 0 ? (
                  <>
                    <span className="pkg-detail-price">
                      {formatInr(pkg.price)}
                    </span>
                    <span className="pkg-detail-price-suffix"> /person</span>
                  </>
                ) : (
                  <span style={{ fontWeight: 600, color: "#0066cc" }}>
                    Contact for Price
                  </span>
                )}
              </div>

              <div className="pkg-detail-form-group">
                <label className="pkg-detail-form-label">Travel Date</label>
                <div className="pkg-detail-form-input-wrapper">
                  <span className="material-symbols-outlined">
                    calendar_month
                  </span>
                  <input
                    type="date"
                    value={bookingDetails.travelDate}
                    onChange={(e) =>
                      setBookingDetails({
                        ...bookingDetails,
                        travelDate: e.target.value,
                      })
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="pkg-detail-form-input"
                  />
                </div>
              </div>

              <div className="pkg-detail-form-group">
                <label className="pkg-detail-form-label">
                  Number of Travelers
                </label>
                <div className="pkg-detail-form-input-wrapper">
                  <span className="material-symbols-outlined">group</span>
                  <select
                    value={bookingDetails.travelers}
                    onChange={(e) =>
                      setBookingDetails({
                        ...bookingDetails,
                        travelers: parseInt(e.target.value),
                      })
                    }
                    className="pkg-detail-form-select"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                      <option key={num} value={num}>
                        {num} {num === 1 ? "Traveler" : "Travelers"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pkg-detail-total-section">
                <div className="pkg-detail-total-row">
                  <span>
                    {formatInr(pkg.price || 0)} × {bookingDetails.travelers}{" "}
                    {bookingDetails.travelers === 1 ? "person" : "people"}
                  </span>
                  <span>{formatInr(totalPrice)}</span>
                </div>
                <div className="pkg-detail-total-final">
                  <span>Total</span>
                  <span>{formatInr(totalPrice)}</span>
                </div>
              </div>

              <button
                onClick={handleBooking}
                disabled={!bookingDetails.travelDate}
                className="pkg-detail-book-btn"
                style={{
                  backgroundColor: bookingDetails.travelDate
                    ? "#0066cc"
                    : "#94a3b8",
                  cursor: bookingDetails.travelDate ? "pointer" : "not-allowed",
                }}
              >
                <span className="material-symbols-outlined">
                  flight_takeoff
                </span>
                Confirm Booking
              </button>
            </div>
          </div>
        )}

        <Footer />
      </main>
    </div>
  );
}
