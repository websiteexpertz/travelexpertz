"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { CheckCircle2, AlertCircle, Loader2, ArrowRight } from "lucide-react";

export default function BusEnquiryForm() {
  const today = new Date().toISOString().split("T")[0];

  // 1. Journey Details
  const [journeyType, setJourneyType] = useState<"one-way" | "round-trip">("one-way");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [departureDate, setDepartureDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [departureTime, setDepartureTime] = useState("Any Time");
  const [busType, setBusType] = useState("AC");
  const [preferredOperator, setPreferredOperator] = useState("");

  // 2. Passenger Details
  const [adults, setAdults] = useState<number>(1);
  const [childrenCount, setChildrenCount] = useState<number>(0);
  const [preferredSeat, setPreferredSeat] = useState("Any Available");

  // Automatically calculate Total Number of Passengers
  const totalPassengers = useMemo(() => {
    return (Number(adults) || 0) + (Number(childrenCount) || 0);
  }, [adults, childrenCount]);

  // 3. Contact Information
  const [fullName, setFullName] = useState("");
  const [mobile, setMobile] = useState("");
  const [sameAsMobile, setSameAsMobile] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [cityCountry, setCityCountry] = useState("");

  // 4. Additional Requirements
  const [boardingPoint, setBoardingPoint] = useState("");
  const [droppingPoint, setDroppingPoint] = useState("");
  const [luggage, setLuggage] = useState("");
  const [specialAssistance, setSpecialAssistance] = useState<"No" | "Yes">("No");
  const [otherInstructions, setOtherInstructions] = useState("");

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

  const validate = (): boolean => {
    const err: Record<string, string> = {};

    if (!from.trim()) err.from = "Departure city is required.";
    if (!to.trim()) err.to = "Destination city is required.";
    if (!departureDate) err.departureDate = "Departure date is required.";

    if (journeyType === "round-trip") {
      if (!returnDate) {
        err.returnDate = "Return date is required for round trips.";
      } else if (departureDate && returnDate < departureDate) {
        err.returnDate = "Return date cannot be earlier than departure date.";
      }
    }

    if (adults < 1) err.adults = "At least 1 adult passenger is required.";

    if (!fullName.trim()) err.fullName = "Full name is required.";
    if (!mobile.trim()) {
      err.mobile = "Mobile number is required.";
    } else if (!/^\+?[0-9\s-]{8,16}$/.test(mobile.trim())) {
      err.mobile = "Please enter a valid phone number (min 8 digits).";
    }

    if (!email.trim()) {
      err.email = "Email address is required.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      err.email = "Please enter a valid email address.";
    }

    if (!cityCountry.trim()) err.cityCountry = "City / Country is required.";
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
      serviceType: "bus",
      enquiryType: "BUS",
      journeyType,
      from,
      to,
      departureDate,
      returnDate: journeyType === "round-trip" ? returnDate : null,
      departureTime,
      busType,
      preferredOperator,
      adults,
      children: childrenCount,
      totalPassengers,
      preferredSeat,
      fullName,
      mobile,
      whatsapp,
      email,
      cityCountry,
      boardingPoint,
      droppingPoint,
      luggage,
      specialAssistance,
      otherInstructions,
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

      setReferenceId(data.bookingId || ("BUS-" + Math.floor(100000 + Math.random() * 900000)));
      setSubmitSuccess(true);
      window.scrollTo({ top: 120, behavior: "smooth" });
    } catch (err: any) {
      setServerError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setJourneyType("one-way");
    setFrom("");
    setTo("");
    setDepartureDate("");
    setReturnDate("");
    setDepartureTime("Any Time");
    setBusType("AC");
    setPreferredOperator("");
    setAdults(1);
    setChildrenCount(0);
    setPreferredSeat("Any Available");
    setFullName("");
    setMobile("");
    setWhatsapp("");
    setEmail("");
    setCityCountry("");
    setBoardingPoint("");
    setDroppingPoint("");
    setLuggage("");
    setSpecialAssistance("No");
    setOtherInstructions("");
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
            Bus Ticket Enquiry
          </h1>
          <p className="text-[13px] sm:text-[14px] text-[#64748B] mt-1.5 leading-[1.6]">
            Share your journey details and our team will help you find suitable bus travel options.
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
            Thank you for sharing your bus travel requirements. Our reservations desk will check real-time seat availability and connect with you with the best options shortly.
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

            {/* 1. Journey Type */}
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                JOURNEY TYPE <span className="text-red-500">*</span>
              </label>
              <div className="flex flex-wrap gap-2.5 sm:gap-3">
                {(
                  [
                    { value: "one-way", label: "One Way" },
                    { value: "round-trip", label: "Round Trip" },
                  ] as const
                ).map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setJourneyType(type.value)}
                    style={{ minHeight: "44px" }}
                    className={`px-5 py-2.5 rounded-[10px] text-sm font-bold border transition-all cursor-pointer ${
                      journeyType === type.value
                        ? "bg-[#008F87] text-white border-[#008F87] shadow-sm"
                        : "bg-[#F8FAFC] text-[#334155] border-[#DFE7F1] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 2. From | 3. To */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
              <div id="from">
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  FROM (Departure City) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  placeholder="Enter departure city"
                  className={`w-full h-[46px] px-3.5 rounded-[10px] border ${
                    errors.from ? "border-red-500 bg-red-50/20" : "border-[#DFE7F1]"
                  } text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15`}
                />
                {errors.from && <p className="text-xs text-red-600 mt-1">{errors.from}</p>}
              </div>

              <div id="to">
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  TO (Destination City) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  placeholder="Enter destination city"
                  className={`w-full h-[46px] px-3.5 rounded-[10px] border ${
                    errors.to ? "border-red-500 bg-red-50/20" : "border-[#DFE7F1]"
                  } text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15`}
                />
                {errors.to && <p className="text-xs text-red-600 mt-1">{errors.to}</p>}
              </div>
            </div>

            {/* 4. Departure Date | 5. Return Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
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

              <div id="returnDate">
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  RETURN DATE {journeyType === "round-trip" && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="date"
                  min={departureDate || today}
                  disabled={journeyType === "one-way"}
                  value={journeyType === "one-way" ? "" : returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  placeholder={journeyType === "one-way" ? "Not applicable for One Way" : ""}
                  className={`w-full h-[46px] px-3.5 rounded-[10px] border ${
                    errors.returnDate ? "border-red-500 bg-red-50/20" : "border-[#DFE7F1]"
                  } text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15 ${
                    journeyType === "one-way"
                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "bg-white"
                  }`}
                />
                {errors.returnDate && (
                  <p className="text-xs text-red-600 mt-1">{errors.returnDate}</p>
                )}
              </div>
            </div>

            {/* 6. Preferred Departure Time | 8. Preferred Bus Operator */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  PREFERRED DEPARTURE TIME
                </label>
                <select
                  value={departureTime}
                  onChange={(e) => setDepartureTime(e.target.value)}
                  className="w-full h-[46px] px-3.5 rounded-[10px] border border-[#DFE7F1] text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15 bg-white font-medium"
                >
                  <option value="Any Time">Any Time</option>
                  <option value="Morning">Morning (06:00 - 12:00)</option>
                  <option value="Afternoon">Afternoon (12:00 - 18:00)</option>
                  <option value="Evening">Evening (18:00 - 24:00)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  PREFERRED BUS OPERATOR <span className="text-slate-400 font-normal text-[11px] normal-case">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={preferredOperator}
                  onChange={(e) => setPreferredOperator(e.target.value)}
                  placeholder="Enter preferred bus operator"
                  className="w-full h-[46px] px-3.5 rounded-[10px] border border-[#DFE7F1] text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15"
                />
              </div>
            </div>

            {/* 7. Bus Type (All 6 options: AC, Non-AC, Volvo, Sleeper, Seater, Semi-Sleeper) */}
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                BUS TYPE <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                {(
                  ["AC", "Non-AC", "Volvo", "Sleeper", "Seater", "Semi-Sleeper"] as const
                ).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setBusType(type)}
                    style={{ minHeight: "44px" }}
                    className={`py-2 px-3 rounded-[10px] text-xs sm:text-sm font-bold border transition-all text-center cursor-pointer ${
                      busType === type
                        ? "bg-[#008F87] text-white border-[#008F87] shadow-sm"
                        : "bg-[#F8FAFC] text-[#334155] border-[#DFE7F1] hover:bg-[#F1F5F9]"
                    }`}
                  >
                    {type}
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

            {/* Row 1: Adults | Children */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
              <div id="adults">
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  NUMBER OF ADULTS <span className="text-red-500">*</span>
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

              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  NUMBER OF CHILDREN
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
            </div>

            {/* Row 2: Total Number of Passengers (Read-only) | Preferred Seat Type */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  TOTAL NUMBER OF PASSENGERS
                </label>
                <div className="h-[46px] px-3.5 rounded-[10px] border border-[#E2E8F0] bg-slate-100 flex items-center font-bold text-sm text-[#0F172A]">
                  {totalPassengers} {totalPassengers === 1 ? "Passenger" : "Passengers"}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  PREFERRED SEAT TYPE
                </label>
                <select
                  value={preferredSeat}
                  onChange={(e) => setPreferredSeat(e.target.value)}
                  className="w-full h-[46px] px-3.5 rounded-[10px] border border-[#DFE7F1] text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15 bg-white font-medium"
                >
                  <option value="Any Available">Any Available</option>
                  <option value="Lower Berth">Lower Berth</option>
                  <option value="Upper Berth">Upper Berth</option>
                  <option value="Window">Window</option>
                  <option value="Aisle">Aisle</option>
                </select>
              </div>
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

            {/* Row 1: Full Name | Mobile Number */}
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
            </div>

            {/* Row 2: WhatsApp Number | Email Address */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
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

            {/* Row 3: City / Country */}
            <div id="cityCountry">
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                CITY / COUNTRY <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={cityCountry}
                onChange={(e) => setCityCountry(e.target.value)}
                placeholder="e.g. Dehradun, India"
                className={`w-full h-[46px] px-3.5 rounded-[10px] border ${
                  errors.cityCountry ? "border-red-500 bg-red-50/20" : "border-[#DFE7F1]"
                } text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15`}
              />
              {errors.cityCountry && (
                <p className="text-xs text-red-600 mt-1">{errors.cityCountry}</p>
              )}
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

            {/* Row 1: Boarding Point | Dropping Point */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  BOARDING POINT PREFERENCE <span className="text-slate-400 font-normal text-[11px] normal-case">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={boardingPoint}
                  onChange={(e) => setBoardingPoint(e.target.value)}
                  placeholder="Enter preferred boarding point"
                  className="w-full h-[46px] px-3.5 rounded-[10px] border border-[#DFE7F1] text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  DROPPING POINT PREFERENCE <span className="text-slate-400 font-normal text-[11px] normal-case">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={droppingPoint}
                  onChange={(e) => setDroppingPoint(e.target.value)}
                  placeholder="Enter preferred dropping point"
                  className="w-full h-[46px] px-3.5 rounded-[10px] border border-[#DFE7F1] text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15"
                />
              </div>
            </div>

            {/* Row 2: Luggage Requirements | Special Assistance */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
              <div>
                <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                  LUGGAGE REQUIREMENTS <span className="text-slate-400 font-normal text-[11px] normal-case">(Optional)</span>
                </label>
                <input
                  type="text"
                  value={luggage}
                  onChange={(e) => setLuggage(e.target.value)}
                  placeholder="Specify number/type of bags or special luggage"
                  className="w-full h-[46px] px-3.5 rounded-[10px] border border-[#DFE7F1] text-sm text-[#142139] focus:outline-none focus:border-[#008F87] focus:ring-2 focus:ring-[#008F87]/15"
                />
              </div>

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
            </div>

            {/* Row 3: Any Other Instructions (Textarea) */}
            <div>
              <label className="block text-xs font-bold text-[#475569] uppercase tracking-wider mb-2">
                ANY OTHER INSTRUCTIONS <span className="text-slate-400 font-normal text-[11px] normal-case">(Optional)</span>
              </label>
              <textarea
                rows={3}
                value={otherInstructions}
                onChange={(e) => setOtherInstructions(e.target.value)}
                placeholder="Enter any additional instructions for your bus journey."
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
                  I agree to be contacted by TravelExpertz regarding my bus ticket enquiry and accept the{" "}
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
              Our team will contact you with suitable bus options and booking assistance. Submission of this form does not confirm a bus ticket reservation.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}
