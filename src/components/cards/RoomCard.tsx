/**
 * Room Card Component - Displays room info for property details
 */

"use client";

import React from "react";
import Image from "next/image";
import styles from "./RoomCard.module.css";
import { Button } from "../ui/Button";
import { Card } from "../ui/Card";

interface RoomCardProps {
  id: string;
  name: string;
  image: string;
  description: string;
  maxGuests: number;
  price: number;
  amenities?: string[];
  onBook?: (roomId: string) => void;
}

export const RoomCard: React.FC<RoomCardProps> = ({
  id,
  name,
  image,
  description,
  maxGuests,
  price,
  amenities = [],
  onBook,
}) => {
  return (
    <Card
      variant="elevated"
      padding="none"
      hoverable
      className={styles.roomCard}
    >
      <div className={styles.layout}>
        {/* Image */}
        <div className={styles.imageContainer}>
          <Image
            src={image}
            alt={name}
            fill
            className={styles.image}
            sizes="(max-width: 640px) 100vw, 300px"
          />
        </div>

        {/* Content */}
        <div className={styles.content}>
          <h3 className={styles.name}>{name}</h3>
          <p className={styles.description}>{description}</p>

          {/* Info Row */}
          <div className={styles.infoRow}>
            <div className={styles.infoBadge}>
              <span className={styles.icon}>👥</span>
              <span>{maxGuests} guests</span>
            </div>
          </div>

          {/* Amenities */}
          {amenities.length > 0 && (
            <div className={styles.amenities}>
              {amenities.slice(0, 4).map((amenity, idx) => (
                <span key={idx} className={styles.amenityIcon}>
                  {amenity}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className={styles.footer}>
            <div className={styles.priceSection}>
              <span className={styles.price}>₹{price.toLocaleString()}</span>
              <span className={styles.perNight}>per night</span>
            </div>
            <Button size="small" variant="primary" onClick={() => onBook?.(id)}>
              Book Now
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default RoomCard;
