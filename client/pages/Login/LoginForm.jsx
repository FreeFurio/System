import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from '../../components/common/UserContext';
import PasswordInput from '../../components/shared/PasswordInput';
import Toast from '../../components/common/Toast';
import PasswordResetModal from '../../components/common/PasswordResetModal';
import "../../styles/Register.css";


export default function LoginForm() {
  const navigate = useNavigate();
  const { setUser } = useUser();
  const [fields, setFields] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetUsername, setResetUsername] = useState("");

  const validate = () => {
    const errs = {};
    if (!fields.username) errs.username = "Username is required";
    if (!fields.password) errs.password = "Password is required";
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const missingFields = Object.keys(errs).map(field => 
        field === 'username' ? 'Username' : 'Password'
      );
      setToastMessage(['Missing Fields:', ...missingFields]);
      setShowToast(true);
      return;
    }
    
    // Clear any previous errors on successful validation
    setErrors({});

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: fields.username,
          password: fields.password,
        }),
      });
      const result = await response.json();

      if (response.ok) {
        if (result.status === 'password_reset_required') {
          setResetUsername(fields.username);
          setShowPasswordReset(true);
          setMessage({ text: "", type: "" });
        } else {
          setMessage({ text: "Login successful!", type: "success" });
          setUser(result.data.user);
          localStorage.setItem("user", JSON.stringify(result.data.user));
          setTimeout(() => {
            const role = result.data.user?.role;
            if (role === 'Admin') {
              navigate('/admin');
            } else if (role === 'MarketingLead') {
              navigate('/marketing/dashboard');
            } else if (role === 'ContentCreator') {
              navigate('/content/dashboard');
            } else if (role === 'GraphicDesigner') {
              navigate('/graphic/dashboard');
            } else {
              navigate('/admin');
            }
          }, 1000);
        }
      } else {
        // Handle account lockout (HTTP 423)
        if (response.status === 423) {
          setMessage({ text: result.message || "Account is temporarily locked.", type: "error" });
        } else {
          setMessage({ text: result.message || "Login failed.", type: "error" });
        }
      }
    } catch (err) {
      setMessage({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordResetSuccess = () => {
    setShowPasswordReset(false);
    setMessage({ text: "Password updated successfully! Please login with your new password.", type: "success" });
    setFields({ username: "", password: "" });
  };

  return (
    <>
      <div className="form-container">
      <div className="form-header">
        <h2 className="title">Welcome Back</h2>
        <p className="subtitle">Sign in to access your account</p>
      </div>
      
      <form className="form" onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <div className="password-input-wrapper">
            <input
              type="text"
              id="username"
              name="username"
              className={`input${errors.username ? " error" : ""}`}
              value={fields.username}
              onChange={handleChange}
              autoComplete="username"
              placeholder=" "
              required
            />
            <label htmlFor="username" className="label">Username</label>
          </div>
  
        </div>
        
        <div className="form-group">
          <PasswordInput
            value={fields.password}
            onChange={handleChange}
            name="password"
            placeholder=" "
            label="Password"
            error={errors.password}
            required
          />
        </div>
        
        <div className="forgot-password-link">
          <button
            type="button"
            className="link"
            onClick={() => navigate('/forgot-password')}
          >
            Forgot Password?
          </button>
        </div>
        
        <button
          type="submit"
          className="signup-button"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading"></span>
              Logging in...
            </>
          ) : (
            "Log In"
          )}
        </button>
      </form>
      
      {message.text && (
        <div className={message.type === "success" ? "success-message" : "error-message"}>
          {message.text}
        </div>
      )}
      
      <div className="form-footer">
        <span>Don't have an account?</span>
        <button className="link" onClick={() => navigate('/register')}>
          Create Account
        </button>
      </div>
      
      </div>
      
      {showToast && (
        <Toast
          message={toastMessage}
          type="error"
          onClose={() => setShowToast(false)}
        />
      )}
      
      <PasswordResetModal
        isOpen={showPasswordReset}
        username={resetUsername}
        onClose={() => setShowPasswordReset(false)}
        onSuccess={handlePasswordResetSuccess}
      />
    </>
  );
}
