'use client';

import { useCallback, useEffect, useRef } from 'react';
import { recordSessionScore } from '@/lib/recordScore';
import type { ScoreMode, SessionStats } from '@/lib/scoring';

type Acc = {
  mode: ScoreMode;
  correct: number;
  attempts: number;
  speedBonus: number;
};

/**
 * Accumulates session stats and flushes once (back / unmount / timer end).
 */
export function useSessionScore(isAuthenticated: boolean) {
  const acc = useRef<Acc | null>(null);
  const flushed = useRef(false);

  const begin = useCallback((mode: ScoreMode) => {
    acc.current = {
      mode,
      correct: 0,
      attempts: 0,
      speedBonus: 0,
    };
    flushed.current = false;
  }, []);

  const reset = useCallback(() => {
    acc.current = null;
    flushed.current = false;
  }, []);

  const noteAttempt = useCallback(
    (opts: { correct: boolean; speedBonus?: number }) => {
      if (!acc.current) return;
      acc.current.attempts += 1;
      if (opts.correct) {
        acc.current.correct += 1;
        acc.current.speedBonus += Math.max(0, opts.speedBonus ?? 0);
      }
    },
    []
  );

  const getSnapshot = useCallback((): SessionStats | null => {
    if (!acc.current) return null;
    return { ...acc.current };
  }, []);

  const flush = useCallback(async () => {
    if (flushed.current || !acc.current) return;
    flushed.current = true;
    const stats: SessionStats = { ...acc.current };
    await recordSessionScore(stats, isAuthenticated);
  }, [isAuthenticated]);

  // Flush if user navigates away without explicit back
  useEffect(() => {
    return () => {
      if (!flushed.current && acc.current && acc.current.attempts > 0) {
        flushed.current = true;
        const stats: SessionStats = { ...acc.current };
        void recordSessionScore(stats, isAuthenticated);
      }
    };
  }, [isAuthenticated]);

  return { begin, reset, noteAttempt, getSnapshot, flush };
}
