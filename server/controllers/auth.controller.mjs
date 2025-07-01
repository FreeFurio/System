// ========================
// 1) IMPORTS & INITIALIZATION
// ========================
// External modules for authentication and hashing
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Import application services and utilities
import { config } from '../config/config.mjs';
import EmailService from '../services/email.service.mjs';
import FirebaseService from '../services/firebase.service.mjs';
import {AppError} from '../utils/errorHandler.mjs';

// ========================
// 2) CONTROLLER FUNCTIONS
// ========================

// ========================
// 2.1) REGISTRATION FLOW
// ========================

/**
 * Validates OTP registration data from the request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with validation results
 */
const validateOTPRegistration = (req, res, next) => {

  console.log('Sending Registration data', {
    ...req.body,
    role: req.body.role
  })

  // Extract data from request body
  const { email, firstName,lastName, username, password, retypePassword, role } = req.body;
  
  // Check if all required fields are provided
  if (!email || !firstName || !lastName || !username || !password || !retypePassword || !role) {
    return next(new AppError('All fields are required', 400));
  }

  console.log('Recieved role:', role);
  const validRoles = ['ContentCreator', 'MarketingLead', 'GraphicDesigner'];
  if (!validRoles.includes(role)) {
    console.log('Valid reoles are:', validRoles);
    return next(new AppError('Invalid role specified', 400));
  }

  // Validate email format using regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }

  // Validate password requirements
  if (password.length < 8) {
    return next(new AppError('Password must be at least 8 characters long', 400));
  }
  
  // Check if passwords match
  if (password !== retypePassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  // Validate role against allowed values
  const allowedRoles = ['ContentCreator', 'MarketingLead', 'GraphicDesigner'];
  if (!allowedRoles.includes(role)) {
    return next(new AppError('Invalid role specified', 400));
  }

  // If all validations pass, proceed to the next middleware
  next();
};

/**
 * Handles OTP registration request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with status and message
 */
const registerOTP = async (req, res, next) => {
  try {
    // Extract user data from request body
    const { email, firstName, lastName, username, password, role } = req.body;
    
    // Check if username is already taken
    const isUsernameTaken = await FirebaseService.isUsernameTaken(username);
    if (isUsernameTaken) {
      return next(new AppError('Username is already taken', 400));
    }

    // Generate a new OTP (One-Time Password)
    const otp = EmailService.generateOTP();
    // Set OTP expiration time (10 minutes from now)
    const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes
    
    // Hash the password for secure storage
    const hashedPassword = await bcrypt.hash(password, 12);

    // Prepare user data for storage
    const userData = {
      email,
      firstName,
      lastName,
      username,
      password: hashedPassword, // Store hashed password
      role,
      otp,
      expiresAt,
      verified: false,
      createdAt: Date.now()
    };

    // Save OTP and user data to Firebase
    await FirebaseService.saveOTP(email, userData);
    
    // Send OTP to user's email
    await EmailService.sendOTPEmail(email, otp);

    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'OTP sent successfully',
      data: {
        email,
        expiresIn: '10 minutes'
      }
    });
  } catch (error) {
    // Pass error to global error handler
    next(error);
  }
};

/**
 * Verifies OTP sent to user's email
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with verification status
 */
const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;

    // Retrieve OTP data from Firebase
    const otpData = await FirebaseService.getOTP(email);
    
    // Check if OTP exists and is not expired
    if (!otpData || otpData.expiresAt < Date.now()) {
      return next(new AppError('OTP is invalid or has expired', 400));
    }

    // Verify OTP matches
    if (otpData.otp !== otp) {
      return next(new AppError('Invalid OTP', 400));
    }

    // Mark OTP as verified
    await FirebaseService.saveOTP(email, { ...otpData, verified: true });

    // Return success response
    res.status(200).json({
      status: 'success',
      message: 'OTP verified successfully',
      data: {
        email,
        verified: true
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Completes user registration with additional details
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with registration status
 */
const completeRegistration = async (req, res, next) => {
  try {
    const { email, contactNumber, city, state, country, zipCode } = req.body;

    // Retrieve and verify OTP data
    const otpData = await FirebaseService.getOTP(email);
    if (!otpData || !otpData.verified) {
      return next(new AppError('Please verify your email first', 400));
    }

    // Prepare complete user data
    const userData = {
      ...otpData,
      contactNumber,
      city,
      state,
      country,
      zipCode,
      registrationCompleted: true,
      registrationDate: new Date().toISOString()
    };

    // Save user to the appropriate role collection
    const userId = await FirebaseService.saveUser(userData);

    // Create admin notification
    /*
    await FirebaseService.createAdminNotification({
      ...userData,
      id: userId
    });*/
    
    // Clean up OTP data after successful registration
    await FirebaseService.deleteOTP(email);

    // Generate JWT token for the new user
    const token = jwt.sign(
      { id: userData.username, role: userData.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Return success response with token
    res.status(201).json({
      status: 'success',
      message: 'Registration completed successfully',
      token,
      data: {
        user: {
          email: userData.email,
          username: userData.username,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: userData.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// 2.2) AUTHENTICATION
// ========================

/**
 * Handles user login
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 * @returns {Object} JSON response with authentication token
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    console.log('Login attempt for username:', username);

    if(!username || !password) {
      return next(new AppError('Please provide username and password!', 400))
    }

    // Find user by username
    const user = await FirebaseService.findUserByUsername(username);
    console.log('User found in database:', user ? 'yes' : 'no');

    if (!user) {
      return next(new AppError('Incorrect username or password', 401));
    }

    console.log('User data from DB:', {
      username: user.username,
      hasPassword: !!user.password,
      role: user.role
    });

    // Verify password
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log('Password check result:', isPasswordCorrect);

    if (!isPasswordCorrect) {
      return next(new AppError('Incorrect username or password', 401));
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

    // Return success response with token
    res.status(200).json({
      status: 'success',
      token,
      data: {
        user: {
          username: user.username,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// ========================
// 3) EXPORTS
// ========================

export {
  registerOTP,
  verifyOTP,
  completeRegistration,
  login,
  validateOTPRegistration
};
