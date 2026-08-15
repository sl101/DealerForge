export type Multiplier = 5 | 8 | 11 | 17 | 35;

export interface Fact {
  id: string; // "17x12"
  multiplier: Multiplier;
  factor: number; // 2..20
  answer: number;
}

export interface FactStats {
  correct: number;
  wrong: number;
  streak: number;
  lastSeen: number;
  ease: number;
}