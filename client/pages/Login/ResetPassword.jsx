import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [retype, setRetype] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');
    if (password !== retype) {
      setError('Passwords do not match.');
      return;
    }
    try {
      const res = await fetch('http://localhost:3000/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      if (res.ok) {
        setMessage('Password reset successful! Redirecting to login...');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setError('Failed to reset password. Please try again.');
      }
    } catch {
      setError('Network error. Please try again.');
    }
  };

  return (
    <div className="main">
      <div className="form-container">
        <h2 className="title">Reset Password</h2>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="label" htmlFor="reset-password">New Password</label>
            <input
              id="reset-password"
              type="password"
              className="input"
              placeholder="New password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="label" htmlFor="reset-retype">Retype Password</label>
            <input
              id="reset-retype"
              type="password"
              className="input"
              placeholder="Retype new password"
              value={retype}
              onChange={e => setRetype(e.target.value)}
              required
            />
          </div>
          <button className="signup-button" type="submit">Reset Password</button>
        </form>
        {message && <div className="success-message">{message}</div>}
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
} 