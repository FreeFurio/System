import React, { useEffect, useState, useRef } from 'react';
import { io } from "socket.io-client";
import { cachedFetch } from '../../utils/apiCache';
import { FiTrash2, FiTarget, FiUser, FiCalendar, FiBarChart, FiSmartphone, FiClock, FiEdit3, FiStar, FiFileText, FiHash, FiTrendingUp, FiEye, FiCheckCircle, FiSend, FiClipboard } from 'react-icons/fi';
import PlatformDisplay from '../../components/common/PlatformDisplay';

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
      position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
      background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
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

const DeleteModal = ({ isOpen, onConfirm, onCancel, taskTitle, taskType }) => {
  if (!isOpen) return null;
  
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', alignItems: 'flex-start', justifyContent: 'center',
      paddingTop: '100px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '16px', padding: '32px',
        maxWidth: '400px', width: '90%',
        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
        transform: isOpen ? 'translateY(0)' : 'translateY(-20px)',
        transition: 'all 0.3s ease',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ 
            width: '48px', height: '48px', borderRadius: '50%',
            background: '#fef2f2', margin: '0 auto 16px',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiTrash2 size={20} color="#dc2626" />
          </div>
          <h3 style={{
            fontSize: '18px', fontWeight: '700', color: '#1f2937',
            margin: '0 0 8px 0'
          }}>
            Delete Task
          </h3>
          <p style={{
            fontSize: '14px', color: '#6b7280', margin: '0 0 16px 0',
            lineHeight: '1.5'
          }}>
            Are you sure you want to delete this {taskType} task?
          </p>
          <div style={{
            background: '#f9fafb', padding: '12px', borderRadius: '8px',
            border: '1px solid #e5e7eb'
          }}>
            <p style={{
              fontSize: '13px', fontWeight: '600', color: '#374151',
              margin: 0, wordBreak: 'break-word'
            }}>
              "{taskTitle}"
            </p>
          </div>
        </div>
        <div style={{ 
          display: 'flex', gap: '12px', justifyContent: 'flex-end'
        }}>
          <button 
            onClick={onCancel}
            style={{
              padding: '12px 24px', background: '#6b7280', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '14px', fontWeight: '600',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#4b5563'}
            onMouseLeave={e => e.target.style.backgroundColor = '#6b7280'}
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            style={{
              padding: '12px 24px', background: '#dc2626', color: '#fff',
              border: 'none', borderRadius: '8px', cursor: 'pointer',
              fontSize: '14px', fontWeight: '600',
              transition: 'background-color 0.2s ease'
            }}
            onMouseEnter={e => e.target.style.backgroundColor = '#b91c1c'}
            onMouseLeave={e => e.target.style.backgroundColor = '#dc2626'}
          >
            Delete Task
          </button>
        </div>
      </div>
    </div>
  );
};

const TaskCard = ({ task, type, onEdit, onDelete }) => {
  const [contentExpanded, setContentExpanded] = useState(false);
  
  console.log('TaskCard render - contentExpanded:', contentExpanded, 'task.content:', !!task.content, 'type:', type);
  console.log('Full task object:', task);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'content_creation': return '#f59e0b';
      case 'content_approval': return '#f59e0b';
      case 'ready_for_design_assignment': return '#10b981';
      case 'design_creation': return '#3b82f6';
      case 'design_approval': return '#f59e0b';
      case 'posted': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'content_creation': return 'Content Creation';
      case 'content_approval': return 'Pending Approval';
      case 'ready_for_design_assignment': return 'Ready for Design';
      case 'design_creation': return 'Design Creation';
      case 'design_approval': return 'Design Approval';
      case 'posted': return 'Posted';
      default: return 'In Progress';
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

  const getTaskIcon = () => {
    if (task.status === 'content_approval') return <FiFileText size={20} color="#fff" />;
    if (task.status === 'ready_for_design_assignment') return <FiCheckCircle size={20} color="#fff" />;
    if (task.status === 'design_creation') return <FiEdit3 size={20} color="#fff" />;
    if (task.status === 'design_approval') return <FiEye size={20} color="#fff" />;
    if (task.status === 'posted') return <FiSend size={20} color="#fff" />;
    return <FiClipboard size={20} color="#fff" />;
  };

  return (
    <div style={{
      background: '#fff',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '20px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      border: '1px solid #e5e7eb',
      transition: 'all 0.3s ease'
    }}
    onMouseEnter={e => {
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
      e.currentTarget.style.transform = 'translateY(-2px)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.08)';
      e.currentTarget.style.transform = 'translateY(0)';
    }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px', background: '#fff' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #ff9a56 0%, #ff6b35 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '20px'
          }}>
            {getTaskIcon()}
          </div>
          <div style={{ background: '#fff' }}>
            <h3 style={{ 
              margin: '0 0 4px 0', 
              color: '#1f2937', 
              fontSize: '18px', 
              fontWeight: '700',
              letterSpacing: '-0.025em',
              background: '#fff'
            }}>
              {task.status === 'content_approval' ? 'Content Approval Required' : 
               task.status === 'ready_for_design_assignment' ? 'Ready for Design Assignment' :
               task.status === 'design_creation' ? 'Design Creation in Progress' :
               task.status === 'design_approval' ? 'Design Approval Required' :
               task.status === 'posted' ? 'Content Posted Successfully' :
               `${type} Task`}
            </h3>
            <p style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              background: '#fff'
            }}>
              {task.createdAt ? `Created ${formatDate(task.createdAt)}` : 'Recently created'}
            </p>
          </div>
        </div>
        <div style={{
          background: getStatusColor(task.status),
          color: '#fff',
          padding: '8px 16px',
          borderRadius: '20px',
          fontSize: '12px',
          fontWeight: '700',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <FiClock size={12} /> {getStatusText(task.status)}
        </div>
      </div>
      
      <div style={{ marginBottom: '20px', background: '#fff' }}>
        <div style={{ 
          fontSize: '14px', 
          fontWeight: '600', 
          color: '#374151', 
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#fff'
        }}>
          <FiTarget size={16} color="#3b82f6" /> Task Objectives
        </div>
        <div style={{ 
          fontSize: '16px', 
          color: '#1f2937', 
          lineHeight: '1.6',
          fontWeight: '500',
          background: '#fff'
        }}>
          {task.objectives}
        </div>
      </div>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', 
        gap: '16px', 
        marginBottom: '20px',
        padding: '20px',
        background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
        borderRadius: '12px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiUser size={16} color="#3b82f6" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Target Gender</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>{task.gender}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCalendar size={16} color="#10b981" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Age Range</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>{task.minAge}-{task.maxAge} years</div>
          </div>
        </div>
        {task.numContent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiBarChart size={16} color="#f59e0b" />
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Content Count</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>{task.numContent}</div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiClock size={16} color="#ef4444" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Deadline</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>{formatDate(task.deadline)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiSmartphone size={16} color="#8b5cf6" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Target Platforms</div>
            <PlatformDisplay platforms={task.selectedPlatforms || []} size="small" />
          </div>
        </div>
      </div>
      

      
      {/* Content Section for tasks with submitted content */}
      {task.contentCreator?.content && (
        <div style={{
          background: 'linear-gradient(135deg, #e0f2fe 0%, #b3e5fc 100%)',
          padding: '20px',
          borderRadius: '16px',
          marginBottom: '20px',
          border: '1px solid #81d4fa',
          boxShadow: '0 2px 8px rgba(3, 169, 244, 0.1)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <FiStar size={20} color="#0d47a1" />
              <div>
                <div style={{ fontSize: '16px', fontWeight: '700', color: '#0d47a1', marginBottom: '4px' }}>Submitted Content</div>
                <div style={{ fontSize: '13px', color: '#1565c0' }}>Content ready for review and approval</div>
              </div>
            </div>
            <button
              onClick={() => setContentExpanded(!contentExpanded)}
              style={{
                background: contentExpanded ? '#64b5f6' : '#2196f3',
                color: '#fff',
                border: 'none',
                padding: '10px 20px',
                borderRadius: '12px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {contentExpanded ? (
                <>
                  <FiEye size={14} /> Hide Details
                </>
              ) : (
                <>
                  <FiFileText size={14} /> View Details
                </>
              )}
            </button>
          </div>
        </div>
      )}
      
      {/* Inline Content Expansion */}
      {contentExpanded && task.contentCreator?.content && (
        <div style={{
          marginTop: '24px',
          padding: '32px',
          background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
          maxHeight: '60vh',
          overflow: 'auto'
        }}>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            marginBottom: '32px',
            paddingBottom: '16px',
            borderBottom: '2px solid #e5e7eb'
          }}>
            <h4 className="seo-heading-override" style={{ 
              margin: 0, 
              color: '#000000 !important', 
              fontSize: '20px', 
              fontWeight: '700',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
            }}>
              <FiFileText size={20} color="#3b82f6" /> Approved Content Analysis
            </h4>
            <div style={{
              background: '#10b981 !important',
              color: '#ffffff !important',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '12px',
              fontWeight: '700'
            }}>
              Overall SEO: {task.contentCreator?.content?.seoAnalysis?.overallScore || 'N/A'}/100
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
            {/* Content Sections */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
              <div style={{
                background: '#ffffff',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: '#374151', 
                  marginBottom: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}>
                  <FiFileText size={14} color="#3b82f6" /> HEADLINE
                  <div style={{
                    background: task.contentCreator.content.headlineScore >= 85 ? '#10b981' : task.contentCreator.content.headlineScore >= 75 ? '#f59e0b' : '#ef4444',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    {task.contentCreator.content.seoAnalysis?.headlineScore || 'N/A'}
                  </div>
                </div>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1f2937',
                  lineHeight: 1.5
                }}>
                  {task.contentCreator.content.headline}
                </div>
              </div>
              
              <div style={{
                background: '#ffffff',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: '#374151', 
                  marginBottom: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}>
                  <FiEdit3 size={14} color="#10b981" /> CAPTION
                  <div style={{
                    background: task.contentCreator.content.captionScore >= 85 ? '#10b981' : task.contentCreator.content.captionScore >= 75 ? '#f59e0b' : '#ef4444',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    {task.contentCreator.content.seoAnalysis?.captionScore || 'N/A'}
                  </div>
                </div>
                <div style={{
                  fontSize: '15px',
                  color: '#374151',
                  lineHeight: 1.6
                }}>
                  {task.contentCreator.content.caption}
                </div>
              </div>
              
              <div style={{
                background: '#ffffff',
                padding: '20px',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}>
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '700', 
                  color: '#374151', 
                  marginBottom: '12px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}>
                  <FiHash size={14} color="#f59e0b" /> HASHTAGS
                  <div style={{
                    background: task.contentCreator.content.hashtagScore >= 85 ? '#10b981' : task.contentCreator.content.hashtagScore >= 75 ? '#f59e0b' : '#ef4444',
                    color: '#fff',
                    padding: '4px 8px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: '700'
                  }}>
                    {task.contentCreator.content.seoAnalysis?.hashtagScore || 'N/A'}
                  </div>
                </div>
                <div style={{
                  fontSize: '15px',
                  color: '#3b82f6',
                  fontWeight: '600',
                  lineHeight: 1.4
                }}>
                  {task.contentCreator.content.hashtag}
                </div>
              </div>
            </div>
            
            {/* SEO Analytics Section */}
            <div style={{
              background: '#ffffff',
              padding: '24px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
            }}>
              <h5 className="seo-heading-override" style={{ 
                margin: '0 0 20px 0', 
                fontSize: '16px', 
                fontWeight: '700', 
                color: '#000000 !important', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)'
              }}>
                <FiTrendingUp size={16} color="#10b981" /> SEO Analytics Dashboard
              </h5>
              
              <div style={{ display: 'grid', gap: '12px', fontSize: '12px' }}>
                {/* Basic Metrics */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280' }}>Word Count</span>
                  <span style={{ fontWeight: '600', color: '#1f2937' }}>{task.contentCreator.content.caption?.split(' ').length || 0}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280' }}>Character Count</span>
                  <span style={{ fontWeight: '600', color: '#1f2937' }}>{task.contentCreator.content.caption?.length || 0}</span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: '#6b7280' }}>Hashtag Count</span>
                  <span style={{ fontWeight: '600', color: '#1f2937' }}>{task.contentCreator.content.hashtag?.split('#').length - 1 || 0}</span>
                </div>
                
                {/* Sentiment Analysis */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Sentiment</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280' }}>Overall Tone</span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>{task.contentCreator?.content?.seoAnalysis?.sentiment?.tone || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ color: '#6b7280' }}>Confidence</span>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>{task.contentCreator?.content?.seoAnalysis?.sentiment?.confidence || 'N/A'}%</span>
                  </div>
                </div>
                
                {/* Power Words */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Power Words</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(task.contentCreator?.content?.seoAnalysis?.powerWords?.words || ['N/A']).map(word => (
                      <span key={word} style={{
                        background: '#fef3c7',
                        color: '#92400e',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Emotional Words */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Emotional Words</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(task.contentCreator?.content?.seoAnalysis?.emotionalWords?.words || ['N/A']).map(word => (
                      <span key={word} style={{
                        background: '#fce7f3',
                        color: '#be185d',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        fontSize: '11px',
                        fontWeight: '500'
                      }}>
                        {word}
                      </span>
                    ))}
                  </div>
                </div>
                
                {/* Common vs Uncommon Words */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Word Complexity</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280' }}>Common Words</span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>{task.contentCreator?.content?.seoAnalysis?.commonWords?.count || 'N/A'}%</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ color: '#6b7280' }}>Uncommon Words</span>
                    <span style={{ fontWeight: '600', color: '#f59e0b' }}>{task.contentCreator?.content?.seoAnalysis?.uncommonWords?.count || 'N/A'}%</span>
                  </div>
                </div>
                
                {/* Enhanced Readability */}
                <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '12px', marginTop: '8px' }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Readability Analysis</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#6b7280' }}>Grade Level</span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>{task.contentCreator?.content?.seoAnalysis?.readability?.gradeLevel || 'N/A'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ color: '#6b7280' }}>Reading Time</span>
                    <span style={{ fontWeight: '600', color: '#1f2937' }}>{task.contentCreator?.content?.seoAnalysis?.readability?.readingTime || 'N/A'} sec</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                    <span style={{ color: '#6b7280' }}>Flesch Score</span>
                    <span style={{ fontWeight: '600', color: '#10b981' }}>{task.contentCreator?.content?.seoAnalysis?.readability?.fleschScore || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
        <button
          onClick={() => onEdit(task)}
          style={{
            padding: '12px 24px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none', 
            borderRadius: '12px', 
            cursor: 'pointer', 
            fontSize: '14px',
            fontWeight: '700',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.3)';
          }}
        >
          <FiEdit3 size={14} /> Edit Task
        </button>
        <button
          onClick={() => onDelete(task)}
          style={{
            padding: '12px 24px', 
            background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
            color: 'white',
            border: 'none', 
            borderRadius: '12px', 
            cursor: 'pointer', 
            fontSize: '14px',
            fontWeight: '700',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 12px rgba(255, 107, 107, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          onMouseEnter={e => {
            e.target.style.transform = 'translateY(-1px)';
            e.target.style.boxShadow = '0 6px 16px rgba(255, 107, 107, 0.4)';
          }}
          onMouseLeave={e => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 12px rgba(255, 107, 107, 0.3)';
          }}
        >
          <FiTrash2 size={14} /> Delete
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
  const [deleteModal, setDeleteModal] = useState({ 
    isOpen: false, task: null, type: null 
  });
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    
    setLoading(true);
    
    const fetchTasks = async () => {
      try {
        // Fetch Content Creator tasks
        const creatorResponse = await cachedFetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/marketing/content-creator/task`);
        const creatorData = await creatorResponse.json();
        console.log("Content Creator tasks API response:", creatorData);
        setCreatorTasks(Array.isArray(creatorData.data) ? creatorData.data : []);
        
        // Fetch Graphic Designer tasks
        const designerResponse = await cachedFetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/marketing/graphic-designer/task`);
        const designerData = await designerResponse.json();
        console.log("Graphic Designer tasks API response:", designerData);
        setDesignerTasks(Array.isArray(designerData.data) ? designerData.data : []);
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setCreatorTasks([]);
        setDesignerTasks([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTasks();

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

  const handleDeleteClick = (task, type) => {
    setDeleteModal({ 
      isOpen: true, 
      task, 
      type,
      taskTitle: task.objectives || 'Untitled Task'
    });
  };

  const confirmDelete = async () => {
    const { task, type } = deleteModal;
    try {
      const taskId = task.id || task._id;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${encodeURIComponent(taskId)}`, {
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
    } finally {
      setDeleteModal({ isOpen: false, task: null, type: null });
    }
  };

  return (
    <div style={{ padding: '0', maxWidth: '100%' }}>
      {/* Header */}
      <div style={{
        marginBottom: '32px',
        padding: '24px',
        background: '#fff',
        borderRadius: '12px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h1 style={{
          fontSize: '32px',
          fontWeight: '800',
          color: '#111827',
          margin: 0,
          letterSpacing: '-0.025em'
        }}>
          Ongoing Tasks
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: '8px 0 0 0',
          fontWeight: '400'
        }}>
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
                  onDelete={(task) => handleDeleteClick(task, 'Content Creator')}
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
                  onDelete={(task) => handleDeleteClick(task, 'Graphic Designer')}
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
      
      {deleteModal.isOpen && (
        <DeleteModal
          isOpen={deleteModal.isOpen}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteModal({ isOpen: false, task: null, type: null })}
          taskTitle={deleteModal.taskTitle}
          taskType={deleteModal.type}
        />
      )}
    </div>
  );
}