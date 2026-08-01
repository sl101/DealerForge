import { NumberStats } from './types';

const STORAGE_KEY = 'neighbors_stats_v1';

export function loadStats(): Record<number, NumberStats> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveStats(stats: Record<number, NumberStats>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
}

export function getOrCreateStat(
  stats: Record<number, NumberStats>,
  num: number
): NumberStats {
  if (!stats[num]) {
    stats[num] = {
      number: num,
      correct: 0,
      wrong: 0,
      ease: 2.5,
      interval: 0,
      nextReview: Date.now(),
      lastSeen: 0,
    };
  }
  return stats[num];
}

export function updateStat(
  stats: Record<number, NumberStats>,
  num: number,
  knew: boolean
) {
  const s = getOrCreateStat(stats, num);
  s.lastSeen = Date.now();

  if (knew) {
    s.correct += 1;
    s.ease = Math.min(3.0, s.ease + 0.1);
    s.interval = s.interval === 0 ? 1 : Math.round(s.interval * s.ease);
  } else {
    s.wrong += 1;
    s.ease = Math.max(1.3, s.ease - 0.2);
    s.interval = 0;
  }

  s.nextReview = Date.now() + s.interval * 24 * 60 * 60 * 1000;
  saveStats(stats);
}