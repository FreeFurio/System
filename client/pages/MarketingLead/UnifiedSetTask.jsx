import React, { useState } from 'react';
import SetTask from './SetTask';
import SetTaskGraphicDesigner from './SetTaskGraphicDesigner';

export default function UnifiedSetTask() {
  const [selectedTaskType, setSelectedTaskType] = useState(null);

  if (selectedTaskType === 'content-creator') {
    return <SetTask />;
  }

  if (selectedTaskType === 'graphic-designer') {
    return <SetTaskGraphicDesigner />;
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #ffffff 0%, #fef7ed 100%)', 
      padding: '40px 20px',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
    }}>
      <div style={{
        maxWidth: 600,
        margin: '0 auto',
        background: '#ffffff',
        borderRadius: 24,
        boxShadow: '0 25px 50px -12px rgba(239, 68, 68, 0.15), 0 0 0 1px rgba(251, 191, 36, 0.1)',
        padding: '48px 40px',
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid rgba(251, 191, 36, 0.2)'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '6px',
          background: 'linear-gradient(90deg, #ef4444, #fbbf24, #ef4444, #fbbf24)',
          borderRadius: '24px 24px 0 0'
        }} />
        
        <div style={{textAlign: 'center', marginBottom: 40}}>
          <h1 style={{
            fontWeight: 800,
            fontSize: 36,
            color: '#ef4444',
            margin: 0,
            letterSpacing: '-0.8px'
          }}>Set Task</h1>
          <p style={{
            color: '#6b7280',
            fontSize: 17,
            margin: '8px 0 0 0',
            fontWeight: 500
          }}>Choose the type of task you want to create</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <button
            onClick={() => setSelectedTaskType('content-creator')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '24px 32px',
              borderRadius: 16,
              border: '2px solid #e5e7eb',
              background: '#fafbfc',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              fontSize: 16,
              fontWeight: 600,
              color: '#1f2937',
              width: '100%',
              textAlign: 'left'
            }}
            onMouseEnter={e => {
              e.target.style.borderColor = '#ef4444';
              e.target.style.background = '#fef2f2';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.15)';
            }}
            onMouseLeave={e => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.background = '#fafbfc';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <span style={{fontSize: '32px'}}>👨💻</span>
            <div>
              <div style={{fontSize: 18, fontWeight: 700, marginBottom: 4}}>Content Writer</div>
              <div style={{fontSize: 14, color: '#6b7280', fontWeight: 500}}>Create tasks for content writing and creation</div>
            </div>
          </button>

          <button
            onClick={() => setSelectedTaskType('graphic-designer')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              padding: '24px 32px',
              borderRadius: 16,
              border: '2px solid #e5e7eb',
              background: '#fafbfc',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
              fontSize: 16,
              fontWeight: 600,
              color: '#1f2937',
              width: '100%',
              textAlign: 'left'
            }}
            onMouseEnter={e => {
              e.target.style.borderColor = '#ef4444';
              e.target.style.background = '#fef2f2';
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 8px 25px rgba(239, 68, 68, 0.15)';
            }}
            onMouseLeave={e => {
              e.target.style.borderColor = '#e5e7eb';
              e.target.style.background = '#fafbfc';
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = 'none';
            }}
          >
            <span style={{fontSize: '32px'}}>🎨</span>
            <div>
              <div style={{fontSize: 18, fontWeight: 700, marginBottom: 4}}>Graphic Designer</div>
              <div style={{fontSize: 14, color: '#6b7280', fontWeight: 500}}>Create tasks for design and visual content</div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}