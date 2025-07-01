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
    const roleRef = ref(db, `${account.role}/${account.key}`);
    set(roleRef, account)
      .then(() => {
        const pendingRef = ref(db, `ApprovalofAccounts/${account.key}`);
        remove(pendingRef);
      })
      .catch(error => console.error("Error approving account:", error));
  };

  const handleReject = (accountKey) => {
    const pendingRef = ref(db, `ApprovalofAccounts/${accountKey}`);
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
        <div className="accounts-list">
          <h2>Pending Accounts</h2>
          {pendingAccounts.map(account => (
            <AccountCard
                key={account.key}
                account={account}
                onAccept={() => handleApprove(account)}
                onReject={() => handleReject(account.key)}
              />
          ))}
        </div>
      )}
    </div>
  );
};

export default ApprovalOfAccountsPage; 