// ========================
// CODE STRUCTURE REFERENCE WITH CONTEXTUAL PURPOSES
// ========================
// This file summarizes common code patterns and structures used in the backend codebase.
// Each section explains the purpose of the code structure.

// ========================
// CODE STRUCTURE REFERENCE TEMPLATES BY USAGE
// ========================
// Each section is a template for a specific usage. Replace placeholder names as needed.

// ========================
// 1) VARIABLE ASSIGNMENT
// This is for declaring and assigning a value to a variable.
// ========================
const variableName = value;
let mutableVariable = initialValue;

// ========================
// 2) FUNCTION DECLARATION
// This is for defining a reusable block of code that can take parameters and return a value.
// ========================
function functionName(param1, param2) {
  // function body
}

// ========================
// 3) ARROW FUNCTION
// This is for creating a concise function expression, often used for callbacks or inline functions.
// ========================
const arrowFunction = (param1, param2) => {
  // function body
};

// ========================
// 4) ASYNC FUNCTION
// This is for defining a function that performs asynchronous operations using await.
// ========================
async function asyncFunction(param) {
  // await something
}

// ========================
// 5) STATIC CLASS METHOD
// This is for defining a method that belongs to the class itself, not instances, often used for utility or service logic.
// ========================
class ExampleClass {
  static methodName(param) {
    // method body
  }
  static async asyncMethodName(param) {
    // await something
  }
}

// ========================
// 6) EXPORTS
// This is for making functions or classes available to other modules/files.
// ========================
// export default ExampleClass;
export { functionName, arrowFunction };

// ========================
// 7) ERROR HANDLING
// This is for catching and handling errors that may occur in a try block.
// ========================
try {
  // code that may throw
} catch (error) {
  // handle error
  throw new Error('Custom error message');
}

// ========================
// 8) EXPRESS MIDDLEWARE
// This is for creating middleware functions in Express that process requests and pass control to the next middleware.
// ========================
const middleware = (req, res, next) => {
  // do something
  next();
};

// ========================
// 9) EXPRESS ROUTE HANDLER
// This is for handling HTTP requests to a specific route in an Express app, with error handling.
// ========================
// Example: Handling a GET request
// app.get('/route', async (req, res, next) => {
//   try {
//     // handle request
//     res.status(200).json({ status: 'success' });
//   } catch (error) {
//     next(error);
//   }
// });

// ========================
// 10) CONFIGURATION USAGE
// This is for accessing configuration values from a central config file.
// ========================
import { config } from '../config/config.mjs';
const configValue = config.section.key;

// ========================
// 11) CLASS PATTERN FOR SERVICES
// This is for organizing related static methods in a service class, often for business logic or database operations.
// ========================
class ServiceClass {
  static async staticAsyncMethod(param) {
    // await something
    return 'result';
  }
  static staticMethod(param) {
    return 'value';
  }
}

// ========================
// 12) FIREBASE DATABASE USAGE
// This is for performing CRUD operations with Firebase Realtime Database.
// ========================
import { getDatabase, ref, set, get, remove, push } from 'firebase/database';
// const db = getDatabase(app, config.firebase.databaseURL);
// const dataRef = ref(db, 'path/to/data');
// await set(dataRef, data); // This is for saving data
// const snapshot = await get(dataRef); // This is for retrieving data
// if (snapshot.exists()) {
//   const dataValue = snapshot.val(); // This is for accessing the retrieved data
// }
// await remove(dataRef); // This is for deleting data
// const newRef = push(ref(db, 'path/to/list')); // This is for creating a new child with a unique key

// ========================
// 13) EMAIL SERVICE USAGE
// This is for sending emails using nodemailer and configuration values.
// ========================
import nodemailer from 'nodemailer';
// const transporter = nodemailer.createTransport({
//   service: 'gmail',
//   auth: { user: config.email.user, pass: config.email.pass }
// });
// await transporter.sendMail({ from, to, subject, html });

