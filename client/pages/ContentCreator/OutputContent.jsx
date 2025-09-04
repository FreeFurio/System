import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export default function OutputContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { contents = [], taskId: stateTaskId } = location.state || {};
  
  // Try to get taskId from state first, then from URL params as fallback
  const urlTaskId = searchParams.get('taskId');
  const taskId = stateTaskId || urlTaskId;
  
  // Debug logging
  console.log('🔍 OutputContent Debug - Full location object:', location);
  console.log('🔍 OutputContent Debug - location.state:', location.state);
  console.log('🔍 OutputContent Debug - stateTaskId:', stateTaskId);
  console.log('🔍 OutputContent Debug - urlTaskId:', urlTaskId);
  console.log('🔍 OutputContent Debug - final taskId:', taskId);
  console.log('🔍 OutputContent Debug - contents length:', contents.length);
  
  useEffect(() => {
    // If we have contents but no taskId, try to get it from URL
    if (contents.length > 0 && !taskId && !urlTaskId) {
      console.log('⚠️ Warning: Contents available but no taskId found');
    }
  }, [contents, taskId, urlTaskId]);
  
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

  const selectContent = (type, content, contentId) => {
    setSelectedContent(prev => ({ ...prev, [type]: content }));
    setSelectedIds(prev => ({ ...prev, [type]: contentId }));
  };

  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmitForApproval = async () => {
    if (!selectedContent.headline || !selectedContent.caption || !selectedContent.hashtag) {
      alert('Please select headline, caption, and hashtag before submitting.');
      return;
    }
    
    setSubmitting(true);
    try {
      let response;
      if (taskId) {
        response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${taskId}/submit-content`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            headline: selectedContent.headline,
            caption: selectedContent.caption,
            hashtag: selectedContent.hashtag
          })
        });
      } else {
        // Handle case without taskId - just show success
        response = { ok: true };
      }
      
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/content/task');
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

  const isSelected = (type, contentId) => selectedIds[type] === contentId;

  if (!contents.length) {
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
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          animation: 'fadeInScale 0.5s ease-out'
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
            fontSize: '32px',
            animation: 'bounce 1s ease-in-out'
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
          }}>Your content has been successfully submitted for approval. You'll be redirected to your tasks shortly.</p>
          
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            color: '#10b981',
            fontSize: '16px',
            fontWeight: '600'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              border: '2px solid #10b981',
              borderTop: '2px solid transparent',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
            Redirecting...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)', 
      padding: '32px 20px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Success Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          background: '#ffffff',
          borderRadius: 20,
          padding: '40px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
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
            ✨
          </div>
          <h1 style={{ 
            fontSize: '36px', 
            fontWeight: 800, 
            background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: '0 0 12px 0' 
          }}>
            Content Generated Successfully!
          </h1>
          <p style={{ color: '#64748b', fontSize: '18px', margin: '0 0 8px 0', fontWeight: 500 }}>
            Choose your favorite combination from the AI-generated options below
          </p>
          {taskId && (
            <div style={{
              display: 'inline-block',
              background: '#f1f5f9',
              color: '#475569',
              padding: '6px 16px',
              borderRadius: 20,
              fontSize: '14px',
              fontWeight: 600
            }}>Task: {taskId}</div>
          )}
        </div>

        {/* Selection Summary */}
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '2px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '20px', fontWeight: 700, marginBottom: '16px', color: '#1f2937' }}>
            📝 Final Content Preview
          </h3>
          
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <strong style={{ color: '#ef4444' }}>Headline:</strong>
              <div style={{ 
                background: selectedContent.headline ? '#f0fdf4' : '#f9fafb', 
                padding: '12px', 
                borderRadius: '8px', 
                marginTop: '4px',
                border: selectedContent.headline ? '2px solid #22c55e' : '2px solid #e5e7eb'
              }}>
                {selectedContent.headline || 'No headline selected'}
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#ef4444' }}>Caption:</strong>
              <div style={{ 
                background: selectedContent.caption ? '#f0fdf4' : '#f9fafb', 
                padding: '12px', 
                borderRadius: '8px', 
                marginTop: '4px',
                border: selectedContent.caption ? '2px solid #22c55e' : '2px solid #e5e7eb'
              }}>
                {selectedContent.caption || 'No caption selected'}
              </div>
            </div>
            
            <div>
              <strong style={{ color: '#ef4444' }}>Hashtag:</strong>
              <div style={{ 
                background: selectedContent.hashtag ? '#f0fdf4' : '#f9fafb', 
                padding: '12px', 
                borderRadius: '8px', 
                marginTop: '4px',
                border: selectedContent.hashtag ? '2px solid #22c55e' : '2px solid #e5e7eb'
              }}>
                {selectedContent.hashtag || 'No hashtag selected'}
              </div>
            </div>
          </div>
          
          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
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
              {submitting ? 'Submitting...' : 'Submit for Approval'}
            </button>
          </div>
        </div>

        {/* Content Options */}
        <div style={{ display: 'grid', gap: '32px' }}>
          {/* Headlines */}
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: '#1f2937' }}>
              📰 Headlines ({contents.length} options)
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {contents.map((content) => (
                <div
                  key={`headline-${content.id}`}
                  onClick={() => selectContent('headline', content.headline, content.id)}
                  style={{
                    background: isSelected('headline', content.id) ? '#fef2f2' : '#fff',
                    border: isSelected('headline', content.id) ? '2px solid #ef4444' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected('headline', content.id) ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{ fontSize: '16px', fontWeight: 600, color: isSelected('headline', content.id) ? '#ef4444' : '#1f2937' }}>
                    {content.headline}
                  </div>
                  {isSelected('headline', content.id) && (
                    <div style={{ marginTop: '8px', color: '#22c55e', fontSize: '14px', fontWeight: 600 }}>
                      ✅ Selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Captions */}
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: '#1f2937' }}>
              📝 Captions ({contents.length} options)
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {contents.map((content) => (
                <div
                  key={`caption-${content.id}`}
                  onClick={() => selectContent('caption', content.caption, content.id)}
                  style={{
                    background: isSelected('caption', content.id) ? '#fef2f2' : '#fff',
                    border: isSelected('caption', content.id) ? '2px solid #ef4444' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected('caption', content.id) ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{ fontSize: '15px', lineHeight: 1.6, color: isSelected('caption', content.id) ? '#ef4444' : '#374151' }}>
                    {content.caption}
                  </div>
                  {isSelected('caption', content.id) && (
                    <div style={{ marginTop: '8px', color: '#22c55e', fontSize: '14px', fontWeight: 600 }}>
                      ✅ Selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Hashtags */}
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '16px', color: '#1f2937' }}>
              #️⃣ Hashtags ({contents.length} options)
            </h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              {contents.map((content) => (
                <div
                  key={`hashtag-${content.id}`}
                  onClick={() => selectContent('hashtag', content.hashtag, content.id)}
                  style={{
                    background: isSelected('hashtag', content.id) ? '#fef2f2' : '#fff',
                    border: isSelected('hashtag', content.id) ? '2px solid #ef4444' : '2px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '16px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    boxShadow: isSelected('hashtag', content.id) ? '0 4px 12px rgba(239, 68, 68, 0.2)' : '0 2px 4px rgba(0, 0, 0, 0.1)'
                  }}
                >
                  <div style={{ fontSize: '16px', fontWeight: 500, color: isSelected('hashtag', content.id) ? '#ef4444' : '#6366f1' }}>
                    {content.hashtag}
                  </div>
                  {isSelected('hashtag', content.id) && (
                    <div style={{ marginTop: '8px', color: '#22c55e', fontSize: '14px', fontWeight: 600 }}>
                      ✅ Selected
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.8);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-10px);
          }
          60% {
            transform: translateY(-5px);
          }
        }
        
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}