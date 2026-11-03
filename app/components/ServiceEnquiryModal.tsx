"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { CheckCircle2, ChevronLeft, ChevronRight, LoaderCircle, X } from "lucide-react";
import "./service-enquiry.css";

export type ServiceId = "visa" | "forex" | "insurance" | "wedding";

const details: Record<ServiceId, { title: string; tagline: string; support: string; serviceType: string }> = {
  visa: { title: "Visa Assistance", tagline: "Your Visa. Your Destination. Your World of Possibilities.", support: "From visa guidance and documentation to application assistance and travel preparation, let Travel Expertz make your international travel journey smoother and hassle-free.", serviceType: "visa" },
  forex: { title: "Forex Card & Currency", tagline: "Travel Globally. Exchange Easily.", support: "Get your foreign currency and forex card requirements sorted before you take off!", serviceType: "forex" },
  insurance: { title: "Travel Insurance", tagline: "Travel with Confidence. We've Got You Covered.", support: "Enjoy your journey while staying prepared for life's unexpected travel moments.", serviceType: "insurance" },
  wedding: { title: "Destination Wedding", tagline: "Your Dream Wedding. A Perfect Destination. Memories Forever.", support: "From breathtaking venues and luxurious stays to guest travel and seamless event coordination, let Travel Expertz make your special day truly unforgettable.", serviceType: "destination-wedding" },
};

type Props = { service: ServiceId; onClose: () => void };

