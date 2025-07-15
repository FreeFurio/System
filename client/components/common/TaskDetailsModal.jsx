import React from "react";

const TaskDetailsModal = ({ task, isOpen, onClose }) => {
  if (!isOpen || !task) return null;
  return (
    <div style={{
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.18)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{
        background: "#fff",
        padding: '36px 32px 28px 32px',
        borderRadius: 18,
        minWidth: 340,
        maxWidth: 480,
        position: "relative",
        boxShadow: '0 8px 32px rgba(44,75,255,0.13), 0 2px 8px rgba(0,0,0,0.10)',
        fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
        fontSize: '1.08rem',
        color: '#222',
        letterSpacing: '0.01em',
      }}>
        <button onClick={onClose} style={{
          position: "absolute",
          top: 14,
          right: 14,
          fontSize: 22,
          background: '#2563eb',
          color: '#fff',
          border: 'none',
          borderRadius: '50%',
          width: 36,
          height: 36,
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(44,75,255,0.10)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'background 0.2s',
        }}
        onMouseOver={e => e.currentTarget.style.background = '#1d4ed8'}
        onMouseOut={e => e.currentTarget.style.background = '#2563eb'}
        aria-label="Close">
          ×
        </button>
        <h2 style={{
          fontFamily: 'Inter, Segoe UI, Arial, sans-serif',
          fontWeight: 600,
          fontSize: '1.18rem',
          marginBottom: 18,
          color: '#222',
          letterSpacing: '0.01em',
          textTransform: 'none',
        }}>Task Details</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {Object.entries(task).map(([key, value]) => (
            <div key={key} style={{ marginBottom: 2, display: 'flex', gap: 8 }}>
              <span style={{ fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontWeight: 600, color: '#222', minWidth: 90, fontSize: '1.01rem', textTransform: 'none', letterSpacing: '0.01em' }}>{key}:</span>
              <span style={{ color: '#374151', wordBreak: 'break-word', fontFamily: 'Inter, Segoe UI, Arial, sans-serif', fontSize: '1.01rem' }}>{String(value)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailsModal; 