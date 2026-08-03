"use client";

import React, { ReactNode } from "react";

interface PageWrapperProps {
  children: ReactNode;
  isHeroPage?: boolean;
}

/**
 * PageWrapper - Applies proper spacing to pages with fixed navbar
 *
 * Hero pages (/, /hotels, /homestays, /packages):
 * - No top padding, navbar floats over content
 * - Immersive full-screen design
 *
 * Non-hero pages (all others):
 * - Top padding applied to prevent content overlap
 * - Responsive: 90px (desktop), 80px (tablet), 70px (mobile)
 */
export default function PageWrapper({
  children,
  isHeroPage = false,
}: PageWrapperProps) {
  return (
    <main className={isHeroPage ? "" : "page-with-navbar-spacing"}>
      {children}
    </main>
  );
}
