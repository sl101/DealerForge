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

type Action = 'know' | 'repeat';
type MotionPhase = 'idle' | 'exit' | 'gap' | 'in';

interface Snapshot {
  index: number;
  flipped: boolean;
  action: Action;
}

const SWIPE_THRESHOLD = 80;
const EXIT_MS = 300;
const GAP_MS = 50;
const APPEAR_MS = 200;
const ENTER_MS = 350;
const CARD_HEIGHT = '33dvh';

const CARD_BOX: React.CSSProperties = {
  width: '100%',
  height: CARD_HEIGHT,
  minHeight: 200,
  maxHeight: 360,
  marginBottom: 16,
  flexShrink: 0,
};

export default function StudyTrainer({ onBack }: StudyTrainerProps) {
  const [deck, setDeck] = useState<StandardCombo[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [stats, setStats] = useState<Record<string, ComboStats>>({});
  const [history, setHistory] = useState<Snapshot[]>([]);

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null);
  const [enterDir, setEnterDir] = useState<'left' | 'right' | null>(null);
  const [phase, setPhase] = useState<MotionPhase>('idle');
  const [cardKey, setCardKey] = useState(0);

  const startX = useRef(0);
  const startY = useRef(0);
  const locked = useRef(false);
  const busy = useRef(false);
  const handled = useRef(false);

  useEffect(() => {
    setStats(loadComboStats());
    const shuffled = [...STANDARD_COMBOS].sort(() => Math.random() - 0.5);
    setDeck(shuffled);
    setIndex(0);
    setFlipped(false);
    setHistory([]);
  }, []);

  const current = deck[index] || null;
  const total = STANDARD_COMBOS.length;

  const knownCount = useMemo(() => {
    const ids = new Set(STANDARD_COMBOS.map((c) => c.id));
    return Object.entries(stats).filter(([id, s]) => ids.has(id) && s.known).length;
  }, [stats]);

  const applyNext = (action: Action) => {
    if (!current) return;
    setStats((prev) => updateComboStat(prev, current.id, action === 'know'));
    setFlipped(false);
    setDragX(0);

    setIndex((i) => {
      if (i + 1 >= deck.length) {
        setDeck([...STANDARD_COMBOS].sort(() => Math.random() - 0.5));
        return 0;
      }
      return i + 1;
    });
  };

  const goNext = (action: Action) => {
    if (!current || busy.current) return;
    busy.current = true;
    handled.current = true;

    setHistory((h) => [...h, { index, flipped, action }]);
    setPhase('exit');
    setExitDir(action === 'know' ? 'right' : 'left');
    setEnterDir(null);
    setDragX(0);
    setDragging(false);
    locked.current = false;

    window.setTimeout(() => {
      setPhase('gap');
      setExitDir(null);
      applyNext(action);

      window.setTimeout(() => {
        setCardKey((k) => k + 1);
        setPhase('in');
        window.setTimeout(() => {
          setPhase('idle');
          busy.current = false;
          handled.current = false;
        }, APPEAR_MS);
      }, GAP_MS);
    }, EXIT_MS);
  };

  const undo = () => {
    if (history.length === 0 || busy.current) return;
    busy.current = true;
    handled.current = true;

    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setPhase('idle');
    setExitDir(null);
    setEnterDir(prev.action === 'know' ? 'right' : 'left');
    setIndex(prev.index);
    setFlipped(prev.flipped);
    setDragX(0);
    setCardKey((k) => k + 1);

    window.setTimeout(() => {
      setEnterDir(null);
      busy.current = false;
      handled.current = false;
    }, ENTER_MS);
  };

  const endPointer = (clientX: number, clientY: number) => {
    if (busy.current || handled.current || phase === 'exit') {
      setDragging(false);
      return;
    }
    const dx = clientX - startX.current;
    const dy = clientY - startY.current;

    if (locked.current && dx > SWIPE_THRESHOLD) {
      goNext('know');
      return;
    }
    if (locked.current && dx < -SWIPE_THRESHOLD) {
      goNext('repeat');
      return;
    }
    if (!locked.current && Math.abs(dx) < 12 && Math.abs(dy) < 12) {
      setFlipped((f) => !f);
    }
    setDragX(0);
    setDragging(false);
    locked.current = false;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (busy.current || phase !== 'idle' || enterDir) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    handled.current = false;
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
    if (!dragging || busy.current || phase !== 'idle' || handled.current) return;
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

  const onPointerUp = (e: React.PointerEvent) => endPointer(e.clientX, e.clientY);
  const onPointerCancel = (e: React.PointerEvent) => endPointer(e.clientX, e.clientY);

  if (!current) {
    return (
      <div className="page-shell">
        <header className="page-header">
          <div className="page-inner" style={{ paddingTop: 14, paddingBottom: 14 }}>
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

  const motionClass = [
    phase === 'exit' && exitDir === 'left' ? 'card-exit-left' : '',
    phase === 'exit' && exitDir === 'right' ? 'card-exit-right' : '',
    enterDir === 'left' ? 'card-enter-left' : '',
    enterDir === 'right' ? 'card-enter-right' : '',
    phase === 'in' ? 'card-fade-in' : '',
    dragX > 40 ? 'card-swipe-hint-right' : '',
    dragX < -40 ? 'card-swipe-hint-left' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const faceShell: React.CSSProperties = {
    background: 'var(--card-front)',
    borderRadius: 'var(--radius-card)',
    boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
    padding: 16,
    overflow: 'hidden',
  };

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
          <span style={{ fontSize: 14, color: 'var(--text-muted)', flex: 1 }}>
            Study
            {knownCount > 0 ? ` · ${knownCount}/${total} known` : ''}
          </span>
        </div>
      </header>

      <main
        className="page-inner"
        style={{
          flex: 1,
          paddingTop: 16,
          paddingBottom: 24,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {phase === 'gap' ? (
          <div style={CARD_BOX} aria-hidden />
        ) : (
          <div
            key={cardKey}
            className={motionClass}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            style={{
              ...CARD_BOX,
              transform:
                phase === 'exit' || enterDir
                  ? undefined
                  : `translateX(${dragX}px) rotate(${rot}deg)`,
              transition:
                dragging || phase === 'exit' || enterDir || phase === 'in'
                  ? 'none'
                  : 'transform 0.2s ease-out',
              touchAction: 'none',
              userSelect: 'none',
              cursor: phase === 'idle' ? 'grab' : 'default',
            }}
          >
            <div className="card-flip-scene" style={{ width: '100%', height: '100%' }}>
              <div
                className={`card-flip-inner${flipped ? ' is-flipped' : ''}`}
                style={{ height: '100%' }}
              >
                <div className="card-face" style={faceShell}>
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: phase === 'idle' ? glow : 'transparent',
                      pointerEvents: 'none',
                      borderRadius: 'inherit',
                    }}
                  />
                  <div className="combo-diagram">
                    <ComboDiagram family={current.family} chips={current.chips} size={240} />
                  </div>
                </div>
                <div
                  className="card-face card-face-back"
                  style={{ ...faceShell, background: 'var(--card-back)' }}
                >
                  <div style={{ fontSize: 56, fontWeight: 800, color: '#0f172a' }}>
                    {current.answer}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                if (!busy.current && !handled.current && phase === 'idle') goNext('repeat');
              }}
              disabled={phase !== 'idle' || busy.current}
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
              disabled={history.length === 0 || phase !== 'idle'}
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
            onClick={() => {
              if (!busy.current && !handled.current && phase === 'idle') goNext('know');
            }}
            disabled={phase !== 'idle' || busy.current}
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