"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  badge?: number;
}

const menuItems: MenuItem[] = [
  { icon: "dashboard", label: "Dashboard", href: "/admin" },
  { icon: "people", label: "Users", href: "/admin/users" },
  { icon: "hotel", label: "Hotels", href: "/admin/hotels" },
  { icon: "home", label: "Homestays", href: "/admin/homestays" },
  { icon: "flight", label: "Packages", href: "/admin/packages" },
  { icon: "diamond", label: "Luxury", href: "/admin/luxury" },
  { icon: "local_offer", label: "Deals", href: "/admin/deals" },
  {
    icon: "request_quote",
    label: "Service Bookings",
    href: "/admin/service-bookings",
  },
  { icon: "calendar_month", label: "Bookings", href: "/admin/bookings" },
  { icon: "local_taxi", label: "Cab Management", href: "/admin/cabs" },
  { icon: "airport_shuttle", label: "Cab Bookings", href: "/admin/cab-bookings" },
  { icon: "event", label: "Upcoming Events", href: "/admin/events" },
  { icon: "star", label: "Reviews", href: "/admin/reviews" },
  { icon: "comment", label: "Testimonials", href: "/admin/testimonials" },
  { icon: "info", label: "About", href: "/admin/about" },
  { icon: "support_agent", label: "Services", href: "/admin/services" },
  { icon: "verified", label: "Why Us", href: "/admin/whyus" },
  { icon: "help", label: "FAQs", href: "/admin/faqs" },
  { icon: "description", label: "Form Fields", href: "/admin/form-fields" },
  {
    icon: "approval",
    label: "Property Approvals",
    href: "/admin/property-approvals",
  },
  {
    icon: "location_city",
    label: "Hotel Destinations",
    href: "/admin/hotel-destinations",
  },
  { icon: "article", label: "Blogs", href: "/admin/blogs" },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="admin-sidebar"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "280px",
        height: "100vh",
        background: "linear-gradient(180deg, #1f2937 0%, #111827 100%)",
        zIndex: 1000,
        overflowY: "auto",
        boxShadow: "4px 0 12px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1.5rem 1rem",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          marginBottom: "1rem",
        }}
      >
        <h2
          style={{
            margin: 0,
            fontSize: "1.25rem",
            fontWeight: 700,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ color: "#667eea" }}
          >
            admin_panel_settings
          </span>
          Admin Panel
        </h2>
      </div>

      {/* Menu Items */}
      <nav style={{ padding: "0 0.75rem" }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.875rem 1rem",
                marginBottom: "0.5rem",
                borderRadius: "10px",
                textDecoration: "none",
                color: isActive ? "white" : "#9ca3af",
                background: isActive
                  ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                  : "transparent",
                fontWeight: isActive ? 600 : 500,
                fontSize: "0.9rem",
                transition: "all 0.2s ease",
                boxShadow: isActive
                  ? "0 4px 12px rgba(102, 126, 234, 0.3)"
                  : "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background =
                    "rgba(255, 255, 255, 0.05)";
                  e.currentTarget.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "#9ca3af";
                }
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1.25rem", opacity: isActive ? 1 : 0.8 }}
              >
                {item.icon}
              </span>
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge && (
                <span
                  style={{
                    background: "#ef4444",
                    color: "white",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    padding: "0.15rem 0.5rem",
                    borderRadius: "10px",
                    minWidth: "20px",
                    textAlign: "center",
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Custom scrollbar styles - inline */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .admin-sidebar::-webkit-scrollbar {
            width: 6px;
          }
          .admin-sidebar::-webkit-scrollbar-track {
            background: rgba(255, 255, 255, 0.05);
          }
          .admin-sidebar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
            border-radius: 3px;
          }
          .admin-sidebar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
        `,
        }}
      />
    </aside>
  );
}
