// ========================
// 1) IMPORTS & CONFIGURATION
// ========================
// dotenv is a zero-dependency module that loads environment variables from a .env file into process.env
import dotenv from 'dotenv';

// Load environment variables from .env file into process.env
// This allows us to store sensitive information outside of our code
// and access it through environment variables
dotenv.config();

// ========================
// 2) MAIN CONFIGURATION
// ========================

/**
 * Application configuration object
 * This object centralizes all configuration settings for the application
 * It retrieves values from environment variables with fallback values where needed
 */
export const config = {
  // Firebase configuration
  // Contains all necessary credentials and settings for Firebase services
  firebase: {
    // Firebase API key (public key, but should still be kept secure)
    apiKey: process.env.FIREBASE_API_KEY,
    // Firebase authentication domain
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    // Firebase project ID
    projectId: process.env.FIREBASE_PROJECT_ID,
    // Firebase storage bucket for file uploads
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    // Firebase messaging sender ID for push notifications
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    // Firebase application ID
    appId: process.env.FIREBASE_APP_ID,
    // Firebase measurement ID for Google Analytics
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    // Firebase Realtime Database URL
    databaseURL: process.env.FIREBASE_DATABASE_URL
  },
  
  // Email service configuration
  // Contains settings for the email service (e.g., Gmail SMTP)
  email: {
    // Email account username for sending emails
    user: process.env.EMAIL_USER,
    // Email account password or app-specific password
    pass: process.env.EMAIL_PASS
  },
  
  // Server configuration
  // Contains settings for the Express server
  server: {
    // Port number the server will listen on
    // Uses the PORT environment variable if set, otherwise defaults to 3000
    port: process.env.PORT || 3000,
    // Current environment (development, production, test, etc.)
    // Uses NODE_ENV environment variable if set, otherwise defaults to 'development'
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  // JWT Configuration
  jwt: {
    secret: process.env.JWT_SECRET || '274c13415a172d06c45ee0f813853ead60b7b37e030ad98079f30bbc0a4cf78a',
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  },
};
