export interface NeighborCard {
  number: number;
  neighbors1: number[]; // 1/1
  neighbors2: number[]; // 2/2
}

export interface NumberStats {
  number: number;
  correct: number;
  wrong: number;
  ease: number;
  interval: number;
  nextReview: number;
  lastSeen: number;
}

export type Depth = '1/1' | '2/2';
export type Direction = 'number-first' | 'neighbors-first';
