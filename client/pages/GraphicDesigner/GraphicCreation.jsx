import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function GraphicCreation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const taskId = searchParams.get('taskId');
  const [workflow, setWorkflow] = useState(null);
  const [designDescription, setDesignDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const canvasRef = useRef(null);
  const [designData, setDesignData] = useState(null);
  const [fetchError, setFetchError] = useState('');
  
  // Canva-like states
  const [activeTab, setActiveTab] = useState('text');
  const [selectedElement, setSelectedElement] = useState(null);
  const [elements, setElements] = useState([]);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [zoom, setZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragMode, setDragMode] = useState('move'); // 'move', 'resize', 'rotate'
  const [initialMousePos, setInitialMousePos] = useState({ x: 0, y: 0 });
  const [initialElementState, setInitialElementState] = useState(null);
  const [hoverHandle, setHoverHandle] = useState(null);

  const getCursor = () => {
    if (isDragging) {
      if (dragMode === 'resize') return 'grabbing';
      if (dragMode === 'rotate') return 'grabbing';
      return 'grabbing';
    }
    if (hoverHandle) {
      return hoverHandle.cursor;
    }
    if (selectedElement !== null) {
      return 'move';
    }
    return 'default';
  };

  const handleMouseHover = (e) => {
    if (isDragging || selectedElement === null) return;
    
    const pos = getMousePos(e);
    const element = elements[selectedElement];
    const handle = getHandleAtPosition(pos, element);
    setHoverHandle(handle);
  };

  const fonts = ['Arial', 'Helvetica', 'Times New Roman', 'Georgia', 'Verdana', 'Comic Sans MS', 'Impact'];
  const colors = ['#000000', '#ffffff', '#ef4444', '#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899'];

  useEffect(() => {
    if (taskId) {
      fetchWorkflow();
    }
  }, [taskId]);

  const fetchWorkflow = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/graphicdesigner`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.status === 'success') {
        const foundWorkflow = data.data.find(w => w.id === taskId);
        setWorkflow(foundWorkflow);
        if (!foundWorkflow) setFetchError(`Task with ID ${taskId} not found`);
      } else {
        setFetchError('API returned error status');
      }
    } catch (error) {
      setFetchError(`Failed to load task data: ${error.message}`);
    }
  };

  const handleCreateDesign = () => {
    setShowEditor(true);
    setElements([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!designData || !designDescription.trim()) {
      setError('Please create a design and add a description');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(designData);
      const blob = await response.blob();
      const formData = new FormData();
      formData.append('design', blob, 'design.png');
      formData.append('description', designDescription);

      const submitResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${taskId}/submit-design`, {
        method: 'POST',
        body: formData
      });

      const result = await submitResponse.json();
      if (result.status === 'success') {
        setSuccess(true);
        setTimeout(() => navigate('/graphic/task'), 2000);
      } else {
        setError('Failed to submit design');
      }
    } catch (error) {
      setError('Failed to submit design');
    } finally {
      setLoading(false);
    }
  };

  const renderCanvas = () => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Render elements
    elements.forEach((element, index) => {
      ctx.save();
      
      // Apply transformations
      const centerX = element.type === 'circle' ? element.x : element.x + (element.width || 0) / 2;
      const centerY = element.type === 'circle' ? element.y : element.y + (element.height || element.fontSize || 0) / 2;
      
      ctx.translate(centerX, centerY);
      ctx.rotate((element.rotation || 0) * Math.PI / 180);
      ctx.scale(element.scaleX || 1, element.scaleY || 1);
      ctx.translate(-centerX, -centerY);
      
      if (element.type === 'text') {
        ctx.font = `${element.fontWeight || 'normal'} ${element.fontSize}px ${element.fontFamily || 'Arial'}`;
        ctx.fillStyle = element.color;
        ctx.fillText(element.content, element.x, element.y);
      } else if (element.type === 'rect') {
        ctx.fillStyle = element.color;
        ctx.fillRect(element.x, element.y, element.width, element.height);
      } else if (element.type === 'circle') {
        ctx.fillStyle = element.color;
        ctx.beginPath();
        ctx.arc(element.x, element.y, element.radius, 0, 2 * Math.PI);
        ctx.fill();
      }
      
      ctx.restore();
      
      // Selection outline and handles
      if (selectedElement === index) {
        ctx.save();
        
        // Apply same transformations as the element
        const centerX = element.type === 'circle' ? element.x : element.x + (element.width || 0) / 2;
        const centerY = element.type === 'circle' ? element.y : element.y + (element.height || element.fontSize || 0) / 2;
        
        ctx.translate(centerX, centerY);
        ctx.rotate((element.rotation || 0) * Math.PI / 180);
        ctx.translate(-centerX, -centerY);
        
        ctx.strokeStyle = '#3b82f6';
        ctx.fillStyle = '#3b82f6';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);
        
        let bounds;
        if (element.type === 'text') {
          ctx.font = `${element.fontWeight || 'normal'} ${element.fontSize}px ${element.fontFamily || 'Arial'}`;
          const metrics = ctx.measureText(element.content);
          bounds = { x: element.x - 5, y: element.y - element.fontSize - 5, width: metrics.width + 10, height: element.fontSize + 10 };
        } else if (element.type === 'rect') {
          bounds = { x: element.x - 5, y: element.y - 5, width: element.width + 10, height: element.height + 10 };
        } else if (element.type === 'circle') {
          bounds = { x: element.x - element.radius - 5, y: element.y - element.radius - 5, width: (element.radius + 5) * 2, height: (element.radius + 5) * 2 };
        }
        
        // Selection rectangle
        ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        ctx.setLineDash([]);
        
        // Resize handles (corners)
        const handleSize = 10;
        const handles = [
          { x: bounds.x, y: bounds.y, cursor: 'nw-resize' }, // top-left
          { x: bounds.x + bounds.width, y: bounds.y, cursor: 'ne-resize' }, // top-right
          { x: bounds.x + bounds.width, y: bounds.y + bounds.height, cursor: 'se-resize' }, // bottom-right
          { x: bounds.x, y: bounds.y + bounds.height, cursor: 'sw-resize' } // bottom-left
        ];
        
        handles.forEach(handle => {
          ctx.fillRect(handle.x - handleSize/2, handle.y - handleSize/2, handleSize, handleSize);
        });
        
        // Rotation handle (top center)
        const rotateHandle = { x: bounds.x + bounds.width/2, y: bounds.y - 20 };
        ctx.beginPath();
        ctx.arc(rotateHandle.x, rotateHandle.y, 8, 0, 2 * Math.PI);
        ctx.fill();
        
        // Line from element to rotation handle
        ctx.beginPath();
        ctx.moveTo(bounds.x + bounds.width/2, bounds.y);
        ctx.lineTo(rotateHandle.x, rotateHandle.y);
        ctx.stroke();
        
        ctx.restore();
      }
    });
  };

  useEffect(() => {
    renderCanvas();
  }, [elements, selectedElement]);

  const saveDesign = () => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL('image/png');
      setDesignData(dataURL);
      setShowEditor(false);
    }
  };



  const addText = () => {
    const newText = {
      type: 'text',
      content: 'Double click to edit',
      x: 100,
      y: 100,
      fontSize: 24,
      color: '#000000',
      fontFamily: 'Arial',
      fontWeight: 'normal',
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    };
    setElements([...elements, newText]);
    setSelectedElement(elements.length);
  };

  const addShape = (shapeType) => {
    let newShape;
    if (shapeType === 'rect') {
      newShape = { type: 'rect', x: 150, y: 150, width: 100, height: 80, color: '#ef4444', rotation: 0, scaleX: 1, scaleY: 1 };
    } else if (shapeType === 'circle') {
      newShape = { type: 'circle', x: 200, y: 200, radius: 50, color: '#10b981', rotation: 0, scaleX: 1, scaleY: 1 };
    }
    setElements([...elements, newShape]);
    setSelectedElement(elements.length);
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    };
  };

  const findElementAtPosition = (x, y) => {
    for (let i = elements.length - 1; i >= 0; i--) {
      const element = elements[i];
      if (element.type === 'text') {
        const ctx = canvasRef.current.getContext('2d');
        ctx.font = `${element.fontWeight || 'normal'} ${element.fontSize}px ${element.fontFamily || 'Arial'}`;
        const metrics = ctx.measureText(element.content);
        if (x >= element.x && x <= element.x + metrics.width && 
            y >= element.y - element.fontSize && y <= element.y) {
          return i;
        }
      } else if (element.type === 'rect') {
        if (x >= element.x && x <= element.x + element.width &&
            y >= element.y && y <= element.y + element.height) {
          return i;
        }
      } else if (element.type === 'circle') {
        const distance = Math.sqrt((x - element.x) ** 2 + (y - element.y) ** 2);
        if (distance <= element.radius) {
          return i;
        }
      }
    }
    return -1;
  };

  const getHandleAtPosition = (pos, element) => {
    if (!element) return null;
    
    const centerX = element.type === 'circle' ? element.x : element.x + (element.width || 0) / 2;
    const centerY = element.type === 'circle' ? element.y : element.y + (element.height || element.fontSize || 0) / 2;
    
    // Get bounds in world coordinates after rotation
    let bounds;
    if (element.type === 'text') {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      ctx.font = `${element.fontWeight || 'normal'} ${element.fontSize}px ${element.fontFamily || 'Arial'}`;
      const metrics = ctx.measureText(element.content);
      bounds = { x: element.x - 5, y: element.y - element.fontSize - 5, width: metrics.width + 10, height: element.fontSize + 10 };
    } else if (element.type === 'rect') {
      bounds = { x: element.x - 5, y: element.y - 5, width: element.width + 10, height: element.height + 10 };
    } else if (element.type === 'circle') {
      bounds = { x: element.x - element.radius - 5, y: element.y - element.radius - 5, width: (element.radius + 5) * 2, height: (element.radius + 5) * 2 };
    }
    
    // Transform handle positions to world coordinates
    const rotation = (element.rotation || 0) * Math.PI / 180;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    
    const corners = [
      { x: bounds.x, y: bounds.y }, // nw
      { x: bounds.x + bounds.width, y: bounds.y }, // ne  
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height }, // se
      { x: bounds.x, y: bounds.y + bounds.height } // sw
    ];
    
    const worldHandles = corners.map((corner, i) => {
      const dx = corner.x - centerX;
      const dy = corner.y - centerY;
      return {
        type: 'resize',
        corner: ['nw', 'ne', 'se', 'sw'][i],
        x: centerX + (dx * cos - dy * sin),
        y: centerY + (dx * sin + dy * cos),
        cursor: 'grab'
      };
    });
    
    // Rotation handle
    const rotateX = bounds.x + bounds.width/2;
    const rotateY = bounds.y - 20;
    const rotateDx = rotateX - centerX;
    const rotateDy = rotateY - centerY;
    worldHandles.push({
      type: 'rotate',
      x: centerX + (rotateDx * cos - rotateDy * sin),
      y: centerY + (rotateDx * sin + rotateDy * cos),
      cursor: 'grab'
    });
    
    for (const handle of worldHandles) {
      const distance = Math.sqrt((pos.x - handle.x) ** 2 + (pos.y - handle.y) ** 2);
      const threshold = handle.type === 'rotate' ? 15 : 12;
      if (distance <= threshold) {
        return handle;
      }
    }
    
    return null;
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);
    
    // First check if we're clicking on a handle of the selected element
    if (selectedElement !== null) {
      const element = elements[selectedElement];
      const handle = getHandleAtPosition(pos, element);
      
      if (handle) {
        console.log('Clicked handle:', handle.type, handle.corner);
        setDragMode(handle.type);
        setInitialMousePos(pos);
        setInitialElementState({ ...element, corner: handle.corner });
        setIsDragging(true);
        return;
      }
    }
    
    // If not clicking on a handle, check for element selection
    const clickedElement = findElementAtPosition(pos.x, pos.y);
    
    if (clickedElement >= 0) {
      setSelectedElement(clickedElement);
      const element = elements[clickedElement];
      setDragMode('move');
      setDragOffset({
        x: pos.x - element.x,
        y: pos.y - element.y
      });
      setIsDragging(true);
    } else {
      setSelectedElement(null);
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging || selectedElement === null) return;
    
    const pos = getMousePos(e);
    const newElements = [...elements];
    const element = newElements[selectedElement];
    
    if (dragMode === 'move') {
      element.x = pos.x - dragOffset.x;
      element.y = pos.y - dragOffset.y;
    } else if (dragMode === 'resize') {
      // Photopea-style resize: transform mouse delta to element's local coordinate system
      const deltaX = pos.x - initialMousePos.x;
      const deltaY = pos.y - initialMousePos.y;
      
      // Transform delta to element's rotated coordinate system
      const rotation = (element.rotation || 0) * Math.PI / 180;
      const cos = Math.cos(-rotation);
      const sin = Math.sin(-rotation);
      const localDeltaX = deltaX * cos - deltaY * sin;
      const localDeltaY = deltaX * sin + deltaY * cos;
      
      const corner = initialElementState.corner;
      
      if (element.type === 'rect') {
        // Use actual mouse movement for 1:1 resize
        const mouseDelta = Math.sqrt(deltaX ** 2 + deltaY ** 2) * (deltaX + deltaY > 0 ? 1 : -1);
        
        if (corner === 'se') {
          element.width = Math.max(10, initialElementState.width + mouseDelta);
          element.height = Math.max(10, initialElementState.height + mouseDelta);
        } else if (corner === 'sw') {
          const newWidth = Math.max(10, initialElementState.width - mouseDelta);
          const newHeight = Math.max(10, initialElementState.height + mouseDelta);
          const widthDiff = newWidth - initialElementState.width;
          
          element.width = newWidth;
          element.height = newHeight;
          element.x = initialElementState.x + widthDiff * cos;
          element.y = initialElementState.y + widthDiff * sin;
        } else if (corner === 'ne') {
          const newWidth = Math.max(10, initialElementState.width + mouseDelta);
          const newHeight = Math.max(10, initialElementState.height - mouseDelta);
          const heightDiff = newHeight - initialElementState.height;
          
          element.width = newWidth;
          element.height = newHeight;
          element.x = initialElementState.x - heightDiff * sin;
          element.y = initialElementState.y + heightDiff * cos;
        } else if (corner === 'nw') {
          const newWidth = Math.max(10, initialElementState.width - mouseDelta);
          const newHeight = Math.max(10, initialElementState.height - mouseDelta);
          const widthDiff = newWidth - initialElementState.width;
          const heightDiff = newHeight - initialElementState.height;
          
          element.width = newWidth;
          element.height = newHeight;
          element.x = initialElementState.x + widthDiff * cos - heightDiff * sin;
          element.y = initialElementState.y + widthDiff * sin + heightDiff * cos;
        }
      } else if (element.type === 'circle') {
        const distance = Math.sqrt(localDeltaX ** 2 + localDeltaY ** 2);
        element.radius = Math.max(5, initialElementState.radius + distance * 0.5);
      } else if (element.type === 'text') {
        element.fontSize = Math.max(8, initialElementState.fontSize + localDeltaY * 0.5);
      }
    } else if (dragMode === 'rotate') {
      const centerX = element.type === 'circle' ? element.x : element.x + (element.width || 0) / 2;
      const centerY = element.type === 'circle' ? element.y : element.y + (element.height || element.fontSize || 0) / 2;
      
      const currentAngle = Math.atan2(pos.y - centerY, pos.x - centerX) * 180 / Math.PI;
      const initialAngle = Math.atan2(initialMousePos.y - centerY, initialMousePos.x - centerX) * 180 / Math.PI;
      const deltaAngle = currentAngle - initialAngle;
      
      element.rotation = (initialElementState.rotation || 0) + deltaAngle;
    }
    
    setElements(newElements);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragMode('move');
  };

  const updateSelectedElement = (property, value) => {
    if (selectedElement !== null) {
      const newElements = [...elements];
      newElements[selectedElement] = { ...newElements[selectedElement], [property]: value };
      setElements(newElements);
    }
  };

  const deleteSelectedElement = () => {
    if (selectedElement !== null) {
      const newElements = elements.filter((_, index) => index !== selectedElement);
      setElements(newElements);
      setSelectedElement(null);
    }
  };

  if (fetchError) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Error Loading Task</h2>
        <p style={{ color: 'red' }}>{fetchError}</p>
        <button onClick={() => navigate('/graphic/task')} style={{ padding: '10px 20px', marginTop: '20px' }}>
          Back to Tasks
        </button>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2>Loading task data...</h2>
        <p>Task ID: {taskId}</p>
      </div>
    );
  }

  if (showEditor) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
        {/* Top Bar */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
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
              <h2 style={{ margin: 0, fontSize: '20px', color: 'white', fontWeight: '700' }}>Photopea Studio</h2>
              <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Task: {taskId}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => {
              const iframe = document.getElementById('photopea-iframe');
              if (iframe) {
                iframe.contentWindow.postMessage('app.activeDocument.saveToOE("png")', '*');
              }
            }} style={{ 
              background: 'rgba(16, 185, 129, 0.9)', 
              color: 'white', 
              border: 'none', 
              padding: '12px 20px', 
              borderRadius: '10px', 
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
            }}>✓ Save Design</button>
            <button onClick={() => setShowEditor(false)} style={{ 
              background: 'rgba(255,255,255,0.2)', 
              color: 'white', 
              border: '1px solid rgba(255,255,255,0.3)', 
              padding: '12px 20px', 
              borderRadius: '10px', 
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '14px',
              backdropFilter: 'blur(10px)'
            }}>← Back</button>
          </div>
        </div>
        
        {/* Photopea Iframe */}
        <div style={{
          background: '#f8fafc',
          padding: '20px',
          height: 'calc(100vh - 120px)'
        }}>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
          }}>
            <iframe
              id="photopea-iframe"
              src="https://www.photopea.com"
              style={{
                width: '100%',
                height: '100%',
                border: 'none'
              }}
              onLoad={() => {
                window.addEventListener('message', (e) => {
                  if (e.data && typeof e.data === 'string' && e.data.startsWith('data:image')) {
                    setDesignData(e.data);
                    setShowEditor(false);
                  }
                });
              }}
            />
          </div>
        </div>
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
          }}>Create Design</h1>
          <p style={{
            color: '#6b7280',
            fontSize: 17,
            margin: '8px 0 0 0',
            fontWeight: 500
          }}>Professional design studio with templates and tools</p>
        </div>

        <div style={{ 
          padding: '20px', 
          background: '#d4edda', 
          borderRadius: 16, 
          border: '2px solid #c3e6cb',
          marginBottom: 28
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: '#155724', 
            fontSize: 18,
            fontWeight: 700
          }}>📝 Content to Design For</h3>
          
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
          
          <div>
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

        <div style={{
          padding: '24px',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fbbf24 100%)',
          borderRadius: 16,
          border: '2px solid #f59e0b',
          marginBottom: 28,
          textAlign: 'center'
        }}>
          <h3 style={{ 
            margin: '0 0 16px 0', 
            color: '#92400e', 
            fontSize: 18,
            fontWeight: 700
          }}>🎨 Professional Design Studio</h3>
          <p style={{ 
            color: '#92400e', 
            marginBottom: 20,
            fontSize: 15
          }}>Templates • Text Tools • Shapes • Layers • Professional Export</p>
          <button
            type="button"
            onClick={handleCreateDesign}
            style={{
              background: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: 12,
              padding: '16px 32px',
              fontSize: 16,
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)'
            }}
          >
            🚀 Open Design Studio
          </button>
          {designData && (
            <div style={{ marginTop: 16 }}>
              <p style={{ color: '#059669', fontSize: 14, fontWeight: 600 }}>✓ Design created and ready to submit</p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div>
            <label style={{ 
              fontWeight: 700, 
              display: 'block', 
              marginBottom: 12, 
              color: '#1f2937', 
              fontSize: 16,
              letterSpacing: '0.3px'
            }}>Design Description</label>
            <textarea
              value={designDescription}
              onChange={(e) => setDesignDescription(e.target.value)}
              placeholder="Describe your design approach and key elements..."
              rows={4}
              style={{ 
                width: '100%', 
                padding: '16px 20px', 
                borderRadius: 16, 
                border: '2px solid #e5e7eb', 
                fontSize: 15, 
                background: '#fafbfc', 
                resize: 'none', 
                outline: 'none', 
                boxSizing: 'border-box',
                fontFamily: 'inherit',
                lineHeight: 1.6
              }}
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || success}
            style={{ 
              marginTop: 24, 
              background: (loading || success) ? '#9ca3af' : '#ef4444', 
              color: '#ffffff', 
              border: 'none', 
              borderRadius: 16, 
              padding: '18px 32px', 
              fontWeight: 600, 
              fontSize: 17, 
              cursor: (loading || success) ? 'not-allowed' : 'pointer', 
              letterSpacing: '0.8px', 
              textTransform: 'uppercase',
              fontFamily: 'inherit'
            }}
          >
            {loading ? 'Submitting Design...' : success ? 'Design Submitted!' : 'Submit Design'}
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

          {success && (
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
              ✅ Design submitted successfully! Redirecting to tasks...
            </div>
          )}
        </form>
      </div>
    </div>
  );
}