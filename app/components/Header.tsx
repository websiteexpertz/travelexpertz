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
    | "events"
    | "cabs"
    | "verified"
    | "login"
    | "signup"
    | "profile"
    | "bookings"
    | "wishlist"
    | "transactions";
  forceBlackText?: boolean;
  isHeroPage?: boolean;
  solidHeader?: boolean;
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
  { key: "homestays", label: "Homestays", href: "/homestays" },
  { key: "packages", label: "Packages", href: "/packages" },
  { key: "deals", label: "Deals", href: "/deals" },
  { key: "luxury", label: "Luxury", href: "/luxury" },
  { key: "events", label: "Events", href: "/events" },
  { key: "cabs", label: "Cab", href: "/cabs" },
  { key: "verified", label: "Travel Expertz Properties", href: "/verified" },
];

const authItems: Array<{
  key: NonNullable<HeaderProps["currentPage"]>;
  label: string;
  href: string;
}> = [
  { key: "login", label: "Login", href: "/auth/login" },
  { key: "signup", label: "Sign Up", href: "/auth/register" },
];

export default function Header({
  currentPage,
  forceBlackText,
  isHeroPage = false,
  solidHeader = false,
}: HeaderProps) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("User");
  const [mounted, setMounted] = useState(false);
  const [packages, setPackages] = useState<Package[]>([]);
  const [packagesLoading, setPackagesLoading] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

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

    // Scroll listener for header background
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
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
      <>
        <HeaderLoggedIn
          currentPage={validCurrentPage}
          userName={userName}
          isHeroPage={isHeroPage}
          solidHeader={solidHeader}
        />
      </>
    );
  }

  return (
    <>
      <header
        className={`${isHeroPage && !scrolled && !solidHeader ? "header-hero" : scrolled || solidHeader || !isHeroPage ? "header-scrolled" : ""} ${forceBlackText && !scrolled && !isHeroPage ? "header-black-text" : ""}`}
      >
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
                unoptimized
              />
            </Link>

            {/* Desktop Navigation */}
            <nav aria-label="Primary" className="hidden xl:flex gap-6 pl-8">
              {navItems.map((item) => {
                const isActive = currentPage === item.key;

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className="nav-link"
                    style={{
                      fontSize: "1.05rem",
                      fontWeight: "500",
                      padding: "0.5rem 0.25rem",
                      color: isActive
                        ? "#0B6DFF"
                        : isHeroPage && !scrolled
                          ? "white"
                          : forceBlackText && !scrolled
                            ? "#000000"
                            : scrolled || !isHeroPage
                              ? "#1E293B"
                              : "white",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                      position: "relative",
                      paddingBottom: "0.25rem",
                      borderBottom: isActive
                        ? "2px solid #0B6DFF"
                        : "2px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = "#0B6DFF";
                        e.currentTarget.style.opacity = "0.8";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color =
                          isHeroPage && !scrolled
                            ? "white"
                            : forceBlackText && !scrolled
                              ? "#000000"
                              : scrolled || !isHeroPage
                                ? "#1E293B"
                                : "white";
                        e.currentTarget.style.opacity = "1";
                      }
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Desktop Auth Buttons */}
            <div
              className="desktop-auth-buttons"
              style={{
                display: "none",
                alignItems: "center",
                gap: "14px",
                marginLeft: "auto",
              }}
            >
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center"
                style={{
                  backgroundColor: "transparent",
                  color:
                    isHeroPage && !scrolled
                      ? "white"
                      : forceBlackText && !scrolled
                        ? "#000000"
                        : "#0B6DFF",
                  border: `1px solid ${isHeroPage && !scrolled ? "rgba(255, 255, 255, 0.5)" : forceBlackText && !scrolled ? "#000000" : "#0B6DFF"}`,
                  borderRadius: "12px",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  padding: "12px 26px",
                }}
                onMouseEnter={(e) => {
                  if (isHeroPage && !scrolled) {
                    e.currentTarget.style.backgroundColor =
                      "rgba(255, 255, 255, 0.15)";
                    e.currentTarget.style.borderColor =
                      "rgba(255, 255, 255, 0.8)";
                  } else if (forceBlackText && !scrolled) {
                    e.currentTarget.style.backgroundColor =
                      "rgba(0, 0, 0, 0.05)";
                    e.currentTarget.style.borderColor = "#000000";
                  } else {
                    e.currentTarget.style.backgroundColor = "#F0F7FF";
                    e.currentTarget.style.borderColor = "#0B6DFF";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.borderColor =
                    isHeroPage && !scrolled
                      ? "rgba(255, 255, 255, 0.5)"
                      : forceBlackText && !scrolled
                        ? "#000000"
                        : "#0B6DFF";
                }}
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center"
                style={{
                  background:
                    isHeroPage && !scrolled
                      ? "rgba(255, 255, 255, 0.2)"
                      : forceBlackText && !scrolled
                        ? "#000000"
                        : "linear-gradient(135deg, #0B6DFF, #0056D6)",
                  color: "white",
                  border:
                    isHeroPage && !scrolled
                      ? "1px solid rgba(255, 255, 255, 0.3)"
                      : "none",
                  borderRadius: "12px",
                  fontWeight: 600,
                  fontSize: "0.95rem",
                  cursor: "pointer",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  padding: "12px 28px",
                  boxShadow:
                    isHeroPage && !scrolled
                      ? "0 4px 12px rgba(0, 0, 0, 0.1)"
                      : forceBlackText && !scrolled
                        ? "0 4px 12px rgba(0, 0, 0, 0.25)"
                        : "0 4px 12px rgba(11, 109, 255, 0.25)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  if (isHeroPage && !scrolled) {
                    e.currentTarget.style.background =
                      "rgba(255, 255, 255, 0.3)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(0, 0, 0, 0.15)";
                  } else if (forceBlackText && !scrolled) {
                    e.currentTarget.style.boxShadow =
                      "0 8px 16px rgba(0, 0, 0, 0.35)";
                  } else {
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(11, 109, 255, 0.35)";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.background =
                    isHeroPage && !scrolled
                      ? "rgba(255, 255, 255, 0.2)"
                      : forceBlackText && !scrolled
                        ? "#000000"
                        : "linear-gradient(135deg, #0B6DFF, #0056D6)";
                  e.currentTarget.style.boxShadow =
                    isHeroPage && !scrolled
                      ? "0 4px 12px rgba(0, 0, 0, 0.1)"
                      : forceBlackText && !scrolled
                        ? "0 4px 12px rgba(0, 0, 0, 0.25)"
                        : "0 4px 12px rgba(11, 109, 255, 0.25)";
                }}
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button
              className="xl:hidden ml-auto p-2 flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              style={{
                width: "44px",
                height: "44px",
                color:
                  forceBlackText && !scrolled
                    ? "#000000"
                    : scrolled
                      ? "var(--primary)"
                      : "white",
                backgroundColor: mobileMenuOpen
                  ? scrolled
                    ? "#f0f9ff"
                    : "rgba(255, 255, 255, 0.2)"
                  : "transparent",
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
        className="xl:hidden"
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
        className="xl:hidden"
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
                padding: "12px 26px",
                backgroundColor: "transparent",
                color: "#0B6DFF",
                border: "1px solid #0B6DFF",
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "0.95rem",
                textDecoration: "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#F0F7FF";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
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
                padding: "12px 28px",
                background: "linear-gradient(135deg, #0B6DFF, #0056D6)",
                color: "white",
                border: "none",
                borderRadius: "12px",
                fontWeight: 600,
                fontSize: "0.95rem",
                textDecoration: "none",
                boxShadow: "0 4px 12px rgba(11, 109, 255, 0.25)",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 8px 20px rgba(11, 109, 255, 0.35)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(11, 109, 255, 0.25)";
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

        @media (min-width: 1280px) {
          .desktop-auth-buttons {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
