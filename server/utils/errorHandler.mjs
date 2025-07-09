// ========================
// 1) ERROR HANDLER MIDDLEWARE
// ========================

/**
 * Global error handling middleware for Express applications
 * This middleware handles different types of errors and sends appropriate responses
 * based on the environment (development/production)
 * 
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const errorHandler = (err, req, res, next) => {
  // Set default status code to 500 (Internal Server Error) if not provided
  err.statusCode = err.statusCode || 500;
  // Set default status to 'error' if not provided
  err.status = err.status || 'error';

  // Log detailed error information in development environment
  if (process.env.NODE_ENV === 'development') {
    console.error('ERROR ', err);
    // Send detailed error response in development
    sendErrorDev(err, req, res);
  } else {
    // In production, create a sanitized error object to prevent leaking sensitive information
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types with custom error messages
    if (error.code === 11000) error = handleDuplicateFieldDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    // Send appropriate error response in production
    sendErrorProd(error, req, res);
  }
};

// ========================
// 2) ERROR TYPE HANDLERS
// ========================

/**
 * Handles MongoDB duplicate field errors (error code 11000)
 * Extracts the duplicate field value and returns a user-friendly error message
 * 
 * @param {Object} err - The error object from MongoDB
 * @returns {AppError} A new AppError instance with a descriptive message
 */
const handleDuplicateFieldDB = err => {
  // Extract the duplicate field value from the error message
  const value = err.errmsg.match(/([\"\'][^\0]*?[\"\'])/)[0];
  // Create a user-friendly error message
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new AppError(message, 400);
};

/**
 * Handles MongoDB validation errors
 * Extracts all validation error messages and combines them into a single message
 * 
 * @param {Object} err - The validation error object from Mongoose
 * @returns {AppError} A new AppError instance with combined validation messages
 */
const handleValidationErrorDB = err => {
  // Extract all validation error messages
  const errors = Object.values(err.errors).map(el => el.message);
  // Combine all error messages into a single string
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

/**
 * Handles JWT (JSON Web Token) errors
 * Returns a standardized error for invalid JWT tokens
 * 
 * @returns {AppError} A new AppError instance with JWT error message
 */
const handleJWTError = () =>
  new AppError('Invalid token. Please log in again!', 401);

/**
 * Handles expired JWT tokens
 * Returns a standardized error for expired JWT tokens
 * 
 * @returns {AppError} A new AppError instance with token expired message
 */
const handleJWTExpiredError = () =>
  new AppError('Your token has expired! Please log in again.', 401);

/**
 * Handles MongoDB cast errors (e.g., invalid ObjectId)
 * 
 * @param {Object} err - The cast error object from MongoDB
 * @returns {AppError} A new AppError instance with cast error message
 */
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400);
};

// ========================
// 3) ERROR RESPONSE FORMATTERS
// ========================

/**
 * Sends detailed error response in development environment
 * Includes stack trace and full error object for debugging
 * 
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendErrorDev = (err, req, res) => {
  // API error response
  if (req.originalUrl.startsWith('/api')) {
    return res.status(err.statusCode).json({
      status: err.status,
      error: err,
      message: err.message,
      stack: err.stack  // Include stack trace in development
    });
  }
  
  // Rendered website error (for server-side rendered pages)
  console.error('ERROR ', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: err.message
  });
};

/**
 * Sends minimal error response in production environment
 * Prevents leaking sensitive error information to clients
 * 
 * @param {Error} err - The error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const sendErrorProd = (err, req, res) => {
  // API error response
  if (req.originalUrl.startsWith('/api')) {
    // Operational, trusted error: send message to client
    if (err.isOperational) {
      return res.status(err.statusCode).json({
        status: err.status,
        message: err.message
      });
    }
    
    // Programming or other unknown error: don't leak error details
    console.error('ERROR ', err);
    return res.status(500).json({
      status: 'error',
      message: 'Something went very wrong!'
    });
  }
  
  // Rendered website error
  if (err.isOperational) {
    return res.status(err.statusCode).render('error', {
      title: 'Something went wrong!',
      msg: err.message
    });
  }
  
  // Programming or other unknown error: show generic error page
  console.error('ERROR ', err);
  return res.status(err.statusCode).render('error', {
    title: 'Something went wrong!',
    msg: 'Please try again later.'
  });
};

// ========================
// 4) CUSTOM ERROR CLASS
// ========================

/**
 * Custom Error class for operational errors
 * Operational errors are errors that we can predict might happen (e.g., invalid user input)
 * as opposed to programming errors (bugs) that we don't expect to happen
 */
class AppError extends Error {
  /**
   * Create a new AppError
   * @param {string} message - Error message
   * @param {number} statusCode - HTTP status code
   */
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    // Status is 'fail' for 4xx errors, 'error' for 5xx errors
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    // Mark as operational error (trusted error that we can send to client)
    this.isOperational = true;
    // Capture stack trace, excluding constructor call from it
    Error.captureStackTrace(this, this.constructor);
  }
}

// ========================
// 5) EXPORTS
// ========================

export default errorHandler;
export { AppError };
