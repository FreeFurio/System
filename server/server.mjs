// ========================
// 1) IMPORTS & CONFIGURATION
// ========================
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import express from 'express';         // Web framework for Node.js
import cors from 'cors';               // Middleware for enabling CORS
import morgan from 'morgan';           // HTTP request logger
import rateLimit from 'express-rate-limit'; // Rate limiting middleware
import helmet from 'helmet';           // Security headers middleware
import mongoSanitize from 'express-mongo-sanitize'; // Sanitizes user-supplied data
import xss from 'xss-clean';           // Sanitize user input coming from POST body, GET queries, and url params
import hpp from 'hpp';                 // Protects against HTTP Parameter Pollution attacks
import authRouter from './routes/auth.routes.mjs';
import { config } from './config/config.mjs';
import errorHandler from './utils/errorHandler.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const app = express();

// ========================
// 2) GLOBAL MIDDLEWARES
// ========================
app.use(cors({
  origin: 'http://localhost:5173',  
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
        scriptSrc: [
          "'self'",
          "https://*.firebasedatabase.app"
        ],
      },
    },
  })
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));  
}

const limiter = rateLimit({
  max: 100,  
  windowMs: 60 * 60 * 1000,  
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);  
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
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
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ========================
// 3) ROUTES
// ========================
app.use('/api/v1/auth', authRouter);
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ========================
// 4) ERROR HANDLING
// ========================
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});
app.use(errorHandler);

// ========================
// 5) START SERVER
// ========================
const port = config.server.port || 3000;
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// ========================
// 6) UNHANDLED REJECTIONS & GRACEFUL SHUTDOWN
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