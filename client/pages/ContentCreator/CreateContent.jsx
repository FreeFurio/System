import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createContent } from '../../services/contentService';
import { FiEdit3, FiZap, FiTarget, FiRefreshCw, FiUser, FiCalendar, FiClock, FiSmartphone } from 'react-icons/fi';
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
  const [input, setInput] = useState('');
  const [numContents, setNumContents] = useState(3);
  const [loading, setLoading] = useState(false);
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
    
    try {
      const finalId = workflowId || taskId;
      const res = await createContent({ input, numContents, taskId: finalId });
      if (res.success) {
        const finalTaskId = res.taskId || finalId;
        const outputUrl = finalTaskId ? `/content/output?taskId=${finalTaskId}` : '/content/output';
        navigate(outputUrl, { state: { contents: res.contents, taskId: finalTaskId } });
      } else {
        setError('Failed to create content.');
      }
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setLoading(false);
    }
  };



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
                  Headlines • Captions • Hashtags
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