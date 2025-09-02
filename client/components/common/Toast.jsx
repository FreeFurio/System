import React, { useEffect } from 'react';
import './Toast.css';

const Toast = ({ message, type = 'error', onClose, duration = 3000 }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  return (
    <div className={`toast toast-${type}`}>
      <div className="toast-content">
        <span className="toast-icon">
          {type === 'error' ? '!' : type === 'success' ? '✓' : 'i'}
        </span>
        <span className="toast-message">{message}</span>
      </div>
    </div>
  );
};

export default Toast;