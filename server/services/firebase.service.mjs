// ========================
// 1) IMPORTS & CONFIGURATION
// ========================
// Firebase Admin SDK for database operations
import { initializeApp } from 'firebase/app';
// Firebase Realtime Database functions
import { 
  getDatabase, 
  ref, 
  set, 
  push, 
  get, 
  remove, 
  query, 
  orderByChild, 
  equalTo 
} from 'firebase/database';
// Application configuration
import { config } from '../config/config.mjs';

// Initialize Firebase app with configuration from config file
const app = initializeApp(config.firebase);
// Get a reference to the database service
const db = getDatabase(app, config.firebase.databaseURL);

// ========================
// 2) UTILITY FUNCTIONS
// ========================

/**
 * Converts an email address to a safe database key
 * Replaces special characters that are not allowed in Firebase keys with underscores
 * @param {string} email - User's email address
 * @returns {string} Sanitized key safe for Firebase
 * @throws {Error} If email is not provided
 */
const safeKey = (email) => {
  if (!email) throw new Error('Email is required');
  // Replace characters that are not allowed in Firebase keys
  return email.replace(/[.#$\[\]]/g, '_');
};

// ========================
// 3) DATABASE OPERATIONS
// ========================

/**
 * FirebaseService class handles all Firebase Realtime Database operations
 * Provides methods for OTP management and user data operations
 */
class FirebaseService {
  // ========================
  // 3.1) OTP OPERATIONS
  // ========================
  
  /**
   * Saves OTP (One-Time Password) data to the database
   * @param {string} email - User's email address (used as key)
   * @param {Object} userData - User data including OTP and expiration
   * @returns {Promise<boolean>} True if operation is successful
   * @throws {Error} If saving fails
   */
  static async saveOTP(email, userData) {
    try {
      // Create a reference to the OTPVerification node with email as key
      const otpRef = ref(db, `OTPVerification/${safeKey(email)}`);
      // Save the data to the database
      await set(otpRef, userData);
      return true;
    } catch (error) {
      console.error('Error saving OTP:', error);
      throw new Error('Failed to save OTP');
    }
  }

  /**
   * Retrieves OTP data from the database
   * @param {string} email - User's email address
   * @returns {Promise<Object|null>} OTP data if found, null otherwise
   * @throws {Error} If retrieval fails
   */
  static async getOTP(email) {
    try {
      // Create a reference to the specific OTP record
      const otpRef = ref(db, `OTPVerification/${safeKey(email)}`);
      // Get the data from the database
      const snapshot = await get(otpRef);
      // Return the data if it exists, null otherwise
      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error getting OTP:', error);
      throw new Error('Failed to get OTP');
    }
  }

  /**
   * Deletes an OTP record from the database
   * @param {string} email - User's email address
   * @returns {Promise<boolean>} True if deletion is successful
   * @throws {Error} If deletion fails
   */
  static async deleteOTP(email) {
    try {
      // Create a reference to the OTP record to delete
      const otpRef = ref(db, `OTPVerification/${safeKey(email)}`);
      // Remove the record from the database
      await remove(otpRef);
      return true;
    } catch (error) {
      console.error('Error deleting OTP:', error);
      throw new Error('Failed to delete OTP');
    }
  }

  // ========================
  // 3.2) USER OPERATIONS
  // ========================

  /**
   * Saves user information to the database
   * @param {Object} userData - User data to save
   * @returns {Promise<string>} The generated user ID
   * @throws {Error} If saving fails
   */
  static async saveUser(userData) {
    try {
      // Create a new reference in the ApprovalofAccounts node with auto-generated ID
      const userRef = push(ref(db, 'ApprovalofAccounts'));
      // Save the user data to the new reference
      await set(userRef, userData);
      // Return the generated user ID
      return userRef.key;
    } catch (error) {
      console.error('Error saving user info:', error);
      throw new Error('Failed to save user information');
    }
  }

  /**
   * Finds a user by username across multiple roles
   * @param {string} username - Username to search for
   * @returns {Promise<Object|null>} User data with role if found, null otherwise
   * @throws {Error} If search fails
   */
  static async findUserByUsername(username) {
    try {
      // List of roles to search through
      const roles = ['Admin', 'ContentCreator', 'MarketingLead', 'GraphicDesigner'];
      
      // Search through each role
      for (const role of roles) {
        // Create a reference to the role node
        const nodeRef = ref(db, role);
        // Get the data from the database
        const snapshot = await get(nodeRef);
        
        // If the role node exists and has data
        if (snapshot.exists()) {
          const users = snapshot.val();
          // Find user with matching username (case-insensitive)
          const user = Object.values(users).find(
            u => u.username && u.username.toLowerCase() === username.toLowerCase()
          );
          
          // If user found, return with role included
          if (user) return { ...user, role };
        }
      }
      // Return null if user not found in any role
      return null;
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw new Error('Failed to find user');
    }
  }

  /**
   * Checks if a username is already taken in any role
   * @param {string} username - Username to check
   * @returns {Promise<boolean>} True if username is taken
   * @throws {Error} If check fails
   */
  static async isUsernameTaken(username) {
    try {
      // List of roles to check (excludes Admin)
      const roles = ['ContentCreator', 'MarketingLead', 'GraphicDesigner'];
      
      // Check each role
      for (const role of roles) {
        // Create a reference to the role node
        const nodeRef = ref(db, role);
        // Get the data from the database
        const snapshot = await get(nodeRef);
        
        // If the role node exists and has data
        if (snapshot.exists()) {
          const users = snapshot.val();
          // Check if any user has the same username (case-insensitive)
          if (Object.values(users).some(
            user => user.Username && user.Username.toLowerCase() === username.toLowerCase()
          )) {
            return true; // Username is taken
          }
        }
      }
      // Username is available
      return false;
    } catch (error) {
      console.error('Error checking username:', error);
      throw new Error('Failed to check username');
    }
  }
}

// ========================
// 4) EXPORTS
// ========================

export default FirebaseService;
