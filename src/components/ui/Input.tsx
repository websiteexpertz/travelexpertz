/**
 * Input Component - Fully Themeable
 */

"use client";

import React from "react";
import styles from "./Input.module.css";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  variant?: "default" | "bordered";
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  variant = "default",
  className,
  disabled,
  ...props
}) => {
  const inputClass = [
    styles.input,
    styles[variant],
    error && styles.error,
    disabled && styles.disabled,
    icon && styles.withIcon,
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={styles.container}>
      {label && (
        <label className={styles.label} htmlFor={props.id}>
          {label}
          {props.required && <span className={styles.required}>*</span>}
        </label>
      )}
      <div className={styles.inputWrapper}>
        {icon && <div className={styles.iconLeft}>{icon}</div>}
        <input className={inputClass} disabled={disabled} {...props} />
      </div>
      {error && <span className={styles.errorText}>{error}</span>}
      {helperText && !error && (
        <span className={styles.helperText}>{helperText}</span>
      )}
    </div>
  );
};

export default Input;
