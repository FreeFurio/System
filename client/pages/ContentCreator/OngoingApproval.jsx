import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { FiClock, FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';

const SEOBar = ({ score, label, width = '100%' }) => {
  const getColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 75) return '#f59e0b';
    return '#ef4444';
  };
  
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
        <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{label}</span>
        <span style={{ fontSize: '14px', fontWeight: '700', color: getColor(score) }}>{score}/100</span>
      </div>
      <div style={{
        width: width,
        height: '8px',
        backgroundColor: '#e5e7eb',
        borderRadius: '4px',
        overflow: 'hidden'
      }}>
        <div style={{
          width: `${score}%`,
          height: '100%',
          backgroundColor: getColor(score),
          borderRadius: '4px',
          transition: 'width 0.5s ease-in-out'
        }} />
      </div>
    </div>
  );
};

const MultiPlatformContentModal = ({ workflow }) => {
  const [activeTab, setActiveTab] = useState('facebook');
  
  const getPlatformEmoji = (platform) => {
    const emojis = { facebook: '🔵', instagram: '🟣', twitter: '🔵' };
    return emojis[platform] || '📱';
  };
  
  const getPlatformDisplayName = (platform) => {
    const names = { facebook: 'Facebook', instagram: 'Instagram', twitter: 'Twitter' };
    return names[platform] || platform;
  };
  
  const selectedContent = workflow.contentCreator?.content?.selectedContent || {};
  const seoAnalysis = workflow.contentCreator?.content?.seoAnalysis || {};
  const availablePlatforms = Object.keys(selectedContent);
  
  if (availablePlatforms.length === 0) {
    return (
      <div style={{
        marginTop: '24px',
        padding: '32px',
        background: '#f8f9fa',
        borderRadius: '16px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
        <div style={{ fontSize: '16px', color: '#6b7280' }}>No content available</div>
      </div>
    );
  }
  
  return (
    <div style={{
      marginTop: '24px',
      padding: '32px',
      background: 'transparent',
      borderRadius: '16px',
      border: '1px solid #e5e7eb',
      maxHeight: '60vh',
      overflow: 'auto'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <h4 style={{ 
          margin: 0, 
          color: '#000000', 
          fontSize: '20px', 
          fontWeight: '700',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📝 Multi-Platform Content
        </h4>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '8px', 
        marginBottom: '24px'
      }}>
        {availablePlatforms.map(platform => (
          <button
            key={platform}
            onClick={() => setActiveTab(platform)}
            style={{
              padding: '12px 24px',
              background: activeTab === platform 
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                : '#f8f9fa',
              color: activeTab === platform ? '#fff' : '#6b7280',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {getPlatformEmoji(platform)} {getPlatformDisplayName(platform)}
          </button>
        ))}
      </div>
      
      {selectedContent[activeTab] && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginBottom: '20px', alignItems: 'start' }}>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>📰 Headline</div>
              <div style={{ fontSize: '16px', color: '#1f2937', lineHeight: 1.4 }}>
                {selectedContent[activeTab].headline}
              </div>
            </div>
            
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
              <SEOBar score={seoAnalysis[activeTab]?.headlineScore || 0} label="Headline SEO" />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginBottom: '20px', alignItems: 'start' }}>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>📝 Caption</div>
              <div style={{ fontSize: '15px', color: '#374151', lineHeight: 1.5 }}>
                {selectedContent[activeTab].caption}
              </div>
            </div>
            
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
              <SEOBar score={seoAnalysis[activeTab]?.captionScore || 0} label="Caption SEO" />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>🏷️ Hashtags</div>
              <div style={{ fontSize: '15px', color: '#3b82f6', fontWeight: 600 }}>
                {selectedContent[activeTab].hashtag}
              </div>
            </div>
            
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
              <SEOBar score={seoAnalysis[activeTab]?.overallScore || 0} label="Overall SEO Score" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ApprovalCard = ({ workflow }) => {
  const [expanded, setExpanded] = useState(false);
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = () => {
    switch (workflow.status) {
      case 'content_approval': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'ready_for_design_assignment': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'content_rejected': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
    }
  };

  const getStatusText = () => {
    switch (workflow.status) {
      case 'content_approval': return 'Pending Approval';
      case 'ready_for_design_assignment': return 'Approved';
      case 'content_rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getStatusEmoji = () => {
    switch (workflow.status) {
      case 'content_approval': return '⏱️';
      case 'ready_for_design_assignment': return '✅';
      case 'content_rejected': return '❌';
      default: return '⏱️';
    }
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: workflow.status === 'ready_for_design_assignment' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '20px',
            fontWeight: '600',
            overflow: 'hidden'
          }}>
            {workflow.status === 'ready_for_design_assignment' ? '✓' : '📝'}
          </div>
          <div style={{ background: '#fff' }}>
            <h3 style={{ 
              margin: '0 0 4px 0', 
              color: '#1f2937', 
              fontSize: '18px', 
              fontWeight: '700',
              letterSpacing: '-0.025em',
              background: '#fff'
            }}>
              {workflow.objectives}
            </h3>
            <p style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              background: '#fff'
            }}>
              Submitted {formatDate(workflow.contentCreator?.submittedAt)}
            </p>
          </div>
        </div>
        <span style={{
          background: workflow.status === 'ready_for_design_assignment' ? '#dcfce7' : workflow.status === 'content_rejected' ? '#fef2f2' : '#fed7aa',
          color: workflow.status === 'ready_for_design_assignment' ? '#166534' : workflow.status === 'content_rejected' ? '#991b1b' : '#9a3412',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          border: '1px solid transparent'
        }}>
          {getStatusText()}
        </span>
      </div>

      {/* Task Information */}
      <div style={{ marginBottom: '20px', background: '#fff' }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#374151', 
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#fff'
        }}>
          🎯 Task Information
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '12px',
          padding: '16px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>📋 Objectives</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', background: '#fff' }}>{workflow.objectives}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>👤 Target Gender</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', background: '#fff' }}>{workflow.gender}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>🎂 Age Range</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', background: '#fff' }}>{workflow.minAge}-{workflow.maxAge} years</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>📅 Deadline</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', background: '#fff' }}>{formatDate(workflow.deadline)}</div>
          </div>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>🏢 Current Stage</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', background: '#fff' }}>
              {workflow.currentStage === 'contentcreator' ? 'Content Creator' : 
               workflow.currentStage === 'marketinglead' ? 'Marketing Lead' : 
               workflow.currentStage === 'graphicdesigner' ? 'Graphic Designer' : 
               workflow.currentStage}
            </div>
          </div>
        </div>
      </div>

      {workflow.marketingApproval && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '20px',
          border: '1px solid #22c55e',
          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>✨</span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#15803d', marginBottom: '4px' }}>Approved by {workflow.marketingApproval.approvedBy}</div>
                <div style={{ fontSize: '13px', color: '#166534' }}>{formatDate(workflow.marketingApproval.approvedAt)}</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {workflow.marketingRejection && workflow.status === 'content_rejected' && (
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '20px',
          border: '1px solid #ef4444',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px' }}>❌</span>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#dc2626', marginBottom: '4px' }}>Rejected by {workflow.marketingRejection.rejectedBy}</div>
              <div style={{ fontSize: '13px', color: '#991b1b' }}>{formatDate(workflow.marketingRejection.rejectedAt)}</div>
            </div>
          </div>
          {workflow.marketingRejection.feedback && (
            <div style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #fca5a5',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#dc2626', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>💬</span> Feedback
              </div>
              <div style={{ fontSize: '15px', color: '#7f1d1d', lineHeight: 1.5 }}>{workflow.marketingRejection.feedback}</div>
            </div>
          )}
          <button
            onClick={() => window.location.href = `/content/create?workflowId=${workflow.id}`}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🔄 Recreate Content
          </button>
        </div>
      )}

      {/* Content Preview */}
      {workflow.contentCreator?.content && (
        <div style={{
          background: 'transparent',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>✨</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#0c4a6e !important', background: 'transparent !important' }}>Submitted Content</span>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0ea5e9',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <FiEye size={14} />
              {expanded ? 'Hide' : 'View'} Details
            </button>
          </div>
          
          {expanded && <MultiPlatformContentModal workflow={workflow} />}
        </div>
      )}
    </div>
  );
};

