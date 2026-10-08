import { supabase } from '@/lib/supabase';
import {
  calcSessionPoints,
  shouldRecord,
  type SessionStats,
} from '@/lib/scoring';

export type RecordResult =
  | { ok: true; points: number; skipped?: boolean }
  | { ok: false; error: string };

/**
 * Persist one training session. Safe for guests (no-op).
 * Call once when the user leaves the training screen or timer ends.
 */
export async function recordSessionScore(
  stats: SessionStats,
  isAuthenticated: boolean
): Promise<RecordResult> {
  if (!isAuthenticated) {
    return { ok: true, points: 0, skipped: true };
  }

  const points = calcSessionPoints(stats);
  const attempts = Math.max(0, Math.floor(stats.attempts));
  const correct = Math.max(0, Math.floor(stats.correct));

  if (!shouldRecord(points, attempts)) {
    return { ok: true, points, skipped: true };
  }

  const { data, error } = await supabase.rpc('record_score_event', {
    p_points: points,
    p_mode: stats.mode,
    p_correct: correct,
    p_attempts: attempts,
  });

  if (error) {
    console.error('record_score_event', error);
    return { ok: false, error: error.message };
  }

  return {
    ok: true,
    points: typeof data?.points === 'number' ? data.points : points,
  };
}
