import React, { useEffect, useState, useRef } from 'react';
import { io } from "socket.io-client";
import { FiClock, FiUser, FiCalendar, FiTarget, FiCheckCircle, FiEye, FiSmartphone, FiCheck, FiX } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import PlatformDisplay from '../../components/common/PlatformDisplay';
// Temporary inline styles until design system is properly imported
const componentStyles = {
  pageContainer: { padding: '0', maxWidth: '100%', fontFamily: 'Inter, system-ui, -apple-system, sans-serif' },
  pageHeader: { marginBottom: '32px' },
  pageTitle: { fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0' },
  pageSubtitle: { color: '#6b7280', margin: 0 },
  loadingContainer: { display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' },
  loadingSpinner: { width: '40px', height: '40px', border: '4px solid #e5e7eb', borderTop: '4px solid #3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite' },
  emptyState: { background: '#ffffff', borderRadius: '16px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' },
  emptyStateIcon: { width: '80px', height: '80px', background: '#f1f5f9', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '32px' },
  emptyStateTitle: { fontSize: '20px', fontWeight: '600', color: '#1e293b', margin: '0 0 8px 0' },
  emptyStateText: { color: '#64748b', fontSize: '16px', margin: 0 },
  button: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s ease', fontFamily: 'inherit' },
  buttonPrimary: { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#ffffff', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }
};

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
        marginTop: '0px',
        padding: '32px',
        background: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
        <div style={{ fontSize: '16px', color: '#6b7280' }}>No content available</div>
      </div>
    );
  }
  
  return (
    <div style={{
      marginTop: '0px',
      padding: '0px',
      background: 'transparent',
      borderRadius: '0px',
      border: 'none'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        marginBottom: '24px',
        paddingBottom: '12px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h4 style={{ 
          margin: 0, 
          color: '#374151', 
          fontSize: '16px', 
          fontWeight: '600',
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
        marginBottom: '20px'
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '0', alignItems: 'start' }}>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>📰 Headline</div>
              <div style={{ fontSize: '15px', color: '#374151', lineHeight: 1.4 }}>
                {selectedContent[activeTab].headline}
              </div>
            </div>
            
            <div style={{ 
              padding: '0', 
              background: '#f8fafc', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '140px'
            }}>
              <SEORadial score={seoAnalysis[activeTab]?.headlineScore || 0} label="Headline" />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '0', alignItems: 'start' }}>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>📝 Caption</div>
              <div style={{ fontSize: '15px', color: '#374151', lineHeight: 1.5 }}>
                {selectedContent[activeTab].caption}
              </div>
            </div>
            
            <div style={{ 
              padding: '0', 
              background: '#f8fafc', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '140px'
            }}>
              <SEORadial score={seoAnalysis[activeTab]?.captionScore || 0} label="Content" />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '0', alignItems: 'start' }}>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>🏷️ Hashtags</div>
              <div style={{ fontSize: '15px', color: '#3b82f6', fontWeight: 600 }}>
                {selectedContent[activeTab].hashtag}
              </div>
            </div>
            
            <div style={{ 
              padding: '0', 
              background: '#f8fafc', 
              borderRadius: '8px',
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

const ContentApprovalCard = ({ workflow, onApprove, onReject }) => {
  const [expanded, setExpanded] = useState(false);
  const [showDesignModal, setShowDesignModal] = useState(false);
  const isDesignApproval = workflow.status === 'design_approval';
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb',
      transition: 'all 0.2s ease'
    }}>
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
            <FiEye size={20} color="#fff" />
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
              {isDesignApproval ? 'Design Approval Required' : 'Content Approval Required'}
            </h3>
            <p style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              background: '#fff'
            }}>
              {isDesignApproval ? 
                `Submitted ${formatDate(workflow.graphicDesigner?.submittedAt)}` :
                `Submitted ${formatDate(workflow.contentCreator?.submittedAt)}`
              }
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
          PENDING APPROVAL
        </span>
      </div>
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
          background: '#fff'
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
      
      {/* View Design Button for Design Approvals */}
      {isDesignApproval && (
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <button
            onClick={() => setShowDesignModal(true)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 16px rgba(139, 92, 246, 0.4)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(139, 92, 246, 0.3)';
            }}
          >
            🖼️ View Design
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
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#0c4a6e !important', background: 'transparent !important' }}>
                {isDesignApproval ? 'Content Used for Design' : 'Submitted Content'}
              </span>
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
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button
          onClick={() => onReject(workflow.id)}
          style={{
            background: '#ef4444',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            height: '36px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(239, 68, 68, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 8px rgba(239, 68, 68, 0.3)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(239, 68, 68, 0.2)';
          }}
        >
          <FiX size={14} />
          Reject
        </button>
        <button
          onClick={() => onApprove(workflow.id)}
          style={{
            background: '#10b981',
            color: '#fff',
            border: 'none',
            padding: '8px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            fontWeight: '600',
            cursor: 'pointer',
            height: '36px',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)';
          }}
        >
          <FiCheck size={14} />
          {isDesignApproval ? 'Approve' : 'Approve'}
        </button>
      </div>

      {/* Design Modal */}
      {showDesignModal && isDesignApproval && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '24px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '16px'
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Submitted Design</h3>
              <button
                onClick={() => setShowDesignModal(false)}
                style={{
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '8px 12px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600'
                }}
              >
                ✕ Close
              </button>
            </div>
            {(workflow.graphicDesigner?.designUrl || workflow.graphicDesigner?.designs?.designUrl) ? (
              <img 
                src={workflow.graphicDesigner?.designUrl || workflow.graphicDesigner?.designs?.designUrl} 
                alt="Submitted Design" 
                style={{
                  maxWidth: '100%',
                  maxHeight: '70vh',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #e5e7eb'
                }}
              />
            ) : (
              <div style={{
                padding: '40px',
                textAlign: 'center',
                color: '#6b7280',
                fontSize: '16px'
              }}>
                No design image available
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default function ApprovalOfContents() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    fetchContentApprovals();
    
    const socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });
    socket.on("workflowUpdated", (data) => {
      if (data.status === 'content_approval' || data.status === 'design_approval') {
        setWorkflows(prev => {
          const existing = prev.find(w => w.id === data.id);
          if (existing) {
            return prev.map(w => w.id === data.id ? data : w);
          } else {
            return [data, ...prev];
          }
        });
      } else {
        setWorkflows(prev => prev.filter(w => w.id !== data.id));
      }
    });
    
    return () => socket.disconnect();
  }, []);

  const fetchContentApprovals = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/marketinglead`);
      if (response.status === 429) {
        console.log('Rate limited, skipping fetch');
        return;
      }
      const data = await response.json();
      if (data.status === 'success') {
        const approvals = data.data.filter(w => 
          w.status === 'content_approval' || w.status === 'design_approval'
        );
        setWorkflows(approvals);
      }
    } catch (error) {
      console.error('Error fetching approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (workflowId) => {
    try {
      const workflow = workflows.find(w => w.id === workflowId);
      const isDesignApproval = workflow?.status === 'design_approval';
      
      const endpoint = isDesignApproval ? 'approve-design' : 'approve-content';
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${workflowId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'Marketing Lead' })
      });
      
      if (response.ok) {
        window.location.href = `/marketing/approved`;
      }
    } catch (error) {
      console.error('Error approving:', error);
    }
  };

  const [rejectModal, setRejectModal] = useState({ show: false, workflowId: null });
  const [feedback, setFeedback] = useState('');

  const handleReject = (workflowId) => {
    setRejectModal({ show: true, workflowId });
    setFeedback('');
  };

  const submitReject = async () => {
    if (!feedback.trim()) return;
    
    try {
      const workflow = workflows.find(w => w.id === rejectModal.workflowId);
      const isDesignRejection = workflow?.status === 'design_approval';
      const endpoint = isDesignRejection ? 'reject-design' : 'reject-content';
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${rejectModal.workflowId}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectedBy: 'Marketing Lead', feedback })
      });
      
      if (response.ok) {
        setWorkflows(prev => prev.filter(w => w.id !== rejectModal.workflowId));
        setRejectModal({ show: false, workflowId: null });
      }
    } catch (error) {
      console.error('Error rejecting:', error);
    }
  };

  const allWorkflows = workflows;

  if (loading) {
    return (
      <div style={componentStyles.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
          <div style={componentStyles.loadingSpinner} />
          <p style={{ color: '#64748b', fontSize: '16px' }}>Loading content approvals...</p>
        </div>
      </div>
    );
  }

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
          fontSize: '32px',
          fontWeight: '800',
          color: '#111827',
          margin: 0,
          letterSpacing: '-0.025em'
        }}>Approval of Contents</h1>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: '8px 0 0 0',
          fontWeight: '400'
        }}>
          Review and approve submissions from content creators and graphics designers ({allWorkflows.length} items)
        </p>
      </div>

      {/* Content Creator Approvals */}
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
            Content Creator Approvals
          </h2>

          {workflows.filter(w => w.status === 'content_approval').length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#9ca3af',
              fontSize: '14px'
            }}>
              No content pending approval.
            </div>
          ) : (
            workflows.filter(w => w.status === 'content_approval').map(workflow => (
              <ContentApprovalCard 
                key={workflow.id} 
                workflow={workflow} 
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </div>
      </div>

      {/* Graphics Designer Approvals */}
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
            Graphic Designer Approvals
          </h2>

          {workflows.filter(w => w.status === 'design_approval').length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#9ca3af',
              fontSize: '14px'
            }}>
              No designs pending approval.
            </div>
          ) : (
            workflows.filter(w => w.status === 'design_approval').map(workflow => (
              <ContentApprovalCard 
                key={workflow.id} 
                workflow={workflow} 
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))
          )}
        </div>
      </div>
      
      {/* Rejection Modal */}
      {rejectModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '32px',
            width: '500px',
            maxWidth: '90vw'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700' }}>Reject Content</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please provide feedback for rejection..."
              style={{
                width: '100%',
                height: '120px',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setRejectModal({ show: false, workflowId: null })}
                style={{
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                disabled={!feedback.trim()}
                style={{
                  padding: '8px 16px',
                  background: feedback.trim() ? '#ef4444' : '#d1d5db',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: feedback.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
