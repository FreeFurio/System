import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function SetTaskGraphicDesigner() {
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('workflowId');
  const [workflow, setWorkflow] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

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
      } else {
        setError('Failed to assign task');
      }
    } catch (error) {
      setError('Failed to assign task');
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
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0' }}>
          Set Task - Graphic Designer
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Assign approved content to graphic designers for visual creation
        </p>
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
              padding: '24px',
              background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
              borderRadius: '16px',
              border: '2px solid #bbf7d0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>Headline</div>
                  <div style={{
                    padding: '16px 20px',
                    background: '#ffffff',
                    borderRadius: '12px',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    color: '#374151',
                    border: '1px solid #d1fae5'
                  }}>
                    {workflow.contentCreator?.content?.headline}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>Caption</div>
                  <div style={{
                    padding: '16px 20px',
                    background: '#ffffff',
                    borderRadius: '12px',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    color: '#374151',
                    border: '1px solid #d1fae5'
                  }}>
                    {workflow.contentCreator?.content?.caption}
                  </div>
                </div>
                
                <div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#166534', marginBottom: '8px' }}>Hashtags</div>
                  <div style={{
                    padding: '16px 20px',
                    background: '#ffffff',
                    borderRadius: '12px',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    color: '#374151',
                    border: '1px solid #d1fae5'
                  }}>
                    {workflow.contentCreator?.content?.hashtag}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEO Analytics */}
          <div>
            <h3 style={{
              fontWeight: '700',
              fontSize: '18px',
              color: '#1f2937',
              marginBottom: '16px',
              letterSpacing: '-0.025em'
            }}>
              SEO Analytics Dashboard
            </h3>
            <div style={{
              padding: '24px',
              background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
              borderRadius: '16px',
              border: '2px solid #0ea5e9',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                marginBottom: '24px'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#ffffff !important',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '700',
                  boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                }}>
                  <span style={{ color: '#ffffff !important' }}>
                    Overall SEO: {workflow.contentCreator?.content?.seoAnalysis?.overallScore || 'N/A'}/100
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'grid', gap: '16px', fontSize: '12px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '12px' }}>
                  <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>Word Count</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>{workflow.contentCreator.content.caption?.split(' ').length || 0}</div>
                  </div>
                  <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>Character Count</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>{workflow.contentCreator.content.caption?.length || 0}</div>
                  </div>
                  <div style={{ background: '#fff', padding: '12px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>Hashtag Count</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>{workflow.contentCreator.content.hashtag?.split('#').length - 1 || 0}</div>
                  </div>
                </div>
                
                <div style={{ borderTop: '1px solid #bae6fd', paddingTop: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0c4a6e', marginBottom: '12px' }}>Sentiment Analysis</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '8px 12px', borderRadius: '6px' }}>
                      <span style={{ color: '#6b7280' }}>Overall Tone</span>
                      <span style={{ fontWeight: '600', color: '#10b981' }}>{workflow.contentCreator?.content?.seoAnalysis?.sentiment?.tone || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '8px 12px', borderRadius: '6px' }}>
                      <span style={{ color: '#6b7280' }}>Confidence</span>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>{workflow.contentCreator?.content?.seoAnalysis?.sentiment?.confidence || 'N/A'}%</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ borderTop: '1px solid #bae6fd', paddingTop: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0c4a6e', marginBottom: '8px' }}>Power Words</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(workflow.contentCreator?.content?.seoAnalysis?.powerWords?.words || workflow.contentCreator?.content?.seoAnalysis?.powerWords || ['N/A']).map(word => (
                      <span key={word} style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div style={{ borderTop: '1px solid #bae6fd', paddingTop: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0c4a6e', marginBottom: '8px' }}>Emotional Words</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(workflow.contentCreator?.content?.seoAnalysis?.emotionalWords?.words || workflow.contentCreator?.content?.seoAnalysis?.emotionalWords || ['N/A']).map(word => (
                      <span key={word} style={{
                        background: '#fce7f3',
                        color: '#be185d',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div style={{ borderTop: '1px solid #bae6fd', paddingTop: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0c4a6e', marginBottom: '8px' }}>Word Complexity</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '8px 12px', borderRadius: '6px' }}>
                      <span style={{ color: '#6b7280' }}>Common Words</span>
                      <span style={{ fontWeight: '600', color: '#10b981' }}>{workflow.contentCreator?.content?.seoAnalysis?.wordComplexity?.common || 'N/A'}%</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '8px 12px', borderRadius: '6px' }}>
                      <span style={{ color: '#6b7280' }}>Uncommon Words</span>
                      <span style={{ fontWeight: '600', color: '#f59e0b' }}>{workflow.contentCreator?.content?.seoAnalysis?.wordComplexity?.uncommon || 'N/A'}%</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ borderTop: '1px solid #bae6fd', paddingTop: '16px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#0c4a6e', marginBottom: '8px' }}>Readability Analysis</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '8px 12px', borderRadius: '6px' }}>
                      <span style={{ color: '#6b7280' }}>Grade Level</span>
                      <span style={{ fontWeight: '600', color: '#10b981' }}>{workflow.contentCreator?.content?.seoAnalysis?.readability?.gradeLevel || 'N/A'}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '8px 12px', borderRadius: '6px' }}>
                      <span style={{ color: '#6b7280' }}>Reading Time</span>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>{workflow.contentCreator?.content?.seoAnalysis?.readability?.readingTime || 'N/A'} sec</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#fff', padding: '8px 12px', borderRadius: '6px' }}>
                      <span style={{ color: '#6b7280' }}>Flesch Score</span>
                      <span style={{ fontWeight: '600', color: '#10b981' }}>{workflow.contentCreator?.content?.seoAnalysis?.readability?.fleschScore || 'N/A'}</span>
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
        
          {error && (
            <div style={{ 
              color: '#ef4444', 
              padding: '16px 20px',
              background: '#fef2f2',
              border: '2px solid #fecaca',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600'
            }}>
              {error}
            </div>
          )}
          
          {submitted && (
            <div style={{ 
              color: '#059669', 
              padding: '16px 20px',
              background: '#f0fdf4',
              border: '2px solid #bbf7d0',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600'
            }}>
              Task assigned successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 