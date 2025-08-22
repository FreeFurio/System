import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { ref, onValue, off, remove } from 'firebase/database';
import AccountCard from '../../components/common/AccountCard';

const ROLES = ['ContentCreator', 'MarketingLead', 'GraphicDesigner'];

const ManageAccountsPage = () => {
  const [accountsByRole, setAccountsByRole] = useState({});
  const [loading, setLoading] = useState(true);

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
    // TODO: Implement modify functionality
    console.log('Modify account:', account);
    alert(`Modify functionality for ${account.firstName} ${account.lastName} will be implemented`);
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
    </div>
  );
};

export default ManageAccountsPage;