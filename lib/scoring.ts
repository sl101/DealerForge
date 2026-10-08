/** Leaderboard scoring — Payout + Neighbors Timed only */

export type ScoreMode =
  | 'payout_l1'
  | 'payout_l2'
  | 'payout_l3'
  | 'neighbors_1_1'
  | 'neighbors_2_2';

export type SessionStats = {
  mode: ScoreMode;
  correct: number;
  attempts: number;
  /** Accumulated speed bonus (already summed per correct answer) */
  speedBonus: number;
};

const DIFFICULTY: Record<ScoreMode, number> = {
  payout_l1: 1,
  payout_l2: 1.25,
  payout_l3: 1.5,
  neighbors_1_1: 1,
  neighbors_2_2: 1.25,
};

/** Per-task speed for Payout: min(timeLeft, 15) */
export function payoutSpeedBonus(timeLeftSec: number): number {
  return Math.max(0, Math.min(15, Math.floor(timeLeftSec)));
}

/**
 * Per-answer speed for Neighbors Timed.
 * hintPenalty: 1 (no hints) | 0.5 (1 hint) | 0.25 (2+)
 */
export function neighborsSpeedBonus(
  timeLeftSec: number,
  sessionDurationSec: number,
  hintPenalty: number
): number {
  const duration = Math.max(1, sessionDurationSec);
  const ratio = Math.max(0, Math.min(1, timeLeftSec / duration));
  return Math.round(ratio * 8 * hintPenalty);
}

export function hintPenaltyFromRevealed(revealedCount: number): number {
  if (revealedCount <= 0) return 1;
  if (revealedCount === 1) return 0.5;
  return 0.25;
}

export function calcSessionPoints(stats: SessionStats): number {
  const correct = Math.max(0, Math.floor(stats.correct));
  const attempts = Math.max(0, Math.floor(stats.attempts));
  const speedBonus = Math.max(0, stats.speedBonus);

  const base = correct * 10;
  const accuracy = correct / Math.max(attempts, 1);
  const accBonus = Math.round(accuracy * correct * 5);
  const difficulty = DIFFICULTY[stats.mode] ?? 1;

  return Math.max(0, Math.round((base + accBonus) * difficulty + speedBonus));
}

/** Anti-abuse: skip tiny sessions */
export function shouldRecord(points: number, attempts: number): boolean {
  return attempts >= 3 || points >= 10;
}

export function payoutModeFromLevel(level: 1 | 2 | 3): ScoreMode {
  if (level === 2) return 'payout_l2';
  if (level === 3) return 'payout_l3';
  return 'payout_l1';
}

export function neighborsModeFromDepth(depth: '1/1' | '2/2'): ScoreMode {
  return depth === '2/2' ? 'neighbors_2_2' : 'neighbors_1_1';
}
