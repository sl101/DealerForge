export interface RouletteBet {
  type: 'Straight' | 'Split' | 'Corner' | 'Street' | 'SixLine';
  positions: string;
  count: number;
}

export interface RouletteTask {
  winningNumber: number;
  description: string;
  correctAnswer: number;
  imagePrompt: string;
  bets: RouletteBet[];
}

export interface TaskOptions {
  minBets?: number;
  maxBets?: number;
  minChips?: number;
  maxChips?: number;
  rareMaxChips?: number;
  rareChance?: number;
}

const payoutMultipliers: Record<string, number> = {
  Straight: 35,
  Split: 17,
  Corner: 8,
  Street: 11,
  SixLine: 5,
};

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomChips(
  minChips: number,
  maxChips: number,
  rareMax?: number,
  rareChance = 0
) {
  if (rareMax && rareChance > 0 && Math.random() < rareChance) {
    return randomInt(maxChips + 1, rareMax);
  }
  return randomInt(minChips, maxChips);
}

/** All valid corners that include number n (American layout). */
export function cornersFor(n: number): string[] {
  if (n === 0) return ['0-1-2-3'];
  if (n === 1) return ['0-1-2-3', '1-2-4-5'];
  if (n === 2) return ['0-1-2-3', '1-2-4-5', '2-3-5-6'];
  if (n === 3) return ['0-1-2-3', '2-3-5-6'];

  if (n === 34) return ['31-32-34-35'];
  if (n === 35) return ['31-32-34-35', '32-33-35-36'];
  if (n === 36) return ['32-33-35-36'];

  const col = (n - 1) % 3;
  const row = Math.floor((n - 1) / 3);
  const at = (r: number, c: number) => r * 3 + c + 1;
  const pack = (a: number, b: number, c: number, d: number) =>
    [a, b, c, d].sort((x, y) => x - y).join('-');

  const list: string[] = [];

  if (col > 0 && row > 0) {
    list.push(pack(at(row - 1, col - 1), at(row - 1, col), at(row, col - 1), n));
  }
  if (col < 2 && row > 0) {
    list.push(pack(at(row - 1, col), at(row - 1, col + 1), n, at(row, col + 1)));
  }
  if (col > 0 && row < 11) {
    list.push(pack(at(row, col - 1), n, at(row + 1, col - 1), at(row + 1, col)));
  }
  if (col < 2 && row < 11) {
    list.push(pack(n, at(row, col + 1), at(row + 1, col), at(row + 1, col + 1)));
  }

  return list;
}

export function splitsFor(n: number): string[] {
  if (n === 0) return ['0-1', '0-2', '0-3'];
  const list: string[] = [];
  const col = (n - 1) % 3;
  if (col !== 0) list.push(`${n - 1}-${n}`);
  if (col !== 2) list.push(`${n}-${n + 1}`);
  if (n > 3) list.push(`${n - 3}-${n}`);
  if (n < 34) list.push(`${n}-${n + 3}`);
  if (n === 1) list.push('0-1');
  if (n === 2) list.push('0-2');
  if (n === 3) list.push('0-3');
  return list;
}

export function streetsFor(n: number): string[] {
  if (n === 0) return ['0-1-2', '0-2-3'];
  if (n === 1) return ['0-1-2', '1-2-3'];
  if (n === 2) return ['0-1-2', '0-2-3', '1-2-3'];
  if (n === 3) return ['0-2-3', '1-2-3'];
  const rowStart = Math.floor((n - 1) / 3) * 3 + 1;
  return [`${rowStart}-${rowStart + 1}-${rowStart + 2}`];
}

export function sixLinesFor(n: number): string[] {
  if (n === 0) return [];
  if (n <= 3) return ['1-6'];
  if (n >= 34) return ['31-36'];
  const rowStart = Math.floor((n - 1) / 3) * 3 + 1;
  const list: string[] = [];
  if (rowStart > 1) list.push(`${rowStart - 3}-${rowStart + 2}`);
  if (rowStart + 5 <= 36) list.push(`${rowStart}-${rowStart + 5}`);
  return list;
}

/** Every inside bet that includes n, count = 1 each (for Verify mode). */
export function allBetsForNumber(n: number): RouletteBet[] {
  const bets: RouletteBet[] = [];
  bets.push({ type: 'Straight', positions: String(n), count: 1 });
  for (const p of splitsFor(n)) bets.push({ type: 'Split', positions: p, count: 1 });
  for (const p of cornersFor(n)) bets.push({ type: 'Corner', positions: p, count: 1 });
  for (const p of streetsFor(n)) bets.push({ type: 'Street', positions: p, count: 1 });
  for (const p of sixLinesFor(n)) bets.push({ type: 'SixLine', positions: p, count: 1 });
  return bets;
}

export function totalForBets(bets: RouletteBet[]): number {
  return bets.reduce((sum, b) => sum + b.count * (payoutMultipliers[b.type] || 1), 0);
}

export function generateRouletteTask(options: TaskOptions = {}): RouletteTask {
  const {
    minBets = 3,
    maxBets = 5,
    minChips = 1,
    maxChips = 4,
    rareMaxChips,
    rareChance = 0,
  } = options;

  const winningNumber =
    Math.random() < 0.18
      ? Math.floor(Math.random() * 4)
      : Math.floor(Math.random() * 37);

  const bets: RouletteBet[] = [];
  const usedPositions = new Set<string>();

  const numBets = randomInt(minBets, maxBets);

  bets.push({
    type: 'Straight',
    positions: winningNumber.toString(),
    count: randomChips(minChips, maxChips, rareMaxChips, rareChance),
  });
  usedPositions.add(winningNumber.toString());

  const betTypes: RouletteBet['type'][] = ['Split', 'Corner', 'Street', 'SixLine'];
  const shuffledTypes = [...betTypes].sort(() => Math.random() - 0.5);

  let attempts = 0;
  while (bets.length < numBets && attempts < 50) {
    attempts += 1;
    const type = shuffledTypes[(bets.length - 1) % shuffledTypes.length];
    const count = randomChips(minChips, maxChips, rareMaxChips, rareChance);

    let candidates: string[] = [];
    if (type === 'Split') candidates = splitsFor(winningNumber);
    else if (type === 'Corner') candidates = cornersFor(winningNumber);
    else if (type === 'Street') candidates = streetsFor(winningNumber);
    else if (type === 'SixLine') candidates = sixLinesFor(winningNumber);

    const free = candidates.filter((p) => p && !usedPositions.has(p));
    if (free.length === 0) continue;

    const positions = free[Math.floor(Math.random() * free.length)];
    bets.push({ type, positions, count });
    usedPositions.add(positions);
  }

  const order = ['Straight', 'Split', 'Corner', 'Street', 'SixLine'];
  const sortedBets = [...bets].sort(
    (a, b) => order.indexOf(a.type) - order.indexOf(b.type)
  );

  let totalPayout = 0;
  const descriptionParts: string[] = [];
  sortedBets.forEach((bet) => {
    totalPayout += bet.count * (payoutMultipliers[bet.type] || 1);
    descriptionParts.push(`${bet.count} × ${bet.type} on ${bet.positions}`);
  });

  return {
    winningNumber,
    description: `Winning number: **${winningNumber}**\n\n${descriptionParts.join('\n')}`,
    correctAnswer: totalPayout,
    imagePrompt: `Roulette section around ${winningNumber}`,
    bets: sortedBets,
  };
}	