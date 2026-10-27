"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowRight,
  RotateCcw,
  SlidersHorizontal,
} from "lucide-react";
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

function getCabPricing(
  cab: Cab,
  distanceKm: number,
  tripType: BookingForm["tripType"],
) {
  const fareDistanceKm = distanceKm * (tripType === "round-trip" ? 2 : 1);
  const fareSubtotal = Math.round(
    cab.baseFare + fareDistanceKm * cab.perKmRate + cab.driverAllowance,
  );
  const governmentTax = Math.round((fareSubtotal * cab.taxPercent) / 100);
  return {
    fareDistanceKm,
    fareSubtotal,
    governmentTax,
    total: fareSubtotal + governmentTax,
  };
}

function toggleFilterValue(current: string[], value: string) {
  return current.includes(value)
    ? current.filter((item) => item !== value)
    : [...current, value];
}

export default function CabsPage() {
  const [cabs, setCabs] = useState<Cab[]>([]);
  const [loadingCabs, setLoadingCabs] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [fleetError, setFleetError] = useState("");
  const [form, setForm] = useState<BookingForm>(initialForm);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [fuelTypeFilter, setFuelTypeFilter] = useState<string[]>([]);
  const [modelFilter, setModelFilter] = useState<string[]>([]);
  const [seatFilter, setSeatFilter] = useState("all");
  const [maxFare, setMaxFare] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<"price" | "rating" | "duration">(
    "price",
  );
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

  const categories = useMemo(
    () => [...new Set(cabs.map((cab) => cab.category).filter(Boolean))].sort(),
    [cabs],
  );
  const fuelTypes = useMemo(
    () => [...new Set(cabs.map((cab) => cab.fuelType).filter(Boolean))].sort(),
    [cabs],
  );
  const carModels = useMemo(
    () => [...new Set(cabs.map((cab) => cab.model).filter(Boolean))].sort(),
    [cabs],
  );
  const fareRange = useMemo(() => {
    const fares = cabs.map(
      (cab) => getCabPricing(cab, form.distanceKm, form.tripType).total,
    );
    return {
      min: fares.length ? Math.min(...fares) : 0,
      max: fares.length ? Math.max(...fares) : 10000,
    };
  }, [cabs, form.distanceKm, form.tripType]);
  const selectedMaxFare = maxFare
    ? Math.min(Number(maxFare), fareRange.max)
    : fareRange.max;
  const activeFilterCount = [
    categoryFilter.length,
    fuelTypeFilter.length,
    modelFilter.length,
    seatFilter !== "all" ? 1 : 0,
    maxFare && Number(maxFare) < fareRange.max ? 1 : 0,
  ].reduce((total, count) => total + count, 0);

  const matchingCabs = useMemo(() => {
    const fareLimit = maxFare.trim()
      ? Number(maxFare)
      : Number.POSITIVE_INFINITY;
    return cabs
      .filter((cab) => {
        const matchesCapacity =
          cab.seats >= form.passengers && cab.luggageCapacity >= form.luggage;
        const matchesCategory =
          categoryFilter.length === 0 || categoryFilter.includes(cab.category);
        const matchesFuelType =
          fuelTypeFilter.length === 0 ||
          fuelTypeFilter.some(
            (fuelType) =>
              cab.fuelType.toLocaleLowerCase() === fuelType.toLocaleLowerCase(),
          );
        const matchesModel =
          modelFilter.length === 0 || modelFilter.includes(cab.model);
        const matchesSeats =
          seatFilter === "all" || cab.seats >= Number(seatFilter);
        const matchesPrice =
          getCabPricing(cab, form.distanceKm, form.tripType).total <= fareLimit;
        return (
          matchesCapacity &&
          matchesCategory &&
          matchesFuelType &&
          matchesModel &&
          matchesSeats &&
          matchesPrice
        );
      })
      .sort((first, second) => {
        if (sortBy === "rating")
          return (second.rating ?? -1) - (first.rating ?? -1);
        if (sortBy === "duration") return 0;
        return (
          getCabPricing(first, form.distanceKm, form.tripType).total -
          getCabPricing(second, form.distanceKm, form.tripType).total
        );
      });
  }, [
    categoryFilter,
    cabs,
    form.distanceKm,
    form.luggage,
    form.passengers,
    form.tripType,
    fuelTypeFilter,
    maxFare,
    modelFilter,
    seatFilter,
    sortBy,
  ]);

  const selectedCab = hasSearched
    ? matchingCabs.find((cab) => cab._id === form.cabId && cab.isAvailable)
    : undefined;
  const selectedPricing = selectedCab
    ? getCabPricing(selectedCab, form.distanceKm, form.tripType)
    : null;
  const fareSubtotal = selectedPricing?.fareSubtotal ?? 0;
  const governmentTax = selectedPricing?.governmentTax ?? 0;
  const estimatedFare = selectedPricing?.total ?? 0;

  useEffect(() => {
    if (
      hasSearched &&
      (!form.cabId ||
        !matchingCabs.some((cab) => cab._id === form.cabId && cab.isAvailable))
    ) {
      setForm((current) => ({ ...current, cabId: matchingCabs[0]?._id || "" }));
    }
  }, [form.cabId, hasSearched, matchingCabs]);

  const updateForm = <K extends keyof BookingForm>(
    key: K,
    value: BookingForm[K],
  ) => {
    setForm((current) => ({ ...current, [key]: value }));
    setFormError("");
    setConfirmation(null);
    if (
      [
        "tripType",
        "pickupLocation",
        "dropoffLocation",
        "pickupDate",
        "pickupTime",
        "returnDate",
        "returnTime",
        "passengers",
        "luggage",
        "distanceKm",
      ].includes(key)
    ) {
      setHasSearched(false);
    }
  };

  const swapRoute = () => {
    setForm((current) => ({
      ...current,
      pickupLocation: current.dropoffLocation,
      dropoffLocation: current.pickupLocation,
      cabId: "",
    }));
    setHasSearched(false);
    setFormError("");
    setConfirmation(null);
  };

  const resetCabFilters = () => {
    setCategoryFilter([]);
    setFuelTypeFilter([]);
    setModelFilter([]);
    setSeatFilter("all");
    setMaxFare("");
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
    if (
      !Number.isFinite(form.distanceKm) ||
      form.distanceKm < 1 ||
      form.distanceKm > 5000
    ) {
      setFormError("Enter a trip distance between 1 and 5,000 km.");
      return;
    }
    if (
      Number.isNaN(pickupAt.getTime()) ||
      pickupAt <= new Date() ||
      pickupAt > maximumDate
    ) {
      setFormError("Choose a future pickup time within the next year.");
      return;
    }

    let serviceEndAt = new Date(
      pickupAt.getTime() + Math.max(2, form.distanceKm / 35) * 60 * 60 * 1000,
    );
    if (form.tripType === "round-trip") {
      serviceEndAt = new Date(`${form.returnDate}T${form.returnTime}:00`);
      if (
        Number.isNaN(serviceEndAt.getTime()) ||
        serviceEndAt <= pickupAt ||
        serviceEndAt > maximumDate
      ) {
        setFormError(
          "Choose a return time after pickup and within the next year.",
        );
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
      if (!response.ok)
        throw new Error(data.error || "Could not load vehicles.");
      setCabs(Array.isArray(data) ? data : []);
      setHasSearched(true);
    } catch (error) {
      setFleetError(
        error instanceof Error ? error.message : "Could not load vehicles.",
      );
    } finally {
      setLoadingCabs(false);
    }
  };

  const submitBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasSearched || !selectedCab) {
      setFormError(
        "Search for an available cab and select it before requesting your ride.",
      );
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
      if (!response.ok)
        throw new Error(data.error || "Could not submit your request.");
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
      setFormError(
        error instanceof Error
          ? error.message
          : "Could not submit your request.",
      );
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
            <strong>
              {confirmation.pickupLocation} to {confirmation.dropoffLocation}
            </strong>
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
          <Link className={styles.manageBookingsLink} href="/user/cab-bookings">
            View or manage your cab bookings
          </Link>
          <button
            className={styles.secondaryButton}
            onClick={() => setConfirmation(null)}
          >
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
            <p className={styles.eyebrow}>
              <span /> Your journey, your way
            </p>
            <h1>
              Good journeys
              <br />
              start <em>here.</em>
            </h1>
            <p>
              From a quick airport run to the long road out of town, find the
              right ride for the way you travel.
            </p>
            <div className={styles.trustLine}>
              <span>
                <span className="material-symbols-outlined">verified_user</span>
                Transparent pricing
              </span>
              <span>
                <span className="material-symbols-outlined">support_agent</span>
                Real trip support
              </span>
            </div>
            <div className={styles.heroActions}>
              <a className={styles.heroButton} href="#trip-planner">
                Plan your ride <ArrowRight size={17} aria-hidden="true" />
              </a>
              <Link
                className={styles.manageBookingsLink}
                href="/user/cab-bookings"
              >
                Manage bookings
              </Link>
            </div>
          </div>
          <div className={styles.heroImage}>
            <Image
              src="/cab.png"
              alt="City cab ready for your journey"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 50vw"
            />
            <div className={styles.imageCaption}>
              <span className="material-symbols-outlined" aria-hidden="true">
                route
              </span>
              <div>
                <strong>Made for the miles ahead</strong>
                <small>One-way, return &amp; airport rides</small>
              </div>
            </div>
          </div>
        </section>

        <section
          className={styles.benefitBar}
          aria-label="Why book with TravelExpertz"
        >
          <div className={styles.benefitItem}>
            <span className="material-symbols-outlined" aria-hidden="true">
              payments
            </span>
            <div>
              <strong>Upfront estimates</strong>
              <small>Know the fare before you go</small>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <span className="material-symbols-outlined" aria-hidden="true">
              directions_car
            </span>
            <div>
              <strong>Rides for every route</strong>
              <small>City trips, airport &amp; beyond</small>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <span className="material-symbols-outlined" aria-hidden="true">
              support_agent
            </span>
            <div>
              <strong>Here when you need us</strong>
              <small>Personal booking assistance</small>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <span className="material-symbols-outlined" aria-hidden="true">
              event_available
            </span>
            <div>
              <strong>Plan ahead with ease</strong>
              <small>Schedule up to a year ahead</small>
            </div>
          </div>
        </section>

        <form className={styles.bookingLayout} onSubmit={submitBooking}>
          <div className={styles.bookingMain}>
            <section
              className={`${styles.section} ${styles.tripSection}`}
              id="trip-planner"
            >
              <div className={styles.sectionHeading}>
                <span className={styles.stepNumber}>01</span>
                <div>
                  <h2>Where are you headed?</h2>
                  <p>
                    Set the route and we’ll find vehicles available for your
                    pickup.
                  </p>
                </div>
              </div>

              <div
                className={styles.tripToggle}
                role="group"
                aria-label="Trip type"
              >
                <button
                  type="button"
                  className={
                    form.tripType === "one-way" ? styles.tripActive : ""
                  }
                  onClick={() => updateForm("tripType", "one-way")}
                >
                  <span className="material-symbols-outlined">
                    arrow_forward
                  </span>
                  One way
                </button>
                <button
                  type="button"
                  className={
                    form.tripType === "round-trip" ? styles.tripActive : ""
                  }
                  onClick={() => updateForm("tripType", "round-trip")}
                >
                  <span className="material-symbols-outlined">sync_alt</span>
                  Round trip
                </button>
                <button
                  type="button"
                  className={
                    form.tripType === "airport-transfer"
                      ? styles.tripActive
                      : ""
                  }
                  onClick={() => updateForm("tripType", "airport-transfer")}
                >
                  <span className="material-symbols-outlined">flight</span>
                  Airport transfer
                </button>
              </div>

              <div className={styles.routeFields}>
                <Field
                  label={
                    form.tripType === "airport-transfer"
                      ? "Pick-up / airport location"
                      : "Pick-up location"
                  }
                  icon="radio_button_checked"
                >
                  <input
                    required
                    maxLength={180}
                    autoComplete="street-address"
                    placeholder={
                      form.tripType === "airport-transfer"
                        ? "Airport, city or terminal"
                        : "City, address or landmark"
                    }
                    value={form.pickupLocation}
                    onChange={(e) =>
                      updateForm("pickupLocation", e.target.value)
                    }
                  />
                </Field>
                <span className={styles.routeConnector} aria-hidden="true" />
                <Field
                  label={
                    form.tripType === "airport-transfer"
                      ? "Drop-off / airport location"
                      : "Drop-off location"
                  }
                  icon="location_on"
                >
                  <input
                    required
                    maxLength={180}
                    placeholder={
                      form.tripType === "airport-transfer"
                        ? "Airport, city or terminal"
                        : "Where are you going?"
                    }
                    value={form.dropoffLocation}
                    onChange={(e) =>
                      updateForm("dropoffLocation", e.target.value)
                    }
                  />
                </Field>
                <button
                  className={styles.swapRoute}
                  type="button"
                  onClick={swapRoute}
                  aria-label="Swap pickup and drop-off locations"
                  title="Swap locations"
                >
                  <ArrowLeftRight size={17} aria-hidden="true" />
                </button>
              </div>

              <div className={styles.formGrid}>
                <Field label="Pick-up date" icon="calendar_month">
                  <input
                    required
                    type="date"
                    min={localDate()}
                    max={localDate(365)}
                    value={form.pickupDate}
                    onChange={(e) => updateForm("pickupDate", e.target.value)}
                  />
                </Field>
                <Field label="Pick-up time" icon="schedule">
                  <input
                    required
                    type="time"
                    value={form.pickupTime}
                    onChange={(e) => updateForm("pickupTime", e.target.value)}
                  />
                </Field>
                {form.tripType === "round-trip" && (
                  <>
                    <Field label="Return date" icon="event_repeat">
                      <input
                        required
                        type="date"
                        min={form.pickupDate}
                        max={localDate(365)}
                        value={form.returnDate}
                        onChange={(e) =>
                          updateForm("returnDate", e.target.value)
                        }
                      />
                    </Field>
                    <Field label="Return time" icon="schedule">
                      <input
                        required
                        type="time"
                        value={form.returnTime}
                        onChange={(e) =>
                          updateForm("returnTime", e.target.value)
                        }
                      />
                    </Field>
                  </>
                )}
                <Field label="Estimated distance (km)" icon="route">
                  <input
                    required
                    type="number"
                    min={1}
                    max={5000}
                    value={form.distanceKm}
                    onChange={(e) =>
                      updateForm("distanceKm", Number(e.target.value))
                    }
                  />
                </Field>
                <Field label="Passengers" icon="group">
                  <select
                    value={form.passengers}
                    onChange={(e) =>
                      updateForm("passengers", Number(e.target.value))
                    }
                  >
                    {Array.from({ length: 20 }, (_, index) => index + 1).map(
                      (count) => (
                        <option key={count} value={count}>
                          {count} {count === 1 ? "passenger" : "passengers"}
                        </option>
                      ),
                    )}
                  </select>
                </Field>
                <Field label="Luggage bags" icon="luggage">
                  <select
                    value={form.luggage}
                    onChange={(e) =>
                      updateForm("luggage", Number(e.target.value))
                    }
                  >
                    {Array.from({ length: 11 }, (_, index) => index).map(
                      (count) => (
                        <option key={count} value={count}>
                          {count} {count === 1 ? "bag" : "bags"}
                        </option>
                      ),
                    )}
                  </select>
                </Field>
              </div>
              <p className={styles.distanceHelp}>
                Enter the approximate road distance. Travel time is estimated at
                an average of 35 km/h.
              </p>
              {formError && (
                <p className={styles.errorState} role="alert">
                  {formError}
                </p>
              )}
              <button
                className={styles.searchButton}
                type="button"
                onClick={() => void searchCabs()}
                disabled={loadingCabs}
              >
                <span className="material-symbols-outlined" aria-hidden="true">
                  search
                </span>
                {loadingCabs
                  ? "Checking availability..."
                  : "Search available cabs"}
                {!loadingCabs && <ArrowRight size={17} aria-hidden="true" />}
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
                  <div className={styles.resultsHeader} aria-live="polite">
                    <div>
                      <p className={styles.resultsEyebrow}>Your options</p>
                      <h3>
                        {matchingCabs.length}{" "}
                        {matchingCabs.length === 1 ? "ride" : "rides"}
                        <span>
                          {" "}
                          ·{" "}
                          {
                            matchingCabs.filter((cab) => cab.isAvailable).length
                          }{" "}
                          available
                        </span>
                      </h3>
                    </div>
                    <button
                      className={styles.advancedToggle}
                      type="button"
                      onClick={() =>
                        setShowAdvancedFilters((current) => !current)
                      }
                      aria-expanded={showAdvancedFilters}
                    >
                      <SlidersHorizontal size={16} aria-hidden="true" />
                      Filters
                      {activeFilterCount > 0 && (
                        <span className={styles.filterCount}>
                          {activeFilterCount}
                        </span>
                      )}
                    </button>
                  </div>
                  <div
                    className={`${styles.resultsLayout} ${showAdvancedFilters ? styles.filtersOpen : ""}`}
                  >
                    <aside
                      className={styles.filterPanel}
                      aria-label="Filter available cabs"
                    >
                      <div className={styles.filterPanelHeader}>
                        <h3>Filter by</h3>
                        {activeFilterCount > 0 && (
                          <button
                            className={styles.resetFilters}
                            type="button"
                            onClick={resetCabFilters}
                          >
                            <RotateCcw size={13} aria-hidden="true" /> Clear all
                          </button>
                        )}
                      </div>
                      <div className={styles.filterGroup}>
                        <h4>Vehicle type</h4>
                        {categories.map((category) => (
                          <label className={styles.filterOption} key={category}>
                            <input
                              type="checkbox"
                              checked={categoryFilter.includes(category)}
                              onChange={() =>
                                setCategoryFilter((current) =>
                                  toggleFilterValue(current, category),
                                )
                              }
                            />
                            <span>{category}</span>
                            <small>
                              {
                                cabs.filter((cab) => cab.category === category)
                                  .length
                              }
                            </small>
                          </label>
                        ))}
                      </div>
                      <div className={styles.filterGroup}>
                        <h4>Fuel type</h4>
                        {fuelTypes.map((fuelType) => (
                          <label className={styles.filterOption} key={fuelType}>
                            <input
                              type="checkbox"
                              checked={fuelTypeFilter.includes(fuelType)}
                              onChange={() =>
                                setFuelTypeFilter((current) =>
                                  toggleFilterValue(current, fuelType),
                                )
                              }
                            />
                            <span>{fuelType}</span>
                            <small>
                              {
                                cabs.filter((cab) => cab.fuelType === fuelType)
                                  .length
                              }
                            </small>
                          </label>
                        ))}
                      </div>
                      <div className={styles.filterGroup}>
                        <h4>Car model</h4>
                        {carModels.map((model) => (
                          <label className={styles.filterOption} key={model}>
                            <input
                              type="checkbox"
                              checked={modelFilter.includes(model)}
                              onChange={() =>
                                setModelFilter((current) =>
                                  toggleFilterValue(current, model),
                                )
                              }
                            />
                            <span>{model}</span>
                            <small>
                              {cabs.filter((cab) => cab.model === model).length}
                            </small>
                          </label>
                        ))}
                      </div>
                      <div className={styles.filterGroup}>
                        <h4>Minimum seats</h4>
                        <label className={styles.filterField}>
                          Passenger capacity
                          <select
                            value={seatFilter}
                            onChange={(event) =>
                              setSeatFilter(event.target.value)
                            }
                          >
                            <option value="all">Any capacity</option>
                            <option value="4">4+ seats</option>
                            <option value="6">6+ seats</option>
                            <option value="8">8+ seats</option>
                          </select>
                        </label>
                      </div>
                      <div className={styles.filterGroup}>
                        <div className={styles.priceFilterHeading}>
                          <h4>Maximum fare</h4>
                          <strong>{inr.format(selectedMaxFare)}</strong>
                        </div>
                        <input
                          className={styles.priceRange}
                          aria-label="Maximum total fare"
                          type="range"
                          min={fareRange.min}
                          max={fareRange.max}
                          step="1"
                          value={selectedMaxFare}
                          onChange={(event) => setMaxFare(event.target.value)}
                        />
                        <div className={styles.priceRangeLabels}>
                          <span>{inr.format(fareRange.min)}</span>
                          <span>{inr.format(fareRange.max)}</span>
                        </div>
                      </div>
                    </aside>
                    <div className={styles.resultsList}>
                      <div
                        className={styles.sortBar}
                        aria-label="Sort cab results"
                      >
                        <span>Sort by</span>
                        <button
                          type="button"
                          className={
                            sortBy === "price" ? styles.sortActive : ""
                          }
                          aria-pressed={sortBy === "price"}
                          onClick={() => setSortBy("price")}
                        >
                          Lowest fare
                        </button>
                        <button
                          type="button"
                          className={
                            sortBy === "rating" ? styles.sortActive : ""
                          }
                          aria-pressed={sortBy === "rating"}
                          onClick={() => setSortBy("rating")}
                        >
                          Top rated
                        </button>
                        <button
                          type="button"
                          className={
                            sortBy === "duration" ? styles.sortActive : ""
                          }
                          aria-pressed={sortBy === "duration"}
                          onClick={() => setSortBy("duration")}
                        >
                          Travel time
                        </button>
                      </div>
                      {sortBy === "duration" && (
                        <p className={styles.distanceHelp}>
                          Travel time is route-estimated, so vehicles share the
                          same time estimate for this journey.
                        </p>
                      )}
                      {matchingCabs.length === 0 ? (
                        <p className={styles.inlineState}>
                          No vehicles match this journey and your filters.
                          Adjust your filters or try another pickup time.
                        </p>
                      ) : (
                        <div className={styles.vehicleList}>
                          {matchingCabs.map((cab, index) => {
                            const pricing = getCabPricing(
                              cab,
                              form.distanceKm,
                              form.tripType,
                            );
                            const durationHours =
                              Math.ceil(form.distanceKm / 35) *
                              (form.tripType === "round-trip" ? 2 : 1);
                            return (
                              <article
                                key={cab._id}
                                className={`${styles.vehicleCard} ${form.cabId === cab._id ? styles.vehicleSelected : ""} ${!cab.isAvailable ? styles.vehicleUnavailable : ""}`}
                              >
                                <div className={styles.vehicleImage}>
                                  <Image
                                    src="/cab.png"
                                    alt={`${cab.category} ${cab.model}`}
                                    fill
                                    sizes="(max-width: 760px) 100vw, 240px"
                                  />
                                </div>
                                <div className={styles.vehicleCardBody}>
                                  <div className={styles.vehicleCardTop}>
                                    <div>
                                      <p className={styles.vehicleCategory}>
                                        {cab.category}
                                      </p>
                                      <h3>{cab.model}</h3>
                                    </div>
                                    <div className={styles.vehicleBadges}>
                                      {index === 0 && cab.isAvailable && (
                                        <span className={styles.matchBadge}>
                                          {sortBy === "rating"
                                            ? "Top rated"
                                            : "Lowest estimate"}
                                        </span>
                                      )}
                                      <span
                                        className={
                                          cab.isAvailable
                                            ? styles.availableBadge
                                            : styles.unavailableBadge
                                        }
                                      >
                                        {cab.isAvailable
                                          ? "Available"
                                          : "Unavailable"}
                                      </span>
                                    </div>
                                  </div>
                                  <div className={styles.vehicleSpecs}>
                                    <span>
                                      <span className="material-symbols-outlined">
                                        local_gas_station
                                      </span>
                                      {cab.fuelType || "Fuel not specified"}
                                    </span>
                                    <span>
                                      <span className="material-symbols-outlined">
                                        palette
                                      </span>
                                      {cab.color || "Color not specified"}
                                    </span>
                                    <span>
                                      <span className="material-symbols-outlined">
                                        category
                                      </span>
                                      {cab.category}
                                    </span>
                                    <span>
                                      <span className="material-symbols-outlined">
                                        group
                                      </span>
                                      {cab.seats} seats
                                    </span>
                                    <span>
                                      <span className="material-symbols-outlined">
                                        luggage
                                      </span>
                                      {cab.luggageCapacity} bags
                                    </span>
                                    <span>
                                      <span className="material-symbols-outlined">
                                        route
                                      </span>
                                      {form.distanceKm} km
                                    </span>
                                    <span>
                                      <span className="material-symbols-outlined">
                                        schedule
                                      </span>
                                      ~{durationHours} hr
                                      {durationHours === 1 ? "" : "s"}
                                    </span>
                                    <span>
                                      <span className="material-symbols-outlined">
                                        star
                                      </span>
                                      {cab.rating
                                        ? `${cab.rating.toFixed(1)} rating`
                                        : "Not rated"}
                                    </span>
                                  </div>
                                  <div className={styles.vehicleFareDetails}>
                                    <span>
                                      Base fare{" "}
                                      <strong>
                                        {inr.format(cab.baseFare)}
                                      </strong>
                                    </span>
                                    <span>
                                      Distance{" "}
                                      <strong>
                                        {inr.format(
                                          pricing.fareDistanceKm *
                                            cab.perKmRate,
                                        )}
                                      </strong>
                                    </span>
                                    <span>
                                      Driver allowance{" "}
                                      <strong>
                                        {inr.format(cab.driverAllowance)}
                                      </strong>
                                    </span>
                                    <span>
                                      Taxes ({cab.taxPercent}%){" "}
                                      <strong>
                                        {inr.format(pricing.governmentTax)}
                                      </strong>
                                    </span>
                                  </div>
                                  <div className={styles.vehicleCardFooter}>
                                    <p>
                                      Estimated total
                                      <strong>
                                        {inr.format(pricing.total)}
                                      </strong>
                                    </p>
                                    <button
                                      type="button"
                                      disabled={!cab.isAvailable}
                                      onClick={() =>
                                        updateForm("cabId", cab._id)
                                      }
                                    >
                                      {!cab.isAvailable
                                        ? "Not available"
                                        : form.cabId === cab._id
                                          ? "Selected"
                                          : "Select cab"}
                                    </button>
                                  </div>
                                </div>
                              </article>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
              {!hasSearched &&
                (loadingCabs ? (
                  <p className={styles.inlineState}>
                    Finding available vehicles...
                  </p>
                ) : fleetError ? (
                  <p className={styles.errorState} role="alert">
                    {fleetError}
                  </p>
                ) : (
                  <p className={styles.inlineState}>
                    Enter your journey details, then search to see vehicles
                    available for your pickup time.
                  </p>
                ))}
            </section>

            {selectedCab && (
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
                    <input
                      required
                      maxLength={100}
                      autoComplete="name"
                      value={form.fullName}
                      onChange={(e) => updateForm("fullName", e.target.value)}
                      placeholder="Name on the booking"
                    />
                  </Field>
                  <Field label="Mobile number" icon="call">
                    <input
                      required
                      type="tel"
                      maxLength={30}
                      autoComplete="tel"
                      value={form.phone}
                      onChange={(e) => updateForm("phone", e.target.value)}
                      placeholder="Include country code"
                    />
                  </Field>
                  <Field label="Email address" icon="mail">
                    <input
                      required
                      type="email"
                      maxLength={254}
                      autoComplete="email"
                      value={form.email}
                      onChange={(e) => updateForm("email", e.target.value)}
                      placeholder="you@example.com"
                    />
                  </Field>
                  <Field label="Trip notes (optional)" icon="edit_note">
                    <input
                      maxLength={500}
                      value={form.notes}
                      onChange={(e) => updateForm("notes", e.target.value)}
                      placeholder="Child seat, extra stop, accessibility..."
                    />
                  </Field>
                </div>
              </section>
            )}
          </div>

          <aside className={styles.summary}>
            <div className={styles.summaryTop}>
              <span className="material-symbols-outlined">receipt_long</span>
              <div>
                <h2>Trip estimate</h2>
                <p>Review before sending</p>
              </div>
            </div>
            <div className={styles.summaryRoute}>
              <span className={styles.summaryDot} />
              <p>{form.pickupLocation || "Pick-up location"}</p>
              <span className={styles.summaryLine} />
              <span
                className={`${styles.summaryDot} ${styles.destinationDot}`}
              />
              <p>{form.dropoffLocation || "Drop-off location"}</p>
            </div>
            <div className={styles.summaryDetails}>
              <span>Trip</span>
              <strong>
                {form.tripType === "round-trip"
                  ? "Round trip"
                  : form.tripType === "airport-transfer"
                    ? "Airport transfer"
                    : "One way"}
              </strong>
              <span>Pickup</span>
              <strong>
                {new Date(`${form.pickupDate}T00:00:00`).toLocaleDateString(
                  "en-IN",
                  { day: "numeric", month: "short", year: "numeric" },
                )}{" "}
                · {form.pickupTime}
              </strong>
              <span>Distance</span>
              <strong>
                {form.distanceKm || 0} km
                {form.tripType === "round-trip" ? " each way" : ""}
              </strong>
              <span>Vehicle</span>
              <strong>{selectedCab?.model || "Select a cab"}</strong>
              <span>Base + distance + driver</span>
              <strong>{selectedCab ? inr.format(fareSubtotal) : "--"}</strong>
              <span>Government tax ({selectedCab?.taxPercent ?? 0}%)</span>
              <strong>{selectedCab ? inr.format(governmentTax) : "--"}</strong>
            </div>
            <div className={styles.fareRow}>
              <span>Estimated total</span>
              <strong>{selectedCab ? inr.format(estimatedFare) : "--"}</strong>
            </div>
            <p className={styles.fareNote}>
              Estimate uses the rate set for this vehicle. Final fare is
              confirmed by our team before your trip.
            </p>
            {formError && (
              <p className={styles.errorState} role="alert">
                {formError}
              </p>
            )}
            <button
              className={styles.submitButton}
              type="submit"
              disabled={submitting || loadingCabs || !selectedCab}
            >
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

function Field({
  label,
  icon,
  children,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      <span className={styles.fieldControl}>
        <span className="material-symbols-outlined" aria-hidden="true">
          {icon}
        </span>
        {children}
      </span>
    </label>
  );
}
