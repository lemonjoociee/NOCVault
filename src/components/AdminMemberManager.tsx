import React, { useState } from 'react';

interface AdminMemberManagerProps {
  onBack: () => void;
}

export default function AdminMemberManager({ onBack }: AdminMemberManagerProps) {
  const [members, setMembers] = useState([
    { id: 1, name: 'Sabbir', email: 'sabbir@scicom.com.my', role: 'NOC', status: 'Active' },
    { id: 2, name: 'NOC Manager', email: 'manager@scicom.com.my', role: 'Admin', status: 'Active' },
    { id: 3, name: 'Network Specialist', email: 'specialist@scicom.com.my', role: 'NOC', status: 'Offline' }
  ]);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [toastMessage, setToastMessage] = useState('');

  // Form states
  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formRole, setFormRole] = useState('NOC');
  const [formStatus, setFormStatus] = useState('Active');

  const handleOpenAdd = () => {
    setFormName('');
    setFormEmail('');
    setFormRole('NOC');
    setFormStatus('Active');
    setShowAddModal(true);
  };

  const handleOpenEdit = (member: any) => {
    setEditingMember(member);
    setFormName(member.name);
    setFormEmail(member.email || '');
    setFormRole(member.role === 'Admin' ? 'Admin' : 'NOC');
    setFormStatus(member.status);
  };

  const handleSaveAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formEmail) return;

    const newMember = {
      id: Date.now(),
      name: formName,
      email: formEmail,
      role: formRole,
      status: 'Active'
    };

    setMembers([...members, newMember]);
    setShowAddModal(false);

    setToastMessage(`Invitation email successfully sent to ${formEmail} (${formRole} role)!`);
    setTimeout(() => setToastMessage(''), 4000);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    setMembers(members.map(m => m.id === editingMember.id ? { 
      ...m, 
      name: formName, 
      email: formEmail, 
      role: formRole, 
      status: formStatus 
    } : m));
    setEditingMember(null);

    setToastMessage(`Member ${formName} updated successfully.`);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleRemove = (id: number) => {
    if (window.confirm('Are you sure you want to remove this team member?')) {
      setMembers(members.filter(m => m.id !== id));
      setToastMessage('Team member removed successfully.');
      setTimeout(() => setToastMessage(''), 3000);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', color: '#fff', position: 'relative', zIndex: 10 }}>
      
      {/* Header Bar */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 25px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>
            <span style={{ color: '#00ffff' }}>Team</span> Management
          </h1>
          <p style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Manage NOC personnel, role assignments, and system access permissions.</p>
        </div>
        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={handleOpenAdd}
            style={{ background: 'linear-gradient(90deg, #8a2be2, #00ffff)', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            + Add Member
          </button>
          <button 
            onClick={onBack}
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            ← Back to Portal
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div style={{ maxWidth: '1100px', margin: '0 auto 20px auto', backgroundColor: 'rgba(0, 255, 136, 0.15)', border: '1px solid #00ff88', color: '#00ff88', padding: '12px 20px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold' }}>
          ✉️ {toastMessage}
        </div>
      )}

      {/* Members Table */}
      <div style={{ maxWidth: '1100px', margin: '0 auto', backgroundColor: 'rgba(18, 18, 22, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', overflow: 'hidden', backdropFilter: 'blur(10px)', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ backgroundColor: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', color: '#00ffff', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px' }}>
              <th style={{ padding: '16px 20px' }}>Name & Email</th>
              <th style={{ padding: '16px 20px' }}>Role</th>
              <th style={{ padding: '16px 20px' }}>Status</th>
              <th style={{ padding: '16px 20px', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member) => (
              <tr key={member.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '16px 20px' }}>
                  <div style={{ color: '#fff', fontWeight: 'bold' }}>{member.name}</div>
                  <div style={{ color: '#808080', fontSize: '0.8rem' }}>{member.email || 'No email recorded'}</div>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ padding: '3px 10px', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: member.role === 'Admin' ? 'rgba(153,69,255,0.2)' : 'rgba(0,255,255,0.15)', color: member.role === 'Admin' ? '#9945ff' : '#00ffff' }}>
                    {member.role}
                  </span>
                </td>
                <td style={{ padding: '16px 20px' }}>
                  <span style={{ padding: '4px 12px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: member.status === 'Active' ? 'rgba(0,255,136,0.15)' : 'rgba(255,255,255,0.1)', color: member.status === 'Active' ? '#00ff88' : '#aaa' }}>
                    {member.status}
                  </span>
                </td>
                <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                  <button 
                    onClick={() => handleOpenEdit(member)}
                    style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '6px 14px', borderRadius: '15px', cursor: 'pointer', marginRight: '8px', fontSize: '0.8rem' }}
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleRemove(member.id)}
                    style={{ background: 'rgba(255,51,51,0.15)', border: '1px solid rgba(255,51,51,0.4)', color: '#ff3333', padding: '6px 14px', borderRadius: '15px', cursor: 'pointer', fontSize: '0.8rem' }}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD MEMBER MODAL WITH EMAIL PREVIEW */}
      {showAddModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div style={{ width: '850px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: '#121216', border: '1px solid rgba(0,255,255,0.3)', borderRadius: '20px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.9)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
            
            {/* Left Column: Form Inputs */}
            <div>
              <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#00ffff' }}>Add Team Member & Send Invite</h2>
              <form onSubmit={handleSaveAdd} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', marginBottom: '6px', textTransform: 'uppercase' }}>Full Name</label>
                  <input type="text" required placeholder="e.g. John Doe" value={formName} onChange={(e) => setFormName(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', marginBottom: '6px', textTransform: 'uppercase' }}>Email Address</label>
                  <input type="email" required placeholder="john@scicom.com.my" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', marginBottom: '6px', textTransform: 'uppercase' }}>System Role</label>
                  <select value={formRole} onChange={(e) => setFormRole(e.target.value)} style={{ width: '100%', padding: '12px', background: '#121216', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', outline: 'none' }}>
                    <option value="NOC">NOC (Standard Access)</option>
                    <option value="Admin">Admin (Full Access)</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '15px' }}>
                  <button type="submit" style={{ flex: 1, padding: '12px', background: 'linear-gradient(90deg, #8a2be2, #00ffff)', border: 'none', borderRadius: '20px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Send Invite & Add</button>
                  <button type="button" onClick={() => setShowAddModal(false)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '20px', color: '#fff', cursor: 'pointer' }}>Cancel</button>
                </div>
              </form>
            </div>

            {/* Right Column: Live Email Invitation Preview */}
            <div style={{ backgroundColor: '#1a1a22', border: '1px dashed rgba(0,255,255,0.3)', borderRadius: '14px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#00ffff', letterSpacing: '1px', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                📄 Invitation Email Preview
              </div>
              <div style={{ fontSize: '0.8rem', color: '#b0b0b0' }}>
                <strong>To:</strong> {formEmail || 'recipient@scicom.com.my'}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#b0b0b0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '8px' }}>
                <strong>Subject:</strong> Invitation to Scicom Operations Portal
              </div>
              <div style={{ backgroundColor: 'rgba(18,18,22,0.8)', padding: '15px', borderRadius: '10px', fontSize: '0.85://rem', color: '#e0e0e0', lineHeight: '1.5', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <p style={{ margin: 0 }}>Hello <strong>{formName || '[Full Name]'}</strong>,</p>
                <p style={{ margin: 0 }}>You have been invited to join the <strong>Scicom Operations Portal</strong> as a <strong>{formRole}</strong> user.</p>
                <p style={{ margin: 0, fontSize: '0.8rem', color: '#aaa' }}>Your role grants you access to official runbooks, escalation matrices, and incident management workflows.</p>
                <div style={{ textAlign: 'center', marginTop: '10px' }}>
                  <span style={{ display: 'inline-block', padding: '8px 20px', background: 'linear-gradient(90deg, #8a2be2, #00ffff)', color: '#fff', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    Accept Invitation & Login
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* EDIT MEMBER MODAL */}
      {editingMember && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100vh', backgroundColor: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '420px', backgroundColor: '#121216', border: '1px solid rgba(0,255,255,0.3)', borderRadius: '20px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.9)' }}>
            <h2 style={{ fontSize: '1.2rem', marginBottom: '20px', color: '#00ffff' }}>Edit Team Member</h2>
            <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div>
                <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', marginBottom: '6px', textTransform: 'uppercase' }}>Full Name</label>
                <input type="text" required value={formName} onChange={(e) => setFormName(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', marginBottom: '6px', textTransform: 'uppercase' }}>Email Address</label>
                <input type="email" required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} style={{ width: '100%', padding: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', outline: 'none' }} />
              </div>
              <div>
                <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', marginBottom: '6px', textTransform: 'uppercase' }}>System Role</label>
                <select value={formRole} onChange={(e) => setFormRole(e.target.value)} style={{ width: '100%', padding: '12px', background: '#121216', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', outline: 'none' }}>
                  <option value="NOC">NOC</option>
                  <option value="Admin">Admin</option>
                </select>
              </div>
              <div>
                <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', marginBottom: '6px', textTransform: 'uppercase' }}>Status</label>
                <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} style={{ width: '100%', padding: '12px', background: '#121216', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '10px', color: '#fff', outline: 'none' }}>
                  <option value="Active">Active</option>
                  <option value="Offline">Offline</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" style={{ flex: 1, padding: '12px', background: 'linear-gradient(90deg, #8a2be2, #00ffff)', border: 'none', borderRadius: '20px', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>Save Changes</button>
                <button type="button" onClick={() => setEditingMember(null)} style={{ flex: 1, padding: '12px', background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '20px', color: '#fff', cursor: 'pointer' }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}