'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { ArrowLeft, Check, X, Undo2 } from 'lucide-react';
import {
  STANDARD_COMBOS,
  StandardCombo,
  loadComboStats,
  updateComboStat,
  ComboStats,
} from '@/lib/standart-combos';
import ComboDiagram from './ComboDiagram';

interface StudyTrainerProps {
  onBack: () => void;
}

interface Snapshot {
  index: number;
  flipped: boolean;
}

const CARD_MIN_HEIGHT = 340;
const SWIPE_THRESHOLD = 80;

export default function StudyTrainer({ onBack }: StudyTrainerProps) {
  const [deck, setDeck] = useState<StandardCombo[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState<Record<string, ComboStats>>({});
  const [history, setHistory] = useState<Snapshot[]>([]);
  const [sessionSeen, setSessionSeen] = useState<Set<string>>(new Set());

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const locked = useRef(false);
  const busy = useRef(false);

  useEffect(() => {
    setStats(loadComboStats());
    const shuffled = [...STANDARD_COMBOS].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setIndex(0);
    setFlipped(false);
    setHistory([]);
    setSessionSeen(new Set());
  }, []);

  const current = deck[index] || null;
  const total = STANDARD_COMBOS.length;

  const knownCount = useMemo(() => {
    const ids = new Set(STANDARD_COMBOS.map((c) => c.id));
    return Object.entries(stats).filter(([id, s]) => ids.has(id) && s.known).length;
  }, [stats]);

  const pushHistory = () => {
    setHistory((h) => [...h, { index, flipped }]);
  };

  const goNext = (action: 'know' | 'repeat') => {
    if (!current || busy.current) return;
    busy.current = true;
    pushHistory();
    setStats((prev) => updateComboStat(prev, current.id, action === 'know'));
    setSessionSeen((prev) => new Set(prev).add(current.id));
    setFlipped(false);
    setDragX(0);
    setIndex((i) => {
      if (i + 1 >= deck.length) {
        setDeck([...STANDARD_COMBOS].sort(() => Math.random() - 0.5));
        return 0;
      }
      return i + 1;
    });
    requestAnimationFrame(() => {
      busy.current = false;
    });
  };

  const undo = () => {
    if (history.length === 0 || busy.current) return;
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
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
    // tap → flip if little movement
    if (Math.abs(dx) < 12 && Math.abs(e.clientY - startY.current) < 12) {
      setFlipped((f) => !f);
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

  const rot = Math.max(-10, Math.min(10, dragX / 24));
  const glow =
    dragX > 20
      ? `rgba(52, 211, 153, ${Math.min(0.45, Math.abs(dragX) / 200)})`
      : dragX < -20
      ? `rgba(248, 113, 113, ${Math.min(0.45, Math.abs(dragX) / 200)})`
      : 'transparent';

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
            Study 
          </span>
        </div>
      </header>

      <main className="page-inner" style={{ flex: 1, paddingTop: 16, paddingBottom: 40 }}>
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            width: '100%',
            background: 'var(--card-front)',
            borderRadius: 'var(--radius-card)',
            padding: '16px 14px',
            marginBottom: 16,
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            minHeight: CARD_MIN_HEIGHT,
            height: CARD_MIN_HEIGHT,
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
          {!flipped ? (
            <ComboDiagram family={current.family} chips={current.chips} size={240} />
          ) : (
            <div style={{ fontSize: 56, fontWeight: 800, color: '#0f172a' }}>
              {current.answer}
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