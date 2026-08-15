'use client';

import { ArrowLeft } from 'lucide-react';

interface ModeMenuProps {
  onBack: () => void;
  onTables: () => void;
  onCards: () => void;
  onPractice: () => void;
  onTimed: () => void;
}

export default function ModeMenu({
  onBack,
  onTables,
  onCards,
  onPractice,
  onTimed,
}: ModeMenuProps) {
  return (
    <div className="page-shell">
      <header className="page-header">
        <div
          className="page-inner"
          style={{
            paddingTop: 14,
            paddingBottom: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
          >
            <ArrowLeft size={22} />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Multiplication</h1>
        </div>
      </header>

      <main className="page-inner" style={{ paddingTop: 32, paddingBottom: 40 }}>
        <h2 style={{ textAlign: 'center', fontSize: 28, fontWeight: 700, marginBottom: 8 }}>
          Multiplication Tables
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 40 }}>
          5 · 8 · 11 · 17 · 35 × 2–20
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button onClick={onTables} className="mode-card">
            <div style={{ fontSize: 22, fontWeight: 600 }}>Tables</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              Browse full tables
            </div>
          </button>

          <button onClick={onCards} className="mode-card">
            <div style={{ fontSize: 22, fontWeight: 600 }}>Cards</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              Flashcards · Know / Repeat
            </div>
          </button>

          <button onClick={onPractice} className="mode-card">
            <div style={{ fontSize: 22, fontWeight: 600 }}>Practice</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              Type answers · no timer · streaks
            </div>
          </button>

          <button onClick={onTimed} className="mode-card">
            <div style={{ fontSize: 22, fontWeight: 600 }}>Timed Challenge</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              Race the clock · score & streaks
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}