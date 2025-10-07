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
      <div style={{ padding: '0', maxWidth: '100%' }}>
        <div style={{
          marginBottom: '32px',
          padding: '24px',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#111827',
            margin: 0,
            letterSpacing: '-0.025em'
          }}>
            Manage Accounts
          </h1>
        </div>
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#6b7280',
          fontSize: '14px'
        }}>
          Loading accounts...
        </div>
      </div>
    );
  }

  const formatRole = (role) => role.replace(/([a-z])([A-Z])/g, '$1 $2');

  return (
    <div style={{ padding: '0', maxWidth: '100%' }}>
      {/* Header */}
      <div style={{
        marginBottom: '32px',
        padding: '24px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#111827',
          margin: 0,
          letterSpacing: '-0.025em'
        }}>
          Manage Accounts
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: '8px 0 0 0',
          fontWeight: '400'
        }}>
          Manage and modify existing user accounts ({getTotalAccounts()} total accounts)
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div style={{
        display: 'flex',
        gap: '16px',
        alignItems: 'center',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        <div style={{ position: 'relative', flex: '1', minWidth: '300px' }}>
          <FiSearch style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9ca3af',
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
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '1rem',
              outline: 'none',
              transition: 'border-color 0.2s',
              background: '#fff',
              color: '#000'
            }}
            onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
            onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
          />
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiFilter color="#6b7280" size={18} />
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            style={{
              padding: '12px 16px',
              border: '2px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '1rem',
              outline: 'none',
              background: '#fff',
              color: '#000',
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

      {/* Account Sections */}
      {getFilteredTotal() === 0 ? (
        <div>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #e5e7eb'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: '600', 
              color: '#1f2937', 
              margin: '0 0 20px 0',
              paddingBottom: '12px',
              borderBottom: '2px solid #e5e7eb'
            }}>
              User Accounts
            </h2>
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#9ca3af',
              fontSize: '14px'
            }}>
              {searchTerm || selectedRole !== 'all' ? 'No matching accounts found.' : 'No accounts found.'}
            </div>
          </div>
        </div>
      ) : (
        ROLES.map(role => {
          const filteredAccounts = filterAccounts(accountsByRole[role], role);
          return filteredAccounts.length > 0 && (
            <div key={role} style={{ marginBottom: '40px' }}>
              <div style={{
                background: '#fff',
                borderRadius: '12px',
                padding: '24px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                border: '1px solid #e5e7eb'
              }}>
                <h2 style={{ 
                  fontSize: '1.25rem', 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  margin: '0 0 20px 0',
                  paddingBottom: '12px',
                  borderBottom: '2px solid #e5e7eb'
                }}>
                  {formatRole(role)}
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {filteredAccounts.map(account => (
                    <AccountCard
                      key={account.key}
                      account={account}
                      onDelete={() => handleDelete(role, account.key)}
                      onModify={() => handleModify(account)}
                      isApproved={true}
                    />
                  ))}
                </div>
              </div>
            </div>
          );
        })
      )}
      
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