/**
 * Layout Example - Main App Layout
 */

"use client";

import React, { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { Button } from "../ui/Button";
import styles from "./Layout.module.css";

interface LayoutProps {
  children: ReactNode;
  showNavbar?: boolean;
  showFooter?: boolean;
  navItems?: Array<{ label: string; href: string }>;
}

const navItems = [
  { label: "Hotels", href: "/hotels" },
  { label: "Flights", href: "/flights" },
  { label: "Destinations", href: "/destinations" },
  { label: "Contact", href: "/contact" },
];

const footerColumns = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Contact Us", href: "/contact" },
      { label: "FAQ", href: "/faq" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", href: "/privacy" },
      { label: "Terms", href: "/terms" },
      { label: "Cookies", href: "/cookies" },
    ],
  },
];

const socialLinks = [
  { icon: "👍", href: "https://facebook.com", label: "Facebook" },
  { icon: "🐦", href: "https://twitter.com", label: "Twitter" },
  { icon: "📸", href: "https://instagram.com", label: "Instagram" },
];

export const Layout: React.FC<LayoutProps> = ({
  children,
  showNavbar = true,
  showFooter = true,
  navItems: customNavItems,
}) => {
  return (
    <div className={styles.layout}>
      {showNavbar && (
        <Navbar
          logo="🏨 TravelExpertz"
          navItems={customNavItems || navItems}
          userMenu={
            <div className={styles.userMenu}>
              <Button
                variant="outline"
                size="small"
                onClick={() => (window.location.href = "/login")}
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="small"
                onClick={() => (window.location.href = "/signup")}
              >
                Sign Up
              </Button>
            </div>
          }
        />
      )}

      <main className={styles.main}>{children}</main>

      {showFooter && (
        <Footer columns={footerColumns} socialLinks={socialLinks} />
      )}
    </div>
  );
};

export default Layout;
