"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebar from "./components/AdminSidebar";

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

  // Skip login page - no sidebar needed
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div
      className="admin-panel"
      style={{ display: "flex", minHeight: "100vh", background: "#f5f5f5" }}
    >
      {/* New Modern Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          marginLeft: "280px",
          background: "#f9fafb",
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top Header */}
        <header
          style={{
            background: "white",
            padding: "1rem 1.5rem",
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "sticky",
            top: 0,
            zIndex: 100,
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            {/* Back to Website Button */}
            <Link
              href="/"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                padding: "0.5rem 1rem",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                textDecoration: "none",
                borderRadius: "8px",
                fontSize: "0.875rem",
                fontWeight: 600,
                transition: "all 0.2s ease",
                boxShadow: "0 2px 6px rgba(102, 126, 234, 0.3)",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(102, 126, 234, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 6px rgba(102, 126, 234, 0.3)";
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1.1rem" }}
              >
                arrow_back
              </span>
              <span>Back to Website</span>
            </Link>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              flexWrap: "wrap",
            }}
          >
            {/* Admin Info */}
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: 700,
                  fontSize: "1.1rem",
                }}
              >
                {adminUsername?.charAt(0).toUpperCase() || "A"}
              </div>
              <div style={{ display: "none" /* Show on larger screens */ }}>
                <div
                  style={{
                    fontWeight: 600,
                    fontSize: "0.9rem",
                    color: "#1f2937",
                    whiteSpace: "nowrap",
                  }}
                >
                  {adminUsername || "Administrator"}
                </div>
                <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                  Administrator
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={{
                padding: "0.5rem 1rem",
                background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
                transition: "all 0.2s ease",
                boxShadow: "0 2px 6px rgba(239, 68, 68, 0.3)",
                whiteSpace: "nowrap",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(239, 68, 68, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 2px 6px rgba(239, 68, 68, 0.3)";
              }}
              title="Logout"
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1.1rem" }}
              >
                logout
              </span>
              <span style={{ display: "none" /* Show on larger screens */ }}>
                Logout
              </span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div style={{ flex: 1, background: "#f9fafb" }}>{children}</div>
      </main>

      <style jsx>{`
        @media (min-width: 768px) {
          header > div:last-child > div > div:last-child {
            display: block !important;
          }
          header button span:last-child {
            display: inline !important;
          }
        }
      `}</style>
    </div>
  );
}
