import { FactStats } from './types';

const KEY = 'multiplication_stats_v1';
const STREAK_KEY = 'multiplication_longest_streak';
const BEST_TIMED_KEY = 'multiplication_timed_best';

export function loadStats(): Record<string, FactStats> {
  if (typeof window === 'undefined') return {};
  try {
    return JSON.parse(localStorage.getItem(KEY) || '{}');
  } catch {
    return {};
  }
}

export function saveStats(stats: Record<string, FactStats>) {
  localStorage.setItem(KEY, JSON.stringify(stats));
}

export function updateFactStat(
  stats: Record<string, FactStats>,
  id: string,
  correct: boolean
): Record<string, FactStats> {
  const prev = stats[id] || {
    correct: 0,
    wrong: 0,
    streak: 0,
    lastSeen: 0,
    ease: 2.5,
  };

  const next: FactStats = {
    ...prev,
    lastSeen: Date.now(),
    correct: prev.correct + (correct ? 1 : 0),
    wrong: prev.wrong + (correct ? 0 : 1),
    streak: correct ? prev.streak + 1 : 0,
    ease: correct
      ? Math.min(3.2, prev.ease + 0.05)
      : Math.max(1.3, prev.ease - 0.2),
  };

  const updated = { ...stats, [id]: next };
  saveStats(updated);
  return updated;
}

export function getLongestStreak(): number {
  return Number(localStorage.getItem(STREAK_KEY) || 0);
}

export function setLongestStreak(n: number) {
  localStorage.setItem(STREAK_KEY, String(n));
}

export function getTimedBest(): number {
  return Number(localStorage.getItem(BEST_TIMED_KEY) || 0);
}

export function setTimedBest(n: number) {
  localStorage.setItem(BEST_TIMED_KEY, String(n));
}