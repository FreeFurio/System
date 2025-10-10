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
    facebookPosts: 0,
    instagramPosts: 0,
    twitterPosts: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      let pendingContent = 0;
      let approvedContent = 0;
      let postedContent = 0;
      let ongoingTasks = 0;
      let recentActivity = [];
      
      // Get all workflows data
      try {
        const workflowsResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows`);
        if (workflowsResponse.ok) {
          const workflowsData = await workflowsResponse.json();
          
          if (workflowsData.status === 'success' && workflowsData.data) {
            const workflows = workflowsData.data;
            
            // Count by status
            pendingContent = workflows.filter(w => w.status === 'content_approval').length;
            approvedContent = workflows.filter(w => w.status === 'ready_for_design_assignment').length;
            ongoingTasks = workflows.filter(w => 
              w.status === 'content_creation' || w.status === 'graphic_design'
            ).length;
            
            // Count cached posts from Firebase
            let facebookPosts = 0, instagramPosts = 0, twitterPosts = 0;
            
            const cachedPostsRef = ref(db, 'cachedPosts/admin');
            const cachedSnapshot = await get(cachedPostsRef);
            
            if (cachedSnapshot.exists()) {
              const cachedData = cachedSnapshot.val();
              
              facebookPosts = cachedData.facebook?.posts ? Object.keys(cachedData.facebook.posts).length : 0;
              instagramPosts = cachedData.instagram?.posts ? Object.keys(cachedData.instagram.posts).length : 0;
              twitterPosts = cachedData.twitter?.posts ? Object.keys(cachedData.twitter.posts).length : 0;
              
              console.log('📊 Dashboard Firebase counts:', { facebookPosts, instagramPosts, twitterPosts });
            }
            
            postedContent = facebookPosts + instagramPosts + twitterPosts;
            
            setStats({
              pendingContent,
              approvedContent,
              ongoingTasks,
              postedContent,
              facebookPosts,
              instagramPosts,
              twitterPosts,
              recentActivity
            });
          }
        }
      } catch (workflowError) {
        console.warn('Error fetching workflows:', workflowError);
      }

      // Get marketing notifications for activity
      try {
        const notifRef = ref(db, 'notification/marketing');
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
    <div style={componentStyles.pageContainer}>
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
        }}>Marketing Lead Dashboard</h1>
        <p style={{
          margin: '8px 0 0 0',
          color: '#6b7280',
          fontSize: '16px',
          fontWeight: '400'
        }}>Overview of your content management and marketing activities</p>
      </div>

      {/* Stats Grid */}
      <div style={componentStyles.statsGrid}>
        <StatCard
          icon={FiClock}
          title="Pending Content"
          value={stats.pendingContent}
          badge="PENDING"
          color="orange"
        />
        <StatCard
          icon={FiCheckCircle}
          title="Approved Content"
          value={stats.approvedContent}
          badge="APPROVED"
          color="green"
        />
        <StatCard
          icon={FiActivity}
          title="Ongoing Tasks"
          value={stats.ongoingTasks}
          badge="ACTIVE"
          color="blue"
        />
        <StatCard
          icon={FiTrendingUp}
          title="Posted Content"
          value={stats.postedContent}
          badge="POSTED"
          color="purple"
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
                  Facebook Posts
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Published content
                </div>
              </div>
              <div style={{
                fontSize: '1.25rem', fontWeight: '700', color: '#1877f2',
                minWidth: '40px', textAlign: 'right'
              }}>
                {stats.facebookPosts}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  Instagram Posts
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Published content
                </div>
              </div>
              <div style={{
                fontSize: '1.25rem', fontWeight: '700', color: '#e4405f',
                minWidth: '40px', textAlign: 'right'
              }}>
                {stats.instagramPosts}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                  Twitter Posts
                </div>
                <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                  Published content
                </div>
              </div>
              <div style={{
                fontSize: '1.25rem', fontWeight: '700', color: '#1da1f2',
                minWidth: '40px', textAlign: 'right'
              }}>
                {stats.twitterPosts}
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
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: '#9ca3af',
                fontSize: '14px'
              }}>
                No recent activity
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketingDashboard;