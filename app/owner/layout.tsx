"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";

interface Owner {
  _id: string;
  email: string;
  ownerName: string;
  businessName: string;
  businessType: string;
}

interface PropertyStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function OwnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [stats, setStats] = useState<PropertyStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);

  // Skip authentication check for auth routes
  const isAuthRoute = pathname.includes("/owner/auth/");

  useEffect(() => {
    // If it's an auth route, don't require login
    if (isAuthRoute) {
      setLoading(false);
      return;
    }

    const storedOwner =
      localStorage.getItem("owner") || localStorage.getItem("user");
    const token = localStorage.getItem("ownerToken");

    if (!storedOwner || !token) {
      router.push("/owner/auth/login");
      return;
    }

    try {
      const parsedOwner = JSON.parse(storedOwner);
      setOwner(parsedOwner);
      fetchStats();
    } catch {
      router.push("/owner/auth/login");
    }
  }, [router, isAuthRoute]);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem("ownerToken");
      const res = await fetch("/api/owner/properties/stats", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("owner");
    localStorage.removeItem("ownerToken");
    router.push("/owner/auth/login");
  };

  if (isAuthRoute) {
    return <>{children}</>;
  }

  if (loading || !owner) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div
      className="owner-panel"
      style={{ display: "flex", minHeight: "100vh", background: "#f5f7fa" }}
    >
      {/* Sidebar */}
      <div
        style={{
          width: "280px",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
          color: "#fff",
          padding: "2rem 0",
          position: "fixed",
          height: "100vh",
          overflowY: "auto",
          boxShadow: "0 10px 40px rgba(0,0,0,0.1)",
        }}
      >
        <div style={{ padding: "0 1.5rem", marginBottom: "2rem" }}>
          <h2
            style={{
              fontSize: "1.2rem",
              fontWeight: "700",
              margin: "0 0 0.5rem 0",
            }}
          >
            🏨 {owner.businessName}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#aaa", margin: 0 }}>
            {owner.ownerName}
          </p>
        </div>

        <nav style={{ marginBottom: "2rem" }}>
          {[
            {
              href: "/owner/dashboard",
              label: "📊 Dashboard",
              icon: "📊",
            },
            {
              href: "/owner/properties",
              label: "🏠 My Properties",
              icon: "🏠",
            },
            {
              href: "/owner/properties/add",
              label: "➕ Add Property",
              icon: "➕",
            },
            {
              href: "/owner/bookings",
              label: "📅 See Bookings",
              icon: "📅",
            },
            {
              href: "/owner/profile",
              label: "👤 Profile",
              icon: "👤",
            },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "block",
                  padding: "0.75rem 1.5rem",
                  color: "#fff",
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  borderLeft:
                    "4px solid " + (isActive ? "#3b82f6" : "transparent"),
                  background: isActive
                    ? "rgba(255,255,255,0.1)"
                    : "transparent",
                  fontSize: "0.95rem",
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div
          style={{
            borderTop: "1px solid rgba(255,255,255,0.1)",
            padding: "1.5rem",
          }}
        >
          <button
            onClick={handleLogout}
            style={{
              width: "100%",
              padding: "0.75rem",
              background: "#ef4444",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.9rem",
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: "280px", flex: 1, padding: "2rem" }}>
        {/* Header */}
        <div
          style={{
            background: "#fff",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            marginBottom: "2rem",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <h1 style={{ fontSize: "1.5rem", fontWeight: "700", margin: 0 }}>
              Welcome back, {owner.ownerName}!
            </h1>
            <p style={{ color: "#666", margin: "0.5rem 0 0 0" }}>
              Manage your properties and check approval status
            </p>
          </div>
          <div style={{ textAlign: "right", color: "#666" }}>
            <p style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem" }}>
              📧 {owner.email}
            </p>
            <p style={{ margin: 0, fontSize: "0.85rem", color: "#999" }}>
              {owner.businessType === "both"
                ? "Hotel & Homestay"
                : owner.businessType.charAt(0).toUpperCase() +
                  owner.businessType.slice(1)}
            </p>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}
