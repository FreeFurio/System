import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';

export default function FinalizedDesign() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { designData, taskId: stateTaskId } = location.state || {};
  
  const urlTaskId = searchParams.get('taskId');
  const taskId = stateTaskId || urlTaskId;
  
  const [submitting, setSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (taskId) {
      fetchWorkflow();
    }
  }, [taskId]);

  const fetchWorkflow = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/graphicdesigner`);
      const data = await response.json();
      
      if (data.status === 'success' && Array.isArray(data.data)) {
        const foundWorkflow = data.data.find(w => w.id === taskId);
        if (foundWorkflow) {
          setWorkflow(foundWorkflow);
        }
      }
    } catch (error) {
      console.error('Error fetching workflow:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!taskId) {
      alert('No task selected. Please go back and select a task first.');
      return;
    }
    
    setSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${taskId}/submit-design`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designUrl: designData?.designUrl || workflow?.graphicDesigner?.designUrl,
          description: `Design created for task ${taskId}`
        })
      });
      
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/graphic/ongoing-approval');
        }, 2000);
      } else {
        throw new Error(data.message || 'Failed to submit design');
      }
    } catch (error) {
      alert('Error submitting design: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading design...</div>
      </div>
    );
  }

  if (showSuccess) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
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
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            fontSize: '32px'
          }}>
            🎨
          </div>
          
          <h2 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#1e293b',
            margin: '0 0 16px 0'
          }}>Design Submitted!</h2>
          
          <p style={{
            color: '#475569',
            fontSize: '20px',
            margin: '0 0 24px 0',
            lineHeight: 1.6,
            fontWeight: '600'
          }}>Your design has been successfully submitted for approval.</p>
        </div>
      </div>
    );
  }

  const designUrl = designData?.designUrl || workflow?.graphicDesigner?.designUrl;

  return (
    <div style={{ 
      padding: '20px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      minHeight: '100vh',
      background: '#f8f9fa'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
            🎨 Design Created Successfully!
          </h1>
          <p style={{ 
            color: '#64748b', 
            fontSize: '18px', 
            margin: '0 0 8px 0', 
            fontWeight: 500 
          }}>
            Review your design and submit it for approval
          </p>
        </div>

        <div style={{
          background: '#fff',
          borderRadius: '16px',
          padding: '48px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          border: '2px solid #e5e7eb',
          marginBottom: '24px'
        }}>
          <h3 style={{ 
            fontSize: '24px', 
            fontWeight: 700, 
            color: '#1f2937', 
            margin: '0 0 24px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🖼️ Final Design Preview
          </h3>
          
          {designUrl ? (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '32px'
            }}>
              <img 
                src={designUrl} 
                alt="Final Design" 
                crossOrigin="anonymous"
                referrerPolicy="no-referrer"
                style={{
                  maxWidth: '100%',
                  maxHeight: '600px',
                  borderRadius: '12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
                  border: '1px solid #e5e7eb'
                }}
              />

            </div>
          ) : (
            <div style={{
              padding: '60px',
              textAlign: 'center',
              background: '#f8fafc',
              borderRadius: '12px',
              border: '2px dashed #d1d5db',
              marginBottom: '32px'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎨</div>
              <p style={{ color: '#6b7280', fontSize: '16px' }}>No design found</p>
            </div>
          )}

          {workflow && (
            <div style={{
              background: '#f8fafc',
              padding: '20px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              marginBottom: '32px'
            }}>
              <h4 style={{ 
                fontSize: '18px', 
                fontWeight: 600, 
                color: '#374151', 
                margin: '0 0 16px 0' 
              }}>
                📋 Task Information
              </h4>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px'
              }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>Objectives</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{workflow.objectives}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>Target Gender</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{workflow.gender}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '4px' }}>Age Range</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{workflow.minAge}-{workflow.maxAge} years</div>
                </div>
              </div>
            </div>
          )}

          <div style={{ 
            display: 'flex', 
            gap: '16px', 
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={() => navigate('/graphic/task')}
              style={{
                background: '#6b7280',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 24px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              ← Back to Tasks
            </button>
            
            <button
              onClick={handleSubmitForApproval}
              disabled={submitting || !designUrl}
              style={{
                background: (submitting || !designUrl) ? '#9ca3af' : 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '12px 32px',
                fontWeight: 700,
                cursor: (submitting || !designUrl) ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                boxShadow: (submitting || !designUrl) ? 'none' : '0 4px 12px rgba(139, 92, 246, 0.3)'
              }}
            >
              {submitting ? 'Submitting...' : '🚀 Submit for Approval'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}