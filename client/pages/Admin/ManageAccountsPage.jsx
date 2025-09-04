import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { ref, onValue, off, remove, update, set } from 'firebase/database';
import AccountCard from '../../components/common/AccountCard';
import Toast from '../../components/common/Toast';
import ModifyUserModal from '../../components/common/ModifyUserModal';
import { FiSearch, FiUsers, FiFilter } from 'react-icons/fi';

const ROLES = ['ContentCreator', 'MarketingLead', 'GraphicDesigner'];

const ManageAccountsPage = () => {
  const [accountsByRole, setAccountsByRole] = useState({});
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  useEffect(() => {
    const listeners = [];
    setLoading(true);
    // Set up a listener for each role
    ROLES.forEach(role => {
      const roleRef = ref(db, role);
      const listener = onValue(roleRef, (snapshot) => {
        const data = snapshot.val();
        setAccountsByRole(prev => ({
          ...prev,
          [role]: data
            ? Object.entries(data).map(([key, value]) => ({ key, ...value, role }))
            : []
        }));
        setLoading(false);
      });
      listeners.push({ ref: roleRef, listener });
    });
    return () => {
      listeners.forEach(({ ref, listener }) => off(ref, 'value', listener));
    };
  }, []);

  const handleDelete = (role, key) => {
    const userRef = ref(db, `${role}/${key}`);
    remove(userRef).catch(error => console.error('Error deleting account:', error));
  };

  const handleModify = (account) => {
    setSelectedUser(account);
    setShowModifyModal(true);
  };

  const handleSaveModify = async (updatedUser) => {
    try {
      const { key, role: newRole, ...userData } = updatedUser;
      const originalUser = selectedUser;
      const oldRole = originalUser.role;
      
      if (newRole !== oldRole) {
        // Role changed - move user to new role collection
        const newRoleRef = ref(db, `${newRole}/${key}`);
        const oldRoleRef = ref(db, `${oldRole}/${key}`);
        
        // Add to new role
        await set(newRoleRef, { ...userData, role: newRole });
        
        // Remove from old role
        await remove(oldRoleRef);
        
        setToastMessage(`${updatedUser.firstName} ${updatedUser.lastName} moved to ${newRole} successfully`);
      } else {
        // Same role - just update
        const userRef = ref(db, `${newRole}/${key}`);
        await update(userRef, userData);
        
        setToastMessage(`${updatedUser.firstName} ${updatedUser.lastName} updated successfully`);
      }
      
      setShowToast(true);
    } catch (error) {
      console.error('Error updating user:', error);
      setToastMessage('Failed to update user');
      setShowToast(true);
    }
  };

  const filterAccounts = (accounts, role) => {
    if (!accounts) return [];
    return accounts.filter(account => {
      const matchesSearch = searchTerm === '' || 
        account.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'all' || account.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  };

  const getTotalAccounts = () => {
    return Object.values(accountsByRole).reduce((total, accounts) => {
      return total + (accounts ? accounts.length : 0);
    }, 0);
  };

  const getFilteredTotal = () => {
    return ROLES.reduce((total, role) => {
      return total + filterAccounts(accountsByRole[role], role).length;
    }, 0);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ fontSize: '1.1rem', color: '#6b7280' }}>Loading accounts...</div>
      </div>
    );
  }

  const formatRole = (role) => role.replace(/([a-z])([A-Z])/g, '$1 $2');

  return (
    <div style={{ 
      width: '100%', 
      minHeight: '100vh', 
      background: 'var(--bg-secondary, #f8fafc)', 
      padding: 0, 
      margin: 0 
    }}>
      {/* Header Section */}
      <div style={{
        background: 'var(--bg-primary, #fff)',
        borderBottom: '1px solid var(--border-primary, #e2e8f0)',
        padding: '24px 32px',
        boxShadow: '0 1px 3px var(--shadow, rgba(0,0,0,0.1))'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: 'var(--text-primary, #1f2937)',
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FiUsers size={28} color="#3b82f6" />
              Manage Accounts
            </h1>
            <p style={{
              color: 'var(--text-secondary, #6b7280)',
              fontSize: '1rem',
              margin: '8px 0 0 0'
            }}>
              {getTotalAccounts()} total accounts • {getFilteredTotal()} showing
            </p>
          </div>
        </div>
        
        {/* Search and Filter Bar */}
        <div style={{
          display: 'flex',
          gap: '16px',
          alignItems: 'center',
          flexWrap: 'wrap'
        }}>
          <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
            <FiSearch style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-tertiary, #9ca3af)',
              fontSize: '18px'
            }} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 12px 12px 44px',
                border: '2px solid var(--border-primary, #e5e7eb)',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                background: 'var(--bg-primary, #fff)',
                color: 'var(--text-primary, #000)'
              }}
              onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.target.style.borderColor = 'var(--border-primary, #e5e7eb)'}
            />
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiFilter color="var(--text-secondary, #6b7280)" size={18} />
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              style={{
                padding: '12px 16px',
                border: '2px solid var(--border-primary, #e5e7eb)',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                background: 'var(--bg-primary, #fff)',
                color: 'var(--text-primary, #000)',
                cursor: 'pointer',
                minWidth: '160px'
              }}
            >
              <option value="all">All Roles</option>
              {ROLES.map(role => (
                <option key={role} value={role}>{formatRole(role)}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: '32px' }}>
        {getFilteredTotal() === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--bg-primary, #fff)',
            borderRadius: '16px',
            boxShadow: '0 4px 6px var(--shadow, rgba(0,0,0,0.05))',
            border: '1px solid var(--border-primary, #f3f4f6)'
          }}>
            <FiUsers size={48} color="var(--text-tertiary, #d1d5db)" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: 'var(--text-secondary, #6b7280)', fontSize: '1.25rem', margin: '0 0 8px 0' }}>
              {searchTerm || selectedRole !== 'all' ? 'No matching accounts found' : 'No accounts found'}
            </h3>
            <p style={{ color: 'var(--text-tertiary, #9ca3af)', margin: 0 }}>
              {searchTerm || selectedRole !== 'all' ? 'Try adjusting your search or filter criteria' : 'Accounts will appear here once they are created'}
            </p>
          </div>
        ) : (
          ROLES.map(role => {
            const filteredAccounts = filterAccounts(accountsByRole[role], role);
            return filteredAccounts.length > 0 && (
              <div key={role} style={{
                marginBottom: '40px',
                background: 'var(--bg-primary, #fff)',
                borderRadius: '16px',
                padding: '24px',
                boxShadow: '0 4px 6px var(--shadow, rgba(0,0,0,0.05))',
                border: '1px solid var(--border-primary, #f3f4f6)'
              }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px',
                  paddingBottom: '16px',
                  borderBottom: '2px solid var(--border-primary, #f3f4f6)'
                }}>
                  <h2 style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: 'var(--text-primary, #1f2937)',
                    margin: 0
                  }}>
                    {formatRole(role)}
                  </h2>
                  <span style={{
                    background: '#3b82f6',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '0.875rem',
                    fontWeight: '500'
                  }}>
                    {filteredAccounts.length} account{filteredAccounts.length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredAccounts.map(account => (
                    <AccountCard
                      key={account.key}
                      account={account}
                      onDelete={() => handleDelete(role, account.key)}
                      onModify={() => handleModify(account)}
                    />
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
      
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastMessage.includes('successfully') ? 'success' : 'error'}
          onClose={() => setShowToast(false)}
        />
      )}
      
      <ModifyUserModal
        user={selectedUser}
        isOpen={showModifyModal}
        onClose={() => {
          setShowModifyModal(false);
          setSelectedUser(null);
        }}
        onSave={handleSaveModify}
      />
    </div>
  );
};

export default ManageAccountsPage;