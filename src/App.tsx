import React, { useState } from 'react';
import KnowledgeBase from './components/KnowledgeBase';
import EscalationMatrix from './components/EscalationMatrix';
import AdminMemberManager from './components/AdminMemberManager';
import DocumentsView from './components/DocumentsView';
import LoginView from './components/LoginView';
import ProfileModal from './components/ProfileModal';
import AddCaseModal from './components/AddCaseModal';
import CaseDetailModal from './components/CaseDetailModal';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [showProfile, setShowProfile] = useState(false);
  const [showAddCase, setShowAddCase] = useState(false);
  const [selectedCase, setSelectedCase] = useState<string | null>(null);

  if (!isAuthenticated) {
    return <LoginView onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <ThemeProvider>
      
      {activeTab === 'home' && (
        <KnowledgeBase 
          setActiveTab={setActiveTab} 
          setShowAddCase={setShowAddCase} 
          setShowProfile={setShowProfile}
          onLogout={() => setIsAuthenticated(false)}
        />
      )}
      
      {activeTab === 'documents' && (
        <DocumentsView onBack={() => setActiveTab('home')} />
      )}

      {activeTab === 'escalation' && <EscalationMatrix />}
      {activeTab === 'admin' && <AdminMemberManager />}

      {/* Modals */}
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
      {showAddCase && <AddCaseModal onClose={() => setShowAddCase(false)} />}
      {selectedCase && <CaseDetailModal caseId={selectedCase} onClose={() => setSelectedCase(null)} />}

    </ThemeProvider>
  );
}