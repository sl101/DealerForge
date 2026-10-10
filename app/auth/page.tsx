'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    if (!email || !password) {
      alert('Enter email and password');
      return;
    }
    if (!isLogin && !nickname.trim()) {
      alert('Enter a nickname');
      return;
    }

    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) {
          alert(error.message);
          return;
        }
        router.push('/');
        return;
      }

      const site =
        process.env.NEXT_PUBLIC_SITE_URL || window.location.origin;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { display_name: nickname.trim() },
          emailRedirectTo: `${site}/auth`,
        },
      });

      if (error) {
        alert(error.message);
        return;
      }

      if (data.session) {
        router.push('/');
        return;
      }

      if (data.user) {
        alert(
          'Account created. Check your email to confirm, then sign in.'
        );
        setIsLogin(true);
        return;
      }

      alert('Something went wrong. Try again.');
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
              fontSize: 28,
              fontWeight: 700,
              textAlign: 'center',
              color: 'var(--text)',
            }}
          >
            DealerForge
          </h1>
          <p
            style={{
              margin: '0 0 24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 14,
            }}
          >
            {isLogin ? 'Sign in to continue' : 'Create an account'}
          </p>

          <div className="segmented" style={{ marginBottom: 20 }}>
            <button
              type="button"
              className={isLogin ? 'active' : ''}
              onClick={() => setIsLogin(true)}
            >
              Login
            </button>
            <button
              type="button"
              className={!isLogin ? 'active' : ''}
              onClick={() => setIsLogin(false)}
            >
              Register
            </button>
          </div>

          {!isLogin && (
            <input
              type="text"
              placeholder="Nickname"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              autoComplete="nickname"
              maxLength={24}
              style={inputStyle}
            />
          )}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            style={{ ...inputStyle, marginBottom: isLogin ? 8 : 20 }}
          />

          {isLogin && (
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <Link
                href="/auth/forgot"
                style={{
                  fontSize: 13,
                  color: 'var(--primary)',
                  textDecoration: 'none',
                }}
              >
                Forgot password?
              </Link>
            </div>
          )}

          <button
            type="button"
            onClick={handleAuth}
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px 16px',
              borderRadius: 20,
              border: 'none',
              background: 'var(--primary)',
              color: '#000',
              fontWeight: 600,
              fontSize: 16,
              cursor: loading ? 'default' : 'pointer',
              opacity: loading ? 0.6 : 1,
            }}
          >
            {loading
              ? 'Loading...'
              : isLogin
                ? 'Sign In'
                : 'Create Account'}
          </button>

          <p
            style={{
              margin: '16px 0 0',
              textAlign: 'center',
              fontSize: 12,
              color: 'var(--text-muted)',
              lineHeight: 1.4,
            }}
          >
            By continuing you agree to our{' '}
            <Link href="/terms" style={{ color: 'var(--primary)' }}>
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" style={{ color: 'var(--primary)' }}>
              Privacy Policy
            </Link>
            .
          </p>

          <Link
            href="/"
            style={{
              display: 'block',
              marginTop: 16,
              textAlign: 'center',
              color: 'var(--text-muted)',
              textDecoration: 'none',
              fontSize: 14,
            }}
          >
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  );
}
