import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: (email: string, password: string) => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Floating background particles
  const [particles] = useState(() => 
    Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
    }))
  );

  const handleInitialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    // Rule 1: Validate @scicom.com.my email domain
    if (!email.toLowerCase().endsWith('@scicom.com.my')) {
      setErrorMsg('Access restricted. Only @scicom.com.my email addresses are allowed.');
      return;
    }

    // Simulate first-time login check (e.g., if password is 'temporary123' or flagged)
    if (password === 'temporary123' || password === 'Welcome123') {
      setIsFirstLogin(true);
      return;
    }

    onLogin(email, password);
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    // Proceed to login with the updated password
    onLogin(email, newPassword);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      position: 'relative', 
      overflow: 'hidden',
      backgroundColor: '#0a0a0a',
      backgroundImage: `
        radial-gradient(ellipse at center, rgba(153, 69, 255, 0.1) 0%, transparent 50%),
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px),
        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)
      `
    }}>
      <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0, overflow: 'hidden' }}>
        {particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${p.left}%`,
              top: `${p.top}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              backgroundColor: '#00ffff',
              borderRadius: '50%',
              boxShadow: '0 0 8px #00ffff, 0 0 15px #9945ff',
              opacity: 0.6,
              animation: `liveFloat ${p.duration}s linear infinite`,
              animationDelay: `${p.delay}s`
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes liveFloat {
          0% { transform: translateY(0px) translateX(0px); opacity: 0; }
          20% { opacity: 0.8; }
          80% { opacity: 0.8; }
          100% { transform: translateY(-100vh) translateX(50px); opacity: 0; }
        }
      `}</style>

      <div style={{ 
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'rgba(18, 18, 22, 0.95)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
        backdropFilter: 'blur(10px)',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
          <img src="/images/scicomlogo.png" alt="Scicom Logo" style={{ height: '45px', objectFit: 'contain' }} />
        </div>
        
        <p style={{ color: '#b0b0b0', fontSize: '0.85rem', marginBottom: '25px', letterSpacing: '1px', textTransform: 'uppercase' }}>
          {isFirstLogin ? 'Set New Password' : 'Scicom Operations Portal'}
        </p>

        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(255,51,51,0.15)', border: '1px solid rgba(255,51,51,0.4)', color: '#ff3333', padding: '10px 14px', borderRadius: '10px', fontSize: '0.8rem', marginBottom: '20px', textAlign: 'left' }}>
            ⚠️ {errorMsg}
          </div>
        )}

        {!isFirstLogin ? (
          <form onSubmit={handleInitialSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontWeight: 'bold' }}>
                Email (@scicom.com.my)
              </label>
              <input 
                type="email" 
                required
                placeholder="username@scicom.com.my"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontWeight: 'bold' }}>
                Password / Invite Code
              </label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
              <span style={{ fontSize: '0.7rem', color: '#888', marginTop: '4px', display: 'block' }}>*Use temporary invite password (e.g., temporary123) for new accounts</span>
            </div>

            <button 
              type="submit"
              style={{ 
                width: '100%', 
                padding: '14px', 
                marginTop: '10px',
                background: 'linear-gradient(90deg, #8a2be2, #00ffff)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '30px', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.9rem',
                boxShadow: '0 5px 20px rgba(138, 43, 226, 0.4)'
              }}
            >
              Login
            </button>
          </form>
        ) : (
          <form onSubmit={handlePasswordResetSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <p style={{ fontSize: '0.85rem', color: '#00ffff', lineHeight: '1.4', margin: '0 0 5px 0' }}>
              First-time login detected for <strong>{email}</strong>. Please set a secure new password to activate your account.
            </p>

            <div>
              <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontWeight: 'bold' }}>
                New Password
              </label>
              <input 
                type="password" 
                required
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', fontWeight: 'bold' }}>
                Confirm New Password
              </label>
              <input 
                type="password" 
                required
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '12px 16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <button 
              type="submit"
              style={{ 
                width: '100%', 
                padding: '14px', 
                marginTop: '10px',
                background: 'linear-gradient(90deg, #00ff88, #00ffff)', 
                color: '#000', 
                border: 'none', 
                borderRadius: '30px', 
                cursor: 'pointer', 
                fontWeight: 'bold', 
                textTransform: 'uppercase',
                letterSpacing: '1px',
                fontSize: '0.9rem',
                boxShadow: '0 5px 20px rgba(0,255,136,0.3)'
              }}
            >
              Update Password & Enter Portal
            </button>
          </form>
        )}

      </div>
    </div>
  );
}