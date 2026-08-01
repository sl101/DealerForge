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
import FlashCard from './FlashCard';

interface CardsTrainerProps {
  onBack: () => void;
}

export default function CardsTrainer({ onBack }: CardsTrainerProps) {
  const [depth, setDepth] = useState<Depth>('1/1');
  const [direction, setDirection] = useState<Direction>('number-first');
  const [cards, setCards] = useState<NeighborCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [stats, setStats] = useState<Record<number, NumberStats>>({});
  const [history, setHistory] = useState<number[]>([]);

  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    setStats(loadStats());
    const shuffled = [...NEIGHBOR_CARDS].sort(() => Math.random() - 0.5);
    setCards(shuffled);
  }, []);

  const currentCard = cards[currentIndex];

  const goNext = () => {
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setHistory(prev => [...prev, currentIndex]);
      setCurrentIndex(prev => prev + 1);
    } else {
      const shuffled = [...NEIGHBOR_CARDS].sort(() => Math.random() - 0.5);
      setCards(shuffled);
      setCurrentIndex(0);
      setHistory([]);
    }
  };

  const goPrev = () => {
    if (history.length === 0) return;
    setIsFlipped(false);
    const prevIndex = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    setCurrentIndex(prevIndex);
  };

  const handleKnow = () => {
    if (!currentCard) return;
    updateStat(stats, currentCard.number, true);
    setStats({ ...stats });
    goNext();
  };

  const handleRepeat = () => {
    if (!currentCard) return;
    updateStat(stats, currentCard.number, false);
    setStats({ ...stats });

    const newCards = [...cards];
    const insertAt = Math.min(currentIndex + 3, newCards.length);
    newCards.splice(insertAt, 0, currentCard);
    setCards(newCards);
    goNext();
  };

  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 80) {
      if (diff > 0) handleKnow();
      else handleRepeat();
    }
    touchStartX.current = null;
  };

  if (!currentCard) return null;

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        backgroundColor: 'rgba(26,26,46,0.92)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
      }}>
        <div style={{
          maxWidth: 512,
          margin: '0 auto',
          padding: '10px 14px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}>
          <button
            onClick={onBack}
            style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', flexShrink: 0 }}
          >
            <ArrowLeft size={20} />
          </button>

          {/* Both controls on one line */}
          <div style={{ display: 'flex', gap: 8, flex: 1, minWidth: 0 }}>
            {/* Depth */}
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

            {/* Direction */}
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

      <main style={{ maxWidth: 512, margin: '0 auto', padding: '20px 16px 40px' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
          {currentIndex + 1} / {cards.length}
        </div>

        <FlashCard
          card={currentCard}
          depth={depth}
          direction={direction}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <button
            onClick={handleRepeat}
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
            onClick={handleKnow}
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