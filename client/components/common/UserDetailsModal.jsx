import React from "react";

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
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const UserDetailsModal = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#fff", padding: 28, borderRadius: 10, minWidth: 320, maxWidth: 430, position: "relative", boxShadow: '0 4px 24px rgba(0,0,0,0.10)'
      }}>
        <button onClick={onClose} style={{ position: "absolute", top: 10, right: 10, background: '#f3f4f6', border: 'none', borderRadius: 5, padding: '3px 12px', cursor: 'pointer' }}>Close</button>
        <h2 style={{marginBottom: 20}}>User Details</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {user.createdAt && (
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontWeight: 500 }}>Created At:</span>
              <span>{formatDate(user.createdAt)}</span>
            </div>
          )}
          {Object.entries(user)
            .filter(([key]) => !EXCLUDE_KEYS.includes(key))
            .map(([key, value]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 500 }}>{LABELS[key] || key.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase())}:</span>
                <span>{String(value)}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default UserDetailsModal; 