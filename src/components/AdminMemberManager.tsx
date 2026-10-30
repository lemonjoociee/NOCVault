import React, { useState } from 'react';
import { User, UserRole, MemberInvitation } from '../types';
import { 
  UserPlus, 
  Mail, 
  Shield, 
  Check, 
  Clock, 
  Trash2, 
  AlertCircle, 
  CheckCircle2, 
  ExternalLink,
  Users,
  Copy,
  RefreshCw
} from 'lucide-react';

interface AdminMemberManagerProps {
  currentUser: User;
  users: User[];
  invitations: MemberInvitation[];
  onAddMember: (memberData: Omit<User, 'id' | 'createdAt'>) => { user: User; invite: MemberInvitation };
  onUpdateRole: (userId: string, newRole: UserRole) => void;
  onToggleStatus: (userId: string) => void;
  onDeleteMember: (userId: string) => void;
}

export const AdminMemberManager: React.FC<AdminMemberManagerProps> = ({
  currentUser,
  users,
  invitations,
  onAddMember,
  onUpdateRole,
  onToggleStatus,
  onDeleteMember
}) => {
  // Add Member Form state
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<UserRole>('NOC');
  const [department, setDepartment] = useState('Tier 1 NOC - Alpha Shift (Day 07:00 - 19:00)');
  const [tempPassword, setTempPassword] = useState('Noc@2026');

  // Confirmation & Dispatch states
  const [lastDispatchedInvite, setLastDispatchedInvite] = useState<{ user: User; invite: MemberInvitation } | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const handleInviteSubmit = (e: React.FormEvent) => {
    if (!email.trim() || !fullName.trim()) return;

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail.endsWith('@scicom.com.my') && !cleanEmail.endsWith('@scicom.com')) {
      alert('Access restricted: Only SCICOM corporate emails (@scicom.com.my or @scicom.com) can be invited.');
      return;
    }

    // Check if email already exists
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      alert(`User with email '${cleanEmail}' already exists in the NOC roster.`);
      return;
    }

    // Auto-generate username from email
    const username = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');

    const result = onAddMember({
      username,
      email: cleanEmail,
      fullName: fullName.trim(),
      role,
      department,
      status: 'Active',
      lastLogin: 'Never',
      requiresPasswordChange: true
    });

    setLastDispatchedInvite(result);
    setSuccessBanner(`Invitation successfully dispatched to ${cleanEmail}. Account provisioned with role: ${role}. Note: Mandatory password reset is enforced on their first login.`);

    // Reset inputs
    setEmail('');
    setFullName('');
    setTempPassword('Noc@2026');
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}/?invite=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Title Bar */}
      <div className="bg-[#1f2833] border border-[#45a29e]/50 rounded-lg p-5 shadow-[0_0_15px_rgba(102,252,241,0.1)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-5 h-5 text-[#66fcf1]" />
            <h2 className="text-base font-bold text-white tracking-wide uppercase font-mono">
              Team Member &amp; Access Role Management
            </h2>
          </div>
          <p className="text-xs text-[#c5c6c7]">
            Administrative console: Invite NOC operators and administrators by email, assign access tiers, and audit credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono px-2 py-1 rounded bg-[#0b0c10] text-[#66fcf1] border border-[#45a29e]/40 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5" />
            <span>Admin Auth: {currentUser.fullName}</span>
          </span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {successBanner && (
        <div className="p-3 rounded bg-[#66fcf1]/10 border border-[#66fcf1]/50 text-[#66fcf1] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="text-[#c5c6c7] hover:text-white text-xs font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Dispatched Invitation Modal Card if just sent */}
      {lastDispatchedInvite && (
        <div className="bg-[#0b0c10] border-2 border-[#66fcf1] rounded-lg p-5 shadow-[0_0_25px_rgba(102,252,241,0.2)] space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#66fcf1]/20 flex items-center justify-center text-[#66fcf1]">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Simulated Invitation Email Transmitted</h4>
                <div className="text-[11px] text-[#45a29e] font-mono">Recipient: {lastDispatchedInvite.user.email}</div>
              </div>
            </div>

            <button
              onClick={() => setLastDispatchedInvite(null)}
              className="text-xs text-[#c5c6c7] hover:text-white"
            >
              Close
            </button>
          </div>

          <div className="p-3 bg-[#141c24] border border-[#45a29e]/30 rounded text-xs space-y-1.5 font-mono text-[#c5c6c7]">
            <div className="text-white"><strong>Subject:</strong> Invitation to SCICOM NOC Operations Portal ({lastDispatchedInvite.user.role})</div>
            <div className="text-[#45a29e]"><strong>From:</strong> noc-admin@scicom.com.my</div>
            <div className="pt-2 text-white/90">
              Hello {lastDispatchedInvite.user.fullName},<br />
              You have been granted access to the NOC Operations Portal with role: <strong className="text-[#66fcf1]">{lastDispatchedInvite.user.role}</strong> ({lastDispatchedInvite.user.department}).
            </div>
            <div className="pt-1 text-[#45a29e]">
              Username: <span className="text-white">{lastDispatchedInvite.user.username}</span> | Temp Password: <span className="text-white">Noc@2026</span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1 text-xs">
            <span className="text-[11px] text-[#45a29e]">Invitation Token: {lastDispatchedInvite.invite.token}</span>
            <button
              onClick={() => copyInviteLink(lastDispatchedInvite.invite.token)}
              className="flex items-center gap-1.5 px-3 py-1 bg-[#1f2833] hover:bg-[#141c24] text-[#66fcf1] border border-[#45a29e] rounded text-xs transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#66fcf1]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Link Copied' : 'Copy Direct Activation Link'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Add Member Form + Member Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Add Member through Email Form */}
        <div className="lg:col-span-5">
          <div className="bg-[#1f2833] border border-[#45a29e]/60 rounded-lg p-5 shadow-[0_0_15px_rgba(102,252,241,0.1)] space-y-4">
            
            <div className="flex items-center gap-2 pb-3 border-b border-[#45a29e]/30">
              <UserPlus className="w-4 h-4 text-[#66fcf1]" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Add Member Through Email
              </h3>
            </div>

            <p className="text-xs text-[#c5c6c7] leading-relaxed">
              Invite a new engineer or supervisor to the portal. Enter their corporate email address to automatically issue credentials and assign permissions.
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block text-[#66fcf1] font-semibold mb-1 uppercase tracking-wider">
                  Corporate Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-[#45a29e]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. hafiz.ramli@scicom.com.my"
                    className="w-full pl-8 pr-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white text-xs placeholder-[#c5c6c7]/50 focus:outline-none focus:border-[#66fcf1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#66fcf1] font-semibold mb-1 uppercase tracking-wider">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Hafiz bin Ramli"
                  className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white text-xs focus:outline-none focus:border-[#66fcf1]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#66fcf1] font-semibold mb-1 uppercase tracking-wider">
                    Assigned Role *
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white text-xs focus:outline-none focus:border-[#66fcf1]"
                  >
                    <option value="NOC">NOC Operator</option>
                    <option value="Admin">System Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#66fcf1] font-semibold mb-1 uppercase tracking-wider">
                    Initial Temp Password
                  </label>
                  <input
                    type="text"
                    value={tempPassword}
                    onChange={e => setTempPassword(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white font-mono text-xs focus:outline-none focus:border-[#66fcf1]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#66fcf1] font-semibold mb-1 uppercase tracking-wider">
                  Department / Shift Designation
                </label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-white text-xs focus:outline-none focus:border-[#66fcf1]"
                >
                  <option value="Tier 1 NOC - Alpha Shift (Day 07:00 - 19:00)">Tier 1 NOC - Alpha Shift (Day 07:00 - 19:00)</option>
                  <option value="Tier 1 NOC - Bravo Shift (Night 19:00 - 07:00)">Tier 1 NOC - Bravo Shift (Night 19:00 - 07:00)</option>
                  <option value="Tier 2 Network Operations (NetOps)">Tier 2 Network Operations (NetOps)</option>
                  <option value="Systems & ERP Administration">Systems &amp; ERP Administration</option>
                  <option value="VoIP & Telecom Support">VoIP &amp; Telecom Support</option>
                  <option value="Incident Management Lead">Incident Management Lead</option>
                </select>
              </div>

              <div className="p-2.5 rounded bg-[#0b0c10] border border-[#45a29e]/30 text-[11px] text-[#c5c6c7] space-y-1">
                <span className="text-[#66fcf1] font-semibold">Permission Summary:</span>
                <div>• <strong className="text-white">NOC Role:</strong> Access all SOPs, execute incident scripts, and submit new cases.</div>
                <div>• <strong className="text-white">Admin Role:</strong> All NOC privileges plus user invitation via email and role management.</div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] font-bold rounded text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(69,162,158,0.3)] flex items-center justify-center gap-2 mt-4"
              >
                <Mail className="w-4 h-4" />
                <span>Send Invitation Email</span>
              </button>

            </form>

          </div>
        </div>

        {/* Right Column: Member Roster Table */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-[#1f2833] border border-[#45a29e]/60 rounded-lg p-5 shadow-[0_0_15px_rgba(102,252,241,0.1)] space-y-4">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#45a29e]/30">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#66fcf1]" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                  Active Team Members ({users.length})
                </h3>
              </div>
              <span className="text-xs text-[#45a29e] font-mono">ROLE AUDIT ACTIVE</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-[#c5c6c7]">
                <thead className="bg-[#0b0c10] text-[#45a29e] font-mono uppercase text-[10px] border-b border-[#45a29e]/30">
                  <tr>
                    <th className="py-2.5 px-3">Member</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Shift / Unit</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#45a29e]/20">
                  {users.map(u => {
                    const isSelf = u.id === currentUser.id;
                    return (
                      <tr key={u.id} className="hover:bg-[#0b0c10]/40 transition-colors">
                        
                        {/* Member */}
                        <td className="py-3 px-3">
                          <div className="font-semibold text-white truncate max-w-[140px]">
                            {u.fullName} {isSelf && <span className="text-[10px] text-[#66fcf1]">(You)</span>}
                          </div>
                          <div className="text-[11px] text-[#45a29e] font-mono truncate max-w-[140px]">
                            {u.email}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {u.role === 'Admin' ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#66fcf1]/20 text-[#66fcf1] border border-[#66fcf1]/50 font-mono">
                              ADMIN
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#45a29e]/20 text-[#c5c6c7] border border-[#45a29e]/50 font-mono">
                              NOC
                            </span>
                          )}
                        </td>

                        {/* Unit */}
                        <td className="py-3 px-3 text-[11px] text-[#c5c6c7] truncate max-w-[140px]">
                          {u.department}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="space-y-0.5">
                            {u.status === 'Active' ? (
                              <span className="text-[11px] text-[#66fcf1] flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#66fcf1]" />
                                Active
                              </span>
                            ) : (
                              <span className="text-[11px] text-[#ff4d4d] flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#ff4d4d]" />
                                Suspended
                              </span>
                            )}
                            {u.requiresPasswordChange && (
                              <span className="inline-block px-1.5 py-0.2 bg-[#ffaa00]/15 text-[#ffaa00] border border-[#ffaa00]/30 rounded text-[9px] font-mono">
                                1st Login Pending
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-3 px-3 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            
                            {/* Toggle role button */}
                            <button
                              onClick={() => onUpdateRole(u.id, u.role === 'Admin' ? 'NOC' : 'Admin')}
                              disabled={isSelf}
                              className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                                isSelf 
                                  ? 'opacity-40 cursor-not-allowed text-[#c5c6c7]' 
                                  : 'bg-[#0b0c10] hover:bg-[#141c24] text-[#66fcf1] border border-[#45a29e]/50'
                              }`}
                              title={u.role === 'Admin' ? 'Demote to NOC' : 'Promote to Admin'}
                            >
                              {u.role === 'Admin' ? 'Set NOC' : 'Set Admin'}
                            </button>

                            {/* Suspend / Activate button */}
                            <button
                              onClick={() => onToggleStatus(u.id)}
                              disabled={isSelf}
                              className={`p-1 rounded transition-colors ${
                                isSelf 
                                  ? 'opacity-40 cursor-not-allowed text-[#c5c6c7]' 
                                  : u.status === 'Active'
                                    ? 'text-[#f5a623] hover:bg-[#f5a623]/20'
                                    : 'text-[#66fcf1] hover:bg-[#66fcf1]/20'
                              }`}
                              title={u.status === 'Active' ? 'Suspend Member' : 'Reactivate Member'}
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete button */}
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to remove ${u.fullName} from the NOC portal?`)) {
                                  onDeleteMember(u.id);
                                }
                              }}
                              disabled={isSelf}
                              className={`p-1 rounded text-[#ff4d4d] hover:bg-[#ff4d4d]/20 transition-colors ${
                                isSelf ? 'opacity-40 cursor-not-allowed' : ''
                              }`}
                              title="Delete Member"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>

                          </div>
                        </td>

                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>

          {/* Invitation Logs */}
          <div className="bg-[#0b0c10] border border-[#45a29e]/40 rounded-lg p-4 space-y-2">
            <div className="text-[11px] font-mono text-[#45a29e] uppercase flex items-center justify-between">
              <span>Dispatched Invitation Registry</span>
              <span>SCICOM DIRECTORY SYNC</span>
            </div>
            {invitations.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {invitations.map(inv => (
                  <div key={inv.id} className="p-2 rounded bg-[#141c24] border border-[#45a29e]/20 flex items-center justify-between text-[11px]">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-[#66fcf1]" />
                      <span className="text-white font-medium">{inv.email}</span>
                      <span className="text-[#45a29e]">({inv.role})</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-[#c5c6c7]">
                      <span>{inv.invitedAt}</span>
                      <span className="text-[#66fcf1] font-mono">SENT</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#c5c6c7]/60 italic py-2">
                No recent member email invitations recorded in this session.
              </p>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
