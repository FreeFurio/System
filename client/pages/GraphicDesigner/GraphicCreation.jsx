import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ImageEditorWrapper from '../../components/ImageEditor/ImageEditorWrapper';

export default function GraphicCreation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const taskId = searchParams.get('taskId');
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [designData, setDesignData] = useState(null);
  const [fetchError, setFetchError] = useState('');
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    if (taskId) {
      fetchWorkflow();
    }
  }, [taskId]);

  const fetchWorkflow = async () => {
    setIsLoading(true);
    try {
      console.log('🎨 Fetching workflow with taskId:', taskId);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/graphicdesigner`, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      if (response.status === 304) {
        // Handle cached response - try to get fresh data
        const freshResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/graphicdesigner?t=${Date.now()}`);
        if (!freshResponse.ok) throw new Error(`HTTP error! status: ${freshResponse.status}`);
        const data = await freshResponse.json();
        handleWorkflowData(data);
        return;
      }
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      handleWorkflowData(data);
    } catch (error) {
      console.error('🎨 Fetch error:', error);
      setFetchError(`Failed to load task data: ${error.message}`);
      setIsLoading(false);
    }
  };

  const handleWorkflowData = async (data) => {
    try {
      console.log('🎨 API Response:', data);
      
      if (data.status === 'success' && Array.isArray(data.data)) {
        const foundWorkflow = data.data.find(w => w.id === taskId);
        console.log('🎨 Found workflow:', foundWorkflow);
        
        if (foundWorkflow) {
          setWorkflow(foundWorkflow);
          setIsLoading(false);
        } else {
          // Try fetching from all workflows if not found in graphic designer stage
          const allResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows?t=${Date.now()}`);
          const allData = await allResponse.json();
          console.log('🎨 All workflows response:', allData);
          
          if (allData.status === 'success' && Array.isArray(allData.data)) {
            const allFoundWorkflow = allData.data.find(w => w.id === taskId);
            if (allFoundWorkflow) {
              setWorkflow(allFoundWorkflow);
              setIsLoading(false);
            } else {
              setFetchError(`Task with ID ${taskId} not found`);
              setIsLoading(false);
            }
          } else {
            setFetchError(`Task with ID ${taskId} not found`);
            setIsLoading(false);
          }
        }
      } else {
        setFetchError('API returned invalid data structure');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('🎨 Handle workflow data error:', error);
      setFetchError(`Failed to process task data: ${error.message}`);
      setIsLoading(false);
    }
  };



  const handleDesignSave = (designData) => {
    setDesignData(designData);
    console.log('🎨 Design saved:', designData);
  };

  const handleDesignExport = async (imageData) => {
    if (!imageData) {
      setError('No design data to export');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(imageData);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('design', blob, 'design.png');
      formData.append('description', `Design created for task ${taskId}`);

      const submitResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${taskId}/submit-design`, {
        method: 'POST',
        body: formData
      });

      const result = await submitResponse.json();
      if (result.status === 'success') {
        setSuccess(true);
        setTimeout(() => navigate('/graphic/task'), 1500);
      } else {
        setError('Failed to submit design');
      }
    } catch (error) {
      setError('Failed to submit design');
    } finally {
      setLoading(false);
    }
  };





  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>Loading task data...</div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: '#dc2626' }}>Error: {fetchError}</div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '12px',
            padding: '8px 12px',
            backdropFilter: 'blur(10px)'
          }}>
            <span style={{ fontSize: '20px' }}>🎨</span>
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px', color: 'white', fontWeight: '700' }}>Fabric.js Design Studio</h2>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Task: {workflow?.objectives || taskId || 'New Design'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {loading && (
            <div style={{ color: 'white', padding: '12px 20px', fontSize: '14px' }}>
              Submitting design...
            </div>
          )}
          {success && (
            <div style={{ color: '#10b981', padding: '12px 20px', fontSize: '14px', fontWeight: '600' }}>
              ✓ Design submitted!
            </div>
          )}
          <button onClick={() => navigate('/graphic/task')} style={{ 
            background: 'rgba(255,255,255,0.2)', 
            color: 'white', 
            border: '1px solid rgba(255,255,255,0.3)', 
            padding: '12px 20px', 
            borderRadius: '10px', 
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            backdropFilter: 'blur(10px)'
          }}>← Back to Tasks</button>
        </div>
      </div>
      
      {/* Error Display */}
      {error && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px 24px',
          fontSize: '14px',
          fontWeight: '500'
        }}>
          ❌ {error}
        </div>
      )}
      
      {/* Image Editor */}
      <div style={{ flex: 1 }}>
        <ImageEditorWrapper 
          onSave={handleDesignSave}
          onExport={handleDesignExport}
        />
      </div>
    </div>
  );
}