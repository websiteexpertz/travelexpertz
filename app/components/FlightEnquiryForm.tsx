"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Plus, Trash2, Loader2, ArrowRight } from "lucide-react";

interface MultiCitySegment {
  id: string;
  from: string;
  to: string;
  departureDate: string;
}

export default function FlightEnquiryForm() {
  const today = new Date().toISOString().split("T")[0];

  // 1. Journey Details
  const [tripType, setTripType] = useState<"one-way" | "round-trip" | "multi-city">("one-way");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [departureTime, setDepartureTime] = useState("Any Time");
  const [preferredAirline, setPreferredAirline] = useState("");
  const [travelClass, setTravelClass] = useState("Economy");

  // Multi-City segments
  const [segments, setSegments] = useState<MultiCitySegment[]>([
    { id: "1", from: "", to: "", departureDate: "" },
    { id: "2", from: "", to: "", departureDate: "" },
  ]);

  // 2. Passenger Details
  const [adults, setAdults] = useState<number>(1);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [infants, setInfants] = useState<number>(0);
  const [passengerNames, setPassengerNames] = useState("");

  // 3. Contact Information
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [sameAsMobile, setSameAsMobile] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [country, setCountry] = useState("India");

  // 4. Additional Requirements
  const [specialAssistance, setSpecialAssistance] = useState<"No" | "Yes">("No");
  const [extraBaggage, setExtraBaggage] = useState<"No" | "Yes">("No");
  const [mealPreference, setMealPreference] = useState("No Preference");
  const [additionalRequirements, setAdditionalRequirements] = useState("");

  // 5. Submit Controls & State
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [referenceId, setReferenceId] = useState("");
  const [serverError, setServerError] = useState("");

  const handleMobileChange = (val: string) => {
    setMobile(val);
    if (sameAsMobile) {
      setWhatsapp(val);
    }
  };

  const handleSameAsMobileToggle = (checked: boolean) => {
    setSameAsMobile(checked);
    if (checked) {
      setWhatsapp(mobile);
    }
  };

  const addSegment = () => {
    setSegments((prev) => [
      ...prev,
      { id: Date.now().toString(), from: "", to: "", departureDate: "" },
    ]);
  };

  const removeSegment = (id: string) => {
    if (segments.length <= 2) return;
    setSegments((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSegment = (id: string, field: "from" | "to" | "departureDate", value: string) => {
    setSegments((prev) =>
      prev.map((s) => (s.id === id ? { ...s, [field]: value } : s))
    );
  };

  const validate = (): boolean => {
    const err: Record<string, string> = {};

    if (tripType !== "multi-city") {
      if (!from.trim()) err.from = "Departure city or airport is required.";
      if (!to.trim()) err.to = "Destination city or airport is required.";
      if (!departureDate) err.departureDate = "Departure date is required.";
      if (tripType === "round-trip") {
        if (!returnDate) {
          err.returnDate = "Return date is required for round trips.";
        } else if (departureDate && returnDate < departureDate) {
          err.returnDate = "Return date cannot be earlier than departure date.";
        }
      }
    } else {
      segments.forEach((seg, idx) => {
        if (!seg.from.trim()) err[`seg_${idx}_from`] = `Flight ${idx + 1}: Departure is required.`;
        if (!seg.to.trim()) err[`seg_${idx}_to`] = `Flight ${idx + 1}: Destination is required.`;
        if (!seg.departureDate) err[`seg_${idx}_date`] = `Flight ${idx + 1}: Date is required.`;
      });
    }

    if (adults < 1) err.adults = "At least 1 adult passenger is required.";
    if (infants > adults) err.infants = "Infants cannot exceed the number of adults.";

    if (!fullName.trim()) err.fullName = "Full name is required.";
    if (!email.trim()) {
      err.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err.email = "Please enter a valid email address.";
    }
    if (!mobile.trim()) {
      err.mobile = "Mobile number is required.";
    } else if (!/^\+?[0-9\s-]{8,16}$/.test(mobile.trim())) {
      err.mobile = "Please enter a valid phone number (min 8 digits).";
    }

    if (!country.trim()) err.country = "Country is required.";
    if (!consent) err.consent = "Please accept the consent and privacy policy to proceed.";

    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validate()) {
      const firstErrorKey = Object.keys(errors)[0];
      const element = document.getElementById(firstErrorKey);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSubmitting(true);

    const payload = {
      serviceType: "flight",
      enquiryType: "FLIGHT",
      tripType,
      from: tripType === "multi-city" ? segments[0]?.from : from,
      to: tripType === "multi-city" ? segments[segments.length - 1]?.to : to,
      departureDate: tripType === "multi-city" ? segments[0]?.departureDate : departureDate,
      returnDate: tripType === "round-trip" ? returnDate : null,
      departureTime,
      preferredAirline,
      travelClass,
      segments: tripType === "multi-city" ? segments : undefined,
      adults,
      children: childrenCount,
      infants,
      passengerNames,
      fullName,
      email,
      mobile,
      whatsapp,
      country,
      specialAssistance,
      extraBaggage,
      mealPreference,
      additionalRequirements,
      consent,
    };

    try {
      const res = await fetch("/api/service-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to submit enquiry. Please try again.");
      }

      setReferenceId(data.bookingId || ("FLT-" + Math.floor(100000 + Math.random() * 900000)));
      setSubmitSuccess(true);
      window.scrollTo({ top: 120, behavior: "smooth" });
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setTripType("one-way");
    setFrom("");
    setTo("");
    setDepartureDate("");
    setReturnDate("");
    setDepartureTime("Any Time");
    setPreferredAirline("");
    setTravelClass("Economy");
    setAdults(1);
    setChildrenCount(0);
    setInfants(0);
    setPassengerNames("");
    setFullName("");
    setEmail("");
    setMobile("");
    setWhatsapp("");
    setSpecialAssistance("No");
    setExtraBaggage("No");
    setMealPreference("No Preference");
    setAdditionalRequirements("");
    setConsent(false);
    setSubmitSuccess(false);
    setErrors({});
  };

  return (
    <div
      style={{
        maxWidth: "1050px",
        marginLeft: "auto",
        marginRight: "auto",
        width: "100%",
      }}
      className="bg-white border border-[#DFE7F1] rounded-[20px] shadow-[0_4px_24px_rgba(20,33,57,0.06)] p-5 sm:p-6 lg:p-8"
    >
      {/* Form Heading Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 sm:pb-6 border-b border-[#E2E8F0] gap-3">
        <div>
          <h1 className="text-2xl sm:text-[28px] md:text-[30px] font-bold text-[#142139] tracking-tight leading-tight">
            Flight Booking Enquiry
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#64748B] mt-1.5 leading-[1.6]">
            Share your journey details and our team will help you find suitable flight options.
          </p>
        </div>
        <div className="self-start sm:self-center shrink-0">
          <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#E6F4F2] text-[#008F87] border border-[#B3E3DF] tracking-wide uppercase">
            Enquiry Form
          </span>
        </div>
      </div>

      {submitSuccess ? (
        <div className="py-12 px-4 text-center max-w-xl mx-auto animate-fadeIn">
          <div className="w-16 h-16 bg-[#E6F4F2] rounded-full flex items-center justify-center mx-auto mb-4 text-[#008F87]">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-[#142139] mb-2">
            Enquiry Submitted Successfully!
          </h2>
          <p className="text-[#64748B] text-sm sm:text-base leading-relaxed mb-4">
            Thank you for sharing your flight journey details. Our travel specialists will review your requirements and get in touch with the best flight options shortly.
          </p>
          {referenceId && (
            <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-3.5 mb-6 inline-block font-mono text-sm text-[#0F172A]">
              Reference ID: <span className="font-bold text-[#008F87]">{referenceId}</span>
            </div>
          )}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={resetForm}
              className="w-full sm:w-auto px-6 py-3 rounded-[10px] bg-[#008F87] text-white font-bold text-sm hover:bg-[#00736C] transition shadow-md cursor-pointer"
            >
              Submit Another Enquiry
            </button>
            <Link
              href="/hotels"
              className="w-full sm:w-auto px-6 py-3 rounded-[10px] border border-[#DFE7F1] text-[#334155] font-bold text-sm hover:bg-[#F8FAFC] transition text-center"
            >
              Explore Hotels
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} noValidate className="mt-7 space-y-8">
          {serverError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-start gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
              <span>{serverError}</span>
            </div>
          )}

          {/* SECTION 1 — JOURNEY DETAILS */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-3">
              <span
                style={{ width: "30px", height: "30px", borderRadius: "8px" }}
                className="bg-[#EEF4FD] text-[#1D68BD] font-bold text-xs flex items-center justify-center shrink-0"
              >
                01
              </span>
              <h3 className="text-[17px] sm:text-[18px] font-bold text-[#142139] tracking-tight">
                Journey Details
              </h3>
            </div>

            {/* 1. Trip Type */}
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                Trip Type <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {(
                  [
                    { value: "one-way", label: "One Way" },
                    { value: "round-trip", label: "Round Trip" },
                    { value: "multi-city", label: "Multi-City" },
                  ] as const
                ).map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setTripType(type.value)}
                    style={{ minHeight: "44px" }}
                    className={`px-5 py-2.5 rounded-[10px] text-sm font-bold border transition-all cursor-pointer ${
                      tripType === type.value
                        ? "bg-[#008F87] text-white border-[#008F87] shadow-sm"
                        : "bg-[#F8FAFC] text-[#334155] border-[#DFE7F1] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-City segments vs Standard One-Way/Round-Trip */}
            {tripType === "multi-city" ? (
              <div className="space-y-4 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
                    Flight Segments ({segments.length})
                  </span>
                  <button
                    type="button"
                    onClick={addSegment}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#008F87] hover:underline cursor-pointer"
                  >
                    <Plus className="w-4 h-4" /> Add Another Flight
                  </button>
                </div>

                {segments.map((seg, idx) => (
                  <div
                    key={seg.id}
                    className="p-4 rounded-xl border border-[#DFE7F1] bg-[#FAFCFF] relative space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#1D68BD] uppercase">
                        Flight {idx + 1}
                      </span>
                      {segments.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeSegment(seg.id)}
                          className="text-xs text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-2">
                          From (Departure) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={seg.from}
                          onChange={(e) => updateSegment(seg.id, "from", e.target.value)}
                          placeholder="Departure city or airport"
                          className="w-full h-[46px] px-3.5 rounded-[10px] border border-[#DFE7F1] text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15 bg-white"
                        />
                        {errors[`seg_${idx}_from`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`seg_${idx}_from`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-2">
                          To (Destination) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={seg.to}
                          onChange={(e) => updateSegment(seg.id, "to", e.target.value)}
                          placeholder="Destination city or airport"
                          className="w-full h-[46px] px-3.5 rounded-[10px] border border-[#DFE7F1] text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15 bg-white"
                        />
                        {errors[`seg_${idx}_to`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`seg_${idx}_to`]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-[#475569] mb-2">
                          Departure Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          min={today}
                          value={seg.departureDate}
                          onChange={(e) => updateSegment(seg.id, "departureDate", e.target.value)}
                          className="w-full h-[46px] px-3.5 rounded-[10px] border border-[#DFE7F1] text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15 bg-white"
                        />
                        {errors[`seg_${idx}_date`] && (
                          <p className="text-xs text-red-600 mt-1">{errors[`seg_${idx}_date`]}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
                {/* 2. From */}
                <div id="from">
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                    FROM (Departure City/Airport) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="Enter departure city or airport"
                    className={`w-full h-[46px] px-3.5 rounded-[10px] border ${
                      errors.from ? "border-red-500 bg-red-50/20" : "border-[#DFE7F1]"
                    } text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15`}
                  />
                  {errors.from && <p className="text-xs text-red-600 mt-1">{errors.from}</p>}
                </div>

                {/* 3. To */}
                <div id="to">
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                    TO (Destination City/Airport) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Enter destination city or airport"
                    className={`w-full h-[46px] px-3.5 rounded-[10px] border ${
                      errors.to ? "border-red-500 bg-red-50/20" : "border-[#DFE7F1]"
                    } text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15`}
                  />
                  {errors.to && <p className="text-xs text-red-600 mt-1">{errors.to}</p>}
                </div>

                {/* 4. Departure Date */}
                <div id="departureDate">
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                    DEPARTURE DATE <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={departureDate}
                    onChange={(e) => setDepartureDate(e.target.value)}
                    className={`w-full h-[46px] px-3.5 rounded-[10px] border ${
                      errors.departureDate ? "border-red-500 bg-red-50/20" : "border-[#DFE7F1]"
                    } text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15`}
                  />
                  {errors.departureDate && (
                    <p className="text-xs text-red-600 mt-1">{errors.departureDate}</p>
                  )}
                </div>

                {/* 5. Return Date */}
                <div id="returnDate">
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                    RETURN DATE {tripType === "round-trip" && <span className="text-red-500">*</span>}
                  </label>
                  <input
                    type="date"
                    min={departureDate || today}
                    disabled={tripType === "one-way"}
                    value={tripType === "one-way" ? "" : returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    placeholder={tripType === "one-way" ? "Not applicable for One Way" : ""}
                    className={`w-full h-[46px] px-3.5 rounded-[10px] border ${
                      errors.returnDate ? "border-red-500 bg-red-50/20" : "border-[#DFE7F1]"
                    } text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15 ${
                      tripType === "one-way" ? "bg-slate-100 text-slate-400 cursor-not-allowed" : "bg-white"
                    }`}
                  />
                  {errors.returnDate && (
                    <p className="text-xs text-red-600 mt-1">{errors.returnDate}</p>
                  )}
                </div>
              </div>
            )}

            {/* 6. Departure Time & 7. Preferred Airline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  PREFERRED DEPARTURE TIME
                </label>
                <select
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full h-[46px] px-3.5 rounded-[10px] border border-[#DFE7F1] text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15 bg-white"
                >
                  <option value="Any Time">Any Time</option>
                  <option value="Morning">Morning (06:00 - 12:00)</option>
                  <option value="Afternoon">Afternoon (12:00 - 18:00)</option>
                  <option value="Evening">Evening (18:00 - 24:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  PREFERRED AIRLINE <span className="text-slate-400 font-normal text-[11px] normal-case">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={preferredAirline}
                  onChange={(e) => setPreferredAirline(e.target.value)}
                  placeholder="Enter preferred airline (e.g. IndiGo, Air India)"
                  className="w-full h-[46px] px-3.5 rounded-[10px] border border-[#DFE7F1] text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15"
                />
              </div>
            </div>

            {/* 8. Class */}
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                TRAVEL CLASS <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                {(["Economy", "Premium Economy", "Business", "First Class"] as const).map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setTravelClass(cls)}
                    style={{ minHeight: "44px" }}
                    className={`py-2 px-3 rounded-[10px] text-xs sm:text-sm font-bold border transition-all cursor-pointer text-center ${
                      travelClass === cls
                        ? "bg-[#008F87] text-white border-[#008F87] shadow-sm"
                        : "bg-[#F8FAFC] text-[#334155] border-[#DFE7F1] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    {cls}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 2 — PASSENGER DETAILS */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-3">
              <span
                style={{ width: "30px", height: "30px", borderRadius: "8px" }}
                className="bg-[#EEF4FD] text-[#1D68BD] font-bold text-xs flex items-center justify-center shrink-0"
              >
                02
              </span>
              <h3 className="text-[17px] sm:text-[18px] font-bold text-[#142139] tracking-tight">
                Passenger Details
              </h3>
            </div>

            {/* 3 Evenly spaced counters on desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* 1. Adults */}
              <div id="adults">
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  ADULTS (12+ YEARS) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center h-[46px] rounded-[10px] border border-[#DFE7F1] bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setAdults((prev) => Math.max(1, prev - 1))}
                    className="w-12 h-full flex items-center justify-center text-lg font-bold text-[#64748B] hover:bg-[#F1F5F9] transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-sm text-[#142139]">
                    {adults}
                  </span>
                  <button
                    type="button"
                    onClick={() => setAdults((prev) => prev + 1)}
                    className="w-12 h-full flex items-center justify-center text-lg font-bold text-[#64748B] hover:bg-[#F1F5F9] transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
                {errors.adults && <p className="text-xs text-red-600 mt-1">{errors.adults}</p>}
              </div>

              {/* 2. Children */}
              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  CHILDREN (2–11 YEARS)
                </label>
                <div className="flex items-center h-[46px] rounded-[10px] border border-[#DFE7F1] bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setChildrenCount((prev) => Math.max(0, prev - 1))}
                    className="w-12 h-full flex items-center justify-center text-lg font-bold text-[#64748B] hover:bg-[#F1F5F9] transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-sm text-[#142139]">
                    {childrenCount}
                  </span>
                  <button
                    type="button"
                    onClick={() => setChildrenCount((prev) => prev + 1)}
                    className="w-12 h-full flex items-center justify-center text-lg font-bold text-[#64748B] hover:bg-[#F1F5F9] transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* 3. Infants */}
              <div id="infants">
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  INFANTS (BELOW 2 YEARS)
                </label>
                <div className="flex items-center h-[46px] rounded-[10px] border border-[#DFE7F1] bg-white overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setInfants((prev) => Math.max(0, prev - 1))}
                    className="w-12 h-full flex items-center justify-center text-lg font-bold text-[#64748B] hover:bg-[#F1F5F9] transition cursor-pointer"
                  >
                    -
                  </button>
                  <span className="flex-1 text-center font-bold text-sm text-[#142139]">
                    {infants}
                  </span>
                  <button
                    type="button"
                    onClick={() => setInfants((prev) => Math.min(adults, prev + 1))}
                    className="w-12 h-full flex items-center justify-center text-lg font-bold text-[#64748B] hover:bg-[#F1F5F9] transition cursor-pointer"
                  >
                    +
                  </button>
                </div>
                {errors.infants && <p className="text-xs text-red-600 mt-1">{errors.infants}</p>}
              </div>
            </div>

            {/* 4. Passenger Names (Full width below) */}
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                PASSENGER NAMES <span className="text-slate-400 font-normal text-[11px] normal-case">(Optional at enquiry stage)</span>
              </label>
              <textarea
                rows={2}
                value={passengerNames}
                onChange={(e) => setPassengerNames(e.target.value)}
                placeholder="e.g. John Doe (Adult), Jane Doe (Adult), Sam Doe (Child)"
                className="w-full p-3.5 rounded-[10px] border border-[#DFE7F1] text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15 resize-y"
              />
            </div>
          </div>

          {/* SECTION 3 — CONTACT INFORMATION */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-3">
              <span
                style={{ width: "30px", height: "30px", borderRadius: "8px" }}
                className="bg-[#EEF4FD] text-[#1D68BD] font-bold text-xs flex items-center justify-center shrink-0"
              >
                03
              </span>
              <h3 className="text-[17px] sm:text-[18px] font-bold text-[#142139] tracking-tight">
                Contact Information
              </h3>
            </div>

            {/* Row 1: Full Name | Email Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
              <div id="fullName">
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  FULL NAME <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className={`w-full h-[46px] px-3.5 rounded-[10px] border ${
                    errors.fullName ? "border-red-500 bg-red-50/20" : "border-[#DFE7F1]"
                  } text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15`}
                />
                {errors.fullName && <p className="text-xs text-red-600 mt-1">{errors.fullName}</p>}
              </div>

              <div id="email">
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  EMAIL ADDRESS <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className={`w-full h-[46px] px-3.5 rounded-[10px] border ${
                    errors.email ? "border-red-500 bg-red-50/20" : "border-[#DFE7F1]"
                  } text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15`}
                />
                {errors.email && <p className="text-xs text-red-600 mt-1">{errors.email}</p>}
              </div>
            </div>

            {/* Row 2: Mobile Number | WhatsApp Number */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
              <div id="mobile">
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  MOBILE NUMBER <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => handleMobileChange(e.target.value)}
                  placeholder="+91 9876543210"
                  className={`w-full h-[46px] px-3.5 rounded-[10px] border ${
                    errors.mobile ? "border-red-500 bg-red-50/20" : "border-[#DFE7F1]"
                  } text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15`}
                />
                {errors.mobile && <p className="text-xs text-red-600 mt-1">{errors.mobile}</p>}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider">
                    WHATSAPP NUMBER
                  </label>
                  <label className="inline-flex items-center gap-1.5 text-xs text-[#008F87] font-semibold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sameAsMobile}
                      onChange={(e) => handleSameAsMobileToggle(e.target.checked)}
                      className="rounded border-[#DFE7F1] text-[#008F87] focus:ring-[#008F87]"
                    />
                    Same as mobile
                  </label>
                </div>
                <input
                  type="tel"
                  value={whatsapp}
                  disabled={sameAsMobile}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Enter WhatsApp number (optional)"
                  className={`w-full h-[46px] px-3.5 rounded-[10px] border border-[#DFE7F1] text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15 ${
                    sameAsMobile ? "bg-slate-100 text-slate-500 cursor-not-allowed" : "bg-white"
                  }`}
                />
              </div>
            </div>

            {/* Row 3: Country */}
            <div id="country">
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                COUNTRY <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Enter your country"
                className="w-full h-[46px] px-3.5 rounded-[10px] border border-[#DFE7F1] text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15 bg-white font-medium"
              />
              {errors.country && <p className="text-xs text-red-600 mt-1">{errors.country}</p>}
            </div>
          </div>

          {/* SECTION 4 — ADDITIONAL REQUIREMENTS */}
          <div className="space-y-5">
            <div className="flex items-center gap-3 border-b border-[#F1F5F9] pb-3">
              <span
                style={{ width: "30px", height: "30px", borderRadius: "8px" }}
                className="bg-[#EEF4FD] text-[#1D68BD] font-bold text-xs flex items-center justify-center shrink-0"
              >
                04
              </span>
              <h3 className="text-[17px] sm:text-[18px] font-bold text-[#142139] tracking-tight">
                Additional Requirements
              </h3>
            </div>

            {/* Row 1: Special Assistance | Extra Baggage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  SPECIAL ASSISTANCE REQUIRED
                </label>
                <div className="flex gap-3">
                  {(["No", "Yes"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setSpecialAssistance(opt)}
                      style={{ minHeight: "44px" }}
                      className={`flex-1 py-2 rounded-[10px] text-sm font-bold border transition-all cursor-pointer ${
                        specialAssistance === opt
                          ? "bg-[#008F87] text-white border-[#008F87]"
                          : "bg-[#F8FAFC] text-[#334155] border-[#DFE7F1] hover:bg-[#F1F5F9]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  EXTRA BAGGAGE REQUIRED
                </label>
                <div className="flex gap-3">
                  {(["No", "Yes"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setExtraBaggage(opt)}
                      style={{ minHeight: "44px" }}
                      className={`flex-1 py-2 rounded-[10px] text-sm font-bold border transition-all cursor-pointer ${
                        extraBaggage === opt
                          ? "bg-[#008F87] text-white border-[#008F87]"
                          : "bg-[#F8FAFC] text-[#334155] border-[#DFE7F1] hover:bg-[#F1F5F9]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Row 2: Meal Preference */}
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                MEAL PREFERENCE <span className="text-slate-400 font-normal text-[11px] normal-case">(Optional)</span>
              </label>
              <select
                value={mealPreference}
                onChange={(e) => setMealPreference(e.target.value)}
                className="w-full h-[46px] px-3.5 rounded-[10px] border border-[#DFE7F1] text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15 bg-white font-medium"
              >
                <option value="No Preference">No Preference</option>
                <option value="Vegetarian Meal">Vegetarian Meal</option>
                <option value="Non-Vegetarian Meal">Non-Vegetarian Meal</option>
                <option value="Vegan Meal">Vegan Meal</option>
                <option value="Jain Meal">Jain Meal</option>
                <option value="Diabetic Meal">Diabetic Meal</option>
              </select>
            </div>

            {/* Row 3: Any Other Requirements (Textarea) */}
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                ANY OTHER REQUIREMENTS <span className="text-slate-400 font-normal text-[11px] normal-case">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={additionalRequirements}
                onChange={(e) => setAdditionalRequirements(e.target.value)}
                placeholder="Please mention any additional requirements for your flight journey."
                className="w-full p-3.5 rounded-[10px] border border-[#DFE7F1] text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15 resize-y"
              />
            </div>
          </div>

          {/* SECTION 5 — SUBMIT YOUR ENQUIRY */}
          <div
            style={{ borderRadius: "14px" }}
            className="p-5 bg-[#F8FAFC] border border-[#DFE7F1] space-y-4"
          >
            <div className="flex items-center gap-3">
              <span
                style={{ width: "30px", height: "30px", borderRadius: "8px" }}
                className="bg-[#EEF4FD] text-[#1D68BD] font-bold text-xs flex items-center justify-center shrink-0"
              >
                05
              </span>
              <h3 className="text-[17px] sm:text-[18px] font-bold text-[#142139] tracking-tight">
                Submit Your Enquiry
              </h3>
            </div>

            {/* Privacy Consent Checkbox */}
            <div id="consent" className="pt-1">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded border-[#DFE7F1] text-[#008F87] focus:ring-[#008F87] cursor-pointer"
                />
                <span className="text-xs sm:text-sm text-[#475569] leading-relaxed">
                  I agree to be contacted by Yatra Expertz regarding my flight booking enquiry and accept the{" "}
                  <Link
                    href="/privacy-policy"
                    target="_blank"
                    className="text-[#008F87] font-semibold underline hover:text-[#00736C]"
                  >
                    Privacy Policy
                  </Link>
                  . <span className="text-red-500">*</span>
                </span>
              </label>
              {errors.consent && <p className="text-xs text-red-600 mt-1">{errors.consent}</p>}
            </div>

            {/* Submission Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ backgroundColor: "#008F87", height: "48px" }}
                className="w-full rounded-[10px] text-white font-bold text-base tracking-wide uppercase transition-all duration-200 hover:brightness-95 active:scale-[0.99] flex items-center justify-center gap-2 shadow-lg shadow-[#008F87]/20 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Submitting Enquiry...</span>
                  </>
                ) : (
                  <>
                    <span>SUBMIT ENQUIRY</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </div>

            {/* Disclaimer */}
            <p className="text-xs text-[#64748B] text-center leading-relaxed pt-1">
              Our team will contact you with suitable flight options and booking assistance. Submission of this form does not confirm a flight reservation.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
