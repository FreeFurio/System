import React, { useEffect, useState, useRef } from 'react';
import { io } from "socket.io-client";
import { FiClock, FiUser, FiCalendar, FiTarget, FiCheckCircle, FiEye } from 'react-icons/fi';
import { componentStyles } from '../../styles/designSystem';

const ContentApprovalCard = ({ workflow, onApprove }) => {
  const [expanded, setExpanded] = useState(false);
  
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
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            📝
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
              Content Approval Required
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
              Submitted {formatDate(workflow.contentCreator?.submittedAt)}
            </p>
          </div>
        </div>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '700',
          color: '#92400e',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '1px solid #f59e0b'
        }}>
          <FiClock size={14} />
          PENDING APPROVAL
        </div>
      </div>
      
      {/* Objectives */}
      <div style={{
        background: '#f8fafc',
        padding: '16px',
        borderRadius: '12px',
        marginBottom: '20px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <FiTarget size={16} color="#3b82f6" />
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Task Objectives</span>
        </div>
        <p style={{ margin: 0, fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>
          {workflow.objectives}
        </p>
      </div>
      
      {/* Task Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiUser size={16} color="#8b5cf6" />
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Target Gender</div>
            <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>{workflow.gender}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiTarget size={16} color="#10b981" />
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Age Range</div>
            <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>{workflow.minAge}-{workflow.maxAge} years</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCalendar size={16} color="#ef4444" />
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Deadline</div>
            <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>{formatDate(workflow.deadline)}</div>
          </div>
        </div>
      </div>
      
      {/* Content Preview */}
      {workflow.contentCreator?.content && (
        <div style={{
          background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid #0ea5e9'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>✨</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#0c4a6e' }}>Submitted Content</span>
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
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#0c4a6e', fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📰</span> HEADLINE
                </div>
                <div style={{ 
                  fontSize: '15px', 
                  color: '#1e293b', 
                  fontWeight: '600',
                  background: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #bae6fd'
                }}>
                  {workflow.contentCreator.content.headline}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '12px', color: '#0c4a6e', fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📝</span> CAPTION
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#374151', 
                  lineHeight: 1.6,
                  background: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #bae6fd'
                }}>
                  {workflow.contentCreator.content.caption}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '12px', color: '#0c4a6e', fontWeight: '600', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🏷️</span> HASHTAGS
                </div>
                <div style={{ 
                  fontSize: '14px', 
                  color: '#3b82f6', 
                  fontWeight: '600',
                  background: '#ffffff',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #bae6fd'
                }}>
                  {workflow.contentCreator.content.hashtag}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          onClick={() => onApprove(workflow.id)}
          style={{
            ...componentStyles.button,
            ...componentStyles.buttonSuccess
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 8px 20px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
          }}
        >
          <FiCheckCircle size={16} />
          Approve Content
        </button>
      </div>
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
      if (data.status === 'content_approval') {
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
        const contentApprovals = data.data.filter(w => w.status === 'content_approval');
        setWorkflows(contentApprovals);
      }
    } catch (error) {
      console.error('Error fetching content approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (workflowId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${workflowId}/approve-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approvedBy: 'Marketing Lead' })
      });
      
      if (response.ok) {
        // Redirect to Approved Contents tab
        window.location.href = `/marketing/approved`;
      }
    } catch (error) {
      console.error('Error approving content:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#64748b', fontSize: '16px' }}>Loading content approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={componentStyles.pageContainer}>
      {/* Header */}
      <div style={componentStyles.pageHeader}>
        <h1 style={componentStyles.pageTitle}>Content Approval</h1>
        <p style={componentStyles.pageSubtitle}>
          Review and approve content submissions from content creators
        </p>
      </div>

      {/* Content List */}
      {workflows.length === 0 ? (
        <div style={componentStyles.emptyState}>
          <div style={componentStyles.emptyStateIcon}>📝</div>
          <h3 style={componentStyles.emptyStateTitle}>
            No Content Pending Approval
          </h3>
          <p style={componentStyles.emptyStateText}>
            All content has been reviewed. New submissions will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {workflows.map(workflow => (
            <ContentApprovalCard 
              key={workflow.id} 
              workflow={workflow} 
              onApprove={handleApprove}
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
