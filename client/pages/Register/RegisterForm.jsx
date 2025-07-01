import React, { useState } from "react";
import OTPModal from '../../components/common/OTPModal';
import AddressPage from './AddressPage';
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
    const isUsed = await fakeCheckUsername(value);
    setUsernameChecking(false);
    setUsernameUsed(isUsed);
    if (isUsed) {
      setErrors((prev) => ({ ...prev, username: "Username is already used." }));
    }
  };

  // Simulated API call (replace with your real API call)
  //Example to for our database
  const fakeCheckUsername = async (username) => {
    // Simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    // Example: these usernames are taken
    const taken = ["admin", "user", "test"];
    return taken.includes(username.toLowerCase());
  };

  // Registration submit
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();

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

    if (Object.values(newErrors).some((err) => err)) {
      return;
    }

    setLoading(true);

    try {
      // Prepare form data
      const formData = {
        ...fields
      };

      // Send to backend
      const response = await fetch("http://localhost:3000/api/v1/auth/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      setPendingUser(formData);
      setShowOtpModal(true);
    } catch (error) {
      alert("Registration failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  // OTP submit
  const handleOtpSubmit = async (email, otp) => {
    setOtpLoading(true);
    setOtpError("");
    try {
      // Send OTP and user info to backend
      const response = await fetch("http://localhost:3000/api/v1/auth/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });
      if (!response.ok) throw new Error("OTP verification failed");
      setOtpVerified(true); // Show address page
      setShowOtpModal(false);
      setSuccess(true);
    } catch (error) {
      setOtpError("Invalid OTP or failed to save address. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // Show address page after OTP is verified
  if (otpVerified && pendingUser) {
    return <AddressPage email={pendingUser.email} />;
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

  return (
    <div className="form-container">
      <h1 className="title">Create your account</h1>
      {success && (
        <div className="success-message">
          Account created and verified successfully!
        </div>
      )}
      {!success && (
        <form className="form" onSubmit={handleRegisterSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="firstName" className="label">
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              className={`input${errors.firstName ? " error" : ""}${firstNameValid ? " success" : ""}`}
              value={fields.firstName}
              onChange={handleInputChange}
              required
            />
            <div className="error-message">{errors.firstName}</div>
          </div>

          <div className="form-group">
            <label htmlFor="lastName" className="label">
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              className={`input${errors.lastName ? " error" : ""}${lastNameValid ? " success" : ""}`}
              value={fields.lastName}
              onChange={handleInputChange}
              required
            />
            <div className="error-message">{errors.lastName}</div>
          </div>

          <div className="form-group">
            <label htmlFor="username" className="label">Username</label>
            <input
              type="text"
              name="username"
              value={fields.username}
              onChange={handleUsernameChange}
              className={`input${errors.username ? " error" : ""}${fields.username && !usernameUsed && !errors.username ? " success" : ""}`}
              placeholder="Username"
              autoComplete="username"
              required
            />
            {usernameChecking ? (
              <div className="checking-message">Checking username availability...</div>
            ) : usernameUsed ? (
              <div className="error-message">Username is already used.</div>
            ) : fields.username.length >= 8 && !errors.username ? (
              <div className="success-message">Username is available!</div>
            ) : errors.username ? (
              <div className="error-message">{errors.username}</div>
            ) : null}
          </div>

          <div className="form-group">
            <label htmlFor="email" className="label">Email</label>
            <input
              type="email"
              name="email"
              value={fields.email}
              onChange={handleInputChange}
              className={`input${errors.email ? " error" : ""}${emailValid ? " success" : ""}`}
              placeholder="Email"
              autoComplete="email"
              required
            />
            {errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="role" className="label">
              Position/Role
            </label>
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
            <div className="error-message">{errors.role}</div>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="label">
              Password
            </label>
            <PasswordInput
              value={fields.password}
              onChange={handleInputChange}
              error={errors.password}
              name="password"
              placeholder="Password"
              success={allPasswordRequirementsMet}
            />
            {fields.password && (
              <div className={`password-strength-indicator ${passwordStrengthLevel}`}>
                Password strength:{" "}
                {passwordStrengthLevel === "strong" && <span>Strong</span>}
                {passwordStrengthLevel === "moderate" && <span>Moderate</span>}
                {passwordStrengthLevel === "poor" && <span>Poor</span>}
              </div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="retypePassword" className="label">
              Retype Password
            </label>
            <PasswordInput
              value={fields.retypePassword}
              onChange={handleInputChange}
              error={errors.retypePassword}
              name="retypePassword"
              placeholder="Retype Password"
            />
          </div>

          {passwordsMatch && (
            <div className="password-success-indicator">
              <span role="img" aria-label="success">✅</span> Passwords matched!
            </div>
          )}

          <button
            type="submit"
            className="signup-button"
            disabled={loading}
            id="submit-btn"
          >
            <span id="submit-text">Sign Up</span>
            {loading && <span className="loading" id="submit-loading"></span>}
          </button>
        </form>
      )}
      <OTPModal
        show={showOtpModal}
        onSubmit={(otp) => handleOtpSubmit(pendingUser.email, otp)}
        onClose={() => setShowOtpModal(false)}
        loading={otpLoading}
        error={otpError}
      />
    </div>
  );
} 