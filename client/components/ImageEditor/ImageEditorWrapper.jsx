import React from 'react';

const ImageEditorWrapper = ({ onSave, onExport }) => {
  const handleMessage = (event) => {
    if (event.data && typeof event.data === 'string') {
      if (event.data.startsWith('SAVE:')) {
        const canvasData = event.data.replace('SAVE:', '');
        onSave?.(canvasData);
      } else if (event.data.startsWith('EXPORT:')) {
        const imageData = event.data.replace('EXPORT:', '');
        onExport?.(imageData);
      }
    }
  };

  React.useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSave, onExport]);

  return (
    <iframe
      src="/components/ImageEditor/editor.html"
      style={{
        width: '100%',
        height: '100%',
        border: 'none',
        borderRadius: '8px'
      }}
      title="Image Editor"
    />
  );
};

export default ImageEditorWrapper;