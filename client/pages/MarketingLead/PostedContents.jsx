import React, { useState, useEffect } from 'react';
import { componentStyles } from '../../styles/designSystem';

const PostedContents = () => {
  const [postedWorkflows, setPostedWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState({});
  const [selectedDesign, setSelectedDesign] = useState(null);
  const [showDesignModal, setShowDesignModal] = useState(false);

  useEffect(() => {
    fetchPostedContents();
  }, []);

  const fetchPostedContents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/posted`);
      const data = await response.json();
      console.log('🔍 PostedContents - Posted workflows:', data);
      
      if (data.status === 'success') {
        setPostedWorkflows(data.data || []);
      }
    } catch (error) {
      console.error('❌ Error fetching posted contents:', error);
      setPostedWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (workflowId) => {
    setExpandedCards(prev => ({
      ...prev,
      [workflowId]: !prev[workflowId]
    }));
  };

  const handleViewDesign = (workflow) => {
    const designUrl = workflow.graphicDesigner?.designUrl || workflow.graphicDesigner?.designs?.designUrl;
    if (designUrl) {
      setSelectedDesign({
        url: designUrl,
        title: workflow.objectives
      });
      setShowDesignModal(true);
    }
  };

  const closeDesignModal = () => {
    setShowDesignModal(false);
    setSelectedDesign(null);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={componentStyles.pageContainer}>
        <div style={{ marginBottom: '32px', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.025em' }}>Posted Contents</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading posted contents...</div>
      </div>
    );
  }

  return (
    <div style={componentStyles.pageContainer}>
      <div style={{ marginBottom: '32px', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.025em' }}>Posted Contents</h2>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: '8px 0 0 0', fontWeight: '400' }}>
          Content that has been posted after deadline ({postedWorkflows.length} items)
        </p>
      </div>

      {postedWorkflows.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
          <p>No posted contents found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {postedWorkflows.map((workflow) => {
            const isExpanded = expandedCards[workflow.id];
            const content = workflow.contentCreator?.content;
            const seoAnalysis = content?.seoAnalysis;
            const hasDesign = workflow.graphicDesigner?.designUrl || workflow.graphicDesigner?.designs?.designUrl;

            return (
              <div key={workflow.id} style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '18px', fontWeight: '700' }}>{workflow.objectives}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Posted</span>
                      <span style={{ color: '#6b7280', fontSize: '14px' }}>Posted: {formatDate(workflow.finalApproval?.approvedAt)}</span>
                    </div>
                  </div>
                  <button 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', fontWeight: 'bold', color: '#6b7280' }}
                    onClick={() => toggleExpanded(workflow.id)}
                  >
                    {isExpanded ? '−' : '+'}
                  </button>
                </div>

                <div>
                  <div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ marginBottom: '12px' }}>
                          <span style={{ fontWeight: '600', color: '#374151', marginRight: '8px' }}>Headline:</span>
                          <span style={{ color: '#6b7280' }}>{content?.headline || 'N/A'}</span>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <span style={{ fontWeight: '600', color: '#374151', marginRight: '8px' }}>Caption:</span>
                          <span style={{ color: '#6b7280' }}>{content?.caption || 'N/A'}</span>
                        </div>
                        <div style={{ marginBottom: '12px' }}>
                          <span style={{ fontWeight: '600', color: '#374151', marginRight: '8px' }}>Hashtags:</span>
                          <span style={{ color: '#6b7280' }}>{content?.hashtag || 'N/A'}</span>
                        </div>
                      </div>

                      {seoAnalysis && (
                        <div style={{ width: '280px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '14px', fontWeight: '600' }}>Headline</span>
                                <span style={{ fontSize: '14px', fontWeight: '700' }}>{seoAnalysis.headlineScore || 0}%</span>
                              </div>
                              <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}>
                                <div style={{ width: `${seoAnalysis.headlineScore || 0}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '4px' }}></div>
                              </div>
                            </div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '14px', fontWeight: '600' }}>Caption</span>
                                <span style={{ fontSize: '14px', fontWeight: '700' }}>{seoAnalysis.captionScore || 0}%</span>
                              </div>
                              <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}>
                                <div style={{ width: `${seoAnalysis.captionScore || 0}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '4px' }}></div>
                              </div>
                            </div>
                            <div>
                              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                <span style={{ fontSize: '14px', fontWeight: '600' }}>Overall</span>
                                <span style={{ fontSize: '14px', fontWeight: '700' }}>{seoAnalysis.overallScore || 0}%</span>
                              </div>
                              <div style={{ width: '100%', height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px' }}>
                                <div style={{ width: `${seoAnalysis.overallScore || 0}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '4px' }}></div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: '20px', padding: '20px', background: '#f8fafc', borderRadius: '12px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
                          <div>
                            <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>Campaign Details</h4>
                            <p style={{ margin: '4px 0', fontSize: '14px', color: '#6b7280' }}><strong>Target Audience:</strong> {workflow.gender}, Ages {workflow.minAge}-{workflow.maxAge}</p>
                            <p style={{ margin: '4px 0', fontSize: '14px', color: '#6b7280' }}><strong>Deadline:</strong> {formatDate(workflow.deadline)}</p>
                            <p style={{ margin: '4px 0', fontSize: '14px', color: '#6b7280' }}><strong>Created:</strong> {formatDate(workflow.createdAt)}</p>
                          </div>
                          
                          {workflow.finalApproval && (
                            <div>
                              <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>Approval Details</h4>
                              <p style={{ margin: '4px 0', fontSize: '14px', color: '#6b7280' }}><strong>Approved By:</strong> {workflow.finalApproval.approvedBy}</p>
                              <p style={{ margin: '4px 0', fontSize: '14px', color: '#6b7280' }}><strong>Approved At:</strong> {formatDate(workflow.finalApproval.approvedAt)}</p>
                            </div>
                          )}

                          {hasDesign && (
                            <div>
                              <h4 style={{ margin: '0 0 12px 0', fontSize: '16px', fontWeight: '600', color: '#374151' }}>Design</h4>
                              <button 
                                style={{ padding: '8px 16px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: '600' }}
                                onClick={() => handleViewDesign(workflow)}
                              >
                                View Design
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showDesignModal && selectedDesign && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={closeDesignModal}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>{selectedDesign.title}</h3>
              <button style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', padding: '8px 12px', cursor: 'pointer', fontSize: '16px' }} onClick={closeDesignModal}>×</button>
            </div>
            <div>
              <img 
                src={selectedDesign.url} 
                alt="Design" 
                style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostedContents;