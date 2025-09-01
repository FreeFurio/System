import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      // TODO: Replace with your backend endpoint
      const response = await fetch(`${import.meta.env.VITE_API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setMessage('Password reset instructions sent to your email.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="title">Reset Password</h2>
        <p className="subtitle">Enter your email to receive reset instructions</p>
      </div>
      
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            id="forgot-email"
            type="email"
            className="input"
            placeholder=" "
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <label className="label" htmlFor="forgot-email">Email Address</label>
        </div>
        
        <button className="signup-button" type="submit">
          Send Reset Link
        </button>
      </form>
      
      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}
      
      <div className="form-footer">
        <button className="back-button" onClick={() => navigate('/login')}>
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default ForgotPassword; 