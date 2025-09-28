import React, { useState, useEffect } from 'react';
import { FiFileText, FiClock, FiTrash2, FiEdit3, FiFolder } from 'react-icons/fi';
import DraftService from '../services/draftService';

const DraftItem = ({ draft, draftId, onSelect, onDelete, category, workflowId = null }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this draft?')) {
      try {
        await onDelete(draftId, workflowId);
      } catch (error) {
        console.error('Error deleting draft:', error);
      }
    }
  };

  return (
    <div 
      onClick={() => onSelect(draft, draftId, category, workflowId)}
      style={{
        padding: '16px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        background: '#fff',
        marginBottom: '8px'
      }}
      onMouseEnter={e => {
        e.target.style.borderColor = '#3b82f6';
        e.target.style.boxShadow = '0 2px 8px rgba(59, 130, 246, 0.1)';
      }}
      onMouseLeave={e => {
        e.target.style.borderColor = '#e5e7eb';
        e.target.style.boxShadow = 'none';
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <FiFileText size={14} color="#3b82f6" />
            <span style={{ fontSize: '14px', fontWeight: '600', color: '#374151' }}>
              {draft.content?.input || 'Untitled Draft'}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <FiClock size={12} color="#6b7280" />
            <span style={{ fontSize: '12px', color: '#6b7280' }}>
              {formatDate(draft.updatedAt)}
            </span>
          </div>
          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
            Platform: {draft.platform || 'General'}
          </div>
        </div>
        <button
          onClick={handleDelete}
          style={{
            padding: '4px',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            borderRadius: '4px',
            color: '#ef4444'
          }}
          onMouseEnter={e => e.target.style.background = '#fef2f2'}
          onMouseLeave={e => e.target.style.background = 'transparent'}
        >
          <FiTrash2 size={14} />
        </button>
      </div>
    </div>
  );
};

const WorkflowDrafts = ({ workflowId, drafts, onSelect, onDelete }) => {
  return (
    <div style={{ marginBottom: '24px' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '12px',
        padding: '8px 12px',
        background: '#f0f9ff',
        borderRadius: '6px',
        border: '1px solid #bae6fd'
      }}>
        <FiFolder size={14} color="#0369a1" />
        <span style={{ fontSize: '13px', fontWeight: '600', color: '#0369a1' }}>
          Workflow: {workflowId}
        </span>
      </div>
      {Object.entries(drafts).map(([draftId, draft]) => (
        <DraftItem
          key={draftId}
          draft={draft}
          draftId={draftId}
          onSelect={onSelect}
          onDelete={onDelete}
          category="workflow"
          workflowId={workflowId}
        />
      ))}
    </div>
  );
};

const DraftsList = ({ onDraftSelect }) => {
  const [drafts, setDrafts] = useState({ workflow: {}, standalone: {} });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDrafts();
  }, []);

  const loadDrafts = async () => {
    try {
      setLoading(true);
      const userDrafts = await DraftService.getUserDrafts();
      setDrafts(userDrafts);
    } catch (error) {
      setError('Failed to load drafts');
      console.error('Error loading drafts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDraftSelect = (draft, draftId, category, workflowId = null) => {
    if (onDraftSelect) {
      onDraftSelect({
        ...draft,
        id: draftId,
        category,
        workflowId
      });
    }
  };

  const handleDraftDelete = async (draftId, workflowId = null) => {
    try {
      await DraftService.deleteDraft(draftId, workflowId);
      await loadDrafts(); // Reload drafts after deletion
    } catch (error) {
      console.error('Error deleting draft:', error);
      setError('Failed to delete draft');
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '24px',
        textAlign: 'center',
        color: '#6b7280'
      }}>
        Loading drafts...
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
        borderRadius: '8px',
        border: '1px solid #fecaca'
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
        padding: '24px',
        textAlign: 'center',
        color: '#6b7280',
        background: '#f9fafb',
        borderRadius: '8px',
        border: '1px solid #e5e7eb'
      }}>
        <FiFileText size={24} color="#9ca3af" style={{ marginBottom: '8px' }} />
        <div>No drafts found</div>
        <div style={{ fontSize: '12px', marginTop: '4px' }}>
          Create content and save as draft to see them here
        </div>
      </div>
    );
  }

  return (
    <div style={{
      background: '#fff',
      borderRadius: '12px',
      padding: '24px',
      border: '1px solid #e5e7eb',
      boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px',
        paddingBottom: '16px',
        borderBottom: '2px solid #e5e7eb'
      }}>
        <FiEdit3 size={20} color="#3b82f6" />
        <h3 style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: '700',
          color: '#1f2937'
        }}>
          Saved Drafts
        </h3>
      </div>

      {hasWorkflowDrafts && (
        <div style={{ marginBottom: '32px' }}>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Workflow Drafts
          </h4>
          {Object.entries(drafts.workflow).map(([workflowId, workflowDrafts]) => (
            <WorkflowDrafts
              key={workflowId}
              workflowId={workflowId}
              drafts={workflowDrafts}
              onSelect={handleDraftSelect}
              onDelete={handleDraftDelete}
            />
          ))}
        </div>
      )}

      {hasStandaloneDrafts && (
        <div>
          <h4 style={{
            fontSize: '14px',
            fontWeight: '600',
            color: '#374151',
            marginBottom: '16px',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            Standalone Drafts
          </h4>
          {Object.entries(drafts.standalone).map(([draftId, draft]) => (
            <DraftItem
              key={draftId}
              draft={draft}
              draftId={draftId}
              onSelect={handleDraftSelect}
              onDelete={handleDraftDelete}
              category="standalone"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DraftsList;