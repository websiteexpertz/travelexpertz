/**
 * Email Service for sending OTP and other notifications via SMTP
 */

import nodemailer from 'nodemailer';

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Create transporter with Gmail SMTP
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER || '', // Gmail address
      pass: process.env.SMTP_PASSWORD || '', // App password
    },
  });
};

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"TravelExpertz" <${process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || '',
    };

    console.log("=== Email Service ===");
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("From:", mailOptions.from);
    console.log("=====================");

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully!");
    console.log("Message ID:", info.messageId);
    console.log("Response:", info.response);
    console.log("=====================");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
}

export async function sendOTP(email: string, otp: string): Promise<boolean> {
  console.log("🔐 GENERATED OTP:", otp, "for email:", email);
  
  const subject = 'Your OTP for TravelExpertz';
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #0066cc 0%, #004c99 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .otp-box { background: white; border: 2px dashed #0066cc; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .otp-code { font-size: 32px; font-weight: bold; color: #0066cc; letter-spacing: 8px; }
        .footer { background: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
        .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 15px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0;">🌍 TravelExpertz</h1>
          <p style="margin: 10px 0 0 0;">Your Travel, Our Expertise</p>
        </div>
        <div class="content">
          <h2 style="color: #1f2937; margin-top: 0;">Email Verification</h2>
          <p>Hello,</p>
          <p>Thank you for registering with TravelExpertz. Please use the following OTP to verify your email address:</p>
          
          <div class="otp-box">
            <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;">Your OTP Code</p>
            <div class="otp-code">${otp}</div>
            <p style="margin: 10px 0 0 0; color: #6b7280; font-size: 14px;">Valid for 10 minutes</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. TravelExpertz will never ask for your OTP via phone or email.
          </div>
          
          <p>If you didn't request this OTP, please ignore this email or contact our support team.</p>
          
          <p style="margin-top: 20px;">Best regards,<br><strong>TravelExpertz Team</strong></p>
        </div>
        <div class="footer">
          <p style="margin: 0;">© 2026 TravelExpertz. All rights reserved.</p>
          <p style="margin: 5px 0 0 0;">This is an automated email. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
  
  const text = `Your OTP for TravelExpertz is: ${otp}. Valid for 10 minutes. Do not share this OTP with anyone.`;
  
  return sendEmail({ to: email, subject, html, text });
}
