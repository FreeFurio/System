import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function SetTaskGraphicDesigner() {
  const [searchParams] = useSearchParams();
  const workflowId = searchParams.get('workflowId');
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (workflowId) {
      fetchWorkflow();
    }
  }, [workflowId]);

  const fetchWorkflow = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/marketinglead`);
      const data = await response.json();
      if (data.status === 'success') {
        const foundWorkflow = data.data.find(w => w.id === workflowId && w.status === 'ready_for_design_assignment');
        setWorkflow(foundWorkflow);
      }
    } catch (error) {
      console.error('Error fetching workflow:', error);
      setError('Failed to load workflow data');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleSetTask = async () => {
    if (!workflowId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${workflowId}/assign-to-graphic-designer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      if (data.status === 'success') {
        setSubmitted(true);
      } else {
        setError('Failed to assign task');
      }
    } catch (error) {
      setError('Failed to assign task');
    } finally {
      setLoading(false);
    }
  };

  if (!workflow) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Loading workflow data...</h2>
      </div>
    );
  }

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
            <span style={{fontSize: '16px'}}>🎨</span>
            Graphic Designer
          </div>
          <h1 style={{
            fontWeight: 800,
            fontSize: 36,
            color: '#ef4444',
            margin: 0,
            letterSpacing: '-0.8px'
          }}>Set Task</h1>
          <p style={{
            color: '#6b7280',
            fontSize: 17,
            margin: '8px 0 0 0',
            fontWeight: 500
          }}>Create and assign design tasks with precision</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          {/* Approved Content Display */}
          <div style={{ 
            padding: '20px', 
            background: '#d4edda', 
            borderRadius: 16, 
            border: '2px solid #c3e6cb'
          }}>
            <h3 style={{ 
              margin: '0 0 16px 0', 
              color: '#155724', 
              fontSize: 18,
              fontWeight: 700
            }}>✅ Approved Content for Design</h3>
            
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#155724' }}>Headline:</strong>
              <div style={{ 
                marginTop: '4px', 
                padding: '12px', 
                background: '#ffffff', 
                borderRadius: 8,
                fontSize: 15
              }}>
                {workflow.contentCreator?.content?.headline}
              </div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#155724' }}>Caption:</strong>
              <div style={{ 
                marginTop: '4px', 
                padding: '12px', 
                background: '#ffffff', 
                borderRadius: 8,
                fontSize: 15
              }}>
                {workflow.contentCreator?.content?.caption}
              </div>
            </div>
            
            <div style={{ marginBottom: '12px' }}>
              <strong style={{ color: '#155724' }}>Hashtags:</strong>
              <div style={{ 
                marginTop: '4px', 
                padding: '12px', 
                background: '#ffffff', 
                borderRadius: 8,
                fontSize: 15
              }}>
                {workflow.contentCreator?.content?.hashtag}
              </div>
            </div>
          </div>
          
          {/* Posting Date */}
          <div>
            <label style={{ 
              fontWeight: 700, 
              display: 'block', 
              marginBottom: 12, 
              color: '#1f2937', 
              fontSize: 16,
              letterSpacing: '0.3px'
            }}>Posting Date</label>
            <div style={{ 
              padding: '16px 20px', 
              borderRadius: 16, 
              border: '2px solid #e5e7eb', 
              fontSize: 15, 
              background: '#f9fafb', 
              color: '#6b7280'
            }}>
              {formatDate(workflow.deadline)}
            </div>
          </div>
        
          <button 
            onClick={handleSetTask}
            disabled={loading || submitted} 
            style={{ 
              marginTop: 24, 
              background: (loading || submitted) ? '#9ca3af' : '#ef4444', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: 16, 
              padding: '18px 32px', 
              fontWeight: 600, 
              fontSize: 17, 
              cursor: (loading || submitted) ? 'not-allowed' : 'pointer', 
              letterSpacing: '0.8px', 
              boxShadow: (loading || submitted) 
                ? '0 4px 12px rgba(156, 163, 175, 0.4)' 
                : '0 8px 25px rgba(239, 68, 68, 0.4)', 
              transition: 'all 0.3s ease',
              textTransform: 'uppercase',
              fontFamily: 'inherit'
            }}
          >
            {loading ? 'Assigning Task...' : submitted ? 'Task Assigned!' : 'Set Task for Graphic Designer'}
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
        
        {submitted && (
          <div style={{ 
            color: '#059669', 
            marginTop: 16, 
            fontWeight: 500, 
            textAlign: 'center',
            padding: '12px 20px',
            background: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: 12,
            fontSize: 14
          }}>
            ✅ Task submitted successfully!
          </div>
        )}
        </div>
      </div>
    </div>
  );
} 