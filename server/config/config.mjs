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
    resendApiKey: process.env.RESEND_API_KEY,
    fromAddress: process.env.EMAIL_FROM || 'onboarding@resend.dev'
  },
  
  server: {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development'
  },

  jwt: {
    secret: process.env.JWT_SECRET || '274c13415a172d06c45ee0f813853ead60b7b37e030ad98079f30bbc0a4cf78a',
    expiresIn: process.env.JWT_EXPIRES_IN || '90d'
  },

  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      maxTokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 500,
      temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
      seoTemperature: parseFloat(process.env.OPENAI_SEO_TEMPERATURE) || 0.3,
      timeout: parseInt(process.env.AI_TIMEOUT_MS) || 30000,
      retryAttempts: parseInt(process.env.AI_RETRY_ATTEMPTS) || 3
    },
    features: {
      contentEnabled: process.env.AI_CONTENT_ENABLED === 'true',
      seoEnabled: process.env.AI_SEO_ANALYSIS_ENABLED === 'true',
      rateLimitPerMinute: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE) || 10
    },
    limits: {
      maxTopicLength: parseInt(process.env.MAX_TOPIC_LENGTH) || 200,
      maxContentRequestsPerUser: parseInt(process.env.MAX_CONTENT_REQUESTS_PER_USER) || 50,
      contentCacheTTL: parseInt(process.env.CONTENT_CACHE_TTL) || 3600
    }
  },

  seo: {
    minScore: parseInt(process.env.SEO_MIN_SCORE) || 0,
    maxScore: parseInt(process.env.SEO_MAX_SCORE) || 100,
    defaultScore: parseInt(process.env.SEO_DEFAULT_SCORE) || 75
  },

  platforms: {
    facebook: {
      headlineMaxLength: parseInt(process.env.FACEBOOK_HEADLINE_MAX_LENGTH) || 60,
      captionMaxLength: parseInt(process.env.FACEBOOK_CAPTION_MAX_LENGTH) || 2000
    },
    instagram: {
      headlineMaxLength: parseInt(process.env.INSTAGRAM_HEADLINE_MAX_LENGTH) || 150,
      captionMaxLength: parseInt(process.env.INSTAGRAM_CAPTION_MAX_LENGTH) || 2200
    },
    twitter: {
      headlineMaxLength: parseInt(process.env.TWITTER_HEADLINE_MAX_LENGTH) || 100,
      captionMaxLength: parseInt(process.env.TWITTER_CAPTION_MAX_LENGTH) || 280
    }
  },

  upload: {
    maxSize: parseInt(process.env.UPLOAD_MAX_SIZE) || 10485760,
    allowedTypes: process.env.UPLOAD_ALLOWED_TYPES ? 
      process.env.UPLOAD_ALLOWED_TYPES.split(',') : 
      ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    path: process.env.UPLOAD_PATH || './uploads'
  },

  database: {
    connectionTimeout: parseInt(process.env.DB_CONNECTION_TIMEOUT) || 10000,
    retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS) || 3
  },

  security: {
    corsOrigin: process.env.CORS_ORIGIN ? 
      process.env.CORS_ORIGIN.split(',') : 
      ['http://localhost:5173', 'https://system-production-9942.up.railway.app'],
    rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 1000
  },

  logging: {
    level: process.env.LOG_LEVEL || 'info',
    fileEnabled: process.env.LOG_FILE_ENABLED === 'true',
    filePath: process.env.LOG_FILE_PATH || './logs/app.log'
  }
};
