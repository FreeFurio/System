import jwt from 'jsonwebtoken';
import { config } from '../config/config.mjs';
import { AppError } from '../utils/errorHandler.mjs';
import sessionService from '../services/session.service.mjs';

// Verify JWT token and session
export const authenticate = async (req, res, next) => {
  try {
    // Get token from header
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return next(new AppError('You are not logged in. Please log in to access.', 401));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, config.jwt.secret);

    // Get session ID from token or header
    const sessionId = req.headers['x-session-id'] || decoded.sessionId;

    if (!sessionId) {
      return next(new AppError('Session not found. Please log in again.', 401));
    }

    // Validate session in Redis
    const session = await sessionService.getSession(sessionId);
    if (!session) {
      return next(new AppError('Your session has expired. Please log in again.', 401));
    }

    // Verify user ID matches
    if (session.userId !== decoded.id) {
      return next(new AppError('Invalid session. Please log in again.', 401));
    }

    // Attach user data to request
    req.user = {
      id: session.userId,
      username: session.username,
      email: session.email,
      role: session.role,
      firstName: session.firstName,
      lastName: session.lastName,
      profilePicture: session.profilePicture
    };
    req.sessionId = sessionId;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return next(new AppError('Invalid token. Please log in again.', 401));
    }
    if (error.name === 'TokenExpiredError') {
      return next(new AppError('Your token has expired. Please log in again.', 401));
    }
    next(error);
  }
};

// Check if user has required role
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('You are not logged in.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError('You do not have permission to perform this action.', 403));
    }

    next();
  };
};
