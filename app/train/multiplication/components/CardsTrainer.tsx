'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
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

export default function CardsTrainer({ onBack }: CardsTrainerProps) {
  const [selected, setSelected] = useState<Multiplier[]>([...MULTIPLIERS]);
  const [facts, setFacts] = useState<Fact[]>([]);
  const [queue, setQueue] = useState<Fact[]>([]);
  const [review, setReview] = useState<Fact[]>([]);
  const [current, setCurrent] = useState<Fact | null>(null);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState<Record<string, FactStats>>({});
  const [seen, setSeen] = useState(0);
  const [history, setHistory] = useState<Fact[]>([]);

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null);
  const startX = useRef(0);
  const locked = useRef(false);
  const busy = useRef(false);

  const total = facts.length || 1;

  useEffect(() => {
    setStats(loadStats());
  }, []);

  useEffect(() => {
    const list = buildFacts(selected.length ? selected : MULTIPLIERS);
    const shuffled = [...list].sort(() => Math.random() - 0.5);
    setFacts(list);
    setQueue(shuffled.slice(1));
    setReview([]);
    setCurrent(shuffled[0] || null);
    setSeen(shuffled.length ? 1 : 0);
    setHistory([]);
    setFlipped(false);
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

  const pickNext = (q: Fact[], r: Fact[]): Fact | null => {
    if (q.length > 0 && (r.length === 0 || Math.random() < 0.7)) return q[0];
    if (r.length > 0) return r[0];
    if (q.length > 0) return q[0];
    const reshuffle = [...facts].sort(() => Math.random() - 0.5);
    return reshuffle[0] || null;
  };

  const advance = (action: 'know' | 'repeat') => {
    if (!current || busy.current) return;
    setFlipped(false);

    let nextQ = [...queue];
    let nextR = [...review];

    setHistory((h) => [...h, current]);

    if (action === 'know') {
      nextR = nextR.filter((f) => f.id !== current.id);
      if (nextQ[0]?.id === current.id) nextQ = nextQ.slice(1);
      else nextQ = nextQ.filter((f) => f.id !== current.id);
    } else {
      nextQ = nextQ.filter((f) => f.id !== current.id);
      if (!nextR.some((f) => f.id === current.id)) nextR = [...nextR, current];
      else {
        nextR = nextR.filter((f) => f.id !== current.id);
        nextR = [...nextR, current];
      }
    }

    if (nextQ[0]?.id === current.id) nextQ = nextQ.slice(1);
    if (action === 'know' && nextR[0]?.id === current.id) nextR = nextR.slice(1);
    if (action === 'repeat' && nextR[0]?.id === current.id) nextR = nextR.slice(1);

    let next = pickNext(nextQ, nextR);
    if (next?.id === current.id) {
      nextQ = nextQ.filter((f) => f.id !== current.id);
      nextR = nextR.filter((f) => f.id !== current.id);
      next = pickNext(nextQ, nextR);
    }

    if (next && !history.some((h) => h.id === next!.id) && action === 'know') {
      setSeen((s) => Math.min(total, s + (facts.find((f) => f.id === next!.id) ? 0 : 0)));
    }
    if (next && action === 'know') {
      setSeen((s) => Math.min(total, Math.max(s, total - nextQ.length)));
    }

    setQueue(nextQ.filter((f) => f.id !== next?.id));
    setReview(nextR.filter((f) => f.id !== next?.id));
    setCurrent(next);
    setDragX(0);
    setExiting(null);
    busy.current = false;
  };

  const finishExit = (dir: 'left' | 'right') => {
    if (busy.current || !current) return;
    busy.current = true;
    setExiting(dir);
    setDragX(dir === 'right' ? window.innerWidth : -window.innerWidth);

    const action = dir === 'right' ? 'know' : 'repeat';
    const nextStats = updateFactStat(stats, current.id, action === 'know');
    setStats(nextStats);

    window.setTimeout(() => {
      advance(action);
    }, 280);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (busy.current || exiting) return;
    startX.current = e.clientX;
    locked.current = false;
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging || busy.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 8) locked.current = true;
    if (locked.current) setDragX(dx);
  };

  const onPointerUp = () => {
    if (busy.current) return;
    if (locked.current && dragX > 100) finishExit('right');
    else if (locked.current && dragX < -100) finishExit('left');
    else {
      setDragX(0);
      setDragging(false);
    }
    locked.current = false;
    setDragging(false);
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
        <main className="page-inner" style={{ paddingTop: 40, textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)' }}>Select at least one multiplier</p>
        </main>
      </div>
    );
  }

  const abs = Math.abs(dragX);
  const intensity = Math.min(1, abs / 100);
  const glow =
    dragX > 12
      ? `rgba(52, 211, 153, ${0.15 + intensity * 0.35})`
      : dragX < -12
      ? `rgba(248, 113, 113, ${0.15 + intensity * 0.35})`
      : 'transparent';
  const rotation = Math.max(-12, Math.min(12, dragX / 20));

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
          <span style={{ fontSize: 14, color: 'var(--text-muted)' }}>
            Cards · {seen}/{total}
            {review.length > 0 ? ` · ${review.length} review` : ''}
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
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onClick={() => {
              if (Math.abs(dragX) < 8 && !busy.current) setFlipped((f) => !f);
            }}
            style={{
              transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
              transition: dragging ? 'none' : exiting ? 'transform 0.28s ease-in' : 'transform 0.25s ease-out',
              cursor: 'grab',
              userSelect: 'none',
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
              <div style={{ position: 'absolute', inset: 0, background: glow, pointerEvents: 'none' }} />
              {!flipped ? (
                <div style={{ fontSize: 42, fontWeight: 800, color: '#0f172a', position: 'relative' }}>
                  {current.multiplier} × {current.factor}
                </div>
              ) : (
                <div style={{ fontSize: 56, fontWeight: 800, color: 'var(--number-red, #dc2626)', position: 'relative' }}>
                  {current.answer}
                </div>
              )}
              <div style={{ marginTop: 14, fontSize: 13, color: 'var(--card-text-muted)', position: 'relative' }}>
                {flipped ? 'Tap to flip back' : 'Tap to flip · swipe to rate'}
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <button
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
            }}
          >
            <Check size={18} /> Know
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={() => {
              if (!history.length) return;
              const prev = history[history.length - 1];
              setHistory((h) => h.slice(0, -1));
              if (current) setQueue((q) => [current, ...q]);
              setCurrent(prev);
              setFlipped(false);
            }}
            disabled={history.length === 0}
            className="btn-nav"
            style={{
              flex: 1,
              padding: 13,
              borderRadius: 'var(--radius-btn)',
              opacity: history.length === 0 ? 0.4 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: history.length === 0 ? 'default' : 'pointer',
            }}
          >
            <ChevronLeft size={18} /> Prev
          </button>
          <button
            onClick={() => finishExit('right')}
            className="btn-nav"
            style={{
              flex: 1,
              padding: 13,
              borderRadius: 'var(--radius-btn)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              cursor: 'pointer',
            }}
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      </main>
    </div>
  );
}