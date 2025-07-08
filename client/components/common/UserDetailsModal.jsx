import React from "react";

const UserDetailsModal = ({ user, isOpen, onClose }) => {
  if (!isOpen || !user) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.3)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#fff", padding: 24, borderRadius: 8, minWidth: 320, maxWidth: 500, position: "relative"
      }}>
        <button onClick={onClose} style={{ position: "absolute", top: 8, right: 8 }}>Close</button>
        <h2>User Details</h2>
        {Object.entries(user).map(([key, value]) => (
          <div key={key}><strong>{key}:</strong> {String(value)}</div>
        ))}
      </div>
    </div>
  );
};

export default UserDetailsModal; 