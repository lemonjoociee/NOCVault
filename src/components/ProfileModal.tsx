import React, { useState } from 'react';
import { User } from '../types';
import { useTheme } from '../context/ThemeContext';
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
  const { isDark } = useTheme();
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
      <div className={`relative w-full max-w-2xl border rounded-2xl shadow-2xl overflow-hidden font-sans my-8 animate-fade-in transition-colors ${
        isDark ? 'bg-[#1f2833] border-[#45a29e]' : 'bg-white border-slate-300'
      }`}>
        
        {/* Modal Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${
          isDark ? 'bg-[#0b0c10]/70 border-[#45a29e]/30' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg border ${
              isDark ? 'bg-[#45a29e]/20 border-[#45a29e]/40 text-[#66fcf1]' : 'bg-sky-100 border-sky-300 text-sky-700'
            }`}>
              <UserIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-bold tracking-wide font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>
                My SCICOM Profile
              </h2>
              <p className={`text-xs ${isDark ? 'text-[#c5c6c7]' : 'text-slate-500'}`}>
                Manage your NOC identity, contact extension &amp; security credentials
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg border transition-colors ${
              isDark ? 'text-[#c5c6c7] hover:text-red-400 bg-[#1f2833] border-transparent' : 'text-slate-400 hover:text-red-600 bg-white border-slate-200'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Card Banner */}
        <div className={`px-6 py-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
          isDark ? 'bg-[#0b0c10]/40 border-[#45a29e]/20' : 'bg-slate-50/70 border-slate-100'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold font-mono border-2 shadow-md ${
              isDark 
                ? 'bg-gradient-to-tr from-[#0b0c10] via-[#1f2833] to-[#45a29e] border-[#66fcf1] text-[#66fcf1]' 
                : 'bg-gradient-to-tr from-sky-600 to-teal-500 border-white text-white'
            }`}>
              {initials || 'SC'}
            </div>
            <div>
              <div className={`text-base font-bold flex items-center gap-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                <span>{currentUser.fullName}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                  currentUser.role === 'Admin'
                    ? isDark ? 'bg-[#66fcf1]/20 text-[#66fcf1] border-[#66fcf1]/50' : 'bg-sky-100 text-sky-800 border-sky-300'
                    : isDark ? 'bg-[#45a29e]/20 text-[#45a29e] border-[#45a29e]/50' : 'bg-slate-100 text-slate-700 border-slate-300'
                }`}>
                  {currentUser.role}
                </span>
              </div>
              <div className={`text-xs font-mono mt-0.5 flex items-center gap-1.5 ${
                isDark ? 'text-[#66fcf1]' : 'text-sky-700 font-medium'
              }`}>
                <Mail className="w-3 h-3 shrink-0" />
                <span>{currentUser.email}</span>
              </div>
              <div className={`text-[11px] mt-0.5 ${isDark ? 'text-[#c5c6c7]' : 'text-slate-500'}`}>
                {currentUser.department}
              </div>
            </div>
          </div>

          <div className={`text-right text-[11px] self-end sm:self-center font-mono space-y-0.5 ${
            isDark ? 'text-[#c5c6c7]' : 'text-slate-500'
          }`}>
            <div className="flex items-center gap-1 justify-end">
              <Calendar className={`w-3 h-3 ${isDark ? 'text-[#45a29e]' : 'text-slate-400'}`} />
              <span>Joined: {currentUser.createdAt}</span>
            </div>
            <div className={isDark ? 'text-[#66fcf1]' : 'text-emerald-700 font-medium'}>
              Status: <span className="font-bold">{currentUser.status}</span>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex border-b px-6 pt-3 ${isDark ? 'border-[#45a29e]/30 bg-[#0b0c10]/20' : 'border-slate-200 bg-slate-50'}`}>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-mono font-bold border-b-2 transition-all ${
              activeTab === 'profile'
                ? isDark ? 'border-[#66fcf1] text-[#66fcf1] bg-[#45a29e]/10' : 'border-sky-600 text-sky-700 bg-white'
                : isDark ? 'border-transparent text-[#c5c6c7] hover:text-white' : 'border-transparent text-slate-500 hover:text-slate-800'
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
                ? isDark ? 'border-[#66fcf1] text-[#66fcf1] bg-[#45a29e]/10' : 'border-sky-600 text-sky-700 bg-white'
                : isDark ? 'border-transparent text-[#c5c6c7] hover:text-white' : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            <span>Security &amp; Password</span>
          </button>
        </div>

        {/* Feedback alerts */}
        <div className="px-6 pt-4">
          {errorMsg && (
            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}
          {successMsg && (
            <div className={`p-3 rounded-lg border text-xs flex items-start gap-2 ${
              isDark ? 'bg-[#66fcf1]/10 border-[#66fcf1]/50 text-[#66fcf1]' : 'bg-emerald-50 border-emerald-300 text-emerald-800 font-medium'
            }`}>
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
                <label className={`block text-xs font-semibold mb-1 font-mono uppercase ${
                  isDark ? 'text-[#c5c6c7]' : 'text-slate-700'
                }`}>
                  Full Name
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? 'text-[#45a29e]' : 'text-slate-400'
                  }`}>
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none ${
                      isDark ? 'bg-[#0b0c10] border border-[#45a29e]/70 text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Corporate Email (Read-Only) */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className={`block text-xs font-semibold font-mono uppercase ${
                    isDark ? 'text-[#c5c6c7]' : 'text-slate-700'
                  }`}>
                    SCICOM Corporate Email
                  </label>
                  <span className={`text-[10px] flex items-center gap-1 font-mono ${
                    isDark ? 'text-[#45a29e]' : 'text-slate-500'
                  }`}>
                    <Lock className="w-2.5 h-2.5" /> Corporate SSO
                  </span>
                </div>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? 'text-[#45a29e]/60' : 'text-slate-400'
                  }`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={currentUser.email}
                    disabled
                    readOnly
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm cursor-not-allowed font-mono ${
                      isDark ? 'bg-[#0b0c10]/50 border border-[#45a29e]/30 text-[#c5c6c7]/80' : 'bg-slate-100 border border-slate-200 text-slate-500'
                    }`}
                  />
                </div>
              </div>

              {/* Department */}
              <div>
                <label className={`block text-xs font-semibold mb-1 font-mono uppercase ${
                  isDark ? 'text-[#c5c6c7]' : 'text-slate-700'
                }`}>
                  Department / Operations Unit
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? 'text-[#45a29e]' : 'text-slate-400'
                  }`}>
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="e.g. NOC Tier 1 Operations"
                    required
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm focus:outline-none ${
                      isDark ? 'bg-[#0b0c10] border border-[#45a29e]/70 text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Assigned Role */}
              <div>
                <label className={`block text-xs font-semibold mb-1 font-mono uppercase ${
                  isDark ? 'text-[#c5c6c7]' : 'text-slate-700'
                }`}>
                  Portal Role &amp; Access Tier
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? 'text-[#66fcf1]' : 'text-sky-600'
                  }`}>
                    <Shield className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={`${currentUser.role} (${currentUser.role === 'Admin' ? 'Administrator' : 'Operations Specialist'})`}
                    disabled
                    readOnly
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm font-mono cursor-not-allowed font-bold ${
                      isDark ? 'bg-[#0b0c10]/50 border border-[#45a29e]/30 text-[#66fcf1]' : 'bg-slate-100 border border-slate-200 text-sky-800'
                    }`}
                  />
                </div>
              </div>

              {/* Mobile Phone */}
              <div>
                <label className={`block text-xs font-semibold mb-1 font-mono uppercase ${
                  isDark ? 'text-[#c5c6c7]' : 'text-slate-700'
                }`}>
                  Mobile Phone (On-Call Contact)
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? 'text-[#45a29e]' : 'text-slate-400'
                  }`}>
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+60 1x-xxx xxxx"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm font-mono focus:outline-none ${
                      isDark ? 'bg-[#0b0c10] border border-[#45a29e]/70 text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              {/* Office Extension */}
              <div>
                <label className={`block text-xs font-semibold mb-1 font-mono uppercase ${
                  isDark ? 'text-[#c5c6c7]' : 'text-slate-700'
                }`}>
                  Office Phone Extension (PBX / Softphone)
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? 'text-[#45a29e]' : 'text-slate-400'
                  }`}>
                    <Hash className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={ext}
                    onChange={(e) => setExt(e.target.value)}
                    placeholder="e.g. 4402"
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm font-mono focus:outline-none ${
                      isDark ? 'bg-[#0b0c10] border border-[#45a29e]/70 text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

            </div>

            {/* Role Privileges Summary */}
            <div className={`p-3 rounded-xl border text-xs space-y-1 ${
              isDark ? 'bg-[#0b0c10] border-[#45a29e]/40' : 'bg-slate-50 border-slate-200'
            }`}>
              <span className={`font-bold font-mono uppercase ${isDark ? 'text-[#66fcf1]' : 'text-sky-700'}`}>
                Assigned System Privileges:
              </span>
              <p className={`text-[11px] leading-relaxed ${isDark ? 'text-[#c5c6c7]' : 'text-slate-600'}`}>
                {currentUser.role === 'Admin'
                  ? 'Full administrative control: Review & search SOP knowledge base, add new incident cases, edit On-Call Escalation Directory & Tier contacts, invite new team members via email, and administer user roles.'
                  : 'NOC Operator privileges: Review & search SOP knowledge base, access escalation contacts directory, and add new troubleshooting cases for future shift reference.'}
              </p>
            </div>

            {/* Modal Actions */}
            <div className={`flex items-center justify-end gap-3 pt-3 border-t ${
              isDark ? 'border-[#45a29e]/30' : 'border-slate-200'
            }`}>
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg text-xs font-mono border transition-colors ${
                  isDark ? 'bg-[#0b0c10] hover:bg-[#1f2833] text-[#c5c6c7] hover:text-white border-[#45a29e]/40' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                Close
              </button>
              <button
                type="submit"
                className={`flex items-center gap-2 px-5 py-2 font-bold rounded-lg text-xs transition-all shadow-sm font-mono uppercase ${
                  isDark ? 'bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10]' : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
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
            <div className={`p-3 rounded-xl border text-xs space-y-1 ${
              isDark ? 'bg-[#0b0c10] border-[#66fcf1]/30 text-[#c5c6c7]' : 'bg-sky-50 border-sky-200 text-slate-700'
            }`}>
              <div className={`font-bold font-mono flex items-center gap-1.5 ${
                isDark ? 'text-[#66fcf1]' : 'text-sky-800'
              }`}>
                <Lock className="w-3.5 h-3.5" />
                <span>SCICOM Corporate Credential Policy</span>
              </div>
              <p className="text-[11px]">
                To maintain ISO/IEC 27001 information security compliance, ensure your new password is at least 6 characters long and distinct from previous passwords.
              </p>
            </div>

            <div>
              <label className={`block text-xs font-semibold mb-1 font-mono uppercase ${
                isDark ? 'text-[#c5c6c7]' : 'text-slate-700'
              }`}>
                Current Password
              </label>
              <div className="relative">
                <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                  isDark ? 'text-[#45a29e]' : 'text-slate-400'
                }`}>
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  required
                  className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm font-mono focus:outline-none ${
                    isDark ? 'bg-[#0b0c10] border border-[#45a29e]/70 text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:bg-white'
                  }`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 font-mono uppercase ${
                  isDark ? 'text-[#c5c6c7]' : 'text-slate-700'
                }`}>
                  New Password
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? 'text-[#45a29e]' : 'text-slate-400'
                  }`}>
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    required
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm font-mono focus:outline-none ${
                      isDark ? 'bg-[#0b0c10] border border-[#45a29e]/70 text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 font-mono uppercase ${
                  isDark ? 'text-[#c5c6c7]' : 'text-slate-700'
                }`}>
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? 'text-[#45a29e]' : 'text-slate-400'
                  }`}>
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm font-mono focus:outline-none ${
                      isDark ? 'bg-[#0b0c10] border border-[#45a29e]/70 text-white focus:border-[#66fcf1]' : 'bg-slate-50 border border-slate-300 text-slate-900 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className={`flex items-center justify-end gap-3 pt-4 border-t ${
              isDark ? 'border-[#45a29e]/30' : 'border-slate-200'
            }`}>
              <button
                type="button"
                onClick={onClose}
                className={`px-4 py-2 rounded-lg text-xs font-mono border transition-colors ${
                  isDark ? 'bg-[#0b0c10] hover:bg-[#1f2833] text-[#c5c6c7] hover:text-white border-[#45a29e]/40' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300'
                }`}
              >
                Close
              </button>
              <button
                type="submit"
                className={`flex items-center gap-2 px-5 py-2 font-bold rounded-lg text-xs transition-all shadow-sm font-mono uppercase ${
                  isDark ? 'bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10]' : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
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
