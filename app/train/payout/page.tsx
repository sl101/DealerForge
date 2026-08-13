'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Timer } from 'lucide-react';
import { generateRouletteTask, RouletteTask, TaskOptions } from '@/lib/roulette';
import NumericKeypad from '@/components/ui/NumericKeypad';
import AuthModal from '@/components/AuthModal';

type Level = 1 | 2 | 3;

const LEVEL_CONFIG: Record<
  Level,
  {
    title: string;
    subtitle: string;
    timeSec: number;
    options: TaskOptions;
  }
> = {
  1: {
    title: 'Easy',
    subtitle: '3–5 bets · chips 1–4',
    timeSec: 60,
    options: { minBets: 3, maxBets: 5, minChips: 1, maxChips: 4 },
  },
  2: {
    title: 'Medium',
    subtitle: '5–8 bets · chips 1–10',
    timeSec: 75,
    options: { minBets: 5, maxBets: 8, minChips: 1, maxChips: 10 },
  },
  3: {
    title: 'Hard',
    subtitle: '7–12 bets · chips 1–15 (up to 25)',
    timeSec: 90,
    options: {
      minBets: 7,
      maxBets: 12,
      minChips: 1,
      maxChips: 15,
      rareMaxChips: 25,
      rareChance: 0.12,
    },
  },
};

