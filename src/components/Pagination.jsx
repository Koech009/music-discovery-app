import React from 'react';

export default function Pagination({ metadata, onPageChange }) {
  if (!metadata || metadata.total_pages <= 1) return null;

  const { current_page, has_next, has_prev } = metadata;

  return (
    <div className="pagination-controls" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '15px' }}>
      <button
        onClick={() => onPageChange(current_page - 1)}
        disabled={!has_prev}
        className="dashboard-btn-secondary"
        style={{ padding: '4px 8px', fontSize: '0.85rem', cursor: has_prev ? 'pointer' : 'not-allowed' }}
      >
        ← Prev
      </button>
      
      <span style={{ fontSize: '0.85rem', color: '#666' }}>
        Page {current_page} of {metadata.total_pages}
      </span>

      <button
        onClick={() => onPageChange(current_page + 1)}
        disabled={!has_next}
        className="dashboard-btn-secondary"
        style={{ padding: '4px 8px', fontSize: '0.85rem', cursor: has_next ? 'pointer' : 'not-allowed' }}
      >
        Next →
      </button>
    </div>
  );
}