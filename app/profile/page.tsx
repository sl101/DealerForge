'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Share2, LogOut, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const APP_SHARE_URL = 'https://dealer-forge-omega.vercel.app';

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const [shareHint, setShareHint] = useState<string | null>(null);

  const handleShare = async () => {
    setShareHint(null);
    const payload = {
      title: 'DealerForge',
      text: 'Train like a pro dealer',
      url: APP_SHARE_URL,
    };

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share(payload);
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

  return (
    <div className="page-shell">
      <header className="page-header">
        <div
          className="page-inner"
          style={{
            paddingTop: 16,
            paddingBottom: 16,
          }}
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
                gap: 12,
                marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 16,
                  background: 'rgba(103, 232, 249, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  flexShrink: 0,
                }}
              >
                <User size={24} />
              </div>
              <div style={{ minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 13, color: 'var(--text-muted)' }}>
                  Signed in as
                </p>
                <p
                  style={{
                    margin: '4px 0 0',
                    fontWeight: 600,
                    color: 'var(--text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.email}
                </p>
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
                background: 'rgba(255, 255, 255, 0.05)',
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
            <p
              style={{
                margin: '0 0 20px',
                color: 'var(--text-muted)',
                lineHeight: 1.5,
              }}
            >
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
                fontSize: 16,
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
              lineHeight: 1.5,
            }}
          >
            Send the app link to friends so they can open and install it.
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