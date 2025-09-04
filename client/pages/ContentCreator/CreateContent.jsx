import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createContent } from '../../services/contentService';
import { componentStyles } from '../../styles/designSystem';

export default function CreateContent() {
  const [input, setInput] = useState('');
  const [numContents, setNumContents] = useState(1);
  const [numContentsTouched, setNumContentsTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generationStep, setGenerationStep] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('🔍 CreateContent Debug - taskId from URL:', taskId);
    if (taskId) {
      // Fetch the actual workflow data to get objectives
      fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/contentcreator`)
        .then(res => res.json())
        .then(data => {
          if (data.status === 'success') {
            const workflow = data.data.find(w => w.id === taskId);
            if (workflow) {
              setInput(workflow.objectives);
            }
          }
        })
        .catch(err => console.error('Error fetching workflow:', err));
    }
  }, [taskId, searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setShowProgress(true);
    
    // Simulate generation steps
    const steps = [
      'Analyzing your content brief...',
      'Generating creative headlines...',
      'Crafting engaging captions...',
      'Creating relevant hashtags...',
      'Finalizing your content...'
    ];
    
    try {
      // Show progress steps
      for (let i = 0; i < steps.length; i++) {
        setGenerationStep(i);
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      const res = await createContent({ input, numContents, taskId });
      if (res.success) {
        setLoading(false);
        setShowProgress(false);
        const finalTaskId = res.taskId || taskId;
        const outputUrl = finalTaskId ? `/content/output?taskId=${finalTaskId}` : '/content/output';
        navigate(outputUrl, { state: { contents: res.contents, taskId: finalTaskId } });
      } else {
        setError('Failed to create content.');
        setLoading(false);
        setShowProgress(false);
      }
    } catch (err) {
      setError('An error occurred.');
      setLoading(false);
      setShowProgress(false);
    }
  };

  if (showProgress) {
    const steps = [
      { text: 'Analyzing your content brief...', icon: '🔍' },
      { text: 'Generating creative headlines...', icon: '💡' },
      { text: 'Crafting engaging captions...', icon: '✍️' },
      { text: 'Creating relevant hashtags...', icon: '🏷️' },
      { text: 'Finalizing your content...', icon: '✨' }
    ];
    
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}>
        <div style={{
          background: '#ffffff',
          borderRadius: 24,
          padding: '48px',
          maxWidth: '500px',
          width: '90%',
          textAlign: 'center',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '32px',
            animation: 'pulse 2s infinite'
          }}>
            🤖
          </div>
          
          <h2 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#1e293b',
            margin: '0 0 16px 0'
          }}>AI is Working...</h2>
          
          <p style={{
            color: '#64748b',
            fontSize: '16px',
            margin: '0 0 32px 0'
          }}>Creating amazing content just for you</p>
          
          <div style={{ textAlign: 'left' }}>
            {steps.map((step, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                padding: '12px 0',
                opacity: index <= generationStep ? 1 : 0.3,
                transition: 'opacity 0.3s ease'
              }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: index <= generationStep ? '#10b981' : '#e5e7eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  transition: 'background 0.3s ease'
                }}>
                  {index < generationStep ? '✓' : index === generationStep ? step.icon : '○'}
                </div>
                <span style={{
                  fontSize: '15px',
                  fontWeight: index === generationStep ? '600' : '500',
                  color: index <= generationStep ? '#1e293b' : '#94a3b8'
                }}>
                  {step.text}
                </span>
              </div>
            ))}
          </div>
          
          <div style={{
            width: '100%',
            height: '4px',
            background: '#e5e7eb',
            borderRadius: '2px',
            marginTop: '24px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${((generationStep + 1) / steps.length) * 100}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6, #1d4ed8)',
              borderRadius: '2px',
              transition: 'width 0.8s ease'
            }} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)', 
      padding: '32px 20px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: 800,
        margin: '0 auto'
      }}>
        {/* Header Section */}
        <div style={{
          textAlign: 'center',
          marginBottom: '40px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '12px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 25,
            padding: '10px 24px',
            marginBottom: 20,
            letterSpacing: '0.5px',
            boxShadow: '0 4px 20px rgba(59, 130, 246, 0.3)'
          }}>
            <span style={{fontSize: '18px'}}>🤖</span>
            AI Content Generator
          </div>
          <h1 style={{
            fontWeight: 800,
            fontSize: 42,
            background: 'linear-gradient(135deg, #1e293b 0%, #475569 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            margin: 0,
            letterSpacing: '-1px'
          }}>Create Amazing Content</h1>
          <p style={{
            color: '#64748b',
            fontSize: 18,
            margin: '12px 0 0 0',
            fontWeight: 500
          }}>Generate engaging content with AI assistance</p>
        </div>

        {/* Main Form Card */}
        <div style={{
          background: '#ffffff',
          borderRadius: 20,
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
          padding: '0',
          overflow: 'hidden',
          border: '1px solid #e2e8f0'
        }}>
          {/* Form Header */}
          <div style={{
            background: 'linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%)',
            padding: '32px 40px',
            borderBottom: '1px solid #e2e8f0'
          }}>
            <h2 style={{
              fontSize: 24,
              fontWeight: 700,
              color: '#1e293b',
              margin: '0 0 8px 0'
            }}>Content Details</h2>
            <p style={{
              color: '#64748b',
              fontSize: 16,
              margin: 0
            }}>Tell us about the content you want to create</p>
          </div>
        
          {/* Form Content */}
          <form onSubmit={handleSubmit} style={{ padding: '40px' }}>
            <div style={{ display: 'grid', gap: '32px' }}>
              {/* Content Description Section */}
              <div style={{
                background: '#f8fafc',
                padding: '24px',
                borderRadius: 12,
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 16 }}>
                  <span style={{ fontSize: '20px' }}>📝</span>
                  <label style={{ 
                    fontWeight: 700, 
                    color: '#1e293b', 
                    fontSize: 18
                  }}>Content Description</label>
                </div>
                <p style={{
                  color: '#64748b',
                  fontSize: 14,
                  margin: '0 0 16px 0'
                }}>Describe what you want your content to be about. Be specific about your goals and target message.</p>
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="Example: A social media post about our new eco-friendly product line targeting environmentally conscious millennials..."
                  rows={5}
                  style={{ 
                    width: '100%', 
                    minHeight: 120, 
                    padding: '16px 20px', 
                    borderRadius: 12, 
                    border: '2px solid #e2e8f0', 
                    fontSize: 15, 
                    background: '#ffffff', 
                    resize: 'vertical', 
                    outline: 'none', 
                    boxSizing: 'border-box',
                    fontFamily: 'inherit',
                    lineHeight: 1.6,
                    transition: 'all 0.2s ease'
                  }}
                  onFocus={e => {
                    e.target.style.borderColor = '#3b82f6';
                    e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                  }}
                  onBlur={e => {
                    e.target.style.borderColor = '#e2e8f0';
                    e.target.style.boxShadow = 'none';
                  }}
                  required
                />
              </div>
        
              {/* Generation Settings */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '24px'
              }}>
                {/* Number of Contents */}
                <div style={{
                  background: '#f8fafc',
                  padding: '24px',
                  borderRadius: 12,
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 16 }}>
                    <span style={{ fontSize: '20px' }}>🔢</span>
                    <label htmlFor="numContents" style={{ 
                      fontWeight: 700, 
                      color: '#1e293b', 
                      fontSize: 16
                    }}>Number of Variations</label>
                  </div>
                  <p style={{
                    color: '#64748b',
                    fontSize: 14,
                    margin: '0 0 16px 0'
                  }}>How many different versions would you like?</p>
                  <input
                    type="number"
                    id="numContents"
                    min={1}
                    max={5}
                    value={numContentsTouched ? numContents : 1}
                    onFocus={(e) => {
                      if (!numContentsTouched && numContents === 1) {
                        setNumContents("");
                      }
                      setNumContentsTouched(true);
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={e => {
                      if (e.target.value === '' || isNaN(Number(e.target.value))) {
                        setNumContents(1);
                        setNumContentsTouched(false);
                      }
                      e.target.style.borderColor = '#e2e8f0';
                      e.target.style.boxShadow = 'none';
                    }}
                    onChange={e => {
                      const val = e.target.value;
                      if (val === '' || isNaN(Number(val))) {
                        setNumContents("");
                      } else {
                        setNumContents(Math.max(1, Math.min(5, Number(val))));
                      }
                    }}
                    style={{ 
                      width: '100%', 
                      padding: '16px 20px', 
                      borderRadius: 12, 
                      border: '2px solid #e2e8f0', 
                      fontSize: 15, 
                      background: '#ffffff', 
                      outline: 'none',
                      fontFamily: 'inherit',
                      transition: 'all 0.2s ease'
                    }}
                    required
                  />
                </div>

                {/* Content Type Info */}
                <div style={{
                  background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)',
                  padding: '24px',
                  borderRadius: 12,
                  border: '1px solid #93c5fd'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 16 }}>
                    <span style={{ fontSize: '20px' }}>✨</span>
                    <h3 style={{ 
                      fontWeight: 700, 
                      color: '#1e40af', 
                      fontSize: 16,
                      margin: 0
                    }}>What You'll Get</h3>
                  </div>
                  <ul style={{
                    color: '#1e40af',
                    fontSize: 14,
                    margin: 0,
                    paddingLeft: 20,
                    lineHeight: 1.6
                  }}>
                    <li>📰 Engaging Headlines</li>
                    <li>📝 Compelling Captions</li>
                    <li>🏷️ Relevant Hashtags</li>
                    <li>🎯 Optimized for Engagement</li>
                  </ul>
                </div>
              </div>
        
              {/* Generate Button */}
              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <button 
                  type="submit" 
                  disabled={!input.trim() || loading} 
                  style={{ 
                    ...componentStyles.button,
                    ...(!input.trim() || loading 
                      ? { background: 'linear-gradient(135deg, #9ca3af 0%, #6b7280 100%)', cursor: 'not-allowed', boxShadow: '0 4px 12px rgba(156, 163, 175, 0.3)' }
                      : componentStyles.buttonPrimary),
                    padding: '20px 48px',
                    fontSize: '16px',
                    minWidth: '200px'
                  }}
                  onMouseEnter={e => {
                    if (input.trim() && !loading) {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 15px 35px rgba(59, 130, 246, 0.5)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (input.trim() && !loading) {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 10px 25px rgba(59, 130, 246, 0.4)';
                    }
                  }}
                >
                  {loading ? (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <span style={{ 
                        width: '18px', 
                        height: '18px', 
                        border: '2px solid #ffffff', 
                        borderTop: '2px solid transparent', 
                        borderRadius: '50%', 
                        animation: 'spin 1s linear infinite' 
                      }} />
                      Generating Content...
                    </span>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
                      <span style={{fontSize: '20px'}}>🚀</span>
                      Generate Content
                    </span>
                  )}
                </button>
              </div>
            </div>
        
            {error && (
              <div style={{ 
                color: '#dc2626', 
                marginTop: 24, 
                fontWeight: 500, 
                textAlign: 'center',
                padding: '16px 24px',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: 12,
                fontSize: 14,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <span>❌</span>
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
} 