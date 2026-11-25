/**
 * Document Generation Coordinator Service
 * Manages document lifecycle, versioning, GridFS persistence, and idempotency.
 */

import { Db, ObjectId } from "mongodb";
import { getDb } from "../../db";
import { BookingDocument, DocumentGenerationResult, DocumentType } from "./types";
import { getNextDocumentNumber } from "./document-numbering";
import { saveDocumentToGridFS, getDocumentBufferFromGridFS } from "./storage";
import { generateBookingVoucherPdf } from "./booking-voucher";
import { generateInvoicePdf, InvoiceBillingData } from "./final-invoice";
import { buildBookingCommunicationData } from "../notifications/data-builder";

// In-memory document registry for isolated unit tests / memory mocks
export const inMemoryBookingDocuments = new Map<string, BookingDocument>();

/**
 * Retrieves existing active voucher or generates a new one idempotently.
 */
export async function getOrGenerateBookingVoucher(
  bookingId: string,
  options: {
    database?: Db;
    forceRegenerate?: boolean;
    isRescheduled?: boolean;
    bookingVersion?: number;
  } = {}
): Promise<DocumentGenerationResult> {
  const db = options.database || (await getDb());
  const bookingsCollection = db.collection("bookings");
  const documentsCollection = db.collection<BookingDocument>("booking_documents");

  // 1. Fetch Authoritative Booking
  const booking = await bookingsCollection.findOne({
    _id: ObjectId.isValid(bookingId) ? new ObjectId(bookingId) : (bookingId as any),
  });

  if (!booking) {
    return { success: false, error: `Booking ${bookingId} not found` };
  }

  // Only confirmed or pay-at-property confirmed bookings are eligible
  if (booking.bookingStatus !== "confirmed") {
    return {
      success: false,
      error: `Cannot generate voucher for booking with status '${booking.bookingStatus}'`,
    };
  }

  const bookingVersion = Number(options.bookingVersion || booking.bookingVersion || 1);
  const targetDocType: DocumentType = options.isRescheduled
    ? "BOOKING_VOUCHER_RESCHEDULED"
    : "BOOKING_VOUCHER";

  // 2. Check for existing active document (Idempotency)
  if (!options.forceRegenerate) {
    let existingDoc: BookingDocument | null = null;

    if (documentsCollection && typeof documentsCollection.findOne === "function") {
      try {
        existingDoc = await documentsCollection.findOne({
          bookingId,
          documentType: { $in: ["BOOKING_VOUCHER", "BOOKING_VOUCHER_RESCHEDULED"] },
          bookingVersion,
          generationStatus: "GENERATED",
        });
      } catch {
        // Fallback to in-memory check
      }
    }

    if (!existingDoc) {
      for (const d of inMemoryBookingDocuments.values()) {
        if (
          d.bookingId === bookingId &&
          d.bookingVersion === bookingVersion &&
          d.generationStatus === "GENERATED"
        ) {
          existingDoc = d;
          break;
        }
      }
    }

    if (existingDoc) {
      try {
        const buffer = await getDocumentBufferFromGridFS(existingDoc.gridFsFileId, db);
        return { success: true, document: existingDoc, pdfBuffer: buffer };
      } catch (bufErr) {
        // If file missing from GridFS, re-generate below
      }
    }
  }

  // 3. Build Canonical Communication Data
  const commData = await buildBookingCommunicationData(bookingId, db);
  if (!commData) {
    return { success: false, error: "Failed to construct booking communication data" };
  }

  // 4. Generate Unique Document Number Atomically
  const docNumber = await getNextDocumentNumber(targetDocType, new Date().getFullYear(), db);

  // 5. Generate PDF in-memory buffer
  const pdfBuffer = await generateBookingVoucherPdf({
    ...commData,
    voucherNumber: docNumber,
    isRescheduled: options.isRescheduled,
  });

  const filename = `Yatra-Expertz-Booking-Voucher-${docNumber}.pdf`;

  // 6. Save to GridFS "booking_documents"
  const { gridFsFileId, fileSize, checksum } = await saveDocumentToGridFS(
    filename,
    pdfBuffer,
    {
      bookingId,
      bookingReference: commData.bookingReference,
      documentNumber: docNumber,
      documentType: targetDocType,
      bookingVersion,
    },
    db
  );

  // 7. Persist Document Record
  const now = new Date();
  const documentRecord: BookingDocument = {
    documentId: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
    bookingId,
    customerId: booking.userId?.toString(),
    documentType: targetDocType,
    documentNumber: docNumber,
    documentVersion: 1,
    bookingVersion,
    gridFsFileId,
    filename,
    mimeType: "application/pdf",
    fileSize,
    checksum,
    generationStatus: "GENERATED",
    generatedAt: now,
    issuedAt: now,
    createdAt: now,
    updatedAt: now,
    metadata: {
      bookingReference: commData.bookingReference,
      guestName: commData.guestName || commData.customerName,
      propertyName: commData.propertyName,
      checkinDate: commData.checkinDate,
      checkoutDate: commData.checkoutDate,
      totalAmount: commData.totalAmount,
      paidAmount: commData.paidAmount,
      outstandingAmount: commData.outstandingAmount,
      paymentStatus: commData.paymentStatus,
      bookingStatus: commData.bookingStatus,
      isPayAtProperty: commData.outstandingAmount > 0,
    },
  };

  try {
    const res = await documentsCollection.insertOne(documentRecord as any);
    documentRecord._id = res.insertedId;
  } catch {
    inMemoryBookingDocuments.set(documentRecord.documentId, documentRecord);
  }

  return {
    success: true,
    document: documentRecord,
    pdfBuffer,
  };
}

