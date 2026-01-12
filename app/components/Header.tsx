"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import HeaderLoggedIn from "./HeaderLoggedIn";

type HeaderProps = {
  currentPage?:
    | "home"
    | "hotels"
    | "packages"
    | "homestays"
    | "deals"
    | "luxury"
    | "verified"
    | "login"
    | "signup"
    | "profile"
    | "bookings"
    | "wishlist"
    | "transactions";
};

const navItems: Array<{
  key: NonNullable<HeaderProps["currentPage"]>;
  label: string;
  href: string;
}> = [
  { key: "home", label: "Home", href: "/" },
  { key: "hotels", label: "Hotels", href: "/hotels" },
  { key: "packages", label: "Packages", href: "/packages" },
  { key: "homestays", label: "Homestays", href: "/homestays" },
  { key: "deals", label: "Deals", href: "/deals" },
  { key: "luxury", label: "Luxury", href: "/luxury" },
  { key: "verified", label: "TE Verified Properties", href: "/verified" },
];

const authItems: Array<{
  key: NonNullable<HeaderProps["currentPage"]>;
  label: string;
  href: string;
}> = [
  { key: "login", label: "Login", href: "/auth/login" },
  { key: "signup", label: "Sign Up", href: "/auth/register" },
];

export default function Header({ currentPage }: HeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        setIsLoggedIn(true);
        setUserName(user.name || user.email || "User");
      } catch (error) {
        setIsLoggedIn(false);
      }
    }
  }, []);

  if (!mounted) {
    return null;
  }

  if (isLoggedIn) {
    const validCurrentPage =
      currentPage === "login" || currentPage === "signup"
        ? undefined
        : currentPage;
    return (
      <HeaderLoggedIn currentPage={validCurrentPage} userName={userName} />
    );
  }

  return (
    <header>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center">
          <Link
            href="/"
            aria-label="TravelExpertz Home"
            className="inline-flex items-center gap-3 transition-transform hover:scale-105"
          >
            <Image
              src="/logo.webp"
              alt="TravelExpertz"
              width={40}
              height={40}
              priority
              className="h-10 w-10 rounded-lg"
            />
          </Link>

          <nav aria-label="Primary" className="flex gap-6 pl-8">
            {navItems.map((item) => {
              const isActive = currentPage === item.key;

              return (
                <Link
                  key={item.key}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className={isActive ? "text-primary" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-10 ml-auto">
            <Link
              href="/auth/login"
              className="inline-flex items-center justify-center"
              style={{
                minWidth: "120px",
                height: "2.75rem",
                backgroundColor: "transparent",
                color: "var(--primary)",
                border: "2px solid var(--primary)",
                borderRadius: "0.5rem",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                padding: "0.5rem 1.5rem",
                marginRight: "1rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--primary)";
                e.currentTarget.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
                e.currentTarget.style.color = "var(--primary)";
              }}
            >
              Login
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex items-center justify-center"
              style={{
                minWidth: "120px",
                height: "2.75rem",
                backgroundColor: "var(--primary)",
                color: "white",
                border: "2px solid var(--primary)",
                borderRadius: "0.5rem",
                fontWeight: 600,
                fontSize: "0.95rem",
                cursor: "pointer",
                transition: "all 0.2s ease",
                padding: "0.5rem 1.5rem",
                boxShadow: "0 2px 8px rgba(0, 102, 204, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "var(--primary-dark)";
                e.currentTarget.style.borderColor = "var(--primary-dark)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(0, 102, 204, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--primary)";
                e.currentTarget.style.borderColor = "var(--primary)";
                e.currentTarget.style.boxShadow =
                  "0 2px 8px rgba(0, 102, 204, 0.3)";
              }}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
