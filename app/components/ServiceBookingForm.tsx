"use client";

import { useState } from "react";

type ServiceType =
  | "car-rental"
  | "flight"
  | "bus"
  | "train"
  | "visa"
  | "forex"
  | "insurance";

interface ServiceBookingFormProps {
  serviceType: ServiceType;
  onClose?: () => void;
}

export default function ServiceBookingForm({
  serviceType,
  onClose,
}: ServiceBookingFormProps) {
  const [formData, setFormData] = useState<Record<string, any>>({
    serviceType,
    fullName: "",
    mobile: "",
    email: "",
    message: "",
    agreeContact: false,
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Get today's date in YYYY-MM-DD format for min attribute
  const today = new Date().toISOString().split("T")[0];

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.agreeContact) {
      setError("Please agree to be contacted");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/service-bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => {
          if (onClose) onClose();
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.error || "Failed to submit booking");
      }
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderFields = () => {
    switch (serviceType) {
      case "car-rental":
        return renderCarRentalFields();
      case "flight":
        return renderFlightFields();
      case "bus":
        return renderBusFields();
      case "train":
        return renderTrainFields();
      case "visa":
        return renderVisaFields();
      case "forex":
        return renderForexFields();
      case "insurance":
        return renderInsuranceFields();
      default:
        return null;
    }
  };

  const renderCarRentalFields = () => (
    <>
      <div className="form-row">
        <div className="form-group">
          <label>Number of Passengers *</label>
          <input
            type="number"
            name="passengers"
            onChange={handleChange}
            required
            min="1"
          />
        </div>
        <div className="form-group">
          <label>Pickup Date *</label>
          <input
            type="date"
            name="pickupDate"
            onChange={handleChange}
            required
            min={today}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Pickup Time *</label>
          <input
            type="time"
            name="pickupTime"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Service Type *</label>
          <select name="rentalType" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="local">Local</option>
            <option value="outstation">Outstation</option>
            <option value="airport">Airport Transfer</option>
            <option value="hourly">Hourly Rental</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Pickup Location *</label>
          <input
            type="text"
            name="pickupLocation"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Drop Off Location *</label>
          <input
            type="text"
            name="dropOffLocation"
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Car Type *</label>
          <select name="carType" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="hatchback">Hatchback</option>
            <option value="sedan">Sedan</option>
            <option value="suv">SUV</option>
            <option value="tempo">Tempo Traveller</option>
            <option value="luxury">Luxury</option>
          </select>
        </div>
        <div className="form-group">
          <label>AC Required</label>
          <select name="acRequired" onChange={handleChange}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Additional Luggage</label>
        <input
          type="text"
          name="luggage"
          onChange={handleChange}
          placeholder="Describe luggage requirements"
        />
      </div>
    </>
  );

  const renderFlightFields = () => (
    <>
      <div className="form-row">
        <div className="form-group">
          <label>Trip Type *</label>
          <select name="tripType" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="oneway">One Way</option>
            <option value="round">Round Trip</option>
          </select>
        </div>
        <div className="form-group">
          <label>Departure Date *</label>
          <input
            type="date"
            name="departureDate"
            onChange={handleChange}
            required
            min={today}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Departure City *</label>
          <input
            type="text"
            name="departureCity"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Destination City *</label>
          <input
            type="text"
            name="destinationCity"
            onChange={handleChange}
            required
          />
        </div>
      </div>
      {formData.tripType === "round" && (
        <div className="form-group">
          <label>Return Date *</label>
          <input
            type="date"
            name="returnDate"
            onChange={handleChange}
            required
            min={formData.departureDate || today}
          />
        </div>
      )}
      <div className="form-row">
        <div className="form-group">
          <label>Preferred Class *</label>
          <select name="flightClass" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="economy">Economy</option>
            <option value="premium-economy">Premium Economy</option>
            <option value="business">Business</option>
            <option value="first">First Class</option>
          </select>
        </div>
        <div className="form-group">
          <label>Preferred Airlines</label>
          <input type="text" name="preferredAirlines" onChange={handleChange} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Adults *</label>
          <input
            type="number"
            name="adults"
            onChange={handleChange}
            required
            min="1"
          />
        </div>
        <div className="form-group">
          <label>Children</label>
          <input
            type="number"
            name="children"
            onChange={handleChange}
            min="0"
            defaultValue="0"
          />
        </div>
        <div className="form-group">
          <label>Infants</label>
          <input
            type="number"
            name="infants"
            onChange={handleChange}
            min="0"
            defaultValue="0"
          />
        </div>
      </div>
      <div className="form-group">
        <label>Meal Preference</label>
        <select name="mealPreference" onChange={handleChange}>
          <option value="any">Any</option>
          <option value="veg">Vegetarian</option>
          <option value="non-veg">Non-Vegetarian</option>
          <option value="jain">Jain</option>
          <option value="special">Special</option>
        </select>
      </div>
    </>
  );

  const renderBusFields = () => (
    <>
      <div className="form-row">
        <div className="form-group">
          <label>From (City) *</label>
          <input type="text" name="fromCity" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>To (City) *</label>
          <input type="text" name="toCity" onChange={handleChange} required />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Journey Date *</label>
          <input
            type="date"
            name="journeyDate"
            onChange={handleChange}
            required
            min={today}
          />
        </div>
        <div className="form-group">
          <label>Trip Type *</label>
          <select name="tripType" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="oneway">One Way</option>
            <option value="round">Round Trip</option>
          </select>
        </div>
      </div>
      {formData.tripType === "round" && (
        <div className="form-group">
          <label>Return Date *</label>
          <input
            type="date"
            name="returnDate"
            onChange={handleChange}
            required
            min={formData.journeyDate || today}
          />
        </div>
      )}
      <div className="form-row">
        <div className="form-group">
          <label>Number of Passengers *</label>
          <input
            type="number"
            name="passengers"
            onChange={handleChange}
            required
            min="1"
          />
        </div>
        <div className="form-group">
          <label>Passenger Type</label>
          <select name="passengerType" onChange={handleChange}>
            <option value="adult">Adult</option>
            <option value="child">Child</option>
            <option value="senior">Senior Citizen</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Bus Type</label>
        <select name="busType" onChange={handleChange}>
          <option value="any">Any</option>
          <option value="ac">AC</option>
          <option value="non-ac">Non-AC</option>
          <option value="sleeper">Sleeper</option>
          <option value="seater">Seater</option>
          <option value="volvo">Volvo</option>
        </select>
      </div>
    </>
  );

  const renderTrainFields = () => (
    <>
      <div className="form-row">
        <div className="form-group">
          <label>From (Station/City) *</label>
          <input
            type="text"
            name="fromStation"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>To (Station/City) *</label>
          <input
            type="text"
            name="toStation"
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Journey Date *</label>
          <input
            type="date"
            name="journeyDate"
            onChange={handleChange}
            required
            min={today}
          />
        </div>
        <div className="form-group">
          <label>Trip Type *</label>
          <select name="tripType" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="oneway">One Way</option>
            <option value="round">Round Trip</option>
          </select>
        </div>
      </div>
      {formData.tripType === "round" && (
        <div className="form-group">
          <label>Return Date *</label>
          <input
            type="date"
            name="returnDate"
            onChange={handleChange}
            required
            min={formData.journeyDate || today}
          />
        </div>
      )}
      <div className="form-row">
        <div className="form-group">
          <label>Number of Passengers *</label>
          <input
            type="number"
            name="passengers"
            onChange={handleChange}
            required
            min="1"
          />
        </div>
        <div className="form-group">
          <label>Passenger Type</label>
          <select name="passengerType" onChange={handleChange}>
            <option value="adult">Adult</option>
            <option value="child">Child</option>
            <option value="senior">Senior Citizen</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Preferred Train</label>
          <input
            type="text"
            name="preferredTrain"
            onChange={handleChange}
            placeholder="Train Name/Number (if known)"
          />
        </div>
        <div className="form-group">
          <label>Preferred Class *</label>
          <select name="trainClass" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="SL">Sleeper (SL)</option>
            <option value="3A">3-Tier AC (3A)</option>
            <option value="2A">2-Tier AC (2A)</option>
            <option value="1A">1st AC (1A)</option>
            <option value="CC">Chair Car (CC)</option>
            <option value="EC">Executive Class (EC)</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Booking Quota</label>
          <select name="quota" onChange={handleChange}>
            <option value="general">General</option>
            <option value="tatkal">Tatkal</option>
            <option value="senior">Senior Citizen</option>
            <option value="ladies">Ladies</option>
          </select>
        </div>
        <div className="form-group">
          <label>Seat Preference</label>
          <select name="seatPreference" onChange={handleChange}>
            <option value="any">Any</option>
            <option value="lower">Lower</option>
            <option value="middle">Middle</option>
            <option value="upper">Upper</option>
            <option value="side">Side</option>
          </select>
        </div>
      </div>
    </>
  );

  const renderVisaFields = () => (
    <>
      <div className="form-row">
        <div className="form-group">
          <label>City of Residence *</label>
          <input type="text" name="city" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Nationality *</label>
          <input
            type="text"
            name="nationality"
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Destination Country *</label>
          <input
            type="text"
            name="destinationCountry"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label>Visa Type *</label>
          <select name="visaType" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="tourist">Tourist</option>
            <option value="business">Business</option>
            <option value="student">Student</option>
            <option value="work">Work</option>
            <option value="transit">Transit</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Intended Travel Date *</label>
          <input
            type="date"
            name="travelDate"
            onChange={handleChange}
            required
            min={today}
          />
        </div>
        <div className="form-group">
          <label>Duration of Stay</label>
          <input
            type="text"
            name="durationOfStay"
            onChange={handleChange}
            placeholder="e.g., 7 days, 2 weeks"
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Number of Applicants *</label>
          <input
            type="number"
            name="applicants"
            onChange={handleChange}
            required
            min="1"
          />
        </div>
        <div className="form-group">
          <label>Passport Type</label>
          <select name="passportType" onChange={handleChange}>
            <option value="ordinary">Ordinary</option>
            <option value="official">Official</option>
            <option value="diplomatic">Diplomatic</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Passport Expiry Date</label>
          <input
            type="date"
            name="passportExpiry"
            onChange={handleChange}
            min={today}
          />
        </div>
        <div className="form-group">
          <label>Previous Visa Rejection</label>
          <select name="previousRejection" onChange={handleChange}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Purpose of Travel</label>
          <input type="text" name="purposeOfTravel" onChange={handleChange} />
        </div>
        <div className="form-group">
          <label>Occupation</label>
          <input type="text" name="occupation" onChange={handleChange} />
        </div>
      </div>
      <div className="form-group">
        <label>Travel History (Countries visited in last 5 years)</label>
        <textarea
          name="travelHistory"
          onChange={handleChange}
          rows={2}
        ></textarea>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Visa Filing Assistance</label>
          <select name="visaFilingAssistance" onChange={handleChange}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div className="form-group">
          <label>Documentation Support</label>
          <select name="documentationSupport" onChange={handleChange}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div className="form-group">
          <label>Appointment Booking</label>
          <select name="appointmentBooking" onChange={handleChange}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>
    </>
  );

  const renderForexFields = () => (
    <>
      <div className="form-row">
        <div className="form-group">
          <label>City of Residence *</label>
          <input type="text" name="city" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Purpose *</label>
          <select name="purpose" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="travel">Travel</option>
            <option value="education">Education</option>
            <option value="business">Business</option>
            <option value="medical">Medical</option>
            <option value="remittance">Remittance</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Currency Required *</label>
          <select name="currency" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="AED">AED - UAE Dirham</option>
            <option value="SGD">SGD - Singapore Dollar</option>
            <option value="AUD">AUD - Australian Dollar</option>
            <option value="CAD">CAD - Canadian Dollar</option>
            <option value="THB">THB - Thai Baht</option>
          </select>
        </div>
        <div className="form-group">
          <label>Amount Required (Approximate) *</label>
          <input
            type="text"
            name="amount"
            onChange={handleChange}
            required
            placeholder="e.g., 1000"
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Mode of Forex *</label>
          <select name="forexMode" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="cash">Cash</option>
            <option value="card">Forex Card</option>
            <option value="transfer">Wire Transfer</option>
          </select>
        </div>
        <div className="form-group">
          <label>Destination Country</label>
          <input
            type="text"
            name="destinationCountry"
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Travel Date</label>
          <input
            type="date"
            name="travelDate"
            onChange={handleChange}
            min={today}
          />
        </div>
        <div className="form-group">
          <label>PAN Card Available</label>
          <select name="panAvailable" onChange={handleChange}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div className="form-group">
          <label>Passport Available</label>
          <select name="passportAvailable" onChange={handleChange}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>
    </>
  );

  const renderInsuranceFields = () => (
    <>
      <div className="form-row">
        <div className="form-group">
          <label>City of Residence *</label>
          <input type="text" name="city" onChange={handleChange} required />
        </div>
        <div className="form-group">
          <label>Destination Country/Countries *</label>
          <input
            type="text"
            name="destinationCountries"
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Travel Start Date *</label>
          <input
            type="date"
            name="travelStartDate"
            onChange={handleChange}
            required
            min={today}
          />
        </div>
        <div className="form-group">
          <label>Travel End Date *</label>
          <input
            type="date"
            name="travelEndDate"
            onChange={handleChange}
            required
            min={formData.travelStartDate || today}
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Purpose of Travel *</label>
          <select name="purpose" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="leisure">Leisure</option>
            <option value="business">Business</option>
            <option value="study">Study</option>
            <option value="work">Work</option>
          </select>
        </div>
        <div className="form-group">
          <label>Number of Travellers *</label>
          <input
            type="number"
            name="travellers"
            onChange={handleChange}
            required
            min="1"
          />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Traveller Age(s)</label>
          <input
            type="text"
            name="travellerAges"
            onChange={handleChange}
            placeholder="e.g., 30, 28, 5"
          />
        </div>
        <div className="form-group">
          <label>Senior Citizen Traveller</label>
          <select name="seniorCitizen" onChange={handleChange}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Coverage Type *</label>
          <select name="coverageType" onChange={handleChange} required>
            <option value="">Select</option>
            <option value="individual">Individual</option>
            <option value="family">Family</option>
            <option value="group">Group</option>
          </select>
        </div>
        <div className="form-group">
          <label>Coverage Amount Required</label>
          <select name="coverageAmount" onChange={handleChange}>
            <option value="50000">$50,000</option>
            <option value="100000">$100,000</option>
            <option value="250000">$250,000</option>
            <option value="500000">$500,000</option>
            <option value="1000000">$1,000,000</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Pre-Existing Medical Condition</label>
          <select name="preExistingCondition" onChange={handleChange}>
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
        <div className="form-group">
          <label>Trip Cancellation Coverage</label>
          <select name="tripCancellation" onChange={handleChange}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Medical Emergency Coverage</label>
          <select name="medicalEmergency" onChange={handleChange}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
        <div className="form-group">
          <label>Baggage Loss/Delay Coverage</label>
          <select name="baggageCoverage" onChange={handleChange}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>
      <div className="form-group">
        <label>Special Coverage Requirements</label>
        <textarea
          name="specialCoverage"
          onChange={handleChange}
          rows={2}
        ></textarea>
      </div>
    </>
  );

  const getServiceTitle = () => {
    const titles: Record<ServiceType, string> = {
      "car-rental": "Car Rental Booking",
      flight: "Flight Booking",
      bus: "Bus Ticket Booking",
      train: "Train Ticket Booking",
      visa: "Visa Application",
      forex: "Forex & Currency Exchange",
      insurance: "Travel Insurance",
    };
    return titles[serviceType];
  };

  if (success) {
    return (
      <div className="booking-success">
        <div className="success-icon">✓</div>
        <h2>Booking Request Submitted!</h2>
        <p>
          Thank you for your request. We will contact you soon via WhatsApp,
          call, or email.
        </p>
        <style jsx>{`
          .booking-success {
            text-align: center;
            padding: 3rem 2rem;
          }
          .success-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #10b981, #059669);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 3rem;
            color: white;
            margin: 0 auto 1.5rem;
            animation: scaleIn 0.5s ease;
          }
          @keyframes scaleIn {
            from {
              transform: scale(0);
            }
            to {
              transform: scale(1);
            }
          }
          .booking-success h2 {
            color: #059669;
            margin-bottom: 0.5rem;
          }
          .booking-success p {
            color: #6b7280;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="service-booking-form">
      <h2>{getServiceTitle()}</h2>
      <form onSubmit={handleSubmit}>
        {/* Common Fields */}
        <div className="form-row">
          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Mobile Number (WhatsApp preferred) *</label>
            <input type="tel" name="mobile" onChange={handleChange} required />
          </div>
        </div>
        <div className="form-group">
          <label>Email Address *</label>
          <input type="email" name="email" onChange={handleChange} required />
        </div>

        {/* Service-specific fields */}
        {renderFields()}

        {/* Message */}
        <div className="form-group">
          <label>Additional Message</label>
          <textarea name="message" onChange={handleChange} rows={3}></textarea>
        </div>

        {/* Agreement */}
        <div className="form-checkbox">
          <input
            type="checkbox"
            name="agreeContact"
            id="agreeContact"
            onChange={handleChange}
            required
          />
          <label htmlFor="agreeContact">
            I agree to be contacted via call, WhatsApp, or email
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}

        <button type="submit" disabled={loading} className="submit-button">
          {loading ? "Submitting..." : "Submit Booking Request"}
        </button>
      </form>

      <style jsx>{`
        .service-booking-form {
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background: white;
          border-radius: 12px;
        }
        h2 {
          color: #0f172a;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        .form-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
        }
        label {
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }
        input,
        select,
        textarea {
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s;
        }
        input:focus,
        select:focus,
        textarea:focus {
          outline: none;
          border-color: #0066cc;
          box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.1);
        }
        .form-checkbox {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin: 1.5rem 0;
        }
        .form-checkbox input {
          width: auto;
        }
        .form-checkbox label {
          margin: 0;
          font-weight: 400;
        }
        .submit-button {
          width: 100%;
          padding: 1rem;
          background: linear-gradient(135deg, #0066cc, #0052a3);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition:
            transform 0.2s,
            box-shadow 0.2s;
        }
        .submit-button:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 102, 204, 0.3);
        }
        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .error-message {
          background: #fee2e2;
          color: #991b1b;
          padding: 0.75rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          text-align: center;
        }
        @media (max-width: 768px) {
          .service-booking-form {
            padding: 1.5rem;
          }
          .form-row {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
