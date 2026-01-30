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

interface Package {
  _id: string;
  title?: string;
  name?: string;
  description: string;
  duration: string;
  location: string;
  category?: string;
  badge: string;
  image: string;
  price?: number;
  comingSoon?: boolean;
}

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
  const [packages, setPackages] = useState<Package[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fetch packages from packages_list collection
  const fetchPackages = async () => {
    try {
      setPackagesLoading(true);
      const response = await fetch("/api/packages");
      if (response.ok) {
        const data = await response.json();
        setPackages(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching packages:", error);
    } finally {
      setPackagesLoading(false);
    }
  };

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
    // Fetch packages on mount
    fetchPackages();
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
    <>
      <header style={{ position: "relative" }}>
        <div className="max-w-7xl mx-auto" style={{ position: "relative" }}>
          <div className="flex items-center">
            <Link
              href="/"
              aria-label="TravelExpertz Home"
              className="inline-flex items-center gap-3 transition-transform hover:scale-105"
            >
              <Image
                src="/logo.webp"
                alt="TravelExpertz"
                width={70}
                height={70}
                priority
                className="h-10 w-10 rounded-lg"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav aria-label="Primary" className="hidden md:flex gap-6 pl-8">
              {navItems.map((item) => {
                const isActive = currentPage === item.key;

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={isActive ? "text-primary" : undefined}
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: "500",
                      padding: "0.5rem 0.25rem",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Auth Buttons */}
            <div className="hidden md:flex items-center gap-10 ml-auto">
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center"
                style={{
                  minWidth: "130px",
                  height: "3rem",
                  backgroundColor: "transparent",
                  color: "var(--primary)",
                  border: "2px solid var(--primary)",
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                  fontSize: "1rem",
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
                  minWidth: "130px",
                  height: "3rem",
                  backgroundColor: "var(--primary)",
                  color: "white",
                  border: "2px solid var(--primary)",
                  borderRadius: "0.5rem",
                  fontWeight: 600,
                  fontSize: "1rem",
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

            {/* Mobile Hamburger Menu Button */}
            <button
              className="md:hidden ml-auto p-2 flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              style={{
                width: "44px",
                height: "44px",
                color: "var(--primary)",
                backgroundColor: mobileMenuOpen ? "#f0f9ff" : "transparent",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                position: "relative",
              }}
            >
              {/* Animated Hamburger Icon */}
              <div
                style={{
                  width: "22px",
                  height: "16px",
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <span
                  style={{
                    display: "block",
                    width: "100%",
                    height: "2.5px",
                    backgroundColor: "var(--primary)",
                    borderRadius: "2px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: mobileMenuOpen
                      ? "rotate(45deg) translate(5px, 5px)"
                      : "rotate(0) translate(0, 0)",
                  }}
                />
                <span
                  style={{
                    display: "block",
                    width: "100%",
                    height: "2.5px",
                    backgroundColor: "var(--primary)",
                    borderRadius: "2px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    opacity: mobileMenuOpen ? 0 : 1,
                    transform: mobileMenuOpen
                      ? "translateX(-10px)"
                      : "translateX(0)",
                  }}
                />
                <span
                  style={{
                    display: "block",
                    width: "100%",
                    height: "2.5px",
                    backgroundColor: "var(--primary)",
                    borderRadius: "2px",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    transform: mobileMenuOpen
                      ? "rotate(-45deg) translate(5px, -5px)"
                      : "rotate(0) translate(0, 0)",
                  }}
                />
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className="md:hidden"
        style={{
          position: "fixed",
          inset: 0,
          top: "64px",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          backdropFilter: "blur(4px)",
          zIndex: 9997,
          opacity: mobileMenuOpen ? 1 : 0,
          visibility: mobileMenuOpen ? "visible" : "hidden",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Mobile Menu */}
      <div
        className="md:hidden"
        style={{
          position: "fixed",
          top: "64px",
          right: 0,
          width: "min(320px, 85vw)",
          height: "calc(100vh - 64px)",
          backgroundColor: "white",
          boxShadow: "-8px 0 30px rgba(0, 0, 0, 0.15)",
          zIndex: 9998,
          overflowY: "auto",
          transform: mobileMenuOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <nav
          className="flex flex-col"
          style={{
            padding: "1.5rem 0",
          }}
        >
          {/* Menu Header */}
          <div
            style={{
              padding: "0 1.5rem 1rem",
              borderBottom: "1px solid #f1f5f9",
              marginBottom: "0.5rem",
            }}
          >
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Navigation
            </p>
          </div>

          {navItems.map((item, index) => {
            const isActive = currentPage === item.key;
            return (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                aria-current={isActive ? "page" : undefined}
                style={{
                  padding: "1rem 1.5rem",
                  fontSize: "1rem",
                  fontWeight: isActive ? "600" : "500",
                  color: isActive ? "var(--primary)" : "#374151",
                  textDecoration: "none",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  borderLeft: isActive
                    ? "3px solid var(--primary)"
                    : "3px solid transparent",
                  backgroundColor: isActive ? "#f0f9ff" : "transparent",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  animation: `slideInRight 0.3s ease forwards`,
                  animationDelay: `${index * 0.05}s`,
                  opacity: 0,
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                    e.currentTarget.style.paddingLeft = "1.75rem";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.paddingLeft = "1.5rem";
                  }
                }}
              >
                {item.label}
                {isActive && (
                  <span
                    style={{
                      marginLeft: "auto",
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "var(--primary)",
                    }}
                  />
                )}
              </Link>
            );
          })}

          {/* Mobile Auth Buttons */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "0.75rem",
              padding: "1.5rem",
              borderTop: "1px solid #f1f5f9",
              marginTop: "1rem",
              animation: "slideInRight 0.3s ease forwards",
              animationDelay: "0.35s",
              opacity: 0,
            }}
          >
            <p
              style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#94a3b8",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                marginBottom: "0.5rem",
              }}
            >
              Account
            </p>
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.875rem 1.5rem",
                backgroundColor: "white",
                color: "var(--primary)",
                border: "2px solid var(--primary)",
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "0.95rem",
                textDecoration: "none",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1.25rem" }}
              >
                login
              </span>
              Login
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMobileMenuOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                padding: "0.875rem 1.5rem",
                background:
                  "linear-gradient(135deg, var(--primary) 0%, #0052a3 100%)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "0.95rem",
                textDecoration: "none",
                boxShadow: "0 4px 15px rgba(0, 102, 204, 0.35)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1.25rem" }}
              >
                person_add
              </span>
              Sign Up
            </Link>
          </div>
        </nav>
      </div>

      {/* Animation Keyframes */}
      <style jsx global>{`
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}
