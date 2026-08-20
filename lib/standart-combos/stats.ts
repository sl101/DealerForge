import { ComboStats } from './types';

const KEY = 'standart_combos_stats_v1';

export function loadComboStats(): Record<string, ComboStats> {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveComboStats(stats: Record<string, ComboStats>) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(KEY, JSON.stringify(stats));
}

export function updateComboStat(
  stats: Record<string, ComboStats>,
  id: string,
  asKnown: boolean
): Record<string, ComboStats> {
  const prev = stats[id] || {
    known: false,
    ease: 0,
    reps: 0,
    correct: 0,
    wrong: 0,
  };
  const next: ComboStats = {
    ...prev,
    known: asKnown,
    reps: prev.reps + 1,
    correct: prev.correct + (asKnown ? 1 : 0),
    wrong: prev.wrong + (asKnown ? 0 : 1),
    ease: asKnown ? Math.min(5, prev.ease + 1) : Math.max(0, prev.ease - 1),
  };
  const merged = { ...stats, [id]: next };
  saveComboStats(merged);
  return merged;
}