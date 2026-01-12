/**
 * Button Component - Fully Themeable
 * Supports: primary, secondary, outline, text variants
 * Sizes: small, base, large
 */

"use client";

import React from "react";
import { theme } from "@/config/theme";
import styles from "./Button.module.css";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "text" | "danger";
  size?: "small" | "base" | "large";
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "base",
  fullWidth = false,
  loading = false,
  icon,
  iconPosition = "left",
  disabled = false,
  children,
  className,
  ...props
}) => {
  const buttonClass = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    (disabled || loading) && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={buttonClass} disabled={disabled || loading} {...props}>
      {loading ? (
        <span className={styles.loader}>⏳</span>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className={styles.icon}>{icon}</span>
          )}
          <span>{children}</span>
          {icon && iconPosition === "right" && (
            <span className={styles.icon}>{icon}</span>
          )}
        </>
      )}
    </button>
  );
};

export default Button;
