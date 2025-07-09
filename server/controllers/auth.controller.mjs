// ========================
// 1) IMPORTS & INITIALIZATION
// ========================

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { config } from '../config/config.mjs';
import EmailService from '../services/email.service.mjs';
import FirebaseService from '../services/firebase.service.mjs';
import { AppError } from '../utils/errorHandler.mjs';

// ========================
// 2) CONTROLLER FUNCTIONS
// ========================

// ========================
// 2.1) REGISTRATION FLOW
// ========================

const validateOTPRegistration = (req, res, next) => {
  const { email, firstName, lastName, username, password, retypePassword, role } = req.body;

  if (!email || !firstName || !lastName || !username || !password || !retypePassword || !role) {
    return next(new AppError('All fields are required', 400));
  }

  const validRoles = ['ContentCreator', 'MarketingLead', 'GraphicDesigner'];

  if (!validRoles.includes(role)) {
    console.log('Valid reoles are:', validRoles);
    return next(new AppError('Invalid role specified', 400));
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return next(new AppError('Please provide a valid email address', 400));
  }
  if (password.length < 8) {
    return next(new AppError('Password must be at least 8 characters long', 400));
  }
  if (password !== retypePassword) {
    return next(new AppError('Passwords do not match', 400));
  }

  const allowedRoles = ['ContentCreator', 'MarketingLead', 'GraphicDesigner'];

  if (!allowedRoles.includes(role)) {
    return next(new AppError('Invalid role specified', 400));
  }
  next();
};


const registerOTP = async (req, res, next) => {
  try {

    const { email, firstName, lastName, username, password, role } = req.body;
    const isUsernameTaken = await FirebaseService.isUsernameTaken(username);

    if (isUsernameTaken) {
      return next(new AppError('Username is already taken', 400));
    }

    const otp = EmailService.generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const hashedPassword = await bcrypt.hash(password, 12);
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
      createdAt: Date.now()
    };

    await FirebaseService.saveOTP(email, userData);
    await EmailService.sendOTPEmail(email, otp);

    res.status(200).json({
      status: 'success',
      message: 'OTP sent successfully',
      data: {
        email,
        expiresIn: '10 minutes'
      }
    });
  } catch (error) {
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    const otpData = await FirebaseService.getOTP(email);

    if (!otpData || otpData.expiresAt < Date.now()) {
      return next(new AppError('OTP is invalid or has expired', 400));
    }
    if (otpData.otp !== otp) {
      return next(new AppError('Invalid OTP', 400));
    }

    await FirebaseService.saveOTP(email, { ...otpData, verified: true });

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

const completeRegistration = async (req, res, next) => {
  try {
    const { email, contactNumber, city, state, country, zipCode } = req.body;
    const otpData = await FirebaseService.getOTP(email);

    if (!otpData || !otpData.verified) {
      return next(new AppError('Please verify your email first', 400));
    }

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
    const userId = await FirebaseService.saveUser(userData);
    io.emit('accountApproved', {
      id: userId,
      ...userData
    });


    const notifId = await FirebaseService.createAdminNotification({
      type: "approval_needed",
      message: "A new account needs approval.",
      read: false,
      timestamp: Date.now(),
      user: {
        ...userData,
        id: userId
      }
    });
    io.emit('notificationAdmin', {
      id: notifId,
      type: "approval_needed",
      message: "A new account needs approval.",
      read: false,
      timestamp: Date.now(),
      user: {
        ...userData,
        id: userId
      }
    })

    await FirebaseService.deleteOTP(email);

    const token = jwt.sign(
      { id: userData.username, role: userData.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

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

const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    if (!username || !password) {
      return next(new AppError('Please provide username and password!', 400))
    }

    const user = await FirebaseService.findUserByUsername(username);
    console.log('User found in database:', user ? 'yes' : 'no');
    console.log('User data from DB:', {
      username: user.username,
      hasPassword: !!user.password,
      role: user.role
    });

    if (!user) {
      return next(new AppError('Incorrect username or password', 401));
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    console.log('Password check result:', isPasswordCorrect);

    if (!isPasswordCorrect) {
      return next(new AppError('Incorrect username or password', 401));
    }

    const token = jwt.sign(
      { id: user.username, role: user.role },
      config.jwt.secret,
      { expiresIn: config.jwt.expiresIn }
    );

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
// 3) APPROVAL OF ACCOUNTS // gawin tomorrow
// ========================
const getApprovalAccount = (req, res, next) => {
  try {

  } catch (error) {

  }
}

// ========================
// 4) EXPORTS
// ========================

export {
  registerOTP,
  verifyOTP,
  completeRegistration,
  login,
  validateOTPRegistration,
};
