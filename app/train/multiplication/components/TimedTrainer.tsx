'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Timer } from 'lucide-react';
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
  getTimedBest,
  setTimedBest,
} from '@/lib/multiplication';
import NumericKeypad from '@/components/ui/NumericKeypad';

interface TimedTrainerProps {
  onBack: () => void;
}

export default function TimedTrainer({ onBack }: TimedTrainerProps) {
  const [selected, setSelected] = useState<Multiplier[]>([...MULTIPLIERS]);
  const [pool, setPool] = useState<Fact[]>([]);
  const [current, setCurrent] = useState<Fact | null>(null);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [longest, setLongest] = useState(0);
  const [best, setBest] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [newRecord, setNewRecord] = useState(false);
  const [stats, setStats] = useState<Record<string, FactStats>>({});

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setStats(loadStats());
    setLongest(getLongestStreak());
    setBest(getTimedBest());
  }, []);

  const start = () => {
    const list = buildFacts(selected.length ? selected : MULTIPLIERS);
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setPool(shuffled);
    setCurrent(shuffled[0] || null);
    setAnswer('');
    setFeedback(null);
    setTimeLeft(45);
    setScore(0);
    setStreak(0);
    setNewRecord(false);
    setIsRunning(true);
    setIsPaused(false);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  useEffect(() => {
    if (!isRunning || isPaused) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setIsRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused]);

  useEffect(() => {
    if (!isRunning && timeLeft === 0 && score > 0) {
      if (score > best) {
        setBest(score);
        setTimedBest(score);
        setNewRecord(true);
      }
    }
  }, [isRunning, timeLeft, score, best]);

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
    if (!current || !answer.trim() || feedback) return;
    const ok = Number(answer) === current.answer;
    setFeedback(ok ? 'correct' : 'wrong');
    setStats(updateFactStat(stats, current.id, ok));

    if (ok) {
      setIsPaused(true);
      const points = Math.max(5, Math.floor(timeLeft * 0.8));
      setScore((s) => s + points);
      const s = streak + 1;
      setStreak(s);
      if (s > longest) {
        setLongest(s);
        setLongestStreak(s);
      }
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
      setTimeout(() => {
        setFeedback(null);
        setAnswer('');
        setIsPaused(false);
        nextFact(pool);
        setTimeout(() => inputRef.current?.focus(), 50);
      }, 500);
    } else {
      setStreak(0);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([40, 30, 40]);
      setTimeout(() => {
        setFeedback(null);
        setAnswer('');
        inputRef.current?.focus();
      }, 600);
    }
  };

  if (!isRunning && pool.length === 0 && timeLeft !== 0) {
    return (
      <div className="page-shell">
        <header className="page-header">
          <div
            className="page-inner"
            style={{ paddingTop: 14, paddingBottom: 14, display: 'flex', alignItems: 'center', gap: 12 }}
          >
            <button
              onClick={onBack}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
            >
              <ArrowLeft size={22} />
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Timed Challenge</h1>
          </div>
        </header>

        <main className="page-inner" style={{ paddingTop: 40, textAlign: 'center' }}>
          <Timer size={48} style={{ color: 'var(--primary)', marginBottom: 16 }} />
          <p style={{ color: 'var(--text-muted)', marginBottom: 16 }}>45 seconds · score & streaks</p>
          {best > 0 && (
            <p style={{ color: 'var(--text-muted)', marginBottom: 8 }}>
              Best score: <strong style={{ color: 'var(--primary)' }}>{best}</strong>
            </p>
          )}
          {longest > 0 && (
            <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
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
                  onClick={() =>
                    setSelected((prev) => {
                      if (prev.includes(m)) return prev.length === 1 ? prev : prev.filter((x) => x !== m);
                      return [...prev, m];
                    })
                  }
                  style={{
                    padding: '10px 14px',
                    borderRadius: 12,
                    border: '1px solid var(--border)',
                    background: on ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                    color: on ? '#000' : 'var(--text)',
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

  if (!isRunning && timeLeft === 0) {
    return (
      <div
        className="page-shell"
        style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}
      >
        {newRecord && (
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>
            New Record!
          </div>
        )}
        <h2 style={{ fontSize: 32, fontWeight: 700 }}>Time&apos;s up!</h2>
        <p style={{ fontSize: 28, color: 'var(--primary)', margin: '12px 0' }}>Score: {score}</p>
        <p style={{ color: 'var(--text-muted)' }}>Best: {Math.max(best, score)}</p>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Longest streak: {longest}</p>
        <button
          onClick={start}
          style={{
            background: 'var(--primary)',
            color: '#000',
            fontWeight: 700,
            padding: '14px 36px',
            borderRadius: 16,
            border: 'none',
            cursor: 'pointer',
            marginBottom: 12,
          }}
        >
          Play again
        </button>
        <button
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          Back to menu
        </button>
      </div>
    );
  }

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
          }}
        >
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
          >
            <ArrowLeft size={20} />
          </button>
          <div style={{ display: 'flex', gap: 12, fontWeight: 600, fontSize: 14, alignItems: 'center' }}>
            <span style={{ color: 'var(--primary)' }}>{timeLeft}s</span>
            <span>Score: {score}</span>
            {streak > 0 && <span style={{ color: 'var(--success)' }}>🔥 {streak}</span>}
          </div>
        </div>
      </header>

      <main
        className="page-inner"
        style={{ flex: 1, paddingTop: 24, paddingBottom: 'calc(22vh + 28px)' }}
      >
        {current && (
          <>
            <div
              style={{
                background: 'var(--card-front)',
                borderRadius: 'var(--radius-card)',
                padding: '36px 18px',
                textAlign: 'center',
                marginBottom: 16,
                boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
              }}
            >
              <div style={{ fontSize: 48, fontWeight: 800, color: '#0f172a' }}>
                {current.multiplier} × {current.factor}
              </div>
              {feedback === 'correct' && (
                <div style={{ marginTop: 12, color: 'var(--success)', fontWeight: 700 }}>Correct!</div>
              )}
            </div>

            <input
              ref={inputRef}
              type="text"
              readOnly
              inputMode="none"
              value={answer}
              placeholder="Answer"
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '16px',
                fontSize: 24,
                fontWeight: 700,
                textAlign: 'center',
                borderRadius: 16,
                border:
                  feedback === 'wrong'
                    ? '2px solid var(--error)'
                    : feedback === 'correct'
                    ? '2px solid var(--success)'
                    : '2px solid var(--border)',
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
            disabled={feedback === 'correct'}
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