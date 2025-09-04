// ========================
// 1) IMPORTS & INITIALIZATION
// ========================

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/config.mjs';
import EmailService from '../services/email.service.mjs';
import FirebaseService from '../services/firebase.service.mjs';
import {AppError} from '../utils/errorHandler.mjs';
import { io } from '../server.mjs';

// ========================
// 2) CONTROLLER FUNCTIONS
// ========================

// ========================
// 2.1) REGISTRATION FLOW
// ========================

const validateOTPRegistration = async (req, res, next) => {
  console.log('🔍 validateOTPRegistration called with body:', req.body);
  const { email, firstName, lastName, username, password, retypePassword, role } = req.body;
  
  if (!email || !firstName || !lastName || !username || !password || !retypePassword || !role) {
    console.log('❌ validateOTPRegistration - Missing required fields');
    return next(new AppError('All fields are required', 400));
  }

  const validRoles = ['ContentCreator', 'MarketingLead', 'GraphicDesigner'];
  if (!validRoles.includes(role)) {
    console.log('❌ validateOTPRegistration - Invalid role:', role, 'Valid roles are:', validRoles);
    return next(new AppError('Invalid role specified', 400));
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    console.log('❌ validateOTPRegistration - Invalid email format:', email);
    return next(new AppError('Please provide a valid email address', 400));
  }

  if (password !== retypePassword) {
    console.log('❌ validateOTPRegistration - Passwords do not match');
    return next(new AppError('Passwords do not match', 400));
  }

  // Get password policies from Firebase
  try {
    const { ref, get } = await import('firebase/database');
    const { getDatabase } = await import('firebase/database');
    const { initializeApp } = await import('firebase/app');
    const { config } = await import('../config/config.mjs');
    
    const app = initializeApp(config.firebase);
    const db = getDatabase(app, config.firebase.databaseURL);
    const policiesRef = ref(db, 'systemSettings/passwordPolicies');
    const snapshot = await get(policiesRef);
    
    const policies = snapshot.exists() ? snapshot.val() : {
      minPasswordLength: 8,
      requireUppercase: true,
      requireLowercase: true,
      requireNumbers: true,
      requireSpecialChars: false
    };
    
    // Validate password against policies
    if (password.length < policies.minPasswordLength) {
      return next(new AppError(`Password must be at least ${policies.minPasswordLength} characters long`, 400));
    }
    
    if (policies.requireUppercase && !/[A-Z]/.test(password)) {
      return next(new AppError('Password must contain at least one uppercase letter (A-Z)', 400));
    }
    
    if (policies.requireLowercase && !/[a-z]/.test(password)) {
      return next(new AppError('Password must contain at least one lowercase letter (a-z)', 400));
    }
    
    if (policies.requireNumbers && !/[0-9]/.test(password)) {
      return next(new AppError('Password must contain at least one number (0-9)', 400));
    }
    
    if (policies.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return next(new AppError('Password must contain at least one special character (!@#$%^&*)', 400));
    }
  } catch (error) {
    console.log('⚠️ Error loading password policies, using defaults:', error.message);
    if (password.length < 8) {
      return next(new AppError('Password must be at least 8 characters long', 400));
    }
  }

  console.log('✅ validateOTPRegistration - All validations passed');
  next();
};


