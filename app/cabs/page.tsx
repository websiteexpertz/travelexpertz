"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Header from "../components/Header";
import styles from "./cabs.module.css";

type Cab = {
  _id: string;
  model: string;
  category: string;
  fuelType: string;
  color: string;
  seats: number;
  luggageCapacity: number;
  baseFare: number;
  perKmRate: number;
  driverAllowance: number;
  taxPercent: number;
  rating: number | null;
  isAvailable: boolean;
};

type BookingForm = {
  tripType: "one-way" | "round-trip" | "airport-transfer";
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

function getCabPricing(cab: Cab, distanceKm: number, tripType: BookingForm["tripType"]) {
  const fareDistanceKm = distanceKm * (tripType === "round-trip" ? 2 : 1);
  const fareSubtotal = Math.round(cab.baseFare + fareDistanceKm * cab.perKmRate + cab.driverAllowance);
  const governmentTax = Math.round(fareSubtotal * cab.taxPercent / 100);
  return { fareDistanceKm, fareSubtotal, governmentTax, total: fareSubtotal + governmentTax };
}

export default function CabsPage() {
  const [cabs, setCabs] = useState<Cab[]>([]);
  const [loadingCabs, setLoadingCabs] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [fleetError, setFleetError] = useState("");
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [fuelTypeFilter, setFuelTypeFilter] = useState("all");
  const [colorFilter, setColorFilter] = useState("all");
  const [modelFilter, setModelFilter] = useState("all");
  const [seatFilter, setSeatFilter] = useState("all");
  const [maxFare, setMaxFare] = useState("");
  const [sortBy, setSortBy] = useState<"price" | "rating" | "duration">("price");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [confirmation, setConfirmation] = useState<{
    bookingReference: string;
    estimatedFare: number;
    message: string;
    pickupLocation: string;
    dropoffLocation: string;
    pickupAt: string;
    vehicleModel: string;
    tripType: BookingForm["tripType"];
  } | null>(null);

  const categories = useMemo(() => [...new Set(cabs.map((cab) => cab.category).filter(Boolean))].sort(), [cabs]);
  const fuelTypes = useMemo(() => [...new Set(cabs.map((cab) => cab.fuelType).filter(Boolean))].sort(), [cabs]);
  const colors = useMemo(() => [...new Set(cabs.map((cab) => cab.color).filter(Boolean))].sort(), [cabs]);
  const carModels = useMemo(() => [...new Set(cabs.map((cab) => cab.model).filter(Boolean))].sort(), [cabs]);

  const matchingCabs = useMemo(() => {
    const fareLimit = maxFare.trim() ? Number(maxFare) : Number.POSITIVE_INFINITY;
    return cabs
      .filter((cab) => {
        const matchesCapacity = cab.seats >= form.passengers && cab.luggageCapacity >= form.luggage;
        const matchesCategory = categoryFilter === "all" || cab.category === categoryFilter;
        const matchesFuelType = fuelTypeFilter === "all" || cab.fuelType.toLocaleLowerCase() === fuelTypeFilter.toLocaleLowerCase();
        const matchesColor = colorFilter === "all" || cab.color.toLocaleLowerCase() === colorFilter.toLocaleLowerCase();
        const matchesModel = modelFilter === "all" || cab.model.toLocaleLowerCase() === modelFilter.toLocaleLowerCase();
        const matchesSeats = seatFilter === "all" || cab.seats >= Number(seatFilter);
        const matchesPrice = getCabPricing(cab, form.distanceKm, form.tripType).total <= fareLimit;
        return matchesCapacity && matchesCategory && matchesFuelType && matchesColor && matchesModel && matchesSeats && matchesPrice;
      })
      .sort((first, second) => {
        if (sortBy === "rating") return (second.rating ?? -1) - (first.rating ?? -1);
        if (sortBy === "duration") return 0;
        return getCabPricing(first, form.distanceKm, form.tripType).total
          - getCabPricing(second, form.distanceKm, form.tripType).total;
      });
  }, [categoryFilter, colorFilter, cabs, form.distanceKm, form.luggage, form.passengers, form.tripType, fuelTypeFilter, maxFare, modelFilter, seatFilter, sortBy]);

  const selectedCab = hasSearched
    ? matchingCabs.find((cab) => cab._id === form.cabId && cab.isAvailable)
    : undefined;
  const selectedPricing = selectedCab ? getCabPricing(selectedCab, form.distanceKm, form.tripType) : null;
  const fareSubtotal = selectedPricing?.fareSubtotal ?? 0;
  const governmentTax = selectedPricing?.governmentTax ?? 0;
  const estimatedFare = selectedPricing?.total ?? 0;

  useEffect(() => {
    if (hasSearched && (!form.cabId || !matchingCabs.some((cab) => cab._id === form.cabId && cab.isAvailable))) {
      setForm((current) => ({ ...current, cabId: matchingCabs[0]?._id || "" }));
    }
  }, [form.cabId, hasSearched, matchingCabs]);

  const updateForm = <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormError("");
    setConfirmation(null);
    if (["tripType", "pickupLocation", "dropoffLocation", "pickupDate", "pickupTime", "returnDate", "returnTime", "passengers", "luggage", "distanceKm"].includes(key)) {
      setHasSearched(false);
    }
  };

  const searchCabs = async () => {
    setFleetError("");
    setFormError("");
    const pickupAt = new Date(`${form.pickupDate}T${form.pickupTime}:00`);
    const maximumDate = new Date();
    maximumDate.setDate(maximumDate.getDate() + 365);
    if (!form.pickupLocation.trim() || !form.dropoffLocation.trim()) {
      setFormError("Enter both pickup and drop-off locations.");
      return;
    }
    if (!Number.isFinite(form.distanceKm) || form.distanceKm < 1 || form.distanceKm > 5000) {
      setFormError("Enter a trip distance between 1 and 5,000 km.");
      return;
    }
    if (Number.isNaN(pickupAt.getTime()) || pickupAt <= new Date() || pickupAt > maximumDate) {
      setFormError("Choose a future pickup time within the next year.");
      return;
    }

    let serviceEndAt = new Date(pickupAt.getTime() + Math.max(2, form.distanceKm / 35) * 60 * 60 * 1000);
    if (form.tripType === "round-trip") {
      serviceEndAt = new Date(`${form.returnDate}T${form.returnTime}:00`);
      if (Number.isNaN(serviceEndAt.getTime()) || serviceEndAt <= pickupAt || serviceEndAt > maximumDate) {
        setFormError("Choose a return time after pickup and within the next year.");
        return;
      }
    }

    setLoadingCabs(true);
    setHasSearched(false);
    try {
      const query = new URLSearchParams({
        startAt: pickupAt.toISOString(),
        endAt: serviceEndAt.toISOString(),
      });
      const response = await fetch(`/api/cabs?${query}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not load vehicles.");
      setCabs(Array.isArray(data) ? data : []);
      setHasSearched(true);
    } catch (error) {
      setFleetError(error instanceof Error ? error.message : "Could not load vehicles.");
    } finally {
      setLoadingCabs(false);
    }
  };

  const submitBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasSearched || !selectedCab) {
      setFormError("Search for an available cab and select it before requesting your ride.");
      return;
    }
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
      setConfirmation({
        ...data,
        pickupLocation: form.pickupLocation,
        dropoffLocation: form.dropoffLocation,
        pickupAt: `${form.pickupDate} · ${form.pickupTime}`,
        vehicleModel: selectedCab.model,
        tripType: form.tripType,
      });
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
          <h1>Your request is on its way.</h1>
          <p className={styles.confirmationCopy}>{confirmation.message}</p>
          <div className={styles.referenceRow}>
            <span>Confirmation status</span>
            <strong>Pending confirmation</strong>
          </div>
          <div className={styles.referenceRow}>
            <span>Booking reference</span>
            <strong>{confirmation.bookingReference}</strong>
          </div>
          <div className={styles.referenceRow}>
            <span>Journey</span>
            <strong>{confirmation.pickupLocation} to {confirmation.dropoffLocation}</strong>
          </div>
          <div className={styles.referenceRow}>
            <span>Pick-up</span>
            <strong>{confirmation.pickupAt}</strong>
          </div>
          <div className={styles.referenceRow}>
            <span>Vehicle</span>
            <strong>{confirmation.vehicleModel}</strong>
          </div>
          <div className={styles.referenceRow}>
            <span>Estimated fare</span>
            <strong>{inr.format(confirmation.estimatedFare)}</strong>
          </div>
          <Link className={styles.manageBookingsLink} href="/user/cab-bookings">View or manage your cab bookings</Link>
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
            <Link className={styles.manageBookingsLink} href="/user/cab-bookings">Manage my cab bookings</Link>
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
                <button
                  type="button"
                  className={form.tripType === "airport-transfer" ? styles.tripActive : ""}
                  onClick={() => updateForm("tripType", "airport-transfer")}
                >
                  <span className="material-symbols-outlined">flight</span>Airport transfer
                </button>
              </div>

              <div className={styles.routeFields}>
                <Field label={form.tripType === "airport-transfer" ? "Pick-up / airport location" : "Pick-up location"} icon="radio_button_checked">
                  <input required maxLength={180} autoComplete="street-address" placeholder={form.tripType === "airport-transfer" ? "Airport, city or terminal" : "City, address or landmark"} value={form.pickupLocation} onChange={(e) => updateForm("pickupLocation", e.target.value)} />
                </Field>
                <span className={styles.routeConnector} aria-hidden="true" />
                <Field label={form.tripType === "airport-transfer" ? "Drop-off / airport location" : "Drop-off location"} icon="location_on">
                  <input required maxLength={180} placeholder={form.tripType === "airport-transfer" ? "Airport, city or terminal" : "Where are you going?"} value={form.dropoffLocation} onChange={(e) => updateForm("dropoffLocation", e.target.value)} />
                </Field>
              </div>

              <div className={styles.formGrid}>
                <Field label="Pick-up date" icon="calendar_month">
                  <input required type="date" min={localDate()} max={localDate(365)} value={form.pickupDate} onChange={(e) => updateForm("pickupDate", e.target.value)} />
                </Field>
                <Field label="Pick-up time" icon="schedule">
                  <input required type="time" value={form.pickupTime} onChange={(e) => updateForm("pickupTime", e.target.value)} />
                </Field>
                {form.tripType === "round-trip" && (
                  <>
                    <Field label="Return date" icon="event_repeat">
                      <input required type="date" min={form.pickupDate} max={localDate(365)} value={form.returnDate} onChange={(e) => updateForm("returnDate", e.target.value)} />
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
              <p className={styles.distanceHelp}>Enter the approximate road distance. Travel time is estimated at an average of 35 km/h.</p>
              {formError && <p className={styles.errorState} role="alert">{formError}</p>}
              <button className={styles.searchButton} type="button" onClick={() => void searchCabs()} disabled={loadingCabs}>
                <span className="material-symbols-outlined" aria-hidden="true">search</span>
                {loadingCabs ? "Checking availability..." : "Search available cabs"}
              </button>
            </section>

            <section className={styles.section}>
              <div className={styles.sectionHeading}>
                <span className={styles.stepNumber}>02</span>
                <div>
                  <h2>Choose your cab</h2>
                  <p>Compare estimates for vehicles that fit your group.</p>
                </div>
              </div>
              {hasSearched && (
                <>
                <div className={styles.resultTools} aria-label="Cab filters and sorting">
                  <label className={styles.filterField}>Car type
                    <select value={categoryFilter} onChange={(event) => setCategoryFilter(event.target.value)}>
                      <option value="all">All car types</option>
                      {categories.map((category) => <option key={category} value={category}>{category}</option>)}
                    </select>
                  </label>
                  <label className={styles.filterField}>Fuel type
                    <select value={fuelTypeFilter} onChange={(event) => setFuelTypeFilter(event.target.value)}>
                      <option value="all">All fuel types</option>
                      {fuelTypes.map((fuelType) => <option key={fuelType} value={fuelType}>{fuelType}</option>)}
                    </select>
                  </label>
                  <label className={styles.filterField}>Car color
                    <select value={colorFilter} onChange={(event) => setColorFilter(event.target.value)}>
                      <option value="all">All colors</option>
                      {colors.map((color) => <option key={color} value={color}>{color}</option>)}
                    </select>
                  </label>
                  <label className={styles.filterField}>Car model
                    <select value={modelFilter} onChange={(event) => setModelFilter(event.target.value)}>
                      <option value="all">All models</option>
                      {carModels.map((model) => <option key={model} value={model}>{model}</option>)}
                    </select>
                  </label>
                  <label className={styles.filterField}>Minimum seats
                    <select value={seatFilter} onChange={(event) => setSeatFilter(event.target.value)}>
                      <option value="all">Any capacity</option>
                      <option value="4">4+ seats</option>
                      <option value="6">6+ seats</option>
                      <option value="8">8+ seats</option>
                    </select>
                  </label>
                  <label className={styles.filterField}>Maximum total fare
                    <input type="number" min={0} placeholder="No limit" value={maxFare} onChange={(event) => setMaxFare(event.target.value)} />
                  </label>
                  <label className={styles.filterField}>Sort by
                    <select value={sortBy} onChange={(event) => setSortBy(event.target.value as typeof sortBy)}>
                      <option value="price">Lowest fare</option>
                      <option value="rating">Highest rating</option>
                      <option value="duration">Estimated travel time</option>
                    </select>
                  </label>
                </div>
                {sortBy === "duration" && <p className={styles.distanceHelp}>Travel time is route-estimated, so vehicles share the same time estimate for this journey.</p>}
                </>
              )}
              {loadingCabs ? (
                <p className={styles.inlineState}>Finding available vehicles...</p>
              ) : fleetError ? (
                <p className={styles.errorState} role="alert">{fleetError}</p>
              ) : !hasSearched ? (
                <p className={styles.inlineState}>Enter your journey details, then search to see vehicles available for your pickup time.</p>
              ) : matchingCabs.length === 0 ? (
                <p className={styles.inlineState}>No vehicles match this journey and your filters. Adjust your filters or try another pickup time.</p>
              ) : (
                <div className={styles.vehicleList}>
                  {matchingCabs.map((cab) => {
                    const pricing = getCabPricing(cab, form.distanceKm, form.tripType);
                    const durationHours = Math.ceil(form.distanceKm / 35) * (form.tripType === "round-trip" ? 2 : 1);
                    return (
                      <article key={cab._id} className={`${styles.vehicleCard} ${form.cabId === cab._id ? styles.vehicleSelected : ""} ${!cab.isAvailable ? styles.vehicleUnavailable : ""}`}>
                        <div className={styles.vehicleImage}>
                          <Image src="/cab.png" alt={`${cab.category} ${cab.model}`} fill sizes="(max-width: 760px) 100vw, 240px" />
                        </div>
                        <div className={styles.vehicleCardBody}>
                          <div className={styles.vehicleCardTop}>
                            <div>
                              <p className={styles.vehicleCategory}>{cab.category}</p>
                              <h3>{cab.model}</h3>
                            </div>
                            <span className={cab.isAvailable ? styles.availableBadge : styles.unavailableBadge}>
                              {cab.isAvailable ? "Available" : "Unavailable"}
                            </span>
                          </div>
                          <div className={styles.vehicleSpecs}>
                            <span><span className="material-symbols-outlined">local_gas_station</span>{cab.fuelType || "Fuel not specified"}</span>
                            <span><span className="material-symbols-outlined">palette</span>{cab.color || "Color not specified"}</span>
                            <span><span className="material-symbols-outlined">category</span>{cab.category}</span>
                            <span><span className="material-symbols-outlined">group</span>{cab.seats} seats</span>
                            <span><span className="material-symbols-outlined">luggage</span>{cab.luggageCapacity} bags</span>
                            <span><span className="material-symbols-outlined">route</span>{form.distanceKm} km</span>
                            <span><span className="material-symbols-outlined">schedule</span>~{durationHours} hr{durationHours === 1 ? "" : "s"}</span>
                            <span><span className="material-symbols-outlined">star</span>{cab.rating ? `${cab.rating.toFixed(1)} rating` : "Not rated"}</span>
                          </div>
                          <div className={styles.vehicleFareDetails}>
                            <span>Base fare <strong>{inr.format(cab.baseFare)}</strong></span>
                            <span>Distance <strong>{inr.format(pricing.fareDistanceKm * cab.perKmRate)}</strong></span>
                            <span>Driver allowance <strong>{inr.format(cab.driverAllowance)}</strong></span>
                            <span>Taxes ({cab.taxPercent}%) <strong>{inr.format(pricing.governmentTax)}</strong></span>
                          </div>
                          <div className={styles.vehicleCardFooter}>
                            <p>Estimated total<strong>{inr.format(pricing.total)}</strong></p>
                            <button type="button" disabled={!cab.isAvailable} onClick={() => updateForm("cabId", cab._id)}>
                              {!cab.isAvailable ? "Not available" : form.cabId === cab._id ? "Selected" : "Select cab"}
                            </button>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {selectedCab && <section className={styles.section}>
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
            </section>}
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
              <span>Trip</span><strong>{form.tripType === "round-trip" ? "Round trip" : form.tripType === "airport-transfer" ? "Airport transfer" : "One way"}</strong>
              <span>Date &amp; time</span><strong>{form.pickupDate} · {form.pickupTime}</strong>
              <span>Distance</span><strong>{form.distanceKm || 0} km{form.tripType === "round-trip" ? " each way" : ""}</strong>
              <span>Vehicle</span><strong>{selectedCab?.model || "Select a cab"}</strong>
              <span>Base + distance + driver</span><strong>{selectedCab ? inr.format(fareSubtotal) : "--"}</strong>
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
