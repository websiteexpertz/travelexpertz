"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";

interface Booking {
  _id: string;
  bookingId: string;
  propertyName: string;
  propertyType: string;
  city: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  rooms: number;
  totalAmount: number;
  bookingStatus: string;
  paymentStatus: string;
  createdAt: string;
  isBooking?: boolean;
}

interface PackageInquiry {
  _id: string;
  packageId: string;
  packageTitle: string;
  customer: {
    fullName: string;
    phone: string;
    email: string;
  };
  travelDetails: {
    startDate: string;
    adults: number;
    children: number;
    accommodationType: string;
    budget: string;
    modeOfTravel: string;
    carType: string;
    additionalDetails: string;
  };
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  updatedAt: string;
  isInquiry?: boolean;
}

type CombinedItem = Booking | PackageInquiry;

export default function BookingsPage() {
  const router = useRouter();
  const [allItems, setAllItems] = useState<CombinedItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<CombinedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string>("");
  const [filter, setFilter] = useState<
    "all" | "upcoming" | "completed" | "cancelled"
  >("all");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    applyFilter();
  }, [filter, allItems]);

  const fetchData = async () => {
    try {
      // Get user email from session/profile
      const profileResponse = await fetch("/api/auth/user-profile", {
        credentials: "include",
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        const email = profileData.email;
        setUserEmail(email);

        // Fetch both bookings and inquiries in parallel
        const [bookingsResponse, inquiriesResponse] = await Promise.all([
          fetch("/api/user/bookings", {
            credentials: "include",
          }),
          fetch(`/api/package-inquiries/user/${encodeURIComponent(email)}`, {
            credentials: "include",
          }),
        ]);

        const combinedItems: CombinedItem[] = [];

        // Add hotel and homestay bookings
        if (bookingsResponse.ok) {
          const data = await bookingsResponse.json();
          const filteredBookings = data.bookings.filter(
            (booking: any) => booking.propertyType !== "package",
          );
          combinedItems.push(...filteredBookings);
        }

        // Add package inquiries
        if (inquiriesResponse.ok) {
          const data = await inquiriesResponse.json();
          if (data.inquiries && data.inquiries.length > 0) {
            combinedItems.push(...(data.inquiries || []));
          }
        }

        // Sort by creation date (newest first)
        combinedItems.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );

        setAllItems(combinedItems);
      } else if (profileResponse.status === 401) {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (filter === "all") {
      setFilteredItems(allItems);
      return;
    }

    const now = new Date();
    let filtered = allItems.filter((item) => {
      if (isBooking(item)) {
        const checkOutDate = new Date(item.checkOut);
        if (filter === "upcoming") {
          return (
            checkOutDate > now &&
            (item.bookingStatus === "confirmed" ||
              item.bookingStatus === "pending")
          );
        } else if (filter === "completed") {
          return (
            checkOutDate <= now &&
            (item.bookingStatus === "completed" ||
              item.bookingStatus === "confirmed" ||
              item.bookingStatus === "pending")
          );
        } else if (filter === "cancelled") {
          return item.bookingStatus === "cancelled";
        }
      } else if (isInquiry(item)) {
        const startDate = new Date(item.travelDetails.startDate);
        if (filter === "upcoming") {
          return (
            startDate > now &&
            (item.status === "pending" || item.status === "approved")
          );
        } else if (filter === "completed") {
          return (
            startDate <= now || (item.status === "approved" && startDate <= now)
          );
        } else if (filter === "cancelled") {
          return item.status === "rejected";
        }
      }
      return true;
    });

    setFilteredItems(filtered);
  };

  const isBooking = (item: CombinedItem): item is Booking => {
    return "bookingId" in item && "propertyName" in item;
  };

  const isInquiry = (item: CombinedItem): item is PackageInquiry => {
    return "packageTitle" in item && "customer" in item;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return { bg: "#dcfce7", color: "#166534" };
      case "completed":
        return { bg: "#dbeafe", color: "#1e40af" };
      case "cancelled":
        return { bg: "#fee2e2", color: "#991b1b" };
      case "pending":
        return { bg: "#fef3c7", color: "#92400e" };
      case "approved":
        return { bg: "#dcfce7", color: "#166534" };
      case "rejected":
        return { bg: "#fee2e2", color: "#991b1b" };
      default:
        return { bg: "#f3f4f6", color: "#6b7280" };
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return { bg: "#dcfce7", color: "#166534" };
      case "pending":
        return { bg: "#fef3c7", color: "#92400e" };
      case "failed":
        return { bg: "#fee2e2", color: "#991b1b" };
      case "refunded":
        return { bg: "#dbeafe", color: "#1e40af" };
      default:
        return { bg: "#f3f4f6", color: "#6b7280" };
    }
  };

  if (loading) {
    return (
      <>
        <Header solidHeader={true} />
        <div
          style={{
            minHeight: "100vh",
            background: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p>Loading bookings & inquiries...</p>
        </div>
      </>
    );
  }

  const containerStyle: React.CSSProperties = {
    padding: "2rem",
    maxWidth: "1400px",
    margin: "0 auto",
    minHeight: "100vh",
    background: "#f9fafb",
  };

  const cardStyle: React.CSSProperties = {
    background: "white",
    borderRadius: "12px",
    padding: "1.75rem",
    marginBottom: "1.5rem",
    border: "1px solid #e5e7eb",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
  };

  const titleStyle: React.CSSProperties = {
    fontSize: "2rem",
    fontWeight: 700,
    color: "#1f2937",
    margin: 0,
    marginBottom: "2rem",
  };

  return (
    <>
      <Header solidHeader={true} />
      <div style={containerStyle}>
        <h1 style={titleStyle}>📅 My Bookings & Inquiries</h1>

        {/* Filter Buttons */}
        <div
          style={{
            display: "flex",
            gap: "1rem",
            marginBottom: "2rem",
            flexWrap: "wrap",
          }}
        >
          {[
            { value: "all", label: "All" },
            { value: "upcoming", label: "Upcoming" },
            { value: "completed", label: "Completed" },
            { value: "cancelled", label: "Cancelled" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as any)}
              style={{
                padding: "0.75rem 1.5rem",
                background: filter === tab.value ? "#0066cc" : "white",
                color: filter === tab.value ? "white" : "#1f2937",
                border: filter === tab.value ? "none" : "1px solid #d1d5db",
                borderRadius: "8px",
                fontWeight: 600,
                cursor: "pointer",
                fontSize: "0.95rem",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                if (filter !== tab.value) {
                  (e.target as HTMLElement).style.borderColor = "#0066cc";
                  (e.target as HTMLElement).style.color = "#0066cc";
                }
              }}
              onMouseLeave={(e) => {
                if (filter !== tab.value) {
                  (e.target as HTMLElement).style.borderColor = "#d1d5db";
                  (e.target as HTMLElement).style.color = "#1f2937";
                }
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {filteredItems.length === 0 ? (
          <div
            style={{
              ...cardStyle,
              textAlign: "center",
              padding: "3rem",
            }}
          >
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>📋</div>
            <h3
              style={{
                margin: "0 0 0.5rem",
                fontSize: "1.3rem",
                fontWeight: 600,
              }}
            >
              {allItems.length === 0
                ? "No Bookings or Inquiries Yet"
                : `No ${filter} items found`}
            </h3>
            <p style={{ margin: "0", color: "#6b7280" }}>
              {allItems.length === 0
                ? "You haven't made any bookings or submitted any inquiries yet. Explore our properties and packages to get started!"
                : `You don't have any ${filter} bookings or inquiries.`}
            </p>
            <div
              style={{
                display: "flex",
                gap: "1rem",
                justifyContent: "center",
                marginTop: "1.5rem",
              }}
            >
              <a href="/">
                <button
                  style={{
                    padding: "0.875rem 2rem",
                    background:
                      "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0, 102, 204, 0.3)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.transform =
                      "translateY(-2px)";
                    (e.target as HTMLElement).style.boxShadow =
                      "0 6px 20px rgba(0, 102, 204, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.transform = "translateY(0)";
                    (e.target as HTMLElement).style.boxShadow =
                      "0 4px 12px rgba(0, 102, 204, 0.3)";
                  }}
                >
                  Explore Bookings
                </button>
              </a>
              <a href="/packages">
                <button
                  style={{
                    padding: "0.875rem 2rem",
                    background:
                      "linear-gradient(135deg, #0066cc 0%, #0052a3 100%)",
                    color: "white",
                    border: "none",
                    borderRadius: "10px",
                    fontWeight: 600,
                    cursor: "pointer",
                    boxShadow: "0 4px 12px rgba(0, 102, 204, 0.3)",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    (e.target as HTMLElement).style.transform =
                      "translateY(-2px)";
                    (e.target as HTMLElement).style.boxShadow =
                      "0 6px 20px rgba(0, 102, 204, 0.4)";
                  }}
                  onMouseLeave={(e) => {
                    (e.target as HTMLElement).style.transform = "translateY(0)";
                    (e.target as HTMLElement).style.boxShadow =
                      "0 4px 12px rgba(0, 102, 204, 0.3)";
                  }}
                >
                  Explore Packages
                </button>
              </a>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1.5rem",
            }}
          >
            {filteredItems.map((item) => {
              if (isBooking(item)) {
                const statusStyle = getStatusColor(item.bookingStatus);
                const paymentStyle = getPaymentStatusColor(item.paymentStatus);

                return (
                  <div
                    key={item._id}
                    style={{
                      ...cardStyle,
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      borderLeft: "4px solid #0066cc",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 8px 24px rgba(0, 0, 0, 0.12)";
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 2px 8px rgba(0, 0, 0, 0.05)";
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "inline-block",
                            padding: "0.35rem 0.75rem",
                            background: "#e0f2fe",
                            color: "#0369a1",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                          }}
                        >
                          🏨 BOOKING
                        </div>
                        <h3
                          style={{
                            margin: "0.5rem 0 0.5rem",
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            color: "#1f2937",
                          }}
                        >
                          {item.propertyName}
                        </h3>
                        <p
                          style={{
                            margin: "0",
                            color: "#6b7280",
                            fontSize: "0.9rem",
                          }}
                        >
                          📍 {item.city} •{" "}
                          {item.propertyType === "hotel"
                            ? "🏨"
                            : item.propertyType === "homestay"
                              ? "🏡"
                              : "📦"}{" "}
                          <span style={{ textTransform: "capitalize" }}>
                            {item.propertyType}
                          </span>
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div
                          style={{
                            fontSize: "0.85rem",
                            color: "#6b7280",
                            marginBottom: "0.75rem",
                          }}
                        >
                          Booking ID:{" "}
                          <strong style={{ color: "#0066cc" }}>
                            {item.bookingId}
                          </strong>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            gap: "0.5rem",
                            justifyContent: "flex-end",
                            flexWrap: "wrap",
                          }}
                        >
                          <span
                            style={{
                              padding: "0.5rem 1rem",
                              background: statusStyle.bg,
                              color: statusStyle.color,
                              borderRadius: "10px",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              textTransform: "capitalize",
                            }}
                          >
                            {item.bookingStatus}
                          </span>
                          <span
                            style={{
                              padding: "0.5rem 1rem",
                              background: paymentStyle.bg,
                              color: paymentStyle.color,
                              borderRadius: "10px",
                              fontSize: "0.85rem",
                              fontWeight: 700,
                              textTransform: "capitalize",
                            }}
                          >
                            {item.paymentStatus}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: "1.5rem",
                        padding: "1.5rem 0",
                        borderTop: "1px solid #e5e7eb",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Check-in
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#1f2937",
                            fontSize: "1rem",
                          }}
                        >
                          {formatDate(item.checkIn)}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Check-out
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#1f2937",
                            fontSize: "1rem",
                          }}
                        >
                          {formatDate(item.checkOut)}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Guests
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#1f2937",
                            fontSize: "1rem",
                          }}
                        >
                          {item.guests} Guest
                          {item.guests !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Rooms
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#1f2937",
                            fontSize: "1rem",
                          }}
                        >
                          {item.rooms} Room{item.rooms !== 1 ? "s" : ""}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Total Amount
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#0066cc",
                            fontSize: "1.1rem",
                          }}
                        >
                          {formatCurrency(item.totalAmount)}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: "1rem",
                        fontSize: "0.85rem",
                        color: "#9ca3af",
                      }}
                    >
                      🕐 Booked on {formatDate(item.createdAt)}
                    </div>
                  </div>
                );
              } else if (isInquiry(item)) {
                const inquiryStatusStyle = getStatusColor(item.status);

                return (
                  <div
                    key={item._id}
                    style={{
                      ...cardStyle,
                      transition: "all 0.2s ease",
                      cursor: "pointer",
                      borderLeft: "4px solid #f59e0b",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 8px 24px rgba(0, 0, 0, 0.12)";
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(-2px)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.boxShadow =
                        "0 2px 8px rgba(0, 0, 0, 0.05)";
                      (e.currentTarget as HTMLElement).style.transform =
                        "translateY(0)";
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: "1.5rem",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            display: "inline-block",
                            padding: "0.35rem 0.75rem",
                            background: "#fef3c7",
                            color: "#92400e",
                            borderRadius: "6px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            marginBottom: "0.5rem",
                          }}
                        >
                          ✈️ INQUIRY
                        </div>
                        <h3
                          style={{
                            margin: "0.5rem 0 0.5rem",
                            fontSize: "1.25rem",
                            fontWeight: 700,
                            color: "#1f2937",
                          }}
                        >
                          {item.packageTitle}
                        </h3>
                        <p
                          style={{
                            margin: "0",
                            color: "#6b7280",
                            fontSize: "0.9rem",
                          }}
                        >
                          📞 {item.customer.phone} •{" "}
                          <a
                            href={`mailto:${item.customer.email}`}
                            style={{
                              color: "#0066cc",
                              textDecoration: "none",
                            }}
                          >
                            {item.customer.email}
                          </a>
                        </p>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "0.5rem 1rem",
                            background: inquiryStatusStyle.bg,
                            color: inquiryStatusStyle.color,
                            borderRadius: "10px",
                            fontSize: "0.85rem",
                            fontWeight: 700,
                            textTransform: "capitalize",
                          }}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(140px, 1fr))",
                        gap: "1.5rem",
                        padding: "1.5rem 0",
                        borderTop: "1px solid #e5e7eb",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Travel Date
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#1f2937",
                            fontSize: "1rem",
                          }}
                        >
                          {new Date(
                            item.travelDetails.startDate,
                          ).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Travelers
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#1f2937",
                            fontSize: "1rem",
                          }}
                        >
                          {item.travelDetails.adults} Adults,{" "}
                          {item.travelDetails.children} Children
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Accommodation
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#1f2937",
                            fontSize: "1rem",
                          }}
                        >
                          {item.travelDetails.accommodationType}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Budget
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#1f2937",
                            fontSize: "1rem",
                          }}
                        >
                          {item.travelDetails.budget}
                        </div>
                      </div>
                      <div>
                        <div
                          style={{
                            fontSize: "0.8rem",
                            fontWeight: 700,
                            color: "#6b7280",
                            textTransform: "uppercase",
                            letterSpacing: "0.05em",
                            marginBottom: "0.5rem",
                          }}
                        >
                          Mode of Travel
                        </div>
                        <div
                          style={{
                            fontWeight: 700,
                            color: "#1f2937",
                            fontSize: "1rem",
                          }}
                        >
                          {item.travelDetails.modeOfTravel}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        marginTop: "1rem",
                        fontSize: "0.85rem",
                        color: "#9ca3af",
                      }}
                    >
                      🕐 Submitted on {formatDate(item.createdAt)}
                    </div>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </>
  );
}
