import React, { useState, useEffect } from 'react';
import { componentStyles } from '../../styles/designSystem';

const Posting = () => {
  const [pendingWorkflows, setPendingWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [posting, setPosting] = useState({});

  useEffect(() => {
    fetchPendingPosts();
  }, []);

  const fetchPendingPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/approved`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setPendingWorkflows(data.data || []);
      }
    } catch (error) {
      console.error('❌ Error fetching pending posts:', error);
      setPendingWorkflows([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePostNow = async (workflowId) => {
    try {
      setPosting(prev => ({ ...prev, [workflowId]: true }));
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflow/${workflowId}/post-now`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.status === 'success') {
        // Remove from pending list
        setPendingWorkflows(prev => prev.filter(w => w.id !== workflowId));
        alert('Content posted successfully!');
      } else {
        alert('Failed to post content: ' + data.message);
      }
    } catch (error) {
      console.error('Error posting content:', error);
      alert('Error posting content');
    } finally {
      setPosting(prev => ({ ...prev, [workflowId]: false }));
    }
  };

  if (loading) {
    return (
      <div style={componentStyles.pageContainer}>
        <div style={{ marginBottom: '32px', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.025em' }}>Posting</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading pending posts...</div>
      </div>
    );
  }

  return (
    <div style={componentStyles.pageContainer}>
      <div style={{ marginBottom: '32px', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.025em' }}>Posting</h2>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: '8px 0 0 0', fontWeight: '400' }}>
          Approved content pending for posting ({pendingWorkflows.length} items)
        </p>
      </div>

      {pendingWorkflows.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
          <p>No content pending for posting.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {pendingWorkflows.map((workflow) => (
            <div key={workflow.id} style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '18px', fontWeight: '700' }}>{workflow.objectives}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Pending</span>
                    <span style={{ color: '#6b7280', fontSize: '14px' }}>Will post on: {formatDate(workflow.deadline)}</span>
                  </div>
                </div>
                <button
                  onClick={() => handlePostNow(workflow.id)}
                  disabled={posting[workflow.id]}
                  style={{
                    padding: '8px 16px',
                    background: posting[workflow.id] ? '#9ca3af' : 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: posting[workflow.id] ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    fontWeight: '600',
                    boxShadow: posting[workflow.id] ? 'none' : '0 2px 8px rgba(59, 130, 246, 0.3)'
                  }}
                >
                  {posting[workflow.id] ? 'Posting...' : 'Post Now'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Posting;