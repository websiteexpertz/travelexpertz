import { ObjectId } from "mongodb";

export interface User {
  _id?: ObjectId;
  mobile: string; // Unique mobile number
  password: string; // Hashed password
  mobileVerified: boolean;
  isActive: boolean;
  role: "user" | "admin" | "host";
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  _id?: ObjectId;
  userId: ObjectId;
  name?: string;
  email?: string;
  gender?: "male" | "female" | "other";
  dateOfBirth?: Date;
  nationality?: string;
  maritalStatus?: "single" | "married" | "divorced" | "widowed";
  anniversaryDate?: Date;
  alternateContact?: string;
  city?: string;
  state?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OTPVerification {
  _id?: ObjectId;
  mobile: string;
  otp: string;
  purpose: "signup" | "login" | "reset_password";
  expiresAt: Date;
  verified: boolean;
  attempts: number;
  createdAt: Date;
}

export interface RefreshToken {
  _id?: ObjectId;
  userId: ObjectId;
  token: string;
  expiresAt: Date;
  deviceInfo?: string;
  ipAddress?: string;
  createdAt: Date;
}

export interface Booking {
  _id?: ObjectId;
  userId: ObjectId;
  bookingId: string; // Unique booking reference
  propertyId: ObjectId;
  propertyName: string;
  propertyType: "hotel" | "homestay" | "package";
  city: string;
  checkIn: Date;
  checkOut: Date;
  guests: number;
  rooms: number;
  totalAmount: number;
  bookingStatus: "confirmed" | "completed" | "cancelled" | "pending";
  paymentStatus: "paid" | "pending" | "refunded" | "failed";
  paymentMode?: string;
  transactionId?: string;
  specialRequests?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Wishlist {
  _id?: ObjectId;
  userId: ObjectId;
  propertyId: ObjectId;
  propertyType: "hotel" | "homestay" | "package";
  propertyName: string;
  city: string;
  price: number;
  image?: string;
  rating?: number;
  createdAt: Date;
}

export interface Transaction {
  _id?: ObjectId;
  userId: ObjectId;
  bookingId?: ObjectId;
  transactionId: string;
  amount: number;
  paymentMode: "card" | "upi" | "netbanking" | "wallet" | "cash";
  status: "success" | "failed" | "refunded" | "pending";
  description?: string;
  createdAt: Date;
}
