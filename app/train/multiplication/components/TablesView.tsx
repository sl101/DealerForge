'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { MULTIPLIERS, tableFor, Multiplier } from '@/lib/multiplication';

interface TablesViewProps {
  onBack: () => void;
}

export default function TablesView({ onBack }: TablesViewProps) {
  const [active, setActive] = useState<Multiplier>(5);
  const rows = tableFor(active);

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
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Tables</h1>
        </div>
      </header>

      <main className="page-inner" style={{ paddingTop: 20, paddingBottom: 40 }}>
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 24,
          }}
        >
          {MULTIPLIERS.map((m) => (
            <button
              key={m}
              onClick={() => setActive(m)}
              style={{
                minWidth: 52,
                padding: '10px 14px',
                borderRadius: 14,
                border: '1px solid var(--border)',
                background: active === m ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                color: active === m ? '#000' : 'var(--text)',
                fontWeight: 700,
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              ×{m}
            </button>
          ))}
        </div>

        <div
          style={{
            background: 'var(--card-front)',
            borderRadius: 'var(--radius-card)',
            padding: '8px 0',
            color: '#0f172a',
            overflow: 'hidden',
          }}
        >
          {rows.map(({ factor, answer }) => (
            <div
              key={factor}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                alignItems: 'center',
                padding: '12px 20px',
                borderBottom: '1px solid rgba(0,0,0,0.06)',
                fontSize: 18,
                fontWeight: 600,
              }}
            >
              <span style={{ textAlign: 'right' }}>
                {active} × {factor}
              </span>
              <span style={{ padding: '0 16px', color: '#64748b' }}>=</span>
              <span style={{ color: 'var(--number-red, #dc2626)' }}>{answer}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}