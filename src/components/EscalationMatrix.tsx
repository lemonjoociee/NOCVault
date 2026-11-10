import React from 'react';

export default function EscalationMatrix() {
  return (
    <div className="text-dark">
      <div className="mb-4 border-bottom pb-3">
        <h2 className="fw-bold mb-1">Escalation Matrix</h2>
        <p className="text-muted">Contact protocols and SLAs for critical incidents and service outages.</p>
      </div>
      
      <div className="table-responsive bg-white rounded-3 shadow-sm p-3">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="py-3">Level</th>
              <th className="py-3">Role</th>
              <th className="py-3">Contact</th>
              <th className="py-3">SLA Trigger (T+)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><span className="badge bg-success rounded-pill px-3 py-2">L1</span></td>
              <td className="fw-medium">NOC Engineer</td>
              <td>On-Duty Shift Lead</td>
              <td>0 - 15 Mins</td>
            </tr>
            <tr>
              <td><span className="badge bg-warning text-dark rounded-pill px-3 py-2">L2</span></td>
              <td className="fw-medium">Network Specialist</td>
              <td>Technical Lead</td>
              <td>15 - 30 Mins</td>
            </tr>
            <tr>
              <td><span className="badge bg-danger rounded-pill px-3 py-2">L3</span></td>
              <td className="fw-medium">NOC Manager</td>
              <td>Operations Manager</td>
              <td>&gt; 30 Mins (or P1 Outage)</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}