'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

type Period = 'all' | 'week' | 'today';

type Row = {
  rank: number;
  user_id: string;
  display_name: string;
  score: number;
  tasks_solved: number;
  accuracy: number | null;
};

type MyRank = {
  rank: number;
  user_id: string;
  display_name: string;
  score: number;
  tasks_solved: number;
};

const PAGE = 10;

function Medal({ rank }: { rank: number }) {
  if (rank > 3) {
    return (
      <span
        style={{
          fontSize: 13,
          fontWeight: 700,
          color: 'var(--primary)',
          minWidth: 28,
          textAlign: 'center',
        }}
      >
        #{rank}
      </span>
    );
  }

  const fill =
    rank === 1 ? '#F5C542' : rank === 2 ? '#C0C7D1' : '#CD7F32';
  const leaf =
    rank === 1 ? '#E8B923' : rank === 2 ? '#A8B0BC' : '#B8732D';

  return (
    <svg width="36" height="36" viewBox="0 0 64 64" aria-hidden>
      {/* left laurel */}
      <path
        d="M28 12c-6 4-10 12-10 20 0 2 0 4 1 6-4-2-7-7-7-13 0-8 5-15 10-18z"
        fill={leaf}
        opacity="0.9"
      />
      <path
        d="M26 18c-4 3-7 9-7 14 1-5 4-10 7-13z"
        fill={leaf}
      />
      {/* right laurel */}
      <path
        d="M36 12c6 4 10 12 10 20 0 2 0 4-1 6 4-2 7-7 7-13 0-8-5-15-10-18z"
        fill={leaf}
        opacity="0.9"
      />
      <path
        d="M38 18c4 3 7 9 7 14-1-5-4-10-7-13z"
        fill={leaf}
      />
      {/* medal disc */}
      <circle cx="32" cy="34" r="14" fill={fill} />
      <circle
        cx="32"
        cy="34"
        r="12"
        fill="none"
        stroke="rgba(0,0,0,0.2)"
        strokeWidth="1.5"
      />
      <text
        x="32"
        y="38"
        textAnchor="middle"
        fontSize="11"
        fontWeight="700"
        fontFamily="system-ui,sans-serif"
        fill="#1a1a2e"
      >
        #{rank}
      </text>
    </svg>
  );
}

function Avatar({ name }: { name: string }) {
  const letter = (name?.trim()?.[0] || '?').toUpperCase();
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: '50%',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(103, 232, 249, 0.12)',
        border: '1px solid rgba(103, 232, 249, 0.25)',
        color: 'var(--primary)',
        fontWeight: 700,
        fontSize: 14,
      }}
    >
      {letter}
    </div>
  );
}

