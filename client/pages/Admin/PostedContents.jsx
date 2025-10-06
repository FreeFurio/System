import React, { useState, useEffect } from 'react';
import { componentStyles } from '../../styles/designSystem';

const PostedContents = () => {
  const [postedWorkflows, setPostedWorkflows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeTab, setActiveTab] = useState('facebook');

  useEffect(() => {
    fetchPostedContents(activeTab);
  }, []);

  const fetchPostedContents = async (platform = 'facebook', isTabChange = false) => {
    try {
      if (isTabChange) {
        setTabLoading(true);
      } else {
        setLoading(true);
      }
      const API_BASE_URL = import.meta.env.PROD 
        ? '/api/v1/admin' 
        : 'http://localhost:3000/api/v1/admin';
      
      let endpoint;
      switch(platform) {
        case 'facebook':
          endpoint = `${API_BASE_URL}/facebook-posts`;
          break;
        case 'instagram':
          endpoint = `${API_BASE_URL}/instagram-posts`;
          break;
        case 'twitter':
          endpoint = `${API_BASE_URL}/twitter-posts`;
          break;
        default:
          endpoint = `${API_BASE_URL}/facebook-posts`;
      }
      
      const response = await fetch(endpoint);
      const data = await response.json();
      
      if (data.success) {
        setPostedWorkflows(data.posts || []);
      }
    } catch (error) {
      console.error('❌ Error fetching posted contents:', error);
      setPostedWorkflows([]);
    } finally {
      if (isTabChange) {
        setTabLoading(false);
      } else {
        setLoading(false);
      }
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    fetchPostedContents(tab, true);
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
        <p style={{ color: '#6b7280', fontSize: '16px', margin: '8px 0 16px 0', fontWeight: '400' }}>
          All content that has been posted ({postedWorkflows.length} items)
        </p>
        
        {/* Platform Tabs */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => handleTabChange('facebook')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'facebook' ? '#1877f2' : '#f3f4f6',
              color: activeTab === 'facebook' ? 'white' : '#374151',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Facebook
          </button>
          <button
            onClick={() => handleTabChange('instagram')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'instagram' ? '#e4405f' : '#f3f4f6',
              color: activeTab === 'instagram' ? 'white' : '#374151',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Instagram
          </button>
          <button
            onClick={() => handleTabChange('twitter')}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              background: activeTab === 'twitter' ? '#1da1f2' : '#f3f4f6',
              color: activeTab === 'twitter' ? 'white' : '#374151',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Twitter
          </button>
        </div>
      </div>

      {tabLoading ? (
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '40px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
          <p style={{ color: '#6b7280' }}>Loading {activeTab} posts...</p>
        </div>
      ) : postedWorkflows.length === 0 ? (
        <div style={{ background: '#ffffff', borderRadius: '16px', padding: '60px 40px', textAlign: 'center', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e5e7eb' }}>
          <p>No posted contents found.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
          {postedWorkflows.map((post) => {
            return (
              <div 
                key={post.id} 
                onClick={() => setSelectedPost(post)}
                style={{ 
                  background: '#ffffff', 
                  borderRadius: '8px', 
                  boxShadow: '0 1px 2px rgba(0, 0, 0, 0.1)', 
                  border: '1px solid #e4e6ea',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  ':hover': { transform: 'translateY(-2px)' }
                }}>
                {/* Minimal Card Header */}
                <div style={{ padding: '12px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                    {post.profilePicture ? (
                      <img 
                        src={post.profilePicture} 
                        alt={post.pageName}
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          marginRight: '8px',
                          objectFit: 'cover'
                        }}
                      />
                    ) : (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: activeTab === 'facebook' ? '#1877f2' : activeTab === 'instagram' ? '#e4405f' : '#1da1f2',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '14px',
                        marginRight: '8px'
                      }}>
                        {activeTab === 'facebook' ? 'f' : activeTab === 'instagram' ? 'ig' : 't'}
                      </div>
                    )}
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '14px', color: '#1c1e21' }}>
                        {post.pageName}
                      </div>
                      <div style={{ fontSize: '12px', color: '#65676b' }}>
                        {formatDate(post.createdTime)}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Post Content - Minimal or Full */}
                <div style={{ padding: '0 16px 12px' }}>
                  <div style={{ 
                    fontSize: '13px',
                    lineHeight: '1.4',
                    color: '#1c1e21',
                    whiteSpace: 'pre-wrap',
                    marginBottom: '12px'
                  }}>
                    {`${(post.message || post.caption || '').substring(0, 100)}${(post.message || post.caption || '').length > 100 ? '...' : ''}`}
                  </div>
                  
                  {/* Engagement Numbers */}
                  <div style={{ 
                    display: 'flex',
                    gap: '16px',
                    fontSize: '12px',
                    color: '#65676b',
                    borderTop: '1px solid #e4e6ea',
                    paddingTop: '8px'
                  }}>
                    {activeTab === 'facebook' && (
                      <>
                        <span>{post.reactions} reactions</span>
                        <span>{post.comments} comments</span>
                        <span>{post.shares} shares</span>
                      </>
                    )}
                    {activeTab === 'instagram' && (
                      <>
                        <span>{post.likes} likes</span>
                        <span>{post.comments} comments</span>
                      </>
                    )}
                    {activeTab === 'twitter' && (
                      <>
                        <span>{post.likes || 0} likes</span>
                        <span>{post.retweets || 0} retweets</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
      
      {/* Post Modal */}
      {selectedPost && (
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
            borderRadius: '8px',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              padding: '16px',
              borderBottom: '1px solid #e4e6ea'
            }}>
              {selectedPost.profilePicture ? (
                <img 
                  src={selectedPost.profilePicture} 
                  alt={selectedPost.pageName}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    marginRight: '12px',
                    objectFit: 'cover'
                  }}
                />
              ) : (
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: '#1877f2',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '16px',
                  marginRight: '12px'
                }}>
                  {selectedPost.pageName.charAt(0)}
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '15px', color: '#1c1e21' }}>
                  {selectedPost.pageName}
                </div>
                <div style={{ fontSize: '13px', color: '#65676b' }}>
                  {formatDate(selectedPost.createdTime)} · 🌐
                </div>
              </div>
              <button 
                onClick={() => setSelectedPost(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#65676b'
                }}
              >
                ×
              </button>
            </div>
            
            {/* Modal Content */}
            <div style={{ padding: '16px' }}>
              <div style={{ 
                fontSize: '15px',
                lineHeight: '1.33',
                color: '#1c1e21',
                whiteSpace: 'pre-wrap',
                marginBottom: '16px'
              }}>
                {selectedPost.message || selectedPost.caption || 'No content'}
              </div>
              
              {/* Post Image */}
              {(selectedPost.image || selectedPost.mediaUrl) && (
                <div style={{ marginBottom: '16px' }}>
                  <img 
                    src={selectedPost.image || selectedPost.mediaUrl} 
                    alt="Post content" 
                    style={{ 
                      width: '100%', 
                      maxHeight: '400px', 
                      objectFit: 'cover', 
                      borderRadius: '8px' 
                    }} 
                  />
                </div>
              )}
              
              {/* Modal Stats */}
              <div style={{ 
                display: 'flex',
                gap: '20px',
                padding: '12px',
                background: '#f8f9fa',
                borderRadius: '8px',
                fontSize: '14px'
              }}>
                {activeTab === 'facebook' && (
                  <>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: '#1877f2' }}>{selectedPost.reactions || 0}</div>
                      <div style={{ fontSize: '12px', color: '#65676b' }}>Reactions</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: '#42a5f5' }}>{selectedPost.comments || 0}</div>
                      <div style={{ fontSize: '12px', color: '#65676b' }}>Comments</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: '#66bb6a' }}>{selectedPost.shares || 0}</div>
                      <div style={{ fontSize: '12px', color: '#65676b' }}>Shares</div>
                    </div>
                  </>
                )}
                {activeTab === 'instagram' && (
                  <>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: '#e4405f' }}>{selectedPost.likes || 0}</div>
                      <div style={{ fontSize: '12px', color: '#65676b' }}>Likes</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: '#42a5f5' }}>{selectedPost.comments || 0}</div>
                      <div style={{ fontSize: '12px', color: '#65676b' }}>Comments</div>
                    </div>
                  </>
                )}
                {activeTab === 'twitter' && (
                  <>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: '#1da1f2' }}>{selectedPost.likes || 0}</div>
                      <div style={{ fontSize: '12px', color: '#65676b' }}>Likes</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontWeight: 'bold', color: '#17bf63' }}>{selectedPost.retweets || 0}</div>
                      <div style={{ fontSize: '12px', color: '#65676b' }}>Retweets</div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostedContents;