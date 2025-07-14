import React from 'react';
import './AccountCard.css';

const ManageAccountCard = ({ account, onDelete }) => {
  const initial = (account.name || 'U').charAt(0).toUpperCase();
  return (
    <div className="account-card clickable-account-card">
      <div className="account-avatar">
        <span>{initial}</span>
      </div>
      <div className="account-info modern-account-info">
        <div className="account-name-row">
          <span className="account-name">{account.name}</span>
        </div>
        <span className="account-email">{account.email}</span>
      </div>
      <div className="account-actions modern-account-actions">
        <button className="modern-outline-btn delete-btn" onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
};

export default ManageAccountCard; 