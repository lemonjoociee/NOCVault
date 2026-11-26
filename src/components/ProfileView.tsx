import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

interface ProfileViewProps {
  onBack: () => void;
  userEmail?: string;
  userName?: string;
  userRoleTitle?: string;
  onProfileUpdated?: (updated: { fullName: string; email: string; roleTitle: string }) => void;
}

export default function ProfileView({
  onBack,
  userEmail = 'engineer@scicom.com.my',
  userName = 'NOC Engineer',
  userRoleTitle = 'NOC Operations',
  onProfileUpdated
}: ProfileViewProps) {
  const [fullName, setFullName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [roleTitle, setRoleTitle] = useState(userRoleTitle);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [savingDetails, setSavingDetails] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let active = true;
    async function loadCurrentUser() {
      try {
        const { data, error } = await supabase.auth.getUser();
        if (error || !data?.user || !active) return;

        const meta = data.user.user_metadata || {};
        if (meta.full_name) setFullName(meta.full_name);
        if (data.user.email) setEmail(data.user.email);
        if (meta.role_title) setRoleTitle(meta.role_title);
      } catch {
        // Keep initial props if offline or in sandbox
      }
    }
    loadCurrentUser();
    return () => {
      active = false;
    };
  }, []);

  const initials = (fullName || 'NE')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || 'NE';

  const handleSaveDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingDetails) return;

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    const cleanRole = roleTitle.trim();

    if (!cleanName || !cleanEmail) {
      setStatusMessage({ type: 'error', text: 'Full name and email address are required.' });
      return;
    }

    setSavingDetails(true);
    setStatusMessage(null);

    try {
      const { data: userData } = await supabase.auth.getUser();
      const authPayload: { email?: string; data: Record<string, any> } = {
        data: {
          full_name: cleanName,
          role_title: cleanRole
        }
      };

      if (userData?.user?.email && cleanEmail !== userData.user.email) {
        authPayload.email = cleanEmail;
      }

      const { error: authError } = await supabase.auth.updateUser(authPayload);
      if (authError) {
        throw authError;
      }

      if (userData?.user?.id) {
        await supabase
          .from('profiles')
          .upsert(
            {
              id: userData.user.id,
              full_name: cleanName,
              email: cleanEmail,
              role_title: cleanRole
            },
            { onConflict: 'id' }
          );
      }

      onProfileUpdated?.({ fullName: cleanName, email: cleanEmail, roleTitle: cleanRole });
      setStatusMessage({
        type: 'success',
        text:
          authPayload.email
            ? 'Profile saved. Please check your new email inbox to confirm the email change.'
            : 'Personal details updated and saved.'
      });
    } catch (err: any) {
      // Fallback so UI still reflects edits in local/demo mode if Supabase isn't configured
      onProfileUpdated?.({ fullName: cleanName, email: cleanEmail, roleTitle: cleanRole });
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Could not sync details with server.'
      });
    } finally {
      setSavingDetails(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (savingPassword) return;

    if (!newPassword || newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New password and confirm password do not match.' });
      return;
    }

    setSavingPassword(true);
    setStatusMessage(null);

    try {
      const targetEmail = (await supabase.auth.getUser()).data?.user?.email || email;

      if (currentPassword && targetEmail) {
        const { error: verifyError } = await supabase.auth.signInWithPassword({
          email: targetEmail,
          password: currentPassword
        });
        if (verifyError) {
          throw new Error('Current password is incorrect.');
        }
      }

      const { error: passError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (passError) {
        throw passError;
      }

      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStatusMessage({ type: 'success', text: 'Password updated successfully.' });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to update password.'
      });
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', padding: '40px 20px', color: '#fff', position: 'relative', zIndex: 10 }}>
      {/* Top Header */}
      <div style={{ maxWidth: '880px', margin: '0 auto 24px auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', textTransform: 'uppercase', letterSpacing: '1.5px', margin: '0 0 6px 0' }}>
            <span style={{ color: '#00ffff' }}>USER</span> PROFILE MANAGEMENT
          </h1>
          <p style={{ color: '#a0a0a0', fontSize: '0.9rem', margin: 0 }}>
            Manage your personal credentials and security settings.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            color: '#fff',
            padding: '10px 20px',
            borderRadius: '30px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.88rem'
          }}
        >
          ← Back to Portal
        </button>
      </div>

      {/* Feedback Banner */}
      {statusMessage && (
        <div
          style={{
            maxWidth: '880px',
            margin: '0 auto 18px auto',
            padding: '12px 18px',
            borderRadius: '14px',
            fontWeight: 'bold',
            fontSize: '0.88rem',
            backgroundColor:
              statusMessage.type === 'success'
                ? 'rgba(0, 255, 136, 0.14)'
                : 'rgba(255, 68, 68, 0.14)',
            border:
              statusMessage.type === 'success'
                ? '1px solid #00ff88'
                : '1px solid #ff4444',
            color: statusMessage.type === 'success' ? '#00ff88' : '#ff7b7b'
          }}
        >
          {statusMessage.type === 'success' ? '✓ ' : '! '}
          {statusMessage.text}
        </div>
      )}

      {/* Personal Details Card */}
      <div
        style={{
          maxWidth: '880px',
          margin: '0 auto 24px auto',
          backgroundColor: 'rgba(18, 18, 22, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.65)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', paddingBottom: '22px', marginBottom: '22px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #2196f3, #00e5ff)',
              color: '#fff',
              fontWeight: '800',
              fontSize: '1.15rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}
          >
            {initials}
          </div>
          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff' }}>{fullName}</div>
            <div style={{ fontSize: '0.85rem', color: '#999' }}>Scicom MSC Berhad</div>
          </div>
        </div>

        <h2 style={{ margin: '0 0 18px 0', fontSize: '0.92rem', color: '#00ffff', textTransform: 'uppercase', letterSpacing: '1px' }}>
          EDIT PERSONAL DETAILS
        </h2>

        <form onSubmit={handleSaveDetails} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#a0a0a0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                FULL NAME
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#1a1a20', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.92rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#a0a0a0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#1a1a20', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.92rem' }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: '#a0a0a0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              OPERATIONAL ROLE / TITLE
            </label>
            <input
              type="text"
              value={roleTitle}
              onChange={(e) => setRoleTitle(e.target.value)}
              style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#1a1a20', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.92rem' }}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={savingDetails}
              style={{
                background: 'linear-gradient(90deg, #7b2cbf, #00e5ff)',
                border: 'none',
                color: '#fff',
                padding: '11px 24px',
                borderRadius: '24px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}
            >
              {savingDetails ? 'SAVING...' : 'SAVE DETAILS'}
            </button>
          </div>
        </form>
      </div>

      {/* Change Password Card */}
      <div
        style={{
          maxWidth: '880px',
          margin: '0 auto',
          backgroundColor: 'rgba(18, 18, 22, 0.9)',
          border: '1px solid rgba(255, 255, 255, 0.09)',
          borderRadius: '20px',
          padding: '28px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.65)'
        }}
      >
        <h2 style={{ margin: '0 0 18px 0', fontSize: '0.92rem', color: '#9c27b0', textTransform: 'uppercase', letterSpacing: '1px' }}>
          CHANGE PASSWORD
        </h2>

        <form onSubmit={handleUpdatePassword} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.72rem', color: '#a0a0a0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
              CURRENT PASSWORD
            </label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="••••••••"
              style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#1a1a20', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.92rem' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#a0a0a0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                NEW PASSWORD
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#1a1a20', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.92rem' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.72rem', color: '#a0a0a0', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                CONFIRM NEW PASSWORD
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '12px 14px', borderRadius: '12px', backgroundColor: '#1a1a20', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '0.92rem' }}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={savingPassword}
              style={{
                background: 'linear-gradient(90deg, #ff1744, #ff9100)',
                border: 'none',
                color: '#fff',
                padding: '11px 24px',
                borderRadius: '24px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.8rem',
                textTransform: 'uppercase',
                letterSpacing: '0.8px'
              }}
            >
              {savingPassword ? 'UPDATING...' : 'UPDATE PASSWORD'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}