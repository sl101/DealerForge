'use client';

import { useState, useRef, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';
import {
  WHEEL_ORDER,
  Depth,
  getNumberColor,
  getNeighborsWheelOrder,
  RED_NUMBERS,
} from '@/lib/neighbors';

interface StudyModeProps {
  onBack: () => void;
}

const CHIP = 52;
const GAP = 8;
const COPIES = 3;

function readCssVar(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

function chipBackground(n: number): string {
  if (n === 0) return readCssVar('--chip-green', readCssVar('--number-green', '#16a34a'));
  if (RED_NUMBERS.has(n)) return readCssVar('--chip-red', readCssVar('--number-red', '#dc2626'));
  return readCssVar('--chip-black', readCssVar('--number-black', '#1e293b'));
}

function centerElement(strip: HTMLElement, el: HTMLElement, smooth: boolean) {
  const stripRect = strip.getBoundingClientRect();
  const elRect = el.getBoundingClientRect();
  const delta =
    elRect.left + elRect.width / 2 - (stripRect.left + stripRect.width / 2);
  const target = strip.scrollLeft + delta;

  if (smooth) {
    strip.scrollTo({ left: target, behavior: 'smooth' });
  } else {
    strip.scrollLeft = target;
  }
}

export default function StudyMode({ onBack }: StudyModeProps) {
  const [depth, setDepth] = useState<Depth>('1/1');
  const [selected, setSelected] = useState(0);
  const [spinKey, setSpinKey] = useState(0);

  const stripRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startScroll = useRef(0);
  const didMove = useRef(false);
  const quiet = useRef(false);

  const count = depth === '1/1' ? 1 : 2;
  const { left, right } = getNeighborsWheelOrder(selected, count);
  const cardNumbers = [...left, selected, ...right].sort((a, b) => a - b);

  const loop = Array.from({ length: COPIES }, () => WHEEL_ORDER).flat();
  const midBase = WHEEL_ORDER.length;

  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prevHtml = html.style.overflow;
    const prevBody = body.style.overflow;
    html.style.overflow = 'hidden';
    body.style.overflow = 'hidden';
    return () => {
      html.style.overflow = prevHtml;
      body.style.overflow = prevBody;
    };
  }, []);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const centerZero = () => {
      const zeroIdx = WHEEL_ORDER.indexOf(0);
      const el = strip.querySelector(
        `[data-idx="${midBase + zeroIdx}"]`
      ) as HTMLElement | null;
      if (!el) return;
      quiet.current = true;
      centerElement(strip, el, false);
      requestAnimationFrame(() => {
        quiet.current = false;
      });
    };

    centerZero();
    const t1 = setTimeout(centerZero, 50);
    const t2 = setTimeout(centerZero, 150);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [midBase]);

  const normalizeScroll = () => {
    const strip = stripRef.current;
    if (!strip || dragging.current || quiet.current) return;

    const item = CHIP + GAP;
    const segment = WHEEL_ORDER.length * item;
    if (strip.scrollLeft < segment * 0.5) {
      quiet.current = true;
      strip.scrollLeft += segment;
      requestAnimationFrame(() => {
        quiet.current = false;
      });
    } else if (strip.scrollLeft > segment * 1.5) {
      quiet.current = true;
      strip.scrollLeft -= segment;
      requestAnimationFrame(() => {
        quiet.current = false;
      });
    }
  };

  const selectNumber = (n: number, el: HTMLElement) => {
    setSelected(n);
    setSpinKey((k) => k + 1);

    const strip = stripRef.current;
    if (!strip) return;

    quiet.current = true;
    centerElement(strip, el, true);

    window.setTimeout(() => {
      quiet.current = false;
      normalizeScroll();
    }, 400);
  };

  const onPointerDown = (e: React.PointerEvent) => {
    if (!stripRef.current) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    dragging.current = true;
    didMove.current = false;
    startX.current = e.clientX;
    startScroll.current = stripRef.current.scrollLeft;
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current || !stripRef.current) return;
    const dx = e.clientX - startX.current;
    if (Math.abs(dx) > 10) {
      didMove.current = true;
      stripRef.current.scrollLeft = startScroll.current - dx;
    }
  };

  const onPointerUp = () => {
    dragging.current = false;
    if (didMove.current) normalizeScroll();
  };

  const onWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!stripRef.current) return;
    stripRef.current.scrollLeft += e.deltaY + e.deltaX;
    normalizeScroll();
  };

  const onChipClick = (n: number, el: HTMLElement) => {
    if (didMove.current) return;
    selectNumber(n, el);
  };

  const renderCardNum = (n: number, size: number, highlight = false) => (
    <span
      key={`c-${n}-${size}-${highlight}`}
      style={{
        color: getNumberColor(n),
        fontSize: size,
        fontWeight: 800,
        padding: highlight ? '4px 12px' : '0 4px',
        borderRadius: 10,
        background: highlight
          ? 'color-mix(in srgb, var(--primary) 20%, transparent)'
          : 'transparent',
      }}
    >
      {n}
    </span>
  );

  return (
    <div className="page-shell no-page-scroll">
      <header className="page-header">
        <div
          className="page-inner"
          style={{
            paddingTop: 12,
            paddingBottom: 12,
            display: 'grid',
            gridTemplateColumns: '40px 1fr 40px',
            alignItems: 'center',
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
              justifySelf: 'start',
            }}
          >
            <ArrowLeft size={20} />
          </button>
          <div className="segmented" style={{ maxWidth: 160, margin: '0 auto', width: '100%' }}>
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
          <div />
        </div>
      </header>

      <main
        className="page-inner"
        style={{
          flex: 1,
          minHeight: 0,
          paddingTop: 16,
          paddingBottom: 24,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          key={spinKey}
          className="study-card-spin keypad-task-card"
          style={{
            width: '100%',
            boxSizing: 'border-box',
            background: 'var(--card-front)',
            borderRadius: 'var(--radius-card)',
            padding: '16px 12px',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
            marginBottom: 16,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            {cardNumbers.map((n) =>
              renderCardNum(n, n === selected ? 48 : 24, n === selected)
            )}
          </div>
        </div>

        <p
          style={{
            textAlign: 'center',
            fontSize: 13,
            color: 'var(--text-muted)',
            marginBottom: 10,
            flexShrink: 0,
          }}
        >
          Drag or scroll · tap a number
        </p>

        <div
          ref={stripRef}
          onScroll={normalizeScroll}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          onWheel={onWheel}
          className="wheel-strip"
          style={{
            display: 'flex',
            gap: GAP,
            overflowX: 'auto',
            overflowY: 'hidden',
            padding: '12px 0',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
            cursor: 'grab',
            maskImage:
              'linear-gradient(90deg, transparent, #000 8%, #000 92%, transparent)',
            touchAction: 'pan-x',
            width: '100%',
            boxSizing: 'border-box',
            flexShrink: 0,
            overscrollBehavior: 'contain',
          }}
        >
          {loop.map((n, i) => {
            const isSelected = n === selected;
            return (
              <div
                key={`${n}-${i}`}
                data-idx={i}
                data-num={n}
                onClick={(e) => onChipClick(n, e.currentTarget)}
                style={{
                  flexShrink: 0,
                  width: CHIP,
                  height: CHIP,
                  borderRadius: 14,
                  border: isSelected
                    ? '2px solid var(--primary)'
                    : '1px solid var(--chip-border, rgba(255,255,255,0.2))',
                  background: chipBackground(n),
                  color: 'var(--chip-text, #ffffff)',
                  fontWeight: 800,
                  fontSize: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: isSelected
                    ? '0 0 0 2px color-mix(in srgb, var(--primary) 45%, transparent)'
                    : 'none',
                  userSelect: 'none',
                  cursor: 'pointer',
                }}
              >
                {n}
              </div>
            );
          })}
        </div>
      </main>

      <style>{`
        .wheel-strip::-webkit-scrollbar { display: none; }
        .wheel-strip:active { cursor: grabbing; }
        @keyframes studySpin {
          0% { transform: rotateY(40deg); opacity: 0.7; }
          100% { transform: rotateY(0deg); opacity: 1; }
        }
        .study-card-spin { animation: studySpin 0.25s ease-out; }
      `}</style>
    </div>
  );
}