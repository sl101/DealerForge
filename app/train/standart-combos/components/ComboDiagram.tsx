'use client';

import { ChipPos, GridFamily } from '@/lib/standart-combos';

export type DiagramChip =
  | ChipPos
  | { pos: ChipPos; label?: string | number };

interface ComboDiagramProps {
  family: GridFamily;
  chips: DiagramChip[];
  size?: number;
  /** Soft highlight of the focus cell (Payout trainer) */
  highlightFocus?: boolean;
}

const CELL = 26;
const GRID = CELL * 3;
const OX = (100 - GRID) / 2;
const OY = (100 - GRID) / 2;

function cellCenter(col: number, row: number) {
  return { x: OX + CELL * (col + 0.5), y: OY + CELL * (row + 0.5) };
}

function hEdge(col: number, rowLine: number) {
  return { x: OX + CELL * (col + 0.5), y: OY + CELL * rowLine };
}

function vEdge(colLine: number, row: number) {
  return { x: OX + CELL * colLine, y: OY + CELL * (row + 0.5) };
}

function cornerPt(colLine: number, rowLine: number) {
  return { x: OX + CELL * colLine, y: OY + CELL * rowLine };
}

function buildAnchorsAtFocus(
  focusCol: 0 | 1 | 2,
  focusRow: 0 | 1 | 2
): Partial<Record<ChipPos, { x: number; y: number }>> {
  const c = focusCol;
  const r = focusRow;
  return {
    C: cellCenter(c, r),
    N: hEdge(c, r),
    S: hEdge(c, r + 1),
    W: vEdge(c, r),
    E: vEdge(c + 1, r),
    NW: cornerPt(c, r),
    NE: cornerPt(c + 1, r),
    SW: cornerPt(c, r + 1),
    SE: cornerPt(c + 1, r + 1),
    street: { x: OX, y: OY + CELL * (r + 0.5) },
    six_N: { x: OX, y: OY + CELL * r },
    six_S: { x: OX, y: OY + CELL * (r + 1) },
  };
}

const CENTER_ANCHORS = buildAnchorsAtFocus(1, 1);
const LEFT_ANCHORS = buildAnchorsAtFocus(0, 1);
const RIGHT_ANCHORS = buildAnchorsAtFocus(2, 1);
const BOTTOM34_ANCHORS = buildAnchorsAtFocus(0, 2);
const BOTTOM35_ANCHORS = buildAnchorsAtFocus(1, 2);
const BOTTOM36_ANCHORS = buildAnchorsAtFocus(2, 2);

const Z_L = OX;
const Z_TOP = OY + CELL * 0.5;
const Z_DIV = Z_TOP + CELL;
const Z_BOT = Z_DIV + CELL;
const Z_R = Z_L + GRID;
const Z_MID = (Z_L + Z_R) / 2;
const Z_COL1 = Z_L + CELL;
const Z_COL2 = Z_L + CELL * 2;

const ZERO_ANCHORS: Partial<Record<ChipPos, { x: number; y: number }>> = {
  Z: { x: Z_MID, y: Z_TOP + CELL / 2 },
  Z_S1: { x: Z_L + CELL / 2, y: Z_DIV },
  Z_S2: { x: Z_MID, y: Z_DIV },
  Z_S3: { x: Z_L + CELL * 2.5, y: Z_DIV },
  Z_corner: { x: Z_L, y: Z_DIV },
  Z_street_012: { x: Z_COL1, y: Z_DIV },
  Z_street_023: { x: Z_COL2, y: Z_DIV },
};

const N_L = OX;
const N_TOP = OY;
const N_DIV0 = N_TOP + CELL;
const N_DIV1 = N_DIV0 + CELL;
const N_BOT = N_DIV1 + CELL;
const N_R = N_L + GRID;
const N_MID = (N_L + N_R) / 2;
const N_C1 = N_L + CELL;
const N_C2 = N_L + CELL * 2;

function nFocusCenter(which: 1 | 2 | 3) {
  const x = which === 1 ? N_L + CELL / 2 : which === 2 ? N_MID : N_L + CELL * 2.5;
  const y = N_DIV0 + CELL / 2;
  return { x, y };
}

function buildNAnchors(which: 1 | 2 | 3): Partial<Record<ChipPos, { x: number; y: number }>> {
  const C = nFocusCenter(which);
  const yMid = C.y;
  const leftLine = which === 1 ? N_L : which === 2 ? N_C1 : N_C2;
  const rightLine = which === 1 ? N_C1 : which === 2 ? N_C2 : N_R;

  return {
    C,
    N: { x: C.x, y: N_DIV0 },
    S: { x: C.x, y: N_DIV1 },
    W: { x: leftLine, y: yMid },
    E: { x: rightLine, y: yMid },
    NW: { x: leftLine, y: N_DIV0 },
    NE: { x: rightLine, y: N_DIV0 },
    SW: { x: leftLine, y: N_DIV1 },
    SE: { x: rightLine, y: N_DIV1 },
    street: { x: N_L, y: yMid },
    six_N: { x: N_L, y: N_DIV0 },
    six_S: { x: N_L, y: N_DIV1 },
    Z_corner: { x: N_L, y: N_DIV0 },
    Z_street_012: { x: N_C1, y: N_DIV0 },
    Z_street_023: { x: N_C2, y: N_DIV0 },
    Z_S1: { x: N_L + CELL / 2, y: N_DIV0 },
    Z_S2: { x: N_MID, y: N_DIV0 },
    Z_S3: { x: N_L + CELL * 2.5, y: N_DIV0 },
    Z: { x: N_MID, y: N_TOP + CELL / 2 },
  };
}

