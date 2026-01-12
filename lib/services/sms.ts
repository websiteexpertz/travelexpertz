// SMS Service - Integrate with your SMS provider (Twilio, AWS SNS, MSG91, etc.)
// This is a mock implementation. Replace with actual SMS API integration.

interface SMSResponse {
  success: boolean;
  message: string;
  messageId?: string;
}

export async function sendSMS(
  mobile: string,
  message: string
): Promise<SMSResponse> {
  try {
    // TODO: Replace with actual SMS provider integration
    // Example for Twilio:
    // const accountSid = process.env.TWILIO_ACCOUNT_SID;
    // const authToken = process.env.TWILIO_AUTH_TOKEN;
    // const client = require('twilio')(accountSid, authToken);
    // 
    // const result = await client.messages.create({
    //   body: message,
    //   from: process.env.TWILIO_PHONE_NUMBER,
    //   to: `+91${mobile}`
    // });

    // Mock implementation for development
    console.log(`[SMS] Sending to ${mobile}: ${message}`);
    
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      message: "SMS sent successfully",
      messageId: `mock_${Date.now()}`,
    };
  } catch (error) {
    console.error("SMS sending error:", error);
    return {
      success: false,
      message: "Failed to send SMS",
    };
  }
}

export async function sendOTP(mobile: string, otp: string): Promise<SMSResponse> {
  const message = `Your TravelExpertz OTP is: ${otp}. Valid for 10 minutes. Do not share with anyone.`;
  return sendSMS(mobile, message);
}

// For production, integrate with:
// 1. Twilio: https://www.twilio.com/docs/sms/quickstart/node
// 2. AWS SNS: https://docs.aws.amazon.com/sns/latest/dg/sms_publish-to-phone.html
// 3. MSG91: https://msg91.com/help/MSG91/
// 4. Fast2SMS: https://www.fast2sms.com/
