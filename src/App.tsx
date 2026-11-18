import React, { useState, useEffect } from 'react';
import KnowledgeBase from './components/KnowledgeBase';
import EscalationMatrix from './components/EscalationMatrix';
import AdminMemberManager from './components/AdminMemberManager';
import DocumentsView from './components/DocumentsView';
import ProfileView from './components/ProfileView';
import AddCaseView from './components/AddCaseView';
import LoginView from './components/LoginView';
import PageLayout from './components/PageLayout';
import { ThemeProvider } from './context/ThemeContext';
import { supabase } from './components/supabaseClient';

const DEFAULT_INCIDENTS = [
  {
    id: 'INC-101',
    title: 'IP Dynamics Gateway Timeout',
    project: 'Telekom Malaysia (TM) Project Operations',
    category: 'Application Error',
    severity: 'SEV-2 (High)',
    impact: 'Primary gateway affecting primary agent authentication queues.',
    summary: 'API gateway timeout experienced during peak shift login hours.',
    steps: [
      'Check gateway status and upstream load balancers.',
      'Inspect active sessions in database connection pool.',
      'Restart authentication microservice container if required.'
    ]
  }
];

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ email: string; role: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [activeTab, setActiveTab] = useState('home');

  // Load cached incidents from localStorage or default list
  const [incidents, setIncidents] = useState<any[]>(() => {
    try {
      const saved = localStorage.getItem('nocvault_incidents');
      return saved ? JSON.parse(saved) : DEFAULT_INCIDENTS;
    } catch {
      return DEFAULT_INCIDENTS;
    }
  });

  // Sync incidents with Supabase cleanly without console warnings
  useEffect(() => {
    async function syncIncidents() {
      try {
        const { data, error } = await supabase.from('incidents').select('*');
        if (!error && data) {
          if (data.length > 0) {
            setIncidents(data);
            localStorage.setItem('nocvault_incidents', JSON.stringify(data));
          } else {
            // Seed initial incident into Supabase if table is currently empty
            await supabase.from('incidents').insert(DEFAULT_INCIDENTS);
          }
        }
      } catch {
        // Silent fallback to local storage when running in restricted preview iframe
      }
    }
    syncIncidents();
  }, []);

  const handleLoginTrigger = (userData: { email: string; role: string }) => {
    setCurrentUser(userData);

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

  // Format role for components expecting capitalized 'Admin' or 'NOC'
  const formattedRole = currentUser?.role?.toLowerCase() === 'admin' ? 'Admin' : 'NOC';

  return (
    <ThemeProvider>
      {!isAuthenticated ? (
        <LoginView onLogin={handleLoginTrigger} />
      ) : (
        <PageLayout>
          {activeTab === 'home' && (
            <KnowledgeBase
              userRole={formattedRole}
              customIncidents={incidents}
              setActiveTab={setActiveTab}
              onOpenAddCase={() => setActiveTab('addcase')}
              onOpenProfile={() => setActiveTab('profile')}
              onLogout={() => {
                setIsAuthenticated(false);
                setCurrentUser(null);
              }}
            />
          )}

          {/* Accessible by both Admin and NOC users */}
          {activeTab === 'documents' && (
            <DocumentsView
              customIncidents={incidents}
              onBack={() => setActiveTab('home')}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView onBack={() => setActiveTab('home')} />
          )}

          {/* Accessible by both Admin and NOC users */}
          {activeTab === 'addcase' && (
            <AddCaseView
              onBack={() => setActiveTab('home')}
              onCaseCreated={async (newCase: any) => {
                const updated = [newCase, ...incidents];
                setIncidents(updated);
                localStorage.setItem('nocvault_incidents', JSON.stringify(updated));
                try {
                  await supabase.from('incidents').insert([newCase]);
                } catch {
                  // Saved to localStorage cache
                }
                setActiveTab('home');
              }}
            />
          )}

          {activeTab === 'escalation' && (
            <EscalationMatrix onBack={() => setActiveTab('home')} />
          )}

          {activeTab === 'admin' && formattedRole === 'Admin' && (
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
          zIndex: 10000,
          flexDirection: 'column',
          opacity: isFadingOut ? 0 : 1,
          transition: 'opacity 0.5s ease-in-out',
          pointerEvents: isFadingOut ? 'none' : 'auto'
        }}>
          <div className="loader-prism" style={{ width: '100px', height: '100px', position: 'relative', margin: '0 auto 30px' }}>
            <div className="prism-face" style={{ position: 'absolute', width: '100%', height: '100%', border: '2px solid transparent', transformOrigin: 'center', animation: 'prismRotate 3s linear infinite', borderImage: 'linear-gradient(45deg, #ff3333, #00ffff) 1', animationDelay: '0s' }}></div>
            <div className="prism-face" style={{ position: 'absolute', width: '100%', height: '100%', border: '2px solid transparent', transformOrigin: 'center', animation: 'prismRotate 3s linear infinite', borderImage: 'linear-gradient(45deg, #9945ff, #00ff88) 1', transform: 'rotate(60deg)', animationDelay: '0.2s' }}></div>
            <div className="prism-face" style={{ position: 'absolute', width: '100%', height: '100%', border: '2px solid transparent', transformOrigin: 'center', animation: 'prismRotate 3s linear infinite', borderImage: 'linear-gradient(45deg, #ffa500, #9945ff) 1', transform: 'rotate(120deg)', animationDelay: '0.4s' }}></div>
          </div>
          <div style={{ color: '#00ffff', fontFamily: 'Orbitron, monospace', letterSpacing: '2px', fontSize: '0.9rem', textTransform: 'uppercase' }}>
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