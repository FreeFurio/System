import React, { useState } from 'react';
import './AccountCard.css';
import UserDetailsModal from './UserDetailsModal';
import { FiMail, FiUser, FiCalendar, FiCheck, FiX, FiEdit, FiTrash2 } from 'react-icons/fi';
import { hoverEffects } from '../../styles/designSystem';

const formatRole = (role) => role.replace(/([a-z])([A-Z])/g, '$1 $2');

const AccountCard = ({ account, onAccept, onReject, onDelete, onModify, isApproved = false }) => {
  const [showDetails, setShowDetails] = useState(false);
  const initial = (account.firstName || 'U').charAt(0).toUpperCase();

  const getRoleColor = (role) => {
    const colors = {
      'ContentCreator': '#ff6b35',
      'MarketingLead': '#ff9a56', 
      'GraphicDesigner': '#ff8142'
    };
    return colors[role] || '#ff7a47';
  };

  return (
    <>
      <div
        className="account-card-new"
        onClick={() => setShowDetails(true)}
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '20px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          userSelect: 'none'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
          e.currentTarget.style.transform = 'translateY(-2px)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
          e.currentTarget.style.transform = 'translateY(0)';
        }}
      >
        {/* Header with Icon and Title */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', background: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: isApproved && account.profilePicture ? 'transparent' : 
                         isApproved ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                         'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '20px',
              fontWeight: '600',
              overflow: 'hidden'
            }}>
              {isApproved && account.profilePicture ? (
                <img 
                  src={account.profilePicture} 
                  alt={`${account.firstName} ${account.lastName}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <FiUser size={24} />
              )}
            </div>
            <div style={{ background: '#fff' }}>
              <div className="text-bg" style={{
                fontSize: '18px',
                fontWeight: '700',
                color: '#1f2937',
                marginBottom: '4px',
                letterSpacing: '-0.025em',
                background: '#fff'
              }}>
                {account.firstName} {account.lastName}
              </div>
              <div className="text-bg" style={{
                fontSize: '14px',
                color: '#6b7280',
                fontWeight: '500',
                background: '#fff'
              }}>
                {formatRole(account.role)}
              </div>
            </div>
          </div>
          <span style={{
            background: isApproved ? '#d1fae5' : '#fed7aa',
            color: isApproved ? '#065f46' : '#9a3412',
            padding: '4px 8px',
            borderRadius: '6px',
            fontSize: '11px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {isApproved ? 'APPROVED' : 'PENDING'}
          </span>
        </div>

        <div style={{ marginBottom: '20px', background: '#fff' }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#374151', 
            marginBottom: '8px',
            background: '#fff'
          }}>
            Account Details:
          </div>
          <div style={{ 
            fontSize: '16px', 
            color: '#1f2937', 
            lineHeight: '1.6',
            fontWeight: '500',
            background: '#fff'
          }}>
            {account.email}
          </div>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
          padding: '20px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>
              {isApproved ? 'Member since:' : 'Created:'}
            </div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>
              {new Date().toLocaleDateString()}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Role:</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>
              {formatRole(account.role)}
            </div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Status:</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>
              {isApproved ? 'Active' : 'Pending'}
            </div>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'flex-end',
          marginTop: '24px'
        }}>
          {onDelete && (
            <>
              {onModify && (
                <button
                  onClick={(e) => { e.stopPropagation(); onModify(); }}
                  style={{
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '13px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    height: '36px',
                    transition: 'all 0.2s ease',
                    boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-1px)';
                    e.target.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)';
                  }}
                >
                  <FiEdit size={14} />
                  Modify
                </button>
              )}
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(); }}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  height: '36px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.2)';
                }}
              >
                <FiTrash2 size={14} />
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
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  height: '36px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)';
                }}
              >
                <FiCheck size={14} />
                Accept
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onReject(); }}
                style={{
                  background: '#ef4444',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  height: '36px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.2)';
                }}
              >
                <FiX size={14} />
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
        isApproved={isApproved}
      />
    </>
  );
};

export default AccountCard;