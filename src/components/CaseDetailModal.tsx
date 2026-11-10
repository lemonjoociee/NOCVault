import React from 'react';

interface CaseDetailModalProps {
  caseId: string;
  onClose: () => void;
}

export default function CaseDetailModal({ caseId, onClose }: CaseDetailModalProps) {
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 1050, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)' }}>
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ width: '100%', maxWidth: '600px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center p-3 border-0">
          <h5 className="mb-0 fw-bold">Incident Details: #{caseId}</h5>
          <button type="button" className="btn-close btn-close-white shadow-none" onClick={onClose} aria-label="Close"></button>
        </div>
        
        <div className="card-body p-4 text-dark">
          <div className="mb-4">
            <span className="badge bg-danger rounded-pill px-3 py-2 mb-2">P1 - Critical</span>
            <h4 className="fw-bold text-dark">Network Latency Spike in Zone A</h4>
            <p className="text-muted mb-0">Opened: Nov 10, 2026 10:45 AM</p>
          </div>
          
          <div className="bg-light rounded-3 p-3 mb-4">
            <h6 className="fw-bold mb-2">Description</h6>
            <p className="mb-0 small">Multiple packet drops detected across core routers in Zone A. BGP routes are flapping. Escalated to L3 Networking.</p>
          </div>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <button type="button" className="btn btn-outline-dark rounded-pill px-4">Update Status</button>
            <button type="button" className="btn btn-dark rounded-pill px-4" onClick={onClose}>Close View</button>
          </div>
        </div>

      </div>
    </div>
  );
}