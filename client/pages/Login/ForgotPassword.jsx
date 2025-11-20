import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Toast from '../../components/common/Toast';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
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
      setErrors({ email: true });
      setToastMessage(['Missing Fields:', 'Email Address']);
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    if (!validateEmail(email)) {
      setErrors({ email: true });
      setToastMessage('Please enter a valid email address');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    setErrors({});
    
    try {
      const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        setToastMessage('Password reset instructions sent to your email.');
        setToastType('success');
        setShowToast(true);
        setTimeout(() => navigate('/login'), 3000);
      } else {
        setToastMessage(result.message || 'Failed to send reset email. Please try again.');
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
    <>
      <div className="form-container">
        <div className="form-header">
          <h2 className="title">Reset Password</h2>
          <p className="subtitle">Enter your email to receive reset instructions</p>
        </div>
        
        <form className="form" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <div className="password-input-wrapper">
              <input
                id="forgot-email"
                type="email"
                className={`input${errors.email ? " error" : ""}`}
                placeholder=" "
                value={email}
                onChange={e => { setEmail(e.target.value); setErrors({}); }}
              />
              <label className="label" htmlFor="forgot-email">Email Address</label>
            </div>
          </div>
          
          <button className="signup-button" type="submit">
            Send Reset Link
          </button>
        </form>
        
        <div className="form-footer">
          <span>Already have a reset code?</span>
          <button className="link" onClick={() => navigate('/reset-password')}>
            Enter Reset Code
          </button>
          <button className="back-button" onClick={() => navigate('/login')}>
            Back to Login
          </button>
        </div>
      </div>
      
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default ForgotPassword; 