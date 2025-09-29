import React, { useState } from 'react';
import aiService from '../services/aiService';

const AIContentGenerator = () => {
  const [platform, setPlatform] = useState('facebook');
  const [topic, setTopic] = useState('');
  const [generatedContent, setGeneratedContent] = useState(null);
  const [seoAnalysis, setSeoAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const platforms = [
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter' }
  ];

  const handleGenerateAll = async () => {
    if (!topic.trim()) {
      setError('Please enter a topic');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const content = await aiService.generateAllContent(platform, topic);
      setGeneratedContent(content);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeSEO = async (content, contentType) => {
    if (!content) return;

    try {
      const analysis = await aiService.analyzeSEO(content, contentType);
      setSeoAnalysis(analysis);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="ai-content-generator" style={{ padding: '20px', maxWidth: '800px' }}>
      <h2>AI Content Generator</h2>
      
      {/* Input Section */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ marginBottom: '10px' }}>
          <label>Platform:</label>
          <select 
            value={platform} 
            onChange={(e) => setPlatform(e.target.value)}
            style={{ marginLeft: '10px', padding: '5px' }}
          >
            {platforms.map(p => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        
        <div style={{ marginBottom: '10px' }}>
          <label>Topic:</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Enter your topic (e.g., 'New product launch')"
            style={{ marginLeft: '10px', padding: '5px', width: '300px' }}
          />
        </div>
        
        <button 
          onClick={handleGenerateAll}
          disabled={loading}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Generating...' : 'Generate Content'}
        </button>
      </div>

      {/* Error Display */}
      {error && (
        <div style={{ color: 'red', marginBottom: '20px' }}>
          Error: {error}
        </div>
      )}

      {/* Generated Content */}
      {generatedContent && (
        <div style={{ border: '1px solid #ddd', padding: '20px', marginBottom: '20px' }}>
          <h3>Generated Content for {generatedContent.platform}</h3>
          
          <div style={{ marginBottom: '15px' }}>
            <h4>Headline:</h4>
            <p style={{ backgroundColor: '#f8f9fa', padding: '10px' }}>
              {generatedContent.headline}
            </p>
            <button 
              onClick={() => handleAnalyzeSEO(generatedContent.headline, 'headline')}
              style={{ padding: '5px 10px', fontSize: '12px' }}
            >
              Analyze SEO
            </button>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <h4>Caption:</h4>
            <p style={{ backgroundColor: '#f8f9fa', padding: '10px' }}>
              {generatedContent.caption}
            </p>
            <button 
              onClick={() => handleAnalyzeSEO(generatedContent.caption, 'caption')}
              style={{ padding: '5px 10px', fontSize: '12px' }}
            >
              Analyze SEO
            </button>
          </div>
          
          <div style={{ marginBottom: '15px' }}>
            <h4>Hashtags:</h4>
            <p style={{ backgroundColor: '#f8f9fa', padding: '10px' }}>
              {generatedContent.hashtag}
            </p>
          </div>
        </div>
      )}

      {/* SEO Analysis */}
      {seoAnalysis && (
        <div style={{ border: '1px solid #28a745', padding: '20px', backgroundColor: '#f8fff9' }}>
          <h3>SEO Analysis</h3>
          <div style={{ marginBottom: '10px' }}>
            <strong>Score: {seoAnalysis.score}/100</strong>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIContentGenerator;