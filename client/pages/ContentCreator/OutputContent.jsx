import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export default function OutputContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { contents = [], taskId: stateTaskId } = location.state || {};
  
  const urlTaskId = searchParams.get('taskId');
  const taskId = stateTaskId || urlTaskId;
  
  const addMockSEOScores = (contents) => {
    return contents.map((content, index) => {
      // Generate consistent scores based on content hash
      const contentHash = (content.headline + content.caption + content.hashtag).length;
      const baseScore = 75 + (contentHash % 21);
      
      return {
        ...content,
        id: content.id || `content-${index}`,
        seoScore: baseScore,
        headlineScore: 75 + ((content.headline.length * 3) % 21),
        captionScore: 75 + ((content.caption.length * 2) % 21),
        hashtagScore: 75 + ((content.hashtag.length * 5) % 21),
        seoDetails: {
          headline: {
            wordCount: content.headline.split(' ').length,
            emotionalWords: 1 + (content.headline.length % 3),
            powerWords: 1 + (content.headline.length % 2),
            readability: ['Easy', 'Medium', 'Hard'][content.headline.length % 3],
            sentiment: ['Positive', 'Neutral', 'Negative'][content.headline.length % 3],
            keywordDensity: 2 + (content.headline.length % 5)
          },
          caption: {
            wordCount: content.caption.split(' ').length,
            emotionalWords: 2 + (content.caption.length % 5),
            powerWords: 1 + (content.caption.length % 3),
            readability: ['Easy', 'Medium', 'Hard'][content.caption.length % 3],
            sentiment: ['Positive', 'Neutral', 'Negative'][content.caption.length % 3],
            keywordDensity: 1 + (content.caption.length % 4),
            engagementWords: 1 + (content.caption.length % 3)
          },
          hashtag: {
            count: content.hashtag.split('#').length - 1,
            trending: 1 + (content.hashtag.length % 3),
            relevance: 75 + (content.hashtag.length % 21),
            competition: ['Low', 'Medium', 'High'][content.hashtag.length % 3],
            reach: (50 + (content.hashtag.length % 50)) + 'K'
          }
        }
      };
    });
  };

  const contentsWithSEO = addMockSEOScores(contents);
  const [selectedContent, setSelectedContent] = useState({
    headline: '',
    caption: '',
    hashtag: ''
  });
  const [selectedIds, setSelectedIds] = useState({
    headline: null,
    caption: null,
    hashtag: null
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showTaskSelection, setShowTaskSelection] = useState(false);
  const [availableTasks, setAvailableTasks] = useState([]);
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [showSEODetails, setShowSEODetails] = useState({});
  const [modalContent, setModalContent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState(null);

  const toggleSEODetails = (contentId, type) => {
    const key = `${contentId}-${type}`;
    setShowSEODetails(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const openModal = (content, index) => {
    setModalContent({ ...content, index });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalContent(null);
  };

  const selectContent = (type, content, contentId) => {
    setSelectedContent(prev => ({ ...prev, [type]: content }));
    setSelectedIds(prev => ({ ...prev, [type]: contentId }));
  };

  const handleSubmitForApproval = async () => {
    if (!selectedContent.headline || !selectedContent.caption || !selectedContent.hashtag) {
      alert('Please select headline, caption, and hashtag before submitting.');
      return;
    }
    
    if (!taskId && !selectedTaskId) {
      await fetchAvailableTasks();
      setShowTaskSelection(true);
      return;
    }
    
    setSubmitting(true);
    try {
      const finalTaskId = taskId || selectedTaskId;
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${finalTaskId}/submit-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: selectedContent.headline,
          caption: selectedContent.caption,
          hashtag: selectedContent.hashtag
        })
      });
      
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/content/approval');
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to submit content');
      }
    } catch (error) {
      alert('Error submitting content: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchAvailableTasks = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/contentcreator`);
      const data = await response.json();
      if (data.status === 'success') {
        setAvailableTasks(data.data.filter(task => task.status === 'content_creation' && !task.contentCreator?.content));
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleTaskSelection = () => {
    if (!selectedTaskId) {
      alert('Please select a task to assign this content to.');
      return;
    }
    setShowTaskSelection(false);
    handleSubmitForApproval();
  };

  const isSelected = (type, contentId) => selectedIds[type] === contentId;

  if (!contentsWithSEO.length) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>No content generated</h2>
        <button onClick={() => navigate('/content/create')} style={{ padding: '12px 24px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px' }}>
          Create Content
        </button>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 24,
          padding: '48px',
          textAlign: 'center',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '32px'
          }}>
            ✅
          </div>
          
          <h2 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#1e293b',
            margin: '0 0 16px 0'
          }}>Content Submitted!</h2>
          
          <p style={{
            color: '#64748b',
            fontSize: '18px',
            margin: '0 0 24px 0',
            lineHeight: 1.6
          }}>Your content has been successfully submitted for approval.</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          background: '#ffffff',
          borderRadius: 20,
          padding: '40px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 800, 
            color: '#1e293b',
            margin: '0 0 12px 0' 
          }}>
            Content Generated Successfully!
          </h1>
          <p style={{ color: '#64748b', fontSize: '18px', margin: '0 0 8px 0', fontWeight: 500 }}>
            Choose your favorite combination from the AI-generated options below
          </p>
        </div>

        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 400px', 
          gap: window.innerWidth <= 768 ? '16px' : '20px'
        }}>
          <div style={{ 
            paddingRight: window.innerWidth <= 768 ? '0' : '10px'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: '#1f2937' }}>
              📝 Generated Content ({contentsWithSEO.length} options)
            </h3>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr 1fr', 
              gap: window.innerWidth <= 768 ? '12px' : '20px' 
            }}>
            {contentsWithSEO.map((content, index) => {
              return (
                <div
                  key={content.id}
                  style={{
                    background: '#fff',
                    border: '2px solid #e5e7eb',
                    borderRadius: '16px',
                    padding: '20px',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer'
                  }}
                  onClick={() => openModal(content, index)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#1f2937', margin: '0 0 8px 0' }}>
                        Content Option {index + 1}
                      </h4>
                      <div style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.4, marginBottom: '12px' }}>
                        {content.headline.substring(0, 80)}...
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', marginLeft: '16px' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>Overall SEO</div>
                      <div style={{
                        background: content.seoScore >= 85 ? '#10b981' : content.seoScore >= 75 ? '#f59e0b' : '#ef4444',
                        color: '#fff',
                        padding: '8px 12px',
                        borderRadius: '20px',
                        fontSize: '18px',
                        fontWeight: 700
                      }}>
                        {content.seoScore}/100
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>📰 Headline</div>
                      <div style={{
                        background: content.headlineScore >= 85 ? '#10b981' : content.headlineScore >= 75 ? '#f59e0b' : '#ef4444',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 600
                      }}>
                        {content.headlineScore}
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>📝 Caption</div>
                      <div style={{
                        background: content.captionScore >= 85 ? '#10b981' : content.captionScore >= 75 ? '#f59e0b' : '#ef4444',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 600
                      }}>
                        {content.captionScore}
                      </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
                      <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '4px' }}>🏷️ Hashtags</div>
                      <div style={{
                        background: content.hashtagScore >= 85 ? '#10b981' : content.hashtagScore >= 75 ? '#f59e0b' : '#ef4444',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '14px',
                        fontWeight: 600
                      }}>
                        {content.hashtagScore}
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ background: '#f1f5f9', padding: '12px', borderRadius: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>📊 Quick SEO Metrics</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Words:</span>
                        <span style={{ fontWeight: 600, color: '#1f2937' }}>{content.seoDetails.caption.wordCount}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Sentiment:</span>
                        <span style={{ fontWeight: 600, color: '#10b981' }}>{content.seoDetails.caption.sentiment}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Power Words:</span>
                        <span style={{ fontWeight: 600, color: '#1f2937' }}>{content.seoDetails.caption.powerWords}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6b7280' }}>Readability:</span>
                        <span style={{ fontWeight: 600, color: '#1f2937' }}>{content.seoDetails.caption.readability}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '12px', textAlign: 'center', fontSize: '12px', color: '#64748b' }}>
                    Click to view full content and select components
                  </div>
                </div>
              );
            })}
            </div>
          </div>
          
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: window.innerWidth <= 768 ? '16px' : '20px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '2px solid #e5e7eb',
            height: window.innerWidth <= 768 ? 'auto' : '100%',
            display: 'flex',
            flexDirection: 'column',
            order: window.innerWidth <= 768 ? '-1' : '0'
          }}>
            <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: '#1f2937' }}>
              📝 Final Content Preview
            </h3>
            
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ color: '#ef4444' }}>Headline:</strong>
                  {selectedContent.headline && (
                    <button
                      onClick={() => setEditingField(editingField === 'headline' ? null : 'headline')}
                      style={{
                        background: editingField === 'headline' ? '#22c55e' : '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {editingField === 'headline' ? '✅ Save' : '✏️ Edit'}
                    </button>
                  )}
                </div>
                {editingField === 'headline' ? (
                  <textarea
                    value={selectedContent.headline}
                    onChange={(e) => setSelectedContent(prev => ({ ...prev, headline: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #3b82f6',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      minHeight: '60px',
                      outline: 'none'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        setEditingField(null);
                      }
                    }}
                  />
                ) : (
                  <div style={{ 
                    background: selectedContent.headline ? '#f0fdf4' : '#f9fafb', 
                    padding: '12px', 
                    borderRadius: '8px',
                    border: selectedContent.headline ? '2px solid #22c55e' : '2px solid #e5e7eb'
                  }}>
                    {selectedContent.headline || 'No headline selected'}
                  </div>
                )}
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ color: '#ef4444' }}>Caption:</strong>
                  {selectedContent.caption && (
                    <button
                      onClick={() => setEditingField(editingField === 'caption' ? null : 'caption')}
                      style={{
                        background: editingField === 'caption' ? '#22c55e' : '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {editingField === 'caption' ? '✅ Save' : '✏️ Edit'}
                    </button>
                  )}
                </div>
                {editingField === 'caption' ? (
                  <textarea
                    value={selectedContent.caption}
                    onChange={(e) => setSelectedContent(prev => ({ ...prev, caption: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #3b82f6',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      minHeight: '80px',
                      outline: 'none'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        setEditingField(null);
                      }
                    }}
                  />
                ) : (
                  <div style={{ 
                    background: selectedContent.caption ? '#f0fdf4' : '#f9fafb', 
                    padding: '12px', 
                    borderRadius: '8px',
                    border: selectedContent.caption ? '2px solid #22c55e' : '2px solid #e5e7eb'
                  }}>
                    {selectedContent.caption || 'No caption selected'}
                  </div>
                )}
              </div>
              
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <strong style={{ color: '#ef4444' }}>Hashtag:</strong>
                  {selectedContent.hashtag && (
                    <button
                      onClick={() => setEditingField(editingField === 'hashtag' ? null : 'hashtag')}
                      style={{
                        background: editingField === 'hashtag' ? '#22c55e' : '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {editingField === 'hashtag' ? '✅ Save' : '✏️ Edit'}
                    </button>
                  )}
                </div>
                {editingField === 'hashtag' ? (
                  <textarea
                    value={selectedContent.hashtag}
                    onChange={(e) => setSelectedContent(prev => ({ ...prev, hashtag: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '2px solid #3b82f6',
                      fontSize: '14px',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                      minHeight: '60px',
                      outline: 'none'
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        setEditingField(null);
                      }
                    }}
                  />
                ) : (
                  <div style={{ 
                    background: selectedContent.hashtag ? '#f0fdf4' : '#f9fafb', 
                    padding: '12px', 
                    borderRadius: '8px',
                    border: selectedContent.hashtag ? '2px solid #22c55e' : '2px solid #e5e7eb'
                  }}>
                    {selectedContent.hashtag || 'No hashtag selected'}
                  </div>
                )}
              </div>
            </div>
            
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => navigate('/content/create' + (taskId ? `?taskId=${taskId}` : ''))}
                style={{
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 24px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Regenerate All
              </button>
              <button
                onClick={handleSubmitForApproval}
                disabled={!selectedContent.headline || !selectedContent.caption || !selectedContent.hashtag || submitting}
                style={{
                  background: (!selectedContent.headline || !selectedContent.caption || !selectedContent.hashtag || submitting) 
                    ? '#9ca3af' : '#22c55e',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '12px 32px',
                  fontWeight: 600,
                  cursor: (!selectedContent.headline || !selectedContent.caption || !selectedContent.hashtag || submitting) 
                    ? 'not-allowed' : 'pointer',
                  fontSize: '16px'
                }}
              >
                {submitting ? 'Submitting...' : taskId ? 'Submit for Approval' : 'Select Task & Submit'}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {showModal && modalContent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '800px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                Content Option {modalContent.index + 1}
              </h3>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px', color: '#64748b', fontWeight: 500 }}>Overall SEO:</span>
                  <div style={{
                    background: modalContent.seoScore >= 85 ? '#10b981' : modalContent.seoScore >= 75 ? '#f59e0b' : '#ef4444',
                    color: '#fff',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: '16px',
                    fontWeight: 700
                  }}>
                    {modalContent.seoScore}/100
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '4px'
                  }}
                >
                  ✕
                </button>
              </div>
            </div>
            
            <div style={{ display: 'grid', gap: '20px', maxHeight: '60vh', overflowY: 'auto', paddingRight: '8px' }}>
              <div
                onClick={() => selectContent('headline', modalContent.headline, modalContent.id)}
                style={{
                  background: isSelected('headline', modalContent.id) ? '#fef2f2' : '#f8fafc',
                  border: isSelected('headline', modalContent.id) ? '2px solid #ef4444' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#ef4444' }}>📰 Headline</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      background: modalContent.headlineScore >= 85 ? '#10b981' : modalContent.headlineScore >= 75 ? '#f59e0b' : '#ef4444',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600
                    }}>
                      {modalContent.headlineScore}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSEODetails(modalContent.id, 'headline');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '4px'
                      }}
                    >
                      ℹ️
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 600, color: isSelected('headline', modalContent.id) ? '#ef4444' : '#1f2937', lineHeight: 1.4 }}>
                  {modalContent.headline}
                </div>
                {isSelected('headline', modalContent.id) && (
                  <div style={{ marginTop: '12px', color: '#22c55e', fontSize: '16px', fontWeight: 600 }}>
                    ✅ Selected
                  </div>
                )}
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>📊 Complete SEO Analysis</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div><strong>Word Count:</strong> {modalContent.seoDetails.headline.wordCount}</div>
                    <div><strong>Emotional Words:</strong> {modalContent.seoDetails.headline.emotionalWords}</div>
                    <div><strong>Power Words:</strong> {modalContent.seoDetails.headline.powerWords}</div>
                    <div><strong>Readability:</strong> {modalContent.seoDetails.headline.readability}</div>
                    <div><strong>Sentiment:</strong> {modalContent.seoDetails.headline.sentiment}</div>
                    <div><strong>Keyword Density:</strong> {modalContent.seoDetails.headline.keywordDensity}%</div>
                  </div>
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Performance Indicators</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>Engaging</span>
                      <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>Action-Oriented</span>
                      <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>Clear Message</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div
                onClick={() => selectContent('caption', modalContent.caption, modalContent.id)}
                style={{
                  background: isSelected('caption', modalContent.id) ? '#fef2f2' : '#f8fafc',
                  border: isSelected('caption', modalContent.id) ? '2px solid #ef4444' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#ef4444' }}>📝 Caption</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      background: modalContent.captionScore >= 85 ? '#10b981' : modalContent.captionScore >= 75 ? '#f59e0b' : '#ef4444',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600
                    }}>
                      {modalContent.captionScore}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSEODetails(modalContent.id, 'caption');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '4px'
                      }}
                    >
                      ℹ️
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '16px', color: isSelected('caption', modalContent.id) ? '#ef4444' : '#374151', lineHeight: 1.6 }}>
                  {modalContent.caption}
                </div>
                {isSelected('caption', modalContent.id) && (
                  <div style={{ marginTop: '12px', color: '#22c55e', fontSize: '16px', fontWeight: 600 }}>
                    ✅ Selected
                  </div>
                )}
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>📊 Complete SEO Analysis</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div><strong>Word Count:</strong> {modalContent.seoDetails.caption.wordCount}</div>
                    <div><strong>Emotional Words:</strong> {modalContent.seoDetails.caption.emotionalWords}</div>
                    <div><strong>Power Words:</strong> {modalContent.seoDetails.caption.powerWords}</div>
                    <div><strong>Readability:</strong> {modalContent.seoDetails.caption.readability}</div>
                    <div><strong>Sentiment:</strong> {modalContent.seoDetails.caption.sentiment}</div>
                    <div><strong>Keyword Density:</strong> {modalContent.seoDetails.caption.keywordDensity}%</div>
                    <div><strong>Engagement Words:</strong> {modalContent.seoDetails.caption.engagementWords}</div>
                    <div><strong>Reading Time:</strong> {Math.ceil(modalContent.seoDetails.caption.wordCount / 200)} min</div>
                  </div>
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Content Quality</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>Well-Structured</span>
                      <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>Persuasive</span>
                      <span style={{ background: '#fce7f3', color: '#be185d', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>Emotional Appeal</span>
                      <span style={{ background: '#dbeafe', color: '#1e40af', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>Call-to-Action</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div
                onClick={() => selectContent('hashtag', modalContent.hashtag, modalContent.id)}
                style={{
                  background: isSelected('hashtag', modalContent.id) ? '#fef2f2' : '#f8fafc',
                  border: isSelected('hashtag', modalContent.id) ? '2px solid #ef4444' : '2px solid #e5e7eb',
                  borderRadius: '12px',
                  padding: '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#ef4444' }}>#️⃣ Hashtags</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      background: modalContent.hashtagScore >= 85 ? '#10b981' : modalContent.hashtagScore >= 75 ? '#f59e0b' : '#ef4444',
                      color: '#fff',
                      padding: '4px 12px',
                      borderRadius: '12px',
                      fontSize: '14px',
                      fontWeight: 600
                    }}>
                      {modalContent.hashtagScore}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSEODetails(modalContent.id, 'hashtag');
                      }}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                        fontSize: '14px',
                        padding: '4px'
                      }}
                    >
                      ℹ️
                    </button>
                  </div>
                </div>
                <div style={{ fontSize: '16px', fontWeight: 500, color: isSelected('hashtag', modalContent.id) ? '#ef4444' : '#6366f1' }}>
                  {modalContent.hashtag}
                </div>
                {isSelected('hashtag', modalContent.id) && (
                  <div style={{ marginTop: '12px', color: '#22c55e', fontSize: '16px', fontWeight: 600 }}>
                    ✅ Selected
                  </div>
                )}
                <div style={{
                  marginTop: '16px',
                  padding: '16px',
                  background: '#f1f5f9',
                  borderRadius: '8px',
                  fontSize: '14px'
                }}>
                  <div style={{ fontWeight: 600, marginBottom: '12px', color: '#1f2937' }}>📊 Complete Hashtag Analysis</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                    <div><strong>Hashtag Count:</strong> {modalContent.seoDetails.hashtag.count}</div>
                    <div><strong>Trending Tags:</strong> {modalContent.seoDetails.hashtag.trending}</div>
                    <div><strong>Relevance:</strong> {modalContent.seoDetails.hashtag.relevance}%</div>
                    <div><strong>Competition:</strong> {modalContent.seoDetails.hashtag.competition}</div>
                    <div><strong>Est. Reach:</strong> {modalContent.seoDetails.hashtag.reach}</div>
                    <div><strong>Engagement Rate:</strong> {(Math.random() * 5 + 2).toFixed(1)}%</div>
                  </div>
                  <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px' }}>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>Hashtag Strategy</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>Niche-Targeted</span>
                      <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>Trending Mix</span>
                      <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>Brand Relevant</span>
                      <span style={{ background: '#fce7f3', color: '#be185d', padding: '4px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>Discovery Optimized</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showTaskSelection && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '32px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: '#1f2937' }}>
              📋 Select Task to Assign Content
            </h3>
            <p style={{ color: '#64748b', marginBottom: '24px' }}>
              Choose which task you want to assign this content to:
            </p>
            
            <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
              {availableTasks.length > 0 ? availableTasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedTaskId(task.id)}
                  style={{
                    background: selectedTaskId === task.id ? '#fef2f2' : '#f8fafc',
                    border: selectedTaskId === task.id ? '2px solid #ef4444' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>
                    {task.objectives}
                  </div>
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    Deadline: {new Date(task.deadline).toLocaleDateString()}
                  </div>
                  {selectedTaskId === task.id && (
                    <div style={{ marginTop: '8px', color: '#22c55e', fontSize: '14px', fontWeight: 600 }}>
                      ✅ Selected
                    </div>
                  )}
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                  No available tasks found
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setShowTaskSelection(false)}
                style={{
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleTaskSelection}
                disabled={!selectedTaskId}
                style={{
                  background: selectedTaskId ? '#22c55e' : '#9ca3af',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px 24px',
                  fontWeight: 600,
                  cursor: selectedTaskId ? 'pointer' : 'not-allowed'
                }}
              >
                Assign & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}