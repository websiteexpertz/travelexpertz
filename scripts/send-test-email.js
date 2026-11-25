const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");

// Load .env.local and .env
function loadEnv() {
  const envFiles = [".env.local", ".env"];
  for (const file of envFiles) {
    const fullPath = path.join(process.cwd(), file);
    if (fs.existsSync(fullPath)) {
      const content = fs.readFileSync(fullPath, "utf8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#")) {
          const eqIdx = trimmed.indexOf("=");
          if (eqIdx !== -1) {
            const key = trimmed.slice(0, eqIdx).trim();
            const val = trimmed.slice(eqIdx + 1).trim();
            if (!process.env[key]) {
              process.env[key] = val;
            }
          }
        }
      });
    }
  }
}

loadEnv();

async function sendTest() {
  const recipient = "tyagideepansh26@gmail.com";
  console.log(`\n======================================================`);
  console.log(`Connecting to Zoho SMTP: ${process.env.SMTP_HOST || "smtppro.zoho.in"}:587`);
  console.log(`Sending to: ${recipient}`);
  console.log(`======================================================\n`);

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtppro.zoho.in",
    port: Number(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER || "noreply@yatraexpertz.com",
      pass: process.env.SMTP_PASSWORD || process.env.SMTP_PASS,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });

  const bookingRef = "YE-" + Math.floor(100000 + Math.random() * 900000);

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8">
      <title>Booking Confirmed — Yatra Expertz</title>
    </head>
    <body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b;">
      <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f1f5f9; padding: 30px 15px;">
        <tr>
          <td align="center">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
              
              <!-- Header -->
              <tr>
                <td style="background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 100%); padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #ffffff; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Yatra Expertz</h1>
                  <p style="margin: 6px 0 0; color: #93c5fd; font-size: 14px; font-weight: 500;">Premium Travel & Stays Across India</p>
                </td>
              </tr>

              <!-- Status Badge -->
              <tr>
                <td style="padding: 24px 30px 10px; text-align: center;">
                  <div style="display: inline-block; background-color: #dcfce7; color: #15803d; font-size: 13px; font-weight: 700; padding: 6px 16px; border-radius: 20px; text-transform: uppercase; letter-spacing: 0.5px;">
                    ✓ Booking Confirmed & Verified
                  </div>
                  <h2 style="margin: 16px 0 6px; color: #0f172a; font-size: 22px; font-weight: 700;">Pack your bags, Deepansh!</h2>
                  <p style="margin: 0; color: #64748b; font-size: 15px;">Your reservation at <strong>Himalayan View Resort & Spa</strong> is confirmed.</p>
                </td>
              </tr>

              <!-- Booking Details Card -->
              <tr>
                <td style="padding: 20px 30px;">
                  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px;">
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Booking Reference</td>
                      <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">${bookingRef}</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Property</td>
                      <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">Himalayan View Resort & Spa</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Location</td>
                      <td style="padding: 6px 0; color: #0f172a; font-size: 14px; text-align: right;">Mall Road, Old Manali, HP</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Room Category</td>
                      <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 600; text-align: right;">Deluxe Mountain View Suite</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Check-in</td>
                      <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">Friday, Dec 04, 2026 (12:00 PM)</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Check-out</td>
                      <td style="padding: 6px 0; color: #0f172a; font-size: 14px; font-weight: 700; text-align: right;">Sunday, Dec 06, 2026 (11:00 AM)</td>
                    </tr>
                    <tr>
                      <td style="padding: 6px 0; color: #64748b; font-size: 14px;">Guests</td>
                      <td style="padding: 6px 0; color: #0f172a; font-size: 14px; text-align: right;">2 Guests • 2 Nights</td>
                    </tr>
                    <tr style="border-top: 1px solid #cbd5e1;">
                      <td style="padding: 12px 0 4px; color: #0f172a; font-size: 16px; font-weight: 700;">Total Paid Amount</td>
                      <td style="padding: 12px 0 4px; color: #16a34a; font-size: 18px; font-weight: 800; text-align: right;">₹7,499.00</td>
                    </tr>
                  </table>
                </td>
              </tr>

              <!-- Button CTA -->
              <tr>
                <td style="padding: 10px 30px 25px; text-align: center;">
                  <a href="https://www.yatraexpertz.com" target="_blank" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; font-size: 15px; font-weight: 700; padding: 14px 32px; border-radius: 8px; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);">
                    Download Booking Voucher →
                  </a>
                </td>
              </tr>

              <!-- Footer -->
              <tr>
                <td style="background-color: #f8fafc; padding: 20px 30px; text-align: center; border-top: 1px solid #e2e8f0;">
                  <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                    This is an official automated booking notification from Yatra Expertz.<br>
                    Need assistance? Contact our 24/7 concierge at <strong>support@yatraexpertz.com</strong>
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

  const info = await transporter.sendMail({
    from: `"Yatra Expertz" <${process.env.SMTP_USER || "noreply@yatraexpertz.com"}>`,
    to: recipient,
    subject: `✅ Booking Confirmed: Himalayan View Resort & Spa (Ref: ${bookingRef})`,
    html: htmlContent,
  });

  console.log(`\n🎉 EMAIL DELIVERED SUCCESSFULLY!`);
  console.log(`Message ID: ${info.messageId}`);
  console.log(`Response: ${info.response}`);
}

sendTest().catch((err) => {
  console.error("❌ Send error:", err);
  process.exit(1);
});
