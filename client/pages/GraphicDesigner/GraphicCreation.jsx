import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import ImageEditorWrapper from '../../components/ImageEditor/ImageEditorWrapper';
import TemplatedEditor from '../../components/PhotopeaEditor/PhotopeaEditor';
import { FiClipboard } from 'react-icons/fi';

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
  const [selectedEditor, setSelectedEditor] = useState('original');
  const [canvasJsonData, setCanvasJsonData] = useState(null);
  
  console.log('🔄 Current selectedEditor:', selectedEditor);



  useEffect(() => {
    if (taskId) {
      fetchWorkflow();
    } else {
      setIsLoading(false);
    }

    // Handle messages from iframe
    const handleMessage = (event) => {
      if (event.data && typeof event.data === 'string') {
        if (event.data.startsWith('CANVAS_JSON:')) {
          const jsonData = event.data.replace('CANVAS_JSON:', '');
          setCanvasJsonData(jsonData);
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
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



  const handleDesignSave = async (imageData) => {
    if (!imageData) {
      setError('No design data to save');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get canvas JSON data from iframe
      const iframe = document.querySelector('iframe');
      let canvasJsonData = null;
      
      if (iframe && iframe.contentWindow) {
        const canvasDataPromise = new Promise((resolve) => {
          const handleCanvasData = (event) => {
            if (event.data && typeof event.data === 'string' && event.data.startsWith('CANVAS_JSON:')) {
              const jsonData = event.data.replace('CANVAS_JSON:', '');
              window.removeEventListener('message', handleCanvasData);
              resolve(jsonData);
            }
          };
          window.addEventListener('message', handleCanvasData);
          iframe.contentWindow.postMessage('GET_CANVAS_JSON', '*');
        });
        
        canvasJsonData = await canvasDataPromise;
      }

      // Convert image data to blob
      const response = await fetch(imageData);
      const blob = await response.blob();
      
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', blob);
      formData.append('upload_preset', 'unsigned_uploads');
      formData.append('folder', 'design-drafts');
      
      const cloudinaryResponse = await fetch(
        'https://api.cloudinary.com/v1_1/dyxayxrpp/upload',
        {
          method: 'POST',
          body: formData
        }
      );
      
      if (!cloudinaryResponse.ok) {
        throw new Error('Failed to upload to Cloudinary');
      }
      
      const cloudinaryResult = await cloudinaryResponse.json();
      
      // Save to database with Cloudinary URL
      const saveResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${taskId}/save-design-draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          designUrl: cloudinaryResult.secure_url,
          publicId: cloudinaryResult.public_id,
          canvasData: canvasJsonData,
          description: `Design draft for task ${taskId}`
        })
      });

      const result = await saveResponse.json();
      if (result.status === 'success') {
        setDesignData(result.data);
        console.log('🎨 Design draft saved successfully:', result.data);
        setSuccess(true);
        setTimeout(() => {
          navigate('/graphic/finalized-design', {
            state: { designData: result.data, taskId }
          });
        }, 1500);
      } else {
        setError('Failed to save design draft');
      }
    } catch (error) {
      setError('Failed to save design draft');
    } finally {
      setLoading(false);
    }
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

  // Show task selection prompt if no task is selected
  if (!taskId) {
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
          <div style={{ fontSize: '48px', marginBottom: '24px' }}>🎨</div>
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
          }}>You need to select a task before you can create designs. Go to the Task page to choose an assigned task.</p>
          <button
            onClick={() => navigate('/graphic/task')}
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
            🎨 Go to Tasks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
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
      

      {/* Editor Selection */}
      <div style={{ flex: 1 }}>
        {selectedEditor === 'original' ? (
          <ImageEditorWrapper 
            onSave={handleDesignSave}
            onExport={handleDesignExport}
            initialCanvasData={workflow?.graphicDesigner?.canvasData}
            onBackToTasks={() => navigate('/graphic/task')}
            taskInfo={workflow}
          />
        ) : (
          <TemplatedEditor 
            onSave={handleDesignSave}
            onExport={handleDesignExport}
          />
        )}
      </div>
    </div>
  );
}