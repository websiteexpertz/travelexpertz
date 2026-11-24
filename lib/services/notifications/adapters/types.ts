/**
 * Notification Adapter Interfaces & Types
 */

import { BookingCommunicationData } from "../data-builder";
import { NotificationType, NotificationChannel } from "../../../models/notification";

export interface SendNotificationInput {
  notificationId: string;
  bookingId: string;
  recipient: string;
  type: NotificationType;
  channel: NotificationChannel;
  bookingData: BookingCommunicationData;
  attempt: number;
}

export interface SendNotificationResult {
  success: boolean;
  status: "ACCEPTED" | "DELIVERED" | "FAILED" | "DELIVERY_UNKNOWN" | "BLOCKED";
  providerMessageId?: string;
  errorCode?: string;
  errorMessage?: string;
  retryable: boolean;
  retryAfterMs?: number;
}

export interface NotificationAdapter {
  channel: NotificationChannel;
  send(input: SendNotificationInput): Promise<SendNotificationResult>;
}
