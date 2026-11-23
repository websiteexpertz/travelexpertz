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
  key: string;
  label: string;
  href: string;
}> = [
    { key: "home", label: "Home", href: "/" },
    { key: "hotels", label: "Hotels", href: "/hotels" },
    { key: "homestays", label: "Homestays", href: "/homestays" },
    { key: "packages", label: "Packages", href: "/packages" },
    { key: "deals", label: "Deals", href: "/deals" },
    { key: "flights", label: "Flights", href: "/services?service=flight" },
    { key: "cabs", label: "Cabs", href: "/cabs" },
    { key: "trains", label: "Trains", href: "/services?service=train" },
    { key: "buses", label: "Buses", href: "/services?service=bus" },
    { key: "luxury-properties", label: "Luxury Properties", href: "/luxury" },
    { key: "events", label: "Events", href: "/events" },
    { key: "verified", label: "TE Properties", href: "/hotels?verified=1" },
    {
      key: "list-property",
      label: "List Your Property",
      href: "/owner/auth/register",
    },
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
        <div className="w-full max-w-[1440px] mx-auto px-6 sm:px-10 lg:px-14" style={{ position: "relative" }}>
          <div className="flex items-center travel-header-row">
            <Link
              href="/"
              aria-label="TravelExpertz Home"
              className="relative flex items-center justify-center shrink-0 overflow-hidden header-logo-link transition-transform hover:scale-105"
              style={{
                height: "40px",
                width: "58px",
                maxHeight: "40px",
                maxWidth: "58px",
                marginRight: "1.25rem",
              }}
            >
              <Image
                src="/logo.webp"
                alt="TravelExpertz — Har Yatra Banaye Yadgaar"
                fill
                sizes="(max-width: 768px) 56px, 58px"
                className="object-contain"
                style={{ objectFit: "contain" }}
                priority
              />
            </Link>

            {/* Desktop Navigation */}
            <nav
              aria-label="Primary"
              className="hidden lg:flex travel-header-nav"
            >
              {navItems.map((item) => {
                const isActive = currentPage === item.key;

                return (
                  <Link
                    key={item.key}
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className="nav-link"
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      padding: "0.7rem 0.35rem",
                      color: isHeroPage && !scrolled
                        ? "white"
                        : isActive
                          ? "#0B6DFF"
                          : forceBlackText && !scrolled
                            ? "#000000"
                            : scrolled || !isHeroPage
                              ? "#1E293B"
                              : "white",
                      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                      cursor: "pointer",
                      position: "relative",
                      paddingBottom: "0.35rem",
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

            <div className="desktop-auth-buttons">
              <Link href="/auth/login" className="header-login-button">
                LOGIN
              </Link>
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button
              className="header-mobile-menu-toggle lg:hidden ml-auto p-2 flex items-center justify-center"
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
          top: "76px",
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
          top: "76px",
          right: 0,
          width: "min(320px, 85vw)",
          height: "calc(100vh - 76px)",
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

          <div className="mobile-auth-button">
            <Link
              href="/auth/login"
              onClick={() => setMobileMenuOpen(false)}
              className="header-login-button"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
                login
              </span>
              Login
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMobileMenuOpen(false)}
              className="header-signup-button"
            >
              <span className="material-symbols-outlined" aria-hidden="true">
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

        .header-login-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 40px;
          padding: 8px 24px;
          border: 1.5px solid #ffffff;
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.12);
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-decoration: none;
          white-space: nowrap;
          transition: all 0.2s ease;
        }

        .header-login-button:hover {
          background: #ffffff;
          color: #0b6dff;
        }

        .header-scrolled .header-login-button,
        .header-black-text .header-login-button {
          border-color: #0b6dff;
          background: #ffffff;
          color: #0b6dff;
        }

        .header-scrolled .header-login-button:hover,
        .header-black-text .header-login-button:hover {
          background: #0b6dff;
          color: #ffffff;
        }

        .header-logo-link {
          position: relative !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          height: 40px !important;
          width: 58px !important;
          max-height: 40px !important;
          max-width: 58px !important;
          overflow: hidden !important;
          flex-shrink: 0 !important;
        }

        .header-logo-link img {
          position: absolute !important;
          inset: 0 !important;
          width: 100% !important;
          height: 100% !important;
          max-width: 100% !important;
          max-height: 100% !important;
          object-fit: contain !important;
          object-position: center !important;
        }

        .desktop-auth-buttons {
          display: none;
          margin-left: auto;
          align-items: center;
        }

        .header-mobile-menu-toggle {
          display: none !important;
        }

        .header-signup-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          min-height: 40px;
          padding: 8px 24px;
          border: 1.5px solid #0b6dff;
          border-radius: 10px;
          background: #0b6dff;
          color: #ffffff;
          font-size: 0.95rem;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
        }

        .travel-header-nav {
          gap: 0.65rem;
          align-items: center;
          justify-content: flex-start;
          flex: 1 1 auto;
          min-width: 0;
          margin: 0;
          padding-left: 0;
          max-width: none;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .travel-header-nav::-webkit-scrollbar {
          display: none;
        }

        .travel-header-nav .nav-link {
          flex: 0 0 auto;
          padding: 0.7rem 0.35rem !important;
          font-size: 0.95rem !important;
          line-height: 1.2;
          white-space: nowrap;
        }

        .mobile-auth-button {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          padding: 1.25rem 1.5rem;
          margin-top: 0.75rem;
          border-top: 1px solid #f1f5f9;
        }

        .mobile-auth-button .header-login-button,
        .mobile-auth-button .header-signup-button {
          width: 100%;
        }

        @media (min-width: 1024px) {
          header > div {
            width: 100%;
            max-width: 1440px !important;
            padding-left: 3.5rem !important;
            padding-right: 2rem !important;
          }

          .travel-header-row {
            position: relative;
            display: flex !important;
            align-items: center !important;
            justify-content: flex-start !important;
            height: 76px !important;
            width: 100% !important;
          }

          .travel-header-row > a {
            flex-shrink: 0;
            display: inline-flex;
            align-items: center;
          }

          .travel-header-row .travel-header-nav {
            position: static !important;
            transform: none !important;
            width: auto !important;
            max-width: none !important;
            justify-content: flex-start !important;
            margin: 0 !important;
          }

          .header-logo-link {
            height: 44px !important;
            width: 64px !important;
            max-height: 44px !important;
            max-width: 64px !important;
          }

          .desktop-auth-buttons {
            display: flex !important;
            flex: 0 0 auto;
            position: static !important;
            margin-left: auto !important;
            align-items: center;
          }

          .mobile-auth-button {
            display: none;
          }
        }

        @media (min-width: 1380px) {
          .travel-header-nav {
            gap: 0.75rem;
          }
          .travel-header-nav .nav-link {
            font-size: 0.95rem !important;
            padding-left: 0.35rem !important;
            padding-right: 0.35rem !important;
          }
        }

        @media (min-width: 1200px) and (max-width: 1379px) {
          .travel-header-nav {
            gap: 0.45rem;
          }
          .travel-header-nav .nav-link {
            font-size: 0.88rem !important;
            padding-left: 0.22rem !important;
            padding-right: 0.22rem !important;
          }
        }

        @media (min-width: 1024px) and (max-width: 1199px) {
          .travel-header-row .travel-header-nav {
            gap: 0.28rem;
          }
          .travel-header-nav .nav-link {
            font-size: 0.78rem !important;
            padding-left: 0.16rem !important;
            padding-right: 0.16rem !important;
          }
        }

        @media (max-width: 1023px) {
          .header-logo-link {
            height: 38px !important;
            width: 56px !important;
            max-height: 38px !important;
            max-width: 56px !important;
          }

          .desktop-auth-buttons {
            display: none !important;
          }

          .header-mobile-menu-toggle {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
