import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createContent } from '../../services/contentService';

export default function CreateContent() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await createContent({ input });
      if (res.success) {
        // INSTANT MOCK DATA for Output page preview
        const headline = "Sample Headline";
        const content = input;
        const hashtags = "#sample #ai #content";
        setLoading(false);
        navigate('/content/output', { state: { headline, content, hashtags } });
      } else {
        setError('Failed to create content.');
        setLoading(false);
      }
    } catch (err) {
      setError('An error occurred.');
      setLoading(false);
    }
  };

  return (
    <div style={{ width: '100%', background: '#f6f8fa', fontFamily: 'Inter, Segoe UI, Arial, sans-serif', padding: 0 }}>
      <div className="content-creator-card">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          marginBottom: 4
        }}>
          <h2 style={{ fontWeight: 800, fontSize: '1.35rem', color: '#222', marginBottom: 6, letterSpacing: 0.01, textAlign: 'center', textTransform: 'none' }}>AI Content Producer</h2>
          <div style={{
            color: '#444',
            fontSize: '1.08rem',
            fontFamily: 'inherit',
            textAlign: 'center',
            opacity: 0.92,
            lineHeight: 1.6,
            fontWeight: 500
          }}>
            What’s your content all about?<br/>
            <span style={{ fontWeight: 400 }}>Describe your idea and we’ll generate a headline, content, and hashtags for you.</span>
          </div>
        </div>
        <form onSubmit={handleSubmit} style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 18
        }}>
          <textarea
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="e.g. Social media post for a summer sale, with hashtags and catchy headline."
            rows={4}
            style={{
              width: '100%',
              minHeight: 80,
              maxHeight: 180,
              padding: 16,
              borderRadius: 12,
              border: '1.5px solid #e0e7eb',
              fontSize: '1.08rem',
              background: '#f9fafb',
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box',
              fontFamily: 'inherit',
              transition: 'border 0.2s, box-shadow 0.2s',
              marginBottom: 2
            }}
            required
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            style={{
              background: !input.trim() ? '#a5b4fc' : '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: 12,
              padding: '16px 0',
              fontWeight: 800,
              fontSize: '1.13rem',
              cursor: !input.trim() ? 'not-allowed' : 'pointer',
              letterSpacing: 0.5,
              boxShadow: !input.trim() ? '0 2px 8px #a5b4fc' : '0 4px 16px #2563eb22',
              transition: 'background 0.18s, box-shadow 0.18s',
              marginTop: 6
            }}
            onMouseOver={e => { if (input.trim()) e.target.style.background = '#1746b3'; }}
            onMouseOut={e => { if (input.trim()) e.target.style.background = '#2563eb'; }}
          >{loading ? 'Generating...' : 'Generate'}</button>
          {error && <div style={{ color: '#ef4444', fontWeight: 500, textAlign: 'center', marginTop: 6 }}>{error}</div>}
        </form>
      </div>
    </div>
  );
} 