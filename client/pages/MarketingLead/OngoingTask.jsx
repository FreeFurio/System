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
        backgroundColor: 'white', padding: '24px', borderRadius: '8px',
        width: '500px', maxHeight: '80vh', overflow: 'auto'
      }}>
        <h3>Edit {type} Task</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          <div style={{ marginBottom: '16px' }}>
            <label>Objectives:</label>
            <textarea
              value={formData.objectives}
              onChange={(e) => setFormData({...formData, objectives: e.target.value})}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              rows="3"
            />
          </div>
          <div style={{ marginBottom: '16px' }}>
            <label>Gender:</label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({...formData, gender: e.target.value})}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Both">Both</option>
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
            <div>
              <label>Min Age:</label>
              <input
                type="number"
                value={formData.minAge}
                onChange={(e) => setFormData({...formData, minAge: e.target.value})}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
            <div>
              <label>Max Age:</label>
              <input
                type="number"
                value={formData.maxAge}
                onChange={(e) => setFormData({...formData, maxAge: e.target.value})}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
          </div>
          {type === 'Graphic Designer' && (
            <div style={{ marginBottom: '16px' }}>
              <label>Number of Content:</label>
              <input
                type="number"
                value={formData.numContent}
                onChange={(e) => setFormData({...formData, numContent: e.target.value})}
                style={{ width: '100%', padding: '8px', marginTop: '4px' }}
              />
            </div>
          )}
          <div style={{ marginBottom: '16px' }}>
            <label>Deadline:</label>
            <input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => setFormData({...formData, deadline: e.target.value})}
              style={{ width: '100%', padding: '8px', marginTop: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={onClose} style={{
              padding: '8px 16px', backgroundColor: '#6c757d', color: 'white',
              border: 'none', borderRadius: '4px', cursor: 'pointer'
            }}>Cancel</button>
            <button type="submit" style={{
              padding: '8px 16px', backgroundColor: '#007bff', color: 'white',
              border: 'none', borderRadius: '4px', cursor: 'pointer'
            }}>Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

const TaskCard = ({ task, type, onEdit, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'created': return '#007bff';
      case 'pending_approval': return '#ffc107';
      case 'approved': return '#28a745';
      default: return '#6c757d';
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
      border: '1px solid #ddd',
      borderRadius: '8px',
      padding: '16px',
      marginBottom: '12px',
      backgroundColor: '#fff'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h4 style={{ margin: 0, color: '#333' }}>{type} Task</h4>
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '12px',
          fontWeight: 'bold',
          color: '#fff',
          backgroundColor: getStatusColor(task.status)
        }}>
          {task.status?.toUpperCase() || 'CREATED'}
        </span>
      </div>
      
      <div style={{ marginBottom: '8px' }}>
        <strong>Objectives:</strong> {task.objectives}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px', color: '#666' }}>
        <div><strong>Gender:</strong> {task.gender}</div>
        <div><strong>Age:</strong> {task.minAge}-{task.maxAge}</div>
        {task.numContent && <div><strong>Content Count:</strong> {task.numContent}</div>}
        <div><strong>Deadline:</strong> {formatDate(task.deadline)}</div>
      </div>
      
      {task.createdAt && (
        <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
          Created: {formatDate(task.createdAt)}
        </div>
      )}
      
      {task.content && (
        <div style={{ marginTop: '12px', padding: '8px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
          <strong>Submitted Content:</strong>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>
            <div><strong>Headline:</strong> {task.content.headline}</div>
            <div><strong>Caption:</strong> {task.content.caption}</div>
            <div><strong>Hashtags:</strong> {task.content.hashtag}</div>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', justifyContent: 'flex-end' }}>
        <button
          onClick={() => onEdit(task)}
          style={{
            padding: '6px 12px', backgroundColor: '#28a745', color: 'white',
            border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
          }}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task)}
          style={{
            padding: '6px 12px', backgroundColor: '#dc3545', color: 'white',
            border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '12px'
          }}
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
    <div className="manage-accounts-page-container">
      <div className="role-section">
        <h2>Content Creator Tasks</h2>
        {loading ? "Loading..." : (
          Array.isArray(creatorTasks) && creatorTasks.length === 0
            ? <div style={{ marginBottom: 20 }}>No ongoing tasks.</div>
            : Array.isArray(creatorTasks)
              ? creatorTasks.map(task => (
                  <TaskCard 
                    key={task.id || task._id} 
                    task={task} 
                    type="Content Creator" 
                    onEdit={(task) => handleEdit(task, 'Content Creator')}
                    onDelete={(task) => handleDelete(task, 'Content Creator')}
                  />
                ))
              : <div style={{ color: 'red' }}>Error: Tasks data is not an array.</div>
        )}
      </div>
      <div className="role-section">
        <h2>Graphic Designer Tasks</h2>
        {loading ? "Loading..." : (
          Array.isArray(designerTasks) && designerTasks.length === 0
            ? <div style={{ marginBottom: 20 }}>No ongoing tasks.</div>
            : Array.isArray(designerTasks)
              ? designerTasks.map(task => (
                  <TaskCard 
                    key={task.id || task._id} 
                    task={task} 
                    type="Graphic Designer" 
                    onEdit={(task) => handleEdit(task, 'Graphic Designer')}
                    onDelete={(task) => handleDelete(task, 'Graphic Designer')}
                  />
                ))
              : <div style={{ color: 'red' }}>Error: Tasks data is not an array.</div>
        )}
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