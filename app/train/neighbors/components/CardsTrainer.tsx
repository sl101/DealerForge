'use client';

import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { ArrowLeft, Check, X, Undo2 } from 'lucide-react';
import {
  NEIGHBOR_CARDS,
  NeighborCard,
  Depth,
  NumberStats,
  loadStats,
  updateStat,
  getNumberColor,
} from '@/lib/neighbors';

interface CardsTrainerProps {
  onBack: () => void;
}

type FaceMode = 'number' | 'neighbors';

interface Snapshot {
  index: number;
  queue: NeighborCard[];
  review: NeighborCard[];
  seen: Set<number>;
  flipped: boolean;
}

const SWIPE_THRESHOLD = 80;

export default function CardsTrainer({ onBack }: CardsTrainerProps) {
  const [depth, setDepth] = useState<Depth>('1/1');
  const [faceMode, setFaceMode] = useState<FaceMode>('number');
  const [queue, setQueue] = useState<NeighborCard[]>([]);
  const [review, setReview] = useState<NeighborCard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState<Record<number, NumberStats>>({});
  const [history, setHistory] = useState<Snapshot[]>([]);

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const locked = useRef(false);
  const busy = useRef(false);

  useEffect(() => {
    setStats(loadStats());
    const shuffled = [...NEIGHBOR_CARDS].sort(() => Math.random() - 0.5);
    setQueue(shuffled);
    setReview([]);
    setIndex(0);
    setFlipped(false);
    setHistory([]);
  }, []);

  const deck = useMemo(() => {
    // Prefer new cards; interleave some review without growing total count label
    if (queue.length === 0 && review.length === 0) return [];
    if (queue.length === 0) return review;
    return queue;
  }, [queue, review]);

  const current = deck[index] || null;

  const neighborsOf = useCallback(
    (card: NeighborCard) => (depth === '1/1' ? card.neighbors1 : card.neighbors2),
    [depth]
  );

  const pushHistory = () => {
    setHistory((h) => [
      ...h,
      {
        index,
        queue: [...queue],
        review: [...review],
        seen: new Set(),
        flipped,
      },
    ]);
  };

  const goNext = (action: 'know' | 'repeat') => {
    if (!current || busy.current) return;
    busy.current = true;
    pushHistory();

    updateStat(stats, current.number, action === 'know');
    setStats({ ...stats });

    if (action === 'repeat') {
      setReview((r) => [...r.filter((c) => c.number !== current.number), current]);
    } else {
      setReview((r) => r.filter((c) => c.number !== current.number));
    }

    setQueue((q) => q.filter((c) => c.number !== current.number));

    setFlipped(false);
    setDragX(0);

    setIndex((i) => {
      const nextQueue = queue.filter((c) => c.number !== current.number);
      const nextReview =
        action === 'repeat'
          ? [...review.filter((c) => c.number !== current.number), current]
          : review.filter((c) => c.number !== current.number);

      const nextDeck = nextQueue.length > 0 ? nextQueue : nextReview;
      if (nextDeck.length === 0) {
        const reshuffle = [...NEIGHBOR_CARDS].sort(() => Math.random() - 0.5);
        setQueue(reshuffle);
        setReview([]);
        return 0;
      }
      if (i >= nextDeck.length) return 0;
      return i;
    });

    requestAnimationFrame(() => {
      busy.current = false;
    });
  };

  const undo = () => {
    if (history.length === 0 || busy.current) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setQueue(prev.queue);
    setReview(prev.review);
    setIndex(prev.index);
    setFlipped(prev.flipped);
    setDragX(0);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (busy.current) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    locked.current = false;
    setDragging(true);
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* ignore */
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || busy.current) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (!locked.current) {
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return;
      if (Math.abs(dx) >= Math.abs(dy)) locked.current = true;
      else {
        setDragging(false);
        setDragX(0);
        return;
      }
    }
    setDragX(dx);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (busy.current) return;
    const dx = e.clientX - startX.current;
    if (locked.current && dx > SWIPE_THRESHOLD) {
      goNext('know');
      setDragging(false);
      return;
    }
    if (locked.current && dx < -SWIPE_THRESHOLD) {
      goNext('repeat');
      setDragging(false);
      return;
    }
    if (Math.abs(dx) < 12 && Math.abs(e.clientY - startY.current) < 12) {
      setFlipped((f) => !f);
    }
    setDragX(0);
    setDragging(false);
    locked.current = false;
  };

  const rot = Math.max(-10, Math.min(10, dragX / 24));
  const glow =
    dragX > 20
      ? `rgba(52, 211, 153, ${Math.min(0.45, Math.abs(dragX) / 200)})`
      : dragX < -20
      ? `rgba(248, 113, 113, ${Math.min(0.45, Math.abs(dragX) / 200)})`
      : 'transparent';

  const showFrontNumber = faceMode === 'number' ? !flipped : flipped;
  const showNeighbors = !showFrontNumber;

  return (
    <div className="page-shell" style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}>
      <header className="page-header">
        <div
          className="page-inner"
          style={{
            paddingTop: 12,
            paddingBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            maxWidth: '100%',
          }}
        >
          <button
            type="button"
            onClick={onBack}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <div className="segmented" style={{ flex: 1, maxWidth: 160 }}>
            <button
              type="button"
              className={depth === '1/1' ? 'active' : ''}
              onClick={() => setDepth('1/1')}
            >
              1/1
            </button>
            <button
              type="button"
              className={depth === '2/2' ? 'active' : ''}
              onClick={() => setDepth('2/2')}
            >
              2/2
            </button>
          </div>

          <div className="segmented" style={{ flex: 1, maxWidth: 200 }}>
            <button
              type="button"
              className={faceMode === 'number' ? 'active' : ''}
              onClick={() => {
                setFaceMode('number');
                setFlipped(false);
              }}
            >
              Number
            </button>
            <button
              type="button"
              className={faceMode === 'neighbors' ? 'active' : ''}
              onClick={() => {
                setFaceMode('neighbors');
                setFlipped(false);
              }}
            >
              Neighbors
            </button>
          </div>
        </div>
      </header>

      <main
        className="page-inner"
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          paddingTop: 16,
          paddingBottom: 24,
          minHeight: 0,
        }}
      >
        {current ? (
          <>
            <div
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={{
                width: '100%',
                flex: '1 1 auto',
                maxHeight: 'min(52vh, 360px)',
                minHeight: 140,
                background: 'var(--card-front)',
                borderRadius: 'var(--radius-card)',
                padding: '24px 16px',
                marginBottom: 16,
                boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                boxSizing: 'border-box',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                transform: `translateX(${dragX}px) rotate(${rot}deg)`,
                transition: dragging ? 'none' : 'transform 0.2s ease-out',
                position: 'relative',
                overflow: 'hidden',
                touchAction: 'none',
                userSelect: 'none',
                cursor: 'grab',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: glow,
                  pointerEvents: 'none',
                }}
              />

              {showFrontNumber && (
                <div
                  style={{
                    fontSize: 'clamp(48px, 14vw, 72px)',
                    fontWeight: 800,
                    lineHeight: 1,
                    color: getNumberColor(current.number),
                  }}
                >
                  {current.number}
                </div>
              )}

              {showNeighbors && (
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 12,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  {neighborsOf(current).map((n) => (
                    <span
                      key={n}
                      style={{
                        fontSize: 'clamp(28px, 8vw, 40px)',
                        fontWeight: 800,
                        lineHeight: 1,
                        color: getNumberColor(n),
                      }}
                    >
                      {n}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => goNext('repeat')}
                  className="btn-repeat"
                  style={{
                    padding: 14,
                    borderRadius: 'var(--radius-btn)',
                    border: 'none',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  <X size={18} /> Repeat
                </button>
                <button
                  type="button"
                  onClick={undo}
                  disabled={history.length === 0}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'none',
                    border: 'none',
                    color: history.length === 0 ? 'var(--text-muted)' : 'var(--primary)',
                    opacity: history.length === 0 ? 0.35 : 1,
                    cursor: history.length === 0 ? 'default' : 'pointer',
                    padding: '6px 4px',
                  }}
                >
                  <Undo2 size={20} />
                </button>
              </div>
              <button
                type="button"
                onClick={() => goNext('know')}
                className="btn-know"
                style={{
                  padding: 14,
                  borderRadius: 'var(--radius-btn)',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  height: 'fit-content',
                }}
              >
                <Check size={18} /> Know
              </button>
            </div>
          </>
        ) : (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>Loading…</p>
        )}
      </main>
    </div>
  );
}