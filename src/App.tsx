/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, IncidentCase, AutomatedScript, UserRole, MemberInvitation } from './types';
import { 
  getStoredUsers, 
  saveUsers, 
  getStoredCases, 
  saveCases, 
  addIncidentCase, 
  getStoredScripts, 
  addMember, 
  updateMemberRole, 
  toggleMemberStatus, 
  deleteMember,
  getStoredInvitations,
  resetAllDataToDefault
} from './utils/storage';

import { Navbar } from './components/Navbar';
import { LoginView } from './components/LoginView';
import { KnowledgeBase } from './components/KnowledgeBase';
import { CaseDetailModal } from './components/CaseDetailModal';
import { AddCaseModal } from './components/AddCaseModal';
import { ScriptRunner } from './components/ScriptRunner';
import { EscalationMatrix } from './components/EscalationMatrix';
import { AdminMemberManager } from './components/AdminMemberManager';
import { GuidesView } from './components/GuidesView';
import { PdfViewerModal } from './components/PdfViewerModal';
import { RotateCcw } from 'lucide-react';

export default function App() {
  // Authentication & Users: start with null so the user lands on the login page with both role credentials
  const [users, setUsers] = useState<User[]>(() => getStoredUsers());
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Data Collections
  const [cases, setCases] = useState<IncidentCase[]>(() => getStoredCases());
  const [scripts, setScripts] = useState<AutomatedScript[]>(() => getStoredScripts());
  const [invitations, setInvitations] = useState<MemberInvitation[]>(() => getStoredInvitations());

  // Active Tab View
  const [activeTab, setActiveTab] = useState<'cases' | 'scripts' | 'escalations' | 'admin' | 'pdfs'>('cases');

  // Modals & Active Selections
  const [selectedCaseForDetail, setSelectedCaseForDetail] = useState<IncidentCase | null>(null);
  const [isAddCaseOpen, setIsAddCaseOpen] = useState<boolean>(false);
  const [activePdf, setActivePdf] = useState<{ path: string; title: string } | null>(null);
  const [selectedScriptId, setSelectedScriptId] = useState<string | undefined>(undefined);
  const [escalationInitialCase, setEscalationInitialCase] = useState<IncidentCase | null>(null);

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

  // Handler: Trigger Script from Case
  const handleRunScriptFromCase = (script: AutomatedScript) => {
    setSelectedScriptId(script.id);
    setActiveTab('scripts');
  };

  // Handler: Trigger Escalation Ticket from Case
  const handleGenerateEscalation = (incidentCase: IncidentCase) => {
    setEscalationInitialCase(incidentCase);
    setActiveTab('escalations');
  };

  // Handler: Open PDF Viewer
  const handleOpenPdf = (pdfPath: string, title: string) => {
    setActivePdf({ path: pdfPath, title });
  };

  // Handler: Jump to case by number from Guides view
  const handleSelectCaseByNumber = (caseNum: string) => {
    const found = cases.find(c => c.caseNumber === caseNum);
    if (found) {
      setSelectedCaseForDetail(found);
    } else {
      setActiveTab('cases');
    }
  };

  // Reset to default data
  const handleResetData = () => {
    if (window.confirm('Reset all cases and members back to default initial state?')) {
      resetAllDataToDefault();
      setUsers(getStoredUsers());
      setCases(getStoredCases());
      setScripts(getStoredScripts());
      setInvitations([]);
      showToast('All cases, scripts, and member rosters reset to default.');
    }
  };

  // If user is not authenticated, render LoginView
  if (!currentUser) {
    return (
      <LoginView
        users={users}
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
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#66fcf1] animate-pulse" />
            <span>
              Active Session: <strong className="text-white">{currentUser.fullName}</strong> ({currentUser.email})
            </span>
            <span className="text-[#45a29e]">·</span>
            <span className="font-mono text-[#66fcf1]">Role: {currentUser.role}</span>
          </div>

          <div className="flex items-center gap-2">
            {currentUser.role === 'Admin' ? (
              <span className="text-[11px] text-[#66fcf1] bg-[#0b0c10] px-2 py-0.5 rounded border border-[#66fcf1]/40">
                Admin Privileges: Full SOP Access + Add Member via Email
              </span>
            ) : (
              <span className="text-[11px] text-[#45a29e] bg-[#0b0c10] px-2 py-0.5 rounded border border-[#45a29e]/40">
                NOC Privileges: Review Guides &amp; Add Cases
              </span>
            )}

            {/* Account Switcher / Sign Out */}
            <button
              onClick={() => {
                setCurrentUser(null);
                showToast('Signed out. Please sign in with the credentials for your desired role.');
              }}
              className="px-2.5 py-1 rounded text-[11px] font-mono bg-[#0b0c10] hover:bg-[#141c24] text-[#c5c6c7] hover:text-[#66fcf1] border border-[#45a29e]/50 transition-colors"
              title="Sign out and sign in as different role"
            >
              Switch Account
            </button>
          </div>
        </div>

        {/* Tab 1: SOP Knowledge Base & Workflows */}
        {activeTab === 'cases' && (
          <KnowledgeBase
            cases={cases}
            onSelectCase={c => setSelectedCaseForDetail(c)}
            onRunScript={s => handleRunScriptFromCase(s)}
            onOpenPdf={(path, title) => handleOpenPdf(path, title)}
            onOpenAddCase={() => setIsAddCaseOpen(true)}
          />
        )}

        {/* Tab 2: Automated Incident Response Scripts */}
        {activeTab === 'scripts' && (
          <ScriptRunner
            scripts={scripts}
            selectedScriptId={selectedScriptId}
          />
        )}

        {/* Tab 3: Escalation Matrix & Handover */}
        {activeTab === 'escalations' && (
          <EscalationMatrix
            cases={cases}
            initialSelectedCase={escalationInitialCase}
          />
        )}

        {/* Tab 4: Original Technical PDF Guides */}
        {activeTab === 'pdfs' && (
          <GuidesView
            onOpenPdf={(path, title) => handleOpenPdf(path, title)}
            onSelectCaseByNumber={handleSelectCaseByNumber}
          />
        )}

        {/* Tab 5: Admin & Member Management (Admin only) */}
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
          onRunScript={handleRunScriptFromCase}
          onOpenPdf={handleOpenPdf}
          onGenerateEscalation={handleGenerateEscalation}
        />
      )}

      {/* Add Case Modal (NOC and Admin) */}
      <AddCaseModal
        currentUser={currentUser}
        isOpen={isAddCaseOpen}
        onClose={() => setIsAddCaseOpen(false)}
        onCaseAdded={handleCaseAdded}
      />

      {/* Embedded PDF Viewer Modal */}
      <PdfViewerModal
        isOpen={!!activePdf}
        onClose={() => setActivePdf(null)}
        pdfPath={activePdf?.path || null}
        pdfTitle={activePdf?.title || null}
      />

      {/* Footer */}
      <footer className="border-t border-[#45a29e]/30 bg-[#0b0c10] py-4 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#45a29e]">
          <div>
            NOC Operational Guide · SCICOM (MSC) Berhad · Network Operations Center
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetData}
              className="flex items-center gap-1 hover:text-[#ff4d4d] transition-colors"
              title="Reset data back to initial seed"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Data</span>
            </button>
            <span>·</span>
            <span>Gateway 10.1.2.1</span>
            <span>·</span>
            <span>SolarWinds 10.1.27.165</span>
          </div>
        </div>
      </footer>

    </div>
  );
}
