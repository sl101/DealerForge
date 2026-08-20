'use client';

import { ArrowLeft } from 'lucide-react';
import { TOTAL_COMBOS } from '@/lib/standart-combos';

interface ModeMenuProps {
  onBack: () => void;
  onStudy: () => void;
  onPractice: () => void;
}

export default function ModeMenu({ onBack, onStudy, onPractice }: ModeMenuProps) {
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
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Standard Combinations</h1>
        </div>
      </header>

      <main className="page-inner" style={{ paddingTop: 32, paddingBottom: 40 }}>
        <h2 style={{ textAlign: 'center', fontSize: 26, fontWeight: 700, marginBottom: 8 }}>
          Chip Patterns
        </h2>
        <p style={{ textAlign: 'center', color: 'var(--text-muted)', marginBottom: 36 }}>
          {TOTAL_COMBOS} combinations · scheme → total
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <button type="button" onClick={onStudy} className="mode-card">
            <div style={{ fontSize: 22, fontWeight: 600 }}>Study</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              Browse schemes · Know / Repeat
            </div>
          </button>

          <button type="button" onClick={onPractice} className="mode-card">
            <div style={{ fontSize: 22, fontWeight: 600 }}>Practice</div>
            <div style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
              Type the payout total
            </div>
          </button>
        </div>
      </main>
    </div>
  );
}