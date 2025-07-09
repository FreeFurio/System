import React from 'react';
import './AccountCard.css'; // Reuse the same styles for consistency

const ContentCard = ({ content, onDelete }) => (
  <div className="account-card">
    <div className="account-info">
      <strong>{content.title || 'Untitled Content'}</strong><br />
      <span>{content.description || ''}</span>
    </div>
    <div className="account-actions">
      <button className="delete-btn" onClick={onDelete}>Delete</button>
    </div>
  </div>
);

export default ContentCard; 