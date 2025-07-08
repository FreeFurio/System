// ========================
// 1) IMPORTS & CONFIGURATION
// ========================
import { initializeApp } from 'firebase/app';
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
import { config } from '../config/config.mjs';
import { AppError } from '../utils/errorHandler.mjs';

const app = initializeApp(config.firebase);
const db = getDatabase(app, config.firebase.databaseURL);

// ========================
// 2) UTILITY FUNCTIONS
// ========================
const safeKey = (email) => {
  if (!email) throw new AppError('Email is required', 400);
  return email.replace(/[.#$\[\]]/g, '_');
};

// ========================
// 3) DATABASE OPERATIONS
// ========================
class FirebaseService {
  // ========================
  // 3.1) OTP OPERATIONS
  // ========================
  static async saveOTP(email, userData) {
    try {
      const otpRef = ref(db, `OTPVerification/${safeKey(email)}`);

      await set(otpRef, userData);
      return true;
    } catch (error) {
      console.error('Error saving OTP:', error);
      throw new AppError('Failed to save OTP', 500);
    }
  }

  static async getOTP(email) {
    try {
      const otpRef = ref(db, `OTPVerification/${safeKey(email)}`);
      const snapshot = await get(otpRef);

      return snapshot.exists() ? snapshot.val() : null;
    } catch (error) {
      console.error('Error getting OTP:', error);
      throw new AppError('Failed to get OTP', 500);
    }
  }

  static async deleteOTP(email) {
    try {
      const otpRef = ref(db, `OTPVerification/${safeKey(email)}`);

      await remove(otpRef);
      return true;
    } catch (error) {
      console.error('Error deleting OTP:', error);
      throw new AppError('Failed to delete OTP', 500);
    }
  }

  // ========================
  // 3.2) USER OPERATIONS
  // ========================
  static async saveUser(userData) {
    try {
      const userRef = push(ref(db, 'ApprovalofAccounts'));

      await set(userRef, userData);
      return userRef.key;
    } catch (error) {
      console.error('Error saving user info:', error);
      throw new AppError('Failed to save user information', 500);
    }
  }

  static async findUserByUsername(username) {
    try {
      const roles = ['Admin', 'ContentCreator', 'MarketingLead', 'GraphicDesigner'];

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
      throw new AppError('Failed to find user', 500);
    }
  }

  static async isUsernameTaken(username) {
    try {
      const roles = ['ContentCreator', 'MarketingLead', 'GraphicDesigner'];

      for (const role of roles) {
        const nodeRef = ref(db, role);
        const snapshot = await get(nodeRef);

        if (snapshot.exists()) {
          const users = snapshot.val();

          if (Object.values(users).some(
            user => user.Username && user.Username.toLowerCase() === username.toLowerCase()
          )) {
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error('Error checking username:', error);
      throw new AppError('Failed to check username', 500);
    }
  }
  // ========================
  // 4) SET TASK
  // ========================
  static async setTask(task){
    try {
      const taskRef = push(ref(db,`ContentCreatorTask`))
      await set (taskRef, task);
      return taskRef.key
    } catch (error){
      console.error('Error saving Content Creator Task:', error);
      throw new AppError('Failed to save Content Creator Task', 500);
    }
  }

  // ========================
  // 5) NOTIFICATIONS
  // ========================
  static async createAdminNotification(notificationData) {
    try {
      const notifAdminRef = push(ref(db, 'AdminNotification'));

      await set(notifAdminRef, {
        type: notificationData.type,
        message: notificationData.message,
        read: notificationData.read || false,
        timestamp: notificationData.timestamp || Date.now(),
        user: notificationData.user
      });
      return notifAdminRef.key
    } catch (error) {
      console.error('Error saving Admin notification:', error);
      throw new AppError('Failed to save Admin notification', 500);
    }
  }
}


// ========================
// 5) EXPORTS
// ========================

export default FirebaseService;