/**
 * Handles document invalidation and regeneration upon booking rescheduling.
 */
export async function handleBookingRescheduledDocuments(
  bookingId: string,
  newVersion: number,
  database?: Db
): Promise<DocumentGenerationResult> {
  const db = database || (await getDb());
  const documentsCollection = db.collection<BookingDocument>("booking_documents");

  const now = new Date();

  // 1. Mark previous active vouchers as SUPERSEDED
  try {
    await documentsCollection.updateMany(
      {
        bookingId,
        documentType: { $in: ["BOOKING_VOUCHER", "BOOKING_VOUCHER_RESCHEDULED"] },
        generationStatus: "GENERATED",
      },
      {
        $set: {
          generationStatus: "SUPERSEDED",
          supersededAt: now,
          updatedAt: now,
        },
      }
    );
  } catch {
    // In-memory update
    for (const d of inMemoryBookingDocuments.values()) {
      if (d.bookingId === bookingId && d.generationStatus === "GENERATED") {
        d.generationStatus = "SUPERSEDED";
        d.supersededAt = now;
      }
    }
  }

    // 2. Generate updated voucher for new revision
  return getOrGenerateBookingVoucher(bookingId, {
    database: db,
    forceRegenerate: true,
    isRescheduled: true,
    bookingVersion: newVersion,
  });
}

/**
 * Handles document cancellation when a booking is cancelled.
 */
export async function handleBookingCancelledDocuments(
  bookingId: string,
  reason: string = "Booking Cancelled",
  database?: Db
): Promise<number> {
  const db = database || (await getDb());
  const documentsCollection = db.collection<BookingDocument>("booking_documents");
  const now = new Date();

  try {
    const res = await documentsCollection.updateMany(
      {
        bookingId,
        generationStatus: "GENERATED",
      },
      {
        $set: {
          generationStatus: "CANCELLED",
          updatedAt: now,
          "metadata.cancellationReason": reason,
        },
      }
    );
    return res.modifiedCount;
  } catch {
    let count = 0;
    for (const d of inMemoryBookingDocuments.values()) {
      if (d.bookingId === bookingId && d.generationStatus === "GENERATED") {
        d.generationStatus = "CANCELLED";
        d.updatedAt = now;
        count++;
      }
    }
    return count;
  }
}

/**
 * Retrieves existing active final invoice or generates a new one idempotently.
 */
