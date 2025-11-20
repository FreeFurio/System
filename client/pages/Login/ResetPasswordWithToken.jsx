import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PasswordInput from '../../components/shared/PasswordInput';
import Toast from '../../components/common/Toast';

const ResetPasswordWithToken = () => {
  const [fields, setFields] = useState({
    token: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('error');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFields(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const errors = {};
    if (!fields.token) errors.token = true;
    if (!fields.newPassword) errors.newPassword = true;
    if (!fields.confirmPassword) errors.confirmPassword = true;
    
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      setToastMessage('Please fill in all fields.');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    if (fields.newPassword !== fields.confirmPassword) {
      setErrors({ confirmPassword: true });
      setToastMessage('Passwords do not match.');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    if (fields.newPassword.length < 8) {
      setErrors({ newPassword: true });
      setToastMessage('Password must be at least 8 characters long.');
      setToastType('error');
      setShowToast(true);
      return;
    }
    
    setErrors({});
    
    setLoading(true);
    
    try {
      const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3000';
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/reset-password-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: fields.token,
          newPassword: fields.newPassword,
          confirmPassword: fields.confirmPassword
        }),
      });
      
      const result = await response.json();
      
      if (response.ok && result.status === 'success') {
        setToastMessage('Password updated successfully! Redirecting to login...');
        setToastType('success');
        setShowToast(true);
        setTimeout(() => navigate('/login'), 2000);
      } else {
        setToastMessage(result.message || 'Failed to reset password. Please try again.');
        setToastType('error');
        setShowToast(true);
      }
    } catch (err) {
      setToastMessage('Network error. Please try again.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <div className="form-header">
        <h2 className="title">Reset Password</h2>
        <p className="subtitle">Enter the code from your email and your new password</p>
      </div>
      
      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <div className="password-input-wrapper">
            <input
              id="reset-token"
              type="text"
              name="token"
              className={`input${errors.token ? " error" : ""}`}
              placeholder=" "
              value={fields.token}
              onChange={handleChange}
              required
            />
            <label className="label" htmlFor="reset-token">Reset Code</label>
          </div>
        </div>
        
        <div className="form-group">
          <PasswordInput
            value={fields.newPassword}
            onChange={handleChange}
            name="newPassword"
            placeholder=" "
            label="New Password"
            error={errors.newPassword}
            required
          />
        </div>
        
        <div className="form-group">
          <PasswordInput
            value={fields.confirmPassword}
            onChange={handleChange}
            name="confirmPassword"
            placeholder=" "
            label="Confirm New Password"
            error={errors.confirmPassword}
            required
          />
        </div>
        
        <button 
          className="signup-button" 
          type="submit"
          disabled={loading}
        >
          {loading ? (
            <>
              <span className="loading"></span>
              Updating Password...
            </>
          ) : (
            'Update Password'
          )}
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

export default ResetPasswordWithToken;