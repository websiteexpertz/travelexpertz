/**
 * Test SMTP Connection
 * Run this to verify your Gmail SMTP credentials are working
 */

import nodemailer from 'nodemailer';

async function testEmail() {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
      user: 'contact@websiteexpertz.com',
      pass: 'pwjpxnppqntbrued',
    },
  });

  try {
    console.log('Testing SMTP connection...');
    
    // Verify connection
    await transporter.verify();
    console.log('✅ SMTP connection verified!');

    // Send test email
    const info = await transporter.sendMail({
      from: '"TravelExpertz Test" <contact@websiteexpertz.com>',
      to: 'nirbhayrajput003@gmail.com',
      subject: 'Test Email from TravelExpertz',
      text: 'If you receive this, your SMTP is working correctly!',
      html: '<h1>Test Successful!</h1><p>If you receive this, your SMTP is working correctly!</p>',
    });

    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testEmail();
