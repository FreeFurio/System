import React from "react";
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar } from "react-icons/fi";

const EXCLUDE_KEYS = [
  'key', 'password', 'otp', 'registrationCompleted', 'verified', 'registrationCompleted', 'expiresAt', 'createdAt', 'registrationDate'
];
const LABELS = {
  firstName: 'First Name',
  lastName: 'Last Name',
  city: 'City',
  contactNumber: 'Contact Number',
  country: 'Country',
  email: 'Email',
  role: 'Role',
  state: 'State',
  username: 'Username',
  zipCode: 'Zip Code',
};
const ICONS = {
  firstName: FiUser,
  lastName: FiUser,
  email: FiMail,
  contactNumber: FiPhone,
  city: FiMapPin,
  state: FiMapPin,
  country: FiMapPin,
  zipCode: FiMapPin,
  username: FiUser,
  role: FiUser,
};
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const UserDetailsModal = ({ user, isOpen, onClose, onAccept, onReject, onModify, onDelete }) => {
  if (!isOpen || !user) return null;
  
  const initial = (user.firstName || user.username || 'U').charAt(0).toUpperCase();
  
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      backdropFilter: "blur(4px)"
    }}>
      <div style={{
        background: "linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)", 
        padding: 0, 
        borderRadius: 0, 
        width: 420, 
        maxHeight: '80vh',
        position: "relative", 
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        border: '1px solid #e2e8f0',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #e53e3e 0%, #c53030 100%)',
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#fff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#fbbf24',
              border: '3px solid rgba(255,255,255,0.3)'
            }}>
              {initial}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, letterSpacing: '-0.025em' }}>
                {user.firstName} {user.lastName}
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.9rem', opacity: 0.9, fontWeight: 500 }}>
                {user.role?.replace(/([a-z])([A-Z])/g, '$1 $2') || 'User'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255,255,255,0.2)', 
              border: 'none', 
              borderRadius: '50%', 
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#fff'
            }}
          >
            <FiX size={20} />
          </button>
        </div>
        
        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
          {user.createdAt && (
            <div style={{ 
              marginBottom: '24px', 
              padding: '16px', 
              background: '#f1f5f9', 
              border: '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FiCalendar size={16} color="#64748b" />
              <div>
                <span style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>Member since</span>
                <div style={{ fontSize: '0.95rem', color: '#1a202c', fontWeight: 600, marginTop: '2px' }}>
                  {formatDate(user.createdAt)}
                </div>
              </div>
            </div>
          )}
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {Object.entries(user)
              .filter(([key]) => !EXCLUDE_KEYS.includes(key))
              .map(([key, value]) => {
                const Icon = ICONS[key];
                return (
                  <div key={key} style={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    gap: '10px'
                  }}>
                    {Icon && <Icon size={16} color="#64748b" />}
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500, marginBottom: '2px' }}>
                        {LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}
                      </div>
                      <div style={{ fontSize: '0.95rem', color: '#1a202c', fontWeight: 600 }}>
                        {key === 'role' ? (value?.replace(/([a-z])([A-Z])/g, '$1 $2') || value) : String(value)}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        
        {/* Action Buttons */}
        {(onAccept || onReject || onModify || onDelete) && (
          <div style={{
            padding: '20px 24px',
            borderTop: '1px solid #e2e8f0',
            background: '#f8fafc',
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end'
          }}>
            {onAccept && (
              <button
                onClick={() => { onAccept(); onClose(); }}
                style={{
                  background: '#10b981',
                  border: '1.5px solid #10b981',
                  color: '#fff',
                  borderRadius: 10,
                  minWidth: 80,
                  height: 36,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  padding: '0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(16,185,129,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Accept
              </button>
            )}
            {onReject && (
              <button
                onClick={() => { onReject(); onClose(); }}
                style={{
                  background: '#fff',
                  border: '1.5px solid #f87171',
                  color: '#f87171',
                  borderRadius: 10,
                  minWidth: 80,
                  height: 36,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  padding: '0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(248,113,113,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Reject
              </button>
            )}
            {onModify && (
              <button
                onClick={() => { onModify(); onClose(); }}
                style={{
                  background: '#fff',
                  border: '1.5px solid #3b82f6',
                  color: '#3b82f6',
                  borderRadius: 10,
                  minWidth: 80,
                  height: 36,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  padding: '0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(59,130,246,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Modify
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => { onDelete(); onClose(); }}
                style={{
                  background: '#fff',
                  border: '1.5px solid #f87171',
                  color: '#f87171',
                  borderRadius: 10,
                  minWidth: 80,
                  height: 36,
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  padding: '0 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 8px rgba(248,113,113,0.15)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                Delete
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDetailsModal; 