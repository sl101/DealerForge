import { NeighborCard } from './types';

export const WHEEL_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5,
  24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
];

export const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

export function getNumberColor(n: number): string {
  if (typeof window !== 'undefined') {
    const style = getComputedStyle(document.documentElement);
    if (n === 0) return style.getPropertyValue('--number-green').trim() || '#16a34a';
    if (RED_NUMBERS.has(n)) return style.getPropertyValue('--number-red').trim() || '#dc2626';
    return style.getPropertyValue('--number-black').trim() || '#1e293b';
  }
  if (n === 0) return '#16a34a';
  if (RED_NUMBERS.has(n)) return '#dc2626';
  return '#1e293b';
}

export function getChipClass(n: number): string {
  if (n === 0) return 'chip chip-green';
  if (RED_NUMBERS.has(n)) return 'chip chip-red';
  return 'chip chip-black';
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

/** Neighbors in wheel order: left … center … right */
export function getNeighborsWheelOrder(
  number: number,
  count: 1 | 2
): { left: number[]; right: number[] } {
  const idx = WHEEL_ORDER.indexOf(number);
  if (idx === -1) return { left: [], right: [] };

  const len = WHEEL_ORDER.length;
  const left: number[] = [];
  const right: number[] = [];

  for (let i = count; i >= 1; i--) {
    left.push(WHEEL_ORDER[(idx - i + len) % len]);
  }
  for (let i = 1; i <= count; i++) {
    right.push(WHEEL_ORDER[(idx + i) % len]);
  }

  return { left, right };
}

export const NEIGHBOR_CARDS: NeighborCard[] = Array.from({ length: 37 }, (_, i) => ({
  number: i,
  neighbors1: getNeighbors(i, 1),
  neighbors2: getNeighbors(i, 2),
}));