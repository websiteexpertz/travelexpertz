/**
 * WhatsApp Template Registry & Cloud API Payload Builders
 * Maps all 9 canonical notification events to Meta WhatsApp Business Cloud API template structures.
 */

import { NotificationType } from "../../../models/notification";
import { BookingCommunicationData } from "../data-builder";

export interface WhatsAppTemplateParameter {
  type: "text" | "currency" | "date_time" | "document" | "image";
  text?: string;
  document?: {
    link: string;
    filename?: string;
  };
  currency?: {
    fallback_value: string;
    code: string;
    amount_1000: number;
  };
  date_time?: {
    fallback_value: string;
  };
}

export interface WhatsAppTemplateComponent {
  type: "header" | "body" | "button";
  sub_type?: "quick_reply" | "url";
  index?: number;
  parameters: WhatsAppTemplateParameter[];
}

export interface WhatsAppCloudApiMessagePayload {
  messaging_product: "whatsapp";
  recipient_type: "individual";
  to: string;
  type: "template";
  template: {
    name: string;
    language: {
      code: string;
    };
    components: WhatsAppTemplateComponent[];
  };
}

export interface WhatsAppTemplateDefinition {
  type: NotificationType;
  templateName: string;
  language: string;
  category: "UTILITY";
  isApprovedByMeta: boolean;
  requiredParameters: string[];
  headerType?: "TEXT" | "DOCUMENT";
  buildPayload(
    recipientPhone: string,
    data: BookingCommunicationData,
    options?: { documentUrl?: string; documentFilename?: string }
  ): WhatsAppCloudApiMessagePayload;
}

