import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { 
  Shield, 
  Key, 
  Mail, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  Lock, 
  X, 
  RefreshCw, 
  UserCheck, 
  Sparkles,
  Sun,
  Moon
} from 'lucide-react';
import { updateUserPassword, resetUserPasswordByEmail, getStoredUsers } from '../utils/storage';
import { useTheme } from '../context/ThemeContext';

interface LoginViewProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  onUserUpdated?: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ users, onLoginSuccess, onUserUpdated }) => {
  const { isDark, toggleTheme } = useTheme();

  // Main form states
  const [email, setEmail] = useState('noc_lead@scicom.com.my');
  const [password, setPassword] = useState('noc123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // First-Time Login Password Change state
  const [pendingFirstLoginUser, setPendingFirstLoginUser] = useState<User | null>(null);
  const [firstTimeNewPassword, setFirstTimeNewPassword] = useState('');
  const [firstTimeConfirmPassword, setFirstTimeConfirmPassword] = useState('');
  const [firstTimeError, setFirstTimeError] = useState<string | null>(null);

  // Forgot Password Flow states
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2 | 3>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [simulatedOtp, setSimulatedOtp] = useState('');
  const [enteredOtp, setEnteredOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);

  // Email domain validator
  const isScicomEmail = (testEmail: string): boolean => {
    const clean = testEmail.trim().toLowerCase();
    return clean.endsWith('@scicom.com.my') || clean.endsWith('@scicom.com');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessNotice(null);

    const cleanEmail = email.trim().toLowerCase();

    // Enforce SCICOM corporate email only
    if (!isScicomEmail(cleanEmail)) {
      setErrorMsg('Access restricted. Only authorized SCICOM corporate email addresses (@scicom.com.my or @scicom.com) are permitted.');
      return;
    }

    // Refresh user list from storage
    const currentUsers = getStoredUsers();
    const existing = currentUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!existing) {
      setErrorMsg(`No active SCICOM directory record found for "${cleanEmail}". Please verify your corporate email or use the demo credentials below.`);
      return;
    }

    if (existing.status === 'Suspended') {
      setErrorMsg('This account has been suspended by a System Administrator.');
      return;
    }

    // Verify password
    const expectedPassword = existing.password || (
      existing.role === 'Admin' ? 'admin123' : 
      existing.username === 'rajeev' ? 'rajeev123' : 'noc123'
    );

    if (password !== expectedPassword) {
      setErrorMsg(`Invalid corporate password for ${cleanEmail}. Check credentials below or use "Forgot Password?".`);
      return;
    }

    // Check if new/first-time user must change password
    if (existing.requiresPasswordChange) {
      setPendingFirstLoginUser(existing);
      setFirstTimeNewPassword('');
      setFirstTimeConfirmPassword('');
      setFirstTimeError(null);
      return;
    }

    // Successful normal login
    completeLogin(existing);
  };

  const completeLogin = (user: User) => {
    const authenticatedUser: User = {
      ...user,
      lastLogin: 'Just now'
    };
    onLoginSuccess(authenticatedUser);
  };

  // Handle first-time password setup submission
  const handleFirstTimePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFirstTimeError(null);

    if (!pendingFirstLoginUser) return;

    if (firstTimeNewPassword.length < 6) {
      setFirstTimeError('New password must contain at least 6 characters.');
      return;
    }

    if (firstTimeNewPassword !== firstTimeConfirmPassword) {
      setFirstTimeError('New password and confirmation password do not match.');
      return;
    }

    if (firstTimeNewPassword === pendingFirstLoginUser.password) {
      setFirstTimeError('New password must be different from the temporary default password.');
      return;
    }

    const updatedUser = updateUserPassword(pendingFirstLoginUser.id, firstTimeNewPassword, false);
    if (onUserUpdated) {
      onUserUpdated(updatedUser);
    }

