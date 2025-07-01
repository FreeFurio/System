// ========================
// 1) IMPORTS & INITIALIZATION
// ========================
// Express framework for creating the router
import express from 'express';
// Import controller methods for handling authentication logic
import { 
  registerOTP, 
  verifyOTP, 
  completeRegistration, 
  login,
  validateOTPRegistration 
} from '../controllers/auth.controller.mjs';
// Express validator for request validation
import { body } from 'express-validator';

// Create a new router instance
const router = express.Router();

// ========================
// 2) ROUTE DEFINITIONS
// ========================

// ========================
// 2.1) REGISTRATION FLOW
// ========================

/**
 * @route   POST /api/v1/auth/otp/send
 * @desc    Register a new user and send OTP to their email
 * @access  Public
 * @param   {string} email - User's email address
 * @param   {string} firstName - User's first name
 * @param   {string} lastName - User's last name
 * @param   {string} username - Desired username
 * @param   {string} password - User's password
 * @param   {string} retypePassword - Password confirmation
 * @param   {string} role - User's role (e.g., 'ContentCreator')
 */
router.post(
  '/otp/send',
  validateOTPRegistration,  // Middleware to validate OTP registration data
  registerOTP             // Controller to handle OTP registration
);

/**
 * @route   POST /api/v1/auth/otp/verify
 * @desc    Verify OTP sent to user's email
 * @access  Public
 * @param   {string} email - User's email address
 * @param   {string} otp - 6-digit OTP received via email
 */
router.post(
  '/otp/verify',
  [
    // Validate email format and normalize
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    // Validate OTP format (6 digits)
    body('otp')
      .notEmpty()
      .withMessage('OTP is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
  ],
  verifyOTP  // Controller to handle OTP verification
);

/**
 * @route   POST /api/v1/auth/register/complete
 * @desc    Complete user registration with additional details
 * @access  Public
 * @param   {string} email - User's email address (must match OTP verification)
 * @param   {string} contactNumber - User's contact number
 * @param   {string} city - User's city
 * @param   {string} state - User's state/province
 * @param   {string} country - User's country
 * @param   {string} zipCode - User's postal/zip code
 */
router.post(
  '/register/complete',
  [
    // Validate and normalize email
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email')
      .normalizeEmail(),
    // Validate required fields
    body('contactNumber')
      .notEmpty()
      .withMessage('Contact number is required'),
    body('city')
      .notEmpty()
      .withMessage('City is required'),
    body('state')
      .notEmpty()
      .withMessage('State is required'),
    body('country')
      .notEmpty()
      .withMessage('Country is required'),
    body('zipCode')
      .notEmpty()
      .withMessage('ZIP code is required')
  ],
  completeRegistration  // Controller to complete registration
);

// ========================
// 2.2) AUTHENTICATION
// ========================

/**
 * @route   POST /api/v1/auth/login
 * @desc    Authenticate user and return user data
 * @access  Public
 * @param   {string} username - User's username
 * @param   {string} password - User's password
 */
router.post(
  '/login',
  [
    // Validate username and password
    body('username')
      .trim()  // Remove whitespace
      .notEmpty()
      .withMessage('Username is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  login  // Controller to handle user login
);

// ========================
// 3) EXPORTS
// ========================

export default router;
