import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Shield, Key, User as UserIcon, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LoginViewProps {
  users: User[];
  onLoginSuccess: (user: User) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ users, onLoginSuccess }) => {
  const [username, setUsername] = useState('noc_lead');
  const [password, setPassword] = useState('noc123');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUser = username.trim().toLowerCase();
    
    // Look up user by username or email
    const existing = users.find(u => 
      u.username.toLowerCase() === cleanUser || u.email.toLowerCase() === cleanUser
    );

    if (!existing) {
      setErrorMsg(`User '${username}' not found. Please verify username or use the credentials provided below.`);
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
      setErrorMsg(`Invalid password for user '${existing.username}'. Please check credentials below.`);
      return;
    }

    // Update last login timestamp and log in with user's assigned role
    const authenticatedUser: User = {
      ...existing,
      lastLogin: 'Just now'
    };

    onLoginSuccess(authenticatedUser);
  };

  const handleQuickCredentialSelect = (selectedRole: UserRole) => {
    if (selectedRole === 'Admin') {
      setUsername('admin');
      setPassword('admin123');
      const adminUser = users.find(u => u.username === 'admin') || {
        id: 'usr-admin-1',
        username: 'admin',
        email: 'admin@scicom.com.my',
        fullName: 'Ahmad Faizal',
        role: 'Admin',
        department: 'NOC Lead & System Admin',
        status: 'Active',
        createdAt: '2025-01-15',
        password: 'admin123'
      };
      onLoginSuccess(adminUser);
    } else {
      setUsername('noc_lead');
      setPassword('noc123');
      const nocUser = users.find(u => u.username === 'noc_lead') || {
        id: 'usr-noc-1',
        username: 'noc_lead',
        email: 'noc_lead@scicom.com.my',
        fullName: 'Siti Nurhaliza',
        role: 'NOC',
        department: 'NOC Tier 1 Operations',
        status: 'Active',
        createdAt: '2025-02-10',
        password: 'noc123'
      };
      onLoginSuccess(nocUser);
    }
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
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-[#0b0c10] border border-[#66fcf1] text-[#66fcf1] mb-3 shadow-[0_0_12px_rgba(102,252,241,0.3)]">
              <Shield className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-[#66fcf1] tracking-wide uppercase font-mono">
              NOC Operations Portal
            </h1>
            <p className="text-xs sm:text-sm text-[#c5c6c7] mt-1">
              Authenticate to access standard operating procedures, escalation matrices, and automated response scripts.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="mb-5 p-3 rounded bg-[#ff4d4d]/10 border border-[#ff4d4d]/50 text-[#ff4d4d] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Form with only Username and Password */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#c5c6c7] mb-1.5 uppercase tracking-wider font-mono">
                Username or SCICOM Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[#45a29e]">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. noc_lead or admin"
                  required
                  className="w-full pl-9 pr-3 py-2.5 bg-[#0b0c10] border border-[#45a29e] rounded text-sm text-white placeholder-[#c5c6c7]/50 focus:outline-none focus:border-[#66fcf1] focus:ring-1 focus:ring-[#66fcf1] transition-all font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#c5c6c7] mb-1.5 uppercase tracking-wider font-mono">
                Password
              </label>
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
              className="w-full py-3 px-4 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] font-bold rounded text-sm transition-all duration-200 uppercase tracking-wider flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(69,162,158,0.3)] mt-6"
            >
              <span>Sign In to NOC Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Explicit Credentials for Both Roles */}
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
                    <div>User: <span className="text-white font-bold">noc_lead</span></div>
                    <div>Pass: <span className="text-[#66fcf1] font-bold">noc123</span></div>
                  </div>

                  <p className="text-[10px] text-[#c5c6c7]/80 mt-1.5 leading-snug">
                    Can review guides, run scripts &amp; add cases for future reference.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickCredentialSelect('NOC')}
                  className="w-full mt-2 py-1.5 px-2 bg-[#1f2833] hover:bg-[#45a29e] text-[#66fcf1] hover:text-[#0b0c10] border border-[#45a29e] rounded text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
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
                    <div>User: <span className="text-white font-bold">admin</span></div>
                    <div>Pass: <span className="text-[#66fcf1] font-bold">admin123</span></div>
                  </div>

                  <p className="text-[10px] text-[#c5c6c7]/80 mt-1.5 leading-snug">
                    NOC privileges + add team members in website through email.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleQuickCredentialSelect('Admin')}
                  className="w-full mt-2 py-1.5 px-2 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] font-bold rounded text-[11px] transition-colors flex items-center justify-center gap-1"
                >
                  <Shield className="w-3 h-3" />
                  <span>Sign In as Admin</span>
                </button>
              </div>

            </div>
          </div>

        </div>

        {/* Footer info */}
        <div className="text-center mt-4 text-xs text-[#45a29e] font-mono">
          SCICOM (MSC) Berhad NOC Technical Standard Operating Procedures
        </div>

      </div>
    </div>
  );
};
