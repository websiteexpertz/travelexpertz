/**
 * WhatsApp Notification Adapter
 * Target: Official Meta WhatsApp Business Cloud API
 * Configurable API version (defaults to active v21.0)
 */

import { NotificationAdapter, SendNotificationInput, SendNotificationResult } from "./types";

export class WhatsAppNotificationAdapter implements NotificationAdapter {
  channel: "WHATSAPP" = "WHATSAPP";

  private apiVersion: string;

  constructor() {
    this.apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";
  }

  async send(input: SendNotificationInput): Promise<SendNotificationResult> {
    const { recipient, type } = input;

    // 1. Sanitize & validate phone number (E.164 or 10-digit Indian mobile)
    let sanitizedPhone = recipient.replace(/[^\d+]/g, "");
    if (sanitizedPhone.startsWith("+")) {
      sanitizedPhone = sanitizedPhone.slice(1);
    }
    if (sanitizedPhone.length === 10) {
      sanitizedPhone = `91${sanitizedPhone}`;
    }

    if (!sanitizedPhone || sanitizedPhone.length < 10 || sanitizedPhone.length > 15) {
      return {
        success: false,
        status: "BLOCKED",
        errorCode: "INVALID_PHONE_NUMBER",
        errorMessage: `Phone number is invalid or missing country code: ${recipient}`,
        retryable: false,
      };
    }

    // 2. Safe testing mode / Phase 2 Mock
    // Phase 2 strictly mandates mock implementation to avoid accidental live message delivery.
    const isProductionLive =
      process.env.WHATSAPP_LIVE_ENABLED === "true" &&
      process.env.NODE_ENV === "production";

    if (!isProductionLive) {
      console.log(
        `[WhatsAppAdapter:MOCK_MODE] Simulated WhatsApp Cloud API (${this.apiVersion}) send to +${sanitizedPhone} for ${type}`
      );
      return {
        success: true,
        status: "ACCEPTED",
        providerMessageId: `wamid.mock.${Date.now()}.${Math.random().toString(36).substring(2, 10)}`,
        retryable: false,
      };
    }

    // Live Meta Cloud API logic (reserved for approved Phase 5 rollout)
    return {
      success: false,
      status: "BLOCKED",
      errorCode: "WHATSAPP_LIVE_NOT_CONFIGURED",
      errorMessage: "Live WhatsApp Cloud API credentials are not yet activated",
      retryable: false,
    };
  }
}
