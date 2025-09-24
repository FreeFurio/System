import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function GraphicCreation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const taskId = searchParams.get('taskId');
  const [workflow, setWorkflow] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const canvasRef = useRef(null);
  const [designData, setDesignData] = useState(null);
  const [fetchError, setFetchError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  
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
    setIsLoading(true);
    try {
      console.log('🎨 Fetching workflow with taskId:', taskId);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/graphicdesigner`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      console.log('🎨 API Response:', data);
      
      if (data.status === 'success' && Array.isArray(data.data)) {
        const foundWorkflow = data.data.find(w => w.id === taskId);
        console.log('🎨 Found workflow:', foundWorkflow);
        
        if (foundWorkflow) {
          setWorkflow(foundWorkflow);
          setIsLoading(false);
        } else {
          // Try fetching from all workflows if not found in graphic designer stage
          const allResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows`);
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
      console.error('🎨 Fetch error:', error);
      setFetchError(`Failed to load task data: ${error.message}`);
      setIsLoading(false);
    }
  };



  const handleSubmitDesign = async (designDataUrl) => {
    if (!designDataUrl) {
      setError('No design data to submit');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(designDataUrl);
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



  // Show media editor directly
  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'Inter, sans-serif' }}>
      {/* Top Bar */}
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
            <h2 style={{ margin: 0, fontSize: '20px', color: 'white', fontWeight: '700' }}>Design Studio</h2>
            <p style={{ margin: 0, fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>Task: {workflow?.objectives || taskId || 'New Design'}</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          {loading && (
            <div style={{ color: 'white', padding: '12px 20px', fontSize: '14px' }}>
              Saving design...
            </div>
          )}
          {success && (
            <div style={{ color: '#10b981', padding: '12px 20px', fontSize: '14px', fontWeight: '600' }}>
              ✓ Design saved!
            </div>
          )}
          <button onClick={() => {
            const iframe = document.getElementById('photopea-iframe');
            if (iframe) {
              iframe.contentWindow.postMessage('app.activeDocument.saveToOE("png")', '*');
            }
          }} style={{ 
            background: loading ? 'rgba(156, 163, 175, 0.9)' : 'rgba(16, 185, 129, 0.9)', 
            color: 'white', 
            border: 'none', 
            padding: '12px 20px', 
            borderRadius: '10px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: '600',
            fontSize: '14px',
            boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
          }} disabled={loading}>
            {loading ? 'Saving...' : success ? '✓ Saved' : '💾 Save & Submit Design'}
          </button>
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
      
      {/* Photopea Iframe */}
      <div style={{
        background: '#f8fafc',
        padding: '20px',
        height: 'calc(100vh - 120px)',
        flex: 1
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
                  console.log('🎨 Design received from Photopea');
                  handleSubmitDesign(e.data);
                }
              });
            }}
          />
        </div>
      </div>
    </div>
  );


}