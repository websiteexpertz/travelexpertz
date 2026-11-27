/**
 * Email Notification Adapter
 * Uses Nodemailer & Gmail SMTP via lib/services/email.ts
 * Integrates professional branded email templates from lib/services/notifications/email-templates.ts
 */

import path from "path";
import fs from "fs";
import { NotificationAdapter, SendNotificationInput, SendNotificationResult } from "./types";
import { sendMailWithResult, EmailAttachment } from "../../email";
import { renderNotificationEmail } from "../email-templates";
import { isEmailEnabled } from "../config";

export class EmailNotificationAdapter implements NotificationAdapter {
  channel: "EMAIL" = "EMAIL";

  async send(input: SendNotificationInput): Promise<SendNotificationResult> {
    const { recipient, type, bookingData } = input;

    // 1. Validate email recipient syntax
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!recipient || !emailRegex.test(recipient)) {
      return {
        success: false,
        status: "BLOCKED",
        errorCode: "INVALID_EMAIL_RECIPIENT",
        errorMessage: `Invalid email recipient address format: ${recipient}`,
        retryable: false,
      };
    }

    // 2. Check independent channel flag
    const channelEnabled = isEmailEnabled();

    // If channel is explicitly disabled, mark as BLOCKED without retry waste
    if (!channelEnabled) {
      return {
        success: false,
        status: "BLOCKED",
        errorCode: "EMAIL_CHANNEL_DISABLED",
        errorMessage: "Email notification channel is currently disabled by administrator configuration",
        retryable: false,
      };
    }

    // 3. Render branded template
    let rendered;
    try {
      rendered = renderNotificationEmail(type, bookingData);
    } catch (renderError: any) {
      return {
        success: false,
        status: "FAILED",
        errorCode: "EMAIL_TEMPLATE_RENDER_ERROR",
        errorMessage: renderError?.message || "Failed rendering email template",
        retryable: false,
      };
    }

    // 4. Safe testing mode / mock fixture
    const isTestMode =
      process.env.NOTIFICATION_TEST_MODE === "true" ||
      process.env.NODE_ENV === "test";

    if (isTestMode) {
      return {
        success: true,
        status: "ACCEPTED",
        providerMessageId: `mock-email-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`,
        retryable: false,
      };
    }

    // 5. Attachment readiness (Voucher/Invoice PDF and inline Brand Logo)
    const attachments: EmailAttachment[] = [];

    // Always attach official Yatra Expertz logo for seamless inline display (CID)
    const logoPngPath = path.join(process.cwd(), "public", "logo-email.png");
    if (fs.existsSync(logoPngPath)) {
      attachments.push({
        filename: "logo.png",
        path: logoPngPath,
        cid: "yatraexpertz-logo",
      });
    }

    if (input.bookingData && (input as any).documentBuffer) {
      attachments.push({
        filename:
          (input as any).documentFilename ||
          `Yatra-Expertz-Booking-Voucher-${bookingData.bookingReference}.pdf`,
        content: (input as any).documentBuffer,
        contentType: "application/pdf",
      });
    }

    // 6. Live SMTP Dispatch via Nodemailer pooled transporter
    try {
      const result = await sendMailWithResult({
        to: recipient,
        subject: rendered.subject,
        html: rendered.html,
        text: rendered.text,
        attachments: attachments.length > 0 ? attachments : undefined,
      });

      if (result.success && result.messageId) {
        return {
          success: true,
          status: "ACCEPTED",
          providerMessageId: result.messageId,
          retryable: false,
        };
      }

      // Classify SMTP Error
      const errorMsg = result.error?.message || "Unknown SMTP dispatch error";
      const errorCode = result.error?.code || "";
      const isRateLimit =
        errorMsg.toLowerCase().includes("rate") ||
        errorMsg.includes("421") ||
        errorCode === "ETIMEDOUT";

      const isAuthError =
        errorMsg.includes("535") ||
        errorCode === "EAUTH";

      if (isAuthError) {
        return {
          success: false,
          status: "BLOCKED",
          errorCode: "SMTP_AUTH_FAILED",
          errorMessage: "SMTP authentication failed. Verify SMTP_USER and SMTP_PASSWORD.",
          retryable: false,
        };
      }

      return {
        success: false,
        status: "FAILED",
        errorCode: isRateLimit ? "SMTP_RATE_LIMITED" : "SMTP_TRANSIENT_ERROR",
        errorMessage: errorMsg,
        retryable: true,
        retryAfterMs: isRateLimit ? 120_000 : 30_000,
      };
    } catch (err: any) {
      return {
        success: false,
        status: "FAILED",
        errorCode: "SMTP_DISPATCH_EXCEPTION",
        errorMessage: err?.message || "Unhandled exception during SMTP delivery",
        retryable: true,
      };
    }
  }
}
