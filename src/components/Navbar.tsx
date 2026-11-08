import React from 'react';
import { User } from '../types';
import { 
  BookOpen, 
  AlertTriangle, 
  Users, 
  PlusCircle, 
  LogOut, 
  Shield,
  Sun,
  Moon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface NavbarProps {
  currentUser: User;
  activeTab: 'cases' | 'escalations' | 'admin';
  setActiveTab: (tab: 'cases' | 'escalations' | 'admin') => void;
  onOpenAddCase: () => void;
  onOpenProfile: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAddCase,
  onOpenProfile,
  onLogout
}) => {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <header className={`sticky top-0 z-40 transition-colors border-b ${
      isDark 
        ? 'border-[#45a29e]/40 bg-[#1f2833] shadow-[0_4px_20px_rgba(0,0,0,0.5)]' 
        : 'border-slate-200 bg-white/95 backdrop-blur-md shadow-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Zone 1: Brand Wordmark with Scicom Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="h-9 flex items-center justify-center shrink-0">
              <img
                src="/assets/aistudio/Scicom_MSC_Berhad_idpuWHQlKm_1_283b6397.png"
                alt="SCICOM"
                className="h-8 w-auto object-contain"
              />
            </div>
            <div>
              <div className={`text-base sm:text-lg font-bold tracking-wider uppercase font-mono ${
                isDark ? 'text-[#66fcf1]' : 'text-slate-900'
              }`}>
                NOC Operations Portal
              </div>
              <div className={`text-[11px] hidden sm:block ${
                isDark ? 'text-[#45a29e]' : 'text-slate-500'
              }`}>
                Standard Operating Procedures &amp; Escalation Paths
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('cases')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'cases'
                  ? isDark 
                    ? 'bg-[#0b0c10] text-[#66fcf1] border border-[#66fcf1]/50 shadow-sm'
                    : 'bg-sky-50 text-sky-700 border border-sky-300 font-bold shadow-sm'
                  : isDark 
                    ? 'text-[#c5c6c7] hover:text-[#66fcf1] hover:bg-[#0b0c10]/40 border border-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>SOP Knowledge Base</span>
            </button>

            <button
              onClick={() => setActiveTab('escalations')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'escalations'
                  ? isDark 
                    ? 'bg-[#0b0c10] text-[#66fcf1] border border-[#66fcf1]/50 shadow-sm'
                    : 'bg-sky-50 text-sky-700 border border-sky-300 font-bold shadow-sm'
                  : isDark 
                    ? 'text-[#c5c6c7] hover:text-[#66fcf1] hover:bg-[#0b0c10]/40 border border-transparent'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Escalation Matrix</span>
            </button>

            {/* Admin Exclusive Tab */}
            {currentUser.role === 'Admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  activeTab === 'admin'
                    ? isDark 
                      ? 'bg-[#0b0c10] text-[#66fcf1] border border-[#66fcf1]/50 shadow-sm'
                      : 'bg-sky-50 text-sky-700 border border-sky-300 font-bold shadow-sm'
                    : isDark 
                      ? 'text-[#45a29e] hover:text-[#66fcf1] hover:bg-[#0b0c10]/40 border border-transparent'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-transparent'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Admin &amp; Members</span>
                <span className={`text-[10px] px-1 py-0.2 rounded border font-mono ${
                  isDark ? 'bg-[#45a29e]/20 text-[#66fcf1] border-[#45a29e]/50' : 'bg-sky-100 text-sky-800 border-sky-300'
                }`}>
                  ADMIN
                </span>
              </button>
            )}
          </nav>

          {/* Zone 3: Actions, Theme Switcher & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {/* Theme Toggle (Light / Dark Mode) */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg border transition-all flex items-center justify-center cursor-pointer ${
                isDark 
                  ? 'bg-[#0b0c10] border-[#45a29e]/50 text-amber-300 hover:text-amber-200 hover:bg-[#141c24] hover:border-amber-400 shadow-[0_0_10px_rgba(252,211,77,0.15)]' 
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-200 hover:border-slate-400'
              }`}
              title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-4 h-4 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-sky-700" />
              )}
            </button>

            {/* Add Case CTA - Accessible to both NOC and Admin */}
            <button
              onClick={onOpenAddCase}
              className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
                isDark 
                  ? 'bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10]' 
                  : 'bg-teal-600 hover:bg-teal-700 text-white'
              }`}
              title="Add a new troubleshooting case for future reference"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Case</span>
            </button>

            {/* User & Role Badge - Clickable to open Profile */}
            <button
              onClick={onOpenProfile}
              className={`flex items-center gap-2 border px-2.5 py-1 rounded-lg transition-all text-left group cursor-pointer shadow-sm ${
                isDark 
                  ? 'bg-[#0b0c10] hover:bg-[#141c24] border-[#45a29e]/50 hover:border-[#66fcf1]' 
                  : 'bg-slate-50 hover:bg-slate-100 border-slate-300 hover:border-sky-400'
              }`}
              title="Click to view & edit your SCICOM profile and password"
            >
              <Shield className={`w-3.5 h-3.5 shrink-0 ${
                currentUser.role === 'Admin'
                  ? isDark ? 'text-[#66fcf1]' : 'text-sky-700'
                  : isDark ? 'text-[#45a29e]' : 'text-teal-700'
              } group-hover:scale-110 transition-transform`} />
              <div className="text-left text-[11px] leading-tight">
                <div className={`font-medium truncate max-w-[100px] sm:max-w-[130px] transition-colors ${
                  isDark ? 'text-white group-hover:text-[#66fcf1]' : 'text-slate-900 group-hover:text-sky-700'
                }`}>
                  {currentUser.fullName}
                </div>
                <div className={`font-mono text-[10px] flex items-center gap-1 ${
                  isDark ? 'text-[#66fcf1]' : 'text-sky-600'
                }`}>
                  <span>Role: {currentUser.role}</span>
                  <span className={`text-[9px] opacity-75 hidden sm:inline ${
                    isDark ? 'text-[#45a29e]' : 'text-slate-500'
                  }`}>(Edit)</span>
                </div>
              </div>
            </button>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className={`p-1.5 rounded-lg border transition-colors ${
                isDark 
                  ? 'text-[#c5c6c7] hover:text-[#ff4d4d] hover:bg-[#0b0c10] border-transparent hover:border-[#ff4d4d]/30' 
                  : 'text-slate-500 hover:text-red-600 hover:bg-red-50 border-transparent hover:border-red-200'
              }`}
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className={`flex md:hidden items-center justify-between py-2 border-t gap-1 overflow-x-auto text-[11px] ${
          isDark ? 'border-[#45a29e]/20' : 'border-slate-200'
        }`}>
          <button
            onClick={() => setActiveTab('cases')}
            className={`px-3 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'cases' 
                ? isDark ? 'bg-[#0b0c10] text-[#66fcf1]' : 'bg-sky-100 text-sky-800 font-bold'
                : isDark ? 'text-[#c5c6c7]' : 'text-slate-600'
            }`}
          >
            SOPs
          </button>
          <button
            onClick={() => setActiveTab('escalations')}
            className={`px-3 py-1 rounded-md whitespace-nowrap ${
              activeTab === 'escalations' 
                ? isDark ? 'bg-[#0b0c10] text-[#66fcf1]' : 'bg-sky-100 text-sky-800 font-bold'
                : isDark ? 'text-[#c5c6c7]' : 'text-slate-600'
            }`}
          >
            Escalation
          </button>
          {currentUser.role === 'Admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1 rounded-md whitespace-nowrap ${
                activeTab === 'admin' 
                  ? isDark ? 'bg-[#0b0c10] text-[#66fcf1]' : 'bg-sky-100 text-sky-800 font-bold'
                  : isDark ? 'text-[#45a29e]' : 'text-teal-700'
              }`}
            >
              Admin/Members
            </button>
          )}
          <button
            onClick={onOpenProfile}
            className={`px-2.5 py-1 rounded-md border whitespace-nowrap ${
              isDark ? 'bg-[#0b0c10] text-[#66fcf1] border-[#45a29e]/50' : 'bg-slate-100 text-slate-800 border-slate-300'
            }`}
          >
            Profile
          </button>
          <button
            onClick={onOpenAddCase}
            className={`px-2.5 py-1 rounded-md font-bold whitespace-nowrap ${
              isDark ? 'bg-[#45a29e] text-[#0b0c10]' : 'bg-teal-600 text-white'
            }`}
          >
            + Case
          </button>
        </div>
      </div>
    </header>
  );
};
