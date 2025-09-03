import React, { useState } from 'react';
import './AccountCard.css';
import UserDetailsModal from './UserDetailsModal';
import { FiMail, FiUser } from 'react-icons/fi';

const formatRole = (role) => role.replace(/([a-z])([A-Z])/g, '$1 $2');

const AccountCard = ({ account, onAccept, onReject, onDelete, onModify }) => {
  const [showDetails, setShowDetails] = useState(false);
  const initial = (account.firstName || 'U').charAt(0).toUpperCase();

  const getRoleColor = (role) => {
    const colors = {
      'ContentCreator': '#8b5cf6',
      'MarketingLead': '#3b82f6', 
      'GraphicDesigner': '#10b981'
    };
    return colors[role] || '#6b7280';
  };

  return (
    <>
      <div
        className="account-card-new"
        onClick={() => setShowDetails(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px 20px',
          background: 'var(--bg-primary, #fff)',
          border: '1px solid var(--border-primary, #e5e7eb)',
          borderRadius: '8px',
          boxShadow: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          marginBottom: '8px',
          borderLeft: `4px solid ${getRoleColor(account.role)}`,
          userSelect: 'none',
          WebkitUserSelect: 'none',
          MozUserSelect: 'none',
          msUserSelect: 'none',
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
          WebkitTouchCallout: 'none',
          WebkitAppearance: 'none'
        }}
        onMouseEnter={(e) => {
          e.target.style.boxShadow = 'none';
          e.target.style.transform = 'translateY(-1px)';
        }}
        onMouseLeave={(e) => {
          e.target.style.boxShadow = 'none';
          e.target.style.transform = 'translateY(0)';
        }}
        onMouseDown={(e) => e.preventDefault()}
        onFocus={(e) => e.target.blur()}
      >
        {/* Avatar */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          background: `${getRoleColor(account.role)}20`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontWeight: '600',
          color: getRoleColor(account.role),
          marginRight: '12px',
          border: `2px solid ${getRoleColor(account.role)}30`,
          position: 'relative'
        }}>
          {initial}
          <div style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: '#10b981',
            border: '2px solid var(--bg-primary, #fff)'
          }} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: '15px',
            fontWeight: '600',
            color: 'var(--text-primary, #1f2937)',
            marginBottom: '2px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {account.firstName} {account.lastName}
          </div>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '2px'
          }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '500',
              color: getRoleColor(account.role),
              background: `${getRoleColor(account.role)}15`,
              padding: '2px 6px',
              borderRadius: '4px'
            }}>
              {formatRole(account.role)}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            color: 'var(--text-secondary, #6b7280)',
            fontSize: '13px'
          }}>
            <FiMail size={12} />
            <span style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              {account.email}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          marginLeft: '12px'
        }}>
          {onDelete && (
            <>
              {onModify && (
                <button
                  onClick={(e) => { e.stopPropagation(); onModify(); }}
                  style={{
                    background: '#3b82f6',
                    color: '#fff',
                    border: 'none',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <FiUser size={12} />
                  Modify
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </>
          )}
          {!onDelete && (
            <>
              <button
                onClick={(e) => { e.stopPropagation(); onAccept(); }}
                style={{
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Accept
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onReject(); }}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  fontSize: '12px',
                  fontWeight: '500',
                  cursor: 'pointer'
                }}
              >
                Reject
              </button>
            </>
          )}
        </div>
      </div>

      <UserDetailsModal
        user={account}
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        onAccept={onAccept}
        onReject={onReject}
        onModify={onModify}
        onDelete={onDelete}
      />
    </>
  );
};

export default AccountCard;