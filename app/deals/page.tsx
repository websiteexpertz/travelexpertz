"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "../components/Header";

interface Offer {
  id: string;
  type: "percentage" | "stay_bonus" | "early_booking" | "custom";
  title: string;
  description: string;
  discountPercentage?: number;
  stayDays?: number;
  bonusDescription?: string;
  advanceBookingDays?: number;
  validFrom: string;
  validUntil: string;
  active: boolean;
}

interface DealItem {
  _id: string;
  name?: string;
  title?: string;
  location?: string;
  destination?: string;
  price: number;
  rating?: number;
  reviews?: number;
  image: string;
  images?: string[];
  category: "hotel" | "homestay" | "package";
  offers: Offer[];
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatInr = (value: number) =>
  inrFormatter.format(Math.max(0, Math.round(value)));

export default function DealsPage() {
  const router = useRouter();
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "hotel" | "homestay" | "package"
  >("all");

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      const [hotelsRes, homestaysRes, packagesRes] = await Promise.all([
        fetch("/api/hotels", { cache: "no-store" }),
        fetch("/api/homestays", { cache: "no-store" }),
        fetch("/api/packages", { cache: "no-store" }),
      ]);

      const allDeals: DealItem[] = [];

      if (hotelsRes.ok) {
        const hotels = await hotelsRes.json();
        hotels.forEach((hotel: any) => {
          // Check for offers or isDeal flag
          const hasOffers =
            hotel.offers &&
            hotel.offers.length > 0 &&
            hotel.offers.some((o: Offer) => o.active);
          const isDeal = hotel.isDeal === true;

          if (hasOffers || isDeal) {
            allDeals.push({ ...hotel, category: "hotel" });
          }
        });
      }

      if (homestaysRes.ok) {
        const homestays = await homestaysRes.json();
        homestays.forEach((homestay: any) => {
          // Check for offers or isDeal flag
          const hasOffers =
            homestay.offers &&
            homestay.offers.length > 0 &&
            homestay.offers.some((o: Offer) => o.active);
          const isDeal = homestay.isDeal === true;

          if (hasOffers || isDeal) {
            allDeals.push({ ...homestay, category: "homestay" });
          }
        });
      }

      if (packagesRes.ok) {
        const packages = await packagesRes.json();
        packages.forEach((pkg: any) => {
          if (
            pkg.offers &&
            pkg.offers.length > 0 &&
            pkg.offers.some((o: Offer) => o.active)
          ) {
            allDeals.push({ ...pkg, category: "package" });
          }
        });
      }

      setDeals(allDeals);
    } catch (error) {
      console.error("Failed to fetch deals:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredDeals = () => {
    if (filter === "all") return deals;
    return deals.filter((deal) => deal.category === filter);
  };

  const getActiveOffers = (item: DealItem) => {
    if (!item.offers || !Array.isArray(item.offers)) return [];
    return item.offers.filter((o) => o.active);
  };

  const getBestOffer = (item: DealItem) => {
    const activeOffers = getActiveOffers(item);
    if (activeOffers.length === 0) return null;

    // Prioritize percentage discounts
    const percentageOffer = activeOffers.find(
      (o) => o.discountPercentage && o.discountPercentage > 0,
    );
    if (percentageOffer) return percentageOffer;

    return activeOffers[0];
  };

  const getDiscountedPrice = (price: number, offer: Offer | null) => {
    if (!offer || !offer.discountPercentage) return price;
    return price - (price * offer.discountPercentage) / 100;
  };

  const handleItemClick = (item: DealItem) => {
    if (item.category === "hotel") {
      router.push(`/hotels/${item._id}`);
    } else if (item.category === "homestay") {
      router.push(`/homestays/${item._id}`);
    } else if (item.category === "package") {
      router.push(`/packages/${item._id}`);
    }
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
      <Header currentPage="deals" />

      <main style={{ padding: "2rem 1rem" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          {/* Header */}
          <div style={{ marginBottom: "2rem", textAlign: "center" }}>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 800,
                marginBottom: "0.5rem",
                color: "#1f2937",
              }}
            >
              🎁 Special Deals & Offers
            </h1>
            <p style={{ fontSize: "1.1rem", color: "#6b7280" }}>
              Exclusive discounts on hotels, homestays, and packages
            </p>
          </div>

          {/* Filter Tabs */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              marginBottom: "2rem",
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            {["all", "hotel", "homestay", "package"].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat as any)}
                style={{
                  padding: "0.75rem 2rem",
                  background: filter === cat ? "#0066cc" : "white",
                  color: filter === cat ? "white" : "#1f2937",
                  border: filter === cat ? "none" : "2px solid #e5e7eb",
                  borderRadius: "25px",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: 600,
                  textTransform: "capitalize",
                  transition: "all 0.3s",
                }}
              >
                {cat === "all" ? "All Deals" : `${cat}s`}
              </button>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div
              style={{ textAlign: "center", padding: "4rem", color: "#6b7280" }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>⏳</div>
              <p>Loading amazing deals...</p>
            </div>
          )}

          {/* No Deals */}
          {!loading && getFilteredDeals().length === 0 && (
            <div
              style={{
                textAlign: "center",
                padding: "4rem",
                background: "white",
                borderRadius: "16px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🔍</div>
              <h3
                style={{
                  fontSize: "1.5rem",
                  marginBottom: "0.5rem",
                  color: "#1f2937",
                }}
              >
                No Deals Available
              </h3>
              <p style={{ color: "#6b7280" }}>
                Check back soon for exciting offers and discounts!
              </p>
            </div>
          )}

          {/* Deals Grid */}
          {!loading && getFilteredDeals().length > 0 && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))",
                gap: "2rem",
              }}
            >
              {getFilteredDeals().map((deal) => {
                const bestOffer = getBestOffer(deal);
                const discountedPrice = getDiscountedPrice(
                  deal.price,
                  bestOffer,
                );
                const activeOffers = getActiveOffers(deal);

                return (
                  <div
                    key={deal._id}
                    onClick={() => handleItemClick(deal)}
                    style={{
                      background: "white",
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      cursor: "pointer",
                      transition: "transform 0.3s, box-shadow 0.3s",
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-8px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(0,0,0,0.15)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(0,0,0,0.1)";
                    }}
                  >
                    {/* Offer Badge */}
                    {bestOffer && bestOffer.discountPercentage && (
                      <div
                        style={{
                          position: "absolute",
                          top: "1rem",
                          right: "1rem",
                          background:
                            "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
                          color: "white",
                          padding: "0.5rem 1rem",
                          borderRadius: "8px",
                          fontWeight: 700,
                          fontSize: "1rem",
                          zIndex: 10,
                          boxShadow: "0 4px 12px rgba(238, 90, 111, 0.4)",
                        }}
                      >
                        {bestOffer.discountPercentage}% OFF
                      </div>
                    )}

                    {/* Category Badge */}
                    <div
                      style={{
                        position: "absolute",
                        top: "1rem",
                        left: "1rem",
                        background: "rgba(0, 0, 0, 0.7)",
                        color: "white",
                        padding: "0.4rem 0.8rem",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        textTransform: "capitalize",
                        zIndex: 10,
                      }}
                    >
                      {deal.category}
                    </div>

                    {/* Image */}
                    <div style={{ height: "140px", overflow: "hidden" }}>
                      <img
                        src={
                          deal.image ||
                          (deal.images && deal.images[0]) ||
                          "https://via.placeholder.com/400x300"
                        }
                        alt={deal.name || deal.title}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    </div>

                    {/* Content */}
                    <div style={{ padding: "1.5rem" }}>
                      <h3
                        style={{
                          fontSize: "1.3rem",
                          fontWeight: 700,
                          marginBottom: "0.5rem",
                          color: "#1f2937",
                        }}
                      >
                        {deal.name || deal.title}
                      </h3>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          marginBottom: "1rem",
                          color: "#6b7280",
                          fontSize: "0.9rem",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "1.1rem" }}
                        >
                          location_on
                        </span>
                        <span>{deal.location || deal.destination}</span>
                      </div>

                      {/* Offers List */}
                      <div style={{ marginBottom: "1rem" }}>
                        {activeOffers.slice(0, 2).map((offer) => (
                          <div
                            key={offer.id}
                            style={{
                              padding: "0.5rem",
                              background: "#dcfce7",
                              color: "#166534",
                              borderRadius: "6px",
                              fontSize: "0.85rem",
                              marginBottom: "0.5rem",
                              fontWeight: 600,
                            }}
                          >
                            ✓ {offer.title}
                          </div>
                        ))}
                        {activeOffers.length > 2 && (
                          <div
                            style={{
                              fontSize: "0.8rem",
                              color: "#6b7280",
                              marginTop: "0.25rem",
                            }}
                          >
                            +{activeOffers.length - 2} more offer
                            {activeOffers.length - 2 !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>

                      {/* Rating */}
                      {deal.rating && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.5rem",
                            marginBottom: "1rem",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "0.25rem",
                              background: "#00b894",
                              color: "white",
                              padding: "0.25rem 0.5rem",
                              borderRadius: "6px",
                              fontSize: "0.9rem",
                              fontWeight: 600,
                            }}
                          >
                            <span
                              className="material-symbols-outlined"
                              style={{ fontSize: "1rem" }}
                            >
                              star
                            </span>
                            {deal.rating}
                          </div>
                          {deal.reviews && (
                            <span
                              style={{ color: "#6b7280", fontSize: "0.9rem" }}
                            >
                              ({deal.reviews} reviews)
                            </span>
                          )}
                        </div>
                      )}

                      {/* Price */}
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                          paddingTop: "1rem",
                          borderTop: "2px solid #f3f4f6",
                        }}
                      >
                        <div>
                          {bestOffer && bestOffer.discountPercentage ? (
                            <>
                              <div
                                style={{
                                  fontSize: "0.9rem",
                                  color: "#6b7280",
                                  textDecoration: "line-through",
                                }}
                              >
                                {formatInr(deal.price)}
                              </div>
                              <div
                                style={{
                                  fontSize: "1.5rem",
                                  fontWeight: 800,
                                  color: "#00b894",
                                }}
                              >
                                {formatInr(discountedPrice)}
                              </div>
                            </>
                          ) : (
                            <div
                              style={{
                                fontSize: "1.5rem",
                                fontWeight: 800,
                                color: "#1f2937",
                              }}
                            >
                              {formatInr(deal.price)}
                            </div>
                          )}
                        </div>
                        <button
                          style={{
                            marginLeft: "auto",
                            padding: "0.75rem 1.5rem",
                            background:
                              "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "0.95rem",
                            fontWeight: 700,
                            cursor: "pointer",
                          }}
                        >
                          View Deal
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
