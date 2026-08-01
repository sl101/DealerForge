'use client';

import { ArrowLeft } from 'lucide-react';

interface ModeMenuProps {
  onBack: () => void;
  onStartCards: () => void;
  onStartTimed: () => void;
}

export default function ModeMenu({ onBack, onStartCards, onStartTimed }: ModeMenuProps) {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(26,26,46,0.9)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{
          maxWidth: 512,
          margin: '0 auto',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
          >
            <ArrowLeft size={22} />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Neighbors Drill</h1>
        </div>
      </header>

      <main style={{ maxWidth: 512, margin: '0 auto', padding: '32px 20px' }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Choose Mode
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 40 }}>
          Master the roulette wheel neighbors
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button onClick={onStartCards} className="mode-card">
            <div style={{ fontSize: 22, fontWeight: 600 }}>Cards</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              Learn with flashcards
            </div>
          </button>

          <button onClick={onStartTimed} className="mode-card">
            <div style={{ fontSize: 22, fontWeight: 600 }}>Timed Input</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              Type neighbors against the clock
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}