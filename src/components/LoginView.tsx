import React, { useState } from 'react';

interface LoginViewProps {
  onLogin: () => void;
}

export default function LoginView({ onLogin }: LoginViewProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Generate random floating particles for the live background effect
  const [particles] = useState(() => 
    Array.from({ length: 20 }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5
    }))
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      position: 'relative', 
      overflow: 'hidden',
      backgroundColor: '#0a0a0a'
    }}>
      
      {/* LIVE BACKGROUND ANIMATION LAYER */}
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

      {/* Login Card Container */}
      <div style={{ 
        position: 'relative',
        zIndex: 10,
        width: '100%',
        maxWidth: '420px',
        backgroundColor: 'rgba(18, 18, 22, 0.9)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,255,255,0.05)',
        backdropFilter: 'blur(10px)',
        textAlign: 'center'
      }}>
        
        {/* Company Logo replacing NOC VAULT text */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '15px' }}>
          <img 
            src="/images/scicomlogo.png" 
            alt="Scicom Logo" 
            style={{ height: '45px', objectFit: 'contain' }} 
          />
        </div>
        
        <p style={{ color: '#b0b0b0', fontSize: '0.85rem', marginBottom: '30px', letterSpacing: '1px', textTransform: 'uppercase' }}>
          Scicom Operations Portal
        </p>

        <form onSubmit={handleSubmit} style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>
              Email
            </label>
            <input 
              type="email" 
              required
              placeholder="Enter your Scicom Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>
              Password
            </label>
            <input 
              type="password" 
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '14px 16px', backgroundColor: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.12)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
            />
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

      </div>
    </div>
  );
}