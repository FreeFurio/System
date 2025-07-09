// ========================
// 1) IMPORTS & CONFIGURATION
// ========================
import nodemailer from 'nodemailer';
import { config } from '../config/config.mjs';

// ========================
// 2) EMAIL TRANSPORTER
// ========================
class EmailService {
  static transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: config.email.user,  
      pass: config.email.pass  
    }
  });

  // ========================
  // 3) EMAIL TEMPLATES
  // ========================
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
  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async sendEmail(to, subject, html) {
    try {
      const mailOptions = {
        from: `"Infinity" <${config.email.user}>`,  
        to,                                        
        subject,                                   
        html                                       
      };
      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email sent: %s', info.messageId);
      
      return { 
        success: true, 
        messageId: info.messageId 
      };
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  static async sendOTPEmail(email, otp) {
    const emailTemplate = this.generateOTPEmail(otp);

    return this.sendEmail(email, emailTemplate.subject, emailTemplate.html);
  }
}

// ========================
// 5) EXPORTS
// ========================

export default EmailService;
