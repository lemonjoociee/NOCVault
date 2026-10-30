import React, { useState } from 'react';
import { User, UserRole, MemberInvitation } from '../types';
import { 
  UserPlus, 
  Mail, 
  Shield, 
  Check, 
  Trash2, 
  CheckCircle2, 
  Users,
  Copy,
  RefreshCw,
  AlertTriangle,
  Send
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
  
  // Loading & status states
  const [isSending, setIsSending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);
  const [lastDispatchedInvite, setLastDispatchedInvite] = useState<{ 
    user: User; 
    invite: MemberInvitation;
    mode?: 'smtp' | 'simulated';
    messageId?: string;
  } | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  
  // Custom confirmation modal state for deleting accounts without window.confirm
  const [memberToDelete, setMemberToDelete] = useState<User | null>(null);

  // Standard email validation (allows any valid inbox, removing corporate restriction)
  const isValidEmail = (addr: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(addr.trim());
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    if (!cleanEmail || !cleanName) {
      setErrorMessage('Please provide both the full name and a valid email address.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Please provide a valid email format (e.g., user@example.com or user@gmail.com).');
      return;
    }

    // Check if email already exists in local member list
    const existing = users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setErrorMessage(`A team member with email '${cleanEmail}' already exists in the NOC roster.`);
      return;
    }

    // Auto-generate username from email
    const username = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');

    setIsSending(true);

    try {
      // 1. Create member in application state
      const result = onAddMember({
        username,
        email: cleanEmail,
        fullName: cleanName,
        role,
        department,
        status: 'Active',
        lastLogin: 'Never',
        requiresPasswordChange: true
      });

      const inviteLink = `${window.location.origin}/?invite=${result.invite.token}`;

      // 2. Call the server endpoint /api/send-invite
      let dispatchMode: 'smtp' | 'simulated' = 'simulated';
      let messageId: string | undefined;

      try {
        const response = await fetch('/api/send-invite', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: cleanEmail,
            fullName: cleanName,
            role,
            department,
            username,
            tempPassword,
            inviteLink,
          }),
        });

        const data = await response.json();

        if (!response.ok || data.success === false) {
          throw new Error(data.error || 'Server error while sending email.');
        }

        dispatchMode = data.mode === 'smtp' ? 'smtp' : 'simulated';
        messageId = data.messageId;

        if (dispatchMode === 'smtp') {
          setSuccessBanner(`Real email successfully dispatched to ${cleanEmail} via SMTP! (Message ID: ${messageId || 'OK'})`);
        } else {
          setSuccessBanner(`Member added. Simulated email recorded for ${cleanEmail} (Configure SMTP_USER & SMTP_PASS in .env for live inbox delivery).`);
        }
      } catch (apiErr: any) {
        console.warn('Backend invitation API notice:', apiErr);
        setSuccessBanner(`Member added to roster. However, SMTP dispatch encountered: ${apiErr.message || 'connection error'}. Activation link is ready below.`);
      }

      // Record dispatched invitation for card display
      setLastDispatchedInvite({
        ...result,
        mode: dispatchMode,
        messageId,
      });

      // Reset form fields
      setEmail('');
      setFullName('');
      setTempPassword('Noc@2026');
    } catch (err: any) {
      console.error('Failed to dispatch invitation:', err);
      setErrorMessage(err.message || 'Failed to send invitation. Please try again.');
    } finally {
      setIsSending(false);
    }
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

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded bg-[#ff4d4d]/10 border border-[#ff4d4d]/50 text-[#ff4d4d] text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-[#c5c6c7] hover:text-white text-xs font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success Notification Alert */}
      {successBanner && (
        <div className="p-3.5 rounded bg-[#66fcf1]/10 border border-[#66fcf1]/50 text-[#66fcf1] text-xs flex items-center justify-between">
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

      {/* Dispatched Invitation Card */}
      {lastDispatchedInvite && (
        <div className="bg-[#0b0c10] border-2 border-[#66fcf1] rounded-lg p-5 shadow-[0_0_25px_rgba(102,252,241,0.2)] space-y-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#66fcf1]/20 flex items-center justify-center text-[#66fcf1]">
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Invitation Email Dispatched</span>
                  {lastDispatchedInvite.mode === 'smtp' ? (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#66fcf1]/20 text-[#66fcf1] border border-[#66fcf1]/40 font-mono">
                      SMTP LIVE
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-[#f5a623]/20 text-[#f5a623] border border-[#f5a623]/40 font-mono">
                      DEV PREVIEW
                    </span>
                  )}
                </h4>
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
            <div className="text-white"><strong>Subject:</strong> [NOC Operations Portal] Invitation &amp; Access Credentials - {lastDispatchedInvite.user.role}</div>
            <div className="text-[#45a29e]"><strong>From:</strong> NOC Operations Dispatch (SMTP)</div>
            <div className="pt-2 text-white/90">
              Hello {lastDispatchedInvite.user.fullName},<br />
              You have been granted access to the NOC Operations Portal with role: <strong className="text-[#66fcf1]">{lastDispatchedInvite.user.role}</strong> ({lastDispatchedInvite.user.department}).
            </div>
            <div className="pt-1 text-[#45a29e]">
              Username: <span className="text-white">{lastDispatchedInvite.user.username}</span> | Temp Password: <span className="text-white">Noc@2026</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
            <span className="text-[11px] text-[#45a29e] font-mono">Token: {lastDispatchedInvite.invite.token}</span>
            <button
              onClick={() => copyInviteLink(lastDispatchedInvite.invite.token)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 bg-[#1f2833] hover:bg-[#141c24] text-[#66fcf1] border border-[#45a29e] rounded text-xs transition-colors"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-[#66fcf1]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Direct Link Copied!' : 'Copy Direct Activation Link'}</span>
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
              Invite a new engineer or administrator. Enter any valid recipient email (including personal test inboxes like Gmail) to send real credentials and activation instructions.
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-3.5 text-xs">
              
              <div>
                <label className="block text-[#66fcf1] font-semibold mb-1 uppercase tracking-wider">
                  Recipient Email Address *
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
                    placeholder="e.g. your-name@gmail.com or colleague@domain.com"
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
                  placeholder="e.g. Siti Nurhaliza"
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
                <div>• <strong className="text-white">NOC Role:</strong> Access all SOPs, escalation matrix, and submit new cases.</div>
                <div>• <strong className="text-white">Admin Role:</strong> All NOC privileges plus user invitation via email and role management.</div>
              </div>

              {/* Submit Button with Loading State */}
              <button
                type="submit"
                disabled={isSending}
                className={`w-full py-2.5 px-4 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] font-bold rounded text-xs uppercase tracking-wider transition-all shadow-[0_0_15px_rgba(69,162,158,0.3)] flex items-center justify-center gap-2 mt-4 ${
                  isSending ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isSending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Sending Email...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Invitation Email</span>
                  </>
                )}
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

                            {/* Delete button (opens confirmation modal) */}
                            <button
                              type="button"
                              onClick={() => setMemberToDelete(u)}
                              disabled={isSelf}
                              className={`p-1.5 rounded text-[#ff4d4d] hover:bg-[#ff4d4d]/20 transition-all ${
                                isSelf 
                                  ? 'opacity-30 cursor-not-allowed' 
                                  : 'cursor-pointer hover:scale-110 active:scale-95'
                              }`}
                              title={isSelf ? 'Cannot delete your own active session account' : `Delete ${u.fullName}`}
                            >
                              <Trash2 className="w-4 h-4" />
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

      {/* Delete Member Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#1f2833] border border-[#ff4d4d]/60 rounded-xl max-w-md w-full p-6 shadow-[0_0_35px_rgba(255,77,77,0.35)] space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#ff4d4d]/20 border border-[#ff4d4d]/50 flex items-center justify-center text-[#ff4d4d] shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-mono uppercase tracking-wide">
                  Confirm Member Removal
                </h3>
                <p className="text-xs text-[#c5c6c7]">SCICOM NOC Directory Action</p>
              </div>
            </div>

            <div className="bg-[#0b0c10] border border-[#45a29e]/30 rounded-lg p-3.5 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#45a29e] font-mono">Member:</span>
                <span className="text-white font-bold text-sm">{memberToDelete.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#45a29e] font-mono">Account Email:</span>
                <span className="text-[#66fcf1] font-mono">{memberToDelete.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#45a29e] font-mono">Username:</span>
                <span className="text-white font-mono">{memberToDelete.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#45a29e] font-mono">Current Role:</span>
                <span className="px-2 py-0.5 rounded bg-[#1f2833] text-[#66fcf1] border border-[#45a29e]/40 font-mono text-[10px]">
                  {memberToDelete.role}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#45a29e] font-mono">Shift / Unit:</span>
                <span className="text-[#c5c6c7] truncate max-w-[200px] text-right">{memberToDelete.department}</span>
              </div>

              <div className="pt-2.5 mt-2 border-t border-[#45a29e]/20 text-[11px] text-[#ff4d4d] flex items-start gap-2 bg-[#ff4d4d]/5 p-2 rounded">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Are you sure you want to remove this account? This will immediately revoke their portal access and remove their credentials from the NOC roster.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 rounded-lg bg-[#0b0c10] border border-[#45a29e]/50 text-[#c5c6c7] hover:text-white hover:border-[#66fcf1] text-xs font-mono transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const targetName = memberToDelete.fullName;
                  onDeleteMember(memberToDelete.id);
                  setMemberToDelete(null);
                  setSuccessBanner(`Account "${targetName}" has been successfully removed.`);
                  setTimeout(() => setSuccessBanner(null), 4000);
                }}
                className="px-4 py-2 rounded-lg bg-[#ff4d4d] hover:bg-[#ff3333] text-white text-xs font-mono font-bold transition-all shadow-[0_0_15px_rgba(255,77,77,0.4)] flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
