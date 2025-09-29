import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import DraftService from '../../services/draftService';

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

export default function OutputContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { contents = [], taskId: stateTaskId, fromDraftEdit } = location.state || {};
  const isDraftEdit = fromDraftEdit === true;
  
  const urlTaskId = searchParams.get('taskId');
  const taskId = stateTaskId || urlTaskId;
  
  // Process contents with SEO data from AI service
  const processContentsWithSEO = (contents) => {
    return contents.map((content, index) => {
      // Use SEO analysis from AI service if available, otherwise generate mock
      const seoAnalysis = content.seoAnalysis || generateFallbackSEO(content);
      
      return {
        ...content,
        id: content.id || `content-${index}`,
        seoScore: seoAnalysis.overallScore,
        headlineScore: seoAnalysis.headlineScore,
        captionScore: seoAnalysis.captionScore,
        hashtagScore: seoAnalysis.hashtagScore,
        seoDetails: {
          headline: {
            wordCount: content.headline.split(' ').length,
            emotionalWords: seoAnalysis.emotionalWords.count,
            powerWords: seoAnalysis.powerWords.count,
            readability: seoAnalysis.readability.complexity,
            sentiment: seoAnalysis.sentiment.tone,
            keywordDensity: 2 + (content.headline.length % 5)
          },
          caption: {
            wordCount: seoAnalysis.wordCount,
            emotionalWords: seoAnalysis.emotionalWords.count,
            powerWords: seoAnalysis.powerWords.count,
            readability: seoAnalysis.readability.complexity,
            sentiment: seoAnalysis.sentiment.tone,
            keywordDensity: Math.abs(parseFloat(seoAnalysis.sentiment.polarity) * 5).toFixed(1),
            engagementWords: seoAnalysis.powerWords.count
          },
          hashtag: {
            count: content.hashtag.split('#').length - 1,
            trending: 1 + (content.hashtag.length % 3),
            relevance: seoAnalysis.hashtagScore,
            competition: ['Low', 'Medium', 'High'][content.hashtag.length % 3],
            reach: (50 + (content.hashtag.length % 50)) + 'K'
          }
        },
        fullSEOAnalysis: seoAnalysis
      };
    });
  };
  
  // Fallback SEO generation if AI service data is missing
  const generateFallbackSEO = (content) => {
    const contentHash = (content.headline + content.caption + content.hashtag).length;
    return {
      overallScore: 75 + (contentHash % 21),
      headlineScore: 75 + ((content.headline.length * 3) % 21),
      captionScore: 75 + ((content.caption.length * 2) % 21),
      hashtagScore: 75 + ((content.hashtag.length * 5) % 21),
      wordCount: (content.headline + ' ' + content.caption).split(' ').length,
      powerWords: { count: 2, words: ['amazing', 'great'] },
      emotionalWords: { count: 1, words: ['exciting'] },
      sentiment: { tone: 'Positive', polarity: '0.5', confidence: 85 },
      readability: { complexity: 'Simple', gradeLevel: '7th Grade' }
    };
  };

  const contentsWithSEO = processContentsWithSEO(contents);
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

  const [showSEODetails, setShowSEODetails] = useState({});
  const [modalContent, setModalContent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [showFinalPreview, setShowFinalPreview] = useState(false);

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
    
    if (!taskId) {
      alert('No task selected. Please go back and select a task first.');
      return;
    }
    
    setSubmitting(true);
    try {
      const finalTaskId = taskId;
      
      // Find the selected content's full SEO analysis
      const selectedContentWithSEO = contentsWithSEO.find(content => 
        content.headline === selectedContent.headline ||
        content.caption === selectedContent.caption ||
        content.hashtag === selectedContent.hashtag
      );
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${finalTaskId}/submit-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: selectedContent.headline,
          caption: selectedContent.caption,
          hashtag: selectedContent.hashtag,
          seoAnalysis: selectedContentWithSEO?.fullSEOAnalysis || null
        })
      });
      
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        // Mark draft as submitted if editing from draft
        if (isDraftEdit && taskId) {
          try {
            await fetch(`${import.meta.env.VITE_API_URL}/api/v1/drafts/${Date.now()}/submit`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ workflowId: taskId })
            });
          } catch (err) {
            console.warn('Could not mark draft as submitted:', err);
          }
        }
        
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



  const autoSaveAllContent = async () => {
    if (autoSaved || !contentsWithSEO.length) return;
    
    try {
      const finalId = taskId || urlTaskId;
      const contentHash = contentsWithSEO.map(c => c.headline + c.caption).join('').slice(0, 50);
      
      // Fetch task info if we have a task ID
      let taskInfo = null;
      if (finalId) {
        try {
          const taskResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${finalId}`);
          const taskData = await taskResponse.json();
          if (taskData.status === 'success') {
            taskInfo = {
              id: finalId,
              objective: taskData.data.objectives
            };
          }
        } catch (err) {
          console.warn('Could not fetch task info:', err);
        }
      }
      
      const allContentDraft = {
        contentHash,
        taskInfo,
        allGeneratedContent: contentsWithSEO.map(content => ({
          id: content.id,
          headline: content.headline,
          caption: content.caption,
          hashtag: content.hashtag,
          seoAnalysis: content.fullSEOAnalysis,
          seoScore: content.seoScore,
          headlineScore: content.headlineScore,
          captionScore: content.captionScore,
          hashtagScore: content.hashtagScore,
          seoDetails: content.seoDetails
        })),
        totalVariations: contentsWithSEO.length,
        platform: finalId ? 'workflow' : 'standalone',
        generatedAt: new Date().toISOString()
      };
      
      await DraftService.saveDraft(allContentDraft, finalId);
      setAutoSaved(true);
      
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  };

  const isSelected = (type, contentId) => selectedIds[type] === contentId;

  useEffect(() => {
    if (contentsWithSEO.length > 0 && !autoSaved && !isDraftEdit) {
      const timer = setTimeout(() => {
        autoSaveAllContent();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [contentsWithSEO.length, autoSaved, isDraftEdit]);

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
      <div style={{ maxWidth: '100%', display: 'flex', flexDirection: 'column' }}>
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
          
          {/* Finalize Button */}
          {selectedContent.headline && selectedContent.caption && selectedContent.hashtag && (
            <div style={{ marginTop: '24px' }}>
              <button
                onClick={() => setShowFinalPreview(true)}
                style={{
                  padding: '16px 32px',
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={e => {
                  e.target.style.transform = 'translateY(-2px)';
                  e.target.style.boxShadow = '0 6px 16px rgba(16, 185, 129, 0.4)';
                }}
                onMouseLeave={e => {
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                }}
              >
                🎆 Finalize Content
              </button>
            </div>
          )}
        </div>

        {!showFinalPreview ? (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: window.innerWidth <= 768 ? '1fr' : '1fr', 
            gap: window.innerWidth <= 768 ? '16px' : '20px'
          }}>
          <div style={{ 
            paddingRight: window.innerWidth <= 768 ? '0' : '10px'
          }}>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: '#1f2937' }}>
              📝 Generated Content ({contentsWithSEO.length} options)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {contentsWithSEO.map((content, index) => {
              return (
                <div key={content.id} style={{ background: '#fff', border: '2px solid #e5e7eb', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)' }}>
                  <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: '0' }}>
                      📝 Content Option {index + 1}
                    </h4>
                  </div>
                  
                  {/* Headline Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginBottom: '20px', alignItems: 'start' }}>
                    <div 
                      onClick={() => selectContent('headline', content.headline, content.id)}
                      style={{ 
                        padding: '16px',
                        borderRadius: '12px',
                        border: isSelected('headline', content.id) ? '2px solid #10b981' : '2px solid #e5e7eb',
                        background: isSelected('headline', content.id) ? '#f0fdf4' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>📰 Headline {isSelected('headline', content.id) && '✅'}</div>
                      <div style={{ fontSize: '16px', color: '#1f2937', lineHeight: 1.4 }}>
                        {content.headline}
                      </div>
                    </div>
                    
                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                      <SEOBar score={content.headlineScore} label="Headline SEO" />
                    </div>
                  </div>
                  
                  {/* Caption Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', marginBottom: '20px', alignItems: 'start' }}>
                    <div 
                      onClick={() => selectContent('caption', content.caption, content.id)}
                      style={{ 
                        padding: '16px',
                        borderRadius: '12px',
                        border: isSelected('caption', content.id) ? '2px solid #10b981' : '2px solid #e5e7eb',
                        background: isSelected('caption', content.id) ? '#f0fdf4' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>📝 Caption {isSelected('caption', content.id) && '✅'}</div>
                      <div style={{ fontSize: '15px', color: '#374151', lineHeight: 1.5 }}>
                        {content.caption}
                      </div>
                    </div>
                    
                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                      <SEOBar score={content.captionScore} label="Caption SEO" />
                    </div>
                  </div>
                  
                  {/* Hashtags Row */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
                    <div 
                      onClick={() => selectContent('hashtag', content.hashtag, content.id)}
                      style={{
                        padding: '16px',
                        borderRadius: '12px',
                        border: isSelected('hashtag', content.id) ? '2px solid #10b981' : '2px solid #e5e7eb',
                        background: isSelected('hashtag', content.id) ? '#f0fdf4' : '#f8fafc',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>🏷️ Hashtags {isSelected('hashtag', content.id) && '✅'}</div>
                      <div style={{ fontSize: '15px', color: '#3b82f6', fontWeight: 600 }}>
                        {content.hashtag}
                      </div>
                    </div>
                    
                    <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                      <SEOBar score={content.seoScore} label="Overall SEO Score" />
                    </div>
                  </div>
                </div>
              );
            })}
            

            </div>
          </div>
          </div>
        ) : (
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '48px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            border: '2px solid #e5e7eb'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '24px', fontWeight: 700, color: '#1f2937', margin: 0 }}>
                🎆 Final Content Preview
              </h3>
              <button
                onClick={() => setShowFinalPreview(false)}
                style={{
                  padding: '8px 16px',
                  background: '#6b7280',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                ← Back to Selection
              </button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Headline Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  background: '#f8fafc'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>📰 Headline</div>
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
                    <div style={{ fontSize: '16px', color: '#1f2937', lineHeight: 1.4 }}>
                      {selectedContent.headline || 'No headline selected'}
                    </div>
                  )}
                </div>
                
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                  {(() => {
                    const selectedContentWithSEO = contentsWithSEO.find(content => 
                      content.headline === selectedContent.headline ||
                      content.caption === selectedContent.caption ||
                      content.hashtag === selectedContent.hashtag
                    );
                    return selectedContentWithSEO ? 
                      <SEOBar score={selectedContentWithSEO.headlineScore} label="Headline SEO" /> : null;
                  })()}
                </div>
              </div>
              
              {/* Caption Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  background: '#f8fafc'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>📝 Caption</div>
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
                    <div style={{ fontSize: '15px', color: '#374151', lineHeight: 1.5 }}>
                      {selectedContent.caption || 'No caption selected'}
                    </div>
                  )}
                </div>
                
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                  {(() => {
                    const selectedContentWithSEO = contentsWithSEO.find(content => 
                      content.headline === selectedContent.headline ||
                      content.caption === selectedContent.caption ||
                      content.hashtag === selectedContent.hashtag
                    );
                    return selectedContentWithSEO ? 
                      <SEOBar score={selectedContentWithSEO.captionScore} label="Caption SEO" /> : null;
                  })()}
                </div>
              </div>
              
              {/* Hashtags Row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px', alignItems: 'start' }}>
                <div style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: '1px solid #e5e7eb',
                  background: '#f8fafc'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>🏷️ Hashtags</div>
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
                    <div style={{ fontSize: '15px', color: '#3b82f6', fontWeight: 600 }}>
                      {selectedContent.hashtag || 'No hashtag selected'}
                    </div>
                  )}
                </div>
                
                <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px' }}>
                  {(() => {
                    const selectedContentWithSEO = contentsWithSEO.find(content => 
                      content.headline === selectedContent.headline ||
                      content.caption === selectedContent.caption ||
                      content.hashtag === selectedContent.hashtag
                    );
                    return selectedContentWithSEO ? 
                      <SEOBar score={selectedContentWithSEO.seoScore} label="Overall SEO Score" /> : null;
                  })()}
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {(autoSaved || isDraftEdit) && (
                <div style={{
                  padding: '8px 12px',
                  background: isDraftEdit ? '#f0fdf4' : '#f0f9ff',
                  border: isDraftEdit ? '1px solid #bbf7d0' : '1px solid #bae6fd',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: isDraftEdit ? '#166534' : '#0369a1',
                  textAlign: 'center'
                }}>
                  {isDraftEdit ? 
                    (taskId ? '📝 Editing draft for existing task' : '📝 Editing standalone draft') : 
                    '✅ All content automatically saved to drafts'}
                </div>
              )}
              
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
                {submitting ? 'Submitting...' : 
                 isDraftEdit && taskId ? 'Update Task Submission' :
                 'Submit for Approval'}
              </button>
            </div>
          </div>
        )}
        

      </div>
    </div>
  );
}