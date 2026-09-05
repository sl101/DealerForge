'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LogOut, Calculator, Grid3X3, CircleDot, Hash, Trophy } from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, signOut } = useAuth();

  const modes = [
    {
      title: 'Payout Trainer',
      icon: <Calculator size={32} style={{ color: 'var(--primary)' }} />,
      path: '/train/payout',
      gradient:
        'linear-gradient(135deg, rgba(103, 232, 249, 0.18), rgba(59, 130, 246, 0.12))',
    },
    {
      title: 'Standart Combinations',
      icon: <Grid3X3 size={32} style={{ color: 'var(--primary)' }} />,
      path: '/train/standart-combos',
      gradient:
        'linear-gradient(135deg, rgba(165, 180, 252, 0.18), rgba(129, 140, 248, 0.12))',
    },
    {
      title: 'Neighbors Drill',
      icon: <CircleDot size={32} style={{ color: 'var(--primary)' }} />,
      path: '/train/neighbors',
      gradient:
        'linear-gradient(135deg, rgba(52, 211, 153, 0.18), rgba(16, 185, 129, 0.12))',
    },
    {
      title: 'Multiplication Table',
      icon: <Hash size={32} style={{ color: 'var(--primary)' }} />,
      path: '/train/multiplication',
      gradient:
        'linear-gradient(135deg, rgba(251, 191, 36, 0.18), rgba(245, 158, 11, 0.12))',
    },
  ];

  return (
    <div className="page-shell no-page-scroll">
      <header className="page-header">
        <div
          className="page-inner"
          style={{
            paddingTop: 16,
            paddingBottom: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: 'var(--text)' }}>
            DealerForge
          </h1>
          {user && (
            <button
              type="button"
              onClick={() => signOut()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: 'var(--text-muted)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </div>
      </header>

      <main
        className="page-inner"
        style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          paddingTop: 32,
          paddingBottom: 40,
        }}
      >
        <h2
          style={{
            fontSize: 28,
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: 40,
            color: 'var(--text)',
          }}
        >
          Training Modes
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 16,
            marginBottom: 32,
          }}
        >
          {modes.map((mode) => (
            <button
              key={mode.path}
              type="button"
              onClick={() => router.push(mode.path)}
              style={{
                aspectRatio: '1',
                borderRadius: 24,
                background: mode.gradient,
                border: '1px solid var(--border)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: 16,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  backgroundColor: 'rgba(103, 232, 249, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}
              >
                {mode.icon}
              </div>
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  textAlign: 'center',
                  lineHeight: 1.3,
                  color: 'var(--text)',
                }}
              >
                {mode.title}
              </span>
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => router.push('/leaderboard')}
          style={{
            width: '100%',
            borderRadius: 24,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            padding: 20,
            cursor: 'pointer',
            color: 'var(--text)',
            fontWeight: 500,
          }}
        >
          <Trophy size={22} style={{ color: 'var(--primary)' }} />
          Global Leaderboard
        </button>
      </main>
    </div>
  );
}