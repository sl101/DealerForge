'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import {
  allBetsForNumber,
  totalForBets,
} from '@/lib/roulette';
import { betToChipPos, betsToStacks } from '@/lib/roulette/betToChip';
import { familyFromNumber } from '@/lib/standart-combos/familyFromNumber';
import ComboDiagram from '@/app/train/standart-combos/components/ComboDiagram';

const MULT: Record<string, number> = {
  Straight: 35,
  Split: 17,
  Corner: 8,
  Street: 11,
  SixLine: 5,
};

export default function PayoutVerifyPage() {
  const router = useRouter();
  const [verifyNum, setVerifyNum] = useState(0);
  const [verifyInput, setVerifyInput] = useState('0');

  const verifyBets = useMemo(() => allBetsForNumber(verifyNum), [verifyNum]);
  const verifyTotal = useMemo(() => totalForBets(verifyBets), [verifyBets]);
  const verifyStacks = useMemo(
    () => betsToStacks(verifyNum, verifyBets),
    [verifyNum, verifyBets]
  );
  const unmapped = useMemo(
    () =>
      verifyBets
        .filter((b) => betToChipPos(verifyNum, b) == null)
        .map((b) => `${b.type} ${b.positions}`),
    [verifyNum, verifyBets]
  );

  const applyNumber = (raw: string) => {
    const n = Math.max(0, Math.min(36, Number(raw) || 0));
    setVerifyNum(n);
    setVerifyInput(String(n));

    const bets = allBetsForNumber(n);
    console.log(
      `[Verify] n=${n} family=${familyFromNumber(n)}\n` +
        bets
          .map((b) => {
            const pos = betToChipPos(n, b);
            return `  ${b.type} ${b.positions} → chip=${pos ?? 'NULL'} · ${MULT[b.type]}`;
          })
          .join('\n') +
        `\n  TOTAL=${totalForBets(bets)}`
    );
  };

  const step = (delta: number) => {
    const n = (verifyNum + delta + 37) % 37;
    setVerifyNum(n);
    setVerifyInput(String(n));
  };

  return (
    <div
      className="page-shell"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}
    >
      <header className="page-header">
        <div
          className="page-inner"
          style={{
            paddingTop: 12,
            paddingBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            maxWidth: '100%',
          }}
        >
          <button
            type="button"
            onClick={() => router.push('/train/payout')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Verify layout (temp)</span>
        </div>
      </header>

      <main className="page-inner" style={{ paddingTop: 16, paddingBottom: 40 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <button
            type="button"
            onClick={() => step(-1)}
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--text)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ←
          </button>
          <input
            type="number"
            min={0}
            max={36}
            value={verifyInput}
            onChange={(e) => setVerifyInput(e.target.value)}
            onBlur={() => applyNumber(verifyInput)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyNumber(verifyInput);
            }}
            style={{
              width: 72,
              textAlign: 'center',
              fontSize: 24,
              fontWeight: 800,
              padding: '10px 8px',
              borderRadius: 12,
              border: '2px solid var(--primary)',
              background: 'rgba(255,255,255,0.06)',
              color: 'white',
            }}
          />
          <button
            type="button"
            onClick={() => step(1)}
            style={{
              padding: '10px 16px',
              borderRadius: 12,
              border: '1px solid var(--border)',
              background: 'rgba(255,255,255,0.06)',
              color: 'var(--text)',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            →
          </button>
        </div>

        <p
          style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          family:{' '}
          <strong style={{ color: 'var(--primary)' }}>
            {familyFromNumber(verifyNum)}
          </strong>
          {' · '}
          bets: {verifyBets.length}
          {' · '}
          total (1 chip each):{' '}
          <strong style={{ color: 'var(--primary)' }}>{verifyTotal}</strong>
        </p>

        <div className="task-card">
          <div className="task-card-title">
            All bets on{' '}
            <span style={{ color: 'var(--number-red)' }}>{verifyNum}</span>
          </div>
          <div className="combo-diagram">
            <ComboDiagram
              family={familyFromNumber(verifyNum)}
              chips={verifyStacks.map((s) => ({ pos: s.pos, label: s.label }))}
              size={280}
            />
          </div>
        </div>

        {unmapped.length > 0 && (
          <div
            style={{
              marginBottom: 12,
              padding: 12,
              borderRadius: 12,
              background: 'var(--error-bg)',
              color: 'var(--error)',
              fontSize: 13,
            }}
          >
            Unmapped anchors: {unmapped.join(', ')}
          </div>
        )}

        <div
          style={{
            fontSize: 13,
            lineHeight: 1.6,
            color: 'var(--text-muted)',
            fontFamily: 'ui-monospace, monospace',
          }}
        >
          {verifyBets.map((b, i) => {
            const pos = betToChipPos(verifyNum, b);
            return (
              <div key={`${b.type}-${b.positions}-${i}`}>
                {b.type} on {b.positions} →{' '}
                <span style={{ color: pos ? 'var(--success)' : 'var(--error)' }}>
                  {pos ?? 'NULL'}
                </span>{' '}
                · {MULT[b.type]}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}