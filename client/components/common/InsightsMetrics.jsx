import React from 'react';

const InsightsMetrics = ({ title, metrics, color }) => {
  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      background: '#f8f9fa',
      textAlign: 'center'
    }}>
      <h4 style={{ color: color, marginBottom: '15px' }}>{title}</h4>
      {metrics.map((metric, index) => (
        <div key={index} style={{ marginBottom: '10px' }}>
          <span style={{ fontSize: '24px', fontWeight: 'bold', color: '#333' }}>
            {typeof metric.value === 'number' ? metric.value.toLocaleString() : metric.value}
          </span>
          <p style={{ color: '#666', margin: '5px 0' }}>{metric.label}</p>
        </div>
      ))}
    </div>
  );
};

export default InsightsMetrics;