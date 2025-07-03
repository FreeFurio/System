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

const __filename = fileURLToPath(import.meta.url); // Gets the absolute path of the current file. Example: 'C:/Users/yourname/project/server/server.mjs'
const __dirname = dirname(__filename);             // Gets the directory name of the current file. Example: 'C:/Users/yourname/project/server'
const app = express();                             // Creates an Express application instance. Example: Express app object

// ========================
// 2) GLOBAL MIDDLEWARES
// ========================

// Enable CORS (Cross-Origin Resource Sharing) middleware
app.use(cors({
  origin: ['http://localhost:5173',
    'https://system-production-9942.up.railway.app'
  ], // Only allow requests from this origin (frontend URL as a string, e.g., 'http://localhost:5173')
  credentials: true                 // Allow cookies and credentials to be sent in requests (Boolean: true or false)
}));


app.use(
  helmet({  // Adds security-related HTTP headers to responses
    contentSecurityPolicy: {
      directives: {    // Object specifying Content Security Policy rules
        defaultSrc: ["'self'"], // Only allow resources from the same origin (Array of allowed sources, here just "'self'")
        connectSrc: [           // Allowed endpoints for AJAX, WebSocket, etc. (Array: "'self'", "wss://*.firebasedatabase.app", "https://*.firebasedatabase.app")
          "'self'",
          "wss://*.firebasedatabase.app",
          "https://*.firebasedatabase.app"
        ],
        scriptSrc: [            // Allowed sources for JavaScript (Array: "'self'", "https://*.firebasedatabase.app")
          "'self'",
          "https://*.firebasedatabase.app"
        ],
      },
    },
  })
);
if (process.env.NODE_ENV === 'development') { // Checks if the environment variable NODE_ENV is set to 'development' (e.g., 'development', 'production', or 'test')
  app.use(morgan('dev'));  // Adds HTTP request logging middleware in 'dev' format (shows concise colored output for development)
}

const limiter = rateLimit({
  max: 100,  // Maximum number of requests allowed per windowMs from a single IP. Example: 100
  windowMs: 60 * 60 * 1000,  // Time window for rate limiting in milliseconds. Example: 3600000 (1 hour)
  message: 'Too many requests from this IP, please try again in an hour!' // Message sent when rate limit is exceeded. Example: string message
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
    ] // List of query parameters allowed to appear multiple times in the URL. Example: array of strings
  })
);
app.use(express.static(path.join(__dirname, 'public'))); // Serve static files from the 'public' directory; data: absolute path to 'public' (e.g., 'C:/Users/yourname/project/server/public')
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString(); // Add a 'requestTime' property to the request object; data: ISO 8601 timestamp string (e.g., '2024-06-20T12:34:56.789Z')
  next(); // Pass control to the next middleware function
});

// ========================
// 3) ROUTES
// ========================
app.use('/api/v1/auth', authRouter); // Mounts the authentication router on the '/api/v1/auth' path. Example: '/api/v1/auth', authRouter object
app.use(express.static(path.join(__dirname, '../client/dist'))); // Serves static files from the client build directory. Example: absolute path to '../client/dist'
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html')); // Sends the React app's index.html file for any unmatched route. Example: absolute path to 'index.html'
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