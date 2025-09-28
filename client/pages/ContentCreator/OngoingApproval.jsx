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
      case 'content_approval': return 'linear-gradient(135deg, #f59e0b, #d97706)';
      case 'ready_for_design_assignment': return 'linear-gradient(135deg, #10b981, #059669)';
      case 'content_rejected': return 'linear-gradient(135deg, #ef4444, #dc2626)';
      default: return 'linear-gradient(135deg, #6b7280, #4b5563)';
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

  const getStatusEmoji = () => {
    switch (workflow.status) {
      case 'content_approval': return '⏱️';
      case 'ready_for_design_assignment': return '✅';
      case 'content_rejected': return '❌';
      default: return '⏱️';
    }
  };

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: workflow.status === 'ready_for_design_assignment' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 'linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '20px',
            fontWeight: '600',
            overflow: 'hidden'
          }}>
            {workflow.status === 'ready_for_design_assignment' ? '✓' : '📝'}
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
              {workflow.objectives}
            </h3>
            <p style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              background: '#fff'
            }}>
              Submitted {formatDate(workflow.contentCreator?.submittedAt)}
            </p>
          </div>
        </div>
        <span style={{
          background: workflow.status === 'ready_for_design_assignment' ? '#dcfce7' : workflow.status === 'content_rejected' ? '#fef2f2' : '#fed7aa',
          color: workflow.status === 'ready_for_design_assignment' ? '#166534' : workflow.status === 'content_rejected' ? '#991b1b' : '#9a3412',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          border: '1px solid transparent'
        }}>
          {getStatusText()}
        </span>
      </div>

      {/* Task Information */}
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
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', background: '#fff' }}>
              {workflow.currentStage === 'contentcreator' ? 'Content Creator' : 
               workflow.currentStage === 'marketinglead' ? 'Marketing Lead' : 
               workflow.currentStage === 'graphicdesigner' ? 'Graphic Designer' : 
               workflow.currentStage}
            </div>
          </div>
        </div>
      </div>

      {workflow.marketingApproval && (
        <div style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '20px',
          border: '1px solid #22c55e',
          boxShadow: '0 2px 8px rgba(34, 197, 94, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '20px' }}>✨</span>
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#15803d', marginBottom: '4px' }}>Approved by {workflow.marketingApproval.approvedBy}</div>
                <div style={{ fontSize: '13px', color: '#166534' }}>{formatDate(workflow.marketingApproval.approvedAt)}</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {workflow.marketingRejection && workflow.status === 'content_rejected' && (
        <div style={{
          background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '20px',
          border: '1px solid #ef4444',
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <span style={{ fontSize: '20px' }}>❌</span>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#dc2626', marginBottom: '4px' }}>Rejected by {workflow.marketingRejection.rejectedBy}</div>
              <div style={{ fontSize: '13px', color: '#991b1b' }}>{formatDate(workflow.marketingRejection.rejectedAt)}</div>
            </div>
          </div>
          {workflow.marketingRejection.feedback && (
            <div style={{
              background: '#ffffff',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #fca5a5',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#dc2626', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>💬</span> Feedback
              </div>
              <div style={{ fontSize: '15px', color: '#7f1d1d', lineHeight: 1.5 }}>{workflow.marketingRejection.feedback}</div>
            </div>
          )}
          <button
            onClick={() => window.location.href = `/content/create?workflowId=${workflow.id}`}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            🔄 Recreate Content
          </button>
        </div>
      )}

      {/* Content Preview */}
      {workflow.contentCreator?.content && (
        <div style={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid #3b82f6'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>✨</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#0c4a6e !important', background: 'transparent !important' }}>Submitted Content</span>
            </div>
            <button
              onClick={() => setExpanded(!expanded)}
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
              {expanded ? 'Hide' : 'View'} Details
            </button>
          </div>
          
          {expanded && (
            <div style={{
              marginTop: '24px',
              padding: '32px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
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
                borderBottom: '2px solid #e5e7eb'
              }}>
                <h4 className="seo-heading-override" style={{ 
                  margin: 0, 
                  color: '#000000 !important', 
                  fontSize: '20px', 
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                }}>
                  📝 Content Analysis
                </h4>
                <div style={{
                  background: '#10b981',
                  color: '#ffffff !important',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700'
                }}>
                  <span style={{ color: '#ffffff !important' }}>
                    Overall SEO: {workflow.contentCreator?.content?.seoAnalysis?.overallScore || 'N/A'}/100
                  </span>
                </div>
              </div>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
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
                      color: '#374151', 
                      marginBottom: '12px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px' 
                    }}>
                      <span>📰</span> HEADLINE
                      <div style={{
                        background: (workflow.contentCreator?.content?.seoAnalysis?.headlineScore || 0) >= 85 ? '#10b981' : (workflow.contentCreator?.content?.seoAnalysis?.headlineScore || 0) >= 75 ? '#f59e0b' : '#ef4444',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {workflow.contentCreator?.content?.seoAnalysis?.headlineScore || 'N/A'}
                      </div>
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
                    padding: '20px',
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
                      <div style={{
                        background: (workflow.contentCreator?.content?.seoAnalysis?.captionScore || 0) >= 85 ? '#10b981' : (workflow.contentCreator?.content?.seoAnalysis?.captionScore || 0) >= 75 ? '#f59e0b' : '#ef4444',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {workflow.contentCreator?.content?.seoAnalysis?.captionScore || 'N/A'}
                      </div>
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
                    padding: '20px',
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
                      <div style={{
                        background: (workflow.contentCreator?.content?.seoAnalysis?.hashtagScore || 0) >= 85 ? '#10b981' : (workflow.contentCreator?.content?.seoAnalysis?.hashtagScore || 0) >= 75 ? '#f59e0b' : '#ef4444',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '700'
                      }}>
                        {workflow.contentCreator?.content?.seoAnalysis?.hashtagScore || 'N/A'}
                      </div>
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
                
                <div style={{
                  background: '#ffffff',
                  padding: '24px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  <h5 className="seo-heading-override" style={{ 
                    margin: '0 0 20px 0', 
                    fontSize: '16px', 
                    fontWeight: '700', 
                    color: '#000000 !important', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
                  }}>
                    📊 SEO Analytics Dashboard
                  </h5>
                  
                  <div style={{ display: 'grid', gap: '12px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#6b7280' }}>Word Count</span>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>{workflow.contentCreator.content.caption?.split(' ').length || 0}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#6b7280' }}>Character Count</span>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>{workflow.contentCreator.content.caption?.length || 0}</span>
                    </div>
                    
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#6b7280' }}>Hashtag Count</span>
                      <span style={{ fontWeight: '600', color: '#1f2937' }}>{workflow.contentCreator.content.hashtag?.split('#').length - 1 || 0}</span>
                    </div>
                    
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Sentiment</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#6b7280' }}>Overall Tone</span>
                        <span style={{ fontWeight: '600', color: '#10b981' }}>{workflow.contentCreator?.content?.seoAnalysis?.sentiment?.tone || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ color: '#6b7280' }}>Confidence</span>
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>{workflow.contentCreator?.content?.seoAnalysis?.sentiment?.confidence || 'N/A'}%</span>
                      </div>
                    </div>
                    
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Power Words</div>
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
                    
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Emotional Words</div>
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
                    
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Word Complexity</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#6b7280' }}>Common Words</span>
                        <span style={{ fontWeight: '600', color: '#10b981' }}>{workflow.contentCreator?.content?.seoAnalysis?.wordComplexity?.common || 'N/A'}%</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ color: '#6b7280' }}>Uncommon Words</span>
                        <span style={{ fontWeight: '600', color: '#f59e0b' }}>{workflow.contentCreator?.content?.seoAnalysis?.wordComplexity?.uncommon || 'N/A'}%</span>
                      </div>
                    </div>
                    
                    <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Readability Analysis</div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ color: '#6b7280' }}>Grade Level</span>
                        <span style={{ fontWeight: '600', color: '#10b981' }}>{workflow.contentCreator?.content?.seoAnalysis?.readability?.gradeLevel || 'N/A'}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ color: '#6b7280' }}>Reading Time</span>
                        <span style={{ fontWeight: '600', color: '#1f2937' }}>{workflow.contentCreator?.content?.seoAnalysis?.readability?.readingTime || 'N/A'} sec</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                        <span style={{ color: '#6b7280' }}>Flesch Score</span>
                        <span style={{ fontWeight: '600', color: '#10b981' }}>{workflow.contentCreator?.content?.seoAnalysis?.readability?.fleschScore || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default function OngoingApproval() {
  const [rejectedWorkflows, setRejectedWorkflows] = useState([]);
  const [pendingWorkflows, setPendingWorkflows] = useState([]);
  const [approvedWorkflows, setApprovedWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  useEffect(() => {
    fetchApprovalWorkflows();
    
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    
    window.addEventListener('resize', handleResize);
    
    const socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });
    
    socket.on('workflowUpdated', (data) => {
      if (!data.contentCreator) {
        // Remove from both arrays if no content creator data
        setRejectedWorkflows(prev => prev.filter(w => w.id !== data.id));
        setPendingWorkflows(prev => prev.filter(w => w.id !== data.id));
        return;
      }
      
      if (data.status === 'content_rejected') {
        setRejectedWorkflows(prev => {
          const filtered = prev.filter(w => w.id !== data.id);
          return [data, ...filtered];
        });
        setPendingWorkflows(prev => prev.filter(w => w.id !== data.id));
        setApprovedWorkflows(prev => prev.filter(w => w.id !== data.id));
      } else if (data.status === 'content_approval') {
        setPendingWorkflows(prev => {
          const filtered = prev.filter(w => w.id !== data.id);
          return [data, ...filtered];
        });
        setRejectedWorkflows(prev => prev.filter(w => w.id !== data.id));
        setApprovedWorkflows(prev => prev.filter(w => w.id !== data.id));
      } else if (data.status === 'ready_for_design_assignment') {
        setApprovedWorkflows(prev => {
          const filtered = prev.filter(w => w.id !== data.id);
          return [data, ...filtered];
        });
        setRejectedWorkflows(prev => prev.filter(w => w.id !== data.id));
        setPendingWorkflows(prev => prev.filter(w => w.id !== data.id));
      } else {
        // Remove from all arrays for other statuses
        setRejectedWorkflows(prev => prev.filter(w => w.id !== data.id));
        setPendingWorkflows(prev => prev.filter(w => w.id !== data.id));
        setApprovedWorkflows(prev => prev.filter(w => w.id !== data.id));
      }
    });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      socket.disconnect();
    };
  }, []);

  const fetchApprovalWorkflows = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/content-creator/approval-status`);
      const data = await response.json();
      
      console.log('OngoingApproval API response:', data);
      
      let allWorkflows = [];
      if (data.status === 'success') {
        allWorkflows = data.data || [];
      }
      
      // Deduplicate workflows by ID
      const uniqueWorkflows = allWorkflows.reduce((acc, workflow) => {
        if (!acc.find(w => w.id === workflow.id)) {
          acc.push(workflow);
        }
        return acc;
      }, []);
      
      const rejectedWorkflows = uniqueWorkflows.filter(w => {
        return w.contentCreator && w.status === 'content_rejected';
      });
      
      const pendingWorkflows = uniqueWorkflows.filter(w => {
        return w.contentCreator && w.status === 'content_approval';
      });
      
      const approvedWorkflows = uniqueWorkflows.filter(w => {
        return w.contentCreator && w.status === 'ready_for_design_assignment';
      });
      
      setRejectedWorkflows(rejectedWorkflows);
      setPendingWorkflows(pendingWorkflows);
      setApprovedWorkflows(approvedWorkflows);
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
    <div style={{ 
      padding: isDesktop ? '32px 48px' : '24px 20px', 
      maxWidth: isDesktop ? '1400px' : 'none', 
      margin: '0 auto',
      width: '100%'
    }}>
      <div style={{
        marginBottom: isDesktop ? '40px' : '32px',
        padding: isDesktop ? '32px 40px' : '24px',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        border: '1px solid #e5e7eb'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#111827',
          margin: 0,
          letterSpacing: '-0.025em'
        }}>
          Ongoing Approval
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: '8px 0 0 0',
          fontWeight: '400'
        }}>
          Track the approval status of your submitted content
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: isDesktop ? '1fr 1fr' : '1fr',
        gap: isDesktop ? '48px' : '24px',
        alignItems: 'start'
      }}>
        {/* Rejected Content Section */}
        {rejectedWorkflows.length > 0 ? (
          <div style={{ marginBottom: isDesktop ? '0' : '40px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '20px', padding: '16px 20px',
            background: 'linear-gradient(135deg, #fef2f2 0%, #fecaca 100%)',
            borderRadius: '12px', border: '1px solid #fca5a5'
          }}>
            <FiXCircle size={24} color="#dc2626" />
            <h2 style={{
              fontSize: '20px', fontWeight: '700', color: '#dc2626',
              margin: 0
            }}>
              Rejected Content ({rejectedWorkflows.length})
            </h2>
          </div>
          {rejectedWorkflows.map(workflow => (
            <ApprovalCard key={workflow.id} workflow={workflow} />
          ))}
          </div>
        ) : (
          <div></div>
        )}

        {/* Pending Approval Section */}
        {pendingWorkflows.length > 0 ? (
          <div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '20px', padding: '16px 20px',
            background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
            borderRadius: '12px', border: '1px solid #fbbf24'
          }}>
            <FiClock size={24} color="#d97706" />
            <h2 style={{
              fontSize: '20px', fontWeight: '700', color: '#d97706',
              margin: 0
            }}>
              Pending Approval ({pendingWorkflows.length})
            </h2>
          </div>
          {pendingWorkflows.map(workflow => (
            <ApprovalCard key={workflow.id} workflow={workflow} />
          ))}
          </div>
        ) : (
          <div></div>
        )}

        {/* Approved Content Section */}
        {approvedWorkflows.length > 0 && (
          <div style={{ marginTop: isDesktop ? '0' : '40px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            marginBottom: '20px', padding: '16px 20px',
            background: 'linear-gradient(135deg, #dcfce7 0%, #bbf7d0 100%)',
            borderRadius: '12px', border: '1px solid #22c55e'
          }}>
            <FiCheckCircle size={24} color="#16a34a" />
            <h2 style={{
              fontSize: '20px', fontWeight: '700', color: '#16a34a',
              margin: 0
            }}>
              Approved Content ({approvedWorkflows.length})
            </h2>
          </div>
          {approvedWorkflows.map(workflow => (
            <ApprovalCard key={workflow.id} workflow={workflow} />
          ))}
          </div>
        )}
      </div>

      {/* Empty State */}
      {rejectedWorkflows.length === 0 && pendingWorkflows.length === 0 && approvedWorkflows.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: isDesktop ? '80px 40px' : '60px 20px',
          background: '#fff',
          borderRadius: '16px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          maxWidth: '600px',
          margin: '0 auto'
        }}>
          <FiCheckCircle size={48} color="#10b981" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: '#6b7280', fontSize: '18px', margin: '0 0 8px 0' }}>
            All Content Processed
          </h3>
          <p style={{ color: '#9ca3af', margin: 0 }}>
            No content currently awaiting approval or revision
          </p>
        </div>
      )}
    </div>
  );
}