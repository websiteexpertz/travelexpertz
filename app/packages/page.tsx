"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";

interface Package {
  _id?: string;
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
}

interface Category {
  _id?: string;
  name: string;
  active?: boolean;
  order?: number;
}

interface Destination {
  _id?: string;
  name: string;
  image?: string;
  description?: string;
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatInr = (value: number) =>
  inrFormatter.format(Math.max(0, Math.round(value)));

// Get emoji based on category name
const getCategoryEmoji = (categoryName: string): string => {
  const name = categoryName.toLowerCase();
  if (name.includes("honeymoon") || name.includes("romantic")) return "💑";
  if (name.includes("adventure") || name.includes("trek")) return "🏔️";
  if (name.includes("beach") || name.includes("coastal")) return "🏖️";
  if (name.includes("wildlife") || name.includes("safari")) return "🦁";
  if (
    name.includes("spiritual") ||
    name.includes("pilgrimage") ||
    name.includes("temple")
  )
    return "🕉️";
  if (name.includes("hill") || name.includes("mountain")) return "⛰️";
  if (name.includes("heritage") || name.includes("historical")) return "🏛️";
  if (name.includes("luxury") || name.includes("premium")) return "👑";
  if (name.includes("budget") || name.includes("backpack")) return "🎒";
  if (name.includes("family")) return "👨‍👩‍👧‍👦";
  if (name.includes("group") || name.includes("corporate")) return "👥";
  if (name.includes("solo")) return "🧳";
  if (name.includes("weekend") || name.includes("short")) return "📅";
  if (name.includes("cruise") || name.includes("boat")) return "🚢";
  if (name.includes("island")) return "🏝️";
  if (name.includes("desert")) return "🏜️";
  if (name.includes("snow") || name.includes("winter")) return "❄️";
  if (name.includes("summer")) return "☀️";
  if (name.includes("monsoon") || name.includes("rain")) return "🌧️";
  if (
    name.includes("north") ||
    name.includes("kashmir") ||
    name.includes("ladakh")
  )
    return "🏔️";
  if (name.includes("south") || name.includes("kerala")) return "🌴";
  if (name.includes("east") || name.includes("northeast")) return "🌿";
  if (
    name.includes("west") ||
    name.includes("rajasthan") ||
    name.includes("gujarat")
  )
    return "🏰";
  if (name.includes("international") || name.includes("abroad")) return "🌍";
  if (name.includes("domestic") || name.includes("india")) return "🇮🇳";
  return "✨"; // Default emoji
};

// Category Carousel Component
function CategoryCarousel({
  categoryName,
  packages,
}: {
  categoryName: string;
  packages: Package[];
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    const ref = scrollRef.current;
    if (ref) {
      ref.addEventListener("scroll", checkScroll);
      window.addEventListener("resize", checkScroll);
    }
    return () => {
      if (ref) ref.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [packages]);

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const cardWidth = 320;
      const scrollAmount = cardWidth * 2;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  if (packages.length === 0) return null;

  return (
    <div className="category-section">
      <div className="category-header">
        <h2 className="category-title">
          <span className="category-icon">
            {getCategoryEmoji(categoryName)}
          </span>
          {categoryName}
        </h2>
        <div className="category-nav">
          <span className="category-count">
            {packages.length} {packages.length === 1 ? "package" : "packages"}
          </span>
          <div className="carousel-arrows">
            <button
              className={`carousel-arrow ${!canScrollLeft ? "disabled" : ""}`}
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              className={`carousel-arrow ${!canScrollRight ? "disabled" : ""}`}
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              aria-label="Scroll right"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </div>
        </div>
      </div>

      <div className="carousel-wrapper">
        {canScrollLeft && <div className="carousel-fade carousel-fade-left" />}
        <div className="carousel-track" ref={scrollRef}>
          {packages.map((pkg) => (
            <Link
              key={pkg._id || pkg.title}
              href={`/packages/${pkg._id || encodeURIComponent(pkg.title)}`}
              className="carousel-card-link"
            >
              <div className="carousel-card">
                <div className="carousel-card-image">
                  <img
                    src={
                      pkg.image ||
                      pkg.gallery?.[0] ||
                      "/placeholder-package.jpg"
                    }
                    alt={pkg.title}
                  />
                  {pkg.badge && (
                    <span className="carousel-badge carousel-badge-location">
                      {pkg.badge}
                    </span>
                  )}
                  {pkg.featured && (
                    <span className="carousel-badge carousel-badge-featured">
                      ⭐ Featured
                    </span>
                  )}
                </div>
                <div className="carousel-card-content">
                  <h3 className="carousel-card-title">{pkg.title}</h3>
                  <p className="carousel-card-desc">{pkg.description}</p>
                  <div className="carousel-card-details">
                    <div className="carousel-card-detail">
                      <span
                        className="material-symbols-outlined"
                        style={{ color: "#0066cc", fontSize: "1rem" }}
                      >
                        schedule
                      </span>
                      <span>{pkg.duration}</span>
                    </div>
                    <div className="carousel-card-detail">
                      <span
                        className="material-symbols-outlined"
                        style={{ color: "#f43f5e", fontSize: "1rem" }}
                      >
                        location_on
                      </span>
                      <span>{pkg.startingPoint}</span>
                    </div>
                  </div>
                  <div className="carousel-card-footer">
                    <div className="carousel-card-price">
                      {pkg.price && pkg.price > 0 ? (
                        <>
                          <span className="price-amount">
                            {formatInr(pkg.price)}
                          </span>
                          <span className="price-suffix">/person</span>
                        </>
                      ) : (
                        <span className="price-enquire">Enquire</span>
                      )}
                    </div>
                    <button className="carousel-view-btn">
                      View
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "0.875rem" }}
                      >
                        arrow_forward
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {canScrollRight && (
          <div className="carousel-fade carousel-fade-right" />
        )}
      </div>
    </div>
  );
}

// Mobile responsive styles for packages page
const packagesPageStyles = `
  /* ===== PACKAGES PAGE - CATEGORY CAROUSEL STYLES ===== */
  
  /* Hero Section */
  .packages-hero {
    position: relative;
    height: 86vh;
    min-height: 600px;
    background-size: cover;
    background-position: center;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    margin: 0;
  }
  
  .packages-hero::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, rgba(15, 23, 42, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%);
    z-index: 1;
  }
  
  .packages-hero-content {
    position: relative;
    z-index: 2;
    text-align: center;
    max-width: 800px;
    width: 100%;
  }
  
  .packages-hero h1 {
    font-size: clamp(1.75rem, 5vw, 3rem);
    font-weight: 800;
    color: white;
    margin-bottom: 0.75rem;
    text-shadow: 0 2px 20px rgba(0,0,0,0.3);
  }
  
  .packages-hero p {
    font-size: clamp(0.9rem, 2vw, 1.1rem);
    color: rgba(255,255,255,0.9);
    margin-bottom: 1.5rem;
  }

  /* Search Box */
  .packages-search-box {
    background: rgba(255,255,255,0.95);
    backdrop-filter: blur(10px);
    border-radius: 1rem;
    padding: 1rem;
    box-shadow: 0 10px 40px rgba(0,0,0,0.2);
  }
  
  .packages-search-content {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  .packages-search-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: #f8fafc;
    border-radius: 0.5rem;
    border: 1px solid #e2e8f0;
  }
  
  .packages-search-item span {
    color: #64748b;
    font-size: 1.25rem;
  }
  
  .packages-search-item input,
  .packages-search-item select {
    flex: 1;
    border: none;
    background: transparent;
    font-size: 0.875rem;
    color: #1e293b;
    outline: none;
  }
  
  .packages-search-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: linear-gradient(135deg, #0066cc, #0052a3);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-weight: 600;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .packages-search-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,102,204,0.3);
  }

  /* Category Section */
  .category-section {
    width: 100%;
    padding: 2rem 1rem;
    border-bottom: 1px solid #f1f5f9;
  }
  
  .category-section:last-child {
    border-bottom: none;
  }
  
  .category-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.25rem;
    padding: 0 0.5rem;
  }
  
  .category-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 1.35rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0;
  }
  
  .category-icon {
    font-size: 1.5rem;
  }
  
  .category-nav {
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  
  .category-count {
    font-size: 0.8rem;
    color: #64748b;
    background: #f1f5f9;
    padding: 0.35rem 0.75rem;
    border-radius: 1rem;
    font-weight: 500;
  }
  
  .carousel-arrows {
    display: flex;
    gap: 0.5rem;
  }
  
  .carousel-arrow {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    border: 2px solid #e2e8f0;
    background: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s;
    color: #1e293b;
  }
  
  .carousel-arrow:hover:not(.disabled) {
    background: #0066cc;
    border-color: #0066cc;
    color: white;
  }
  
  .carousel-arrow.disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
  
  .carousel-arrow span {
    font-size: 1.5rem;
  }

  /* Carousel */
  .carousel-wrapper {
    position: relative;
    overflow: hidden;
  }
  
  .carousel-track {
    display: flex;
    gap: 1rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scrollbar-width: none;
    -ms-overflow-style: none;
    padding: 0.5rem;
  }
  
  .carousel-track::-webkit-scrollbar {
    display: none;
  }
  
  .carousel-fade {
    position: absolute;
    top: 0;
    bottom: 0;
    width: 60px;
    pointer-events: none;
    z-index: 2;
  }
  
  .carousel-fade-left {
    left: 0;
    background: linear-gradient(to right, white, transparent);
  }
  
  .carousel-fade-right {
    right: 0;
    background: linear-gradient(to left, white, transparent);
  }
  
  .carousel-card-link {
    text-decoration: none;
    color: inherit;
    flex-shrink: 0;
    scroll-snap-align: start;
  }

  /* Carousel Card */
  .carousel-card {
    width: 280px;
    background: white;
    border-radius: 1rem;
    overflow: hidden;
    box-shadow: 0 2px 12px rgba(0,0,0,0.08);
    border: 1px solid #f1f5f9;
    transition: all 0.3s ease;
  }
  
  .carousel-card:hover {
    transform: translateY(-6px);
    box-shadow: 0 12px 32px rgba(0,0,0,0.12);
  }
  
  .carousel-card-image {
    position: relative;
    height: 180px;
    overflow: hidden;
  }
  
  .carousel-card-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }
  
  .carousel-card:hover .carousel-card-image img {
    transform: scale(1.08);
  }
  
  .carousel-badge {
    position: absolute;
    padding: 0.3rem 0.6rem;
    border-radius: 0.4rem;
    font-size: 0.7rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  
  .carousel-badge-location {
    top: 0.75rem;
    left: 0.75rem;
    background: rgba(255,255,255,0.95);
    color: #0066cc;
  }
  
  .carousel-badge-featured {
    top: 0.75rem;
    right: 0.75rem;
    background: linear-gradient(135deg, #fbbf24, #f59e0b);
    color: #78350f;
  }
  
  .carousel-card-content {
    padding: 1rem;
  }
  
  .carousel-card-title {
    font-size: 1rem;
    font-weight: 700;
    color: #1e293b;
    margin: 0 0 0.5rem;
    line-height: 1.3;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .carousel-card-desc {
    font-size: 0.8rem;
    color: #64748b;
    margin: 0 0 0.75rem;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .carousel-card-details {
    display: flex;
    gap: 1rem;
    margin-bottom: 0.75rem;
  }
  
  .carousel-card-detail {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.75rem;
    color: #64748b;
  }
  
  .carousel-card-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 0.75rem;
    border-top: 1px solid #f1f5f9;
  }
  
  .carousel-card-price {
    display: flex;
    flex-direction: column;
  }
  
  .price-amount {
    font-size: 1.1rem;
    font-weight: 700;
    color: #0066cc;
  }
  
  .price-suffix {
    font-size: 0.7rem;
    color: #94a3b8;
  }
  
  .price-enquire {
    font-size: 0.9rem;
    font-weight: 600;
    color: #0066cc;
  }
  
  .carousel-view-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 0.75rem;
    background: linear-gradient(135deg, #0066cc, #0052a3);
    color: white;
    border: none;
    border-radius: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  
  .carousel-view-btn:hover {
    background: linear-gradient(135deg, #0052a3, #003d7a);
  }

  /* Loading State */
  .loading-section {
    padding: 2rem 1rem;
  }
  
  .skeleton-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }
  
  .skeleton-line {
    background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
    border-radius: 0.25rem;
  }
  
  .skeleton-track {
    display: flex;
    gap: 1rem;
    overflow: hidden;
    padding: 0.5rem;
  }
  
  .skeleton-card {
    flex-shrink: 0;
    width: 280px;
    background: #f8fafc;
    border-radius: 1rem;
    overflow: hidden;
  }
  
  .skeleton-image {
    height: 180px;
    background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
    background-size: 200% 100%;
    animation: shimmer 1.5s ease-in-out infinite;
  }
  
  .skeleton-content {
    padding: 1rem;
  }
  
  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  /* Empty State */
  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #64748b;
  }
  
  .empty-state-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
  }
  
  .empty-state h3 {
    font-size: 1.25rem;
    color: #1e293b;
    margin-bottom: 0.5rem;
  }
  
  .empty-state p {
    font-size: 0.9rem;
  }

  /* ===== RESPONSIVE BREAKPOINTS ===== */
  
  @media (min-width: 640px) {
    .packages-hero {
      margin: 0.75rem;
      border-radius: 1.25rem;
    }
    
    .packages-search-content {
      flex-direction: row;
      flex-wrap: wrap;
    }
    
    .packages-search-item {
      flex: 1;
      min-width: 150px;
    }
    
    .packages-search-btn {
      flex: 0 0 auto;
    }
    
    .carousel-card {
      width: 300px;
    }
    
    .carousel-card-image {
      height: 200px;
    }
    
    .category-title {
      font-size: 1.5rem;
    }
    
    .category-section {
      padding: 2rem 1.5rem;
    }
  }
  
  @media (min-width: 1024px) {
    .packages-hero {
      margin: 1rem;
      padding: 3rem 2rem;
    }
    
    .carousel-card {
      width: 320px;
    }
    
    .category-section {
      padding: 2.5rem 2rem;
    }
    
    .category-title {
      font-size: 1.75rem;
    }
  }
  
  @media (max-width: 640px) {
    .category-header {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.75rem;
    }
    
    .category-nav {
      width: 100%;
      justify-content: space-between;
    }
    
    .carousel-arrow {
      width: 36px;
      height: 36px;
    }
    
    .carousel-arrow span {
      font-size: 1.25rem;
    }
    
    .carousel-card {
      width: 260px;
    }
    
    .carousel-card-image {
      height: 160px;
    }
  }
  
  /* Touch device optimizations */
  @media (hover: none) {
    .carousel-card:hover {
      transform: none;
    }
    
    .carousel-card:active {
      transform: scale(0.98);
    }
    
    .carousel-view-btn:hover {
      background: linear-gradient(135deg, #0066cc, #0052a3);
    }
    
    .carousel-view-btn:active {
      background: linear-gradient(135deg, #0052a3, #003d7a);
    }
    
    .destination-item:hover {
      transform: none;
    }
    
    .destination-item:active {
      transform: scale(0.95);
    }
  }

  /* Destinations Section */
  .destinations-section {
    padding: 1.5rem 1rem;
  }
  
  .destinations-title {
    font-size: clamp(1.25rem, 4vw, 1.75rem);
    font-weight: 700;
    color: #1f2937;
    text-align: center;
    margin-bottom: 1.25rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }
  
  .destinations-grid {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
  
  .destination-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    transition: transform 0.3s ease;
  }
  
  .destination-item:hover {
    transform: scale(1.05);
  }
  
  .destination-image-wrapper {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid transparent;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }
  
  .destination-image-wrapper.selected {
    border-color: #0066cc;
    box-shadow: 0 6px 25px rgba(0, 102, 204, 0.35);
  }
  
  .destination-image-wrapper img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .destination-name {
    margin-top: 0.5rem;
    font-size: 0.75rem;
    font-weight: 600;
    color: #374151;
    text-align: center;
    transition: color 0.3s ease;
  }
  
  .destination-name.selected {
    color: #0066cc;
  }
  
  .clear-filter-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1rem;
    background: #f3f4f6;
    border: 1px solid #d1d5db;
    border-radius: 2rem;
    font-size: 0.8rem;
    font-weight: 500;
    color: #4b5563;
    cursor: pointer;
    transition: all 0.2s ease;
    margin-top: 1rem;
  }
  
  .clear-filter-btn:hover {
    background: #e5e7eb;
  }

  @media (min-width: 640px) {
    .destination-image-wrapper {
      width: 90px;
      height: 90px;
    }
    
    .destination-name {
      font-size: 0.85rem;
    }
    
    .destinations-grid {
      gap: 1.5rem;
    }
  }
  
  @media (min-width: 768px) {
    .destination-image-wrapper {
      width: 110px;
      height: 110px;
    }
    
    .destination-name {
      font-size: 0.9rem;
      margin-top: 0.75rem;
    }
  }
  
  @media (min-width: 1024px) {
    .destination-image-wrapper {
      width: 130px;
      height: 130px;
    }
    
    .destinations-section {
      padding: 2rem 1.5rem;
    }
  }
`;

export default function Packages() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState<string>("all");
  const [selectedDestination, setSelectedDestination] = useState<string>("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [packagesRes, categoriesRes, destinationsRes] = await Promise.all(
          [
            fetch("/api/packages", { cache: "no-store" }),
            fetch("/api/admin/categories", { cache: "no-store" }),
            fetch("/api/destinations", { cache: "no-store" }),
          ],
        );

        if (packagesRes.ok) {
          const data = await packagesRes.json();
          setPackages(Array.isArray(data) ? data : []);
        } else {
          const errorData = await packagesRes.json();
          console.error(
            "Failed to fetch packages:",
            packagesRes.status,
            errorData,
          );
        }

        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(
            Array.isArray(data)
              ? data.filter((c: Category) => c.active !== false)
              : [],
          );
        } else {
          const errorData = await categoriesRes.json();
          console.error(
            "Failed to fetch categories:",
            categoriesRes.status,
            errorData,
          );
        }

        if (destinationsRes.ok) {
          const data = await destinationsRes.json();
          setDestinations(Array.isArray(data) ? data : []);
        } else {
          const errorData = await destinationsRes.json();
          console.error(
            "Failed to fetch destinations:",
            destinationsRes.status,
            errorData,
          );
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filter packages based on search, price, and destination
  const filteredPackages = useMemo(() => {
    return packages.filter((pkg) => {
      const matchesSearch = searchQuery
        ? pkg.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.startingPoint
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          pkg.badge?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          pkg.category?.toLowerCase().includes(searchQuery.toLowerCase())
        : true;

      const matchesDestination = selectedDestination
        ? pkg.badge?.toLowerCase() === selectedDestination.toLowerCase()
        : true;

      const matchesPrice = (() => {
        const price = pkg.price || 0;
        if (priceRange === "budget") return price < 15000;
        if (priceRange === "mid") return price >= 15000 && price <= 30000;
        if (priceRange === "luxury") return price > 30000;
        return true;
      })();

      return matchesSearch && matchesDestination && matchesPrice;
    });
  }, [packages, searchQuery, priceRange, selectedDestination]);

  // Group packages by category
  const packagesByCategory = useMemo(() => {
    const grouped: Record<string, Package[]> = {};

    // Initialize with all active categories
    categories.forEach((cat) => {
      grouped[cat.name] = [];
    });

    // Group filtered packages
    filteredPackages.forEach((pkg) => {
      const catName = pkg.category || "Uncategorized";
      if (!grouped[catName]) {
        grouped[catName] = [];
      }
      grouped[catName].push(pkg);
    });

    return grouped;
  }, [filteredPackages, categories]);

  // Get sorted category names based on order
  const sortedCategoryNames = useMemo(() => {
    const categoryOrder = new Map(
      categories.map((c, i) => [c.name, c.order ?? i]),
    );
    return Object.keys(packagesByCategory)
      .filter((catName) => packagesByCategory[catName].length > 0)
      .sort((a, b) => {
        const orderA = categoryOrder.get(a) ?? 999;
        const orderB = categoryOrder.get(b) ?? 999;
        return orderA - orderB;
      });
  }, [packagesByCategory, categories]);

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
      <style>{packagesPageStyles}</style>
      <Header currentPage="packages" />

      <main className="flex flex-col items-center w-full flex-1">
        {/* Hero Section */}
        <div className="w-full px-0 sm:px-2 lg:px-4">
          <div
            className="packages-hero"
            style={{
              backgroundImage: "url('/hero-background.webp')",
            }}
          >
            <div className="packages-hero-content">
              <h1>Explore Our Travel Packages</h1>
              <p>
                Discover handpicked adventures across India&apos;s most
                beautiful destinations
              </p>

              {/* Search Box */}
              <div className="packages-search-box">
                <div className="packages-search-content">
                  <div className="packages-search-item">
                    <span className="material-symbols-outlined">search</span>
                    <input
                      type="text"
                      placeholder="Search packages..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <div className="packages-search-item">
                    <span className="material-symbols-outlined">payments</span>
                    <select
                      value={priceRange}
                      onChange={(e) => setPriceRange(e.target.value)}
                    >
                      <option value="all">All Budgets</option>
                      <option value="budget">Under ₹15,000</option>
                      <option value="mid">₹15,000 - ₹30,000</option>
                      <option value="luxury">Above ₹30,000</option>
                    </select>
                  </div>
                  <button className="packages-search-btn">
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "1.25rem" }}
                    >
                      search
                    </span>
                    Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Destinations Section */}
        <section
          className="destinations-section w-full"
          style={{ maxWidth: "100rem", margin: "0 auto" }}
        >
          <div className="destinations-title">
            <span style={{ fontSize: "1.5rem" }}>🌍</span>
            <span>Destinations</span>
          </div>

          <div className="destinations-grid">
            {loading && (
              <div
                style={{ textAlign: "center", color: "#64748b", width: "100%" }}
              >
                Loading destinations...
              </div>
            )}
            {!loading && destinations.length === 0 && (
              <div
                style={{ textAlign: "center", color: "#64748b", width: "100%" }}
              >
                No destinations available yet.
              </div>
            )}
            {!loading &&
              destinations.map((destination) => (
                <div
                  key={destination._id || destination.name}
                  onClick={() =>
                    setSelectedDestination(
                      selectedDestination === destination.name
                        ? ""
                        : destination.name,
                    )
                  }
                  className="destination-item"
                >
                  <div
                    className={`destination-image-wrapper ${selectedDestination === destination.name ? "selected" : ""}`}
                  >
                    <img
                      src={destination.image || "/placeholder-destination.jpg"}
                      alt={destination.name}
                    />
                  </div>
                  <span
                    className={`destination-name ${selectedDestination === destination.name ? "selected" : ""}`}
                  >
                    {destination.name}
                  </span>
                </div>
              ))}
          </div>

          {selectedDestination && (
            <div style={{ textAlign: "center" }}>
              <button
                onClick={() => setSelectedDestination("")}
                className="clear-filter-btn"
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1rem" }}
                >
                  close
                </span>
                Clear filter: {selectedDestination}
              </button>
            </div>
          )}
        </section>

        {/* Category Carousels */}
        <section
          className="w-full"
          style={{ maxWidth: "100rem", margin: "0 auto" }}
        >
          {loading && (
            <>
              {[1, 2, 3].map((i) => (
                <div key={i} className="loading-section">
                  <div className="skeleton-header">
                    <div
                      className="skeleton-line"
                      style={{ width: "200px", height: "28px" }}
                    />
                    <div
                      className="skeleton-line"
                      style={{ width: "80px", height: "24px" }}
                    />
                  </div>
                  <div className="skeleton-track">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="skeleton-card">
                        <div className="skeleton-image" />
                        <div className="skeleton-content">
                          <div
                            className="skeleton-line"
                            style={{
                              width: "80%",
                              height: "20px",
                              marginBottom: "8px",
                            }}
                          />
                          <div
                            className="skeleton-line"
                            style={{
                              width: "100%",
                              height: "16px",
                              marginBottom: "4px",
                            }}
                          />
                          <div
                            className="skeleton-line"
                            style={{ width: "60%", height: "16px" }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}

          {!loading && sortedCategoryNames.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">📦</div>
              <h3>No Packages Found</h3>
              <p>
                {packages.length === 0
                  ? "No packages available yet. Please check back later."
                  : "No packages match your search criteria. Try adjusting your filters."}
              </p>
            </div>
          )}

          {!loading &&
            sortedCategoryNames.map((categoryName) => (
              <CategoryCarousel
                key={categoryName}
                categoryName={categoryName}
                packages={packagesByCategory[categoryName]}
              />
            ))}
        </section>
      </main>
    </div>
  );
}
