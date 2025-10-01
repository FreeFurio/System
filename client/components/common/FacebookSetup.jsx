import React, { useState } from 'react';
import { FiFacebook, FiCheck, FiAlertCircle } from 'react-icons/fi';

const FacebookSetup = () => {
  const [userToken, setUserToken] = useState('');
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPages = async () => {
    if (!userToken.trim()) {
      setError('Please enter your Facebook user access token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/social/facebook/pages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userAccessToken: userToken })
      });

      const data = await response.json();
      
      if (data.success) {
        setPages(data.data);
      } else {
        setError(data.error || 'Failed to fetch pages');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const setupPageToken = async (page) => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/v1/social/facebook/page-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userAccessToken: userToken,
          pageId: page.id 
        })
      });

      const data = await response.json();
      
      if (data.success) {
        setSelectedPage({
          ...page,
          pageAccessToken: data.data.pageAccessToken,
          pageInfo: data.data.pageInfo
        });
      } else {
        setError(data.error || 'Failed to get page token');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      maxWidth: '800px',
      margin: '0 auto',
      padding: '24px',
      background: '#fff',
      borderRadius: '16px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '24px'
      }}>
        <FiFacebook size={24} color="#1877f2" />
        <h2 style={{
          margin: 0,
          fontSize: '20px',
          fontWeight: '700',
          color: '#1f2937'
        }}>Facebook Page Setup</h2>
      </div>

      <div style={{ marginBottom: '24px' }}>
        <label style={{
          display: 'block',
          fontSize: '14px',
          fontWeight: '600',
          color: '#374151',
          marginBottom: '8px'
        }}>
          Facebook User Access Token
        </label>
        <input
          type="text"
          value={userToken}
          onChange={(e) => setUserToken(e.target.value)}
          placeholder="Enter your Facebook user access token"
          style={{
            width: '100%',
            padding: '12px 16px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box'
          }}
        />
        <button
          onClick={fetchPages}
          disabled={loading || !userToken.trim()}
          style={{
            marginTop: '12px',
            padding: '10px 20px',
            background: loading ? '#9ca3af' : '#1877f2',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '600',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Loading...' : 'Get My Pages'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px',
          background: '#fef2f2',
          border: '1px solid #fecaca',
          borderRadius: '8px',
          color: '#dc2626',
          fontSize: '14px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <FiAlertCircle size={16} />
          {error}
        </div>
      )}

      {pages.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1f2937',
            marginBottom: '16px'
          }}>Your Facebook Pages</h3>
          
          <div style={{ display: 'grid', gap: '12px' }}>
            {pages.map(page => (
              <div key={page.id} style={{
                padding: '16px',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div>
                  <div style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: '#1f2937'
                  }}>{page.name}</div>
                  <div style={{
                    fontSize: '12px',
                    color: '#6b7280'
                  }}>ID: {page.id}</div>
                </div>
                <button
                  onClick={() => setupPageToken(page)}
                  disabled={loading}
                  style={{
                    padding: '8px 16px',
                    background: '#10b981',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  Setup for Posting
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedPage && (
        <div style={{
          marginTop: '24px',
          padding: '20px',
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '12px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}>
            <FiCheck size={20} color="#10b981" />
            <h3 style={{
              margin: 0,
              fontSize: '16px',
              fontWeight: '600',
              color: '#0369a1'
            }}>Page Setup Complete!</h3>
          </div>
          
          <div style={{ fontSize: '14px', color: '#0369a1', lineHeight: '1.6' }}>
            <strong>{selectedPage.pageInfo.name}</strong> is now configured for native posting.
            <br />
            Posts will appear as native page content without "via CMS System" attribution.
            <br />
            <br />
            <strong>Page Access Token:</strong> {selectedPage.pageAccessToken.substring(0, 20)}...
            <br />
            <strong>Page ID:</strong> {selectedPage.pageInfo.id}
          </div>
        </div>
      )}
    </div>
  );
};

export default FacebookSetup;