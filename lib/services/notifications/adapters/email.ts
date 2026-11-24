/**
 * Email Notification Adapter
 * Uses Nodemailer SMTP via lib/services/email.ts
 */

import { NotificationAdapter, SendNotificationInput, SendNotificationResult } from "./types";
import { sendEmail } from "../../email";

export class EmailNotificationAdapter implements NotificationAdapter {
  channel: "EMAIL" = "EMAIL";

  async send(input: SendNotificationInput): Promise<SendNotificationResult> {
    const { recipient, type, bookingData } = input;

    // 1. Validate email syntax
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!recipient || !emailRegex.test(recipient)) {
      return {
        success: false,
        status: "BLOCKED",
        errorCode: "INVALID_EMAIL_RECIPIENT",
        errorMessage: `Invalid email recipient address: ${recipient}`,
        retryable: false,
      };
    }

    // 2. Safe testing mode check (prevents real emails during Phase 2 / testing)
    const isTestMode =
      process.env.NOTIFICATION_TEST_MODE === "true" ||
      process.env.NODE_ENV === "test";

    if (isTestMode) {
      console.log(`[EmailAdapter:TEST_MODE] Mocked email send to ${recipient} for type ${type}`);
      return {
        success: true,
        status: "ACCEPTED",
        providerMessageId: `mock-email-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        retryable: false,
      };
    }

    // 3. Render basic responsive template for Phase 2
    const subject = `Booking Confirmation: ${bookingData.propertyName} (${bookingData.bookingReference}) - Yatra Expertz`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
        <div style="background: #0066cc; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🌍 ${bookingData.brandName}</h1>
          <p style="margin: 5px 0 0 0;">Booking Confirmation Voucher</p>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; background: #ffffff;">
          <p>Dear <strong>${bookingData.customerName}</strong>,</p>
          <p>Your booking has been successfully confirmed at <strong>${bookingData.propertyName}</strong>.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Reference:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${bookingData.bookingReference}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Check-in:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${bookingData.checkinDate}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Check-out:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${bookingData.checkoutDate}</td></tr>
            <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Total Amount:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">₹${bookingData.totalAmount.toLocaleString("en-IN")}</td></tr>
          </table>
          <p>For inquiries, please visit <a href="${bookingData.portalUrl}">${bookingData.portalUrl}</a>.</p>
        </div>
      </div>
    `;

    try {
      const emailSent = await sendEmail({
        to: recipient,
        subject,
        html,
        text: `Booking Reference: ${bookingData.bookingReference}. Property: ${bookingData.propertyName}.`,
      });

      if (emailSent) {
        return {
          success: true,
          status: "ACCEPTED",
          providerMessageId: `smtp-${Date.now()}`,
          retryable: false,
        };
      } else {
        return {
          success: false,
          status: "FAILED",
          errorCode: "SMTP_TRANSPORTER_FAILED",
          errorMessage: "Nodemailer transporter failed to dispatch message",
          retryable: true,
        };
      }
    } catch (err: any) {
      const isRateLimit = err?.message?.toLowerCase().includes("rate");
      return {
        success: false,
        status: "FAILED",
        errorCode: isRateLimit ? "SMTP_RATE_LIMITED" : "SMTP_TRANSIENT_ERROR",
        errorMessage: err?.message || "Unknown SMTP error",
        retryable: true,
      };
    }
  }
}
