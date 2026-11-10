import React, { useState } from 'react';

export default function AdminMemberManager() {
  // Sample data to demonstrate the layout
  const [members] = useState([
    { id: 1, name: 'Sabbir', role: 'NOC Engineer', status: 'Active' },
    { id: 2, name: 'NOC Manager', role: 'Administrator', status: 'Active' },
    { id: 3, name: 'Network Specialist', role: 'L2 Support', status: 'Offline' }
  ]);

  return (
    <div className="text-dark">
      <div className="mb-4 border-bottom pb-3 d-flex flex-column flex-md-row justify-content-between align-items-md-end gap-3">
        <div>
          <h2 className="fw-bold mb-1">Team Management</h2>
          <p className="text-muted mb-0">Manage NOC personnel, roles, and system access.</p>
        </div>
        <button className="btn btn-dark rounded-pill px-4 fw-bold">
          + Add Member
        </button>
      </div>

      <div className="table-responsive bg-white rounded-3 shadow-sm p-3">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="py-3">Name</th>
              <th className="py-3">Role</th>
              <th className="py-3">Status</th>
              <th className="py-3 text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(member => (
              <tr key={member.id}>
                <td className="fw-medium">{member.name}</td>
                <td className="text-muted">{member.role}</td>
                <td>
                  <span className={`badge rounded-pill px-3 py-2 ${member.status === 'Active' ? 'bg-success' : 'bg-secondary'}`}>
                    {member.status}
                  </span>
                </td>
                <td className="text-end">
                  <button className="btn btn-sm btn-outline-secondary rounded-pill px-3 me-2">Edit</button>
                  <button className="btn btn-sm btn-outline-danger rounded-pill px-3">Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}