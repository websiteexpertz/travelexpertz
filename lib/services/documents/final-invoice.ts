/**
 * Yatra Expertz — Final Invoice PDF Generator & Billing Foundation
 * Supports Commercial Invoices & Tax Invoices with verified billing data.
 * (Full automatic trigger will be connected in Phase 5 checkout finalization).
 */

import PDFDocument from "pdfkit";
import { BookingCommunicationData } from "../notifications/data-builder";

export interface InvoiceBillingData extends BookingCommunicationData {
  invoiceNumber: string;
  invoiceDate?: string;
  supplierName?: string;
  supplierGstin?: string;
  supplierAddress?: string;
  customerGstin?: string;
  isGstTaxInvoice?: boolean;
  paymentMethod?: string;
  transactionReference?: string;
  roomCharges?: number;
  taxAmount?: number;
  platformFee?: number;
}

function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

/**
 * Generates an Invoice PDF Buffer in-memory.
 */
export async function generateInvoicePdf(
  data: InvoiceBillingData
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        info: {
          Title: `Yatra Expertz Invoice - ${data.invoiceNumber}`,
          Author: data.supplierName || "Yatra Expertz",
          Subject: `Accommodation Invoice for Booking ${data.bookingReference}`,
        },
      });

      const chunks: Buffer[] = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", (err) => reject(err));

      const navyColor = "#0f172a";
      const blueColor = "#0b6dff";
      const grayText = "#475467";
      const lightBg = "#f8fafc";
      const borderColor = "#e2e8f0";
      const greenColor = "#166534";

      const pageWidth = 595.28;
      const margin = 40;
      const contentWidth = pageWidth - margin * 2;

      // Top bar
      doc.rect(margin, 25, contentWidth, 4).fill(navyColor);

      // Title & Entity
      const isTaxInvoice = Boolean(data.isGstTaxInvoice && data.supplierGstin);
      const invoiceTitle = isTaxInvoice ? "TAX INVOICE" : "COMMERCIAL STAY INVOICE";

      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(20).text(invoiceTitle, margin, 40);
      const supplier = data.supplierName || "Yatra Expertz Online Platform";
      doc.fillColor(grayText).font("Helvetica").fontSize(9).text(supplier, margin, 65);
      if (data.supplierGstin) {
        doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(8.5).text(`GSTIN: ${data.supplierGstin}`, margin, 78);
      } else {
        doc.fillColor(grayText).font("Helvetica").fontSize(8).text("Booking Facilitation Services", margin, 78);
      }

      // Invoice Meta (Right side)
      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(11).text(`Invoice No: ${data.invoiceNumber}`, margin, 42, {
        align: "right",
        width: contentWidth,
      });

      const invoiceDate = data.invoiceDate || new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      doc.fillColor(grayText).font("Helvetica").fontSize(9).text(`Date: ${invoiceDate}`, margin, 58, {
        align: "right",
        width: contentWidth,
      });

      doc.fillColor(grayText).fontSize(9).text(`Booking Ref: ${data.bookingReference}`, margin, 72, {
        align: "right",
        width: contentWidth,
      });

      doc.moveTo(margin, 98).lineTo(margin + contentWidth, 98).strokeColor(borderColor).lineWidth(1).stroke();

      // Bill To & Accommodation details
      const gridY = 110;
      const colWidth = (contentWidth - 16) / 2;

      // Customer
      doc.roundedRect(margin, gridY, colWidth, 90, 6).fillAndStroke(lightBg, borderColor);
      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(9).text("BILLED TO", margin + 12, gridY + 10);
      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(11).text(data.customerName || data.guestName || "Guest", margin + 12, gridY + 24);
      doc.fillColor(grayText).font("Helvetica").fontSize(8.5).text(`Email: ${data.customerEmail}`, margin + 12, gridY + 40);
      doc.fillColor(grayText).fontSize(8.5).text(`Phone: ${data.customerPhone}`, margin + 12, gridY + 54);
      if (data.customerGstin) {
        doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(8.5).text(`Customer GSTIN: ${data.customerGstin}`, margin + 12, gridY + 68);
      }

      // Property
      const rightX = margin + colWidth + 16;
      doc.roundedRect(rightX, gridY, colWidth, 90, 6).fillAndStroke(lightBg, borderColor);
      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(9).text("PROPERTY DETAILS", rightX + 12, gridY + 10);
      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(11).text(data.propertyName, rightX + 12, gridY + 24);
      doc.fillColor(grayText).font("Helvetica").fontSize(8.5).text(`${data.propertyAddress}, ${data.propertyCity}`, rightX + 12, gridY + 40);
      doc.fillColor(grayText).fontSize(8.5).text(`Stay Dates: ${data.checkinDate} to ${data.checkoutDate} (${data.nightsCount || 1} nights)`, rightX + 12, gridY + 54);

      // Line Items Table
      const tableHeadY = 220;
      doc.rect(margin, tableHeadY, contentWidth, 20).fill("#f1f5f9");
      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(8.5).text("ITEM / SERVICE DESCRIPTION", margin + 10, tableHeadY + 6);
      doc.text("AMOUNT (INR)", margin + contentWidth - 110, tableHeadY + 6, { align: "right", width: 100 });

      let rowY = tableHeadY + 28;
      const drawRow = (desc: string, amt: string, isBold: boolean = false) => {
        doc.fillColor(navyColor).font(isBold ? "Helvetica-Bold" : "Helvetica").fontSize(8.5).text(desc, margin + 10, rowY);
        doc.text(amt, margin + contentWidth - 110, rowY, { align: "right", width: 100 });
        rowY += 18;
      };

      const roomCharges = data.roomCharges || Math.round(data.totalAmount * 0.85);
      const tax = data.taxAmount || (data.totalAmount - roomCharges);
      const total = data.totalAmount || 0;
      const paid = data.paidAmount || 0;
      const balance = data.outstandingAmount || 0;

      drawRow(`Room Accommodation Charges - ${data.roomCategory || "Standard"} (${data.nightsCount || 1} nights)`, formatCurrency(roomCharges));
      drawRow("Taxes & Service Fees", formatCurrency(tax));

      doc.moveTo(margin, rowY).lineTo(margin + contentWidth, rowY).strokeColor(borderColor).lineWidth(0.5).stroke();
      rowY += 8;

      drawRow("Total Invoiced Amount", formatCurrency(total), true);
      drawRow("Total Amount Paid", formatCurrency(paid), true);

      if (balance > 0) {
        drawRow("Balance Due at Property", formatCurrency(balance), true);
      } else {
        drawRow("Payment Status", "Fully Paid / Settled", true);
      }

      // Legal & Transaction info
      rowY += 16;
      doc.roundedRect(margin, rowY, contentWidth, 50, 4).fillAndStroke(lightBg, borderColor);
      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(8.5).text("TRANSACTION & SETTLEMENT DETAILS", margin + 10, rowY + 8);
      const txRef = data.transactionReference || `TXN-${data.bookingReference}`;
      doc.fillColor(grayText).font("Helvetica").fontSize(8).text(`Payment Gateway: Cashfree Payments | Reference: ${txRef}`, margin + 10, rowY + 22);
      doc.text(`Settlement Status: ${data.paymentStatus === "paid" ? "Paid in Full" : "Partially Paid"}`, margin + 10, rowY + 34);

      // Footer
      const footerY = 750;
      doc.moveTo(margin, footerY).lineTo(margin + contentWidth, footerY).strokeColor(borderColor).lineWidth(1).stroke();
      doc.fillColor(grayText).font("Helvetica").fontSize(8).text(
        "This is an electronically generated commercial invoice issued via Yatra Expertz. For inquiries: support@yatraexpertz.com",
        margin,
        footerY + 12,
        { align: "center", width: contentWidth }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
