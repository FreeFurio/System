import React, { useState, useEffect } from 'react';
import { FiTarget, FiChevronDown } from 'react-icons/fi';

const WorkflowSelector = ({ selected, onChange }) => {
  const [workflows, setWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, []);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      // Fetch workflows from both content creator and marketing lead stages
      const responses = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/contentcreator`),
        fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/stage/marketinglead`)
      ]);
      
      const [contentData, marketingData] = await Promise.all(
        responses.map(res => res.json())
      );
      
      let allWorkflows = [];
      if (contentData.status === 'success') {
        allWorkflows = [...allWorkflows, ...contentData.data];
      }
      if (marketingData.status === 'success') {
        allWorkflows = [...allWorkflows, ...marketingData.data];
      }
      
      // Remove duplicates based on id
      const uniqueWorkflows = allWorkflows.filter((workflow, index, self) =>
        index === self.findIndex(w => w.id === workflow.id)
      );
      
      setWorkflows(uniqueWorkflows);
    } catch (error) {
      console.error('Error loading workflows:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        padding: '12px 16px',
        border: '2px solid #e5e7eb',
        borderRadius: '12px',
        background: '#f9fafb',
        color: '#6b7280',
        fontSize: '14px'
      }}>
        Loading workflows...
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      <label style={{
        display: 'block',
        fontSize: '14px',
        fontWeight: '600',
        color: '#374151',
        marginBottom: '8px',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}>
        <FiTarget size={14} color="#3b82f6" />
        Select Workflow (Optional)
      </label>
      
      <div style={{ position: 'relative' }}>
        <select
          value={selected?.id || ''}
          onChange={(e) => {
            const workflow = workflows.find(w => w.id === e.target.value);
            onChange(workflow || null);
          }}
          style={{
            width: '100%',
            padding: '12px 16px',
            paddingRight: '40px',
            borderRadius: '12px',
            border: '2px solid #e5e7eb',
            fontSize: '15px',
            outline: 'none',
            boxSizing: 'border-box',
            background: '#fafbfc',
            appearance: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
          onFocus={e => {
            e.target.style.borderColor = '#3b82f6';
            e.target.style.background = '#fff';
          }}
          onBlur={e => {
            e.target.style.borderColor = '#e5e7eb';
            e.target.style.background = '#fafbfc';
          }}
        >
          <option value="">No Workflow (Standalone Draft)</option>
          {workflows.map(workflow => (
            <option key={workflow.id} value={workflow.id}>
              {workflow.objectives || `Workflow ${workflow.id}`}
            </option>
          ))}
        </select>
        
        <FiChevronDown 
          size={16} 
          color="#6b7280"
          style={{
            position: 'absolute',
            right: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            pointerEvents: 'none'
          }}
        />
      </div>
      
      {selected && (
        <div style={{
          marginTop: '8px',
          padding: '8px 12px',
          background: '#f0f9ff',
          borderRadius: '6px',
          border: '1px solid #bae6fd',
          fontSize: '12px',
          color: '#0369a1'
        }}>
          Selected: {selected.objectives}
        </div>
      )}
    </div>
  );
};

export default WorkflowSelector;