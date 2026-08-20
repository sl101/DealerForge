import { ChipPos } from './types';

const MULT: Record<ChipPos, number> = {
  C: 35,
  Z: 35,
  N: 17,
  S: 17,
  E: 17,
  W: 17,
  Z_S1: 17,
  Z_S2: 17,
  Z_S3: 17,
  NE: 8,
  NW: 8,
  SE: 8,
  SW: 8,
  Z_corner: 8,
  street: 11,
  Z_street_012: 11,
  Z_street_023: 11,
  six_N: 5,
  six_S: 5,
};

export function computeAnswer(chips: ChipPos[]): number {
  return chips.reduce((sum, c) => sum + (MULT[c] ?? 0), 0);
}