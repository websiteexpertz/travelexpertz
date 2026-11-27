/**
 * Notification Model Definitions
 * Collection: booking_notifications
 */

import { ObjectId } from "mongodb";

export type NotificationChannel = "EMAIL" | "WHATSAPP";

export type NotificationType =
  | "BOOKING_CONFIRMATION"
  | "REMINDER_7_DAYS"
  | "REMINDER_48_HOURS"
  | "REMINDER_24_HOURS"
  | "REMINDER_12_HOURS"
  | "REMINDER_4_HOURS"
  | "REMINDER_2_HOURS"
  | "BOOKING_RESCHEDULED"
  | "BOOKING_CANCELLED"
  | "CHECKOUT_THANK_YOU"
  | "FINAL_INVOICE"
  | "REVIEW_REQUEST";

export type NotificationStatus =
  | "PENDING"
  | "PROCESSING"
  | "SENDING"
  | "RETRY_SCHEDULED"
  | "ACCEPTED"
  | "DELIVERED"
  | "FAILED"
  | "CANCELLED"
  | "SKIPPED"
  | "DELIVERY_UNKNOWN"
  | "BLOCKED";

export interface BookingNotification {
  _id?: ObjectId | string;
  bookingId: string;
  bookingVersion: number;
  customerId?: string;
  propertyId: string;

  type: NotificationType;
  channel: NotificationChannel;
  recipient: string; // Sanitized email or E.164 phone number

  status: NotificationStatus;

  scheduledAt: Date;
  nextAttemptAt: Date;

  attempts: number;
  maxAttempts: number;

  idempotencyKey: string;

  providerMessageId?: string;

  claimToken?: string;
  leaseExpiresAt?: Date;

  lastErrorCode?: string;
  lastErrorMessage?: string;

  acceptedAt?: Date;
  deliveredAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  metadata?: {
    bookingReference?: string;
    propertyName?: string;
    propertyType?: "hotel" | "homestay";
    guestName?: string;
    checkin?: string;
    checkout?: string;
    amount?: number;
    [key: string]: any;
  };
}
