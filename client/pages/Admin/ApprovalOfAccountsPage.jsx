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
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div style={{ fontSize: '1.1rem', color: '#6b7280' }}>Loading pending accounts...</div>
      </div>
    );
  }

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
              <FiUserCheck size={28} color="#10b981" />
              Approval of Accounts
            </h1>
            <p style={{
              color: 'var(--text-secondary, #6b7280)',
              fontSize: '1rem',
              margin: '8px 0 0 0'
            }}>
              {pendingAccounts.length} total pending • {filteredAccounts.length} showing
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
              onFocus={(e) => e.target.style.borderColor = '#10b981'}
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
              <option value="ContentCreator">Content Creator</option>
              <option value="MarketingLead">Marketing Lead</option>
              <option value="GraphicDesigner">Graphic Designer</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div style={{ padding: '32px' }}>
        {filteredAccounts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            background: 'var(--bg-primary, #fff)',
            borderRadius: '16px',
            boxShadow: '0 4px 6px var(--shadow, rgba(0,0,0,0.05))',
            border: '1px solid var(--border-primary, #f3f4f6)'
          }}>
            <FiUserCheck size={48} color="var(--text-tertiary, #d1d5db)" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: 'var(--text-secondary, #6b7280)', fontSize: '1.25rem', margin: '0 0 8px 0' }}>
              {searchTerm || selectedRole !== 'all' ? 'No matching pending accounts' : 'No accounts pending approval'}
            </h3>
            <p style={{ color: 'var(--text-tertiary, #9ca3af)', margin: 0 }}>
              {searchTerm || selectedRole !== 'all' ? 'Try adjusting your search or filter criteria' : 'New account requests will appear here'}
            </p>
          </div>
        ) : (
          <div style={{
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
                Pending Accounts
              </h2>
              <span style={{
                background: '#10b981',
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
                  onAccept={() => handleApprove(account)}
                  onReject={() => handleReject(account)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalOfAccountsPage; 