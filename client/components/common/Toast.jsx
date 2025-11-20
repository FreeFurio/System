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
        <div className="toast-message">
          {Array.isArray(message) ? (
            <>
              <div style={{ marginBottom: '4px' }}>{message[0]}</div>
              {message.slice(1).map((field, index) => (
                <div key={index} style={{ paddingLeft: '8px' }}>• {field}</div>
              ))}
            </>
          ) : (
            message
          )}
        </div>
      </div>
    </div>
  );
};

export default Toast;