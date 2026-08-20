'use client';

import { ChipPos, GridFamily } from '@/lib/standart-combos';

export type DiagramChip =
  | ChipPos
  | { pos: ChipPos; label?: string | number };

interface ComboDiagramProps {
  family: GridFamily;
  chips: DiagramChip[];
  size?: number;
}

const CELL = 22;
const OX = (100 - CELL * 3) / 2;
const OY = (100 - CELL * 3) / 2;

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

function buildFocusAnchors(): Partial<Record<ChipPos, { x: number; y: number }>> {
  return {
    C: cellCenter(1, 1),
    N: hEdge(1, 1),
    S: hEdge(1, 2),
    W: vEdge(1, 1),
    E: vEdge(2, 1),
    NW: cornerPt(1, 1),
    NE: cornerPt(2, 1),
    SW: cornerPt(1, 2),
    SE: cornerPt(2, 2),
    street: { x: OX, y: OY + CELL * 1.5 },
    six_N: { x: OX, y: OY + CELL * 1 },
    six_S: { x: OX, y: OY + CELL * 2 },
  };
}

const FOCUS_ANCHORS = buildFocusAnchors();

const Z_L = OX;
const Z_TOP = OY;
const Z_DIV = Z_TOP + CELL;
const Z_BOT = Z_DIV + CELL;
const Z_R = Z_L + CELL * 3;
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
const N_TOP = (100 - CELL * 3) / 2;
const N_DIV0 = N_TOP + CELL;
const N_DIV1 = N_DIV0 + CELL;
const N_BOT = N_DIV1 + CELL;
const N_R = N_L + CELL * 3;
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
  return {
    C,
    N: { x: C.x, y: N_DIV0 },
    S: { x: C.x, y: N_DIV1 },
    W: { x: which === 1 ? N_L : which === 2 ? N_C1 : N_C2, y: yMid },
    E: { x: which === 1 ? N_C1 : which === 2 ? N_C2 : N_R, y: yMid },
    NW: { x: which === 2 ? N_C1 : N_L, y: N_DIV0 },
    NE: { x: which === 2 ? N_C2 : N_R, y: N_DIV0 },
    SW: { x: which === 2 ? N_C1 : N_L, y: N_DIV1 },
    SE: { x: which === 2 ? N_C2 : N_R, y: N_DIV1 },
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

function anchorsFor(family: GridFamily) {
  switch (family) {
    case 'zero':
      return ZERO_ANCHORS;
    case 'n1':
      return N1_ANCHORS;
    case 'n2':
      return N2_ANCHORS;
    case 'n3':
      return N3_ANCHORS;
    default:
      return FOCUS_ANCHORS;
  }
}

function normalizeChip(
  c: DiagramChip
): { pos: ChipPos; label?: string | number } {
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
  const r = label != null ? 5.6 : 4.2;
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#e11d48" stroke="#9f1239" strokeWidth={0.5} />
      {label != null && (
        <text
          x={x}
          y={y + 1.4}
          textAnchor="middle"
          fontSize={label.toString().length > 2 ? 4.2 : 5}
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
        width={CELL * 3}
        height={CELL * 3}
        fill="#f8fafc"
        stroke="#64748b"
        strokeWidth={1.2}
      />
      {[1, 2].map((i) => (
        <g key={i}>
          <line
            x1={OX + CELL * i}
            y1={OY}
            x2={OX + CELL * i}
            y2={OY + CELL * 3}
            stroke="#64748b"
            strokeWidth={1}
          />
          <line
            x1={OX}
            y1={OY + CELL * i}
            x2={OX + CELL * 3}
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
        width={CELL * 3}
        height={CELL * 2}
        fill="#f8fafc"
        stroke="#64748b"
        strokeWidth={1.2}
      />
      <line x1={Z_L} y1={Z_DIV} x2={Z_R} y2={Z_DIV} stroke="#64748b" strokeWidth={1.1} />
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
        width={CELL * 3}
        height={CELL * 3}
        fill="#f8fafc"
        stroke="#64748b"
        strokeWidth={1.2}
      />
      <line x1={N_L} y1={N_DIV0} x2={N_R} y2={N_DIV0} stroke="#64748b" strokeWidth={1.1} />
      <line x1={N_L} y1={N_DIV1} x2={N_R} y2={N_DIV1} stroke="#64748b" strokeWidth={1.1} />
      <line x1={N_C1} y1={N_DIV0} x2={N_C1} y2={N_BOT} stroke="#64748b" strokeWidth={1} />
      <line x1={N_C2} y1={N_DIV0} x2={N_C2} y2={N_BOT} stroke="#64748b" strokeWidth={1} />
      {showZeroLabel && (
        <text
          x={N_MID}
          y={N_TOP + CELL / 2 + 4}
          textAnchor="middle"
          fontSize={10}
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

export default function ComboDiagram({ family, chips, size = 280 }: ComboDiagramProps) {
  const anchors = anchorsFor(family);

  return (
    <svg
      width="100%"
      height="auto"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      style={{ maxWidth: size, display: 'block', margin: '0 auto', borderRadius: 12 }}
    >
      <Grid family={family} />
      {chips.map((raw, i) => {
        const { pos, label } = normalizeChip(raw);
        const p = anchors[pos];
        if (!p) return null;
        return <Chip key={`${pos}-${i}`} x={p.x} y={p.y} label={label} />;
      })}
    </svg>
  );
}