import { ObjectId } from "mongodb";

export type ModerationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "HIDDEN"
  | "CHANGES_REQUESTED";

export interface ReviewMediaItem {
  type: "photo" | "video";
  url: string;
  fileId?: string;
  thumbnailUrl?: string;
  altText?: string;
  sizeBytes?: number;
  mimeType?: string;
  durationSeconds?: number;
}

export interface VerifiedReview {
  _id?: ObjectId | string;
  bookingId?: string;
  propertyId: string;
  propertyName: string;
  propertyCity?: string;
  propertyState?: string;
  propertyType: string;
  customerId?: string;
  userId: string;
  verifiedStay: boolean;
  reviewerDisplayName: string;
  userName: string; // for backward compatibility with existing components
  reviewerAvatar?: string;
  userImage?: string; // for backward compatibility
  overallRating: number;
  rating: number; // for backward compatibility
  reviewTitle?: string;
  reviewText: string;
  recommendProperty?: boolean;
  photos?: string[];
  videos?: string[];
  reviewImages?: string[]; // for backward compatibility
  media?: ReviewMediaItem[];
  moderationStatus: ModerationStatus;
  moderationReason?: string;
  moderatedBy?: string;
  moderatedAt?: Date;
  submittedAt: Date;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  active: boolean; // true if moderationStatus === "APPROVED"
  verified: boolean; // true if verifiedStay === true
  featuredOnHomepage?: boolean;
}

export interface ReviewEligibilityResult {
  eligible: boolean;
  errorCode?:
    | "BOOKING_NOT_FOUND"
    | "BOOKING_NOT_CONFIRMED"
    | "CHECKIN_REQUIRED"
    | "CHECKOUT_REQUIRED"
    | "BOOKING_CANCELLED"
    | "NO_SHOW"
    | "PROPERTY_MISMATCH"
    | "UNAUTHORIZED"
    | "ALREADY_REVIEWED"
    | "TOKEN_EXPIRED"
    | "TOKEN_REVOKED"
    | "TOKEN_INVALID";
  reason?: string;
  booking?: {
    _id: string;
    bookingReference?: string;
    propertyId: string;
    propertyName: string;
    propertyCity?: string;
    propertyImage?: string;
    checkInDate?: string;
    checkOutDate?: string;
    actualCheckInAt?: Date | string;
    actualCheckOutAt?: Date | string;
    guestName?: string;
    guestEmail?: string;
    userId?: string;
    stayStatus?: string;
    bookingStatus?: string;
  };
}

export interface ReviewTokenPayload {
  bookingId: string;
  propertyId: string;
  guestEmail: string;
  expiresAt: number;
}
