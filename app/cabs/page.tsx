"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeftRight,
  ArrowRight,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import Header from "../components/Header";
import LocationDropdown from "../components/LocationDropdown";
import styles from "./cabs.module.css";

type Cab = {
  _id: string;
  model: string;
  category: string;
  imageUrl: string;
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
  routeDurationMinutes: number;
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

type EditableTripDetails = Pick<
  BookingForm,
  | "tripType"
  | "pickupLocation"
  | "dropoffLocation"
  | "pickupDate"
  | "pickupTime"
  | "returnDate"
  | "returnTime"
>;

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
  distanceKm: 0,
  routeDurationMinutes: 0,
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
  const [tripDraft, setTripDraft] = useState<EditableTripDetails | null>(null);
  const [tripEditError, setTripEditError] = useState("");
  const [scrollRequest, setScrollRequest] = useState(0);
  const [passengerScrollRequest, setPassengerScrollRequest] = useState(0);
  const resultsSectionRef = useRef<HTMLElement>(null);
  const tripSummarySentinelRef = useRef<HTMLSpanElement>(null);
  const tripSummaryRef = useRef<HTMLDivElement>(null);
  const passengerDetailsRef = useRef<HTMLElement>(null);
  const fullNameInputRef = useRef<HTMLInputElement>(null);
  const phoneInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const reviewConfirmRef = useRef<HTMLButtonElement>(null);
  const handledPassengerScrollRequestRef = useRef(0);
  const searchRequestRef = useRef(0);
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [fuelTypeFilter, setFuelTypeFilter] = useState<string[]>([]);
  const [modelFilter, setModelFilter] = useState<string[]>([]);
  const [seatFilter, setSeatFilter] = useState("all");
  const [maxFare, setMaxFare] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [sortBy, setSortBy] = useState<
    "recommended" | "price" | "rating" | "duration"
  >("recommended");
  const [submitting, setSubmitting] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [summaryExpanded, setSummaryExpanded] = useState(false);
  const [tripSummarySticky, setTripSummarySticky] = useState(false);
  const [tripSummaryHeight, setTripSummaryHeight] = useState(0);
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
        if (sortBy === "recommended") {
          if (first.isAvailable !== second.isAvailable)
            return first.isAvailable ? -1 : 1;
          const ratingDifference =
            (second.rating ?? -1) - (first.rating ?? -1);
          if (ratingDifference !== 0) return ratingDifference;
        }
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
  const distanceCharge = selectedCab && selectedPricing
    ? selectedPricing.fareDistanceKm * selectedCab.perKmRate
    : 0;
  const governmentTax = selectedPricing?.governmentTax ?? 0;
  const estimatedFare = selectedPricing?.total ?? 0;
  const canSearch = Boolean(
    form.pickupLocation.trim() &&
      form.dropoffLocation.trim() &&
      form.pickupDate &&
      form.pickupTime &&
      (form.tripType !== "round-trip" ||
        (form.returnDate && form.returnTime)),
  );
  const tripDetailsChanged =
    tripDraft !== null &&
    (tripDraft.pickupLocation !== form.pickupLocation ||
      tripDraft.dropoffLocation !== form.dropoffLocation ||
      tripDraft.pickupDate !== form.pickupDate ||
      tripDraft.pickupTime !== form.pickupTime ||
      tripDraft.returnDate !== form.returnDate ||
      tripDraft.returnTime !== form.returnTime ||
      tripDraft.tripType !== form.tripType);

  useEffect(() => {
    if (
      hasSearched &&
      (!form.cabId ||
        !matchingCabs.some((cab) => cab._id === form.cabId && cab.isAvailable))
    ) {
      setForm((current) => ({ ...current, cabId: matchingCabs[0]?._id || "" }));
    }
  }, [form.cabId, hasSearched, matchingCabs]);

  useEffect(() => {
    if (!scrollRequest || !resultsSectionRef.current) return;
    const resultsBounds = resultsSectionRef.current.getBoundingClientRect();
    const alreadyViewingResults =
      resultsBounds.top < window.innerHeight * 0.55 && resultsBounds.bottom > 110;
    if (!alreadyViewingResults) {
      resultsSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [scrollRequest]);

  useEffect(() => {
    if (!hasSearched || !tripSummarySentinelRef.current) {
      setTripSummarySticky(false);
      return;
    }

    const sentinel = tripSummarySentinelRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setTripSummarySticky(
          !entry.isIntersecting && entry.boundingClientRect.top < 72,
        );
      },
      { rootMargin: "-72px 0px 0px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasSearched]);

  useEffect(() => {
    if (!tripSummaryRef.current) return;

    const summary = tripSummaryRef.current;
    const updateHeight = () => {
      setTripSummaryHeight(summary.offsetHeight + 20);
    };
    updateHeight();

    const observer = new ResizeObserver(updateHeight);
    observer.observe(summary);
    return () => observer.disconnect();
  }, [hasSearched, form.tripType]);

  useEffect(() => {
    if (
      passengerScrollRequest <= handledPassengerScrollRequestRef.current ||
      !passengerDetailsRef.current
    ) {
      return;
    }
    handledPassengerScrollRequestRef.current = passengerScrollRequest;
    const section = passengerDetailsRef.current;
    const bounds = section.getBoundingClientRect();
    const headerOffset = window.innerWidth <= 760 ? 96 : 112;
    const fullyVisible =
      bounds.top >= headerOffset && bounds.bottom <= window.innerHeight;
    if (!fullyVisible) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    const focusTimer = window.setTimeout(
      () => {
        const firstEmptyInput = [
          fullNameInputRef.current,
          phoneInputRef.current,
          emailInputRef.current,
        ].find((input) => input && !input.value.trim());
        (firstEmptyInput ?? fullNameInputRef.current)?.focus({
          preventScroll: true,
        });
      },
      fullyVisible ? 0 : 500,
    );
    return () => window.clearTimeout(focusTimer);
  }, [form.cabId, passengerScrollRequest]);

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
      ].includes(key)
    ) {
      searchRequestRef.current += 1;
      setLoadingCabs(false);
      setFleetError("");
      setHasSearched(false);
    }
  };

  const selectCab = (cabId: string) => {
    if (form.cabId !== cabId) updateForm("cabId", cabId);
    setPassengerScrollRequest((current) => current + 1);
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

  const searchCabs = async (
    searchForm: BookingForm = form,
    options: { keepResultsVisible?: boolean; editing?: boolean } = {},
  ) => {
    const requestId = ++searchRequestRef.current;
    setFleetError("");
    setFormError("");
    setTripEditError("");
    const pickupAt = new Date(
      `${searchForm.pickupDate}T${searchForm.pickupTime}:00`,
    );
    const maximumDate = new Date();
    maximumDate.setDate(maximumDate.getDate() + 365);
    let validationError = "";
    if (!searchForm.pickupLocation.trim() || !searchForm.dropoffLocation.trim()) {
      validationError = "Enter both pickup and drop-off locations.";
    }
    if (!validationError && (
      Number.isNaN(pickupAt.getTime()) ||
      pickupAt <= new Date() ||
      pickupAt > maximumDate
    )) {
      validationError = "Choose a future pickup time within the next year.";
    }

    let serviceEndAt: Date;
    if (!validationError && searchForm.tripType === "round-trip") {
      serviceEndAt = new Date(
        `${searchForm.returnDate}T${searchForm.returnTime}:00`,
      );
      if (
        Number.isNaN(serviceEndAt.getTime()) ||
        serviceEndAt <= pickupAt ||
        serviceEndAt > maximumDate
      ) {
        validationError =
          "Choose a return time after pickup and within the next year.";
      }
    }
    if (searchForm.tripType !== "round-trip") {
      serviceEndAt = new Date(pickupAt);
    }
    if (validationError) {
      setFormError(validationError);
      if (options.editing) setTripEditError(validationError);
      return false;
    }

    setLoadingCabs(true);
    if (!options.keepResultsVisible) {
      setCabs([]);
      setHasSearched(false);
    }
    try {
      const routeResponse = await fetch("/api/cab-route", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickupLocation: searchForm.pickupLocation,
          dropoffLocation: searchForm.dropoffLocation,
        }),
      });
      const routePayload: unknown = await routeResponse.json();
      if (!routePayload || typeof routePayload !== "object") {
        throw new Error("Could not calculate the route.");
      }
      const routeData = routePayload as Record<string, unknown>;
      if (!routeResponse.ok) {
        throw new Error(
          typeof routeData.error === "string"
            ? routeData.error
            : "Could not calculate the route.",
        );
      }
      if (requestId !== searchRequestRef.current) return false;
      const searchFormWithRoute = {
        ...searchForm,
        distanceKm:
          typeof routeData.distanceKm === "number"
            ? routeData.distanceKm
            : Number.NaN,
        routeDurationMinutes:
          typeof routeData.durationMinutes === "number"
            ? routeData.durationMinutes
            : Number.NaN,
      };
      if (
        !Number.isFinite(searchFormWithRoute.distanceKm) ||
        searchFormWithRoute.distanceKm < 1 ||
        searchFormWithRoute.distanceKm > 5000 ||
        !Number.isFinite(searchFormWithRoute.routeDurationMinutes) ||
        searchFormWithRoute.routeDurationMinutes < 1
      ) {
        throw new Error("Could not calculate a valid driving route.");
      }
      serviceEndAt =
        searchForm.tripType === "round-trip"
          ? new Date(`${searchForm.returnDate}T${searchForm.returnTime}:00`)
          : new Date(
              pickupAt.getTime() +
                Math.max(
                  2,
                  searchFormWithRoute.routeDurationMinutes / 60,
                ) *
                  60 *
                  60 *
                  1000,
            );
      const query = new URLSearchParams({
        startAt: pickupAt.toISOString(),
        endAt: serviceEndAt.toISOString(),
      });
      const response = await fetch(`/api/cabs?${query}`, { cache: "no-store" });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Could not load vehicles.");
      if (requestId !== searchRequestRef.current) return false;
      setForm(searchFormWithRoute);
      setCabs(Array.isArray(data) ? data : []);
      setTripDraft({
        tripType: searchFormWithRoute.tripType,
        pickupLocation: searchFormWithRoute.pickupLocation,
        dropoffLocation: searchFormWithRoute.dropoffLocation,
        pickupDate: searchFormWithRoute.pickupDate,
        pickupTime: searchFormWithRoute.pickupTime,
        returnDate: searchFormWithRoute.returnDate,
        returnTime: searchFormWithRoute.returnTime,
      });
      setHasSearched(true);
      setScrollRequest((current) => current + 1);
      return true;
    } catch (error) {
      if (requestId !== searchRequestRef.current) return false;
      setFleetError(
        error instanceof Error ? error.message : "Could not load vehicles.",
      );
      if (options.editing) {
        setTripEditError(
          error instanceof Error ? error.message : "Could not load vehicles.",
        );
      }
      return false;
    } finally {
      if (requestId === searchRequestRef.current) setLoadingCabs(false);
    }
  };

  const updateTripDraft = <K extends keyof EditableTripDetails>(
    key: K,
    value: EditableTripDetails[K],
  ) => {
    setTripDraft((current) => ({
      tripType: current?.tripType ?? form.tripType,
      pickupLocation: current?.pickupLocation ?? form.pickupLocation,
      dropoffLocation: current?.dropoffLocation ?? form.dropoffLocation,
      pickupDate: current?.pickupDate ?? form.pickupDate,
      pickupTime: current?.pickupTime ?? form.pickupTime,
      returnDate: current?.returnDate ?? form.returnDate,
      returnTime: current?.returnTime ?? form.returnTime,
      [key]: value,
    }));
    setTripEditError("");
  };

  const saveTripEdit = async () => {
    if (!tripDraft) return;
    const updatedForm = { ...form, ...tripDraft, cabId: "" };
    const saved = await searchCabs(updatedForm, {
      keepResultsVisible: true,
      editing: true,
    });
    return saved;
  };

  const cancelTripEdit = () => {
    if (loadingCabs) {
      searchRequestRef.current += 1;
      setLoadingCabs(false);
    }
    setFleetError("");
    setFormError("");
    setTripDraft({
      tripType: form.tripType,
      pickupLocation: form.pickupLocation,
      dropoffLocation: form.dropoffLocation,
      pickupDate: form.pickupDate,
      pickupTime: form.pickupTime,
      returnDate: form.returnDate,
      returnTime: form.returnTime,
    });
    setTripEditError("");
  };

  const submitBooking = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasSearched || !selectedCab) {
      setFormError(
        "Search for an available cab and select it before requesting your ride.",
      );
      return;
    }
    setFormError("");
    setReviewOpen(true);
  };

  const confirmBooking = async () => {
    if (!hasSearched || !selectedCab) {
      setReviewOpen(false);
      setFormError("Choose an available cab before confirming your request.");
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
      setReviewOpen(false);
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

  useEffect(() => {
    if (!reviewOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !submitting) setReviewOpen(false);
      if (event.key !== "Tab") return;
      const dialog = document.querySelector<HTMLElement>(
        '[role="dialog"][aria-labelledby="cab-review-title"]',
      );
      const focusable = dialog?.querySelectorAll<HTMLElement>(
        'button:not(:disabled), input:not(:disabled), [href], [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    reviewConfirmRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [reviewOpen, submitting]);

  if (confirmation) {
    return (
      <div className={styles.pageShell}>
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
      </div>
    );
  }

  return (
    <div className={styles.pageShell}>
      <Header currentPage="cabs" solidHeader />
      <main className={styles.page}>
        <section className={styles.intro}>
          <div className={styles.introCopy}>
            <p className={styles.eyebrow}>
              <span /> Premium transportation
            </p>
            <h1>
              Your journey deserves <em>a better ride.</em>
            </h1>
            <p>
              Thoughtful airport transfers, city rides, and outstation journeys,
              with the details handled before you go.
            </p>
            <div className={styles.trustLine}>
              <span>
                <span className="material-symbols-outlined">payments</span>
                Transparent pricing
              </span>
              <span>
                <span className="material-symbols-outlined">verified_user</span>
                Verified vehicles
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
              src="/cab-luxury.jpg"
              alt="Black luxury sedan travelling on an open road"
              fill
              priority
              sizes="(max-width: 760px) 100vw, 50vw"
              unoptimized
            />
            <div className={styles.imageCaption}>
              <span className="material-symbols-outlined" aria-hidden="true">
                route
              </span>
              <div>
                <strong>Arrive in comfort</strong>
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
              <strong>Vehicles for every route</strong>
              <small>City trips, airport &amp; beyond</small>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <span className="material-symbols-outlined" aria-hidden="true">
              support_agent
            </span>
            <div>
              <strong>Dedicated trip support</strong>
              <small>Personal booking assistance</small>
            </div>
          </div>
          <div className={styles.benefitItem}>
            <span className="material-symbols-outlined" aria-hidden="true">
              event_available
            </span>
            <div>
              <strong>Flexible scheduling</strong>
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
                  controlId="cab-pickup-location"
                >
                  <LocationDropdown
                    value={form.pickupLocation}
                    onChange={(value) => updateForm("pickupLocation", value)}
                    inputId="cab-pickup-location"
                    providerOnly
                    variant="cab"
                    required
                    maxLength={180}
                    placeholder={
                      form.tripType === "airport-transfer"
                        ? "Airport, city or terminal"
                        : "City, address or landmark"
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
                  controlId="cab-dropoff-location"
                >
                  <LocationDropdown
                    value={form.dropoffLocation}
                    onChange={(value) => updateForm("dropoffLocation", value)}
                    inputId="cab-dropoff-location"
                    providerOnly
                    variant="cab"
                    required
                    maxLength={180}
                    placeholder={
                      form.tripType === "airport-transfer"
                        ? "Airport, city or terminal"
                        : "Where are you going?"
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
                Road distance and fare are calculated automatically from your
                pickup and drop-off locations.
              </p>
              {formError && (
                <p className={styles.errorState} role="alert">
                  {formError}
                </p>
              )}
              {fleetError && !hasSearched && (
                <p className={styles.errorState} role="alert">
                  {fleetError} Try searching again when you’re ready.
                </p>
              )}
              <button
                className={styles.searchButton}
                type="button"
                onClick={() => void searchCabs()}
                disabled={loadingCabs || !canSearch}
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

            <section
              ref={resultsSectionRef}
              className={`${styles.section} ${styles.resultsSection}`}
              id="available-cabs"
            >
              <div className={styles.sectionHeading}>
                <span className={styles.stepNumber}>02</span>
                <div>
                  <h2>Choose your cab</h2>
                  <p>Compare estimates for vehicles that fit your group.</p>
                </div>
              </div>
              {hasSearched && (
                <>
                  <div
                    className={styles.tripSummarySlot}
                    style={
                      tripSummarySticky
                        ? { minHeight: `${tripSummaryHeight}px` }
                        : undefined
                    }
                  >
                    <span
                      ref={tripSummarySentinelRef}
                      className={styles.tripSummarySentinel}
                      aria-hidden="true"
                    />
                    <div
                      ref={tripSummaryRef}
                      className={`${styles.tripSummary}${tripSummarySticky ? ` ${styles.tripSummarySticky}` : ""}`}
                    >
                      <div className={styles.tripEditPanel}>
                        <fieldset
                          className={styles.tripEditFieldset}
                          disabled={loadingCabs}
                        >
                          <div className={styles.tripEditGrid}>
                            <Field
                              label="Pick-up"
                              icon="radio_button_checked"
                              controlId="edit-cab-pickup-location"
                            >
                              <LocationDropdown
                                value={
                                  tripDraft?.pickupLocation ??
                                  form.pickupLocation
                                }
                                onChange={(value) =>
                                  updateTripDraft("pickupLocation", value)
                                }
                                inputId="edit-cab-pickup-location"
                                providerOnly
                                variant="cab"
                                required
                                maxLength={180}
                                placeholder="City, address or landmark"
                              />
                            </Field>
                            <Field
                              label="Drop-off"
                              icon="location_on"
                              controlId="edit-cab-dropoff-location"
                            >
                              <LocationDropdown
                                value={
                                  tripDraft?.dropoffLocation ??
                                  form.dropoffLocation
                                }
                                onChange={(value) =>
                                  updateTripDraft("dropoffLocation", value)
                                }
                                inputId="edit-cab-dropoff-location"
                                providerOnly
                                variant="cab"
                                required
                                maxLength={180}
                                placeholder="Where are you going?"
                              />
                            </Field>
                            <Field label="Pick-up date" icon="calendar_month">
                              <input
                                type="date"
                                min={localDate()}
                                max={localDate(365)}
                                value={tripDraft?.pickupDate ?? form.pickupDate}
                                onChange={(event) =>
                                  updateTripDraft(
                                    "pickupDate",
                                    event.target.value,
                                  )
                                }
                              />
                            </Field>
                            <Field label="Pick-up time" icon="schedule">
                              <input
                                type="time"
                                value={tripDraft?.pickupTime ?? form.pickupTime}
                                onChange={(event) =>
                                  updateTripDraft(
                                    "pickupTime",
                                    event.target.value,
                                  )
                                }
                              />
                            </Field>
                            {(tripDraft?.tripType ?? form.tripType) ===
                              "round-trip" && (
                              <>
                                <Field label="Return date" icon="event_repeat">
                                  <input
                                    type="date"
                                    min={
                                      tripDraft?.pickupDate ?? form.pickupDate
                                    }
                                    max={localDate(365)}
                                    value={
                                      tripDraft?.returnDate ?? form.returnDate
                                    }
                                    onChange={(event) =>
                                      updateTripDraft(
                                        "returnDate",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </Field>
                                <Field label="Return time" icon="schedule">
                                  <input
                                    type="time"
                                    value={
                                      tripDraft?.returnTime ?? form.returnTime
                                    }
                                    onChange={(event) =>
                                      updateTripDraft(
                                        "returnTime",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </Field>
                              </>
                            )}
                          </div>
                        </fieldset>
                        <div className={styles.tripEditActions}>
                          {tripDetailsChanged && (
                            <button
                              type="button"
                              className={styles.cancelTripEdit}
                              onClick={cancelTripEdit}
                            >
                              Discard changes
                            </button>
                          )}
                          <button
                            type="button"
                            className={styles.saveTripEdit}
                            onClick={() => void saveTripEdit()}
                            disabled={loadingCabs || !tripDetailsChanged}
                          >
                            {loadingCabs
                              ? "Updating cabs..."
                              : "Update available cabs"}
                          </button>
                        </div>
                        {tripEditError && (
                          <p className={styles.errorState} role="alert">
                            {tripEditError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  {loadingCabs ? (
                    <CabLoadingSkeletons />
                  ) : fleetError ? (
                    <div className={styles.resultsError} role="alert">
                      <p>{fleetError}</p>
                      <button
                        type="button"
                        onClick={() =>
                          void (tripDetailsChanged
                            ? saveTripEdit()
                            : searchCabs(form, { keepResultsVisible: true }))
                        }
                      >
                        Retry search
                      </button>
                    </div>
                  ) : (
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
                            sortBy === "recommended" ? styles.sortActive : ""
                          }
                          aria-pressed={sortBy === "recommended"}
                          onClick={() => setSortBy("recommended")}
                        >
                          Recommended
                        </button>
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
                          {cabs.length === 0
                            ? "No cabs are available for this trip time. Try another pickup time or edit your trip."
                            : "No vehicles match this journey and your filters. Adjust your filters or try another pickup time."}
                        </p>
                      ) : (
                        <div className={styles.vehicleList}>
                          {matchingCabs.map((cab, index) => {
                            const pricing = getCabPricing(
                              cab,
                              form.distanceKm,
                              form.tripType,
                            );
                            const durationMinutes =
                              form.routeDurationMinutes *
                              (form.tripType === "round-trip" ? 2 : 1);
                            const durationHours = Math.floor(
                              durationMinutes / 60,
                            );
                            const remainingMinutes = durationMinutes % 60;
                            return (
                              <article
                                key={cab._id}
                                className={`${styles.vehicleCard} ${form.cabId === cab._id ? styles.vehicleSelected : ""} ${!cab.isAvailable ? styles.vehicleUnavailable : ""}`}
                              >
                                <div className={styles.vehicleImage}>
                                  <Image
                                    src={cab.imageUrl || "/cab.png"}
                                    alt={`${cab.category} ${cab.model}`}
                                    fill
                                    sizes="(max-width: 760px) 100vw, 240px"
                                    unoptimized={cab.imageUrl.startsWith(
                                      "/api/files/",
                                    )}
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
                                            : sortBy === "price"
                                              ? "Lowest estimate"
                                              : "Recommended"}
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
                                      ~
                                      {durationHours > 0
                                        ? `${durationHours} hr${durationHours === 1 ? "" : "s"} `
                                        : ""}
                                      {remainingMinutes} min
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
                                      Distance (
                                      {pricing.fareDistanceKm.toFixed(1)} km ×{" "}
                                      {inr.format(cab.perKmRate)}/km){" "}
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
                                        selectCab(cab._id)
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
                </>
              )}
              {!hasSearched &&
                (loadingCabs ? (
                  <CabLoadingSkeletons />
                ) : fleetError ? (
                  <div className={styles.resultsError} role="alert">
                    <p>{fleetError}</p>
                    <button
                      type="button"
                      onClick={() => void searchCabs(form)}
                    >
                      Retry search
                    </button>
                  </div>
                ) : (
                  <p className={styles.inlineState}>
                    Enter your journey details, then search to see vehicles
                    available for your pickup time.
                  </p>
                ))}
            </section>

            {selectedCab && (
              <section
                ref={passengerDetailsRef}
                className={`${styles.section} ${styles.passengerDetailsSection}`}
                id="passenger-details"
              >
                <div className={styles.sectionHeading}>
                  <span className={styles.stepNumber}>03</span>
                  <div>
                    <h2>Passenger details</h2>
                    <p>We’ll use these to confirm your booking.</p>
                  </div>
                </div>
                <div className={styles.selectedCabSummary} aria-live="polite">
                  <div className={styles.selectedCabImage}>
                    <Image
                      src={selectedCab.imageUrl || "/cab.png"}
                      alt=""
                      fill
                      sizes="72px"
                      unoptimized={selectedCab.imageUrl.startsWith(
                        "/api/files/",
                      )}
                    />
                  </div>
                  <div className={styles.selectedCabInfo}>
                    <span>{selectedCab.category}</span>
                    <strong>{selectedCab.model}</strong>
                    <small>
                      {selectedCab.seats} seats · {form.distanceKm} km
                    </small>
                  </div>
                  <strong className={styles.selectedCabFare}>
                    {inr.format(estimatedFare)}
                  </strong>
                </div>
                <div className={styles.formGrid}>
                  <Field label="Full name" icon="person">
                    <input
                      ref={fullNameInputRef}
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
                      ref={phoneInputRef}
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
                      ref={emailInputRef}
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

          <aside
            className={`${styles.summary} ${summaryExpanded ? styles.summaryExpanded : ""}`}
          >
            <div className={styles.summaryTop}>
              <span className="material-symbols-outlined" aria-hidden="true">
                receipt_long
              </span>
              <div className={styles.summaryHeading}>
                <h2>Your trip summary</h2>
                <p>Estimated fare, confirmed before travel</p>
              </div>
              <div className={styles.summaryActions}>
                <div className={styles.summaryMiniFare}>
                  <span>Estimated total</span>
                  <strong>{selectedCab ? inr.format(estimatedFare) : "--"}</strong>
                </div>
                <p className={styles.summaryMiniNote}>No payment is required now.</p>
                <button
                  className={styles.summaryToggle}
                  type="button"
                  aria-expanded={summaryExpanded}
                  onClick={() => setSummaryExpanded((current) => !current)}
                >
                  Details
                  <ChevronDown size={15} aria-hidden="true" />
                </button>
                <button
                  className={styles.submitButton}
                  type="submit"
                  disabled={submitting || loadingCabs || !selectedCab}
                >
                  Request this cab
                  <ArrowRight size={16} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div
              className={`${styles.summaryContent} ${summaryExpanded ? styles.summaryContentExpanded : ""}`}
            >
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
                <span>Journey</span>
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
                {form.tripType === "round-trip" && (
                  <>
                    <span>Return</span>
                    <strong>
                      {new Date(`${form.returnDate}T00:00:00`).toLocaleDateString(
                        "en-IN",
                        { day: "numeric", month: "short", year: "numeric" },
                      )}{" "}
                      · {form.returnTime}
                    </strong>
                  </>
                )}
                <span>Distance</span>
                <strong>
                  {form.distanceKm
                    ? `${form.distanceKm} km${form.tripType === "round-trip" ? " each way" : ""}`
                    : "Calculated during search"}
                </strong>
                <span>Drive time</span>
                <strong>
                  {form.routeDurationMinutes
                    ? `${Math.floor(form.routeDurationMinutes / 60)}h ${form.routeDurationMinutes % 60}m${form.tripType === "round-trip" ? " each way" : ""}`
                    : "Calculated during search"}
                </strong>
                <span>Vehicle</span>
                <strong>{selectedCab?.model || "Select a cab"}</strong>
                <span>Base fare</span>
                <strong>{selectedCab ? inr.format(selectedCab.baseFare) : "--"}</strong>
                <span>Distance charges</span>
                <strong>{selectedCab ? inr.format(distanceCharge) : "--"}</strong>
                <span>Driver allowance</span>
                <strong>
                  {selectedCab ? inr.format(selectedCab.driverAllowance) : "--"}
                </strong>
                <span>Government taxes</span>
                <strong>{selectedCab ? inr.format(governmentTax) : "--"}</strong>
              </div>
              <p className={styles.fareNote}>
                This is an estimate based on the selected vehicle’s rates.
                Final fare and availability are confirmed by our team.
              </p>
              {formError && (
                <p className={styles.errorState} role="alert">
                  {formError}
                </p>
              )}
              <p className={styles.noCharge}>
                No payment is required at this stage.
              </p>
            </div>
          </aside>
        </form>
        {reviewOpen && selectedCab && selectedPricing && (
          <div
            className={styles.reviewBackdrop}
            role="presentation"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget && !submitting) {
                setReviewOpen(false);
              }
            }}
          >
            <section
              className={styles.reviewDialog}
              role="dialog"
              aria-modal="true"
              aria-labelledby="cab-review-title"
            >
              <div className={styles.reviewHeader}>
                <div>
                  <p className={styles.eyebrow}>Before we send your request</p>
                  <h2 id="cab-review-title">Review your journey</h2>
                </div>
                <button
                  className={styles.reviewClose}
                  type="button"
                  aria-label="Close review"
                  disabled={submitting}
                  onClick={() => setReviewOpen(false)}
                >
                  <X size={19} aria-hidden="true" />
                </button>
              </div>
              <div className={styles.reviewRoute}>
                <p><span>Pickup</span>{form.pickupLocation}</p>
                <ArrowRight size={17} aria-hidden="true" />
                <p><span>Drop-off</span>{form.dropoffLocation}</p>
              </div>
              <div className={styles.reviewVehicle}>
                <div className={styles.reviewVehicleImage}>
                  <Image
                    src={selectedCab.imageUrl || "/cab.png"}
                    alt=""
                    fill
                    sizes="72px"
                    unoptimized={selectedCab.imageUrl.startsWith(
                      "/api/files/",
                    )}
                  />
                </div>
                <div>
                  <span>{selectedCab.category}</span>
                  <strong>{selectedCab.model}</strong>
                  <small>{selectedCab.seats} seats · {selectedCab.luggageCapacity} bags</small>
                </div>
              </div>
              <div className={styles.reviewDetails}>
                <span>Journey type</span>
                <strong>
                  {form.tripType === "round-trip"
                    ? "Round trip"
                    : form.tripType === "airport-transfer"
                      ? "Airport transfer"
                      : "One way"}
                </strong>
                <span>Pickup</span>
                <strong>{form.pickupDate} · {form.pickupTime}</strong>
                {form.tripType === "round-trip" && (
                  <>
                    <span>Return</span>
                    <strong>{form.returnDate} · {form.returnTime}</strong>
                  </>
                )}
                <span>Passengers and bags</span>
                <strong>{form.passengers} passengers · {form.luggage} bags</strong>
                <span>Estimated distance</span>
                <strong>{form.distanceKm} km{form.tripType === "round-trip" ? " each way" : ""}</strong>
                <span>Contact</span>
                <strong>{form.fullName} · {form.phone}</strong>
                <span>Email</span>
                <strong>{form.email}</strong>
                {form.notes.trim() && (
                  <>
                    <span>Trip notes</span>
                    <strong>{form.notes}</strong>
                  </>
                )}
              </div>
              <div className={styles.reviewFare}>
                <span>Base fare</span><strong>{inr.format(selectedCab.baseFare)}</strong>
                <span>Distance charges</span><strong>{inr.format(distanceCharge)}</strong>
                <span>Driver allowance</span><strong>{inr.format(selectedCab.driverAllowance)}</strong>
                <span>Government taxes</span><strong>{inr.format(governmentTax)}</strong>
                <span className={styles.reviewFareTotal}>Estimated total</span>
                <strong className={styles.reviewFareTotal}>{inr.format(estimatedFare)}</strong>
              </div>
              {formError && (
                <p className={styles.errorState} role="alert">{formError}</p>
              )}
              <div className={styles.reviewActions}>
                <button
                  className={styles.reviewBackButton}
                  type="button"
                  disabled={submitting}
                  onClick={() => setReviewOpen(false)}
                >
                  Back to details
                </button>
                <button
                  ref={reviewConfirmRef}
                  className={styles.reviewConfirmButton}
                  type="button"
                  disabled={submitting}
                  onClick={() => void confirmBooking()}
                >
                  {submitting ? "Sending request..." : "Confirm booking request"}
                  {!submitting && <ArrowRight size={17} aria-hidden="true" />}
                </button>
              </div>
              <p className={styles.reviewReassurance}>
                No payment is required. Final availability and fare are confirmed by our team.
              </p>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}

function CabLoadingSkeletons() {
  return (
    <div
      className={styles.vehicleSkeletonList}
      role="status"
      aria-label="Loading available vehicles"
    >
      {Array.from({ length: 3 }, (_, index) => (
        <div
          className={styles.vehicleSkeletonCard}
          key={index}
          aria-hidden="true"
        >
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonContent}>
            <span className={styles.skeletonLine} />
            <span className={`${styles.skeletonLine} ${styles.skeletonLineWide}`} />
            <span className={styles.skeletonLine} />
            <span className={`${styles.skeletonLine} ${styles.skeletonLineShort}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Field({
  label,
  icon,
  children,
  controlId,
}: {
  label: string;
  icon: string;
  children: React.ReactNode;
  controlId?: string;
}) {
  const contents = (
    <div className={styles.fieldControl}>
      <span className="material-symbols-outlined" aria-hidden="true">
        {icon}
      </span>
      {children}
    </div>
  );

  if (controlId) {
    return (
      <div className={styles.field}>
        <label className={styles.fieldLabel} htmlFor={controlId}>
          {label}
        </label>
        {contents}
      </div>
    );
  }

  return (
    <label className={styles.field}>
      <span className={styles.fieldLabel}>{label}</span>
      {contents}
    </label>
  );
}
