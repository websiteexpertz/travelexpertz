"use client";

import { useEffect } from "react";

const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || "G-XXXXXXXXXX";

export default function GoogleAnalytics() {
  useEffect(() => {
    // Check if user has already accepted cookies
    const consentGiven = localStorage.getItem("cookie_consent_all") === "true";

    if (consentGiven) {
      // Initialize gtag if not already done
      if (!window.gtag) {
        window.dataLayer = window.dataLayer || [];
        function gtag(...args: any[]) {
          window.dataLayer.push(arguments);
        }
        window.gtag = gtag;
      }

      // Load GA4 script
      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
      document.head.appendChild(script);

      // Initialize GA4 config
      window.gtag("js", new Date());
      window.gtag("config", GA4_ID, {
        page_path: window.location.pathname,
        anonymize_ip: true,
      });

      // Update Google Consent Mode
      window.gtag("consent", "update", {
        analytics_storage: "granted",
      });
    } else {
      // Initialize consent mode without GA4
      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;

      gtag("consent", "default", {
        analytics_storage: "denied",
      });
    }
  }, []);

  return null;
}

// Global type for gtag
declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}
