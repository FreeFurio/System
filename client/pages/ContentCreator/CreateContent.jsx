import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { createContent } from '../../services/contentService';

export default function CreateContent() {
  const [input, setInput] = useState('');
  const [numContents, setNumContents] = useState(1);
  const [numContentsTouched, setNumContentsTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
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
    try {
      const res = await createContent({ input, numContents, taskId });
      if (res.success) {
        setLoading(false);
        // Ensure taskId is passed, use the one from response or URL
        const finalTaskId = res.taskId || taskId;
        console.log('🔍 Debug - Navigating with taskId:', finalTaskId);
        
        // Pass taskId both in state and URL for redundancy
        const outputUrl = finalTaskId ? `/content/output?taskId=${finalTaskId}` : '/content/output';
        navigate(outputUrl, { state: { contents: res.contents, taskId: finalTaskId } });
      } else {
        setError('Failed to create content.');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred.');
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #ffffff 0%, #fef7ed 100%)', 
      padding: '40px 20px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: 580,
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: 24,
        boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.15), 0 0 0 1px rgba(251, 191, 36, 0.1)',
        padding: '48px 40px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(251, 191, 36, 0.2)'
      }}>
        {/* Decorative gradient overlay */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #ef4444, #fbbf24, #ef4444, #fbbf24)',
          borderRadius: '24px 24px 0 0'
        }} />
        
        <div style={{textAlign: 'center', marginBottom: 32}}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: '#ef4444',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: 14,
            borderRadius: 20,
            padding: '8px 20px',
            marginBottom: 16,
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)'
          }}>
            <span style={{fontSize: '16px'}}>🤖</span>
            AI Content Producer
          </div>
          <h1 style={{
            fontWeight: 800,
            fontSize: 36,
            color: '#ef4444',
            margin: 0,
            letterSpacing: '-0.8px'
          }}>Create Content</h1>
          <p style={{
            color: '#6b7280',
            fontSize: 17,
            margin: '8px 0 0 0',
            fontWeight: 500
          }}>What's your content all about?</p>
          <p style={{
            color: '#9ca3af',
            fontSize: 15,
            margin: '4px 0 0 0',
            fontWeight: 400
          }}>Describe your idea and we'll generate a headline, content, and hashtags for you.</p>
        </div>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div style={{ position: 'relative' }}>
          <label style={{ 
            fontWeight: 700, 
            display: 'block', 
            marginBottom: 12, 
            color: '#1f2937', 
            fontSize: 16,
            letterSpacing: '0.3px'
          }}>Content Description</label>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder=""
            rows={4}
            style={{ 
              width: '100%', 
              minHeight: 100, 
              maxHeight: 200, 
              padding: '16px 20px', 
              borderRadius: 16, 
              border: '2px solid #e5e7eb', 
              fontSize: 15, 
              background: '#fafbfc', 
              resize: 'none', 
              outline: 'none', 
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              lineHeight: 1.6,
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
            onFocus={e => {
              e.target.style.borderColor = '#fbbf24';
              e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
            onBlur={e => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
            required
          />
        </div>
        
        {/* Number of Contents */}
        <div>
          <label htmlFor="numContents" style={{ 
            fontWeight: 700, 
            display: 'block', 
            marginBottom: 12, 
            color: '#1f2937', 
            fontSize: 16,
            letterSpacing: '0.3px'
          }}>Number of Contents</label>
          <input
            type="number"
            id="numContents"
            min={1}
            value={numContentsTouched ? numContents : 1}
            onFocus={(e) => {
              if (!numContentsTouched && numContents === 1) {
                setNumContents("");
              }
              setNumContentsTouched(true);
              e.target.style.borderColor = '#fbbf24';
              e.target.style.boxShadow = '0 0 0 3px rgba(251, 191, 36, 0.1), 0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
            onBlur={e => {
              if (e.target.value === '' || isNaN(Number(e.target.value))) {
                setNumContents(1);
                setNumContentsTouched(false);
              }
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.boxShadow = '0 1px 3px rgba(0, 0, 0, 0.1)';
            }}
            onChange={e => {
              const val = e.target.value;
              if (val === '' || isNaN(Number(val))) {
                setNumContents("");
              } else {
                setNumContents(Math.max(1, Number(val)));
              }
            }}
            style={{ 
              width: '100%', 
              padding: '16px 20px', 
              borderRadius: 16, 
              border: '2px solid #e5e7eb', 
              fontSize: 15, 
              background: '#fafbfc', 
              outline: 'none',
              fontFamily: 'inherit',
              transition: 'all 0.2s ease',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}
            required
          />
        </div>
        
        <button 
          type="submit" 
          disabled={!input.trim() || loading} 
          style={{ 
            marginTop: 24, 
            background: (!input.trim() || loading) ? '#9ca3af' : '#ef4444', 
            color: '#ffffff', 
            border: 'none', 
            borderRadius: 16, 
            padding: '18px 32px', 
            fontWeight: 600, 
            fontSize: 17, 
            cursor: (!input.trim() || loading) ? 'not-allowed' : 'pointer', 
            letterSpacing: '0.8px', 
            boxShadow: (!input.trim() || loading) 
              ? '0 4px 12px rgba(156, 163, 175, 0.4)' 
              : '0 8px 25px rgba(239, 68, 68, 0.4)', 
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            textTransform: 'uppercase',
            fontFamily: 'inherit'
          }}
          onMouseEnter={e => {
            if (input.trim() && !loading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 12px 35px rgba(239, 68, 68, 0.5)';
            }
          }}
          onMouseLeave={e => {
            if (input.trim() && !loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.4)';
            }
          }}
        >
          {loading ? (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid #ffffff', 
                borderTop: '2px solid transparent', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }} />
              Generating...
            </span>
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <span style={{fontSize: '18px'}}>🤖</span>
              Generate
            </span>
          )}
        </button>
        
        {error && (
          <div style={{ 
            color: '#ef4444', 
            marginTop: 16, 
            fontWeight: 500, 
            textAlign: 'center',
            padding: '12px 20px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: 12,
            fontSize: 14
          }}>
            ❌ {error}
          </div>
        )}
      </form>
      </div>
    </div>
  );
} 