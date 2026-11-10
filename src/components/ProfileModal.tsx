import React from 'react';

interface ProfileModalProps {
  onClose: () => void;
}

export default function ProfileModal({ onClose }: ProfileModalProps) {
  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ zIndex: 1050, backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(5px)' }}>
      <div className="card border-0 shadow-lg rounded-4 overflow-hidden" style={{ width: '100%', maxWidth: '400px', backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
        
        <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center p-3 border-0">
          <h5 className="mb-0 fw-bold">User Profile</h5>
          <button type="button" className="btn-close btn-close-white shadow-none" onClick={onClose} aria-label="Close"></button>
        </div>
        
        <div className="card-body p-4 text-dark text-center">
          <div className="bg-secondary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 fw-bold fs-2" style={{ width: '80px', height: '80px' }}>
            NE
          </div>
          <h4 className="fw-bold mb-1">NOC Engineer</h4>
          <p className="text-muted mb-4">Scicom MSC Berhad</p>
          
          <div className="d-grid gap-2">
            <button className="btn btn-light rounded-pill py-2 border">Edit Details</button>
            <button className="btn btn-light rounded-pill py-2 border">Change Password</button>
          </div>
        </div>
        
      </div>
    </div>
  );
}