function RankRow({
  rank,
  name,
  score,
  tasks,
  accuracy,
  highlight,
  sticky,
}: {
  rank: number;
  name: string;
  score: number;
  tasks?: number;
  accuracy?: number | null;
  highlight?: boolean;
  sticky?: boolean;
}) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: sticky ? '12px 14px' : '12px 4px',
        marginBottom: sticky ? 0 : 2,
        borderRadius: sticky ? 16 : 12,
        border: highlight ? '1px solid var(--primary)' : '1px solid transparent',
        background: highlight
          ? 'rgba(103, 232, 249, 0.08)'
          : 'transparent',
        boxShadow: highlight
          ? '0 0 0 1px rgba(103, 232, 249, 0.15)'
          : undefined,
      }}
    >
      <div
        style={{
          width: 32,
          display: 'flex',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <Medal rank={rank} />
      </div>

      <Avatar name={name} />

      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontWeight: 600,
            fontSize: 15,
            color: 'var(--text)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {name}
        </div>
        {(tasks != null || accuracy != null) && (
          <div
            style={{
              fontSize: 12,
              color: 'var(--text-muted)',
              marginTop: 2,
            }}
          >
            {tasks != null ? `${tasks} tasks` : ''}
            {tasks != null && accuracy != null ? ' · ' : ''}
            {accuracy != null ? `${accuracy}%` : ''}
          </div>
        )}
      </div>

      <div
        style={{
          fontWeight: 700,
          fontSize: 15,
          color: 'var(--primary)',
          flexShrink: 0,
        }}
      >
        {score.toLocaleString()}
        <span
          style={{
            fontWeight: 500,
            fontSize: 12,
            marginLeft: 4,
            opacity: 0.8,
          }}
        >
          pts
        </span>
      </div>
    </div>
  );
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState<Period>('all');
  const [rows, setRows] = useState<Row[]>([]);
  const [my, setMy] = useState<MyRank | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadPage = useCallback(
    async (nextOffset: number, replace: boolean) => {
      if (replace) {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      try {
        const { data, error: rpcError } = await supabase.rpc(
          'get_leaderboard_page',
          {
            p_period: period,
            p_limit: PAGE,
            p_offset: nextOffset,
          }
        );

        if (rpcError) throw rpcError;

        const mapped: Row[] = (data || []).map(
          (r: {
            rank: number;
            user_id: string;
            display_name: string;
            score: number;
            tasks_solved: number;
            accuracy: number | null;
          }) => ({
            rank: Number(r.rank),
            user_id: r.user_id,
            display_name: r.display_name || 'Player',
            score: Number(r.score),
            tasks_solved: Number(r.tasks_solved || 0),
            accuracy: r.accuracy == null ? null : Number(r.accuracy),
          })
        );

        setRows((prev) => (replace ? mapped : [...prev, ...mapped]));
        setHasMore(mapped.length === PAGE);
        setOffset(nextOffset + mapped.length);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Failed to load');
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [period]
  );

  const loadMyRank = useCallback(async () => {
    if (!user) {
      setMy(null);
      return;
    }
    const { data, error: rpcError } = await supabase.rpc(
      'get_my_leaderboard_rank',
      { p_period: period }
    );
    if (rpcError || !data) {
      setMy(null);
      return;
    }
    setMy({
      rank: Number(data.rank),
      user_id: data.user_id,
      display_name: data.display_name || 'Player',
      score: Number(data.score),
      tasks_solved: Number(data.tasks_solved || 0),
    });
  }, [user, period]);

  useEffect(() => {
    setRows([]);
    setOffset(0);
    setHasMore(true);
    loadPage(0, true);
    loadMyRank();
  }, [period, loadPage, loadMyRank]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      (entries) => {
        if (
          entries[0]?.isIntersecting &&
          hasMore &&
          !loading &&
          !loadingMore
        ) {
          loadPage(offset, false);
        }
      },
      { rootMargin: '120px' }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loading, loadingMore, offset, loadPage]);

  const myInList = my && rows.some((r) => r.user_id === my.user_id);

  const showStickyTop =
    Boolean(my) &&
    !myInList &&
    rows.length > 0 &&
    my!.rank < rows[0].rank;

  const showStickyBottom =
    Boolean(my) &&
    !myInList &&
    rows.length > 0 &&
    my!.rank > rows[rows.length - 1].rank;

  const tabs: { id: Period; label: string }[] = [
    { id: 'all', label: 'All time' },
    { id: 'week', label: 'This week' },
    { id: 'today', label: 'Today' },
  ];

  return (
    <div className="page-shell">
      <header className="page-header">
        <div
          className="page-inner"
          style={{ paddingTop: 16, paddingBottom: 12 }}
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
            Leaderboard
          </h1>
        </div>
      </header>

      <main
        className="page-inner"
        style={{
          flex: 1,
          paddingTop: 12,
          paddingBottom: showStickyBottom ? 96 : 40,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            gap: 6,
            padding: 4,
            marginBottom: 16,
            borderRadius: 14,
            background: 'rgba(255,255,255,0.06)',
          }}
        >
          {tabs.map((t) => {
            const active = period === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setPeriod(t.id)}
                style={{
                  flex: 1,
                  padding: '8px 6px',
                  border: 'none',
                  borderRadius: 11,
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 13,
                  background: active ? 'var(--primary)' : 'transparent',
                  color: active ? '#000' : 'var(--text-muted)',
                }}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Sticky top if you are above the loaded window */}
        {showStickyTop && my && (
          <>
            <RankRow
              sticky
              highlight
              rank={my.rank}
              name={`You · ${my.display_name}`}
              score={my.score}
              tasks={my.tasks_solved}
            />
            <div
              style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                letterSpacing: 6,
                fontSize: 18,
                padding: '6px 0 10px',
              }}
            >
              ···
            </div>
          </>
        )}

        {loading && (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              padding: '48px 0',
            }}
          >
            Loading…
          </p>
        )}

        {error && (
          <div
            style={{
              borderRadius: 16,
              padding: 20,
              border: '1px solid var(--border)',
              color: 'var(--error)',
              textAlign: 'center',
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && rows.length === 0 && (
          <div
            style={{
              borderRadius: 16,
              padding: 28,
              border: '1px solid var(--border)',
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 14,
            }}
          >
            No scores yet. Train and climb the board!
          </div>
        )}

        {/* List */}
        <div style={{ flex: 1 }}>
          {rows.map((row) => {
            const isMe = Boolean(my && row.user_id === my.user_id);
            return (
              <RankRow
                key={`${row.user_id}-${row.rank}`}
                highlight={isMe}
                rank={row.rank}
                name={isMe ? `You · ${row.display_name}` : row.display_name}
                score={row.score}
                tasks={row.tasks_solved}
                accuracy={period === 'all' ? row.accuracy : null}
              />
            );
          })}
        </div>

        <div ref={sentinelRef} style={{ height: 8 }} />

        {loadingMore && (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 13,
              paddingBottom: 8,
            }}
          >
            Loading more…
          </p>
        )}

        {!user && (
          <p
            style={{
              textAlign: 'center',
              color: 'var(--text-muted)',
              fontSize: 13,
              marginTop: 12,
            }}
          >
            Sign in to appear on the leaderboard.
          </p>
        )}
      </main>

      {/* Sticky bottom — your rank below current page */}
      {showStickyBottom && my && (
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 'calc(64px + env(safe-area-inset-bottom))',
            zIndex: 40,
            padding: '0 15px 10px',
            pointerEvents: 'none',
          }}
        >
          <div
            style={{
              maxWidth: 480,
              margin: '0 auto',
              pointerEvents: 'auto',
            }}
          >
            <div
              style={{
                textAlign: 'center',
                color: 'var(--text-muted)',
                letterSpacing: 6,
                fontSize: 16,
                marginBottom: 6,
              }}
            >
              ···
            </div>
            <div
              style={{
                borderRadius: 16,
                border: '1px solid var(--primary)',
                background: 'rgba(26, 26, 46, 0.95)',
                backdropFilter: 'blur(12px)',
                WebkitBackdropFilter: 'blur(12px)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
              }}
            >
              <RankRow
                sticky
                highlight
                rank={my.rank}
                name={`You · ${my.display_name}`}
                score={my.score}
                tasks={my.tasks_solved}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}