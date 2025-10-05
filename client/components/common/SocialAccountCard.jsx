import React, { useState } from 'react';

const SocialAccountCard = ({ 
  platform, 
  status, 
  accountInfo, 
  color, 
  account,
  onToggleActive,
  onDelete 
}) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const isActive = account?.active !== false;

  const handleToggleActive = () => {
    if (onToggleActive) {
      onToggleActive(account.id, !isActive);
    }
    setShowDropdown(false);
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(account);
    }
    setShowDropdown(false);
  };

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      background: isActive ? '#f8f9fa' : '#f5f5f5',
      opacity: isActive ? 1 : 0.7,
      position: 'relative'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h4 style={{ color: color, marginBottom: '10px', display: 'flex', alignItems: 'center' }}>
            {platform}
            <span style={{
              marginLeft: '10px',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '12px',
              fontWeight: 'normal',
              background: isActive ? '#d4edda' : '#f8d7da',
              color: isActive ? '#155724' : '#721c24'
            }}>
              {isActive ? 'Active for posting' : 'Inactive for posting'}
            </span>
          </h4>
          <p style={{ color: '#666', margin: '5px 0' }}>Status: {status}</p>
          <p style={{ color: '#666', margin: '5px 0' }}>{accountInfo}</p>
        </div>
        
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              fontSize: '18px',
              color: '#666'
            }}
          >
            ⋮
          </button>
          
          {showDropdown && (
            <div style={{
              position: 'absolute',
              top: '100%',
              right: '0',
              background: '#fff',
              border: '1px solid #ddd',
              borderRadius: '4px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
              zIndex: 1000,
              minWidth: '120px'
            }}>
              <button
                onClick={handleToggleActive}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#333'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                {isActive ? 'Deactivate' : 'Activate'}
              </button>
              <button
                onClick={handleDelete}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: 'none',
                  background: 'transparent',
                  textAlign: 'left',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: '#dc3545'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f8f9fa'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
      

    </div>
  );
};

export default SocialAccountCard;