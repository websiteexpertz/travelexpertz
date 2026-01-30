"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../components/Header";
import Footer from "../../components/Footer";

interface Room {
  id: string;
  type: string;
  price: number;
  originalPrice?: number;
  maxGuests: number;
  bedType: string;
  size: number;
  amenities: string[];
  images: string[];
  availability: number;
  cancellationPolicy: string;
  mealPlan?: string;
}

interface Review {
  id: string;
  userName: string;
  rating: number;
  date: string;
  comment: string;
  helpful: number;
}

interface Homestay {
  _id: string;
  name: string;
  location: string;
  address: string;
  rating: number;
  reviews: number;
  images: string[];
  description: string;
  amenities: string[];
  nearbyPlaces: { name: string; distance: string }[];
  checkInTime: string;
  checkOutTime: string;
  rooms: Room[];
  userReviews: Review[];
  policies: {
    cancellation: string;
    checkIn: string;
    checkOut: string;
    pets: string;
  };
  propertyType?: string;
  hostName?: string;
  hostEmail?: string;
  hostPhone?: string;
}

const inrFormatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatInr = (value: number) =>
  inrFormatter.format(Math.max(0, Math.round(value)));

export default function HomestayDetails() {
  const params = useParams();
  const homestayId = params?.id as string;

  const [homestay, setHomestay] = useState<Homestay | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [showFullscreenGallery, setShowFullscreenGallery] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<
    "overview" | "rooms" | "amenities" | "reviews" | "location"
  >("overview");

  // Room filters
  const [roomFilters, setRoomFilters] = useState({
    priceRange: "all",
    guests: "2",
    mealPlan: "all",
    sortBy: "price-low",
  });

  // Booking details
  const [bookingDetails, setBookingDetails] = useState({
    checkIn: "",
    checkOut: "",
    rooms: 1,
    guests: 2,
  });

  const [showBookingForm, setShowBookingForm] = useState(false);

  useEffect(() => {
    const fetchHomestayDetails = async () => {
      if (!homestayId) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/homestays?id=${homestayId}`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setHomestay(data);
        }
      } catch (error) {
        console.error("Failed to fetch homestay details:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?propertyId=${homestayId}`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        }
      } catch (error) {
        console.error("Failed to fetch reviews:", error);
      }
    };

    fetchHomestayDetails();
    fetchReviews();
  }, [homestayId]);

  const filteredRooms = homestay?.rooms
    ? homestay.rooms
        .filter((room) => {
          const matchesPrice =
            roomFilters.priceRange === "all" ||
            (roomFilters.priceRange === "budget" && room.price < 15000) ||
            (roomFilters.priceRange === "mid" &&
              room.price >= 15000 &&
              room.price <= 20000) ||
            (roomFilters.priceRange === "luxury" && room.price > 20000);

          const matchesGuests =
            room.maxGuests >= parseInt(roomFilters.guests || "2");

          const matchesMeal =
            roomFilters.mealPlan === "all" ||
            room.mealPlan?.includes(roomFilters.mealPlan);

          return matchesPrice && matchesGuests && matchesMeal;
        })
        .sort((a, b) => {
          if (roomFilters.sortBy === "price-low") return a.price - b.price;
          if (roomFilters.sortBy === "price-high") return b.price - a.price;
          if (roomFilters.sortBy === "size") return b.size - a.size;
          return 0;
        })
    : [];

  const calculateNights = () => {
    if (!bookingDetails.checkIn || !bookingDetails.checkOut) return 0;
    const start = new Date(bookingDetails.checkIn);
    const end = new Date(bookingDetails.checkOut);
    const diff = end.getTime() - start.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <Header currentPage="homestays" />
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            fontSize: "1.2rem",
            color: "#64748b",
          }}
        >
          Loading homestay details...
        </div>
      </div>
    );
  }

  if (!homestay) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <Header currentPage="homestays" />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "60vh",
            gap: "1rem",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "4rem", color: "#94a3b8" }}
          >
            home
          </span>
          <div style={{ fontSize: "1.2rem", color: "#64748b" }}>
            Homestay not found
          </div>
          <a
            href="/homestays"
            style={{
              padding: "0.75rem 1.5rem",
              background: "#3b82f6",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "1rem",
            }}
          >
            Browse All Homestays
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
      <Header currentPage="homestays" />

      <main className="flex flex-col items-center w-full">
        {/* Image Gallery */}
        {homestay.images && homestay.images.length > 0 ? (
          <div
            style={{
              width: "100%",
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "1.5rem 1rem",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  homestay.images.length === 1 ? "1fr" : "2fr 1fr 1fr",
                gap: "0.5rem",
                height: "400px",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              {/* Main large image */}
              <div
                style={{
                  gridRow: homestay.images.length > 1 ? "1 / 3" : "1",
                  position: "relative",
                  cursor: "pointer",
                  overflow: "hidden",
                }}
                onClick={() => {
                  setFullscreenImageIndex(0);
                  setShowFullscreenGallery(true);
                }}
              >
                <img
                  src={homestay.images[0]}
                  alt={homestay.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://via.placeholder.com/800x400?text=Image+Not+Found";
                  }}
                />
              </div>
              {/* Smaller images grid */}
              {homestay.images.slice(1, 5).map((img, idx) => (
                <div
                  key={idx}
                  style={{
                    position: "relative",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                  onClick={() => {
                    setFullscreenImageIndex(idx + 1);
                    setShowFullscreenGallery(true);
                  }}
                >
                  <img
                    src={img}
                    alt={`${homestay.name} ${idx + 2}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)";
                    }}
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/400x200?text=Image+Not+Found";
                    }}
                  />
                  {idx === 3 && homestay.images.length > 5 && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "rgba(0, 0, 0, 0.6)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "1.5rem",
                        fontWeight: 700,
                        cursor: "pointer",
                      }}
                    >
                      +{homestay.images.length - 5} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : homestay.images && homestay.images.length > 0 ? (
          <div
            style={{
              width: "100%",
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "1.5rem 1rem",
            }}
          >
            <div
              style={{
                width: "100%",
                height: "400px",
                borderRadius: "16px",
                overflow: "hidden",
              }}
            >
              <img
                src={
                  homestay.images && homestay.images.length > 0
                    ? homestay.images[0]
                    : ""
                }
                alt={homestay.name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
                onError={(e) => {
                  e.currentTarget.src =
                    "https://via.placeholder.com/1280x400?text=Image+Not+Found";
                }}
              />
            </div>
          </div>
        ) : null}

        {/* Main Content */}
        <div
          style={{
            width: "100%",
            maxWidth: "1280px",
            margin: "0 auto",
            padding: "0 1rem 2rem",
            display: "grid",
            gridTemplateColumns: "1fr 380px",
            gap: "2rem",
          }}
        >
          {/* Left Column - Details */}
          <div>
            {/* Hotel Header */}
            <div style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <h1
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      marginBottom: "0.5rem",
                      color: "#1a1a2e",
                    }}
                  >
                    {homestay.name}
                  </h1>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      color: "#64748b",
                      fontSize: "0.95rem",
                    }}
                  >
                    <span className="material-symbols-outlined">
                      location_on
                    </span>
                    <span>{homestay.address}</span>
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      marginBottom: "0.25rem",
                    }}
                  >
                    <span
                      style={{
                        backgroundColor: "#16a34a",
                        color: "white",
                        padding: "0.5rem 0.75rem",
                        borderRadius: "8px",
                        fontSize: "1.25rem",
                        fontWeight: 700,
                      }}
                    >
                      {homestay.rating}
                    </span>
                    <div>
                      <div
                        style={{
                          color: "#f59e0b",
                          fontSize: "1rem",
                        }}
                      >
                        {"★".repeat(Math.floor(homestay.rating))}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#64748b",
                        }}
                      >
                        {homestay.reviews} reviews
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div
              style={{
                borderBottom: "2px solid #e2e8f0",
                marginBottom: "2rem",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "2rem",
                }}
              >
                {[
                  { id: "overview", label: "Overview", icon: "info" },
                  { id: "rooms", label: "Rooms", icon: "bed" },
                  { id: "amenities", label: "Amenities", icon: "spa" },
                  { id: "reviews", label: "Reviews", icon: "star" },
                  { id: "location", label: "Location", icon: "map" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    style={{
                      padding: "1rem 0",
                      background: "none",
                      border: "none",
                      borderBottom:
                        activeTab === tab.id
                          ? "3px solid #0066cc"
                          : "3px solid transparent",
                      color: activeTab === tab.id ? "#0066cc" : "#64748b",
                      fontWeight: activeTab === tab.id ? 700 : 500,
                      fontSize: "1rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <span className="material-symbols-outlined">
                      {tab.icon}
                    </span>
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === "overview" && (
              <div>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                  }}
                >
                  About This Homestay
                </h2>
                <p
                  style={{
                    color: "#475569",
                    lineHeight: "1.8",
                    marginBottom: "2rem",
                  }}
                >
                  {homestay.description}
                </p>

                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                  }}
                >
                  Homestay Policies
                </h3>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    display: "grid",
                    gap: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "start",
                      gap: "1rem",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ color: "#0066cc" }}
                    >
                      schedule
                    </span>
                    <div>
                      <strong>Check-in:</strong> {homestay.checkInTime} <br />
                      <strong>Check-out:</strong> {homestay.checkOutTime}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "start",
                      gap: "1rem",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ color: "#0066cc" }}
                    >
                      cancel
                    </span>
                    <div>
                      <strong>Cancellation:</strong>{" "}
                      {homestay.policies?.cancellation ||
                        "Contact homestay for cancellation policy"}
                    </div>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "start",
                      gap: "1rem",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ color: "#0066cc" }}
                    >
                      pets
                    </span>
                    <div>
                      <strong>Pets:</strong>{" "}
                      {homestay.policies?.pets ||
                        "Contact homestay for pet policy"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "rooms" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1.5rem",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "1.5rem",
                      fontWeight: 700,
                    }}
                  >
                    Available Rooms ({filteredRooms.length})
                  </h2>
                </div>

                {/* Room Filters */}
                <div
                  style={{
                    background: "#ffffff",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    marginBottom: "2rem",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      marginBottom: "1rem",
                      color: "#1e293b",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ verticalAlign: "middle", marginRight: "0.5rem" }}
                    >
                      filter_alt
                    </span>
                    Filter Rooms
                  </h3>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(200px, 1fr))",
                      gap: "1rem",
                    }}
                  >
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#64748b",
                        }}
                      >
                        Price Range
                      </label>
                      <select
                        value={roomFilters.priceRange}
                        onChange={(e) =>
                          setRoomFilters({
                            ...roomFilters,
                            priceRange: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "8px",
                          border: "2px solid #e2e8f0",
                          fontSize: "0.95rem",
                          cursor: "pointer",
                        }}
                      >
                        <option value="all">All Prices</option>
                        <option value="budget">Under ₹15,000</option>
                        <option value="mid">₹15,000 - ₹20,000</option>
                        <option value="luxury">₹20,000+</option>
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#64748b",
                        }}
                      >
                        Guests
                      </label>
                      <select
                        value={roomFilters.guests}
                        onChange={(e) =>
                          setRoomFilters({
                            ...roomFilters,
                            guests: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "8px",
                          border: "2px solid #e2e8f0",
                          fontSize: "0.95rem",
                          cursor: "pointer",
                        }}
                      >
                        <option value="1">1 Guest</option>
                        <option value="2">2 Guests</option>
                        <option value="3">3 Guests</option>
                        <option value="4">4+ Guests</option>
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#64748b",
                        }}
                      >
                        Meal Plan
                      </label>
                      <select
                        value={roomFilters.mealPlan}
                        onChange={(e) =>
                          setRoomFilters({
                            ...roomFilters,
                            mealPlan: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "8px",
                          border: "2px solid #e2e8f0",
                          fontSize: "0.95rem",
                          cursor: "pointer",
                        }}
                      >
                        <option value="all">All Plans</option>
                        <option value="Room Only">Room Only</option>
                        <option value="Breakfast">With Breakfast</option>
                        <option value="All Meals">All Meals</option>
                      </select>
                    </div>
                    <div>
                      <label
                        style={{
                          display: "block",
                          fontSize: "0.875rem",
                          fontWeight: 600,
                          marginBottom: "0.5rem",
                          color: "#64748b",
                        }}
                      >
                        Sort By
                      </label>
                      <select
                        value={roomFilters.sortBy}
                        onChange={(e) =>
                          setRoomFilters({
                            ...roomFilters,
                            sortBy: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "8px",
                          border: "2px solid #e2e8f0",
                          fontSize: "0.95rem",
                          cursor: "pointer",
                        }}
                      >
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="size">Room Size</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Room Cards */}
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "1.5rem",
                  }}
                >
                  {filteredRooms.length === 0 ? (
                    <div
                      style={{
                        textAlign: "center",
                        padding: "3rem",
                        background: "#ffffff",
                        borderRadius: "12px",
                        border: "2px dashed #e2e8f0",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "4rem", color: "#94a3b8" }}
                      >
                        bed
                      </span>
                      <p
                        style={{
                          marginTop: "1rem",
                          color: "#64748b",
                          fontSize: "1.1rem",
                        }}
                      >
                        {homestay.rooms && homestay.rooms.length > 0
                          ? "No rooms match the selected filters. Try adjusting your criteria."
                          : "No rooms available for this homestay yet."}
                      </p>
                    </div>
                  ) : (
                    filteredRooms.map((room: Room) => (
                      <div
                        key={room.id}
                        style={{
                          background: "#ffffff",
                          borderRadius: "16px",
                          overflow: "hidden",
                          border: "2px solid #e2e8f0",
                          transition: "all 0.3s ease",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.boxShadow =
                            "0 8px 24px rgba(0, 102, 204, 0.15)";
                          e.currentTarget.style.borderColor = "#0066cc";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.boxShadow = "none";
                          e.currentTarget.style.borderColor = "#e2e8f0";
                        }}
                      >
                        <div
                          style={{
                            display: "grid",
                            gridTemplateColumns: "280px 1fr",
                          }}
                        >
                          <div style={{ position: "relative" }}>
                            {room.images && room.images.length > 0 ? (
                              <img
                                src={room.images[0]}
                                alt={room.type}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            ) : (
                              <div
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  background: "#f1f5f9",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  minHeight: "200px",
                                }}
                              >
                                <span
                                  className="material-symbols-outlined"
                                  style={{ fontSize: "3rem", color: "#cbd5e1" }}
                                >
                                  bed
                                </span>
                              </div>
                            )}
                            {room.originalPrice && (
                              <div
                                style={{
                                  position: "absolute",
                                  top: "1rem",
                                  left: "1rem",
                                  background: "#dc2626",
                                  color: "white",
                                  padding: "0.5rem 0.75rem",
                                  borderRadius: "8px",
                                  fontSize: "0.85rem",
                                  fontWeight: 700,
                                }}
                              >
                                {Math.round(
                                  ((room.originalPrice - room.price) /
                                    room.originalPrice) *
                                    100,
                                )}
                                % OFF
                              </div>
                            )}
                          </div>
                          <div style={{ padding: "1.5rem" }}>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "start",
                                marginBottom: "1rem",
                              }}
                            >
                              <div>
                                <h3
                                  style={{
                                    fontSize: "1.25rem",
                                    fontWeight: 700,
                                    marginBottom: "0.5rem",
                                  }}
                                >
                                  {room.type}
                                </h3>
                                <div
                                  style={{
                                    display: "flex",
                                    gap: "1rem",
                                    fontSize: "0.9rem",
                                    color: "#64748b",
                                    marginBottom: "0.75rem",
                                  }}
                                >
                                  <span>
                                    <span
                                      className="material-symbols-outlined"
                                      style={{
                                        fontSize: "1rem",
                                        verticalAlign: "middle",
                                      }}
                                    >
                                      group
                                    </span>{" "}
                                    {room.maxGuests} Guests
                                  </span>
                                  <span>
                                    <span
                                      className="material-symbols-outlined"
                                      style={{
                                        fontSize: "1rem",
                                        verticalAlign: "middle",
                                      }}
                                    >
                                      bed
                                    </span>{" "}
                                    {room.bedType}
                                  </span>
                                  <span>
                                    <span
                                      className="material-symbols-outlined"
                                      style={{
                                        fontSize: "1rem",
                                        verticalAlign: "middle",
                                      }}
                                    >
                                      straighten
                                    </span>{" "}
                                    {room.size} m²
                                  </span>
                                </div>
                                <div
                                  style={{
                                    display: "flex",
                                    flexWrap: "wrap",
                                    gap: "0.5rem",
                                  }}
                                >
                                  {room.amenities
                                    .slice(0, 5)
                                    .map((amenity: string, idx: number) => (
                                      <span
                                        key={idx}
                                        style={{
                                          fontSize: "0.8rem",
                                          padding: "0.25rem 0.6rem",
                                          background: "#f0f9ff",
                                          color: "#0369a1",
                                          borderRadius: "6px",
                                          border: "1px solid #e0f2fe",
                                        }}
                                      >
                                        {amenity}
                                      </span>
                                    ))}
                                </div>
                              </div>
                              <div style={{ textAlign: "right" }}>
                                {room.originalPrice && (
                                  <div
                                    style={{
                                      fontSize: "0.9rem",
                                      color: "#94a3b8",
                                      textDecoration: "line-through",
                                    }}
                                  >
                                    {formatInr(room.originalPrice)}
                                  </div>
                                )}
                                <div
                                  style={{
                                    fontSize: "1.75rem",
                                    fontWeight: 800,
                                    color: "#0066cc",
                                    marginBottom: "0.25rem",
                                  }}
                                >
                                  {formatInr(room.price)}
                                </div>
                                <div
                                  style={{
                                    fontSize: "0.85rem",
                                    color: "#64748b",
                                    marginBottom: "1rem",
                                  }}
                                >
                                  per night
                                </div>
                                <button
                                  onClick={() => {
                                    setShowBookingForm(true);
                                    window.scrollTo({
                                      top: 0,
                                      behavior: "smooth",
                                    });
                                  }}
                                  style={{
                                    width: "100%",
                                    padding: "0.75rem 1.5rem",
                                    background:
                                      "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "8px",
                                    fontSize: "1rem",
                                    fontWeight: 700,
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(-2px)";
                                    e.currentTarget.style.boxShadow =
                                      "0 8px 20px rgba(0, 102, 204, 0.3)";
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.transform =
                                      "translateY(0)";
                                    e.currentTarget.style.boxShadow = "none";
                                  }}
                                >
                                  Select Room
                                </button>
                              </div>
                            </div>
                            <div
                              style={{
                                borderTop: "1px solid #e2e8f0",
                                paddingTop: "1rem",
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "0.85rem",
                              }}
                            >
                              <div>
                                <span
                                  className="material-symbols-outlined"
                                  style={{
                                    fontSize: "1rem",
                                    verticalAlign: "middle",
                                    color:
                                      room.availability > 3
                                        ? "#16a34a"
                                        : "#dc2626",
                                  }}
                                >
                                  {room.availability > 3
                                    ? "check_circle"
                                    : "warning"}
                                </span>{" "}
                                <span
                                  style={{
                                    color:
                                      room.availability > 3
                                        ? "#16a34a"
                                        : "#dc2626",
                                    fontWeight: 600,
                                  }}
                                >
                                  {room.availability} rooms left
                                </span>
                              </div>
                              <div style={{ color: "#64748b" }}>
                                {room.mealPlan && `🍽️ ${room.mealPlan}`}
                              </div>
                              <div style={{ color: "#64748b" }}>
                                {room.cancellationPolicy}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {activeTab === "amenities" && (
              <div>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    marginBottom: "1.5rem",
                  }}
                >
                  Homestay Amenities
                </h2>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {homestay.amenities?.map((amenity, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        padding: "1rem",
                        background: "#ffffff",
                        borderRadius: "12px",
                        border: "2px solid #e2e8f0",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ color: "#0066cc", fontSize: "1.5rem" }}
                      >
                        check_circle
                      </span>
                      <span style={{ fontWeight: 500 }}>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    marginBottom: "1.5rem",
                  }}
                >
                  Guest Reviews
                </h2>
                {reviews.length === 0 ? (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "3rem 1rem",
                      background: "#f8fafc",
                      borderRadius: "12px",
                      color: "#64748b",
                    }}
                  >
                    <p style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>
                      No reviews yet
                    </p>
                    <p style={{ fontSize: "0.9rem" }}>
                      Be the first to share your experience!
                    </p>
                  </div>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "1.5rem",
                    }}
                  >
                    {reviews.map((review: any) => (
                      <div
                        key={review._id}
                        style={{
                          background: "#ffffff",
                          borderRadius: "12px",
                          padding: "1.5rem",
                          border: "2px solid #e2e8f0",
                        }}
                      >
                        {/* Image Gallery */}
                        {review.reviewImages &&
                          review.reviewImages.length > 0 && (
                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fill, minmax(100px, 1fr))",
                                gap: "0.75rem",
                                marginBottom: "1rem",
                              }}
                            >
                              {review.reviewImages.map(
                                (img: string, idx: number) => (
                                  <img
                                    key={idx}
                                    src={img}
                                    alt={`Review ${idx + 1}`}
                                    style={{
                                      width: "100%",
                                      height: "100px",
                                      objectFit: "cover",
                                      borderRadius: "8px",
                                      cursor: "pointer",
                                    }}
                                  />
                                ),
                              )}
                            </div>
                          )}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                            marginBottom: "1rem",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: "1.1rem",
                                marginBottom: "0.5rem",
                              }}
                            >
                              {review.userName}
                            </div>
                            <div
                              style={{
                                color: "#f59e0b",
                                marginBottom: "0.5rem",
                              }}
                            >
                              {"★".repeat(review.rating)}
                              <span style={{ color: "#cbd5e1" }}>
                                {"★".repeat(5 - review.rating)}
                              </span>
                            </div>
                          </div>
                          <div
                            style={{
                              fontSize: "0.85rem",
                              color: "#64748b",
                            }}
                          >
                            {new Date(review.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )}
                          </div>
                        </div>
                        <p
                          style={{
                            color: "#475569",
                            lineHeight: "1.7",
                            marginBottom: "1rem",
                          }}
                        >
                          {review.reviewText}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "location" && (
              <div>
                <h2
                  style={{
                    fontSize: "1.5rem",
                    fontWeight: 700,
                    marginBottom: "1.5rem",
                  }}
                >
                  Location & Nearby
                </h2>
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "12px",
                    padding: "2rem",
                    marginBottom: "2rem",
                    textAlign: "center",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "4rem", color: "#0066cc" }}
                  >
                    map
                  </span>
                  <p style={{ marginTop: "1rem", color: "#64748b" }}>
                    Map integration coming soon
                  </p>
                </div>
                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                  }}
                >
                  Nearby Places
                </h3>
                <div
                  style={{
                    display: "grid",
                    gap: "1rem",
                  }}
                >
                  {homestay.nearbyPlaces?.map((place, idx) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "1rem",
                        background: "#ffffff",
                        borderRadius: "12px",
                        border: "2px solid #e2e8f0",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "1rem",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ color: "#0066cc" }}
                        >
                          location_on
                        </span>
                        <span style={{ fontWeight: 500 }}>{place.name}</span>
                      </div>
                      <span
                        style={{
                          color: "#64748b",
                          fontSize: "0.9rem",
                        }}
                      >
                        {place.distance}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div>
            <div
              style={{
                position: "sticky",
                top: "2rem",
                background: "#ffffff",
                borderRadius: "16px",
                padding: "1.5rem",
                boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
                border: "2px solid #e2e8f0",
              }}
            >
              <h3
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: "1.5rem",
                }}
              >
                Book Your Stay
              </h3>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "#64748b",
                  }}
                >
                  Check-in
                </label>
                <input
                  type="date"
                  value={bookingDetails.checkIn}
                  onChange={(e) =>
                    setBookingDetails({
                      ...bookingDetails,
                      checkIn: e.target.value,
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "2px solid #e2e8f0",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div style={{ marginBottom: "1rem" }}>
                <label
                  style={{
                    display: "block",
                    fontSize: "0.875rem",
                    fontWeight: 600,
                    marginBottom: "0.5rem",
                    color: "#64748b",
                  }}
                >
                  Check-out
                </label>
                <input
                  type="date"
                  value={bookingDetails.checkOut}
                  onChange={(e) =>
                    setBookingDetails({
                      ...bookingDetails,
                      checkOut: e.target.value,
                    })
                  }
                  min={
                    bookingDetails.checkIn ||
                    new Date().toISOString().split("T")[0]
                  }
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    borderRadius: "8px",
                    border: "2px solid #e2e8f0",
                    fontSize: "1rem",
                  }}
                />
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "1rem",
                  marginBottom: "1rem",
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      color: "#64748b",
                    }}
                  >
                    Rooms
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bookingDetails.rooms}
                    onChange={(e) =>
                      setBookingDetails({
                        ...bookingDetails,
                        rooms: parseInt(e.target.value) || 1,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "2px solid #e2e8f0",
                      fontSize: "1rem",
                    }}
                  />
                </div>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "0.875rem",
                      fontWeight: 600,
                      marginBottom: "0.5rem",
                      color: "#64748b",
                    }}
                  >
                    Guests
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={bookingDetails.guests}
                    onChange={(e) =>
                      setBookingDetails({
                        ...bookingDetails,
                        guests: parseInt(e.target.value) || 1,
                      })
                    }
                    style={{
                      width: "100%",
                      padding: "0.75rem",
                      borderRadius: "8px",
                      border: "2px solid #e2e8f0",
                      fontSize: "1rem",
                    }}
                  />
                </div>
              </div>

              {calculateNights() > 0 &&
                homestay?.rooms &&
                homestay.rooms.length > 0 && (
                  <div
                    style={{
                      background: "#f0f9ff",
                      borderRadius: "8px",
                      padding: "1rem",
                      marginBottom: "1rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span style={{ color: "#64748b" }}>
                        {calculateNights()} night(s)
                      </span>
                      <span style={{ fontWeight: 600 }}>
                        {formatInr(homestay.rooms[0].price * calculateNights())}
                      </span>
                    </div>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "0.5rem",
                      }}
                    >
                      <span style={{ color: "#64748b" }}>Taxes & Fees</span>
                      <span style={{ fontWeight: 600 }}>
                        {formatInr(
                          homestay.rooms[0].price * calculateNights() * 0.12,
                        )}
                      </span>
                    </div>
                    <div
                      style={{
                        borderTop: "1px solid #cbd5e1",
                        paddingTop: "0.5rem",
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      <span style={{ fontWeight: 700, fontSize: "1.1rem" }}>
                        Total
                      </span>
                      <span
                        style={{
                          fontWeight: 800,
                          fontSize: "1.25rem",
                          color: "#0066cc",
                        }}
                      >
                        {formatInr(
                          homestay.rooms[0].price * calculateNights() * 1.12,
                        )}
                      </span>
                    </div>
                  </div>
                )}

              <button
                onClick={() => {
                  if (!bookingDetails.checkIn || !bookingDetails.checkOut) {
                    alert("Please select check-in and check-out dates");
                    return;
                  }
                  if (!homestay?.rooms[0]) {
                    alert("Room information not available");
                    return;
                  }
                  window.location.href = `/booking?homestayId=${homestayId}&roomId=${homestay.rooms[0].id}&checkin=${bookingDetails.checkIn}&checkout=${bookingDetails.checkOut}&guests=${bookingDetails.guests}`;
                }}
                style={{
                  width: "100%",
                  padding: "1rem",
                  background:
                    "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)",
                  color: "white",
                  border: "none",
                  borderRadius: "12px",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  cursor: "pointer",
                  transition: "all 0.3s ease",
                  marginBottom: "1rem",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 8px 24px rgba(0, 102, 204, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Book Now
              </button>

              <div
                style={{
                  fontSize: "0.85rem",
                  color: "#64748b",
                  textAlign: "center",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1rem", verticalAlign: "middle" }}
                >
                  verified_user
                </span>{" "}
                Secure booking • No hidden charges
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fullscreen Image Gallery Modal */}
      {showFullscreenGallery && homestay.images && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.95)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowFullscreenGallery(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowFullscreenGallery(false)}
            style={{
              position: "absolute",
              top: "20px",
              right: "20px",
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              borderRadius: "50%",
              width: "50px",
              height: "50px",
              color: "white",
              fontSize: "2rem",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10001,
            }}
          >
            ×
          </button>

          {/* Image Counter */}
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              background: "rgba(0, 0, 0, 0.7)",
              color: "white",
              padding: "10px 20px",
              borderRadius: "20px",
              fontSize: "1rem",
              zIndex: 10001,
            }}
          >
            {fullscreenImageIndex + 1} / {homestay.images.length}
          </div>

          {/* Previous Button */}
          {fullscreenImageIndex > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImageIndex(fullscreenImageIndex - 1);
              }}
              style={{
                position: "absolute",
                left: "20px",
                background: "rgba(255, 255, 255, 0.2)",
                border: "none",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                color: "white",
                fontSize: "2rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10001,
              }}
            >
              ‹
            </button>
          )}

          {/* Image */}
          <img
            src={homestay.images[fullscreenImageIndex]}
            alt={`${homestay.name} ${fullscreenImageIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              objectFit: "contain",
            }}
          />

          {/* Next Button */}
          {fullscreenImageIndex < homestay.images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setFullscreenImageIndex(fullscreenImageIndex + 1);
              }}
              style={{
                position: "absolute",
                right: "20px",
                background: "rgba(255, 255, 255, 0.2)",
                border: "none",
                borderRadius: "50%",
                width: "50px",
                height: "50px",
                color: "white",
                fontSize: "2rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 10001,
              }}
            >
              ›
            </button>
          )}
        </div>
      )}

      <Footer />
    </div>
  );
}
