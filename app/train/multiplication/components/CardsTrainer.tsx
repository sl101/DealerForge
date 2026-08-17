'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, X, Undo2 } from 'lucide-react';
import {
  Multiplier,
  MULTIPLIERS,
  Fact,
  buildFacts,
  loadStats,
  updateFactStat,
  FactStats,
} from '@/lib/multiplication';

interface CardsTrainerProps {
  onBack: () => void;
}

const THRESHOLD = 90;
const EXIT_MS = 280;

export default function CardsTrainer({ onBack }: CardsTrainerProps) {
  const [selected, setSelected] = useState<Multiplier[]>([...MULTIPLIERS]);
  const [stats, setStats] = useState<Record<string, FactStats>>({});

  const [deck, setDeck] = useState<Fact[]>([]);
  const [index, setIndex] = useState(0);
  const [reviewIds, setReviewIds] = useState<string[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState(0);
  const [history, setHistory] = useState<{ index: number; fact: Fact }[]>([]);
  const [cardKey, setCardKey] = useState(0);

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null);
  const [noTransition, setNoTransition] = useState(false);

  const startX = useRef(0);
  const startY = useRef(0);
  const locked = useRef(false);
  const busy = useRef(false);
  const currentRef = useRef<Fact | null>(null);

  const current = deck[index] || null;
  currentRef.current = current;
  const total = deck.length || 1;

  const rebuildDeck = (multipliers: Multiplier[]) => {
    const list = buildFacts(multipliers.length ? multipliers : MULTIPLIERS);
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setIndex(0);
    setReviewIds([]);
    setFlipped(false);
    setAnswered(0);
    setHistory([]);
    setDragX(0);
    setExiting(null);
    setCardKey((k) => k + 1);
    busy.current = false;
  };

  useEffect(() => {
    setStats(loadStats());
  }, []);

  useEffect(() => {
    rebuildDeck(selected);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected]);

  const toggleMultiplier = (m: Multiplier) => {
    setSelected((prev) => {
      if (prev.includes(m)) {
        if (prev.length === 1) return prev;
        return prev.filter((x) => x !== m);
      }
      return [...prev, m];
    });
  };

  const goNext = (action: 'know' | 'repeat') => {
    const card = currentRef.current;
    if (!card) {
      busy.current = false;
      return;
    }

    setStats((prev) => updateFactStat(prev, card.id, action === 'know'));
    setHistory((h) => [...h, { index, fact: card }]);

    setReviewIds((prev) => {
      if (action === 'know') return prev.filter((id) => id !== card.id);
      if (prev.includes(card.id)) return prev;
      return [...prev, card.id];
    });

    setAnswered((n) => n + 1);
    setFlipped(false);

    setNoTransition(true);
    setExiting(null);
    setDragX(0);
    setDragging(false);

    setIndex((i) => {
      const next = i + 1;
      if (next >= deck.length) {
        const list = buildFacts(selected.length ? selected : MULTIPLIERS);
        const reviewSet = new Set(
          action === 'know'
            ? reviewIds.filter((id) => id !== card.id)
            : [...reviewIds.filter((id) => id !== card.id), card.id]
        );
        const reviewFacts = list.filter((f) => reviewSet.has(f.id));
        const rest = list
          .filter((f) => !reviewSet.has(f.id))
          .sort(() => Math.random() - 0.5);
        const mixed = [...reviewFacts.sort(() => Math.random() - 0.5), ...rest];
        setDeck(mixed.length ? mixed : list);
        return 0;
      }
      return next;
    });

    setCardKey((k) => k + 1);
    requestAnimationFrame(() => {
      setNoTransition(false);
      busy.current = false;
    });
  };

  const undo = () => {
    if (busy.current || history.length === 0) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setNoTransition(true);
    setDragX(0);
    setExiting(null);
    setFlipped(false);
    setIndex(prev.index);
    setDeck((d) => {
      const copy = [...d];
      if (copy[prev.index]?.id !== prev.fact.id) {
        return [prev.fact, ...copy.filter((f) => f.id !== prev.fact.id)];
      }
      return copy;
    });
    setCardKey((k) => k + 1);
    requestAnimationFrame(() => setNoTransition(false));
  };

  const finishExit = (dir: 'left' | 'right') => {
    if (busy.current || !currentRef.current) return;
    busy.current = true;
    setExiting(dir);
    setDragging(false);
    const w = typeof window !== 'undefined' ? window.innerWidth : 400;
    setDragX(dir === 'right' ? w * 1.15 : -w * 1.15);

    window.setTimeout(() => {
      goNext(dir === 'right' ? 'know' : 'repeat');
    }, EXIT_MS);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (busy.current || exiting) return;
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
    if (!dragging || busy.current || exiting) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (!locked.current) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
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
    if (busy.current || exiting) return;
    const dx = e.clientX - startX.current;
    if (locked.current && dx > THRESHOLD) {
      finishExit('right');
      return;
    }
    if (locked.current && dx < -THRESHOLD) {
      finishExit('left');
      return;
    }
    setDragX(0);
    setDragging(false);
    locked.current = false;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (busy.current || exiting) return;
    const t = e.touches[0];
    startX.current = t.clientX;
    startY.current = t.clientY;
    locked.current = false;
    setDragging(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (!dragging || busy.current || exiting) return;
    const t = e.touches[0];
    const dx = t.clientX - startX.current;
    const dy = t.clientY - startY.current;
    if (!locked.current) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      if (Math.abs(dx) >= Math.abs(dy)) locked.current = true;
      else {
        setDragging(false);
        setDragX(0);
        return;
      }
    }
    if (locked.current) e.preventDefault();
    setDragX(dx);
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (busy.current || exiting) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX.current;
    if (locked.current && dx > THRESHOLD) {
      finishExit('right');
      return;
    }
    if (locked.current && dx < -THRESHOLD) {
      finishExit('left');
      return;
    }
    setDragX(0);
    setDragging(false);
    locked.current = false;
  };

  if (!current) {
    return (
      <div className="page-shell">
        <header className="page-header">
          <div className="page-inner" style={{ paddingTop: 14, paddingBottom: 14 }}>
            <button
              onClick={onBack}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
            >
              <ArrowLeft size={22} />
            </button>
          </div>
        </header>
      </div>
    );
  }

  const abs = Math.abs(dragX);
  const intensity = Math.min(1, abs / THRESHOLD);
  const glow =
    dragX > 12
      ? `rgba(52, 211, 153, ${0.15 + intensity * 0.35})`
      : dragX < -12
      ? `rgba(248, 113, 113, ${0.15 + intensity * 0.35})`
      : 'transparent';
  const rotation = Math.max(-12, Math.min(12, dragX / 20));
  const labelOpacity = Math.min(1, Math.max(0, (abs - 20) / 50));

  return (
    <div className="page-shell">
      <header className="page-header">
        <div
          className="page-inner"
          style={{
            paddingTop: 12,
            paddingBottom: 12,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
          >
            <ArrowLeft size={20} />
          </button>
          <span style={{ fontSize: 14, color: 'var(--text-muted)', flex: 1 }}>
            Cards · {Math.min(answered + 1, total)}/{total}
            {reviewIds.length > 0 ? ` · ${reviewIds.length} review` : ''}
          </span>
        </div>
      </header>

      <main className="page-inner" style={{ flex: 1, paddingTop: 16, paddingBottom: 40 }}>
        <div
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            justifyContent: 'center',
            marginBottom: 20,
          }}
        >
          {MULTIPLIERS.map((m) => {
            const on = selected.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => toggleMultiplier(m)}
                style={{
                  padding: '8px 12px',
                  borderRadius: 12,
                  border: '1px solid var(--border)',
                  background: on ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                  color: on ? '#000' : 'var(--text)',
                  fontWeight: 700,
                  cursor: 'pointer',
                  fontSize: 14,
                }}
              >
                ×{m}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', marginBottom: 20 }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 8px',
              pointerEvents: 'none',
              zIndex: 2,
            }}
          >
            <span
              style={{
                opacity: dragX < -12 ? labelOpacity : 0,
                color: 'var(--error)',
                fontWeight: 800,
                fontSize: 16,
                textTransform: 'uppercase',
              }}
            >
              Repeat
            </span>
            <span
              style={{
                opacity: dragX > 12 ? labelOpacity : 0,
                color: 'var(--success)',
                fontWeight: 800,
                fontSize: 16,
                textTransform: 'uppercase',
              }}
            >
              Know
            </span>
          </div>

          <div
            key={cardKey}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            onClick={() => {
              if (busy.current || exiting || Math.abs(dragX) > 8) return;
              setFlipped((f) => !f);
            }}
            style={{
              transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
              transition: noTransition
                ? 'none'
                : dragging
                ? 'none'
                : exiting
                ? `transform ${EXIT_MS}ms ease-in`
                : 'transform 0.25s ease-out',
              cursor: 'grab',
              userSelect: 'none',
              WebkitUserSelect: 'none',
              touchAction: 'none',
              zIndex: 3,
              position: 'relative',
            }}
          >
            <div
              style={{
                background: 'var(--card-front)',
                borderRadius: 'var(--radius-card)',
                minHeight: 200,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 28,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
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
              {!flipped ? (
                <div
                  style={{
                    fontSize: 42,
                    fontWeight: 800,
                    color: '#0f172a',
                    position: 'relative',
                  }}
                >
                  {current.multiplier} × {current.factor}
                </div>
              ) : (
                <div
                  style={{
                    fontSize: 56,
                    fontWeight: 800,
                    color: 'var(--number-red, #dc2626)',
                    position: 'relative',
                  }}
                >
                  {current.answer}
                </div>
              )}
              <div
                style={{
                  marginTop: 14,
                  fontSize: 13,
                  color: 'var(--card-text-muted)',
                  position: 'relative',
                }}
              >
                {flipped ? 'Tap to flip back' : 'Tap to flip · swipe to rate'}
              </div>
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
          }}
        >
          {/* Left column: Repeat + Undo aligned left */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              onClick={() => finishExit('left')}
              className="btn-repeat"
              style={{
                padding: 15,
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
              title="Undo last"
              style={{
                alignSelf: 'flex-start',
                background: 'none',
                border: 'none',
                color: history.length === 0 ? 'var(--text-muted)' : 'var(--primary)',
                opacity: history.length === 0 ? 0.35 : 1,
                cursor: history.length === 0 ? 'default' : 'pointer',
                padding: '6px 4px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Undo2 size={20} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => finishExit('right')}
            className="btn-know"
            style={{
              padding: 15,
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
      </main>
    </div>
  );
}