import { ref, get } from 'firebase/database';
import { db } from '../services/firebase';

// Default password policies
const DEFAULT_POLICIES = {
  minPasswordLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false,
  passwordExpiry: 90
};

// Get current password policies from Firebase
export const getPasswordPolicies = async () => {
  try {
    const policiesRef = ref(db, 'systemSettings/passwordPolicies');
    const snapshot = await get(policiesRef);
    
    if (snapshot.exists()) {
      return { ...DEFAULT_POLICIES, ...snapshot.val() };
    }
    
    return DEFAULT_POLICIES;
  } catch (error) {
    console.error('Error loading password policies:', error);
    return DEFAULT_POLICIES;
  }
};

// Validate password against current policies
export const validatePassword = async (password) => {
  const policies = await getPasswordPolicies();
  const errors = [];

  // Check minimum length
  if (password.length < policies.minPasswordLength) {
    errors.push(`Password must be at least ${policies.minPasswordLength} characters long`);
  }

  // Check uppercase requirement
  if (policies.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter (A-Z)');
  }

  // Check lowercase requirement
  if (policies.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter (a-z)');
  }

  // Check numbers requirement
  if (policies.requireNumbers && !/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number (0-9)');
  }

  // Check special characters requirement
  if (policies.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Password must contain at least one special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors,
    policies
  };
};