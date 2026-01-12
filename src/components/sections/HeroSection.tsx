/**
 * Hero Section Component
 */

"use client";

import React from "react";
import Image from "next/image";
import styles from "./HeroSection.module.css";
import { SearchBar } from "./SearchBar";

interface HeroSectionProps {
  backgroundImage?: string;
  title?: string;
  subtitle?: string;
  onSearch?: (params: any) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  backgroundImage = "/hero-banner.png",
  title = "Explore Your Next Adventure",
  subtitle = "Find and book the perfect stay for your journey",
  onSearch,
}) => {
  return (
    <section className={styles.hero}>
      {/* Background Image */}
      <Image
        src={backgroundImage}
        alt="Hero background"
        fill
        className={styles.background}
        priority
        sizes="100vw"
      />

      {/* Overlay */}
      <div className={styles.overlay}></div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.textContainer}>
          <h1 className={styles.title}>{title}</h1>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {/* Search Bar */}
        <SearchBar variant="hero" onSearch={onSearch} />
      </div>
    </section>
  );
};

export default HeroSection;
