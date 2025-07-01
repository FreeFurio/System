// ========================
// 1) IMPORTS & CONFIGURATION
// ========================
// Nodemailer module for sending emails
import nodemailer from 'nodemailer';
// Application configuration
import { config } from '../config/config.mjs';

// ========================
// 2) EMAIL TRANSPORTER
// ========================

/**
 * EmailService class handles all email-related functionality
 * Uses nodemailer with Gmail SMTP for sending emails
 * Follows a singleton-like pattern with static methods
 */
class EmailService {
  /**
   * Nodemailer transporter instance configured with Gmail SMTP
   * Uses credentials from the config file
   */
  static transporter = nodemailer.createTransport({
    service: 'gmail',  // Using Gmail's SMTP server
    auth: {
      user: config.email.user,  // Email address from config
      pass: config.email.pass   // App password from config
    }
  });

  // ========================
  // 3) EMAIL TEMPLATES
  // ========================

  /**
   * Generates an OTP verification email template
   * @param {string} otp - The one-time password to include in the email
   * @returns {Object} Email template with subject and HTML content
   */
  static generateOTPEmail = (otp) => ({
    subject: 'Your OTP for Registration',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Email Verification</h2>
        <p>Your One-Time Password (OTP) for registration is:</p>
        <div style="background: #f4f4f4; padding: 10px 20px; margin: 20px 0; font-size: 24px; letter-spacing: 2px; text-align: center;">
          <strong>${otp}</strong>
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
      </div>
    `
  });

  // ========================
  // 4) EMAIL SERVICE METHODS
  // ========================

  /**
   * Generates a 6-digit OTP (One-Time Password)
   * @returns {string} 6-digit OTP as a string
   */
  static generateOTP() {
    // Generate a random 6-digit number (100000 to 999999)
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Sends an email using the configured transporter
   * @param {string} to - Recipient's email address
   * @param {string} subject - Email subject
   * @param {string} html - HTML content of the email
   * @returns {Promise<Object>} Object with success status and message ID
   * @throws {Error} If email sending fails
   */
  static async sendEmail(to, subject, html) {
    try {
      // Configure email options
      const mailOptions = {
        from: `"Infinity" <${config.email.user}>`,  // Sender name and email
        to,                                         // Recipient email
        subject,                                    // Email subject
        html                                        // Email body (HTML)
      };


      // Send the email
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: %s', info.messageId);
      
      // Return success response
      return { 
        success: true, 
        messageId: info.messageId 
      };
    } catch (error) {
      // Log and rethrow error for global error handler
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  /**
   * Sends an OTP verification email to the specified address
   * @param {string} email - Recipient's email address
   * @param {string} otp - One-Time Password to send
   * @returns {Promise<Object>} Result of the email sending operation
   */
  static async sendOTPEmail(email, otp) {
    // Generate email template with the provided OTP
    const emailTemplate = this.generateOTPEmail(otp);
    // Send the email using the generated template
    return this.sendEmail(email, emailTemplate.subject, emailTemplate.html);
  }
}

// ========================
// 5) EXPORTS
// ========================

export default EmailService;
