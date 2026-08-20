import { ChipPos } from '@/lib/standart-combos';

export type RouletteBet = {
  type: string;
  positions: string;
  count: number;
};

export function betToChipPos(
  winningNumber: number,
  bet: RouletteBet
): ChipPos | null {
  const { type, positions } = bet;
  const parts = positions.split('-').map((x) => Number(x.trim())).filter((x) => !Number.isNaN(x));

  if (type === 'Straight') {
    return winningNumber === 0 ? 'Z' : 'C';
  }

  if (type === 'Split') {
    if (winningNumber === 0) {
      if (positions === '0-1') return 'Z_S1';
      if (positions === '0-2') return 'Z_S2';
      if (positions === '0-3') return 'Z_S3';
      return null;
    }
    const other = parts.find((p) => p !== winningNumber);
    if (other == null) return null;
    if (other === 0) return 'N';
    if (other === winningNumber - 1) return 'W';
    if (other === winningNumber + 1) return 'E';
    if (other === winningNumber - 3) return 'N';
    if (other === winningNumber + 3) return 'S';
    return null;
  }

  if (type === 'Corner') {
    if (positions === '0-1-2-3' || (winningNumber === 0 && parts.includes(0))) {
      return 'Z_corner';
    }
    const set = new Set(parts);
    if (!set.has(winningNumber)) return null;

    const has = (x: number) => set.has(x);
    const n = winningNumber;

    // Corners relative to n on 3-col grid
    if (has(n - 3) && has(n - 1) && has(n - 4)) return 'NW';
    if (has(n - 3) && has(n + 1) && has(n - 2)) return 'NE';
    if (has(n + 3) && has(n - 1) && has(n + 2)) return 'SW';
    if (has(n + 3) && has(n + 1) && has(n + 4)) return 'SE';

    // Fallback by average of other three
    const others = parts.filter((p) => p !== n && p !== 0);
    if (others.length >= 2) {
      const avg = others.reduce((a, b) => a + b, 0) / others.length;
      const left = others.some((p) => p === n - 1 || p % 3 === (n - 1) % 3);
      const up = avg < n;
      if (up && left) return 'NW';
      if (up && !left) return 'NE';
      if (!up && left) return 'SW';
      return 'SE';
    }
    return 'SE';
  }

  if (type === 'Street') {
    if (positions === '0-1-2') return 'Z_street_012';
    if (positions === '0-2-3') return 'Z_street_023';
    return 'street';
  }

  if (type === 'SixLine') {
    if (winningNumber <= 3) return 'six_S';
    if (winningNumber >= 34) return 'six_N';
    const rowStart = Math.floor((winningNumber - 1) / 3) * 3 + 1;
    const start = Math.min(...parts);
    if (start < rowStart) return 'six_N';
    return 'six_S';
  }

  return null;
}

export function betsToStacks(
  winningNumber: number,
  bets: RouletteBet[]
): { pos: ChipPos; label: number }[] {
  const out: { pos: ChipPos; label: number }[] = [];
  for (const bet of bets) {
    const pos = betToChipPos(winningNumber, bet);
    if (pos) out.push({ pos, label: bet.count });
  }
  return out;
}