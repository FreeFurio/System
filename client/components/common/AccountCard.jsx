import React from 'react';
import './AccountCard.css';

// Props:
// - account: user object
// - onAccept: function (optional)
// - onReject: function (optional)
// - onDelete: function (optional)
// If onDelete is provided, show only the Delete button.
const AccountCard = ({ account, onAccept, onReject, onDelete }) => (
  <div className="account-card">
    <div className="account-info">
      <strong>{account.firstName} {account.lastName}</strong> ({account.role})<br />
      <span>{account.email}</span>
    </div>
    <div className="account-actions">
      {onDelete ? (
        // Show only Delete button for Manage Accounts
        <button className="delete-btn" onClick={onDelete}>Delete</button>
      ) : (
        // Show Accept/Reject for Approval of Accounts
        <>
          <button className="accept-btn" onClick={onAccept}>Accept</button>
          <button className="reject-btn" onClick={onReject}>Reject</button>
        </>
      )}
    </div>
  </div>
);

export default AccountCard; 