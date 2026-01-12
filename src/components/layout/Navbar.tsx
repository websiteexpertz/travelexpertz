/**
 * Navbar Component
 */

"use client";

import React, { useState } from "react";
import Link from "next/link";
import styles from "./Navbar.module.css";
import { Button } from "../ui/Button";

interface NavItem {
  label: string;
  href: string;
}

interface NavbarProps {
  logo?: string;
  navItems?: NavItem[];
  userMenu?: React.ReactNode;
  onMenuToggle?: (isOpen: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  logo = "TravelExpertz",
  navItems = [],
  userMenu,
  onMenuToggle,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    const newState = !isMobileMenuOpen;
    setIsMobileMenuOpen(newState);
    onMenuToggle?.(newState);
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        {/* Logo */}
        <Link href="/" className={styles.logo}>
          {logo}
        </Link>

        {/* Navigation Items */}
        <ul
          className={`${styles.navItems} ${
            isMobileMenuOpen ? styles.mobileOpen : ""
          }`}
        >
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={styles.navLink}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right Section */}
        <div className={styles.rightSection}>
          {userMenu && <div className={styles.userMenu}>{userMenu}</div>}
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className={`${styles.hamburger} ${
            isMobileMenuOpen ? styles.active : ""
          }`}
          onClick={handleMenuToggle}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
