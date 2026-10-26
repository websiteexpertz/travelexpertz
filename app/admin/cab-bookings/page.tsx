"use client";

import { useCallback, useEffect, useState } from "react";

interface CabBooking {
  _id: string;
  bookingReference: string;
  vehicleModel: string;
  vehicleCategory: string;
  vehicleFuelType?: string;
  vehicleColor?: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupAt: string;
  returnAt?: string | null;
  tripType: "one-way" | "round-trip" | "airport-transfer";
  passengers: number;
  luggage: number;
  estimatedFare: number;
  governmentTax?: number;
  governmentTaxPercent?: number;
  fareSubtotal?: number;
  fareBase?: number;
  farePerKm?: number;
  driverAllowance?: number;
  driverName?: string;
  driverPhone?: string;
  fullName: string;
  phone: string;
  email: string;
  notes?: string;
  status: "pending" | "confirmed" | "cancelled" | "completed";
}

const statuses = ["all", "pending", "confirmed", "cancelled", "completed"] as const;
const badgeColors: Record<CabBooking["status"], { bg: string; text: string }> = {
  pending: { bg: "#fff3cd", text: "#856404" },
  confirmed: { bg: "#d4edda", text: "#155724" },
  cancelled: { bg: "#f8d7da", text: "#721c24" },
  completed: { bg: "#d1ecf1", text: "#0c5460" },
};

