import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CollapsibleSection = ({ title, children, defaultOpen = false, color = '#333' }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div style={{ marginBottom: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', overflow: 'hidden' }}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '12px 16px',
          background: isOpen ? color : '#f8f9fa',
          color: isOpen ? 'white' : color,
          cursor: 'pointer',
          fontWeight: '600',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          transition: 'all 0.3s ease'
        }}
      >
        <span>{title}</span>
        <span style={{ fontSize: '18px' }}>{isOpen ? '▼' : '▶'}</span>
      </div>
      {isOpen && (
        <div style={{ padding: '16px', background: '#fff' }}>
          {children}
        </div>
      )}
    </div>
  );
};


const JsonDisplay = ({ data, title }) => {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    return (
      <div style={{ padding: '12px', background: '#fff3cd', border: '1px solid #ffeaa7', borderRadius: '6px', color: '#856404' }}>
        ❌ No {title} data available
      </div>
    );
  }
  
  return (
    <pre style={{
      background: '#f8f9fa',
      padding: '16px',
      borderRadius: '6px',
      overflow: 'auto',
      fontSize: '13px',
      lineHeight: '1.4',
      border: '1px solid #e9ecef',
      maxHeight: '400px'
    }}>
      {JSON.stringify(data, null, 2)}
    </pre>
  );
};

const DebugPage = () => {
  const [debugData, setDebugData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDebugData();
  }, []);

  const fetchDebugData = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:3000/api/v1/debug-data');
      setDebugData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '20px' }}>Loading debug data...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>Error: {error}</div>;

  return (
    <div key={Date.now()} style={{ 
      padding: '24px', 
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      background: '#f5f7fa',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ 
          background: 'white', 
          padding: '24px', 
          borderRadius: '12px', 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          marginBottom: '24px'
        }}>
          <h1 style={{ margin: '0 0 8px 0', color: '#2d3748', fontSize: '28px' }}>🐛 API Debug Dashboard v2.0</h1>
          <p style={{ margin: '0', color: '#718096', fontSize: '16px' }}>Comprehensive Facebook & Instagram API data analysis</p>
        </div>

        {/* Facebook Section */}
        <div style={{ marginBottom: '24px' }}>
          <CollapsibleSection title="📘 Facebook Page Data" defaultOpen={true} color="#1877f2">
            <JsonDisplay data={debugData?.facebook?.page} title="page information" />
          </CollapsibleSection>
          
          <CollapsibleSection title={`📝 Facebook Posts (${debugData?.facebook?.posts?.length || 0})`} color="#1877f2">
            <JsonDisplay data={debugData?.facebook?.posts} title="posts" />
          </CollapsibleSection>
          
          <CollapsibleSection title="📊 Facebook Page Insights" color="#1877f2">
            <JsonDisplay data={debugData?.facebook?.pageInsights} title="page insights" />
          </CollapsibleSection>
          
          <CollapsibleSection title="⚙️ Facebook Page Settings" color="#1877f2">
            <JsonDisplay data={debugData?.facebook?.settings} title="page settings" />
          </CollapsibleSection>
          
          <CollapsibleSection title="👥 Facebook Page Roles" color="#1877f2">
            <JsonDisplay data={debugData?.facebook?.roles} title="page roles" />
          </CollapsibleSection>
        </div>

        {/* Instagram Section */}
        <div style={{ marginBottom: '24px' }}>
          <CollapsibleSection title="📷 Instagram Account Data" defaultOpen={true} color="#e4405f">
            <JsonDisplay data={debugData?.instagram?.account} title="account information" />
          </CollapsibleSection>
          
          <CollapsibleSection title={`🖼️ Instagram Media (${debugData?.instagram?.media?.length || 0})`} color="#e4405f">
            <JsonDisplay data={debugData?.instagram?.media} title="media" />
          </CollapsibleSection>
          
          <CollapsibleSection title="📈 Instagram Insights" color="#e4405f">
            <JsonDisplay data={debugData?.instagram?.insights} title="insights" />
          </CollapsibleSection>
        </div>

        <div style={{ textAlign: 'center' }}>
          <button 
            onClick={fetchDebugData}
            style={{
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
          >
            🔄 Refresh Debug Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;