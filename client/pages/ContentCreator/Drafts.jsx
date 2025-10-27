import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiFileText, FiClock, FiTrash2, FiEdit3, FiFolder, FiEye, FiTarget, FiRefreshCw } from 'react-icons/fi';
import DraftService from '../../services/draftService';

const DraftCard = ({ draft, draftId, category, workflowId, onDelete, onView, onDeleteConfirm }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDeleteConfirm(draftId, workflowId, category);
  };

  return (
    <div 
      onClick={() => onView(draft, draftId, category, workflowId)}
      style={{
        background: '#fff',
        border: '2px solid #e5e7eb',
        borderRadius: '16px',
        padding: '24px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
        position: 'relative'
      }}
      onMouseEnter={e => {
        e.target.style.borderColor = '#3b82f6';
        e.target.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.15)';
      }}
      onMouseLeave={e => {
        e.target.style.borderColor = '#e5e7eb';
        e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FiFileText size={16} color="#3b82f6" />
            <span style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
              {category === 'workflow' ? 'Task Draft' : 'Standalone Draft'}
            </span>
          </div>
          
          {category === 'workflow' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              <FiTarget size={12} color="#10b981" />
              <span style={{ fontSize: '12px', color: '#10b981', fontWeight: '600' }}>
                Task: {draft.content?.taskInfo?.objective || workflowId}
              </span>
            </div>
          )}
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <FiClock size={12} color="#6b7280" />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {formatDate(draft.updatedAt)}
            </span>
          </div>
        </div>
        
        <button
          onClick={handleDelete}
          style={{
            padding: '6px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            borderRadius: '6px',
            color: '#ef4444',
            transition: 'background 0.2s ease'
          }}
          onMouseEnter={e => e.target.style.background = '#fef2f2'}
          onMouseLeave={e => e.target.style.background = 'transparent'}
        >
          <FiTrash2 size={16} />
        </button>
      </div>

      {draft.content?.allGeneratedContent && (
        <div style={{ 
          padding: '12px',
          background: '#f8fafc',
          borderRadius: '8px',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '12px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
            🎯 {draft.content.totalVariations} Content Variations Generated
          </div>
          <div style={{ fontSize: '11px', color: '#6b7280' }}>
            All AI-generated options with SEO analysis saved
          </div>
        </div>
      )}

      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#374151', marginBottom: '6px' }}>
          📰 Content Preview
        </div>
        <div style={{ 
          fontSize: '14px', 
          color: '#1f2937', 
          lineHeight: '1.4',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          {draft.content?.allGeneratedContent 
            ? `${draft.content.totalVariations} content variations with full SEO analysis`
            : draft.content?.headline || 'Content variations available'}
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingTop: '12px',
        borderTop: '1px solid #e5e7eb'
      }}>
        <div style={{ fontSize: '12px', color: '#9ca3af' }}>
          {category === 'workflow' ? 'Workflow Content' : 'Standalone Content'}
        </div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '4px',
          fontSize: '12px', 
          color: '#3b82f6',
          fontWeight: '500'
        }}>
          <FiEye size={12} />
          Click to view
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, draftInfo }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1001
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '400px',
        width: '90%',
        textAlign: 'center'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          background: '#fef2f2',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 24px',
          border: '3px solid #fecaca'
        }}>
          <FiTrash2 size={28} color="#ef4444" />
        </div>
        
        <h3 style={{
          fontSize: '20px',
          fontWeight: '700',
          color: '#1f2937',
          margin: '0 0 12px 0'
        }}>
          Delete Draft?
        </h3>
        
        <p style={{
          color: '#6b7280',
          fontSize: '14px',
          margin: '0 0 24px 0',
          lineHeight: '1.5'
        }}>
          Are you sure you want to delete this {draftInfo?.category} draft? This action cannot be undone.
        </p>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={onClose}
            style={{
              background: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const DraftModal = ({ draft, isOpen, onClose, onEdit }) => {
  if (!isOpen || !draft) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '32px',
        maxWidth: '800px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937', margin: 0 }}>
            Draft Details
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              color: '#64748b',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ display: 'grid', gap: '24px' }}>
          {draft.content?.allGeneratedContent ? (
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginBottom: '12px' }}>
                🎯 All Generated Content Variations ({draft.content.totalVariations})
              </div>
              <div style={{ maxHeight: '400px', overflowY: 'auto', display: 'grid', gap: '16px' }}>
                {draft.content.allGeneratedContent.map((content, index) => (
                  <div key={content.id || index} style={{
                    background: '#f8fafc',
                    padding: '16px',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
                      Option {index + 1} - SEO Score: {content.seoScore}/100
                    </div>
                    <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                      <strong>📰 Headline:</strong> {content.headline || 'N/A'}
                    </div>
                    <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                      <strong>📝 Caption:</strong> {content.caption?.substring(0, 100) || 'N/A'}...
                    </div>
                    <div style={{ fontSize: '13px', color: '#6366f1' }}>
                      <strong>#️⃣ Hashtags:</strong> {content.hashtag || 'N/A'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#ef4444', marginBottom: '8px' }}>
                📰 Single Content Draft
              </div>
              <div style={{ 
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '14px'
              }}>
                This draft contains individual content selections.
              </div>
            </div>
          )}
        </div>

        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              background: '#6b7280',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Close
          </button>
          <button
            onClick={() => onEdit(draft)}
            style={{
              background: '#3b82f6',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              padding: '12px 24px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Edit Content
          </button>
        </div>
      </div>
    </div>
  );
};

export default function Drafts() {
  const [drafts, setDrafts] = useState({ workflow: {}, standalone: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDraft, setSelectedDraft] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteInfo, setDeleteInfo] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const userDrafts = await DraftService.getUserDrafts();
      
      // Enrich workflow drafts with task objectives if missing
      const enrichedDrafts = { ...userDrafts };
      for (const [workflowId, workflowDrafts] of Object.entries(userDrafts.workflow)) {
        for (const [draftId, draft] of Object.entries(workflowDrafts)) {
          if (!draft.content?.taskInfo?.objective) {
            try {
              const taskResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${workflowId}`);
              const taskData = await taskResponse.json();
              if (taskData.status === 'success') {
                enrichedDrafts.workflow[workflowId][draftId].content.taskInfo = {
                  id: workflowId,
                  objective: taskData.data.objectives
                };
              }
            } catch (err) {
              console.warn('Could not fetch task info for:', workflowId);
            }
          }
        }
      }
      
      setDrafts(enrichedDrafts);
    } catch (error) {
      setError('Failed to load drafts');
      console.error('Error loading drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDraftDelete = async (draftId, workflowId = null) => {
    try {
      await DraftService.deleteDraft(draftId, workflowId);
      await loadDrafts();
    } catch (error) {
      console.error('Error deleting draft:', error);
      setError('Failed to delete draft');
    }
  };

  const handleDraftView = (draft, draftId, category, workflowId) => {
    setSelectedDraft({ ...draft, id: draftId, category, workflowId });
    setShowModal(true);
  };

  const handleDeleteConfirm = (draftId, workflowId, category) => {
    setDeleteInfo({ draftId, workflowId, category });
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    try {
      await DraftService.deleteDraft(deleteInfo.draftId, deleteInfo.workflowId);
      await loadDrafts();
      setShowDeleteModal(false);
      setDeleteInfo(null);
    } catch (error) {
      console.error('Error deleting draft:', error);
      setError('Failed to delete draft');
    }
  };

  const handleEditDraft = (draft) => {
    setShowModal(false);
    // Navigate to output content with draft data
    navigate('/content/output', { 
      state: { 
        contents: draft.content?.allGeneratedContent || [],
        taskId: draft.workflowId,
        fromDraftEdit: true
      } 
    });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <FiRefreshCw size={32} color="#3b82f6" style={{ animation: 'spin 1s linear infinite' }} />
        <div style={{ fontSize: '16px', color: '#6b7280' }}>Loading drafts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: '#ef4444',
        background: '#fef2f2',
        borderRadius: '12px',
        border: '1px solid #fecaca',
        margin: '24px'
      }}>
        {error}
      </div>
    );
  }

  const hasWorkflowDrafts = Object.keys(drafts.workflow).length > 0;
  const hasStandaloneDrafts = Object.keys(drafts.standalone).length > 0;

  if (!hasWorkflowDrafts && !hasStandaloneDrafts) {
    return (
      <div style={{
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px'
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: '500px',
          background: '#fff',
          borderRadius: '24px',
          padding: '48px 32px',
          boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <div style={{
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            border: '3px solid #bae6fd'
          }}>
            <FiFileText size={36} color="#0369a1" />
          </div>
          
          <h2 style={{
            fontSize: '28px',
            fontWeight: '800',
            color: '#1f2937',
            margin: '0 0 12px 0',
            lineHeight: '1.2'
          }}>
            No Drafts Yet
          </h2>
          
          <p style={{
            fontSize: '16px',
            color: '#6b7280',
            margin: '0 0 32px 0',
            lineHeight: '1.6'
          }}>
            Your generated content will be automatically saved as drafts here. 
            Start creating content to see all your AI-generated variations with SEO analysis.
          </p>
          
          <button
            onClick={() => navigate('/content/create')}
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '12px',
              padding: '14px 28px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)'
            }}
            onMouseEnter={e => {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 20px rgba(59, 130, 246, 0.4)';
            }}
            onMouseLeave={e => {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
            }}
          >
            🚀 Create Your First Content
          </button>
          
          <div style={{
            marginTop: '24px',
            padding: '16px',
            background: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0'
          }}>
            <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginBottom: '8px' }}>
              💡 How Drafts Work
            </div>
            <div style={{ fontSize: '13px', color: '#6b7280', lineHeight: '1.5' }}>
              All your generated content variations are automatically saved as drafts, 
              so you never lose your AI-created content and SEO analysis.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '100%', margin: '0 auto' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '32px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <FiFileText size={28} color="#3b82f6" />
        <div>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '800',
            color: '#1f2937',
            margin: 0
          }}>
            Saved Drafts
          </h1>
          <p style={{
            color: '#6b7280',
            fontSize: '16px',
            margin: '4px 0 0 0'
          }}>
            Manage your saved content drafts with full SEO analysis
          </p>
        </div>
      </div>

      {hasWorkflowDrafts && (
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#374151',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FiTarget size={20} color="#10b981" />
Task Drafts
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '20px' 
          }}>
            {Object.entries(drafts.workflow).map(([workflowId, workflowDrafts]) => 
              Object.entries(workflowDrafts).map(([draftId, draft]) => (
                <DraftCard
                  key={draftId}
                  draft={draft}
                  draftId={draftId}
                  category="workflow"
                  workflowId={workflowId}
                  onDelete={handleDraftDelete}
                  onView={handleDraftView}
                  onDeleteConfirm={handleDeleteConfirm}
                />
              ))
            )}
          </div>
        </div>
      )}

      {hasStandaloneDrafts && (
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#374151',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FiEdit3 size={20} color="#8b5cf6" />
            Standalone Drafts
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', 
            gap: '20px' 
          }}>
            {Object.entries(drafts.standalone).map(([draftId, draft]) => (
              <DraftCard
                key={draftId}
                draft={draft}
                draftId={draftId}
                category="standalone"
                onDelete={handleDraftDelete}
                onView={handleDraftView}
                onDeleteConfirm={handleDeleteConfirm}
              />
            ))}
          </div>
        </div>
      )}

      <DraftModal
        draft={selectedDraft}
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onEdit={handleEditDraft}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={confirmDelete}
        draftInfo={deleteInfo}
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}