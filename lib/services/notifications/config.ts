/**
 * Centralized Notification Channel Configuration
 * Controls independent feature flags and operational modes for Email and WhatsApp.
 */

export interface NotificationChannelConfig {
  email: {
    enabled: boolean;
    provider: "SMTP_GMAIL";
    testMode: boolean;
  };
  whatsapp: {
    enabled: boolean;
    provider: "META_CLOUD_API";
    apiVersion: string;
    isConfigured: boolean;
    testMode: boolean;
  };
  environment: "development" | "production" | "test";
}

/**
 * Returns whether Email communication is enabled.
 * Defaults to false unless BOOKING_EMAIL_ENABLED=true or in safe test mode.
 */
export function isEmailEnabled(): boolean {
  if (process.env.NOTIFICATION_TEST_MODE === "true" || process.env.NODE_ENV === "test") {
    return process.env.BOOKING_EMAIL_ENABLED !== "false";
  }
  return process.env.BOOKING_EMAIL_ENABLED === "true";
}

/**
 * Returns whether WhatsApp communication is enabled.
 * Defaults to false. Missing credentials safely leave it disabled.
 */
export function isWhatsAppEnabled(): boolean {
  if (process.env.NOTIFICATION_TEST_MODE === "true" || process.env.NODE_ENV === "test") {
    return process.env.BOOKING_WHATSAPP_ENABLED === "true";
  }
  return (
    process.env.BOOKING_WHATSAPP_ENABLED === "true" &&
    hasWhatsAppCredentials()
  );
}

/**
 * Checks if basic WhatsApp Cloud API credentials are provided.
 */
export function hasWhatsAppCredentials(): boolean {
  return Boolean(
    process.env.WHATSAPP_ACCESS_TOKEN &&
    process.env.WHATSAPP_PHONE_NUMBER_ID &&
    process.env.WHATSAPP_BUSINESS_ACCOUNT_ID
  );
}

/**
 * Returns safe public status of notification channels without leaking secrets.
 */
export function getNotificationChannelStatus(): NotificationChannelConfig {
  const isTest =
    process.env.NOTIFICATION_TEST_MODE === "true" ||
    process.env.NODE_ENV === "test";

  return {
    email: {
      enabled: isEmailEnabled(),
      provider: "SMTP_GMAIL",
      testMode: isTest,
    },
    whatsapp: {
      enabled: isWhatsAppEnabled(),
      provider: "META_CLOUD_API",
      apiVersion: process.env.WHATSAPP_API_VERSION || "v21.0",
      isConfigured: hasWhatsAppCredentials(),
      testMode: isTest,
    },
    environment: (process.env.NODE_ENV as any) || "development",
  };
}
