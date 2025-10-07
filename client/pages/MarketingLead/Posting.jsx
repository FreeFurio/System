import React, { useState, useEffect } from 'react';
import { FiTarget, FiUser, FiCalendar, FiClock, FiSmartphone, FiEye, FiSend } from 'react-icons/fi';
import PlatformDisplay from '../../components/common/PlatformDisplay';

const SocialMediaPreviewModal = ({ workflow, onClose }) => {
  const [activeTab, setActiveTab] = useState('facebook');
  
  const selectedContent = workflow.contentCreator?.content?.selectedContent || {};
  const designUrl = workflow.graphicDesigner?.designUrl || workflow.graphicDesigner?.designs?.designUrl;
  const availablePlatforms = Object.keys(selectedContent);
  
  const FacebookPost = ({ content, design }) => (
    <div style={{ maxWidth: '500px', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #e4e6ea' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '40px', height: '40px', background: '#1877f2', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>B</div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#1c1e21' }}>Brand Name</div>
            <div style={{ fontSize: '12px', color: '#65676b' }}>Just now · 🌍</div>
          </div>
        </div>
      </div>
      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: '16px', color: '#1c1e21', lineHeight: '1.34', marginBottom: '12px' }}>
          <div style={{ fontWeight: '600', marginBottom: '8px' }}>{content.headline}</div>
          <div style={{ marginBottom: '8px' }}>{content.caption}</div>
          <div style={{ color: '#1877f2', fontSize: '14px' }}>{content.hashtag}</div>
        </div>
      </div>
      {design && (
        <div style={{ borderTop: '1px solid #e4e6ea' }}>
          <img src={design} alt="Post" style={{ width: '100%', display: 'block' }} />
        </div>
      )}
      <div style={{ padding: '8px 16px', borderTop: '1px solid #e4e6ea', fontSize: '14px', color: '#65676b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>👍 ❤️ 😊 42</span>
          <span>5 comments · 2 shares</span>
        </div>
      </div>
    </div>
  );
  
  const InstagramPost = ({ content, design }) => (
    <div style={{ maxWidth: '400px', background: '#fff', border: '1px solid #dbdbdb', borderRadius: '8px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ padding: '14px 16px', borderBottom: '1px solid #efefef' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(45deg, #f09433 0%,#e6683c 25%,#dc2743 50%,#cc2366 75%,#bc1888 100%)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '14px', fontWeight: 'bold' }}>B</div>
          <div>
            <div style={{ fontWeight: '600', fontSize: '14px', color: '#262626' }}>brandname</div>
          </div>
        </div>
      </div>
      {design && (
        <div>
          <img src={design} alt="Post" style={{ width: '100%', display: 'block' }} />
        </div>
      )}
      <div style={{ padding: '16px' }}>
        <div style={{ fontSize: '14px', color: '#262626', lineHeight: '1.4' }}>
          <span style={{ fontWeight: '600', marginRight: '8px' }}>brandname</span>
          <span style={{ fontWeight: '600', marginRight: '8px' }}>{content.headline}</span>
          <span>{content.caption}</span>
          <div style={{ color: '#00376b', marginTop: '8px' }}>{content.hashtag}</div>
        </div>
        <div style={{ fontSize: '12px', color: '#8e8e8e', marginTop: '8px' }}>View all 12 comments</div>
        <div style={{ fontSize: '10px', color: '#8e8e8e', marginTop: '4px', textTransform: 'uppercase' }}>2 minutes ago</div>
      </div>
    </div>
  );
  
  const TwitterPost = ({ content, design }) => (
    <div style={{ maxWidth: '500px', background: '#fff', border: '1px solid #cfd9de', borderRadius: '16px', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <div style={{ padding: '12px 16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: '#1d9bf0', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '18px', fontWeight: 'bold' }}>B</div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
              <span style={{ fontWeight: '700', fontSize: '15px', color: '#0f1419' }}>Brand Name</span>
              <span style={{ color: '#536471', fontSize: '15px' }}>@brandname</span>
              <span style={{ color: '#536471', fontSize: '15px' }}>·</span>
              <span style={{ color: '#536471', fontSize: '15px' }}>2m</span>
            </div>
            <div style={{ fontSize: '15px', color: '#0f1419', lineHeight: '1.3', marginBottom: '12px' }}>
              <div style={{ fontWeight: '600', marginBottom: '4px' }}>{content.headline}</div>
              <div style={{ marginBottom: '4px' }}>{content.caption}</div>
              <div style={{ color: '#1d9bf0' }}>{content.hashtag}</div>
            </div>
            {design && (
              <div style={{ marginBottom: '12px' }}>
                <img src={design} alt="Post" style={{ width: '100%', borderRadius: '16px', border: '1px solid #cfd9de' }} />
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', maxWidth: '425px', color: '#536471', fontSize: '13px' }}>
              <span>💬 12</span>
              <span>🔁 5</span>
              <span>❤️ 42</span>
              <span>📤</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  
  const renderPreview = () => {
    const content = selectedContent[activeTab];
    if (!content) return <div>No content available for {activeTab}</div>;
    
    switch (activeTab) {
      case 'facebook':
        return <FacebookPost content={content} design={designUrl} />;
      case 'instagram':
        return <InstagramPost content={content} design={designUrl} />;
      case 'twitter':
        return <TwitterPost content={content} design={designUrl} />;
      default:
        return <div>Platform not supported</div>;
    }
  };
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      background: 'rgba(0,0,0,0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '90vw',
        maxHeight: '90vh',
        overflow: 'auto',
        position: 'relative'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h3 style={{ margin: 0, fontSize: '24px', fontWeight: '700' }}>Social Media Preview</h3>
          <button
            onClick={onClose}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            ✕ Close
          </button>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
          {availablePlatforms.map(platform => (
            <button
              key={platform}
              onClick={() => setActiveTab(platform)}
              style={{
                padding: '8px 16px',
                background: activeTab === platform ? '#3b82f6' : '#f8f9fa',
                color: activeTab === platform ? '#fff' : '#6b7280',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              {platform.charAt(0).toUpperCase() + platform.slice(1)}
            </button>
          ))}
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          {renderPreview()}
        </div>
      </div>
    </div>
  );
};

const Posting = () => {
  const [pendingWorkflows, setPendingWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState({});
  const [previewModal, setPreviewModal] = useState({ show: false, workflow: null });

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const fetchPendingPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/approved`);
      const data = await response.json();
      
      if (data.status === 'success') {
        // Only show workflows that are design_approved (ready for posting)
        const readyForPosting = (data.data || []).filter(w => w.status === 'design_approved');
        setPendingWorkflows(readyForPosting);
      }
    } catch (error) {
      console.error('❌ Error fetching pending posts:', error);
      setPendingWorkflows([]);
    } finally {
      setLoading(false);
    }
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

  const handlePostNow = async (workflowId) => {
    try {
      setPosting(prev => ({ ...prev, [workflowId]: true }));
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${workflowId}/post-now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // Remove from pending list
        setPendingWorkflows(prev => prev.filter(w => w.id !== workflowId));
        alert('Content posted successfully!');
      } else {
        alert('Failed to post content: ' + data.message);
      }
    } catch (error) {
      console.error('Error posting content:', error);
      alert('Error posting content');
    } finally {
      setPosting(prev => ({ ...prev, [workflowId]: false }));
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '0', maxWidth: '100%' }}>
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
          }}>
            Posting
          </h1>
        </div>
        <div style={{ 
          textAlign: 'center', 
          padding: '40px', 
          color: '#6b7280',
          fontSize: '14px'
        }}>
          Loading pending posts...
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
          fontSize: '32px',
          fontWeight: '800',
          color: '#111827',
          margin: 0,
          letterSpacing: '-0.025em'
        }}>
          Posting
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: '8px 0 0 0',
          fontWeight: '400'
        }}>
          Approved content ready for posting ({pendingWorkflows.length} items)
        </p>
      </div>

      {/* Ready for Posting */}
      <div>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#1f2937', 
            margin: '0 0 20px 0',
            paddingBottom: '12px',
            borderBottom: '2px solid #e5e7eb'
          }}>
            Ready for Posting
          </h2>
          {pendingWorkflows.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#9ca3af',
              fontSize: '14px'
            }}>
              No content ready for posting.
            </div>
          ) : (
            pendingWorkflows.map((workflow) => (
              <div key={workflow.id} style={{
                background: '#ffffff',
                borderRadius: '16px',
                padding: '24px',
                marginBottom: '20px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
                border: '1px solid #e5e7eb',
                transition: 'all 0.2s ease'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', background: '#fff' }}>
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
                      <FiSend size={20} color="#fff" />
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
                        Ready for Posting
                      </h3>
                      <p style={{
                        margin: 0,
                        color: '#6b7280',
                        fontSize: '14px',
                        fontWeight: '500',
                        background: '#fff'
                      }}>
                        Approved {formatDate(workflow.finalApproval?.approvedAt || workflow.marketingApproval?.approvedAt)}
                      </p>
                    </div>
                  </div>
                  <span style={{
                    background: '#fed7aa',
                    color: '#9a3412',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '600',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    border: '1px solid transparent'
                  }}>
                    READY TO POST
                  </span>
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
                    <FiTarget size={16} color="#3b82f6" /> Task Objectives
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
                    <FiUser size={16} color="#3b82f6" />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Target Gender</div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>{workflow.gender}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiCalendar size={16} color="#10b981" />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Age Range</div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>{workflow.minAge}-{workflow.maxAge} years</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiClock size={16} color="#ef4444" />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Deadline</div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>{formatDate(workflow.deadline)}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <FiSmartphone size={16} color="#8b5cf6" />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Target Platforms</div>
                      <PlatformDisplay platforms={workflow.selectedPlatforms || []} size="small" />
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
                  <button
                    onClick={() => setPreviewModal({ show: true, workflow })}
                    style={{
                      background: '#8b5cf6',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                      height: '36px',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(139, 92, 246, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={e => {
                      e.target.style.transform = 'translateY(-1px)';
                      e.target.style.boxShadow = '0 4px 8px rgba(139, 92, 246, 0.3)';
                    }}
                    onMouseLeave={e => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 2px 4px rgba(139, 92, 246, 0.2)';
                    }}
                  >
                    <FiEye size={14} />
                    Preview
                  </button>
                  <button
                    onClick={() => handlePostNow(workflow.id)}
                    disabled={posting[workflow.id]}
                    style={{
                      background: posting[workflow.id] ? '#9ca3af' : '#10b981',
                      color: '#fff',
                      border: 'none',
                      padding: '8px 16px',
                      borderRadius: '12px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: posting[workflow.id] ? 'not-allowed' : 'pointer',
                      height: '36px',
                      transition: 'all 0.2s ease',
                      boxShadow: posting[workflow.id] ? 'none' : '0 2px 4px rgba(16, 185, 129, 0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={e => {
                      if (!posting[workflow.id]) {
                        e.target.style.transform = 'translateY(-1px)';
                        e.target.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
                      }
                    }}
                    onMouseLeave={e => {
                      if (!posting[workflow.id]) {
                        e.target.style.transform = 'translateY(0)';
                        e.target.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)';
                      }
                    }}
                  >
                    <FiSend size={14} />
                    {posting[workflow.id] ? 'Posting...' : 'Post Now'}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      {previewModal.show && (
        <SocialMediaPreviewModal 
          workflow={previewModal.workflow} 
          onClose={() => setPreviewModal({ show: false, workflow: null })} 
        />
      )}
    </div>
  );
};

export default Posting;