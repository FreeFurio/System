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
import authRouter from './routes/auth.routes.mjs';
import notificationRouter from './routes/notification.routes.mjs';
import taskRouter from './routes/task.routes.mjs';
import userRouter from './routes/user.routes.mjs';
import aiRouter from './routes/aiRoutes.mjs';
import socialMediaRouter from './routes/socialMediaRoutes.mjs';
import draftRouter from './routes/draftRoutes.mjs';
import { config } from './config/config.mjs';
import errorHandler from './utils/errorHandler.mjs';
import schedulerService from './services/schedulerService.mjs';
import { createServer } from 'http';
import { Server as SocketIOServer} from 'socket.io';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename);           
const app = express();                           

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
          "wss://*.firebasedatabase.app",
          "https://*.firebasedatabase.app"
        ],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"]
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

// ========================
// STATIC FILES - WITH MIME TYPES
// ========================
app.use(express.static(path.join(__dirname, '../client/dist'), {
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript');
    }
  }
}));
app.get('*', (req, res) => {
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
server.listen(port, () => {
  console.log(`App running on port ${port}...`);
  
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