const registerOTP = async (req, res, next) => {
  console.log('📧 registerOTP called with body:', req.body);
  try {
    const { email, firstName, lastName, username, password, role } = req.body;
    console.log('📧 registerOTP extracted fields:', { email, firstName, lastName, username, role });
    
    if (!email || !firstName || !lastName || !username || !password || !role) {
      console.log('❌ registerOTP - Missing required fields');
      return next(new AppError('All fields are required', 400));
    }

    console.log('📧 registerOTP - Checking if username is taken:', username);
    const isUsernameTaken = await FirebaseService.isUsernameTaken(username);
    if (isUsernameTaken) {
      console.log('❌ registerOTP - Username is already taken:', username);
      return next(new AppError('Username is already taken', 400));
    }
    console.log('✅ registerOTP - Username is available:', username);

    console.log('📧 registerOTP - Generating OTP');
    const otp = EmailService.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
    console.log('📧 registerOTP - Generated OTP:', otp, 'Type:', typeof otp, 'expires at:', expiresAt);
    
    console.log('📧 registerOTP - Hashing password');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('📧 registerOTP - Password hashed successfully');
    
    const userData = {
      email,
      firstName,
      lastName,
      username,
      password: hashedPassword, 
      role,
      otp,
      expiresAt,
      verified: false,
      createdAt: new Date().toISOString()
    };
    console.log('📧 registerOTP - User data prepared:', { ...userData, password: '[HIDDEN]', otp: '[HIDDEN]' });

    console.log('📧 registerOTP - Saving OTP to Firebase');
    await FirebaseService.saveOTP(username, userData);
    
    console.log('📧 registerOTP - Sending OTP email');
    await EmailService.sendOTPEmail(email, otp);
    console.log('📧 registerOTP - OTP email sent successfully');

    console.log('✅ registerOTP - Registration OTP process completed successfully');
    res.status(200).json({
      status: 'success',
      message: 'OTP sent successfully',
      data: {
        email,
        expiresIn: '10 minutes'
      }
    });
  } catch (error) {
    console.error('❌ registerOTP - Error occurred:', error);
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  console.log('🔐 verifyOTP called with body:', req.body);
  try {
    const { username, otp } = req.body;
    console.log('🔐 verifyOTP extracted fields:', { username, otp });
    
    if (!otp) {
      console.log('❌ verifyOTP - Missing OTP');
      return next(new AppError('All fields are required', 400));
    }

    console.log('🔐 verifyOTP - Getting OTP data from Firebase');
    const otpData = await FirebaseService.getOTP(username);
    
    if (!otpData) {
      console.log('❌ verifyOTP - No OTP data found for username:', username);
      return next(new AppError('OTP is invalid or has expired', 400));
    }
    
    console.log('🔐 verifyOTP - OTP data found, checking expiration');
    const currentTime = Date.now();
    const expirationTime = new Date(otpData.expiresAt).getTime();
    console.log('🔐 verifyOTP - Current time:', new Date(currentTime), 'Expiration time:', new Date(expirationTime));
    
    if (expirationTime < currentTime) {
      console.log('❌ verifyOTP - OTP has expired');
      return next(new AppError('OTP is invalid or has expired', 400));
    }
    
    console.log('🔐 verifyOTP - Comparing OTP values');
    console.log('🔐 verifyOTP - Expected OTP:', otpData.otp, 'Type:', typeof otpData.otp);
    console.log('🔐 verifyOTP - Received OTP:', otp, 'Type:', typeof otp);
    
    if (otpData.otp !== otp) {
      console.log('❌ verifyOTP - OTP mismatch. Expected:', otpData.otp, 'Received:', otp);
      return next(new AppError('Invalid OTP', 400));
    }
    
    console.log('✅ verifyOTP - OTP is valid, marking as verified');
    await FirebaseService.saveOTP(username, { ...otpData, verified: true });
    console.log('✅ verifyOTP - OTP verification completed successfully');

    res.status(200).json({
      status: 'success',
      message: 'OTP verified successfully',
      data: {
        username,
        verified: true
      }
    });
  } catch (error) {
    console.error('❌ verifyOTP - Error occurred:', error);
    next(error);
  }
};

const completeRegistration = async (req, res, next) => {
  console.log('🏁 completeRegistration called with body:', req.body);
  try {
    const { username, contactNumber, city, state, country, zipCode } = req.body;
    console.log('🏁 completeRegistration extracted fields:', { username, contactNumber, city, state, country, zipCode });
    
    if (!username || !contactNumber || !city || !state || !country || !zipCode) {
      console.log('❌ completeRegistration - Missing required fields');
      return next(new AppError('All fields are required', 400));
    }
    
    console.log('🏁 completeRegistration - Getting OTP data to verify username');
    const otpData = await FirebaseService.getOTP(username);
    if (!otpData || !otpData.verified) {
      console.log('❌ completeRegistration - Username not verified or OTP data not found');
      return next(new AppError('Please verify your username first', 400));
    }
    console.log('✅ completeRegistration - Username verification confirmed');

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
    console.log('🏁 completeRegistration - Complete user data prepared:', { ...userData, password: '[HIDDEN]' });
    
    console.log('🏁 completeRegistration - Saving user to ApprovalofAccounts');
    const userId = await FirebaseService.saveUser(userData);
    console.log('✅ completeRegistration - User saved with ID:', userId);
    
    console.log('🏁 completeRegistration - Emitting Socket.IO accountApproved event');
    io.emit('accountApproved', {
      id: userId,
      ...userData
    });

    console.log('🏁 completeRegistration - Creating admin notification');
    const notifId = await FirebaseService.createAdminNotification({
      type: "approval_needed",
      message: "A new account needs approval.",
      read: false,
      timestamp: new Date().toISOString(),
      user: {
        ...userData,
        id: userId
      }
    });
    console.log('✅ completeRegistration - Admin notification created with ID:', notifId);

    console.log('🏁 completeRegistration - Emitting Socket.IO notificationAdmin event');
    io.emit('notificationAdmin', {
      id: notifId,
      type: "approval_needed",
      message: "A new account needs approval.",
      read: false,
      timestamp: new Date().toISOString(),
      user: {
        ...userData,
        id: userId
      }
    });

    console.log('🏁 completeRegistration - Cleaning up OTP data');
    await FirebaseService.deleteOTP(username);
    console.log('✅ completeRegistration - OTP data deleted');

    console.log('🏁 completeRegistration - Generating JWT token');
    const token = jwt.sign(
      { id: userData.username, role: userData.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    console.log('✅ completeRegistration - JWT token generated');

    console.log('🎉 completeRegistration - Registration completed successfully for user:', userData.username);
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
    console.error('❌ completeRegistration - Error occurred:', error);
    next(error);
  }
};

// ========================
// 2.2) AUTHENTICATION
// ========================

const login = async (req, res, next) => {
  console.log('🔑 login called with body:', { username: req.body.username, password: '[HIDDEN]' });
  try {
    const { username, password } = req.body;
    console.log('🔑 login extracted username:', username);
    
    if(!username || !password) {
      console.log('❌ login - Missing username or password');
      return next(new AppError('Please provide username and password!', 400))
    }

    // Check login security settings
    const securitySettings = await FirebaseService.getLoginSecuritySettings();
    
    // Check if account is locked
    const lockoutStatus = await FirebaseService.checkAccountLockout(username);
    if (lockoutStatus.isLocked) {
      const remainingTime = Math.ceil((lockoutStatus.unlockTime - Date.now()) / (1000 * 60));
      console.log('🔒 login - Account locked:', username, 'for', remainingTime, 'minutes');
      return next(new AppError(`Account is locked. Try again in ${remainingTime} minutes.`, 423));
    }

    console.log('🔑 login - Finding user by username');
    const user = await FirebaseService.findUserByUsername(username);
    if (!user) {
      console.log('❌ login - User not found:', username);
      await FirebaseService.recordFailedAttempt(username, securitySettings);
      return next(new AppError('Incorrect username or password', 401));
    }
    console.log('✅ login - User found:', user?.username || 'unknown', 'with role:', user.role);
    
    if (!user.password) {
      console.log('❌ login - User has no password field:', username);
      return next(new AppError('Account configuration error. Please contact administrator.', 500));
    }

    console.log('🔑 login - Comparing password');
    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      console.log('❌ login - Password incorrect for user:', username);
      await FirebaseService.recordFailedAttempt(username, securitySettings);
      return next(new AppError('Incorrect username or password', 401));
    }
    console.log('✅ login - Password correct');
    
    // Clear failed attempts on successful login
    await FirebaseService.clearFailedAttempts(username);

    // Check if password reset is required
    if (user.forcePasswordReset) {
      console.log('🔒 login - Password reset required for user:', username);
      return res.status(200).json({
        status: 'password_reset_required',
        message: 'Password reset required. Please change your password.',
        data: {
          username: user.username,
          requiresPasswordReset: true
        }
      });
    }

    // Update last login timestamp
    await FirebaseService.updateUserLastLogin(user.username, user.role);

    console.log('🔑 login - Generating JWT token');
    const token = jwt.sign(
      { id: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );
    console.log('✅ login - JWT token generated');

    console.log('🎉 login - Login successful for user:', user.username);
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
    console.error('❌ login - Error occurred:', error);
    next(error);
  }
};


// ========================
// 2.3) PASSWORD RESET
// ========================

const resetPassword = async (req, res, next) => {
  console.log('🔒 resetPassword called with body:', { username: req.body.username, newPassword: '[HIDDEN]' });
  try {
    const { username, newPassword, confirmPassword } = req.body;
    
    if (!username || !newPassword || !confirmPassword) {
      return next(new AppError('All fields are required', 400));
    }
    
    if (newPassword !== confirmPassword) {
      return next(new AppError('Passwords do not match', 400));
    }
    
    if (newPassword.length < 8) {
      return next(new AppError('Password must be at least 8 characters long', 400));
    }
    
    const user = await FirebaseService.findUserByUsername(username);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    
    // Update password and clear forcePasswordReset flag
    const safeUsername = username.toLowerCase();
    const userRef = `${user.role}/${safeUsername}`;
    
    await FirebaseService.updateUserPassword(userRef, hashedPassword);
    
    console.log('✅ resetPassword - Password updated successfully for user:', username);
    
    res.status(200).json({
      status: 'success',
      message: 'Password updated successfully'
    });
  } catch (error) {
    console.error('❌ resetPassword - Error occurred:', error);
    next(error);
  }
};

// ========================
// 4) EXPORTS

// ========================

export {
  registerOTP,
  verifyOTP,
  completeRegistration,
  login,
  validateOTPRegistration,
  resetPassword,

};
