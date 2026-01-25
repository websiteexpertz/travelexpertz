"use client";

import { useState } from "react";
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
    | "verified"
    | "profile"
    | "bookings"
    | "wishlist"
    | "transactions";
  userName?: string;
};

const navItems: Array<{
  key: NonNullable<HeaderLoggedInProps["currentPage"]>;
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

export default function HeaderLoggedIn({
  currentPage,
  userName = "User",
}: HeaderLoggedInProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/";
  };

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

          <div className="flex items-center gap-3 ml-auto">
            {/* Wishlist Icon */}
            <Link
              href="/user/wishlist"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                color: "var(--primary)",
                transition: "transform 0.2s ease, color 0.2s ease",
                padding: "0.5rem",
                borderRadius: "0.5rem",
                height: "fit-content",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "scale(1.15)";
                e.currentTarget.style.backgroundColor =
                  "rgba(0, 102, 204, 0.1)";
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
                  color: "var(--primary)",
                  transition: "transform 0.2s ease, color 0.2s ease",
                  padding: "0.5rem",
                  borderRadius: "0.5rem",
                  height: "fit-content",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.15)";
                  e.currentTarget.style.backgroundColor =
                    "rgba(0, 102, 204, 0.1)";
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
                    border: "2px solid var(--primary)",
                    borderRadius: "0.5rem",
                    padding: "0.6rem 0.85rem",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "0.95rem",
                    color: "var(--primary)",
                    transition: "all 0.2s ease",
                    whiteSpace: "nowrap",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--primary)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    if (!showProfileMenu) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "var(--primary)";
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
        </div>
      </div>
    </header>
  );
}