// ========================
// 14) CUSTOM ERROR CLASS
// This is for creating custom error types for more descriptive and operational error handling.
// ========================
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ========================
// 15) ENVIRONMENT VARIABLES
// This is for loading and accessing environment variables using dotenv.
// ========================
import dotenv from 'dotenv';
dotenv.config();
const envValue = process.env.VARIABLE_NAME;

// ========================
// 16) COMMON EXPRESS APP SETUP
// This is for setting up an Express application with JSON and URL-encoded body parsing.
// ========================
import express from 'express';
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================
// 17) EXPORTING MULTIPLE FUNCTIONS
// This is for exporting multiple functions or variables from a module.
// ========================
export {
  asyncFunction,
  middleware
};

// ========================
// 18) CLASS EXPORT DEFAULT (Uncomment if needed)
// This is for exporting a class as the default export from a module.
// ========================
// export default ServiceClass;

// ========================
// Template: Validate Required Fields in Request
// ========================
/*
if (!field1 || !field2 || !field3) {
  return next(new AppError('All fields are required', 400));
}
*/

// ========================
// Template: Express Middleware
// ========================
/*
const middlewareName = (req, res, next) => {
  // Your validation or logic here
  next();
};
*/

// ========================
// Template: Save Data to Firebase (e.g., Save OTP)
// ========================
/*
static async saveDataToFirebase(keyParam, dataObject) {
  try {
    const dataRef = ref(db, `NodeName/${keyParam}`); // Replace NodeName with your node
    await set(dataRef, dataObject); // Save dataObject to the node
    return true; // Or return a value as needed
  } catch (error) {
    console.error('Error saving data:', error);
    throw new Error('Failed to save data');
  }
}
*/

// ========================
// Template: Get Data from Firebase
// ========================
/*
static async getDataFromFirebase(keyParam) {
  try {
    const dataRef = ref(db, `NodeName/${keyParam}`); // Replace NodeName with your node
    const snapshot = await get(dataRef);
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('Error getting data:', error);
    throw new Error('Failed to get data');
  }
}
*/

// ========================
// Template: Delete Data from Firebase
// ========================
/*
static async deleteDataFromFirebase(keyParam) {
  try {
    const dataRef = ref(db, `NodeName/${keyParam}`); // Replace NodeName with your node
    await remove(dataRef);
    return true;
  } catch (error) {
    console.error('Error deleting data:', error);
    throw new Error('Failed to delete data');
  }
}
*/

// ========================
// Template: Save New User to Firebase List
// ========================
/*
static async saveUserToList(userData) {
  try {
    const userRef = push(ref(db, 'UserListNode')); // Replace UserListNode with your node
    await set(userRef, userData);
    return userRef.key; // Return the generated key
  } catch (error) {
    console.error('Error saving user info:', error);
    throw new Error('Failed to save user information');
  }
}
*/

// ========================
// Template: Find User by Username in Multiple Roles
// ========================
/*
static async findUserByUsername(username) {
  try {
    const roles = ['Role1', 'Role2', 'Role3']; // Replace with your roles
    for (const role of roles) {
      const nodeRef = ref(db, role);
      const snapshot = await get(nodeRef);
      if (snapshot.exists()) {
        const users = snapshot.val();
        const user = Object.values(users).find(
          u => u.username && u.username.toLowerCase() === username.toLowerCase()
        );
        if (user) return { ...user, role };
      }
    }
    return null;
  } catch (error) {
    console.error('Error finding user by username:', error);
    throw new Error('Failed to find user');
  }
}
*/

