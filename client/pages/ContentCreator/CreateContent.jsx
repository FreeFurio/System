import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setGeneratedContents } from '../../store/slices/contentSlice';
import { createContent } from '../../services/contentService';
import { FiEdit3, FiZap, FiTarget, FiRefreshCw, FiUser, FiCalendar, FiClock, FiSmartphone, FiClipboard } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import PlatformDisplay from '../../components/common/PlatformDisplay';

const TaskDetailsSidebar = ({ task }) => {
  if (!task) {
    return (
      <div style={{
        width: '320px',
        background: '#f8f9fa',
        borderRadius: '16px',
        padding: '24px',
        border: '1px solid #e5e7eb',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#6b7280'
      }}>
        No task selected
      </div>
    );
  }

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
      width: '320px',
      background: '#fff',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      height: 'fit-content'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '20px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px'
        }}>
          <FiTarget size={18} color="#fff" />
        </div>
        <div>
          <h3 style={{
            margin: 0,
            fontSize: '16px',
            fontWeight: '700',
            color: '#1f2937'
          }}>Task Details</h3>
          <p style={{
            margin: 0,
            fontSize: '12px',
            color: '#6b7280'
          }}>Reference information</p>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '13px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <FiTarget size={12} color="#3b82f6" /> Objectives
        </div>
        <div style={{
          fontSize: '14px',
          color: '#1f2937',
          lineHeight: '1.5',
          background: '#f8f9fa',
          padding: '12px',
          borderRadius: '8px',
          border: '1px solid #e5e7eb'
        }}>
          {task.objectives}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gap: '16px',
        marginBottom: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiUser size={14} color="#3b82f6" />
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '2px' }}>Target Gender</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{task.gender}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCalendar size={14} color="#10b981" />
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '2px' }}>Age Range</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{task.minAge}-{task.maxAge} years</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiClock size={14} color="#ef4444" />
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '2px' }}>Deadline</div>
            <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151' }}>{formatDate(task.deadline)}</div>
          </div>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiSmartphone size={14} color="#8b5cf6" />
          <div>
            <div style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '2px' }}>Platforms</div>
            <PlatformDisplay platforms={task.selectedPlatforms || []} size="small" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default function CreateContent() {
  const dispatch = useDispatch();
  const [input, setInput] = useState('');
  const [numContents, setNumContents] = useState(3);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');
  const workflowId = searchParams.get('workflowId');
  const navigate = useNavigate();



  useEffect(() => {
    const id = workflowId || taskId;
    if (id) {
      // Fetch from both content creator and marketing lead stages
      Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/contentcreator`),
        fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/marketinglead`)
      ])
        .then(responses => Promise.all(responses.map(res => res.json())))
        .then(([contentData, marketingData]) => {
          let workflow = null;
          if (contentData.status === 'success') {
            workflow = contentData.data.find(w => w.id === id);
          }
          if (!workflow && marketingData.status === 'success') {
            workflow = marketingData.data.find(w => w.id === id);
          }
          if (workflow) {
            setSelectedTask(workflow);
          }
        })
        .catch(err => console.error('Error fetching workflow:', err));
    }
  }, [taskId, workflowId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setProgress(0);
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 90) return prev; // Stop at 90% until actual completion
        return prev + Math.random() * 15; // Random increments
      });
    }, 500);
    
    try {
      const finalId = workflowId || taskId;
      const res = await createContent({ input, numContents, taskId: finalId });
      
      // Complete progress
      clearInterval(progressInterval);
      setProgress(100);
      
      // Small delay to show 100% completion
      setTimeout(() => {
        if (res.success) {
          const finalTaskId = res.taskId || finalId;
          dispatch(setGeneratedContents({
            contents: res.contents,
            taskId: finalTaskId,
            workflowId: finalId,
            fromDraftEdit: false
          }));
          navigate('/content/output');
        } else {
          setError('Failed to create content.');
        }
      }, 500);
    } catch (err) {
      clearInterval(progressInterval);
      setError('An error occurred.');
    } finally {
      setTimeout(() => {
        setLoading(false);
        setProgress(0);
      }, 500);
    }
  };



  // Show task selection prompt if no task is selected
  if (!taskId && !workflowId) {
    return (
      <div style={{
        minHeight: 'calc(100vh - 200px)',
        padding: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '48px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '1px solid #e5e7eb',
          textAlign: 'center',
          maxWidth: '500px'
        }}>
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>📝</div>
          <h2 style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#1f2937',
            margin: '0 0 16px 0'
          }}>Pick a Task First</h2>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: '0 0 32px 0',
            lineHeight: '1.5'
          }}>You need to select a task before you can create content. Go to the Task page to choose an assigned task.</p>
          <button
            onClick={() => navigate('/content/task')}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              margin: '0 auto'
            }}
          >
            <FiClipboard size={16} />
            Go to Tasks
          </button>
        </div>
      </div>
    );
  }

  // Loading overlay component
  if (loading) {
    return (
      <div style={{ 
        minHeight: 'calc(100vh - 200px)',
        padding: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{
          width: '100%',
          maxWidth: '1200px',
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '60px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
        }}>
        <div style={{
          textAlign: 'center',
          color: '#1f2937',
          maxWidth: '600px',
          padding: '40px'
        }}>
          {/* Main AI Icon with Animation */}
          <div style={{
            fontSize: '80px',
            marginBottom: '32px',
            animation: 'pulse 2s ease-in-out infinite',
            display: 'flex',
            justifyContent: 'center'
          }}>
            <FiZap size={80} color="#6b7280" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} />
          </div>
          
          {/* Title */}
          <h1 style={{
            fontSize: '36px',
            fontWeight: '800',
            margin: '0 0 16px 0',
            textShadow: '0 2px 4px rgba(0,0,0,0.3)'
          }}>AI is Creating Your Content</h1>
          
          {/* Subtitle */}
          <p style={{
            fontSize: '18px',
            margin: '0 0 40px 0',
            opacity: 0.9,
            lineHeight: '1.6'
          }}>Generating {numContents} unique variations for each platform...</p>
          
          {/* Progress Steps */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginBottom: '40px',
            flexWrap: 'wrap'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.2)',
              padding: '12px 20px',
              borderRadius: '25px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#4ade80',
                animation: 'blink 1.5s ease-in-out infinite'
              }}></div>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Analyzing Brief</span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.2)',
              padding: '12px 20px',
              borderRadius: '25px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#60a5fa',
                animation: 'blink 1.5s ease-in-out infinite 0.5s'
              }}></div>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Creating Headlines</span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.2)',
              padding: '12px 20px',
              borderRadius: '25px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#f59e0b',
                animation: 'blink 1.5s ease-in-out infinite 1s'
              }}></div>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Generating Content</span>
            </div>
            
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(255,255,255,0.2)',
              padding: '12px 20px',
              borderRadius: '25px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#ec4899',
                animation: 'blink 1.5s ease-in-out infinite 1.5s'
              }}></div>
              <span style={{ fontSize: '14px', fontWeight: '600' }}>Adding Hashtags</span>
            </div>
          </div>
          
          {/* Platform Icons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '20px',
            marginBottom: '40px'
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'float 3s ease-in-out infinite'
            }}>
              <FaFacebook size={24} color="#6b7280" />
            </div>
            
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'float 3s ease-in-out infinite 0.5s'
            }}>
              <FaInstagram size={24} color="#6b7280" />
            </div>
            
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#f9fafb',
              border: '1px solid #e5e7eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'float 3s ease-in-out infinite 1s'
            }}>
              <FaTwitter size={24} color="#6b7280" />
            </div>
          </div>
          
          {/* Progress Bar */}
          <div style={{
            width: '100%',
            height: '4px',
            background: '#f3f4f6',
            borderRadius: '2px',
            overflow: 'hidden',
            marginBottom: '16px'
          }}>
            <div style={{
              height: '100%',
              width: `${progress}%`,
              background: '#6b7280',
              borderRadius: '2px',
              transition: 'width 0.3s ease'
            }}></div>
          </div>
          
          {/* Progress Percentage */}
          <div style={{
            fontSize: '14px',
            fontWeight: '500',
            color: '#6b7280',
            marginBottom: '24px'
          }}>
            {Math.round(progress)}% Complete
          </div>
          
          {/* Fun Fact */}
          <p style={{
            fontSize: '14px',
            opacity: 0.8,
            fontStyle: 'italic',
            margin: 0
          }}>💡 Did you know? Our AI analyzes thousands of successful posts to create engaging content!</p>
        </div>
        
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-10px); }
          }
          

        `}</style>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: 'calc(100vh - 200px)',
      padding: '32px',
      display: 'flex',
      gap: '32px',
      alignItems: 'flex-start',
      justifyContent: 'center'
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        border: '1px solid #e5e7eb',
        width: '100%',
        maxWidth: '600px'
      }}>
        <div style={{ marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <FiEdit3 size={28} color="#3b82f6" />
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1f2937',
              margin: 0
            }}>Create Content</h1>
          </div>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: 0
          }}>Generate AI-powered content for your marketing campaigns</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151',
              marginBottom: '8px'
            }}>Content Brief</label>
            <textarea
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Describe your content idea... (e.g., A post about our new product launch targeting young professionals)"
              style={{
                width: '100%',
                height: '120px',
                padding: '16px',
                borderRadius: '12px',
                border: '2px solid #e5e7eb',
                fontSize: '15px',
                background: '#fafbfc',
                resize: 'none',
                outline: 'none',
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                lineHeight: 1.6,
                transition: 'all 0.2s ease'
              }}
              onFocus={e => {
                e.target.style.borderColor = '#3b82f6';
                e.target.style.background = '#fff';
              }}
              onBlur={e => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.background = '#fafbfc';
              }}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>Variations</label>
              <input
                type="number"
                min={1}
                max={5}
                value={numContents}
                onChange={e => setNumContents(Math.max(1, Math.min(5, Number(e.target.value))))}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  border: '2px solid #e5e7eb',
                  fontSize: '15px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  background: '#fafbfc'
                }}
                required
              />
            </div>
            <div style={{
              background: '#f0f9ff',
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #bae6fd',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <FiTarget size={20} color="#0369a1" />
              <div>
                <div style={{ fontSize: '13px', fontWeight: '600', color: '#0369a1', marginBottom: '2px' }}>
                  AI will generate:
                </div>
                <div style={{ fontSize: '12px', color: '#0369a1' }}>
                  Headlines • Content • Hashtags
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              width: '100%',
              padding: '16px',
              background: (!input.trim() || loading) ? '#9ca3af' : '#3b82f6',
              color: '#ffffff',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={e => {
              if (!loading && input.trim()) {
                e.target.style.background = '#2563eb';
              }
            }}
            onMouseLeave={e => {
              if (!loading && input.trim()) {
                e.target.style.background = '#3b82f6';
              }
            }}
          >
            {loading ? (
              <>
                <FiRefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Generating...
              </>
            ) : (
              <>
                <FiZap size={16} />
                Generate Content
              </>
            )}
          </button>

          {error && (
            <div style={{
              padding: '12px 16px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              borderRadius: '12px',
              color: '#dc2626',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}
        </form>
      </div>
      
      <TaskDetailsSidebar task={selectedTask} />
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>

  );
}