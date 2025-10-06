import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from "socket.io-client";
import { FiEye, FiUser, FiCalendar, FiTarget, FiEdit3 } from 'react-icons/fi';

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
                ? 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)' 
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
  const hasDraftDesign = workflow.graphicDesigner && workflow.graphicDesigner.canvasData;

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
        background: 'transparent',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        border: '1px solid #e5e7eb'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '18px' }}>✨</span>
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#0c4a6e !important', background: 'transparent !important' }}>Content Ready for Design</span>
          </div>
          <button
            onClick={() => setContentExpanded(!contentExpanded)}
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
            {contentExpanded ? 'Hide' : 'View'} Details
          </button>
        </div>
        
        {contentExpanded && <MultiPlatformContentModal workflow={workflow} />}
      </div>
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
        {canCreateDesign && !hasSubmittedDesign && (
          <>
            {hasDraftDesign && (
              <button
                onClick={() => onCreateDesign(workflow, true)}
                style={{
                  padding: '12px 24px', 
                  background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                  color: 'white',
                  border: 'none', 
                  borderRadius: '12px', 
                  cursor: 'pointer', 
                  fontSize: '14px',
                  fontWeight: '700',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
                onMouseEnter={e => {
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(245, 158, 11, 0.4)';
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(245, 158, 11, 0.3)';
                }}
              >
                ✏️ Edit Draft
              </button>
            )}
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
              🎨 {hasDraftDesign ? 'Start New Design' : 'Create Design'}
            </button>
          </>
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

  const handleCreateDesign = (workflow, editDraft = false) => {
    console.log('🎨 Task Debug - Navigating with workflow.id:', workflow.id);
    const url = editDraft ? 
      `/graphic/creation?taskId=${workflow.id}&editDraft=true` : 
      `/graphic/creation?taskId=${workflow.id}`;
    navigate(url);
  };

  return (
    <div style={{
      padding: '24px',
      backgroundColor: '#f8f9fa',
      minHeight: '100vh',
      fontFamily: 'Inter, sans-serif'
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
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}