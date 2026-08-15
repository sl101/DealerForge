'use client';

import { useRef, useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { NeighborCard, Depth, Direction, getNumberColor } from '@/lib/neighbors';

export interface FlashCardHandle {
  animateKnow: () => void;
  animateRepeat: () => void;
}

interface FlashCardProps {
  card: NeighborCard;
  depth: Depth;
  direction: Direction;
  isFlipped: boolean;
  onFlip: () => void;
  onSwipeKnow: () => void;
  onSwipeRepeat: () => void;
}

const THRESHOLD = 100;
const MAX_ROTATE = 12;
const EXIT_MS = 280;

const FlashCard = forwardRef<FlashCardHandle, FlashCardProps>(function FlashCard(
  { card, depth, direction, isFlipped, onFlip, onSwipeKnow, onSwipeRepeat },
  ref
) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [exiting, setExiting] = useState<'left' | 'right' | null>(null);

  const startX = useRef(0);
  const startY = useRef(0);
  const locked = useRef(false);
  const active = useRef(false);
  const busy = useRef(false);

  const neighbors = depth === '1/1' ? card.neighbors1 : card.neighbors2;
  const neighborsSorted = [...neighbors].sort((a, b) => a - b);
  const frontIsNumber = direction === 'number-first';

  const finishSwipe = (dir: 'left' | 'right') => {
    if (busy.current) return;
    busy.current = true;
    setExiting(dir);
    setDragging(false);
    setDragX(dir === 'right' ? window.innerWidth * 1.2 : -window.innerWidth * 1.2);

    window.setTimeout(() => {
      if (dir === 'right') onSwipeKnow();
      else onSwipeRepeat();
      // parent remounts via key — local state resets; still clear for safety
      setExiting(null);
      setDragX(0);
      active.current = false;
      locked.current = false;
      busy.current = false;
    }, EXIT_MS);
  };

  useImperativeHandle(ref, () => ({
    animateKnow: () => finishSwipe('right'),
    animateRepeat: () => finishSwipe('left'),
  }));

  // Reset busy when card identity changes
  useEffect(() => {
    busy.current = false;
    setExiting(null);
    setDragX(0);
    setDragging(false);
  }, [card.number]);

  const onPointerDown = (e: React.PointerEvent) => {
    if (exiting || busy.current) return;
    active.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    locked.current = false;
    setDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!active.current || exiting || busy.current) return;

    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    if (!locked.current) {
      if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        locked.current = true;
      } else {
        active.current = false;
        setDragging(false);
        setDragX(0);
        return;
      }
    }

    setDragX(dx);
  };

  const onPointerUp = (e: React.PointerEvent) => {
    if (!active.current || exiting || busy.current) {
      active.current = false;
      setDragging(false);
      return;
    }

    const dx = e.clientX - startX.current;

    if (locked.current && dx > THRESHOLD) {
      finishSwipe('right');
      return;
    }
    if (locked.current && dx < -THRESHOLD) {
      finishSwipe('left');
      return;
    }

    setDragX(0);
    setDragging(false);
    active.current = false;
    locked.current = false;
  };

  const rotation = Math.max(-MAX_ROTATE, Math.min(MAX_ROTATE, dragX / 20));
  const abs = Math.abs(dragX);
  const intensity = Math.min(1, abs / THRESHOLD);

  const glowColor =
    dragX > 12
      ? `rgba(52, 211, 153, ${0.15 + intensity * 0.35})`
      : dragX < -12
      ? `rgba(248, 113, 113, ${0.15 + intensity * 0.35})`
      : 'transparent';

  const borderColor =
    dragX > 12
      ? `rgba(52, 211, 153, ${0.4 + intensity * 0.5})`
      : dragX < -12
      ? `rgba(248, 113, 113, ${0.4 + intensity * 0.5})`
      : 'transparent';

  const labelOpacity = Math.min(1, Math.max(0, (abs - 24) / 60));

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        marginBottom: 20,
        perspective: 1200,
        touchAction: 'pan-y',
      }}
    >
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
            fontSize: 18,
            letterSpacing: 1,
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
            fontSize: 18,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}
        >
          Know
        </span>
      </div>

      <div
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onClick={() => {
          if (Math.abs(dragX) < 8 && !exiting && !busy.current) onFlip();
        }}
        style={{
          position: 'relative',
          width: '100%',
          minHeight: 220,
          transform: `translateX(${dragX}px) rotate(${rotation}deg)`,
          transition:
            dragging && !exiting
              ? 'none'
              : exiting
              ? `transform ${EXIT_MS}ms ease-in`
              : 'transform 0.25s ease-out',
          cursor: 'grab',
          userSelect: 'none',
          zIndex: 3,
        }}
      >
        <div
          style={{
            width: '100%',
            minHeight: 220,
            borderRadius: 'var(--radius-card)',
            background: 'var(--card-front)',
            boxShadow: `0 10px 30px rgba(0,0,0,0.25), 0 0 0 2px ${borderColor}`,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 28,
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: glowColor,
              pointerEvents: 'none',
            }}
          />

          {!isFlipped ? (
            frontIsNumber ? (
              <div
                style={{
                  fontSize: 72,
                  fontWeight: 800,
                  color: getNumberColor(card.number),
                  position: 'relative',
                }}
              >
                {card.number}
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  gap: 12,
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  position: 'relative',
                }}
              >
                {neighborsSorted.map((n) => (
                  <span
                    key={n}
                    style={{ fontSize: 36, fontWeight: 800, color: getNumberColor(n) }}
                  >
                    {n}
                  </span>
                ))}
              </div>
            )
          ) : frontIsNumber ? (
            <div
              style={{
                display: 'flex',
                gap: 12,
                flexWrap: 'wrap',
                justifyContent: 'center',
                position: 'relative',
              }}
            >
              {neighborsSorted.map((n) => (
                <span
                  key={n}
                  style={{ fontSize: 36, fontWeight: 800, color: getNumberColor(n) }}
                >
                  {n}
                </span>
              ))}
            </div>
          ) : (
            <div
              style={{
                fontSize: 72,
                fontWeight: 800,
                color: getNumberColor(card.number),
                position: 'relative',
              }}
            >
              {card.number}
            </div>
          )}

          <div
            style={{
              marginTop: 16,
              fontSize: 13,
              color: 'var(--card-text-muted)',
              position: 'relative',
            }}
          >
            {isFlipped ? 'Tap to flip back' : 'Tap to flip · swipe to rate'}
          </div>
        </div>
      </div>
    </div>
  );
});

export default FlashCard;