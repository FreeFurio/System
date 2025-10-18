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
    recentActivity: [],
    recentPosts: []
  });
  const [loading, setLoading] = useState(true);
  const [showRecentPostsModal, setShowRecentPostsModal] = useState(false);
  const [recentPostsData, setRecentPostsData] = useState([]);
  const [activePostsTab, setActivePostsTab] = useState('facebook');

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
          }
        }
      } catch (workflowError) {
        console.warn('Error fetching workflows:', workflowError);
      }

      // Get recent posts from actual social media accounts
      let recentPosts = [];
      try {
        const API_BASE_URL = import.meta.env.PROD 
          ? '/api/v1/admin' 
          : 'http://localhost:3000/api/v1/admin';
        
        // Fetch from all platforms
        const [facebookResponse, instagramResponse, twitterResponse] = await Promise.allSettled([
          fetch(`${API_BASE_URL}/facebook-posts`),
          fetch(`${API_BASE_URL}/instagram-data`),
          fetch(`${API_BASE_URL}/twitter-data`)
        ]);
        
        let allPosts = [];
        
        // Process Facebook posts
        if (facebookResponse.status === 'fulfilled') {
          const fbData = await facebookResponse.value.json();
          if (fbData.success && fbData.posts) {
            allPosts.push(...fbData.posts.map(post => ({ ...post, platform: 'facebook' })));
          }
        }
        
        // Process Instagram posts
        if (instagramResponse.status === 'fulfilled') {
          const igData = await instagramResponse.value.json();
          if (igData.success && igData.posts) {
            allPosts.push(...igData.posts.map(post => ({ ...post, platform: 'instagram' })));
          }
        }
        
        // Process Twitter posts
        if (twitterResponse.status === 'fulfilled') {
          const twData = await twitterResponse.value.json();
          if (twData.success && twData.posts) {
            allPosts.push(...twData.posts.map(post => ({ ...post, platform: 'twitter' })));
          }
        }
        
        // Sort by creation time and take recent posts
        recentPosts = allPosts
          .sort((a, b) => new Date(b.createdTime || b.created_at) - new Date(a.createdTime || a.created_at))
          .slice(0, 15);
          
      } catch (postsError) {
        console.warn('Error fetching recent posts:', postsError);
      }

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
              recentActivity,
              recentPosts
            });
            setRecentPostsData(recentPosts);
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

        {/* Recent Posts */}
        <div 
          onClick={() => setShowRecentPostsModal(true)}
          style={{
            ...componentStyles.card,
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
          }}
        >
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
                <FiTrendingUp size={20} />
              </div>
              <div>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  color: '#111827',
                  marginBottom: '2px'
                }}>
                  Recent Posts
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#6b7280'
                }}>
                  Latest published content
                </div>
              </div>
            </div>
            <div style={{
              background: '#dcfce7',
              color: '#166534',
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '600'
            }}>
              {stats.recentPosts?.length || 0} POSTS
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.recentPosts && stats.recentPosts.length > 0 ? stats.recentPosts.slice(0, 3).map((post, index) => {
              // Platform-specific template styling
              const getTemplateStyle = (platform) => {
                switch(platform) {
                  case 'facebook':
                    return {
                      background: '#fff',
                      border: '1px solid #e4e6ea',
                      borderRadius: '8px',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    };
                  case 'instagram':
                    return {
                      background: '#fff',
                      border: '1px solid #dbdbdb',
                      borderRadius: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    };
                  case 'twitter':
                    return {
                      background: '#fff',
                      border: '1px solid #e1e8ed',
                      borderRadius: '16px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.12)'
                    };
                  default:
                    return {
                      background: '#f8fafc',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px'
                    };
                }
              };
              
              return (
                <div key={index} style={{
                  ...getTemplateStyle(post.platform),
                  padding: '12px',
                  marginBottom: '8px'
                }}>
                  {/* Header with Profile */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {/* Profile Picture */}
                    {post.pageId && post.platform === 'facebook' ? (
                      <img 
                        src={`/api/v1/admin/proxy-image?url=${encodeURIComponent(`https://graph.facebook.com/v23.0/${post.pageId}/picture?type=small`)}`}
                        alt={post.pageName}
                        style={{
                          width: '24px',
                          height: '24px',
                          borderRadius: '50%',
                          objectFit: 'cover'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                    ) : null}
                    <div style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background: post.platform === 'facebook' ? '#1877f2' : 
                                post.platform === 'instagram' ? '#e4405f' : '#1da1f2',
                      display: (post.pageId && post.platform === 'facebook') ? 'none' : 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: 'bold',
                      fontSize: '10px'
                    }}>
                      {post.platform === 'facebook' ? 'f' : post.platform === 'instagram' ? 'ig' : 't'}
                    </div>
                    
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#1c1e21' }}>
                        {post.pageName || post.name || 'Unknown Account'}
                      </div>
                      <div style={{ fontSize: '0.625rem', color: '#65676b' }}>
                        {new Date(post.createdTime || post.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#1c1e21',
                    lineHeight: '1.3',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {`${(post.message || post.caption || post.text || '').substring(0, 100)}${(post.message || post.caption || post.text || '').length > 100 ? '...' : ''}`}
                  </div>
                  
                  {/* Platform indicator */}
                  <div style={{
                    marginTop: '8px',
                    fontSize: '0.625rem',
                    color: '#65676b',
                    textAlign: 'right'
                  }}>
                    {post.platform.charAt(0).toUpperCase() + post.platform.slice(1)}
                  </div>
                </div>
              );
            }) : (
              <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '0.875rem', padding: '20px' }}>
                No recent posts
              </div>
            )}
            {stats.recentPosts && stats.recentPosts.length > 3 && (
              <div style={{ textAlign: 'center', color: '#3b82f6', fontSize: '0.75rem', fontWeight: '500' }}>
                +{stats.recentPosts.length - 3} more posts
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Posts Modal */}
      {showRecentPostsModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            width: '90%',
            maxWidth: '1000px',
            maxHeight: '80vh',
            overflow: 'hidden',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)'
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '24px',
              borderBottom: '1px solid #e5e7eb',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <h2 style={{
                margin: 0,
                fontSize: '24px',
                fontWeight: '700',
                color: '#111827'
              }}>Recent Posts</h2>
              <button
                onClick={() => setShowRecentPostsModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '24px',
                  cursor: 'pointer',
                  color: '#6b7280',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>

            {/* Platform Tabs */}
            <div style={{
              display: 'flex',
              borderBottom: '1px solid #e5e7eb',
              background: '#f9fafb'
            }}>
              {['facebook', 'instagram', 'twitter'].map(platform => (
                <button
                  key={platform}
                  onClick={() => setActivePostsTab(platform)}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    background: activePostsTab === platform ? '#fff' : 'transparent',
                    color: activePostsTab === platform ? '#3b82f6' : '#6b7280',
                    fontWeight: activePostsTab === platform ? '600' : '400',
                    cursor: 'pointer',
                    borderBottom: activePostsTab === platform ? '2px solid #3b82f6' : 'none',
                    textTransform: 'capitalize'
                  }}
                >
                  {platform}
                </button>
              ))}
            </div>

            {/* Modal Content */}
            <div style={{
              padding: '24px',
              maxHeight: '60vh',
              overflowY: 'auto'
            }}>
              {recentPostsData.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6b7280'
                }}>
                  No recent posts found.
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {recentPostsData
                    .filter(post => post.platform === activePostsTab)
                    .map(post => {
                      return (
                        <div key={post.id} style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '20px',
                          background: '#fff'
                        }}>
                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '16px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              {/* Profile Picture */}
                              {post.pageId && activePostsTab === 'facebook' ? (
                                <img 
                                  src={`/api/v1/admin/proxy-image?url=${encodeURIComponent(`https://graph.facebook.com/v23.0/${post.pageId}/picture?type=normal`)}`}
                                  alt={post.pageName}
                                  style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                  }}
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                  }}
                                />
                              ) : null}
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: activePostsTab === 'facebook' ? '#1877f2' : activePostsTab === 'instagram' ? '#e4405f' : '#1da1f2',
                                display: (post.pageId && activePostsTab === 'facebook') ? 'none' : 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontWeight: 'bold',
                                fontSize: '16px'
                              }}>
                                {(post.pageName || post.name || 'U').charAt(0)}
                              </div>
                              
                              <div>
                                <h3 style={{
                                  margin: '0 0 8px 0',
                                  fontSize: '18px',
                                  fontWeight: '600',
                                  color: '#111827'
                                }}>
                                  {post.pageName || post.name || 'Unknown Account'}
                                </h3>
                                <div style={{
                                  display: 'flex',
                                  gap: '12px',
                                  fontSize: '14px',
                                  color: '#6b7280'
                                }}>
                                  <span>Posted: {new Date(post.createdTime || post.created_at).toLocaleString()}</span>
                                  <span>Post ID: {post.id}</span>
                                </div>
                              </div>
                            </div>
                            <span style={{
                              background: '#dcfce7',
                              color: '#166534',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              POSTED
                            </span>
                          </div>

                          {/* Content Display */}
                          <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '20px'
                          }}>
                            <div>
                              <h4 style={{
                                margin: '0 0 12px 0',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#374151'
                              }}>Posted Content</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div>
                                  <strong style={{ color: '#6b7280', fontSize: '12px' }}>CONTENT:</strong>
                                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', lineHeight: '1.4' }}>
                                    {post.message || post.caption || post.text || 'No content'}
                                  </p>
                                </div>
                                
                                {/* Media Image */}
                                {(post.image || post.mediaUrl) && (
                                  <div style={{ marginTop: '8px' }}>
                                    <strong style={{ color: '#6b7280', fontSize: '12px' }}>MEDIA:</strong>
                                    <img 
                                      src={`/api/v1/admin/proxy-image?url=${encodeURIComponent(post.image || post.mediaUrl)}`}
                                      alt="Post media" 
                                      style={{ 
                                        width: '100%', 
                                        maxHeight: '200px', 
                                        objectFit: 'cover', 
                                        borderRadius: '8px',
                                        marginTop: '4px'
                                      }} 
                                    />
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Engagement Stats */}
                            <div>
                              <h4 style={{
                                margin: '0 0 12px 0',
                                fontSize: '16px',
                                fontWeight: '600',
                                color: '#374151'
                              }}>Engagement</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {activePostsTab === 'facebook' && (
                                  <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Reactions:</span>
                                      <span style={{ fontSize: '14px' }}>{post.reactions || 0}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Comments:</span>
                                      <span style={{ fontSize: '14px' }}>{post.comments || 0}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Shares:</span>
                                      <span style={{ fontSize: '14px' }}>{post.shares || 0}</span>
                                    </div>
                                  </>
                                )}
                                {activePostsTab === 'instagram' && (
                                  <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Likes:</span>
                                      <span style={{ fontSize: '14px' }}>{post.likes || 0}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Comments:</span>
                                      <span style={{ fontSize: '14px' }}>{post.comments || 0}</span>
                                    </div>
                                  </>
                                )}
                                {activePostsTab === 'twitter' && (
                                  <>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Likes:</span>
                                      <span style={{ fontSize: '14px' }}>{post.likes || 0}</span>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                      <span style={{ fontSize: '12px', color: '#6b7280' }}>Retweets:</span>
                                      <span style={{ fontSize: '14px' }}>{post.retweets || 0}</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarketingDashboard;