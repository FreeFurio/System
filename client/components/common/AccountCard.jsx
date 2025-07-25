import React, { useState } from 'react';
import './AccountCard.css';
import UserDetailsModal from './UserDetailsModal';
import { FiTrash2 } from 'react-icons/fi';

const formatRole = (role) => role.replace(/([a-z])([A-Z])/g, '$1 $2');

const AccountCard = ({ account, onAccept, onReject, onDelete }) => {
  const [showDetails, setShowDetails] = useState(false);
  const initial = (account.firstName || account.name || 'U').charAt(0).toUpperCase();

  return (
    <>
      <div
        className="account-card clickable-account-card modern-flat-card"
        onClick={() => setShowDetails(true)}
        style={{
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          boxShadow: '0 2px 8px rgba(44,75,255,0.07)',
          border: '1.5px solid #e0e7ff',
          borderRadius: 0,
          background: '#fff',
          padding: '7px 10px',
          gap: 7,
          margin: 0,
          minHeight: 0,
          maxWidth: '100%',
        }}
        tabIndex={0}
      >
        <div className="account-avatar modern-account-avatar" style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: '#e0e7ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 13,
          fontWeight: 700,
          color: '#2563eb',
          marginRight: 10,
          flexShrink: 0,
        }}>
          <span>{initial}</span>
        </div>
        <div className="account-info modern-account-info" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          minWidth: 0,
        }}>
          <span className="account-name" style={{
            fontSize: '0.96rem',
            fontWeight: 700,
            color: '#222',
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: 'block',
          }}>{account.firstName} {account.lastName}</span>
          <span className="account-role" style={{
            fontSize: '0.83rem',
            color: '#6b7280',
            fontWeight: 500,
            margin: 0,
            textTransform: 'capitalize',
            display: 'block',
          }}>{formatRole(account.role)}</span>
          <span className="account-email" style={{
            color: '#6b7280',
            fontSize: '0.87rem',
            fontWeight: 400,
            letterSpacing: '0.01em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}>{account.email}</span>
        </div>
        <div className="account-actions modern-account-actions" style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          paddingRight: 0,
          marginLeft: 10,
        }}>
          {onDelete && (
            <button
              className="modern-icon-btn delete-icon-btn labeled-delete-btn"
              style={{
                background: '#fff',
                border: '1.5px solid #f87171',
                color: '#f87171',
                borderRadius: 10,
                minWidth: 52,
                height: 26,
                fontWeight: 600,
                fontSize: '0.82rem',
                padding: '0 7px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 1px 4px rgba(244,67,54,0.06)',
                cursor: 'pointer',
                transition: 'background 0.18s, color 0.18s, border 0.18s, box-shadow 0.18s',
              }}
              title="Delete Account"
              aria-label="Delete Account"
              onClick={e => { e.stopPropagation(); onDelete(); }}
            >
              Delete
            </button>
          )}
          {!onDelete && (
            <>
              <button className="modern-outline-btn accept-btn" style={{marginRight: 8}} onClick={e => { e.stopPropagation(); onAccept(); }}>Accept</button>
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