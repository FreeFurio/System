import React, { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { ref, get } from 'firebase/database';
import { FiUsers, FiTrendingUp, FiTarget, FiActivity, FiBarChart2, FiCalendar, FiCheckCircle, FiClock } from 'react-icons/fi';
import { componentStyles, statusColors } from '../../styles/designSystem';

const MarketingDashboard = () => {
  const [stats, setStats] = useState({
    pendingContent: 0,
    approvedContent: 0,
    ongoingTasks: 0,
    postedContent: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Get pending content approvals
      const approvalsRef = ref(db, 'ApprovalofContents');
      const approvalsSnapshot = await get(approvalsRef);
      const approvalsData = approvalsSnapshot.val();
      const pendingContent = approvalsData ? Object.keys(approvalsData).length : 0;

      // Get approved contents
      const approvedRef = ref(db, 'ApprovedContents');
      const approvedSnapshot = await get(approvedRef);
      const approvedData = approvedSnapshot.val();
      const approvedContent = approvedData ? Object.keys(approvedData).length : 0;

      // Get ongoing tasks
      const tasksRef = ref(db, 'OngoingTasks');
      const tasksSnapshot = await get(tasksRef);
      const tasksData = tasksSnapshot.val();
      const ongoingTasks = tasksData ? Object.keys(tasksData).length : 0;

      // Get posted content
      const postedRef = ref(db, 'PostedContent');
      const postedSnapshot = await get(postedRef);
      const postedData = postedSnapshot.val();
      const postedContent = postedData ? Object.keys(postedData).length : 0;

      // Get marketing notifications for activity
      const notifRef = ref(db, 'notification/marketing');
      const notifSnapshot = await get(notifRef);
      const notifications = notifSnapshot.val();
      const recentActivity = notifications 
        ? Object.values(notifications)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, 5)
        : [];

      setStats({
        pendingContent,
        approvedContent,
        ongoingTasks,
        postedContent,
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
    <div style={componentStyles.statCard}>
      <div style={{ ...componentStyles.statIcon, background: bgColor }}>
        <Icon size={24} color={color} />
      </div>
      <div>
        <h3 style={componentStyles.statValue}>{value}</h3>
        <p style={componentStyles.statLabel}>{title}</p>
      </div>
    </div>
  );

  return (
    <div style={componentStyles.pageContainer}>
      {/* Header */}
      <div style={componentStyles.pageHeader}>
        <h1 style={componentStyles.pageTitle}>Marketing Lead Dashboard</h1>
        <p style={componentStyles.pageSubtitle}>
          Overview of your content management and marketing activities
        </p>
      </div>

      {/* Stats Grid */}
      <div style={componentStyles.statsGrid}>
        <StatCard
          icon={FiClock}
          title="Pending Content"
          value={stats.pendingContent}
          color="#f59e0b"
          bgColor="#fffbeb"
        />
        <StatCard
          icon={FiCheckCircle}
          title="Approved Content"
          value={stats.approvedContent}
          color="#10b981"
          bgColor="#f0fdf4"
        />
        <StatCard
          icon={FiActivity}
          title="Ongoing Tasks"
          value={stats.ongoingTasks}
          color="#3b82f6"
          bgColor="#eff6ff"
        />
        <StatCard
          icon={FiTrendingUp}
          title="Posted Content"
          value={stats.postedContent}
          color="#8b5cf6"
          bgColor="#faf5ff"
        />
      </div>

      {/* Content & Activity */}
      <div style={componentStyles.twoColumnGrid}>
        {/* Content Overview */}
        <div style={componentStyles.card}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: '#1f2937', margin: '0 0 20px 0' }}>
            Content Overview
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  Content Awaiting Approval
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Needs review
                </div>
              </div>
              <div style={{
                fontSize: '1.25rem', fontWeight: '700', color: '#f59e0b',
                minWidth: '40px', textAlign: 'right'
              }}>
                {stats.pendingContent}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  Tasks in Progress
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Currently active
                </div>
              </div>
              <div style={{
                fontSize: '1.25rem', fontWeight: '700', color: '#3b82f6',
                minWidth: '40px', textAlign: 'right'
              }}>
                {stats.ongoingTasks}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  Content Published
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Live content
                </div>
              </div>
              <div style={{
                fontSize: '1.25rem', fontWeight: '700', color: '#10b981',
                minWidth: '40px', textAlign: 'right'
              }}>
                {stats.postedContent}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div style={componentStyles.card}>
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
                  background: activity.read ? '#6b7280' : '#3b82f6'
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
              <>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px', background: '#f8fafc', borderRadius: '8px'
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#3b82f6' }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>
                      New content submitted for approval
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      2 hours ago
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px', background: '#f8fafc', borderRadius: '8px'
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>
                      Content approved and ready for publishing
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      4 hours ago
                    </div>
                  </div>
                </div>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px', background: '#f8fafc', borderRadius: '8px'
                }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }}></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.875rem', color: '#374151', fontWeight: '500' }}>
                      Task assigned to Content Creator
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                      1 day ago
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;