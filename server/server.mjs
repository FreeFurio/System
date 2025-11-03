// ========================
// 1) IMPORTS & CONFIGURATION
// ========================
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';        
import cors from 'cors';              
import morgan from 'morgan';          
import rateLimit from 'express-rate-limit'; 
import helmet from 'helmet';          
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';           
import hpp from 'hpp';
import axios from 'axios';
import http from 'http';
import https from 'https';

// Configure axios defaults for production stability
axios.defaults.timeout = 30000; // 30 second timeout
axios.defaults.headers.common['User-Agent'] = 'AI-Marketing-System/1.0';

// Force IPv4 and configure connection settings
axios.defaults.httpAgent = new http.Agent({ 
  family: 4,
  keepAlive: true,
  keepAliveMsecs: 30000
});
axios.defaults.httpsAgent = new https.Agent({ 
  family: 4,
  keepAlive: true,
  keepAliveMsecs: 30000
});

import authRouter from './routes/auth.routes.mjs';
import notificationRouter from './routes/notification.routes.mjs';
import taskRouter from './routes/task.routes.mjs';
import userRouter from './routes/user.routes.mjs';
import aiRouter from './routes/aiRoutes.mjs';
import socialMediaRouter from './routes/socialMediaRoutes.mjs';
import draftRouter from './routes/draftRoutes.mjs';
import adminRouter from './routes/admin.js';
import { config } from './config/config.mjs';
import errorHandler from './utils/errorHandler.mjs';
import schedulerService from './services/schedulerService.mjs';
import redisService from './services/redis.service.mjs';
import { createServer } from 'http';
import { Server as SocketIOServer} from 'socket.io';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename);           
const app = express();

// Trust proxy for production (Railway, Heroku, etc.)
app.set('trust proxy', 1);                           

// ========================
// 2) GLOBAL MIDDLEWARES
// ========================
app.use(cors({
  origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
    'http://localhost:5173',
    'https://system-production-9942.up.railway.app'
  ],
  credentials: true            
}));


app.use(
  helmet({  
    contentSecurityPolicy: {
      directives: {   
        defaultSrc: ["'self'"], 
        connectSrc: [          
          "'self'",
          "data:",
          "wss://*.firebasedatabase.app",
          "https://*.firebasedatabase.app",
          "https://api.cloudinary.com",
          "https://system-production-9942.up.railway.app",
          "wss://system-production-9942.up.railway.app"
        ],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://*.firebasedatabase.app", "https://code.jquery.com", "https://cdnjs.cloudflare.com", "https://cdn.jsdelivr.net"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdn.jsdelivr.net"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com", "https://*.fbcdn.net", "https://*.twimg.com", "https://*.cdninstagram.com", "https://cdn.jsdelivr.net"],
        frameSrc: ["'self'", "https://app.templated.io"]
      },
    },
  })
);
const logLevel = process.env.LOG_LEVEL || 'info';
if (process.env.NODE_ENV === 'development' || logLevel === 'dev') {
  app.use(morgan('dev'));  
} else if (process.env.LOG_FILE_ENABLED === 'true') {
  app.use(morgan('combined'));
}

const limiter = rateLimit({
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 10000, 
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
  message: 'Too many requests from this IP, please try again later!',
  standardHeaders: true,
  legacyHeaders: false
});
// General API rate limiter
app.use('/api', limiter);

// Stricter rate limiter for AI endpoints
const aiLimiter = rateLimit({
  max: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE) || 100,
  windowMs: 60000, // 1 minute
  message: 'Too many AI requests, please wait before trying again.',
  standardHeaders: true,
  legacyHeaders: false
});
app.use('/api/v1/ai', aiLimiter);
const uploadMaxSize = process.env.UPLOAD_MAX_SIZE || '10485760';
const jsonLimit = Math.min(parseInt(uploadMaxSize), 10485760); // 10MB max

app.use(express.json({ limit: jsonLimit }));
app.use(express.urlencoded({ extended: true, limit: jsonLimit }));
app.use(mongoSanitize());
app.use(xss());
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ] 
  })
);
app.use(express.static(path.join(__dirname, 'public'))); 
// Request logging middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  console.log(`🔍 ${req.method} ${req.originalUrl} - ${req.requestTime}`);
  
  // Log API requests specifically
  if (req.originalUrl.startsWith('/api/')) {
    console.log(`🚀 API Request: ${req.method} ${req.originalUrl}`);
  }
  
  next();
});

// ========================
// 3) SOCKET.IO SETUP
// ========================
const server = createServer(app);
const io = new SocketIOServer(server , {
  cors: {
    origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : [
      'http://localhost:5173',
      'https://system-production-9942.up.railway.app'
    ],
    credentials: true
  }
});
export {io};

