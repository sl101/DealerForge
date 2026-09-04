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
type Action = 'know' | 'repeat';

interface Snapshot {
  index: number;
  queue: NeighborCard[];
  review: NeighborCard[];
  flipped: boolean;
  action: Action;
}

const SWIPE_THRESHOLD = 80;
const EXIT_MS = 320;
const ENTER_MS = 350;

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
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null);
  const [enterDir, setEnterDir] = useState<'left' | 'right' | null>(null);

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
    if (queue.length === 0 && review.length === 0) return [];
    if (queue.length === 0) return review;
    return queue;
  }, [queue, review]);

  const current = deck[index] || null;

  const neighborsOf = useCallback(
    (card: NeighborCard) => (depth === '1/1' ? card.neighbors1 : card.neighbors2),
    [depth]
  );

  const applyAction = (action: Action) => {
    if (!current) return;

    updateStat(stats, current.number, action === 'know');
    setStats({ ...stats });

    const nextQueue = queue.filter((c) => c.number !== current.number);
    let nextReview =
      action === 'repeat'
        ? [...review.filter((c) => c.number !== current.number), current]
        : review.filter((c) => c.number !== current.number);

    if (nextQueue.length === 0 && nextReview.length === 0) {
      const reshuffle = [...NEIGHBOR_CARDS].sort(() => Math.random() - 0.5);
      setQueue(reshuffle);
      setReview([]);
      setIndex(0);
    } else {
      setQueue(nextQueue);
      setReview(nextReview);
      const nextDeck = nextQueue.length > 0 ? nextQueue : nextReview;
      setIndex((i) => (i >= nextDeck.length ? 0 : i));
    }

    setFlipped(false);
    setDragX(0);
  };

  const goNext = (action: Action) => {
    if (!current || busy.current) return;
    busy.current = true;

    setHistory((h) => [
      ...h,
      {
        index,
        queue: [...queue],
        review: [...review],
        flipped,
        action,
      },
    ]);

    setExitDir(action === 'know' ? 'right' : 'left');
    setDragX(0);
    setDragging(false);

    window.setTimeout(() => {
      applyAction(action);
      setExitDir(null);
      busy.current = false;
    }, EXIT_MS);
  };

  const undo = () => {
    if (history.length === 0 || busy.current) return;
    busy.current = true;

    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));

    // Card returns from the side it left to
    setEnterDir(prev.action === 'know' ? 'right' : 'left');
    setQueue(prev.queue);
    setReview(prev.review);
    setIndex(prev.index);
    setFlipped(prev.flipped);
    setDragX(0);
    setExitDir(null);

    window.setTimeout(() => {
      setEnterDir(null);
      busy.current = false;
    }, ENTER_MS);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (busy.current || exitDir) return;
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
    if (!dragging || busy.current || exitDir) return;
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
    if (busy.current || exitDir) return;
    const dx = e.clientX - startX.current;
    if (locked.current && dx > SWIPE_THRESHOLD) {
      goNext('know');
      return;
    }
    if (locked.current && dx < -SWIPE_THRESHOLD) {
      goNext('repeat');
      return;
    }
    if (Math.abs(dx) < 12 && Math.abs(e.clientY - startY.current) < 12) {
      setFlipped((f) => !f);
    }
    setDragX(0);
    setDragging(false);
    locked.current = false;
  };

  const rot = Math.max(-12, Math.min(12, dragX / 22));
  const glow =
    dragX > 24
      ? `rgba(52, 211, 153, ${Math.min(0.4, Math.abs(dragX) / 180)})`
      : dragX < -24
        ? `rgba(248, 113, 113, ${Math.min(0.4, Math.abs(dragX) / 180)})`
        : 'transparent';

  const swipeHint =
    dragX > 40 ? 'card-swipe-hint-right' : dragX < -40 ? 'card-swipe-hint-left' : '';

  const motionClass = [
    exitDir === 'left' ? 'card-exit-left' : '',
    exitDir === 'right' ? 'card-exit-right' : '',
    enterDir === 'left' ? 'card-enter-left' : '',
    enterDir === 'right' ? 'card-enter-right' : '',
    swipeHint,
  ]
    .filter(Boolean)
    .join(' ');

  // Front = primary face for current mode
  const frontIsNumber = faceMode === 'number';

  return (
    <div
      className="page-shell"
      style={{ display: 'flex', flexDirection: 'column', minHeight: '100dvh' }}
    >
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
              className={motionClass}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              style={{
                width: '100%',
                flex: '1 1 auto',
                maxHeight: 'min(52vh, 360px)',
                minHeight: 160,
                background: 'var(--card-front)',
                borderRadius: 'var(--radius-card)',
                marginBottom: 16,
                boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
                boxSizing: 'border-box',
                transform:
                  exitDir || enterDir
                    ? undefined
                    : `translateX(${dragX}px) rotate(${rot}deg)`,
                transition: dragging || exitDir || enterDir ? 'none' : 'transform 0.2s ease-out',
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
                  zIndex: 2,
                  borderRadius: 'inherit',
                }}
              />

              <div className="card-flip-scene" style={{ minHeight: 160, height: '100%' }}>
                <div
                  className={`card-flip-inner${flipped ? ' is-flipped' : ''}`}
                  style={{ minHeight: 160 }}
                >
                  {/* Front face */}
                  <div
                    className="card-face"
                    style={{
                      background: 'var(--card-front)',
                      padding: '24px 16px',
                    }}
                  >
                    {frontIsNumber ? (
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
                    ) : (
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

                  {/* Back face */}
                  <div
                    className="card-face card-face-back"
                    style={{
                      background: 'var(--card-back)',
                      padding: '24px 16px',
                    }}
                  >
                    {!frontIsNumber ? (
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
                    ) : (
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
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button
                  type="button"
                  onClick={() => goNext('repeat')}
                  disabled={!!exitDir || busy.current}
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
                  disabled={history.length === 0 || !!exitDir}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'none',
                    border: 'none',
                    color:
                      history.length === 0 ? 'var(--text-muted)' : 'var(--primary)',
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
                disabled={!!exitDir || busy.current}
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