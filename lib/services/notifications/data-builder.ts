/**
 * Booking Communication Data Builder
 * Extracts canonical booking and property details with standardized Yatra Expertz branding.
 */

import { Db, ObjectId } from "mongodb";
import { getDb } from "../../db";
import { generateGuestReviewToken } from "../reviews/tokens";

export interface BookingCommunicationData {
  bookingId: string;
  bookingVersion: number;
  bookingReference: string;
  customerName: string;
  guestName?: string;
  customerEmail: string;
  customerPhone: string;
  propertyName: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyType: "hotel" | "homestay";
  checkinDate: string;
  checkoutDate: string;
  checkinTime?: string;
  checkoutTime?: string;
  propertyPhone?: string;
  propertyDirections?: string;
  directionsUrl?: string;
  bookingDetailsUrl?: string;
  propertyImage?: string;
  checkinInstructions?: string;
  cancellationPolicy?: string;
  roomCategory: string;
  guestsCount: number;
  nightsCount: number;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  paymentStatus: string;
  bookingStatus: string;
  portalUrl: string;
  brandName: string;
  reviewUrl?: string;
  reviewToken?: string;
}

export async function buildBookingCommunicationData(
  bookingId: string,
  database?: Db
): Promise<BookingCommunicationData | null> {
  const db = database || (await getDb());
  const bookings = db.collection("bookings");

  const booking = await bookings.findOne({
    _id: ObjectId.isValid(bookingId) ? new ObjectId(bookingId) : (bookingId as any),
  });
  if (!booking) return null;

  const propertyCollectionName = booking.hotelId ? "hotels" : "homestays";
  const propertyId = booking.hotelId || booking.homestayId;

  let property: any = null;
  if (propertyId) {
    try {
      property = await db
        .collection(propertyCollectionName)
        .findOne({
          _id: ObjectId.isValid(propertyId) ? new ObjectId(propertyId) : (propertyId as any),
        });
    } catch {
      // Ignore if property lookup fails
    }
  }

  // Room lookup
  let roomCategory = "Standard Room";
  if (property && Array.isArray(property.rooms) && booking.roomId) {
    const room = property.rooms.find(
      (r: any) => r.id === booking.roomId || r._id?.toString() === booking.roomId
    );
    if (room?.name) roomCategory = room.name;
  }

  const customerName =
    booking.guestName || booking.customerDetails?.name || "Valued Guest";
  const customerEmail =
    booking.guestEmail || booking.customerDetails?.email || "";
  const customerPhone =
    booking.guestPhone || booking.customerDetails?.phone || "";

  const totalAmount = Number(booking.price || booking.totalPrice || 0);
  const paidAmount =
    booking.paymentStatus === "paid"
      ? Number(booking.amountToPay || booking.amountPaid || totalAmount)
      : 0;
  const outstandingAmount = Math.max(0, totalAmount - paidAmount);

  const nights = Number(booking.nights || 1);
  const guestsCount =
    typeof booking.guests === "object"
      ? (Number(booking.guests.adults) || 1) + (Number(booking.guests.children) || 0)
      : Number(booking.guests) || 1;

  const propertyName =
    property?.name ||
    property?.title ||
    booking.propertyName ||
    "Yatra Expertz Partner Property";

  const propertyAddress =
    property?.address || property?.location || "Address on confirmation voucher";
  const propertyCity = property?.city || "India";
  const propertyState = property?.state || "";

  const checkinTime =
    booking.checkinTime ||
    booking.checkInTime ||
    property?.checkInTime ||
    property?.checkinTime ||
    "12:00 PM";

  const checkoutTime =
    booking.checkoutTime ||
    booking.checkOutTime ||
    property?.checkOutTime ||
    property?.checkoutTime ||
    "11:00 AM";

  const propertyPhone =
    property?.contactNumber ||
    property?.phone ||
    property?.ownerPhone ||
    "+91 98765 43210";

  const propertyDirections =
    property?.directions ||
    property?.mapLink ||
    (property?.latitude && property?.longitude
      ? `https://maps.google.com/?q=${property.latitude},${property.longitude}`
      : "");

  const propertyImage =
    property?.images?.[0] ||
    property?.image ||
    "";

  const checkinInstructions =
    property?.checkinInstructions ||
    "Please present a valid government-issued photo ID (Aadhaar, Passport, or Driving License) upon arrival.";

  const cancellationPolicy =
    property?.cancellationPolicy ||
    "Free cancellation up to 48 hours prior to check-in. Cancellations within 48 hours are subject to standard property terms.";

  return {
    bookingId: booking._id.toString(),
    bookingVersion: Number(booking.bookingVersion || 1),
    bookingReference:
      booking.bookingReference || `YE-${booking._id.toString().slice(-6).toUpperCase()}`,
    customerName,
    customerEmail,
    customerPhone,
    propertyName,
    propertyAddress,
    propertyCity,
    propertyState,
    propertyType: booking.hotelId ? "hotel" : "homestay",
    checkinDate: booking.checkin || "",
    checkoutDate: booking.checkout || "",
    checkinTime,
    checkoutTime,
    propertyPhone,
    propertyDirections,
    propertyImage,
    checkinInstructions,
    cancellationPolicy,
    roomCategory,
    guestsCount,
    nightsCount: nights,
    totalAmount,
    paidAmount,
    outstandingAmount,
    paymentStatus: booking.paymentStatus || "pending",
    bookingStatus: booking.bookingStatus || "pending",
    portalUrl: "https://www.yatraexpertz.com",
    brandName: "Yatra Expertz",
    reviewToken: (() => {
      try {
        const pId = (booking.hotelId || booking.homestayId || propertyId || "").toString();
        const gEmail = (booking.guestEmail || booking.customerDetails?.email || customerEmail || "").trim();
        return generateGuestReviewToken(bookingId, pId, gEmail);
      } catch {
        return undefined;
      }
    })(),
    reviewUrl: (() => {
      try {
        const pId = (booking.hotelId || booking.homestayId || propertyId || "").toString();
        const gEmail = (booking.guestEmail || booking.customerDetails?.email || customerEmail || "").trim();
        const tok = generateGuestReviewToken(bookingId, pId, gEmail);
        return `https://www.yatraexpertz.com/review/${tok}`;
      } catch {
        return `https://www.yatraexpertz.com/review?bookingId=${bookingId}`;
      }
    })(),
  };
}
