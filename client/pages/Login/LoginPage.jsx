import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Register.css";
import "../../styles/LoginForm.css";
import LoginForm from './LoginForm';
import ForgotPassword from './ForgotPassword';

export default function LoginPage() {
  const navigate = useNavigate();
  const [fields, setFields] = useState({ username: "", password: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showForgotPassword, setShowForgotPassword] = useState(false);

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
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: fields.username,
          password: fields.password,
        }),
      });
      const result = await response.json();
      if (response.ok) {
        setMessage({ text: "Login successful!", type: "success" });
        // Redirect to dashboard or home page after successful login
        setTimeout(() => navigate("/dashboard"), 1000);
      } else {
        setMessage({ text: result.error || "Login failed.", type: "error" });
      }
    } catch (err) {
      setMessage({ text: "Network error. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (showForgotPassword) {
    return (
      <div className="login-page">
        <div className="login-form-container">
          <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-form-container">
        <h2>Welcome Back</h2>
        <form className="login-form" onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="username" className="login-label">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              className={`login-input${errors.username ? " login-input-error" : ""}`}
              value={fields.username}
              onChange={handleChange}
              autoComplete="username"
              required
            />
            {errors.username && <div className="login-message login-message-error">{errors.username}</div>}
          </div>
          <div className="login-field">
            <label htmlFor="password" className="login-label">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className={`login-input${errors.password ? " login-input-error" : ""}`}
              value={fields.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
            {errors.password && <div className="login-message login-message-error">{errors.password}</div>}
          </div>
          <div style={{ textAlign: 'right', marginBottom: '1em' }}>
            <button
              type="button"
              className="login-link"
              style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', padding: 0 }}
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </button>
          </div>
          <div className="login-actions">
            <button
              type="submit"
              className="login-btn login-btn-primary"
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </div>
        </form>
        {message.text && (
          <div
            className={`login-message ${message.type === "success" ? "login-message-success" : "login-message-error"}`}
          >
            {message.text}
          </div>
        )}
        <div className="login-footer">
          Don't have an account?{" "}
          <button
            className="login-link"
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
} 