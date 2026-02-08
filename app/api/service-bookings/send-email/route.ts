import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const booking = await request.json();

    const emailTemplate = generateEmailTemplate(booking);

    // Send email using your email service
    // For now, just return success
    // You can integrate with services like SendGrid, AWS SES, etc.

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email" },
      { status: 500 }
    );
  }
}

function generateEmailTemplate(booking: any): string {
  const serviceLabels: Record<string, string> = {
    "car-rental": "Car Rental",
    flight: "Flight Booking",
    bus: "Bus Ticket",
    train: "Train Ticket",
    visa: "Visa Application",
    forex: "Forex & Currency Exchange",
    insurance: "Travel Insurance",
  };

  const serviceName = serviceLabels[booking.serviceType] || booking.serviceType;

  let fieldsHTML = "";

  // Common fields
  fieldsHTML += `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Full Name</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${booking.fullName}</td>
    </tr>
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Mobile</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${booking.mobile}</td>
    </tr>
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Email</td>
      <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${booking.email}</td>
    </tr>
  `;

  // Service-specific fields
  Object.entries(booking).forEach(([key, value]) => {
    if (
      !["_id", "serviceType", "fullName", "mobile", "email", "agreeContact", "status", "createdAt", "updatedAt", "message"].includes(key)
    ) {
      const label = key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, (str) => str.toUpperCase());
      fieldsHTML += `
        <tr>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">${label}</td>
          <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${value || "N/A"}</td>
        </tr>
      `;
    }
  });

  if (booking.message) {
    fieldsHTML += `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; font-weight: 600; color: #374151;">Message</td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; color: #6b7280;">${booking.message}</td>
      </tr>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f3f4f6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f3f4f6; padding: 40px 20px;">
        <tr>
          <td align="center">
            <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0066cc 0%, #0052a3 100%); padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700;">New ${serviceName} Request</h1>
                  <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Booking ID: ${booking._id}</p>
                </td>
              </tr>
              
              <!-- Content -->
              <tr>
                <td style="padding: 30px;">
                  <p style="margin: 0 0 20px 0; color: #374151; font-size: 16px;">You have received a new booking request:</p>
                  
                  <table width="100%" cellpadding="0" cellspacing="0" style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                    ${fieldsHTML}
                  </table>
                </td>
              </tr>
              
              <!-- Footer -->
              <tr>
                <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                  <p style="margin: 0; color: #6b7280; font-size: 14px;">
                    Received on ${new Date(booking.createdAt).toLocaleString()}
                  </p>
                  <p style="margin: 10px 0 0 0; color: #9ca3af; font-size: 12px;">
                    © ${new Date().getFullYear()} TravelExpertz. All rights reserved.
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}
