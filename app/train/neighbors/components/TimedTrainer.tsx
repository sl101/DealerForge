'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Timer, Lightbulb } from 'lucide-react';
import {
  NEIGHBOR_CARDS,
  NeighborCard,
  Depth,
  NumberStats,
  loadStats,
  updateStat,
  getNumberColor,
} from '@/lib/neighbors';
import NumericKeypad from '@/components/ui/NumericKeypad';

interface TimedTrainerProps {
  onBack: () => void;
}

const BEST_SCORE_KEY = 'neighbors_timed_best_score';
const LONGEST_STREAK_KEY = 'neighbors_timed_longest_streak';

export default function TimedTrainer({ onBack }: TimedTrainerProps) {
  const [depth, setDepth] = useState<Depth>('1/1');
  const [cards, setCards] = useState<NeighborCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [timeLeft, setTimeLeft] = useState(45);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [stats, setStats] = useState<Record<number, NumberStats>>({});
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const [currentStreak, setCurrentStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [isNewRecord, setIsNewRecord] = useState(false);

  const [hintsLeft, setHintsLeft] = useState(2);
  const [revealed, setRevealed] = useState<number[]>([]);
  const [shake, setShake] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setStats(loadStats());
    setBestScore(Number(localStorage.getItem(BEST_SCORE_KEY) || 0));
    setLongestStreak(Number(localStorage.getItem(LONGEST_STREAK_KEY) || 0));
  }, []);

  const startSession = () => {
    const shuffled = [...NEIGHBOR_CARDS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setCurrentStreak(0);
    setTimeLeft(45);
    setFeedback(null);
    setUserInput('');
    setIsNewRecord(false);
    setHintsLeft(2);
    setRevealed([]);
    setIsRunning(true);
    setIsPaused(false);
    setTimeout(() => inputRef.current?.focus(), 300);
  };

  useEffect(() => {
    if (!isRunning || isPaused) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRunning, isPaused]);

  useEffect(() => {
    if (!isRunning && timeLeft === 0 && score > 0) {
      if (score > bestScore) {
        setBestScore(score);
        localStorage.setItem(BEST_SCORE_KEY, String(score));
        setIsNewRecord(true);
      }
    }
  }, [isRunning, timeLeft, score, bestScore]);

  const currentCard = cards[currentIndex];

  const getCorrectNeighbors = (card: NeighborCard) =>
    depth === '1/1' ? card.neighbors1 : card.neighbors2;

  const normalizeAnswer = (str: string) =>
    str
      .split(/[\s,.-]+/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter((n) => !isNaN(n));

  const vibrate = (pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  };

  const handleSubmit = () => {
    if (!currentCard || !userInput.trim() || feedback) return;

    const correct = getCorrectNeighbors(currentCard);
    const userNums = normalizeAnswer(userInput);
    const userSorted = [...userNums].sort((a, b) => a - b);
    const correctSorted = [...correct].sort((a, b) => a - b);

    const isOk =
      userSorted.length === correctSorted.length &&
      userSorted.every((n, i) => n === correctSorted[i]);

    if (isOk) {
      vibrate(30);
      setFeedback('correct');
      setIsPaused(true);

      const hintPenalty = revealed.length === 0 ? 1 : revealed.length === 1 ? 0.5 : 0.25;
      const points = Math.max(8, Math.floor(timeLeft * 1.5 * hintPenalty));
      setScore((prev) => prev + points);

      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > longestStreak) {
        setLongestStreak(newStreak);
        localStorage.setItem(LONGEST_STREAK_KEY, String(newStreak));
      }

      updateStat(stats, currentCard.number, true);
      setStats({ ...stats });

      setTimeout(() => {
        setFeedback(null);
        setUserInput('');
        setRevealed([]);
        setIsPaused(false);

        if (currentIndex < cards.length - 1) {
          setCurrentIndex((prev) => prev + 1);
        } else {
          setCards([...NEIGHBOR_CARDS].sort(() => Math.random() - 0.5));
          setCurrentIndex(0);
        }
        setTimeout(() => inputRef.current?.focus(), 100);
      }, 1100);
    } else {
      vibrate([40, 30, 40]);
      const kept = userNums.filter((n) => correct.includes(n));
      const uniqueKept = Array.from(new Set([...kept, ...revealed]));
      setUserInput(uniqueKept.join(' ') + (uniqueKept.length ? ' ' : ''));
      setFeedback('wrong');
      setShake(true);
      setCurrentStreak(0);

      setTimeout(() => {
        setShake(false);
        setFeedback(null);
        inputRef.current?.focus();
      }, 600);

      updateStat(stats, currentCard.number, false);
      setStats({ ...stats });
    }
  };

  const useHint = () => {
    if (!currentCard || hintsLeft <= 0 || feedback) return;

    const correct = getCorrectNeighbors(currentCard);
    const missing = correct.filter(
      (n) => !revealed.includes(n) && !normalizeAnswer(userInput).includes(n)
    );
    if (missing.length === 0) return;

    const hintNum = missing[Math.floor(Math.random() * missing.length)];
    const newRevealed = [...revealed, hintNum];
    setRevealed(newRevealed);
    setHintsLeft((prev) => prev - 1);

    const merged = Array.from(new Set([...normalizeAnswer(userInput), ...newRevealed]));
    // trailing space so next digit starts a new number
    setUserInput(merged.join(' ') + ' ');
  };

  if (!isRunning && cards.length === 0) {
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
            <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Timed Input</h1>
          </div>
        </header>

        <main className="page-inner" style={{ paddingTop: 40, textAlign: 'center' }}>
          <Timer size={48} style={{ color: 'var(--primary)', marginBottom: 20 }} />
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Timed Challenge</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Type the neighbors as fast as you can
          </p>

          {(bestScore > 0 || longestStreak > 0) && (
            <div
              style={{
                background: 'rgba(255,255,255,0.05)',
                borderRadius: 16,
                padding: '14px 20px',
                marginBottom: 28,
                fontSize: 14,
                color: 'var(--text-muted)',
              }}
            >
              {bestScore > 0 && (
                <div>
                  Best Score: <strong style={{ color: 'var(--primary)' }}>{bestScore}</strong>
                </div>
              )}
              {longestStreak > 0 && (
                <div style={{ marginTop: 4 }}>
                  Longest Streak:{' '}
                  <strong style={{ color: 'var(--primary)' }}>{longestStreak}</strong>
                </div>
              )}
            </div>
          )}

          <div className="segmented" style={{ maxWidth: 200, margin: '0 auto 32px' }}>
            <button className={depth === '1/1' ? 'active' : ''} onClick={() => setDepth('1/1')}>
              1/1
            </button>
            <button className={depth === '2/2' ? 'active' : ''} onClick={() => setDepth('2/2')}>
              2/2
            </button>
          </div>

          <button
            onClick={startSession}
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
        {isNewRecord && (
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>
            New Record!
          </div>
        )}
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Time&apos;s up!</h2>
        <p style={{ fontSize: 28, color: 'var(--primary)', marginBottom: 8 }}>Score: {score}</p>
        <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>
          Best: {Math.max(bestScore, score)}
        </p>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>
          Longest streak: {longestStreak}
        </p>

        <button
          onClick={startSession}
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

  if (!currentCard) return null;

  const cardClass = [
    feedback === 'correct' ? 'pop card-glow-correct' : '',
    shake ? 'shake card-glow-wrong' : '',
  ]
    .filter(Boolean)
    .join(' ');

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

          <div
            style={{
              display: 'flex',
              gap: 12,
              fontSize: 14,
              fontWeight: 600,
              alignItems: 'center',
            }}
          >
            <span style={{ color: 'var(--primary)' }}>{timeLeft}s</span>
            <span>Score: {score}</span>
            {currentStreak > 0 && (
              <span style={{ color: 'var(--success)' }}>🔥 {currentStreak}</span>
            )}
          </div>
        </div>
      </header>

      <main
        className="page-inner"
        style={{ flex: 1, paddingTop: 16, paddingBottom: 'calc(22vh + 28px)' }}
      >
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
          <button
            onClick={useHint}
            disabled={hintsLeft <= 0 || !!feedback}
            style={{
              padding: '8px 14px',
              borderRadius: 14,
              border: '1px solid var(--border)',
              background: hintsLeft > 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
              color: hintsLeft > 0 ? 'var(--text)' : 'var(--text-muted)',
              cursor: hintsLeft > 0 ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              fontSize: 13,
            }}
          >
            <Lightbulb size={15} /> Hint · {hintsLeft}
          </button>
        </div>

        <div
          className={cardClass}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'var(--card-front)',
            borderRadius: 'var(--radius-card)',
            padding: '32px 18px',
            textAlign: 'center',
            marginBottom: 16,
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            transition: 'box-shadow 0.2s',
            minHeight: 140,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--card-text-muted)', marginBottom: 12 }}>
            {depth} • Type the neighbors
          </div>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              color: getNumberColor(currentCard.number),
            }}
          >
            {currentCard.number}
          </div>
        </div>

        <input
          ref={inputRef}
          type="text"
          readOnly
          inputMode="none"
          value={userInput}
          placeholder="e.g. 10 24"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '16px 18px',
            fontSize: 22,
            fontWeight: 600,
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
      </main>

      <div className="keypad-dock">
        <div className="keypad-dock-inner">
          <NumericKeypad
            disabled={feedback === 'correct'}
            onDigit={(d) => setUserInput((prev) => prev + d)}
            onBackspace={() => setUserInput((prev) => prev.slice(0, -1))}
            onSpace={() => setUserInput((prev) => prev + ' ')}
            onEnter={handleSubmit}
          />
        </div>
      </div>
    </div>
  );
}