export const WHATSAPP_TEMPLATE_REGISTRY: Record<NotificationType, WhatsAppTemplateDefinition> = {
  BOOKING_CONFIRMATION: {
    type: "BOOKING_CONFIRMATION",
    templateName: "booking_confirmation",
    language: "en",
    category: "UTILITY",
    isApprovedByMeta: false, // Set to true after Meta template review in dashboard
    requiredParameters: ["customerName", "propertyName", "bookingReference", "checkinDate", "checkoutDate", "totalAmount"],
    headerType: "TEXT",
    buildPayload(recipientPhone, data, options) {
      const components: WhatsAppTemplateComponent[] = [];

      // Optional document header if voucher PDF provided in future phase
      if (options?.documentUrl) {
        components.push({
          type: "header",
          parameters: [
            {
              type: "document",
              document: {
                link: options.documentUrl,
                filename: options.documentFilename || `YatraExpertz_Booking_${data.bookingReference}.pdf`,
              },
            },
          ],
        });
      }

      // Body parameters
      components.push({
        type: "body",
        parameters: [
          { type: "text", text: data.customerName },
          { type: "text", text: data.propertyName },
          { type: "text", text: data.bookingReference },
          { type: "text", text: data.checkinDate },
          { type: "text", text: data.checkoutDate },
          { type: "text", text: `₹${data.totalAmount.toLocaleString("en-IN")}` },
        ],
      });

      // View Booking button link parameter (url button index 0)
      components.push({
        type: "button",
        sub_type: "url",
        index: 0,
        parameters: [
          {
            type: "text",
            text: `booking/confirm?bookingId=${data.bookingId}`,
          },
        ],
      });

      return {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "template",
        template: {
          name: "booking_confirmation",
          language: { code: "en" },
          components,
        },
      };
    },
  },

  REMINDER_7_DAYS: {
    type: "REMINDER_7_DAYS",
    templateName: "booking_reminder_7d",
    language: "en",
    category: "UTILITY",
    isApprovedByMeta: false,
    requiredParameters: ["customerName", "propertyName", "checkinDate", "propertyAddress"],
    headerType: "TEXT",
    buildPayload(recipientPhone, data) {
      return {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "template",
        template: {
          name: "booking_reminder_7d",
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: data.customerName },
                { type: "text", text: data.propertyName },
                { type: "text", text: data.checkinDate },
                { type: "text", text: data.propertyAddress },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [{ type: "text", text: `booking/confirm?bookingId=${data.bookingId}` }],
            },
          ],
        },
      };
    },
  },

  REMINDER_48_HOURS: {
    type: "REMINDER_48_HOURS",
    templateName: "booking_reminder_48h",
    language: "en",
    category: "UTILITY",
    isApprovedByMeta: false,
    requiredParameters: ["customerName", "propertyName", "checkinDate", "propertyAddress"],
    headerType: "TEXT",
    buildPayload(recipientPhone, data) {
      return {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "template",
        template: {
          name: "booking_reminder_48h",
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: data.customerName },
                { type: "text", text: data.propertyName },
                { type: "text", text: data.checkinDate },
                { type: "text", text: data.propertyAddress },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [{ type: "text", text: `booking/confirm?bookingId=${data.bookingId}` }],
            },
          ],
        },
      };
    },
  },

  REMINDER_24_HOURS: {
    type: "REMINDER_24_HOURS",
    templateName: "booking_reminder_24h",
    language: "en",
    category: "UTILITY",
    isApprovedByMeta: false,
    requiredParameters: ["customerName", "propertyName", "checkinDate", "propertyAddress"],
    headerType: "TEXT",
    buildPayload(recipientPhone, data) {
      return {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "template",
        template: {
          name: "booking_reminder_24h",
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: data.customerName },
                { type: "text", text: data.propertyName },
                { type: "text", text: data.checkinDate },
                { type: "text", text: data.propertyAddress },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [{ type: "text", text: `booking/confirm?bookingId=${data.bookingId}` }],
            },
          ],
        },
      };
    },
  },

  REMINDER_12_HOURS: {
    type: "REMINDER_12_HOURS",
    templateName: "booking_reminder_12h",
    language: "en",
    category: "UTILITY",
    isApprovedByMeta: false,
    requiredParameters: ["customerName", "propertyName", "checkinDate", "propertyAddress"],
    headerType: "TEXT",
    buildPayload(recipientPhone, data) {
      return {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "template",
        template: {
          name: "booking_reminder_12h",
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: data.customerName },
                { type: "text", text: data.propertyName },
                { type: "text", text: data.checkinDate },
                { type: "text", text: data.propertyAddress },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [{ type: "text", text: `booking/confirm?bookingId=${data.bookingId}` }],
            },
          ],
        },
      };
    },
  },

  REMINDER_4_HOURS: {
    type: "REMINDER_4_HOURS",
    templateName: "booking_reminder_4h",
    language: "en",
    category: "UTILITY",
    isApprovedByMeta: false,
    requiredParameters: ["customerName", "propertyName", "propertyAddress", "bookingReference"],
    headerType: "TEXT",
    buildPayload(recipientPhone, data) {
      return {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "template",
        template: {
          name: "booking_reminder_4h",
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: data.customerName },
                { type: "text", text: data.propertyName },
                { type: "text", text: data.propertyAddress },
                { type: "text", text: data.bookingReference },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [{ type: "text", text: `booking/confirm?bookingId=${data.bookingId}` }],
            },
          ],
        },
      };
    },
  },

  REMINDER_2_HOURS: {
    type: "REMINDER_2_HOURS",
    templateName: "booking_reminder_2h",
    language: "en",
    category: "UTILITY",
    isApprovedByMeta: false,
    requiredParameters: ["customerName", "propertyName", "propertyAddress", "bookingReference"],
    headerType: "TEXT",
    buildPayload(recipientPhone, data) {
      return {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "template",
        template: {
          name: "booking_reminder_2h",
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: data.customerName },
                { type: "text", text: data.propertyName },
                { type: "text", text: data.propertyAddress },
                { type: "text", text: data.bookingReference },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [{ type: "text", text: `booking/confirm?bookingId=${data.bookingId}` }],
            },
          ],
        },
      };
    },
  },

  BOOKING_RESCHEDULED: {
    type: "BOOKING_RESCHEDULED",
    templateName: "booking_rescheduled",
    language: "en",
    category: "UTILITY",
    isApprovedByMeta: false,
    requiredParameters: ["customerName", "propertyName", "bookingReference", "checkinDate", "checkoutDate"],
    headerType: "TEXT",
    buildPayload(recipientPhone, data) {
      return {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "template",
        template: {
          name: "booking_rescheduled",
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: data.customerName },
                { type: "text", text: data.propertyName },
                { type: "text", text: data.bookingReference },
                { type: "text", text: data.checkinDate },
                { type: "text", text: data.checkoutDate },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [{ type: "text", text: `booking/confirm?bookingId=${data.bookingId}` }],
            },
          ],
        },
      };
    },
  },

  BOOKING_CANCELLED: {
    type: "BOOKING_CANCELLED",
    templateName: "booking_cancelled",
    language: "en",
    category: "UTILITY",
    isApprovedByMeta: false,
    requiredParameters: ["customerName", "propertyName", "bookingReference", "paidAmount"],
    headerType: "TEXT",
    buildPayload(recipientPhone, data) {
      return {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "template",
        template: {
          name: "booking_cancelled",
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: data.customerName },
                { type: "text", text: data.propertyName },
                { type: "text", text: data.bookingReference },
                { type: "text", text: `₹${data.paidAmount.toLocaleString("en-IN")}` },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [{ type: "text", text: `booking/confirm?bookingId=${data.bookingId}` }],
            },
          ],
        },
      };
    },
  },

  CHECKOUT_THANK_YOU: {
    type: "CHECKOUT_THANK_YOU",
    templateName: "checkout_thank_you",
    language: "en",
    category: "UTILITY",
    isApprovedByMeta: false,
    requiredParameters: ["customerName", "propertyName", "bookingReference"],
    headerType: "TEXT",
    buildPayload(recipientPhone, data) {
      return {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "template",
        template: {
          name: "checkout_thank_you",
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: data.customerName },
                { type: "text", text: data.propertyName },
                { type: "text", text: data.bookingReference },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [{ type: "text", text: `booking/confirm?bookingId=${data.bookingId}` }],
            },
          ],
        },
      };
    },
  },

  FINAL_INVOICE: {
    type: "FINAL_INVOICE",
    templateName: "final_invoice",
    language: "en",
    category: "UTILITY",
    isApprovedByMeta: false,
    requiredParameters: ["customerName", "propertyName", "bookingReference", "totalAmount"],
    headerType: "DOCUMENT",
    buildPayload(recipientPhone, data, options) {
      const components: WhatsAppTemplateComponent[] = [];

      if (options?.documentUrl) {
        components.push({
          type: "header",
          parameters: [
            {
              type: "document",
              document: {
                link: options.documentUrl,
                filename: options.documentFilename || `Invoice_${data.bookingReference}.pdf`,
              },
            },
          ],
        });
      }

      components.push({
        type: "body",
        parameters: [
          { type: "text", text: data.customerName },
          { type: "text", text: data.propertyName },
          { type: "text", text: data.bookingReference },
          { type: "text", text: `₹${data.totalAmount.toLocaleString("en-IN")}` },
        ],
      });

      components.push({
        type: "button",
        sub_type: "url",
        index: 0,
        parameters: [{ type: "text", text: `booking/confirm?bookingId=${data.bookingId}` }],
      });

      return {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "template",
        template: {
          name: "final_invoice",
          language: { code: "en" },
          components,
        },
      };
    },
  },

  REVIEW_REQUEST: {
    type: "REVIEW_REQUEST",
    templateName: "property_review_request",
    language: "en",
    category: "UTILITY",
    isApprovedByMeta: false,
    requiredParameters: ["customerName", "propertyName"],
    headerType: "TEXT",
    buildPayload(recipientPhone, data) {
      return {
        messaging_product: "whatsapp",
        recipient_type: "individual",
        to: recipientPhone,
        type: "template",
        template: {
          name: "property_review_request",
          language: { code: "en" },
          components: [
            {
              type: "body",
              parameters: [
                { type: "text", text: data.customerName },
                { type: "text", text: data.propertyName },
              ],
            },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [{ type: "text", text: `review?bookingId=${data.bookingId}` }],
            },
          ],
        },
      };
    },
  },
};

/**
 * Returns template definition or throws if unrecognized.
 */
export function getWhatsAppTemplate(type: NotificationType): WhatsAppTemplateDefinition {
  const tpl = WHATSAPP_TEMPLATE_REGISTRY[type];
  if (!tpl) {
    throw new Error(`WhatsApp template not registered for event: ${type}`);
  }
  return tpl;
}
