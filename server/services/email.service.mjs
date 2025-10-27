// ========================
// 1) IMPORTS & CONFIGURATION
// ========================
import { Resend } from 'resend';
import { config } from '../config/config.mjs';

// ========================
// 2) EMAIL TRANSPORTER
// ========================
class EmailService {
  static resend = new Resend(config.email.resendApiKey);

  // ========================
  // 3) EMAIL TEMPLATES
  // ========================
  static generateOTPEmail = (otp) => ({
    subject: '🔐 Your Verification Code - Salon Management System',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f8fa; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(239, 68, 68, 0.15); border: 1px solid rgba(251, 191, 36, 0.2);">
          <div style="height: 6px; background: linear-gradient(90deg, #ef4444, #fbbf24, #ef4444, #fbbf24);"></div>
          <div style="padding: 40px 32px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 28px; font-weight: 800; color: #ef4444; margin: 0; letter-spacing: -0.5px;">Salon Management</h1>
              <p style="color: #6b7280; font-size: 16px; margin: 8px 0 0 0;">Email Verification Required</p>
            </div>
            <div style="text-align: center; margin-bottom: 32px;">
              <h2 style="font-size: 20px; font-weight: 600; color: #374151; margin: 0 0 16px 0;">Verify Your Email Address</h2>
              <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0;">Enter the verification code below to complete your registration:</p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <div style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px 32px; border-radius: 16px; box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);">
                <div style="font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">${otp}</div>
              </div>
            </div>
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #3b82f6;">
              <p style="color: #374151; font-size: 14px; margin: 0; line-height: 1.5;">⏰ <strong>This code expires in 10 minutes</strong><br>🔒 Keep this code secure and don't share it with anyone</p>
            </div>
            <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">If you didn't request this verification, please ignore this email.</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">© 2024 Salon Management System. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  });

  // ========================
  // 4) EMAIL SERVICE METHODS
  // ========================
  static generateOTP() {
    console.log('🎲 generateOTP called');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🎲 generateOTP - Generated OTP:', otp);
    return otp;
  }

  static async sendEmail(to, subject, html) {
    console.log('📧 sendEmail called with to:', to, 'subject:', subject);
    try {
      const { data, error } = await this.resend.emails.send({
        from: config.email.fromAddress,
        to,
        subject,
        html
      });
      
      if (error) {
        console.error('❌ sendEmail - Resend error:', error);
        throw new Error('Failed to send email');
      }
      
      console.log('✅ sendEmail - Email sent successfully. ID:', data.id);
      return { 
        success: true, 
        messageId: data.id 
      };
    } catch (error) {
      console.error('❌ sendEmail - Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  static async sendOTPEmail(email, otp) {
    console.log('📨 sendOTPEmail called with email:', email, 'otp:', otp);
    const emailTemplate = this.generateOTPEmail(otp);
    console.log('📨 sendOTPEmail - Email template generated');

    console.log('📨 sendOTPEmail - Calling sendEmail');
    const result = await this.sendEmail(email, emailTemplate.subject, emailTemplate.html);
    console.log('✅ sendOTPEmail - OTP email sent successfully');
    return result;
  }

  static generatePasswordResetEmail = (resetToken) => ({
    subject: '🔒 Password Reset Request - Salon Management System',
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Password Reset</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f6f8fa; font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <div style="max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(239, 68, 68, 0.15); border: 1px solid rgba(251, 191, 36, 0.2);">
          <div style="height: 6px; background: linear-gradient(90deg, #ef4444, #fbbf24, #ef4444, #fbbf24);"></div>
          <div style="padding: 40px 32px;">
            <div style="text-align: center; margin-bottom: 32px;">
              <h1 style="font-size: 28px; font-weight: 800; color: #ef4444; margin: 0; letter-spacing: -0.5px;">Salon Management</h1>
              <p style="color: #6b7280; font-size: 16px; margin: 8px 0 0 0;">Password Reset Request</p>
            </div>
            <div style="text-align: center; margin-bottom: 32px;">
              <h2 style="font-size: 20px; font-weight: 600; color: #374151; margin: 0 0 16px 0;">Reset Your Password</h2>
              <p style="color: #6b7280; font-size: 16px; line-height: 1.5; margin: 0;">We received a request to reset your password. Use the code below to create a new password:</p>
            </div>
            <div style="text-align: center; margin: 32px 0;">
              <div style="display: inline-block; background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); padding: 20px 32px; border-radius: 16px; box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);">
                <div style="font-size: 32px; font-weight: 800; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">${resetToken}</div>
              </div>
            </div>
            <div style="background: #f8fafc; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #3b82f6;">
              <p style="color: #374151; font-size: 14px; margin: 0; line-height: 1.5;">⏰ <strong>This code expires in 15 minutes</strong><br>🔒 Keep this code secure and don't share it with anyone<br>💻 Go to the password reset page and enter this code</p>
            </div>
            <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
              <p style="color: #9ca3af; font-size: 14px; margin: 0;">If you didn't request this password reset, please ignore this email.</p>
              <p style="color: #9ca3af; font-size: 12px; margin: 8px 0 0 0;">© 2024 Salon Management System. All rights reserved.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `
  });

  static async sendPasswordResetEmail(email, resetToken) {
    console.log('📨 sendPasswordResetEmail called with email:', email);
    const emailTemplate = this.generatePasswordResetEmail(resetToken);
    console.log('📨 sendPasswordResetEmail - Email template generated');

    const result = await this.sendEmail(email, emailTemplate.subject, emailTemplate.html);
    console.log('✅ sendPasswordResetEmail - Password reset email sent successfully');
    return result;
  }
}

// ========================
// 5) EXPORTS
// ========================

export default EmailService;
