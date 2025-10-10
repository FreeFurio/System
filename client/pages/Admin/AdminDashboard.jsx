import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { ref, get } from 'firebase/database';
import { FiUsers, FiUserCheck, FiUserX, FiActivity, FiTrendingUp, FiClock } from 'react-icons/fi';
import { componentStyles, statusColors } from '../../styles/designSystem';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    pendingApprovals: 0,
    activeUsers: 0,
    roleBreakdown: {
      ContentCreator: 0,
      MarketingLead: 0,
      GraphicDesigner: 0
    },
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get pending approvals
      const approvalRef = ref(db, 'ApprovalofAccounts');
      const approvalSnapshot = await get(approvalRef);
      const pendingData = approvalSnapshot.val();
      const pendingCount = pendingData ? Object.keys(pendingData).length : 0;

      // Get users by role
      const roles = ['ContentCreator', 'MarketingLead', 'GraphicDesigner'];
      const roleBreakdown = {
        ContentCreator: 0,
        MarketingLead: 0,
        GraphicDesigner: 0
      };
      let totalActiveUsers = 0;

      for (const role of roles) {
        try {
          const roleRef = ref(db, role);
          const roleSnapshot = await get(roleRef);
          const roleData = roleSnapshot.val();
          const count = roleData ? Object.keys(roleData).length : 0;
          roleBreakdown[role] = count;
          totalActiveUsers += count;
        } catch (roleError) {
          console.warn(`Error fetching ${role} data:`, roleError);
          roleBreakdown[role] = 0;
        }
      }

      // Get recent notifications for activity
      let recentActivity = [];
      try {
        const notifRef = ref(db, 'notification/admin');
        const notifSnapshot = await get(notifRef);
        const notifications = notifSnapshot.val();
        recentActivity = notifications 
          ? Object.values(notifications)
              .filter(notif => notif && notif.timestamp)
              .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
              .slice(0, 5)
          : [];
      } catch (notifError) {
        console.warn('Error fetching notifications:', notifError);
      }

      setStats({
        totalUsers: totalActiveUsers + pendingCount,
        pendingApprovals: pendingCount,
        activeUsers: totalActiveUsers,
        roleBreakdown,
        recentActivity
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div>Loading dashboard...</div>
      </div>
    );
  }

  const StatCard = ({ icon: Icon, title, value, badge, color = 'blue' }) => (
    <div style={{
      background: '#fff',
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.2s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-2px)';
      e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: color === 'blue' ? 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)' :
                       color === 'green' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' :
                       color === 'orange' ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' :
                       'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }}>
            <Icon size={28} />
          </div>
          <div>
            <div style={{
              fontSize: '16px',
              fontWeight: '500',
              color: '#6b7280',
              marginBottom: '4px',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              {title}
            </div>
          </div>
        </div>
        <span style={{
          background: color === 'blue' ? '#dbeafe' :
                     color === 'green' ? '#d1fae5' :
                     color === 'orange' ? '#fed7aa' :
                     '#e0e7ff',
          color: color === 'blue' ? '#1e40af' :
                color === 'green' ? '#065f46' :
                color === 'orange' ? '#9a3412' :
                '#5b21b6',
          padding: '4px 8px',
          borderRadius: '6px',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {badge}
        </span>
      </div>
      <div style={{
        fontSize: '36px',
        fontWeight: '800',
        color: '#111827',
        marginBottom: '8px',
        lineHeight: '1'
      }}>
        {value}
      </div>
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    <div style={{
      padding: '24px',
      backgroundColor: '#ffffff',
      minHeight: '100vh'
    }}>
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
          margin: 0,
          color: '#111827',
          fontSize: '32px',
          fontWeight: '800',
          letterSpacing: '-0.025em'
        }}>Admin Dashboard</h1>
        <p style={{
          margin: '8px 0 0 0',
          color: '#6b7280',
          fontSize: '16px',
          fontWeight: '400'
        }}>Overview of your digital marketing system</p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px',
        marginBottom: '32px'
      }}>
        <StatCard
          icon={FiUsers}
          title="Total Users"
          value={stats.totalUsers}
          badge="TOTAL"
          color="blue"
        />
        <StatCard
          icon={FiUserCheck}
          title="Active Users"
          value={stats.activeUsers}
          badge="ACTIVE"
          color="green"
        />
        <StatCard
          icon={FiUserX}
          title="Pending Approvals"
          value={stats.pendingApprovals}
          badge="PENDING"
          color="orange"
        />
        <StatCard
          icon={FiActivity}
          title="System Status"
          value="Online"
          badge="STATUS"
          color="purple"
        />
      </div>

      {/* Role Breakdown & Recent Activity */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
        gap: '24px'
      }}>
        {/* Role Breakdown */}
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <FiUsers size={20} />
              </div>
              <div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '2px'
                }}>
                  Users by Role
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  Role distribution overview
                </div>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {Object.entries(stats.roleBreakdown).map(([role, count]) => {
              const percentage = stats.activeUsers > 0 ? (count / stats.activeUsers * 100).toFixed(1) : 0;
              return (
                <div key={role} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                      {role.replace(/([a-z])([A-Z])/g, '$1 $2')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      {percentage}% of total
                    </div>
                  </div>
                  <div style={{
                    fontSize: '1.25rem', fontWeight: '700', color: '#1f2937',
                    minWidth: '40px', textAlign: 'right'
                  }}>
                    {count}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Activity */}
        <div style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff'
              }}>
                <FiActivity size={20} />
              </div>
              <div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '2px'
                }}>
                  Recent Activity
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  Latest system events
                </div>
              </div>
            </div>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              animation: 'pulse 2s infinite'
            }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {stats.recentActivity.length > 0 ? stats.recentActivity.map((activity, index) => (
              <div key={index} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '12px', background: '#f8fafc', borderRadius: '8px'
              }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: activity.read ? '#6b7280' : '#ef4444'
                }}></div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>
                    {activity.message}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                    {new Date(activity.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', padding: '20px' }}>
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AdminDashboard; 