io.on('connection', (socket) => {
  console.log('Socket.IO client connected:', socket.id);
  socket.on('disconnect',() => {
    console.log('Socket.IO client disconnected:', socket.id);
  });
});
// ========================
// 4) ROUTES
// ========================

// Health check endpoint for debugging
app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Redirect debug to React frontend
app.get('/debug', (req, res) => {
  res.redirect('http://localhost:5173/debug');
});

// API endpoint for React debug component
app.get('/api/v1/debug-data', async (req, res) => {
  try {
    const { default: insightsService } = await import('./services/insightsService.js');
    const debugData = await insightsService.getDebugData();
    res.json(debugData);
  } catch (error) {
    res.status(500).json({
      error: 'Failed to fetch debug data',
      message: error.message
    });
  }
});

// Privacy policy endpoint for Facebook app review
app.get('/privacy-policy', (req, res) => {
  res.sendFile(path.join(__dirname, '../privacy-policy.html'));
});

// Robots.txt for Facebook crawlers
app.get('/robots.txt', (req, res) => {
  res.sendFile(path.join(__dirname, '../robots.txt'));
});



// ========================
// API ROUTES
// ========================
app.use('/api/v1/auth', authRouter); 
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/ai', aiRouter);
app.use('/api/v1/social', socialMediaRouter);
app.use('/api/v1/drafts', draftRouter);
app.use('/api/v1/admin', adminRouter);

// Middleware to catch any unhandled API routes
app.use('/api/*', (req, res) => {
  console.log(`⚠️ Unhandled API route: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ error: 'API endpoint not found' });
});

// ========================
// STATIC FILES - WITH MIME TYPES
// ========================
app.use(express.static(path.join(__dirname, '../client/dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    } else if (filePath.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (filePath.endsWith('.webp')) {
      res.setHeader('Content-Type', 'image/webp');
    }
  }
}));

// Serve client assets directly
app.use('/assets', express.static(path.join(__dirname, '../client/assets')));

// Serve ImageEditor components for production
app.use('/components/ImageEditor', express.static(path.join(__dirname, '../client/components/ImageEditor')));

// ========================
// CATCH-ALL ROUTE (AFTER API ROUTES, BEFORE ERROR HANDLER)
// ========================
app.get('*', (req, res) => {
  // Log non-API requests being handled by catch-all
  if (!req.originalUrl.startsWith('/api/')) {
    console.log(`📄 Serving React app for: ${req.originalUrl}`);
  }
  res.sendFile(path.join(__dirname, '../client/dist/index.html')); 
});

// ========================
// 5) ERROR HANDLING
// ========================
app.use(errorHandler);

// ========================
// 6) START SERVER
// ========================
const port = config.server.port || 3000;
server.listen(port, async () => {
  console.log(`App running on port ${port}...`);
  
  // Initialize Redis
  console.log('🔄 Connecting to Redis...');
  await redisService.connect();
  
  // DEBUG: Check if dist folder exists
  const distPath = path.join(__dirname, '../client/dist');
  console.log('🔍 Checking dist folder:', distPath);
  console.log('🔍 Dist exists:', fs.existsSync(distPath));
  if (fs.existsSync(distPath)) {
    console.log('🔍 Dist contents:', fs.readdirSync(distPath));
    const assetsPath = path.join(distPath, 'assets');
    if (fs.existsSync(assetsPath)) {
      console.log('🔍 Assets contents:', fs.readdirSync(assetsPath));
    }
  }
  
  // Initialize scheduler service
  console.log('📅 Initializing automated posting scheduler...');
  schedulerService.init();
  
  // INSTAGRAM DEBUG ON STARTUP
  console.log('\n=== INSTAGRAM ENVIRONMENT CHECK ===');
  console.log('FACEBOOK_PAGE_ID:', process.env.FACEBOOK_PAGE_ID || 'MISSING');
  console.log('INSTAGRAM_BUSINESS_ACCOUNT_ID:', process.env.INSTAGRAM_BUSINESS_ACCOUNT_ID || 'MISSING');
  console.log('FACEBOOK_PAGE_ACCESS_TOKEN:', process.env.FACEBOOK_PAGE_ACCESS_TOKEN ? 'SET' : 'MISSING');
  console.log('INSTAGRAM_ENABLED:', process.env.INSTAGRAM_ENABLED || 'MISSING');
  console.log('===================================\n');
});

// ========================
// 7) UNHANDLED REJECTIONS & GRACEFUL SHUTDOWN
// ========================
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});