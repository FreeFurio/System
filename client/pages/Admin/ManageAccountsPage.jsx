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

  if (loading) return <div>Loading...</div>;

  const hasAccounts = Object.values(accountsByRole).some(arr => arr && arr.length > 0);

  return (
    <div className="manage-accounts-page-container">
      {!hasAccounts && (
        <div style={{textAlign: 'center', marginTop: '2rem', color: '#888', fontSize: '1.2rem'}}>
          No accounts found.
        </div>
      )}
      {ROLES.map(role => (
        accountsByRole[role] && accountsByRole[role].length > 0 && (
          <div key={role} className="role-section">
            <h2>{role}</h2>
            {accountsByRole[role].map(account => (
              <AccountCard
                key={account.key}
                account={account}
                onDelete={() => handleDelete(role, account.key)}
              />
            ))}
          </div>
        )
      ))}
    </div>
  );
};

export default ManageAccountsPage; 