import React from "react";
import { FiX, FiUser, FiMail, FiPhone, FiMapPin, FiCalendar, FiBriefcase, FiKey, FiCheck, FiEdit, FiTrash2, FiCheckCircle, FiClock } from "react-icons/fi";

const EXCLUDE_KEYS = [
  'key', 'password', 'otp', 'registrationCompleted', 'verified', 'registrationCompleted', 'expiresAt', 'createdAt', 'registrationDate', 'profilePicture'
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
const UserDetailsModal = ({ user, isOpen, onClose, onAccept, onReject, onModify, onDelete, isApproved = false }) => {
  if (!isOpen || !user) return null;
  
  const initial = (user.firstName || user.username || 'U').charAt(0).toUpperCase();
  
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000,
      backdropFilter: "blur(4px)"
    }}>
      <div style={{
        background: "#ffffff", 
        padding: 0, 
        borderRadius: 16, 
        width: 700, 
        maxHeight: '85vh',
        position: "relative", 
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
        border: '1px solid #e5e7eb',
        fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          padding: '32px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          color: '#fff',
          borderRadius: '16px 16px 0 0'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '16px',
              background: isApproved && user.profilePicture ? 'transparent' : 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#ffffff',
              overflow: 'hidden',
              boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
            }}>
              {isApproved && user.profilePicture ? (
                <img 
                  src={user.profilePicture} 
                  alt={`${user.firstName} ${user.lastName}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                initial
              )}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '28px', fontWeight: 700, letterSpacing: '-0.025em', color: '#ffffff' }}>
                {user.firstName} {user.lastName}
              </h2>
              <p style={{ margin: '8px 0 0 0', fontSize: '16px', fontWeight: 500, color: 'rgba(255,255,255,0.9)' }}>
                {user.role?.replace(/([a-z])([A-Z])/g, '$1 $2') || 'User'}
              </p>
              <div style={{
                marginTop: '8px',
                background: 'rgba(255,255,255,0.2)',
                color: '#fff',
                padding: '4px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '600',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {isApproved ? (
                  <>
                    <FiCheckCircle size={12} />
                    APPROVED
                  </>
                ) : (
                  <>
                    <FiClock size={12} />
                    PENDING
                  </>
                )}
              </div>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              border: 'none', 
              borderRadius: '8px', 
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#ffffff',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.2)'}
            onMouseLeave={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div style={{ padding: '32px', overflowY: 'auto', flex: 1, background: '#ffffff' }}>
          <div style={{ marginBottom: '24px', background: '#fff' }}>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: '700', 
              color: '#374151', 
              marginBottom: '16px',
              background: '#fff'
            }}>
              Account Information:
            </div>
          </div>
          
          {user.createdAt && (
            <div style={{
              marginBottom: '24px',
              padding: '20px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '12px',
              border: '1px solid #e2e8f0'
            }}>
              <div style={{ marginBottom: '8px' }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>
                  {isApproved ? 'Member since:' : 'Account Created:'}
                </div>
                <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>
                  {formatDate(user.createdAt)}
                </div>
              </div>
            </div>
          )}
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px',
            marginBottom: '20px',
            padding: '20px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            {Object.entries(user)
              .filter(([key]) => !EXCLUDE_KEYS.includes(key))
              .map(([key, value]) => {
                const getIcon = (key) => {
                  const iconMap = {
                    firstName: FiUser, lastName: FiUser, email: FiMail, 
                    contactNumber: FiPhone, city: FiMapPin, state: FiMapPin, 
                    country: FiMapPin, zipCode: FiMapPin, username: FiKey, role: FiBriefcase
                  };
                  return iconMap[key] || FiUser;
                };
                
                const getIconColor = (key) => {
                  const colorMap = {
                    firstName: '#3b82f6', lastName: '#3b82f6', email: '#ef4444', 
                    contactNumber: '#10b981', city: '#f59e0b', state: '#f59e0b', 
                    country: '#8b5cf6', zipCode: '#f59e0b', username: '#6366f1', role: '#059669'
                  };
                  return colorMap[key] || '#6b7280';
                };
                
                const IconComponent = getIcon(key);
                const iconColor = getIconColor(key);
                
                return (
                  <div key={key}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>
                      {(LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())) + ':'}
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>
                      {key === 'role' ? (value?.replace(/([a-z])([A-Z])/g, '$1 $2') || value) : 
                       key === 'lastLogin' ? formatDate(value) : 
                       String(value)}
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
        
        {(onAccept || onReject || onModify || onDelete) && (
          <div style={{
            padding: '24px 32px',
            borderTop: '1px solid #e5e7eb',
            background: '#f8fafc',
            borderRadius: '0 0 16px 16px',
            display: 'flex',
            gap: '16px',
            justifyContent: 'flex-end'
          }}>
            {onAccept && (
              <button
                onClick={() => { onAccept(); onClose(); }}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 12,
                  minWidth: 120,
                  height: 48,
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '0 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(16,185,129,0.4)';
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)';
                }}
              >
                <FiCheck size={16} />
                Accept
              </button>
            )}
            {onReject && (
              <button
                onClick={() => { onReject(); onClose(); }}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 12,
                  minWidth: 120,
                  height: 48,
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '0 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.3)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(239,68,68,0.4)';
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)';
                }}
              >
                <FiX size={16} />
                Reject
              </button>
            )}
            {onModify && (
              <button
                onClick={() => { onModify(); onClose(); }}
                style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none',
                  color: '#fff',
                  borderRadius: 12,
                  minWidth: 120,
                  height: 48,
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '0 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)'
                }}
                onMouseEnter={e => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(16,185,129,0.4)';
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16,185,129,0.3)';
                }}
              >
                <FiEdit size={16} />
                Modify
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => { onDelete(); onClose(); }}
                style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  border: 'none',
                  color: '#ffffff',
                  borderRadius: 12,
                  minWidth: 120,
                  height: 48,
                  fontWeight: 700,
                  fontSize: '14px',
                  padding: '0 24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(239,68,68,0.3)'
                }}
                onMouseEnter={e => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(239,68,68,0.4)';
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(239,68,68,0.3)';
                }}
              >
                <FiTrash2 size={16} />
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