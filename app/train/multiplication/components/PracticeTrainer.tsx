'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  Multiplier,
  MULTIPLIERS,
  Fact,
  buildFacts,
  loadStats,
  updateFactStat,
  FactStats,
  getLongestStreak,
  setLongestStreak,
} from '@/lib/multiplication';
import NumericKeypad from '@/components/ui/NumericKeypad';

interface PracticeTrainerProps {
  onBack: () => void;
}

export default function PracticeTrainer({ onBack }: PracticeTrainerProps) {
  const [selected, setSelected] = useState<Multiplier[]>([...MULTIPLIERS]);
  const [pool, setPool] = useState<Fact[]>([]);
  const [current, setCurrent] = useState<Fact | null>(null);
  const [answer, setAnswer] = useState('');
  const [toast, setToast] = useState<'correct' | 'wrong' | null>(null);
  const [toastAnim, setToastAnim] = useState(false);
  const [cardFlash, setCardFlash] = useState<'correct' | 'wrong' | null>(null);
  const [streak, setStreak] = useState(0);
  const [longest, setLongest] = useState(0);
  const [stats, setStats] = useState<Record<string, FactStats>>({});
  const [started, setStarted] = useState(false);
  const [locked, setLocked] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setStats(loadStats());
    setLongest(getLongestStreak());
    return () => {
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, []);

  // Lock document scroll on this screen
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

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

  const start = () => {
    const list = buildFacts(selected.length ? selected : MULTIPLIERS);
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setPool(shuffled);
    setCurrent(shuffled[0] || null);
    setAnswer('');
    setToast(null);
    setCardFlash(null);
    setStreak(0);
    setLocked(false);
    setStarted(true);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const nextFact = (from: Fact[]) => {
    const rest = from.slice(1);
    if (rest.length === 0) {
      const reshuffle = buildFacts(selected.length ? selected : MULTIPLIERS).sort(
        () => Math.random() - 0.5
      );
      setPool(reshuffle);
      setCurrent(reshuffle[0] || null);
    } else {
      setPool(rest);
      setCurrent(rest[0]);
    }
  };

  const submit = () => {
    if (!current || !answer.trim() || locked) return;
    const ok = Number(answer) === current.answer;
    setLocked(true);
    setStats(updateFactStat(stats, current.id, ok));

    if (ok) {
      const s = streak + 1;
      setStreak(s);
      if (s > longest) {
        setLongest(s);
        setLongestStreak(s);
      }
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
      showFeedback('correct');
      setTimeout(() => {
        setAnswer('');
        setLocked(false);
        nextFact(pool);
        setTimeout(() => inputRef.current?.focus(), 50);
      }, 500);
    } else {
      setStreak(0);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate([40, 30, 40]);
      }
      showFeedback('wrong');
      setTimeout(() => {
        setAnswer('');
        setLocked(false);
        inputRef.current?.focus();
      }, 550);
    }
  };

  if (!started) {
    return (
      <div className="page-shell no-page-scroll">
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
            <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Practice</h1>
          </div>
        </header>

        <main className="page-inner" style={{ paddingTop: 32, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', marginBottom: 20 }}>
            Type the product · build a streak
          </p>
          {longest > 0 && (
            <p style={{ marginBottom: 24, color: 'var(--text-muted)' }}>
              Longest streak: <strong style={{ color: 'var(--primary)' }}>{longest}</strong>
            </p>
          )}

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              justifyContent: 'center',
              marginBottom: 32,
            }}
          >
            {MULTIPLIERS.map((m) => {
              const on = selected.includes(m);
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() =>
                    setSelected((prev) => {
                      if (prev.includes(m)) {
                        return prev.length === 1 ? prev : prev.filter((x) => x !== m);
                      }
                      return [...prev, m];
                    })
                  }
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: on ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: on ? '#000' : 'var(--foreground)',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  ×{m}
                </button>
              );
            })}
          </div>

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

  return (
    <div
      className="page-shell no-page-scroll"
      style={{ display: 'flex', flexDirection: 'column', height: '100dvh' }}
    >
      <header className="page-header">
        <div
          className="page-inner"
          style={{
            paddingTop: 12,
            paddingBottom: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            maxWidth: '100%',
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
            <ArrowLeft size={20} />
          </button>
          <div style={{ fontWeight: 600, fontSize: 14 }}>
            {streak > 0 && <span style={{ color: 'var(--success)' }}>🔥 {streak}</span>}
            <span style={{ color: 'var(--text-muted)', marginLeft: 12 }}>Best {longest}</span>
          </div>
        </div>
      </header>

      <div className="play-with-keypad">
        <main className="play-main page-inner" style={{ paddingTop: 16 }}>
          {current && (
            <>
              <div
                className={`keypad-task-card ${cardClass}`}
                style={{
                  position: 'relative',
                  background: 'var(--card-front)',
                  borderRadius: 'var(--radius-card)',
                  padding: '20px 16px',
                  textAlign: 'center',
                  marginBottom: 12,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                  height: 'min(28dvh, 160px)',
                  maxHeight: 160,
                  minHeight: 100,
                  boxSizing: 'border-box',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
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
                      fontSize: 14,
                      letterSpacing: 0.5,
                      color: toast === 'correct' ? 'var(--success)' : 'var(--error)',
                      transform: toastAnim ? 'translateY(-18px)' : 'translateY(0)',
                      opacity: toastAnim ? 0 : 1,
                      transition: 'transform 0.7s ease-out, opacity 0.7s ease-out',
                      pointerEvents: 'none',
                    }}
                  >
                    {toast === 'correct' ? 'Correct' : 'Wrong'}
                  </div>
                )}

                <div
                  style={{
                    fontSize: 'clamp(32px, 9vw, 44px)',
                    fontWeight: 800,
                    color: '#0f172a',
                  }}
                >
                  {current.multiplier} × {current.factor}
                </div>
              </div>

              <input
                ref={inputRef}
                className="answer-input"
                type="text"
                readOnly
                inputMode="none"
                value={answer}
                placeholder="Answer"
                style={{
                  width: '100%',
                  maxWidth: 280,
                  boxSizing: 'border-box',
                  padding: '12px 16px',
                  fontSize: 22,
                  fontWeight: 700,
                  textAlign: 'center',
                  borderRadius: 14,
                  border: '2px solid var(--border)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  outline: 'none',
                  margin: '0 auto 8px',
                  display: 'block',
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
    </div>
  );
}