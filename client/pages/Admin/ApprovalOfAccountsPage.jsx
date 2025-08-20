import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { ref, onValue, off, remove, set, get } from 'firebase/database';
import AccountCard from '../../components/common/AccountCard';

const ApprovalOfAccountsPage = () => {
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const approvalAccountsRef = ref(db, 'ApprovalofAccounts');

    get(approvalAccountsRef).then((snapshot) => {
      const data = snapshot.val();
      if (data) {
        const accounts = Object.entries(data).map(([key, value]) => ({
          key,
          ...value,
        }));
        setPendingAccounts(accounts);
      } else {
        setPendingAccounts([]);
      }
      setLoading(false);
    }).catch(error => {
        console.error("Error fetching initial data:", error);
        setLoading(false);
    });

    const listener = onValue(approvalAccountsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const accounts = Object.entries(data).map(([key, value]) => ({
          key,
          ...value,
        }));
        setPendingAccounts(accounts);
      } else {
        setPendingAccounts([]);
      }
    });

    return () => {
      off(approvalAccountsRef, 'value', listener);
    };
  }, []);

  const handleApprove = (account) => {
    const username = account.username.toLowerCase();
    const roleRef = ref(db, `${account.role}/${username}`);
    set(roleRef, account)
      .then(() => {
        const pendingRef = ref(db, `ApprovalofAccounts/${username}`);
        remove(pendingRef);
      })
      .catch(error => console.error("Error approving account:", error));
  };

  const handleReject = (account) => {
    const username = account.username.toLowerCase();
    const pendingRef = ref(db, `ApprovalofAccounts/${username}`);
    remove(pendingRef).catch(error => console.error("Error rejecting account:", error));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="approval-page-container">
      {pendingAccounts.length === 0 ? (
        <div style={{textAlign: 'center', marginTop: '2rem', color: '#888', fontSize: '1.2rem'}}>
          No accounts pending approval.
        </div>
      ) : (
        <div className="accounts-list" style={{ width: '100%', padding: 0, margin: 0 }}>
          <h2 style={{margin: 0, padding: '20px 0 8px 0'}}>Pending Accounts</h2>
          {pendingAccounts.map(account => (
            <AccountCard
                key={account.key}
                account={account}
                onAccept={() => handleApprove(account)}
                onReject={() => handleReject(account)}
              />
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalOfAccountsPage; 