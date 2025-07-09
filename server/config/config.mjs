// ========================
// 1) IMPORTS & CONFIGURATION
// ========================
import dotenv from 'dotenv';
dotenv.config();

// ========================
// 2) MAIN CONFIGURATION
// ========================

export const config = {
  firebase: {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID,
    databaseURL: process.env.FIREBASE_DATABASE_URL
  },
  
  email: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  jwt: {
    secret: process.env.JWT_SECRET || '274c13415a172d06c45ee0f813853ead60b7b37e030ad98079f30bbc0a4cf78a',
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  },
};
