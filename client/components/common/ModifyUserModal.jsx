import React, { useState, useEffect } from 'react';
import { FiX, FiShield, FiLock, FiUnlock, FiKey, FiFileText, FiClock, FiActivity } from 'react-icons/fi';

const ModifyUserModal = ({ user, isOpen, onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('role');
  const [formData, setFormData] = useState({
    role: user?.role || '',
    status: user?.status || 'active',
    locked: user?.locked || false,
    forcePasswordReset: false,
    adminNotes: user?.adminNotes || '',
    lastLogin: user?.lastLogin || 'Never',
    accountHistory: user?.accountHistory || []
  });
  const [loading, setLoading] = useState(false);
  const [newNote, setNewNote] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        role: user.role || '',
        status: user.status || 'active',
        locked: user.locked || false,
        forcePasswordReset: false,
        adminNotes: user.adminNotes || '',
        lastLogin: user.lastLogin || 'Never',
        accountHistory: user.accountHistory || []
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSave = async () => {
    setLoading(true);
    try {
      const updates = { ...formData };
      
      // Add history entry for changes
      const historyEntry = {
        timestamp: new Date().toISOString(),
        action: 'Account Modified',
        details: `Role: ${formData.role}, Status: ${formData.status}, Locked: ${formData.locked}`,
        admin: 'Current Admin'
      };
      
      updates.accountHistory = [...(formData.accountHistory || []), historyEntry];
      
      await onSave({ ...user, ...updates });
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNote = () => {
    if (!newNote.trim()) return;
    const noteEntry = {
      timestamp: new Date().toISOString(),
      note: newNote,
      admin: 'Current Admin'
    };
    setFormData(prev => ({
      ...prev,
      adminNotes: [...(prev.adminNotes ? [prev.adminNotes] : []), noteEntry]
    }));
    setNewNote('');
  };

  const initial = (user.firstName || 'U').charAt(0).toUpperCase();

  const tabs = [
    { id: 'role', label: 'Role Change', icon: FiShield },
    { id: 'status', label: 'Account Status', icon: FiActivity },
    { id: 'security', label: 'Security', icon: FiLock },
    { id: 'notes', label: 'Profile Notes', icon: FiFileText },
    { id: 'history', label: 'Account History', icon: FiClock }
  ];

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        background: '#ffffff', borderRadius: 0, width: 600, maxHeight: '90vh',
        boxShadow: '0 20px 60px rgba(0,0,0,0.15)', border: '1px solid #e2e8f0',
        fontFamily: 'Inter, sans-serif', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #5b21b6 100%)',
          padding: '24px 32px', display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', color: '#fff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.25rem', fontWeight: 700, color: '#fbbf24'
            }}>
              {initial}
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 600 }}>
                Admin Controls
              </h2>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.875rem', opacity: 0.9 }}>
                {user.firstName} {user.lastName}
              </p>
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: '50%',
            width: 36, height: 36, display: 'flex', alignItems: 'center',
            justifyContent: 'center', cursor: 'pointer', color: '#fff'
          }}>
            <FiX size={18} />
          </button>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#f8fafc'
        }}>
          {tabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  flex: 1, padding: '12px 8px', border: 'none',
                  background: activeTab === tab.id ? '#fff' : 'transparent',
                  color: activeTab === tab.id ? '#7c3aed' : '#6b7280',
                  borderBottom: activeTab === tab.id ? '2px solid #7c3aed' : 'none',
                  cursor: 'pointer', fontSize: '0.75rem', fontWeight: 600,
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px'
                }}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div style={{ padding: '24px', overflowY: 'auto', flex: 1, minHeight: '300px' }}>
          {activeTab === 'role' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
                Role Management
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                  Current Role: <span style={{ color: '#7c3aed', fontWeight: 600 }}>{user.role}</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value }))}
                  style={{
                    width: '100%', padding: '12px', border: '1px solid #d1d5db',
                    borderRadius: '8px', fontSize: '0.875rem', outline: 'none'
                  }}
                >
                  <option value="ContentCreator">Content Creator</option>
                  <option value="MarketingLead">Marketing Lead</option>
                  <option value="GraphicDesigner">Graphic Designer</option>
                </select>
              </div>
              <div style={{ background: '#fef3c7', padding: '12px', borderRadius: '8px', fontSize: '0.875rem', color: '#92400e' }}>
                ⚠️ Changing roles will affect user permissions and access levels.
              </div>
            </div>
          )}

          {activeTab === 'status' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
                Account Status
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '8px' }}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                    style={{
                      width: '100%', padding: '12px', border: '1px solid #d1d5db',
                      borderRadius: '8px', fontSize: '0.875rem', outline: 'none'
                    }}
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    checked={formData.locked}
                    onChange={(e) => setFormData(prev => ({ ...prev, locked: e.target.checked }))}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <label style={{ fontSize: '0.875rem', color: '#374151' }}>
                    Lock Account (prevents login)
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
                Security Controls
              </h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <input
                    type="checkbox"
                    checked={formData.forcePasswordReset}
                    onChange={(e) => setFormData(prev => ({ ...prev, forcePasswordReset: e.target.checked }))}
                    style={{ width: '16px', height: '16px' }}
                  />
                  <label style={{ fontSize: '0.875rem', color: '#374151' }}>
                    Force Password Reset on Next Login
                  </label>
                </div>
                <div style={{ background: '#fef2f2', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    <FiKey size={16} color="#dc2626" />
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#dc2626' }}>Last Login</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.875rem', color: '#374151' }}>
                    {formData.lastLogin === 'Never' ? 'Never logged in' : 
                     new Date(formData.lastLogin).toLocaleString('en-US', {
                       year: 'numeric',
                       month: 'long', 
                       day: 'numeric',
                       hour: '2-digit',
                       minute: '2-digit',
                       hour12: true
                     })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notes' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
                Profile Notes
              </h3>
              <div style={{ marginBottom: '16px' }}>
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this user..."
                  style={{
                    width: '100%', padding: '12px', border: '1px solid #d1d5db',
                    borderRadius: '8px', fontSize: '0.875rem', outline: 'none',
                    minHeight: '80px', resize: 'vertical'
                  }}
                />
                <button
                  onClick={addNote}
                  style={{
                    marginTop: '8px', padding: '8px 16px', background: '#7c3aed',
                    color: '#fff', border: 'none', borderRadius: '6px',
                    fontSize: '0.875rem', cursor: 'pointer'
                  }}
                >
                  Add Note
                </button>
              </div>
              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {Array.isArray(formData.adminNotes) ? formData.adminNotes.map((note, index) => (
                  <div key={index} style={{
                    background: '#f8fafc', padding: '12px', borderRadius: '8px',
                    marginBottom: '8px', border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginBottom: '4px' }}>
                      {new Date(note.timestamp).toLocaleString()} - {note.admin}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#374151' }}>
                      {note.note}
                    </div>
                  </div>
                )) : (
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No notes available</p>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', fontWeight: 600, color: '#374151' }}>
                Account History
              </h3>
              <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                {formData.accountHistory.length > 0 ? formData.accountHistory.map((entry, index) => (
                  <div key={index} style={{
                    background: '#f8fafc', padding: '12px', borderRadius: '8px',
                    marginBottom: '8px', border: '1px solid #e2e8f0'
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                        {entry.action}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                        {new Date(entry.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#6b7280' }}>
                      {entry.details}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '4px' }}>
                      By: {entry.admin}
                    </div>
                  </div>
                )) : (
                  <p style={{ color: '#6b7280', fontSize: '0.875rem' }}>No history available</p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={{
          padding: '20px 24px', borderTop: '1px solid #e2e8f0', background: '#f8fafc',
          display: 'flex', gap: '12px', justifyContent: 'flex-end'
        }}>
          <button
            onClick={onClose}
            style={{
              background: '#fff', border: '1px solid #d1d5db', color: '#374151',
              borderRadius: 6, minWidth: 80, height: 36, fontWeight: 500,
              fontSize: '0.875rem', cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            style={{
              background: '#7c3aed', border: 'none', color: '#fff',
              borderRadius: 6, minWidth: 80, height: 36, fontWeight: 600,
              fontSize: '0.875rem', cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModifyUserModal;