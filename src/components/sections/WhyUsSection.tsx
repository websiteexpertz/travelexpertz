/**
 * Why Us Section Component
 */

"use client";

import React from "react";
import styles from "./WhyUsSection.module.css";
import { Card } from "../ui/Card";

interface Feature {
  id: string;
  icon: string;
  title: string;
  description: string;
}

interface WhyUsSectionProps {
  title?: string;
  subtitle?: string;
  features?: Feature[];
}

const defaultFeatures: Feature[] = [
  {
    id: "1",
    icon: "🏆",
    title: "Best Prices",
    description: "We guarantee the lowest prices with price match guarantee",
  },
  {
    id: "2",
    icon: "🛡️",
    title: "Secure Booking",
    description: "Your bookings are 100% secure with encrypted payments",
  },
  {
    id: "3",
    icon: "📞",
    title: "24/7 Support",
    description: "Our dedicated support team is always available to help",
  },
  {
    id: "4",
    icon: "⚡",
    title: "Instant Confirmation",
    description: "Get instant booking confirmation and updates",
  },
  {
    id: "5",
    icon: "✅",
    title: "Verified Properties",
    description: "All properties are verified and vetted by our team",
  },
  {
    id: "6",
    icon: "🎁",
    title: "Exclusive Deals",
    description: "Access exclusive deals and special offers for members",
  },
];

export const WhyUsSection: React.FC<WhyUsSectionProps> = ({
  title = "Why Choose TravelExpertz?",
  subtitle = "We make travel booking simple, secure, and affordable",
  features = defaultFeatures,
}) => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.subtitle}>{subtitle}</p>
        </div>

        {/* Features Grid */}
        <div className={styles.grid}>
          {features.map((feature) => (
            <Card
              key={feature.id}
              variant="flat"
              padding="lg"
              className={styles.featureCard}
            >
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>{feature.title}</h3>
              <p className={styles.featureDescription}>{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyUsSection;
