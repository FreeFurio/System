import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/common/Toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setToastMessage('Please fill out this field.');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    if (!validateEmail(email)) {
      setToastMessage('Please enter a valid email address');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (response.ok) {
        setToastMessage('Password reset instructions sent to your email.');
        setToastType('success');
        setShowToast(true);
      } else {
        setToastMessage('Failed to send reset email. Please try again.');
        setToastType('error');
        setShowToast(true);
      }
    } catch (err) {
      setToastMessage('An error occurred. Please try again.');
      setToastType('error');
      setShowToast(true);
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
          <div className="password-input-wrapper">
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
        </div>
        
        <button className="signup-button" type="submit">
          Send Reset Link
        </button>
      </form>
      
      <div className="form-footer">
        <button className="back-button" onClick={() => navigate('/login')}>
          Back to Login
        </button>
      </div>
      
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
};

export default ForgotPassword; 