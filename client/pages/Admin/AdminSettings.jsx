import React, { useState, useEffect } from 'react';
import { FiUser, FiLock, FiShield, FiCamera, FiSave } from 'react-icons/fi';
import { useUser } from '../../components/common/UserContext';


const AdminSettings = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  const { user, setUser } = useUser();

  const [activeTab, setActiveTab] = useState('profile');
  const [settings, setSettings] = useState({
    // Profile Settings
    firstName: '',
    lastName: '',
    profilePicture: null,
    
    // Password Policies
    minPasswordLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    passwordExpiry: 90, // days
    
    // Login Attempts
    maxLoginAttempts: 5,
    lockoutDuration: 30, // minutes
    enableAccountLockout: true,
    
    // Other settings (darkMode now handled by context)
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    // Load current user data when modal opens or user changes
    if (user) {
      console.log('Current user data:', user);
      setSettings(prev => ({
        ...prev,
        firstName: user.firstName || user.name?.split(' ')[0] || '',
        lastName: user.lastName || user.name?.split(' ')[1] || '',
        profilePicture: user.profilePicture || null
      }));
    }
  }, [user, isOpen]);
  
  useEffect(() => {
    const loadSettings = async () => {
      // Load password policies from Firebase
      if (isOpen) {
        try {
          const { ref, get } = await import('firebase/database');
          const { db } = await import('../../services/firebase');
          
          const policiesRef = ref(db, 'systemSettings/passwordPolicies');
          const snapshot = await get(policiesRef);
          
          if (snapshot.exists()) {
            const policies = snapshot.val();
            setSettings(prev => ({
              ...prev,
              minPasswordLength: policies.minPasswordLength || 8,
              requireUppercase: policies.requireUppercase ?? true,
              requireLowercase: policies.requireLowercase ?? true,
              requireNumbers: policies.requireNumbers ?? true,
              requireSpecialChars: policies.requireSpecialChars ?? false,
              passwordExpiry: policies.passwordExpiry || 90
            }));
          }
          
          // Load login security settings
          const securityRef = ref(db, 'systemSettings/loginSecurity');
          const securitySnapshot = await get(securityRef);
          
          if (securitySnapshot.exists()) {
            const security = securitySnapshot.val();
            setSettings(prev => ({
              ...prev,
              enableAccountLockout: security.enableAccountLockout ?? true,
              maxLoginAttempts: security.maxLoginAttempts || 5,
              lockoutDuration: security.lockoutDuration || 30
            }));
          }
        } catch (error) {
          console.error('Error loading settings:', error);
        }
      }
      
      // Load other settings from localStorage (exclude profile data)
      const savedSettings = localStorage.getItem('adminSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        const { firstName, lastName, profilePicture, ...otherSettings } = parsed;
        setSettings(prev => ({ ...prev, ...otherSettings }));
      }
      
      const savedDarkMode = localStorage.getItem('darkMode') === 'true';
      setSettings(prev => ({ ...prev, darkMode: savedDarkMode }));
    };
    
    loadSettings();
  }, [isOpen]);

  const handleInputChange = (field, value) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSettings(prev => ({ ...prev, profilePicture: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Dark mode is now handled by global context

  const saveSettings = async () => {
    setLoading(true);
    try {
      if (activeTab === 'profile') {
        // Update profile in Firebase
        const { ref, update } = await import('firebase/database');
        const { db } = await import('../../services/firebase');
        
        const safeUsername = user.username.toLowerCase().replace(/[^a-z0-9]/g, '');
        const userRef = ref(db, `users/${safeUsername}`);
        await update(userRef, {
          firstName: settings.firstName,
          lastName: settings.lastName,
          profilePicture: settings.profilePicture
        });
        
        // Update user context and localStorage
        const updatedUser = {
          ...user,
          firstName: settings.firstName,
          lastName: settings.lastName,
          profilePicture: settings.profilePicture
        };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        // Update settings state to reflect the saved values
        setSettings(prev => ({
          ...prev,
          firstName: settings.firstName,
          lastName: settings.lastName,
          profilePicture: settings.profilePicture
        }));
      } else if (activeTab === 'password') {
        // Save password policies to Firebase
        const { ref, set } = await import('firebase/database');
        const { db } = await import('../../services/firebase');
        
        const policiesRef = ref(db, 'systemSettings/passwordPolicies');
        await set(policiesRef, {
          minPasswordLength: settings.minPasswordLength,
          requireUppercase: settings.requireUppercase,
          requireLowercase: settings.requireLowercase,
          requireNumbers: settings.requireNumbers,
          requireSpecialChars: settings.requireSpecialChars,
          passwordExpiry: settings.passwordExpiry,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.username || 'Admin'
        });
      } else if (activeTab === 'security') {
        // Save login security settings to Firebase
        const { ref, set } = await import('firebase/database');
        const { db } = await import('../../services/firebase');
        
        const securityRef = ref(db, 'systemSettings/loginSecurity');
        await set(securityRef, {
          enableAccountLockout: settings.enableAccountLockout,
          maxLoginAttempts: settings.maxLoginAttempts,
          lockoutDuration: settings.lockoutDuration,
          updatedAt: new Date().toISOString(),
          updatedBy: user?.username || 'Admin'
        });
      } else {
        // Save other settings to localStorage
        localStorage.setItem('adminSettings', JSON.stringify(settings));
      }
      
      setMessage({ text: 'Settings saved successfully!', type: 'success' });
      setTimeout(() => {
        setMessage({ text: '', type: '' });
        if (activeTab === 'profile') {
          onClose(); // Close modal to see changes
        }
      }, 1500);
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ text: 'Failed to save settings', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: FiUser },
    { id: 'password', label: 'Password Policies', icon: FiLock },
    { id: 'security', label: 'Login Security', icon: FiShield }
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#f8fafc', borderRadius: 16, width: '90vw', maxWidth: '1000px',
        maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)'
      }}>
        <div style={{ padding: '32px' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0' }}>
            Settings
          </h1>
          <p style={{ color: '#6b7280', margin: 0 }}>
            Manage your system preferences and security settings
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

      <div style={{ display: 'flex', gap: '24px' }}>
        {/* Sidebar */}
        <div style={{
          width: '240px', background: '#fff', borderRadius: '12px',
          padding: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb', height: 'fit-content'
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  width: '100%', padding: '12px 16px', border: 'none',
                  background: activeTab === tab.id ? '#2563eb' : 'transparent',
                  color: activeTab === tab.id ? '#ffffff' : '#6b7280',
                  borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
                  display: 'flex', alignItems: 'center', gap: '12px',
                  fontSize: '0.875rem', fontWeight: '500', textAlign: 'left'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{
          flex: 1, background: '#fff', borderRadius: '12px',
          padding: '32px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          {/* Profile Settings */}
          {activeTab === 'profile' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', margin: '0 0 24px 0' }}>
                Profile Settings
              </h2>
              
              {/* Profile Picture */}
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

              {/* Name Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    First Name
                  </label>
                  <input
                    type="text"
                    value={settings.firstName || user?.firstName || ''}
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
                    value={settings.lastName || user?.lastName || ''}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    style={{
                      width: '100%', padding: '12px', border: '1px solid #d1d5db',
                      borderRadius: '8px', fontSize: '0.875rem', outline: 'none'
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Password Policies */}
          {activeTab === 'password' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', margin: '0 0 24px 0' }}>
                Password Policies
              </h2>
              
              <div style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Minimum Password Length
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="20"
                    value={settings.minPasswordLength}
                    onChange={(e) => handleInputChange('minPasswordLength', parseInt(e.target.value))}
                    style={{
                      width: '120px', padding: '12px', border: '1px solid #d1d5db',
                      borderRadius: '8px', fontSize: '0.875rem', outline: 'none'
                    }}
                  />
                </div>

                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: '500', color: '#374151', margin: '0 0 16px 0' }}>
                    Password Requirements
                  </h3>
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {[
                      { key: 'requireUppercase', label: 'Require uppercase letters (A-Z)' },
                      { key: 'requireLowercase', label: 'Require lowercase letters (a-z)' },
                      { key: 'requireNumbers', label: 'Require numbers (0-9)' },
                      { key: 'requireSpecialChars', label: 'Require special characters (!@#$%)' }
                    ].map(({ key, label }) => (
                      <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={settings[key]}
                          onChange={(e) => handleInputChange(key, e.target.checked)}
                          style={{ width: '16px', height: '16px' }}
                        />
                        <span style={{ fontSize: '0.875rem', color: '#374151' }}>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                    Password Expiry (days)
                  </label>
                  <input
                    type="number"
                    min="30"
                    max="365"
                    value={settings.passwordExpiry}
                    onChange={(e) => handleInputChange('passwordExpiry', parseInt(e.target.value))}
                    style={{
                      width: '120px', padding: '12px', border: '1px solid #d1d5db',
                      borderRadius: '8px', fontSize: '0.875rem', outline: 'none'
                    }}
                  />
                  <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '4px 0 0 0' }}>
                    Users will be required to change passwords after this period
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Login Security */}
          {activeTab === 'security' && (
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '600', color: '#1f2937', margin: '0 0 24px 0' }}>
                Login Security
              </h2>
              
              <div style={{ display: 'grid', gap: '24px' }}>
                <div>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={settings.enableAccountLockout}
                      onChange={(e) => handleInputChange('enableAccountLockout', e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      Enable Account Lockout
                    </span>
                  </label>
                </div>

                {settings.enableAccountLockout && (
                  <>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                        Maximum Login Attempts
                      </label>
                      <input
                        type="number"
                        min="3"
                        max="10"
                        value={settings.maxLoginAttempts}
                        onChange={(e) => handleInputChange('maxLoginAttempts', parseInt(e.target.value))}
                        style={{
                          width: '120px', padding: '12px', border: '1px solid #d1d5db',
                          borderRadius: '8px', fontSize: '0.875rem', outline: 'none'
                        }}
                      />
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '4px 0 0 0' }}>
                        Account will be locked after this many failed attempts
                      </p>
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '8px' }}>
                        Lockout Duration (minutes)
                      </label>
                      <input
                        type="number"
                        min="5"
                        max="120"
                        value={settings.lockoutDuration}
                        onChange={(e) => handleInputChange('lockoutDuration', parseInt(e.target.value))}
                        style={{
                          width: '120px', padding: '12px', border: '1px solid #d1d5db',
                          borderRadius: '8px', fontSize: '0.875rem', outline: 'none'
                        }}
                      />
                      <p style={{ fontSize: '0.75rem', color: '#6b7280', margin: '4px 0 0 0' }}>
                        How long the account remains locked
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}



          {/* Save Button */}
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
    </div>
  );
};

export default AdminSettings;