"use client";
import { useState, useEffect } from "react";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  data: {
    guestName: string;
    propertyName: string;
    checkin: string;
    checkout: string;
    nights: number;
    totalPrice: number;
    guestMessage?: string;
  };
  isRead: boolean;
  createdAt: string;
}

export default function BookingNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const headers: Record<string, string> = {};

      // Add token to Authorization header if available
      const authToken = localStorage.getItem("ownerToken");
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const res = await fetch("/api/owner/notifications", {
        credentials: "include",
        headers,
      });

      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications);
        setUnreadCount(data.unreadCount);
      } else if (res.status === 401) {
        console.error("Unauthorized - redirecting to login");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      // Add token to Authorization header if available
      const authToken = localStorage.getItem("ownerToken");
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const res = await fetch("/api/owner/notifications", {
        method: "PATCH",
        headers,
        credentials: "include",
        body: JSON.stringify({ notificationId, isRead: true }),
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const deleteNotification = async (notificationId: string) => {
    try {
      const headers: Record<string, string> = {};

      // Add token to Authorization header if available
      const authToken = localStorage.getItem("ownerToken");
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const res = await fetch(`/api/owner/notifications?id=${notificationId}`, {
        method: "DELETE",
        headers,
        credentials: "include",
      });

      if (res.ok) {
        fetchNotifications();
      }
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "2rem", color: "#666" }}>
        Loading notifications...
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div
        style={{
          background: "#f0f9ff",
          border: "2px solid #0284c7",
          padding: "2rem",
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔔</div>
        <p style={{ fontSize: "1rem", color: "#0284c7", fontWeight: "600" }}>
          No notifications yet
        </p>
        <p style={{ color: "#666", fontSize: "0.9rem" }}>
          Bookings will appear here
        </p>
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "1rem",
        }}
      >
        <h2 style={{ fontSize: "1.2rem", fontWeight: "700", margin: 0 }}>
          📬 Booking Notifications
          {unreadCount > 0 && (
            <span
              style={{
                background: "#ef4444",
                color: "#fff",
                borderRadius: "50%",
                width: "24px",
                height: "24px",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.75rem",
                fontWeight: "700",
                marginLeft: "0.5rem",
              }}
            >
              {unreadCount}
            </span>
          )}
        </h2>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {notifications.map((notification) => {
          const checkinDate = new Date(
            notification.data.checkin,
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          const checkoutDate = new Date(
            notification.data.checkout,
          ).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          const isExpanded = expandedId === notification._id;

          return (
            <div
              key={notification._id}
              style={{
                background: "#fff",
                border: `2px solid ${
                  notification.isRead ? "#e5e7eb" : "#3b82f6"
                }`,
                borderRadius: "12px",
                padding: "1.5rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                transition: "all 0.3s ease",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  marginBottom: "1rem",
                }}
              >
                <div style={{ flex: 1 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.5rem",
                    }}
                  >
                    <span style={{ fontSize: "1.5rem" }}>🏨</span>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1rem",
                        fontWeight: "700",
                        color: "#111",
                      }}
                    >
                      {notification.title}
                    </h3>
                    {!notification.isRead && (
                      <div
                        style={{
                          width: "8px",
                          height: "8px",
                          background: "#3b82f6",
                          borderRadius: "50%",
                        }}
                      />
                    )}
                  </div>
                  <p
                    style={{
                      margin: "0.5rem 0 0 0",
                      color: "#666",
                      fontSize: "0.9rem",
                    }}
                  >
                    {notification.message}
                  </p>
                </div>
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: "#999",
                    whiteSpace: "nowrap",
                    marginLeft: "1rem",
                  }}
                >
                  {new Date(notification.createdAt).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </div>
              </div>

              {/* Summary */}
              <div
                style={{
                  background: "#f9fafb",
                  padding: "1rem",
                  borderRadius: "8px",
                  marginBottom: "1rem",
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#666",
                      fontWeight: "600",
                    }}
                  >
                    GUEST NAME
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      marginTop: "0.25rem",
                    }}
                  >
                    {notification.data.guestName}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#666",
                      fontWeight: "600",
                    }}
                  >
                    PROPERTY
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      marginTop: "0.25rem",
                    }}
                  >
                    {notification.data.propertyName}
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#666",
                      fontWeight: "600",
                    }}
                  >
                    DATES
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: "600",
                      marginTop: "0.25rem",
                    }}
                  >
                    {checkinDate} - {checkoutDate} ({notification.data.nights}N)
                  </div>
                </div>
                <div>
                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#666",
                      fontWeight: "600",
                    }}
                  >
                    TOTAL AMOUNT
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: "700",
                      color: "#10b981",
                      marginTop: "0.25rem",
                    }}
                  >
                    ₹{notification.data.totalPrice.toFixed(2)}
                  </div>
                </div>
              </div>

              {/* Guest Message */}
              {notification.data.guestMessage && (
                <div style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "#666",
                      fontWeight: "600",
                      marginBottom: "0.5rem",
                    }}
                  >
                    GUEST MESSAGE
                  </div>
                  <div
                    style={{
                      background: "#fef3c7",
                      border: "1px solid #fcd34d",
                      padding: "0.75rem",
                      borderRadius: "6px",
                      fontSize: "0.9rem",
                      color: "#333",
                    }}
                  >
                    "{notification.data.guestMessage}"
                  </div>
                </div>
              )}

              {/* Actions */}
              <div
                style={{
                  display: "flex",
                  gap: "0.5rem",
                  justifyContent: "flex-end",
                }}
              >
                {!notification.isRead && (
                  <button
                    onClick={() => markAsRead(notification._id)}
                    style={{
                      padding: "0.5rem 1rem",
                      background: "#3b82f6",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                    }}
                  >
                    ✓ Mark as Read
                  </button>
                )}
                <button
                  onClick={() => deleteNotification(notification._id)}
                  style={{
                    padding: "0.5rem 1rem",
                    background: "#f3f4f6",
                    color: "#666",
                    border: "1px solid #e5e7eb",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
