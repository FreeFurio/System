import React from 'react';

const SocialAccountCard = ({ platform, status, accountInfo, color, onManage }) => {
  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      background: '#f8f9fa'
    }}>
      <h4 style={{ color: color, marginBottom: '10px' }}>{platform}</h4>
      <p style={{ color: '#666', margin: '5px 0' }}>Status: {status}</p>
      <p style={{ color: '#666', margin: '5px 0' }}>{accountInfo}</p>
      <button 
        onClick={onManage}
        style={{
          background: color,
          color: '#fff',
          border: 'none',
          padding: '8px 16px',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Manage
      </button>
    </div>
  );
};

export default SocialAccountCard;