export default function AdminCabBookingsPage() {
  const [bookings, setBookings] = useState<CabBooking[]>([]);
  const [filter, setFilter] = useState<(typeof statuses)[number]>("pending");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = filter === "all" ? "" : `?status=${filter}`;
      const response = await fetch(`/api/admin/cab-bookings${query}`, {
        credentials: "include",
        cache: "no-store",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load booking requests.");
      setBookings(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load booking requests.");
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const updateStatus = async (booking: CabBooking, status: CabBooking["status"]) => {
    setUpdatingId(booking._id);
    setError("");
    try {
      const response = await fetch(`/api/admin/cab-bookings?id=${encodeURIComponent(booking._id)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update booking.");
      await loadBookings();
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Could not update booking.");
    } finally {
      setUpdatingId("");
    }
  };

  return (
    <main style={{ padding: "2rem", color: "#1e293b" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
        <div>
          <a href="/admin/cabs" style={{ color: "#0a66c2", fontSize: "0.85rem", fontWeight: 600 }}>Cab fleet</a>
          <h1 style={{ margin: "0.35rem 0 0", fontSize: "1.75rem", fontWeight: 800 }}>Cab booking requests</h1>
        </div>
        <button type="button" onClick={() => void loadBookings()} disabled={loading} style={buttonStyle}>Refresh</button>
      </div>

      <div role="tablist" aria-label="Filter booking requests" style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        {statuses.map((status) => (
          <button
            key={status}
            type="button"
            role="tab"
            aria-selected={filter === status}
            onClick={() => setFilter(status)}
            style={{ ...buttonStyle, background: filter === status ? "#0a66c2" : "white", color: filter === status ? "white" : "#334155", textTransform: "capitalize" }}
          >
            {status}
          </button>
        ))}
      </div>

      {error && <p role="alert" style={{ padding: "0.8rem 1rem", background: "#fff2f0", color: "#9f322b", borderRadius: "0.5rem" }}>{error}</p>}
      <div style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "0.5rem", overflow: "hidden" }}>
        {loading ? (
          <p style={{ padding: "3rem", color: "#64748b", textAlign: "center" }}>Loading booking requests...</p>
        ) : bookings.length === 0 ? (
          <p style={{ padding: "3rem", color: "#64748b", textAlign: "center" }}>No {filter === "all" ? "" : `${filter} `}cab requests found.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", minWidth: "1050px", borderCollapse: "collapse" }}>
              <thead><tr style={{ background: "#f8f9fa", borderBottom: "1px solid #dee2e6" }}>
                {["Reference / Guest", "Vehicle / Driver", "Route", "Pickup", "Passengers / Bags", "Fare / Tax", "Status", "Actions"].map((item) => <th key={item} scope="col" style={headStyle}>{item}</th>)}
              </tr></thead>
              <tbody>
                {bookings.map((booking) => {
                  const badge = badgeColors[booking.status];
                  return (
                    <tr key={booking._id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                      <td style={cellStyle}><strong>{booking.bookingReference}</strong><br />{booking.fullName}<br /><a href={`mailto:${booking.email}`}>{booking.email}</a><br /><a href={`tel:${booking.phone}`}>{booking.phone}</a></td>
                      <td style={cellStyle}>{booking.vehicleModel}<br /><span style={{ color: "#64748b" }}>{booking.vehicleCategory}{booking.vehicleFuelType ? ` · ${booking.vehicleFuelType}` : ""}{booking.vehicleColor ? ` · ${booking.vehicleColor}` : ""}</span>{booking.driverName && <><br /><strong>Driver: {booking.driverName}</strong></>}{booking.driverPhone && <><br /><a href={`tel:${booking.driverPhone}`}>{booking.driverPhone}</a></>}</td>
                      <td style={cellStyle}>{booking.pickupLocation}<br /><span style={{ color: "#64748b" }}>to</span><br />{booking.dropoffLocation}<br /><span style={{ color: "#64748b" }}>{booking.tripType}</span></td>
                      <td style={cellStyle}>{new Date(booking.pickupAt).toLocaleString()}<br />{booking.returnAt ? `Return: ${new Date(booking.returnAt).toLocaleString()}` : ""}</td>
                      <td style={cellStyle}>{booking.passengers} passengers<br />{booking.luggage} bags</td>
                      <td style={cellStyle}>₹{booking.estimatedFare.toLocaleString("en-IN")} total<br /><span style={{ color: "#64748b" }}>Base ₹{(booking.fareBase || 0).toLocaleString("en-IN")} + distance ₹{Math.max(0, (booking.fareSubtotal || 0) - (booking.fareBase || 0) - (booking.driverAllowance || 0)).toLocaleString("en-IN")}<br />Driver ₹{(booking.driverAllowance || 0).toLocaleString("en-IN")} · tax ₹{(booking.governmentTax || 0).toLocaleString("en-IN")} ({booking.governmentTaxPercent || 0}%)</span></td>
                      <td style={cellStyle}><span style={{ padding: "0.25rem 0.55rem", borderRadius: "999px", background: badge.bg, color: badge.text, fontSize: "0.77rem", fontWeight: 700 }}>{booking.status}</span>{booking.notes && <p style={{ maxWidth: "180px", margin: "0.5rem 0 0", color: "#64748b", fontSize: "0.78rem" }}>{booking.notes}</p>}</td>
                      <td style={cellStyle}>
                        {booking.status === "pending" && <div style={{ display: "grid", gap: "0.45rem" }}>
                          <button disabled={updatingId === booking._id} onClick={() => void updateStatus(booking, "confirmed")} style={{ ...buttonStyle, color: "#155724", borderColor: "#b7ddc2" }}>Confirm</button>
                          <button disabled={updatingId === booking._id} onClick={() => void updateStatus(booking, "cancelled")} style={{ ...buttonStyle, color: "#721c24", borderColor: "#edc2c4" }}>Cancel</button>
                        </div>}
                        {booking.status === "confirmed" && <button disabled={updatingId === booking._id} onClick={() => void updateStatus(booking, "completed")} style={buttonStyle}>Mark completed</button>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

const buttonStyle: React.CSSProperties = {
  minHeight: "38px",
  padding: "0.5rem 0.8rem",
  border: "1px solid #cbd5e1",
  borderRadius: "0.5rem",
  background: "white",
  color: "#334155",
  font: "inherit",
  fontSize: "0.82rem",
  fontWeight: 600,
  cursor: "pointer",
};

const headStyle: React.CSSProperties = {
  padding: "0.9rem 1rem",
  color: "#475569",
  fontSize: "0.78rem",
  fontWeight: 700,
  textAlign: "left",
  whiteSpace: "nowrap",
};

const cellStyle: React.CSSProperties = {
  padding: "0.9rem 1rem",
  color: "#334155",
  fontSize: "0.82rem",
  verticalAlign: "top",
};
