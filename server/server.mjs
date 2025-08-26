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
import { config } from './config/config.mjs';
import errorHandler from './utils/errorHandler.mjs';
import { createServer } from 'http';
import { Server as SocketIOServer} from 'socket.io';

const __filename = fileURLToPath(import.meta.url); 
const __dirname = dirname(__filename);           
const app = express();                           

// ========================
// 2) GLOBAL MIDDLEWARES
// ========================
app.use(cors({
  origin: ['http://localhost:5173',
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
  max: 1000, 
  windowMs: 15 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in 15 minutes!'
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
// 3) SOCKET.IO SETUP
// ========================
const server = createServer(app);
const io = new SocketIOServer(server , {
  cors: {
    origin: [
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

app.use('/api/v1/auth', authRouter); 
app.use('/api/v1/notifications', notificationRouter);
app.use('/api/v1/tasks', taskRouter);
app.use('/api/v1/users', userRouter);
app.use(express.static(path.join(__dirname, '../client/dist')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/dist/index.html')); 
});

// ========================
// 5) ERROR HANDLING
// ========================
app.all('*', (req, res, next) => {
  res.status(404).json({
    status: 'fail',
    message: `Can't find ${req.originalUrl} on this server!`
  });
});
app.use(errorHandler);

// ========================
// 6) START SERVER
// ========================
const port = config.server.port || 3000;
server.listen(port, () => {
  console.log(`App running on port ${port}...`);
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