import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiUser, FiCalendar, FiTarget, FiEdit3, FiClock, FiSmartphone, FiBarChart, FiFileText } from 'react-icons/fi';
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa';
import PlatformDisplay from '../../components/common/PlatformDisplay';
import { useWorkflows, useAppDispatch } from '../../store/hooks';
import { fetchWorkflows } from '../../store/actions/workflowActions';
import { useDispatch } from 'react-redux';
import { setGeneratedContents } from '../../store/slices/contentSlice';

const SEORadial = ({ score, label, size = 60 }) => {
  const getColor = (score) => {
    if (score >= 85) return '#10b981';
    if (score >= 75) return '#f59e0b';
    return '#ef4444';
  };
  
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#e5e7eb"
            strokeWidth="4"
            fill="none"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={getColor(score)}
            strokeWidth="4"
            fill="none"
            strokeDasharray={strokeDasharray}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '12px',
          fontWeight: '700',
          color: getColor(score)
        }}>
          {score}
        </div>
      </div>
      <span style={{ fontSize: '12px', fontWeight: '600', color: '#374151', textAlign: 'center' }}>{label}</span>
    </div>
  );
};

const MultiPlatformContentModal = ({ workflow }) => {
  const [activeTab, setActiveTab] = useState('facebook');
  
  const getPlatformIcon = (platform) => {
    const icons = { 
      facebook: <FaFacebook color="#1877f2" size={16} />, 
      instagram: <FaInstagram color="#e4405f" size={16} />, 
      twitter: <FaTwitter color="#1da1f2" size={16} /> 
    };
    return icons[platform] || <FaFacebook color="#6b7280" size={16} />;
  };
  
  const getPlatformDisplayName = (platform) => {
    const names = { facebook: 'Facebook', instagram: 'Instagram', twitter: 'Twitter' };
    return names[platform] || platform;
  };
  
  const selectedContent = workflow.contentCreator?.content?.selectedContent || {};
  const seoAnalysis = workflow.contentCreator?.content?.seoAnalysis || {};
  const availablePlatforms = Object.keys(selectedContent);
  
  if (availablePlatforms.length === 0) {
    return (
      <div style={{
        marginTop: '0px',
        padding: '32px',
        background: '#f8f9fa',
        borderRadius: '8px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
        <div style={{ fontSize: '16px', color: '#6b7280' }}>No content available</div>
      </div>
    );
  }
  
  return (
    <div style={{
      marginTop: '0px',
      padding: '0px',
      background: 'transparent',
      borderRadius: '0px',
      border: 'none'
    }}>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'flex-start',
        marginBottom: '24px',
        paddingBottom: '12px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        <h4 style={{ 
          margin: 0, 
          color: '#374151', 
          fontSize: '16px', 
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📝 Multi-Platform Content
        </h4>
      </div>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '8px', 
        marginBottom: '20px'
      }}>
        {availablePlatforms.map(platform => (
          <button
            key={platform}
            onClick={() => setActiveTab(platform)}
            style={{
              padding: '12px 24px',
              background: '#ffffff',
              color: activeTab === platform ? '#1f2937' : '#6b7280',
              border: activeTab === platform ? '2px solid #fdba74' : '1px solid #e5e7eb',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {getPlatformIcon(platform)} {getPlatformDisplayName(platform)}
          </button>
        ))}
      </div>
      
      {selectedContent[activeTab] && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '0', marginBottom: '20px', alignItems: 'start' }}>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>📰 Headline</div>
              <div style={{ fontSize: '15px', color: '#374151', lineHeight: 1.4 }}>
                {selectedContent[activeTab].headline}
              </div>
            </div>
            
            <div style={{ 
              padding: '0', 
              background: '#f8fafc', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '140px'
            }}>
              <SEORadial score={seoAnalysis[activeTab]?.headlineScore || 0} label="Headline" />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '0', marginBottom: '20px', alignItems: 'start' }}>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>📝 Caption</div>
              <div style={{ fontSize: '15px', color: '#374151', lineHeight: 1.5 }}>
                {selectedContent[activeTab].caption}
              </div>
            </div>
            
            <div style={{ 
              padding: '0', 
              background: '#f8fafc', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '140px'
            }}>
              <SEORadial score={seoAnalysis[activeTab]?.captionScore || 0} label="Content" />
            </div>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '0', alignItems: 'start' }}>
            <div style={{
              padding: '16px',
              borderRadius: '12px',
              border: '1px solid #e5e7eb',
              background: '#f8fafc',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center'
            }}>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280', marginBottom: '8px' }}>🏷️ Hashtags</div>
              <div style={{ fontSize: '15px', color: '#3b82f6', fontWeight: 600 }}>
                {selectedContent[activeTab].hashtag}
              </div>
            </div>
            
            <div style={{ 
              padding: '0', 
              background: '#f8fafc', 
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '140px'
            }}>
              <SEORadial score={seoAnalysis[activeTab]?.overallScore || 0} label="Overall" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WorkflowCard = ({ workflow, onCreateContent }) => {
  const [contentExpanded, setContentExpanded] = useState(false);
  
  const getStatusColor = (status) => {
    switch (status) {
      case 'content_creation': return '#f59e0b';
      case 'content_approval': return '#f59e0b';
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
      case 'content_rejected': return 'Content Rejected - Needs Rework';
      case 'design_creation': return 'Design Creation';
      case 'design_approval': return 'Design Approval';
      case 'posted': return 'Posted';
      default: return 'In Progress';
    }
  };

  const getTaskIcon = () => {
    if (workflow.status === 'content_creation') return <FiEdit3 size={20} color="#fff" />;
    if (workflow.status === 'content_approval') return <FiEye size={20} color="#fff" />;
    return <FiFileText size={20} color="#fff" />;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const canCreateContent = (workflow.status === 'content_creation' || workflow.status === 'content_rejected') && workflow.currentStage === 'contentcreator';
  const hasSubmittedContent = workflow.contentCreator && workflow.contentCreator.content;

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
              Content Creation Task
            </h3>
            <p style={{
              margin: 0,
              color: '#6b7280',
              fontSize: '14px',
              fontWeight: '500',
              background: '#fff'
            }}>
              {workflow.createdAt ? `Created ${formatDate(workflow.createdAt)}` : 'Recently created'}
            </p>
          </div>
        </div>
        <span style={{
          background: workflow.status === 'content_rejected' ? '#fee2e2' : '#fed7aa',
          color: workflow.status === 'content_rejected' ? '#dc2626' : '#9a3412',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '11px',
          fontWeight: '600',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          border: '1px solid transparent'
        }}>
          {getStatusText(workflow.status)}
        </span>
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
          background: '#fff',
          marginBottom: '20px'
        }}>
          {workflow.objectives}
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
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>{workflow.gender}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiCalendar size={16} color="#10b981" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Age Range</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>{workflow.minAge}-{workflow.maxAge} years</div>
          </div>
        </div>
        {workflow.numContent && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiBarChart size={16} color="#f59e0b" />
            <div>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Content Count</div>
              <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>{workflow.numContent}</div>
            </div>
          </div>
        )}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiClock size={16} color="#ef4444" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Deadline</div>
            <div style={{ fontSize: '15px', fontWeight: '700', color: '#374151', background: '#fff' }}>{formatDate(workflow.deadline)}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FiSmartphone size={16} color="#8b5cf6" />
          <div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', background: '#fff' }}>Target Platforms</div>
            <PlatformDisplay platforms={workflow.selectedPlatforms || []} size="small" />
          </div>
        </div>
      </div>
      
      {workflow.status === 'content_rejected' && workflow.marketingRejection && (
        <div style={{
          background: '#fef2f2',
          borderRadius: '16px',
          padding: '24px',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          border: '2px solid #ef4444',
          marginBottom: '20px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: '#ef4444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '20px',
              color: '#fff'
            }}>⚠</div>
            <div>
              <h3 style={{ margin: 0, color: '#dc2626', fontSize: '18px', fontWeight: '700' }}>Content Rejected</h3>
              <p style={{ margin: 0, color: '#6b7280', fontSize: '14px' }}>Rejected on {formatDate(workflow.marketingRejection.rejectedAt)}</p>
            </div>
          </div>
          <div style={{
            background: '#fff',
            padding: '16px',
            borderRadius: '8px',
            border: '1px solid #fecaca'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>Feedback from Marketing Lead:</div>
            <div style={{ fontSize: '15px', color: '#1f2937', lineHeight: '1.5' }}>{workflow.marketingRejection.feedback}</div>
          </div>
        </div>
      )}
      
      {/* Submitted Content */}
      {hasSubmittedContent && (
        <div style={{
          background: 'transparent',
          padding: '20px',
          borderRadius: '12px',
          marginBottom: '20px',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '18px' }}>✨</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#0c4a6e !important', background: 'transparent !important' }}>Submitted Content</span>
            </div>
            <button
              onClick={() => setContentExpanded(!contentExpanded)}
              style={{
                background: 'none',
                border: 'none',
                color: '#0ea5e9',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '14px',
                fontWeight: '600'
              }}
            >
              <FiEye size={14} />
              {contentExpanded ? 'Hide' : 'View'} Details
            </button>
          </div>
          
          {contentExpanded && <MultiPlatformContentModal workflow={workflow} />}
        </div>
      )}
      
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
        {canCreateContent && (
          <button
            onClick={() => onCreateContent(workflow)}
            style={{
              background: '#10b981',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '12px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              height: '36px',
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-1px)';
              e.target.style.boxShadow = '0 4px 8px rgba(16, 185, 129, 0.3)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 2px 4px rgba(16, 185, 129, 0.2)';
            }}
          >
            <FiEdit3 size={14} /> Create Content
          </button>
        )}
      </div>
    </div>
  );
};