// ========================
// Template: Check if Username is Taken in Multiple Roles
// ========================
/*
static async isUsernameTaken(username) {
  try {
    const roles = ['Role1', 'Role2', 'Role3']; // Replace with your roles
    for (const role of roles) {
      const nodeRef = ref(db, role);
      const snapshot = await get(nodeRef);
      if (snapshot.exists()) {
        const users = snapshot.val();
        if (Object.values(users).some(
          user => user.username && user.username.toLowerCase() === username.toLowerCase()
        )) {
          return true;
        }
      }
    }
    return false;
  } catch (error) {
    console.error('Error checking username:', error);
    throw new Error('Failed to check username');
  }
}
*/

// ========================
// Template: Create Notification in Firebase
// ========================
/*
static async createNotification(notificationData) {
  try {
    const notifRef = push(ref(db, 'NotificationNode')); // Replace NotificationNode with your node
    await set(notifRef, {
      type: notificationData.type,
      message: notificationData.message,
      read: notificationData.read || false,
      timestamp: notificationData.timestamp || new Date().toISOString(),
      user: notificationData.user
    });
    return notifRef.key;
  } catch (error) {
    console.error('Error saving notification:', error);
    throw new Error('Failed to save notification');
  }
}
*/

// ========================
// Template: Express Middleware for Error Handling
// ========================
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  // Add custom error handling logic here
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message
  });
};

// ========================
// Template: Custom Error Class
// ========================
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// ========================
// Template: Send Email with Nodemailer
// ========================
/*
static async sendEmail(to, subject, html) {
  try {
    const mailOptions = {
      from: `"SenderName" <${config.email.user}>`, // Replace SenderName
      to,
      subject,
      html
    };
    const info = await this.transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
}
*/

// ========================
// Template: Express Route Handler with Try/Catch
// ========================
/*
app.post('/route', async (req, res, next) => {
  try {
    // Your logic here
    res.status(200).json({ status: 'success' });
  } catch (error) {
    next(error);
  }
});
*/

// ========================
// CODE STRUCTURE REFERENCE TEMPLATES BY USAGE (SYSTEM-SPECIFIC, GROUPED)
// ========================
// Each section is a template group for a specific type of code structure in this system.
// Replace placeholder names as needed.

