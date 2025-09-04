import React, { useState } from "react";

export default function OTPModal({ show, onSubmit, onClose, loading, error }) {
  const [otp, setOtp] = useState("");

  if (!show) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(otp);
  };

  return (
    <div className="otp-modal-backdrop">
      <div className="otp-modal">
        <div className="modal-header">
          <h2 className="modal-title">Verify Your Email</h2>
          <p className="modal-subtitle">Enter the 6-digit code sent to your email</p>
        </div>
        
        <form className="modal-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              autoFocus
              required
              placeholder=" "
              className="input otp-input"
            />
            <label className="label">Verification Code</label>
          </div>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="otp-button-row">
            <button 
              className="otp-verify-btn" 
              type="submit"
              disabled={loading || otp.length !== 6}
            >
              {loading ? (
                <>
                  <span className="loading"></span>
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </button>
            <button
              className="otp-cancel-btn"
              type="button"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

