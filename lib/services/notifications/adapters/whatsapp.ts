/**
 * WhatsApp Notification Adapter
 * Target: Official Meta WhatsApp Business Cloud API
 * Graph API endpoint: https://graph.facebook.com/{version}/{phone-number-id}/messages
 */

import { createHmac, timingSafeEqual } from "crypto";
import { NotificationAdapter, SendNotificationInput, SendNotificationResult } from "./types";
import { getWhatsAppTemplate } from "./whatsapp-templates";
import { isWhatsAppEnabled } from "../config";

/**
 * Validates Meta X-Hub-Signature-256 HMAC header
 */
export function verifyMetaSignature(
  rawBody: string,
  signatureHeader: string | null,
  appSecret: string
): boolean {
  if (!signatureHeader || !appSecret) return false;
  const parts = signatureHeader.split("=");
  if (parts.length !== 2 || parts[0] !== "sha256") return false;

  const expectedSignature = parts[1];
  const computedSignature = createHmac("sha256", appSecret)
    .update(rawBody, "utf8")
    .digest("hex");

  if (expectedSignature.length !== computedSignature.length) return false;

  return timingSafeEqual(
    Buffer.from(expectedSignature, "utf8"),
    Buffer.from(computedSignature, "utf8")
  );
}

export class WhatsAppNotificationAdapter implements NotificationAdapter {
  channel: "WHATSAPP" = "WHATSAPP";

  private apiVersion: string;
  private timeoutMs: number;

  constructor(options: { apiVersion?: string; timeoutMs?: number } = {}) {
    this.apiVersion = options.apiVersion || process.env.WHATSAPP_API_VERSION || "v21.0";
    this.timeoutMs = options.timeoutMs || 10_000;
  }

  /**
   * Normalizes any phone number into clean international format (digits only, no + or whitespace)
   */
  public normalizePhoneNumber(phone: string): string {
    let clean = (phone || "").replace(/[^\d+]/g, "");
    if (clean.startsWith("+")) {
      clean = clean.slice(1);
    }
    // 10-digit Indian standard mobile number
    if (clean.length === 10) {
      clean = `91${clean}`;
    }
    return clean;
  }

  /**
   * Validates if normalized phone number is structurally valid for Meta Cloud API
   */
  public isValidPhoneNumber(normalized: string): boolean {
    return Boolean(normalized && normalized.length >= 10 && normalized.length <= 15);
  }

  async send(input: SendNotificationInput): Promise<SendNotificationResult> {
    const { recipient, type, bookingData } = input;

    // 1. Sanitize & validate recipient phone number
    const normalizedPhone = this.normalizePhoneNumber(recipient);
    if (!this.isValidPhoneNumber(normalizedPhone)) {
      return {
        success: false,
        status: "BLOCKED",
        errorCode: "INVALID_PHONE_NUMBER",
        errorMessage: `Phone number is invalid or has improper country code: ${recipient}`,
        retryable: false,
      };
    }

    // 2. Check independent channel flag
    const channelEnabled = isWhatsAppEnabled();

    // When disabled, record as BLOCKED without network calls or retry waste
    if (!channelEnabled) {
      return {
        success: false,
        status: "BLOCKED",
        errorCode: "WHATSAPP_CHANNEL_DISABLED",
        errorMessage: "WhatsApp communication channel is currently disabled by administrator configuration",
        retryable: false,
      };
    }

    const isTestMode =
      process.env.NOTIFICATION_TEST_MODE === "true" ||
      process.env.NODE_ENV === "test";

    // 3. In test mode / mock mode, generate controlled fixture response
    if (isTestMode) {
      try {
        const templateDef = getWhatsAppTemplate(type);
        const payload = templateDef.buildPayload(normalizedPhone, bookingData);
        return {
          success: true,
          status: "ACCEPTED",
          providerMessageId: `wamid.mock.${Date.now()}.${Math.random().toString(36).substring(2, 9)}`,
          retryable: false,
        };
      } catch (err: any) {
        return {
          success: false,
          status: "FAILED",
          errorCode: "TEMPLATE_PAYLOAD_ERROR",
          errorMessage: err?.message || "Failed to build template payload",
          retryable: false,
        };
      }
    }

    // 4. Live Meta Cloud API Execution (active when credentials and flag are configured)
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;

    if (!token || !phoneNumberId) {
      return {
        success: false,
        status: "BLOCKED",
        errorCode: "WHATSAPP_CREDENTIALS_MISSING",
        errorMessage: "Missing WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID",
        retryable: false,
      };
    }

    let payload: any;
    try {
      const templateDef = getWhatsAppTemplate(type);
      if (!templateDef.isApprovedByMeta) {
        return {
          success: false,
          status: "BLOCKED",
          errorCode: "WHATSAPP_TEMPLATE_UNAPPROVED",
          errorMessage: `Template ${templateDef.templateName} has not been approved by Meta`,
          retryable: false,
        };
      }
      payload = templateDef.buildPayload(normalizedPhone, bookingData, {
        documentUrl: (input as any).documentUrl,
        documentFilename: (input as any).documentFilename,
      });
    } catch (buildError: any) {
      return {
        success: false,
        status: "FAILED",
        errorCode: "TEMPLATE_BUILD_ERROR",
        errorMessage: buildError?.message || "Error constructing template payload",
        retryable: false,
      };
    }

    const endpoint = `https://graph.facebook.com/${this.apiVersion}/${phoneNumberId}/messages`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timer);
      const data = await response.json();

