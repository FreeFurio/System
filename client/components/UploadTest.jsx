import React, { useState } from 'react';
import uploadService from '../services/uploadService.js';

const UploadTest = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const uploadResult = await uploadService.uploadFile(file, 'test-uploads');
      setResult(uploadResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>Cloudinary Upload Test</h2>
      


      {/* File Upload */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          onChange={handleFileUpload}
          accept="image/*,video/*"
          disabled={loading}
          style={{ marginBottom: '10px' }}
        />
        <p style={{ fontSize: '14px', color: '#666' }}>
          Select an image or video file to test upload
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ color: '#007bff', marginBottom: '20px' }}>
          Uploading...
        </div>
      )}

      {/* Error */}
      {error && (
        <div style={{ 
          color: '#dc3545', 
          backgroundColor: '#f8d7da', 
          padding: '10px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          Error: {error}
        </div>
      )}

      {/* Success Result */}
      {result && (
        <div style={{ 
          backgroundColor: '#d4edda', 
          padding: '15px', 
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <h3 style={{ color: '#155724', margin: '0 0 10px 0' }}>Upload Successful!</h3>
          <p><strong>File ID:</strong> {result.fileId}</p>
          <p><strong>URL:</strong> <a href={result.url} target="_blank" rel="noopener noreferrer">{result.url}</a></p>
          {result.data && (
            <div>
              <p><strong>File Name:</strong> {result.data.name}</p>
              <p><strong>File Size:</strong> {result.data.size} bytes</p>
              <p><strong>File Type:</strong> {result.data.type}</p>
            </div>
          )}
          {result.data?.type?.startsWith('image/') && (
            <div style={{ marginTop: '10px' }}>
              <img 
                src={result.url} 
                alt="Uploaded" 
                style={{ maxWidth: '200px', maxHeight: '200px', border: '1px solid #ccc' }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadTest;