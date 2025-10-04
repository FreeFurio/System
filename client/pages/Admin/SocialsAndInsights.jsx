import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import InsightsMetrics from '../../components/common/InsightsMetrics';
import SocialAccountCard from '../../components/common/SocialAccountCard';

const SocialsAndInsights = () => {
  const [activeTab, setActiveTab] = useState('socials');
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [tokenSetup, setTokenSetup] = useState(null);
  const [showTokenModal, setShowTokenModal] = useState(false);
  const [connectedPages, setConnectedPages] = useState([]);
  const [showFacebookModal, setShowFacebookModal] = useState(false);
  const [availablePages, setAvailablePages] = useState([]);
  const [modalStep, setModalStep] = useState('connect'); // 'connect', 'loading', or 'select'
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);

  // Move handleMessage outside useEffect and use useCallback
  const handleMessage = useCallback((event) => {
    console.log('Message received:', event.data);
    
    if (event.data && event.data.type === 'FACEBOOK_OAUTH_SUCCESS') {
      console.log('Facebook OAuth success, pages:', event.data.pages);
      setAvailablePages(event.data.pages || []);
      setIsAuthenticating(false);
      setModalStep('select');
    } else if (event.data && event.data.type === 'FACEBOOK_PAGE_CONNECTED') {
      fetchConnectedPages();
      if (activeTab === 'insights') {
        fetchInsights();
      }
    }
  }, [activeTab]);

  useEffect(() => {
    fetchConnectedPages();
    
    window.addEventListener('message', handleMessage);
    
    // Also listen for localStorage changes (fallback communication)
    const handleStorageChange = (e) => {
      console.log('Storage event received:', e);
      if (e.key === 'facebookAuthResult') {
        try {
          const authData = JSON.parse(e.newValue);
          console.log('Facebook auth data from localStorage:', authData);
          handleMessage({ data: authData });
          // Clean up
          localStorage.removeItem('facebookAuthResult');
        } catch (error) {
          console.error('Error parsing localStorage auth data:', error);
        }
      }
    };
    
    // Check for existing data on mount
    const checkExistingAuthData = () => {
      const existingData = localStorage.getItem('facebookAuthResult');
      if (existingData) {
        try {
          const authData = JSON.parse(existingData);
          console.log('Found existing auth data:', authData);
          handleMessage({ data: authData });
          localStorage.removeItem('facebookAuthResult');
        } catch (error) {
          console.error('Error parsing existing auth data:', error);
        }
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    checkExistingAuthData();
    
    // Poll API for auth results when in loading state
    const pollInterval = setInterval(async () => {
      if (modalStep === 'loading' && currentSessionId) {
        console.log('🔥 MAIN: Polling API for session ID:', currentSessionId);
        try {
          const response = await fetch(`http://localhost:3000/api/v1/admin/get-auth-result/${currentSessionId}`);
          const result = await response.json();
          
          console.log('🔥 MAIN: API response:', result);
          
          if (result.success && result.data) {
            console.log('🔥 MAIN: Found auth data via API:', result.data);
            handleMessage({ data: result.data });
          } else {
            console.log('🔥 MAIN: No auth data found for session:', currentSessionId);
          }
        } catch (error) {
          console.log('❌ MAIN: Error polling API:', error);
        }
        
        // Also check localStorage as fallback
        checkExistingAuthData();
      } else if (modalStep === 'loading') {
        console.log('❌ MAIN: No session ID available for polling');
      }
    }, 1000);
    
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(pollInterval);
    };
  }, [activeTab, handleMessage, modalStep, currentSessionId]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'insights') {
      fetchInsights();
    }
  };

  const handleSetupFacebookTokens = async () => {
    try {
      setLoading(true);
      const setup = await adminService.setupFacebookTokens();
      setTokenSetup(setup.data);
      setShowTokenModal(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchConnectedPages = async () => {
    try {
      const response = await adminService.getConnectedPages();
      setConnectedPages(response.pages || []);
    } catch (err) {
      console.error('Error fetching connected pages:', err);
    }
  };

  const handleFacebookAuth = () => {
    console.log('Opening Facebook OAuth popup...');
    setIsAuthenticating(true);
    setModalStep('loading');
    
    // Generate session ID that will be used by OAuth callback
    const sessionId = Date.now().toString();
    setCurrentSessionId(sessionId);
    console.log('Generated session ID:', sessionId);
    
    // Store reference to current window in popup
    window.facebookAuthParent = window;
    
    const popup = window.open(
      `http://localhost:3000/api/v1/admin/facebook-oauth?sessionId=${sessionId}`,
      'facebook-auth',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );
    
    if (!popup) {
      console.error('Popup blocked by browser!');
      alert('Popup blocked! Please allow popups for this site and try again.');
      setModalStep('connect');
      setIsAuthenticating(false);
      return;
    }
    
    console.log('Popup opened successfully:', popup);
    console.log('Parent window stored as:', window);
    
    // Check if popup closes without sending message
    const checkClosed = setInterval(() => {
      if (popup.closed) {
        console.log('Popup closed without message');
        clearInterval(checkClosed);
        if (modalStep === 'loading') {
          console.log('Resetting modal to connect step');
          setModalStep('connect');
          setIsAuthenticating(false);
        }
      }
    }, 1000);
  };

  const connectPage = async (pageId, sessionId) => {
    try {
      const response = await fetch('http://localhost:3000/api/v1/admin/connect-selected-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId, sessionId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        fetchConnectedPages();
        setAvailablePages(prev => prev.filter(p => p.id !== pageId));
      }
    } catch (error) {
      console.error('Error connecting page:', error);
    }
  };

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching insights data...');
      const [pageInsights, instagramInsights, facebookEngagement, instagramEngagement] = await Promise.allSettled([
        adminService.getPageInsights(),
        adminService.getInstagramInsights(),
        adminService.getFacebookEngagement(),
        adminService.getInstagramEngagement()
      ]);
      
      const results = {
        pageInsights: pageInsights.status === 'fulfilled' ? pageInsights.value.data : null,
        instagramInsights: instagramInsights.status === 'fulfilled' ? instagramInsights.value.data : null,
        facebookEngagement: facebookEngagement.status === 'fulfilled' ? facebookEngagement.value.data : null,
        instagramEngagement: instagramEngagement.status === 'fulfilled' ? instagramEngagement.value.data : null
      };
      
      setInsights(results);
      
      const failedRequests = [
        pageInsights.status === 'rejected' ? 'Facebook Page' : null,
        instagramInsights.status === 'rejected' ? 'Instagram' : null,
        facebookEngagement.status === 'rejected' ? 'Facebook Engagement' : null,
        instagramEngagement.status === 'rejected' ? 'Instagram Engagement' : null
      ].filter(Boolean);
      
      if (failedRequests.length > 0) {
        setError(`Some data failed to load: ${failedRequests.join(', ')}`);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', background: '#fff', minHeight: '80vh' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2 style={{ color: '#333', marginBottom: '20px' }}>Social Media Management</h2>
        
        <div style={{ display: 'flex', borderBottom: '2px solid #e0e0e0' }}>
          <button
            onClick={() => handleTabChange('socials')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: activeTab === 'socials' ? '#007bff' : 'transparent',
              color: activeTab === 'socials' ? '#fff' : '#666',
              cursor: 'pointer',
              borderRadius: '8px 8px 0 0',
              fontWeight: '500'
            }}
          >
            Socials
          </button>
          <button
            onClick={() => handleTabChange('insights')}
            style={{
              padding: '12px 24px',
              border: 'none',
              background: activeTab === 'insights' ? '#007bff' : 'transparent',
              color: activeTab === 'insights' ? '#fff' : '#666',
              cursor: 'pointer',
              borderRadius: '8px 8px 0 0',
              fontWeight: '500'
            }}
          >
            Insights
          </button>
        </div>
      </div>

      {activeTab === 'socials' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#333', margin: 0 }}>Connected Accounts</h3>
            <button
              onClick={fetchConnectedPages}
              style={{
                background: '#28a745',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Refresh
            </button>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
            {connectedPages.map(page => (
              <SocialAccountCard
                key={page.id}
                platform="Facebook"
                status="Connected"
                accountInfo={`Page: ${page.name}`}
                color="#1877f2"
                onManage={() => console.log('Manage', page.name)}
              />
            ))}
            
            <div style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '20px',
              background: '#f8f9fa',
              textAlign: 'center'
            }}>
              <h4 style={{ color: '#1877f2', marginBottom: '10px' }}>Connect More Pages</h4>
              <p style={{ color: '#666', margin: '10px 0' }}>Add your Facebook Pages to the system</p>
              <button 
                onClick={() => {
                  setModalStep('connect');
                  setShowFacebookModal(true);
                }}
                style={{
                  background: '#1877f2',
                  color: '#fff',
                  border: 'none',
                  padding: '12px 24px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500'
                }}
              >
                Connect Facebook Pages
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'insights' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#333', margin: 0 }}>Analytics & Insights</h3>
            <button
              onClick={fetchInsights}
              disabled={loading}
              style={{
                background: '#28a745',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1
              }}
            >
              {loading ? 'Refreshing...' : 'Refresh Data'}
            </button>
          </div>
          
          {loading && (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <p>Loading insights...</p>
            </div>
          )}
          
          {error && (
            <div style={{ 
              background: '#fee', 
              border: '1px solid #fcc', 
              borderRadius: '4px', 
              padding: '15px', 
              color: '#c33',
              marginBottom: '20px'
            }}>
              Error: {error}
            </div>
          )}
          
          {insights && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {insights.pageInsights && (
                <InsightsMetrics
                  title="Facebook Insights"
                  color="#1877f2"
                  metrics={[
                    { label: 'Page Name', value: insights.pageInsights.pageName || 'N/A' },
                    { label: 'Total Fans', value: insights.pageInsights.fanCount || 0 },
                    { label: 'Talking About', value: insights.pageInsights.talkingAbout || 0 }
                  ]}
                />
              )}
              
              {insights.instagramInsights && (
                <InsightsMetrics
                  title="Instagram Insights"
                  color="#e4405f"
                  metrics={[
                    { label: 'Account Name', value: insights.instagramInsights.accountName || 'N/A' },
                    { label: 'Followers', value: insights.instagramInsights.followersCount || 0 },
                    { label: 'Media Count', value: insights.instagramInsights.mediaCount || 0 }
                  ]}
                />
              )}
              
              {insights.facebookEngagement && (
                <InsightsMetrics
                  title="Facebook Engagement"
                  color="#1877f2"
                  metrics={[
                    { label: 'Total Likes', value: insights.facebookEngagement.totalLikes || 0 },
                    { label: 'Total Comments', value: insights.facebookEngagement.totalComments || 0 },
                    { label: 'Total Shares', value: insights.facebookEngagement.totalShares || 0 }
                  ]}
                />
              )}
              
              {insights.instagramEngagement && (
                <InsightsMetrics
                  title="Instagram Engagement"
                  color="#e4405f"
                  metrics={[
                    { label: 'Total Likes', value: insights.instagramEngagement.totalLikes || 0 },
                    { label: 'Total Comments', value: insights.instagramEngagement.totalComments || 0 },
                    { label: 'Recent Posts', value: insights.instagramEngagement.postsCount || 0 }
                  ]}
                />
              )}
            </div>
          )}
          
          {insights && !insights.pageInsights && !insights.instagramInsights && !insights.facebookEngagement && !insights.instagramEngagement && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
              <p>No insights data available. Please check your social media API configuration.</p>
            </div>
          )}
        </div>
      )}

      {showFacebookModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            {modalStep === 'connect' && (
              <div>
                <h3 style={{ marginBottom: '20px' }}>Connect Facebook Pages</h3>
                <p style={{ marginBottom: '20px', color: '#666' }}>
                  Connect your Facebook pages to start managing social media content.
                </p>
                <button
                  onClick={handleFacebookAuth}
                  style={{
                    background: '#1877f2',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '16px',
                    marginRight: '10px'
                  }}
                >
                  Authorize Facebook
                </button>
                <button
                  onClick={() => setShowFacebookModal(false)}
                  style={{
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    padding: '12px 24px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
            
            {modalStep === 'loading' && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <h3 style={{ marginBottom: '20px' }}>Authenticating with Facebook...</h3>
                <p style={{ color: '#666' }}>Please complete the authorization in the popup window.</p>
                <button
                  onClick={() => {
                    setShowFacebookModal(false);
                    setModalStep('connect');
                    setIsAuthenticating(false);
                  }}
                  style={{
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '20px'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
            
            {modalStep === 'select' && (
              <div>
                <h3 style={{ marginBottom: '20px' }}>Select Pages to Connect</h3>
                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                  {availablePages.map(page => (
                    <div key={page.id} style={{
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      padding: '15px',
                      margin: '10px 0',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center'
                    }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0' }}>{page.name}</h4>
                        <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                          {page.category} • {page.fan_count || 0} fans
                        </p>
                      </div>
                      <button
                        onClick={() => connectPage(page.id, page.sessionId)}
                        style={{
                          background: '#28a745',
                          color: '#fff',
                          border: 'none',
                          padding: '8px 16px',
                          borderRadius: '4px',
                          cursor: 'pointer'
                        }}
                      >
                        Connect
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  onClick={() => setShowFacebookModal(false)}
                  style={{
                    background: '#6c757d',
                    color: '#fff',
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    marginTop: '20px'
                  }}
                >
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {showTokenModal && tokenSetup && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: '#fff',
            padding: '30px',
            borderRadius: '8px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '20px' }}>Facebook Token Setup</h3>
            <p style={{ marginBottom: '15px' }}>Click the link below to authorize Facebook and get page tokens:</p>
            <a 
              href={tokenSetup.authUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              style={{
                display: 'inline-block',
                background: '#1877f2',
                color: '#fff',
                padding: '10px 20px',
                textDecoration: 'none',
                borderRadius: '4px',
                marginBottom: '15px'
              }}
            >
              Authorize Facebook
            </a>
            <p style={{ fontSize: '14px', color: '#666' }}>
              {tokenSetup.instructions}
            </p>
            <button 
              onClick={() => setShowTokenModal(false)}
              style={{
                background: '#6c757d',
                color: '#fff',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                marginTop: '20px'
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialsAndInsights;
