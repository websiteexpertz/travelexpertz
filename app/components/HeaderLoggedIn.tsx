"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

type HeaderLoggedInProps = {
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
    | "profile"
    | "bookings"
    | "wishlist"
    | "transactions";
  userName?: string;
  isHeroPage?: boolean;
  solidHeader?: boolean;
};

const navItems: Array<{
  key: NonNullable<HeaderLoggedInProps["currentPage"]>;
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

export default function HeaderLoggedIn({
  currentPage,
  userName = "User",
  isHeroPage = false,
  solidHeader = false,
}: HeaderLoggedInProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

  return (
    <>
      <header
        className={`${isHeroPage && !scrolled && !solidHeader ? "header-hero" : scrolled || solidHeader || !isHeroPage ? "header-scrolled" : ""}`}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          width: "100%",
          zIndex: 1000,
          backgroundColor: "transparent",
          boxShadow: "none",
          transition:
            "background-color 0.4s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            paddingLeft: "1rem",
            paddingRight: "1rem",
          }}
        >
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

            {/* Desktop User Actions */}
            <div
              className="desktop-user-actions"
              style={{
                display: "none",
                alignItems: "center",
                gap: "0.75rem",
                marginLeft: "auto",
              }}
            >
              {/* Wishlist Icon */}
              <Link
                href="/user/wishlist"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: scrolled ? "var(--primary)" : "white",
                  transition: "transform 0.2s ease, color 0.2s ease",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  height: "fit-content",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.15)";
                  e.currentTarget.style.backgroundColor = scrolled
                    ? "rgba(0, 102, 204, 0.1)"
                    : "rgba(255, 255, 255, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.5rem" }}
                >
                  favorite
                </span>
              </Link>

              {/* Bookings Icon and Profile - grouped together */}
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "0.3rem",
                }}
              >
                {/* Bookings Icon */}
                <Link
                  href="/user/bookings"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    color: scrolled ? "var(--primary)" : "white",
                    transition: "transform 0.2s ease, color 0.2s ease",
                    padding: "0.5rem",
                    borderRadius: "0.5rem",
                    height: "fit-content",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "scale(1.15)";
                    e.currentTarget.style.backgroundColor = scrolled
                      ? "rgba(0, 102, 204, 0.1)"
                      : "rgba(255, 255, 255, 0.2)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "scale(1)";
                    e.currentTarget.style.backgroundColor = "transparent";
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.5rem" }}
                  >
                    calendar_month
                  </span>
                </Link>

                {/* Profile Dropdown */}
                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      backgroundColor: "transparent",
                      border: `2px solid ${scrolled ? "var(--primary)" : "white"}`,
                      borderRadius: "0.5rem",
                      padding: "0.6rem 0.85rem",
                      cursor: "pointer",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      color: scrolled ? "var(--primary)" : "white",
                      transition: "all 0.2s ease",
                      whiteSpace: "nowrap",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = scrolled
                        ? "var(--primary)"
                        : "white";
                      e.currentTarget.style.color = scrolled
                        ? "white"
                        : "var(--primary)";
                    }}
                    onMouseLeave={(e) => {
                      if (!showProfileMenu) {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.color = scrolled
                          ? "var(--primary)"
                          : "white";
                      }
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ fontSize: "1.25rem" }}
                    >
                      account_circle
                    </span>
                    <span>{userName}</span>
                  </button>

                  {showProfileMenu && (
                    <div
                      style={{
                        position: "absolute",
                        top: "100%",
                        right: 0,
                        marginTop: "0.5rem",
                        backgroundColor: "white",
                        border: "1px solid var(--border-200)",
                        borderRadius: "0.5rem",
                        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                        zIndex: 1000,
                        minWidth: "auto",
                        overflow: "visible",
                        display: "flex",
                        flexDirection: "row",
                        whiteSpace: "nowrap",
                      }}
                      onMouseLeave={() => setShowProfileMenu(false)}
                    >
                      <Link
                        href="/user/profile"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "0.75rem 1rem",
                          color: "var(--primary)",
                          textDecoration: "none",
                          fontSize: "0.9rem",
                          transition: "background-color 0.2s ease",
                          borderRight: "1px solid var(--border-200)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/user/bookings"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "0.75rem 1rem",
                          color: "var(--primary)",
                          textDecoration: "none",
                          fontSize: "0.9rem",
                          transition: "background-color 0.2s ease",
                          borderRight: "1px solid var(--border-200)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        My Bookings
                      </Link>
                      <Link
                        href="/user/cab-bookings"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "0.75rem 1rem",
                          color: "var(--primary)",
                          textDecoration: "none",
                          fontSize: "0.9rem",
                          transition: "background-color 0.2s ease",
                          borderRight: "1px solid var(--border-200)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        Cab bookings
                      </Link>
                      <Link
                        href="/user/wishlist"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "0.75rem 1rem",
                          color: "var(--primary)",
                          textDecoration: "none",
                          fontSize: "0.9rem",
                          transition: "background-color 0.2s ease",
                          borderRight: "1px solid var(--border-200)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        Wishlist
                      </Link>
                      <Link
                        href="/user/transactions"
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "0.75rem 1rem",
                          color: "var(--primary)",
                          textDecoration: "none",
                          fontSize: "0.9rem",
                          transition: "background-color 0.2s ease",
                          borderRight: "1px solid var(--border-200)",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#f3f4f6";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        Transactions
                      </Link>
                      <button
                        onClick={handleLogout}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          padding: "0.75rem 1rem",
                          color: "#dc2626",
                          backgroundColor: "transparent",
                          border: "none",
                          cursor: "pointer",
                          fontSize: "0.9rem",
                          transition: "background-color 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = "#fee2e2";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = "transparent";
                        }}
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Mobile Hamburger Menu Button */}
            <button
              className="xl:hidden ml-auto p-2 flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
              style={{
                width: "44px",
                height: "44px",
                color: scrolled ? "var(--primary)" : "white",
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

          {/* Mobile User Menu */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              borderTop: "1px solid #f1f5f9",
              marginTop: "1rem",
              paddingTop: "1rem",
              animation: "slideInRight 0.3s ease forwards",
              animationDelay: "0.35s",
              opacity: 0,
            }}
          >
            <div
              style={{
                padding: "0.75rem 1.5rem",
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
              }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "12px",
                  background:
                    "linear-gradient(135deg, var(--primary) 0%, #0052a3 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  boxShadow: "0 4px 12px rgba(0, 102, 204, 0.3)",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.25rem" }}
                >
                  person
                </span>
              </div>
              <div>
                <p
                  style={{
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: "#1f2937",
                    marginBottom: "0.125rem",
                  }}
                >
                  {userName}
                </p>
                <p
                  style={{
                    fontSize: "0.75rem",
                    color: "#94a3b8",
                  }}
                >
                  Manage your account
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "0.5rem 0",
              }}
            >
              {[
                {
                  href: "/user/profile",
                  label: "My Profile",
                  icon: "account_circle",
                },
                {
                  href: "/user/bookings",
                  label: "My Bookings",
                  icon: "calendar_month",
                },
                {
                  href: "/user/cab-bookings",
                  label: "Cab bookings",
                  icon: "directions_car",
                },
                { href: "/user/wishlist", label: "Wishlist", icon: "favorite" },
                {
                  href: "/user/transactions",
                  label: "Transactions",
                  icon: "receipt_long",
                },
              ].map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  style={{
                    padding: "0.875rem 1.5rem",
                    fontSize: "0.9rem",
                    fontWeight: "500",
                    color: "#4b5563",
                    textDecoration: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                    animation: `slideInRight 0.3s ease forwards`,
                    animationDelay: `${0.4 + index * 0.05}s`,
                    opacity: 0,
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#f8fafc";
                    e.currentTarget.style.paddingLeft = "1.75rem";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.paddingLeft = "1.5rem";
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1.25rem", color: "#94a3b8" }}
                  >
                    {item.icon}
                  </span>
                  {item.label}
                </Link>
              ))}

              <button
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                style={{
                  padding: "0.875rem 1.5rem",
                  marginTop: "0.5rem",
                  fontSize: "0.9rem",
                  fontWeight: "500",
                  color: "#dc2626",
                  backgroundColor: "transparent",
                  border: "none",
                  borderTop: "1px solid #fee2e2",
                  cursor: "pointer",
                  textAlign: "left",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                  animation: `slideInRight 0.3s ease forwards`,
                  animationDelay: "0.6s",
                  opacity: 0,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#fef2f2";
                  e.currentTarget.style.paddingLeft = "1.75rem";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.paddingLeft = "1.5rem";
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.25rem" }}
                >
                  logout
                </span>
                Logout
              </button>
            </div>
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
          .desktop-user-actions {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
}