// ========================
// 1) FUNCTION TEMPLATES
// ========================
/*
// --- Middleware Function: Validate OTP Registration (auth.controller.mjs)
const validateOTPRegistration = (req, res, next) => { // your function name, params
  const { email, firstName, lastName, username, password, retypePassword, role } = req.body; // your variable names
  if (!email || !firstName || !lastName || !username || !password || !retypePassword || !role) { // your validation logic
    return next(new AppError('All fields are required', 400)); // your error message
  } // bracket
  const validRoles = ['ContentCreator', 'MarketingLead', 'GraphicDesigner']; // your values
  if (!validRoles.includes(role)) { // your validation logic
    return next(new AppError('Invalid role specified', 400)); // your error message
  } // bracket
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // your regex
  if (!emailRegex.test(email)) { // your validation logic
    return next(new AppError('Please provide a valid email address', 400)); // your error message
  } // bracket
  if (password.length < 8) { // your validation logic
    return next(new AppError('Password must be at least 8 characters long', 400)); // your error message
  } // bracket
  if (password !== retypePassword) { // your validation logic
    return next(new AppError('Passwords do not match', 400)); // your error message
  } // bracket
  next(); // call next middleware
}; // end function

// --- Controller: Register OTP (auth.controller.mjs)
const registerOTP = async (req, res, next) => { // your function name, params
  try { // try block
    const { email, firstName, lastName, username, password, role } = req.body; // your variable names
    const isUsernameTaken = await FirebaseService.isUsernameTaken(username); // your service and param
    if (isUsernameTaken) { // your validation logic
      return next(new AppError('Username is already taken', 400)); // your error message
    } // bracket
    const otp = EmailService.generateOTP(); // your service
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // your value
    const hashedPassword = await bcrypt.hash(password, 12); // your hash logic
    const userData = { // your object structure
      email, // your value
      firstName, // your value
      lastName, // your value
      username, // your value
      password: hashedPassword, // your value
      role, // your value
      otp, // your value
      expiresAt, // your value
      verified: false, // your value
      createdAt: new Date().toISOString() // your value
    }; // end object
    await FirebaseService.saveOTP(email, userData); // your service and params
    await EmailService.sendOTPEmail(email, otp); // your service and params
    res.status(200).json({ // your response
      status: 'success', // your value
      message: 'OTP sent successfully', // your value
      data: { email, expiresIn: '10 minutes' } // your value
    }); // end response
  } catch (error) { // catch block
    next(error); // error handler
  } // end catch
}; // end function

// --- Controller: Verify OTP (auth.controller.mjs)
const verifyOTP = async (req, res, next) => { // your function name, params
  try { // try block
    const { email, otp } = req.body; // your variable names
    const otpData = await FirebaseService.getOTP(email); // your service and param
    if (!otpData || otpData.expiresAt < Date.now()) { // your validation logic
      return next(new AppError('OTP is invalid or has expired', 400)); // your error message
    } // bracket
    if (otpData.otp !== otp) { // your validation logic
      return next(new AppError('Invalid OTP', 400)); // your error message
    } // bracket
    await FirebaseService.saveOTP(email, { ...otpData, verified: true }); // your service and params
    res.status(200).json({ // your response
      status: 'success', // your value
      message: 'OTP verified successfully', // your value
      data: { email, verified: true } // your value
    }); // end response
  } catch (error) { // catch block
    next(error); // error handler
  } // end catch
}; // end function

// --- Controller: Complete Registration (auth.controller.mjs)
const completeRegistration = async (req, res, next) => { // your function name, params
  try { // try block
    const { email, contactNumber, city, state, country, zipCode } = req.body; // your variable names
    const otpData = await FirebaseService.getOTP(email); // your service and param
    if (!otpData || !otpData.verified) { // your validation logic
      return next(new AppError('Please verify your email first', 400)); // your error message
    } // bracket
    const userData = { // your object structure
      ...otpData, // your value
      contactNumber, // your value
      city, // your value
      state, // your value
      country, // your value
      zipCode, // your value
      registrationCompleted: true, // your value
      registrationDate: new Date().toISOString() // your value
    }; // end object
    const userId = await FirebaseService.saveUser(userData); // your service and param
    await FirebaseService.createAdminNotification({ // your service and param
      type: 'approval_needed', // your value
      message: 'A new account needs approval.', // your value
      read: false, // your value
      timestamp: new Date().toISOString(), // your value
      user: { ...userData, id: userId } // your value
    }); // end object
    await FirebaseService.deleteOTP(email); // your service and param
    const token = jwt.sign( // your token logic
      { id: userData.username, role: userData.role }, // your value
      config.jwt.secret, // your value
      { expiresIn: config.jwt.expiresIn } // your value
    ); // end token
    res.status(201).json({ // your response
      status: 'success', // your value
      message: 'Registration completed successfully', // your value
      token, // your value
      data: { // your value
        user: { // your value
          email: userData.email, // your value
          username: userData.username, // your value
          firstName: userData.firstName, // your value
          lastName: userData.lastName, // your value
          role: userData.role // your value
        } // end user
      } // end data
    }); // end response
  } catch (error) { // catch block
    next(error); // error handler
  } // end catch
}; // end function

// --- Controller: Login (auth.controller.mjs)
const login = async (req, res, next) => { // your function name, params
  try { // try block
    const { username, password } = req.body; // your variable names
    if (!username || !password) { // your validation logic
      return next(new AppError('Please provide username and password!', 400)); // your error message
    } // bracket
    const user = await FirebaseService.findUserByUsername(username); // your service and param
    if (!user) { // your validation logic
      return next(new AppError('Incorrect username or password', 401)); // your error message
    } // bracket
    const isPasswordCorrect = await bcrypt.compare(password, user.password); // your logic
    if (!isPasswordCorrect) { // your validation logic
      return next(new AppError('Incorrect username or password', 401)); // your error message
    } // bracket
    const token = jwt.sign( // your token logic
      { id: user.username, role: user.role }, // your value
      config.jwt.secret, // your value
      { expiresIn: config.jwt.expiresIn } // your value
    ); // end token
    res.status(200).json({ // your response
      status: 'success', // your value
      token, // your value
      data: { // your value
        user: { // your value
          username: user.username, // your value
          email: user.email, // your value
          firstName: user.firstName, // your value
          lastName: user.lastName, // your value
          role: user.role // your value
        } // end user
      } // end data
    }); // end response
  } catch (error) { // catch block
    next(error); // error handler
  } // end catch
}; // end function

// --- Firebase Service: Save OTP
static async saveOTP(email, userData) { // your function name, your params
  try { // try block
    const otpRef = ref(db, `OTPVerification/${safeKey(email)}`); // your node, your key logic
    await set(otpRef, userData); // your data
    return true; // return value
  } catch (error) { // catch block
    console.error('Error saving OTP:', error); // your error message
    throw new Error('Failed to save OTP'); // your error message
  } // end catch
} // end function

// --- Firebase Service: Get OTP
static async getOTP(email) { // your function name, your param
  try { // try block
    const otpRef = ref(db, `OTPVerification/${safeKey(email)}`); // your node, your key logic
    const snapshot = await get(otpRef); // your get logic
    return snapshot.exists() ? snapshot.val() : null; // return value
  } catch (error) { // catch block
    console.error('Error getting OTP:', error); // your error message
    throw new Error('Failed to get OTP'); // your error message
  } // end catch
} // end function

// --- Firebase Service: Delete OTP
static async deleteOTP(email) { // your function name, your param
  try { // try block
    const otpRef = ref(db, `OTPVerification/${safeKey(email)}`); // your node, your key logic
    await remove(otpRef); // your remove logic
    return true; // return value
  } catch (error) { // catch block
    console.error('Error deleting OTP:', error); // your error message
    throw new Error('Failed to delete OTP'); // your error message
  } // end catch
} // end function

// --- Firebase Service: Save User to Approval List
static async saveUser(userData) { // your function name, your param
  try { // try block
    const userRef = push(ref(db, 'ApprovalofAccounts')); // your node
    await set(userRef, userData); // your data
    return userRef.key; // return value
  } catch (error) { // catch block
    console.error('Error saving user info:', error); // your error message
    throw new Error('Failed to save user information'); // your error message
  } // end catch
} // end function

// --- Firebase Service: Find User by Username
static async findUserByUsername(username) { // your function name, your param
  try { // try block
    const roles = ['Admin', 'ContentCreator', 'MarketingLead', 'GraphicDesigner']; // your roles
    for (const role of roles) { // loop roles
      const nodeRef = ref(db, role); // your node
      const snapshot = await get(nodeRef); // your get logic
      if (snapshot.exists()) { // your validation logic
        const users = snapshot.val(); // your data
        const user = Object.values(users).find( // your logic
          u => u.username && u.username.toLowerCase() === username.toLowerCase() // your logic
        ); // end find
        if (user) return { ...user, role }; // return value
      } // end if
    } // end for
    return null; // return value
  } catch (error) { // catch block
    console.error('Error finding user by username:', error); // your error message
    throw new Error('Failed to find user'); // your error message
  } // end catch
} // end function

// --- Firebase Service: Check if Username is Taken
static async isUsernameTaken(username) { // your function name, your param
  try { // try block
    const roles = ['ContentCreator', 'MarketingLead', 'GraphicDesigner']; // your roles
    for (const role of roles) { // loop roles
      const nodeRef = ref(db, role); // your node
      const snapshot = await get(nodeRef); // your get logic
      if (snapshot.exists()) { // your validation logic
        const users = snapshot.val(); // your data
        if (Object.values(users).some( // your logic
          user => user.Username && user.Username.toLowerCase() === username.toLowerCase() // your logic
        )) { // end some
          return true; // return value
        } // end if
      } // end if
    } // end for
    return false; // return value
  } catch (error) { // catch block
    console.error('Error checking username:', error); // your error message
    throw new Error('Failed to check username'); // your error message
  } // end catch
} // end function

// --- Firebase Service: Create Admin Notification
static async createAdminNotification(notificationData) { // your function name, your param
  try { // try block
    const notifAdminRef = push(ref(db, 'AdminNotification')); // your node
    await set(notifAdminRef, { // your data
      type: notificationData.type, // your value
      message: notificationData.message, // your value
      read: notificationData.read || false, // your value
      timestamp: notificationData.timestamp || new Date().toISOString(), // your value
      user: notificationData.user // your value
    }); // end object
    return notifAdminRef.key; // return value
  } catch (error) { // catch block
    console.error('Error saving Admin notification:', error); // your error message
    throw new Error('Failed to save Admin notification'); // your error message
  } // end catch
} // end function

// --- Email Service: Generate OTP
static generateOTP() { // your function name
  return Math.floor(100000 + Math.random() * 900000).toString(); // your logic
} // end function

// --- Email Service: Send Email
static async sendEmail(to, subject, html) { // your function name, your params
  try { // try block
    const mailOptions = { // your object
      from: `"Infinity" <${config.email.user}>`, // your sender
      to, // your recipient
      subject, // your subject
      html // your html
    }; // end object
    const info = await this.transporter.sendMail(mailOptions); // your transporter
    console.log('Email sent: %s', info.messageId); // your log
    return { success: true, messageId: info.messageId }; // return value
  } catch (error) { // catch block
    console.error('Error sending email:', error); // your error message
    throw new Error('Failed to send email'); // your error message
  } // end catch
} // end function

// --- Email Service: Send OTP Email
static async sendOTPEmail(email, otp) { // your function name, your params
  const emailTemplate = this.generateOTPEmail(otp); // your template
  return this.sendEmail(email, emailTemplate.subject, emailTemplate.html); // your send logic
} // end function
*/

