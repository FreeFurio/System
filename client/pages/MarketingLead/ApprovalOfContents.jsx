import React, { useEffect, useState, useRef } from 'react';
import { io } from "socket.io-client";
import { FiClock, FiUser, FiCalendar, FiTarget, FiCheckCircle, FiEye } from 'react-icons/fi';
import { componentStyles } from '../../styles/designSystem';

const ContentApprovalCard = ({ workflow, onApprove, onReject }) => {
  const [expanded, setExpanded] = useState(false);
  
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
            background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '20px',
            fontWeight: '600',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(245, 158, 11, 0.3)'
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
              Content Approval Required
            </h3>
            <p style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              background: '#fff'
            }}>
              Created {formatDate(workflow.createdAt)}
            </p>
          </div>
        </div>
        <div style={{
          background: '#fed7aa',
          color: '#9a3412',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          border: '1px solid transparent'
        }}>
          📝 CONTENT APPROVAL
        </div>
      </div>
      
      <div style={{
        background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
        padding: '20px',
        borderRadius: '12px',
        marginBottom: '20px',
        border: '1px solid #3b82f6'
      }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#1e40af', 
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FiTarget size={16} color="#3b82f6" />
          Task Objectives
        </div>
        <div style={{ 
          fontSize: '16px', 
          color: '#1e40af', 
          lineHeight: '1.6',
          fontWeight: '500'
        }}>
          {workflow.objectives}
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: '16px', 
        marginBottom: '20px',
        padding: '16px 0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiUser size={16} color="#8b5cf6" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px' }}>Target Gender</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151' }}>{workflow.gender}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiTarget size={16} color="#10b981" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px' }}>Age Range</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151' }}>{workflow.minAge}-{workflow.maxAge} years</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCalendar size={16} color="#ef4444" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px' }}>Deadline</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151' }}>{formatDate(workflow.deadline)}</div>
          </div>
        </div>
      </div>
      
      {/* Content Preview */}
      {workflow.contentCreator?.content && (
        <div style={{
          background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
          padding: '20px 24px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid #3b82f6',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>✨</span>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: '#1e40af', marginBottom: '2px' }}>Submitted Content</div>
              <div style={{ fontSize: '14px', color: '#3b82f6' }}>Content ready for review and approval</div>
            </div>
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '12px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.3)';
            }}
          >
            📄 {expanded ? 'Hide' : 'View'} Details
          </button>
        </div>
      )}
      
      {/* Expanded Content Section */}
      {expanded && workflow.contentCreator?.content && (
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
              background: '#10b981 !important',
              color: '#ffffff !important',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              Overall SEO: {workflow.contentCreator?.content?.seoAnalysis?.overallScore || 'N/A'}/100
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
                    {(workflow.contentCreator?.content?.seoAnalysis?.powerWords || ['N/A']).map(word => (
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
                    {(workflow.contentCreator?.content?.seoAnalysis?.emotionalWords || ['N/A']).map(word => (
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
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button
          onClick={() => onReject(workflow.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(239, 68, 68, 0.4)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(239, 68, 68, 0.3)';
          }}
        >
          <span style={{ fontSize: '16px' }}>❌</span>
          Reject Content
        </button>
        <button
          onClick={() => onApprove(workflow.id)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.4)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 2px 8px rgba(16, 185, 129, 0.3)';
          }}
        >
          <span style={{ fontSize: '16px' }}>✅</span>
          Approve Content
        </button>
      </div>
    </div>
  );
};

export default function ApprovalOfContents() {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
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
      if (response.status === 429) {
        console.log('Rate limited, skipping fetch');
        return;
      }
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
        window.location.href = `/marketing/approved`;
      }
    } catch (error) {
      console.error('Error approving content:', error);
    }
  };

  const [rejectModal, setRejectModal] = useState({ show: false, workflowId: null });
  const [feedback, setFeedback] = useState('');

  const handleReject = (workflowId) => {
    setRejectModal({ show: true, workflowId });
    setFeedback('');
  };

  const submitReject = async () => {
    if (!feedback.trim()) return;
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${rejectModal.workflowId}/reject-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rejectedBy: 'Marketing Lead', feedback })
      });
      
      if (response.ok) {
        setWorkflows(prev => prev.filter(w => w.id !== rejectModal.workflowId));
        setRejectModal({ show: false, workflowId: null });
      }
    } catch (error) {
      console.error('Error rejecting content:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #e5e7eb',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <p style={{ color: '#64748b', fontSize: '16px' }}>Loading content approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={componentStyles.pageContainer}>
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
          fontSize: '32px',
          fontWeight: '800',
          color: '#111827',
          margin: 0,
          letterSpacing: '-0.025em'
        }}>Content Approval</h1>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: '8px 0 0 0',
          fontWeight: '400'
        }}>
          Review and approve content submissions from content creators
        </p>
      </div>

      {/* Content List */}
      {workflows.length === 0 ? (
        <div style={componentStyles.emptyState}>
          <div style={componentStyles.emptyStateIcon}>📝</div>
          <h3 style={componentStyles.emptyStateTitle}>
            No Content Pending Approval
          </h3>
          <p style={componentStyles.emptyStateText}>
            All content has been reviewed. New submissions will appear here.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
          {workflows.map(workflow => (
            <ContentApprovalCard 
              key={workflow.id} 
              workflow={workflow} 
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
      
      {/* Rejection Modal */}
      {rejectModal.show && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '32px',
            width: '500px',
            maxWidth: '90vw'
          }}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '20px', fontWeight: '700' }}>Reject Content</h3>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Please provide feedback for rejection..."
              style={{
                width: '100%',
                height: '120px',
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                resize: 'vertical'
              }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
              <button
                onClick={() => setRejectModal({ show: false, workflowId: null })}
                style={{
                  padding: '8px 16px',
                  background: '#f3f4f6',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={submitReject}
                disabled={!feedback.trim()}
                style={{
                  padding: '8px 16px',
                  background: feedback.trim() ? '#ef4444' : '#d1d5db',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: feedback.trim() ? 'pointer' : 'not-allowed'
                }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
