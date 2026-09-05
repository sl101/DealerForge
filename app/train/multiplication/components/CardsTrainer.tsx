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

type Action = 'know' | 'repeat';
type MotionPhase = 'idle' | 'exit' | 'gap' | 'in';

interface HistoryItem {
  index: number;
  fact: Fact;
  action: Action;
  reviewIds: string[];
  deck: Fact[];
  answered: number;
}

const THRESHOLD = 90;
const EXIT_MS = 300;
const GAP_MS = 50;
const APPEAR_MS = 200;
const ENTER_MS = 350;

const CARD_BOX: React.CSSProperties = {
  width: '100%',
  height: '33dvh',
  minHeight: 180,
  maxHeight: 320,
  position: 'relative',
  zIndex: 3,
};

export default function CardsTrainer({ onBack }: CardsTrainerProps) {
  const [selected, setSelected] = useState<Multiplier[]>([...MULTIPLIERS]);
  const [stats, setStats] = useState<Record<string, FactStats>>({});

  const [deck, setDeck] = useState<Fact[]>([]);
  const [index, setIndex] = useState(0);
  const [reviewIds, setReviewIds] = useState<string[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [answered, setAnswered] = useState(0);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [cardKey, setCardKey] = useState(0);

  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exitDir, setExitDir] = useState<'left' | 'right' | null>(null);
  const [enterDir, setEnterDir] = useState<'left' | 'right' | null>(null);
  const [phase, setPhase] = useState<MotionPhase>('idle');

  const startX = useRef(0);
  const startY = useRef(0);
  const locked = useRef(false);
  const busy = useRef(false);
  const handled = useRef(false);
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
    setExitDir(null);
    setEnterDir(null);
    setPhase('idle');
    setCardKey((k) => k + 1);
    busy.current = false;
    handled.current = false;
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

  const applyNext = (action: Action) => {
    const card = currentRef.current;
    if (!card) return;

    setStats((prev) => updateFactStat(prev, card.id, action === 'know'));

    const nextReview =
      action === 'know'
        ? reviewIds.filter((id) => id !== card.id)
        : reviewIds.includes(card.id)
          ? reviewIds
          : [...reviewIds, card.id];

    setReviewIds(nextReview);
    setAnswered((n) => n + 1);
    setFlipped(false);
    setDragX(0);

    setIndex((i) => {
      const next = i + 1;
      if (next >= deck.length) {
        const list = buildFacts(selected.length ? selected : MULTIPLIERS);
        const reviewSet = new Set(nextReview);
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
  };

  const goNext = (action: Action) => {
    const card = currentRef.current;
    if (!card || busy.current) return;
    busy.current = true;
    handled.current = true;

    setHistory((h) => [
      ...h,
      {
        index,
        fact: card,
        action,
        reviewIds: [...reviewIds],
        deck: [...deck],
        answered,
      },
    ]);

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

  const finishExit = (dir: 'left' | 'right') => {
    goNext(dir === 'right' ? 'know' : 'repeat');
  };

  const undo = () => {
    if (busy.current || history.length === 0 || phase !== 'idle') return;
    busy.current = true;
    handled.current = true;

    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setEnterDir(prev.action === 'know' ? 'right' : 'left');
    setDeck(prev.deck);
    setIndex(prev.index);
    setReviewIds(prev.reviewIds);
    setAnswered(prev.answered);
    setFlipped(false);
    setDragX(0);
    setExitDir(null);
    setPhase('idle');
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

    if (locked.current && dx > THRESHOLD) {
      finishExit('right');
      return;
    }
    if (locked.current && dx < -THRESHOLD) {
      finishExit('left');
      return;
    }
    if (!locked.current && Math.abs(dx) < 10 && Math.abs(dy) < 10) {
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
    padding: 28,
    overflow: 'hidden',
  };

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
                    : `translateX(${dragX}px) rotate(${rotation}deg)`,
                transition:
                  dragging || phase === 'exit' || enterDir || phase === 'in'
                    ? 'none'
                    : 'transform 0.25s ease-out',
                cursor: phase === 'idle' ? 'grab' : 'default',
                userSelect: 'none',
                touchAction: 'none',
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
                    <div style={{ fontSize: 42, fontWeight: 800, color: '#0f172a' }}>
                      {current.multiplier} × {current.factor}
                    </div>
                  </div>
                  <div
                    className="card-face card-face-back"
                    style={{ ...faceShell, background: 'var(--card-back)' }}
                  >
                    <div
                      style={{
                        fontSize: 56,
                        fontWeight: 800,
                        color: 'var(--number-red, #dc2626)',
                      }}
                    >
                      {current.answer}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                if (phase === 'idle' && !busy.current) finishExit('left');
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
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Undo2 size={20} />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              if (phase === 'idle' && !busy.current) finishExit('right');
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