export default function PayoutTrainerPage() {
  const router = useRouter();

  const [screen, setScreen] = useState<'menu' | 'play'>('menu');
  const [level, setLevel] = useState<Level>(1);
  const [task, setTask] = useState<RouletteTask | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [score, setScore] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const startTimer = (seconds: number) => {
    stopTimer();
    setTimeLeft(seconds);
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const createTask = (lv: Level) => {
    const cfg = LEVEL_CONFIG[lv];
    const newTask = generateRouletteTask(cfg.options);
    setTask(newTask);
    setUserAnswer('');
    setIsCorrect(null);
    startTimer(cfg.timeSec);
    setTimeout(() => inputRef.current?.focus(), 200);
  };

  const startLevel = (lv: Level) => {
    setLevel(lv);
    setScore(0);
    setAttempts(0);
    setScreen('play');
    createTask(lv);
  };

  const backToMenu = () => {
    stopTimer();
    setTask(null);
    setScreen('menu');
  };

  useEffect(() => {
    return () => stopTimer();
  }, []);

  const handleSubmit = () => {
    if (!task || !userAnswer.trim() || isCorrect !== null) return;

    const answer = Number(userAnswer.trim());
    const ok = answer === task.correctAnswer;
    setIsCorrect(ok);
    stopTimer();
    setAttempts((a) => a + 1);

    if (ok) {
      const bonus = Math.max(5, timeLeft);
      setScore((s) => s + bonus * level);
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(30);
      }
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 30, 40]);
    }
  };

  const nextTask = () => {
    createTask(level);
  };

  // ===================== MENU =====================
  if (screen === 'menu') {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        <header
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 50,
            backgroundColor: 'rgba(26,26,46,0.9)',
            borderBottom: '1px solid var(--border)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <div
            style={{
              maxWidth: 512,
              margin: '0 auto',
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <button
              onClick={() => router.push('/')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
            >
              <ArrowLeft size={22} />
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Payout Trainer</h1>
          </div>
        </header>

        <main style={{ maxWidth: 512, margin: '0 auto', padding: '40px 20px' }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <Trophy size={40} style={{ color: 'var(--primary)', marginBottom: 12 }} />
            <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Payout Trainer</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
              Calculate chips for covered winning numbers
            </p>
          </div>

          <p
            style={{
              textAlign: 'center',
              fontSize: 13,
              color: 'var(--text-muted)',
              marginBottom: 16,
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
          >
            Choose level
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(Object.keys(LEVEL_CONFIG) as unknown as Level[]).map((id) => {
              const lv = LEVEL_CONFIG[id];
              return (
                <button
                  key={id}
                  onClick={() => startLevel(id)}
                  className="mode-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 20, fontWeight: 700 }}>
                      Level {id} · {lv.title}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                      {lv.subtitle}
                    </div>
                  </div>
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 12,
                      background: 'rgba(103,232,249,0.15)',
                      color: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: 16,
                      flexShrink: 0,
                    }}
                  >
                    {id}
                  </div>
                </button>
              );
            })}
          </div>
        </main>
      </div>
    );
  }

  // ===================== PLAY =====================
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg)',
        color: 'var(--text)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          backgroundColor: 'rgba(26,26,46,0.9)',
          borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(12px)',
        }}
      >
        <div
          style={{
            maxWidth: 512,
            margin: '0 auto',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <button
            onClick={backToMenu}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
          >
            <ArrowLeft size={20} />
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            <Timer size={16} style={{ color: 'var(--primary)' }} />
            <span style={{ color: 'var(--primary)' }}>{timeLeft}s</span>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, textAlign: 'right' }}>
            <div>
              Score: <span style={{ color: 'var(--primary)' }}>{score}</span>
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: 11 }}>
              L{level} · {attempts} attempts
            </div>
          </div>
        </div>
      </header>

      <main
        style={{
          flex: 1,
          maxWidth: 512,
          margin: '0 auto',
          width: '100%',
          padding: '20px 16px',
          paddingBottom: 'calc(22vh + 20px)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        {task && (
          <>
            <div
              style={{
                width: '100%',
                background: 'var(--card-front)',
                borderRadius: 'var(--radius-card)',
                padding: '24px 20px',
                marginBottom: 20,
                boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                color: '#0f172a',
              }}
            >
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  marginBottom: 14,
                  textAlign: 'center',
                }}
              >
                Winning number:{' '}
                <span style={{ color: '#dc2626' }}>{task.winningNumber}</span>
              </div>

              <div style={{ fontSize: 14, lineHeight: 1.7, textAlign: 'center' }}>
                {task.bets?.map((b, i) => (
                  <div key={i}>
                    {b.count} × {b.type} on {b.positions}
                  </div>
                ))}
              </div>
            </div>

            <input
              ref={inputRef}
              type="text"
              readOnly
              inputMode="none"
              value={userAnswer}
              placeholder="Total payout chips"
              style={{
                width: '100%',
                maxWidth: 280,
                padding: '12px 16px',
                fontSize: 20,
                fontWeight: 700,
                textAlign: 'center',
                borderRadius: 14,
                border:
                  isCorrect === true
                    ? '2px solid var(--success)'
                    : isCorrect === false
                    ? '2px solid var(--error)'
                    : '2px solid var(--border)',
                background: 'rgba(255,255,255,0.06)',
                color: 'white',
                outline: 'none',
                marginBottom: 12,
              }}
            />

            {isCorrect !== null && (
              <div
                style={{
                  width: '100%',
                  maxWidth: 280,
                  padding: 14,
                  borderRadius: 14,
                  textAlign: 'center',
                  marginBottom: 8,
                  background: isCorrect ? 'var(--success-bg)' : 'var(--error-bg)',
                  color: isCorrect ? 'var(--success)' : 'var(--error)',
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                {isCorrect ? 'Correct!' : `Wrong · ${task.correctAnswer}`}
                <button
                  onClick={nextTask}
                  style={{
                    display: 'block',
                    width: '100%',
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 12,
                    border: 'none',
                    background: 'var(--primary)',
                    color: '#000',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Next task →
                </button>
              </div>
            )}
          </>
        )}
      </main>

      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 40,
        }}
      >
        <div style={{ maxWidth: 512, margin: '0 auto' }}>
          <NumericKeypad
            disabled={isCorrect !== null}
            onDigit={(d) => setUserAnswer((prev) => prev + d)}
            onBackspace={() => setUserAnswer((prev) => prev.slice(0, -1))}
            onSpace={() => {}}
            onEnter={handleSubmit}
          />
        </div>
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        message="Sign in to save your payout training results."
      />
    </div>
  );
}