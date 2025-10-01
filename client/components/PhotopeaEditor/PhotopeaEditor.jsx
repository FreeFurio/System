import React, { useRef, useEffect } from 'react';

const TemplatedEditor = ({ onSave, onExport }) => {
  console.log('🎨 TemplatedEditor component is rendering');
  const iframeRef = useRef(null);
  const API_KEY = '4514b649-a616-4ac7-a5f3-2c71395b80bd';

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.origin !== 'https://app.templated.io') return;
      
      const data = event.data;
      
      // Handle Templated.io API messages
      if (data.type === 'template-saved') {
        onSave?.(data.data);
      } else if (data.type === 'template-exported') {
        onExport?.(data.data);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSave, onExport]);

  return (
    <div style={{ width: '100%', height: '100%' }}>
      <iframe
        ref={iframeRef}
        src="https://app.templated.io/editor?embed=6fcca33c-6c5d-442c-b787-3d4676156ae2"
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          borderRadius: '8px'
        }}
        title="Templated.io Editor"
        allow="camera; microphone; clipboard-read; clipboard-write"
      />
    </div>
  );
};

export default TemplatedEditor;