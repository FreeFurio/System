import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { FiEye, FiUser, FiCalendar, FiTarget, FiEdit3 } from 'react-icons/fi';

const WorkflowCard = ({ workflow, onCreateDesign }) => {
  const [contentExpanded, setContentExpanded] = useState(false);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'content_creation': return 'linear-gradient(135deg, #e53935, #c62828)';
      case 'content_approval': return 'linear-gradient(135deg, #F6C544, #f57f17)';
      case 'design_creation': return 'linear-gradient(135deg, #8b5cf6, #7c3aed)';
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

  const canCreateDesign = workflow.status === 'design_creation' && workflow.currentStage === 'graphicdesigner';
  const hasSubmittedDesign = workflow.graphicDesigner && workflow.graphicDesigner.designs;

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
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            🎨
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
              Graphic Design Task
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
          🎨 {workflow.status?.replace('_', ' ') || 'CREATED'}
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
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', background: '#fff' }}>Graphic Designer</div>
          </div>
        </div>
      </div>
      
      {hasSubmittedDesign && (
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
              <span style={{ fontSize: '20px' }}>🎨</span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0d47a1', marginBottom: '4px' }}>Design Submitted</div>
                <div style={{ fontSize: '13px', color: '#1565c0' }}>Design ready for final approval</div>
              </div>
            </div>
          </div>
          
          <div style={{
            marginTop: '16px',
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
              <span>📋</span> DESIGN DETAILS
            </div>
            <div style={{
              fontSize: '15px',
              color: '#374151',
              lineHeight: 1.6
            }}>
              Submitted on {new Date(workflow.graphicDesigner.submittedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
      
      {/* Approved Content */}
      <div style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%) !important',
        padding: '24px', borderRadius: '16px', marginBottom: '20px',
        border: '2px solid #10b981', position: 'relative'
      }}>
        {/* Success Badge */}
        <div style={{
          position: 'absolute', top: '-12px', left: '20px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%) !important',
          color: '#ffffff !important', padding: '6px 16px', borderRadius: '20px',
          fontSize: '12px', fontWeight: '700', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}>
          ✅ APPROVED CONTENT
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px', background: 'transparent !important' }}>✨</span>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#065f46 !important', background: 'transparent !important' }}>Content Ready for Design</span>
          </div>
          <button
            onClick={() => setContentExpanded(!contentExpanded)}
            style={{
              background: 'none', border: 'none', color: '#059669',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: '4px', fontSize: '14px', fontWeight: '600'
            }}
          >
            <FiEye size={14} />
            {contentExpanded ? 'Hide' : 'View'} Content
          </button>
        </div>
        
        {contentExpanded && (
          <div style={{
            marginTop: '24px',
            padding: '32px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            maxHeight: '60vh',
            overflow: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              marginBottom: '32px',
              paddingBottom: '16px',
              borderBottom: '2px solid #e5e7eb',
              background: 'transparent !important'
            }}>
              <h4 style={{ 
                margin: 0, 
                color: '#1e293b !important', 
                fontSize: '20px', 
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                background: 'transparent !important'
              }}>
                📝 Content Analysis
              </h4>
              <div style={{
                background: '#10b981 !important',
                color: '#ffffff !important',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '12px',
                fontWeight: '700'
              }}>
                Overall SEO: {workflow.contentCreator?.content?.seoAnalysis?.overallScore || 0}/100
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px', background: 'transparent !important' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', background: 'transparent !important' }}>
                <div style={{
                  background: '#ffffff !important',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    color: '#374151 !important', 
                    marginBottom: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    background: 'transparent !important'
                  }}>
                    <span>📰</span> HEADLINE
                  </div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937 !important',
                    lineHeight: 1.5,
                    background: 'transparent !important',
                    marginBottom: '12px'
                  }}>
                    {workflow.contentCreator?.content?.headline || workflow.content?.headline || 'No headline found'}
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${workflow.contentCreator?.content?.seoAnalysis?.headlineScore || 0}%`,
                      height: '100%',
                      backgroundColor: (workflow.contentCreator?.content?.seoAnalysis?.headlineScore || 0) >= 85 ? '#10b981' : (workflow.contentCreator?.content?.seoAnalysis?.headlineScore || 0) >= 75 ? '#f59e0b' : '#ef4444',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease-in-out'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Headline Score</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: (workflow.contentCreator?.content?.seoAnalysis?.headlineScore || 0) >= 85 ? '#10b981' : (workflow.contentCreator?.content?.seoAnalysis?.headlineScore || 0) >= 75 ? '#f59e0b' : '#ef4444' }}>{workflow.contentCreator?.content?.seoAnalysis?.headlineScore || 0}/100</span>
                  </div>
                </div>
                
                <div style={{
                  background: '#ffffff',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    color: '#374151 !important', 
                    marginBottom: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    background: 'transparent !important'
                  }}>
                    <span>📝</span> CAPTION
                  </div>
                  <div style={{
                    fontSize: '15px',
                    color: '#374151 !important',
                    lineHeight: 1.6,
                    background: 'transparent !important',
                    marginBottom: '12px'
                  }}>
                    {workflow.contentCreator?.content?.caption || workflow.content?.caption || 'No caption found'}
                  </div>
                  <div style={{
                    width: '100%',
                    height: '8px',
                    backgroundColor: '#e5e7eb',
                    borderRadius: '4px',
                    overflow: 'hidden'
                  }}>
                    <div style={{
                      width: `${workflow.contentCreator?.content?.seoAnalysis?.captionScore || 0}%`,
                      height: '100%',
                      backgroundColor: (workflow.contentCreator?.content?.seoAnalysis?.captionScore || 0) >= 85 ? '#10b981' : (workflow.contentCreator?.content?.seoAnalysis?.captionScore || 0) >= 75 ? '#f59e0b' : '#ef4444',
                      borderRadius: '4px',
                      transition: 'width 0.5s ease-in-out'
                    }} />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                    <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Caption Score</span>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: (workflow.contentCreator?.content?.seoAnalysis?.captionScore || 0) >= 85 ? '#10b981' : (workflow.contentCreator?.content?.seoAnalysis?.captionScore || 0) >= 75 ? '#f59e0b' : '#ef4444' }}>{workflow.contentCreator?.content?.seoAnalysis?.captionScore || 0}/100</span>
                  </div>
                </div>
                
                <div style={{
                  background: '#ffffff',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '700', 
                    color: '#374151 !important', 
                    marginBottom: '12px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    background: 'transparent !important'
                  }}>
                    <span>🏷️</span> HASHTAGS
                  </div>
                  <div style={{
                    fontSize: '15px',
                    color: '#3b82f6 !important',
                    fontWeight: '600',
                    lineHeight: 1.4,
                    background: 'transparent !important'
                  }}>
                    {workflow.contentCreator?.content?.hashtag || workflow.content?.hashtag || 'No hashtags found'}
                  </div>
                </div>
              </div>
              
              <div style={{
                background: '#ffffff !important',
                padding: '24px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <h5 style={{ 
                  margin: '0 0 20px 0', 
                  fontSize: '16px', 
                  fontWeight: '700', 
                  color: '#1e293b !important', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px',
                  background: 'transparent !important'
                }}>
                  📊 Overall SEO Score
                </h5>
                
                <div style={{
                  width: '100%',
                  height: '12px',
                  backgroundColor: '#e5e7eb',
                  borderRadius: '6px',
                  overflow: 'hidden',
                  marginBottom: '12px'
                }}>
                  <div style={{
                    width: `${workflow.contentCreator?.content?.seoAnalysis?.overallScore || 0}%`,
                    height: '100%',
                    backgroundColor: (workflow.contentCreator?.content?.seoAnalysis?.overallScore || 0) >= 85 ? '#10b981' : (workflow.contentCreator?.content?.seoAnalysis?.overallScore || 0) >= 75 ? '#f59e0b' : '#ef4444',
                    borderRadius: '6px',
                    transition: 'width 0.5s ease-in-out'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '16px', fontWeight: '600', color: '#374151' }}>Content Quality</span>
                  <span style={{ fontSize: '18px', fontWeight: '700', color: (workflow.contentCreator?.content?.seoAnalysis?.overallScore || 0) >= 85 ? '#10b981' : (workflow.contentCreator?.content?.seoAnalysis?.overallScore || 0) >= 75 ? '#f59e0b' : '#ef4444' }}>{workflow.contentCreator?.content?.seoAnalysis?.overallScore || 0}/100</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
        {canCreateDesign && !hasSubmittedDesign && (
          <button
            onClick={() => onCreateDesign(workflow)}
            style={{
              padding: '12px 24px', 
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              color: 'white',
              border: 'none', 
              borderRadius: '12px', 
              cursor: 'pointer', 
              fontSize: '14px',
              fontWeight: '700',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(139, 92, 246, 0.3)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
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
            🎨 Create Design
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
    console.log('🎨 Fetching workflows from:', `${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/graphicdesigner`);
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/graphicdesigner`)
      .then(res => {
        console.log('🎨 Response status:', res.status);
        return res.json();
      })
      .then(data => {
        console.log("🎨 Graphic Designer workflows API response:", data);
        if (data.status === 'success') {
          setWorkflows(Array.isArray(data.data) ? data.data : []);
        } else {
          console.error('🎨 API returned error:', data.message);
          setWorkflows([]);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error('🎨 Error fetching workflows:', err);
        setWorkflows([]);
        setLoading(false);
      });

    const socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });
    socket.on("newWorkflow", (data) => {
      if (data.currentStage === 'graphicdesigner') {
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

  const handleCreateDesign = (workflow) => {
    console.log('🎨 Task Debug - Navigating with workflow.id:', workflow.id);
    navigate(`/graphic/creation?taskId=${workflow.id}`);
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
          }}>Graphic Design Tasks</h1>
          <p style={{
            margin: '8px 0 0 0',
            color: '#6b7280',
            fontSize: '16px',
            fontWeight: '400'
          }}>Create visual designs for approved content workflows</p>
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
              borderTop: '4px solid #8b5cf6',
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
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
                <h3 style={{ color: '#6c757d', fontSize: '18px', fontWeight: '500', margin: '0 0 8px 0' }}>No Design Tasks Available</h3>
                <p style={{ color: '#9ca3af', fontSize: '14px', margin: 0 }}>New graphic design tasks will appear here when content is approved</p>
              </div>
            : Array.isArray(workflows)
              ? workflows.map(workflow => (
                  <WorkflowCard 
                    key={workflow.id} 
                    workflow={workflow} 
                    onCreateDesign={handleCreateDesign}
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