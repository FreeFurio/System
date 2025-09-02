import React, { useState } from 'react';
import { FiX, FiLock } from 'react-icons/fi';
import PasswordInput from '../shared/PasswordInput';

const PasswordResetModal = ({ isOpen, username, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.newPassword.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          newPassword: formData.newPassword,
          confirmPassword: formData.confirmPassword
        })
      });

      const result = await response.json();

      if (response.ok) {
        onSuccess();
      } else {
        setError(result.message || 'Failed to reset password');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: 24, width: 400, maxHeight: '90vh',
        boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.15)',
        border: '1px solid rgba(251, 191, 36, 0.2)', fontFamily: 'Inter, sans-serif',
        display: 'flex', flexDirection: 'column', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          height: '6px', background: 'linear-gradient(90deg, #ef4444, #fbbf24, #ef4444, #fbbf24)'
        }}></div>
        
        <div style={{
          background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
          padding: '24px 32px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', color: '#fff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <FiLock size={24} color="#fbbf24" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                Password Reset Required
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
                Please create a new password
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: '32px' }}>
          <div style={{
            background: '#fef3c7', padding: '16px', borderRadius: '12px',
            marginBottom: '24px', border: '1px solid #fcd34d'
          }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>
              🔒 Your administrator has required you to change your password before continuing.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <PasswordInput
                value={formData.newPassword}
                onChange={handleChange}
                name="newPassword"
                placeholder=" "
                label="New Password"
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <PasswordInput
                value={formData.confirmPassword}
                onChange={handleChange}
                name="confirmPassword"
                placeholder=" "
                label="Confirm New Password"
                required
              />
            </div>

            {error && (
              <div style={{
                color: '#ef4444', fontSize: '14px', marginBottom: '20px',
                padding: '12px', background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '8px'
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '16px', background: '#ef4444',
                color: '#fff', border: 'none', borderRadius: '12px',
                fontSize: '1rem', fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px'
              }}
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
        </div>
      </div>
    </div>
  );
};

export default PasswordResetModal;