import React from 'react';
import { User } from '../types';
import { 
  BookOpen, 
  AlertTriangle, 
  Users, 
  PlusCircle, 
  LogOut, 
  Shield
} from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  activeTab: 'cases' | 'escalations' | 'admin';
  setActiveTab: (tab: 'cases' | 'escalations' | 'admin') => void;
  onOpenAddCase: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onOpenAddCase,
  onLogout
}) => {
  return (
    <header className="border-b border-[#45a29e]/40 bg-[#1f2833] sticky top-0 z-40 shadow-lg">
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
              <div className="text-base sm:text-lg font-bold text-[#66fcf1] tracking-wider uppercase font-mono">
                NOC Operations Portal
              </div>
              <div className="text-[11px] text-[#45a29e] hidden sm:block">
                Standard Operating Procedures &amp; Escalation Paths
              </div>
            </div>
          </div>

          {/* Zone 2: Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('cases')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'cases'
                  ? 'bg-[#0b0c10] text-[#66fcf1] border border-[#66fcf1]/50 shadow-sm'
                  : 'text-[#c5c6c7] hover:text-[#66fcf1] hover:bg-[#0b0c10]/40'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>SOP Knowledge Base</span>
            </button>

            <button
              onClick={() => setActiveTab('escalations')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                activeTab === 'escalations'
                  ? 'bg-[#0b0c10] text-[#66fcf1] border border-[#66fcf1]/50 shadow-sm'
                  : 'text-[#c5c6c7] hover:text-[#66fcf1] hover:bg-[#0b0c10]/40'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Escalation Matrix</span>
            </button>

            {/* Admin Exclusive Tab */}
            {currentUser.role === 'Admin' && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded text-xs font-medium transition-all whitespace-nowrap shrink-0 ${
                  activeTab === 'admin'
                    ? 'bg-[#0b0c10] text-[#66fcf1] border border-[#66fcf1]/50 shadow-sm'
                    : 'text-[#45a29e] hover:text-[#66fcf1] hover:bg-[#0b0c10]/40'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Admin &amp; Members</span>
                <span className="text-[10px] bg-[#45a29e]/20 text-[#66fcf1] px-1 py-0.2 rounded border border-[#45a29e]/50">
                  ADMIN
                </span>
              </button>
            )}
          </nav>

          {/* Zone 3: User Profile & Actions */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Add Case CTA - Accessible to both NOC and Admin */}
            <button
              onClick={onOpenAddCase}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-[#45a29e] hover:bg-[#66fcf1] text-[#0b0c10] rounded text-xs font-bold transition-all shadow-sm"
              title="Add a new troubleshooting case for future reference"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Case</span>
            </button>

            {/* User & Role Badge */}
            <div className="flex items-center gap-2 bg-[#0b0c10] border border-[#45a29e]/50 px-2.5 py-1 rounded">
              <Shield className={`w-3.5 h-3.5 ${currentUser.role === 'Admin' ? 'text-[#66fcf1]' : 'text-[#45a29e]'}`} />
              <div className="text-left text-[11px] leading-tight">
                <div className="text-white font-medium truncate max-w-[100px] sm:max-w-[130px]">
                  {currentUser.fullName}
                </div>
                <div className="text-[#66fcf1] font-mono text-[10px]">
                  Role: {currentUser.role}
                </div>
              </div>
            </div>

            {/* Logout button */}
            <button
              onClick={onLogout}
              className="p-1.5 text-[#c5c6c7] hover:text-[#ff4d4d] hover:bg-[#0b0c10] rounded border border-transparent hover:border-[#ff4d4d]/30 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-[#45a29e]/20 gap-1 overflow-x-auto text-[11px]">
          <button
            onClick={() => setActiveTab('cases')}
            className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'cases' ? 'bg-[#0b0c10] text-[#66fcf1]' : 'text-[#c5c6c7]'}`}
          >
            SOPs
          </button>
          <button
            onClick={() => setActiveTab('escalations')}
            className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'escalations' ? 'bg-[#0b0c10] text-[#66fcf1]' : 'text-[#c5c6c7]'}`}
          >
            Escalation
          </button>
          {currentUser.role === 'Admin' && (
            <button
              onClick={() => setActiveTab('admin')}
              className={`px-3 py-1 rounded whitespace-nowrap ${activeTab === 'admin' ? 'bg-[#0b0c10] text-[#66fcf1]' : 'text-[#45a29e]'}`}
            >
              Admin/Members
            </button>
          )}
          <button
            onClick={onOpenAddCase}
            className="px-2.5 py-1 rounded bg-[#45a29e] text-[#0b0c10] font-bold whitespace-nowrap"
          >
            + Case
          </button>
        </div>
      </div>
    </header>
  );
};
