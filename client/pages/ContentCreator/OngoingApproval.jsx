import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { FiClock, FiCheckCircle, FiXCircle, FiEye, FiTarget, FiUser, FiCalendar, FiSmartphone, FiBarChart, FiEdit3, FiFileText, FiTrash2 } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import PlatformDisplay from '../../components/common/PlatformDisplay';

const SEORadial = ({ score, label }) => {
  const getColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 75) return '#f59e0b';
    return '#ef4444';
  };
  
  const getQuality = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 75) return 'Good';
    return 'Needs Work';
  };
  
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      marginBottom: '16px'
    }}>
      <div style={{ position: 'relative', marginBottom: '8px' }}>
        <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="6"
            fill="transparent"
          />
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={getColor(score)}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '18px',
          fontWeight: '700',
          color: getColor(score)
        }}>
          {score}
        </div>
      </div>
      
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '2px' }}>
          {label}
        </div>
        <div style={{ fontSize: '11px', color: getColor(score), fontWeight: '500' }}>
          {getQuality(score)}
        </div>
      </div>
    </div>
  );
};

const MultiPlatformContentModal = ({ workflow }) => {
  const [activeTab, setActiveTab] = useState('facebook');
  
  const getPlatformIcon = (platform, size = 20) => {
    const icons = {
      facebook: <FaFacebook size={size} color="#1877f2" />,
      instagram: <FaInstagram size={size} color="#e4405f" />,
      twitter: <FaTwitter size={size} color="#1da1f2" />
    };
    return icons[platform] || <FaFacebook size={size} color="#6b7280" />;
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
              background: '#ffffff',
              color: activeTab === platform ? '#1f2937' : '#6b7280',
              border: activeTab === platform ? '2px solid #fdba74' : '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {getPlatformIcon(platform, 16)} {getPlatformDisplayName(platform)}
          </button>
        ))}
      </div>
      
      {selectedContent[activeTab] && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '0', marginBottom: '20px', alignItems: 'start' }}>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>📰 Headline</div>
              <div style={{ fontSize: '16px', color: '#1f2937', lineHeight: 1.4 }}>
                {selectedContent[activeTab].headline}
              </div>
            </div>
            
            <div style={{ 
              padding: '0', 
              background: '#f8fafc', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '140px'
            }}>
              <SEORadial score={seoAnalysis[activeTab]?.headlineScore || 0} label="Headline" />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '0', marginBottom: '20px', alignItems: 'start' }}>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>📝 Caption</div>
              <div style={{ fontSize: '15px', color: '#374151', lineHeight: 1.5 }}>
                {selectedContent[activeTab].caption}
              </div>
            </div>
            
            <div style={{ 
              padding: '0', 
              background: '#f8fafc', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '140px'
            }}>
              <SEORadial score={seoAnalysis[activeTab]?.captionScore || 0} label="Content" />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '0', alignItems: 'start' }}>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>🏷️ Hashtags</div>
              <div style={{ fontSize: '15px', color: '#3b82f6', fontWeight: 600 }}>
                {selectedContent[activeTab].hashtag}
              </div>
            </div>
            
            <div style={{ 
              padding: '0', 
              background: '#f8fafc', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '140px'
            }}>
              <SEORadial score={seoAnalysis[activeTab]?.overallScore || 0} label="Overall" />
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

  const getStatusText = () => {
    switch (workflow.status) {
      case 'content_approval': return 'Pending Approval';
      case 'ready_for_design_assignment': return 'Approved';
      case 'content_rejected': return 'Rejected';
      default: return 'Unknown';
    }
  };

  const getTaskIcon = () => {
    if (workflow.status === 'content_approval') return <FiFileText size={20} color="#fff" />;
    if (workflow.status === 'ready_for_design_assignment') return <FiCheckCircle size={20} color="#fff" />;
    if (workflow.status === 'content_rejected') return <FiXCircle size={20} color="#fff" />;
    return <FiFileText size={20} color="#fff" />;
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
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            {getTaskIcon()}
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
          background: '#fed7aa',
          color: '#9a3412',
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
          <FiTarget size={16} color="#3b82f6" /> Task Objectives
        </div>
        <div style={{ 
          fontSize: '16px', 
          color: '#1f2937', 
          lineHeight: '1.6',
          fontWeight: '500',
          background: '#fff',
          marginBottom: '20px'
        }}>
          {workflow.objectives}
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: '16px', 
        marginBottom: '20px',
        padding: '20px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiUser size={16} color="#3b82f6" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Target Gender</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>{workflow.gender}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCalendar size={16} color="#10b981" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Age Range</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>{workflow.minAge}-{workflow.maxAge} years</div>
          </div>
        </div>
        {workflow.numContent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiBarChart size={16} color="#f59e0b" />
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Content Count</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>{workflow.numContent}</div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiClock size={16} color="#ef4444" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Deadline</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>{formatDate(workflow.deadline)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiSmartphone size={16} color="#8b5cf6" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Target Platforms</div>
            <PlatformDisplay platforms={workflow.selectedPlatforms || []} size="small" />
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
              background: '#f59e0b',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              height: '36px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(245, 158, 11, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(245, 158, 11, 0.3)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(245, 158, 11, 0.2)';
            }}
          >
            <FiEdit3 size={14} /> Recreate Content
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


  useEffect(() => {
    fetchApprovalWorkflows();
    
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
    
    return () => socket.disconnect();
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



      {/* Pending Approval */}
      {pendingWorkflows.length > 0 && (
        <div style={{ marginBottom: '40px' }}>
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
              Pending Approval ({pendingWorkflows.length})
            </h2>
            {pendingWorkflows.map(workflow => (
              <ApprovalCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        </div>
      )}

      {/* Approved Content */}
      {approvedWorkflows.length > 0 && (
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
              Approved Content ({approvedWorkflows.length})
            </h2>
            {approvedWorkflows.map(workflow => (
              <ApprovalCard key={workflow.id} workflow={workflow} />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {pendingWorkflows.length === 0 && (
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ 
            textAlign: 'center', 
            padding: '40px', 
            color: '#9ca3af',
            fontSize: '14px'
          }}>
            No content currently awaiting approval or revision.
          </div>
        </div>
      )}
    </div>
  );
}