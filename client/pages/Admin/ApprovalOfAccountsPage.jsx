import React, { useEffect, useState } from 'react';
import { db } from '../../services/firebase';
import { ref, onValue, off, remove, set, get, update } from 'firebase/database';
import AccountCard from '../../components/common/AccountCard';
import { FiSearch, FiUserCheck, FiFilter } from 'react-icons/fi';

const ApprovalOfAccountsPage = () => {
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const markApprovalNotificationsAsRead = async () => {
    try {
      const notificationsRef = ref(db, 'notification/admin');
      const snapshot = await get(notificationsRef);
      const notifications = snapshot.val();
      
      if (notifications) {
        const updates = {};
        Object.entries(notifications).forEach(([id, notification]) => {
          if (notification.type === 'approval_needed' && !notification.read) {
            updates[`notification/admin/${id}/read`] = true;
          }
        });
        
        if (Object.keys(updates).length > 0) {
          await update(ref(db), updates);
        }
      }
    } catch (error) {
      console.error('Error marking notifications as read:', error);
    }
  };

  useEffect(() => {
    const approvalAccountsRef = ref(db, 'ApprovalofAccounts');
    
    // Mark approval notifications as read when page loads
    markApprovalNotificationsAsRead();

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

  const filterAccounts = () => {
    return pendingAccounts.filter(account => {
      const matchesSearch = searchTerm === '' || 
        account.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        account.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = selectedRole === 'all' || account.role === selectedRole;
      return matchesSearch && matchesRole;
    });
  };

  const formatRole = (role) => role.replace(/([a-z])([A-Z])/g, '$1 $2');
  const filteredAccounts = filterAccounts();

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
            Approval of Accounts
          </h1>
        </div>
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#6b7280',
          fontSize: '14px'
        }}>
          Loading pending accounts...
        </div>
      </div>
    );
  }

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
          Approval of Accounts
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: '8px 0 0 0',
          fontWeight: '400'
        }}>
          Review and approve new account registrations ({pendingAccounts.length} pending)
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
            onFocus={(e) => e.target.style.borderColor = '#10b981'}
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
            <option value="ContentCreator">Content Creator</option>
            <option value="MarketingLead">Marketing Lead</option>
            <option value="GraphicDesigner">Graphic Designer</option>
          </select>
        </div>
      </div>

      {/* Pending Accounts Section */}
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
            Pending Accounts
          </h2>
          {filteredAccounts.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#9ca3af',
              fontSize: '14px'
            }}>
              {searchTerm || selectedRole !== 'all' ? 'No matching pending accounts found.' : 'No accounts pending approval.'}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {filteredAccounts.map(account => (
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
      </div>
    </div>
  );
};

export default ApprovalOfAccountsPage; 