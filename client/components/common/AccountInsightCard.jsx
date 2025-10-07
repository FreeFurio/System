import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AccountInsightCard = ({ account, engagement }) => {
  const fbData = engagement?.facebook || {};
  const igData = engagement?.instagram;
  const twitterData = engagement?.twitter;
  
  const fbTotal = (fbData.totalReactions || 0) + (fbData.totalComments || 0) + (fbData.totalShares || 0);
  const igTotal = igData ? (igData.totalLikes || 0) + (igData.totalComments || 0) : 0;
  
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
  
  // Twitter-specific rendering
  if (account.platform === 'twitter') {
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
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
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
              <h4 style={{ margin: '0 0 10px 0', color: '#1da1f2', fontSize: '14px' }}>Twitter Engagement</h4>
              <div style={{ height: '150px', marginBottom: '10px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={[
                    { name: '', total: null, invisible: true },
                    { name: 'Current', total: twitterData.metrics?.totalEngagement || 0 },
                    { name: '', total: null, invisible: true }
                  ]} margin={{ top: 10, right: 30, left: 20, bottom: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[0, 'dataMax + 10']} tickFormatter={(value) => Math.round(value)} />
                    <Tooltip />
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
                        return <circle cx={props.cx} cy={props.cy} r={6} fill="#1da1f2" />;
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
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1da1f2' }}>{twitterData.metrics?.totalTweets || 0}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Recent Tweets</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{twitterData.metrics?.totalEngagement || 0}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Total Engagement</div>
              </div>
              <div>
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>{twitterData.metrics?.avgEngagementPerTweet || 0}</div>
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
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#e91e63' }}>{twitterData.metrics?.totalLikes || 0}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Likes</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4caf50' }}>{twitterData.metrics?.totalRetweets || 0}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Retweets</div>
              </div>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff9800' }}>{twitterData.metrics?.totalReplies || 0}</div>
                <div style={{ fontSize: '12px', color: '#666' }}>Replies</div>
              </div>
            </div>
            
            <div style={{
              background: '#f8f9fa',
              padding: '12px',
              borderRadius: '8px',
              fontSize: '12px',
              color: '#666',
              textAlign: 'center'
            }}>
              {twitterData.limitation}
            </div>
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
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        <div style={{ borderRadius: '8px', padding: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#1877f2', fontSize: '14px' }}>Facebook Engagement</h4>
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
                    return <circle cx={props.cx} cy={props.cy} r={6} fill="#1877f2" />;
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div style={{ borderRadius: '8px', padding: '15px' }}>
          <h4 style={{ margin: '0 0 10px 0', color: '#e4405f', fontSize: '14px' }}>Instagram Engagement</h4>
          {igChartData ? (
            <div style={{ height: '150px', marginBottom: '10px' }}>
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
                      return <circle cx={props.cx} cy={props.cy} r={6} fill="#e4405f" />;
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div style={{ 
              height: '150px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              backgroundColor: '#f8f9fa',
              border: '1px dashed #dee2e6',
              borderRadius: '8px',
              color: '#6c757d',
              fontSize: '14px'
            }}>
              No Instagram account connected
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
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
        <span>FB Posts: {fbData.postsCount || 0}</span>
        {igData && <span>IG Posts: {igData.postsCount || 0}</span>}
        <span>Connected: {new Date(account.connectedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
};

export default AccountInsightCard;