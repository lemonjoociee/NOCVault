import React from 'react';

interface AddCaseModalProps {
  onClose: () => void;
}

export default function AddCaseModal({ onClose }: AddCaseModalProps) {
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 1050, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)' }}>
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ width: '100%', maxWidth: '500px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center p-3 border-0">
          <h5 className="mb-0 fw-bold">Add New Incident Case</h5>
          <button type="button" className="btn-close btn-close-white shadow-none" onClick={onClose} aria-label="Close"></button>
        </div>
        
        <div className="card-body p-4 text-dark">
          <form onSubmit={(e) => { e.preventDefault(); onClose(); }}>
            <div className="mb-3">
              <label className="form-label fw-bold small text-uppercase">Case Title</label>
              <input type="text" className="form-control bg-light border-0 px-3 py-2 rounded-3" placeholder="Brief issue description" required />
            </div>
            
            <div className="mb-3">
              <label className="form-label fw-bold small text-uppercase">Severity Level</label>
              <select className="form-select bg-light border-0 px-3 py-2 rounded-3">
                <option value="low">P4 - Low</option>
                <option value="medium">P3 - Medium</option>
                <option value="high">P2 - High</option>
                <option value="critical">P1 - Critical</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label className="form-label fw-bold small text-uppercase">Initial Notes</label>
              <textarea className="form-control bg-light border-0 px-3 py-2 rounded-3" rows={4} placeholder="Detailed description and initial troubleshooting..." required></textarea>
            </div>
            
            <div className="d-flex justify-content-end gap-2">
              <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn btn-primary rounded-pill px-4">Create Case</button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}