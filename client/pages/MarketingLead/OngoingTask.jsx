import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";

const EditTaskModal = ({ task, type, onClose, onSave }) => {
  const formatDateForInput = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  };

  const [formData, setFormData] = useState({
    objectives: task.objectives || '',
    gender: task.gender || '',
    minAge: task.minAge || '',
    maxAge: task.maxAge || '',
    deadline: formatDateForInput(task.deadline),
    numContent: task.numContent || ''
  });

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white', 
        padding: '32px', 
        borderRadius: '16px',
        width: '600px', 
        maxHeight: '80vh', 
        overflow: 'auto',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)'
      }}>
        <h3 style={{ 
          fontSize: '1.5rem', 
          fontWeight: '700', 
          color: '#1f2937', 
          margin: '0 0 24px 0' 
        }}>
          Edit {type} Task
        </h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ 
              fontWeight: '600', 
              display: 'block', 
              marginBottom: '8px', 
              color: '#374151', 
              fontSize: '14px' 
            }}>
              Objectives:
            </label>
            <textarea
              value={formData.objectives}
              onChange={(e) => setFormData({...formData, objectives: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                fontFamily: 'inherit',
                resize: 'vertical',
                minHeight: '80px',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
              rows="3"
            />
          </div>
          <div>
            <label style={{ 
              fontWeight: '600', 
              display: 'block', 
              marginBottom: '8px', 
              color: '#374151', 
              fontSize: '14px' 
            }}>
              Gender:
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Both">Both</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{ 
                fontWeight: '600', 
                display: 'block', 
                marginBottom: '8px', 
                color: '#374151', 
                fontSize: '14px' 
              }}>
                Min Age:
              </label>
              <input
                type="number"
                value={formData.minAge}
                onChange={(e) => setFormData({...formData, minAge: e.target.value})}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
            <div>
              <label style={{ 
                fontWeight: '600', 
                display: 'block', 
                marginBottom: '8px', 
                color: '#374151', 
                fontSize: '14px' 
              }}>
                Max Age:
              </label>
              <input
                type="number"
                value={formData.maxAge}
                onChange={(e) => setFormData({...formData, maxAge: e.target.value})}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
          </div>
          {type === 'Graphic Designer' && (
            <div>
              <label style={{ 
                fontWeight: '600', 
                display: 'block', 
                marginBottom: '8px', 
                color: '#374151', 
                fontSize: '14px' 
              }}>
                Number of Content:
              </label>
              <input
                type="number"
                value={formData.numContent}
                onChange={(e) => setFormData({...formData, numContent: e.target.value})}
                style={{ 
                  width: '100%', 
                  padding: '12px 16px', 
                  borderRadius: '8px',
                  border: '1px solid #d1d5db',
                  fontSize: '14px',
                  fontFamily: 'inherit',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={e => e.target.style.borderColor = '#3b82f6'}
                onBlur={e => e.target.style.borderColor = '#d1d5db'}
              />
            </div>
          )}
          <div>
            <label style={{ 
              fontWeight: '600', 
              display: 'block', 
              marginBottom: '8px', 
              color: '#374151', 
              fontSize: '14px' 
            }}>
              Deadline:
            </label>
            <input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              style={{ 
                width: '100%', 
                padding: '12px 16px', 
                borderRadius: '8px',
                border: '1px solid #d1d5db',
                fontSize: '14px',
                fontFamily: 'inherit',
                outline: 'none',
                transition: 'border-color 0.2s ease'
              }}
              onFocus={e => e.target.style.borderColor = '#3b82f6'}
              onBlur={e => e.target.style.borderColor = '#d1d5db'}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button 
              type="button" 
              onClick={onClose} 
              style={{
                padding: '12px 24px', 
                backgroundColor: '#6b7280', 
                color: 'white',
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={e => e.target.style.backgroundColor = '#4b5563'}
              onMouseLeave={e => e.target.style.backgroundColor = '#6b7280'}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              style={{
                padding: '12px 24px', 
                backgroundColor: '#3b82f6', 
                color: 'white',
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: '600',
                transition: 'background-color 0.2s ease'
              }}
              onMouseEnter={e => e.target.style.backgroundColor = '#2563eb'}
              onMouseLeave={e => e.target.style.backgroundColor = '#3b82f6'}
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TaskCard = ({ task, type, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'created': return '#3b82f6';
      case 'pending_approval': return '#f59e0b';
      case 'approved': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusBg = (status) => {
    switch (status) {
      case 'created': return '#eff6ff';
      case 'pending_approval': return '#fffbeb';
      case 'approved': return '#f0fdf4';
      default: return '#f9fafb';
    }
  };

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
      border: '1px solid #e5e7eb',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '16px',
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      transition: 'all 0.2s ease'
    }}
    onMouseEnter={e => {
      e.target.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)';
      e.target.style.transform = 'translateY(-1px)';
    }}
    onMouseLeave={e => {
      e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
      e.target.style.transform = 'translateY(0)';
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ 
          margin: 0, 
          color: '#1f2937', 
          fontSize: '1.125rem', 
          fontWeight: '600' 
        }}>
          {type} Task
        </h4>
        <span style={{
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '600',
          color: getStatusColor(task.status),
          backgroundColor: getStatusBg(task.status),
          border: `1px solid ${getStatusColor(task.status)}20`
        }}>
          {task.status?.replace(/_/g, ' ').toUpperCase() || 'CREATED'}
        </span>
      </div>
      
      <div style={{ marginBottom: '16px' }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#374151', 
          marginBottom: '4px' 
        }}>
          Objectives:
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: '#6b7280', 
          lineHeight: '1.5' 
        }}>
          {task.objectives}
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', 
        gap: '12px', 
        marginBottom: '16px',
        padding: '16px',
        backgroundColor: '#f8fafc',
        borderRadius: '8px'
      }}>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px' }}>GENDER</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{task.gender}</div>
        </div>
        <div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px' }}>AGE RANGE</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{task.minAge}-{task.maxAge}</div>
        </div>
        {task.numContent && (
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px' }}>CONTENT COUNT</div>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{task.numContent}</div>
          </div>
        )}
        <div>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px' }}>DEADLINE</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>{formatDate(task.deadline)}</div>
        </div>
      </div>
      
      {task.createdAt && (
        <div style={{ 
          fontSize: '12px', 
          color: '#9ca3af', 
          marginBottom: '16px',
          fontStyle: 'italic'
        }}>
          Created: {formatDate(task.createdAt)}
        </div>
      )}
      
      {task.content && (
        <div style={{ 
          marginBottom: '16px', 
          padding: '16px', 
          backgroundColor: '#f0fdf4', 
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{ 
            fontSize: '14px', 
            fontWeight: '600', 
            color: '#059669', 
            marginBottom: '8px' 
          }}>
            Submitted Content:
          </div>
          <div style={{ fontSize: '14px', color: '#374151', lineHeight: '1.5' }}>
            <div style={{ marginBottom: '4px' }}><strong>Headline:</strong> {task.content.headline}</div>
            <div style={{ marginBottom: '4px' }}><strong>Caption:</strong> {task.content.caption}</div>
            <div><strong>Hashtags:</strong> {task.content.hashtag}</div>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onEdit(task)}
          style={{
            padding: '8px 16px', 
            backgroundColor: '#3b82f6', 
            color: 'white',
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={e => e.target.style.backgroundColor = '#2563eb'}
          onMouseLeave={e => e.target.style.backgroundColor = '#3b82f6'}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task)}
          style={{
            padding: '8px 16px', 
            backgroundColor: '#ef4444', 
            color: 'white',
            border: 'none', 
            borderRadius: '8px', 
            cursor: 'pointer', 
            fontSize: '14px',
            fontWeight: '600',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={e => e.target.style.backgroundColor = '#dc2626'}
          onMouseLeave={e => e.target.style.backgroundColor = '#ef4444'}
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default function OngoingTask() {
  const [creatorTasks, setCreatorTasks] = useState([]);
  const [designerTasks, setDesignerTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTask, setEditingTask] = useState(null);
  const [editingType, setEditingType] = useState(null);

  useEffect(() => {
    setLoading(true);
    // Fetch Content Creator tasks
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/marketing/content-creator/task`)
      .then(res => res.json())
      .then(data => {
        console.log("Content Creator tasks API response:", data);
        setCreatorTasks(Array.isArray(data.data) ? data.data : []);
        setLoading(false);
      })
      .catch(err => {
        setCreatorTasks([]);
        setLoading(false);
      });
    // Fetch Graphic Designer tasks
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/marketing/graphic-designer/task`)
      .then(res => res.json())
      .then(data => {
        console.log("Graphic Designer tasks API response:", data);
        setDesignerTasks(Array.isArray(data.data) ? data.data : []);
      })
      .catch(err => {
        setDesignerTasks([]);
      });

    const socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });

    socket.on("ongoingContentCreatorTask", (data) => {
      setCreatorTasks(prev => [data, ...(Array.isArray(prev) ? prev : [])]);
    });
    socket.on("ongoingGraphicDesignerTask", (data) => {
      setDesignerTasks(prev => [data, ...(Array.isArray(prev) ? prev : [])]);
    });
    socket.on("contentSubmittedForApproval", (data) => {
      setCreatorTasks(prev => prev.map(task => 
        task.id === data.taskId ? { ...task, status: 'pending_approval', content: data.content } : task
      ));
    });

    return () => socket.disconnect();
  }, []);

  const handleEdit = (task, type) => {
    setEditingTask(task);
    setEditingType(type);
  };

  const handleSaveEdit = async (formData) => {
    console.log('Saving task with data:', formData);
    try {
      const taskType = editingType === 'Content Creator' ? 'contentcreator' : 'graphicdesigner';
      const taskId = editingTask.id || editingTask._id;
      
      console.log('API call:', `${import.meta.env.VITE_API_URL}/api/v1/tasks/task/${taskType}/${taskId}`);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/task/${taskType}/${encodeURIComponent(taskId)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          minAge: parseInt(formData.minAge),
          maxAge: parseInt(formData.maxAge),
          numContent: formData.numContent ? parseInt(formData.numContent) : undefined
        })
      });
      
      console.log('Response status:', response.status);
      
      if (response.ok) {
        const updatedData = {
          ...formData,
          minAge: parseInt(formData.minAge),
          maxAge: parseInt(formData.maxAge),
          numContent: formData.numContent ? parseInt(formData.numContent) : undefined
        };
        
        if (editingType === 'Content Creator') {
          setCreatorTasks(prev => prev.map(task => 
            (task.id || task._id) === taskId ? { ...task, ...updatedData } : task
          ));
        } else {
          setDesignerTasks(prev => prev.map(task => 
            (task.id || task._id) === taskId ? { ...task, ...updatedData } : task
          ));
        }
        setEditingTask(null);
        setEditingType(null);
        console.log('Task updated successfully');
      } else {
        const errorText = await response.text();
        console.error('Failed to update task:', errorText);
        alert('Failed to update task: ' + errorText);
      }
    } catch (error) {
      console.error('Error updating task:', error);
      alert('Error updating task: ' + error.message);
    }
  };

  const handleDelete = async (task, type) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        const taskType = type === 'Content Creator' ? 'contentcreator' : 'graphicdesigner';
        const taskId = task.id || task._id;
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/task/${taskType}/${encodeURIComponent(taskId)}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          if (type === 'Content Creator') {
            setCreatorTasks(prev => prev.filter(t => (t.id || t._id) !== taskId));
          } else {
            setDesignerTasks(prev => prev.filter(t => (t.id || t._id) !== taskId));
          }
          console.log('Task deleted successfully');
        } else {
          const errorText = await response.text();
          console.error('Failed to delete task:', errorText);
          alert('Failed to delete task');
        }
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task: ' + error.message);
      }
    }
  };

  return (
    <div style={{ padding: '0', maxWidth: '100%' }}>
      {/* Header */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1f2937', margin: '0 0 8px 0' }}>
          Ongoing Tasks
        </h1>
        <p style={{ color: '#6b7280', margin: 0 }}>
          Monitor and manage active tasks for content creators and graphic designers
        </p>
      </div>

      {/* Content Creator Tasks */}
      <div style={{ marginBottom: '40px' }}>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#1f2937', 
            margin: '0 0 20px 0',
            paddingBottom: '12px',
            borderBottom: '2px solid #e5e7eb'
          }}>
            Content Creator Tasks
          </h2>
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#6b7280',
              fontSize: '14px'
            }}>
              Loading tasks...
            </div>
          ) : (
            Array.isArray(creatorTasks) && creatorTasks.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#9ca3af',
                fontSize: '14px'
              }}>
                No ongoing tasks for content creators.
              </div>
            ) : Array.isArray(creatorTasks) ? (
              creatorTasks.map(task => (
                <TaskCard 
                  key={task.id || task._id} 
                  task={task} 
                  type="Content Creator" 
                  onEdit={(task) => handleEdit(task, 'Content Creator')}
                  onDelete={(task) => handleDelete(task, 'Content Creator')}
                />
              ))
            ) : (
              <div style={{ color: '#ef4444', padding: '20px', textAlign: 'center' }}>
                Error: Tasks data is not available.
              </div>
            )
          )}
        </div>
      </div>

      {/* Graphic Designer Tasks */}
      <div>
        <div style={{
          background: '#fff',
          borderRadius: '12px',
          padding: '24px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
          border: '1px solid #e5e7eb'
        }}>
          <h2 style={{ 
            fontSize: '1.25rem', 
            fontWeight: '600', 
            color: '#1f2937', 
            margin: '0 0 20px 0',
            paddingBottom: '12px',
            borderBottom: '2px solid #e5e7eb'
          }}>
            Graphic Designer Tasks
          </h2>
          {loading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#6b7280',
              fontSize: '14px'
            }}>
              Loading tasks...
            </div>
          ) : (
            Array.isArray(designerTasks) && designerTasks.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#9ca3af',
                fontSize: '14px'
              }}>
                No ongoing tasks for graphic designers.
              </div>
            ) : Array.isArray(designerTasks) ? (
              designerTasks.map(task => (
                <TaskCard 
                  key={task.id || task._id} 
                  task={task} 
                  type="Graphic Designer" 
                  onEdit={(task) => handleEdit(task, 'Graphic Designer')}
                  onDelete={(task) => handleDelete(task, 'Graphic Designer')}
                />
              ))
            ) : (
              <div style={{ color: '#ef4444', padding: '20px', textAlign: 'center' }}>
                Error: Tasks data is not available.
              </div>
            )
          )}
        </div>
      </div>
      
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          type={editingType}
          onClose={() => { setEditingTask(null); setEditingType(null); }}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}