import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Register.css";
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
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
      <div className="main">
        <div className="form-container">
          <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="main">
      <div className="form-container">
        <h2 className="title">Welcome Back</h2>
        <p className="subtitle">Sign in to access your account</p>
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
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
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>
          <div className="form-group">
            <input
              type="password"
              id="password"
              name="password"
              className={`input${errors.password ? " error" : ""}`}
              value={fields.password}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder=" "
              required
            />
            <label htmlFor="password" className="label">Password</label>
            {errors.password && <div className="error-message">{errors.password}</div>}
          </div>
          <div style={{ textAlign: 'right', marginBottom: '1em' }}>
            <button
              type="button"
              className="link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={() => setShowForgotPassword(true)}
            >
              Forgot Password?
            </button>
          </div>
          <button
            type="submit"
            className="signup-button"
            disabled={loading}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        {message.text && (
          <div
            className={message.type === "success" ? "success-message" : "error-message"}
          >
            {message.text}
          </div>
        )}
        <div className="form-footer">
          <img src="/assets/issalonnails.png" alt="issalonnails" style={{ display: 'block', margin: '0 auto 10px auto', maxWidth: '120px', height: 'auto' }} />
          Don't have an account?{" "}
          <button
            className="link"
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            onClick={() => navigate("/register")}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
} 