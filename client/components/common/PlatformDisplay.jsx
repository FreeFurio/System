import React from 'react';

const PlatformDisplay = ({ platforms, size = 'small' }) => {
  const platformConfig = {
    facebook: { 
      logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg',
      color: '#1877f2', 
      name: 'Facebook' 
    },
    instagram: { 
      logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg',
      color: '#e4405f', 
      name: 'Instagram' 
    },
    twitter: { 
      logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/x.svg',
      color: '#000000', 
      name: 'Twitter' 
    }
  };

  const iconSize = size === 'small' ? '14px' : '18px';
  const containerSize = size === 'small' ? '24px' : '32px';

  if (!platforms || platforms.length === 0) {
    return (
      <div style={{ fontSize: '12px', color: '#9ca3af' }}>
        No platforms selected
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
      {platforms.map(platformId => {
        const platform = platformConfig[platformId];
        if (!platform) return null;
        
        return (
          <div
            key={platformId}
            title={platform.name}
            style={{
              width: containerSize,
              height: containerSize,
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `${platform.color}15`,
              border: `1px solid ${platform.color}30`,
              fontFamily: platformId === 'facebook' ? 'Arial Black, sans-serif' : 'inherit'
            }}
          >
            <img 
              src={platform.logo}
              alt={platform.name}
              style={{
                width: iconSize,
                height: iconSize,
                filter: `brightness(0) saturate(100%) invert(${platformId === 'twitter' ? '0%' : '27%'}) sepia(${platformId === 'facebook' ? '99%' : platformId === 'instagram' ? '95%' : '0%'}) saturate(${platformId === 'facebook' ? '1934%' : platformId === 'instagram' ? '7500%' : '0%'}) hue-rotate(${platformId === 'facebook' ? '213deg' : platformId === 'instagram' ? '325deg' : '0deg'}) brightness(${platformId === 'facebook' ? '0.9' : platformId === 'instagram' ? '0.8' : '1'}) contrast(${platformId === 'facebook' ? '1.1' : platformId === 'instagram' ? '1.15' : '1'})`,
                transition: 'all 0.2s ease'
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default PlatformDisplay;