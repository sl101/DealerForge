'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Trophy, Timer } from 'lucide-react';
import { generateRouletteTask, RouletteTask, TaskOptions } from '@/lib/roulette';
import NumericKeypad from '@/components/ui/NumericKeypad';
import AuthModal from '@/components/AuthModal';
import ComboDiagram from '@/app/train/standart-combos/components/ComboDiagram';
import { familyFromNumber } from '@/lib/standart-combos/familyFromNumber';
import { betsToStacks } from '@/lib/roulette/betToChip';

type Level = 1 | 2 | 3;

const LEVEL_CONFIG: Record<
  Level,
  { title: string; timeSec: number; options: TaskOptions }
> = {
  1: {
    title: 'Easy',
    timeSec: 60,
    options: { minBets: 3, maxBets: 5, minChips: 1, maxChips: 4 },
  },
  2: {
    title: 'Medium',
    timeSec: 75,
    options: { minBets: 5, maxBets: 8, minChips: 1, maxChips: 10 },
  },
  3: {
    title: 'Hard',
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

  useEffect(() => () => stopTimer(), []);

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
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(30);
    } else if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 30, 40]);
    }
  };

  const nextTask = () => createTask(level);

  // ===================== MENU =====================
  if (screen === 'menu') {
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
              onClick={() => router.push('/')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
            >
              <ArrowLeft size={22} />
            </button>
          </div>
        </header>

        <main className="page-inner" style={{ paddingTop: 32, paddingBottom: 40 }}>
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <Trophy size={40} style={{ color: 'var(--primary)', marginBottom: 12 }} />
            <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px' }}>Payout Trainer</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 15, margin: 0 }}>
              Calculate chips for covered winning numbers
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {(Object.keys(LEVEL_CONFIG) as unknown as Level[]).map((id) => (
              <button
                key={id}
                onClick={() => startLevel(id)}
                className="mode-card"
                style={{ textAlign: 'center', fontSize: 20, fontWeight: 700, padding: 20 }}
              >
                {LEVEL_CONFIG[id].title}
              </button>
            ))}
          </div>
        </main>
      </div>
    );
  }

  // ===================== PLAY =====================
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
              {LEVEL_CONFIG[level].title} · {attempts}
            </div>
          </div>
        </div>
      </header>

      <main
        className="page-inner"
        style={{
          flex: 1,
          paddingTop: 20,
          paddingBottom: 'calc(22vh + 24px)',
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
								boxSizing: 'border-box',
								background: 'var(--card-front)',
								borderRadius: 'var(--radius-card)',
								padding: '24px 18px',
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
								<span style={{ color: 'var(--number-red, #dc2626)' }}>{task.winningNumber}</span>
							</div>

							<div style={{ fontSize: 14, lineHeight: 1.7, textAlign: 'center', marginBottom: 16 }}>
								{task.bets?.map((b, i) => (
									<div key={i}>
										{b.count} × {b.type} on {b.positions}
									</div>
								))}
							</div>

							{/* Diagram */}
							<div style={{ marginTop: 8 }}>
								<ComboDiagram
									family={familyFromNumber(task.winningNumber)}
									chips={betsToStacks(task.winningNumber, task.bets || []).map((s) => ({
										pos: s.pos,
										label: s.label,
									}))}
									size={260}
								/>
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
                boxSizing: 'border-box',
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
                  boxSizing: 'border-box',
                  padding: 14,
                  borderRadius: 14,
                  textAlign: 'center',
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

      <div className="keypad-dock">
        <div className="keypad-dock-inner">
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