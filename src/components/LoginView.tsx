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
  Sparkles
} from 'lucide-react';
import { updateUserPassword, resetUserPasswordByEmail, getStoredUsers } from '../utils/storage';

interface LoginViewProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
  onUserUpdated?: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ users, onLoginSuccess, onUserUpdated }) => {
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

    // Update user password and clear requiresPasswordChange flag
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

  // Forgot Password: Step 1 -> Send OTP
  const handleForgotStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    const clean = forgotEmail.trim().toLowerCase();
    if (!isScicomEmail(clean)) {
      setForgotError('Please enter a valid SCICOM corporate email (@scicom.com.my or @scicom.com).');
      return;
    }

    const currentUsers = getStoredUsers();
    const userExists = currentUsers.find(u => u.email.toLowerCase() === clean);
    if (!userExists) {
      setForgotError(`No corporate user record registered under "${clean}".`);
      return;
    }

    // Generate random 6-digit OTP code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedOtp(generatedCode);
    setForgotStep(2);
  };

  // Forgot Password: Step 2 -> Verify OTP
  const handleForgotStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (enteredOtp.trim() !== simulatedOtp.trim()) {
      setForgotError('Invalid verification code. Please check and re-enter.');
      return;
    }

    setForgotStep(3);
  };

  // Forgot Password: Step 3 -> Set New Password
  const handleForgotStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);

    if (forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters long.');
      return;
    }

    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('Passwords do not match.');
      return;
    }

    const success = resetUserPasswordByEmail(forgotEmail, forgotNewPassword);
    if (!success) {
      setForgotError('Failed to reset password. Please try again.');
      return;
    }

    // Close forgot modal and pre-fill login
    setIsForgotModalOpen(false);
    setEmail(forgotEmail);
    setPassword(forgotNewPassword);
    setSuccessNotice(`Password reset successfully for ${forgotEmail}! You may now sign in.`);
    setForgotStep(1);
    setForgotEmail('');
    setEnteredOtp('');
    setForgotNewPassword('');
    setForgotConfirmPassword('');
  };

  return (
    <div className="min-h-screen bg-[#0b0c10] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden font-sans">
      
      {/* Background Matrix / Grid Accent lines */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(#45a29e 1px, transparent 1px), radial-gradient(#45a29e 1px, #0b0c10 1px)`,
          backgroundSize: '36px 36px',
          backgroundPosition: '0 0, 18px 18px'
        }}
      />

      <div className="w-full max-w-lg z-10">
        
        {/* Main Neon Carbon Container */}
        <div className="bg-[#1f2833] border border-[#45a29e] rounded-lg p-6 sm:p-8 shadow-[0_0_25px_rgba(102,252,241,0.2)]">
          
          <div className="text-center mb-6">
            <div className="flex items-center justify-center mb-4">
              <img
                src="/assets/aistudio/Scicom_MSC_Berhad_idpuWHQlKm_1_283b6397.png"
                alt="SCICOM Logo"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-[0_0_20px_rgba(102,252,241,0.25)]"
              />
            </div>
            <h1 className="text-2xl font-bold text-[#66fcf1] tracking-wide uppercase font-mono">
              NOC Operations Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#c5c6c7] mt-1">
              Authenticate with your SCICOM Corporate Email to access SOPs, escalation paths, and shift workflows.
            </p>
          </div>

          {/* Success Banner */}
          {successNotice && (
            <div className="mb-5 p-3 rounded bg-[#66fcf1]/10 border border-[#66fcf1]/50 text-[#66fcf1] text-xs flex items-start gap-2 animate-fade-in font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successNotice}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded bg-[#ff4d4d]/10 border border-[#ff4d4d]/50 text-[#ff4d4d] text-xs flex items-start gap-2 animate-fade-in font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* VIEW A: Standard Sign In Form */}
          {!pendingFirstLoginUser && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#c5c6c7] uppercase tracking-wider font-mono">
                    SCICOM Corporate Email
                  </label>
                  <span className="text-[10px] text-[#45a29e] font-mono">
                    @scicom.com.my only
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#45a29e]">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. noc_lead@scicom.com.my"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0b0c10] border border-[#45a29e] rounded text-sm text-white placeholder-[#c5c6c7]/50 focus:outline-none focus:border-[#66fcf1] focus:ring-1 focus:ring-[#66fcf1] transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-[#c5c6c7] uppercase tracking-wider font-mono">
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
                    className="text-xs text-[#66fcf1] hover:underline font-mono focus:outline-none"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#45a29e]">
                    <Key className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-9 pr-3 py-2.5 bg-[#0b0c10] border border-[#45a29e] rounded text-sm text-white placeholder-[#c5c6c7]/50 focus:outline-none focus:border-[#66fcf1] focus:ring-1 focus:ring-[#66fcf1] transition-all font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] font-bold rounded text-sm transition-all duration-200 uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(69,162,158,0.3)] mt-6 cursor-pointer"
              >
                <span>Sign In to NOC Portal</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* VIEW B: Mandatory First-Time Login Password Change Interceptor */}
          {pendingFirstLoginUser && (
            <div className="p-4 bg-[#0b0c10] border border-[#66fcf1] rounded-lg animate-fade-in space-y-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded bg-[#66fcf1]/20 text-[#66fcf1] border border-[#66fcf1]/40 shrink-0 mt-0.5">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    Mandatory First-Time Password Setup
                  </h3>
                  <p className="text-xs text-[#c5c6c7] mt-0.5 leading-relaxed">
                    Welcome, <strong className="text-white">{pendingFirstLoginUser.fullName}</strong>! As a new or newly provisioned member, SCICOM corporate security policy requires you to set a personal password before portal access.
                  </p>
                </div>
              </div>

              {firstTimeError && (
                <div className="p-2.5 rounded bg-[#ff4d4d]/10 border border-[#ff4d4d]/50 text-[#ff4d4d] text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{firstTimeError}</span>
                </div>
              )}

              <form onSubmit={handleFirstTimePasswordSubmit} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#c5c6c7] mb-1 font-mono uppercase">
                    New Password (Min 6 Characters)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#45a29e]">
                      <Key className="w-4 h-4" />
                    </div>
                    <input
                      type="password"
                      value={firstTimeNewPassword}
                      onChange={(e) => setFirstTimeNewPassword(e.target.value)}
                      placeholder="Enter strong password"
                      required
                      autoFocus
                      className="w-full pl-9 pr-3 py-2 bg-[#1f2833] border border-[#45a29e] rounded text-sm text-white placeholder-[#c5c6c7]/50 focus:outline-none focus:border-[#66fcf1] font-mono"
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
                      value={firstTimeConfirmPassword}
                      onChange={(e) => setFirstTimeConfirmPassword(e.target.value)}
                      placeholder="Re-enter to confirm"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-[#1f2833] border border-[#45a29e] rounded text-sm text-white placeholder-[#c5c6c7]/50 focus:outline-none focus:border-[#66fcf1] font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setPendingFirstLoginUser(null)}
                    className="px-3 py-2 text-xs font-mono text-[#c5c6c7] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 px-3 bg-[#66fcf1] hover:bg-[#45a29e] text-[#0b0c10] font-bold rounded text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(102,252,241,0.3)]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Set Password &amp; Enter Portal</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Explicit Credentials for Roles */}
          <div className="mt-6 pt-5 border-t border-[#45a29e]/30">
            <div className="text-xs text-[#66fcf1] mb-3 font-semibold uppercase tracking-wider text-center font-mono">
              Credentials for Both Roles
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Role 1: NOC Operator */}
              <div className="p-3 bg-[#0b0c10] border border-[#45a29e]/60 rounded space-y-2 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs font-mono">ROLE: NOC</span>
                    <span className="px-1.5 py-0.2 text-[10px] bg-[#45a29e]/20 text-[#66fcf1] rounded font-mono border border-[#45a29e]/40">
                      OPERATOR
                    </span>
                  </div>
                  
                  <div className="text-[11px] text-[#c5c6c7] font-mono mt-2 space-y-0.5">
                    <div className="truncate">Email: <span className="text-white font-bold">noc_lead@scicom.com.my</span></div>
                    <div>Pass: <span className="text-[#66fcf1] font-bold">noc123</span></div>
                  </div>

                  <p className="text-[10px] text-[#c5c6c7]/80 mt-1.5 leading-snug">
                    Can review guides &amp; add cases for future reference.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickCredentialSelect('noc_lead@scicom.com.my', 'noc123')}
                  className="w-full mt-2 py-1.5 px-2 bg-[#1f2833] hover:bg-[#45a29e] text-[#66fcf1] hover:text-[#0b0c10] border border-[#45a29e] rounded text-[11px] font-bold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Sign In as NOC</span>
                </button>
              </div>

              {/* Role 2: Administrator */}
              <div className="p-3 bg-[#0b0c10] border border-[#66fcf1]/60 rounded space-y-2 flex flex-col justify-between shadow-[0_0_10px_rgba(102,252,241,0.1)]">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs font-mono">ROLE: ADMIN</span>
                    <span className="px-1.5 py-0.2 text-[10px] bg-[#66fcf1]/20 text-[#66fcf1] rounded font-mono border border-[#66fcf1]/50">
                      FULL ACCESS
                    </span>
                  </div>
                  
                  <div className="text-[11px] text-[#c5c6c7] font-mono mt-2 space-y-0.5">
                    <div className="truncate">Email: <span className="text-white font-bold">admin@scicom.com.my</span></div>
                    <div>Pass: <span className="text-[#66fcf1] font-bold">admin123</span></div>
                  </div>

                  <p className="text-[10px] text-[#c5c6c7]/80 mt-1.5 leading-snug">
                    NOC privileges + add team members in website through email.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickCredentialSelect('admin@scicom.com.my', 'admin123')}
                  className="w-full mt-2 py-1.5 px-2 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] font-bold rounded text-[11px] transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Shield className="w-3 h-3" />
                  <span>Sign In as Admin</span>
                </button>
              </div>

            </div>

            {/* Test First-Time Login Account */}
            <div className="mt-3 p-2.5 bg-[#0b0c10]/80 border border-dashed border-[#45a29e]/40 rounded flex items-center justify-between gap-2 text-xs">
              <div className="font-mono text-[11px] text-[#c5c6c7] leading-tight">
                <div className="text-white font-bold flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#66fcf1]" />
                  <span>Test First-Time Login:</span>
                </div>
                <div className="text-[10px] text-[#45a29e]">
                  rajeev@scicom.com.my (Pass: rajeev123)
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleQuickCredentialSelect('rajeev@scicom.com.my', 'rajeev123')}
                className="px-2.5 py-1 bg-[#1f2833] hover:bg-[#45a29e] text-[#66fcf1] hover:text-[#0b0c10] border border-[#45a29e] rounded text-[10px] font-mono font-bold whitespace-nowrap cursor-pointer transition-colors"
              >
                Test 1st Login
              </button>
            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center mt-4 text-xs text-[#45a29e] font-mono">
          SCICOM (MSC) Berhad NOC Technical Standard Operating Procedures
        </div>

      </div>

      {/* Forgot Password Modal */}
      {isForgotModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-[#1f2833] border border-[#45a29e] rounded-lg shadow-[0_0_30px_rgba(102,252,241,0.2)] p-6 font-sans animate-fade-in">
            
            <div className="flex items-center justify-between pb-3 border-b border-[#45a29e]/30">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-[#66fcf1]" />
                <h3 className="text-base font-bold text-white font-mono uppercase">
                  Reset Password
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsForgotModalOpen(false)}
                className="text-[#c5c6c7] hover:text-[#ff4d4d]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {forgotError && (
              <div className="mt-4 p-2.5 rounded bg-[#ff4d4d]/10 border border-[#ff4d4d]/50 text-[#ff4d4d] text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{forgotError}</span>
              </div>
            )}

            {/* Step 1: Enter Corporate Email */}
            {forgotStep === 1 && (
              <form onSubmit={handleForgotStep1Submit} className="mt-4 space-y-4">
                <p className="text-xs text-[#c5c6c7] leading-relaxed">
                  Enter your registered SCICOM corporate email. A one-time verification passcode will be issued to confirm your identity.
                </p>

                <div>
                  <label className="block text-xs font-semibold text-[#c5c6c7] mb-1 font-mono uppercase">
                    SCICOM Corporate Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#45a29e]">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      placeholder="e.g. noc_lead@scicom.com.my"
                      required
                      autoFocus
                      className="w-full pl-9 pr-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-sm text-white placeholder-[#c5c6c7]/50 focus:outline-none focus:border-[#66fcf1] font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotModalOpen(false)}
                    className="px-3 py-2 text-xs font-mono text-[#c5c6c7] hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] font-bold rounded text-xs font-mono uppercase tracking-wider flex items-center gap-1.5"
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
                <div className="p-3 bg-[#0b0c10] border border-[#66fcf1]/40 rounded text-xs space-y-2">
                  <div className="text-[#66fcf1] font-mono font-bold flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4" />
                    <span>Passcode Dispatched to Corporate Mailbox</span>
                  </div>
                  <p className="text-[11px] text-[#c5c6c7]">
                    Simulated verification code for <strong>{forgotEmail}</strong>:
                  </p>
                  <div className="flex items-center justify-between bg-[#1f2833] p-2 rounded border border-[#45a29e]/50">
                    <span className="font-mono text-base font-bold text-[#66fcf1] tracking-widest">
                      {simulatedOtp}
                    </span>
                    <button
                      type="button"
                      onClick={() => setEnteredOtp(simulatedOtp)}
                      className="px-2 py-1 bg-[#45a29e]/20 hover:bg-[#45a29e] text-[#66fcf1] hover:text-[#0b0c10] rounded text-[10px] font-mono font-bold transition-colors"
                    >
                      Auto-fill Code
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#c5c6c7] mb-1 font-mono uppercase">
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
                    className="w-full px-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-center tracking-widest text-lg text-white font-mono placeholder-[#c5c6c7]/50 focus:outline-none focus:border-[#66fcf1]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    className="text-xs font-mono text-[#c5c6c7] hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="py-2 px-4 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] font-bold rounded text-xs font-mono uppercase tracking-wider flex items-center gap-1.5"
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
                <p className="text-xs text-[#c5c6c7] leading-relaxed">
                  Identity verified for <strong className="text-white">{forgotEmail}</strong>. Create a new secure password for your NOC account.
                </p>

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
                      value={forgotNewPassword}
                      onChange={(e) => setForgotNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      autoFocus
                      className="w-full pl-9 pr-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-sm text-white placeholder-[#c5c6c7]/50 focus:outline-none focus:border-[#66fcf1] font-mono"
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
                      value={forgotConfirmPassword}
                      onChange={(e) => setForgotConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-[#0b0c10] border border-[#45a29e] rounded text-sm text-white placeholder-[#c5c6c7]/50 focus:outline-none focus:border-[#66fcf1] font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 bg-[#66fcf1] hover:bg-[#45a29e] text-[#0b0c10] font-bold rounded text-xs font-mono uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(102,252,241,0.3)]"
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
