import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import OTPModal from '../../components/common/OTPModal';
import AddressPage from './AddressPage';
import Toast from '../../components/common/Toast';
import '../../styles/Register.css';
import PasswordInput from '../../components/shared/PasswordInput';

const validation = {
  firstName: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z\s]+$/,
  },
  lastName: {
    required: true,
    minLength: 2,
    pattern: /^[a-zA-Z\s]+$/,
  },
  email: {
    required: true,
    pattern: /^[a-zA-Z0-9._%+-]+@gmail\.com$/,
  },
  role: {
    required: true,
  },
  password: {
    required: true,
    minLength: 1, // or 8 if you want, but REMOVE the pattern!
  },
  retypePassword: {
    required: true,
  },
  username: {
    required: true,
    minLength: 8,
    pattern: /^[a-zA-Z0-9_]+$/,
  },
};

function checkPasswordStrength(password) {
  return {
    hasLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
  };
}

// Add this in RegisterForm.jsx, near checkPasswordStrength
function getPasswordStrengthLevel(password) {
  let score = 0;
  if (/[A-Z]/.test(password)) score += 1;        // Has capital
  if (/\d/.test(password)) score += 1;           // Has number
  if (password.length >= 8) score += 1;          // Has 8 characters

  if (score === 3) return "strong";
  if (score === 2) return "moderate";
  if (score === 1) return "poor";
  return "poor";
}

