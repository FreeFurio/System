import React from 'react';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';

const ImageEditorWrapper = ({ onSave, onExport, initialCanvasData, onBackToTasks, taskInfo }) => {
  const [showTaskModal, setShowTaskModal] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('facebook');
  const [isSaving, setIsSaving] = React.useState(false);
  const [currentStep, setCurrentStep] = React.useState(0);
  const [saveData, setSaveData] = React.useState(null);
  const initialDataRef = React.useRef(initialCanvasData);
  
  const savingSteps = [
    { icon: '🎨', text: 'Preparing design...' },
    { icon: '💾', text: 'Saving canvas data...' },
    { icon: '📤', text: 'Uploading design...' },
    { icon: '✅', text: 'Design saved successfully!' }
  ];
  
  const handleMessage = (event) => {
    if (event.data && typeof event.data === 'string') {
      if (event.data.startsWith('SAVE:')) {
        const canvasData = event.data.replace('SAVE:', '');
        setSaveData(canvasData);
        setIsSaving(true);
        setCurrentStep(0);
        
        // Execute save immediately
        onSave?.(canvasData);
        
        // Animate through steps
        const stepInterval = setInterval(() => {
          setCurrentStep(prev => {
            if (prev >= savingSteps.length - 1) {
              clearInterval(stepInterval);
              setTimeout(() => {
                setIsSaving(false);
                setCurrentStep(0);
                setSaveData(null);
              }, 1500);
              return prev;
            }
            return prev + 1;
          });
        }, 800);
      } else if (event.data.startsWith('EXPORT:')) {
        const imageData = event.data.replace('EXPORT:', '');
        onExport?.(imageData);
      } else if (event.data === 'BACK_TO_TASKS') {
        onBackToTasks?.();
      } else if (event.data === 'SHOW_TASK_INFO') {
        setShowTaskModal(true);
      }
    }
  };

  React.useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSave, onExport]);

  const iframeSrc = initialDataRef.current ? 
    `/components/ImageEditor/editor.html?canvasData=${encodeURIComponent(initialDataRef.current)}` :
    '/components/ImageEditor/editor.html';

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <iframe
        src={iframeSrc}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '8px'
        }}
        title="Image Editor"
      />
      
      {isSaving && (
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
          zIndex: 10000
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '16px',
            padding: '32px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            textAlign: 'center',
            width: '400px',
            maxWidth: '90vw',
            border: '1px solid #e5e7eb'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '20px',
              animation: 'pulse 1.5s ease-in-out infinite'
            }}>
              {savingSteps[currentStep]?.icon}
            </div>
            <div style={{
              fontSize: '18px',
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '16px'
            }}>
              {savingSteps[currentStep]?.text}
            </div>
            <div style={{
              width: '100%',
              height: '4px',
              background: '#e5e7eb',
              borderRadius: '2px',
              overflow: 'hidden',
              marginBottom: '20px'
            }}>
              <div style={{
                width: `${((currentStep + 1) / savingSteps.length) * 100}%`,
                height: '100%',
                background: 'linear-gradient(90deg, #8b5cf6, #a855f7)',
                borderRadius: '2px',
                transition: 'width 0.8s ease'
              }} />
            </div>
            <button
              onClick={() => {
                setIsSaving(false);
                setCurrentStep(0);
                setSaveData(null);
              }}
              style={{
                background: '#6b7280',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      
      {showTaskModal && taskInfo && (
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          background: '#fff',
          borderRadius: '12px',
          padding: '20px',
          width: '350px',
          maxHeight: '70vh',
          overflow: 'auto',
          zIndex: 10000,
          boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
          border: '1px solid #e5e7eb'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>Task Information</h3>
              <button 
                onClick={() => setShowTaskModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                ×
              </button>
            </div>
            <div style={{ fontSize: '14px', lineHeight: '1.5' }}>
              <div style={{ marginBottom: '12px' }}>
                <strong>Objective:</strong> {taskInfo.objectives}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Target Gender:</strong> {taskInfo.gender}
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Age Range:</strong> {taskInfo.minAge}-{taskInfo.maxAge} years
              </div>
              <div style={{ marginBottom: '12px' }}>
                <strong>Deadline:</strong> {new Date(taskInfo.deadline).toLocaleDateString()}
              </div>
              {taskInfo.selectedPlatforms && (
                <div style={{ marginBottom: '16px' }}>
                  <strong>Platforms:</strong> {taskInfo.selectedPlatforms.map(p => p.name || p).join(', ')}
                </div>
              )}
              
              {taskInfo.contentCreator?.content?.selectedContent && (() => {
                const getPlatformIcon = (platform) => {
                  const iconStyle = { width: '14px', height: '14px', display: 'inline-block' };
                  if (platform === 'facebook') {
                    return React.createElement('svg', { ...iconStyle, viewBox: '0 0 24 24', fill: '#1877f2' },
                      React.createElement('path', { d: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' })
                    );
                  }
                  if (platform === 'instagram') {
                    return React.createElement('svg', { ...iconStyle, viewBox: '0 0 24 24', fill: '#e4405f' },
                      React.createElement('path', { d: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z' })
                    );
                  }
                  if (platform === 'twitter') {
                    return React.createElement('svg', { ...iconStyle, viewBox: '0 0 24 24', fill: '#1da1f2' },
                      React.createElement('path', { d: 'M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z' })
                    );
                  }
                  return null;
                };
                
                const platforms = Object.keys(taskInfo.contentCreator.content.selectedContent);
                const currentContent = taskInfo.contentCreator.content.selectedContent[activeTab];
                
                return (
                  <div style={{ marginTop: '20px', borderTop: '1px solid #e5e7eb', paddingTop: '16px' }}>
                    <strong style={{ fontSize: '16px', marginBottom: '12px', display: 'block' }}>Approved Content:</strong>
                    
                    <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
                      {platforms.map(platform => (
                        <button
                          key={platform}
                          onClick={() => setActiveTab(platform)}
                          style={{
                            padding: '6px 12px',
                            background: activeTab === platform ? '#8b5cf6' : '#f3f4f6',
                            color: activeTab === platform ? '#fff' : '#6b7280',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {getPlatformIcon(platform)}
                          <span style={{ textTransform: 'capitalize' }}>{platform}</span>
                        </button>
                      ))}
                    </div>
                    
                    {currentContent && (
                      <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px' }}>
                        <div style={{ marginBottom: '8px', fontSize: '13px' }}><strong>Headline:</strong> {currentContent.headline}</div>
                        <div style={{ marginBottom: '8px', fontSize: '13px' }}><strong>Caption:</strong> {currentContent.caption}</div>
                        <div style={{ fontSize: '13px' }}><strong>Hashtags:</strong> {currentContent.hashtag}</div>
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>
        </div>
      )}
    </div>
  );
};

export default ImageEditorWrapper;