import React, { useState } from 'react';
import { User } from '../types';
import { 
  X, 
  User as UserIcon, 
  Mail, 
  Phone, 
  Building, 
  Shield, 
  Key, 
  CheckCircle2, 
  AlertCircle, 
  Lock, 
  Save, 
  Calendar,
  Hash
} from 'lucide-react';

interface ProfileModalProps {
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onUpdateProfile: (updatedData: Partial<User>) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  currentUser,
  isOpen,
  onClose,
  onUpdateProfile
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'security'>('profile');

  // Profile Form State
  const [fullName, setFullName] = useState(currentUser.fullName);
  const [department, setDepartment] = useState(currentUser.department);
  const [phone, setPhone] = useState(currentUser.phone || '');
  const [ext, setExt] = useState(currentUser.ext || '');

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Status and feedback
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Full Name cannot be empty.');
      return;
    }

    onUpdateProfile({
      fullName: fullName.trim(),
      department: department.trim(),
      phone: phone.trim(),
      ext: ext.trim()
    });

    setSuccessMsg('Profile details successfully updated.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }

    if (currentUser.password && currentPassword !== currentUser.password) {
      setErrorMsg('Current password does not match.');
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    onUpdateProfile({
      password: newPassword,
      requiresPasswordChange: false
    });

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setSuccessMsg('Password updated successfully.');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const initials = currentUser.fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(p => p[0].toUpperCase())
    .join('');

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="relative w-full max-w-2xl bg-[#1f2833] border border-[#45a29e] rounded-lg shadow-[0_0_30px_rgba(102,252,241,0.2)] overflow-hidden font-sans my-8 animate-fade-in">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#45a29e]/30 bg-[#0b0c10]/70">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded bg-[#45a29e]/20 border border-[#45a29e]/40 text-[#66fcf1]">
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-wide font-mono">
                My SCICOM Profile
              </h2>
              <p className="text-xs text-[#c5c6c7]">
                Manage your NOC identity, contact extension &amp; security credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#c5c6c7] hover:text-[#ff4d4d] hover:bg-[#0b0c10] rounded border border-transparent hover:border-[#ff4d4d]/30 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Banner */}
        <div className="px-6 py-4 bg-[#0b0c10]/40 border-b border-[#45a29e]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-[#0b0c10] via-[#1f2833] to-[#45a29e] border-2 border-[#66fcf1] flex items-center justify-center text-lg font-bold text-[#66fcf1] font-mono shadow-[0_0_15px_rgba(102,252,241,0.3)]">
              {initials || 'SC'}
            </div>
            <div>
              <div className="text-base font-bold text-white flex items-center gap-2">
                <span>{currentUser.fullName}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  currentUser.role === 'Admin'
                    ? 'bg-[#66fcf1]/20 text-[#66fcf1] border-[#66fcf1]/50'
                    : 'bg-[#45a29e]/20 text-[#45a29e] border-[#45a29e]/50'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <div className="text-xs text-[#66fcf1] font-mono mt-0.5 flex items-center gap-1.5">
                <Mail className="w-3 h-3 shrink-0" />
                <span>{currentUser.email}</span>
              </div>
              <div className="text-[11px] text-[#c5c6c7] mt-0.5">
                {currentUser.department}
              </div>
            </div>
          </div>

          <div className="text-right text-[11px] text-[#c5c6c7] self-end sm:self-center font-mono space-y-0.5">
            <div className="flex items-center gap-1 justify-end">
              <Calendar className="w-3 h-3 text-[#45a29e]" />
              <span>Joined: {currentUser.createdAt}</span>
            </div>
            <div className="text-[#66fcf1]">
              Status: <span className="font-bold">{currentUser.status}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#45a29e]/30 px-6 pt-3 bg-[#0b0c10]/20">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold border-b-2 transition-all ${
              activeTab === 'profile'
                ? 'border-[#66fcf1] text-[#66fcf1] bg-[#45a29e]/10'
                : 'border-transparent text-[#c5c6c7] hover:text-white'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5" />
            <span>Profile Details</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold border-b-2 transition-all ${
              activeTab === 'security'
                ? 'border-[#66fcf1] text-[#66fcf1] bg-[#45a29e]/10'
                : 'border-transparent text-[#c5c6c7] hover:text-white'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Security &amp; Password</span>
          </button>
        </div>

        {/* Feedback alerts */}
        <div className="px-6 pt-4">
          {errorMsg && (
            <div className="p-3 rounded bg-[#ff4d4d]/10 border border-[#ff4d4d]/50 text-[#ff4d4d] text-xs flex items-start gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className="p-3 rounded bg-[#66fcf1]/10 border border-[#66fcf1]/50 text-[#66fcf1] text-xs flex items-start gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* Tab 1: Profile Details Form */}
        {activeTab === 'profile' && (
          <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-[#c5c6c7] mb-1 font-mono uppercase">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#45a29e]">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-[#0b0c10] border border-[#45a29e]/70 rounded text-sm text-white placeholder-[#c5c6c7]/50 focus:outline-none focus:border-[#66fcf1]"
                  />
                </div>
              </div>

              {/* Corporate Email (Read-Only) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#c5c6c7] font-mono uppercase">
                    SCICOM Corporate Email
                  </label>
                  <span className="text-[10px] text-[#45a29e] flex items-center gap-1 font-mono">
                    <Lock className="w-2.5 h-2.5" /> Corporate SSO
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#45a29e]/60">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    readOnly
                    className="w-full pl-9 pr-3 py-2 bg-[#0b0c10]/50 border border-[#45a29e]/30 rounded text-sm text-[#c5c6c7]/80 cursor-not-allowed font-mono"
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className="block text-xs font-semibold text-[#c5c6c7] mb-1 font-mono uppercase">
                  Department / Operations Unit
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#45a29e]">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. NOC Tier 1 Operations"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-[#0b0c10] border border-[#45a29e]/70 rounded text-sm text-white placeholder-[#c5c6c7]/50 focus:outline-none focus:border-[#66fcf1]"
                  />
                </div>
              </div>

              {/* Assigned Role (Read-Only with Privileges Info) */}
              <div>
                <label className="block text-xs font-semibold text-[#c5c6c7] mb-1 font-mono uppercase">
                  Portal Role &amp; Access Tier
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#66fcf1]">
                    <Shield className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={`${currentUser.role} (${currentUser.role === 'Admin' ? 'Administrator' : 'Operations Specialist'})`}
                    disabled
                    readOnly
                    className="w-full pl-9 pr-3 py-2 bg-[#0b0c10]/50 border border-[#45a29e]/30 rounded text-sm text-[#66fcf1] font-mono cursor-not-allowed font-bold"
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className="block text-xs font-semibold text-[#c5c6c7] mb-1 font-mono uppercase">
                  Mobile Phone (On-Call Contact)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#45a29e]">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+60 1x-xxx xxxx"
                    className="w-full pl-9 pr-3 py-2 bg-[#0b0c10] border border-[#45a29e]/70 rounded text-sm text-white placeholder-[#c5c6c7]/50 focus:outline-none focus:border-[#66fcf1] font-mono"
                  />
                </div>
              </div>

              {/* Office Extension */}
              <div>
                <label className="block text-xs font-semibold text-[#c5c6c7] mb-1 font-mono uppercase">
                  Office Phone Extension (PBX / Softphone)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#45a29e]">
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={ext}
                    onChange={(e) => setExt(e.target.value)}
                    placeholder="e.g. 4402"
                    className="w-full pl-9 pr-3 py-2 bg-[#0b0c10] border border-[#45a29e]/70 rounded text-sm text-white placeholder-[#c5c6c7]/50 focus:outline-none focus:border-[#66fcf1] font-mono"
                  />
                </div>
              </div>

            </div>

            {/* Role Privileges Summary */}
            <div className="p-3 bg-[#0b0c10] border border-[#45a29e]/40 rounded text-xs space-y-1">
              <span className="font-bold text-[#66fcf1] font-mono uppercase">Assigned System Privileges:</span>
              <p className="text-[#c5c6c7] text-[11px] leading-relaxed">
                {currentUser.role === 'Admin'
                  ? 'Full administrative control: Review & search SOP knowledge base, add new incident cases, edit On-Call Escalation Directory & Tier contacts, invite new team members via email, and administer user roles.'
                  : 'NOC Operator privileges: Review & search SOP knowledge base, access escalation contacts directory, and add new troubleshooting cases for future shift reference.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#45a29e]/30">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#0b0c10] hover:bg-[#1f2833] text-[#c5c6c7] hover:text-white border border-[#45a29e]/40 rounded text-xs font-mono transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] font-bold rounded text-xs transition-all shadow-[0_0_15px_rgba(69,162,158,0.3)] font-mono uppercase"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Profile Changes</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Security & Password Form */}
        {activeTab === 'security' && (
          <form onSubmit={handleChangePassword} className="p-6 space-y-4">
            <div className="p-3 bg-[#0b0c10] border border-[#66fcf1]/30 rounded text-xs text-[#c5c6c7] space-y-1">
              <div className="font-bold text-[#66fcf1] font-mono flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                <span>SCICOM Corporate Credential Policy</span>
              </div>
              <p className="text-[11px]">
                To maintain ISO/IEC 27001 information security compliance, ensure your new password is at least 6 characters long and distinct from previous passwords.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#c5c6c7] mb-1 font-mono uppercase">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#45a29e]">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                  className="w-full pl-9 pr-3 py-2 bg-[#0b0c10] border border-[#45a29e]/70 rounded text-sm text-white placeholder-[#c5c6c7]/50 focus:outline-none focus:border-[#66fcf1] font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#c5c6c7] mb-1 font-mono uppercase">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#45a29e]">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-[#0b0c10] border border-[#45a29e]/70 rounded text-sm text-white placeholder-[#c5c6c7]/50 focus:outline-none focus:border-[#66fcf1] font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#c5c6c7] mb-1 font-mono uppercase">
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#45a29e]">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-[#0b0c10] border border-[#45a29e]/70 rounded text-sm text-white placeholder-[#c5c6c7]/50 focus:outline-none focus:border-[#66fcf1] font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#45a29e]/30">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-[#0b0c10] hover:bg-[#1f2833] text-[#c5c6c7] hover:text-white border border-[#45a29e]/40 rounded text-xs font-mono transition-colors"
              >
                Close
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] font-bold rounded text-xs transition-all shadow-[0_0_15px_rgba(69,162,158,0.3)] font-mono uppercase"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Update Password</span>
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
