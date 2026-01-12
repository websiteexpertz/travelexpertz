/**
 * Card Component - Base component for all card layouts
 */

"use client";

import React from "react";
import styles from "./Card.module.css";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "outlined" | "flat";
  padding?: "sm" | "md" | "lg" | "none";
  hoverable?: boolean;
  children: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  variant = "default",
  padding = "md",
  hoverable = false,
  children,
  className,
  ...props
}) => {
  const cardClass = [
    styles.card,
    styles[variant],
    styles[`padding-${padding}`],
    hoverable && styles.hoverable,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cardClass} {...props}>
      {children}
    </div>
  );
};

export default Card;
