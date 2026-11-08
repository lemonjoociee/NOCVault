/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, IncidentCase, UserRole, MemberInvitation } from './types';
import { 
  getStoredUsers, 
  getStoredCases, 
  addIncidentCase, 
  addMember, 
  updateMemberRole, 
  toggleMemberStatus, 
  deleteMember,
  getStoredInvitations,
  updateUserProfile
} from './utils/storage';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { KnowledgeBase } from './components/KnowledgeBase';
import { CaseDetailModal } from './components/CaseDetailModal';
import { AddCaseModal } from './components/AddCaseModal';
import { EscalationMatrix } from './components/EscalationMatrix';
import { AdminMemberManager } from './components/AdminMemberManager';
import { ProfileModal } from './components/ProfileModal';

function AppContent() {
  const { isDark } = useTheme();

  // Authentication & Users
  const [users, setUsers] = useState<User[]>(() => getStoredUsers());
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Data Collections
  const [cases, setCases] = useState<IncidentCase[]>(() => getStoredCases());
  const [invitations, setInvitations] = useState<MemberInvitation[]>(() => getStoredInvitations());

  // Active Tab View: cases, escalations, admin
  const [activeTab, setActiveTab] = useState<'cases' | 'escalations' | 'admin'>('cases');

  // Modals & Active Selections
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<IncidentCase | null>(null);
  const [isAddCaseOpen, setIsAddCaseOpen] = useState<boolean>(false);
  const [isProfileOpen, setIsProfileOpen] = useState<boolean>(false);

  // Success toast message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // If user role changes or logs out, ensure non-admins cannot stay on admin tab
  useEffect(() => {
    if (activeTab === 'admin' && currentUser?.role !== 'Admin') {
      setActiveTab('cases');
    }
  }, [currentUser, activeTab]);

  // Handler: Add Case (Accessible to both NOC and Admin)
  const handleCaseAdded = (newCaseData: any) => {
    const created = addIncidentCase(newCaseData);
    setCases(getStoredCases());
    setSelectedCaseForDetail(created);
    showToast(`Case ${created.caseNumber} ("${created.title}") was successfully added to the knowledge base!`);
  };

  // Handler: Add Member via Email (Admin Only)
  const handleAddMember = (memberData: Omit<User, 'id' | 'createdAt'>) => {
    const res = addMember(memberData);
    setUsers(getStoredUsers());
    setInvitations(getStoredInvitations());
    return res;
  };

  // Handler: Update Member Role (Admin Only)
  const handleUpdateMemberRole = (userId: string, newRole: UserRole) => {
    const updated = updateMemberRole(userId, newRole);
    setUsers(updated);
    showToast(`Member role updated to ${newRole}.`);
  };

  // Handler: Toggle Member Status (Admin Only)
  const handleToggleMemberStatus = (userId: string) => {
    const updated = toggleMemberStatus(userId);
    setUsers(updated);
    showToast('Member status updated.');
  };

  // Handler: Delete Member (Admin Only)
  const handleDeleteMember = (userId: string) => {
    const updated = deleteMember(userId);
    setUsers(updated);
    showToast('Member removed from roster.');
  };

  // Handler: Update User Profile (Self)
  const handleUpdateProfile = (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const updated = updateUserProfile(currentUser.id, updatedData);
    setCurrentUser(updated);
    setUsers(getStoredUsers());
    showToast('Your SCICOM profile details have been saved.');
  };

  // If user is not authenticated, render LoginView
  if (!currentUser) {
    return (
      <LoginView
        users={users}
        onUserUpdated={() => setUsers(getStoredUsers())}
        onLoginSuccess={(authedUser) => {
          setCurrentUser(authedUser);
          showToast(`Welcome back, ${authedUser.fullName} (Signed in as ${authedUser.role}).`);
        }}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans transition-colors ${
      isDark 
        ? 'bg-[#0b0c10] text-[#c5c6c7] selection:bg-[#66fcf1] selection:text-[#0b0c10]' 
        : 'bg-slate-100 text-slate-800 selection:bg-sky-200 selection:text-sky-900'
    }`}>
      
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddCase={() => setIsAddCaseOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onLogout={() => {
          setCurrentUser(null);
          showToast('You have signed out.');
        }}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-5 right-5 z-50 p-3.5 rounded-xl border shadow-2xl text-xs font-mono max-w-md animate-fade-in flex items-center justify-between gap-3 ${
          isDark 
            ? 'bg-[#1f2833] border-[#66fcf1] text-[#66fcf1] shadow-[0_0_20px_rgba(102,252,241,0.25)]' 
            : 'bg-white border-sky-400 text-sky-900 shadow-lg'
        }`}>
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="opacity-70 hover:opacity-100">✕</button>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Role Capability Banner */}
        <div className={`mb-6 px-4 py-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs transition-colors ${
          isDark 
            ? 'bg-[#1f2833]/70 border-[#45a29e]/30' 
            : 'bg-white border-slate-200 shadow-sm'
        }`}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`w-2 h-2 rounded-full animate-pulse ${isDark ? 'bg-[#66fcf1]' : 'bg-emerald-500'}`} />
            <span>
              Active Session: <strong className={isDark ? 'text-white' : 'text-slate-900'}>{currentUser.fullName}</strong> ({currentUser.email})
            </span>
            <span className={isDark ? 'text-[#45a29e]' : 'text-slate-400'}>·</span>
            <span className={`font-mono font-bold ${isDark ? 'text-[#66fcf1]' : 'text-sky-700'}`}>
              Role: {currentUser.role}
            </span>
            <button
              onClick={() => setIsProfileOpen(true)}
              className={`ml-1 text-[11px] underline font-mono cursor-pointer ${
                isDark ? 'text-[#45a29e] hover:text-[#66fcf1]' : 'text-sky-600 hover:text-sky-800'
              }`}
            >
              [View / Edit Profile]
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentUser.role === 'Admin' ? (
              <span className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono ${
                isDark 
                  ? 'text-[#66fcf1] bg-[#0b0c10] border-[#66fcf1]/40' 
                  : 'text-sky-800 bg-sky-50 border-sky-300'
              }`}>
                Admin Privileges: Full SOP Access + Manage Escalation Directory + Add Member via Email
              </span>
            ) : (
              <span className={`text-[11px] px-2.5 py-1 rounded-lg border font-mono ${
                isDark 
                  ? 'text-[#45a29e] bg-[#0b0c10] border-[#45a29e]/40' 
                  : 'text-slate-700 bg-slate-50 border-slate-300'
              }`}>
                NOC Privileges: Review Guides, View Escalations &amp; Add Cases
              </span>
            )}
          </div>
        </div>

        {/* Tab 1: SOP Knowledge Base & Workflows */}
        {activeTab === 'cases' && (
          <KnowledgeBase
            cases={cases}
            onSelectCase={c => setSelectedCaseForDetail(c)}
            onOpenAddCase={() => setIsAddCaseOpen(true)}
          />
        )}

        {/* Tab 2: Escalation Matrix & Directory (From Official PDF + On-call Directory) */}
        {activeTab === 'escalations' && (
          <EscalationMatrix currentUser={currentUser} />
        )}

        {/* Tab 3: Admin & Member Management (Admin only) */}
        {activeTab === 'admin' && currentUser.role === 'Admin' && (
          <AdminMemberManager
            currentUser={currentUser}
            users={users}
            invitations={invitations}
            onAddMember={handleAddMember}
            onUpdateRole={handleUpdateMemberRole}
            onToggleStatus={handleToggleMemberStatus}
            onDeleteMember={handleDeleteMember}
          />
        )}

      </main>

      {/* Case Detail Modal */}
      {selectedCaseForDetail && (
        <CaseDetailModal
          incidentCase={selectedCaseForDetail}
          onClose={() => setSelectedCaseForDetail(null)}
        />
      )}

      {/* Add Case Modal (NOC and Admin) */}
      <AddCaseModal
        currentUser={currentUser}
        isOpen={isAddCaseOpen}
        onClose={() => setIsAddCaseOpen(false)}
        onCaseAdded={handleCaseAdded}
      />

      {/* View & Edit Profile Modal */}
      <ProfileModal
        currentUser={currentUser}
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onUpdateProfile={handleUpdateProfile}
      />

      {/* Footer */}
      <footer className={`border-t py-4 mt-12 transition-colors ${
        isDark ? 'border-[#45a29e]/30 bg-[#0b0c10]' : 'border-slate-200 bg-white'
      }`}>
        <div className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs ${
          isDark ? 'text-[#45a29e]' : 'text-slate-500'
        }`}>
          NOC Operational Guide · SCICOM (MSC) Berhad · Network Operations Center
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
