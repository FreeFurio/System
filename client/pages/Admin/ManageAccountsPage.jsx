import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { ref, onValue, off, remove, update, set } from 'firebase/database';
import AccountCard from '../../components/common/AccountCard';
import Toast from '../../components/common/Toast';
import ModifyUserModal from '../../components/common/ModifyUserModal';

const ROLES = ['ContentCreator', 'MarketingLead', 'GraphicDesigner'];

const ManageAccountsPage = () => {
  const [accountsByRole, setAccountsByRole] = useState({});
  const [loading, setLoading] = useState(true);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showModifyModal, setShowModifyModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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

  if (loading) return <div>Loading...</div>;

  const hasAccounts = Object.values(accountsByRole).some(arr => arr && arr.length > 0);

  const formatRole = (role) => role.replace(/([a-z])([A-Z])/g, '$1 $2');

  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#fff', padding: 0, margin: 0 }}>
      <div className="manage-accounts-page-container" style={{ width: '100%', minHeight: '100vh', background: '#fff', margin: 0, padding: 0 }}>
        {!hasAccounts && (
          <div style={{textAlign: 'center', marginTop: '2rem', color: '#888', fontSize: '1.2rem'}}>
            No accounts found.
          </div>
        )}
        {ROLES.map(role => (
          accountsByRole[role] && accountsByRole[role].length > 0 && (
            <div key={role} className="role-section" style={{ marginBottom: 0, padding: 0, background: 'transparent', boxShadow: 'none' }}>
              <h2 style={{margin: 0, padding: '20px 0 8px 0'}}>{formatRole(role)}</h2>
              <div style={{width: '100%', padding: 0, margin: 0}}>
                {accountsByRole[role].map(account => (
                  <AccountCard
                    key={account.key}
                    account={account}
                    onDelete={() => handleDelete(role, account.key)}
                    onModify={() => handleModify(account)}
                  />
                ))}
              </div>
            </div>
          )
        ))}
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