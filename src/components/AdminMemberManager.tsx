import React, { useState } from 'react';
import { User, UserRole, MemberInvitation } from '../types';
import { useTheme } from '../context/ThemeContext';
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
  const { isDark } = useTheme();

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
  
  // Custom confirmation modal state for deleting accounts
  const [memberToDelete, setMemberToDelete] = useState<User | null>(null);

  // Standard email validation
  const isValidEmail = (addr: string): boolean => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(addr.trim());
  };

  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessBanner(null);

    const cleanEmail = email.trim();
    const cleanName = fullName.trim();

    if (!cleanEmail || !cleanName) {
      setErrorMessage('Please fill in both the recipient email address and member full name.');
      return;
    }

    if (!isValidEmail(cleanEmail)) {
      setErrorMessage('Please enter a valid email address format (e.g. name@domain.com).');
      return;
    }

    // Check if email already registered in memory/storage
    const exists = users.some(u => u.email.toLowerCase() === cleanEmail.toLowerCase());
    if (exists) {
      setErrorMessage(`A member with email "${cleanEmail}" already exists in the NOC directory.`);
      return;
    }

    // Auto-generate username from email
    const autoUsername = cleanEmail.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_').toLowerCase();

    setIsSending(true);

    try {
      // 1. Create member in local store
      const { user: createdUser, invite } = onAddMember({
        email: cleanEmail,
        fullName: cleanName,
        role,
        department,
        username: autoUsername,
        password: tempPassword,
        status: 'Active'
      });

      // Construct direct invite URL
      const inviteUrl = `${window.location.origin}?invite_token=${invite.token}&user=${encodeURIComponent(cleanEmail)}`;

      // 2. Call backend /api/send-invite
      let dispatchedMode: 'smtp' | 'simulated' = 'simulated';
      let msgId: string | undefined;

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
            username: autoUsername,
            tempPassword: tempPassword,
            inviteLink: inviteUrl,
          }),
        });

        if (response.ok) {
          const result = await response.json();
          dispatchedMode = result.mode || 'smtp';
          msgId = result.messageId;
        } else {
          console.warn('API endpoint responded with non-200. Falling back to local invitation registry.');
        }
      } catch (networkErr) {
        console.warn('Network call to /api/send-invite failed. App running in static dev mode.', networkErr);
      }

      // 3. Set UI success state
      setLastDispatchedInvite({
        user: createdUser,
        invite,
        mode: dispatchedMode,
        messageId: msgId
      });

      if (dispatchedMode === 'smtp') {
        setSuccessBanner(`Live invitation email dispatched via SMTP to ${cleanEmail}! Temporary credentials provisioned.`);
      } else {
        setSuccessBanner(`Member "${cleanName}" was provisioned and added to the roster! Invitation link generated below.`);
      }

      // Reset form
      setEmail('');
      setFullName('');
      setTempPassword('Noc@2026');

    } catch (err: any) {
      setErrorMessage(err.message || 'An unexpected error occurred while adding this team member.');
    } finally {
      setIsSending(false);
    }
  };

  const copyInviteLink = (token: string) => {
    const link = `${window.location.origin}?invite_token=${token}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className={`border rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
        isDark ? 'bg-[#1f2833] border-[#45a29e]/50 shadow-[0_0_15px_rgba(102,252,241,0.08)]' : 'bg-white border-slate-200 shadow-sm'
      }`}>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users className={`w-5 h-5 ${isDark ? 'text-[#66fcf1]' : 'text-sky-600'}`} />
            <h2 className={`text-base font-bold tracking-wide uppercase font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Member Directory &amp; Role Management
            </h2>
          </div>
          <p className={`text-xs ${isDark ? 'text-[#c5c6c7]' : 'text-slate-600'}`}>
            Invite engineering staff via email dispatch, assign roles, monitor access, and audit team permissions.
          </p>
        </div>

        <div className={`text-xs font-mono px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
          isDark ? 'bg-[#0b0c10] text-[#66fcf1] border-[#45a29e]/50' : 'bg-slate-50 text-sky-800 border-slate-200'
        }`}>
          <Shield className="w-4 h-4" />
          <span>ADMIN ACCESS GRANTED</span>
        </div>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/50 text-red-500 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-slate-400 hover:text-white text-xs font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Success Notification Alert */}
      {successBanner && (
        <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between font-mono ${
          isDark ? 'bg-[#66fcf1]/10 border-[#66fcf1]/50 text-[#66fcf1]' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{successBanner}</span>
          </div>
          <button
            onClick={() => setSuccessBanner(null)}
            className="opacity-70 hover:opacity-100 text-xs font-mono"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Dispatched Invitation Card */}
      {lastDispatchedInvite && (
        <div className={`border-2 rounded-xl p-5 space-y-3 ${
          isDark 
            ? 'bg-[#0b0c10] border-[#66fcf1] shadow-[0_0_25px_rgba(102,252,241,0.2)]' 
            : 'bg-white border-sky-500 shadow-md'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                isDark ? 'bg-[#66fcf1]/20 text-[#66fcf1]' : 'bg-sky-100 text-sky-700'
              }`}>
                <Mail className="w-4 h-4" />
              </div>
              <div>
                <h4 className={`text-sm font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <span>Invitation Email Dispatched</span>
                  {lastDispatchedInvite.mode === 'smtp' ? (
                    <span className={`text-[10px] px-2 py-0.5 rounded font-mono border ${
                      isDark ? 'bg-[#66fcf1]/20 text-[#66fcf1] border-[#66fcf1]/40' : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    }`}>
                      SMTP LIVE
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-amber-500 border border-amber-500/40 font-mono">
                      DEV PREVIEW
                    </span>
                  )}
                </h4>
                <div className={`text-[11px] font-mono ${isDark ? 'text-[#45a29e]' : 'text-slate-500'}`}>
                  Recipient: {lastDispatchedInvite.user.email}
                </div>
              </div>
            </div>

            <button
              onClick={() => setLastDispatchedInvite(null)}
              className="text-xs opacity-70 hover:opacity-100"
            >
              Close
            </button>
          </div>

          <div className={`p-3 rounded-lg border text-xs space-y-1.5 font-mono ${
            isDark ? 'bg-[#141c24] border-[#45a29e]/30 text-[#c5c6c7]' : 'bg-slate-50 border-slate-200 text-slate-700'
          }`}>
            <div><strong>Subject:</strong> [NOC Operations Portal] Invitation &amp; Access Credentials - {lastDispatchedInvite.user.role}</div>
            <div className={isDark ? 'text-[#45a29e]' : 'text-sky-700'}><strong>From:</strong> NOC Operations Dispatch (SMTP)</div>
            <div className="pt-2">
              Hello {lastDispatchedInvite.user.fullName},<br />
              You have been granted access to the NOC Operations Portal with role: <strong className={isDark ? 'text-[#66fcf1]' : 'text-sky-700'}>{lastDispatchedInvite.user.role}</strong> ({lastDispatchedInvite.user.department}).
            </div>
            <div className="pt-1">
              Username: <span className="font-bold">{lastDispatchedInvite.user.username}</span> | Temp Password: <span className="font-bold">Noc@2026</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 text-xs">
            <span className={`text-[11px] font-mono ${isDark ? 'text-[#45a29e]' : 'text-slate-500'}`}>Token: {lastDispatchedInvite.invite.token}</span>
            <button
              onClick={() => copyInviteLink(lastDispatchedInvite.invite.token)}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-colors border ${
                isDark 
                  ? 'bg-[#1f2833] hover:bg-[#141c24] text-[#66fcf1] border-[#45a29e]' 
                  : 'bg-slate-100 hover:bg-slate-200 text-sky-700 border-slate-300'
              }`}
            >
              {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Direct Link Copied!' : 'Copy Direct Activation Link'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Add Member Form + Member Directory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Add Member through Email Form */}
        <div className="lg:col-span-5">
          <div className={`border rounded-xl p-5 space-y-4 transition-colors ${
            isDark ? 'bg-[#1f2833] border-[#45a29e]/60 shadow-[0_0_15px_rgba(102,252,241,0.08)]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            
            <div className={`flex items-center gap-2 pb-3 border-b ${isDark ? 'border-[#45a29e]/30' : 'border-slate-200'}`}>
              <UserPlus className={`w-4 h-4 ${isDark ? 'text-[#66fcf1]' : 'text-sky-600'}`} />
              <h3 className={`text-sm font-bold uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Add Member Through Email
              </h3>
            </div>

            <p className={`text-xs leading-relaxed ${isDark ? 'text-[#c5c6c7]' : 'text-slate-600'}`}>
              Invite a new engineer or administrator. Enter any valid recipient email (including personal test inboxes like Gmail) to send real credentials and activation instructions.
            </p>

            <form onSubmit={handleInviteSubmit} className="space-y-3.5 text-xs">
              
              <div>
                <label className={`block font-semibold mb-1 uppercase tracking-wider ${isDark ? 'text-[#66fcf1]' : 'text-slate-700'}`}>
                  Recipient Email Address *
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none ${isDark ? 'text-[#45a29e]' : 'text-slate-400'}`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. your-name@gmail.com or colleague@domain.com"
                    className={`w-full pl-8 pr-3 py-2 rounded-lg text-xs focus:outline-none ${
                      isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 uppercase tracking-wider ${isDark ? 'text-[#66fcf1]' : 'text-slate-700'}`}>
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Siti Nurhaliza"
                  className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none ${
                    isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:bg-white'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={`block font-semibold mb-1 uppercase tracking-wider ${isDark ? 'text-[#66fcf1]' : 'text-slate-700'}`}>
                    Assigned Role *
                  </label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as UserRole)}
                    className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none ${
                      isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500'
                    }`}
                  >
                    <option value="NOC">NOC Operator</option>
                    <option value="Admin">System Administrator</option>
                  </select>
                </div>

                <div>
                  <label className={`block font-semibold mb-1 uppercase tracking-wider ${isDark ? 'text-[#66fcf1]' : 'text-slate-700'}`}>
                    Initial Temp Password
                  </label>
                  <input
                    type="text"
                    value={tempPassword}
                    onChange={e => setTempPassword(e.target.value)}
                    className={`w-full px-3 py-2 rounded-lg text-xs font-mono focus:outline-none ${
                      isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block font-semibold mb-1 uppercase tracking-wider ${isDark ? 'text-[#45a29e]' : 'text-slate-600'}`}>
                  Operational Department / Unit
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  placeholder="e.g. Tier 1 NOC - Alpha Shift"
                  className={`w-full px-3 py-2 rounded-lg text-xs focus:outline-none ${
                    isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className={`w-full py-2.5 px-4 font-bold rounded-lg text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all mt-4 cursor-pointer shadow-sm ${
                  isSending 
                    ? 'opacity-60 cursor-not-allowed bg-slate-500 text-white' 
                    : isDark 
                      ? 'bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10]' 
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
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
          <div className={`border rounded-xl p-5 space-y-4 transition-colors ${
            isDark ? 'bg-[#1f2833] border-[#45a29e]/60 shadow-[0_0_15px_rgba(102,252,241,0.08)]' : 'bg-white border-slate-200 shadow-sm'
          }`}>
            
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-[#45a29e]/30' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Users className={`w-4 h-4 ${isDark ? 'text-[#66fcf1]' : 'text-sky-600'}`} />
                <h3 className={`text-sm font-bold uppercase tracking-wider font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Active Team Members ({users.length})
                </h3>
              </div>
              <span className={`text-xs font-mono ${isDark ? 'text-[#45a29e]' : 'text-slate-500'}`}>ROLE AUDIT ACTIVE</span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className={`w-full text-left text-xs ${isDark ? 'text-[#c5c6c7]' : 'text-slate-700'}`}>
                <thead className={`font-mono uppercase text-[10px] border-b ${
                  isDark ? 'bg-[#0b0c10] text-[#45a29e] border-[#45a29e]/30' : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}>
                  <tr>
                    <th className="py-2.5 px-3">Member</th>
                    <th className="py-2.5 px-3">Role</th>
                    <th className="py-2.5 px-3">Shift / Unit</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? 'divide-[#45a29e]/20' : 'divide-slate-100'}`}>
                  {users.map(u => {
                    const isSelf = u.id === currentUser.id;
                    return (
                      <tr key={u.id} className={`transition-colors ${isDark ? 'hover:bg-[#0b0c10]/40' : 'hover:bg-slate-50'}`}>
                        
                        {/* Member */}
                        <td className="py-3 px-3">
                          <div className={`font-semibold truncate max-w-[140px] ${isDark ? 'text-white' : 'text-slate-900'}`}>
                            {u.fullName} {isSelf && <span className={`text-[10px] ${isDark ? 'text-[#66fcf1]' : 'text-sky-600'}`}>(You)</span>}
                          </div>
                          <div className={`text-[11px] font-mono truncate max-w-[140px] ${isDark ? 'text-[#45a29e]' : 'text-slate-500'}`}>
                            {u.email}
                          </div>
                        </td>

                        {/* Role */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          {u.role === 'Admin' ? (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border ${
                              isDark ? 'bg-[#66fcf1]/20 text-[#66fcf1] border-[#66fcf1]/50' : 'bg-sky-100 text-sky-800 border-sky-300'
                            }`}>
                              ADMIN
                            </span>
                          ) : (
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold font-mono border ${
                              isDark ? 'bg-[#45a29e]/20 text-[#c5c6c7] border-[#45a29e]/50' : 'bg-slate-100 text-slate-700 border-slate-300'
                            }`}>
                              NOC
                            </span>
                          )}
                        </td>

                        {/* Unit */}
                        <td className="py-3 px-3 text-[11px] truncate max-w-[140px]">
                          {u.department}
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3 whitespace-nowrap">
                          <div className="space-y-0.5">
                            {u.status === 'Active' ? (
                              <span className={`text-[11px] flex items-center gap-1 ${isDark ? 'text-[#66fcf1]' : 'text-emerald-600 font-medium'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${isDark ? 'bg-[#66fcf1]' : 'bg-emerald-500'}`} />
                                Active
                              </span>
                            ) : (
                              <span className="text-[11px] text-red-500 flex items-center gap-1 font-medium">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                Suspended
                              </span>
                            )}
                            {u.requiresPasswordChange && (
                              <span className="inline-block px-1.5 py-0.2 bg-amber-500/15 text-amber-600 border border-amber-500/30 rounded text-[9px] font-mono">
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
                              className={`px-2 py-1 rounded-md text-[10px] font-mono transition-colors border ${
                                isSelf 
                                  ? 'opacity-40 cursor-not-allowed' 
                                  : isDark 
                                    ? 'bg-[#0b0c10] hover:bg-[#141c24] text-[#66fcf1] border-[#45a29e]/50' 
                                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-300'
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
                                  ? 'opacity-40 cursor-not-allowed' 
                                  : u.status === 'Active'
                                    ? 'text-amber-500 hover:bg-amber-500/20'
                                    : 'text-emerald-500 hover:bg-emerald-500/20'
                              }`}
                              title={u.status === 'Active' ? 'Suspend Member' : 'Reactivate Member'}
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                            </button>

                            {/* Delete button */}
                            <button
                              type="button"
                              onClick={() => setMemberToDelete(u)}
                              disabled={isSelf}
                              className={`p-1.5 rounded transition-all ${
                                isSelf 
                                  ? 'opacity-30 cursor-not-allowed text-slate-400' 
                                  : 'text-red-500 hover:bg-red-500/20 cursor-pointer hover:scale-110 active:scale-95'
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
          <div className={`border rounded-xl p-4 space-y-2 ${
            isDark ? 'bg-[#0b0c10] border-[#45a29e]/40' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`text-[11px] font-mono uppercase flex items-center justify-between ${
              isDark ? 'text-[#45a29e]' : 'text-slate-500'
            }`}>
              <span>Dispatched Invitation Registry</span>
              <span>SCICOM DIRECTORY SYNC</span>
            </div>
            {invitations.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {invitations.map(inv => (
                  <div key={inv.id} className={`p-2 rounded-lg border flex items-center justify-between text-[11px] ${
                    isDark ? 'bg-[#141c24] border-[#45a29e]/20' : 'bg-white border-slate-200'
                  }`}>
                    <div className="flex items-center gap-2">
                      <Mail className={`w-3.5 h-3.5 ${isDark ? 'text-[#66fcf1]' : 'text-sky-600'}`} />
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>{inv.email}</span>
                      <span className={isDark ? 'text-[#45a29e]' : 'text-slate-500'}>({inv.role})</span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px]">
                      <span>{inv.invitedAt}</span>
                      <span className={`font-mono font-bold ${isDark ? 'text-[#66fcf1]' : 'text-emerald-600'}`}>SENT</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs opacity-60 italic py-2">
                No recent member email invitations recorded in this session.
              </p>
            )}
          </div>

        </div>

      </div>

      {/* Delete Member Confirmation Modal */}
      {memberToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`border rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 ${
            isDark ? 'bg-[#1f2833] border-red-500/60 text-white' : 'bg-white border-red-300 text-slate-900'
          }`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/50 flex items-center justify-center text-red-500 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold font-mono uppercase tracking-wide">
                  Confirm Member Removal
                </h3>
                <p className="text-xs text-slate-400">SCICOM NOC Directory Action</p>
              </div>
            </div>

            <div className={`border rounded-xl p-3.5 space-y-2 text-xs ${
              isDark ? 'bg-[#0b0c10] border-[#45a29e]/30' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex justify-between items-center">
                <span className={`font-mono ${isDark ? 'text-[#45a29e]' : 'text-slate-500'}`}>Member:</span>
                <span className="font-bold text-sm">{memberToDelete.fullName}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-mono ${isDark ? 'text-[#45a29e]' : 'text-slate-500'}`}>Account Email:</span>
                <span className={`font-mono font-bold ${isDark ? 'text-[#66fcf1]' : 'text-sky-600'}`}>{memberToDelete.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-mono ${isDark ? 'text-[#45a29e]' : 'text-slate-500'}`}>Username:</span>
                <span className="font-mono">{memberToDelete.username}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-mono ${isDark ? 'text-[#45a29e]' : 'text-slate-500'}`}>Current Role:</span>
                <span className={`px-2 py-0.5 rounded font-mono text-[10px] border ${
                  isDark ? 'bg-[#1f2833] text-[#66fcf1] border-[#45a29e]/40' : 'bg-slate-200 text-slate-800 border-slate-300'
                }`}>
                  {memberToDelete.role}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className={`font-mono ${isDark ? 'text-[#45a29e]' : 'text-slate-500'}`}>Shift / Unit:</span>
                <span className="truncate max-w-[200px] text-right">{memberToDelete.department}</span>
              </div>

              <div className="pt-2.5 mt-2 border-t border-red-500/20 text-[11px] text-red-600 flex items-start gap-2 bg-red-500/5 p-2 rounded">
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
                className={`px-4 py-2 rounded-lg border text-xs font-mono transition-colors cursor-pointer ${
                  isDark ? 'bg-[#0b0c10] border-[#45a29e]/50 text-[#c5c6c7] hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200'
                }`}
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
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-mono font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Account</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
