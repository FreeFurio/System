import React, { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import { FiEye, FiUser, FiCalendar, FiTarget, FiEdit3 } from 'react-icons/fi';

// Inline design system styles
const componentStyles = {
  card: { background: '#ffffff', borderRadius: '16px', padding: '24px', marginBottom: '20px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' },
  button: { display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', border: 'none', borderRadius: '12px', cursor: 'pointer', fontWeight: '700', fontSize: '14px', transition: 'all 0.2s ease', fontFamily: 'inherit' },
  buttonPrimary: { background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', color: '#ffffff', boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)' }
};

const TaskCard = ({ task }) => {
  const [contentExpanded, setContentExpanded] = useState(false);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'created': return '#3b82f6';
      case 'design_creation': return '#f59e0b';
      case 'completed': return '#10b981';
      default: return '#6b7280';
    }
  };
  
  const getStatusBg = (status) => {
    switch (status) {
      case 'created': return '#eff6ff';
      case 'design_creation': return '#fffbeb';
      case 'completed': return '#f0fdf4';
      default: return '#f8fafc';
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
    <div style={componentStyles.card}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px', height: '40px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
            borderRadius: '50%', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: '18px'
          }}>
            🎨
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#1e293b' }}>
              Graphic Design Task
            </h3>
            <p style={{ margin: 0, fontSize: '14px', color: '#64748b' }}>
              Created {formatDate(task.createdAt)}
            </p>
          </div>
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          padding: '8px 16px', borderRadius: '20px', fontSize: '12px',
          fontWeight: '700', color: getStatusColor(task.status),
          background: getStatusBg(task.status), border: `1px solid ${getStatusColor(task.status)}`
        }}>
          {task.status?.replace('_', ' ').toUpperCase() || 'CREATED'}
        </div>
      </div>
      
      {/* Objectives */}
      <div style={{
        background: '#f8fafc', padding: '16px', borderRadius: '12px',
        marginBottom: '20px', border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
          <FiTarget size={16} color="#3b82f6" />
          <span style={{ fontSize: '14px', fontWeight: '600', color: '#1e293b' }}>Task Objectives</span>
        </div>
        <p style={{ margin: 0, fontSize: '15px', color: '#374151', lineHeight: 1.6 }}>
          {task.objectives}
        </p>
      </div>
      
      {/* Task Details */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiUser size={16} color="#8b5cf6" />
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Target Gender</div>
            <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>{task.gender}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiTarget size={16} color="#10b981" />
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Age Range</div>
            <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>{task.minAge}-{task.maxAge} years</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCalendar size={16} color="#ef4444" />
          <div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: '500' }}>Deadline</div>
            <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: '600' }}>{formatDate(task.deadline)}</div>
          </div>
        </div>
      </div>
      
      {/* Debug - Show task data structure */}
      <div style={{ background: '#f3f4f6', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontSize: '12px' }}>
        <strong>Debug - Task Data:</strong>
        <pre>{JSON.stringify(task, null, 2)}</pre>
      </div>
      
      {/* Approved Content - Always Show for Testing */}
      <div style={{
        background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
        padding: '24px', borderRadius: '16px', marginBottom: '20px',
        border: '2px solid #10b981', position: 'relative'
      }}>
        {/* Success Badge */}
        <div style={{
          position: 'absolute', top: '-12px', left: '20px',
          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
          color: '#ffffff', padding: '6px 16px', borderRadius: '20px',
          fontSize: '12px', fontWeight: '700', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}>
          ✅ APPROVED CONTENT
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '20px' }}>✨</span>
            <span style={{ fontSize: '18px', fontWeight: '700', color: '#065f46' }}>Content Ready for Design</span>
          </div>
          <button
            onClick={() => setContentExpanded(!contentExpanded)}
            style={{
              background: 'none', border: 'none', color: '#059669',
              cursor: 'pointer', display: 'flex', alignItems: 'center',
              gap: '4px', fontSize: '14px', fontWeight: '600'
            }}
          >
            <FiEye size={14} />
            {contentExpanded ? 'Hide' : 'View'} Content
          </button>
        </div>
        
        {contentExpanded && (
          <div style={{ display: 'grid', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '12px', color: '#065f46', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📰</span> HEADLINE
              </div>
              <div style={{
                fontSize: '16px', color: '#1e293b', fontWeight: '600',
                background: '#ffffff', padding: '16px', borderRadius: '12px',
                border: '1px solid #a7f3d0', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
              }}>
                {task.contentCreator?.content?.headline || task.content?.headline || 'No headline found'}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#065f46', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>📝</span> CAPTION
              </div>
              <div style={{
                fontSize: '15px', color: '#374151', lineHeight: 1.6,
                background: '#ffffff', padding: '16px', borderRadius: '12px',
                border: '1px solid #a7f3d0', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
              }}>
                {task.contentCreator?.content?.caption || task.content?.caption || 'No caption found'}
              </div>
            </div>
            
            <div>
              <div style={{ fontSize: '12px', color: '#065f46', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🏷️</span> HASHTAGS
              </div>
              <div style={{
                fontSize: '15px', color: '#3b82f6', fontWeight: '600',
                background: '#ffffff', padding: '16px', borderRadius: '12px',
                border: '1px solid #a7f3d0', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
              }}>
                {task.contentCreator?.content?.hashtag || task.content?.hashtag || 'No hashtags found'}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Original Conditional Content - Keep for reference */}
      {(task.contentCreator?.content || task.content) && false && (
        <div style={{
          background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)',
          padding: '24px', borderRadius: '16px', marginBottom: '20px',
          border: '2px solid #10b981', position: 'relative'
        }}>
          {/* Success Badge */}
          <div style={{
            position: 'absolute', top: '-12px', left: '20px',
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            color: '#ffffff', padding: '6px 16px', borderRadius: '20px',
            fontSize: '12px', fontWeight: '700', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
          }}>
            ✅ APPROVED CONTENT
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>✨</span>
              <span style={{ fontSize: '18px', fontWeight: '700', color: '#065f46' }}>Content Ready for Design</span>
            </div>
            <button
              onClick={() => setContentExpanded(!contentExpanded)}
              style={{
                background: 'none', border: 'none', color: '#059669',
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                gap: '4px', fontSize: '14px', fontWeight: '600'
              }}
            >
              <FiEye size={14} />
              {contentExpanded ? 'Hide' : 'View'} Content
            </button>
          </div>
          
          {contentExpanded && (
            <div style={{ display: 'grid', gap: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#065f46', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📰</span> HEADLINE
                </div>
                <div style={{
                  fontSize: '16px', color: '#1e293b', fontWeight: '600',
                  background: '#ffffff', padding: '16px', borderRadius: '12px',
                  border: '1px solid #a7f3d0', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
                }}>
                  {task.contentCreator?.content?.headline || task.content?.headline}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '12px', color: '#065f46', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>📝</span> CAPTION
                </div>
                <div style={{
                  fontSize: '15px', color: '#374151', lineHeight: 1.6,
                  background: '#ffffff', padding: '16px', borderRadius: '12px',
                  border: '1px solid #a7f3d0', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
                }}>
                  {task.contentCreator?.content?.caption || task.content?.caption}
                </div>
              </div>
              
              <div>
                <div style={{ fontSize: '12px', color: '#065f46', fontWeight: '700', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🏷️</span> HASHTAGS
                </div>
                <div style={{
                  fontSize: '15px', color: '#3b82f6', fontWeight: '600',
                  background: '#ffffff', padding: '16px', borderRadius: '12px',
                  border: '1px solid #a7f3d0', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.1)'
                }}>
                  {task.contentCreator?.content?.hashtag || task.content?.hashtag}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Action Button */}
      {task.status === 'design_creation' && task.currentStage === 'graphicdesigner' && !task.graphicDesigner?.designs && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
          <button
            onClick={() => window.location.href = `/graphic/creation?taskId=${task.id}`}
            style={{
              ...componentStyles.button,
              ...componentStyles.buttonPrimary
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            <FiEdit3 size={16} />
            Create Design
          </button>
        </div>
      )}
      
      {task.graphicDesigner?.designs && (
        <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
          <strong style={{ color: '#856404' }}>📋 Design Submitted:</strong>
          <div style={{ fontSize: '14px', marginTop: '8px', color: '#856404' }}>
            Submitted on {new Date(task.graphicDesigner.submittedAt).toLocaleDateString()}
          </div>
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