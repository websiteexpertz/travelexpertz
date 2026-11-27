/**
 * Official Meta WhatsApp Business Cloud API Webhook Handler
 * Route: /api/webhooks/whatsapp
 * Production URL: https://www.yatraexpertz.com/api/webhooks/whatsapp
 */

import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { BookingNotification } from "@/lib/models/notification";
import { verifyMetaSignature } from "@/lib/services/notifications/adapters/whatsapp";

export const dynamic = "force-dynamic";
export const revalidate = 0;

/**
 * GET: Meta Webhook Subscription Challenge
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  const verifyToken = process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN;

  if (mode === "subscribe" && token && challenge) {
    if (token === verifyToken) {
      console.log("[WhatsAppWebhook] Meta verification challenge accepted");
      return new NextResponse(challenge, {
        status: 200,
        headers: { "Content-Type": "text/plain" },
      });
    } else {
      console.warn("[WhatsAppWebhook] Rejected challenge with invalid verify_token");
      return new NextResponse("Forbidden: Invalid verification token", { status: 403 });
    }
  }

  return new NextResponse("Bad Request", { status: 400 });
}

/**
 * POST: Meta Message Status Updates & Inbound Notifications
 */
export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    const signatureHeader = request.headers.get("x-hub-signature-256");
    const appSecret = process.env.WHATSAPP_APP_SECRET;

    // In production or when app secret is set, verify cryptographic signature
    if (appSecret) {
      const isValid = verifyMetaSignature(rawBody, signatureHeader, appSecret);
      if (!isValid) {
        console.warn("[WhatsAppWebhook] Unauthorized: Invalid X-Hub-Signature-256");
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
      }
    } else if (process.env.NODE_ENV === "production") {
      console.warn("[WhatsAppWebhook] Refusing request: WHATSAPP_APP_SECRET is not configured");
      return NextResponse.json({ error: "Webhook not configured" }, { status: 503 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
    }

    // Process entry changes
    let processedStatusesCount = 0;
    const entries = Array.isArray(payload.entry) ? payload.entry : [];

    for (const entry of entries) {
      const changes = Array.isArray(entry.changes) ? entry.changes : [];
      for (const change of changes) {
        const value = change.value;
        if (!value) continue;

        const statuses = Array.isArray(value.statuses) ? value.statuses : [];
        for (const statusObj of statuses) {
          const providerMessageId = statusObj.id;
          const status = statusObj.status; // "sent" | "delivered" | "read" | "failed"
          const timestamp = statusObj.timestamp
            ? new Date(Number(statusObj.timestamp) * 1000)
            : new Date();

          if (!providerMessageId || !status) continue;

          try {
            const db = await getDb();
            const collection = db.collection<BookingNotification>("booking_notifications");

            const existingNotification = await collection.findOne({ providerMessageId });
            if (!existingNotification) {
              continue; // Unknown or untracked message ID
            }

            // Status updates with out-of-order & idempotency protection
            if (status === "delivered") {
              // Mark DELIVERED and set deliveredAt
              await collection.updateOne(
                { _id: existingNotification._id },
                {
                  $set: {
                    status: "DELIVERED",
                    deliveredAt: timestamp,
                    updatedAt: new Date(),
                  },
                }
              );
              processedStatusesCount++;
            } else if (status === "read") {
              // Record read receipt without downgrading DELIVERED status
              await collection.updateOne(
                { _id: existingNotification._id },
                {
                  $set: {
                    status: "DELIVERED",
                    deliveredAt: existingNotification.deliveredAt || timestamp,
                    "metadata.readAt": timestamp,
                    updatedAt: new Date(),
                  },
                }
              );
              processedStatusesCount++;
            } else if (status === "sent") {
              // Only update to ACCEPTED if not already DELIVERED
              if (existingNotification.status !== "DELIVERED") {
                await collection.updateOne(
                  { _id: existingNotification._id },
                  {
                    $set: {
                      status: "ACCEPTED",
                      acceptedAt: timestamp,
                      updatedAt: new Date(),
                    },
                  }
                );
              }
              processedStatusesCount++;
            } else if (status === "failed") {
              const errorInfo = statusObj.errors?.[0] || {};
              await collection.updateOne(
                { _id: existingNotification._id },
                {
                  $set: {
                    status: "FAILED",
                    lastErrorCode: `META_${errorInfo.code || "UNKNOWN"}`,
                    lastErrorMessage: errorInfo.title || errorInfo.message || "Meta reported delivery failure",
                    updatedAt: new Date(),
                  },
                }
              );
              processedStatusesCount++;
            }
          } catch (dbErr) {
            console.error("[WhatsAppWebhook] Failed updating notification status in DB:", dbErr);
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      processed: processedStatusesCount,
    });
  } catch (error: any) {
    console.error("[WhatsAppWebhook] Internal error processing webhook:", error);
    return NextResponse.json({ error: "Internal webhook processing error" }, { status: 500 });
  }
}
