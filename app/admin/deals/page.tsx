"use client";

import React, { useEffect, useState } from "react";

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

interface ItemWithOffers {
  _id: string;
  name: string;
  location: string;
  price: number;
  image: string;
  category: "hotel" | "homestay" | "package";
  offers: Offer[];
}

export default function AdminDeals() {
  const [hotels, setHotels] = useState<any[]>([]);
  const [homestays, setHomestays] = useState<any[]>([]);
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<
    "hotel" | "homestay" | "package"
  >("hotel");
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [editingOfferId, setEditingOfferId] = useState<string | null>(null);

  const [offerForm, setOfferForm] = useState<Offer>({
    id: "",
    type: "percentage",
    title: "",
    description: "",
    discountPercentage: 0,
    validFrom: "",
    validUntil: "",
    active: true,
  });

  const inrFormatter = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  const formatInr = (value: number) =>
    inrFormatter.format(Math.max(0, Math.round(value)));

  useEffect(() => {
    fetchAllItems();
  }, []);

  const fetchAllItems = async () => {
    try {
      const [hotelsRes, homestaysRes, packagesRes] = await Promise.all([
        fetch("/api/hotels", { cache: "no-store" }),
        fetch("/api/homestays", { cache: "no-store" }),
        fetch("/api/packages", { cache: "no-store" }),
      ]);

      if (hotelsRes.ok) {
        const data = await hotelsRes.json();
        setHotels(Array.isArray(data) ? data : []);
      }
      if (homestaysRes.ok) {
        const data = await homestaysRes.json();
        setHomestays(Array.isArray(data) ? data : []);
      }
      if (packagesRes.ok) {
        const data = await packagesRes.json();
        setPackages(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Failed to fetch items:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentItems = () => {
    switch (selectedCategory) {
      case "hotel":
        return hotels;
      case "homestay":
        return homestays;
      case "package":
        return packages;
      default:
        return [];
    }
  };

  const selectItemForOffer = (item: any) => {
    setSelectedItem({ ...item, category: selectedCategory });
    setShowOfferForm(false);
  };

  const resetOfferForm = () => {
    setOfferForm({
      id: Date.now().toString(),
      type: "percentage",
      title: "",
      description: "",
      discountPercentage: 0,
      validFrom: "",
      validUntil: "",
      active: true,
    });
    setEditingOfferId(null);
  };

  const addOffer = async () => {
    if (!selectedItem) return;

    const newOffer = {
      ...offerForm,
      id: Date.now().toString(),
    };

    const updatedOffers = [...(selectedItem.offers || []), newOffer];

    try {
      const endpoint = `/api/${
        selectedCategory === "package"
          ? "packages"
          : selectedCategory === "hotel"
          ? "hotels"
          : "homestays"
      }`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: selectedItem._id,
          offers: updatedOffers,
        }),
      });

      if (response.ok) {
        await fetchAllItems();
        setSelectedItem({ ...selectedItem, offers: updatedOffers });
        resetOfferForm();
        setShowOfferForm(false);
        alert("Offer added successfully!");
      }
    } catch (error) {
      console.error("Failed to add offer:", error);
      alert("Failed to add offer");
    }
  };

  const updateOffer = async () => {
    if (!selectedItem || !editingOfferId) return;

    const updatedOffers = (selectedItem.offers || []).map((o: Offer) =>
      o.id === editingOfferId ? { ...offerForm, id: editingOfferId } : o
    );

    try {
      const endpoint = `/api/${
        selectedCategory === "package"
          ? "packages"
          : selectedCategory === "hotel"
          ? "hotels"
          : "homestays"
      }`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: selectedItem._id,
          offers: updatedOffers,
        }),
      });

      if (response.ok) {
        await fetchAllItems();
        setSelectedItem({ ...selectedItem, offers: updatedOffers });
        resetOfferForm();
        setShowOfferForm(false);
        alert("Offer updated successfully!");
      }
    } catch (error) {
      console.error("Failed to update offer:", error);
      alert("Failed to update offer");
    }
  };

  const editOffer = (offer: Offer) => {
    setOfferForm(offer);
    setEditingOfferId(offer.id);
    setShowOfferForm(true);
  };

  const removeOffer = async (offerId: string) => {
    if (!selectedItem || !confirm("Remove this offer?")) return;

    const updatedOffers = (selectedItem.offers || []).filter(
      (o: Offer) => o.id !== offerId
    );

    try {
      const endpoint = `/api/${
        selectedCategory === "package"
          ? "packages"
          : selectedCategory === "hotel"
          ? "hotels"
          : "homestays"
      }`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: selectedItem._id,
          offers: updatedOffers,
        }),
      });

      if (response.ok) {
        await fetchAllItems();
        setSelectedItem({ ...selectedItem, offers: updatedOffers });
        alert("Offer removed successfully!");
      }
    } catch (error) {
      console.error("Failed to remove offer:", error);
      alert("Failed to remove offer");
    }
  };

  const toggleOfferStatus = async (offerId: string) => {
    if (!selectedItem) return;

    const updatedOffers = (selectedItem.offers || []).map((o: Offer) =>
      o.id === offerId ? { ...o, active: !o.active } : o
    );

    try {
      const endpoint = `/api/${
        selectedCategory === "package"
          ? "packages"
          : selectedCategory === "hotel"
          ? "hotels"
          : "homestays"
      }`;
      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          _id: selectedItem._id,
          offers: updatedOffers,
        }),
      });

      if (response.ok) {
        await fetchAllItems();
        setSelectedItem({ ...selectedItem, offers: updatedOffers });
      }
    } catch (error) {
      console.error("Failed to toggle offer status:", error);
    }
  };

  return (
    <div style={{ background: "#f3f4f6", minHeight: "100vh", padding: "2rem" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto" }}>
        <div style={{ marginBottom: "2rem" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "2rem",
              fontWeight: 700,
              color: "#1f2937",
            }}
          >
            Manage Deals & Offers
          </h1>
          <p
            style={{
              margin: "0.5rem 0 0",
              color: "#6b7280",
              fontSize: "0.95rem",
            }}
          >
            Add special offers to hotels, homestays, and packages
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "350px 1fr",
            gap: "2rem",
          }}
        >
          {/* Left Sidebar - Item Selection */}
          <div>
            {/* Category Tabs */}
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "1rem",
                marginBottom: "1rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              }}
            >
              <h3
                style={{
                  margin: "0 0 1rem",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              >
                Category
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {["hotel", "homestay", "package"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat as any);
                      setSelectedItem(null);
                      setShowOfferForm(false);
                    }}
                    style={{
                      padding: "0.75rem",
                      background:
                        selectedCategory === cat ? "#0066cc" : "#f9fafb",
                      color: selectedCategory === cat ? "white" : "#1f2937",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "0.95rem",
                      fontWeight: 600,
                      textAlign: "left",
                      textTransform: "capitalize",
                    }}
                  >
                    {cat}s (
                    {cat === "hotel"
                      ? hotels.length
                      : cat === "homestay"
                      ? homestays.length
                      : packages.length}
                    )
                  </button>
                ))}
              </div>
            </div>

            {/* Items List */}
            <div
              style={{
                background: "white",
                borderRadius: "12px",
                padding: "1rem",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                maxHeight: "calc(100vh - 300px)",
                overflowY: "auto",
              }}
            >
              <h3
                style={{
                  margin: "0 0 1rem",
                  fontSize: "1.1rem",
                  fontWeight: 600,
                }}
              >
                Select {selectedCategory}
              </h3>
              {loading ? (
                <p style={{ color: "#6b7280" }}>Loading...</p>
              ) : (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.5rem",
                  }}
                >
                  {getCurrentItems().map((item) => (
                    <div
                      key={item._id}
                      onClick={() => selectItemForOffer(item)}
                      style={{
                        padding: "0.75rem",
                        background:
                          selectedItem?._id === item._id
                            ? "#e0f2fe"
                            : "#f9fafb",
                        border:
                          selectedItem?._id === item._id
                            ? "2px solid #0066cc"
                            : "1px solid #e5e7eb",
                        borderRadius: "8px",
                        cursor: "pointer",
                        transition: "all 0.2s",
                      }}
                    >
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: "0.9rem",
                          marginBottom: "0.25rem",
                        }}
                      >
                        {item.name || item.title}
                      </div>
                      <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                        {item.location || item.destination}
                      </div>
                      {item.offers && item.offers.length > 0 && (
                        <div
                          style={{
                            marginTop: "0.5rem",
                            padding: "0.25rem 0.5rem",
                            background: "#dcfce7",
                            color: "#166534",
                            borderRadius: "4px",
                            fontSize: "0.75rem",
                            display: "inline-block",
                          }}
                        >
                          {item.offers.length} offer
                          {item.offers.length !== 1 ? "s" : ""}
                        </div>
                      )}
                    </div>
                  ))}
                  {getCurrentItems().length === 0 && (
                    <p style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                      No {selectedCategory}s found
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Offer Management */}
          <div>
            {!selectedItem ? (
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  padding: "3rem",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  textAlign: "center",
                  color: "#6b7280",
                }}
              >
                <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎁</div>
                <h3 style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
                  No Item Selected
                </h3>
                <p>
                  Select a hotel, homestay, or package from the left to manage
                  offers
                </p>
              </div>
            ) : (
              <div>
                {/* Selected Item Info */}
                <div
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    marginBottom: "1.5rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    display: "flex",
                    gap: "1.5rem",
                    alignItems: "center",
                  }}
                >
                  {selectedItem.image && (
                    <img
                      src={selectedItem.image}
                      alt={selectedItem.name}
                      style={{
                        width: "100px",
                        height: "100px",
                        objectFit: "cover",
                        borderRadius: "8px",
                      }}
                    />
                  )}
                  <div style={{ flex: 1 }}>
                    <h2
                      style={{
                        margin: "0 0 0.5rem",
                        fontSize: "1.5rem",
                        fontWeight: 700,
                      }}
                    >
                      {selectedItem.name || selectedItem.title}
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        color: "#6b7280",
                        fontSize: "0.95rem",
                      }}
                    >
                      📍 {selectedItem.location || selectedItem.destination}
                    </p>
                    <p
                      style={{
                        margin: "0.5rem 0 0",
                        color: "#6b7280",
                        fontSize: "0.95rem",
                      }}
                    >
                      💰 {formatInr(selectedItem.price)}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      resetOfferForm();
                      setShowOfferForm(true);
                    }}
                    style={{
                      padding: "0.75rem 1.5rem",
                      background: "#00b894",
                      color: "white",
                      border: "none",
                      borderRadius: "8px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: 600,
                      whiteSpace: "nowrap",
                    }}
                  >
                    + Add Offer
                  </button>
                </div>

                {/* Add Offer Form */}
                {showOfferForm && (
                  <div
                    style={{
                      background: "white",
                      borderRadius: "12px",
                      padding: "1.5rem",
                      marginBottom: "1.5rem",
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                      border: "2px solid #0066cc",
                    }}
                  >
                    <h3
                      style={{
                        margin: "0 0 1.5rem",
                        fontSize: "1.2rem",
                        fontWeight: 600,
                      }}
                    >
                      {editingOfferId ? "Edit Offer" : "Create New Offer"}
                    </h3>

                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          Offer Type
                        </label>
                        <select
                          value={offerForm.type}
                          onChange={(e) =>
                            setOfferForm({
                              ...offerForm,
                              type: e.target.value as any,
                            })
                          }
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "0.95rem",
                          }}
                        >
                          <option value="percentage">
                            Percentage Discount
                          </option>
                          <option value="stay_bonus">
                            Stay Bonus (e.g., Free Meals)
                          </option>
                          <option value="early_booking">
                            Early Booking Discount
                          </option>
                          <option value="custom">Custom Offer</option>
                        </select>
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          Offer Title *
                        </label>
                        <input
                          value={offerForm.title}
                          onChange={(e) =>
                            setOfferForm({
                              ...offerForm,
                              title: e.target.value,
                            })
                          }
                          placeholder="e.g., 20% Off Summer Special"
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "0.95rem",
                          }}
                        />
                      </div>

                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: 600,
                            fontSize: "0.9rem",
                          }}
                        >
                          Description *
                        </label>
                        <textarea
                          value={offerForm.description}
                          onChange={(e) =>
                            setOfferForm({
                              ...offerForm,
                              description: e.target.value,
                            })
                          }
                          placeholder="Describe the offer details..."
                          rows={3}
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            border: "1px solid #d1d5db",
                            borderRadius: "8px",
                            fontSize: "0.95rem",
                            resize: "vertical",
                          }}
                        />
                      </div>

                      {offerForm.type === "percentage" && (
                        <div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontWeight: 600,
                              fontSize: "0.9rem",
                            }}
                          >
                            Discount Percentage
                          </label>
                          <input
                            type="number"
                            value={offerForm.discountPercentage || 0}
                            onChange={(e) =>
                              setOfferForm({
                                ...offerForm,
                                discountPercentage: Number(e.target.value),
                              })
                            }
                            placeholder="20"
                            min="0"
                            max="100"
                            style={{
                              width: "100%",
                              padding: "0.75rem",
                              border: "1px solid #d1d5db",
                              borderRadius: "8px",
                              fontSize: "0.95rem",
                            }}
                          />
                        </div>
                      )}

                      {offerForm.type === "stay_bonus" && (
                        <>
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                              }}
                            >
                              Minimum Stay Days
                            </label>
                            <input
                              type="number"
                              value={offerForm.stayDays || 0}
                              onChange={(e) =>
                                setOfferForm({
                                  ...offerForm,
                                  stayDays: Number(e.target.value),
                                })
                              }
                              placeholder="3"
                              min="1"
                              style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                fontSize: "0.95rem",
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                              }}
                            >
                              Bonus Description
                            </label>
                            <input
                              value={offerForm.bonusDescription || ""}
                              onChange={(e) =>
                                setOfferForm({
                                  ...offerForm,
                                  bonusDescription: e.target.value,
                                })
                              }
                              placeholder="e.g., Free breakfast for all days"
                              style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                fontSize: "0.95rem",
                              }}
                            />
                          </div>
                        </>
                      )}

                      {offerForm.type === "early_booking" && (
                        <>
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                              }}
                            >
                              Book Before (Days in Advance)
                            </label>
                            <input
                              type="number"
                              value={offerForm.advanceBookingDays || 0}
                              onChange={(e) =>
                                setOfferForm({
                                  ...offerForm,
                                  advanceBookingDays: Number(e.target.value),
                                })
                              }
                              placeholder="30"
                              min="1"
                              style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                fontSize: "0.95rem",
                              }}
                            />
                          </div>
                          <div>
                            <label
                              style={{
                                display: "block",
                                marginBottom: "0.5rem",
                                fontWeight: 600,
                                fontSize: "0.9rem",
                              }}
                            >
                              Discount Percentage
                            </label>
                            <input
                              type="number"
                              value={offerForm.discountPercentage || 0}
                              onChange={(e) =>
                                setOfferForm({
                                  ...offerForm,
                                  discountPercentage: Number(e.target.value),
                                })
                              }
                              placeholder="20"
                              min="0"
                              max="100"
                              style={{
                                width: "100%",
                                padding: "0.75rem",
                                border: "1px solid #d1d5db",
                                borderRadius: "8px",
                                fontSize: "0.95rem",
                              }}
                            />
                          </div>
                        </>
                      )}

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "1rem",
                        }}
                      >
                        <div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontWeight: 600,
                              fontSize: "0.9rem",
                            }}
                          >
                            Valid From
                          </label>
                          <input
                            type="date"
                            value={offerForm.validFrom}
                            onChange={(e) =>
                              setOfferForm({
                                ...offerForm,
                                validFrom: e.target.value,
                              })
                            }
                            style={{
                              width: "100%",
                              padding: "0.75rem",
                              border: "1px solid #d1d5db",
                              borderRadius: "8px",
                              fontSize: "0.95rem",
                            }}
                          />
                        </div>
                        <div>
                          <label
                            style={{
                              display: "block",
                              marginBottom: "0.5rem",
                              fontWeight: 600,
                              fontSize: "0.9rem",
                            }}
                          >
                            Valid Until
                          </label>
                          <input
                            type="date"
                            value={offerForm.validUntil}
                            onChange={(e) =>
                              setOfferForm({
                                ...offerForm,
                                validUntil: e.target.value,
                              })
                            }
                            style={{
                              width: "100%",
                              padding: "0.75rem",
                              border: "1px solid #d1d5db",
                              borderRadius: "8px",
                              fontSize: "0.95rem",
                            }}
                          />
                        </div>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: "1rem",
                          paddingTop: "1rem",
                          borderTop: "1px solid #e5e7eb",
                        }}
                      >
                        <button
                          onClick={editingOfferId ? updateOffer : addOffer}
                          style={{
                            padding: "0.75rem 1.5rem",
                            background: "#00b894",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.95rem",
                            fontWeight: 600,
                          }}
                        >
                          {editingOfferId ? "Update Offer" : "Save Offer"}
                        </button>
                        <button
                          onClick={() => setShowOfferForm(false)}
                          style={{
                            padding: "0.75rem 1.5rem",
                            background: "#6b7280",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            fontSize: "0.95rem",
                            fontWeight: 600,
                          }}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Existing Offers List */}
                <div
                  style={{
                    background: "white",
                    borderRadius: "12px",
                    padding: "1.5rem",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  <h3
                    style={{
                      margin: "0 0 1rem",
                      fontSize: "1.2rem",
                      fontWeight: 600,
                    }}
                  >
                    Active Offers ({selectedItem.offers?.length || 0})
                  </h3>

                  {!selectedItem.offers || selectedItem.offers.length === 0 ? (
                    <p
                      style={{
                        color: "#6b7280",
                        textAlign: "center",
                        padding: "2rem",
                      }}
                    >
                      No offers added yet. Click "Add Offer" to create one.
                    </p>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "1rem",
                      }}
                    >
                      {selectedItem.offers.map((offer: Offer) => (
                        <div
                          key={offer.id}
                          style={{
                            padding: "1.5rem",
                            background: offer.active ? "#f9fafb" : "#fef2f2",
                            border: `2px solid ${
                              offer.active ? "#e5e7eb" : "#fecaca"
                            }`,
                            borderRadius: "8px",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "start",
                              marginBottom: "1rem",
                            }}
                          >
                            <div style={{ flex: 1 }}>
                              <h4
                                style={{
                                  margin: "0 0 0.5rem",
                                  fontSize: "1.1rem",
                                  fontWeight: 600,
                                }}
                              >
                                {offer.title}
                              </h4>
                              <p
                                style={{
                                  margin: "0 0 0.5rem",
                                  color: "#6b7280",
                                  fontSize: "0.9rem",
                                }}
                              >
                                {offer.description}
                              </p>
                              <div
                                style={{
                                  display: "flex",
                                  gap: "1rem",
                                  flexWrap: "wrap",
                                  fontSize: "0.85rem",
                                  color: "#6b7280",
                                }}
                              >
                                <span>
                                  Type:{" "}
                                  <strong>
                                    {offer.type.replace("_", " ")}
                                  </strong>
                                </span>
                                {offer.discountPercentage && (
                                  <span>
                                    Discount:{" "}
                                    <strong>{offer.discountPercentage}%</strong>
                                  </span>
                                )}
                                {offer.stayDays && (
                                  <span>
                                    Stay: <strong>{offer.stayDays} days</strong>
                                  </span>
                                )}
                                {offer.advanceBookingDays && (
                                  <span>
                                    Book{" "}
                                    <strong>
                                      {offer.advanceBookingDays} days
                                    </strong>{" "}
                                    in advance
                                  </span>
                                )}
                              </div>
                              <div
                                style={{
                                  marginTop: "0.5rem",
                                  fontSize: "0.85rem",
                                  color: "#6b7280",
                                }}
                              >
                                Valid: {offer.validFrom || "N/A"} to{" "}
                                {offer.validUntil || "N/A"}
                              </div>
                            </div>
                            <div
                              style={{
                                display: "flex",
                                gap: "0.5rem",
                                flexDirection: "column",
                              }}
                            >
                              <button
                                onClick={() => editOffer(offer)}
                                style={{
                                  padding: "0.5rem 1rem",
                                  background: "#0066cc",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "0.85rem",
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => toggleOfferStatus(offer.id)}
                                style={{
                                  padding: "0.5rem 1rem",
                                  background: offer.active
                                    ? "#f59e0b"
                                    : "#10b981",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "0.85rem",
                                  fontWeight: 600,
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {offer.active ? "Deactivate" : "Activate"}
                              </button>
                              <button
                                onClick={() => removeOffer(offer.id)}
                                style={{
                                  padding: "0.5rem 1rem",
                                  background: "#ef4444",
                                  color: "white",
                                  border: "none",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "0.85rem",
                                  fontWeight: 600,
                                }}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                          {!offer.active && (
                            <div
                              style={{
                                padding: "0.5rem",
                                background: "#fee2e2",
                                color: "#991b1b",
                                borderRadius: "6px",
                                fontSize: "0.85rem",
                                textAlign: "center",
                              }}
                            >
                              This offer is currently inactive
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
