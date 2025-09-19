import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import { FiClock, FiCheckCircle, FiXCircle, FiEye } from 'react-icons/fi';

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
      case 'content_approval': return '#f59e0b';
      case 'ready_for_design_assignment': return '#10b981';
      case 'content_rejected': return '#ef4444';
      default: return '#6b7280';
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

  const getStatusIcon = () => {
    switch (workflow.status) {
      case 'content_approval': return <FiClock size={12} />;
      case 'ready_for_design_assignment': return <FiCheckCircle size={12} />;
      case 'content_rejected': return <FiXCircle size={12} />;
      default: return <FiClock size={12} />;
    }
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '20px',
      marginBottom: '16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      border: '1px solid #e5e7eb'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600', color: '#1f2937' }}>
          {workflow.objectives}
        </h3>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderRadius: '16px',
          fontSize: '12px',
          fontWeight: '600',
          color: '#fff',
          background: getStatusColor()
        }}>
          {getStatusIcon()}
          {getStatusText()}
        </div>
      </div>

      <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>
        Submitted: {formatDate(workflow.contentCreator?.submittedAt)}
      </div>

      {workflow.marketingApproval && (
        <div style={{
          background: '#f0fdf4',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '12px',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#059669', marginBottom: '4px' }}>
            ✅ Approved by {workflow.marketingApproval.approvedBy}
          </div>
          <div style={{ fontSize: '12px', color: '#065f46' }}>
            {formatDate(workflow.marketingApproval.approvedAt)}
          </div>
        </div>
      )}

      {workflow.marketingRejection && (
        <div style={{
          background: '#fef2f2',
          padding: '12px',
          borderRadius: '8px',
          marginBottom: '12px',
          border: '1px solid #fecaca'
        }}>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#dc2626', marginBottom: '4px' }}>
            ❌ Rejected by {workflow.marketingRejection.rejectedBy}
          </div>
          <div style={{ fontSize: '12px', color: '#991b1b', marginBottom: '8px' }}>
            {formatDate(workflow.marketingRejection.rejectedAt)}
          </div>
          {workflow.marketingRejection.feedback && (
            <div style={{ fontSize: '13px', color: '#7f1d1d', fontStyle: 'italic' }}>
              Feedback: {workflow.marketingRejection.feedback}
            </div>
          )}
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        style={{
          background: 'none',
          border: 'none',
          color: '#3b82f6',
          cursor: 'pointer',
          fontSize: '14px',
          fontWeight: '500',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}
      >
        <FiEye size={14} />
        {expanded ? 'Hide' : 'View'} Content
      </button>

      {expanded && workflow.contentCreator?.content && (
        <div style={{
          marginTop: '16px',
          padding: '16px',
          background: '#f8fafc',
          borderRadius: '8px',
          border: '1px solid #e2e8f0'
        }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
              HEADLINE
            </div>
            <div style={{ fontSize: '14px', color: '#1f2937' }}>
              {workflow.contentCreator.content.headline}
            </div>
          </div>
          
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
              CAPTION
            </div>
            <div style={{ fontSize: '14px', color: '#1f2937', lineHeight: 1.5 }}>
              {workflow.contentCreator.content.caption}
            </div>
          </div>
          
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
              HASHTAGS
            </div>
            <div style={{ fontSize: '14px', color: '#3b82f6', fontWeight: '500' }}>
              {workflow.contentCreator.content.hashtag}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function OngoingApproval() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchApprovalWorkflows();
    
    const socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });
    
    socket.on('workflowUpdated', (data) => {
      if (data.contentCreator && (data.status === 'content_approval' || data.status === 'ready_for_design_assignment' || data.status === 'content_rejected')) {
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

  const fetchApprovalWorkflows = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/content-creator/approval-status`);
      const data = await response.json();
      
      console.log('OngoingApproval API response:', data);
      
      if (data.status === 'success') {
        console.log('All workflows:', data.data);
        const approvalWorkflows = data.data.filter(w => {
          console.log('Checking workflow:', w.id, 'status:', w.status, 'hasContentCreator:', !!w.contentCreator);
          return w.contentCreator && 
            (w.status === 'content_approval' || w.status === 'ready_for_design_assignment' || w.status === 'content_rejected');
        });
        console.log('Filtered approval workflows:', approvalWorkflows);
        setWorkflows(approvalWorkflows);
      }
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
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0' }}>
          Ongoing Approval
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Track the approval status of your submitted content
        </p>
      </div>

      {workflows.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <FiClock size={48} color="#d1d5db" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: '#6b7280', fontSize: '18px', margin: '0 0 8px 0' }}>
            No Content Under Review
          </h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>
            Content you submit for approval will appear here
          </p>
        </div>
      ) : (
        workflows.map(workflow => (
          <ApprovalCard key={workflow.id} workflow={workflow} />
        ))
      )}
    </div>
  );
}