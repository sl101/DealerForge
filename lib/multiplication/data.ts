import { Fact, Multiplier } from './types';

export const MULTIPLIERS: Multiplier[] = [5, 8, 11, 17, 35];
export const FACTORS = Array.from({ length: 19 }, (_, i) => i + 2); // 2..20

export function buildFacts(selected: Multiplier[] = MULTIPLIERS): Fact[] {
  const facts: Fact[] = [];
  for (const m of selected) {
    for (const f of FACTORS) {
      facts.push({
        id: `${m}x${f}`,
        multiplier: m,
        factor: f,
        answer: m * f,
      });
    }
  }
  return facts;
}

export function allFacts(): Fact[] {
  return buildFacts(MULTIPLIERS);
}

/** Table rows for one multiplier */
export function tableFor(m: Multiplier): { factor: number; answer: number }[] {
  return FACTORS.map((f) => ({ factor: f, answer: m * f }));
}