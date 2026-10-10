'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    // Session is set from recovery link hash/query by Supabase client
    supabase.auth.getSession().then(({ data }) => {
      setReady(Boolean(data.session));
      if (!data.session) {
        setMsg(
          'Open this page from the link in your email, or request a new reset link.'
        );
      }
    });
  }, []);

  const submit = async () => {
    if (password.length < 6) {
      setMsg('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      setMsg('Passwords do not match');
      return;
    }
    setLoading(true);
    setMsg(null);
    try {
      await updatePassword(password);
      setMsg('Password updated. You can continue.');
      setTimeout(() => router.push('/'), 1200);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    boxSizing: 'border-box',
    marginBottom: 12,
    padding: '14px 16px',
    borderRadius: 16,
    border: '1px solid var(--border)',
    background: 'rgba(255, 255, 255, 0.06)',
    color: 'var(--text)',
    fontSize: 16,
    outline: 'none',
  };

  return (
    <div className="page-shell">
      <main
        className="page-inner"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          paddingTop: 24,
          paddingBottom: 40,
        }}
      >
        <div
          className="glass"
          style={{
            borderRadius: 24,
            padding: 28,
            border: '1px solid var(--border)',
          }}
        >
          <h1
            style={{
              margin: '0 0 8px',
              fontSize: 24,
              fontWeight: 700,
              textAlign: 'center',
              color: 'var(--text)',
            }}
          >
            New password
          </h1>
          <p
            style={{
              margin: '0 0 24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 14,
            }}
          >
            Choose a new password for your account.
          </p>

          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Confirm password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            style={{ ...inputStyle, marginBottom: 16 }}
          />

          {msg && (
            <p
              style={{
                color: msg.includes('updated')
                  ? 'var(--success, #10b981)'
                  : 'var(--error)',
                fontSize: 13,
                margin: '0 0 12px',
              }}
            >
              {msg}
            </p>
          )}

          <button
            type="button"
            onClick={submit}
            disabled={loading || !ready}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 20,
              border: 'none',
              background: 'var(--primary)',
              color: '#000',
              fontWeight: 600,
              fontSize: 16,
              cursor: 'pointer',
              opacity: loading || !ready ? 0.5 : 1,
            }}
          >
            {loading ? 'Saving…' : 'Update password'}
          </button>

          <Link
            href="/auth/forgot"
            style={{
              display: 'block',
              marginTop: 16,
              textAlign: 'center',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: 14,
            }}
          >
            Request new link
          </Link>
        </div>
      </main>
    </div>
  );
}
