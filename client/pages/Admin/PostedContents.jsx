import React, { useState, useEffect } from 'react';
import { componentStyles } from '../../styles/designSystem';

const PostedContents = () => {
  const [postedWorkflows, setPostedWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPostedContents();
  }, []);

  const fetchPostedContents = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/tasks/workflows/posted`);
      const data = await response.json();
      
      if (data.status === 'success') {
        setPostedWorkflows(data.data || []);
      }
    } catch (error) {
      console.error('❌ Error fetching posted contents:', error);
      setPostedWorkflows([]);
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

  if (loading) {
    return (
      <div style={componentStyles.pageContainer}>
        <div style={{ marginBottom: '32px', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.025em' }}>Posted Contents</h2>
        </div>
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>Loading posted contents...</div>
      </div>
    );
  }

  return (
    <div style={componentStyles.pageContainer}>
      <div style={{ marginBottom: '32px', padding: '24px', background: '#fff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)', border: '1px solid #e5e7eb' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', color: '#111827', margin: 0, letterSpacing: '-0.025em' }}>Posted Contents</h2>
        <p style={{ color: '#6b7280', fontSize: '16px', margin: '8px 0 0 0', fontWeight: '400' }}>
          All content that has been posted ({postedWorkflows.length} items)
        </p>
      </div>

      {postedWorkflows.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
          <p>No posted contents found.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {postedWorkflows.map((workflow) => {
            const content = workflow.contentCreator?.content;
            const designUrl = workflow.graphicDesigner?.designUrl || workflow.graphicDesigner?.designs?.designUrl;

            return (
              <div key={workflow.id} style={{ background: '#ffffff', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                  <div>
                    <h3 style={{ margin: '0 0 8px 0', color: '#1f2937', fontSize: '18px', fontWeight: '700' }}>{workflow.objectives}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>Posted</span>
                      <span style={{ color: '#6b7280', fontSize: '14px' }}>Posted: {formatDate(workflow.finalApproval?.approvedAt)}</span>
                    </div>
                  </div>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '20px', alignItems: 'start' }}>
                  <div>
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontWeight: '600', color: '#374151', marginRight: '8px' }}>Headline:</span>
                      <span style={{ color: '#6b7280' }}>{content?.headline || 'N/A'}</span>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontWeight: '600', color: '#374151', marginRight: '8px' }}>Caption:</span>
                      <span style={{ color: '#6b7280' }}>{content?.caption || 'N/A'}</span>
                    </div>
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{ fontWeight: '600', color: '#374151', marginRight: '8px' }}>Hashtags:</span>
                      <span style={{ color: '#6b7280' }}>{content?.hashtag || 'N/A'}</span>
                    </div>
                  </div>
                  
                  {designUrl && (
                    <div style={{ width: '120px' }}>
                      <img 
                        src={designUrl} 
                        alt="Design" 
                        style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PostedContents;