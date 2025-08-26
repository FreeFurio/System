import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";

const ContentApprovalCard = ({ workflow, onApprove }) => {
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
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: '#fff'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h4 style={{ margin: 0, color: '#333' }}>Content Approval Required</h4>
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#fff',
          backgroundColor: '#ffc107'
        }}>
          PENDING APPROVAL
        </span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Objectives:</strong> {workflow.objectives}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px', color: '#666', marginBottom: '12px' }}>
        <div><strong>Gender:</strong> {workflow.gender}</div>
        <div><strong>Age:</strong> {workflow.minAge}-{workflow.maxAge}</div>
        <div><strong>Deadline:</strong> {formatDate(workflow.deadline)}</div>
        <div><strong>Submitted:</strong> {formatDate(workflow.contentCreator.submittedAt)}</div>
      </div>
      
      {workflow.contentCreator?.content && (
        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f8f9fa', borderRadius: '4px', border: '1px solid #e9ecef' }}>
          <strong style={{ color: '#495057' }}>📝 Submitted Content:</strong>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            <div style={{ marginBottom: '8px' }}><strong>Headline:</strong> {workflow.contentCreator.content.headline}</div>
            <div style={{ marginBottom: '8px' }}><strong>Caption:</strong> {workflow.contentCreator.content.caption}</div>
            <div><strong>Hashtags:</strong> {workflow.contentCreator.content.hashtag}</div>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', gap: '8px' }}>
        <button
          onClick={() => onApprove(workflow.id)}
          style={{
            padding: '8px 16px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          ✅ Approve Content
        </button>
      </div>
    </div>
  );
};

export default function ApprovalOfContents() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        // Redirect to Set Task for Graphic Designer page
        window.location.href = `/marketing/set-task-graphic-designer?workflowId=${workflowId}`;
      }
    } catch (error) {
      console.error('Error approving content:', error);
    }
  };

  return (
    <div className="manage-accounts-page-container">
      <div className="role-section">
        <h2>Content Approval</h2>
        {loading ? "Loading..." : (
          workflows.length === 0
            ? <div style={{ marginBottom: 20 }}>No content pending approval.</div>
            : workflows.map(workflow => (
                <ContentApprovalCard 
                  key={workflow.id} 
                  workflow={workflow} 
                  onApprove={handleApprove}
                />
              ))
        )}
      </div>
    </div>
  );
}
