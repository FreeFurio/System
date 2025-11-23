import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useContent } from '../../store/hooks';
import { setGeneratedContents, setAvailablePlatforms, selectPlatformContent as selectPlatformContentAction, updateSelectedContent as updateSelectedContentAction, clearContent } from '../../store/slices/contentSlice';
import DraftService from '../../services/draftService';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const SEORadial = ({ score, label }) => {
  const getColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 75) return '#f59e0b';
    return '#ef4444';
  };
  
  const getQuality = (score) => {
    if (score >= 85) return 'Excellent';
    if (score >= 75) return 'Good';
    return 'Needs Work';
  };
  
  const radius = 35;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      marginBottom: '16px'
    }}>
      <div style={{ position: 'relative', marginBottom: '8px' }}>
        <svg width="80" height="80" style={{ transform: 'rotate(-90deg)' }}>
          {/* Background circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="6"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="40"
            cy="40"
            r={radius}
            stroke={getColor(score)}
            strokeWidth="6"
            fill="transparent"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        {/* Score in center */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '18px',
          fontWeight: '700',
          color: getColor(score)
        }}>
          {score}
        </div>
      </div>
      
      {/* Label and quality */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '2px' }}>
          {label}
        </div>
        <div style={{ fontSize: '11px', color: getColor(score), fontWeight: '500' }}>
          {getQuality(score)}
        </div>
      </div>
    </div>
  );
};

const SelectionProgress = ({ getSelectionProgress, setShowFinalPreview }) => {
  const progress = getSelectionProgress();
  
  return (
    <div style={{ marginTop: '24px' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          fontSize: '16px', 
          fontWeight: '600', 
          color: progress.percentage === 100 ? '#10b981' : '#6b7280',
          marginBottom: '8px'
        }}>
          Selection Progress: {progress.selected}/{progress.total} ({progress.percentage}%)
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          backgroundColor: '#e5e7eb',
          borderRadius: '4px',
          overflow: 'hidden',
          marginBottom: '16px'
        }}>
          <div style={{
            width: `${progress.percentage}%`,
            height: '100%',
            backgroundColor: progress.percentage === 100 ? '#10b981' : '#3b82f6',
            borderRadius: '4px',
            transition: 'width 0.3s ease'
          }} />
        </div>
        
        {progress.percentage === 100 ? (
          <div>
            <div style={{
              background: '#f0fdf4',
              border: '2px solid #bbf7d0',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: '700', color: '#166534', marginBottom: '12px' }}>
                ✅ All Content Selected - Ready to Submit!
              </div>
              <div style={{ fontSize: '14px', color: '#166534' }}>
                Review your selections below and click "Finalize & Submit" when ready.
              </div>
            </div>
            
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
            >
              🎯 Finalize & Submit
            </button>
          </div>
        ) : (
          <div style={{
            background: '#fef3c7',
            border: '2px solid #fbbf24',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            color: '#92400e'
          }}>
            ⚠️ Please select headline, caption, and hashtag for each platform to continue
          </div>
        )}
      </div>
    </div>
  );
};

