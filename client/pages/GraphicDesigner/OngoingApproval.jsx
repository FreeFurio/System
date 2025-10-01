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

const ApprovalCard = ({ workflow }) => {
  const [expanded, setExpanded] = useState(false);
  const [showDesignModal, setShowDesignModal] = useState(false);
  
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
      case 'design_approval': return 'Pending Approval';
      case 'posted': return 'Approved & Posted';
      case 'design_rejected': return 'Rejected';
      default: return 'Unknown';
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
            background: workflow.status === 'posted' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '20px',
            fontWeight: '600',
            overflow: 'hidden'
          }}>
            {workflow.status === 'posted' ? '✓' : '🎨'}
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
              Submitted {formatDate(workflow.graphicDesigner?.submittedAt)}
            </p>
          </div>
        </div>
        <span style={{
          background: workflow.status === 'posted' ? '#dcfce7' : workflow.status === 'design_rejected' ? '#fef2f2' : '#e0e7ff',
          color: workflow.status === 'posted' ? '#166534' : workflow.status === 'design_rejected' ? '#991b1b' : '#3730a3',
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

      {/* View Design Button */}
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

      {workflow.marketingApproval && workflow.status === 'posted' && (
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
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#15803d', marginBottom: '4px' }}>Design Approved & Posted</div>
                <div style={{ fontSize: '13px', color: '#166534' }}>{formatDate(workflow.marketingApproval?.approvedAt)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {workflow.marketingRejection && workflow.status === 'design_rejected' && (
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
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#dc2626', marginBottom: '4px' }}>Design Rejected</div>
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
            onClick={() => window.location.href = `/graphic/creation?taskId=${workflow.id}`}
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
              gap: '6px'
            }}
          >
            🔄 Recreate Design
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
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#0c4a6e !important', background: 'transparent !important' }}>Content Used for Design</span>
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

      {/* Design Modal */}
      {showDesignModal && (
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

export default function OngoingApproval() {
  const [rejectedWorkflows, setRejectedWorkflows] = useState([]);
  const [pendingWorkflows, setPendingWorkflows] = useState([]);
  const [approvedWorkflows, setApprovedWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovalWorkflows();
    
    const socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });
    
    socket.on('workflowUpdated', (data) => {
      if (!data.graphicDesigner) {
        setRejectedWorkflows(prev => prev.filter(w => w.id !== data.id));
        setPendingWorkflows(prev => prev.filter(w => w.id !== data.id));
        setApprovedWorkflows(prev => prev.filter(w => w.id !== data.id));
        return;
      }
      
      if (data.status === 'design_rejected') {
        setRejectedWorkflows(prev => {
          const filtered = prev.filter(w => w.id !== data.id);
          return [data, ...filtered];
        });
        setPendingWorkflows(prev => prev.filter(w => w.id !== data.id));
        setApprovedWorkflows(prev => prev.filter(w => w.id !== data.id));
      } else if (data.status === 'design_approval') {
        setPendingWorkflows(prev => {
          const filtered = prev.filter(w => w.id !== data.id);
          return [data, ...filtered];
        });
        setRejectedWorkflows(prev => prev.filter(w => w.id !== data.id));
        setApprovedWorkflows(prev => prev.filter(w => w.id !== data.id));
      } else if (data.status === 'posted' || data.status === 'design_approved') {
        // Remove from ongoing approval when approved or posted
        setRejectedWorkflows(prev => prev.filter(w => w.id !== data.id));
        setPendingWorkflows(prev => prev.filter(w => w.id !== data.id));
        setApprovedWorkflows(prev => prev.filter(w => w.id !== data.id));
      } else {
        setRejectedWorkflows(prev => prev.filter(w => w.id !== data.id));
        setPendingWorkflows(prev => prev.filter(w => w.id !== data.id));
        setApprovedWorkflows(prev => prev.filter(w => w.id !== data.id));
      }
    });
    
    return () => socket.disconnect();
  }, []);

  const fetchApprovalWorkflows = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/graphic-designer/approval-status`);
      const data = await response.json();
      
      console.log('Graphics Designer OngoingApproval API response:', data);
      
      let allWorkflows = [];
      if (data.status === 'success') {
        allWorkflows = data.data || [];
      }
      
      const uniqueWorkflows = allWorkflows.reduce((acc, workflow) => {
        if (!acc.find(w => w.id === workflow.id)) {
          acc.push(workflow);
        }
        return acc;
      }, []);
      
      const rejectedWorkflows = uniqueWorkflows.filter(w => {
        return w.graphicDesigner && w.status === 'design_rejected';
      });
      
      const pendingWorkflows = uniqueWorkflows.filter(w => {
        return w.graphicDesigner && w.status === 'design_approval';
      });
      
      setRejectedWorkflows(rejectedWorkflows);
      setPendingWorkflows(pendingWorkflows);
      setApprovedWorkflows([]);
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
          Track the approval status of your submitted designs
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '40px',
        alignItems: 'start'
      }}>
        {/* Rejected Designs Section */}
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
              Rejected Designs ({rejectedWorkflows.length})
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
            background: 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)',
            borderRadius: '12px', border: '1px solid #a5b4fc'
          }}>
            <FiClock size={24} color="#3730a3" />
            <h2 style={{
              fontSize: '20px', fontWeight: '700', color: '#3730a3',
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


      </div>

      {/* Empty State */}
      {rejectedWorkflows.length === 0 && pendingWorkflows.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '80px 40px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <FiCheckCircle size={48} color="#8b5cf6" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: '#6b7280', fontSize: '18px', margin: '0 0 8px 0' }}>
            All Designs Processed
          </h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>
            No designs currently awaiting approval or revision
          </p>
        </div>
      )}
    </div>
  );
}