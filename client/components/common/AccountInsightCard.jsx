import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AccountInsightCard = ({ account, engagement, platformFilter }) => {
  const fbData = engagement?.facebook || {};
  const igData = engagement?.instagram;
  const twitterData = engagement?.twitter;
  
  const fbTotal = (fbData.totalReactions || 0) + (fbData.totalComments || 0) + (fbData.totalShares || 0);
  const igTotal = igData ? ((igData.likes || 0) + (igData.comments || 0)) : 0;
  
  const fbChartData = fbData.historicalData && fbData.historicalData.length > 0 
    ? [
        { date: '', total: null, time: '', invisible: true },
        ...fbData.historicalData,
        { date: '', total: null, time: '', invisible: true }
      ]
    : [
        { date: '', total: null, time: '', invisible: true },
        { date: 'Oct 7', total: fbTotal, time: '12:00 AM' },
        { date: '', total: null, time: '', invisible: true }
      ];
  const igChartData = igData?.historicalData && igData.historicalData.length > 0
    ? [
        { name: '', total: null, invisible: true },
        ...igData.historicalData.map(point => ({
          ...point,
          name: point.name || point.date || 'Current'
        })),
        { name: '', total: null, invisible: true }
      ]
    : igData ? [
        { name: '', total: null, invisible: true },
        { name: 'Current', total: igTotal },
        { name: '', total: null, invisible: true }
      ] : null;
  
  // Platform-specific rendering
  if (platformFilter === 'twitter' || account.platform === 'twitter') {
    console.log('Twitter Data:', twitterData);
    console.log('Top Post:', twitterData?.topPost);
    console.log('Recent Post:', twitterData?.recentPost);
    
    const twitterChartData = twitterData?.historicalData && twitterData.historicalData.length > 0
      ? [
          { date: '', total: null, time: '', invisible: true },
          ...twitterData.historicalData,
          { date: '', total: null, time: '', invisible: true }
        ]
      : [
          { date: '', total: null, time: '', invisible: true },
          { date: 'Current', total: twitterData?.totalEngagement || 0, time: '12:00 AM' },
          { date: '', total: null, time: '', invisible: true }
        ];
    
    return (
      <div style={{
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '20px',
        background: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {account.profilePicture ? (
            <img 
              src={account.profilePicture} 
              alt={account.name}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : null}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: account.platform === 'twitter' ? '#1da1f2' : '#1877f2',
            display: account.profilePicture ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            {(account.name || account.username || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ 
              margin: '0 0 5px 0', 
              color: '#1da1f2',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              @{account.username}
            </h3>
            <p style={{ 
              margin: 0, 
              color: '#666', 
              fontSize: '14px' 
            }}>
              {account.name} • {account.followersCount || 0} followers
            </p>
          </div>
        </div>
        
        {twitterData ? (
          <div>
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ margin: '0 0 10px 0', color: '#1da1f2', fontSize: '14px' }}>Twitter Engagement History</h4>
              <div style={{ height: '150px', marginBottom: '10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={twitterChartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" domain={['dataMin', 'dataMax']} type="category" />
                    <YAxis domain={[0, 'dataMax + 10']} tickFormatter={(value) => Math.round(value)} />
                    <Tooltip 
                      formatter={(value, name) => [value, 'Total Engagement']}
                      labelFormatter={(label, payload) => {
                        if (payload && payload[0] && payload[0].payload.time) {
                          return `${label} at ${payload[0].payload.time}`;
                        }
                        return label;
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#1da1f2" 
                      strokeWidth={3} 
                      connectNulls={false}
                      dot={(props) => {
                        if (props.payload?.invisible) {
                          return null;
                        }
                        return <circle key={`twitter-${props.cx}-${props.cy}`} cx={props.cx} cy={props.cy} r={6} fill="#1da1f2" />;
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '15px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1da1f2' }}>{twitterData.totalTweets || 0}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Recent Tweets</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{twitterData.totalEngagement || 0}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Total Engagement</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>{twitterData.avgEngagementPerTweet || 0}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Avg per Tweet</div>
              </div>
            </div>
            
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '15px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e91e63' }}>{twitterData.totalLikes || 0}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Likes</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>{twitterData.totalRetweets || 0}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Retweets</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff9800' }}>{twitterData.totalReplies || 0}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Replies</div>
              </div>
            </div>
            
            {/* Top Post Section */}
            {twitterData.topPost && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#fbbf24', fontSize: '14px' }}>🏆 Top Tweet</h4>
                <div style={{ 
                  background: '#fffbeb',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  fontSize: '12px',
                  color: '#666',
                  border: '1px solid #fbbf24'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#f59e0b' }}>
                    {new Date(twitterData.topPost.createdTime).toLocaleDateString()}
                  </div>
                  <div>{twitterData.topPost.text.substring(0, 100)}{twitterData.topPost.text.length > 100 ? '...' : ''}</div>
                </div>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '15px',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e91e63' }}>{twitterData.topPost.likes || 0}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Likes</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>{twitterData.topPost.retweets || 0}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Retweets</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff9800' }}>{twitterData.topPost.replies || 0}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Replies</div>
                  </div>
                </div>
              </div>
            )}
            
            {/* Recent Post Section */}
            {twitterData.recentPost && (
              <div style={{ marginBottom: '20px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#1da1f2', fontSize: '14px' }}>Recent Tweet</h4>
                <div style={{ 
                  background: '#f8f9fa',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '10px',
                  fontSize: '12px',
                  color: '#666'
                }}>
                  <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                    {new Date(twitterData.recentPost.createdTime).toLocaleDateString()}
                  </div>
                  <div>{twitterData.recentPost.text.substring(0, 100)}{twitterData.recentPost.text.length > 100 ? '...' : ''}</div>
                </div>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '15px',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e91e63' }}>{twitterData.recentPost.likes || 0}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Likes</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>{twitterData.recentPost.retweets || 0}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Retweets</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff9800' }}>{twitterData.recentPost.replies || 0}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>Replies</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : null}
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#999',
          borderTop: '1px solid #f0f0f0',
          paddingTop: '10px',
          marginTop: '20px'
        }}>
          <span>Platform: Twitter</span>
          <span>Connected: {new Date(account.connectedAt).toLocaleDateString()}</span>
        </div>
      </div>
    );
  }

  // Instagram-specific rendering
  if (platformFilter === 'instagram' && igData) {
    return (
      <div style={{
        border: '1px solid #e0e0e0',
        borderRadius: '12px',
        padding: '20px',
        background: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
      }}>
        <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
          {account.profilePicture ? (
            <img 
              src={account.profilePicture} 
              alt={account.name}
              crossOrigin="anonymous"
              referrerPolicy="no-referrer"
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          ) : null}
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: '#e4405f',
            display: account.profilePicture ? 'none' : 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '16px'
          }}>
            {(account.name || 'U').charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 style={{ 
              margin: '0 0 5px 0', 
              color: '#333',
              fontSize: '18px',
              fontWeight: '600'
            }}>
              {account.name}
            </h3>
            <p style={{ 
              margin: 0, 
              color: '#666', 
              fontSize: '14px' 
            }}>
              {account.category} • {account.fanCount || 0} followers
            </p>
          </div>
        </div>

        {igData && (
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ margin: '0 0 10px 0', color: '#e4405f', fontSize: '14px' }}>Instagram Engagement History</h4>
            <div style={{ height: '200px', marginBottom: '10px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={igChartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 'dataMax + 10']} tickFormatter={(value) => Math.round(value)} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#e4405f" 
                    strokeWidth={3} 
                    connectNulls={false}
                    dot={(props) => {
                      if (props.payload?.invisible) {
                        return null;
                      }
                      return <circle key={`instagram-${props.cx}-${props.cy}`} cx={props.cx} cy={props.cy} r={6} fill="#e4405f" />;
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {igData && (
          <>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(5, 1fr)',
              gap: '20px',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e4405f' }}>{igData.reach || 0}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Reach</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e91e63' }}>{igData.likes || 0}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Likes</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{igData.comments || 0}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Comments</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4caf50' }}>{igData.shares || 0}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Shares</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1da1f2' }}>{igData.follows || 0}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>New Follows</div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
              <div style={{ borderRadius: '8px', padding: '15px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#fbbf24', fontSize: '14px' }}>🏆 Top Post</h4>
                {igData.topPost ? (
                  <div>
                    <div style={{ background: '#fffbeb', padding: '12px', borderRadius: '8px', marginBottom: '10px', fontSize: '12px', color: '#666', border: '1px solid #fbbf24' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#f59e0b' }}>
                        {new Date(igData.topPost.timestamp).toLocaleDateString()}
                      </div>
                      <div>{igData.topPost.caption.substring(0, 100)}{igData.topPost.caption.length > 100 ? '...' : ''}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', textAlign: 'center' }}>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e91e63' }}>{igData.topPost.likes || 0}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Likes</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>{igData.topPost.comments || 0}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Comments</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#666', fontSize: '14px' }}>No posts found</div>
                )}
              </div>
              
              <div style={{ borderRadius: '8px', padding: '15px' }}>
                <h4 style={{ margin: '0 0 15px 0', color: '#e4405f', fontSize: '14px' }}>Recent Post</h4>
                {igData.recentPost ? (
                  <div>
                    <div style={{ background: '#f8f9fa', padding: '12px', borderRadius: '8px', marginBottom: '10px', fontSize: '12px', color: '#666' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                        {new Date(igData.recentPost.timestamp).toLocaleDateString()}
                      </div>
                      <div>{igData.recentPost.caption.substring(0, 100)}{igData.recentPost.caption.length > 100 ? '...' : ''}</div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', textAlign: 'center' }}>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e91e63' }}>{igData.recentPost.likes || 0}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Likes</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>{igData.recentPost.comments || 0}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>Comments</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ color: '#666', fontSize: '14px' }}>No recent posts found</div>
                )}
              </div>
            </div>
          </>
        )}

        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          fontSize: '11px',
          color: '#999',
          borderTop: '1px solid #f0f0f0',
          paddingTop: '10px'
        }}>
          <span>Platform: Instagram</span>
          {igData && <span>Posts: {igData.postsCount || 0}</span>}
          <span>Connected: {new Date(account.connectedAt).toLocaleDateString()}</span>
        </div>
      </div>
    );
  }

  // Facebook-specific rendering
  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '20px',
      background: '#fff',
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
    }}>
      <div style={{ marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {account.profilePicture ? (
          <img 
            src={account.profilePicture} 
            alt={account.name}
            crossOrigin="anonymous"
            referrerPolicy="no-referrer"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              objectFit: 'cover'
            }}
          />
        ) : null}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: '#1877f2',
          display: account.profilePicture ? 'none' : 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          {(account.name || 'U').charAt(0).toUpperCase()}
        </div>
        <div>
          <h3 style={{ 
            margin: '0 0 5px 0', 
            color: '#333',
            fontSize: '18px',
            fontWeight: '600'
          }}>
            {account.name}
          </h3>
          <p style={{ 
            margin: 0, 
            color: '#666', 
            fontSize: '14px' 
          }}>
            {account.category} • {account.fanCount || 0} followers
          </p>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#1877f2', fontSize: '14px' }}>Facebook Engagement History</h4>
        <div style={{ height: '150px', marginBottom: '10px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fbChartData} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" domain={['dataMin', 'dataMax']} type="category" />
              <YAxis domain={[0, 'dataMax + 10']} tickFormatter={(value) => Math.round(value)} />
              <Tooltip 
                formatter={(value, name) => [value, 'Total Engagement']}
                labelFormatter={(label, payload) => {
                  if (payload && payload[0] && payload[0].payload.time) {
                    return `${label} at ${payload[0].payload.time}`;
                  }
                  return label;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="total" 
                stroke="#1877f2" 
                strokeWidth={3} 
                connectNulls={false}
                dot={(props) => {
                  if (props.payload?.invisible) {
                    return null;
                  }
                  return <circle key={`facebook-${props.cx}-${props.cy}`} cx={props.cx} cy={props.cy} r={6} fill="#1877f2" />;
                }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {/* Page Performance Section */}
        <div style={{ borderRadius: '8px', padding: '15px' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#1877f2', fontSize: '14px' }}>Page Performance</h4>
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '15px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1877f2' }}>{fbData.totalReactions || 0}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Total Reactions</div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>{fbData.totalComments || 0}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Total Comments</div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc3545' }}>{fbData.totalShares || 0}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Total Shares</div>
            </div>
            <div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#6c757d' }}>{fbData.postsCount || 0}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Posts</div>
            </div>
          </div>
          
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '15px',
            textAlign: 'center',
            marginTop: '15px',
            paddingTop: '15px',
            borderTop: '1px solid #f0f0f0'
          }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#1877f2' }}>{fbData.pageLikes || 0}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Page Likes</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#28a745' }}>{fbData.followers || 0}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Followers</div>
            </div>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#dc3545' }}>{fbData.recentEngagement || 0}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>Recent Engagement</div>
            </div>
          </div>
        </div>

        {/* Top Post Section */}
        <div style={{ borderRadius: '8px', padding: '15px' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#fbbf24', fontSize: '14px' }}>🏆 Top Post</h4>
          {fbData.topPost ? (
            <div>
              <div style={{ 
                background: '#fffbeb',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '10px',
                fontSize: '12px',
                color: '#666',
                border: '1px solid #fbbf24'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px', color: '#f59e0b' }}>
                  {new Date(fbData.topPost.createdTime).toLocaleDateString()}
                </div>
                <div>{fbData.topPost.message.substring(0, 100)}{fbData.topPost.message.length > 100 ? '...' : ''}</div>
              </div>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '15px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1877f2' }}>{fbData.topPost.reactions || 0}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Reactions</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>{fbData.topPost.comments || 0}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Comments</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc3545' }}>{fbData.topPost.shares || 0}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Shares</div>
                </div>
              </div>
              
              <div style={{ marginTop: '15px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>Post Reactions:</div>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1877f2' }}>{fbData.topPost.detailedReactions?.like || 0}</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>Like</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#e91e63' }}>{fbData.topPost.detailedReactions?.love || 0}</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>Love</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff9800' }}>{fbData.topPost.detailedReactions?.haha || 0}</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>Haha</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffc107' }}>{fbData.topPost.detailedReactions?.wow || 0}</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>Wow</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#6c757d' }}>{fbData.topPost.detailedReactions?.sad || 0}</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>Sad</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#dc3545' }}>{fbData.topPost.detailedReactions?.angry || 0}</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>Angry</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#666', fontSize: '14px' }}>No posts found</div>
          )}
        </div>

        {/* Recent Post Section */}
        <div style={{ borderRadius: '8px', padding: '15px' }}>
          <h4 style={{ margin: '0 0 15px 0', color: '#1877f2', fontSize: '14px' }}>Recent Post</h4>
          {fbData.recentPost ? (
            <div>
              <div style={{ 
                background: '#f8f9fa',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '10px',
                fontSize: '12px',
                color: '#666'
              }}>
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                  {new Date(fbData.recentPost.createdTime).toLocaleDateString()}
                </div>
                <div>{fbData.recentPost.message.substring(0, 100)}{fbData.recentPost.message.length > 100 ? '...' : ''}</div>
              </div>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '15px',
                textAlign: 'center'
              }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#1877f2' }}>{fbData.recentPost.reactions || 0}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Reactions</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#28a745' }}>{fbData.recentPost.comments || 0}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Comments</div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#dc3545' }}>{fbData.recentPost.shares || 0}</div>
                  <div style={{ fontSize: '12px', color: '#666' }}>Shares</div>
                </div>
              </div>
              
              {/* Recent Post Reaction Breakdown */}
              <div style={{ marginTop: '15px' }}>
                <div style={{ fontSize: '12px', color: '#666', marginBottom: '8px', fontWeight: 'bold' }}>Post Reactions:</div>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  textAlign: 'center'
                }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#1877f2' }}>{fbData.recentPost.detailedReactions?.like || 0}</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>Like</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#e91e63' }}>{fbData.recentPost.detailedReactions?.love || 0}</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>Love</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ff9800' }}>{fbData.recentPost.detailedReactions?.haha || 0}</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>Haha</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ffc107' }}>{fbData.recentPost.detailedReactions?.wow || 0}</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>Wow</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#6c757d' }}>{fbData.recentPost.detailedReactions?.sad || 0}</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>Sad</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#dc3545' }}>{fbData.recentPost.detailedReactions?.angry || 0}</div>
                    <div style={{ fontSize: '9px', color: '#666' }}>Angry</div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div style={{ color: '#666', fontSize: '14px' }}>No recent posts found</div>
          )}
        </div>
      </div>

      {/* Total Reactions Section */}
      <div style={{ marginBottom: '20px', borderRadius: '8px', padding: '15px' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#1877f2', fontSize: '14px' }}>Total Reactions Breakdown</h4>
        {fbData.reactionBreakdown ? (
          <div style={{ 
            display: 'grid',
            gridTemplateColumns: 'repeat(6, 1fr)',
            gap: '10px',
            textAlign: 'center'
          }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1877f2' }}>{fbData.reactionBreakdown.like || 0}</div>
              <div style={{ fontSize: '10px', color: '#666' }}>Like</div>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#e91e63' }}>{fbData.reactionBreakdown.love || 0}</div>
              <div style={{ fontSize: '10px', color: '#666' }}>Love</div>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ff9800' }}>{fbData.reactionBreakdown.haha || 0}</div>
              <div style={{ fontSize: '10px', color: '#666' }}>Haha</div>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#ffc107' }}>{fbData.reactionBreakdown.wow || 0}</div>
              <div style={{ fontSize: '10px', color: '#666' }}>Wow</div>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#6c757d' }}>{fbData.reactionBreakdown.sad || 0}</div>
              <div style={{ fontSize: '10px', color: '#666' }}>Sad</div>
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#dc3545' }}>{fbData.reactionBreakdown.angry || 0}</div>
              <div style={{ fontSize: '10px', color: '#666' }}>Angry</div>
            </div>
          </div>
        ) : (
          <div style={{ color: '#666', fontSize: '14px' }}>No reaction data available</div>
        )}
      </div>


      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        fontSize: '11px',
        color: '#999',
        borderTop: '1px solid #f0f0f0',
        paddingTop: '10px'
      }}>
        <span>Platform: Facebook</span>
        <span>Posts: {fbData.postsCount || 0}</span>
        <span>Connected: {new Date(account.connectedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default AccountInsightCard;