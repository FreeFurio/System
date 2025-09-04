import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";

const WorkflowCard = ({ workflow, onCreateContent }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'content_creation': return 'linear-gradient(135deg, #e53935, #c62828)';
      case 'content_approval': return 'linear-gradient(135deg, #F6C544, #f57f17)';
      case 'design_creation': return 'linear-gradient(135deg, #1976d2, #1565c0)';
      case 'design_approval': return 'linear-gradient(135deg, #f57c00, #ef6c00)';
      case 'posted': return 'linear-gradient(135deg, #388e3c, #2e7d32)';
      default: return 'linear-gradient(135deg, #757575, #616161)';
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
      background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      transition: 'all 0.3s ease',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h3 style={{ margin: 0, color: '#2c3e50', fontSize: '18px', fontWeight: '600' }}>Content Creation Task</h3>
        <span style={{
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          color: '#fff',
          background: getStatusColor(workflow.status),
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          {workflow.status?.replace('_', ' ') || 'CREATED'}
        </span>
      </div>
      
      <div style={{ marginBottom: '16px', padding: '16px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
        <div style={{ color: '#495057', fontSize: '14px', fontWeight: '500', marginBottom: '8px' }}>Objectives</div>
        <div style={{ color: '#2c3e50', fontSize: '15px', lineHeight: '1.5' }}>{workflow.objectives}</div>
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ padding: '12px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <div style={{ color: '#6c757d', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>TARGET GENDER</div>
          <div style={{ color: '#2c3e50', fontSize: '14px', fontWeight: '600' }}>{workflow.gender}</div>
        </div>
        <div style={{ padding: '12px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <div style={{ color: '#6c757d', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>AGE RANGE</div>
          <div style={{ color: '#2c3e50', fontSize: '14px', fontWeight: '600' }}>{workflow.minAge}-{workflow.maxAge}</div>
        </div>
        <div style={{ padding: '12px', backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e9ecef' }}>
          <div style={{ color: '#6c757d', fontSize: '12px', fontWeight: '500', marginBottom: '4px' }}>DEADLINE</div>
          <div style={{ color: '#2c3e50', fontSize: '14px', fontWeight: '600' }}>{formatDate(workflow.deadline)}</div>
        </div>
      </div>
      
      {hasSubmittedContent && (
        <div style={{ 
          marginTop: '20px', 
          padding: '20px', 
          background: 'linear-gradient(135deg, #d4edda, #c3e6cb)', 
          borderRadius: '12px', 
          border: '1px solid #b8dabd'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ color: '#155724', fontSize: '16px', marginRight: '8px' }}>✓</span>
            <strong style={{ color: '#155724', fontSize: '16px', fontWeight: '600' }}>Content Submitted</strong>
          </div>
          <div style={{ fontSize: '14px' }}>
            <div style={{ marginBottom: '8px', padding: '8px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '6px' }}>
              <strong style={{ color: '#155724' }}>Headline:</strong>
              <div style={{ color: '#2c3e50', marginTop: '4px' }}>{workflow.contentCreator.content.headline}</div>
            </div>
            <div style={{ marginBottom: '8px', padding: '8px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '6px' }}>
              <strong style={{ color: '#155724' }}>Caption:</strong>
              <div style={{ color: '#2c3e50', marginTop: '4px' }}>{workflow.contentCreator.content.caption}</div>
            </div>
            <div style={{ marginBottom: '8px', padding: '8px', backgroundColor: 'rgba(255,255,255,0.7)', borderRadius: '6px' }}>
              <strong style={{ color: '#155724' }}>Hashtags:</strong>
              <div style={{ color: '#2c3e50', marginTop: '4px' }}>{workflow.contentCreator.content.hashtag}</div>
            </div>
            <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '12px', textAlign: 'right' }}>
              Submitted: {formatDate(workflow.contentCreator.submittedAt)}
            </div>
          </div>
        </div>
      )}
      
      {canCreateContent && !hasSubmittedContent && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
          <button
            onClick={() => onCreateContent(workflow)}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #e53935, #c62828)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 4px 12px rgba(229, 57, 53, 0.3)',
              transition: 'all 0.3s ease',
              fontFamily: 'Inter, sans-serif'
            }}
            onMouseOver={(e) => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 16px rgba(229, 57, 53, 0.4)';
            }}
            onMouseOut={(e) => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(229, 57, 53, 0.3)';
            }}
          >
            Create Content
          </button>
        </div>
      )}
      
      {workflow.createdAt && (
        <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '16px', textAlign: 'right', fontStyle: 'italic' }}>
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
    <div style={{
      padding: '24px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        <div style={{
          marginBottom: '32px',
          padding: '24px',
          background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
          borderRadius: '12px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e0e0e0'
        }}>
          <h1 style={{
            margin: 0,
            color: '#2c3e50',
            fontSize: '28px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #e53935, #c62828)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>Content Creation Tasks</h1>
          <p style={{
            margin: '8px 0 0 0',
            color: '#6c757d',
            fontSize: '16px'
          }}>Manage and create content for assigned workflows</p>
        </div>
        
        {loading ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '60px',
            background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
            borderRadius: '12px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '4px solid #f3f3f3',
              borderTop: '4px solid #e53935',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
            <span style={{ marginLeft: '16px', color: '#6c757d', fontSize: '16px' }}>Loading tasks...</span>
          </div>
        ) : (
          Array.isArray(workflows) && workflows.length === 0
            ? <div style={{
                padding: '60px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ffffff, #f8f9fa)',
                borderRadius: '12px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                border: '1px solid #e0e0e0'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                <h3 style={{ color: '#6c757d', fontSize: '18px', fontWeight: '500', margin: '0 0 8px 0' }}>No Tasks Available</h3>
                <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>New content creation tasks will appear here when assigned</p>
              </div>
            : Array.isArray(workflows)
              ? workflows.map(workflow => (
                  <WorkflowCard 
                    key={workflow.id} 
                    workflow={workflow} 
                    onCreateContent={handleCreateContent}
                  />
                ))
              : <div style={{
                  padding: '24px',
                  textAlign: 'center',
                  backgroundColor: '#fee',
                  color: '#c53030',
                  borderRadius: '12px',
                  border: '1px solid #feb2b2'
                }}>Error: Workflows data is not an array.</div>
        )}
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}