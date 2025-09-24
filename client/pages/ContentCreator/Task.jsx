import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import PlatformDisplay from '../../components/common/PlatformDisplay';

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', background: '#fff' }}>
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
            📝
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
              Content Creation Task
            </h3>
            <p style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              background: '#fff'
            }}>
              {workflow.createdAt ? `Created ${formatDate(workflow.createdAt)}` : 'Recently created'}
            </p>
          </div>
        </div>
        <div style={{
          background: getStatusColor(workflow.status),
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          ⏱️ {workflow.status?.replace('_', ' ') || 'CREATED'}
        </div>
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
          🎯 Task Objectives
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
          <span style={{ fontSize: '16px' }}>👤</span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Target Gender</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>{workflow.gender}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>🎂</span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Age Range</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>{workflow.minAge}-{workflow.maxAge} years</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>📅</span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Deadline</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>{formatDate(workflow.deadline)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '16px' }}>📱</span>
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Target Platforms</div>
            <PlatformDisplay platforms={workflow.selectedPlatforms || []} size="small" />
          </div>
        </div>
      </div>
      
      {hasSubmittedContent && (
        <div style={{
          background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '20px',
          border: '1px solid #81d4fa',
          boxShadow: '0 2px 8px rgba(3, 169, 244, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>✨</span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0d47a1', marginBottom: '4px' }}>Submitted Content</div>
                <div style={{ fontSize: '13px', color: '#1565c0' }}>Content ready for review and approval</div>
              </div>
            </div>
          </div>
          
          <div style={{
            marginTop: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '16px'
          }}>
            <div style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '700', 
                color: '#374151', 
                marginBottom: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                <span>📰</span> HEADLINE
              </div>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: '#1f2937',
                lineHeight: 1.5
              }}>
                {workflow.contentCreator.content.headline}
              </div>
            </div>
            
            <div style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '700', 
                color: '#374151', 
                marginBottom: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                <span>📝</span> CAPTION
              </div>
              <div style={{
                fontSize: '15px',
                color: '#374151',
                lineHeight: 1.6
              }}>
                {workflow.contentCreator.content.caption}
              </div>
            </div>
            
            <div style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '700', 
                color: '#374151', 
                marginBottom: '12px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                <span>🏷️</span> HASHTAGS
              </div>
              <div style={{
                fontSize: '15px',
                color: '#3b82f6',
                fontWeight: '600',
                lineHeight: 1.4
              }}>
                {workflow.contentCreator.content.hashtag}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
        {canCreateContent && !hasSubmittedContent && (
          <button
            onClick={() => onCreateContent(workflow)}
            style={{
              padding: '12px 24px', 
              background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%)',
              color: 'white',
              border: 'none', 
              borderRadius: '12px', 
              cursor: 'pointer', 
              fontSize: '14px',
              fontWeight: '700',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(255, 154, 86, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 6px 16px rgba(255, 154, 86, 0.4)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(255, 154, 86, 0.3)';
            }}
          >
            ✏️ Create Content
          </button>
        )}
      </div>
      

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
          background: '#fff',
          borderRadius: '12px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h1 style={{
            margin: 0,
            color: '#111827',
            fontSize: '32px',
            fontWeight: '800',
            letterSpacing: '-0.025em'
          }}>Content Creation Tasks</h1>
          <p style={{
            margin: '8px 0 0 0',
            color: '#6b7280',
            fontSize: '16px',
            fontWeight: '400'
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