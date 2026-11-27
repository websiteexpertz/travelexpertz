/**
 * Notification Database Index Initialization
 * Collection: booking_notifications
 */

import { Db } from "mongodb";
import { getDb } from "../db";

export async function ensureNotificationIndexes(database?: Db): Promise<void> {
  const db = database || (await getDb());
  const collection = db.collection("booking_notifications");

  // 1. Unique idempotency key (prevent duplicate jobs)
  await collection.createIndex(
    { idempotencyKey: 1 },
    { unique: true, name: "idx_notifications_idempotency_unique" }
  );

  // 2. Worker polling & lease claiming index (efficient retrieval of due jobs)
  await collection.createIndex(
    { status: 1, scheduledAt: 1, nextAttemptAt: 1, leaseExpiresAt: 1 },
    { name: "idx_notifications_polling_lease" }
  );

  await collection.createIndex(
    { status: 1, leaseExpiresAt: 1 },
    { name: "idx_notifications_status_lease_recovery" }
  );

  // 3. Booking communication history & cancellation/rescheduling index
  await collection.createIndex(
    { bookingId: 1, bookingVersion: 1, type: 1, channel: 1 },
    { name: "idx_notifications_booking_lifecycle" }
  );

  // 4. Provider message ID lookup (webhook delivery receipts & reconciliation)
  await collection.createIndex(
    { providerMessageId: 1 },
    {
      sparse: true,
      name: "idx_notifications_provider_msg_id",
    }
  );

  // 5. Recipient communication log & audit lookup
  await collection.createIndex(
    { recipient: 1, createdAt: -1 },
    { name: "idx_notifications_recipient_audit" }
  );
}
