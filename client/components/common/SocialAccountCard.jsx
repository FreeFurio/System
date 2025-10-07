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
  
  // Check Twitter token expiration (2 hours = 7200000 ms)
  const checkTokenExpiration = () => {
    if (platform === 'Twitter' && account?.tokenTimestamp) {
      const tokenAge = Date.now() - account.tokenTimestamp;
      const twoHours = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
      return {
        expired: tokenAge >= twoHours,
        timeRemaining: Math.max(0, twoHours - tokenAge)
      };
    }
    return { expired: false, timeRemaining: 0 };
  };
  
  const tokenStatus = checkTokenExpiration();
  const isTokenExpired = tokenStatus.expired;
  
  // Format time remaining for display
  const formatTimeRemaining = (ms) => {
    const minutes = Math.floor(ms / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  };

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
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '10px' }}>
            {account?.profilePicture && (
              <img 
                src={account.profilePicture} 
                alt={`${platform} profile`}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  marginRight: '10px',
                  objectFit: 'cover'
                }}
              />
            )}
            <h4 style={{ color: color, margin: 0, display: 'flex', alignItems: 'center' }}>
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
          </div>
          <p style={{ color: '#666', margin: '5px 0' }}>Status: {status}</p>
          <p style={{ color: '#666', margin: '5px 0' }}>{accountInfo}</p>
          {platform === 'Twitter' && account?.tokenTimestamp && (
            <div>
              {isTokenExpired ? (
                <div style={{
                  background: '#f8d7da',
                  border: '1px solid #f5c6cb',
                  borderRadius: '4px',
                  padding: '8px',
                  margin: '8px 0',
                  fontSize: '14px',
                  color: '#721c24'
                }}>
                  ⚠️ Reauthentication needed - Token expired
                </div>
              ) : tokenStatus.timeRemaining < (30 * 60 * 1000) && ( // Show warning 30 minutes before expiry
                <div style={{
                  background: '#fff3cd',
                  border: '1px solid #ffeaa7',
                  borderRadius: '4px',
                  padding: '8px',
                  margin: '8px 0',
                  fontSize: '14px',
                  color: '#856404'
                }}>
                  ⏰ Token expires in {formatTimeRemaining(tokenStatus.timeRemaining)}
                </div>
              )}
            </div>
          )}
          {platform === 'Facebook' && (
            <div style={{ display: 'flex', alignItems: 'center', margin: '5px 0' }}>
              {account?.hasInstagram && account?.instagramAccount?.profilePicture && (
                <img 
                  src={account.instagramAccount.profilePicture} 
                  alt="Instagram profile"
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    marginRight: '8px',
                    objectFit: 'cover'
                  }}
                />
              )}
              <p style={{ color: '#666', margin: 0, fontSize: '14px' }}>
                {account?.hasInstagram && account?.instagramAccount 
                  ? `@${account.instagramAccount.username} • ${account.instagramAccount.followersCount} followers`
                  : 'Instagram not connected'
                }
              </p>
            </div>
          )}
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