const N1_ANCHORS = buildNAnchors(1);
const N2_ANCHORS = buildNAnchors(2);
const N3_ANCHORS = buildNAnchors(3);

function anchorsFor(family: GridFamily): Partial<Record<ChipPos, { x: number; y: number }>> {
  switch (family) {
    case 'zero':
      return ZERO_ANCHORS;
    case 'n1':
      return N1_ANCHORS;
    case 'n2':
      return N2_ANCHORS;
    case 'n3':
      return N3_ANCHORS;
    case 'left':
      return LEFT_ANCHORS;
    case 'right':
      return RIGHT_ANCHORS;
    case 'bottom34':
      return BOTTOM34_ANCHORS;
    case 'bottom35':
      return BOTTOM35_ANCHORS;
    case 'bottom36':
      return BOTTOM36_ANCHORS;
    case 'center':
    default:
      return CENTER_ANCHORS;
  }
}

function focusCellRect(family: GridFamily): { x: number; y: number; w: number; h: number } | null {
  switch (family) {
    case 'center':
      return { x: OX + CELL, y: OY + CELL, w: CELL, h: CELL };
    case 'left':
      return { x: OX, y: OY + CELL, w: CELL, h: CELL };
    case 'right':
      return { x: OX + CELL * 2, y: OY + CELL, w: CELL, h: CELL };
    case 'bottom34':
      return { x: OX, y: OY + CELL * 2, w: CELL, h: CELL };
    case 'bottom35':
      return { x: OX + CELL, y: OY + CELL * 2, w: CELL, h: CELL };
    case 'bottom36':
      return { x: OX + CELL * 2, y: OY + CELL * 2, w: CELL, h: CELL };
    case 'zero':
      return { x: Z_L, y: Z_TOP, w: GRID, h: CELL };
    case 'n1':
      return { x: N_L, y: N_DIV0, w: CELL, h: CELL };
    case 'n2':
      return { x: N_C1, y: N_DIV0, w: CELL, h: CELL };
    case 'n3':
      return { x: N_C2, y: N_DIV0, w: CELL, h: CELL };
    default:
      return null;
  }
}

function normalizeChip(c: DiagramChip): { pos: ChipPos; label?: string | number } {
  if (typeof c === 'string') return { pos: c };
  return c;
}

function Chip({
  x,
  y,
  label,
}: {
  x: number;
  y: number;
  label?: string | number;
}) {
  const r = label != null ? CELL * 0.2 : CELL * 0.16;
  const fontSize =
    label != null && String(label).length > 2 ? CELL * 0.16 : CELL * 0.2;

  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={r}
        fill="#e11d48"
        stroke="#9f1239"
        strokeWidth={0.55}
      />
      {label != null && (
        <text
          x={x}
          y={y + fontSize * 0.35}
          textAnchor="middle"
          fontSize={fontSize}
          fontWeight={700}
          fill="#fff"
        >
          {label}
        </text>
      )}
    </g>
  );
}

function FocusGrid() {
  return (
    <g>
      <rect
        x={OX}
        y={OY}
        width={GRID}
        height={GRID}
        fill="#f8fafc"
        stroke="#64748b"
        strokeWidth={1.25}
      />
      {[1, 2].map((i) => (
        <g key={i}>
          <line
            x1={OX + CELL * i}
            y1={OY}
            x2={OX + CELL * i}
            y2={OY + GRID}
            stroke="#64748b"
            strokeWidth={1}
          />
          <line
            x1={OX}
            y1={OY + CELL * i}
            x2={OX + GRID}
            y2={OY + CELL * i}
            stroke="#64748b"
            strokeWidth={1}
          />
        </g>
      ))}
    </g>
  );
}

function ZeroGrid() {
  return (
    <g>
      <rect
        x={Z_L}
        y={Z_TOP}
        width={GRID}
        height={CELL * 2}
        fill="#f8fafc"
        stroke="#64748b"
        strokeWidth={1.25}
      />
      <line x1={Z_L} y1={Z_DIV} x2={Z_R} y2={Z_DIV} stroke="#64748b" strokeWidth={1.15} />
      <line x1={Z_COL1} y1={Z_DIV} x2={Z_COL1} y2={Z_BOT} stroke="#64748b" strokeWidth={1} />
      <line x1={Z_COL2} y1={Z_DIV} x2={Z_COL2} y2={Z_BOT} stroke="#64748b" strokeWidth={1} />
    </g>
  );
}