    setPendingFirstLoginUser(null);
    completeLogin(updatedUser);
  };

  // Quick Credential selection
  const handleQuickCredentialSelect = (selectedEmail: string, selectedPass: string) => {
    setEmail(selectedEmail);
    setPassword(selectedPass);
    setErrorMsg(null);
    setSuccessNotice(null);

    const currentUsers = getStoredUsers();
    const target = currentUsers.find(u => u.email.toLowerCase() === selectedEmail.toLowerCase());
    if (target) {
      if (target.requiresPasswordChange) {
        setPendingFirstLoginUser(target);
        setFirstTimeNewPassword('');
        setFirstTimeConfirmPassword('');
        setFirstTimeError(null);
      } else {
        completeLogin(target);
      }
    }
  };

  // Forgot Password: Step 1
  const handleForgotStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    const clean = forgotEmail.trim().toLowerCase();

    if (!isScicomEmail(clean)) {
      setForgotError('Please enter a valid SCICOM corporate email (@scicom.com.my or @scicom.com).');
      return;
    }

    const currentUsers = getStoredUsers();
    const exists = currentUsers.find(u => u.email.toLowerCase() === clean);
    if (!exists) {
      setForgotError(`No SCICOM account found associated with "${clean}".`);
      return;
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(otp);
    setEnteredOtp('');
    setForgotStep(2);
  };

  // Forgot Password: Step 2
  const handleForgotStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (enteredOtp.trim() !== simulatedOtp.trim()) {
      setForgotError('Invalid verification passcode. Please enter the 6-digit code shown or click "Auto-fill Code".');
      return;
    }

    setForgotStep(3);
  };

  // Forgot Password: Step 3
  const handleForgotStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (forgotNewPassword.length < 6) {
      setForgotError('Password must contain at least 6 characters.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match. Please verify both fields.');
      return;
    }

    const success = resetUserPasswordByEmail(forgotEmail, forgotNewPassword);
    if (success) {
      setIsForgotModalOpen(false);
      setPassword(forgotNewPassword);
      setEmail(forgotEmail);
      setSuccessNotice(`Password for ${forgotEmail} has been reset. You may now sign in.`);
      resetForgotState();
    } else {
      setForgotError('Failed to update password. Please try again.');
    }
  };

  const resetForgotState = () => {
    setForgotStep(1);
    setForgotEmail('');
    setSimulatedOtp('');
    setEnteredOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans transition-colors ${
      isDark ? 'bg-[#0b0c10] text-[#c5c6c7]' : 'bg-slate-100 text-slate-800'
    }`}>
      
      {/* Top Floating Controls */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-sm ${
            isDark 
              ? 'bg-[#1f2833] border-[#45a29e]/50 text-amber-300 hover:text-amber-200 hover:bg-[#141c24] hover:border-amber-400' 
              : 'bg-white border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50'
          }`}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4 animate-spin-slow" /> : <Moon className="w-4 h-4 text-sky-700" />}
        </button>
      </div>

      {/* Background Matrix / Grid Accent lines */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(${isDark ? '#45a29e' : '#0284c7'} 1px, transparent 1px), radial-gradient(${isDark ? '#45a29e' : '#0284c7'} 1px, ${isDark ? '#0b0c10' : '#f1f5f9'} 1px)`,
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px'
        }}
      />

      <div className="w-full max-w-lg z-10">
        
        {/* Main Container Card */}
        <div className={`border rounded-2xl p-6 sm:p-8 shadow-2xl transition-colors ${
          isDark 
            ? 'bg-[#1f2833] border-[#45a29e] shadow-[0_0_25px_rgba(102,252,241,0.18)]' 
            : 'bg-white border-slate-200 shadow-xl'
        }`}>
          
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <img
                src="/assets/aistudio/Scicom_MSC_Berhad_idpuWHQlKm_1_283b6397.png"
                alt="SCICOM Logo"
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </div>
            <h1 className={`text-2xl font-bold tracking-wide uppercase font-mono ${
              isDark ? 'text-[#66fcf1]' : 'text-slate-900'
            }`}>
              NOC Operations Portal
            </h1>
            <p className={`text-xs sm:text-sm mt-1 ${isDark ? 'text-[#c5c6c7]' : 'text-slate-600'}`}>
              Authenticate with your SCICOM Corporate Email to access SOPs, escalation paths, and shift workflows.
            </p>
          </div>

          {/* Success Banner */}
          {successNotice && (
            <div className={`mb-5 p-3 rounded-lg border text-xs flex items-start gap-2 font-mono ${
              isDark ? 'bg-[#66fcf1]/10 border-[#66fcf1]/50 text-[#66fcf1]' : 'bg-emerald-50 border-emerald-300 text-emerald-800'
            }`}>
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className={`mb-5 p-3 rounded-lg border text-xs flex items-start gap-2 font-mono ${
              isDark ? 'bg-[#ff4d4d]/10 border-[#ff4d4d]/50 text-[#ff4d4d]' : 'bg-red-50 border-red-300 text-red-800'
            }`}>
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* VIEW A: Standard Sign In Form */}
          {!pendingFirstLoginUser && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`block text-xs font-semibold uppercase tracking-wider font-mono ${
                    isDark ? 'text-[#c5c6c7]' : 'text-slate-700'
                  }`}>
                    SCICOM Corporate Email
                  </label>
                  <span className={`text-[10px] font-mono ${isDark ? 'text-[#45a29e]' : 'text-sky-600'}`}>
                    @scicom.com.my only
                  </span>
                </div>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? 'text-[#45a29e]' : 'text-slate-400'
                  }`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. noc_lead@scicom.com.my"
                    required
                    className={`w-full pl-9 pr-3 py-2.5 rounded-lg text-sm transition-all font-mono focus:outline-none ${
                      isDark 
                        ? 'bg-[#0b0c10] border border-[#45a29e] text-white placeholder-[#c5c6c7]/50 focus:border-[#66fcf1]' 
                        : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className={`block text-xs font-semibold uppercase tracking-wider font-mono ${
                    isDark ? 'text-[#c5c6c7]' : 'text-slate-700'
                  }`}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotError(null);
                      setForgotStep(1);
                      setIsForgotModalOpen(true);
                    }}
                    className={`text-xs font-mono hover:underline focus:outline-none ${
                      isDark ? 'text-[#66fcf1]' : 'text-sky-600'
                    }`}
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? 'text-[#45a29e]' : 'text-slate-400'
                  }`}>
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className={`w-full pl-9 pr-3 py-2.5 rounded-lg text-sm transition-all font-mono focus:outline-none ${
                      isDark 
                        ? 'bg-[#0b0c10] border border-[#45a29e] text-white placeholder-[#c5c6c7]/50 focus:border-[#66fcf1]' 
                        : 'bg-slate-50 border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-sky-500 focus:bg-white'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                className={`w-full py-3 px-4 font-bold rounded-lg text-sm transition-all duration-200 uppercase tracking-wider flex items-center justify-center gap-2 mt-6 cursor-pointer shadow-sm ${
                  isDark 
                    ? 'bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10]' 
                    : 'bg-teal-600 hover:bg-teal-700 text-white'
                }`}
              >
                <span>Sign In to NOC Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* VIEW B: Mandatory First-Time Login Password Change Interceptor */}
          {pendingFirstLoginUser && (
            <div className={`p-4 rounded-xl border animate-fade-in space-y-4 ${
              isDark ? 'bg-[#0b0c10] border-[#66fcf1]' : 'bg-slate-50 border-sky-400'
            }`}>
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-lg border shrink-0 mt-0.5 ${
                  isDark ? 'bg-[#66fcf1]/20 text-[#66fcf1] border-[#66fcf1]/40' : 'bg-sky-100 text-sky-700 border-sky-300'
                }`}>
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className={`text-sm font-bold font-mono uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    Mandatory First-Time Password Setup
                  </h3>
                  <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? 'text-[#c5c6c7]' : 'text-slate-600'}`}>
                    Welcome, <strong className={isDark ? 'text-white' : 'text-slate-900'}>{pendingFirstLoginUser.fullName}</strong>! As a new or newly provisioned member, SCICOM corporate security policy requires you to set a personal password before portal access.
                  </p>
                </div>
              </div>

              {firstTimeError && (
                <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{firstTimeError}</span>
                </div>
              )}

              <form onSubmit={handleFirstTimePasswordSubmit} className="space-y-3">
                <div>
                  <label className={`block text-xs font-semibold mb-1 font-mono uppercase ${isDark ? 'text-[#c5c6c7]' : 'text-slate-700'}`}>
                    New Password (Min 6 Characters)
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isDark ? 'text-[#45a29e]' : 'text-slate-400'}`}>
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={firstTimeNewPassword}
                      onChange={(e) => setFirstTimeNewPassword(e.target.value)}
                      placeholder="Enter strong password"
                      required
                      autoFocus
                      className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm font-mono focus:outline-none ${
                        isDark ? 'bg-[#1f2833] border border-[#45a29e] text-white' : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 font-mono uppercase ${isDark ? 'text-[#c5c6c7]' : 'text-slate-700'}`}>
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isDark ? 'text-[#45a29e]' : 'text-slate-400'}`}>
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={firstTimeConfirmPassword}
                      onChange={(e) => setFirstTimeConfirmPassword(e.target.value)}
                      placeholder="Re-enter to confirm"
                      required
                      className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm font-mono focus:outline-none ${
                        isDark ? 'bg-[#1f2833] border border-[#45a29e] text-white' : 'bg-white border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setPendingFirstLoginUser(null)}
                    className={`px-3 py-2 text-xs font-mono ${isDark ? 'text-[#c5c6c7] hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`flex-1 py-2 px-3 font-bold rounded-lg text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm ${
                      isDark ? 'bg-[#66fcf1] hover:bg-[#45a29e] text-[#0b0c10]' : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Set Password &amp; Enter Portal</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Explicit Credentials for Roles */}
          <div className={`mt-6 pt-5 border-t ${isDark ? 'border-[#45a29e]/30' : 'border-slate-200'}`}>
            <div className={`text-xs mb-3 font-semibold uppercase tracking-wider text-center font-mono ${
              isDark ? 'text-[#66fcf1]' : 'text-slate-700'
            }`}>
              Credentials for Both Roles
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Role 1: NOC Operator */}
              <div className={`p-3 rounded-xl border space-y-2 flex flex-col justify-between ${
                isDark ? 'bg-[#0b0c10] border-[#45a29e]/60' : 'bg-slate-50 border-slate-200'
              }`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-xs font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>ROLE: NOC</span>
                    <span className={`px-1.5 py-0.2 text-[10px] rounded font-mono border ${
                      isDark ? 'bg-[#45a29e]/20 text-[#66fcf1] border-[#45a29e]/40' : 'bg-slate-200 text-slate-700 border-slate-300'
                    }`}>
                      OPERATOR
                    </span>
                  </div>
                  
                  <div className={`text-[11px] font-mono mt-2 space-y-0.5 ${isDark ? 'text-[#c5c6c7]' : 'text-slate-600'}`}>
                    <div className="truncate">Email: <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>noc_lead@scicom.com.my</span></div>
                    <div>Pass: <span className={`font-bold ${isDark ? 'text-[#66fcf1]' : 'text-teal-700'}`}>noc123</span></div>
                  </div>

                  <p className={`text-[10px] mt-1.5 leading-snug ${isDark ? 'text-[#c5c6c7]/80' : 'text-slate-500'}`}>
                    Can review guides &amp; add cases for future reference.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickCredentialSelect('noc_lead@scicom.com.my', 'noc123')}
                  className={`w-full mt-2 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer border ${
                    isDark 
                      ? 'bg-[#1f2833] hover:bg-[#45a29e] text-[#66fcf1] hover:text-[#0b0c10] border-[#45a29e]' 
                      : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                  }`}
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Sign In as NOC</span>
                </button>
              </div>

              {/* Role 2: Administrator */}
              <div className={`p-3 rounded-xl border space-y-2 flex flex-col justify-between shadow-sm ${
                isDark ? 'bg-[#0b0c10] border-[#66fcf1]/60' : 'bg-sky-50 border-sky-300'
              }`}>
                <div>
                  <div className="flex items-center justify-between">
                    <span className={`font-bold text-xs font-mono ${isDark ? 'text-white' : 'text-slate-900'}`}>ROLE: ADMIN</span>
                    <span className={`px-1.5 py-0.2 text-[10px] rounded font-mono border ${
                      isDark ? 'bg-[#66fcf1]/20 text-[#66fcf1] border-[#66fcf1]/50' : 'bg-sky-200 text-sky-800 border-sky-300'
                    }`}>
                      FULL ACCESS
                    </span>
                  </div>
                  
                  <div className={`text-[11px] font-mono mt-2 space-y-0.5 ${isDark ? 'text-[#c5c6c7]' : 'text-slate-600'}`}>
                    <div className="truncate">Email: <span className={`font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>admin@scicom.com.my</span></div>
                    <div>Pass: <span className={`font-bold ${isDark ? 'text-[#66fcf1]' : 'text-sky-700'}`}>admin123</span></div>
                  </div>

                  <p className={`text-[10px] mt-1.5 leading-snug ${isDark ? 'text-[#c5c6c7]/80' : 'text-slate-500'}`}>
                    NOC privileges + add team members in website through email.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickCredentialSelect('admin@scicom.com.my', 'admin123')}
                  className={`w-full mt-2 py-1.5 px-2 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer ${
                    isDark 
                      ? 'bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10]' 
                      : 'bg-teal-600 hover:bg-teal-700 text-white'
                  }`}
                >
                  <Shield className="w-3 h-3" />
                  <span>Sign In as Admin</span>
                </button>
              </div>

            </div>

            {/* Test First-Time Login Account */}
            <div className={`mt-3 p-2.5 rounded-xl border border-dashed flex items-center justify-between gap-2 text-xs ${
              isDark ? 'bg-[#0b0c10]/80 border-[#45a29e]/40' : 'bg-slate-50 border-slate-300'
            }`}>
              <div className={`font-mono text-[11px] leading-tight ${isDark ? 'text-[#c5c6c7]' : 'text-slate-600'}`}>
                <div className={`font-bold flex items-center gap-1.5 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  <Sparkles className={`w-3 h-3 ${isDark ? 'text-[#66fcf1]' : 'text-teal-600'}`} />
                  <span>Test First-Time Login:</span>
                </div>
                <div className={`text-[10px] ${isDark ? 'text-[#45a29e]' : 'text-slate-500'}`}>
                  rajeev@scicom.com.my (Pass: rajeev123)
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleQuickCredentialSelect('rajeev@scicom.com.my', 'rajeev123')}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold whitespace-nowrap cursor-pointer transition-colors border ${
                  isDark 
                    ? 'bg-[#1f2833] hover:bg-[#45a29e] text-[#66fcf1] hover:text-[#0b0c10] border-[#45a29e]' 
                    : 'bg-white hover:bg-slate-100 text-slate-800 border-slate-300'
                }`}
              >
                Test 1st Login
              </button>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className={`text-center mt-4 text-xs font-mono ${isDark ? 'text-[#45a29e]' : 'text-slate-500'}`}>
          SCICOM (MSC) Berhad NOC Technical Standard Operating Procedures
        </div>

      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className={`relative w-full max-w-md rounded-2xl border shadow-2xl p-6 font-sans animate-fade-in ${
            isDark ? 'bg-[#1f2833] border-[#45a29e]' : 'bg-white border-slate-300'
          }`}>
            
            <div className={`flex items-center justify-between pb-3 border-b ${isDark ? 'border-[#45a29e]/30' : 'border-slate-200'}`}>
              <div className="flex items-center gap-2">
                <Key className={`w-5 h-5 ${isDark ? 'text-[#66fcf1]' : 'text-sky-600'}`} />
                <h3 className={`text-base font-bold font-mono uppercase ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Reset Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className={`p-1 rounded-lg ${isDark ? 'text-[#c5c6c7] hover:text-[#ff4d4d]' : 'text-slate-400 hover:text-red-600'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotError && (
              <div className="mt-4 p-2.5 rounded-lg bg-red-500/10 border border-red-500/50 text-red-500 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* Step 1: Enter Corporate Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleForgotStep1Submit} className="mt-4 space-y-4">
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#c5c6c7]' : 'text-slate-600'}`}>
                  Enter your registered SCICOM corporate email. A one-time verification passcode will be issued to confirm your identity.
                </p>

                <div>
                  <label className={`block text-xs font-semibold mb-1 font-mono uppercase ${isDark ? 'text-[#c5c6c7]' : 'text-slate-700'}`}>
                    SCICOM Corporate Email
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isDark ? 'text-[#45a29e]' : 'text-slate-400'}`}>
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. noc_lead@scicom.com.my"
                      required
                      autoFocus
                      className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm font-mono focus:outline-none ${
                        isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className={`px-3 py-2 text-xs font-mono ${isDark ? 'text-[#c5c6c7] hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`py-2 px-4 font-bold rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 ${
                      isDark ? 'bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10]' : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    <span>Send Verification Code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 2: Verification Code Input */}
            {forgotStep === 2 && (
              <form onSubmit={handleForgotStep2Submit} className="mt-4 space-y-4">
                <div className={`p-3 rounded-xl border text-xs space-y-2 ${
                  isDark ? 'bg-[#0b0c10] border-[#66fcf1]/40' : 'bg-slate-50 border-sky-300'
                }`}>
                  <div className={`font-mono font-bold flex items-center gap-1.5 ${isDark ? 'text-[#66fcf1]' : 'text-sky-700'}`}>
                    <UserCheck className="w-4 h-4" />
                    <span>Passcode Dispatched to Corporate Mailbox</span>
                  </div>
                  <p className={`text-[11px] ${isDark ? 'text-[#c5c6c7]' : 'text-slate-600'}`}>
                    Simulated verification code for <strong>{forgotEmail}</strong>:
                  </p>
                  <div className={`flex items-center justify-between p-2 rounded-lg border ${
                    isDark ? 'bg-[#1f2833] border-[#45a29e]/50' : 'bg-white border-slate-200'
                  }`}>
                    <span className={`font-mono text-base font-bold tracking-widest ${isDark ? 'text-[#66fcf1]' : 'text-sky-700'}`}>
                      {simulatedOtp}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEnteredOtp(simulatedOtp)}
                      className={`px-2 py-1 rounded text-[10px] font-mono font-bold transition-colors ${
                        isDark ? 'bg-[#45a29e]/20 hover:bg-[#45a29e] text-[#66fcf1] hover:text-[#0b0c10]' : 'bg-sky-100 hover:bg-sky-200 text-sky-800'
                      }`}
                    >
                      Auto-fill Code
                    </button>
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 font-mono uppercase ${isDark ? 'text-[#c5c6c7]' : 'text-slate-700'}`}>
                    Enter 6-Digit Code
                  </label>
                  <input
                    type="text"
                    value={enteredOtp}
                    onChange={(e) => setEnteredOtp(e.target.value)}
                    placeholder="Enter 6-digit code"
                    required
                    maxLength={6}
                    autoFocus
                    className={`w-full px-3 py-2 rounded-lg text-center tracking-widest text-lg font-mono focus:outline-none ${
                      isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                    }`}
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className={`text-xs font-mono ${isDark ? 'text-[#c5c6c7] hover:text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className={`py-2 px-4 font-bold rounded-lg text-xs font-mono uppercase tracking-wider flex items-center gap-1.5 ${
                      isDark ? 'bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10]' : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    <span>Verify Code</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </form>
            )}

            {/* Step 3: New Password Creation */}
            {forgotStep === 3 && (
              <form onSubmit={handleForgotStep3Submit} className="mt-4 space-y-4">
                <p className={`text-xs leading-relaxed ${isDark ? 'text-[#c5c6c7]' : 'text-slate-600'}`}>
                  Identity verified for <strong className={isDark ? 'text-white' : 'text-slate-900'}>{forgotEmail}</strong>. Create a new secure password for your NOC account.
                </p>

                <div>
                  <label className={`block text-xs font-semibold mb-1 font-mono uppercase ${isDark ? 'text-[#c5c6c7]' : 'text-slate-700'}`}>
                    New Password
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isDark ? 'text-[#45a29e]' : 'text-slate-400'}`}>
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      autoFocus
                      className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm font-mono focus:outline-none ${
                        isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-xs font-semibold mb-1 font-mono uppercase ${isDark ? 'text-[#c5c6c7]' : 'text-slate-700'}`}>
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${isDark ? 'text-[#45a29e]' : 'text-slate-400'}`}>
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      className={`w-full pl-9 pr-3 py-2 rounded-lg text-sm font-mono focus:outline-none ${
                        isDark ? 'bg-[#0b0c10] border border-[#45a29e] text-white' : 'bg-slate-50 border border-slate-300 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="submit"
                    className={`w-full py-2.5 px-4 font-bold rounded-lg text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm ${
                      isDark ? 'bg-[#66fcf1] hover:bg-[#45a29e] text-[#0b0c10]' : 'bg-teal-600 hover:bg-teal-700 text-white'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Save New Password &amp; Login</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

    </div>
  );
};