export async function getOrGenerateFinalInvoice(
  bookingId: string,
  options: {
    database?: Db;
    forceRegenerate?: boolean;
    billingSnapshot?: any;
  } = {}
): Promise<DocumentGenerationResult> {
  const db = options.database || (await getDb());
  const bookingsCollection = db.collection("bookings");
  const documentsCollection = db.collection<BookingDocument>("booking_documents");

  // 1. Fetch Authoritative Booking
  const booking = await bookingsCollection.findOne({
    _id: ObjectId.isValid(bookingId) ? new ObjectId(bookingId) : (bookingId as any),
  });

  if (!booking) {
    return { success: false, error: `Booking ${bookingId} not found` };
  }

  // 2. Check for existing active final invoice (Idempotency)
  if (!options.forceRegenerate) {
    let existingDoc: BookingDocument | null = null;
    if (documentsCollection && typeof documentsCollection.findOne === "function") {
      try {
        existingDoc = await documentsCollection.findOne({
          bookingId,
          documentType: "FINAL_INVOICE",
          generationStatus: "GENERATED",
        });
      } catch {}
    }

    if (!existingDoc) {
      for (const d of inMemoryBookingDocuments.values()) {
        if (
          d.bookingId === bookingId &&
          d.documentType === "FINAL_INVOICE" &&
          d.generationStatus === "GENERATED"
        ) {
          existingDoc = d;
          break;
        }
      }
    }

    if (existingDoc) {
      let pdfBuffer: Buffer | undefined;
      try {
        pdfBuffer = await getDocumentBufferFromGridFS(existingDoc.gridFsFileId, db);
      } catch {}
      return {
        success: true,
        document: existingDoc,
        pdfBuffer,
        cached: true,
      };
    }
  }

  // 3. Sequential Numbering
  const year = new Date().getFullYear();
  const invoiceNumber = await getNextDocumentNumber("FINAL_INVOICE", year, db);

  // 4. Assemble canonical communication data
  const baseData = await buildBookingCommunicationData(bookingId, db);
  if (!baseData) {
    return { success: false, error: `Failed to construct booking communication data for ${bookingId}` };
  }

  const snapshot = options.billingSnapshot || booking.finalBillingSnapshot || {};

  const invoiceBillingData: InvoiceBillingData = {
    ...baseData,
    invoiceNumber,
    invoiceDate: new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
    supplierName: snapshot.supplierName || baseData.propertyName,
    supplierGstin: snapshot.supplierGstin,
    supplierAddress: snapshot.supplierAddress || `${baseData.propertyAddress}, ${baseData.propertyCity}`,
    isGstTaxInvoice: Boolean(snapshot.isGstTaxInvoice && snapshot.supplierGstin),
    totalAmount: snapshot.totalInvoicedAmount ?? baseData.totalAmount,
    paidAmount: snapshot.totalPaidAmount ?? baseData.paidAmount,
    outstandingAmount: snapshot.outstandingBalance ?? baseData.outstandingAmount,
    roomCharges: snapshot.roomCharges,
    taxAmount: snapshot.taxesAndFees,
    paymentMethod: snapshot.paymentMethod,
    transactionReference: snapshot.transactionReference || booking.cashfreeOrderId,
  };

  // 5. Generate PDF In-Memory
  const pdfBuffer = await generateInvoicePdf(invoiceBillingData);
  const now = new Date();
  const documentId = `doc_inv_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const filename = `Yatra-Expertz-Invoice-${invoiceNumber}.pdf`;

  // 6. Save to GridFS (booking_documents bucket)
  const saveRes = await saveDocumentToGridFS(
    filename,
    pdfBuffer,
    {
      bookingId,
      documentId,
      documentType: "FINAL_INVOICE",
      documentNumber: invoiceNumber,
      documentVersion: 1,
      bookingVersion: Number(booking.bookingVersion || 1),
    },
    db
  );

  // 7. Persist document metadata
  const documentRecord: BookingDocument = {
    documentId,
    bookingId,
    customerId: booking.userId?.toString(),
    documentType: "FINAL_INVOICE",
    documentNumber: invoiceNumber,
    documentVersion: 1,
    bookingVersion: Number(booking.bookingVersion || 1),
    gridFsFileId: saveRes.gridFsFileId,
    filename,
    mimeType: "application/pdf",
    fileSize: saveRes.fileSize,
    checksum: saveRes.checksum,
    generationStatus: "GENERATED",
    generatedAt: now,
    issuedAt: now,
    createdAt: now,
    updatedAt: now,
  };

  if (documentsCollection && typeof documentsCollection.insertOne === "function") {
    try {
      await documentsCollection.insertOne(documentRecord);
    } catch {}
  }
  inMemoryBookingDocuments.set(documentId, documentRecord);

  return {
    success: true,
    document: documentRecord,
    pdfBuffer,
    cached: false,
  };
}
