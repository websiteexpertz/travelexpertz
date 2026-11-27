/**
 * Booking Document Engine Types & Interfaces
 * Collection: booking_documents
 */

import { ObjectId } from "mongodb";

export type DocumentType =
  | "BOOKING_VOUCHER"
  | "BOOKING_VOUCHER_RESCHEDULED"
  | "PAYMENT_RECEIPT"
  | "FINAL_INVOICE"
  | "CANCELLATION_CONFIRMATION";

export type DocumentStatus =
  | "PENDING"
  | "GENERATED"
  | "FAILED"
  | "SUPERSEDED"
  | "CANCELLED";

export interface BookingDocument {
  _id?: ObjectId | string;
  documentId: string;
  bookingId: string;
  customerId?: string;

  documentType: DocumentType;
  documentNumber: string; // e.g. YE-BV-2026-000001
  documentVersion: number;
  bookingVersion: number;

  gridFsFileId: ObjectId | string;
  filename: string;
  mimeType: string;
  fileSize: number;
  checksum: string; // SHA-256

  generationStatus: DocumentStatus;
  generatedAt: Date;
  issuedAt: Date;
  supersededAt?: Date;

  createdAt: Date;
  updatedAt: Date;

  metadata?: {
    bookingReference?: string;
    guestName?: string;
    propertyName?: string;
    checkinDate?: string;
    checkoutDate?: string;
    totalAmount?: number;
    paidAmount?: number;
    outstandingAmount?: number;
    paymentStatus?: string;
    bookingStatus?: string;
    isPayAtProperty?: boolean;
    cancellationReason?: string;
    supersededBy?: string;
    [key: string]: any;
  };
}

export interface DocumentGenerationResult {
  success: boolean;
  document?: BookingDocument;
  pdfBuffer?: Buffer;
  cached?: boolean;
  error?: string;
}
