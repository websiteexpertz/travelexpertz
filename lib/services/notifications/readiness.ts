/**
 * WhatsApp Channel Activation Readiness & Safety Protections
 * Evaluates operational readiness and enforces safe activation policies.
 */

import { Db } from "mongodb";
import { getDb } from "../../db";
import { isWhatsAppEnabled, hasWhatsAppCredentials } from "./config";
import { WHATSAPP_TEMPLATE_REGISTRY } from "./adapters/whatsapp-templates";

export interface WhatsAppReadinessReport {
  readyForLive: boolean;
  checks: {
    featureFlagEnabled: boolean;
    credentialsConfigured: boolean;
    phoneNumberIdConfigured: boolean;
    businessAccountIdConfigured: boolean;
    apiVersionConfigured: boolean;
    webhookVerifyTokenConfigured: boolean;
    appSecretConfigured: boolean;
    templatesApprovedCount: number;
    totalTemplatesCount: number;
  };
  reasons: string[];
}

/**
 * Evaluates whether WhatsApp Cloud API is fully prepared and approved for live operation.
 */
export function checkWhatsAppReadiness(): WhatsAppReadinessReport {
  const reasons: string[] = [];
  const apiVersion = process.env.WHATSAPP_API_VERSION || "v21.0";
  const hasToken = Boolean(process.env.WHATSAPP_ACCESS_TOKEN);
  const hasPhoneId = Boolean(process.env.WHATSAPP_PHONE_NUMBER_ID);
  const hasWabaId = Boolean(process.env.WHATSAPP_BUSINESS_ACCOUNT_ID);
  const hasVerifyToken = Boolean(process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN);
  const hasAppSecret = Boolean(process.env.WHATSAPP_APP_SECRET);
  const isEnabled = isWhatsAppEnabled();

  const templateValues = Object.values(WHATSAPP_TEMPLATE_REGISTRY);
  const approvedTemplatesCount = templateValues.filter((t) => t.isApprovedByMeta).length;

  if (!isEnabled) {
    reasons.push("BOOKING_WHATSAPP_ENABLED feature flag is currently false.");
  }
  if (!hasToken) {
    reasons.push("WHATSAPP_ACCESS_TOKEN environment variable is missing.");
  }
  if (!hasPhoneId) {
    reasons.push("WHATSAPP_PHONE_NUMBER_ID environment variable is missing.");
  }
  if (!hasWabaId) {
    reasons.push("WHATSAPP_BUSINESS_ACCOUNT_ID environment variable is missing.");
  }
  if (!hasVerifyToken) {
    reasons.push("WHATSAPP_WEBHOOK_VERIFY_TOKEN environment variable is missing.");
  }
  if (!hasAppSecret) {
    reasons.push("WHATSAPP_APP_SECRET environment variable is missing.");
  }
  if (approvedTemplatesCount < templateValues.length) {
    reasons.push(
      `${templateValues.length - approvedTemplatesCount} WhatsApp templates require Meta approval before live activation.`
    );
  }

  const readyForLive =
    isEnabled &&
    hasToken &&
    hasPhoneId &&
    hasWabaId &&
    hasVerifyToken &&
    hasAppSecret &&
    approvedTemplatesCount === templateValues.length;

  return {
    readyForLive,
    checks: {
      featureFlagEnabled: isEnabled,
      credentialsConfigured: hasWhatsAppCredentials(),
      phoneNumberIdConfigured: hasPhoneId,
      businessAccountIdConfigured: hasWabaId,
      apiVersionConfigured: Boolean(apiVersion),
      webhookVerifyTokenConfigured: hasVerifyToken,
      appSecretConfigured: hasAppSecret,
      templatesApprovedCount: approvedTemplatesCount,
      totalTemplatesCount: templateValues.length,
    },
    reasons,
  };
}

/**
 * Historical Notification Protection Policy
 * When WhatsApp is enabled in the future, this reconciliation ensures that
 * historical notifications created while WhatsApp was disabled are NEVER
 * automatically flooded or sent out.
 */
export async function reconcileHistoricalNotificationsOnActivation(
  activationDate: Date = new Date(),
  database?: Db
): Promise<{
  inspectedCount: number;
  markedSkippedCount: number;
  eligibleFutureCount: number;
}> {
  const db = database || (await getDb());
  const collection = db.collection("booking_notifications");

  // Find all blocked, skipped, or pending WhatsApp notifications scheduled before activationDate
  const historicalJobs = await collection
    .find({
      channel: "WHATSAPP",
      scheduledAt: { $lt: activationDate },
      status: { $in: ["PENDING", "BLOCKED", "SKIPPED", "RETRY_SCHEDULED"] },
    })
    .toArray();

  let markedSkippedCount = 0;

  for (const job of historicalJobs) {
    // Policy rules:
    // 1. Historical booking confirmations: Permanently mark as SKIPPED (reason: HISTORICAL_PRE_ACTIVATION)
    // 2. Past reminders: Permanently mark as SKIPPED (reason: REMINDER_SCHEDULE_EXPIRED)
    // 3. Checkout/invoice: Permanently mark as SKIPPED unless manually re-authorized
    await collection.updateOne(
      { _id: job._id },
      {
        $set: {
          status: "SKIPPED",
          lastErrorCode: "HISTORICAL_PRE_ACTIVATION_SKIPPED",
          lastErrorMessage: "Historical notification automatically skipped by WhatsApp activation safety policy",
          updatedAt: new Date(),
        },
      }
    );
    markedSkippedCount++;
  }

  // Count eligible future jobs (whose scheduledAt is after activation date)
  const eligibleFutureCount = await collection.countDocuments({
    channel: "WHATSAPP",
    scheduledAt: { $gte: activationDate },
    status: "PENDING",
  });

  return {
    inspectedCount: historicalJobs.length,
    markedSkippedCount,
    eligibleFutureCount,
  };
}