export default function OngoingApproval() {
  const [rejectedWorkflows, setRejectedWorkflows] = useState([]);
  const [pendingWorkflows, setPendingWorkflows] = useState([]);
  const [approvedWorkflows, setApprovedWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    fetchApprovalWorkflows();
    
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    window.addEventListener('resize', handleResize);
    
    const socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });
    
    socket.on('workflowUpdated', (data) => {
      if (!data.contentCreator) {
        // Remove from both arrays if no content creator data
        setRejectedWorkflows(prev => prev.filter(w => w.id !== data.id));
        setPendingWorkflows(prev => prev.filter(w => w.id !== data.id));
        return;
      }
      
      if (data.status === 'content_rejected') {
        setRejectedWorkflows(prev => {
          const filtered = prev.filter(w => w.id !== data.id);
          return [data, ...filtered];
        });
        setPendingWorkflows(prev => prev.filter(w => w.id !== data.id));
        setApprovedWorkflows(prev => prev.filter(w => w.id !== data.id));
      } else if (data.status === 'content_approval') {
        setPendingWorkflows(prev => {
          const filtered = prev.filter(w => w.id !== data.id);
          return [data, ...filtered];
        });
        setRejectedWorkflows(prev => prev.filter(w => w.id !== data.id));
        setApprovedWorkflows(prev => prev.filter(w => w.id !== data.id));
      } else if (data.status === 'ready_for_design_assignment') {
        setApprovedWorkflows(prev => {
          const filtered = prev.filter(w => w.id !== data.id);
          return [data, ...filtered];
        });
        setRejectedWorkflows(prev => prev.filter(w => w.id !== data.id));
        setPendingWorkflows(prev => prev.filter(w => w.id !== data.id));
      } else {
        // Remove from all arrays for other statuses
        setRejectedWorkflows(prev => prev.filter(w => w.id !== data.id));
        setPendingWorkflows(prev => prev.filter(w => w.id !== data.id));
        setApprovedWorkflows(prev => prev.filter(w => w.id !== data.id));
      }
    });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      socket.disconnect();
    };
  }, []);

  const fetchApprovalWorkflows = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/content-creator/approval-status`);
      const data = await response.json();
      
      console.log('OngoingApproval API response:', data);
      
      let allWorkflows = [];
      if (data.status === 'success') {
        allWorkflows = data.data || [];
      }
      
      // Deduplicate workflows by ID
      const uniqueWorkflows = allWorkflows.reduce((acc, workflow) => {
        if (!acc.find(w => w.id === workflow.id)) {
          acc.push(workflow);
        }
        return acc;
      }, []);
      
      const rejectedWorkflows = uniqueWorkflows.filter(w => {
        return w.contentCreator && w.status === 'content_rejected';
      });
      
      const pendingWorkflows = uniqueWorkflows.filter(w => {
        return w.contentCreator && w.status === 'content_approval';
      });
      
      const approvedWorkflows = uniqueWorkflows.filter(w => {
        return w.contentCreator && w.status === 'ready_for_design_assignment';
      });
      
      setRejectedWorkflows(rejectedWorkflows);
      setPendingWorkflows(pendingWorkflows);
      setApprovedWorkflows(approvedWorkflows);
    } catch (error) {
      console.error('Error fetching approval workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div>Loading approval status...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '100%', 
      margin: '0 auto',
      width: '100%'
    }}>
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
          Ongoing Approval
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: '8px 0 0 0',
          fontWeight: '400'
        }}>
          Track the approval status of your submitted content
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '40px',
        alignItems: 'start'
      }}>
        {/* Rejected Content Section */}
        {rejectedWorkflows.length > 0 ? (
          <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '20px', padding: '16px 20px',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
            borderRadius: '12px', border: '1px solid #fca5a5'
          }}>
            <FiXCircle size={24} color="#dc2626" />
            <h2 style={{
              fontSize: '20px', fontWeight: '700', color: '#dc2626',
              margin: 0
            }}>
              Rejected Content ({rejectedWorkflows.length})
            </h2>
          </div>
          {rejectedWorkflows.map(workflow => (
            <ApprovalCard key={workflow.id} workflow={workflow} />
          ))}
          </div>
        ) : (
          <div></div>
        )}

        {/* Pending Approval Section */}
        {pendingWorkflows.length > 0 ? (
          <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '20px', padding: '16px 20px',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: '12px', border: '1px solid #fbbf24'
          }}>
            <FiClock size={24} color="#d97706" />
            <h2 style={{
              fontSize: '20px', fontWeight: '700', color: '#d97706',
              margin: 0
            }}>
              Pending Approval ({pendingWorkflows.length})
            </h2>
          </div>
          {pendingWorkflows.map(workflow => (
            <ApprovalCard key={workflow.id} workflow={workflow} />
          ))}
          </div>
        ) : (
          <div></div>
        )}

        {/* Approved Content Section */}
        {approvedWorkflows.length > 0 && (
          <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '20px', padding: '16px 20px',
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            borderRadius: '12px', border: '1px solid #22c55e'
          }}>
            <FiCheckCircle size={24} color="#16a34a" />
            <h2 style={{
              fontSize: '20px', fontWeight: '700', color: '#16a34a',
              margin: 0
            }}>
              Approved Content ({approvedWorkflows.length})
            </h2>
          </div>
          {approvedWorkflows.map(workflow => (
            <ApprovalCard key={workflow.id} workflow={workflow} />
          ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {rejectedWorkflows.length === 0 && pendingWorkflows.length === 0 && approvedWorkflows.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: isDesktop ? '80px 40px' : '60px 20px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <FiCheckCircle size={48} color="#10b981" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: '#6b7280', fontSize: '18px', margin: '0 0 8px 0' }}>
            All Content Processed
          </h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>
            No content currently awaiting approval or revision
          </p>
        </div>
      )}
    </div>
  );
}