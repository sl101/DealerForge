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
      icon: <Calculator size={32} style={{ color: '#67e8f9' }} />,
      path: '/train/payout',
      gradient: 'linear-gradient(135deg, rgba(103, 232, 249, 0.18), rgba(59, 130, 246, 0.12))',
    },
    {
      title: 'Standart Combinations',
      icon: <Grid3X3 size={32} style={{ color: '#67e8f9' }} />,
      path: '/train/standart-combos',
      gradient: 'linear-gradient(135deg, rgba(165, 180, 252, 0.18), rgba(129, 140, 248, 0.12))',
    },
    {
      title: 'Neighbors Drill',
      icon: <CircleDot size={32} style={{ color: '#67e8f9' }} />,
      path: '/train/neighbors',
      gradient: 'linear-gradient(135deg, rgba(52, 211, 153, 0.18), rgba(16, 185, 129, 0.12))',
    },
    {
      title: 'Multiplication Table',
      icon: <Hash size={32} style={{ color: '#67e8f9' }} />,
      path: '/train/multiplication',
      gradient: 'linear-gradient(135deg, rgba(251, 191, 36, 0.18), rgba(245, 158, 11, 0.12))',
    },
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#1a1a2e', color: 'white' }}>
      {/* Header */}
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(26, 26, 46, 0.9)',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          style={{
            maxWidth: '512px',
            margin: '0 auto',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: 'white' }}>
            DealerForge
          </h1>
          {user && (
            <button
              onClick={() => signOut()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                color: 'rgba(255,255,255,0.6)',
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

      <main style={{ maxWidth: '512px', margin: '0 auto', padding: '32px 20px 64px' }}>
        <h2
          style={{
            fontSize: '28px',
            fontWeight: 700,
            textAlign: 'center',
            marginBottom: '40px',
            color: 'white',
          }}
        >
          Training Modes
        </h2>

        {/* 2x2 Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            marginBottom: '32px',
          }}
        >
          {modes.map((mode) => (
            <button
              key={mode.path}
              onClick={() => router.push(mode.path)}
              style={{
                aspectRatio: '1',
                borderRadius: '24px',
                background: mode.gradient,
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                padding: '16px',
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.2s',
              }}
            >
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(103, 232, 249, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '16px',
                }}
              >
                {mode.icon}
              </div>
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  textAlign: 'center',
                  lineHeight: 1.3,
                  color: 'white',
                }}
              >
                {mode.title}
              </span>
            </button>
          ))}
        </div>

        {/* Leaderboard */}
        <button
          onClick={() => router.push('/leaderboard')}
          style={{
            width: '100%',
            borderRadius: '24px',
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px',
            padding: '20px',
            cursor: 'pointer',
            color: 'white',
            fontWeight: 500,
          }}
        >
          <Trophy size={22} style={{ color: '#67e8f9' }} />
          Global Leaderboard
        </button>
      </main>
    </div>
  );
}