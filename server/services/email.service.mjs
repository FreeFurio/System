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
    console.log('🎲 generateOTP called');
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log('🎲 generateOTP - Generated OTP:', otp);
    return otp;
  }

  static async sendEmail(to, subject, html) {
    console.log('📧 sendEmail called with to:', to, 'subject:', subject);
    try {
      const mailOptions = {
        from: `"Infinity" <${config.email.user}>`,  
        to,                                        
        subject,                                   
        html                                       
      };
      console.log('📧 sendEmail - Mail options prepared:', { from: mailOptions.from, to: mailOptions.to, subject: mailOptions.subject });
      
      console.log('📧 sendEmail - Sending email via transporter');
      const info = await this.transporter.sendMail(mailOptions);
      console.log('✅ sendEmail - Email sent successfully. Message ID:', info.messageId);
      
      return { 
        success: true, 
        messageId: info.messageId 
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
}

// ========================
// 5) EXPORTS
// ========================

export default EmailService;
