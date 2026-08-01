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
  const [revealed, setRevealed] = useState<number[]>([]); // hinted numbers
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

  // Timer
  useEffect(() => {
    if (!isRunning || isPaused) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
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

  // New record check
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

  const getCorrectNeighbors = (card: NeighborCard) => {
    return depth === '1/1' ? card.neighbors1 : card.neighbors2;
  };

  const normalizeAnswer = (str: string) => {
    return str
      .split(/[\s,.-]+/)
      .map(s => s.trim())
      .filter(Boolean)
      .map(Number)
      .filter(n => !isNaN(n));
  };

  const handleSubmit = () => {
    if (!currentCard || !userInput.trim() || feedback) return;

    const correct = getCorrectNeighbors(currentCard);
    const userNums = normalizeAnswer(userInput);

    // Check full match (order independent)
    const userSorted = [...userNums].sort((a, b) => a - b);
    const correctSorted = [...correct].sort((a, b) => a - b);

    const isOk =
      userSorted.length === correctSorted.length &&
      userSorted.every((n, i) => n === correctSorted[i]);

    if (isOk) {
      // SUCCESS
      setFeedback('correct');
      setIsPaused(true);

      const hintPenalty = revealed.length === 0 ? 1 : revealed.length === 1 ? 0.5 : 0.25;
      const points = Math.max(8, Math.floor(timeLeft * 1.5 * hintPenalty));
      setScore(prev => prev + points);

      const newStreak = currentStreak + 1;
      setCurrentStreak(newStreak);
      if (newStreak > longestStreak) {
        setLongestStreak(newStreak);
        localStorage.setItem(LONGEST_STREAK_KEY, String(newStreak));
      }

      updateStat(stats, currentCard.number, true);
      setStats({ ...stats });

      // Auto next after short pause
      setTimeout(() => {
        setFeedback(null);
        setUserInput('');
        setRevealed([]);
        setIsPaused(false);

        if (currentIndex < cards.length - 1) {
          setCurrentIndex(prev => prev + 1);
        } else {
          const shuffled = [...NEIGHBOR_CARDS].sort(() => Math.random() - 0.5);
          setCards(shuffled);
          setCurrentIndex(0);
        }
        setTimeout(() => inputRef.current?.focus(), 100);
      }, 1100);
    } else {
      // WRONG — keep correct numbers, remove wrong ones
      const kept = userNums.filter(n => correct.includes(n));
      // also keep already revealed hints
      const uniqueKept = Array.from(new Set([...kept, ...revealed]));

      setUserInput(uniqueKept.join(' '));
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
    const missing = correct.filter(n => !revealed.includes(n) && !normalizeAnswer(userInput).includes(n));

    if (missing.length === 0) return;

    const hintNum = missing[Math.floor(Math.random() * missing.length)];
    const newRevealed = [...revealed, hintNum];
    setRevealed(newRevealed);
    setHintsLeft(prev => prev - 1);

    // Add hint into input
    const currentNums = normalizeAnswer(userInput);
    const merged = Array.from(new Set([...currentNums, ...newRevealed]));
    setUserInput(merged.join(' '));
    inputRef.current?.focus();
  };

  // ===================== START SCREEN =====================
  if (!isRunning && cards.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
        <header style={{
          position: 'sticky', top: 0, zIndex: 50,
          backgroundColor: 'rgba(26,26,46,0.9)', borderBottom: '1px solid var(--border)',
          backdropFilter: 'blur(12px)'
        }}>
          <div style={{ maxWidth: 512, margin: '0 auto', padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
              <ArrowLeft size={22} />
            </button>
            <h1 style={{ fontSize: 20, fontWeight: 600, margin: 0 }}>Timed Input</h1>
          </div>
        </header>

        <main style={{ maxWidth: 512, margin: '0 auto', padding: '40px 20px', textAlign: 'center' }}>
          <Timer size={48} style={{ color: 'var(--primary)', marginBottom: 20 }} />
          <h2 style={{ fontSize: 28, fontWeight: 700, marginBottom: 12 }}>Timed Challenge</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>
            Type the neighbors as fast as you can
          </p>

          {(bestScore > 0 || longestStreak > 0) && (
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 16,
              padding: '14px 20px',
              marginBottom: 28,
              fontSize: 14,
              color: 'var(--text-muted)',
            }}>
              {bestScore > 0 && <div>Best Score: <strong style={{ color: 'var(--primary)' }}>{bestScore}</strong></div>}
              {longestStreak > 0 && <div style={{ marginTop: 4 }}>Longest Streak: <strong style={{ color: 'var(--primary)' }}>{longestStreak}</strong></div>}
            </div>
          )}

          <div className="segmented" style={{ maxWidth: 200, margin: '0 auto 32px' }}>
            <button className={depth === '1/1' ? 'active' : ''} onClick={() => setDepth('1/1')}>1/1</button>
            <button className={depth === '2/2' ? 'active' : ''} onClick={() => setDepth('2/2')}>2/2</button>
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

  // ===================== FINISHED =====================
  if (!isRunning && timeLeft === 0) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20
      }}>
        {isNewRecord && (
          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)', marginBottom: 12 }}>
            🎉 New Record!
          </div>
        )}
        <h2 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>Time's up!</h2>
        <p style={{ fontSize: 28, color: 'var(--primary)', marginBottom: 8 }}>Score: {score}</p>
        <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>Best: {Math.max(bestScore, score)}</p>
        <p style={{ color: 'var(--text-muted)', marginBottom: 32 }}>Longest streak: {longestStreak}</p>

        <button
          onClick={startSession}
          style={{
            background: 'var(--primary)', color: '#000', fontWeight: 700,
            padding: '14px 36px', borderRadius: 16, border: 'none', cursor: 'pointer', marginBottom: 12
          }}
        >
          Play again
        </button>
        <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          Back to menu
        </button>
      </div>
    );
  }

  // ===================== GAME =====================
  if (!currentCard) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-6px); }
          40% { transform: translateX(6px); }
          60% { transform: translateX(-4px); }
          80% { transform: translateX(4px); }
        }
        @keyframes pop {
          0% { transform: scale(1); }
          40% { transform: scale(1.04); }
          100% { transform: scale(1); }
        }
        .shake { animation: shake 0.45s ease-in-out; }
        .pop { animation: pop 0.35s ease; }
      `}</style>

      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        backgroundColor: 'rgba(26,26,46,0.9)', borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)'
      }}>
        <div style={{ maxWidth: 512, margin: '0 auto', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
            <ArrowLeft size={20} />
          </button>

          <div style={{ display: 'flex', gap: 12, fontSize: 14, fontWeight: 600, alignItems: 'center' }}>
            <span style={{ color: 'var(--primary)' }}>{timeLeft}s</span>
            <span>Score: {score}</span>
            {currentStreak > 0 && <span style={{ color: 'var(--success)' }}>🔥 {currentStreak}</span>}
          </div>
        </div>
      </header>

      <main style={{ maxWidth: 512, margin: '0 auto', padding: '28px 16px' }}>
        {/* Card */}
        <div
          className={feedback === 'correct' ? 'pop' : shake ? 'shake' : ''}
          style={{
            background: feedback === 'correct'
              ? 'rgba(16,185,129,0.15)'
              : feedback === 'wrong'
              ? 'rgba(239,68,68,0.12)'
              : 'var(--card-front)',
            borderRadius: 'var(--radius-card)',
            padding: '36px 20px',
            textAlign: 'center',
            marginBottom: 24,
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            transition: 'background 0.2s',
          }}
        >
          <div style={{ fontSize: 13, color: 'var(--card-text-muted)', marginBottom: 12 }}>
            {depth} • Type the neighbors
          </div>
          <div style={{ fontSize: 72, fontWeight: 800, color: getNumberColor(currentCard.number) }}>
            {currentCard.number}
          </div>

          {revealed.length > 0 && (
            <div style={{ marginTop: 12, fontSize: 15, color: 'var(--card-text-muted)' }}>
              Hint: {revealed.join('  ')}
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !feedback) handleSubmit();
          }}
          placeholder="e.g. 10 24"
          disabled={!!feedback && feedback === 'correct'}
          style={{
            width: '100%',
            padding: '18px 20px',
            fontSize: 22,
            fontWeight: 600,
            textAlign: 'center',
            borderRadius: 16,
            border: feedback === 'wrong'
              ? '2px solid var(--error)'
              : feedback === 'correct'
              ? '2px solid var(--success)'
              : '2px solid var(--border)',
            background: 'rgba(255,255,255,0.05)',
            color: 'white',
            outline: 'none',
            marginBottom: 16,
          }}
        />

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={useHint}
            disabled={hintsLeft <= 0 || !!feedback}
            style={{
              flex: '0 0 auto',
              padding: '14px 16px',
              borderRadius: 16,
              border: '1px solid var(--border)',
              background: hintsLeft > 0 ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
              color: hintsLeft > 0 ? 'var(--text)' : 'var(--text-muted)',
              cursor: hintsLeft > 0 ? 'pointer' : 'default',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              fontWeight: 600,
              fontSize: 14,
            }}
          >
            <Lightbulb size={16} /> {hintsLeft}
          </button>

          <button
            onClick={handleSubmit}
            disabled={!userInput.trim() || !!feedback}
            style={{
              flex: 1,
              padding: 16,
              borderRadius: 16,
              border: 'none',
              background: userInput.trim() && !feedback ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
              color: userInput.trim() && !feedback ? '#000' : 'rgba(255,255,255,0.4)',
              fontWeight: 700,
              fontSize: 17,
              cursor: userInput.trim() && !feedback ? 'pointer' : 'default',
            }}
          >
            {feedback === 'correct' ? 'Correct!' : 'Submit'}
          </button>
        </div>
      </main>
    </div>
  );
}