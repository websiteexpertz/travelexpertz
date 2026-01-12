/**
 * FAQ Section Component
 */

"use client";

import React, { useState, useEffect } from "react";
import styles from "./FAQSection.module.css";

interface FAQ {
  _id?: string;
  id?: string;
  question: string;
  answer: string;
  category: string;
  order: number;
  active: boolean;
}

interface FAQSectionProps {
  title?: string;
  faqs?: FAQ[];
}

export const FAQSection: React.FC<FAQSectionProps> = ({
  title = "Frequently Asked Questions",
  faqs: propFAQs = [],
}) => {
  const [faqs, setFAQs] = useState<FAQ[]>(propFAQs);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const subtitle =
    "Find answers to common questions about booking flights, hotels, and managing your travel plans.";

  // Fetch FAQs from database
  useEffect(() => {
    const fetchFAQs = async () => {
      try {
        const response = await fetch("/api/faqs", {
          cache: "no-store",
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Fetched FAQs:", data);
          const faqList = Array.isArray(data)
            ? data
            : Array.isArray(data.data)
            ? data.data
            : [];
          console.log("Processed FAQs:", faqList);
          if (Array.isArray(faqList) && faqList.length > 0) {
            setFAQs(faqList);
          }
        }
      } catch (error) {
        console.log("Using default FAQs", error);
      } finally {
        setLoading(false);
      }
    };

    fetchFAQs();
  }, []);

  // Get unique categories
  const categories = Array.from(
    new Set(faqs.map((faq) => faq.category))
  ).sort();

  // Filter FAQs based on search and category
  const filteredFAQs = faqs.filter((faq) => {
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      !selectedCategory || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleFAQ = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.subtitle}>{subtitle}</p>

        {/* Search Bar */}
        <div className={styles.searchContainer}>
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setExpandedIndex(null);
            }}
            className={styles.searchInput}
          />
          <span className={styles.searchIcon}>🔍</span>
        </div>

        {/* Category Filter */}
        <div className={styles.categoryFilter}>
          <button
            className={`${styles.categoryBtn} ${
              !selectedCategory ? styles.active : ""
            }`}
            onClick={() => {
              setSelectedCategory(null);
              setExpandedIndex(null);
            }}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category}
              className={`${styles.categoryBtn} ${
                selectedCategory === category ? styles.active : ""
              }`}
              onClick={() => {
                setSelectedCategory(category);
                setExpandedIndex(null);
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Grid */}
        <div className={styles.faqGrid}>
          {filteredFAQs.length > 0 ? (
            filteredFAQs.map((faq, index) => (
              <div key={faq._id || faq.id || index} className={styles.faqItem}>
                <button
                  className={`${styles.faqQuestion} ${
                    expandedIndex === index ? styles.expanded : ""
                  }`}
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={expandedIndex === index}
                >
                  <span className={styles.questionText}>{faq.question}</span>
                  <span className={styles.icon} aria-hidden="true"></span>
                </button>
                {expandedIndex === index && (
                  <div className={styles.faqAnswer}>
                    <p>{faq.answer}</p>
                    <span className={styles.categoryTag}>{faq.category}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className={styles.noResults}>
              <p>No FAQs found matching your search.</p>
              <p className={styles.noResultsSubtext}>
                Try different keywords or select another category.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
