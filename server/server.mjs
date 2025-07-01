// ========================
// 1) IMPORTS & CONFIGURATION
// ========================
// Core Node.js modules for file and directory paths
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Third-party middleware for Express.js
import express from 'express';         // Web framework for Node.js
import cors from 'cors';               // Middleware for enabling CORS
import morgan from 'morgan';           // HTTP request logger
import rateLimit from 'express-rate-limit'; // Rate limiting middleware
import helmet from 'helmet';           // Security headers middleware
import mongoSanitize from 'express-mongo-sanitize'; // Sanitizes user-supplied data
import xss from 'xss-clean';           // Sanitize user input coming from POST body, GET queries, and url params
import hpp from 'hpp';                 // Protects against HTTP Parameter Pollution attacks

// Application routes
import authRouter from './routes/auth.routes.mjs';

// Configuration
import { config } from './config/config.mjs';

// Error handling utilities
import errorHandler from './utils/errorHandler.mjs';

// Initialize __dirname for ES modules (since it's not available by default in ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Express application
const app = express();

// ========================
// 2) GLOBAL MIDDLEWARES
// ========================

// Enable CORS (Cross-Origin Resource Sharing)
// This allows requests from the frontend running on port 5173
app.use(cors({
  origin: 'http://localhost:5173',  // Frontend URL
  credentials: true  // Allow cookies to be sent with requests
}));

// Set security HTTP headers using helmet
// This adds various security headers to protect against common web vulnerabilities
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
        // You can add other directives as needed
      },
    },
  })
);

// Development logging
// Only log HTTP requests in development environment
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));  // Logs request details to console
}

// Rate limiting
// Limits the number of requests from a single IP to prevent abuse
const limiter = rateLimit({
  max: 100,  // Maximum 100 requests per hour
  windowMs: 60 * 60 * 1000,  // Time window: 1 hour
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use('/api', limiter);  // Apply rate limiting to all API routes

// Body parser middleware
// Parses incoming request bodies in JSON format (up to 10kb)
app.use(express.json({ limit: '10kb' }));
// Parses URL-encoded bodies (for form submissions)
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
// Removes any keys containing prohibited characters ($ and .)
app.use(mongoSanitize());

// Data sanitization against XSS (Cross-Site Scripting)
// Cleans user input from malicious HTML code
app.use(xss());

// Prevent parameter pollution
// Cleans up duplicate query parameters
app.use(
  hpp({
    whitelist: [  // Fields that can be duplicated in query parameters
      'duration',
      'ratingsQuantity',
      'ratingsAverage',
      'maxGroupSize',
      'difficulty',
      'price'
    ]
  })
);

// Serve static files from the 'public' directory
// Files in this directory can be accessed directly via URL
app.use(express.static(path.join(__dirname, 'public')));

// Custom middleware to add request timestamp
// This adds a 'requestTime' property to the request object
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// ========================
// 3) ROUTES
// ========================
// Mount the authentication routes under /api/v1/auth
app.use('/api/v1/auth', authRouter);

// Serve static files from the Vite build output
app.use(express.static(path.join(__dirname, '../client/dist')));

// For all other routes, serve index.html (for SPA routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html'));
});

// ========================
// 4) ERROR HANDLING
// ========================

// Handle 404 Not Found errors
// This middleware catches all routes that don't match any defined routes
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});

// Global error handling middleware
// This will catch any errors that occur in route handlers
app.use(errorHandler);

// ========================
// 5) START SERVER
// ========================
// Get the port from environment variables or use 3000 as default
const port = config.server.port || 3000;

// Start the Express server
const server = app.listen(port, () => {
  console.log(`App running on port ${port}...`);
});

// ========================
// 6) UNHANDLED REJECTIONS & GRACEFUL SHUTDOWN
// ========================

// Handle unhandled promise rejections
// This catches any unhandled promise rejections that might occur
process.on('unhandledRejection', err => {
  console.log('UNHANDLED REJECTION! Shutting down...');
  console.log(err.name, err.message);
  // Close the server gracefully before exiting
  server.close(() => {
    process.exit(1);  // Exit with failure
  });
});

// Handle SIGTERM signal for graceful shutdown
// This allows the server to complete any pending requests before shutting down
process.on('SIGTERM', () => {
  console.log('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    console.log('Process terminated!');
  });
});