import { NeighborCard } from './types';

// Standard European roulette wheel order
const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
];

export const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36
]);

export function getNumberColor(n: number): string {
  if (n === 0) return '#22c55e';      // --number-green
  if (RED_NUMBERS.has(n)) return '#ef4444'; // --number-red
  return '#1e293b';                 // --number-black
}

function getNeighbors(number: number, count: 1 | 2): number[] {
  const idx = WHEEL_ORDER.indexOf(number);
  if (idx === -1) return [];

  const result: number[] = [];
  const len = WHEEL_ORDER.length;

  for (let i = 1; i <= count; i++) {
    result.push(WHEEL_ORDER[(idx - i + len) % len]);
    result.push(WHEEL_ORDER[(idx + i) % len]);
  }

  return result.sort((a, b) => a - b);
}

export const NEIGHBOR_CARDS: NeighborCard[] = Array.from({ length: 37 }, (_, i) => ({
  number: i,
  neighbors1: getNeighbors(i, 1),
  neighbors2: getNeighbors(i, 2),
}));