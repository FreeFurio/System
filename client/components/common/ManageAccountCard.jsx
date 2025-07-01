import React from 'react';
import './AccountCard.css'; // Reuse the same styles for consistency

const ManageAccountCard = ({ account, onDelete }) => (
  <div className="account-card">
    <div className="account-info">
      <strong>{account.name}</strong> <br />
      <span>{account.email}</span>
    </div>
    <div className="account-actions">
      <button className="reject-btn" onClick={onDelete}>Delete</button>
    </div>
  </div>
);

export default ManageAccountCard; 