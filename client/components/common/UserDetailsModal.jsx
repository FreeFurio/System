import React from "react";
import "./UserDetailsModal.css";

const HIDDEN_FIELDS = [
  "key",
  "password",
  "otp",
  "createdat",
  "createdAt",
  "expires at",
  "expiresAt",
  "registration complete",
  "registrationComplete",
  "verified"
];

const UserDetailsModal = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;
  return (
    <div className="user-modal-overlay">
      <div className="user-modal-content">
        <button className="user-modal-close" onClick={onClose}>×</button>
        <h2>User Details</h2>
        {Object.entries(user)
          .filter(([key]) => !HIDDEN_FIELDS.includes(key.toLowerCase().replace(/\s+/g, "")))
          .map(([key, value]) => (
            <div key={key}><strong>{key}:</strong> {String(value)}</div>
          ))}
      </div>
    </div>
  );
};

export default UserDetailsModal; 