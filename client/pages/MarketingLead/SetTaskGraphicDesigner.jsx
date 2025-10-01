import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Toast from '../../components/common/Toast';

export default function SetTaskGraphicDesigner() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workflowId = searchParams.get('workflowId');
  const [workflow, setWorkflow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (workflowId) {
      fetchWorkflow();
    } else {
      setIsLoading(false);
    }
  }, [workflowId]);

  useEffect(() => {
    if (!workflow && !isLoading) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'auto';
      };
    }
  }, [workflow, isLoading]);

  const fetchWorkflow = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/marketinglead`);
      const data = await response.json();
      if (data.status === 'success') {
        const foundWorkflow = data.data.find(w => w.id === workflowId && w.status === 'ready_for_design_assignment');
        setWorkflow(foundWorkflow);
      }
    } catch (error) {
      console.error('Error fetching workflow:', error);
      setError('Failed to load workflow data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSetTask = async () => {
    if (!workflowId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${workflowId}/assign-to-graphic-designer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setSubmitted(true);
        setToast({ message: 'Task assigned successfully!', type: 'success' });
        
        // Redirect to Ongoing Task tab after successful assignment
        setTimeout(() => {
          navigate('/marketing/ongoing-task');
        }, 1500);
      } else {
        setToast({ message: 'Failed to assign task', type: 'error' });
      }
    } catch (error) {
      setToast({ message: 'Failed to assign task', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Loading workflow data...</h2>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        minHeight: 'calc(100vh - 200px)'
      }}>
        <div style={{
          maxWidth: 480,
          textAlign: 'center',
          background: '#ffffff',
          borderRadius: 20,
          padding: '60px 40px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          border: '1px solid #f1f5f9'
        }}>
          <div style={{ 
            fontSize: '80px', 
            marginBottom: '24px',
            filter: 'grayscale(20%)'
          }}>🎨</div>
          <h2 style={{ 
            color: '#1e293b', 
            marginBottom: '12px',
            fontSize: '24px',
            fontWeight: '700',
            letterSpacing: '-0.025em'
          }}>No Content Ready</h2>
          <p style={{ 
            color: '#64748b', 
            marginBottom: '32px',
            fontSize: '16px',
            lineHeight: '1.6',
            maxWidth: '320px',
            margin: '0 auto 32px auto'
          }}>
            No approved content is available for design assignment. Create and approve content first.
          </p>
          <button 
            onClick={() => window.history.back()}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              borderRadius: 12,
              padding: '14px 28px',
              fontWeight: '600',
              fontSize: '15px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.4)'
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '0', maxWidth: '100%' }}>
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
          margin: 0,
          color: '#111827',
          fontSize: '32px',
          fontWeight: '800',
          letterSpacing: '-0.025em'
        }}>Set Task - Graphic Designer</h1>
        <p style={{
          margin: '8px 0 0 0',
          color: '#6b7280',
          fontSize: '16px',
          fontWeight: '400'
        }}>Assign approved content to graphic designers for visual creation</p>
      </div>

      {/* Content Container */}
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '40px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        width: '100%'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Task Information */}
          <div>
            <h3 style={{
              fontWeight: '700',
              fontSize: '18px',
              color: '#1f2937',
              marginBottom: '16px',
              letterSpacing: '-0.025em'
            }}>
              Task Information
            </h3>
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
              borderRadius: '16px',
              border: '2px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '20px'
              }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Task Objectives</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#374151', background: '#fff', padding: '12px 16px', borderRadius: '8px', lineHeight: '1.5' }}>{workflow.objectives}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Target Gender</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#374151', background: '#fff', padding: '12px 16px', borderRadius: '8px' }}>{workflow.gender}</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Age Range</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#374151', background: '#fff', padding: '12px 16px', borderRadius: '8px' }}>{workflow.minAge}-{workflow.maxAge} years</div>
                </div>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#6b7280', marginBottom: '8px' }}>Posting Date</div>
                  <div style={{ fontSize: '15px', fontWeight: '600', color: '#374151', background: '#fff', padding: '12px 16px', borderRadius: '8px' }}>{formatDate(workflow.deadline)}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Approved Content Display */}
          <div>
            <h3 style={{
              fontWeight: '700',
              fontSize: '18px',
              color: '#1f2937',
              marginBottom: '16px',
              letterSpacing: '-0.025em'
            }}>
              Approved Content for Design
            </h3>
            <div style={{
              background: 'transparent',
              padding: '20px',
              borderRadius: '12px',
              marginBottom: '20px',
              border: '1px solid #e5e7eb'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px' }}>
                <span style={{ fontSize: '18px' }}>✨</span>
                <span style={{ fontSize: '16px', fontWeight: '700', color: '#0c4a6e' }}>Content Analysis</span>
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
                      {workflow.contentCreator?.content?.headline}
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Headline SEO</span>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: (workflow.contentCreator?.content?.seoAnalysis?.headlineScore || 0) >= 85 ? '#10b981' : (workflow.contentCreator?.content?.seoAnalysis?.headlineScore || 0) >= 75 ? '#f59e0b' : '#ef4444' }}>{workflow.contentCreator?.content?.seoAnalysis?.headlineScore || 0}/100</span>
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
                    </div>
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
                      {workflow.contentCreator?.content?.caption}
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Caption SEO</span>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: (workflow.contentCreator?.content?.seoAnalysis?.captionScore || 0) >= 85 ? '#10b981' : (workflow.contentCreator?.content?.seoAnalysis?.captionScore || 0) >= 75 ? '#f59e0b' : '#ef4444' }}>{workflow.contentCreator?.content?.seoAnalysis?.captionScore || 0}/100</span>
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
                    </div>
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
                      {workflow.contentCreator?.content?.hashtag}
                    </div>
                  </div>
                  
                  <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px' }}>
                    <div style={{ marginBottom: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>Overall SEO Score</span>
                        <span style={{ fontSize: '14px', fontWeight: '700', color: (workflow.contentCreator?.content?.seoAnalysis?.overallScore || 0) >= 85 ? '#10b981' : (workflow.contentCreator?.content?.seoAnalysis?.overallScore || 0) >= 75 ? '#f59e0b' : '#ef4444' }}>{workflow.contentCreator?.content?.seoAnalysis?.overallScore || 0}/100</span>
                      </div>
                      <div style={{
                        width: '100%',
                        height: '8px',
                        backgroundColor: '#e5e7eb',
                        borderRadius: '4px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${workflow.contentCreator?.content?.seoAnalysis?.overallScore || 0}%`,
                          height: '100%',
                          backgroundColor: (workflow.contentCreator?.content?.seoAnalysis?.overallScore || 0) >= 85 ? '#10b981' : (workflow.contentCreator?.content?.seoAnalysis?.overallScore || 0) >= 75 ? '#f59e0b' : '#ef4444',
                          borderRadius: '4px',
                          transition: 'width 0.5s ease-in-out'
                        }} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>


          
          <button 
            onClick={handleSetTask}
            disabled={loading || submitted} 
            style={{ 
              background: (loading || submitted) ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: '12px', 
              padding: '16px 32px', 
              fontWeight: '600', 
              fontSize: '15px', 
              cursor: (loading || submitted) ? 'not-allowed' : 'pointer', 
              boxShadow: (loading || submitted) 
                ? 'none' 
                : '0 4px 12px rgba(59, 130, 246, 0.3)', 
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              alignSelf: 'flex-start'
            }}
            onMouseEnter={e => {
              if (!loading && !submitted) {
                e.target.style.background = 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
              }
            }}
            onMouseLeave={e => {
              if (!loading && !submitted) {
                e.target.style.background = 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
              }
            }}
          >
            {loading ? 'Assigning Task...' : submitted ? 'Task Assigned!' : 'Assign to Graphic Designer'}
          </button>
        
        </div>
      </div>
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
} 