import React, { useState, useEffect } from 'react';
import KnowledgeBase from './components/KnowledgeBase';
import EscalationMatrix from './components/EscalationMatrix';
import AdminMemberManager from './components/AdminMemberManager';
import DocumentsView from './components/DocumentsView';
import ProfileView from './components/ProfileView';
import AddCaseView from './components/AddCaseView';
import ScheduleView from './components/ScheduleView';
import LoginView from './components/LoginView';
import PageLayout from './components/PageLayout';
import { ThemeProvider } from './context/ThemeContext';
import { supabase } from './components/supabaseClient';
import TasksView from './components/TasksView';
import FloorMapView from './components/FloorMapView';

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

interface CurrentUserState {
  email: string;
  role: string;
  name?: string;
  avatarUrl?: string;
}

const PROFILE_CACHE_KEY = 'nocvault_member_profiles';

function readCachedProfile(email: string): { name?: string; avatarUrl?: string } {
  if (!email) return {};
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    if (!raw) return {};
    const map = JSON.parse(raw);
    return map[email.trim().toLowerCase()] || {};
  } catch {
    return {};
  }
}

function writeCachedProfile(email: string, data: { name?: string; avatarUrl?: string }) {
  if (!email) return;
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    const key = email.trim().toLowerCase();
    map[key] = {
      ...(map[key] || {}),
      ...(data.name ? { name: data.name } : {}),
      ...(data.avatarUrl !== undefined ? { avatarUrl: data.avatarUrl } : {})
    };
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota/sandbox issues
  }
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<CurrentUserState | null>(null);
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

  // Hydrate full name & avatar from Supabase members table whenever currentUser changes
  useEffect(() => {
    let active = true;
    const email = currentUser?.email?.trim();
    if (!email) return;

    const cached = readCachedProfile(email);
    if ((cached.name && !currentUser?.name) || (cached.avatarUrl && !currentUser?.avatarUrl)) {
      setCurrentUser((prev) =>
        prev
          ? {
              ...prev,
              name: prev.name || cached.name,
              avatarUrl: prev.avatarUrl || cached.avatarUrl || ''
            }
          : prev
      );
    }

    async function fetchMemberDetails() {
      try {
        const { data, error } = await supabase
          .from('members')
          .select('name, avatar_url, role')
          .eq('email', email)
          .maybeSingle();

        if (!error && data && active) {
          const dbName = typeof data.name === 'string' && data.name.trim() ? data.name.trim() : undefined;
          const dbAvatar = typeof data.avatar_url === 'string' ? data.avatar_url : undefined;
          const dbRole = typeof data.role === 'string' && data.role.trim() ? data.role.trim() : undefined;

          if (dbName || dbAvatar !== undefined) {
            writeCachedProfile(email!, { name: dbName, avatarUrl: dbAvatar });
          }

          setCurrentUser((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              name: dbName || prev.name,
              role: dbRole || prev.role,
              avatarUrl: dbAvatar !== undefined && dbAvatar !== '' ? dbAvatar : prev.avatarUrl || ''
            };
          });
        }
      } catch {
        // Keep cached or login values on error
      }
    }

    fetchMemberDetails();
    return () => {
      active = false;
    };
  }, [currentUser?.email]);

  const handleLoginTrigger = (userData: {
    email: string;
    role: string;
    name?: string;
    avatar_url?: string;
    avatarUrl?: string;
  }) => {
    const cached = readCachedProfile(userData.email);
    const resolvedName =
      userData.name && !userData.name.includes('@')
        ? userData.name.trim()
        : cached.name || undefined;
    const resolvedAvatar = userData.avatarUrl || userData.avatar_url || cached.avatarUrl || '';

    setCurrentUser({
      email: userData.email,
      role: userData.role,
      name: resolvedName,
      avatarUrl: resolvedAvatar
    });

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
              userName={currentUser?.name || ''}
              userEmail={currentUser?.email || ''}
              userAvatarUrl={currentUser?.avatarUrl || ''}
              customIncidents={incidents}
              setActiveTab={setActiveTab}
              onOpenAddCase={() => setActiveTab('addcase')}
              onOpenProfile={() => setActiveTab('profile')}
              onLogout={() => {
                setIsAuthenticated(false);
                setCurrentUser(null);
                setActiveTab('home');
              }}
            />
          )}

          {/* Accessible by both Admin and NOC users */}
          {activeTab === 'documents' && (
            <DocumentsView
              customIncidents={incidents}
              onBack={() => setActiveTab('home')}
              onUpdateIncident={async (updatedItem: any) => {
                const nextList = incidents.map((item) =>
                  item.id === updatedItem.id ? updatedItem : item
                );
                setIncidents(nextList);
                localStorage.setItem('nocvault_incidents', JSON.stringify(nextList));
                try {
                  await supabase.from('incidents').update(updatedItem).eq('id', updatedItem.id);
                } catch {
                  // Saved to localStorage cache
                }
              }}
              onDeleteIncident={async (incidentId: string | number) => {
                const nextList = incidents.filter((item) => item.id !== incidentId);
                setIncidents(nextList);
                localStorage.setItem('nocvault_incidents', JSON.stringify(nextList));
                try {
                  await supabase.from('incidents').delete().eq('id', incidentId);
                } catch {
                  // Saved to localStorage cache
                }
              }}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleView
              userRole={formattedRole}
              onBack={() => setActiveTab('home')}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              userEmail={currentUser?.email || ''}
              userName={currentUser?.name || ''}
              userAvatarUrl={currentUser?.avatarUrl || ''}
              onBack={() => setActiveTab('home')}
              onProfileUpdated={({ fullName, email, avatarUrl }) => {
                writeCachedProfile(email || currentUser?.email || '', {
                  name: fullName,
                  avatarUrl
                });
                setCurrentUser((prev) =>
                  prev
                    ? {
                        ...prev,
                        name: fullName,
                        email,
                        avatarUrl: avatarUrl !== undefined ? avatarUrl : prev.avatarUrl
                      }
                    : prev
                );
              }}
            />
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

          {activeTab === 'tasks' && (
            <TasksView
              userRole={formattedRole}
              userEmail={currentUser?.email || ''}
              onBack={() => setActiveTab('home')}
            />
          )}

          {activeTab === 'floormap' && (
            <FloorMapView onBack={() => setActiveTab('home')} />
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