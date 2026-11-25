/**
 * Yatra Expertz — Booking Voucher PDF Generator
 * Generates branded, high-fidelity A4 Booking Vouchers using PDFKit in-memory buffers.
 */

import PDFDocument from "pdfkit";
import { BookingCommunicationData } from "../notifications/data-builder";

export interface BookingVoucherData extends BookingCommunicationData {
  voucherNumber: string;
  voucherVersion?: number;
  issueDate?: string;
  isRescheduled?: boolean;
  guestEmail?: string;
  guestPhone?: string;
}

/**
 * Formats monetary amounts in standard Indian Rupee notation.
 */
function formatCurrency(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN")}`;
}

/**
 * Generates a Booking Voucher PDF Buffer in-memory.
 */
export async function generateBookingVoucherPdf(
  data: BookingVoucherData
): Promise<Buffer> {
  return new Promise<Buffer>((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 40,
        info: {
          Title: `Yatra Expertz Booking Voucher - ${data.voucherNumber}`,
          Author: "Yatra Expertz",
          Subject: `Booking Confirmation Voucher for ${data.guestName || data.customerName}`,
          Keywords: "Yatra Expertz, Booking Voucher, Travel, Hotel, Homestay",
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
      const amberColor = "#92400e";

      const pageWidth = 595.28; // A4 width in pt
      const margin = 40;
      const contentWidth = pageWidth - margin * 2; // 515.28 pt

      // =========================================================================
      // 1. BRAND HEADER
      // =========================================================================
      // Top accent bar
      doc.rect(margin, 25, contentWidth, 4).fill(blueColor);

      // Company Title & Tagline
      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(22).text("YATRA EXPERTZ", margin, 40);
      doc.fillColor(grayText).font("Helvetica").fontSize(9).text("Har Yatra Banaye Yadgaar", margin, 66);
      doc.fillColor(grayText).fontSize(8).text("https://www.yatraexpertz.com | support@yatraexpertz.com", margin, 78);

      // Right-aligned Document Label
      const titleLabel = data.isRescheduled ? "UPDATED BOOKING VOUCHER" : "BOOKING VOUCHER";
      doc.fillColor(blueColor).font("Helvetica-Bold").fontSize(13).text(titleLabel, margin, 42, {
        align: "right",
        width: contentWidth,
      });

      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(10).text(`Voucher No: ${data.voucherNumber}`, margin, 60, {
        align: "right",
        width: contentWidth,
      });

      const issueDate = data.issueDate || new Date().toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
      doc.fillColor(grayText).font("Helvetica").fontSize(9).text(`Issued: ${issueDate}`, margin, 74, {
        align: "right",
        width: contentWidth,
      });

      // Divider line
      doc.moveTo(margin, 98).lineTo(margin + contentWidth, 98).strokeColor(borderColor).lineWidth(1).stroke();

      // =========================================================================
      // 2. STATUS BANNER
      // =========================================================================
      const bannerY = 108;
      const isPayAtProperty = data.outstandingAmount > 0;
      const isConfirmed = data.bookingStatus === "confirmed";

      let statusBadgeText = isConfirmed ? "BOOKING CONFIRMED" : "BOOKING PENDING";
      if (data.isRescheduled) statusBadgeText = "RESCHEDULED CONFIRMED";
      if (isPayAtProperty) statusBadgeText += " (PAY AT PROPERTY)";

      const bannerBg = isConfirmed ? "#f0fdf4" : "#fffbeb";
      const bannerBorder = isConfirmed ? "#bbf7d0" : "#fef3c7";
      const bannerTextCol = isConfirmed ? greenColor : amberColor;

      doc.roundedRect(margin, bannerY, contentWidth, 26, 4).fillAndStroke(bannerBg, bannerBorder);
      doc.fillColor(bannerTextCol).font("Helvetica-Bold").fontSize(9).text(
        `STATUS: ${statusBadgeText}  |  BOOKING REFERENCE: ${data.bookingReference}`,
        margin + 12,
        bannerY + 8
      );

      // =========================================================================
      // 3. PROPERTY & GUEST DETAILS (2-Column Grid)
      // =========================================================================
      const gridY = 144;
      const colWidth = (contentWidth - 16) / 2;

      // Left Column: Property Card
      doc.roundedRect(margin, gridY, colWidth, 115, 6).fillAndStroke(lightBg, borderColor);
      doc.fillColor(blueColor).font("Helvetica-Bold").fontSize(9).text("PROPERTY DETAILS", margin + 12, gridY + 10);

      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(12).text(data.propertyName, margin + 12, gridY + 24, {
        width: colWidth - 24,
      });

      doc.fillColor(grayText).font("Helvetica").fontSize(8.5).text(
        `${data.propertyAddress}, ${data.propertyCity || ""}${data.propertyState ? `, ${data.propertyState}` : ""}`,
        margin + 12,
        gridY + 54,
        { width: colWidth - 24 }
      );

      doc.fillColor(navyColor).font("Helvetica").fontSize(8.5).text(
        `Property Contact: ${data.propertyPhone || "+91 98765 43210"}`,
        margin + 12,
        gridY + 82
      );

      doc.fillColor(blueColor).font("Helvetica").fontSize(8.5).text(
        `Type: ${data.propertyType === "homestay" ? "Verified Homestay" : "Hotel"}`,
        margin + 12,
        gridY + 96
      );

      // Right Column: Guest Card
      const rightX = margin + colWidth + 16;
      doc.roundedRect(rightX, gridY, colWidth, 115, 6).fillAndStroke(lightBg, borderColor);
      doc.fillColor(blueColor).font("Helvetica-Bold").fontSize(9).text("PRIMARY GUEST DETAILS", rightX + 12, gridY + 10);

      const guestName = data.guestName || data.customerName || "Valued Guest";
      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(12).text(guestName, rightX + 12, gridY + 24, {
        width: colWidth - 24,
      });

      doc.fillColor(grayText).font("Helvetica").fontSize(8.5).text(
        `Email: ${data.customerEmail || data.guestEmail || "N/A"}`,
        rightX + 12,
        gridY + 54
      );

      doc.fillColor(grayText).font("Helvetica").fontSize(8.5).text(
        `Phone: ${data.customerPhone || data.guestPhone || "N/A"}`,
        rightX + 12,
        gridY + 68
      );

      doc.fillColor(grayText).font("Helvetica").fontSize(8.5).text(
        `Total Guests: ${data.guestsCount || 1} Guest${(data.guestsCount || 1) > 1 ? "s" : ""}`,
        rightX + 12,
        gridY + 82
      );

      doc.fillColor(navyColor).font("Helvetica").fontSize(8.5).text(
        `Accommodation: ${data.roomCategory || "Standard Room"}`,
        rightX + 12,
        gridY + 96
      );

      // =========================================================================
      // 4. STAY DATES & TIMINGS (4-Column Bar)
      // =========================================================================
      const stayY = 270;
      doc.roundedRect(margin, stayY, contentWidth, 54, 6).fillAndStroke(lightBg, borderColor);

      const subColWidth = contentWidth / 4;

      // Check-in Date & Time
      doc.fillColor(grayText).font("Helvetica-Bold").fontSize(8).text("CHECK-IN DATE", margin + 12, stayY + 10);
      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(11).text(data.checkinDate, margin + 12, stayY + 22);
      doc.fillColor(grayText).font("Helvetica").fontSize(8).text(`From ${data.checkinTime || "12:00 PM"}`, margin + 12, stayY + 36);

      // Check-out Date & Time
      doc.fillColor(grayText).font("Helvetica-Bold").fontSize(8).text("CHECK-OUT DATE", margin + subColWidth + 12, stayY + 10);
      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(11).text(data.checkoutDate, margin + subColWidth + 12, stayY + 22);
      doc.fillColor(grayText).font("Helvetica").fontSize(8).text(`Until ${data.checkoutTime || "11:00 AM"}`, margin + subColWidth + 12, stayY + 36);

      // Duration & Rooms
      doc.fillColor(grayText).font("Helvetica-Bold").fontSize(8).text("DURATION", margin + subColWidth * 2 + 12, stayY + 10);
      const nights = data.nightsCount || 1;
      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(11).text(`${nights} Night${nights > 1 ? "s" : ""}`, margin + subColWidth * 2 + 12, stayY + 22);
      doc.fillColor(grayText).font("Helvetica").fontSize(8).text(`${data.roomCategory || "Standard Room"}`, margin + subColWidth * 2 + 12, stayY + 36);

      // Meal & Inclusions
      doc.fillColor(grayText).font("Helvetica-Bold").fontSize(8).text("INCLUSIONS", margin + subColWidth * 3 + 12, stayY + 10);
      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(10).text("EP (Room Only)", margin + subColWidth * 3 + 12, stayY + 22);
      doc.fillColor(grayText).font("Helvetica").fontSize(8).text("Free Wi-Fi included", margin + subColWidth * 3 + 12, stayY + 36);

      // =========================================================================
      // 5. PAYMENT & FINANCIAL SUMMARY
      // =========================================================================
      const payY = 336;
      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(11).text("PAYMENT SUMMARY", margin, payY);

      // Table Header
      const tableHeadY = payY + 16;
      doc.rect(margin, tableHeadY, contentWidth, 20).fill("#f1f5f9");
      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(8.5).text("DESCRIPTION", margin + 10, tableHeadY + 6);
      doc.text("AMOUNT (INR)", margin + contentWidth - 110, tableHeadY + 6, { align: "right", width: 100 });

      // Rows
      let rowY = tableHeadY + 24;
      const drawRow = (label: string, value: string, isBold: boolean = false, color: string = navyColor) => {
        doc.fillColor(color).font(isBold ? "Helvetica-Bold" : "Helvetica").fontSize(8.5).text(label, margin + 10, rowY);
        doc.text(value, margin + contentWidth - 110, rowY, { align: "right", width: 100 });
        rowY += 16;
      };

      const totalAmount = data.totalAmount || 0;
      const paidAmount = data.paidAmount || 0;
      const outstanding = data.outstandingAmount || 0;

      drawRow("Room Tariff & Stay Package Charges", formatCurrency(totalAmount));
      drawRow("Taxes & Applicable Platform Service Fees", "Included in tariff");

      doc.moveTo(margin, rowY).lineTo(margin + contentWidth, rowY).strokeColor(borderColor).lineWidth(0.5).stroke();
      rowY += 6;

      drawRow("Total Stay Amount", formatCurrency(totalAmount), true, navyColor);
      drawRow("Amount Paid Online", formatCurrency(paidAmount), true, greenColor);

      if (outstanding > 0) {
        drawRow("Balance Due at Check-in (Pay at Hotel)", formatCurrency(outstanding), true, amberColor);
      } else {
        drawRow("Balance Due at Property", "Rs. 0 (Fully Paid)", true, greenColor);
      }

      // =========================================================================
      // 6. IMPORTANT CHECK-IN GUIDELINES & CANCELLATION POLICY
      // =========================================================================
      const guidelinesY = rowY + 12;
      doc.roundedRect(margin, guidelinesY, contentWidth, 80, 6).fillAndStroke(lightBg, borderColor);

      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(9).text("IMPORTANT CHECK-IN GUIDELINES", margin + 12, guidelinesY + 10);
      const instructions = data.checkinInstructions ||
        "All adult guests must present an original valid government-issued photo ID (Aadhaar, Passport, or Driving License; PAN cards are not accepted) upon arrival.";
      doc.fillColor(grayText).font("Helvetica").fontSize(8).text(instructions, margin + 12, guidelinesY + 24, {
        width: contentWidth - 24,
      });

      doc.fillColor(navyColor).font("Helvetica-Bold").fontSize(9).text("CANCELLATION POLICY", margin + 12, guidelinesY + 48);
      const policy = data.cancellationPolicy ||
        "Free cancellation up to 48 hours prior to check-in date. Cancellations made within 48 hours are subject to standard property cancellation charges.";
      doc.fillColor(grayText).font("Helvetica").fontSize(8).text(policy, margin + 12, guidelinesY + 60, {
        width: contentWidth - 24,
      });

      // =========================================================================
      // 7. FOOTER
      // =========================================================================
      const footerY = 750;
      doc.moveTo(margin, footerY).lineTo(margin + contentWidth, footerY).strokeColor(borderColor).lineWidth(1).stroke();

      doc.fillColor(grayText).font("Helvetica").fontSize(7.5).text(
        "Need help with your booking? 24x7 Customer Support: support@yatraexpertz.com | Phone: +91 99999 99999",
        margin,
        footerY + 8,
        { align: "center", width: contentWidth }
      );

      doc.text(
        "This is an electronically generated booking voucher and does not require a physical signature. Powered by Yatra Expertz.",
        margin,
        footerY + 20,
        { align: "center", width: contentWidth }
      );

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
