'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (!email.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await resetPassword(email.trim());
      setDone(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send email');
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
            Reset password
          </h1>
          <p
            style={{
              margin: '0 0 24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 14,
              lineHeight: 1.5,
            }}
          >
            {done
              ? 'If an account exists for this email, we sent a reset link. Check your inbox.'
              : 'Enter your email and we will send a reset link.'}
          </p>

          {!done && (
            <>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                style={inputStyle}
              />
              {error && (
                <p
                  style={{
                    color: 'var(--error)',
                    fontSize: 13,
                    margin: '0 0 12px',
                  }}
                >
                  {error}
                </p>
              )}
              <button
                type="button"
                onClick={submit}
                disabled={loading || !email.trim()}
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
                  opacity: loading || !email.trim() ? 0.5 : 1,
                }}
              >
                {loading ? 'Sending…' : 'Send reset link'}
              </button>
            </>
          )}

          <Link
            href="/auth"
            style={{
              display: 'block',
              marginTop: 16,
              textAlign: 'center',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: 14,
            }}
          >
            Back to Login
          </Link>
        </div>
      </main>
    </div>
  );
}
