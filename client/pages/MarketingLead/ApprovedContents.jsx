import React, { useEffect, useState, useRef } from 'react';
import { io } from "socket.io-client";
import { FiCheckCircle, FiUser, FiCalendar, FiTarget, FiSettings, FiEye, FiClock, FiSmartphone } from 'react-icons/fi';
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
              padding: '8px 16px',
              background: activeTab === platform 
                ? 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)' 
                : '#f8f9fa',
              color: activeTab === platform ? '#fff' : '#6b7280',
              border: 'none',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            {getPlatformEmoji(platform)} {getPlatformDisplayName(platform)}
          </button>
        ))}
      </div>
      
      {selectedContent[activeTab] && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>📰 Headline</div>
              <div style={{ fontSize: '15px', color: '#374151', lineHeight: 1.4 }}>
                {selectedContent[activeTab].headline}
              </div>
            </div>
            
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
              <SEOBar score={seoAnalysis[activeTab]?.headlineScore || 0} label="Headline SEO" />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>📝 Caption</div>
              <div style={{ fontSize: '15px', color: '#374151', lineHeight: 1.5 }}>
                {selectedContent[activeTab].caption}
              </div>
            </div>
            
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
              <SEOBar score={seoAnalysis[activeTab]?.captionScore || 0} label="Caption SEO" />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>
            <div style={{
              padding: '16px',
              borderRadius: '8px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>🏷️ Hashtags</div>
              <div style={{ fontSize: '15px', color: '#3b82f6', fontWeight: 600 }}>
                {selectedContent[activeTab].hashtag}
              </div>
            </div>
            
            <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
              <SEOBar score={seoAnalysis[activeTab]?.overallScore || 0} label="Overall SEO Score" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ApprovedContentCard = ({ workflow, onSetTask }) => {
  const [expanded, setExpanded] = useState(false);
  const [showDesignModal, setShowDesignModal] = useState(false);
  const isDesignApproval = workflow.status === 'design_approved';
  
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
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            <FiCheckCircle size={20} color="#fff" />
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
              {isDesignApproval ? 'Design Approved Successfully' : 'Content Approved Successfully'}
            </h3>
            <p style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              background: '#fff'
            }}>
              {isDesignApproval ? 
                `Approved ${formatDate(workflow.finalApproval?.approvedAt)}` :
                `Approved ${formatDate(workflow.marketingApproval?.approvedAt)}`
              }
            </p>
          </div>
        </div>
        <span style={{
          background: '#dcfce7',
          color: '#166534',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          border: '1px solid transparent'
        }}>
          {isDesignApproval ? 'DESIGN APPROVED' : 'CONTENT APPROVED'}
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
            🖼️ View Approved Design
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
                {isDesignApproval ? 'Content Used for Design' : 'Approved Content'}
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
      


      
      {/* Action Button */}
      {!isDesignApproval && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={() => onSetTask(workflow.id)}
            style={{
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              height: '36px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(59, 130, 246, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(59, 130, 246, 0.3)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(59, 130, 246, 0.2)';
            }}
          >
            <FiSettings size={14} />
            Set Task
          </button>
        </div>
      )}

      {/* Design Modal */}
      {showDesignModal && isDesignApproval && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowDesignModal(false);
            }
          }}
        >
          <div style={{
            background: '#fff',
            borderRadius: '20px',
            padding: '32px',
            maxWidth: '90vw',
            maxHeight: '90vh',
            overflow: 'auto',
            position: 'relative',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            animation: 'modalSlideIn 0.3s ease-out'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '24px',
              paddingBottom: '16px',
              borderBottom: '2px solid #f1f5f9'
            }}>
              <h3 style={{ 
                margin: 0, 
                fontSize: '24px', 
                fontWeight: '700',
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                ✅ Approved Design
              </h3>
              <button
                onClick={() => setShowDesignModal(false)}
                style={{
                  background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '600',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(239, 68, 68, 0.4)';
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.3)';
                }}
              >
                ✕ Close
              </button>
            </div>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '400px'
            }}>
              {(workflow.graphicDesigner?.designUrl || workflow.graphicDesigner?.designs?.designUrl) ? (
                <img 
                  src={workflow.graphicDesigner?.designUrl || workflow.graphicDesigner?.designs?.designUrl} 
                  alt="Approved Design" 
                  style={{
                    maxWidth: '100%',
                    maxHeight: '70vh',
                    borderRadius: '16px',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                    border: '2px solid #e5e7eb'
                  }}
                />
              ) : (
                <div style={{
                  padding: '60px',
                  textAlign: 'center',
                  color: '#6b7280',
                  fontSize: '18px',
                  background: '#f8fafc',
                  borderRadius: '16px',
                  border: '2px dashed #d1d5db'
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🖼️</div>
                  <div style={{ fontWeight: '600', marginBottom: '8px' }}>No design image available</div>
                  <div style={{ fontSize: '14px', color: '#9ca3af' }}>The design file could not be loaded</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function ApprovedContents() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    fetchApprovedContents();
    
    const socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });
    socket.on("workflowUpdated", (data) => {
      if (data.status === 'ready_for_design_assignment' || data.status === 'design_approved') {
        setWorkflows(prev => {
          const existing = prev.find(w => w.id === data.id);
          if (existing) {
            return prev.map(w => w.id === data.id ? data : w);
          } else {
            return [data, ...prev];
          }
        });
      } else if (data.status === 'design_creation' || data.status === 'posted') {
        // Only remove when actually assigned to designer or posted
        setWorkflows(prev => prev.filter(w => w.id !== data.id));
      }
    });
    
    return () => socket.disconnect();
  }, []);

  const fetchApprovedContents = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/approved`);
      if (response.status === 429) {
        console.log('Rate limited, skipping fetch');
        return;
      }
      const data = await response.json();
      console.log('🔍 ApprovedContents - Approved workflows:', data);
      if (data.status === 'success') {
        setWorkflows(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching approved contents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetTask = (workflowId) => {
    window.location.href = `/marketing/set-task-graphic-designer?workflowId=${workflowId}`;
  };

  if (loading) {
    return (
      <div style={componentStyles.loadingContainer}>
        <div style={{ textAlign: 'center' }}>
          <div style={componentStyles.loadingSpinner} />
          <p style={{ color: '#64748b', fontSize: '16px' }}>Loading approved contents...</p>
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
        }}>Approved Contents</h1>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: '8px 0 0 0',
          fontWeight: '400'
        }}>
          Manage approved content and design assignments ({workflows.length} items)
        </p>
      </div>

      {/* Set Task for Graphics Designer */}
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
            Set Task for Graphics Designer
          </h2>
          {workflows.filter(w => w.status === 'ready_for_design_assignment').length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#9ca3af',
              fontSize: '14px'
            }}>
              No content ready for graphics designer assignment.
            </div>
          ) : (
            workflows.filter(w => w.status === 'ready_for_design_assignment').map(workflow => (
              <ApprovedContentCard 
                key={workflow.id} 
                workflow={workflow} 
                onSetTask={handleSetTask}
              />
            ))
          )}
        </div>
      </div>

      {/* Posting */}
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
            Posting
          </h2>
          {workflows.filter(w => w.status === 'design_approved').length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#9ca3af',
              fontSize: '14px'
            }}>
              No designs ready for posting.
            </div>
          ) : (
            workflows.filter(w => w.status === 'design_approved').map(workflow => (
              <ApprovedContentCard 
                key={workflow.id} 
                workflow={workflow} 
                onSetTask={handleSetTask}
              />
            ))
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
} 