export default function Task() {
  const dispatch = useAppDispatch();
  const { items: allWorkflows, loading: workflowsLoading } = useWorkflows();
  const navigate = useNavigate();
  
  console.log('🔍 Task Debug - allWorkflows:', allWorkflows);
  console.log('🔍 Task Debug - allWorkflows length:', allWorkflows?.length);
  
  const workflows = allWorkflows?.filter(w => {
    console.log('🔍 Checking workflow:', { id: w.id, currentStage: w.currentStage, stage: w.stage, status: w.status });
    return w.currentStage === 'contentcreator' || w.stage === 'contentcreator';
  }) || [];
  
  console.log('🔍 Task Debug - filtered workflows:', workflows);
  console.log('🔍 Task Debug - filtered workflows length:', workflows.length);

  useEffect(() => {
    dispatch(fetchWorkflows());
  }, [dispatch]);

  const handleCreateContent = async (workflow) => {
    if (workflow.status === 'content_rejected') {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/drafts/workflow/${workflow.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        
        if (data.success && data.drafts && Object.keys(data.drafts).length > 0) {
          navigate('/content/output', { state: { workflowId: workflow.id, fromRejection: true } });
          return;
        }
      } catch (error) {
        console.error('Error checking draft:', error);
      }
    }
    
    navigate(`/content/create?taskId=${workflow.id}`);
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
          Content Writing Tasks
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: '8px 0 0 0',
          fontWeight: '400'
        }}>
          Manage and create content for assigned workflows
        </p>
      </div>

      {/* Content Creator Tasks */}
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
            Assigned Tasks
          </h2>
        
          {workflowsLoading ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px', 
              color: '#6b7280',
              fontSize: '14px'
            }}>
              Loading tasks...
            </div>
          ) : (
            Array.isArray(workflows) && workflows.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#9ca3af',
                fontSize: '14px'
              }}>
                No content creation tasks available.
              </div>
            ) : Array.isArray(workflows) ? (
              workflows.map(workflow => (
                <WorkflowCard 
                  key={workflow.id} 
                  workflow={workflow} 
                  onCreateContent={handleCreateContent}
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
    </div>
  );
}