      if (response.ok && data?.messages?.[0]?.id) {
        return {
          success: true,
          status: "ACCEPTED",
          providerMessageId: data.messages[0].id,
          retryable: false,
        };
      }

      // Classify Meta Error Code
      const metaError = data?.error || {};
      const errorCode = metaError.code;
      const subcode = metaError.error_subcode;
      const message = metaError.message || "Meta Cloud API rejected request";

      // Rate limit errors (130429, 131056)
      if (errorCode === 130429 || errorCode === 131056 || errorCode === 80007) {
        return {
          success: false,
          status: "FAILED",
          errorCode: "META_RATE_LIMIT",
          errorMessage: message,
          retryable: true,
          retryAfterMs: 60_000,
        };
      }

      // Authentication errors (190, 401)
      if (errorCode === 190 || response.status === 401) {
        return {
          success: false,
          status: "BLOCKED",
          errorCode: "META_AUTH_INVALID",
          errorMessage: "WhatsApp access token expired or invalid",
          retryable: false,
        };
      }

      // Template errors (132000, 132001)
      if (errorCode === 132000 || errorCode === 132001) {
        return {
          success: false,
          status: "BLOCKED",
          errorCode: "META_TEMPLATE_MISMATCH",
          errorMessage: message,
          retryable: false,
        };
      }

      // Recipient ineligible (131026, 131047, not a whatsapp user)
      if (errorCode === 131026 || errorCode === 131047) {
        return {
          success: false,
          status: "BLOCKED",
          errorCode: "META_RECIPIENT_INELIGIBLE",
          errorMessage: message,
          retryable: false,
        };
      }

      // Server error (5xx)
      if (response.status >= 500) {
        return {
          success: false,
          status: "FAILED",
          errorCode: "META_SERVER_ERROR",
          errorMessage: message,
          retryable: true,
        };
      }

      return {
        success: false,
        status: "FAILED",
        errorCode: `META_ERROR_${errorCode || "UNKNOWN"}`,
        errorMessage: message,
        retryable: false,
      };
    } catch (netErr: any) {
      clearTimeout(timer);
      const isTimeout = netErr?.name === "AbortError";
      return {
        success: false,
        status: "FAILED",
        errorCode: isTimeout ? "META_REQUEST_TIMEOUT" : "META_NETWORK_ERROR",
        errorMessage: isTimeout ? "Request to Meta Cloud API timed out" : netErr?.message || "Network error",
        retryable: true,
      };
    }
  }
}
