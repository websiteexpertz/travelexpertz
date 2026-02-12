"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface PropertyStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
}

export default function OwnerDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<PropertyStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
  });
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("user");
    console.log("=== DASHBOARD AUTH CHECK ===");
    console.log("localStorage.user:", userData);

    if (!userData) {
      console.error("No user data in localStorage - redirecting to login");
      router.push("/auth/login");
      return;
    }

    let parsedUser;
    try {
      parsedUser = JSON.parse(userData);
    } catch (e) {
      console.error("Failed to parse user data:", e);
      router.push("/auth/login");
      return;
    }

    console.log("Parsed user:", parsedUser);
    console.log("User role:", parsedUser.role);
    console.log("User email:", parsedUser.email);

    // Check if this is an owner (role can be "owner" or if coming from propertyowners, check for ownerName)
    const isOwner = parsedUser.role === "owner" || parsedUser.ownerName;
    console.log("Is owner?", isOwner);

    if (!isOwner) {
      console.error(
        "User is not an owner, redirecting to home. Role:",
        parsedUser.role,
      );
      router.push("/");
      return;
    }

    setUser(parsedUser);
    fetchStats();
  }, [router]);

  const fetchStats = async () => {
    try {
      console.log("Fetching stats from /api/owner/properties/stats");
      console.log("User role:", user?.role);

      const res = await fetch("/api/owner/properties/stats", {
        credentials: "include",
        method: "GET",
      });

      console.log("Stats response status:", res.status);
      console.log(
        "Stats response headers:",
        Object.fromEntries(res.headers.entries()),
      );

      if (res.ok) {
        const data = await res.json();
        console.log("Stats received:", data);
        setStats(data);
      } else {
        const error = await res.text();
        console.error("Stats fetch error:", error);
        console.error("Full response status:", res.status);
        if (res.status === 401) {
          console.error("Unauthorized - redirecting to login");
          router.push("/auth/login");
        }
      }
    } catch (error: any) {
      console.error("=== FETCH ERROR ===");
      console.error("Error message:", error.message);
      console.error("Error type:", error.constructor.name);
      console.error("Full error:", error);

      // Check if it's a network error
      if (error.message === "Failed to fetch") {
        console.error(
          "Network error - API endpoint may be down or unreachable",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({
    label,
    value,
    color,
    icon,
  }: {
    label: string;
    value: number;
    color: string;
    icon: string;
  }) => (
    <div
      style={{
        background: "#fff",
        padding: "1.5rem",
        borderRadius: "12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        textAlign: "center",
        border: `3px solid ${color}`,
      }}
    >
      <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>{icon}</div>
      <div style={{ fontSize: "2rem", fontWeight: "700", color }}>{value}</div>
      <div style={{ fontSize: "0.9rem", color: "#666", marginTop: "0.5rem" }}>
        {label}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
        <div style={{ fontSize: "1.2rem", marginBottom: "1rem" }}>
          Loading dashboard...
        </div>
        <div style={{ fontSize: "3rem", animation: "spin 1s linear infinite" }}>
          ⏳
        </div>
        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div>
      {/* Stats Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard
          label="Total Properties"
          value={stats.total}
          color="#667eea"
          icon="🏢"
        />
        <StatCard
          label="Pending Approval"
          value={stats.pending}
          color="#f59e0b"
          icon="⏳"
        />
        <StatCard
          label="Approved"
          value={stats.approved}
          color="#10b981"
          icon="✅"
        />
        <StatCard
          label="Rejected"
          value={stats.rejected}
          color="#ef4444"
          icon="❌"
        />
      </div>

      {/* Quick Actions */}
      <div
        style={{
          background: "#fff",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          marginBottom: "2rem",
        }}
      >
        <h2
          style={{
            fontSize: "1.2rem",
            fontWeight: "700",
            marginBottom: "1rem",
          }}
        >
          🚀 Quick Actions
        </h2>
        <div
          style={{
            display: "flex",
            gap: "1rem",
            flexWrap: "wrap",
          }}
        >
          <button
            onClick={() => router.push("/owner/properties")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#667eea",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.9rem",
            }}
          >
            📋 View All Properties
          </button>
          <button
            onClick={() => router.push("/owner/properties/add")}
            style={{
              padding: "0.75rem 1.5rem",
              background: "linear-gradient(135deg, #00d4ff 0%, #0099cc 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.9rem",
            }}
          >
            ➕ Add New Property
          </button>
        </div>
      </div>

      {/* Info Box */}
      <div
        style={{
          background: "#eff6ff",
          border: "2px solid #0284c7",
          padding: "1.5rem",
          borderRadius: "12px",
        }}
      >
        <h3 style={{ fontSize: "1rem", fontWeight: "700", marginTop: 0 }}>
          ℹ️ How the Approval Process Works
        </h3>
        <ul
          style={{
            margin: "1rem 0 0 0",
            paddingLeft: "1.5rem",
            lineHeight: "1.8",
          }}
        >
          <li>
            <strong>Submit</strong> your property details to start the approval
            process
          </li>
          <li>
            <strong>Wait</strong> for the main admin to review your submission
            (status: Pending)
          </li>
          <li>
            <strong>Approved</strong> properties will go live on the website
            immediately
          </li>
          <li>
            <strong>Rejected</strong> properties will show a reason - you can
            edit and resubmit
          </li>
          <li>
            Check <strong>"My Properties"</strong> page for real-time status
            updates
          </li>
        </ul>
      </div>
    </div>
  );
}
