'use client';

import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  NEIGHBOR_CARDS,
  NeighborCard,
  Depth,
  Direction,
  NumberStats,
  loadStats,
  updateStat,
} from '@/lib/neighbors';
import FlashCard, { FlashCardHandle } from './FlashCard';

interface CardsTrainerProps {
  onBack: () => void;
}

export default function CardsTrainer({ onBack }: CardsTrainerProps) {
  const [depth, setDepth] = useState<Depth>('1/1');
  const [direction, setDirection] = useState<Direction>('number-first');

  const [newQueue, setNewQueue] = useState<NeighborCard[]>([]);
  const [reviewQueue, setReviewQueue] = useState<NeighborCard[]>([]);
  const [seenCount, setSeenCount] = useState(0);
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());

  const [current, setCurrent] = useState<NeighborCard | null>(null);
  const [currentFromReview, setCurrentFromReview] = useState(false);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState<Record<number, NumberStats>>({});
  const [history, setHistory] = useState<{ card: NeighborCard; fromReview: boolean }[]>([]);
  const [cardKey, setCardKey] = useState(0);

  const cardRef = useRef<FlashCardHandle>(null);
  const TOTAL = NEIGHBOR_CARDS.length;

  useEffect(() => {
    setStats(loadStats());
    const shuffled = [...NEIGHBOR_CARDS].sort(() => Math.random() - 0.5);
    const first = shuffled[0];
    setCurrent(first);
    setCurrentFromReview(false);
    setNewQueue(shuffled.slice(1));
    setSeenIds(new Set([first.number]));
    setSeenCount(1);
  }, []);

  const pickNext = (
    newQ: NeighborCard[],
    reviewQ: NeighborCard[],
    seen: Set<number>
  ): {
    card: NeighborCard | null;
    fromReview: boolean;
    newQ: NeighborCard[];
    seen: Set<number>;
  } => {
    const allSeen = seen.size >= TOTAL;

    if (!allSeen && newQ.length > 0) {
      const preferNew = reviewQ.length === 0 || Math.random() < 0.7;
      if (preferNew) {
        const card = newQ[0];
        const nextSeen = new Set(seen);
        nextSeen.add(card.number);
        return { card, fromReview: false, newQ: newQ.slice(1), seen: nextSeen };
      }
      return { card: reviewQ[0], fromReview: true, newQ, seen };
    }

    if (reviewQ.length > 0) {
      return { card: reviewQ[0], fromReview: true, newQ, seen };
    }

    const shuffled = [...NEIGHBOR_CARDS].sort(() => Math.random() - 0.5);
    const card = shuffled[0];
    return {
      card,
      fromReview: false,
      newQ: shuffled.slice(1),
      seen: new Set([card.number]),
    };
  };

  const advance = (action: 'know' | 'repeat' | 'skip') => {
    if (!current) return;
    setIsFlipped(false);

    let nextReview = [...reviewQueue];
    const nextNew = [...newQueue];
    const nextSeen = new Set(seenIds);

    setHistory((prev) => [...prev, { card: current, fromReview: currentFromReview }]);

    if (action === 'know') {
      nextReview = nextReview.filter((c) => c.number !== current.number);
    }

    if (action === 'repeat') {
      const already = nextReview.some((c) => c.number === current.number);
      if (!already) nextReview = [...nextReview, current];
    }

    if (currentFromReview && action !== 'know') {
      nextReview = nextReview.filter((c) => c.number !== current.number);
      if (!nextReview.some((c) => c.number === current.number)) {
        nextReview = [...nextReview, current];
      }
    }

    const result = pickNext(nextNew, nextReview, nextSeen);

    setReviewQueue(nextReview);
    setNewQueue(result.newQ);
    setSeenIds(result.seen);
    setSeenCount(result.seen.size);
    setCurrent(result.card);
    setCurrentFromReview(result.fromReview);
    setCardKey((k) => k + 1);
  };

  const handleKnow = () => {
    if (!current) return;
    updateStat(stats, current.number, true);
    setStats({ ...stats });
    advance('know');
  };

  const handleRepeat = () => {
    if (!current) return;
    updateStat(stats, current.number, false);
    setStats({ ...stats });
    advance('repeat');
  };

  /** Buttons: play exit animation, then advance */
  const onKnowClick = () => cardRef.current?.animateKnow();
  const onRepeatClick = () => cardRef.current?.animateRepeat();

  const goNext = () => advance('skip');

  const goPrev = () => {
    if (history.length === 0 || !current) return;
    setIsFlipped(false);

    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));

    if (currentFromReview) {
      setReviewQueue((q) => {
        if (q.some((c) => c.number === current.number)) return q;
        return [current, ...q];
      });
    } else {
      setNewQueue((q) => [current, ...q]);
    }

    setCurrent(prev.card);
    setCurrentFromReview(prev.fromReview);
    setCardKey((k) => k + 1);
  };

  if (!current) return null;

  const progressLabel = `${seenCount} / ${TOTAL}`;
  const reviewLabel = reviewQueue.length > 0 ? ` · ${reviewQueue.length} to review` : '';

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
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--primary)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <ArrowLeft size={20} />
          </button>

          <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 0 }}>
            <div className="segmented" style={{ flex: '0 0 auto' }}>
              <button
                className={depth === '1/1' ? 'active' : ''}
                onClick={() => setDepth('1/1')}
                style={{ padding: '5px 10px', fontSize: 12 }}
              >
                1/1
              </button>
              <button
                className={depth === '2/2' ? 'active' : ''}
                onClick={() => setDepth('2/2')}
                style={{ padding: '5px 10px', fontSize: 12 }}
              >
                2/2
              </button>
            </div>

            <div className="segmented" style={{ flex: 1 }}>
              <button
                className={direction === 'number-first' ? 'active' : ''}
                onClick={() => {
                  setDirection('number-first');
                  setIsFlipped(false);
                }}
                style={{ padding: '5px 8px', fontSize: 12 }}
              >
                Number
              </button>
              <button
                className={direction === 'neighbors-first' ? 'active' : ''}
                onClick={() => {
                  setDirection('neighbors-first');
                  setIsFlipped(false);
                }}
                style={{ padding: '5px 8px', fontSize: 12 }}
              >
                Neighbors
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="page-inner" style={{ flex: 1, paddingTop: 20, paddingBottom: 40 }}>
        <div
          style={{
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: 13,
            marginBottom: 16,
          }}
        >
          {progressLabel}
          <span style={{ opacity: 0.7 }}>{reviewLabel}</span>
        </div>

        <FlashCard
          key={cardKey}
          ref={cardRef}
          card={current}
          depth={depth}
          direction={direction}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
          onSwipeKnow={handleKnow}
          onSwipeRepeat={handleRepeat}
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <button
            onClick={onRepeatClick}
            className="btn-repeat"
            style={{
              padding: 15,
              borderRadius: 'var(--radius-btn)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 15,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <X size={18} /> Repeat
          </button>
          <button
            onClick={onKnowClick}
            className="btn-know"
            style={{
              padding: 15,
              borderRadius: 'var(--radius-btn)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: 15,
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
            onClick={goPrev}
            disabled={history.length === 0}
            className="btn-nav"
            style={{
              flex: 1,
              padding: 13,
              borderRadius: 'var(--radius-btn)',
              cursor: history.length === 0 ? 'default' : 'pointer',
              opacity: history.length === 0 ? 0.4 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            <ChevronLeft size={18} /> Prev
          </button>
          <button
            onClick={goNext}
            className="btn-nav"
            style={{
              flex: 1,
              padding: 13,
              borderRadius: 'var(--radius-btn)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
            }}
          >
            Next <ChevronRight size={18} />
          </button>
        </div>
      </main>
    </div>
  );
}