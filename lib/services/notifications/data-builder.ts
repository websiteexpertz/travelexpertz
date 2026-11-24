/**
 * Booking Communication Data Builder
 * Extracts canonical booking and property details with standardized Yatra Expertz branding.
 */

import { Db, ObjectId } from "mongodb";
import { getDb } from "../../db";

export interface BookingCommunicationData {
  bookingId: string;
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  propertyName: string;
  propertyAddress: string;
  propertyCity: string;
  propertyState: string;
  propertyType: "hotel" | "homestay";
  checkinDate: string;
  checkoutDate: string;
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
}

export async function buildBookingCommunicationData(
  bookingId: string,
  database?: Db
): Promise<BookingCommunicationData | null> {
  const db = database || (await getDb());
  const bookings = db.collection("bookings");

  const booking = await bookings.findOne({ _id: new ObjectId(bookingId) });
  if (!booking) return null;

  const propertyCollectionName = booking.hotelId ? "hotels" : "homestays";
  const propertyId = booking.hotelId || booking.homestayId;

  let property: any = null;
  if (propertyId) {
    try {
      property = await db
        .collection(propertyCollectionName)
        .findOne({ _id: new ObjectId(propertyId) });
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

  return {
    bookingId: booking._id.toString(),
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
    roomCategory,
    guestsCount,
    nightsCount: nights,
    totalAmount,
    paidAmount,
    outstandingAmount,
    paymentStatus: booking.paymentStatus || "pending",
    bookingStatus: booking.bookingStatus || "pending",
    portalUrl: "https://www.yatraexpertz.com/",
    brandName: "Yatra Expertz",
  };
}
