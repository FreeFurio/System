import React from 'react';
import './AccountCard.css';
import { FiArrowRight } from 'react-icons/fi';

const getStatusColor = (status) => {
  switch ((status || '').toLowerCase()) {
    case 'approved': return '#2563eb';
    case 'pending': return '#fbbf24';
    case 'rejected': return '#f87171';
    default: return '#a3a3a3';
  }
};

const ContentCard = ({ content, onDelete, showDelete = true, onClick }) => (
  <div className="modern-task-card clickable-task-card" onClick={onClick} tabIndex={0} style={{ cursor: 'pointer' }}>
    <div className="modern-task-card-avatar">
      {content.avatarUrl ? (
        <img src={content.avatarUrl} alt="avatar" />
      ) : (
        <span>{(content.title || 'C').charAt(0).toUpperCase()}</span>
      )}
    </div>
    <div className="modern-task-card-content">
      <div className="modern-task-card-header">
        <span className="modern-task-card-title">{content.title || 'Untitled Content'}</span>
        {content.status && (
          <span className="modern-task-card-status" style={{ background: getStatusColor(content.status) }}>
            {content.status}
          </span>
        )}
      </div>
      <div className="modern-task-card-desc">{content.description || ''}</div>
    </div>
    <button className="task-card-action-btn" tabIndex={-1} onClick={e => { e.stopPropagation(); onClick && onClick(); }}>
      View <FiArrowRight style={{ marginLeft: 6 }} />
    </button>
  </div>
);

export default ContentCard; 