'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type LeaderboardRow = {
  id?: string;
  user_id?: string;
  score?: number;
  tasks_solved?: number;
  accuracy?: number;
  profiles?: { display_name?: string | null } | null;
};

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    setError(null);

    try {
      let { data, error: queryError } = await supabase
        .from('leaderboard')
        .select(
          'id, user_id, score, tasks_solved, accuracy, profiles(display_name)'
        )
        .order('score', { ascending: false })
        .limit(50);

      if (queryError) {
        const fallback = await supabase
          .from('leaderboard')
          .select('id, user_id, score, tasks_solved, accuracy')
          .order('score', { ascending: false })
          .limit(50);

        if (fallback.error) {
          setError(fallback.error.message);
          setLeaderboard([]);
          return;
        }
        data = fallback.data as LeaderboardRow[];
      }

      setLeaderboard((data as LeaderboardRow[]) || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const displayName = (entry: LeaderboardRow, index: number) => {
    const name = entry.profiles?.display_name?.trim();
    if (name) return name;
    if (entry.user_id) return `Player ${entry.user_id.slice(0, 6)}`;
    return `Player ${index + 1}`;
  };

  return (
    <div className="page-shell">
      <header className="page-header">
        <div
          className="page-inner"
          style={{ paddingTop: 16, paddingBottom: 16 }}
        >
          <h1
            style={{
              fontSize: 20,
              fontWeight: 600,
              margin: 0,
              textAlign: 'center',
              color: 'var(--text)',
            }}
          >
            Global Leaderboard
          </h1>
        </div>
      </header>

      <main
        className="page-inner"
        style={{ flex: 1, paddingTop: 24, paddingBottom: 40 }}
      >
        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '48px 0' }}>
            Loading leaderboard...
          </p>
        )}

        {error && (
          <div
            className="glass"
            style={{
              borderRadius: 24,
              padding: 24,
              border: '1px solid var(--border)',
              color: 'var(--error)',
              textAlign: 'center',
            }}
          >
            Error: {error}
          </div>
        )}

        {!loading && !error && leaderboard.length === 0 && (
          <div
            className="glass"
            style={{
              borderRadius: 24,
              padding: 32,
              border: '1px solid var(--border)',
              textAlign: 'center',
              color: 'var(--text-muted)',
            }}
          >
            No results yet. Be the first on the leaderboard!
          </div>
        )}

        {!loading &&
          !error &&
          leaderboard.map((entry, index) => (
            <div
              key={entry.id || entry.user_id || index}
              className="glass"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 16,
                borderRadius: 24,
                padding: 20,
                marginBottom: 12,
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: 48,
                  flexShrink: 0,
                  textAlign: 'center',
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--primary)',
                }}
              >
                #{index + 1}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{
                    fontWeight: 600,
                    color: 'var(--text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {displayName(entry, index)}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
                  {entry.tasks_solved || 0} tasks · {entry.accuracy ?? 0}%
                </div>
              </div>
              <div
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  color: 'var(--primary)',
                }}
              >
                {entry.score || 0}
              </div>
            </div>
          ))}
      </main>
    </div>
  );
}