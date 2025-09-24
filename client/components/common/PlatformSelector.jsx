import React from 'react';

const PlatformSelector = ({ selectedPlatforms, onPlatformChange, size = 'large' }) => {
  const platforms = [
    { 
      id: 'facebook', 
      name: 'Facebook', 
      logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/facebook.svg',
      color: '#1877f2' 
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/instagram.svg',
      color: '#e4405f' 
    },
    { 
      id: 'twitter', 
      name: 'Twitter', 
      logo: 'https://cdn.jsdelivr.net/npm/simple-icons@v9/icons/x.svg',
      color: '#000000' 
    }
  ];

  const iconSize = size === 'small' ? '16px' : '24px';
  const containerSize = size === 'small' ? '32px' : '48px';

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      {platforms.map(platform => (
        <div
          key={platform.id}
          onClick={() => onPlatformChange(platform.id)}
          style={{
            width: containerSize,
            height: containerSize,
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            border: selectedPlatforms.includes(platform.id) 
              ? `2px solid ${platform.color}` 
              : '2px solid #e5e7eb',
            background: selectedPlatforms.includes(platform.id) 
              ? `${platform.color}15` 
              : '#fff',
            transition: 'all 0.2s ease',
            fontFamily: platform.id === 'facebook' ? 'Arial Black, sans-serif' : 'inherit',
            fontWeight: platform.id === 'facebook' ? '900' : 'normal'
          }}
        >
          <img 
            src={platform.logo}
            alt={platform.name}
            style={{
              width: iconSize,
              height: iconSize,
              filter: selectedPlatforms.includes(platform.id) 
                ? `brightness(0) saturate(100%) invert(${platform.id === 'twitter' ? '0%' : '27%'}) sepia(${platform.id === 'facebook' ? '99%' : platform.id === 'instagram' ? '95%' : '0%'}) saturate(${platform.id === 'facebook' ? '1934%' : platform.id === 'instagram' ? '7500%' : '0%'}) hue-rotate(${platform.id === 'facebook' ? '213deg' : platform.id === 'instagram' ? '325deg' : '0deg'}) brightness(${platform.id === 'facebook' ? '0.9' : platform.id === 'instagram' ? '0.8' : '1'}) contrast(${platform.id === 'facebook' ? '1.1' : platform.id === 'instagram' ? '1.15' : '1'})`
                : 'brightness(0) saturate(100%) invert(60%)',
              transition: 'all 0.2s ease'
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default PlatformSelector;