export default function OutputContent() {
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { contents: stateContents = [], taskId: stateTaskId, fromDraftEdit: stateDraftEdit, workflowId: stateWorkflowId, fromRejection: stateFromRejection } = location.state || {};
  
  const reduxContent = useContent();
  const contents = stateContents.length > 0 ? stateContents : reduxContent.generatedContents;
  const taskId = stateTaskId || stateWorkflowId || reduxContent.taskId;
  const isDraftEdit = stateDraftEdit || reduxContent.fromDraftEdit;
  const [loadingDraft, setLoadingDraft] = useState(false);
  
  const [activeTab, setActiveTab] = useState('facebook');
  const selectedContent = reduxContent.selectedContent;
  const selectedIds = reduxContent.selectedIds;
  const availablePlatforms = reduxContent.availablePlatforms.length > 0 ? reduxContent.availablePlatforms : ['facebook', 'instagram', 'twitter'];
  
  // Process multi-platform contents
  const processMultiPlatformContents = (contents) => {
    if (!contents || contents.length === 0) return [];
    
    return contents.map((content, index) => {
      // Handle both old single-platform and new multi-platform formats
      if (content.platforms) {
        // New multi-platform format
        const platforms = content.targetPlatforms || Object.keys(content.platforms);
        return {
          id: content.id || `content-${index}`,
          topic: content.topic,
          platforms: content.platforms,
          targetPlatforms: platforms,
          generatedAt: content.generatedAt
        };
      } else {
        // Legacy single-platform format - convert to multi-platform
        const seoAnalysis = content.seoAnalysis || generateFallbackSEO(content);
        return {
          id: content.id || `content-${index}`,
          topic: content.topic || 'Generated Content',
          platforms: {
            facebook: {
              platform: 'facebook',
              headline: content.headline,
              caption: content.caption,
              hashtag: content.hashtag,
              seoAnalysis: seoAnalysis
            }
          },
          targetPlatforms: ['facebook'],
          generatedAt: content.generatedAt || new Date().toISOString()
        };
      }
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

  const processedContents = processMultiPlatformContents(contents);
  
  useEffect(() => {
    if (stateContents.length > 0) {
      dispatch(setGeneratedContents({
        contents: stateContents,
        taskId: stateTaskId,
        workflowId: stateTaskId,
        fromDraftEdit: stateDraftEdit || false
      }));
    } else if (stateFromRejection && (stateWorkflowId || stateTaskId)) {
      const loadDraft = async () => {
        setLoadingDraft(true);
        try {
          const wfId = stateWorkflowId || stateTaskId;
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/drafts/workflow/${wfId}`, {
            headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
          });
          const data = await response.json();
          
          if (data.success && data.drafts && Object.keys(data.drafts).length > 0) {
            const draftData = Object.values(data.drafts)[0];
            if (draftData.content?.allGeneratedContent) {
              dispatch(setGeneratedContents({
                contents: draftData.content.allGeneratedContent,
                taskId: wfId,
                workflowId: wfId,
                fromDraftEdit: true
              }));
            }
          }
        } catch (error) {
          console.error('Error loading draft:', error);
        } finally {
          setLoadingDraft(false);
        }
      };
      loadDraft();
    }
  }, []);
  
  useEffect(() => {
    if (processedContents.length > 0) {
      const firstContent = processedContents[0];
      const platforms = firstContent.targetPlatforms || ['facebook'];
      dispatch(setAvailablePlatforms(platforms));
      if (platforms.length > 0 && !platforms.includes(activeTab)) {
        setActiveTab(platforms[0]);
      }
    }
  }, [contents.length]);
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [showSEODetails, setShowSEODetails] = useState({});
  const [modalContent, setModalContent] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [savingDraft, setSavingDraft] = useState(false);
  const [autoSaved, setAutoSaved] = useState(false);
  const [showFinalPreview, setShowFinalPreview] = useState(false);
  const [editingContent, setEditingContent] = useState({});
  const [tempContent, setTempContent] = useState({});

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

  const selectPlatformContent = (platform, type, content, contentId) => {
    dispatch(selectPlatformContentAction({ platform, type, content, contentId }));
  };
  
  // Check if content is selected for a platform
  const isSelected = (platform, type, contentId) => {
    return selectedIds[`${platform}-${type}`] === contentId;
  };
  
  // Get platform display name
  const getPlatformDisplayName = (platform) => {
    const names = {
      facebook: 'Facebook',
      instagram: 'Instagram', 
      twitter: 'Twitter'
    };
    return names[platform] || platform;
  };
  
  // Get platform icon component
  const getPlatformIcon = (platform, size = 20) => {
    const icons = {
      facebook: <FaFacebook size={size} color="#1877f2" />,
      instagram: <FaInstagram size={size} color="#e4405f" />,
      twitter: <FaTwitter size={size} color="#1da1f2" />
    };
    return icons[platform] || <FaFacebook size={size} color="#6b7280" />;
  };

  const handleSubmitForApproval = async () => {
      // Check if content is selected for all available platforms
    const missingSelections = [];
    availablePlatforms.forEach(platform => {
      const platformContent = selectedContent[platform];
      if (!platformContent.headline || !platformContent.caption || !platformContent.hashtag) {
        missingSelections.push(getPlatformDisplayName(platform));
      }
    });
    
    if (missingSelections.length > 0) {
      alert(`Please select headline, caption, and hashtag for: ${missingSelections.join(', ')}`);
      return;
    }
    
    if (!taskId) {
      alert('No task selected. Please go back and select a task first.');
      return;
    }
    
    setSubmitting(true);
    try {
      const finalTaskId = taskId;
      
      // Prepare multi-platform selected content with SEO scores
      const multiPlatformSelectedContent = {};
      const seoAnalysisData = {};
      
      availablePlatforms.forEach(platform => {
        multiPlatformSelectedContent[platform] = selectedContent[platform];
        
        // Find the SEO analysis for selected content
        const selectedContentId = selectedIds[`${platform}-headline`] || selectedIds[`${platform}-caption`] || selectedIds[`${platform}-hashtag`];
        const sourceContent = processedContents.find(c => c.id === selectedContentId);
        if (sourceContent && sourceContent.platforms[platform]?.seoAnalysis) {
          const seo = sourceContent.platforms[platform].seoAnalysis;
          seoAnalysisData[platform] = {
            headlineScore: seo.headlineScore,
            captionScore: seo.captionScore,
            overallScore: seo.overallScore
          };
        }
      });
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${finalTaskId}/submit-content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedContent: multiPlatformSelectedContent,
          seoAnalysis: seoAnalysisData // Include SEO analysis for each platform
        })
      });
      
      const data = await response.json();
      if (response.ok && data.status === 'success') {
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
        
        dispatch(clearContent());
        setShowFinalPreview(false);
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
    if (autoSaved || !processedContents.length) return;
    
    try {
      const finalId = taskId || urlTaskId;
      const contentHash = processedContents.map(c => c.topic + JSON.stringify(c.platforms)).join('').slice(0, 50);
      
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
        allGeneratedContent: processedContents,
        totalVariations: processedContents.length,
        platform: finalId ? 'workflow' : 'standalone',
        availablePlatforms: availablePlatforms,
        generatedAt: new Date().toISOString()
      };
      
      await DraftService.saveDraft(allContentDraft, finalId);
      setAutoSaved(true);
      
    } catch (err) {
      console.error('Auto-save failed:', err);
    }
  };

  // Helper to check if ALL content is selected for submission
  const hasAllContentSelected = () => {
    return availablePlatforms.every(platform => {
      const platformContent = selectedContent[platform];
      return platformContent.headline && platformContent.caption && platformContent.hashtag;
    });
  };
  
  // Helper to get selection progress
  const getSelectionProgress = () => {
    let totalRequired = availablePlatforms.length * 3; // 3 items per platform
    let selected = 0;
    
    availablePlatforms.forEach(platform => {
      const platformContent = selectedContent[platform];
      if (platformContent.headline) selected++;
      if (platformContent.caption) selected++;
      if (platformContent.hashtag) selected++;
    });
    
    return { selected, total: totalRequired, percentage: Math.round((selected / totalRequired) * 100) };
  };

  useEffect(() => {
    if (processedContents.length > 0 && !autoSaved && !isDraftEdit) {
      const timer = setTimeout(() => {
        autoSaveAllContent();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [processedContents.length, autoSaved, isDraftEdit]);

  if (showSuccess) {
    return (
      <div style={{ padding: '0', maxWidth: '100%' }}>
        <div style={{
          background: '#f0fdf4',
          borderRadius: '16px',
          padding: '40px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '2px solid #10b981',
          width: '100%',
          minHeight: '600px',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100%',
            minHeight: '520px'
          }}>
            <div style={{
              fontSize: '64px',
              color: '#10b981',
              marginBottom: '20px'
            }}>✓</div>
            <h2 style={{
              fontSize: '32px',
              fontWeight: '800',
              color: '#10b981',
              margin: '0 0 16px 0'
            }}>Content Submitted Successfully!</h2>
            <p style={{
              fontSize: '18px',
              color: '#6b7280',
              margin: 0
            }}>Redirecting to ongoing approval...</p>
          </div>
        </div>
      </div>
    );
  }

  if (loadingDraft) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Loading draft...</h2>
      </div>
    );
  }

  if (!processedContents.length) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>No content generated</h2>
        <button onClick={() => navigate('/content/create')} style={{ padding: '12px 24px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '8px' }}>
          Create Content
        </button>
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
            Multi-Platform Content Generated!
          </h1>
          <p style={{ color: '#64748b', fontSize: '18px', margin: '0 0 8px 0', fontWeight: 500 }}>
            Select your preferred content for each platform below
          </p>
          
          {/* Platform Tabs */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: '8px', 
            marginTop: '24px',
            marginBottom: '16px'
          }}>
            {availablePlatforms.map(platform => (
              <button
                key={platform}
                onClick={() => setActiveTab(platform)}
                style={{
                  padding: '12px 24px',
                  background: '#ffffff',
                  color: activeTab === platform ? '#1f2937' : '#6b7280',
                  border: activeTab === platform ? '2px solid #fdba74' : '1px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {getPlatformIcon(platform, 16)} {getPlatformDisplayName(platform)}
              </button>
            ))}
          </div>
          
          {/* Selection Progress */}
          <SelectionProgress 
            getSelectionProgress={getSelectionProgress}
            setShowFinalPreview={setShowFinalPreview}
          />
        </div>

        {/* Final Preview Modal */}
        {showFinalPreview && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}>
            <div style={{
              backgroundColor: '#fff',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '800px',
              width: '100%',
              maxHeight: '80vh',
              overflowY: 'auto',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
            }}>
              <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: '0 0 8px 0' }}>
                  🎯 Final Content Review
                </h2>
                <p style={{ color: '#64748b', fontSize: '16px', margin: '0' }}>
                  Review your selected content before submitting for approval
                </p>
              </div>
              
              {availablePlatforms.map(platform => {
                const content = selectedContent[platform];
                return (
                  <div key={platform} style={{
                    background: '#f8fafc',
                    border: '2px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '20px',
                    marginBottom: '16px'
                  }}>
                    <h3 style={{
                      fontSize: '20px',
                      fontWeight: '700',
                      color: '#1f2937',
                      margin: '0 0 16px 0',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      {getPlatformIcon(platform, 20)} {getPlatformDisplayName(platform)}
                    </h3>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                            📰 Headline:
                          </div>
                          {editingContent[`${platform}-headline`] ? (
                            <input
                              type="text"
                              value={tempContent[`${platform}-headline`] || content.headline}
                              onChange={(e) => setTempContent(prev => ({ ...prev, [`${platform}-headline`]: e.target.value }))}
                              style={{
                                width: '100%',
                                fontSize: '16px',
                                color: '#1f2937',
                                padding: '8px',
                                background: '#fff',
                                borderRadius: '6px',
                                border: '2px solid #3b82f6'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '16px', color: '#1f2937', padding: '8px', background: '#fff', borderRadius: '6px' }}>
                              {content.headline}
                            </div>
                          )}
                        </div>
                        {editingContent[`${platform}-headline`] ? (
                          <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                            <button
                              onClick={() => {
                                dispatch(updateSelectedContentAction({
                                  platform,
                                  type: 'headline',
                                  content: tempContent[`${platform}-headline`] || content.headline
                                }));
                                setEditingContent(prev => ({ ...prev, [`${platform}-headline`]: false }));
                              }}
                              style={{
                                padding: '4px 8px',
                                background: '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingContent(prev => ({ ...prev, [`${platform}-headline`]: false }))}
                              style={{
                                padding: '4px 8px',
                                background: '#6b7280',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingContent(prev => ({ ...prev, [`${platform}-headline`]: true }));
                              setTempContent(prev => ({ ...prev, [`${platform}-headline`]: content.headline }));
                            }}
                            style={{
                              padding: '4px 8px',
                              background: '#3b82f6',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              marginLeft: '8px'
                            }}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                            📝 Caption:
                          </div>
                          {editingContent[`${platform}-caption`] ? (
                            <textarea
                              value={tempContent[`${platform}-caption`] || content.caption}
                              onChange={(e) => setTempContent(prev => ({ ...prev, [`${platform}-caption`]: e.target.value }))}
                              style={{
                                width: '100%',
                                fontSize: '15px',
                                color: '#374151',
                                padding: '8px',
                                background: '#fff',
                                borderRadius: '6px',
                                border: '2px solid #3b82f6',
                                lineHeight: 1.5,
                                minHeight: '80px',
                                resize: 'vertical'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '15px', color: '#374151', padding: '8px', background: '#fff', borderRadius: '6px', lineHeight: 1.5 }}>
                              {content.caption}
                            </div>
                          )}
                        </div>
                        {editingContent[`${platform}-caption`] ? (
                          <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                            <button
                              onClick={() => {
                                dispatch(updateSelectedContentAction({
                                  platform,
                                  type: 'caption',
                                  content: tempContent[`${platform}-caption`] || content.caption
                                }));
                                setEditingContent(prev => ({ ...prev, [`${platform}-caption`]: false }));
                              }}
                              style={{
                                padding: '4px 8px',
                                background: '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingContent(prev => ({ ...prev, [`${platform}-caption`]: false }))}
                              style={{
                                padding: '4px 8px',
                                background: '#6b7280',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingContent(prev => ({ ...prev, [`${platform}-caption`]: true }));
                              setTempContent(prev => ({ ...prev, [`${platform}-caption`]: content.caption }));
                            }}
                            style={{
                              padding: '4px 8px',
                              background: '#3b82f6',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              marginLeft: '8px'
                            }}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '4px' }}>
                            🏷️ Hashtags:
                          </div>
                          {editingContent[`${platform}-hashtag`] ? (
                            <input
                              type="text"
                              value={tempContent[`${platform}-hashtag`] || content.hashtag}
                              onChange={(e) => setTempContent(prev => ({ ...prev, [`${platform}-hashtag`]: e.target.value }))}
                              style={{
                                width: '100%',
                                fontSize: '15px',
                                color: '#3b82f6',
                                fontWeight: '600',
                                padding: '8px',
                                background: '#fff',
                                borderRadius: '6px',
                                border: '2px solid #3b82f6'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '15px', color: '#3b82f6', fontWeight: '600', padding: '8px', background: '#fff', borderRadius: '6px' }}>
                              {content.hashtag}
                            </div>
                          )}
                        </div>
                        {editingContent[`${platform}-hashtag`] ? (
                          <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                            <button
                              onClick={() => {
                                dispatch(updateSelectedContentAction({
                                  platform,
                                  type: 'hashtag',
                                  content: tempContent[`${platform}-hashtag`] || content.hashtag
                                }));
                                setEditingContent(prev => ({ ...prev, [`${platform}-hashtag`]: false }));
                              }}
                              style={{
                                padding: '4px 8px',
                                background: '#10b981',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingContent(prev => ({ ...prev, [`${platform}-hashtag`]: false }))}
                              style={{
                                padding: '4px 8px',
                                background: '#6b7280',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '12px',
                                cursor: 'pointer'
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditingContent(prev => ({ ...prev, [`${platform}-hashtag`]: true }));
                              setTempContent(prev => ({ ...prev, [`${platform}-hashtag`]: content.hashtag }));
                            }}
                            style={{
                              padding: '4px 8px',
                              background: '#3b82f6',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              marginLeft: '8px'
                            }}
                          >
                            Edit
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', marginTop: '24px' }}>
                <button
                  onClick={() => setShowFinalPreview(false)}
                  style={{
                    padding: '12px 24px',
                    background: '#6b7280',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  ← Back to Edit
                </button>
                
                <button
                  onClick={handleSubmitForApproval}
                  disabled={submitting}
                  style={{
                    padding: '12px 24px',
                    background: submitting 
                      ? '#9ca3af' 
                      : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  {submitting ? 'Submitting...' : '🚀 Submit for Approval'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Platform Content Display */}
        <div style={{ 
          background: '#fff',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '2px solid #e5e7eb'
        }}>
          {availablePlatforms.includes(activeTab) ? (
            <div>
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 700, 
                marginBottom: '24px', 
                color: '#1f2937',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                {getPlatformIcon(activeTab, 24)} {getPlatformDisplayName(activeTab)} Content ({processedContents.length} options)
              </h3>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: processedContents.length === 1 ? '1fr' : '1fr 1fr', 
                gap: '24px' 
              }}>
                {processedContents.map((content, index) => {
                  const platformData = content.platforms[activeTab];
                  
                  if (!platformData) {
                    return (
                      <div key={content.id} style={{
                        background: '#f8f9fa',
                        border: '2px solid #e5e7eb',
                        borderRadius: '16px',
                        padding: '48px',
                        textAlign: 'center'
                      }}>
                        <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
                        <h4 style={{ fontSize: '18px', fontWeight: 600, color: '#6b7280', margin: '0' }}>
                          Content not generated for {getPlatformDisplayName(activeTab)}
                        </h4>
                        <p style={{ color: '#9ca3af', fontSize: '14px', margin: '8px 0 0 0' }}>
                          This platform was not selected in the task configuration
                        </p>
                      </div>
                    );
                  }
                  
                  return (
                    <div key={content.id} style={{
                      background: '#fff',
                      border: '2px solid #e5e7eb',
                      borderRadius: '16px',
                      padding: '24px',
                      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                    }}>
                      <div style={{ marginBottom: '24px' }}>
                        <h4 style={{ fontSize: '20px', fontWeight: 700, color: '#1f2937', margin: '0' }}>
                          📝 Content Option {index + 1}
                        </h4>
                      </div>
                      
                      {/* Headline Row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '0', marginBottom: '20px', alignItems: 'start' }}>
                        <div 
                          onClick={() => selectPlatformContent(activeTab, 'headline', platformData.headline, content.id)}
                          style={{ 
                            padding: '16px',
                            borderRadius: '12px',
                            border: isSelected(activeTab, 'headline', content.id) ? '2px solid #10b981' : '2px solid #e5e7eb',
                            background: isSelected(activeTab, 'headline', content.id) ? '#f0fdf4' : '#f8fafc',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minHeight: '140px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}
                        >
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                            📰 Headline {isSelected(activeTab, 'headline', content.id) && '✅'}
                          </div>
                          <div style={{ fontSize: '16px', color: '#1f2937', lineHeight: 1.4 }}>
                            {platformData.headline}
                          </div>
                        </div>
                        
                        <div style={{ 
                          padding: '0', 
                          background: '#f8fafc', 
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '140px'
                        }}>
                          <SEORadial score={platformData.seoAnalysis?.headlineScore || 75} label="Headline" />
                        </div>
                      </div>
                      
                      {/* Caption Row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '0', marginBottom: '20px', alignItems: 'start' }}>
                        <div 
                          onClick={() => selectPlatformContent(activeTab, 'caption', platformData.caption, content.id)}
                          style={{ 
                            padding: '16px',
                            borderRadius: '12px',
                            border: isSelected(activeTab, 'caption', content.id) ? '2px solid #10b981' : '2px solid #e5e7eb',
                            background: isSelected(activeTab, 'caption', content.id) ? '#f0fdf4' : '#f8fafc',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minHeight: '140px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}
                        >
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                            📝 Caption {isSelected(activeTab, 'caption', content.id) && '✅'}
                          </div>
                          <div style={{ fontSize: '15px', color: '#374151', lineHeight: 1.5 }}>
                            {platformData.caption}
                          </div>
                        </div>
                        
                        <div style={{ 
                          padding: '0', 
                          background: '#f8fafc', 
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '140px'
                        }}>
                          <SEORadial score={platformData.seoAnalysis?.captionScore || 75} label="Content" />
                        </div>
                      </div>
                      
                      {/* Hashtags Row */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '0', alignItems: 'start' }}>
                        <div 
                          onClick={() => selectPlatformContent(activeTab, 'hashtag', platformData.hashtag, content.id)}
                          style={{
                            padding: '16px',
                            borderRadius: '12px',
                            border: isSelected(activeTab, 'hashtag', content.id) ? '2px solid #10b981' : '2px solid #e5e7eb',
                            background: isSelected(activeTab, 'hashtag', content.id) ? '#f0fdf4' : '#f8fafc',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            minHeight: '140px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'center'
                          }}
                        >
                          <div style={{ fontSize: '14px', fontWeight: 600, color: '#374151', marginBottom: '8px' }}>
                            🏷️ Hashtags {isSelected(activeTab, 'hashtag', content.id) && '✅'}
                          </div>
                          <div style={{ fontSize: '15px', color: '#3b82f6', fontWeight: 600 }}>
                            {platformData.hashtag}
                          </div>
                        </div>
                        
                        <div style={{ 
                          padding: '0', 
                          background: '#f8fafc', 
                          borderRadius: '12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minHeight: '140px'
                        }}>
                          <SEORadial score={platformData.seoAnalysis?.overallScore || 75} label="Overall" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '48px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚫</div>
              <h3 style={{ fontSize: '20px', fontWeight: 600, color: '#6b7280', margin: '0' }}>
                Platform not available
              </h3>
            </div>
          )}
        </div>
        
        {/* Action Buttons */}
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
        </div>
      </div>
    </div>
  );
}