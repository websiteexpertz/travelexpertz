/**
 * Auth Form Component - Login/Signup form
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./AuthForm.module.css";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Card } from "../ui/Card";

interface AuthFormProps {
  type: "login" | "signup";
  onSubmit?: (data: AuthFormData) => void;
  loading?: boolean;
}

interface AuthFormData {
  email?: string;
  mobile?: string;
  password?: string;
  confirmPassword?: string;
  fullName?: string;
  agreeToTerms?: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  type = "login",
  onSubmit,
  loading = false,
}) => {
  const [formData, setFormData] = useState<AuthFormData>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loginMethod, setLoginMethod] = useState<"email" | "mobile">("email");

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (loginMethod === "email" && !formData.email) {
      newErrors.email = "Email is required";
    }
    if (loginMethod === "mobile" && !formData.mobile) {
      newErrors.mobile = "Mobile number is required";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }

    if (type === "signup") {
      if (!formData.fullName) {
        newErrors.fullName = "Full name is required";
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match";
      }
      if (!formData.agreeToTerms) {
        newErrors.agreeToTerms = "You must agree to terms and conditions";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit?.(formData);
    }
  };

  const updateField = (key: keyof AuthFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key];
        return newErrors;
      });
    }
  };

  return (
    <Card variant="elevated" padding="lg" className={styles.card}>
      <div className={styles.container}>
        <h2 className={styles.title}>
          {type === "login" ? "Welcome Back" : "Create Account"}
        </h2>

        <p className={styles.subtitle}>
          {type === "login"
            ? "Sign in to continue to TravelExpertz"
            : "Join us to start booking your next adventure"}
        </p>

        <form onSubmit={handleSubmit} className={styles.form}>
          {/* Full Name - Signup Only */}
          {type === "signup" && (
            <Input
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              value={formData.fullName || ""}
              onChange={(e) => updateField("fullName", e.target.value)}
              error={errors.fullName}
              required
            />
          )}

          {/* Login Method Toggle */}
          {type === "login" && (
            <div className={styles.toggleGroup}>
              <button
                type="button"
                className={`${styles.toggle} ${
                  loginMethod === "email" ? styles.active : ""
                }`}
                onClick={() => setLoginMethod("email")}
              >
                Email
              </button>
              <button
                type="button"
                className={`${styles.toggle} ${
                  loginMethod === "mobile" ? styles.active : ""
                }`}
                onClick={() => setLoginMethod("mobile")}
              >
                Mobile
              </button>
            </div>
          )}

          {/* Email or Mobile */}
          {loginMethod === "email" || type === "signup" ? (
            <Input
              label={type === "signup" ? "Email Address" : "Email"}
              type="email"
              placeholder="your@email.com"
              value={formData.email || ""}
              onChange={(e) => updateField("email", e.target.value)}
              error={errors.email}
              required={type === "signup" || loginMethod === "email"}
            />
          ) : (
            <Input
              label="Mobile Number"
              type="tel"
              placeholder="+91 9876543210"
              value={formData.mobile || ""}
              onChange={(e) => updateField("mobile", e.target.value)}
              error={errors.mobile}
              required
            />
          )}

          {/* Password */}
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password || ""}
            onChange={(e) => updateField("password", e.target.value)}
            error={errors.password}
            required
          />

          {/* Confirm Password - Signup Only */}
          {type === "signup" && (
            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              value={formData.confirmPassword || ""}
              onChange={(e) => updateField("confirmPassword", e.target.value)}
              error={errors.confirmPassword}
              required
            />
          )}

          {/* Terms & Conditions - Signup Only */}
          {type === "signup" && (
            <div className={styles.checkbox}>
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreeToTerms || false}
                onChange={(e) => updateField("agreeToTerms", e.target.checked)}
              />
              <label htmlFor="terms">
                I agree to the <Link href="/terms">Terms & Conditions</Link>
              </label>
              {errors.agreeToTerms && (
                <span className={styles.error}>{errors.agreeToTerms}</span>
              )}
            </div>
          )}

          {/* Submit Button */}
          <Button variant="primary" fullWidth loading={loading} type="submit">
            {type === "login" ? "Sign In" : "Create Account"}
          </Button>

          {/* Forgot Password - Login Only */}
          {type === "login" && (
            <Link href="/forgot-password" className={styles.link}>
              Forgot your password?
            </Link>
          )}

          {/* Toggle Form Link */}
          <p className={styles.toggleText}>
            {type === "login"
              ? "Don't have an account? "
              : "Already have an account? "}
            <Link href={type === "login" ? "/signup" : "/login"}>
              {type === "login" ? "Sign up" : "Sign in"}
            </Link>
          </p>
        </form>

        {/* Divider */}
        <div className={styles.divider}>
          <span>Or continue with</span>
        </div>

        {/* Social Login */}
        <div className={styles.socialLogins}>
          <button
            className={styles.socialBtn}
            aria-label="Continue with Google"
          >
            G
          </button>
          <button
            className={styles.socialBtn}
            aria-label="Continue with GitHub"
          >
            ⚙
          </button>
          <button className={styles.socialBtn} aria-label="Continue with Apple">
            A
          </button>
        </div>
      </div>
    </Card>
  );
};

export default AuthForm;
