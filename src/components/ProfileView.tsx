import React, { useState, useEffect, useRef } from 'react';
import { supabase } from './supabaseClient';

interface ProfileViewProps {
  onBack: () => void;
  userEmail?: string;
  userName?: string;
  userRoleTitle?: string;
  userAvatarUrl?: string;
  onProfileUpdated?: (updated: {
    fullName: string;
    email: string;
    roleTitle: string;
    avatarUrl?: string;
  }) => void;
}

export default function ProfileView({
  onBack,
  userEmail = 'izzul.azhar@scicom.com.my',
  userName = 'Muhammad Izzul Dinie Bin Azhar',
  userRoleTitle = 'NOC - Executive',
  userAvatarUrl = '',
  onProfileUpdated
}: ProfileViewProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [memberId, setMemberId] = useState<number | null>(null);
  const [fullName, setFullName] = useState(userName);
  const [email, setEmail] = useState(userEmail);
  const [roleTitle, setRoleTitle] = useState(userRoleTitle);
  const [avatarUrl, setAvatarUrl] = useState(userAvatarUrl);
  const [dbPassword, setDbPassword] = useState<string>('');
  const [isAvatarPreviewOpen, setIsAvatarPreviewOpen] = useState(false);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [savingDetails, setSavingDetails] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!isAvatarPreviewOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAvatarPreviewOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAvatarPreviewOpen]);

  useEffect(() => {
    let active = true;
    async function loadMemberRow() {
      if (!userEmail) return;
      try {
        const { data, error } = await supabase
          .from('members')
          .select('id, name, email, role, password, avatar_url')
          .eq('email', userEmail)
          .single();

        if (!error && data && active) {
          setMemberId(data.id);
          if (data.name) setFullName(data.name);
          if (data.email) setEmail(data.email);
          if (typeof data.password === 'string') setDbPassword(data.password);
          if (typeof data.avatar_url === 'string' && data.avatar_url) {
            setAvatarUrl(data.avatar_url);
          }
        }
      } catch {
        // Keep initial props if offline or in sandbox
      }
    }
    loadMemberRow();
    return () => {
      active = false;
    };
  }, [userEmail]);

  const initials =
    (fullName || 'MN')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || '')
      .join('') || 'MN';

  const persistAvatarToMember = async (nextUrl: string) => {
    const targetEmail = email.trim() || userEmail;
    try {
      const query = supabase.from('members').update({ avatar_url: nextUrl });
      const { error } = memberId
        ? await query.eq('id', memberId)
        : await query.eq('email', targetEmail);

      if (error) throw error;
      onProfileUpdated?.({
        fullName: fullName.trim(),
        email: targetEmail,
        roleTitle: roleTitle.trim(),
        avatarUrl: nextUrl
      });
      setStatusMessage({
        type: 'success',
        text: nextUrl ? 'Profile picture updated.' : 'Profile picture removed.'
      });
    } catch (err: any) {
      onProfileUpdated?.({
        fullName: fullName.trim(),
        email: targetEmail,
        roleTitle: roleTitle.trim(),
        avatarUrl: nextUrl
      });
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Could not save picture to database.'
      });
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || uploadingAvatar) return;

    if (!file.type.startsWith('image/')) {
      setStatusMessage({ type: 'error', text: 'Please select a valid image file (PNG, JPG, WEBP).' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setStatusMessage({ type: 'error', text: 'Image must be 2 MB or smaller.' });
      return;
    }

    setUploadingAvatar(true);
    setStatusMessage(null);

    try {
      const ext = file.name.split('.').pop()?.toLowerCase() || 'png';
      const safeSlug = (email.trim() || userEmail || 'member').replace(/[^a-zA-Z0-9]/g, '_');
      const filePath = `${safeSlug}_${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (!uploadError) {
        const { data: publicUrlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
        const finalUrl = publicUrlData?.publicUrl || '';
        setAvatarUrl(finalUrl);
        await persistAvatarToMember(finalUrl);
        setUploadingAvatar(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      // Fallback to Base64 data URL if 'avatars' bucket isn't created yet
      const reader = new FileReader();
      reader.onload = async () => {
        const dataUrl = typeof reader.result === 'string' ? reader.result : '';
        setAvatarUrl(dataUrl);
        await persistAvatarToMember(dataUrl);
        setUploadingAvatar(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.onerror = () => {
        setStatusMessage({ type: 'error', text: 'Failed to read selected image.' });
        setUploadingAvatar(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      };
      reader.readAsDataURL(file);
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to process selected image.' });
      setUploadingAvatar(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleRemoveAvatar = async () => {
    if (uploadingAvatar) return;
    setUploadingAvatar(true);
    setStatusMessage(null);
    setAvatarUrl('');
    await persistAvatarToMember('');
    setUploadingAvatar(false);
  };

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
      const updatePayload: Record<string, any> = {
        name: cleanName,
        email: cleanEmail
      };
      if (avatarUrl) {
        updatePayload.avatar_url = avatarUrl;
      }

      const query = supabase.from('members').update(updatePayload);
      const { data, error } = memberId
        ? await query.eq('id', memberId).select().single()
        : await query.eq('email', userEmail).select().single();

      if (error) {
        throw error;
      }

      if (data?.id) setMemberId(data.id);
      onProfileUpdated?.({
        fullName: cleanName,
        email: cleanEmail,
        roleTitle: cleanRole,
        avatarUrl
      });
      setStatusMessage({ type: 'success', text: 'Personal details saved to members table.' });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Failed to update member details.'
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

    if (currentPassword && dbPassword && currentPassword !== dbPassword) {
      setStatusMessage({ type: 'error', text: 'Current password does not match.' });
      return;
    }

    setSavingPassword(true);
    setStatusMessage(null);

    try {
      const query = supabase.from('members').update({
        password: newPassword,
        must_change_password: false
      });

      const { error } = memberId
        ? await query.eq('id', memberId)
        : await query.eq('email', email.trim() || userEmail);

      if (error) {
        throw error;
      }

      setDbPassword(newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setStatusMessage({ type: 'success', text: 'Password updated in members table.' });
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
      <div
        style={{
          maxWidth: '880px',
          margin: '0 auto 24px auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '15px'
        }}
      >
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
              statusMessage.type === 'success' ? 'rgba(0, 255, 136, 0.14)' : 'rgba(255, 68, 68, 0.14)',
            border: statusMessage.type === 'success' ? '1px solid #00ff88' : '1px solid #ff4444',
            color: statusMessage.type === 'success' ? '#00ff88' : '#ff7b7b'
          }}
        >
          {statusMessage.type === 'success' ? '✓ ' : '! '}
          {statusMessage.text}
        </div>
      )}

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
        {/* Profile Header with Clickable Avatar Popup */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
            paddingBottom: '22px',
            marginBottom: '22px',
            borderBottom: '1px solid rgba(255,255,255,0.08)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button
              type="button"
              onClick={() => setIsAvatarPreviewOpen(true)}
              title="Click to view profile picture"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: avatarUrl ? '#1a1a22' : 'linear-gradient(135deg, #2196f3, #00e5ff)',
                color: '#fff',
                fontWeight: '800',
                fontSize: '1.15rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '2px solid rgba(0, 229, 255, 0.45)',
                padding: 0,
                overflow: 'hidden',
                cursor: 'pointer'
              }}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullName}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                initials
              )}
            </button>

            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: '700', color: '#fff' }}>{fullName}</div>
              <div style={{ fontSize: '0.85rem', color: '#999' }}>Scicom MSC Berhad</div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              disabled={uploadingAvatar}
              onClick={() => fileInputRef.current?.click()}
              style={{
                background: 'rgba(0, 229, 255, 0.14)',
                border: '1px solid rgba(0, 229, 255, 0.4)',
                color: '#00e5ff',
                padding: '7px 14px',
                borderRadius: '18px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.76rem'
              }}
            >
              {uploadingAvatar ? 'Uploading...' : avatarUrl ? 'Change Photo' : 'Upload Photo'}
            </button>

            {avatarUrl && (
              <button
                type="button"
                disabled={uploadingAvatar}
                onClick={handleRemoveAvatar}
                style={{
                  background: 'rgba(255, 68, 68, 0.12)',
                  border: '1px solid rgba(255, 68, 68, 0.35)',
                  color: '#ff7b7b',
                  padding: '7px 12px',
                  borderRadius: '18px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.76rem'
                }}
              >
                Remove
              </button>
            )}
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

      {/* Avatar Popup Modal */}
      {isAvatarPreviewOpen && (
        <div
          onClick={() => setIsAvatarPreviewOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 2000,
            padding: '24px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              maxWidth: '460px',
              width: '100%',
              backgroundColor: '#121216',
              border: '1px solid rgba(0, 255, 255, 0.35)',
              borderRadius: '20px',
              padding: '24px',
              textAlign: 'center',
              boxShadow: '0 24px 60px rgba(0, 0, 0, 0.75)'
            }}
          >
            <button
              type="button"
              onClick={() => setIsAvatarPreviewOpen(false)}
              aria-label="Close profile picture preview"
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.08)',
                color: '#fff',
                fontSize: '1.1rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              ×
            </button>

            <div
              style={{
                color: '#00ffff',
                fontSize: '0.8rem',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '14px'
              }}
            >
              Profile Picture
            </div>

            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={fullName}
                style={{
                  width: '100%',
                  maxHeight: '360px',
                  objectFit: 'contain',
                  borderRadius: '14px',
                  backgroundColor: '#0b0b0e',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              />
            ) : (
              <div
                style={{
                  width: '140px',
                  height: '140px',
                  margin: '16px auto',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2196f3, #00e5ff)',
                  color: '#fff',
                  fontWeight: 800,
                  fontSize: '2.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {initials}
              </div>
            )}

            <div style={{ marginTop: '14px', color: '#fff', fontWeight: 700, fontSize: '1rem' }}>
              {fullName}
            </div>
            <div style={{ color: '#999', fontSize: '0.82rem', marginTop: '2px' }}>
              {roleTitle || 'NOC - Executive'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}