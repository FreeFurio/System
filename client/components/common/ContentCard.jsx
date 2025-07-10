import React from 'react';
import './AccountCard.css'; // Reuse the same styles for consistency

const ContentCard = ({ content, onDelete, showDelete = true, onClick }) => (
  <div className="account-card" onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
    <div className="account-info">
      <strong>{content.title || 'Untitled Content'}</strong><br />
      <span>{content.description || ''}</span>
    </div>
    <div className="account-actions">
      {showDelete && (
        <button className="delete-btn" onClick={e => { e.stopPropagation(); onDelete && onDelete(); }}>Delete</button>
      )}
    </div>
  </div>
);

export default ContentCard; 