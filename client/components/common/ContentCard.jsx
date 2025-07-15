import React, { useState } from 'react';
import './AccountCard.css';
import { FiTrash2 } from 'react-icons/fi';
import UserDetailsModal from './UserDetailsModal';

const getStatusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'approved': return '#2563eb';
    case 'pending': return '#fbbf24';
    case 'rejected': return '#f87171';
    default: return '#a3a3a3';
  }
};

const getAvatarColor = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const h = hash % 360;
  return `hsl(${h}, 70%, 86%)`;
};

const ContentCard = ({ content, onDelete, showDelete = true }) => {
  const [showDetails, setShowDetails] = useState(false);
  const initial = (content.title || 'C').charAt(0).toUpperCase();
  const avatarColor = getAvatarColor(content.title || 'C');
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
            <span className="account-name">{content.title || 'Untitled Content'}</span>
            {content.status && (
              <span className="account-role" style={{ color: getStatusColor(content.status) }}>{content.status}</span>
            )}
          </div>
          <span className="account-email">{content.description || ''}</span>
        </div>
        <div className="account-actions modern-account-actions">
          {showDelete && (
            <button
              className="modern-icon-btn delete-icon-btn labeled-delete-btn"
              title="Delete Content"
              aria-label={`Delete content ${content.title}`}
              onClick={e => { e.stopPropagation(); onDelete && onDelete(); }}
            >
              <FiTrash2 style={{ marginRight: 6, fontSize: '1.1em' }} /> Delete
            </button>
          )}
        </div>
      </div>
      <UserDetailsModal
        user={content}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
      />
    </>
  );
};

export default ContentCard;