export default function RegisterForm() {
  const navigate = useNavigate();
  
  // Step management
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 3;

  // Registration fields and state
  const [fields, setFields] = useState({
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    role: "",
    password: "",
    retypePassword: ""  
  });
  
  const [errors, setErrors] = useState({});
  const [passwordStrength, setPasswordStrength] = useState({});
  const [passwordStrengthLevel, setPasswordStrengthLevel] = useState("poor");
  const [loading, setLoading] = useState(false);

  // OTP modal state
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);
  const [success, setSuccess] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');

  // Address fields and state
  const [addressFields, setAddressFields] = useState({
    contactNumber: "",
    city: "",
    state: "",
    country: "",
    zipCode: "",
  });
  const [addressErrors, setAddressErrors] = useState({});

  // Username availability state
  const [usernameUsed, setUsernameUsed] = useState(false);
  const [usernameChecking, setUsernameChecking] = useState(false);

  const validateField = (field, value) => {
    const rules = validation[field];
    let error = "";

    if (rules.required && (!value || value === "")) {
      error = "This field is required";
    } else if (rules.minLength && value.length < rules.minLength) {
      error = `Must be at least ${rules.minLength} characters`;
    } else if (rules.pattern && !rules.pattern.test(value)) {
      if (field === "firstName" || field === "lastName")
        error = "Only letters and spaces allowed";
      if (field === "email") error = "Invalid email address";
    }
    return error;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));

    if (name === "password") {
      setPasswordStrength(checkPasswordStrength(value));
      setPasswordStrengthLevel(getPasswordStrengthLevel(value));
    }

    setErrors((prev) => ({
      ...prev,
      [name]: validateField(name, value),
      ...(name === "retypePassword"
        ? {
          retypePassword:
            value !== fields.password ? "Passwords do not match" : "",
        }
        : {}),
      ...(name === "password"
        ? {
          retypePassword:
            fields.retypePassword && value !== fields.retypePassword
              ? "Passwords do not match"
              : "",
        }
        : {}),
    }));
  };

  // Address change handler
  const handleAddressChange = (name, value) => {
    setAddressFields((prev) => ({ ...prev, [name]: value }));
    // Optionally validate here and set errors
  };

  // Username change handler
  const handleUsernameChange = async (e) => {
    const value = e.target.value;
    setFields((prev) => ({ ...prev, username: value }));
    setUsernameUsed(false);
    setErrors((prev) => ({ ...prev, username: undefined }));

    if (value.length < 8) {
      setErrors((prev) => ({ ...prev, username: "Username must be at least 8 characters." }));
      return;
    }

    setUsernameChecking(true);
    // Simulate API/database check (replace with your real API call) 
    //Example to for our database
    const isUsed = await checkUsernameAvailability(value);
    setUsernameChecking(false);
    setUsernameUsed(isUsed);
    if (isUsed) {
      setErrors((prev) => ({ ...prev, username: "Username is already used." }));
    } else if (value.length >= 8) {
      // Username is available - success state is shown via green border
      // No toast needed for username availability
    }
  };

  // Real API call to check username availability
  const checkUsernameAvailability = async (username) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/check-username`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username })
      });
      const result = await response.json();
      return result.taken || false;
    } catch (error) {
      console.error('Error checking username:', error);
      return false; // Assume available on error
    }
  };

  // Registration submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    console.log('🚀 Form submitted!', fields);

    // Validate all fields
    const newErrors = {};
    Object.keys(fields).forEach((field) => {
      const error = validateField(field, fields[field]);
      if (error) newErrors[field] = error;
    });
    if (fields.password !== fields.retypePassword) {
      newErrors.retypePassword = "Passwords do not match";
    }
    if (!fields.role) newErrors.role = "Choose a role";

    setErrors(newErrors);
    console.log('🔍 Validation errors:', newErrors);

    if (Object.values(newErrors).some((err) => err)) {
      console.log('❌ Form has validation errors:', Object.entries(newErrors).filter(([key, value]) => value));
      const errorList = Object.entries(newErrors).filter(([key, value]) => value).map(([key, value]) => `${key}: ${value}`).join(', ');
      setToastMessage('Please fix the following errors: ' + errorList);
      setToastType('error');
      setShowToast(true);
      return;
    }

    setLoading(true);
    console.log('📡 Sending request to:', `${import.meta.env.VITE_API_URL}/api/v1/auth/otp/send`);

    try {
      // Prepare form data
      const formData = {
        ...fields
      };
      console.log('📦 Form data:', formData);

      // Send to backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📡 Response data:', data);
      
      if (!response.ok && data.status !== 'success') {
        throw new Error(data.message || "Registration failed");
      }
      setPendingUser(formData);
      setShowOtpModal(true);
      console.log('✅ OTP modal should show now');
    } catch (error) {
      console.error('❌ Registration error:', error);
      setToastMessage("Registration failed: " + error.message);
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  // OTP submit
  const handleOtpSubmit = async (otp) => {
    setOtpLoading(true);
    setOtpError("");
    try {
      // Send OTP and user info to backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: pendingUser.username, otp }),
      });
      const data = await response.json();
      if (!response.ok && data.status !== 'success') throw new Error("OTP verification failed");
      setOtpVerified(true); // Show address page
      setShowOtpModal(false);
      setSuccess(true);
      setToastMessage(['Account created and verified successfully!']);
      setToastType('success');
      setShowToast(true);
    } catch (error) {
      setOtpError("Invalid OTP or failed to save address. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Show address page after OTP is verified
  if (otpVerified && pendingUser) {
    return <AddressPage username={pendingUser.username} />;
  }
  const allPasswordRequirementsMet =
    passwordStrength.hasLength &&
    passwordStrength.hasUppercase &&
    passwordStrength.hasLowercase &&
    passwordStrength.hasNumber;

  const passwordsMatch =
    fields.password &&
    fields.retypePassword &&
    fields.password === fields.retypePassword;

  // Only show when both are true
  const showPasswordSuccess = allPasswordRequirementsMet && passwordsMatch;

  const firstNameValid =
  fields?.firstName?.length >= 2 && /^[a-zA-Z\s]+$/.test(fields.firstName);

const lastNameValid =
  fields?.lastName?.length >= 2 && /^[a-zA-Z\s]+$/.test(fields.lastName);

const emailValid =
  fields?.email && /^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(fields.email);

  // Step validation
  const isStep1Valid = firstNameValid && lastNameValid;
  const isStep2Valid = fields.username && !usernameUsed && !errors.username && emailValid && allPasswordRequirementsMet && passwordsMatch;
  const isStep3Valid = fields.role;

  const handleNextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="form-container" key={currentStep}>
      <div className="form-header">
        <h1 className="title">Create Account</h1>
        <p className="subtitle">Join our salon management platform</p>
        
        <div className="step-indicator">
          <div className="step-progress">
            {[1, 2, 3].map((step) => (
              <div
                key={step}
                className={`step-dot ${
                  step === currentStep ? 'active' : step < currentStep ? 'completed' : 'inactive'
                }`}
              >
                {step < currentStep ? '✓' : step}
              </div>
            ))}
          </div>
          <p className="step-text">Step {currentStep} of {totalSteps}</p>
        </div>
      </div>
      

      
      {!success && (
        <form className="form" onSubmit={handleRegisterSubmit} noValidate>
          {currentStep === 1 && (
            <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
              <div className="form-group">
                <div className="password-input-wrapper">
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    className={`input${errors.firstName ? " error" : ""}${firstNameValid ? " success" : ""}`}
                    value={fields.firstName}
                    onChange={handleInputChange}
                    required
                    placeholder=" "
                  />
                  <label htmlFor="firstName" className="label">
                    First Name
                  </label>
                </div>

              </div>

              <div className="form-group">
                <div className="password-input-wrapper">
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    className={`input${errors.lastName ? " error" : ""}${lastNameValid ? " success" : ""}`}
                    value={fields.lastName}
                    onChange={handleInputChange}
                    required
                    placeholder=" "
                  />
                  <label htmlFor="lastName" className="label">
                    Last Name
                  </label>
                </div>

              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
              <div className="form-group">
                <div className="password-input-wrapper">
                  <input
                    type="text"
                    name="username"
                    value={fields.username}
                    onChange={handleUsernameChange}
                    className={`input${errors.username ? " error" : ""}${fields.username && !usernameUsed && !errors.username ? " success" : ""}`}
                    placeholder=" "
                    autoComplete="username"
                    required
                  />
                  <label htmlFor="username" className="label">Username</label>
                </div>
                {usernameChecking && (
                  <div className="checking-message">Checking username availability...</div>
                )}
                {errors.username && (
                  <div className="error-message">{errors.username}</div>
                )}
                {fields.username && !usernameUsed && !errors.username && fields.username.length >= 8 && (
                  <div className="success-message">Username is available!</div>
                )}
              </div>

              <div className="form-group">
                <div className="password-input-wrapper">
                  <input
                    type="email"
                    name="email"
                    value={fields.email}
                    onChange={handleInputChange}
                    className={`input${errors.email ? " error" : ""}${emailValid ? " success" : ""}`}
                    placeholder=" "
                    autoComplete="email"
                    required
                  />
                  <label htmlFor="email" className="label">Email</label>
                </div>

              </div>

              <div className="form-group">
                <PasswordInput
                  value={fields.password}
                  onChange={handleInputChange}
                  error={errors.password}
                  name="password"
                  placeholder=" "
                  success={allPasswordRequirementsMet}
                  label="Password"
                />
                {fields.password && (
                  <div className="success-message" style={{
                    color: passwordStrengthLevel === 'strong' ? '#059669' : 
                           passwordStrengthLevel === 'moderate' ? '#f59e0b' : '#ef4444',
                    background: passwordStrengthLevel === 'strong' ? '#f0fdf4' : 
                                passwordStrengthLevel === 'moderate' ? '#fffbeb' : '#fef2f2',
                    borderColor: passwordStrengthLevel === 'strong' ? '#bbf7d0' : 
                                 passwordStrengthLevel === 'moderate' ? '#fed7aa' : '#fecaca'
                  }}>
                    Password strength: {passwordStrengthLevel === 'strong' ? 'Strong' : 
                                       passwordStrengthLevel === 'moderate' ? 'Moderate' : 'Poor'}
                  </div>
                )}
              </div>

              <div className="form-group">
                <PasswordInput
                  value={fields.retypePassword}
                  onChange={handleInputChange}
                  error={errors.retypePassword}
                  name="retypePassword"
                  placeholder=" "
                  label="Retype Password"
                />
                {fields.retypePassword && fields.password && fields.password === fields.retypePassword && (
                  <div className="success-message">Passwords match!</div>
                )}
              </div>


            </div>
          )}

          {currentStep === 3 && (
            <div style={{ animation: 'fadeIn 0.3s ease-in-out' }}>
              <div className="form-group">
                <select
                  id="role"
                  name="role"
                  className={`input${errors.role ? " error" : ""}`}
                  value={fields.role}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select your role</option>
                  <option value="MarketingLead">Marketing Lead</option>
                  <option value="ContentCreator">Content Creator</option>
                  <option value="GraphicDesigner">Graphic Designer</option>
                </select>
                <label htmlFor="role" className="label">
                  Position/Role
                </label>

              </div>
            </div>
          )}


          <div className="form-actions">
            {currentStep > 1 && (
              <button
                type="button"
                className="back-button"
                onClick={handlePrevStep}
              >
                Previous
              </button>
            )}
            {currentStep < totalSteps ? (
              <button
                type="button"
                className="signup-button"
                onClick={handleNextStep}
                disabled={
                  (currentStep === 1 && !isStep1Valid) ||
                  (currentStep === 2 && !isStep2Valid)
                }
              >
                Continue
              </button>
            ) : (
              <button
                type="submit"
                className="signup-button"
                disabled={loading || !isStep3Valid}
              >
                {loading ? (
                  <>
                    <span className="loading"></span>
                    Creating Account...
                  </>
                ) : (
                  "Create Account"
                )}
              </button>
            )}
          </div>
        </form>
      )}
      
      <div className="form-footer">
        <span>Already have an account?</span>
        <button className="link" onClick={() => navigate('/login')}>
          Sign In
        </button>
      </div>
      
      <OTPModal
        show={showOtpModal}
        onSubmit={handleOtpSubmit}
        onClose={() => setShowOtpModal(false)}
        loading={otpLoading}
        error={otpError}
      />
      
      {showToast && (
        <Toast
          messages={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}