/**
 * Yatra Expertz Branded Email Template Engine
 * Creates email-client compatible HTML with inline CSS and plain-text alternatives.
 * Foundations for all 9 notification events.
 */

import { NotificationType } from "../../models/notification";
import { BookingCommunicationData } from "./data-builder";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

/**
 * Shared Base Layout for Yatra Expertz Branded Emails
 */
function renderBaseLayout(options: {
  title: string;
  headerBadge?: string;
  bodyContent: string;
  actionButtonText?: string;
  actionButtonUrl?: string;
}): string {
  const portalUrl = "https://www.yatraexpertz.com";
  const actionButton =
    options.actionButtonText && options.actionButtonUrl
      ? `
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px 0 10px;">
          <tr>
            <td align="center">
              <a href="${options.actionButtonUrl}" target="_blank" style="display: inline-block; background-color: #0b6dff; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: bold; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(11, 109, 255, 0.25);">
                ${options.actionButtonText} &rarr;
              </a>
            </td>
          </tr>
        </table>
      `
      : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td {font-family: Arial, Helvetica, sans-serif !important;}
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; -webkit-font-smoothing: antialiased;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 15px;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(15, 23, 42, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #0b6dff 0%, #0052cc 100%); padding: 28px 32px; text-align: left;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                  <td>
                    <span style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: -0.5px;">🌍 YatraExpertz</span>
                    <span style="display: block; font-size: 13px; color: #bfdbfe; margin-top: 4px; font-weight: 500;">Safar Aapka, Planning Hamari</span>
                  </td>
                  ${
                    options.headerBadge
                      ? `<td align="right" valign="middle">
                          <span style="background: rgba(255,255,255,0.2); color: #ffffff; padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border: 1px solid rgba(255,255,255,0.3);">${options.headerBadge}</span>
                        </td>`
                      : ""
                  }
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body Content -->
          <tr>
            <td style="padding: 32px 32px 24px;">
              ${options.bodyContent}
              ${actionButton}
            </td>
          </tr>

          <!-- Help / Support Notice -->
          <tr>
            <td style="padding: 0 32px 24px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; padding: 16px 20px;">
                <tr>
                  <td>
                    <p style="margin: 0; font-size: 13px; color: #475467; line-height: 1.5;">
                      <strong>Need assistance?</strong> Contact our dedicated concierge team at <a href="mailto:support@yatraexpertz.com" style="color: #0b6dff; text-decoration: none; font-weight: 600;">support@yatraexpertz.com</a>.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px 32px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 8px; font-weight: 600; color: #e2e8f0;">Yatra Expertz Travel &amp; Hospitality Technologies</p>
              <p style="margin: 0 0 12px;">Uttarakhand, India &bull; <a href="${portalUrl}" style="color: #38bdf8; text-decoration: none;">www.yatraexpertz.com</a></p>
              <p style="margin: 0; font-size: 11px; color: #64748b;">
                This is a transactional booking service notification. Please do not reply directly to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * 1. Booking Confirmation Email
 */
export function renderBookingConfirmationEmail(data: BookingCommunicationData): RenderedEmail {
  const subject = `Booking Confirmed: ${data.propertyName} [${data.bookingReference}] - Yatra Expertz`;
  const viewBookingUrl = `${data.portalUrl}/booking/confirm?bookingId=${data.bookingId}`;

  const bodyContent = `
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #0f172a;">Your Booking is Confirmed! 🎉</h1>
    <p style="margin: 0 0 20px; font-size: 15px; color: #475467; line-height: 1.5;">
      Dear <strong>${data.customerName}</strong>, thank you for booking with Yatra Expertz. We have confirmed your stay at <strong>${data.propertyName}</strong>.
    </p>

    <!-- Key Booking Details Card -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 24px; border-collapse: separate;">
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;" width="50%">
          <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; display: block;">Booking Reference</span>
          <span style="font-size: 15px; font-weight: 800; color: #0b6dff;">${data.bookingReference}</span>
        </td>
        <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;" width="50%">
          <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; display: block;">Booking Status</span>
          <span style="font-size: 13px; font-weight: 700; color: #166534; background: #dcfce7; padding: 2px 8px; border-radius: 12px; display: inline-block;">CONFIRMED</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;" colspan="2">
          <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; display: block;">Property &amp; Location</span>
          <strong style="font-size: 15px; color: #0f172a;">${data.propertyName}</strong>
          <span style="display: block; font-size: 13px; color: #475467; margin-top: 2px;">${data.propertyAddress}, ${data.propertyCity}${data.propertyState ? `, ${data.propertyState}` : ""}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;" width="50%">
          <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; display: block;">Check-in</span>
          <span style="font-size: 14px; font-weight: 700; color: #0f172a;">${data.checkinDate}</span>
          <span style="display: block; font-size: 12px; color: #64748b;">From ${data.checkinTime || "12:00 PM"}</span>
        </td>
        <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;" width="50%">
          <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; display: block;">Check-out</span>
          <span style="font-size: 14px; font-weight: 700; color: #0f172a;">${data.checkoutDate}</span>
          <span style="display: block; font-size: 12px; color: #64748b;">Until ${data.checkoutTime || "11:00 AM"}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 20px;" width="50%">
          <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; display: block;">Stay Details</span>
          <span style="font-size: 13px; color: #1e293b; font-weight: 600;">${data.nightsCount} Night${data.nightsCount > 1 ? "s" : ""} &bull; ${data.guestsCount} Guest${data.guestsCount > 1 ? "s" : ""}</span>
          <span style="display: block; font-size: 12px; color: #64748b;">${data.roomCategory}</span>
        </td>
        <td style="padding: 16px 20px;" width="50%">
          <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; display: block;">Payment Status</span>
          <span style="font-size: 13px; font-weight: 700; color: ${data.outstandingAmount === 0 ? "#166534" : "#b45309"};">
            ${data.outstandingAmount === 0 ? "PAID IN FULL" : "PARTIAL / PAY AT PROPERTY"}
          </span>
          <span style="display: block; font-size: 12px; color: #64748b;">Total: ₹${data.totalAmount.toLocaleString("en-IN")}</span>
        </td>
      </tr>
    </table>

    <!-- Financial Breakdown Table -->
    <h3 style="margin: 0 0 10px; font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Payment Summary</h3>
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 24px; font-size: 14px;">
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #475467;">Total Booking Amount</td>
        <td align="right" style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #0f172a;">₹${data.totalAmount.toLocaleString("en-IN")}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; color: #475467;">Amount Paid</td>
        <td align="right" style="padding: 8px 0; border-bottom: 1px solid #f1f5f9; font-weight: 600; color: #166534;">₹${data.paidAmount.toLocaleString("en-IN")}</td>
      </tr>
      ${
        data.outstandingAmount > 0
          ? `<tr>
              <td style="padding: 10px 0; border-bottom: 2px solid #0f172a; font-weight: 700; color: #b45309;">Outstanding at Property</td>
              <td align="right" style="padding: 10px 0; border-bottom: 2px solid #0f172a; font-weight: 800; color: #b45309; font-size: 16px;">₹${data.outstandingAmount.toLocaleString("en-IN")}</td>
            </tr>`
          : `<tr>
              <td style="padding: 10px 0; border-bottom: 2px solid #0f172a; font-weight: 700; color: #166534;">Balance Due</td>
              <td align="right" style="padding: 10px 0; border-bottom: 2px solid #0f172a; font-weight: 800; color: #166534; font-size: 16px;">₹0 (Fully Paid)</td>
            </tr>`
      }
    </table>

    <p style="margin: 0 0 10px; font-size: 13px; color: #64748b; line-height: 1.5;">
      <strong>Cancellation Policy:</strong> Free cancellation up to 48 hours prior to check-in. Cancellations made within 48 hours are subject to standard property terms.
    </p>
  `;

  const html = renderBaseLayout({
    title: subject,
    headerBadge: "CONFIRMED",
    bodyContent,
    actionButtonText: "View Complete Booking Details",
    actionButtonUrl: viewBookingUrl,
  });

  const text = `
YatraExpertz Booking Confirmation
--------------------------------
Dear ${data.customerName},

Your booking is CONFIRMED at ${data.propertyName}.

Booking Reference: ${data.bookingReference}
Property: ${data.propertyName}
Address: ${data.propertyAddress}, ${data.propertyCity}
Check-in: ${data.checkinDate} (From 12:00 PM)
Check-out: ${data.checkoutDate} (Until 11:00 AM)
Nights: ${data.nightsCount} | Guests: ${data.guestsCount}
Room: ${data.roomCategory}

Payment Summary:
Total Amount: ₹${data.totalAmount.toLocaleString("en-IN")}
Amount Paid: ₹${data.paidAmount.toLocaleString("en-IN")}
Outstanding: ₹${data.outstandingAmount.toLocaleString("en-IN")}

View your complete booking voucher online:
${viewBookingUrl}

For assistance, contact support@yatraexpertz.com.
Yatra Expertz Travel & Hospitality Technologies
  `.trim();

  return { subject, html, text };
}

/**
 * 2. 48-Hour Reminder Email
 * Subject: Your Yatra Expertz stay is just 2 days away!
 */
export function renderReminder48hEmail(data: BookingCommunicationData): RenderedEmail {
  const subject = `Your Yatra Expertz stay is just 2 days away! [${data.bookingReference}]`;
  const guestName = data.customerName || data.guestName || "Guest";
  const propertyCity = data.propertyCity || "";
  const paidStr = formatInr(data.paidAmount);
  const outstandingAmount = Number(data.outstandingAmount || 0);
  const outstandingStr = formatInr(outstandingAmount);
  const roomCategory = data.roomCategory || "Standard Room";
  const guestsCount = data.guestsCount || 1;
  const nightsCount = data.nightsCount || 1;
  const viewBookingUrl = data.bookingDetailsUrl || `${data.portalUrl || "https://www.yatraexpertz.com"}/booking/confirm?bookingId=${data.bookingId || ""}`;

  const imageBlock = data.propertyImage
    ? `<div style="margin-bottom: 20px; text-align: center;"><img src="${data.propertyImage}" alt="${data.propertyName}" style="max-width: 100%; max-height: 220px; border-radius: 8px; border: 1px solid #e2e8f0; object-fit: cover;"></div>`
    : "";

  const bodyContent = `
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #0f172a;">Your Trip is in 2 Days! 🧳</h1>
    <p style="margin: 0 0 20px; font-size: 15px; color: #475467; line-height: 1.5;">
      Dear <strong>${guestName}</strong>, we look forward to welcoming you at <strong>${data.propertyName}</strong> on <strong>${data.checkinDate}</strong>.
    </p>

    ${imageBlock}

    <!-- Stay Summary Card -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px;">
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
          <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; letter-spacing: 0.5px; display: block;">Property &amp; Location</span>
          <strong style="font-size: 15px; color: #0f172a;">${data.propertyName}</strong>
          <span style="display: block; font-size: 13px; color: #475467; margin-top: 2px;">${data.propertyAddress}${propertyCity ? `, ${propertyCity}` : ""}${data.propertyState ? `, ${data.propertyState}` : ""}</span>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 20px; border-bottom: 1px solid #e2e8f0;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td width="50%">
                <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Check-in</span>
                <span style="display: block; font-size: 14px; font-weight: 700; color: #0f172a;">${data.checkinDate}</span>
                <span style="display: block; font-size: 12px; color: #64748b;">From ${data.checkinTime || "12:00 PM"}</span>
              </td>
              <td width="50%">
                <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700;">Check-out</span>
                <span style="display: block; font-size: 14px; font-weight: 700; color: #0f172a;">${data.checkoutDate}</span>
                <span style="display: block; font-size: 12px; color: #64748b;">Until ${data.checkoutTime || "11:00 AM"}</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
      <tr>
        <td style="padding: 16px 20px;">
          <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block;">Stay Details</span>
          <span style="font-size: 13px; color: #1e293b; font-weight: 600;">${roomCategory} &bull; ${guestsCount} Guest${guestsCount > 1 ? "s" : ""} &bull; ${nightsCount} Night${nightsCount > 1 ? "s" : ""}</span>
          <span style="display: block; font-size: 13px; color: #166534; font-weight: 700; margin-top: 4px;">Total Paid: ₹${paidStr}${outstandingAmount > 0 ? ` (Balance ₹${outstandingStr} at check-in)` : ""}</span>
        </td>
      </tr>
    </table>
  `;

  const html = renderBaseLayout({
    title: subject,
    headerBadge: "48H REMINDER",
    bodyContent,
    actionButtonText: "View Stay Voucher & Directions",
    actionButtonUrl: viewBookingUrl,
  });

  const text = `
Your Yatra Expertz stay is just 2 days away!
Dear ${guestName},
Your upcoming stay at ${data.propertyName} begins in 48 hours.
Booking Reference: ${data.bookingReference}
Property: ${data.propertyName} (${data.propertyAddress}${propertyCity ? `, ${propertyCity}` : ""})
Check-in: ${data.checkinDate} (From ${data.checkinTime || "12:00 PM"})
Check-out: ${data.checkoutDate} (Until ${data.checkoutTime || "11:00 AM"})
Room: ${roomCategory} | Guests: ${guestsCount}
Payment: ₹${paidStr} paid${outstandingAmount > 0 ? ` (₹${outstandingStr} due at check-in)` : ""}

View your stay voucher online:
${viewBookingUrl}
  `.trim();

  return { subject, html, text };
}

/**
 * 3. 24-Hour Reminder Email
 * Subject: Your Yatra Expertz stay begins tomorrow!
 */
export function renderReminder24hEmail(data: BookingCommunicationData): RenderedEmail {
  const subject = `Your Yatra Expertz stay begins tomorrow! [${data.bookingReference}]`;
  const guestName = data.customerName || data.guestName || "Guest";
  const propertyCity = data.propertyCity || "";
  const outstandingAmount = Number(data.outstandingAmount || 0);
  const outstandingStr = formatInr(outstandingAmount);
  const viewBookingUrl = data.bookingDetailsUrl || `${data.portalUrl || "https://www.yatraexpertz.com"}/booking/confirm?bookingId=${data.bookingId || ""}`;
  const directionsUrl = data.directionsUrl || data.propertyDirections || "";

  const directionsLink = directionsUrl
    ? `<p style="margin: 8px 0 0;"><a href="${directionsUrl}" target="_blank" style="color: #0b6dff; font-weight: 600; text-decoration: none;">📍 Open Google Maps Directions &rarr;</a></p>`
    : "";

  const balanceNotice =
    outstandingAmount > 0
      ? `<div style="background: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
           <strong style="color: #92400e; font-size: 13px;">Outstanding Balance:</strong>
           <span style="color: #78350f; font-size: 13px;"> ₹${outstandingStr} payable upon arrival at property.</span>
         </div>`
      : `<div style="background: #f0fdf4; border-left: 4px solid #16a34a; padding: 12px 16px; margin: 16px 0; border-radius: 4px;">
           <span style="color: #166534; font-size: 13px; font-weight: 700;">✓ Fully Paid Booking (Zero Balance Due at Check-in)</span>
         </div>`;

  const bodyContent = `
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #0f172a;">Check-in Tomorrow! 🚗</h1>
    <p style="margin: 0 0 20px; font-size: 15px; color: #475467; line-height: 1.5;">
      Dear <strong>${guestName}</strong>, your stay at <strong>${data.propertyName}</strong> begins tomorrow, <strong>${data.checkinDate}</strong>.
    </p>

    <!-- Address & Check-in Card -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; padding: 16px 20px;">
      <tr>
        <td>
          <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block;">Property Address &amp; Contact</span>
          <strong style="font-size: 15px; color: #0f172a;">${data.propertyName}</strong>
          <p style="margin: 4px 0; font-size: 14px; color: #475467;">${data.propertyAddress}${propertyCity ? `, ${propertyCity}` : ""}${data.propertyState ? `, ${data.propertyState}` : ""}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #1e293b;"><strong>Contact Desk:</strong> ${data.propertyPhone || "+91 98765 43210"}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #1e293b;"><strong>Scheduled Check-in:</strong> Tomorrow, ${data.checkinDate} from ${data.checkinTime || "12:00 PM"}</p>
          ${directionsLink}
        </td>
      </tr>
    </table>

    ${balanceNotice}

    <div style="background-color: #f1f5f9; border-radius: 8px; padding: 14px 18px; margin-bottom: 16px;">
      <strong style="font-size: 13px; color: #0f172a;">Important Check-in Instructions:</strong>
      <p style="margin: 4px 0 0; font-size: 13px; color: #475467; line-height: 1.5;">${data.checkinInstructions || "Please present a valid government-issued photo ID (Aadhaar, Passport, or Driving License) for all adult guests upon arrival."}</p>
    </div>
  `;

  const html = renderBaseLayout({
    title: subject,
    headerBadge: "CHECK-IN TOMORROW",
    bodyContent,
    actionButtonText: "View Complete Stay Voucher",
    actionButtonUrl: viewBookingUrl,
  });

  const text = `
Your Yatra Expertz stay begins tomorrow!
Dear ${guestName},
Check-in is tomorrow, ${data.checkinDate} from ${data.checkinTime || "12:00 PM"} at ${data.propertyName}.
Address: ${data.propertyAddress}${propertyCity ? `, ${propertyCity}` : ""}
Property Phone: ${data.propertyPhone || "+91 98765 43210"}
Booking Reference: ${data.bookingReference}
${outstandingAmount > 0 ? `Outstanding Balance: ₹${outstandingStr}` : "Status: Fully Paid"}
Instructions: ${data.checkinInstructions || "Government photo ID required at check-in."}

View booking details: ${viewBookingUrl}
  `.trim();

  return { subject, html, text };
}

/**
 * 4. 2-Hour Reminder Email
 * Subject: Your check-in is just 2 hours away!
 */
export function renderReminder2hEmail(data: BookingCommunicationData): RenderedEmail {
  const subject = `Your check-in is just 2 hours away! [${data.bookingReference}]`;
  const guestName = data.customerName || data.guestName || "Guest";
  const propertyCity = data.propertyCity || "";
  const outstandingAmount = Number(data.outstandingAmount || 0);
  const outstandingStr = formatInr(outstandingAmount);
  const viewBookingUrl = data.bookingDetailsUrl || `${data.portalUrl || "https://www.yatraexpertz.com"}/booking/confirm?bookingId=${data.bookingId || ""}`;
  const directionsUrl = data.directionsUrl || data.propertyDirections || "";

  const directionsButton = directionsUrl
    ? `<p style="margin: 14px 0 0;"><a href="${directionsUrl}" target="_blank" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; font-size: 13px; font-weight: bold; padding: 10px 20px; border-radius: 6px;">📍 Open Directions in Maps</a></p>`
    : "";

  const bodyContent = `
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #0f172a;">Welcome Today! 🏨</h1>
    <p style="margin: 0 0 20px; font-size: 15px; color: #475467; line-height: 1.5;">
      Dear <strong>${data.customerName}</strong>, your check-in at <strong>${data.propertyName}</strong> is just <strong>2 hours away</strong> (Scheduled for <strong>${data.checkinTime || "12:00 PM"}</strong>).
    </p>

    <!-- Rapid Arrival Card -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border-radius: 8px; border: 1px solid #e2e8f0; margin-bottom: 20px; padding: 16px 20px;">
      <tr>
        <td>
          <span style="font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; display: block;">Arrival &amp; Contact Desk</span>
          <strong style="font-size: 16px; color: #0f172a;">${data.propertyName}</strong>
          <p style="margin: 4px 0; font-size: 14px; color: #475467;">${data.propertyAddress}, ${data.propertyCity}</p>
          <p style="margin: 4px 0; font-size: 14px; color: #0b6dff; font-weight: 700;">Desk Phone: ${data.propertyPhone || "+91 98765 43210"}</p>
          <p style="margin: 6px 0 0; font-size: 13px; color: #1e293b;">Check-in time: <strong>${data.checkinTime || "12:00 PM"}</strong></p>
          ${directionsButton}
        </td>
      </tr>
    </table>

    <p style="font-size: 14px; color: #475467; line-height: 1.5; margin: 0 0 10px;">
      The team at ${data.propertyName} has your room prepared. If you require early luggage drop-off or assistance finding the entrance, please call the front desk directly.
    </p>
  `;

  const html = renderBaseLayout({
    title: subject,
    headerBadge: "CHECK-IN TODAY",
    bodyContent,
    actionButtonText: "View Stay Details & Voucher",
    actionButtonUrl: viewBookingUrl,
  });

  const text = `
Your check-in is just 2 hours away!
Dear ${data.customerName},
Your stay at ${data.propertyName} begins in 2 hours (${data.checkinTime || "12:00 PM"}).
Address: ${data.propertyAddress}, ${data.propertyCity}
Front Desk: ${data.propertyPhone || "+91 98765 43210"}
Booking Reference: ${data.bookingReference}

View your stay voucher online:
${viewBookingUrl}
  `.trim();

  return { subject, html, text };
}

/**
 * 5. Booking Rescheduled Email
 */
export function renderBookingRescheduledEmail(data: BookingCommunicationData): RenderedEmail {
  const subject = `Updated Dates: Booking Rescheduled for ${data.propertyName} [${data.bookingReference}]`;
  const viewBookingUrl = `${data.portalUrl}/booking/confirm?bookingId=${data.bookingId}`;

  const bodyContent = `
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #0f172a;">Booking Rescheduled</h1>
    <p style="margin: 0 0 20px; font-size: 15px; color: #475467; line-height: 1.5;">
      Dear <strong>${data.customerName}</strong>, your dates for <strong>${data.propertyName}</strong> have been updated.
    </p>
    <p style="font-size: 14px; color: #1e293b;">
      <strong>New Check-in:</strong> ${data.checkinDate}<br>
      <strong>New Check-out:</strong> ${data.checkoutDate}
    </p>
  `;

  const html = renderBaseLayout({
    title: subject,
    headerBadge: "RESCHEDULED",
    bodyContent,
    actionButtonText: "View Updated Voucher",
    actionButtonUrl: viewBookingUrl,
  });

  const text = `Booking Rescheduled for ${data.propertyName}. New check-in: ${data.checkinDate}. Details: ${viewBookingUrl}`;
  return { subject, html, text };
}

/**
 * 6. Booking Cancelled Email
 */
export function renderBookingCancelledEmail(data: BookingCommunicationData): RenderedEmail {
  const subject = `Booking Cancelled: ${data.propertyName} [${data.bookingReference}]`;
  const viewBookingUrl = `${data.portalUrl}/booking/confirm?bookingId=${data.bookingId}`;

  const bodyContent = `
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #b91c1c;">Booking Cancelled</h1>
    <p style="margin: 0 0 20px; font-size: 15px; color: #475467; line-height: 1.5;">
      Dear <strong>${data.customerName}</strong>, your booking at <strong>${data.propertyName}</strong> (${data.bookingReference}) has been cancelled as requested.
    </p>
    <p style="font-size: 13px; color: #64748b;">
      Any eligible refund will be credited back via original payment method in accordance with policy.
    </p>
  `;

  const html = renderBaseLayout({
    title: subject,
    headerBadge: "CANCELLED",
    bodyContent,
    actionButtonText: "View Cancellation Details",
    actionButtonUrl: viewBookingUrl,
  });

  const text = `Booking Cancelled: ${data.propertyName} (${data.bookingReference}). Details: ${viewBookingUrl}`;
  return { subject, html, text };
}

/**
 * 7. Checkout Thank You Email (Phase 5)
 */
export function renderCheckoutThankYouEmail(data: BookingCommunicationData): RenderedEmail {
  const subject = `Thank you for travelling with Yatra Expertz! [${data.bookingReference}]`;
  const exploreUrl = `${data.portalUrl}/hotels`;

  const bodyContent = `
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #0f172a;">Thank You for Travelling with Us! 🌟</h1>
    <p style="margin: 0 0 16px; font-size: 15px; color: #475467; line-height: 1.5;">
      Dear <strong>${data.customerName}</strong>, thank you for choosing Yatra Expertz. Your stay at <strong>${data.propertyName}</strong> is now complete.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px; font-size: 14px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Stay Summary</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; color: #475467;">
        <tr><td style="padding: 4px 0;"><strong>Booking Reference:</strong></td><td style="text-align: right; color: #0f172a; font-weight: 600;">${data.bookingReference}</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Property:</strong></td><td style="text-align: right;">${data.propertyName}</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Stay Dates:</strong></td><td style="text-align: right;">${data.checkinDate} – ${data.checkoutDate} (${data.nightsCount || 1} nights)</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Checkout Status:</strong></td><td style="text-align: right; color: #166534; font-weight: 600;">✓ Completed</td></tr>
      </table>
    </div>

    <p style="font-size: 14px; color: #475467; line-height: 1.6; margin-bottom: 20px;">
      We hope your journey was comfortable. Whenever you are ready for your next getaway, our verified hotels and homestays across India are waiting for you.
    </p>
  `;

  const html = renderBaseLayout({
    title: subject,
    headerBadge: "CHECKOUT COMPLETE",
    bodyContent,
    actionButtonText: "Explore More Destinations",
    actionButtonUrl: exploreUrl,
  });

  const text = `
Thank you for travelling with Yatra Expertz!
Booking Reference: ${data.bookingReference}
Property: ${data.propertyName}
Stay: ${data.checkinDate} to ${data.checkoutDate} (${data.nightsCount || 1} nights)
Checkout status: Completed

Explore your next destination at ${exploreUrl}
For support, contact us at support@yatraexpertz.com
Har Yatra Banaye Yadgaar
  `.trim();

  return { subject, html, text };
}

/**
 * 8. Final Invoice Email (Phase 5)
 */
export function renderFinalInvoiceEmail(
  data: BookingCommunicationData & { invoiceNumber?: string }
): RenderedEmail {
  const invNum = data.invoiceNumber || `YE-INV-${data.bookingReference}`;
  const subject = `Your Yatra Expertz Final Invoice — [${invNum}]`;
  const viewBookingUrl = `${data.portalUrl}/booking/confirm?bookingId=${data.bookingId}`;

  const bodyContent = `
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #0f172a;">Your Final Stay Invoice</h1>
    <p style="margin: 0 0 16px; font-size: 15px; color: #475467; line-height: 1.5;">
      Dear <strong>${data.customerName}</strong>, your finalized commercial stay invoice for <strong>${data.propertyName}</strong> has been generated and is attached to this email.
    </p>

    <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
      <h3 style="margin: 0 0 10px; font-size: 14px; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px;">Invoice Summary</h3>
      <table style="width: 100%; border-collapse: collapse; font-size: 13.5px; color: #475467;">
        <tr><td style="padding: 4px 0;"><strong>Invoice Number:</strong></td><td style="text-align: right; color: #0f172a; font-weight: 600;">${invNum}</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Booking Reference:</strong></td><td style="text-align: right;">${data.bookingReference}</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Property:</strong></td><td style="text-align: right;">${data.propertyName}</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Stay Dates:</strong></td><td style="text-align: right;">${data.checkinDate} – ${data.checkoutDate}</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Total Invoiced:</strong></td><td style="text-align: right; color: #0f172a; font-weight: 700;">Rs. ${(data.totalAmount || 0).toLocaleString("en-IN")}</td></tr>
        <tr><td style="padding: 4px 0;"><strong>Total Paid:</strong></td><td style="text-align: right; color: #166534; font-weight: 600;">Rs. ${(data.paidAmount || 0).toLocaleString("en-IN")}</td></tr>
        ${
          (data.outstandingAmount || 0) > 0
            ? `<tr><td style="padding: 4px 0; color: #b91c1c;"><strong>Outstanding Balance:</strong></td><td style="text-align: right; color: #b91c1c; font-weight: 700;">Rs. ${data.outstandingAmount.toLocaleString("en-IN")}</td></tr>`
            : `<tr><td style="padding: 4px 0;"><strong>Payment Status:</strong></td><td style="text-align: right; color: #166534; font-weight: 600;">Fully Paid / Settled</td></tr>`
        }
      </table>
    </div>

    <p style="font-size: 13.5px; color: #64748b; line-height: 1.5; margin-bottom: 20px;">
      📎 A copy of your PDF invoice is attached. You can also securely access your booking documents online at any time.
    </p>
  `;

  const html = renderBaseLayout({
    title: subject,
    headerBadge: "FINAL INVOICE",
    bodyContent,
    actionButtonText: "View Booking Details",
    actionButtonUrl: viewBookingUrl,
  });

  const text = `
Your Yatra Expertz Final Invoice — [${invNum}]
Customer: ${data.customerName}
Booking Reference: ${data.bookingReference}
Property: ${data.propertyName}
Stay Dates: ${data.checkinDate} to ${data.checkoutDate}
Total Invoiced: Rs. ${(data.totalAmount || 0).toLocaleString("en-IN")}
Total Paid: Rs. ${(data.paidAmount || 0).toLocaleString("en-IN")}
Outstanding: Rs. ${(data.outstandingAmount || 0).toLocaleString("en-IN")}

Your PDF invoice is attached to this email.
View online at: ${viewBookingUrl}
For billing questions: support@yatraexpertz.com
  `.trim();

  return { subject, html, text };
}

/**
 * 9. Property Review Request Email
 */
export function renderReviewRequestEmail(data: BookingCommunicationData): RenderedEmail {
  const bookingRef = data.bookingReference || data.bookingId;
  const subject = `How was your stay with Yatra Expertz? [${bookingRef}]`;
  const reviewUrl = data.reviewUrl || `${data.portalUrl}/review?bookingId=${data.bookingId}`;

  const bodyContent = `
    <h1 style="margin: 0 0 8px; font-size: 22px; font-weight: 800; color: #0f172a;">How Was Your Stay? 📸</h1>
    <p style="margin: 0 0 16px; font-size: 15px; color: #475467; line-height: 1.6;">
      Dear <strong>${data.customerName}</strong>, thank you for choosing Yatra Expertz for your recent stay at <strong>${data.propertyName}</strong> (${data.propertyCity}). We hope you had a restful and memorable journey!
    </p>

    <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin: 16px 0;">
      <div style="font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase; margin-bottom: 8px;">Stay Summary</div>
      <div style="font-size: 14px; color: #1e293b; line-height: 1.5;">
        <strong>Property:</strong> ${data.propertyName}<br/>
        <strong>Booking Reference:</strong> ${bookingRef}<br/>
        <strong>Check-in:</strong> ${data.checkinDate}<br/>
        <strong>Check-out:</strong> ${data.checkoutDate}
      </div>
    </div>

    <p style="margin: 0 0 20px; font-size: 14px; color: #475467; line-height: 1.6;">
      Your honest feedback helps fellow travelers find their perfect stay and enables host partners to maintain the highest hospitality standards. Whether you loved the views, the hospitality, or have constructive suggestions, we invite you to share your genuine experience, photos, and short videos.
    </p>
  `;

  const html = renderBaseLayout({
    title: subject,
    headerBadge: "VERIFIED GUEST REVIEW",
    bodyContent,
    actionButtonText: "Share Your Experience",
    actionButtonUrl: reviewUrl,
  });

  const text = `Dear ${data.customerName},

How was your stay at ${data.propertyName} (${data.propertyCity})?

We hope you had a wonderful journey with Yatra Expertz! Please share your honest feedback and photos/videos with us:
${reviewUrl}

Booking Reference: ${bookingRef}
Check-in: ${data.checkinDate} | Check-out: ${data.checkoutDate}

Thank you,
Yatra Expertz Support Team
support@yatraexpertz.com
`;

  return { subject, html, text };
}

const formatInr = (val?: number) => typeof val === "number" ? val.toLocaleString("en-IN") : "0";

export function renderBookingReminderEmail(
  type: "REMINDER_48_HOURS" | "REMINDER_24_HOURS" | "REMINDER_2_HOURS",
  data: BookingCommunicationData
): RenderedEmail {
  return renderNotificationEmail(type, data);
}

/**
 * Resolves the appropriate email template for any notification type
 */
export function renderNotificationEmail(
  type: NotificationType,
  data: BookingCommunicationData
): RenderedEmail {
  switch (type) {
    case "BOOKING_CONFIRMATION":
      return renderBookingConfirmationEmail(data);
    case "REMINDER_48_HOURS":
      return renderReminder48hEmail(data);
    case "REMINDER_24_HOURS":
      return renderReminder24hEmail(data);
    case "REMINDER_2_HOURS":
      return renderReminder2hEmail(data);
    case "BOOKING_RESCHEDULED":
      return renderBookingRescheduledEmail(data);
    case "BOOKING_CANCELLED":
      return renderBookingCancelledEmail(data);
    case "CHECKOUT_THANK_YOU":
      return renderCheckoutThankYouEmail(data);
    case "FINAL_INVOICE":
      return renderFinalInvoiceEmail(data);
    case "REVIEW_REQUEST":
      return renderReviewRequestEmail(data);
    default:
      return renderBookingConfirmationEmail(data);
  }
}
