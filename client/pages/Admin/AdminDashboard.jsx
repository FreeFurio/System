import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { ref, get } from 'firebase/database';
import { FiUsers, FiUserCheck, FiUserX, FiActivity, FiTrendingUp, FiClock } from 'react-icons/fi';

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
      const roleBreakdown = {};
      let totalActiveUsers = 0;

      for (const role of roles) {
        const roleRef = ref(db, role);
        const roleSnapshot = await get(roleRef);
        const roleData = roleSnapshot.val();
        const count = roleData ? Object.keys(roleData).length : 0;
        roleBreakdown[role] = count;
        totalActiveUsers += count;
      }

      // Get recent notifications for activity
      const notifRef = ref(db, 'notification/admin');
      const notifSnapshot = await get(notifRef);
      const notifications = notifSnapshot.val();
      const recentActivity = notifications 
        ? Object.values(notifications)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5)
        : [];

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

  const StatCard = ({ icon: Icon, title, value, color, bgColor }) => (
    <div style={{
      background: '#fff', borderRadius: '12px', padding: '24px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb',
      display: 'flex', alignItems: 'center', gap: '16px'
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px',
        background: bgColor, display: 'flex', alignItems: 'center',
        justifyContent: 'center'
      }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <h3 style={{ margin: 0, fontSize: '2rem', fontWeight: '700', color: '#1f2937' }}>
          {value}
        </h3>
        <p style={{ margin: 0, fontSize: '0.875rem', color: '#6b7280', fontWeight: '500' }}>
          {title}
        </p>
      </div>
    </div>
  );

  return (
    <div style={{ padding: '0', maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0' }}>
          Admin Dashboard
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Overview of your salon management system
        </p>
      </div>

      {/* Stats Grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '24px', marginBottom: '32px'
      }}>
        <StatCard
          icon={FiUsers}
          title="Total Users"
          value={stats.totalUsers}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <StatCard
          icon={FiUserCheck}
          title="Active Users"
          value={stats.activeUsers}
          color="#10b981"
          bgColor="#f0fdf4"
        />
        <StatCard
          icon={FiUserX}
          title="Pending Approvals"
          value={stats.pendingApprovals}
          color="#f59e0b"
          bgColor="#fffbeb"
        />
        <StatCard
          icon={FiActivity}
          title="System Status"
          value="Active"
          color="#10b981"
          bgColor="#f0fdf4"
        />
      </div>

      {/* Role Breakdown & Recent Activity */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        {/* Role Breakdown */}
        <div style={{
          background: '#fff', borderRadius: '12px', padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0' }}>
            Users by Role
          </h2>
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
          background: '#fff', borderRadius: '12px', padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0' }}>
            Recent Activity
          </h2>
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
  );
};

export default AdminDashboard; 