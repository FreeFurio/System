// ========================
// 1) IMPORTS & INITIALIZATION
// ========================

import express from 'express';
import { 
  registerOTP, 
  verifyOTP, 
  completeRegistration, 
  login,
  validateOTPRegistration,
} from '../controllers/auth.controller.mjs';
import { body } from 'express-validator';

const router = express.Router();

// ========================
// 2) ROUTE DEFINITIONS
// ========================

// ========================
// 2.1) REGISTRATION FLOW
// ========================

router.post(
  '/otp/send',
  validateOTPRegistration, 
  registerOTP             
);

router.post(
  '/otp/verify',
  [
    body('username')
      .notEmpty()
      .withMessage('Username is required'),
    body('otp')
      .notEmpty()
      .withMessage('OTP is required')
      .isLength({ min: 6, max: 6 })
      .withMessage('OTP must be 6 digits')
  ],
  verifyOTP  
);

router.post(
  '/register/complete',
  [
    body('username')
      .notEmpty()
      .withMessage('Username is required'),
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
  completeRegistration  
);

// ========================
// 2.2) AUTHENTICATION
// ========================
router.post(
  '/login',
  [
    body('username')
      .trim()  
      .notEmpty()
      .withMessage('Username is required'),
    body('password')
      .notEmpty()
      .withMessage('Password is required')
  ],
  login  
);

// ========================
// 3) EXPORTS
// ========================
export default router;