export default function ServiceEnquiryModal({ service, onClose }: Props) {
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const closeRef = useRef<HTMLButtonElement>(null);
  const config = details[service];

  useEffect(() => {
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", onKey); };
  }, [onClose]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    const form = event.currentTarget;
    if (!form.reportValidity()) return;
    const data: Record<string, string | string[]> = Object.fromEntries(
      Array.from(new FormData(form).entries()).map(([key, value]) => [key, String(value)])
    );
    const multi = new FormData(form);
    ["weddingFunctions", "servicesRequired"].forEach((key) => {
      data[key] = multi.getAll(key).map((value) => String(value));
    });

    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/service-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          serviceType: config.serviceType,
          fullName: data.fullName || data.yourFullName,
          email: data.emailAddress || data.email,
          mobile: data.mobile,
          consent: data.consent === "on",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "We could not submit your enquiry.");
      setSubmitted(true);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "We could not submit your enquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  const field = (label: string, name: string, type = "text", required = false, options?: string[], full = false) =>
    <div className={full ? "enquiry-field enquiry-full" : "enquiry-field"}>
      <label htmlFor={`${service}-${name}`}>{label}{required && <b> *</b>}</label>
      {options ? <select id={`${service}-${name}`} name={name} required={required} defaultValue=""><option value="" disabled>Select an option</option>{options.map((option) => <option key={option}>{option}</option>)}</select> :
        <input id={`${service}-${name}`} name={name} type={type} required={required} />}
    </div>;

  const area = (label: string, name: string, full = true) =>
    <div className={full ? "enquiry-field enquiry-full" : "enquiry-field"}><label htmlFor={`${service}-${name}`}>{label}</label><textarea id={`${service}-${name}`} name={name} rows={3} /></div>;

  const commonContact = <>
    {field("Full Name", "fullName", "text", true)}
    {field("Email Address", "emailAddress", "email", true)}
    {field("Mobile Number / WhatsApp", "mobile", "tel", true)}
  </>;

  return (
    <div className="enquiry-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="enquiry-modal" role="dialog" aria-modal="true" aria-labelledby="enquiry-title">
        <button ref={closeRef} className="enquiry-close" type="button" onClick={onClose} aria-label="Close enquiry"><X /></button>
        {submitted ? <div className="enquiry-success"><CheckCircle2 /><h2>Enquiry received</h2><p>Thank you. A Travel Expertz specialist will contact you shortly.</p><button onClick={onClose}>Done</button></div> : <>
          <div className="enquiry-heading"><span>{config.title}</span><h2 id="enquiry-title">Plan your enquiry</h2><p>{config.tagline}</p><small>{config.support}</small></div>
          {service === "wedding" && <div className="enquiry-progress"><span className={step === 0 ? "active" : ""}>1. Couple</span><span className={step === 1 ? "active" : ""}>2. Celebration</span></div>}
          <form onSubmit={submit} className="enquiry-form">
            {service === "visa" && <>{commonContact}{field("Nationality", "nationality", "text", true)}{field("Destination Country", "destinationCountry", "text", true)}{field("Visa Type", "visaType", "text", true, ["Tourist / Visitor Visa","Business Visa","Student Visa","Work Visa","Transit Visa","Family / Dependent Visa","Travel Visa","Other / Not Sure"]) }{field("Expected Travel Date", "expectedTravelDate", "date")}{field("Expected Duration of Stay", "duration")}{field("Number of Applicants", "numberOfApplicants", "text", false, ["1 Applicant","2 Applicants","3 Applicants","4 Applicants","5+ Applicants"])}{field("Do you have a valid passport?", "validPassport", "text", false, ["Yes","No","Applied for renewal"])}{field("Have you applied for a visa before?", "appliedBefore", "text", false, ["Yes","No"])}</>}
            {service === "forex" && <>{commonContact}{field("Service Required", "serviceRequired", "text", true, ["Forex Card","Foreign Currency Exchange","Both Forex Card & Foreign Currency","Not Sure – Need Guidance"])}{field("Destination Country", "destinationCountry", "text", true)}{field("Required Currency", "currency", "text", true)}{field("Approximate Amount Required", "amountRequired")}{field("Expected Departure Date", "departureDate", "date")}{field("Number of Travellers", "numberOfTravellers", "text", false, ["1 Traveller","2 Travellers","3 Travellers","4 Travellers","5+ Travellers"])}{field("Preferred Delivery / Collection Method", "deliveryMethod", "text", false, ["Branch Pickup","Home Delivery (if available)","Need Assistance"])}</>}
            {service === "insurance" && <>{commonContact}{field("Destination Country / Countries", "destinationCountry", "text", true)}{field("Type of Travel", "travelType", "text", true, ["Domestic Travel","International Travel","Student Travel","Business Travel","Senior Citizen Travel","Multiple / Frequent Trips"])}{field("Departure Date", "departureDate", "date", true)}{field("Return Date", "returnDate", "date", true)}{field("Number of Travellers", "numberOfTravellers", "text", false, ["1 Traveller","2 Travellers","3 Travellers","4 Travellers","5+ Travellers"])}{field("Age of Traveller(s)", "travellerAges")}{field("Preferred Coverage", "preferredCoverage", "text", true, ["Medical & Emergency Coverage","Trip Cancellation & Interruption","Baggage Loss & Delay","Flight Delay & Missed Connections","Comprehensive Travel Insurance","Not Sure – Need Guidance"])}{field("Any Pre-existing Medical Conditions to Declare?", "medicalDeclaration", "text", false, ["Yes","No","Prefer to Discuss Privately"])}</>}
            {service === "wedding" && step === 0 && <>
              {field("Your Full Name", "yourFullName", "text", true)}{field("Partner's Name", "partnerName")}{field("Email Address", "emailAddress", "email", true)}{field("Mobile Number / WhatsApp", "mobile", "tel", true)}
              {field("Preferred Wedding Destination", "destination", "text", true, ["Within India","International Destination","Not Decided – Need Suggestions"])}{field("Preferred City / Location", "city")}{field("Expected Wedding Date", "weddingDate", "date")}{field("Are Your Wedding Dates Flexible?", "flexibleDates", "text", false, ["Yes","No","Not Sure"])}</>}
            {service === "wedding" && step === 1 && <>
              {field("Expected Number of Guests", "guestCount", "text", true, ["Below 50 Guests","50–100 Guests","100–200 Guests","200–300 Guests","300–500 Guests","More than 500 Guests"])}
              <span className="enquiry-field enquiry-full enquiry-help-text">Wedding Functions &amp; Events — select the functions you would like to organize.</span>
              <div className="enquiry-field enquiry-full"><span className="check-heading">Wedding Functions</span><div className="check-grid">{["Engagement","Mehendi","Haldi","Sangeet / Cocktail","Wedding Ceremony","Reception","Pre-Wedding Celebrations","Post-Wedding Brunch"].map((value) => <label key={value}><input type="checkbox" name="weddingFunctions" value={value} />{value}</label>)}</div></div>
              <span className="enquiry-field enquiry-full enquiry-help-text">Budget &amp; Accommodation</span>
              {field("Estimated Wedding Budget", "budget", "text", true, ["Below ₹10 Lakhs","₹10–20 Lakhs","₹20–40 Lakhs","₹40–60 Lakhs","₹60 Lakhs–₹1 Crore","Above ₹1 Crore","Need Guidance"])}
              <span className="enquiry-field enquiry-full enquiry-help-text">Indicative overall wedding budget. Final costs depend on venue, guest count and selected services.</span>
              {field("Accommodation Required?", "accommodation", "text", false, ["Yes, accommodation required","No","Need assistance"])}
              {field("Guest Travel Arrangements Required?", "guestTravel", "text", false, ["Yes","No","Need assistance"])}
              <div className="enquiry-field enquiry-full"><span className="check-heading">Services Required</span><div className="check-grid">{["Venue Selection","Hotel & Accommodation","Wedding Planning & Coordination","Catering & Food Arrangements","Decoration & Theme Setup","Photography & Videography","Entertainment & Music","Guest Travel & Transfers","Flight & Train Bookings","Makeup & Styling","Honeymoon Package","Complete Wedding Management"].map((value) => <label key={value}><input type="checkbox" name="servicesRequired" value={value} />{value}</label>)}</div></div>
            </>}
            {service !== "wedding" && area(service === "visa" ? "Additional Details" : service === "forex" ? "Additional Requirements" : "Additional Requirements", "additionalDetails")}
            {service === "wedding" && step === 1 && area("Additional Information — Tell Us More About Your Dream Wedding", "additionalInformation")}
            <label className="enquiry-consent enquiry-full"><input type="checkbox" name="consent" required /><span>{service === "wedding" ? "I agree to be contacted by Travel Expertz regarding my destination wedding enquiry. *" : `I agree to be contacted by Travel Expertz regarding my ${service === "visa" ? "visa" : service === "forex" ? "forex" : "travel insurance"} enquiry. *`}</span></label>
            {service === "wedding" && <p className="enquiry-important-note enquiry-full"><strong>Important Note:</strong> All destination wedding arrangements are subject to venue availability, vendor confirmation, applicable permissions and final booking terms. A customized proposal and quotation will be shared based on your requirements and budget.</p>}
            {service === "visa" && <p className="enquiry-important-note enquiry-full"><strong>Important Note:</strong> Visa approval is solely at the discretion of the respective embassy or consulate. Travel Expertz provides guidance and application assistance but does not guarantee visa approval.</p>}
            {service === "forex" && <p className="enquiry-important-note enquiry-full"><strong>Important Note:</strong> Forex card issuance and currency exchange are subject to RBI/FEMA regulations, KYC documentation, availability and provider policies. Rates are subject to change and confirmed at the time of transaction.</p>}
            {service === "insurance" && <p className="enquiry-important-note enquiry-full"><strong>Important Note:</strong> Coverage, benefits, exclusions, eligibility and claim settlements are subject to the selected policy terms and insurer approval. Travel Expertz does not guarantee policy issuance or claim approval.</p>}
            {error && <p className="enquiry-error enquiry-full" role="alert">{error}</p>}
            <div className="enquiry-actions enquiry-full">
              {service === "wedding" && step > 0 && <button type="button" className="enquiry-secondary" onClick={() => setStep(0)}><ChevronLeft size={18} /> Back</button>}
              {service === "wedding" && step === 0 ? <button type="button" className="enquiry-primary" onClick={(event) => { const form = event.currentTarget.closest("form"); if (form?.reportValidity()) setStep(1); }}>Continue <ChevronRight size={18} /></button> :
                <>{service === "forex" && <button type="button" className="enquiry-secondary" onClick={(event) => { const form = event.currentTarget.closest("form"); if (form) navigator.clipboard.writeText(new URLSearchParams(Array.from(new FormData(form).entries()).map(([key, value]) => [key, String(value)])).toString()); }}>Copy Enquiry Details</button>}<button type="submit" className="enquiry-primary" disabled={submitting}>{submitting && <LoaderCircle className="enquiry-spinner" size={18} />}{submitting ? "Submitting..." : service === "wedding" ? "Send Enquiry" : service === "insurance" ? "Send Inquiry" : "Submit enquiry"}</button></>}
            </div>
          </form>
        </>}
      </section>
    </div>
  );
}
