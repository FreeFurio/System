import React, { useState, useEffect } from 'react';

const PlatformSelector = ({ selectedPlatforms, onPlatformChange, size = 'large' }) => {
  const [platformAvailability, setPlatformAvailability] = useState({
    facebook: true,
    instagram: true,
    twitter: true
  });
  
  const platforms = [
    { 
      id: 'facebook', 
      name: 'Facebook', 
      logo: '/assets/facebook.svg',
      color: '#1877f2' 
    },
    { 
      id: 'instagram', 
      name: 'Instagram', 
      logo: '/assets/instagram.svg',
      color: '#e4405f' 
    },
    { 
      id: 'twitter', 
      name: 'Twitter', 
      logo: '/assets/twitter.svg',
      color: '#000000' 
    }
  ];
  
  useEffect(() => {
    const checkPlatformAvailability = async () => {
      try {
        const API_BASE_URL = import.meta.env.PROD ? '' : 'http://localhost:3000';
        const response = await fetch(`${API_BASE_URL}/api/v1/admin/platform-availability`);
        const data = await response.json();
        
        if (data.success) {
          setPlatformAvailability(data.platforms);
        }
      } catch (error) {
        console.error('Error checking platform availability:', error);
      }
    };
    
    checkPlatformAvailability();
  }, []);

  const iconSize = size === 'small' ? '16px' : '24px';
  const containerSize = size === 'small' ? '32px' : '48px';

  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
      {platforms.map(platform => {
        const isAvailable = platformAvailability[platform.id];
        const isSelected = selectedPlatforms.includes(platform.id);
        
        return (
          <div key={platform.id} style={{ position: 'relative' }}>
            <div
              onClick={() => isAvailable && onPlatformChange(platform.id)}
              style={{
                width: containerSize,
                height: containerSize,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: isAvailable ? 'pointer' : 'not-allowed',
                border: isSelected && isAvailable
                  ? `2px solid ${platform.color}` 
                  : '2px solid #e5e7eb',
                background: isSelected && isAvailable
                  ? `${platform.color}15` 
                  : isAvailable ? '#fff' : '#f5f5f5',
                transition: 'all 0.2s ease',
                opacity: isAvailable ? 1 : 0.5,
                fontFamily: platform.id === 'facebook' ? 'Arial Black, sans-serif' : 'inherit',
                fontWeight: platform.id === 'facebook' ? '900' : 'normal'
              }}
              title={isAvailable ? platform.name : `${platform.name} not available - no active account connected`}
            >
              <img 
                src={platform.logo}
                alt={platform.name}
                style={{
                  width: iconSize,
                  height: iconSize,
                  filter: isSelected && isAvailable
                    ? `brightness(0) saturate(100%) invert(${platform.id === 'twitter' ? '0%' : '27%'}) sepia(${platform.id === 'facebook' ? '99%' : platform.id === 'instagram' ? '95%' : '0%'}) saturate(${platform.id === 'facebook' ? '1934%' : platform.id === 'instagram' ? '7500%' : '0%'}) hue-rotate(${platform.id === 'facebook' ? '213deg' : platform.id === 'instagram' ? '325deg' : '0deg'}) brightness(${platform.id === 'facebook' ? '0.9' : platform.id === 'instagram' ? '0.8' : '1'}) contrast(${platform.id === 'facebook' ? '1.1' : platform.id === 'instagram' ? '1.15' : '1'})`
                    : 'brightness(0) saturate(100%) invert(60%)',
                  transition: 'all 0.2s ease'
                }}
              />
            </div>
            {!isAvailable && (
              <div style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '16px',
                height: '16px',
                borderRadius: '50%',
                background: '#ef4444',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                color: 'white',
                fontWeight: 'bold'
              }}>
                ✕
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default PlatformSelector;