"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";

interface WishlistItem {
  _id: string;
  propertyId: string;
  propertyName: string;
  propertyType: string;
  city: string;
  state: string;
  price: number;
  rating?: number;
  images?: string[];
  addedAt: string;
}

export default function WishlistPage() {
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchWishlist();
  }, []);

  const fetchWishlist = async () => {
    try {
      const response = await fetch("/api/user/wishlist", {
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setWishlist(data.wishlist);
      } else if (response.status === 401) {
        router.push("/auth/login");
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = async (propertyId: string) => {
    setRemovingId(propertyId);
    try {
      const response = await fetch("/api/user/wishlist", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ propertyId }),
      });

      if (response.ok) {
        setWishlist(wishlist.filter((item) => item.propertyId !== propertyId));
      }
    } catch (error) {
      console.error("Error removing from wishlist:", error);
    } finally {
      setRemovingId(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getPropertyIcon = (type: string) => {
    switch (type) {
      case "hotel":
        return "🏨";
      case "homestay":
        return "🏡";
      case "resort":
        return "🏖️";
      case "apartment":
        return "🏢";
      case "villa":
        return "🏰";
      default:
        return "📦";
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div
          style={{
            minHeight: "100vh",
            background: "#f3f4f6",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <p>Loading wishlist...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div
        style={{
          minHeight: "100vh",
          background: "#f3f4f6",
          paddingBottom: "4rem",
        }}
      >
        <div
          style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 1rem" }}
        >
          <div style={{ marginBottom: "2rem" }}>
            <h1
              style={{
                margin: "0 0 0.5rem",
                fontSize: "2rem",
                fontWeight: 700,
              }}
            >
              My Wishlist
            </h1>
            <p style={{ margin: 0, color: "#6b7280" }}>
              {wishlist.length > 0
                ? `${wishlist.length} saved ${
                    wishlist.length === 1 ? "property" : "properties"
                  }`
                : "No saved properties"}
            </p>
          </div>

          {wishlist.length === 0 ? (
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "3rem",
                textAlign: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>❤️</div>
              <h3
                style={{
                  margin: "0 0 0.5rem",
                  fontSize: "1.3rem",
                  fontWeight: 600,
                }}
              >
                Your Wishlist is Empty
              </h3>
              <p style={{ margin: "0 0 1.5rem", color: "#6b7280" }}>
                Start exploring and save your favorite properties!
              </p>
              <a href="/">
                <button
                  style={{
                    padding: "0.75rem 2rem",
                    background: "#0066cc",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Explore Properties
                </button>
              </a>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                gap: "1.5rem",
              }}
            >
              {wishlist.map((item) => (
                <div
                  key={item._id}
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    overflow: "hidden",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    border: "1px solid #e5e7eb",
                    position: "relative",
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-4px)";
                    e.currentTarget.style.boxShadow =
                      "0 8px 20px rgba(0,0,0,0.15)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow =
                      "0 2px 8px rgba(0,0,0,0.1)";
                  }}
                >
                  {/* Remove Button */}
                  <button
                    onClick={() => removeFromWishlist(item.propertyId)}
                    disabled={removingId === item.propertyId}
                    style={{
                      position: "absolute",
                      top: "0.75rem",
                      right: "0.75rem",
                      background:
                        removingId === item.propertyId ? "#9ca3af" : "white",
                      border: "none",
                      borderRadius: "50%",
                      width: "36px",
                      height: "36px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor:
                        removingId === item.propertyId
                          ? "not-allowed"
                          : "pointer",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
                      zIndex: 10,
                      fontSize: "1.2rem",
                    }}
                    title="Remove from wishlist"
                  >
                    {removingId === item.propertyId ? "⏳" : "❤️"}
                  </button>

                  {/* Property Image */}
                  <div
                    style={{
                      height: "200px",
                      background:
                        item.images && item.images.length > 0
                          ? `linear-gradient(rgba(0,0,0,0.1), rgba(0,0,0,0.3)), url(${item.images[0]}) center/cover`
                          : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "4rem",
                    }}
                  >
                    {(!item.images || item.images.length === 0) &&
                      getPropertyIcon(item.propertyType)}
                  </div>

                  {/* Property Details */}
                  <div style={{ padding: "1.25rem" }}>
                    <div style={{ marginBottom: "0.75rem" }}>
                      <h3
                        style={{
                          margin: "0 0 0.5rem",
                          fontSize: "1.1rem",
                          fontWeight: 700,
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
                        📍 {item.city}, {item.state}
                      </p>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        marginBottom: "0.75rem",
                      }}
                    >
                      <span
                        style={{
                          padding: "0.25rem 0.75rem",
                          background: "#f3f4f6",
                          color: "#1f2937",
                          borderRadius: "12px",
                          fontSize: "0.8rem",
                          fontWeight: 600,
                          textTransform: "capitalize",
                        }}
                      >
                        {getPropertyIcon(item.propertyType)} {item.propertyType}
                      </span>
                      {item.rating && (
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                            fontSize: "0.85rem",
                          }}
                        >
                          ⭐ <strong>{item.rating.toFixed(1)}</strong>
                        </span>
                      )}
                    </div>

                    <div
                      style={{
                        paddingTop: "0.75rem",
                        borderTop: "1px solid #f3f4f6",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                          Starting from
                        </div>
                        <div
                          style={{
                            fontSize: "1.3rem",
                            fontWeight: 700,
                            color: "#0066cc",
                          }}
                        >
                          {formatCurrency(item.price)}
                        </div>
                        <div
                          style={{
                            fontSize: "0.7rem",
                            color: "#9ca3af",
                            marginTop: "0.25rem",
                          }}
                        >
                          per night
                        </div>
                      </div>
                      <a href={`/hotels/${item.propertyId}`}>
                        <button
                          style={{
                            padding: "0.5rem 1rem",
                            background: "#0066cc",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: 600,
                            cursor: "pointer",
                            fontSize: "0.9rem",
                          }}
                        >
                          View Details
                        </button>
                      </a>
                    </div>

                    <div
                      style={{
                        marginTop: "0.75rem",
                        fontSize: "0.75rem",
                        color: "#9ca3af",
                      }}
                    >
                      Added {formatDate(item.addedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
