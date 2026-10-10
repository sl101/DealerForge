'use client';

import { X } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  message = 'Great work!',
}: AuthModalProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleSubmit = async () => {
    if (!email || !password) return;
    if (!isLogin && !nickname.trim()) {
      alert('Enter a nickname');
      return;
    }
    setLoading(true);
    try {
      if (isLogin) await signIn(email, password);
      else await signUp(email, password, nickname.trim());
      onClose();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : 'Error';
      alert(msg);
    }
    setLoading(false);
  };

  if (!isOpen) return null;

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
    <>
      <div
        className="fixed inset-0 z-[99999]"
        style={{ background: 'rgba(0,0,0,0.92)' }}
      />

      <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4">
        <div
          className="glass relative w-full max-w-md"
          style={{
            borderRadius: 24,
            padding: 28,
            border: '1px solid var(--border)',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 16,
              right: 16,
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={24} />
          </button>

          <h2
            style={{
              margin: '0 0 8px',
              fontSize: 24,
              fontWeight: 700,
              textAlign: 'center',
              color: 'var(--text)',
            }}
          >
            Join DealerForge
          </h2>
          <p
            style={{
              margin: '0 0 24px',
              textAlign: 'center',
              color: 'var(--text-muted)',
              lineHeight: 1.5,
            }}
          >
            {message}
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
              maxLength={24}
              style={inputStyle}
            />
          )}
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...inputStyle, marginBottom: isLogin ? 8 : 20 }}
          />

          {isLogin && (
            <div style={{ textAlign: 'right', marginBottom: 16 }}>
              <Link
                href="/auth/forgot"
                onClick={onClose}
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
            onClick={handleSubmit}
            disabled={loading || !email || !password}
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
              opacity: loading || !email || !password ? 0.5 : 1,
            }}
          >
            {loading
              ? 'Processing...'
              : isLogin
                ? 'Sign In'
                : 'Create Account'}
          </button>

          <button
            type="button"
            onClick={onClose}
            style={{
              width: '100%',
              marginTop: 12,
              padding: 12,
              background: 'none',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </>
  );
}
