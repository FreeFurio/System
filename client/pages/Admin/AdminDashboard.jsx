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
    workflowsNearPosting: 0,
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

      // Get workflows near posting
      let workflowsNearPosting = 0;
      let workflowsData = [];
      try {
        const workflowsRef = ref(db, 'workflows');
        const workflowsSnapshot = await get(workflowsRef);
        const workflows = workflowsSnapshot.val();
        
        if (workflows) {
          const nearPostingWorkflows = Object.entries(workflows)
            .filter(([key, workflow]) => {
              return workflow.status === 'design_approved' || 
                     workflow.status === 'ready_for_design_assignment' ||
                     workflow.currentStage === 'approved';
            })
            .map(([key, workflow]) => ({ id: key, ...workflow }));
          
          workflowsNearPosting = nearPostingWorkflows.length;
          workflowsData = nearPostingWorkflows;
        }
      } catch (workflowError) {
        console.warn('Error fetching workflows:', workflowError);
      }

      setStats({
        totalUsers: totalActiveUsers + pendingCount,
        pendingApprovals: pendingCount,
        activeUsers: totalActiveUsers,
        workflowsNearPosting,
        roleBreakdown,
        recentPosts
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
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
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
          icon={FiClock}
          title="Near Posting"
          value={stats.workflowsNearPosting}
          badge="READY"
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

        {/* Recent Posts */}
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
    </div>
  );
};

export default AdminDashboard;
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
              }}>Workflows Near Posting</h2>
              <button
                onClick={() => setShowWorkflowModal(false)}
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
                  onClick={() => setActiveWorkflowTab(platform)}
                  style={{
                    padding: '12px 24px',
                    border: 'none',
                    background: activeWorkflowTab === platform ? '#fff' : 'transparent',
                    color: activeWorkflowTab === platform ? '#3b82f6' : '#6b7280',
                    fontWeight: activeWorkflowTab === platform ? '600' : '400',
                    cursor: 'pointer',
                    borderBottom: activeWorkflowTab === platform ? '2px solid #3b82f6' : 'none',
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
              {workflowsData.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '40px',
                  color: '#6b7280'
                }}>
                  No workflows near posting found.
                </div>
              ) : (
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px'
                }}>
                  {workflowsData
                    .filter(workflow => {
                      const content = workflow.contentCreator?.content;
                      if (!content) return false;
                      
                      if (content.selectedContent) {
                        return content.selectedContent[activeWorkflowTab];
                      }
                      return activeWorkflowTab === 'facebook';
                    })
                    .map(workflow => {
                      const content = workflow.contentCreator?.content;
                      const platformContent = content?.selectedContent?.[activeWorkflowTab] || {
                        headline: content?.headline || '',
                        caption: content?.caption || '',
                        hashtag: content?.hashtag || ''
                      };
                      const seoData = content?.seoAnalysis;

                      return (
                        <div key={workflow.id} style={{
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
                            <div>
                              <h3 style={{
                                margin: '0 0 8px 0',
                                fontSize: '18px',
                                fontWeight: '600',
                                color: '#111827'
                              }}>
                                {workflow.objectives}
                              </h3>
                              <div style={{
                                display: 'flex',
                                gap: '12px',
                                fontSize: '14px',
                                color: '#6b7280'
                              }}>
                                <span>Status: {workflow.status}</span>
                                <span>Deadline: {new Date(workflow.deadline).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <span style={{
                              background: workflow.status === 'design_approved' ? '#dcfce7' : '#fef3c7',
                              color: workflow.status === 'design_approved' ? '#166534' : '#92400e',
                              padding: '4px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}>
                              {workflow.status === 'design_approved' ? 'APPROVED' : 'PENDING'}
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
                              }}>Content</h4>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                <div>
                                  <strong style={{ color: '#6b7280', fontSize: '12px' }}>HEADLINE:</strong>
                                  <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                                    {platformContent.headline}
                                  </p>
                                </div>
                                <div>
                                  <strong style={{ color: '#6b7280', fontSize: '12px' }}>CAPTION:</strong>
                                  <p style={{ margin: '4px 0 0 0', fontSize: '14px' }}>
                                    {platformContent.caption}
                                  </p>
                                </div>
                                <div>
                                  <strong style={{ color: '#6b7280', fontSize: '12px' }}>HASHTAGS:</strong>
                                  <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#3b82f6' }}>
                                    {platformContent.hashtag}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* SEO Analysis */}
                            {seoData && (
                              <div>
                                <h4 style={{
                                  margin: '0 0 12px 0',
                                  fontSize: '16px',
                                  fontWeight: '600',
                                  color: '#374151'
                                }}>SEO Analysis</h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Overall Score:</span>
                                    <span style={{
                                      fontSize: '14px',
                                      fontWeight: '600',
                                      color: seoData.overallScore >= 80 ? '#059669' : 
                                             seoData.overallScore >= 60 ? '#d97706' : '#dc2626'
                                    }}>
                                      {seoData.overallScore}/100
                                    </span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Readability:</span>
                                    <span style={{ fontSize: '14px' }}>{seoData.readability?.gradeLevel}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Sentiment:</span>
                                    <span style={{ fontSize: '14px' }}>{seoData.sentiment}</span>
                                  </div>
                                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <span style={{ fontSize: '12px', color: '#6b7280' }}>Power Words:</span>
                                    <span style={{ fontSize: '14px' }}>{seoData.powerWords?.length || 0}</span>
                                  </div>
                                </div>
                              </div>
                            )}
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
    </>
  );
};

export default AdminDashboard; 