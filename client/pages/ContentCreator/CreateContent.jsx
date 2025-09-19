import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createContent } from '../../services/contentService';
import { FiEdit3, FiZap, FiTarget, FiRefreshCw } from 'react-icons/fi';

export default function CreateContent() {
  const [input, setInput] = useState('');
  const [numContents, setNumContents] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchParams] = useSearchParams();
  const taskId = searchParams.get('taskId');
  const navigate = useNavigate();

  useEffect(() => {
    if (taskId) {
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
  }, [taskId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const res = await createContent({ input, numContents, taskId });
      if (res.success) {
        const finalTaskId = res.taskId || taskId;
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
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '32px'
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
      
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>

  );
}