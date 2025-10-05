import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AccountInsightCard = ({ account, engagement }) => {
  const fbData = engagement?.facebook || {};
  const igData = engagement?.instagram;
  
  const fbTotal = (fbData.totalReactions || 0) + (fbData.totalComments || 0) + (fbData.totalShares || 0);
  const igTotal = igData ? (igData.totalLikes || 0) + (igData.totalComments || 0) : 0;
  
  const fbChartData = fbData.historicalData || [{ date: 'Current', total: fbTotal, time: 'Now' }];
  const igChartData = igData?.historicalData || (igData ? [{ name: 'Current', total: igTotal }] : null);

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '12px',
      padding: '20px',
      background: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
    }}>
      <div style={{ marginBottom: '15px' }}>
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
          {igData && <span style={{ color: '#e4405f', marginLeft: '10px' }}>• Instagram Connected</span>}
        </p>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#1877f2', fontSize: '14px' }}>Facebook Engagement</h4>
        <div style={{ height: '150px', marginBottom: '10px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={fbChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
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
              <Line type="monotone" dataKey="total" stroke="#1877f2" strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#e4405f', fontSize: '14px' }}>Instagram Engagement</h4>
        {igChartData ? (
          <div style={{ height: '150px', marginBottom: '10px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={igChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis domain={[0, 'dataMax + 10']} tickFormatter={(value) => Math.round(value)} />
                <Tooltip />
                <Line type="monotone" dataKey="total" stroke="#e4405f" strokeWidth={3} dot={{ r: 6 }} />
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

      {/* Page Performance Section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#1877f2', fontSize: '14px' }}>Page Performance</h4>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '15px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1877f2' }}>{fbData.pageLikes || 0}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Page Likes</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>{fbData.followers || 0}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Followers</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>{fbData.recentEngagement || 0}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Recent Engagement</div>
          </div>
        </div>
      </div>

      {/* Facebook Reactions Section */}
      <div style={{ marginBottom: '20px' }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#1877f2', fontSize: '14px' }}>Facebook Reactions</h4>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: 'repeat(6, 1fr)',
          gap: '10px',
          textAlign: 'center'
        }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{fbData.reactions?.like || 0}</div>
            <div style={{ fontSize: '10px', color: '#666' }}>Like</div>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{fbData.reactions?.love || 0}</div>
            <div style={{ fontSize: '10px', color: '#666' }}>Love</div>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{fbData.reactions?.haha || 0}</div>
            <div style={{ fontSize: '10px', color: '#666' }}>Haha</div>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{fbData.reactions?.wow || 0}</div>
            <div style={{ fontSize: '10px', color: '#666' }}>Wow</div>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{fbData.reactions?.sad || 0}</div>
            <div style={{ fontSize: '10px', color: '#666' }}>Sad</div>
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold' }}>{fbData.reactions?.angry || 0}</div>
            <div style={{ fontSize: '10px', color: '#666' }}>Angry</div>
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div style={{ 
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
        gap: '10px',
        fontSize: '12px',
        color: '#666',
        marginBottom: '10px'
      }}>
        <span style={{ color: '#1877f2' }}>Comments: {fbData.totalComments || 0}</span>
        <span style={{ color: '#1877f2' }}>Shares: {fbData.totalShares || 0}</span>
        {igData && <span style={{ color: '#e4405f' }}>IG Likes: {igData.totalLikes || 0}</span>}
        {igData && <span style={{ color: '#e4405f' }}>IG Comments: {igData.totalComments || 0}</span>}
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