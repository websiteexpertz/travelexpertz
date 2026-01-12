/**
 * Testimonials Section Component
 */

"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import styles from "./TestimonialsSection.module.css";

interface Testimonial {
  _id?: string;
  id?: string;
  name: string;
  location: string;
  image: string;
  rating: number;
  text: string;
}

interface TestimonialsSectionProps {
  title?: string;
  testimonials?: Testimonial[];
}

export const TestimonialsSection: React.FC<TestimonialsSectionProps> = ({
  title = "What Our Travelers Say",
  testimonials: propTestimonials = [],
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testimonials, setTestimonials] =
    useState<Testimonial[]>(propTestimonials);
  const [loading, setLoading] = useState(true);

  const subtitle =
    "Explore breathtaking destinations and get inspired for your next adventure. Let us help you turn your travel dreams into unforgettable memories.";

  // Fetch testimonials from database
  useEffect(() => {
    const fetchTestimonials = async () => {
      try {
        const response = await fetch("/api/testimonials", {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched testimonials:", data);
          // Handle both array response and object response
          const testimonialList = Array.isArray(data)
            ? data
            : Array.isArray(data.data)
            ? data.data
            : [];
          console.log("Processed testimonials:", testimonialList);
          if (Array.isArray(testimonialList) && testimonialList.length > 0) {
            setTestimonials(testimonialList);
          }
        }
      } catch (error) {
        console.log("Using default testimonials", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTestimonials();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [testimonials.length]);

  const currentTestimonial = testimonials[currentIndex];

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>

        <div className={styles.carouselContainer}>
          <div key={currentTestimonial.id} className={styles.testimonialCard}>
            {/* Rating */}
            <div className={styles.rating}>
              {Array(currentTestimonial.rating)
                .fill(0)
                .map((_, i) => (
                  <span key={i}>⭐</span>
                ))}
            </div>

            {/* Text */}
            <p className={styles.text}>"{currentTestimonial.text}"</p>

            {/* Author */}
            <div className={styles.author}>
              <div className={styles.authorImage}>
                <Image
                  src={currentTestimonial.image}
                  alt={currentTestimonial.name}
                  width={56}
                  height={56}
                />
              </div>
              <div className={styles.authorInfo}>
                <h4 className={styles.authorName}>{currentTestimonial.name}</h4>
                <p className={styles.authorLocation}>
                  {currentTestimonial.location}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
