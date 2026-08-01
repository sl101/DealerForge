'use client';

import { Depth, Direction, NeighborCard, getNumberColor } from '@/lib/neighbors';

interface FlashCardProps {
  card: NeighborCard;
  depth: Depth;
  direction: Direction;
  isFlipped: boolean;
  onFlip: () => void;
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

export default function FlashCard({
  card,
  depth,
  direction,
  isFlipped,
  onFlip,
  onTouchStart,
  onTouchEnd,
}: FlashCardProps) {
  const neighbors = depth === '1/1' ? card.neighbors1 : card.neighbors2;
  const isNumberFirst = direction === 'number-first';

  const renderNumber = (n: number, size: number) => (
    <span style={{ color: getNumberColor(n), fontSize: size, fontWeight: 800 }}>
      {n}
    </span>
  );

  const renderNeighbors = (nums: number[], size: number) => (
    <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
      {nums.map(n => (
        <span key={n} style={{ color: getNumberColor(n), fontSize: size, fontWeight: 700 }}>
          {n}
        </span>
      ))}
    </div>
  );

  return (
    <div
      onClick={onFlip}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      style={{ perspective: 1200, height: 300, marginBottom: 28, cursor: 'pointer' }}
    >
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        transition: 'transform 0.55s',
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }}>
        {/* FRONT */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          borderRadius: 'var(--radius-card)',
          background: 'var(--card-front)',
          border: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}>
          <div style={{ fontSize: 12, color: 'var(--card-text-muted)', marginBottom: 10, fontWeight: 500 }}>
            {depth} • {isNumberFirst ? 'Number' : 'Neighbors'}
          </div>
          {isNumberFirst
            ? renderNumber(card.number, 72)
            : renderNeighbors(neighbors, 34)
          }
          <div style={{ marginTop: 14, fontSize: 12, color: 'var(--card-hint)' }}>
            Tap to flip
          </div>
        </div>

        {/* BACK */}
        <div style={{
          position: 'absolute',
          inset: 0,
          backfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          borderRadius: 'var(--radius-card)',
          background: 'var(--card-back)',
          border: '1px solid rgba(103, 232, 249, 0.35)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 20,
          boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
        }}>
          <div style={{ fontSize: 12, color: 'var(--card-text-muted)', marginBottom: 10, fontWeight: 500 }}>
            {isNumberFirst ? 'Neighbors' : 'Number'}
          </div>
          {isNumberFirst
            ? renderNeighbors(neighbors, 34)
            : renderNumber(card.number, 72)
          }
        </div>
      </div>
    </div>
  );
}