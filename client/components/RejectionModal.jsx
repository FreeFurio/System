import React, { useState } from 'react';
import { FiX } from 'react-icons/fi';

const RejectionModal = ({ onClose, onSubmit, title }) => {
  const [reason, setReason] = useState('');

  const handleSubmit = () => {
    if (reason.trim()) {
      onSubmit(reason);
      onClose();
    }
  };

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <div style={{ background: '#fff', borderRadius: '12px', width: '90%', maxWidth: '500px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)' }}>
        <div style={{ padding: '20px', borderBottom: '1px solid #e5e7eb', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '600', color: '#1f2937' }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#6b7280' }}>
            <FiX size={20} />
          </button>
        </div>
        <div style={{ padding: '20px' }}>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Enter rejection reason..."
            style={{ width: '100%', minHeight: '120px', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', resize: 'vertical' }}
          />
        </div>
        <div style={{ padding: '20px', borderTop: '1px solid #e5e7eb', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '10px 20px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', color: '#374151' }}>
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!reason.trim()} style={{ padding: '10px 20px', background: reason.trim() ? '#ef4444' : '#d1d5db', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: reason.trim() ? 'pointer' : 'not-allowed', color: '#fff' }}>
            Reject
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectionModal;