function NGrid({ showZeroLabel }: { showZeroLabel: boolean }) {
  return (
    <g>
      <rect
        x={N_L}
        y={N_TOP}
        width={GRID}
        height={CELL * 3}
        fill="#f8fafc"
        stroke="#64748b"
        strokeWidth={1.25}
      />
      <line x1={N_L} y1={N_DIV0} x2={N_R} y2={N_DIV0} stroke="#64748b" strokeWidth={1.15} />
      <line x1={N_L} y1={N_DIV1} x2={N_R} y2={N_DIV1} stroke="#64748b" strokeWidth={1.15} />
      <line x1={N_C1} y1={N_DIV0} x2={N_C1} y2={N_BOT} stroke="#64748b" strokeWidth={1} />
      <line x1={N_C2} y1={N_DIV0} x2={N_C2} y2={N_BOT} stroke="#64748b" strokeWidth={1} />
      {showZeroLabel && (
        <text
          x={N_MID}
          y={N_TOP + CELL / 2 + 4}
          textAnchor="middle"
          fontSize={CELL * 0.38}
          fontWeight={700}
          fill="#16a34a"
        >
          0
        </text>
      )}
    </g>
  );
}

function Grid({ family }: { family: GridFamily }) {
  if (family === 'zero') return <ZeroGrid />;
  if (family === 'n1' || family === 'n2' || family === 'n3') {
    return <NGrid showZeroLabel />;
  }
  return <FocusGrid />;
}

/** Inset fill so grid strokes stay fully visible */
function FocusHighlight({ family }: { family: GridFamily }) {
  const r = focusCellRect(family);
  if (!r) return null;
  const inset = 1.35;
  return (
    <rect
      x={r.x + inset}
      y={r.y + inset}
      width={Math.max(0, r.w - inset * 2)}
      height={Math.max(0, r.h - inset * 2)}
      fill="rgba(56, 189, 248, 0.25)"
      stroke="none"
      rx={1.2}
      pointerEvents="none"
    />
  );
}

/** Redraw grid lines above highlight so they are never covered */
function GridLinesOnTop({ family }: { family: GridFamily }) {
  if (family === 'zero') {
    return (
      <g pointerEvents="none">
        <rect
          x={Z_L}
          y={Z_TOP}
          width={GRID}
          height={CELL * 2}
          fill="none"
          stroke="#64748b"
          strokeWidth={1.25}
        />
        <line x1={Z_L} y1={Z_DIV} x2={Z_R} y2={Z_DIV} stroke="#64748b" strokeWidth={1.15} />
        <line x1={Z_COL1} y1={Z_DIV} x2={Z_COL1} y2={Z_BOT} stroke="#64748b" strokeWidth={1} />
        <line x1={Z_COL2} y1={Z_DIV} x2={Z_COL2} y2={Z_BOT} stroke="#64748b" strokeWidth={1} />
      </g>
    );
  }

  if (family === 'n1' || family === 'n2' || family === 'n3') {
    return (
      <g pointerEvents="none">
        <rect
          x={N_L}
          y={N_TOP}
          width={GRID}
          height={CELL * 3}
          fill="none"
          stroke="#64748b"
          strokeWidth={1.25}
        />
        <line x1={N_L} y1={N_DIV0} x2={N_R} y2={N_DIV0} stroke="#64748b" strokeWidth={1.15} />
        <line x1={N_L} y1={N_DIV1} x2={N_R} y2={N_DIV1} stroke="#64748b" strokeWidth={1.15} />
        <line x1={N_C1} y1={N_DIV0} x2={N_C1} y2={N_BOT} stroke="#64748b" strokeWidth={1} />
        <line x1={N_C2} y1={N_DIV0} x2={N_C2} y2={N_BOT} stroke="#64748b" strokeWidth={1} />
      </g>
    );
  }

  return (
    <g pointerEvents="none">
      <rect
        x={OX}
        y={OY}
        width={GRID}
        height={GRID}
        fill="none"
        stroke="#64748b"
        strokeWidth={1.25}
      />
      {[1, 2].map((i) => (
        <g key={i}>
          <line
            x1={OX + CELL * i}
            y1={OY}
            x2={OX + CELL * i}
            y2={OY + GRID}
            stroke="#64748b"
            strokeWidth={1}
          />
          <line
            x1={OX}
            y1={OY + CELL * i}
            x2={OX + GRID}
            y2={OY + CELL * i}
            stroke="#64748b"
            strokeWidth={1}
          />
        </g>
      ))}
    </g>
  );
}

export default function ComboDiagram({
  family,
  chips,
  size = 300,
  highlightFocus = false,
}: ComboDiagramProps) {
  const anchors = anchorsFor(family);

  return (
    <svg
      width="100%"
      height="auto"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      style={{
        maxWidth: size,
        display: 'block',
        margin: '0 auto',
        borderRadius: 12,
      }}
    >
      <Grid family={family} />
      {highlightFocus && <FocusHighlight family={family} />}
      {highlightFocus && <GridLinesOnTop family={family} />}
      {chips.map((raw, i) => {
        const { pos, label } = normalizeChip(raw);
        const p = anchors[pos];
        if (!p) return null;
        return <Chip key={`${pos}-${i}`} x={p.x} y={p.y} label={label} />;
      })}
    </svg>
  );
}