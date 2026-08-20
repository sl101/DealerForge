import { GridFamily } from './types';

export function familyFromNumber(n: number): GridFamily {
  if (n === 0) return 'zero';
  if (n === 1) return 'n1';
  if (n === 2) return 'n2';
  if (n === 3) return 'n3';
  if (n === 34) return 'bottom34';
  if (n === 35) return 'bottom35';
  if (n === 36) return 'bottom36';
  if ([4, 7, 10, 13, 16, 19, 22, 25, 28, 31].includes(n)) return 'left';
  if ([6, 9, 12, 15, 18, 21, 24, 27, 30, 33].includes(n)) return 'right';
  return 'center';
}