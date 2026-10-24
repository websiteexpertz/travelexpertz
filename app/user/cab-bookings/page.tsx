"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Header from "../../components/Header";
import styles from "../../cabs/cabs.module.css";

interface CabBooking {
  _id: string;
  bookingReference: string;
  vehicleModel: string;
  vehicleCategory: string;
  pickupLocation: string;
  dropoffLocation: string;
  pickupAt: string;
  returnAt?: string | null;
  tripType: string;
  passengers: number;
  distanceKm: number;
  estimatedFare: number;
  status: "pending" | "confirmed" | "cancelled" | "completed";
}

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function CabBookingsPage() {
  const [bookings, setBookings] = useState<CabBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requiresSignIn, setRequiresSignIn] = useState(false);
  const [cancellingId, setCancellingId] = useState("");

  const loadBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/user/cab-bookings", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 401) setRequiresSignIn(true);
        throw new Error(data.error || "Could not load your cab bookings.");
      }
      setRequiresSignIn(false);
      setBookings(Array.isArray(data) ? data : []);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Could not load your cab bookings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBookings();
  }, [loadBookings]);

  const cancelBooking = async (booking: CabBooking) => {
    if (!window.confirm(`Cancel request ${booking.bookingReference}?`)) return;

    setCancellingId(booking._id);
    setError("");
    try {
      const response = await fetch(`/api/user/cab-bookings?id=${encodeURIComponent(booking._id)}`, {
        method: "PATCH",
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not cancel this request.");
      await loadBookings();
    } catch (cancelError) {
      setError(cancelError instanceof Error ? cancelError.message : "Could not cancel this request.");
    } finally {
      setCancellingId("");
    }
  };

  return (
    <>
      <Header currentPage="cabs" solidHeader />
      <main className={styles.historyPage}>
        <div className={styles.historyHeader}>
          <div>
            <p className={styles.eyebrow}>Your rides</p>
            <h1>Cab bookings</h1>
            <p>Review your requests and cancel pending bookings.</p>
          </div>
          <Link className={styles.historyBackLink} href="/cabs">Book a cab</Link>
        </div>

        {error && (
          <div className={styles.errorState} role="alert">
            {error}
            {requiresSignIn && <> <Link href="/auth/login">Sign in</Link> to view account bookings.</>}
          </div>
        )}

        {loading ? (
          <p className={styles.inlineState}>Loading your cab bookings...</p>
        ) : !error && bookings.length === 0 ? (
          <div className={styles.historyEmpty}>
            <span className="material-symbols-outlined" aria-hidden="true">directions_car</span>
            <h2>No cab bookings yet</h2>
            <p>Your ride requests and confirmations will appear here.</p>
            <Link className={styles.historyBackLink} href="/cabs">Find a cab</Link>
          </div>
        ) : (
          <div className={styles.historyList}>
            {bookings.map((booking) => (
              <article className={styles.historyCard} key={booking._id}>
                <div className={styles.historyCardHeader}>
                  <div>
                    <span className={styles.historyReference}>{booking.bookingReference}</span>
                    <h2>{booking.vehicleModel}</h2>
                    <p>{booking.vehicleCategory} <span aria-hidden="true">·</span> {booking.tripType.replace("-", " ")}</p>
                  </div>
                  <span className={`${styles.bookingStatus} ${styles[`status${booking.status[0].toUpperCase()}${booking.status.slice(1)}`]}`}>
                    {booking.status}
                  </span>
                </div>
                <div className={styles.historyRoute}>
                  <p><span>From</span>{booking.pickupLocation}</p>
                  <p><span>To</span>{booking.dropoffLocation}</p>
                </div>
                <div className={styles.historyDetails}>
                  <span>Pickup</span><strong>{new Date(booking.pickupAt).toLocaleString()}</strong>
                  {booking.returnAt && <><span>Return</span><strong>{new Date(booking.returnAt).toLocaleString()}</strong></>}
                  <span>Passengers</span><strong>{booking.passengers}</strong>
                  <span>Distance</span><strong>{booking.distanceKm} km</strong>
                  <span>Estimated fare</span><strong>{inr.format(booking.estimatedFare)}</strong>
                </div>
                {booking.status === "pending" && (
                  <button
                    className={styles.cancelBookingButton}
                    type="button"
                    disabled={cancellingId === booking._id}
                    onClick={() => void cancelBooking(booking)}
                  >
                    {cancellingId === booking._id ? "Cancelling..." : "Cancel request"}
                  </button>
                )}
              </article>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
