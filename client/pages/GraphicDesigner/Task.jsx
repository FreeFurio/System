import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";

const TaskCard = ({ task }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'created': return '#007bff';
      case 'in_progress': return '#ffc107';
      case 'completed': return '#28a745';
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
        <h4 style={{ margin: 0, color: '#333' }}>Graphic Design Task</h4>
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
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '14px', color: '#666', marginBottom: '12px' }}>
        <div><strong>Gender:</strong> {task.gender}</div>
        <div><strong>Age:</strong> {task.minAge}-{task.maxAge}</div>
        <div><strong>Content Count:</strong> {task.numContent}</div>
        <div><strong>Deadline:</strong> {formatDate(task.deadline)}</div>
      </div>
      
      {task.contentCreator?.content && (
        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#d4edda', borderRadius: '4px', border: '1px solid #c3e6cb' }}>
          <strong style={{ color: '#155724' }}>✅ Approved Content from Content Creator:</strong>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            <div style={{ marginBottom: '4px' }}><strong>Headline:</strong> {task.contentCreator.content.headline}</div>
            <div style={{ marginBottom: '4px' }}><strong>Caption:</strong> {task.contentCreator.content.caption}</div>
            <div><strong>Hashtags:</strong> {task.contentCreator.content.hashtag}</div>
          </div>
        </div>
      )}
      
      {task.createdAt && (
        <div style={{ fontSize: '12px', color: '#999', marginTop: '8px' }}>
          Created: {formatDate(task.createdAt)}
        </div>
      )}
    </div>
  );
};

export default function Task() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/graphicdesigner`)
      .then(res => res.json())
      .then(data => {
        console.log("Graphic Designer workflows API response:", data);
        setTasks(Array.isArray(data.data) ? data.data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching workflows:', err);
        setTasks([]);
        setLoading(false);
      });

    const socket = io(import.meta.env.VITE_API_URL, { withCredentials: true });
    socket.on("workflowUpdated", (data) => {
      if (data.currentStage === 'graphicdesigner') {
        setTasks(prev => {
          const existing = prev.find(t => t.id === data.id);
          if (existing) {
            return prev.map(t => t.id === data.id ? data : t);
          } else {
            return [data, ...prev];
          }
        });
      }
    });
    return () => socket.disconnect();
  }, []);

  return (
    <div className="manage-accounts-page-container">
      <div className="role-section">
        <h2>Graphic Design Tasks</h2>
        {loading ? "Loading..." : (
          Array.isArray(tasks) && tasks.length === 0
            ? <div style={{ marginBottom: 20 }}>No tasks available.</div>
            : Array.isArray(tasks)
              ? tasks.map(task => (
                  <TaskCard key={task.id || task._id} task={task} />
                ))
              : <div style={{ color: 'red' }}>Error: Tasks data is not an array.</div>
        )}
      </div>
    </div>
  );
} 