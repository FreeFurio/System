import React, { useState, useEffect } from 'react';
import { FiUser, FiCamera, FiSave } from 'react-icons/fi';
import { useUser } from '../../components/common/UserContext';

const GraphicDesignerSettings = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const { user, setUser } = useUser();

  const [settings, setSettings] = useState({
    firstName: '',
    lastName: '',
    profilePicture: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        profilePicture: user.profilePicture || null
      }));
    }
  }, [user, isOpen]);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true);
      try {
        const uploadService = (await import('../../services/uploadService')).default;
        const result = await uploadService.uploadProfilePicture(file);
        setSettings(prev => ({ ...prev, profilePicture: result.url }));
        
        // Update UserContext immediately
        const updatedUser = { ...user, profilePicture: result.url };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        setMessage({ text: 'Profile picture uploaded successfully!', type: 'success' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } catch (error) {
        setMessage({ text: 'Failed to upload image', type: 'error' });
        setTimeout(() => setMessage({ text: '', type: '' }), 3000);
      } finally {
        setLoading(false);
      }
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      const { ref, update } = await import('firebase/database');
      const { db } = await import('../../services/firebase');
      
      const userRef = ref(db, `${user.role}/${user.username.toLowerCase()}`);
      await update(userRef, {
        firstName: settings.firstName,
        lastName: settings.lastName,
        profilePicture: settings.profilePicture
      });
      
      const updatedUser = {
        ...user,
        firstName: settings.firstName,
        lastName: settings.lastName,
        profilePicture: settings.profilePicture
      };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      setMessage({ text: 'Settings saved successfully!', type: 'success' });
      setTimeout(() => {
        setMessage({ text: '', type: '' });
        onClose();
      }, 1500);
    } catch (error) {
      setMessage({ text: 'Failed to save settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#f8fafc', borderRadius: 16, width: '90vw', maxWidth: '600px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        <div style={{ padding: '32px' }}>
          <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0' }}>
                Settings
              </h1>
              <p style={{ color: '#6b7280', margin: 0 }}>
                Manage your profile and preferences
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '8px', borderRadius: '8px', color: '#6b7280'
              }}
            >
              ✕
            </button>
          </div>

          <div style={{
            background: '#fff', borderRadius: '12px',
            padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', margin: '0 0 24px 0' }}>
              Profile Settings
            </h2>
            
            <div style={{ marginBottom: '24px', textAlign: 'center' }}>
              <div style={{
                width: '120px', height: '120px', borderRadius: '50%',
                background: settings.profilePicture ? `url(${settings.profilePicture})` : '#e5e7eb',
                backgroundSize: 'cover', backgroundPosition: 'center',
                margin: '0 auto 16px', display: 'flex', alignItems: 'center',
                justifyContent: 'center', border: '4px solid #f3f4f6'
              }}>
                {!settings.profilePicture && (
                  <FiUser size={48} color="#9ca3af" />
                )}
              </div>
              <label style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '8px 16px', background: '#f3f4f6', borderRadius: '8px',
                cursor: 'pointer', fontSize: '0.875rem', color: '#374151'
              }}>
                <FiCamera size={16} />
                Change Picture
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ display: 'none' }}
                />
              </label>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  First Name
                </label>
                <input
                  type="text"
                  value={settings.firstName}
                  onChange={(e) => handleInputChange('firstName', e.target.value)}
                  style={{
                    width: '100%', padding: '12px', border: '1px solid #d1d5db',
                    borderRadius: '8px', fontSize: '0.875rem', outline: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                  Last Name
                </label>
                <input
                  type="text"
                  value={settings.lastName}
                  onChange={(e) => handleInputChange('lastName', e.target.value)}
                  style={{
                    width: '100%', padding: '12px', border: '1px solid #d1d5db',
                    borderRadius: '8px', fontSize: '0.875rem', outline: 'none'
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '32px', paddingTop: '24px', borderTop: '1px solid #e5e7eb' }}>
              {message.text && (
                <div style={{
                  padding: '12px 16px', borderRadius: '8px', marginBottom: '16px',
                  background: message.type === 'success' ? '#f0fdf4' : '#fef2f2',
                  color: message.type === 'success' ? '#059669' : '#dc2626',
                  border: `1px solid ${message.type === 'success' ? '#bbf7d0' : '#fecaca'}`
                }}>
                  {message.text}
                </div>
              )}
              
              <button
                onClick={saveSettings}
                disabled={loading}
                style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '12px 24px', background: '#3b82f6', color: '#fff',
                  border: 'none', borderRadius: '8px', fontSize: '0.875rem',
                  fontWeight: '500', cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1
                }}
              >
                <FiSave size={16} />
                {loading ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphicDesignerSettings;