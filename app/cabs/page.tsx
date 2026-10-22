"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Header from "../components/Header";
import styles from "./cabs.module.css";

type Cab = {
  _id: string;
  model: string;
  category: string;
  seats: number;
  luggageCapacity: number;
  baseFare: number;
  perKmRate: number;
  taxPercent: number;
};

type BookingForm = {
  tripType: "one-way" | "round-trip";
  pickupLocation: string;
  dropoffLocation: string;
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
  passengers: number;
  luggage: number;
  distanceKm: number;
  cabId: string;
  fullName: string;
  phone: string;
  email: string;
  notes: string;
};

function localDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

const initialForm: BookingForm = {
  tripType: "one-way",
  pickupLocation: "",
  dropoffLocation: "",
  pickupDate: localDate(1),
  pickupTime: "09:00",
  returnDate: localDate(2),
  returnTime: "18:00",
  passengers: 1,
  luggage: 1,
  distanceKm: 25,
  cabId: "",
  fullName: "",
  phone: "",
  email: "",
  notes: "",
};

const inr = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

export default function CabsPage() {
  const [cabs, setCabs] = useState<Cab[]>([]);
  const [loadingCabs, setLoadingCabs] = useState(true);
  const [fleetError, setFleetError] = useState("");
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirmation, setConfirmation] = useState<{
    bookingReference: string;
    estimatedFare: number;
    message: string;
  } | null>(null);

  useEffect(() => {
    fetch("/api/cabs", { cache: "no-store" })
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not load vehicles.");
        setCabs(Array.isArray(data) ? data : []);
      })
      .catch((error: unknown) => {
        setFleetError(error instanceof Error ? error.message : "Could not load vehicles.");
      })
      .finally(() => setLoadingCabs(false));
  }, []);

  const matchingCabs = useMemo(
    () => cabs.filter((cab) => cab.seats >= form.passengers && cab.luggageCapacity >= form.luggage),
    [cabs, form.luggage, form.passengers],
  );

  const selectedCab = matchingCabs.find((cab) => cab._id === form.cabId);
  const fareSubtotal = selectedCab
    ? Math.round(selectedCab.baseFare + form.distanceKm * selectedCab.perKmRate * (form.tripType === "round-trip" ? 2 : 1))
    : 0;
  const governmentTax = selectedCab ? Math.round(fareSubtotal * selectedCab.taxPercent / 100) : 0;
  const estimatedFare = fareSubtotal + governmentTax;

  useEffect(() => {
    if (!form.cabId || !matchingCabs.some((cab) => cab._id === form.cabId)) {
      setForm((current) => ({ ...current, cabId: matchingCabs[0]?._id || "" }));
    }
  }, [form.cabId, matchingCabs]);

  const updateForm = <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormError("");
    setConfirmation(null);
  };

  const submitBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setFormError("");
    try {
      const response = await fetch("/api/cab-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit your request.");
      setConfirmation(data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Could not submit your request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (confirmation) {
    return (
      <>
        <Header currentPage="cabs" solidHeader />
        <main className={styles.confirmationPage}>
          <div className={styles.confirmationMark} aria-hidden="true">
            <span className="material-symbols-outlined">check</span>
          </div>
          <p className={styles.eyebrow}>Request received</p>
          <h1>Your ride is in motion.</h1>
          <p className={styles.confirmationCopy}>{confirmation.message}</p>
          <div className={styles.referenceRow}>
            <span>Booking reference</span>
            <strong>{confirmation.bookingReference}</strong>
          </div>
          <div className={styles.referenceRow}>
            <span>Estimated fare</span>
            <strong>{inr.format(confirmation.estimatedFare)}</strong>
          </div>
          <button className={styles.secondaryButton} onClick={() => setConfirmation(null)}>
            Make another booking
          </button>
        </main>
      </>
    );
  }

  return (
    <>
      <Header currentPage="cabs" solidHeader />
      <main className={styles.page}>
        <section className={styles.intro}>
          <div className={styles.introCopy}>
            <p className={styles.eyebrow}>Your trip, your way</p>
            <h1>Book a cab.<br />Go further.</h1>
            <p>Choose your ride, set your route, and get a clear estimate before you request.</p>
            <div className={styles.trustLine}>
              <span><span className="material-symbols-outlined">verified_user</span>Local fleet</span>
              <span><span className="material-symbols-outlined">support_agent</span>Human confirmation</span>
            </div>
          </div>
          <div className={styles.heroImage}>
            <Image src="/cab.png" alt="City cab ready for your journey" fill priority sizes="(max-width: 760px) 100vw, 50vw" />
            <div className={styles.imageCaption}>The right ride for the road ahead.</div>
          </div>
        </section>

        <form className={styles.bookingLayout} onSubmit={submitBooking}>
          <div className={styles.bookingMain}>
            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <span className={styles.stepNumber}>01</span>
                <div>
                  <h2>Plan your trip</h2>
                  <p>Tell us where and when you need a ride.</p>
                </div>
              </div>

              <div className={styles.tripToggle} role="group" aria-label="Trip type">
                <button
                  type="button"
                  className={form.tripType === "one-way" ? styles.tripActive : ""}
                  onClick={() => updateForm("tripType", "one-way")}
                >
                  <span className="material-symbols-outlined">arrow_forward</span>One way
                </button>
                <button
                  type="button"
                  className={form.tripType === "round-trip" ? styles.tripActive : ""}
                  onClick={() => updateForm("tripType", "round-trip")}
                >
                  <span className="material-symbols-outlined">sync_alt</span>Round trip
                </button>
              </div>

              <div className={styles.routeFields}>
                <Field label="Pick-up location" icon="radio_button_checked">
                  <input required maxLength={180} autoComplete="street-address" placeholder="City, address or landmark" value={form.pickupLocation} onChange={(e) => updateForm("pickupLocation", e.target.value)} />
                </Field>
                <span className={styles.routeConnector} aria-hidden="true" />
                <Field label="Drop-off location" icon="location_on">
                  <input required maxLength={180} placeholder="Where are you going?" value={form.dropoffLocation} onChange={(e) => updateForm("dropoffLocation", e.target.value)} />
                </Field>
              </div>

              <div className={styles.formGrid}>
                <Field label="Pick-up date" icon="calendar_month">
                  <input required type="date" min={localDate(1)} value={form.pickupDate} onChange={(e) => updateForm("pickupDate", e.target.value)} />
                </Field>
                <Field label="Pick-up time" icon="schedule">
                  <input required type="time" value={form.pickupTime} onChange={(e) => updateForm("pickupTime", e.target.value)} />
                </Field>
                {form.tripType === "round-trip" && (
                  <>
                    <Field label="Return date" icon="event_repeat">
                      <input required type="date" min={form.pickupDate} value={form.returnDate} onChange={(e) => updateForm("returnDate", e.target.value)} />
                    </Field>
                    <Field label="Return time" icon="schedule">
                      <input required type="time" value={form.returnTime} onChange={(e) => updateForm("returnTime", e.target.value)} />
                    </Field>
                  </>
                )}
                <Field label="Estimated distance (km)" icon="route">
                  <input required type="number" min={1} max={5000} value={form.distanceKm} onChange={(e) => updateForm("distanceKm", Number(e.target.value))} />
                </Field>
                <Field label="Passengers" icon="group">
                  <select value={form.passengers} onChange={(e) => updateForm("passengers", Number(e.target.value))}>
                    {Array.from({ length: 20 }, (_, index) => index + 1).map((count) => <option key={count} value={count}>{count} {count === 1 ? "passenger" : "passengers"}</option>)}
                  </select>
                </Field>
                <Field label="Luggage bags" icon="luggage">
                  <select value={form.luggage} onChange={(e) => updateForm("luggage", Number(e.target.value))}>
                    {Array.from({ length: 11 }, (_, index) => index).map((count) => <option key={count} value={count}>{count} {count === 1 ? "bag" : "bags"}</option>)}
                  </select>
                </Field>
              </div>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <span className={styles.stepNumber}>02</span>
                <div>
                  <h2>Choose your cab</h2>
                  <p>Available vehicles sized for your group.</p>
                </div>
              </div>
              {loadingCabs ? (
                <p className={styles.inlineState}>Finding available vehicles...</p>
              ) : fleetError ? (
                <p className={styles.errorState} role="alert">{fleetError}</p>
              ) : matchingCabs.length === 0 ? (
                <p className={styles.inlineState}>No available vehicles have enough passenger and luggage capacity. Adjust the counts or check back soon.</p>
              ) : (
                <div className={styles.vehicleList}>
                  {matchingCabs.map((cab, index) => (
                    <label key={cab._id} className={`${styles.vehicleOption} ${form.cabId === cab._id ? styles.vehicleSelected : ""}`}>
                      <input type="radio" name="cab" value={cab._id} checked={form.cabId === cab._id} onChange={() => updateForm("cabId", cab._id)} />
                      <span className={styles.vehicleIcon}>
                        <span className="material-symbols-outlined">{index === 0 ? "directions_car" : index === 1 ? "airport_shuttle" : "local_taxi"}</span>
                      </span>
                      <span className={styles.vehicleInfo}>
                        <strong>{cab.model}</strong>
                        <span>{cab.category} <span aria-hidden="true">·</span> {cab.seats} seats <span aria-hidden="true">·</span> {cab.luggageCapacity} bags</span>
                      </span>
                      <span className={styles.vehicleRate}>{inr.format(cab.perKmRate)}<small>/ km</small></span>
                    </label>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <span className={styles.stepNumber}>03</span>
                <div>
                  <h2>Your details</h2>
                  <p>We’ll use these to confirm your booking.</p>
                </div>
              </div>
              <div className={styles.formGrid}>
                <Field label="Full name" icon="person">
                  <input required maxLength={100} autoComplete="name" value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} placeholder="Name on the booking" />
                </Field>
                <Field label="Mobile number" icon="call">
                  <input required type="tel" maxLength={30} autoComplete="tel" value={form.phone} onChange={(e) => updateForm("phone", e.target.value)} placeholder="Include country code" />
                </Field>
                <Field label="Email address" icon="mail">
                  <input required type="email" maxLength={254} autoComplete="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} placeholder="you@example.com" />
                </Field>
                <Field label="Trip notes (optional)" icon="edit_note">
                  <input maxLength={500} value={form.notes} onChange={(e) => updateForm("notes", e.target.value)} placeholder="Child seat, extra stop, accessibility..." />
                </Field>
              </div>
            </section>
          </div>

          <aside className={styles.summary}>
            <div className={styles.summaryTop}>
              <span className="material-symbols-outlined">receipt_long</span>
              <div><h2>Trip estimate</h2><p>Review before sending</p></div>
            </div>
            <div className={styles.summaryRoute}>
              <span className={styles.summaryDot} />
              <p>{form.pickupLocation || "Pick-up location"}</p>
              <span className={styles.summaryLine} />
              <span className={`${styles.summaryDot} ${styles.destinationDot}`} />
              <p>{form.dropoffLocation || "Drop-off location"}</p>
            </div>
            <div className={styles.summaryDetails}>
              <span>Trip</span><strong>{form.tripType === "round-trip" ? "Round trip" : "One way"}</strong>
              <span>Date &amp; time</span><strong>{form.pickupDate} · {form.pickupTime}</strong>
              <span>Distance</span><strong>{form.distanceKm || 0} km{form.tripType === "round-trip" ? " each way" : ""}</strong>
              <span>Vehicle</span><strong>{selectedCab?.model || "Select a cab"}</strong>
              <span>Base + distance</span><strong>{selectedCab ? inr.format(fareSubtotal) : "--"}</strong>
              <span>Government tax ({selectedCab?.taxPercent ?? 0}%)</span><strong>{selectedCab ? inr.format(governmentTax) : "--"}</strong>
            </div>
            <div className={styles.fareRow}>
              <span>Estimated total</span>
              <strong>{selectedCab ? inr.format(estimatedFare) : "--"}</strong>
            </div>
            <p className={styles.fareNote}>Estimate uses the rate set for this vehicle. Final fare is confirmed by our team before your trip.</p>
            {formError && <p className={styles.errorState} role="alert">{formError}</p>}
            <button className={styles.submitButton} type="submit" disabled={submitting || loadingCabs || !selectedCab}>
              {submitting ? "Sending request..." : "Request this cab"}
              <span className="material-symbols-outlined">arrow_forward</span>
            </button>
            <p className={styles.noCharge}>No payment is taken at this step.</p>
          </aside>
        </form>
      </main>
    </>
  );
}

function Field({ label, icon, children }: { label: string; icon: string; children: React.ReactNode }) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldControl}>
        <span className="material-symbols-outlined" aria-hidden="true">{icon}</span>
        {children}
      </span>
    </label>
  );
}
