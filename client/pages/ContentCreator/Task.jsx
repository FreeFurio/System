import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";

const WorkflowCard = ({ workflow, onCreateContent }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'content_creation': return '#007bff';
      case 'content_approval': return '#ffc107';
      case 'design_creation': return '#17a2b8';
      case 'design_approval': return '#fd7e14';
      case 'posted': return '#28a745';
      default: return '#6c757d';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canCreateContent = workflow.status === 'content_creation' && workflow.currentStage === 'contentcreator';
  const hasSubmittedContent = workflow.contentCreator && workflow.contentCreator.content;

  return (
    <div style={{
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: '#fff'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h4 style={{ margin: 0, color: '#333' }}>Content Creation Task</h4>
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#fff',
          backgroundColor: getStatusColor(workflow.status)
        }}>
          {workflow.status?.toUpperCase().replace('_', ' ') || 'CREATED'}
        </span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Objectives:</strong> {workflow.objectives}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px', color: '#666', marginBottom: '12px' }}>
        <div><strong>Gender:</strong> {workflow.gender}</div>
        <div><strong>Age:</strong> {workflow.minAge}-{workflow.maxAge}</div>
        <div><strong>Deadline:</strong> {formatDate(workflow.deadline)}</div>
        <div><strong>Stage:</strong> {workflow.currentStage}</div>
      </div>
      
      {hasSubmittedContent && (
        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#d4edda', borderRadius: '4px', border: '1px solid #c3e6cb' }}>
          <strong style={{ color: '#155724' }}>✓ Content Submitted:</strong>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            <div style={{ marginBottom: '4px' }}><strong>Headline:</strong> {workflow.contentCreator.content.headline}</div>
            <div style={{ marginBottom: '4px' }}><strong>Caption:</strong> {workflow.contentCreator.content.caption}</div>
            <div><strong>Hashtags:</strong> {workflow.contentCreator.content.hashtag}</div>
            <div style={{ fontSize: '12px', color: '#666', marginTop: '8px' }}>
              Submitted: {formatDate(workflow.contentCreator.submittedAt)}
            </div>
          </div>
        </div>
      )}
      
      {canCreateContent && !hasSubmittedContent && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px' }}>
          <button
            onClick={() => onCreateContent(workflow)}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Create Content
          </button>
        </div>
      )}
      
      {workflow.createdAt && (
        <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
          Created: {formatDate(workflow.createdAt)}
        </div>
      )}
    </div>
  );
};

export default function Task() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    console.log('🔍 Fetching workflows from:', `${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/contentcreator`);
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/contentcreator`)
      .then(res => {
        console.log('🔍 Response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log("🔍 Content Creator workflows API response:", data);
        if (data.status === 'success') {
          setWorkflows(Array.isArray(data.data) ? data.data : []);
        } else {
          console.error('🔍 API returned error:', data.message);
          setWorkflows([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('🔍 Error fetching workflows:', err);
        setWorkflows([]);
        setLoading(false);
      });

    const socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });
    socket.on("newWorkflow", (data) => {
      if (data.currentStage === 'contentcreator') {
        setWorkflows(prev => [data, ...(Array.isArray(prev) ? prev : [])]);
      }
    });
    socket.on("workflowUpdated", (data) => {
      setWorkflows(prev => prev.map(workflow => 
        workflow.id === data.id ? data : workflow
      ));
    });
    return () => socket.disconnect();
  }, []);

  const handleCreateContent = (workflow) => {
    console.log('🔍 Task Debug - Navigating with workflow.id:', workflow.id);
    navigate(`/content/create?taskId=${workflow.id}`);
  };

  return (
    <div className="manage-accounts-page-container">
      <div className="role-section">
        <h2>Content Creation Tasks</h2>
        {loading ? "Loading..." : (
          Array.isArray(workflows) && workflows.length === 0
            ? <div style={{ marginBottom: 20 }}>No tasks available.</div>
            : Array.isArray(workflows)
              ? workflows.map(workflow => (
                  <WorkflowCard 
                    key={workflow.id} 
                    workflow={workflow} 
                    onCreateContent={handleCreateContent}
                  />
                ))
              : <div style={{ color: 'red' }}>Error: Workflows data is not an array.</div>
        )}
      </div>
    </div>
  );
}