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
      const response = await fetch('http://localhost:3000/forgot-password', {
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
    <div className="main">
      <div className="form-container">
        <h2 className="title">Forgot Password</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label" htmlFor="forgot-email">Email</label>
            <input
              id="forgot-email"
              type="email"
              className="input"
              placeholder="Enter your email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <button className="signup-button" type="submit">Send Reset Link</button>
        </form>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
        <button className="back-button" onClick={() => navigate('/login')} style={{marginTop: 8}}>Back to Login</button>
      </div>
    </div>
  );
};

export default ForgotPassword; 