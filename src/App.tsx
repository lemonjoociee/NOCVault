import React, { useState } from 'react';
import KnowledgeBase from './components/KnowledgeBase';
import EscalationMatrix from './components/EscalationMatrix';
import AdminMemberManager from './components/AdminMemberManager';
import DocumentsView from './components/DocumentsView';
import ProfileView from './components/ProfileView';
import AddCaseView from './components/AddCaseView';
import LoginView from './components/LoginView';
import PageLayout from './components/PageLayout';
import { ThemeProvider } from './context/ThemeContext';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  const [activeTab, setActiveTab] = useState('home');

  const handleLoginTrigger = () => {
    setIsLoading(true);
    setIsFadingOut(false);
    setIsAuthenticated(true);

    setTimeout(() => {
      setIsFadingOut(true);
    }, 1200);

    setTimeout(() => {
      setIsLoading(false);
    }, 1700);
  };

  return (
    <ThemeProvider>
      {!isAuthenticated ? (
        <LoginView onLogin={handleLoginTrigger} />
      ) : (
        <PageLayout>
          {activeTab === 'home' && (
            <KnowledgeBase 
              setActiveTab={setActiveTab} 
              onOpenAddCase={() => setActiveTab('addcase')}
              onOpenProfile={() => setActiveTab('profile')}
              onLogout={() => setIsAuthenticated(false)}
            />
          )}
          
          {activeTab === 'documents' && (
            <DocumentsView onBack={() => setActiveTab('home')} />
          )}

          {activeTab === 'profile' && (
            <ProfileView onBack={() => setActiveTab('home')} />
          )}

          {activeTab === 'addcase' && (
            <AddCaseView 
              onBack={() => setActiveTab('home')} 
              onCaseCreated={(newCase) => {
                console.log('New case created:', newCase);
              }}
            />
          )}

          {activeTab === 'escalation' && (
            <EscalationMatrix onBack={() => setActiveTab('home')} />
          )}

          {activeTab === 'admin' && (
            <AdminMemberManager onBack={() => setActiveTab('home')} />
          )}
        </PageLayout>
      )}

      {/* Global Loading Overlay */}
      {isLoading && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100vh',
          background: '#0a0a0a',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 999999,
          flexDirection: 'column',
          opacity: isFadingOut ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
          pointerEvents: isFadingOut ? 'none' : 'auto'
        }}>
          <div className="loader-prism" style={{ width: '100px', height: '100px', position: 'relative', margin: '0 auto 30px' }}>
            <div className="prism-face" style={{ position: 'absolute', width: '100%', height: '100%', border: '2px solid transparent', transformOrigin: 'center', animation: 'prismRotate 3s linear infinite', borderImage: 'linear-gradient(45deg, #ff3333, #00a8ff) 1', animationDelay: '0s' }}></div>
            <div className="prism-face" style={{ position: 'absolute', width: '100%', height: '100%', border: '2px solid transparent', transformOrigin: 'center', animation: 'prismRotate 3s linear infinite', borderImage: 'linear-gradient(45deg, #00a8ff, #00ff88) 1', transform: 'rotate(60deg)', animationDelay: '0.2s' }}></div>
            <div className="prism-face" style={{ position: 'absolute', width: '100%', height: '100%', border: '2px solid transparent', transformOrigin: 'center', animation: 'prismRotate 3s linear infinite', borderImage: 'linear-gradient(45deg, #00ff88, #9945ff) 1', transform: 'rotate(120deg)', animationDelay: '0.4s' }}></div>
          </div>
          <div style={{ color: '#9945ff', fontFamily: 'Orbitron, monospace', letterSpacing: '2px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
            Refracting Reality...
          </div>
          <style>{`
            @keyframes prismRotate {
              0% { transform: rotate(0deg) scale(1); }
              50% { transform: rotate(180deg) scale(1.2); }
              100% { transform: rotate(360deg) scale(1); }
            }
          `}</style>
        </div>
      )}
    </ThemeProvider>
  );
}