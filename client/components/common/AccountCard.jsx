import React, { useState } from 'react';
import './AccountCard.css';
import UserDetailsModal from './UserDetailsModal';

const AccountCard = ({ account, onAccept, onReject, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const initial = (account.firstName || account.name || 'U').charAt(0).toUpperCase();

  return (
    <>
      <div
        className="account-card clickable-account-card"
        onClick={() => setShowDetails(true)}
        style={{ cursor: 'pointer' }}
        tabIndex={0}
      >
        <div className="account-avatar">
          <span>{initial}</span>
        </div>
        <div className="account-info modern-account-info">
          <div className="account-name-row">
            <span className="account-name">{account.firstName} {account.lastName}</span>
            <span className="account-role">{account.role}</span>
          </div>
          <span className="account-email">{account.email}</span>
        </div>
        <div className="account-actions modern-account-actions">
          {onDelete ? (
            <button className="modern-outline-btn delete-btn" onClick={e => { e.stopPropagation(); onDelete(); }}>Delete</button>
          ) : (
            <>
              <button className="modern-outline-btn accept-btn" onClick={e => { e.stopPropagation(); onAccept(); }}>Accept</button>
              <button className="modern-outline-btn reject-btn" onClick={e => { e.stopPropagation(); onReject(); }}>Reject</button>
            </>
          )}
        </div>
      </div>
      <UserDetailsModal
        user={account}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
};

export default AccountCard; 