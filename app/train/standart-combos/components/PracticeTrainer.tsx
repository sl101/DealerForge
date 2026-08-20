'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  STANDARD_COMBOS,
  StandardCombo,
  loadComboStats,
  updateComboStat,
  ComboStats,
} from '@/lib/standart-combos';
import ComboDiagram from './ComboDiagram';
import NumericKeypad from '@/components/ui/NumericKeypad';

interface PracticeTrainerProps {
  onBack: () => void;
}

export default function PracticeTrainer({ onBack }: PracticeTrainerProps) {
  const [deck, setDeck] = useState<StandardCombo[]>([]);
  const [index, setIndex] = useState(0);
  const [answer, setAnswer] = useState('');
  const [toast, setToast] = useState<'correct' | 'wrong' | null>(null);
  const [toastAnim, setToastAnim] = useState(false);
  const [cardFlash, setCardFlash] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [solved, setSolved] = useState(0);
  const [locked, setLocked] = useState(false);
  const [started, setStarted] = useState(false);
  const [, setStats] = useState<Record<string, ComboStats>>({});

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setStats(loadComboStats());
    try {
      const b = localStorage.getItem('standart_combos_best_streak');
      if (b) setBestStreak(Number(b) || 0);
    } catch {
      /* ignore */
    }
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  const start = () => {
    const shuffled = [...STANDARD_COMBOS].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setIndex(0);
    setAnswer('');
    setToast(null);
    setCardFlash(null);
    setStreak(0);
    setSolved(0);
    setLocked(false);
    setStarted(true);
  };

  const current = deck[index] || null;
  const total = STANDARD_COMBOS.length;

  const showFeedback = (type: 'correct' | 'wrong') => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(type);
    setCardFlash(type);
    setToastAnim(false);
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setToastAnim(true));
    });
    toastTimer.current = setTimeout(() => {
      setToast(null);
      setToastAnim(false);
      setCardFlash(null);
    }, 750);
  };

  const submit = () => {
    if (!current || !answer.trim() || locked) return;
    const ok = Number(answer) === current.answer;
    setLocked(true);
    setStats((prev) => updateComboStat(prev, current.id, ok));

    if (ok) {
      setSolved((n) => n + 1);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((b) => {
          if (next > b) {
            try {
              localStorage.setItem('standart_combos_best_streak', String(next));
            } catch {
              /* ignore */
            }
            return next;
          }
          return b;
        });
        return next;
      });
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
      showFeedback('correct');
      setTimeout(() => {
        setAnswer('');
        setLocked(false);
        setIndex((i) => {
          if (i + 1 >= deck.length) {
            setDeck([...STANDARD_COMBOS].sort(() => Math.random() - 0.5));
            return 0;
          }
          return i + 1;
        });
      }, 500);
    } else {
      setStreak(0);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([40, 30, 40]);
      showFeedback('wrong');
      setTimeout(() => {
        setAnswer('');
        setLocked(false);
      }, 550);
    }
  };

  if (!started) {
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
            <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Practice</h1>
          </div>
        </header>
        <main className="page-inner" style={{ paddingTop: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 12 }}>
            See the scheme · type the total
          </p>
          {bestStreak > 0 && (
            <p style={{ color: 'var(--text-muted)', marginBottom: 24, fontSize: 14 }}>
              Best streak: 🔥 {bestStreak}
            </p>
          )}
          <button
            type="button"
            onClick={start}
            style={{
              background: 'var(--primary)',
              color: '#000',
              fontWeight: 700,
              fontSize: 18,
              padding: '16px 48px',
              borderRadius: 20,
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Start
          </button>
        </main>
      </div>
    );
  }

  const cardClass =
    cardFlash === 'correct'
      ? 'pop card-glow-correct'
      : cardFlash === 'wrong'
      ? 'shake card-glow-wrong'
      : '';

  const progressPct = total > 0 ? Math.min(100, (solved / total) * 100) : 0;

  return (
    <div className="page-shell">
				<header className="page-header">
					<div
						className="page-inner"
						style={{
							paddingTop: 12,
							paddingBottom: 12,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'space-between',
							gap: 12,
						}}
					>
						<button
							onClick={onBack}
							style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
						>
							<ArrowLeft size={20} />
						</button>
						<span style={{ fontWeight: 700, color: streak > 0 ? '#fbbf24' : 'var(--text-muted)' }}>
							🔥 {streak}
							{bestStreak > 0 ? ` · best ${bestStreak}` : ''}
						</span>
					</div>
				</header>

      <main
        className="page-inner"
        style={{ flex: 1, paddingTop: 16, paddingBottom: 'calc(22vh + 28px)' }}
      >
        {current && (
          <>
            <div
              className={cardClass}
              style={{
                position: 'relative',
                background: 'var(--card-front)',
                borderRadius: 'var(--radius-card)',
                padding: '16px 12px 20px',
                marginBottom: 16,
                boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                overflow: 'hidden',
              }}
            >
              {toast && (
                <div
                  style={{
                    position: 'absolute',
                    top: 10,
                    left: 0,
                    right: 0,
                    textAlign: 'center',
                    fontWeight: 800,
                    fontSize: 15,
                    color: toast === 'correct' ? 'var(--success)' : 'var(--error)',
                    transform: toastAnim ? 'translateY(-18px)' : 'translateY(0)',
                    opacity: toastAnim ? 0 : 1,
                    transition: 'transform 0.7s ease-out, opacity 0.7s ease-out',
                    pointerEvents: 'none',
                    zIndex: 2,
                  }}
                >
                  {toast === 'correct' ? 'Correct' : 'Wrong'}
                </div>
              )}
              <ComboDiagram family={current.family} chips={current.chips} size={260} />
            </div>

            <input
              type="text"
              readOnly
              inputMode="none"
              value={answer}
              placeholder="Total"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '16px',
                fontSize: 24,
                fontWeight: 700,
                textAlign: 'center',
                borderRadius: 16,
                border: '2px solid var(--border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                outline: 'none',
              }}
            />
          </>
        )}
      </main>

      <div className="keypad-dock">
        <div className="keypad-dock-inner">
          <NumericKeypad
            disabled={locked}
            onDigit={(d) => setAnswer((a) => a + d)}
            onBackspace={() => setAnswer((a) => a.slice(0, -1))}
            onSpace={() => {}}
            onEnter={submit}
          />
        </div>
      </div>
    </div>
  );
}