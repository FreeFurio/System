import React, { useState, useEffect, useCallback } from 'react';
import adminService from '../../services/adminService';
import InsightsMetrics from '../../components/common/InsightsMetrics';
import SocialAccountCard from '../../components/common/SocialAccountCard';
import AccountInsightCard from '../../components/common/AccountInsightCard';
import { FiRefreshCw } from 'react-icons/fi';

const API_BASE_URL = import.meta.env.PROD 
  ? '/api/v1/admin' 
  : 'http://localhost:3000/api/v1/admin';

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
  const [modalStep, setModalStep] = useState('connect');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState(null);
  const [connectedTwitterAccounts, setConnectedTwitterAccounts] = useState([]);
  const [refreshingAccounts, setRefreshingAccounts] = useState(false);
  const [refreshStep, setRefreshStep] = useState('');
  const [refreshProgress, setRefreshProgress] = useState(0);
  const [refreshingInsights, setRefreshingInsights] = useState(false);
  const [insightsStep, setInsightsStep] = useState('');
  const [insightsProgress, setInsightsProgress] = useState(0);

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
    fetchConnectedTwitterAccounts();
    
    window.addEventListener('message', handleMessage);
    
    const handleStorageChange = (e) => {
      console.log('Storage event received:', e);
      if (e.key === 'facebookAuthResult') {
        try {
          const authData = JSON.parse(e.newValue);
          console.log('Facebook auth data from localStorage:', authData);
          handleMessage({ data: authData });
          localStorage.removeItem('facebookAuthResult');
        } catch (error) {
          console.error('Error parsing localStorage auth data:', error);
        }
      }
    };
    
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
    
    const pollInterval = setInterval(async () => {
      if (modalStep === 'loading') {
        // Try both specific session ID and 'latest'
        const sessionIds = currentSessionId ? [currentSessionId, 'latest'] : ['latest'];
        
        for (const sessionId of sessionIds) {
          console.log('🔥 MAIN: Polling API for session ID:', sessionId);
          try {
            const response = await fetch(`${API_BASE_URL}/get-auth-result/${sessionId}`);
            const result = await response.json();
            
            console.log('🔥 MAIN: API response for', sessionId, ':', result);
            
            if (result.success && result.data) {
              console.log('🔥 MAIN: Found auth data via API:', result.data);
              handleMessage({ data: result.data });
              return; // Stop polling once found
            }
          } catch (error) {
            console.log('❌ MAIN: Error polling API for', sessionId, ':', error);
          }
        }
        
        checkExistingAuthData();
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

  const fetchConnectedPages = async () => {
    try {
      const response = await adminService.getConnectedPages();
      setConnectedPages(response.pages || []);
    } catch (err) {
      console.error('Error fetching connected pages:', err);
    }
  };

  const fetchConnectedTwitterAccounts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/connected-twitter-accounts`);
      const data = await response.json();
      console.log('Twitter accounts data:', data.accounts);
      setConnectedTwitterAccounts(data.accounts || []);
    } catch (err) {
      console.error('Error fetching Twitter accounts:', err);
    }
  };

  const handleFacebookAuth = () => {
    console.log('Opening Facebook OAuth popup...');
    setIsAuthenticating(true);
    setModalStep('loading');
    
    const sessionId = Date.now().toString();
    setCurrentSessionId(sessionId);
    console.log('Generated session ID:', sessionId);
    
    window.facebookAuthParent = window;
    
    const popup = window.open(
      `${API_BASE_URL}/facebook-oauth?sessionId=${sessionId}`,
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
      const response = await fetch(`${API_BASE_URL}/connect-selected-page`, {
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

  const handleToggleActive = async (accountId, isActive) => {
    try {
      await adminService.toggleAccountActive(accountId, isActive);
      fetchConnectedPages();
      if (activeTab === 'insights') {
        fetchInsights();
      }
    } catch (error) {
      console.error('Error toggling account status:', error);
    }
  };

  const handleDeleteAccount = (account) => {
    setAccountToDelete(account);
    setShowDeleteModal(true);
  };

  const handleTwitterConnect = () => {
    window.open(
      `${API_BASE_URL}/twitter-oauth`,
      'twitter-auth',
      'width=600,height=700,scrollbars=yes,resizable=yes'
    );
  };

  const confirmDelete = async () => {
    try {
      if (accountToDelete.platform === 'twitter') {
        await fetch(`${API_BASE_URL}/twitter-account/${accountToDelete.id}`, {
          method: 'DELETE'
        });
        fetchConnectedTwitterAccounts();
      } else {
        await adminService.deleteAccount(accountToDelete.id);
        fetchConnectedPages();
      }
      setShowDeleteModal(false);
      setAccountToDelete(null);
      if (activeTab === 'insights') {
        fetchInsights();
      }
    } catch (error) {
      console.error('Error deleting account:', error);
    }
  };

  const fetchInsights = async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const facebookInsights = await Promise.all(
        connectedPages.map(async (account) => {
          try {
            const url = `${API_BASE_URL}/engagement/account/${account.id}${forceRefresh ? '?refresh=true' : ''}`;
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.success) {
              return {
                account: { ...account, platform: 'facebook' },
                engagement: data.data
              };
            } else {
              throw new Error(data.error || 'Failed to fetch engagement');
            }
          } catch (error) {
            console.error(`Failed to fetch engagement for ${account.name}:`, error);
            return {
              account: { ...account, platform: 'facebook' },
              engagement: {
                facebook: {
                  totalLikes: 0,
                  totalComments: 0,
                  totalShares: 0,
                  postsCount: 0
                },
                instagram: null
              }
            };
          }
        })
      );
      
      let twitterInsights = [];
      if (connectedTwitterAccounts.length > 0) {
        try {
          const url = `${API_BASE_URL}/twitter-data${forceRefresh ? '?refresh=true' : ''}`;
          const response = await fetch(url);
          const data = await response.json();
          
          if (data.success && data.insights) {
            twitterInsights = connectedTwitterAccounts.map(account => ({
              account: { ...account, platform: 'twitter' },
              engagement: { 
                twitter: data.insights,
                rateLimited: data.rateLimited,
                cached: data.cached
              }
            }));
          }
        } catch (error) {
          console.error('Failed to fetch Twitter insights:', error);
          twitterInsights = connectedTwitterAccounts.map(account => ({
            account: { ...account, platform: 'twitter' },
            engagement: { twitter: null }
          }));
        }
      }
      
      const accountInsights = [...facebookInsights, ...twitterInsights];
      
      setInsights(accountInsights);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '0', maxWidth: '100%' }}>
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
      
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
          Social Media Management
        </h1>
        <p style={{
          color: '#6b7280',
          fontSize: '16px',
          margin: '8px 0 0 0',
          fontWeight: '400'
        }}>
          Manage connected accounts and view analytics insights
        </p>
      </div>

      {/* Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        alignItems: 'center',
        marginBottom: '24px'
      }}>
        <button
          onClick={() => handleTabChange('socials')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'socials' ? '#3b82f6' : '#f3f4f6',
            color: activeTab === 'socials' ? 'white' : '#374151',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
        >
          Socials
        </button>
        <button
          onClick={() => handleTabChange('insights')}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            background: activeTab === 'insights' ? '#3b82f6' : '#f3f4f6',
            color: activeTab === 'insights' ? 'white' : '#374151',
            fontWeight: '600',
            cursor: 'pointer',
            fontSize: '14px',
            transition: 'all 0.2s ease'
          }}
        >
          Insights
        </button>
      </div>

      {/* Socials Section */}
      {activeTab === 'socials' && (
        <div>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #e5e7eb',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#1f2937', 
                margin: 0,
                paddingBottom: '12px',
                borderBottom: '2px solid #e5e7eb'
              }}>
                Connected Accounts
              </h2>
              <button
                onClick={async () => {
                  setRefreshingAccounts(true);
                  setRefreshProgress(0);
                  try {
                    setRefreshStep('Refreshing Facebook pages...');
                    setRefreshProgress(25);
                    await new Promise(resolve => setTimeout(resolve, 800));
                    await fetchConnectedPages();
                    
                    setRefreshStep('Refreshing Twitter accounts...');
                    setRefreshProgress(50);
                    await new Promise(resolve => setTimeout(resolve, 800));
                    await fetchConnectedTwitterAccounts();
                    
                    setRefreshStep('Finalizing updates...');
                    setRefreshProgress(75);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    setRefreshStep('Complete!');
                    setRefreshProgress(100);
                    await new Promise(resolve => setTimeout(resolve, 300));
                  } finally {
                    setRefreshingAccounts(false);
                    setRefreshStep('');
                    setRefreshProgress(0);
                  }
                }}
                disabled={refreshingAccounts}
                style={{
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: refreshingAccounts ? 'not-allowed' : 'pointer',
                  opacity: refreshingAccounts ? 0.6 : 1,
                  height: '36px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiRefreshCw size={14} style={{ animation: refreshingAccounts ? 'spin 1s linear infinite' : 'none' }} />
                {refreshingAccounts ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
          
            <div style={{ marginBottom: '30px' }}>
              <h4 style={{ color: '#1877f2', marginBottom: '15px', backgroundColor: 'inherit', background: 'none' }}>Facebook Pages</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {connectedPages.map(page => (
                  <SocialAccountCard
                    key={page.id}
                    platform="Facebook"
                    status="Connected"
                    accountInfo={`Page: ${page.name}`}
                    color="#1877f2"
                    account={page}
                    onToggleActive={handleToggleActive}
                    onDelete={handleDeleteAccount}
                  />
                ))}
                
                <div style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '20px',
                  background: '#f8f9fa',
                  textAlign: 'center'
                }}>
                  <h4 style={{ color: '#1877f2', marginBottom: '10px', backgroundColor: 'inherit', background: 'none' }}>Connect More Pages</h4>
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
            
            <div>
              <h4 style={{ color: '#1da1f2', marginBottom: '15px', backgroundColor: 'inherit', background: 'none' }}>Twitter Accounts</h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
                {connectedTwitterAccounts.map(account => (
                  <SocialAccountCard
                    key={account.id}
                    platform="Twitter"
                    status="Connected"
                    accountInfo={`@${account.username} • ${account.followersCount} followers`}
                    color="#1da1f2"
                    account={{...account, platform: 'twitter', tokenTimestamp: account.tokenTimestamp}}
                    onDelete={handleDeleteAccount}
                  />
                ))}
                
                <div style={{
                  border: '1px solid #e0e0e0',
                  borderRadius: '8px',
                  padding: '20px',
                  background: '#f8f9fa',
                  textAlign: 'center'
                }}>
                  <h4 style={{ color: '#1da1f2', marginBottom: '10px', backgroundColor: 'inherit', background: 'none' }}>Connect Twitter Account</h4>
                  <p style={{ color: '#666', margin: '10px 0' }}>Add your Twitter account to the system</p>
                  <button 
                    onClick={handleTwitterConnect}
                    style={{
                      background: '#1da1f2',
                      color: '#fff',
                      border: 'none',
                      padding: '12px 24px',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: '500'
                    }}
                  >
                    Connect Twitter Account
                  </button>
                </div>
              </div>
            </div>
            
            {/* Loading Overlay for Connected Accounts */}
            {refreshingAccounts && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'rgba(255,255,255,0.95)',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                minHeight: '400px'
              }}>
                <div style={{
                  textAlign: 'center',
                  padding: '20px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #e5e7eb',
                    borderTop: '3px solid #10b981',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 15px'
                  }}></div>
                  
                  <h4 style={{
                    margin: '0 0 8px 0',
                    color: '#1f2937',
                    fontSize: '16px',
                    fontWeight: '600',
                    background: 'transparent'
                  }}>
                    Refreshing Accounts
                  </h4>
                  
                  <p style={{
                    margin: '0 0 15px 0',
                    color: '#6b7280',
                    fontSize: '13px'
                  }}>
                    {refreshStep}
                  </p>
                  
                  <div style={{
                    width: '200px',
                    height: '6px',
                    background: '#e5e7eb',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    margin: '0 auto 8px'
                  }}>
                    <div style={{
                      width: `${refreshProgress}%`,
                      height: '100%',
                      background: '#10b981',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                  
                  <p style={{
                    margin: 0,
                    color: '#9ca3af',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>
                    {refreshProgress}% Complete
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Insights Section */}
      {activeTab === 'insights' && (
        <div>
          <div style={{
            background: '#fff',
            borderRadius: '12px',
            padding: '24px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            border: '1px solid #e5e7eb',
            position: 'relative',
            minHeight: '400px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ 
                fontSize: '1.25rem', 
                fontWeight: '600', 
                color: '#1f2937', 
                margin: 0,
                paddingBottom: '12px',
                borderBottom: '2px solid #e5e7eb'
              }}>
                Analytics & Insights
              </h2>
              <button
                onClick={async () => {
                  setRefreshingInsights(true);
                  setInsightsProgress(0);
                  try {
                    setInsightsStep('Fetching Facebook insights...');
                    setInsightsProgress(25);
                    await new Promise(resolve => setTimeout(resolve, 800));
                    
                    setInsightsStep('Fetching Twitter insights...');
                    setInsightsProgress(50);
                    await new Promise(resolve => setTimeout(resolve, 800));
                    
                    setInsightsStep('Processing analytics data...');
                    setInsightsProgress(75);
                    await fetchInsights(true);
                    await new Promise(resolve => setTimeout(resolve, 500));
                    
                    setInsightsStep('Complete!');
                    setInsightsProgress(100);
                    await new Promise(resolve => setTimeout(resolve, 300));
                  } finally {
                    setRefreshingInsights(false);
                    setInsightsStep('');
                    setInsightsProgress(0);
                  }
                }}
                disabled={refreshingInsights}
                style={{
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: refreshingInsights ? 'not-allowed' : 'pointer',
                  opacity: refreshingInsights ? 0.6 : 1,
                  height: '36px',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                <FiRefreshCw size={14} style={{ animation: refreshingInsights ? 'spin 1s linear infinite' : 'none' }} />
                {refreshingInsights ? 'Refreshing...' : 'Refresh Data'}
              </button>
            </div>
          
            {!refreshingInsights && (
              <>
                {loading && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#6b7280',
                    fontSize: '14px'
                  }}>
                    Loading insights...
                  </div>
                )}
              
                {error && (
                  <div style={{ 
                    background: '#fef2f2', 
                    border: '1px solid #fecaca', 
                    borderRadius: '8px', 
                    padding: '15px', 
                    color: '#dc2626',
                    marginBottom: '20px',
                    fontSize: '14px'
                  }}>
                    Error: {error}
                  </div>
                )}
              
                {insights && insights.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {insights.map((accountData) => (
                      <AccountInsightCard
                        key={accountData.account.id}
                        account={accountData.account}
                        engagement={accountData.engagement}
                      />
                    ))}
                  </div>
                )}
              
                {insights && insights.length === 0 && (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '40px', 
                    color: '#9ca3af',
                    fontSize: '14px'
                  }}>
                    No connected accounts found. Please connect your social media accounts first.
                  </div>
                )}
              </>
            )}
            
            {/* Loading Overlay for Insights */}
            {refreshingInsights && (
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: '#fff',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
                minHeight: '300px'
              }}>
                <div style={{
                  textAlign: 'center',
                  padding: '20px'
                }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    border: '3px solid #e5e7eb',
                    borderTop: '3px solid #10b981',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite',
                    margin: '0 auto 15px'
                  }}></div>
                  
                  <h4 style={{
                    margin: '0 0 8px 0',
                    color: '#1f2937',
                    fontSize: '16px',
                    fontWeight: '600',
                    background: 'transparent'
                  }}>
                    Refreshing Insights
                  </h4>
                  
                  <p style={{
                    margin: '0 0 15px 0',
                    color: '#6b7280',
                    fontSize: '13px'
                  }}>
                    {insightsStep}
                  </p>
                  
                  <div style={{
                    width: '200px',
                    height: '6px',
                    background: '#e5e7eb',
                    borderRadius: '3px',
                    overflow: 'hidden',
                    margin: '0 auto 8px'
                  }}>
                    <div style={{
                      width: `${insightsProgress}%`,
                      height: '100%',
                      background: '#10b981',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease'
                    }}></div>
                  </div>
                  
                  <p style={{
                    margin: 0,
                    color: '#9ca3af',
                    fontSize: '11px',
                    fontWeight: '500'
                  }}>
                    {insightsProgress}% Complete
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Facebook Modal */}
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
                        <h4 style={{ margin: '0 0 5px 0', background: 'transparent' }}>{page.name}</h4>
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

      {/* Delete Modal */}
      {showDeleteModal && accountToDelete && (
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
            maxWidth: '400px',
            width: '90%'
          }}>
            <h3 style={{ marginBottom: '15px', color: '#dc3545' }}>Delete Account</h3>
            <p style={{ marginBottom: '20px', color: '#666' }}>
              Are you sure you want to delete <strong>{accountToDelete.name}</strong>? 
              This action cannot be undone.
            </p>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setAccountToDelete(null);
                }}
                style={{
                  background: '#6c757d',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  background: '#dc3545',
                  color: '#fff',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialsAndInsights;