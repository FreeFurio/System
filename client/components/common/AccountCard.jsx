import React, { useState } from 'react';
import './AccountCard.css';
import UserDetailsModal from './UserDetailsModal';

// Props:
// - account: user object
// - onAccept: function (optional)
// - onReject: function (optional)
// - onDelete: function (optional)
// If onDelete is provided, show only the Delete button.
const AccountCard = ({ account, onAccept, onReject, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <>
      <div
        className="account-card"
        onClick={() => setShowDetails(true)}
        style={{ cursor: 'pointer' }}
      >
        <div className="account-info">
          <strong>{account.firstName} {account.lastName}</strong> ({account.role})<br />
          <span>{account.email}</span>
        </div>
        <div className="account-actions">
          {onDelete ? (
            // Show only Delete button for Manage Accounts
            <button className="delete-btn" onClick={e => { e.stopPropagation(); onDelete(); }}>Delete</button>
          ) : (
            // Show Accept/Reject for Approval of Accounts
            <>
              <button className="accept-btn" onClick={e => { e.stopPropagation(); onAccept(); }}>Accept</button>
              <button className="reject-btn" onClick={e => { e.stopPropagation(); onReject(); }}>Reject</button>
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