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

const ContentCard = ({ content, onDelete, showDelete = true, showCreateButton = false, taskId }) => {
  const [showDetails, setShowDetails] = useState(false);
  const roleLabel = (content.role || 'U').charAt(0).toUpperCase();
  const avatarColor = '#ef4444';
  return (
    <>
      <div
        className="account-card clickable-account-card modern-flat-card"
        tabIndex={0}
        onClick={() => setShowDetails(true)}
        style={{ cursor: 'pointer' }}
      >
        <div className="content-card-avatar" style={{ background: '#e74c3c', color: '#F6C544' }}>
          <span>{roleLabel}</span>
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
          {showCreateButton && (
            <button
              className="modern-icon-btn"
              style={{
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '8px 16px',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer',
                marginRight: '8px'
              }}
              onClick={e => {
                e.stopPropagation();
                window.location.href = `/content/create?taskId=${taskId}`;
              }}
            >
              Create Content
            </button>
          )}
          {showDelete && (
            <button
              className="modern-icon-btn delete-icon-btn labeled-delete-btn"
              title="Delete Content"
              aria-label={`Delete content ${content.title}`}
              onClick={e => { e.stopPropagation(); onDelete && onDelete(); }}
            >
              <FiTrash2 style={{ marginRight: 6, fontSize: '1.1em', color: '#F6C544' }} /> Delete
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