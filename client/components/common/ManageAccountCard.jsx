import React, { useState } from 'react';
import './AccountCard.css';
import { FiTrash2 } from 'react-icons/fi';
import UserDetailsModal from './UserDetailsModal';

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 86%)`;
};

const ManageAccountCard = ({ account, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const initial = (account.role || 'U').charAt(0).toUpperCase();
  const avatarColor = getAvatarColor(account.name || 'U');
  return (
    <>
      <div
        className="account-card clickable-account-card modern-flat-card"
        tabIndex={0}
        onClick={() => setShowDetails(true)}
        style={{ cursor: 'pointer' }}
      >
        <div className="account-avatar modern-account-avatar" style={{ background: avatarColor }}>
          <span>{initial}</span>
        </div>
        <div className="account-info modern-account-info">
          <div className="account-name-row">
            <span className="account-name">{account.name}</span>
          </div>
          <span className="account-email">{account.email}</span>
        </div>
        <div className="account-actions modern-account-actions">
          <button
            className="modern-icon-btn delete-icon-btn labeled-delete-btn"
            title="Delete Account"
            aria-label={`Delete account for ${account.name}`}
            onClick={e => { e.stopPropagation(); onDelete(); }}
          >
            <FiTrash2 style={{ marginRight: 6, fontSize: '1.1em' }} /> Delete
          </button>
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

export default ManageAccountCard;