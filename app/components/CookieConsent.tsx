"use client";

import React, { useEffect, useState } from "react";
import CookieConsent from "react-cookie-consent";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || "G-XXXXXXXXXX";

export default function CookieConsentBanner() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    // Initialize Google Consent Mode v2
    window.dataLayer = window.dataLayer || [];

    // Initialize gtag function if not already present
    if (!window.gtag) {
      window.gtag = function (...args: any[]) {
        window.dataLayer.push(args);
      };
    }

    // Set default consent state to "denied" before user accepts
    const consentSettings = {
      functionality_storage: "denied",
      personalization_storage: "denied",
      security_storage: "denied",
      storage_access_allowed: "denied",
      analytics_storage: "denied",
      ad_storage: "denied",
    };

    window.gtag("consent", "default", consentSettings);
  }, []);

  const handleAccept = () => {
    // Update consent to accepted
    if (window.gtag) {
      window.gtag("consent", "update", {
        functionality_storage: "granted",
        personalization_storage: "granted",
        security_storage: "granted",
        storage_access_allowed: "granted",
        analytics_storage: "granted",
        ad_storage: "granted",
      });
    }

    // Load GA4 script
    loadGA4();

    // Set cookies
    localStorage.setItem("cookie_consent_all", "true");
  };

  const handleDecline = () => {
    // Update consent to decline non-essential
    if (window.gtag) {
      window.gtag("consent", "update", {
        functionality_storage: "granted",
        personalization_storage: "denied",
        security_storage: "granted",
        storage_access_allowed: "granted",
        analytics_storage: "denied",
        ad_storage: "denied",
      });
    }

    localStorage.setItem("cookie_consent_essential", "true");
  };

  const loadGA4 = () => {
    // Remove any existing GA4 scripts
    const existingScript = document.getElementById("ga4-script");
    if (existingScript) {
      existingScript.remove();
    }

    // Initialize gtag if not already present
    window.dataLayer = window.dataLayer || [];
    if (!window.gtag) {
      window.gtag = function (...args: any[]) {
        window.dataLayer.push(args);
      };
    }

    // Create and load GA4 script
    const script = document.createElement("script");
    script.id = "ga4-script";
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
    document.head.appendChild(script);

    // Configure gtag after script loads
    script.onload = () => {
      if (window.gtag) {
        window.gtag("js", new Date());
        window.gtag("config", GA4_ID, {
          page_path: window.location.pathname,
          anonymize_ip: true,
        });
      }
    };
  };

  if (!mounted) return null;

  return (
    <CookieConsent
      location="bottom"
      buttonText="Accept All"
      declineButtonText="Decline"
      cookieName="cookie_consent_banner"
      style={{
        background: "#1f2937",
        color: "#ffffff",
        fontSize: "14px",
        padding: "20px",
        boxShadow: "0 -4px 12px rgba(0, 0, 0, 0.2)",
      }}
      buttonStyle={{
        background: "#0066cc",
        color: "#ffffff",
        border: "none",
        borderRadius: "6px",
        padding: "8px 24px",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "14px",
        marginLeft: "10px",
      }}
      declineButtonStyle={{
        background: "transparent",
        color: "#ffffff",
        border: "1px solid #ffffff",
        borderRadius: "6px",
        padding: "8px 24px",
        cursor: "pointer",
        fontWeight: 600,
        fontSize: "14px",
        marginLeft: "10px",
      }}
      onAccept={handleAccept}
      onDecline={handleDecline}
      expires={365}
      overlay={false}
    >
      <span style={{ marginRight: "20px", display: "inline-block" }}>
        🍪 We use cookies to enhance your experience. This includes analytics
        (Google Analytics 4) and essential functionality. By clicking "Accept
        All," you consent to all cookies.{" "}
        <a
          href="/privacy-policy"
          style={{
            color: "#60a5fa",
            textDecoration: "underline",
            cursor: "pointer",
          }}
        >
          Learn more
        </a>
      </span>
    </CookieConsent>
  );
}

// Global type for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}
