'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import { MULTIPLIERS, tableFor, Multiplier } from '@/lib/multiplication';

interface TablesViewProps {
  onBack: () => void;
}

export default function TablesView({ onBack }: TablesViewProps) {
  const [active, setActive] = useState<Multiplier>(5);
  const rows = tableFor(active);

  // Lock page scroll while this view is open
  useEffect(() => {
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
    };
  }, []);

  return (
    <div
      className="page-shell tables-page"
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100dvh',
        maxHeight: '100dvh',
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <header className="page-header" style={{ flexShrink: 0 }}>
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
            type="button"
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={22} />
          </button>
          <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Tables</h1>
        </div>
      </header>

      <main
        className="page-inner"
        style={{
          flex: 1,
          minHeight: 0,
          maxHeight: '100%',
          paddingTop: 16,
          paddingBottom: 28,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 16,
            flexShrink: 0,
          }}
        >
          {MULTIPLIERS.map((m) => (
            <button
              key={m}
              type="button"
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
          className="tables-scroll-card"
          style={{
            flex: '1 1 0',
            minHeight: 0,
            marginBottom: 8,
            background: 'var(--card-front)',
            borderRadius: 'var(--radius-card)',
            color: '#0f172a',
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            overscrollBehavior: 'contain',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            touchAction: 'pan-y',
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