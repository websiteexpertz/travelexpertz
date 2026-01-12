/**
 * Hotel Card Component - Displays hotel info in listing
 */

"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import styles from "./HotelCard.module.css";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface HotelCardProps {
  id: string;
  image: string;
  name: string;
  location: string;
  rating: number;
  reviewCount: number;
  price: number;
  amenities?: string[];
  featured?: boolean;
  onBookmark?: (id: string) => void;
  isBookmarked?: boolean;
}

export const HotelCard: React.FC<HotelCardProps> = ({
  id,
  image,
  name,
  location,
  rating,
  reviewCount,
  price,
  amenities = [],
  featured = false,
  onBookmark,
  isBookmarked = false,
}) => {
  return (
    <Card
      variant="elevated"
      padding="none"
      hoverable
      className={styles.hotelCard}
    >
      {/* Image Container */}
      <div className={styles.imageContainer}>
        <Image
          src={image}
          alt={name}
          fill
          className={styles.image}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {featured && <span className={styles.badge}>Featured</span>}
        <button
          className={`${styles.wishlistBtn} ${
            isBookmarked ? styles.bookmarked : ""
          }`}
          onClick={() => onBookmark?.(id)}
          aria-label="Add to wishlist"
        >
          ♡
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.name}>{name}</h3>
            <p className={styles.location}>📍 {location}</p>
          </div>
          <div className={styles.rating}>
            <span className={styles.score}>{rating}</span>
            <span className={styles.reviews}>({reviewCount})</span>
          </div>
        </div>

        {/* Amenities */}
        {amenities.length > 0 && (
          <div className={styles.amenities}>
            {amenities.slice(0, 3).map((amenity, idx) => (
              <span key={idx} className={styles.amenityTag}>
                {amenity}
              </span>
            ))}
            {amenities.length > 3 && (
              <span className={styles.amenityTag}>+{amenities.length - 3}</span>
            )}
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.price}>
            <span className={styles.amount}>₹{price.toLocaleString()}</span>
            <span className={styles.perNight}>per night</span>
          </div>
          <Link href={`/property/${id}`}>
            <Button size="small" variant="primary">
              View Details
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default HotelCard;