// ========================
// 2) IF STATEMENT TEMPLATES
// ========================
/*
// --- Required Fields Check
if (!field1 || !field2 || !field3) { // your variable names
  return next(new AppError('All fields are required', 400)); // your error message
}
*/

// ========================
// 3) ERROR HANDLING TEMPLATES
// ========================
/*
// --- Global Error Handler Middleware (errorHandler.mjs)
const errorHandler = (err, req, res, next) => { // your function name, your params
  err.statusCode = err.statusCode || 500; // your value
  err.status = err.status || 'error'; // your value
  if (process.env.NODE_ENV === 'development') { // your environment check
    return res.status(err.statusCode).json({ // your response
      status: err.status, // your value
      error: err, // your value
      message: err.message, // your value
      stack: err.stack // your value
    }); // end response
  } else { // else block
    let error = { ...err }; // your error object
    error.message = err.message; // your value
    if (error.code === 11000) error = handleDuplicateFieldDB(error); // your handler
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error); // your handler
    if (error.name === 'JsonWebTokenError') error = handleJWTError(); // your handler
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError(); // your handler
    if (err.isOperational) { // your check
      return res.status(err.statusCode).json({ // your response
        status: err.status, // your value
        message: err.message // your value
      }); // end response
    } // end if
    return res.status(500).json({ // your response
      status: 'error', // your value
      message: 'Something went very wrong!' // your value
    }); // end response
  } // end else
}; // end function

// --- Custom AppError Class (errorHandler.mjs)
class AppError extends Error { // your class name
  constructor(message, statusCode) { // your params
    super(message); // your call
    this.statusCode = statusCode; // your value
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error'; // your logic
    this.isOperational = true; // your value
    Error.captureStackTrace(this, this.constructor); // your call
  } // end constructor
} // end class
*/