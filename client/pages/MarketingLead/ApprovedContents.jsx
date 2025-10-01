import React, { useEffect, useState, useRef } from 'react';
import { io } from "socket.io-client";
import { FiCheckCircle, FiUser, FiCalendar, FiTarget, FiSettings, FiEye } from 'react-icons/fi';
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
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '20px',
            fontWeight: '600',
            overflow: 'hidden'
          }}>
            ✓
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
              {isDesignApproval ? 
                `Design approved ${formatDate(workflow.finalApproval?.approvedAt)}` :
                `Content approved ${formatDate(workflow.marketingApproval?.approvedAt)}`
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
          
          {expanded && (
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
                  📝 Content Analysis
                </h4>
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Headline Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>
                  <div style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    background: '#f8fafc'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>📰 Headline</div>
                    <div style={{ fontSize: '15px', color: '#374151', lineHeight: 1.4 }}>
                      {workflow.contentCreator.content.headline}
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                    <SEOBar score={workflow.contentCreator?.content?.seoAnalysis?.headlineScore || 0} label="Headline SEO" />
                  </div>
                </div>
                
                {/* Caption Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>
                  <div style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    background: '#f8fafc'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>📝 Caption</div>
                    <div style={{ fontSize: '15px', color: '#374151', lineHeight: 1.5 }}>
                      {workflow.contentCreator.content.caption}
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                    <SEOBar score={workflow.contentCreator?.content?.seoAnalysis?.captionScore || 0} label="Caption SEO" />
                  </div>
                </div>
                
                {/* Hashtags Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '20px', alignItems: 'start' }}>
                  <div style={{
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb',
                    background: '#f8fafc'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>🏷️ Hashtags</div>
                    <div style={{ fontSize: '15px', color: '#3b82f6', fontWeight: 600 }}>
                      {workflow.contentCreator.content.hashtag}
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                    <SEOBar score={workflow.contentCreator?.content?.seoAnalysis?.overallScore || 0} label="Overall SEO Score" />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      


      
      {/* Action Button */}
      {!isDesignApproval && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
          <button
            onClick={() => onSetTask(workflow.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
            }}
          >
            <span style={{ fontSize: '16px' }}>⚙️</span>
            Set Task for Graphics Designer
          </button>
        </div>
      )}

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
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Approved Design</h3>
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
                alt="Approved Design" 
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
          Content approved but not yet posted ({workflows.length} items)
        </p>
      </div>

      {/* Content List */}
      {workflows.length === 0 ? (
        <div style={componentStyles.emptyState}>
          <div style={componentStyles.emptyStateIcon}>✅</div>
          <h3 style={componentStyles.emptyStateTitle}>
            No Approved Content
          </h3>
          <p style={componentStyles.emptyStateText}>
            Approved content will appear here, ready for graphic designer assignment.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {workflows.map(workflow => (
            <ApprovedContentCard 
              key={workflow.id} 
              workflow={workflow} 
              onSetTask={handleSetTask}
            />
          ))}
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