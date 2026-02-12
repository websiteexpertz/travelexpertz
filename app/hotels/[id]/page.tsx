"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Header from "../../components/Header";

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

interface Hotel {
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

export default function HotelDetails() {
  const params = useParams();
  const hotelId = params?.id as string;

  const [hotel, setHotel] = useState<Hotel | null>(null);
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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [guestDetails, setGuestDetails] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [showHostProperties, setShowHostProperties] = useState(false);
  const [hostProperties, setHostProperties] = useState<any[]>([]);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch("/api/auth/user-profile", {
        credentials: "include",
      });
      if (response.ok) {
        const user = await response.json();
        setUserProfile(user);
        setIsAuthenticated(true);
        setGuestDetails((prev) => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
          phone: user.mobile || prev.phone,
        }));
      } else {
        setIsAuthenticated(false);
      }
    } catch (err) {
      console.error("Auth check failed:", err);
      setIsAuthenticated(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!isAuthenticated) {
      alert("Please log in to make a booking");
      window.location.href = "/auth/login";
      return;
    }

    if (!bookingDetails.checkIn || !bookingDetails.checkOut) {
      alert("Please select check-in and check-out dates");
      return;
    }

    if (!guestDetails.name || !guestDetails.email || !guestDetails.phone) {
      alert("Please fill in guest details");
      return;
    }

    if (!hotel?.rooms[0]) {
      alert("Room information not available");
      return;
    }

    try {
      const checkinDate = new Date(bookingDetails.checkIn);
      const checkoutDate = new Date(bookingDetails.checkOut);
      const nights = Math.ceil(
        (checkoutDate.getTime() - checkinDate.getTime()) /
          (1000 * 60 * 60 * 24),
      );

      if (nights <= 0) {
        alert("Check-out date must be after check-in date");
        return;
      }

      const basePrice = hotel.rooms[0].price;
      const taxes = basePrice * nights * 0.12;
      const platformFee = basePrice * nights * 0.05;
      const totalPrice = basePrice * nights + taxes + platformFee;

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          hotelId: hotelId,
          propertyName: hotel.name,
          propertyType: "hotel",
          roomId: hotel.rooms[0].id,
          guestName: guestDetails.name,
          guestEmail: guestDetails.email,
          guestPhone: guestDetails.phone,
          checkin: bookingDetails.checkIn,
          checkout: bookingDetails.checkOut,
          checkIn: bookingDetails.checkIn,
          checkOut: bookingDetails.checkOut,
          guests: bookingDetails.guests,
          basePrice: hotel.rooms[0].price,
          city: hotel.location || "Unknown",
          userId: userProfile._id,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create booking");
      }

      const booking = await response.json();
      alert("Booking confirmed successfully!");

      // Redirect to my bookings
      window.location.href = "/user/bookings";
    } catch (error: any) {
      console.error("Error creating booking:", error);
      alert(error.message || "Failed to create booking");
    }
  };

  useEffect(() => {
    const fetchHotelDetails = async () => {
      if (!hotelId) return;
      setLoading(true);
      try {
        const response = await fetch(`/api/hotels?id=${hotelId}`, {
          cache: "no-store",
        });
        if (response.ok) {
          const data = await response.json();
          setHotel(data);
        }
      } catch (error) {
        console.error("Failed to fetch hotel details:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/reviews?propertyId=${hotelId}`, {
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

    fetchHotelDetails();
    fetchReviews();
  }, [hotelId]);

  useEffect(() => {
    if (showHostProperties && hotel?.hostName) {
      const fetchHostProperties = async () => {
        try {
          const response = await fetch(
            `/api/hotels?hostName=${encodeURIComponent(hotel.hostName || "")}&limit=10`,
            { cache: "no-store" },
          );
          if (response.ok) {
            const data = await response.json();
            // Filter out the current hotel
            const filtered = Array.isArray(data)
              ? data.filter((h: any) => h._id !== hotelId)
              : [data].filter((h: any) => h._id !== hotelId);
            setHostProperties(filtered);
          }
        } catch (error) {
          console.error("Failed to fetch host properties:", error);
        }
      };
      fetchHostProperties();
    }
  }, [showHostProperties, hotel?.hostName, hotelId]);

  const filteredRooms = hotel?.rooms
    ? hotel.rooms
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
        <Header currentPage="hotels" />
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
          Loading hotel details...
        </div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
        <Header currentPage="hotels" />
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
            hotel
          </span>
          <div style={{ fontSize: "1.2rem", color: "#64748b" }}>
            Hotel not found
          </div>
          <a
            href="/hotels"
            style={{
              padding: "0.75rem 1.5rem",
              background: "#3b82f6",
              color: "white",
              borderRadius: "8px",
              textDecoration: "none",
              fontSize: "1rem",
            }}
          >
            Browse All Hotels
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-gray-50">
      <Header currentPage="hotels" />

      <main className="flex flex-col items-center w-full">
        {/* Image Gallery */}
        {hotel.images && hotel.images.length > 0 && (
          <div
            style={{
              width: "100%",
              maxWidth: "1280px",
              margin: "0 auto",
              padding: "1.5rem 1rem",
            }}
          >
            <div
              className="hotel-gallery"
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr",
                gap: "0.5rem",
                height: "400px",
                borderRadius: "16px",
                overflow: "hidden",
                position: "relative",
              }}
            >
              <div
                style={{
                  gridRow: "1 / 3",
                  position: "relative",
                  cursor: "pointer",
                }}
                onClick={() => {
                  setFullscreenImageIndex(0);
                  setShowFullscreenGallery(true);
                }}
              >
                <img
                  src={hotel.images[0]}
                  alt={hotel.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              {hotel.images.slice(1, 5).map((img, idx) => (
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
                    alt={`${hotel.name} ${idx + 2}`}
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
                  />
                  {idx === 3 && hotel.images.length > 5 && (
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
                      }}
                    >
                      +{hotel.images.length - 5} more
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main Content */}
        <div
          className="hotel-main-grid"
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
                    className="hotel-title"
                    style={{
                      fontSize: "2rem",
                      fontWeight: 800,
                      marginBottom: "0.5rem",
                      color: "#1a1a2e",
                    }}
                  >
                    {hotel.name}
                  </h1>
                  <div
                    className="hotel-location"
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
                    <span>{hotel.address}</span>
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
                      {hotel.rating}
                    </span>
                    <div>
                      <div
                        style={{
                          color: "#f59e0b",
                          fontSize: "1rem",
                        }}
                      >
                        {"★".repeat(Math.floor(hotel.rating))}
                      </div>
                      <div
                        style={{
                          fontSize: "0.85rem",
                          color: "#64748b",
                        }}
                      >
                        {hotel.reviews} reviews
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
                className="hotel-tabs"
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
                    className={`hotel-tab-btn ${activeTab === tab.id ? "active" : ""}`}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    style={{
                      padding: "1rem 0",
                      background:
                        activeTab === tab.id
                          ? "linear-gradient(135deg, #0066cc 0%, #0099ff 100%)"
                          : "none",
                      border: "none",
                      borderBottom:
                        activeTab === tab.id
                          ? "3px solid #0066cc"
                          : "3px solid transparent",
                      color: activeTab === tab.id ? "#ffffff" : "#64748b",
                      fontWeight: activeTab === tab.id ? 700 : 500,
                      fontSize: "1rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.5rem",
                      transition: "all 0.3s ease",
                      borderRadius: activeTab === tab.id ? "10px" : "0",
                      paddingLeft: activeTab === tab.id ? "1rem" : "0",
                      paddingRight: activeTab === tab.id ? "1rem" : "0",
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
                  About This Hotel
                </h2>
                <p
                  style={{
                    color: "#475569",
                    lineHeight: "1.8",
                    marginBottom: "2rem",
                  }}
                >
                  {hotel.description}
                </p>

                {/* Host Profile Section */}
                {hotel.hostName && (
                  <div
                    style={{
                      background: "#f0f9ff",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      marginBottom: "2rem",
                      borderLeft: "4px solid #3b82f6",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: "2rem",
                          color: "#3b82f6",
                          backgroundColor: "#e0f2fe",
                          borderRadius: "50%",
                          padding: "0.5rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        account_circle
                      </span>
                      <div>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#64748b",
                            margin: "0",
                            fontWeight: 600,
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                          }}
                        >
                          Hotel Hosted By
                        </p>
                        <p
                          style={{
                            fontSize: "1.25rem",
                            color: "#1f2937",
                            margin: "0.25rem 0 0",
                            fontWeight: 700,
                          }}
                        >
                          {hotel.hostName}
                        </p>
                      </div>
                    </div>
                    <div style={{ display: "grid", gap: "0.5rem" }}>
                      {hotel.hostEmail && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            color: "#475569",
                            fontSize: "0.95rem",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "1.25rem" }}
                          >
                            mail
                          </span>
                          <span>{hotel.hostEmail}</span>
                        </div>
                      )}
                      {hotel.hostPhone && (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.75rem",
                            color: "#475569",
                            fontSize: "0.95rem",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "1.25rem" }}
                          >
                            phone
                          </span>
                          <span>{hotel.hostPhone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <h3
                  style={{
                    fontSize: "1.25rem",
                    fontWeight: 700,
                    marginBottom: "1rem",
                  }}
                >
                  Hotel Policies
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
                      <strong>Check-in:</strong> {hotel.checkInTime} <br />
                      <strong>Check-out:</strong> {hotel.checkOutTime}
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
                      {hotel.policies?.cancellation ||
                        "Contact hotel for cancellation policy"}
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
                      {hotel.policies?.pets || "Contact hotel for pet policy"}
                    </div>
                  </div>
                </div>

                {/* Hosted By Section */}
                {hotel.hostName && (
                  <div
                    style={{
                      background: "#f8fafc",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      marginTop: "2rem",
                      cursor: "pointer",
                      border: "2px solid #e2e8f0",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "#3b82f6";
                      e.currentTarget.style.boxShadow =
                        "0 4px 12px rgba(59, 130, 246, 0.1)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    onClick={() => setShowHostProperties(true)}
                  >
                    <p
                      style={{
                        fontSize: "0.85rem",
                        color: "#64748b",
                        margin: "0 0 1rem",
                        fontWeight: 600,
                        textTransform: "uppercase",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Hosted By
                    </p>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "1rem",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: "3rem",
                          color: "#3b82f6",
                          backgroundColor: "#e0f2fe",
                          borderRadius: "50%",
                          padding: "0.75rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        account_circle
                      </span>
                      <div>
                        <p
                          style={{
                            fontSize: "1rem",
                            color: "#1f2937",
                            margin: "0",
                            fontWeight: 700,
                          }}
                        >
                          {hotel.hostName}
                        </p>
                        <p
                          style={{
                            fontSize: "0.85rem",
                            color: "#3b82f6",
                            margin: "0.5rem 0 0",
                            fontWeight: 500,
                          }}
                        >
                          View all properties by this host →
                        </p>
                      </div>
                    </div>
                  </div>
                )}
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
                  className="rooms-grid"
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
                        {hotel.rooms && hotel.rooms.length > 0
                          ? "No rooms match the selected filters. Try adjusting your criteria."
                          : "No rooms available for this hotel yet."}
                      </p>
                    </div>
                  ) : (
                    filteredRooms.map((room: Room) => (
                      <div
                        key={room.id}
                        className="room-card"
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
                          className="room-inner"
                          style={{
                            display: "grid",
                            gridTemplateColumns: "280px 1fr",
                          }}
                        >
                          <div
                            className="room-image"
                            style={{ position: "relative" }}
                          >
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
                          <div
                            className="room-content"
                            style={{ padding: "1.5rem" }}
                          >
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
                  Hotel Amenities
                </h2>
                <div
                  className="amenities-grid"
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  {hotel.amenities?.map((amenity, idx) => (
                    <div
                      key={idx}
                      className="amenity-item"
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
                        className="review-card"
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
                  {hotel.nearbyPlaces?.map((place, idx) => (
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
          <div className="hotel-sidebar">
            <div
              className="hotel-booking-card"
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
              <div className="booking-price-section">
                <span
                  className="booking-price"
                  style={{
                    fontSize: "1.75rem",
                    fontWeight: 800,
                    color: "#0066cc",
                  }}
                >
                  {hotel.rooms && hotel.rooms[0]
                    ? formatInr(hotel.rooms[0].price)
                    : "N/A"}
                </span>
                <span
                  className="booking-per-night"
                  style={{ color: "#64748b", fontSize: "0.9rem" }}
                >
                  /night
                </span>
              </div>
              <h3
                className="booking-title-desktop"
                style={{
                  fontSize: "1.25rem",
                  fontWeight: 700,
                  marginBottom: "1.5rem",
                }}
              >
                Book Your Stay
              </h3>

              {showBookingForm && (
                <div
                  style={{
                    background: "#f8fafc",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    marginBottom: "1.5rem",
                    border: "2px solid #e2e8f0",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "1rem",
                      fontWeight: 700,
                      marginBottom: "1rem",
                      color: "#1f2937",
                    }}
                  >
                    Guest Details
                  </h4>
                  <div style={{ display: "grid", gap: "1rem" }}>
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
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={guestDetails.name}
                        onChange={(e) =>
                          setGuestDetails({
                            ...guestDetails,
                            name: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "8px",
                          border: "2px solid #e2e8f0",
                          fontSize: "1rem",
                          boxSizing: "border-box",
                        }}
                        placeholder="Your full name"
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
                        Email *
                      </label>
                      <input
                        type="email"
                        value={guestDetails.email}
                        onChange={(e) =>
                          setGuestDetails({
                            ...guestDetails,
                            email: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "8px",
                          border: "2px solid #e2e8f0",
                          fontSize: "1rem",
                          boxSizing: "border-box",
                        }}
                        placeholder="your.email@example.com"
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
                        Phone *
                      </label>
                      <input
                        type="tel"
                        value={guestDetails.phone}
                        onChange={(e) =>
                          setGuestDetails({
                            ...guestDetails,
                            phone: e.target.value,
                          })
                        }
                        style={{
                          width: "100%",
                          padding: "0.75rem",
                          borderRadius: "8px",
                          border: "2px solid #e2e8f0",
                          fontSize: "1rem",
                          boxSizing: "border-box",
                        }}
                        placeholder="+91 9876543210"
                      />
                    </div>
                  </div>
                </div>
              )}

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

              {calculateNights() > 0 && (
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
                      {formatInr(hotel.rooms[0].price * calculateNights())}
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
                        hotel.rooms[0].price * calculateNights() * 0.12,
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
                        hotel.rooms[0].price * calculateNights() * 1.12,
                      )}
                    </span>
                  </div>
                </div>
              )}

              {showBookingForm ? (
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: "1rem",
                    marginBottom: "1rem",
                  }}
                >
                  <button
                    onClick={() => setShowBookingForm(false)}
                    style={{
                      padding: "1rem",
                      background: "#e5e7eb",
                      color: "#1f2937",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "1rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#d1d5db";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "#e5e7eb";
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmBooking}
                    style={{
                      padding: "1rem",
                      background:
                        "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      fontSize: "1rem",
                      fontWeight: 700,
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow =
                        "0 8px 24px rgba(22, 163, 74, 0.3)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    Confirm Booking
                  </button>
                </div>
              ) : (
                <button
                  className="book-now-btn"
                  onClick={() => {
                    if (!bookingDetails.checkIn || !bookingDetails.checkOut) {
                      alert("Please select check-in and check-out dates");
                      return;
                    }
                    setShowBookingForm(true);
                    window.scrollTo({ top: 0, behavior: "smooth" });
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
                  Enquire Now
                </button>
              )}

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
      {showFullscreenGallery && hotel.images && (
        <div
          className="fullscreen-gallery"
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
            className="close-btn"
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
            className="image-counter"
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
            {fullscreenImageIndex + 1} / {hotel.images.length}
          </div>

          {/* Previous Button */}
          {fullscreenImageIndex > 0 && (
            <button
              className="nav-btn"
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
            src={hotel.images[fullscreenImageIndex]}
            alt={`${hotel.name} ${fullscreenImageIndex + 1}`}
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: "90%",
              maxHeight: "90%",
              objectFit: "contain",
            }}
          />

          {/* Next Button */}
          {fullscreenImageIndex < hotel.images.length - 1 && (
            <button
              className="nav-btn"
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

      {/* Mobile Responsive Styles */}
      <style>{`
        /* ===== HOTEL DETAILS PAGE - PREMIUM MOBILE RESPONSIVE ===== */
        
        /* Tablet View */
        @media (max-width: 1024px) {
          .hotel-main-grid {
            grid-template-columns: 1fr !important;
            gap: clamp(1.5rem, 4vw, 2rem) !important;
          }
          
          .hotel-sidebar {
            position: relative !important;
            top: 0 !important;
            order: -1 !important;
          }
          
          .hotel-booking-card {
            display: grid !important;
            grid-template-columns: 1fr 1fr !important;
            gap: 1.5rem !important;
            align-items: center !important;
          }
        }
        
        @media (max-width: 768px) {
          /* ===== GALLERY SECTION ===== */
          .hotel-gallery {
            height: clamp(240px, 50vw, 320px) !important;
            border-radius: clamp(12px, 3vw, 20px) !important;
            display: flex !important;
            flex-direction: column !important;
            grid-template-columns: 1fr !important;
            gap: 0 !important;
            overflow: hidden !important;
          }
          
          .hotel-gallery > div:first-child {
            grid-column: 1 !important;
            height: 100% !important;
          }
          
          .hotel-gallery > div:not(:first-child) {
            display: none !important;
          }
          
          .hotel-gallery-main {
            height: 100% !important;
            border-radius: clamp(12px, 3vw, 20px) !important;
          }
          
          /* Gallery Indicator Dots */
          .hotel-gallery::after {
            content: "";
            position: absolute;
            bottom: 12px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 4px;
            background: rgba(255, 255, 255, 0.5);
            border-radius: 2px;
          }
          
          .hotel-gallery button {
            width: clamp(36px, 10vw, 44px) !important;
            height: clamp(36px, 10vw, 44px) !important;
            font-size: clamp(0.9rem, 2.5vw, 1.1rem) !important;
            bottom: clamp(8px, 2vw, 12px) !important;
            right: clamp(8px, 2vw, 12px) !important;
            border-radius: 10px !important;
          }
          
          /* ===== HOTEL HEADER ===== */
          .hotel-title {
            font-size: clamp(1.35rem, 5vw, 1.75rem) !important;
            line-height: 1.25 !important;
            margin-bottom: clamp(0.5rem, 1.5vw, 0.75rem) !important;
          }
          
          .hotel-location {
            font-size: clamp(0.85rem, 2.5vw, 0.95rem) !important;
          }
          
          .hotel-rating-badge {
            padding: clamp(0.35rem, 1vw, 0.5rem) clamp(0.75rem, 2vw, 1rem) !important;
            font-size: clamp(0.8rem, 2.2vw, 0.9rem) !important;
            border-radius: 8px !important;
          }
          
          /* ===== TABS NAVIGATION ===== */
          .hotel-tabs {
            flex-wrap: nowrap !important;
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch !important;
            scrollbar-width: none !important;
            -ms-overflow-style: none !important;
            gap: clamp(0.4rem, 1.2vw, 0.6rem) !important;
            padding: clamp(0.35rem, 1vw, 0.5rem) !important;
            margin: 0 -1rem !important;
            padding-left: 1rem !important;
            padding-right: 1rem !important;
            background: #f8fafc !important;
            border-radius: 14px !important;
          }
          
          .hotel-tabs::-webkit-scrollbar {
            display: none !important;
          }
          
          .hotel-tab-btn {
            flex-shrink: 0 !important;
            padding: clamp(0.55rem, 1.5vw, 0.7rem) clamp(0.875rem, 2.5vw, 1.1rem) !important;
            font-size: clamp(0.78rem, 2.2vw, 0.88rem) !important;
            min-height: clamp(40px, 10vw, 48px) !important;
            border-radius: 10px !important;
            white-space: nowrap !important;
            font-weight: 600 !important;
            transition: all 0.2s ease !important;
          }
          
          .hotel-tab-btn.active {
            background: linear-gradient(135deg, #0066cc 0%, #0099ff 100%) !important;
            box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3) !important;
          }
          
          /* ===== CONTENT SECTIONS ===== */
          .hotel-content-section {
            padding: clamp(1rem, 3vw, 1.5rem) !important;
            border-radius: clamp(14px, 3vw, 20px) !important;
          }
          
          .hotel-content-section h2 {
            font-size: clamp(1.1rem, 3.5vw, 1.35rem) !important;
            margin-bottom: clamp(0.75rem, 2vw, 1rem) !important;
          }
          
          .hotel-content-section p {
            font-size: clamp(0.85rem, 2.5vw, 0.95rem) !important;
            line-height: 1.65 !important;
          }
          
          /* ===== INFO GRID ===== */
          .hotel-info-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: clamp(0.75rem, 2vw, 1rem) !important;
          }
          
          .hotel-info-item {
            padding: clamp(0.875rem, 2.5vw, 1.1rem) !important;
            border-radius: 12px !important;
          }
          
          .hotel-info-item span.material-symbols-outlined {
            font-size: clamp(1.25rem, 4vw, 1.5rem) !important;
          }
          
          .hotel-info-item span:not(.material-symbols-outlined) {
            font-size: clamp(0.75rem, 2.2vw, 0.85rem) !important;
          }
          
          /* ===== ROOMS SECTION ===== */
          .rooms-grid {
            gap: clamp(0.875rem, 2.5vw, 1.25rem) !important;
          }
          
          .room-filters {
            flex-wrap: wrap !important;
            gap: clamp(0.5rem, 1.5vw, 0.75rem) !important;
            margin-bottom: clamp(1rem, 3vw, 1.5rem) !important;
          }
          
          .room-filter-btn {
            padding: clamp(0.5rem, 1.5vw, 0.65rem) clamp(0.875rem, 2.5vw, 1.1rem) !important;
            font-size: clamp(0.75rem, 2.1vw, 0.85rem) !important;
            border-radius: 8px !important;
          }
          
          .room-card {
            flex-direction: column !important;
            border-radius: clamp(14px, 3vw, 18px) !important;
            overflow: hidden !important;
            box-shadow: 0 2px 16px rgba(0, 0, 0, 0.08) !important;
          }
          
          .room-inner {
            display: flex !important;
            flex-direction: column !important;
            grid-template-columns: none !important;
          }
          
          .room-image {
            width: 100% !important;
            height: clamp(160px, 40vw, 200px) !important;
            border-radius: 0 !important;
          }
          
          .room-content {
            padding: clamp(0.875rem, 2.5vw, 1.25rem) !important;
          }
          
          .room-content h3 {
            font-size: clamp(0.95rem, 3vw, 1.1rem) !important;
            margin-bottom: clamp(0.35rem, 1vw, 0.5rem) !important;
          }
          
          .room-content p {
            font-size: clamp(0.8rem, 2.3vw, 0.9rem) !important;
          }
          
          .room-amenities {
            gap: clamp(0.35rem, 1vw, 0.5rem) !important;
            flex-wrap: wrap !important;
          }
          
          .room-amenity-tag {
            padding: clamp(0.25rem, 0.75vw, 0.35rem) clamp(0.5rem, 1.5vw, 0.65rem) !important;
            font-size: clamp(0.65rem, 1.8vw, 0.75rem) !important;
            border-radius: 6px !important;
          }
          
          .room-price {
            font-size: clamp(1.1rem, 3.5vw, 1.35rem) !important;
          }
          
          .room-price span {
            font-size: clamp(0.7rem, 2vw, 0.8rem) !important;
          }
          
          .room-book-btn {
            padding: clamp(0.65rem, 2vw, 0.8rem) clamp(1rem, 3vw, 1.25rem) !important;
            font-size: clamp(0.8rem, 2.3vw, 0.9rem) !important;
            border-radius: 10px !important;
            width: 100% !important;
          }
          
          /* ===== AMENITIES GRID ===== */
          .amenities-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: clamp(0.6rem, 1.8vw, 0.875rem) !important;
          }
          
          .amenity-item {
            padding: clamp(0.75rem, 2vw, 1rem) !important;
            border-radius: 10px !important;
          }
          
          .amenity-item span.material-symbols-outlined {
            font-size: clamp(1.15rem, 3.5vw, 1.35rem) !important;
          }
          
          .amenity-item span:not(.material-symbols-outlined) {
            font-size: clamp(0.7rem, 2vw, 0.8rem) !important;
          }
          
          /* ===== REVIEWS SECTION ===== */
          .reviews-summary {
            padding: clamp(1rem, 3vw, 1.25rem) !important;
            border-radius: 14px !important;
            flex-direction: column !important;
            text-align: center !important;
            gap: clamp(0.75rem, 2vw, 1rem) !important;
          }
          
          .reviews-summary .rating-large {
            font-size: clamp(2rem, 8vw, 2.75rem) !important;
          }
          
          .review-card {
            padding: clamp(0.875rem, 2.5vw, 1.1rem) !important;
            border-radius: 12px !important;
            margin-bottom: clamp(0.75rem, 2vw, 1rem) !important;
          }
          
          .review-card-header {
            flex-direction: row !important;
            align-items: center !important;
            gap: clamp(0.6rem, 1.8vw, 0.875rem) !important;
            margin-bottom: clamp(0.6rem, 1.8vw, 0.875rem) !important;
          }
          
          .review-avatar {
            width: clamp(36px, 10vw, 44px) !important;
            height: clamp(36px, 10vw, 44px) !important;
            font-size: clamp(0.85rem, 2.5vw, 1rem) !important;
          }
          
          .review-author {
            font-size: clamp(0.85rem, 2.5vw, 0.95rem) !important;
          }
          
          .review-date {
            font-size: clamp(0.7rem, 2vw, 0.8rem) !important;
          }
          
          .review-text {
            font-size: clamp(0.8rem, 2.3vw, 0.9rem) !important;
            line-height: 1.6 !important;
          }
          
          /* ===== BOOKING SIDEBAR (MOBILE) ===== */
          .hotel-sidebar {
            position: fixed !important;
            bottom: 0 !important;
            left: 0 !important;
            right: 0 !important;
            top: auto !important;
            z-index: 1000 !important;
            padding: 0 !important;
            background: transparent !important;
          }
          
          .hotel-booking-card {
            display: flex !important;
            flex-direction: row !important;
            align-items: center !important;
            justify-content: space-between !important;
            padding: clamp(0.875rem, 2.5vw, 1rem) clamp(1rem, 3vw, 1.25rem) !important;
            border-radius: 0 !important;
            border-top-left-radius: clamp(16px, 4vw, 24px) !important;
            border-top-right-radius: clamp(16px, 4vw, 24px) !important;
            box-shadow: 0 -4px 24px rgba(0, 0, 0, 0.15) !important;
            background: #ffffff !important;
            gap: clamp(0.75rem, 2vw, 1rem) !important;
          }
          
          /* Hide all form elements and extra content on mobile */
          .hotel-booking-card .booking-title-desktop,
          .hotel-booking-card h3,
          .hotel-booking-card label,
          .hotel-booking-card input,
          .hotel-booking-card > div:nth-child(3),
          .hotel-booking-card > div:nth-child(4),
          .hotel-booking-card > div:nth-child(5),
          .hotel-booking-card > div:nth-child(6),
          .hotel-booking-card > div:last-child:not(.booking-price-section):not(button) {
            display: none !important;
          }
          
          .hotel-booking-card .booking-price-section {
            display: flex !important;
            flex-direction: column !important;
            align-items: flex-start !important;
          }
          
          .hotel-booking-card .booking-price {
            font-size: clamp(1.25rem, 4vw, 1.5rem) !important;
            font-weight: 700 !important;
            color: #0066cc !important;
          }
          
          .hotel-booking-card .booking-per-night {
            font-size: clamp(0.7rem, 2vw, 0.8rem) !important;
            color: #64748b !important;
          }
          
          .hotel-booking-card button[type="button"],
          .hotel-booking-card .book-now-btn {
            padding: clamp(0.75rem, 2vw, 0.875rem) clamp(1.5rem, 5vw, 2rem) !important;
            font-size: clamp(0.85rem, 2.5vw, 0.95rem) !important;
            font-weight: 700 !important;
            border-radius: 12px !important;
            background: linear-gradient(135deg, #0066cc 0%, #0099ff 100%) !important;
            box-shadow: 0 4px 15px rgba(0, 102, 204, 0.3) !important;
            white-space: nowrap !important;
            flex-shrink: 0 !important;
          }
          
          /* Add safe area padding for notched phones */
          .hotel-booking-card {
            padding-bottom: calc(clamp(0.875rem, 2.5vw, 1rem) + env(safe-area-inset-bottom)) !important;
          }
          
          /* Add bottom spacing to content for fixed booking bar */
          .hotel-main-grid {
            padding-bottom: clamp(80px, 20vw, 100px) !important;
          }
          
          /* ===== FULLSCREEN GALLERY ===== */
          .fullscreen-gallery {
            padding: clamp(0.5rem, 1.5vw, 0.75rem) !important;
          }
          
          .fullscreen-gallery img {
            border-radius: clamp(12px, 3vw, 16px) !important;
            max-height: 70vh !important;
          }
          
          .fullscreen-gallery .nav-btn {
            width: clamp(40px, 12vw, 50px) !important;
            height: clamp(40px, 12vw, 50px) !important;
            font-size: clamp(1.1rem, 3.5vw, 1.3rem) !important;
          }
          
          .fullscreen-gallery .close-btn {
            width: clamp(36px, 10vw, 44px) !important;
            height: clamp(36px, 10vw, 44px) !important;
            font-size: clamp(1rem, 3vw, 1.2rem) !important;
            top: clamp(0.5rem, 1.5vw, 0.75rem) !important;
            right: clamp(0.5rem, 1.5vw, 0.75rem) !important;
          }
          
          .fullscreen-gallery .image-counter {
            font-size: clamp(0.8rem, 2.3vw, 0.9rem) !important;
            padding: clamp(0.35rem, 1vw, 0.5rem) clamp(0.75rem, 2vw, 1rem) !important;
            border-radius: 8px !important;
          }
          
          .fullscreen-thumbnails {
            gap: clamp(0.35rem, 1vw, 0.5rem) !important;
            padding: clamp(0.5rem, 1.5vw, 0.75rem) !important;
          }
          
          .fullscreen-thumb {
            width: clamp(50px, 14vw, 64px) !important;
            height: clamp(35px, 10vw, 45px) !important;
            border-radius: 6px !important;
          }
        }
        
        /* ===== SMALL PHONES ===== */
        @media (max-width: 480px) {
          .hotel-gallery {
            height: clamp(200px, 45vw, 260px) !important;
            border-radius: clamp(10px, 2.5vw, 14px) !important;
          }
          
          .hotel-title {
            font-size: clamp(1.15rem, 4.5vw, 1.4rem) !important;
          }
          
          .hotel-info-grid {
            grid-template-columns: 1fr 1fr !important;
            gap: clamp(0.5rem, 1.5vw, 0.75rem) !important;
          }
          
          .hotel-info-item {
            padding: clamp(0.65rem, 2vw, 0.85rem) !important;
          }
          
          .amenities-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: clamp(0.5rem, 1.5vw, 0.65rem) !important;
          }
          
          .amenity-item {
            padding: clamp(0.55rem, 1.5vw, 0.7rem) !important;
            flex-direction: row !important;
            gap: clamp(0.35rem, 1vw, 0.5rem) !important;
          }
          
          .review-card {
            padding: clamp(0.75rem, 2vw, 0.9rem) !important;
          }
          
          .room-card {
            border-radius: clamp(10px, 2.5vw, 14px) !important;
          }
          
          .room-image {
            height: clamp(130px, 35vw, 170px) !important;
          }
          
          .room-content {
            padding: clamp(0.75rem, 2vw, 0.95rem) !important;
          }
          
          /* Compact Booking Bar */
          .hotel-booking-card {
            padding: clamp(0.65rem, 2vw, 0.8rem) clamp(0.75rem, 2vw, 1rem) !important;
            gap: clamp(0.5rem, 1.5vw, 0.75rem) !important;
          }
          
          .hotel-booking-card .booking-price {
            font-size: clamp(1.1rem, 3.5vw, 1.25rem) !important;
          }
          
          .hotel-booking-card button[type="button"],
          .hotel-booking-card .book-now-btn {
            padding: clamp(0.6rem, 1.8vw, 0.75rem) clamp(1rem, 3vw, 1.35rem) !important;
            font-size: clamp(0.78rem, 2.2vw, 0.88rem) !important;
          }
        }
        
        /* ===== EXTRA SMALL PHONES ===== */
        @media (max-width: 375px) {
          .hotel-title {
            font-size: clamp(1rem, 4vw, 1.2rem) !important;
          }
          
          .hotel-tabs {
            gap: clamp(0.25rem, 0.8vw, 0.4rem) !important;
          }
          
          .hotel-tab-btn {
            padding: clamp(0.4rem, 1.2vw, 0.55rem) clamp(0.65rem, 2vw, 0.85rem) !important;
            font-size: clamp(0.7rem, 2vw, 0.8rem) !important;
          }
          
          .hotel-info-grid {
            gap: clamp(0.4rem, 1.2vw, 0.55rem) !important;
          }
          
          .amenities-grid {
            gap: clamp(0.35rem, 1vw, 0.5rem) !important;
          }
          
          .amenity-item span:not(.material-symbols-outlined) {
            font-size: clamp(0.6rem, 1.8vw, 0.7rem) !important;
          }
        }
        
        /* ===== TOUCH DEVICE OPTIMIZATIONS ===== */
        @media (hover: none) and (pointer: coarse) {
          .hotel-tab-btn,
          .room-filter-btn,
          .room-book-btn,
          .hotel-booking-card button {
            transition: transform 0.15s ease !important;
          }
          
          .hotel-tab-btn:active,
          .room-filter-btn:active,
          .room-book-btn:active {
            transform: scale(0.97) !important;
          }
          
          .hotel-booking-card button:active {
            transform: scale(0.98) !important;
          }
          
          .room-card:active {
            transform: scale(0.99) !important;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
          }
          
          /* Prevent iOS zoom on input focus */
          input, select, textarea {
            font-size: 16px !important;
          }
        }
        
        /* ===== LANDSCAPE PHONE ===== */
        @media (max-height: 500px) and (orientation: landscape) {
          .hotel-gallery {
            height: clamp(150px, 35vh, 200px) !important;
          }
          
          .hotel-sidebar {
            position: relative !important;
          }
          
          .hotel-booking-card {
            position: relative !important;
            border-radius: 16px !important;
            box-shadow: 0 2px 16px rgba(0, 0, 0, 0.1) !important;
          }
          
          .hotel-main-grid {
            padding-bottom: 0 !important;
          }
        }
        
        /* ===== REDUCED MOTION ===== */
        @media (prefers-reduced-motion: reduce) {
          .hotel-tab-btn,
          .room-filter-btn,
          .room-book-btn,
          .room-card,
          button {
            transition: none !important;
          }
        }
        
        /* ===== HIGH CONTRAST MODE ===== */
        @media (prefers-contrast: high) {
          .hotel-tab-btn.active {
            border: 2px solid #000 !important;
          }
          
          .room-card {
            border: 2px solid #333 !important;
          }
          
          .hotel-booking-card button {
            border: 2px solid #fff !important;
          }
        }
      `}</style>

      {/* Host Properties Modal */}
      {showHostProperties && hotel.hostName && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
          onClick={() => setShowHostProperties(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "2rem",
              maxWidth: "800px",
              width: "100%",
              maxHeight: "80vh",
              overflowY: "auto",
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "2rem",
              }}
            >
              <h2
                style={{
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: "#1f2937",
                  margin: 0,
                }}
              >
                More Hotels by {hotel.hostName}
              </h2>
              <button
                onClick={() => setShowHostProperties(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                  color: "#64748b",
                }}
              >
                ✕
              </button>
            </div>

            {hostProperties.length > 0 ? (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
                  gap: "1.5rem",
                }}
              >
                {hostProperties.map((prop: any) => (
                  <div
                    key={prop._id}
                    onClick={() => {
                      window.location.href = `/hotels/${prop._id}`;
                    }}
                    style={{
                      background: "#f8fafc",
                      borderRadius: "12px",
                      overflow: "hidden",
                      cursor: "pointer",
                      transition: "all 0.3s ease",
                      border: "1px solid #e2e8f0",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow =
                        "0 10px 25px rgba(0, 0, 0, 0.1)";
                      e.currentTarget.style.transform = "translateY(-4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.transform = "translateY(0)";
                    }}
                  >
                    {prop.images && prop.images[0] && (
                      <img
                        src={prop.images[0]}
                        alt={prop.name}
                        style={{
                          width: "100%",
                          height: "150px",
                          objectFit: "cover",
                        }}
                      />
                    )}
                    <div style={{ padding: "1rem" }}>
                      <h3
                        style={{
                          fontSize: "1rem",
                          fontWeight: 700,
                          color: "#1f2937",
                          margin: "0 0 0.5rem",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {prop.name}
                      </h3>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "0.5rem",
                          fontSize: "0.85rem",
                          color: "#64748b",
                          marginBottom: "0.75rem",
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "1rem" }}
                        >
                          location_on
                        </span>
                        {prop.location}
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "0.25rem",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "1rem", color: "#fbbf24" }}
                          >
                            star
                          </span>
                          <span style={{ fontWeight: 600, color: "#1f2937" }}>
                            {prop.rating || "N/A"}
                          </span>
                        </div>
                        <button
                          style={{
                            background: "#3b82f6",
                            color: "white",
                            border: "none",
                            padding: "0.5rem 1rem",
                            borderRadius: "6px",
                            cursor: "pointer",
                            fontSize: "0.85rem",
                            fontWeight: 600,
                          }}
                        >
                          View
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem",
                  color: "#64748b",
                }}
              >
                <p>Loading properties...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
