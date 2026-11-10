import React, { useState } from 'react';

interface ProfileViewProps {
  onBack: () => void;
}

export default function ProfileView({ onBack }: ProfileViewProps) {
  // Form states
  const [fullName, setFullName] = useState('NOC Engineer');
  const [email, setEmail] = useState('engineer@scicom.com.my');
  const [role, setRole] = useState('NOC Operations');
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [successMessage, setSuccessMessage] = useState('');

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

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage('Profile details updated successfully!');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert('New passwords do not match!');
      return;
    }
    setSuccessMessage('Password changed successfully!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '40px 20px', 
      color: '#fff', 
      position: 'relative', 
      zIndex: 10,
      backgroundColor: '#0a0a0a',
      backgroundImage: `
        radial-gradient(ellipse at center, rgba(153, 69, 255, 0.1) 0%, transparent 50%),
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px),
        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255, 255, 255, 0.03) 2px, rgba(255, 255, 255, 0.03) 4px)
      `
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

      {/* Header Bar */}
      <div style={{ maxWidth: '800px', margin: '0 auto 30px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'relative', zIndex: 10 }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '5px' }}>
            <span style={{ color: '#00ffff' }}>User</span> Profile Management
          </h1>
          <p style={{ color: '#b0b0b0', fontSize: '0.9rem' }}>Manage your personal credentials and security settings.</p>
        </div>
        <button 
          onClick={onBack}
          style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff', padding: '10px 20px', borderRadius: '30px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          ← Back to Portal
        </button>
      </div>

      {successMessage && (
        <div style={{ maxWidth: '800px', margin: '0 auto 20px auto', backgroundColor: 'rgba(0, 255, 136, 0.15)', border: '1px solid #00ff88', color: '#00ff88', padding: '12px 20px', borderRadius: '12px', textAlign: 'center', fontWeight: 'bold', zIndex: 10, position: 'relative' }}>
          {successMessage}
        </div>
      )}

      {/* Profile & Password Container */}
      <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '30px', position: 'relative', zIndex: 10 }}>
        
        {/* Edit Personal Details Form */}
        <div style={{ backgroundColor: 'rgba(18, 18, 22, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '25px', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '20px' }}>
            <div style={{ width: '70px', height: '70px', borderRadius: '50%', background: 'linear-gradient(135deg, #8a2be2, #00ffff)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>
              NE
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{fullName}</h2>
              <p style={{ color: '#b0b0b0', fontSize: '0.85rem' }}>Scicom MSC Berhad</p>
            </div>
          </div>

          <form onSubmit={handleSaveDetails} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#00ffff' }}>Edit Personal Details</h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>Full Name</label>
                <input 
                  type="text" 
                  value={fullName} 
                  onChange={(e) => setFullName(e.target.value)} 
                  style={{ width: '100%', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>Email Address</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  style={{ width: '100%', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>Operational Role / Title</label>
              <input 
                type="text" 
                value={role} 
                onChange={(e) => setRole(e.target.value)} 
                style={{ width: '100%', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <button 
              type="submit"
              style={{ width: 'fit-content', padding: '12px 25px', background: 'linear-gradient(90deg, #8a2be2, #00ffff)', color: '#fff', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}
            >
              Save Details
            </button>
          </form>
        </div>

        {/* Change Password Form */}
        <div style={{ backgroundColor: 'rgba(18, 18, 22, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '30px', boxShadow: '0 20px 50px rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)' }}>
          <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '1px', color: '#9945ff' }}>Change Password</h3>
            
            <div>
              <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>Current Password</label>
              <input 
                type="password" 
                required
                placeholder="••••••••"
                value={currentPassword} 
                onChange={(e) => setCurrentPassword(e.target.value)} 
                style={{ width: '100%', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>New Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  style={{ width: '100%', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', color: '#b0b0b0', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', fontWeight: 'bold' }}>Confirm New Password</label>
                <input 
                  type="password" 
                  required
                  placeholder="••••••••"
                  value={confirmPassword} 
                  onChange={(e) => setConfirmPassword(e.target.value)} 
                  style={{ width: '100%', padding: '12px 16px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '10px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}
                />
              </div>
            </div>

            <button 
              type="submit"
              style={{ width: 'fit-content', padding: '12px 25px', background: 'linear-gradient(90deg, #ff0055, #ffaa00)', color: '#fff', border: 'none', borderRadius: '25px', cursor: 'pointer', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '0.85rem' }}
            >
              Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}