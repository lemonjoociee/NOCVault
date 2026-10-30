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

import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { KnowledgeBase } from './components/KnowledgeBase';
import { CaseDetailModal } from './components/CaseDetailModal';
import { AddCaseModal } from './components/AddCaseModal';
import { EscalationMatrix } from './components/EscalationMatrix';
import { AdminMemberManager } from './components/AdminMemberManager';
import { ProfileModal } from './components/ProfileModal';

export default function App() {
  // Authentication & Users: start with null so the user lands on the login page with both role credentials
  const [users, setUsers] = useState<User[]>(() => getStoredUsers());
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Data Collections
  const [cases, setCases] = useState<IncidentCase[]>(() => getStoredCases());
  const [invitations, setInvitations] = useState<MemberInvitation[]>(() => getStoredInvitations());

  // Active Tab View: SOPs, Escalations, Admin
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
    <div className="min-h-screen bg-[#0b0c10] text-[#c5c6c7] flex flex-col font-sans selection:bg-[#66fcf1] selection:text-[#0b0c10]">
      
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
        <div className="fixed bottom-5 right-5 z-50 p-3.5 bg-[#1f2833] border border-[#66fcf1] text-[#66fcf1] rounded-lg shadow-[0_0_20px_rgba(102,252,241,0.3)] text-xs font-mono max-w-md animate-fade-in flex items-center justify-between gap-3">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="text-[#c5c6c7] hover:text-white">✕</button>
        </div>
      )}

      {/* Main Viewport Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Role Capability Banner */}
        <div className="mb-6 px-4 py-2.5 rounded bg-[#1f2833]/70 border border-[#45a29e]/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2 h-2 rounded-full bg-[#66fcf1] animate-pulse" />
            <span>
              Active Session: <strong className="text-white">{currentUser.fullName}</strong> ({currentUser.email})
            </span>
            <span className="text-[#45a29e]">·</span>
            <span className="font-mono text-[#66fcf1]">Role: {currentUser.role}</span>
            <button
              onClick={() => setIsProfileOpen(true)}
              className="ml-1 text-[11px] text-[#45a29e] hover:text-[#66fcf1] underline font-mono cursor-pointer"
            >
              [View / Edit Profile]
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentUser.role === 'Admin' ? (
              <span className="text-[11px] text-[#66fcf1] bg-[#0b0c10] px-2 py-0.5 rounded border border-[#66fcf1]/40">
                Admin Privileges: Full SOP Access + Manage Escalation Directory + Add Member via Email
              </span>
            ) : (
              <span className="text-[11px] text-[#45a29e] bg-[#0b0c10] px-2 py-0.5 rounded border border-[#45a29e]/40">
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

        {/* Tab 2: Escalation Matrix & Directory (Admin can edit/add) */}
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
      <footer className="border-t border-[#45a29e]/30 bg-[#0b0c10] py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-xs text-[#45a29e]">
          NOC Operational Guide · SCICOM (MSC) Berhad · Network Operations Center
        </div>
      </footer>

    </div>
  );
}
