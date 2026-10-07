'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Share2, LogOut, User, Camera } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

const APP_SHARE_URL = 'https://dealer-forge-omega.vercel.app';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [shareHint, setShareHint] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!user) {
      setDisplayName('');
      setAvatarUrl(null);
      return;
    }
    (async () => {
      const { data } = await supabase
        .from('profiles')
        .select('display_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();
      setDisplayName(data?.display_name || '');
      setAvatarUrl(data?.avatar_url || null);
    })();
  }, [user]);

  const handleShare = async () => {
    setShareHint(null);
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'DealerForge',
          text: 'Train like a pro dealer',
          url: APP_SHARE_URL,
        });
        return;
      }
      await navigator.clipboard.writeText(APP_SHARE_URL);
      setShareHint('Link copied');
    } catch {
      try {
        await navigator.clipboard.writeText(APP_SHARE_URL);
        setShareHint('Link copied');
      } catch {
        setShareHint(APP_SHARE_URL);
      }
    }
  };

  const onAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      alert('Choose an image');
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert('Max 2 MB');
      return;
    }

    setUploading(true);
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `${user.id}/avatar.${ext}`;

      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (upErr) throw upErr;

      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      const url = `${pub.publicUrl}?t=${Date.now()}`;

      const { error: prErr } = await supabase
        .from('profiles')
        .update({ avatar_url: url })
        .eq('id', user.id);

      if (prErr) throw prErr;
      setAvatarUrl(url);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div
          className="page-inner"
          style={{ paddingTop: 16, paddingBottom: 16 }}
        >
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              margin: 0,
              textAlign: 'center',
              color: 'var(--text)',
            }}
          >
            Profile
          </h1>
        </div>
      </header>

      <main
        className="page-inner"
        style={{ flex: 1, paddingTop: 24, paddingBottom: 40 }}
      >
        {user ? (
          <div
            className="glass"
            style={{
              borderRadius: 24,
              padding: 24,
              marginBottom: 16,
              border: '1px solid var(--border)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                marginBottom: 20,
              }}
            >
              <label
                style={{
                  position: 'relative',
                  width: 72,
                  height: 72,
                  borderRadius: '50%',
                  overflow: 'hidden',
                  cursor: uploading ? 'wait' : 'pointer',
                  flexShrink: 0,
                  border: '2px solid rgba(103,232,249,0.35)',
                  background: 'rgba(103,232,249,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <User size={32} color="var(--primary)" />
                )}
                <span
                  style={{
                    position: 'absolute',
                    right: 2,
                    bottom: 2,
                    width: 24,
                    height: 24,
                    borderRadius: '50%',
                    background: 'var(--primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Camera size={14} color="#000" />
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={onAvatarChange}
                  disabled={uploading}
                  style={{ display: 'none' }}
                />
              </label>

              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    margin: 0,
                    fontWeight: 600,
                    fontSize: 18,
                    color: 'var(--text)',
                  }}
                >
                  {displayName || 'Player'}
                </p>
                <p
                  style={{
                    margin: '4px 0 0',
                    fontSize: 13,
                    color: 'var(--text-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {user.email}
                </p>
                {uploading && (
                  <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--primary)' }}>
                    Uploading…
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={() => signOut()}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                padding: '14px 16px',
                borderRadius: 20,
                border: '1px solid var(--border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--text)',
                fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <LogOut size={18} />
              Log out
            </button>
          </div>
        ) : (
          <div
            className="glass"
            style={{
              borderRadius: 24,
              padding: 24,
              marginBottom: 16,
              border: '1px solid var(--border)',
              textAlign: 'center',
            }}
          >
            <p style={{ margin: '0 0 20px', color: 'var(--text-muted)' }}>
              Sign in to save progress and appear on the leaderboard.
            </p>
            <Link
              href="/auth"
              style={{
                display: 'block',
                width: '100%',
                boxSizing: 'border-box',
                padding: '14px 16px',
                borderRadius: 20,
                background: 'var(--primary)',
                color: '#000',
                fontWeight: 600,
                textAlign: 'center',
                textDecoration: 'none',
              }}
            >
              Login / Register
            </Link>
          </div>
        )}

        <div
          className="glass"
          style={{
            borderRadius: 24,
            padding: 24,
            border: '1px solid var(--border)',
          }}
        >
          <h2
            style={{
              margin: '0 0 8px',
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--text)',
            }}
          >
            Share DealerForge
          </h2>
          <p
            style={{
              margin: '0 0 16px',
              fontSize: 14,
              color: 'var(--text-muted)',
            }}
          >
            Send the app link to friends.
          </p>
          <button
            type="button"
            onClick={handleShare}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              padding: '14px 16px',
              borderRadius: 20,
              border: 'none',
              background: 'var(--primary)',
              color: '#000',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Share2 size={18} />
            Share app
          </button>
          <p
            style={{
              margin: '12px 0 0',
              fontSize: 12,
              color: 'var(--text-muted)',
              textAlign: 'center',
              wordBreak: 'break-all',
            }}
          >
            {APP_SHARE_URL}
          </p>
          {shareHint && (
            <p
              style={{
                margin: '8px 0 0',
                fontSize: 14,
                color: 'var(--primary)',
                textAlign: 'center',
              }}
            >
              {shareHint}
            </p>
          )}
        </div>
      </main>
    </div>
  );
}