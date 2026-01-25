"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminUsername, setAdminUsername] = useState("");

  useEffect(() => {
    // Parse token and get username
    // Middleware will handle unauthorized redirects
    const token = localStorage.getItem("adminToken");
    if (token) {
      try {
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          setAdminUsername(payload.username || "Admin");
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Error parsing token:", error);
      }
    }
    // Always set loading to false - middleware handles auth blocking
    setIsLoading(false);
  }, []);

  const handleLogout = async () => {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem("adminToken");
      // Clear cookie
      document.cookie = "adminToken=; max-age=0; path=/; SameSite=Strict";
      router.push("/admin/login");
    }
  };

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "#f5f5f5",
          fontSize: "0.9rem",
        }}
      >
        Initializing...
      </div>
    );
  }

  const menuItems = [
    { label: "Dashboard", href: "/admin", icon: "📊" },
    { label: "Services", href: "/admin/services", icon: "✈️" },
    { label: "Testimonials", href: "/admin/testimonials", icon: "⭐" },
    { label: "Reviews", href: "/admin/reviews", icon: "💬" },
    { label: "FAQs", href: "/admin/faqs", icon: "❓" },
    { label: "Packages", href: "/admin/packages", icon: "📦" },
    { label: "Hotels", href: "/admin/hotels/manage", icon: "🏨" },
    { label: "Homestays", href: "/admin/homestays", icon: "🏡" },
    { label: "Luxury", href: "/admin/luxury", icon: "⭐" },
    { label: "Bookings", href: "/admin/bookings", icon: "📅" },
    { label: "Deals", href: "/admin/deals", icon: "🎁" },
    { label: "Why Us", href: "/admin/whyus", icon: "💡" },
    { label: "About Us", href: "/admin/about", icon: "ℹ️" },
  ];

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: sidebarOpen ? "280px" : "80px",
          background: "#1a1a2e",
          color: "white",
          padding: "2rem 1rem",
          transition: "width 0.3s ease",
          position: "fixed",
          height: "100vh",
          overflowY: "auto",
          borderRight: "1px solid #333",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          {sidebarOpen && (
            <h1 style={{ fontSize: "1rem", margin: 0 }}>Admin</h1>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "1rem",
              cursor: "pointer",
            }}
          >
            {sidebarOpen ? "←" : "→"}
          </button>
        </div>

        <nav style={{ flex: 1 }}>
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "1rem",
                padding: "0.75rem",
                marginBottom: "0.25rem",
                borderRadius: "8px",
                textDecoration: "none",
                color: pathname === item.href ? "#fff" : "#ccc",
                background:
                  pathname === item.href
                    ? "rgba(0, 102, 204, 0.3)"
                    : "transparent",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                if (pathname !== item.href) {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.05)";
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== item.href) {
                  e.currentTarget.style.background = "transparent";
                }
              }}
            >
              <span style={{ fontSize: "1rem" }}>{item.icon}</span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* User Info & Logout */}
        <div
          style={{
            borderTop: "1px solid #333",
            paddingTop: "1rem",
            marginTop: "1rem",
          }}
        >
          {sidebarOpen && (
            <div
              style={{
                fontSize: "0.85rem",
                color: "#aaa",
                marginBottom: "1rem",
                wordBreak: "break-word",
              }}
            >
              <div style={{ color: "#ccc", fontWeight: "500" }}>
                Logged in as:
              </div>
              <div>{adminUsername}</div>
            </div>
          )}
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "0.95rem",
              fontWeight: "500",
              transition: "background 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#c82333";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#dc3545";
            }}
          >
            {sidebarOpen ? "Logout" : "🚪"}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        style={{
          marginLeft: sidebarOpen ? "280px" : "80px",
          flex: 1,
          padding: "1rem",
          transition: "margin-left 0.3s ease",
        }}
      >
        {children}
      </main>
    </div>
  );
}
