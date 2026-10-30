"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowDownUp,
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarDays,
  CarFront,
  Check,
  ChevronDown,
  CircleHelp,
  Clock3,
  MapPin,
  Minus,
  Plus,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Users,
  X,
} from "lucide-react";
import Header from "../components/Header";
import LocationDropdown from "../components/LocationDropdown";
import styles from "./cabs.module.css";

type TripType = "one-way" | "round-trip" | "airport-transfer";

type SearchForm = {
  tripType: TripType;
  pickupLocation: string;
  dropoffLocation: string;
  stops: string[];
  pickupDate: string;
  pickupTime: string;
  returnDate: string;
  returnTime: string;
};

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
  roofCarrierAvailable?: boolean;
};

type RouteDetails = { distanceKm: number; durationMinutes: number };
type BookingConfirmation = {
  bookingReference: string;
  estimatedFare: number;
  message: string;
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function localDate(offsetDays = 0) {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);
}

function createInitialForm(): SearchForm {
  return {
    tripType: "one-way",
    pickupLocation: "Delhi, India",
    dropoffLocation: "Mumbai, India",
    stops: [],
    pickupDate: localDate(1),
    pickupTime: "09:00",
    returnDate: localDate(2),
    returnTime: "18:00",
  };
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  const suffix = hours >= 12 ? "PM" : "AM";
  return `${String(hours % 12 || 12).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return [
    hours ? `${hours} hr${hours === 1 ? "" : "s"}` : "",
    remainingMinutes ? `${remainingMinutes} min` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

function quoteFor(cab: Cab, distanceKm: number, tripType: TripType) {
  const billedDistance = distanceKm * (tripType === "round-trip" ? 2 : 1);
  const subtotal = Math.round(
    cab.baseFare + billedDistance * cab.perKmRate + cab.driverAllowance,
  );
  const tax = Math.round((subtotal * cab.taxPercent) / 100);
  return { billedDistance, subtotal, tax, total: subtotal + tax };
}

function VehicleIllustration({ category }: { category: string }) {
  const normalized = category.toLocaleLowerCase();
  const isLargeVehicle =
    normalized.includes("suv") ||
    normalized.includes("muv") ||
    normalized.includes("traveller");
  const isSedan = normalized.includes("sedan");

  return (
    <svg
      className={styles.vehicleIllustration}
      viewBox="0 0 160 80"
      role="img"
      aria-label={`${category} vehicle illustration`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d={
          isLargeVehicle
            ? "M17 48L23 34C25 29 30 26 36 26H102C110 26 117 30 122 36L133 45L143 48C147 49 150 53 150 57V63H11V55C11 52 13 49 17 48Z"
            : isSedan
              ? "M14 49L22 38C25 34 31 32 37 31L53 20C57 17 61 16 67 16H100C107 16 113 19 118 24L132 39L145 44C149 46 151 50 151 55V63H10V56C10 53 11 50 14 49Z"
              : "M14 49L22 39C25 35 31 33 37 32L52 22C56 19 61 18 67 18H96C103 18 110 21 115 26L130 40L145 45C149 46 151 50 151 55V63H10V56C10 53 11 50 14 49Z"
        }
        fill="#7DB9F2"
        stroke="#25364C"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <path
        d={
          isLargeVehicle
            ? "M32 33L38 30H59V44H25L32 33Z"
            : "M42 34L56 24C59 22 63 21 67 21H77V43H34L42 34Z"
        }
        fill="#26374D"
        stroke="#26374D"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d={
          isLargeVehicle
            ? "M64 30H99C105 30 110 33 114 38L119 44H64V30Z"
            : `M81 21H${isSedan ? "98" : "95"}C103 21 108 24 112 28L125 43H81V21Z`
        }
        fill="#26374D"
        stroke="#26374D"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      {isLargeVehicle && (
        <path d="M64 30V44M87 30V44" stroke="#D8E9FA" strokeWidth="2" />
      )}
      <path d="M17 51H25M137 49L145 51" stroke="#25364C" strokeWidth="3" strokeLinecap="round" />
      <circle cx="42" cy="61" r="10" fill="#26374D" />
      <circle cx="42" cy="61" r="4.5" fill="#E8F4FF" />
      <circle cx="119" cy="61" r="10" fill="#26374D" />
      <circle cx="119" cy="61" r="4.5" fill="#E8F4FF" />
    </svg>
  );
}

function makeSearchUrl(form: SearchForm) {
  const params = new URLSearchParams();
  params.set("tripType", form.tripType);
  params.set("from", form.pickupLocation.trim());
  params.set("to", form.dropoffLocation.trim());
  params.set("date", form.pickupDate);
  params.set("time", form.pickupTime);
  if (form.tripType === "round-trip") {
    params.set("returnDate", form.returnDate);
    params.set("returnTime", form.returnTime);
  }
  form.stops.map((stop) => stop.trim()).filter(Boolean).forEach((stop) => {
    params.append("stop", stop);
  });
  return `/cabs?${params.toString()}`;
}

const timeOptions = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2);
  const minutes = index % 2 ? "30" : "00";
  const value = `${String(hours).padStart(2, "0")}:${minutes}`;
  return { value, label: formatTime(value) };
});

export default function CabsPage() {
  const [form, setForm] = useState<SearchForm>(createInitialForm);
  const [capsuleForm, setCapsuleForm] = useState<SearchForm>(createInitialForm);
  const [fleet, setFleet] = useState<Cab[]>([]);
  const [route, setRoute] = useState<RouteDetails | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [selectedCab, setSelectedCab] = useState<Cab | null>(null);
  const [roofCarrier, setRoofCarrier] = useState(false);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [confirmation, setConfirmation] =
    useState<BookingConfirmation | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [showFloatingSearch, setShowFloatingSearch] = useState(false);
  const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
  const [fuelFilters, setFuelFilters] = useState<string[]>([]);
  const [modelFilters, setModelFilters] = useState<string[]>([]);
  const [seatFilter, setSeatFilter] = useState("all");
  const [maxFare, setMaxFare] = useState("");
  const [sortBy, setSortBy] = useState("price");
  const [passengers, setPassengers] = useState(1);
  const [luggage, setLuggage] = useState(1);
  const [guest, setGuest] = useState({ fullName: "", phone: "", email: "", notes: "" });
  const searchRequest = useRef(0);
  const hydratedFromUrl = useRef(false);
  const resultsSectionRef = useRef<HTMLElement>(null);
  const shouldScrollToResultsRef = useRef(false);

  useEffect(() => {
    const updateFloatingSearch = () => {
      setShowFloatingSearch(window.scrollY > 220);
    };
    updateFloatingSearch();
    window.addEventListener("scroll", updateFloatingSearch, { passive: true });
    return () => window.removeEventListener("scroll", updateFloatingSearch);
  }, []);

  useEffect(() => {
    if (!hasSearched || !route || !shouldScrollToResultsRef.current) return;
    shouldScrollToResultsRef.current = false;
    const frame = window.requestAnimationFrame(() => {
      resultsSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [hasSearched, route]);

  const runSearch = useCallback(
    async (searchForm: SearchForm, syncUrl = true) => {
      const cleanStops = searchForm.stops.map((stop) => stop.trim());
      if (!searchForm.pickupLocation.trim() || !searchForm.dropoffLocation.trim()) {
        setSearchError("Choose both a pickup and a drop-off location.");
        return;
      }
      if (cleanStops.some((stop) => !stop)) {
        setSearchError("Complete or remove each added stop.");
        return;
      }
      if (cleanStops.length > 5) {
        setSearchError("You can add up to five intermediate stops.");
        return;
      }
      const pickupAt = new Date(`${searchForm.pickupDate}T${searchForm.pickupTime}:00`);
      if (!Number.isFinite(pickupAt.getTime()) || pickupAt <= new Date()) {
        setSearchError("Choose a pickup time in the future.");
        return;
      }
      let returnAt: Date | null = null;
      if (searchForm.tripType === "round-trip") {
        returnAt = new Date(`${searchForm.returnDate}T${searchForm.returnTime}:00`);
        if (!Number.isFinite(returnAt.getTime()) || returnAt <= pickupAt) {
          setSearchError("Choose a return time after your pickup time.");
          return;
        }
      }

      const requestId = ++searchRequest.current;
      const normalizedForm = { ...searchForm, stops: cleanStops };
      setSearching(true);
      setSearchError("");
      setSelectedCab(null);
      setConfirmation(null);
      if (syncUrl) window.history.replaceState(null, "", makeSearchUrl(normalizedForm));

      try {
        const routeResponse = await fetch("/api/cab-route", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pickupLocation: normalizedForm.pickupLocation,
            dropoffLocation: normalizedForm.dropoffLocation,
            stops: cleanStops,
          }),
        });
        const routeData = await routeResponse.json();
        if (!routeResponse.ok) {
          throw new Error(routeData.error || "Could not calculate this route.");
        }
        const routeDetails: RouteDetails = {
          distanceKm: Number(routeData.distanceKm),
          durationMinutes: Number(routeData.durationMinutes),
        };
        if (
          !Number.isFinite(routeDetails.distanceKm) ||
          !Number.isFinite(routeDetails.durationMinutes)
        ) {
          throw new Error("The route service returned invalid trip details.");
        }
        const serviceEnd =
          returnAt ??
          new Date(
            pickupAt.getTime() +
              Math.max(2, routeDetails.durationMinutes / 60) * 60 * 60 * 1000,
          );
        const fleetUrl = new URL("/api/cabs", window.location.origin);
        fleetUrl.searchParams.set("startAt", pickupAt.toISOString());
        fleetUrl.searchParams.set("endAt", serviceEnd.toISOString());
        const fleetResponse = await fetch(fleetUrl);
        const fleetData = await fleetResponse.json();
        if (!fleetResponse.ok) {
          throw new Error(fleetData.error || "Could not load available vehicles.");
        }
        if (!Array.isArray(fleetData)) {
          throw new Error("The vehicle service returned an invalid response.");
        }
        if (requestId !== searchRequest.current) return;
        setForm(normalizedForm);
        setCapsuleForm(normalizedForm);
        setRoute(routeDetails);
        setFleet(fleetData as Cab[]);
        setHasSearched(true);
        shouldScrollToResultsRef.current = syncUrl;
        setCategoryFilters([]);
        setFuelFilters([]);
        setModelFilters([]);
        setSeatFilter("all");
        setMaxFare("");
      } catch (error) {
        if (requestId !== searchRequest.current) return;
        setSearchError(
          error instanceof Error ? error.message : "Could not search for cabs.",
        );
      } finally {
        if (requestId === searchRequest.current) setSearching(false);
      }
    },
    [],
  );

  useEffect(() => {
    if (hydratedFromUrl.current) return;
    hydratedFromUrl.current = true;
    const params = new URLSearchParams(window.location.search);
    const pickupLocation = params.get("from") ?? "";
    const dropoffLocation = params.get("to") ?? "";
    if (!pickupLocation && !dropoffLocation) return;
    const tripTypeValue = params.get("tripType");
    const tripType: TripType =
      tripTypeValue === "round-trip" || tripTypeValue === "airport-transfer"
        ? tripTypeValue
        : "one-way";
    const initial: SearchForm = {
      ...createInitialForm(),
      tripType,
      pickupLocation,
      dropoffLocation,
      stops: params.getAll("stop"),
      pickupDate: params.get("date") || localDate(1),
      pickupTime: params.get("time") || "09:00",
      returnDate: params.get("returnDate") || localDate(2),
      returnTime: params.get("returnTime") || "18:00",
    };
    setForm(initial);
  }, []);

  const availableFleet = useMemo(
    () => fleet.filter((cab) => cab.isAvailable),
    [fleet],
  );
  const categories = useMemo(
    () => [...new Set(availableFleet.map((cab) => cab.category).filter(Boolean))].sort(),
    [availableFleet],
  );
  const fuels = useMemo(
    () => [...new Set(availableFleet.map((cab) => cab.fuelType).filter(Boolean))].sort(),
    [availableFleet],
  );
  const models = useMemo(
    () => [...new Set(availableFleet.map((cab) => cab.model).filter(Boolean))].sort(),
    [availableFleet],
  );

  const filteredFleet = useMemo(() => {
    const filtered = availableFleet.filter((cab) => {
      if (categoryFilters.length && !categoryFilters.includes(cab.category)) return false;
      if (fuelFilters.length && !fuelFilters.includes(cab.fuelType)) return false;
      if (modelFilters.length && !modelFilters.includes(cab.model)) return false;
      if (seatFilter !== "all" && cab.seats !== Number(seatFilter)) return false;
      if (
        maxFare &&
        route &&
        quoteFor(cab, route.distanceKm, form.tripType).total > Number(maxFare)
      ) {
        return false;
      }
      return true;
    });
    return filtered.sort((first, second) => {
      const firstQuote = route ? quoteFor(first, route.distanceKm, form.tripType) : null;
      const secondQuote = route ? quoteFor(second, route.distanceKm, form.tripType) : null;
      if (sortBy === "rating") return (second.rating ?? 0) - (first.rating ?? 0);
      if (sortBy === "category") return first.category.localeCompare(second.category);
      if (sortBy === "price-desc") return (secondQuote?.total ?? 0) - (firstQuote?.total ?? 0);
      return (firstQuote?.total ?? 0) - (secondQuote?.total ?? 0);
    });
  }, [
    availableFleet,
    categoryFilters,
    fuelFilters,
    form.tripType,
    maxFare,
    modelFilters,
    route,
    seatFilter,
    sortBy,
  ]);

  const updateForm = <K extends keyof SearchForm>(key: K, value: SearchForm[K]) => {
    searchRequest.current += 1;
    setSearching(false);
    setHasSearched(false);
    setRoute(null);
    setSelectedCab(null);
    setSearchError("");
    setForm((current) => ({ ...current, [key]: value }));
  };

  const swapLocations = () => {
    searchRequest.current += 1;
    setSearching(false);
    setHasSearched(false);
    setRoute(null);
    setSelectedCab(null);
    setSearchError("");
    setForm((current) => ({
      ...current,
      pickupLocation: current.dropoffLocation,
      dropoffLocation: current.pickupLocation,
    }));
  };

  const toggleFilter = (
    current: string[],
    value: string,
    setter: (next: string[]) => void,
  ) => {
    setter(current.includes(value) ? current.filter((entry) => entry !== value) : [...current, value]);
  };

  const clearFilters = () => {
    setCategoryFilters([]);
    setFuelFilters([]);
    setModelFilters([]);
    setSeatFilter("all");
    setMaxFare("");
  };

  const openCab = (cab: Cab) => {
    setSelectedCab(cab);
    setRoofCarrier(false);
    setBookingError("");
    setConfirmation(null);
    setPassengers(1);
    setLuggage(Math.min(1, cab.luggageCapacity));
  };

  const submitBooking = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedCab || !route) return;
    setBookingBusy(true);
    setBookingError("");
    try {
      const response = await fetch("/api/cab-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cabId: selectedCab._id,
          tripType: form.tripType,
          pickupLocation: form.pickupLocation,
          dropoffLocation: form.dropoffLocation,
          stops: form.stops,
          pickupDate: form.pickupDate,
          pickupTime: form.pickupTime,
          pickupAt: new Date(`${form.pickupDate}T${form.pickupTime}:00`).toISOString(),
          returnDate: form.tripType === "round-trip" ? form.returnDate : undefined,
          returnTime: form.tripType === "round-trip" ? form.returnTime : undefined,
          returnAt: form.tripType === "round-trip"
            ? new Date(`${form.returnDate}T${form.returnTime}:00`).toISOString()
            : undefined,
          passengers,
          luggage,
          roofCarrier,
          ...guest,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your request could not be submitted.");
      setConfirmation({
        bookingReference: data.bookingReference,
        estimatedFare: Number(data.estimatedFare),
        message: data.message,
      });
      setFleet((current) =>
        current.map((cab) =>
          cab._id === selectedCab._id ? { ...cab, isAvailable: false } : cab,
        ),
      );
      setSelectedCab(null);
    } catch (error) {
      setBookingError(
        error instanceof Error ? error.message : "Your request could not be submitted.",
      );
    } finally {
      setBookingBusy(false);
    }
  };

  const clearBooking = () => {
    setSelectedCab(null);
    setConfirmation(null);
    setBookingError("");
  };

  const renderFilterGroup = (
    title: string,
    options: string[],
    selected: string[],
    setter: (next: string[]) => void,
    counts: Map<string, number>,
  ) => (
    <details className={styles.filterGroup} open>
      <summary>
        <span>{title}</span>
        <ChevronDown size={16} aria-hidden="true" />
      </summary>
      <div className={styles.filterOptions}>
        {options.map((option) => (
          <label className={styles.filterOption} key={option}>
            <input
              type="checkbox"
              checked={selected.includes(option)}
              onChange={() => toggleFilter(selected, option, setter)}
            />
            <span>{option}</span>
            <small>{counts.get(option) ?? 0}</small>
          </label>
        ))}
        {selected.length > 0 && (
          <button className={styles.clearSection} onClick={() => setter([])} type="button">
            Clear {title.toLowerCase()}
          </button>
        )}
      </div>
    </details>
  );

  const categoryCounts = new Map(
    categories.map((category) => [
      category,
      availableFleet.filter((cab) => cab.category === category).length,
    ]),
  );
  const fuelCounts = new Map(
    fuels.map((fuel) => [
      fuel,
      availableFleet.filter((cab) => cab.fuelType === fuel).length,
    ]),
  );
  const modelCounts = new Map(
    models.map((model) => [
      model,
      availableFleet.filter((cab) => cab.model === model).length,
    ]),
  );
  const seatOptions = [...new Set(availableFleet.map((cab) => cab.seats))].sort((a, b) => a - b);

  return (
    <main
      className={`${styles.page} ${hasSearched && showFloatingSearch ? styles.capsuleVisible : ""}`}
    >
      <Header currentPage="cabs" solidHeader />
      {hasSearched && showFloatingSearch && (
        <div className={styles.floatingSearch} aria-label="Update your cab search">
          <label className={styles.floatingTripType}>
            <span>TRIP</span>
            <select
              aria-label="Trip type"
              value={capsuleForm.tripType}
              onChange={(event) =>
                setCapsuleForm({
                  ...capsuleForm,
                  tripType: event.target.value as TripType,
                })
              }
            >
              <option value="one-way">One way</option>
              <option value="round-trip">Round trip</option>
              <option value="airport-transfer">Airport</option>
            </select>
          </label>
          <div className={styles.floatingLocation}>
            <MapPin size={15} aria-hidden="true" />
            <LocationDropdown
              value={capsuleForm.pickupLocation}
              onChange={(value) =>
                setCapsuleForm({ ...capsuleForm, pickupLocation: value })
              }
              placeholder="Pickup"
              variant="cab"
              maxLength={180}
            />
          </div>
          <ArrowRight className={styles.floatingArrow} size={16} aria-hidden="true" />
          <div className={styles.floatingLocation}>
            <MapPin size={15} aria-hidden="true" />
            <LocationDropdown
              value={capsuleForm.dropoffLocation}
              onChange={(value) =>
                setCapsuleForm({ ...capsuleForm, dropoffLocation: value })
              }
              placeholder="Drop-off"
              variant="cab"
              maxLength={180}
            />
          </div>
          <label className={styles.floatingDate}>
            <CalendarDays size={15} aria-hidden="true" />
            <input
              aria-label="Departure date"
              type="date"
              min={localDate()}
              value={capsuleForm.pickupDate}
              onChange={(event) =>
                setCapsuleForm({ ...capsuleForm, pickupDate: event.target.value })
              }
            />
          </label>
          <label className={styles.floatingDate}>
            <Clock3 size={15} aria-hidden="true" />
            <select
              aria-label="Pickup time"
              value={capsuleForm.pickupTime}
              onChange={(event) =>
                setCapsuleForm({ ...capsuleForm, pickupTime: event.target.value })
              }
            >
              {timeOptions.map((option) => (
                <option value={option.value} key={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          {capsuleForm.tripType === "round-trip" && (
            <>
              <label className={styles.floatingDate}>
                <CalendarDays size={15} aria-hidden="true" />
                <input
                  aria-label="Return date"
                  type="date"
                  min={capsuleForm.pickupDate}
                  value={capsuleForm.returnDate}
                  onChange={(event) =>
                    setCapsuleForm({ ...capsuleForm, returnDate: event.target.value })
                  }
                />
              </label>
              <label className={styles.floatingDate}>
                <Clock3 size={15} aria-hidden="true" />
                <select
                  aria-label="Return time"
                  value={capsuleForm.returnTime}
                  onChange={(event) =>
                    setCapsuleForm({ ...capsuleForm, returnTime: event.target.value })
                  }
                >
                  {timeOptions.map((option) => (
                    <option value={option.value} key={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </>
          )}
          <button
            type="button"
            className={styles.floatingUpdate}
            onClick={() => void runSearch(capsuleForm)}
            disabled={searching}
          >
            {searching ? <span className={styles.spinner} /> : <Search size={16} />}
            {searching ? "Updating" : "Update"}
          </button>
          {searchError && <p className={styles.floatingError} role="alert">{searchError}</p>}
        </div>
      )}
      <section className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.eyebrow}><Sparkles size={15} /> YOUR NEXT RIDE, MADE SIMPLE</div>
          <h1>Find a cab that fits your trip.</h1>
          <p>Compare available vehicles and get a route-based fare estimate before you book.</p>
        </div>
      </section>

      <section className={styles.searchWrap} aria-label="Search for a cab">
        <div className={styles.searchCard}>
          <div className={styles.tripTabs} role="tablist" aria-label="Trip type">
            {([
              ["one-way", "Outstation one-way"],
              ["round-trip", "Outstation round-trip"],
              ["airport-transfer", "Airport transfers"],
            ] as const).map(([type, label]) => (
              <button
                type="button"
                role="tab"
                aria-selected={form.tripType === type}
                className={`${styles.tripTab} ${form.tripType === type ? styles.tripTabActive : ""}`}
                key={type}
                onClick={() => updateForm("tripType", type)}
              >
                {label}
              </button>
            ))}
            <button type="button" className={styles.tripTabDisabled} disabled title="Hourly package prices have not been configured.">
              Hourly rentals <span>Not available</span>
            </button>
          </div>
          <p className={styles.hourlyNote}>
            Hourly rentals will be available once package durations and rates are configured.
          </p>

          <div className={styles.routeGrid}>
            <div className={styles.locationPair}>
              <label className={styles.locationField}>
                <span><MapPin size={16} /> PICK-UP LOCATION</span>
                <LocationDropdown
                  value={form.pickupLocation}
                  onChange={(value) => updateForm("pickupLocation", value)}
                  placeholder="City, airport or terminal"
                  variant="cab"
                  required
                  maxLength={180}
                />
              </label>
              <button className={styles.swapButton} type="button" onClick={swapLocations} aria-label="Swap pickup and drop-off">
                <ArrowDownUp size={18} />
              </button>
              <label className={styles.locationField}>
                <span><MapPin size={16} /> DROP-OFF LOCATION</span>
                <LocationDropdown
                  value={form.dropoffLocation}
                  onChange={(value) => updateForm("dropoffLocation", value)}
                  placeholder="Where would you like to go?"
                  variant="cab"
                  required
                  maxLength={180}
                />
              </label>
            </div>
            <label className={styles.dateField}>
              <span><CalendarDays size={16} /> DEPARTURE</span>
              <input
                type="date"
                min={localDate()}
                value={form.pickupDate}
                onChange={(event) => updateForm("pickupDate", event.target.value)}
                required
              />
            </label>
            <label className={styles.dateField}>
              <span><Clock3 size={16} /> PICK-UP TIME</span>
              <select value={form.pickupTime} onChange={(event) => updateForm("pickupTime", event.target.value)}>
                {timeOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
              </select>
            </label>
            {form.tripType === "round-trip" && (
              <>
                <label className={styles.dateField}>
                  <span><CalendarDays size={16} /> RETURN</span>
                  <input
                    type="date"
                    min={form.pickupDate}
                    value={form.returnDate}
                    onChange={(event) => updateForm("returnDate", event.target.value)}
                    required
                  />
                </label>
                <label className={styles.dateField}>
                  <span><Clock3 size={16} /> RETURN TIME</span>
                  <select value={form.returnTime} onChange={(event) => updateForm("returnTime", event.target.value)}>
                    {timeOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
                  </select>
                </label>
              </>
            )}
          </div>

          {form.stops.map((stop, index) => (
            <div className={styles.stopRow} key={`stop-${index}`}>
              <label className={styles.locationField}>
                <span><MapPin size={16} /> STOP {index + 1}</span>
                <LocationDropdown
                  value={stop}
                  onChange={(value) => updateForm("stops", form.stops.map((item, itemIndex) => itemIndex === index ? value : item))}
                  placeholder="Add an intermediate stop"
                  variant="cab"
                  maxLength={180}
                />
              </label>
              <button
                type="button"
                className={styles.removeStop}
                aria-label={`Remove stop ${index + 1}`}
                onClick={() => updateForm("stops", form.stops.filter((_, itemIndex) => itemIndex !== index))}
              >
                <X size={17} />
              </button>
            </div>
          ))}
          <div className={styles.searchActions}>
            <button
              className={styles.addStop}
              type="button"
              disabled={form.stops.length >= 5}
              onClick={() => updateForm("stops", [...form.stops, ""])}
            >
              <Plus size={16} /> Add a stop
            </button>
            <button className={styles.searchButton} type="button" onClick={() => void runSearch(form)} disabled={searching}>
              {searching ? <span className={styles.spinner} /> : <Search size={18} />}
              {searching ? "SEARCHING..." : "SEARCH CABS"}
            </button>
          </div>
          {searchError && <p className={styles.errorMessage} role="alert">{searchError}</p>}
        </div>
      </section>

      {hasSearched && route && (
        <section
          ref={resultsSectionRef}
          className={styles.resultsSection}
          aria-label="Available cabs"
        >
          <div className={styles.resultsHeading}>
            <div>
              <span className={styles.sectionEyebrow}>YOUR ROUTE</span>
              <h2>{form.pickupLocation} <ArrowRight size={20} /> {form.dropoffLocation}</h2>
              <p>
                {form.tripType === "round-trip" ? "Round trip" : form.tripType === "airport-transfer" ? "Airport transfer" : "One way"}
                {form.stops.length > 0 ? ` · ${form.stops.length} stop${form.stops.length > 1 ? "s" : ""}` : ""}
                {" · "}{new Date(`${form.pickupDate}T00:00:00`).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                {" · "}{formatTime(form.pickupTime)}
              </p>
            </div>
            <button className={styles.modifyButton} type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
              Modify search
            </button>
          </div>

          <div className={styles.factsRow}>
            <div><MapPin size={17} /><strong>{route.distanceKm} km</strong><span>Estimated distance</span></div>
            <div><Clock3 size={17} /><strong>{formatDuration(route.durationMinutes)}</strong><span>Estimated drive time</span></div>
            <div><ShieldCheck size={17} /><strong>Availability checked</strong><span>Based on your trip time</span></div>
            <div><BadgeCheck size={17} /><strong>Clear fare breakdown</strong><span>Base, distance and taxes</span></div>
          </div>
          <p className={styles.estimateNote}>Route and fare are estimates; the team confirms final availability and fare after your request.</p>

          <div className={styles.resultsLayout}>
            <aside className={`${styles.filters} ${filtersOpen ? styles.filtersOpen : ""}`} aria-label="Cab filters">
              <div className={styles.filtersHeader}>
                <h3><SlidersHorizontal size={17} /> Filters</h3>
                <button type="button" onClick={clearFilters}>Clear all</button>
                <button className={styles.closeFilters} type="button" aria-label="Close filters" onClick={() => setFiltersOpen(false)}><X size={18} /></button>
              </div>
              {renderFilterGroup("Cab type", categories, categoryFilters, setCategoryFilters, categoryCounts)}
              {renderFilterGroup("Fuel type", fuels, fuelFilters, setFuelFilters, fuelCounts)}
              {renderFilterGroup("Cab model", models, modelFilters, setModelFilters, modelCounts)}
              <details className={styles.filterGroup} open>
                <summary><span>Seats</span><ChevronDown size={16} /></summary>
                <div className={styles.filterOptions}>
                  <label className={styles.filterOption}>
                    <input type="radio" name="seat-filter" checked={seatFilter === "all"} onChange={() => setSeatFilter("all")} />
                    <span>Any capacity</span><small>{availableFleet.length}</small>
                  </label>
                  {seatOptions.map((seats) => (
                    <label className={styles.filterOption} key={seats}>
                      <input type="radio" name="seat-filter" checked={seatFilter === String(seats)} onChange={() => setSeatFilter(String(seats))} />
                      <span>{seats} seats</span><small>{availableFleet.filter((cab) => cab.seats === seats).length}</small>
                    </label>
                  ))}
                </div>
              </details>
              <details className={styles.filterGroup} open>
                <summary><span>Maximum fare</span><ChevronDown size={16} /></summary>
                <label className={styles.priceFilter}>
                  <span>Up to ₹</span>
                  <input type="number" min="0" step="500" value={maxFare} onChange={(event) => setMaxFare(event.target.value)} placeholder="Any fare" />
                </label>
                {maxFare && <button className={styles.clearSection} type="button" onClick={() => setMaxFare("")}>Clear fare</button>}
              </details>
            </aside>

            <div className={styles.listingColumn}>
              <div className={styles.listingToolbar}>
                <div>
                  <h3>{filteredFleet.length} {filteredFleet.length === 1 ? "cab" : "cabs"} available</h3>
                  <span>Vehicles listed from the current fleet</span>
                </div>
                <div className={styles.sortControls}>
                  <button className={styles.mobileFilterButton} type="button" onClick={() => setFiltersOpen(true)}><SlidersHorizontal size={16} /> Filters</button>
                  <label>Sort by
                    <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                      <option value="price">Price: low to high</option>
                      <option value="price-desc">Price: high to low</option>
                      <option value="rating">Rating</option>
                      <option value="category">Vehicle type</option>
                    </select>
                  </label>
                </div>
              </div>

              {searching ? (
                <div className={styles.stateCard}><span className={styles.spinner} /> Checking vehicles for your dates…</div>
              ) : filteredFleet.length === 0 ? (
                <div className={styles.emptyState}>
                  <CarFront size={35} />
                  <h3>{availableFleet.length ? "No cabs match these filters" : "No vehicles available for this trip"}</h3>
                  <p>{availableFleet.length ? "Try clearing one or more filters." : "Try another date or route, or modify your search."}</p>
                  {availableFleet.length > 0 && <button type="button" className={styles.secondaryButton} onClick={clearFilters}>Clear filters</button>}
                </div>
              ) : (
                <div className={styles.cabList}>
                  {filteredFleet.map((cab) => {
                    const quote = quoteFor(cab, route.distanceKm, form.tripType);
                    return (
                      <article className={styles.cabCard} key={cab._id}>
                        <div className={styles.vehicleVisual}>
                          <div className={styles.vehicleTile}>
                            <VehicleIllustration category={cab.category} />
                            {cab.fuelType && (
                              <span
                                className={`${styles.fuelBadge} ${
                                  cab.fuelType.toLocaleLowerCase().includes("electric")
                                    ? styles.electricFuel
                                    : styles.otherFuel
                                }`}
                              >
                                {cab.fuelType}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className={styles.cabDetails}>
                          <span className={styles.categoryBadge}>{cab.category}</span>
                          <h3>{cab.model}</h3>
                          <p className={styles.similarLabel}>Model may vary · similar vehicle provided</p>
                          <div className={styles.specs}>
                            <span><Users size={15} /> {cab.seats} seats</span>
                            <span><BriefcaseBusiness size={15} /> {cab.luggageCapacity} bags</span>
                            {cab.fuelType && <span>{cab.fuelType}</span>}
                            {cab.color && <span>{cab.color}</span>}
                          </div>
                          {cab.rating !== null && <div className={styles.rating}><Star size={14} fill="currentColor" /> {cab.rating.toFixed(1)} <span>fleet rating</span></div>}
                        </div>
                        <div className={styles.cabFare}>
                          <span className={styles.estimateTag}>ESTIMATED FARE</span>
                          <strong>{money.format(quote.total)}</strong>
                          <span>Taxes included</span>
                          <button type="button" onClick={() => openCab(cab)}>SELECT CAB <ArrowRight size={16} /></button>
                          <small>Final fare confirmed after request</small>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {!hasSearched && (
        <section className={styles.promiseRow} aria-label="Booking information">
          <div><ShieldCheck size={21} /><span><strong>Availability checked</strong><small>Matched to your trip time</small></span></div>
          <div><CircleHelp size={21} /><span><strong>Clear estimates</strong><small>See fare components before requesting</small></span></div>
          <div><BadgeCheck size={21} /><span><strong>Request, then confirm</strong><small>Our team confirms your booking</small></span></div>
        </section>
      )}

      {filtersOpen && <button className={styles.drawerBackdrop} onClick={() => setFiltersOpen(false)} aria-label="Close filters" />}

      {(selectedCab || confirmation) && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !bookingBusy) clearBooking();
        }}>
          {confirmation ? (
            <section className={styles.confirmationModal} role="dialog" aria-modal="true" aria-labelledby="confirmation-title">
              <button className={styles.modalClose} type="button" aria-label="Close confirmation" onClick={clearBooking}><X size={20} /></button>
              <div className={styles.successIcon}><Check size={30} /></div>
              <span className={styles.sectionEyebrow}>REQUEST RECEIVED</span>
              <h2 id="confirmation-title">Your cab request is in.</h2>
              <p>{confirmation.message}</p>
              <div className={styles.referenceBox}><span>BOOKING REFERENCE</span><strong>{confirmation.bookingReference}</strong></div>
              <div className={styles.confirmationFare}><span>Estimated payable</span><strong>{money.format(confirmation.estimatedFare)}</strong></div>
              <button className={styles.searchButton} type="button" onClick={clearBooking}>DONE</button>
            </section>
          ) : selectedCab && route ? (
            <section className={styles.bookingModal} role="dialog" aria-modal="true" aria-labelledby="booking-title">
              <div className={styles.modalHeader}>
                <div><span className={styles.sectionEyebrow}>REVIEW YOUR RIDE</span><h2 id="booking-title">{selectedCab.model}</h2></div>
                <button className={styles.modalClose} type="button" aria-label="Close" onClick={clearBooking} disabled={bookingBusy}><X size={20} /></button>
              </div>
              <div className={styles.tripReview}>
                <div className={styles.routeLine}>
                  <span className={styles.routeDot} />
                  <div><small>PICK-UP · {form.pickupDate} · {formatTime(form.pickupTime)}</small><strong>{form.pickupLocation}</strong></div>
                </div>
                {form.stops.map((stop, index) => <div className={styles.routeLine} key={stop + index}><span className={styles.routeStopDot} /><div><small>STOP {index + 1}</small><strong>{stop}</strong></div></div>)}
                <div className={styles.routeLine}>
                  <span className={`${styles.routeDot} ${styles.routeEndDot}`} />
                  <div><small>DROP-OFF</small><strong>{form.dropoffLocation}</strong></div>
                </div>
                {form.tripType === "round-trip" && <div className={styles.returnSummary}>Return · {form.returnDate} · {formatTime(form.returnTime)}</div>}
              </div>
              <div className={styles.modalColumns}>
                <form className={styles.guestForm} onSubmit={submitBooking}>
                  <h3>Passenger details</h3>
                  <label>Full name<input required maxLength={100} value={guest.fullName} onChange={(event) => setGuest({ ...guest, fullName: event.target.value })} /></label>
                  <div className={styles.guestGrid}>
                    <label>Phone<input required type="tel" maxLength={30} value={guest.phone} onChange={(event) => setGuest({ ...guest, phone: event.target.value })} /></label>
                    <label>Email<input required type="email" maxLength={254} value={guest.email} onChange={(event) => setGuest({ ...guest, email: event.target.value })} /></label>
                  </div>
                  <div className={styles.guestGrid}>
                    <label>Passengers
                      <span className={styles.counter}><button type="button" aria-label="Remove passenger" onClick={() => setPassengers(Math.max(1, passengers - 1))}><Minus size={14} /></button><strong>{passengers}</strong><button type="button" aria-label="Add passenger" onClick={() => setPassengers(Math.min(selectedCab.seats, passengers + 1))}><Plus size={14} /></button></span>
                    </label>
                    <label>Luggage bags
                      <span className={styles.counter}><button type="button" aria-label="Remove bag" onClick={() => setLuggage(Math.max(0, luggage - 1))}><Minus size={14} /></button><strong>{luggage}</strong><button type="button" aria-label="Add bag" onClick={() => setLuggage(Math.min(selectedCab.luggageCapacity, luggage + 1))}><Plus size={14} /></button></span>
                    </label>
                  </div>
                  {selectedCab.roofCarrierAvailable && (
                    <label className={styles.addonOption}>
                      <input type="checkbox" checked={roofCarrier} onChange={(event) => setRoofCarrier(event.target.checked)} />
                      <span><strong>Add roof carrier</strong><small>Fit up to 4 additional bags · {money.format(209)}</small></span>
                    </label>
                  )}
                  <label>Notes for the driver (optional)<textarea rows={2} maxLength={1000} value={guest.notes} onChange={(event) => setGuest({ ...guest, notes: event.target.value })} /></label>
                  {bookingError && <p className={styles.errorMessage} role="alert">{bookingError}</p>}
                  <button className={styles.searchButton} type="submit" disabled={bookingBusy}>
                    {bookingBusy ? <span className={styles.spinner} /> : null}
                    {bookingBusy ? "SENDING REQUEST…" : "CONTINUE / BOOK NOW"}
                  </button>
                </form>
                <aside className={styles.fareBreakdown}>
                  <h3>Fare estimate</h3>
                  <div><span>Base fare</span><strong>{money.format(selectedCab.baseFare)}</strong></div>
                  <div><span>Distance · {quoteFor(selectedCab, route.distanceKm, form.tripType).billedDistance} km</span><strong>{money.format(Math.round(quoteFor(selectedCab, route.distanceKm, form.tripType).billedDistance * selectedCab.perKmRate))}</strong></div>
                  {selectedCab.driverAllowance > 0 && <div><span>Driver allowance</span><strong>{money.format(selectedCab.driverAllowance)}</strong></div>}
                  <div><span>Taxes</span><strong>{money.format(quoteFor(selectedCab, route.distanceKm, form.tripType).tax)}</strong></div>
                  {roofCarrier && <div><span>Roof carrier</span><strong>{money.format(209)}</strong></div>}
                  <div className={styles.totalFare}><span>Estimated total</span><strong>{money.format(quoteFor(selectedCab, route.distanceKm, form.tripType).total + (roofCarrier ? 209 : 0))}</strong></div>
                  <p>Final fare and vehicle availability are confirmed by our team before the booking is finalized.</p>
                </aside>
              </div>
            </section>
          ) : null}
        </div>
      )}
    </main>
  );
}
