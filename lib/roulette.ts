export interface Bet {
  type: 'Straight' | 'Split' | 'Street' | 'Corner' | 'SixLine';
  positions: string;
  chips: number;
}

export interface RouletteTask {
  id: string;
  winningNumber: number;
  description: string;
  bets: Bet[];
  correctAnswer: number;
  difficulty: string;
  imagePrompt: string;
}

const betPayouts = {
  Straight: 35,
  Split: 17,
  Street: 11,
  Corner: 8,
  SixLine: 5,
};

// Valid adjacent numbers for Split
function getValidSplits(num: number): string[] {
  const splits: string[] = [];

  // Horizontal neighbors
  if (num % 3 !== 0) splits.push(`${num}-${num + 1}`);           // right
  if (num % 3 !== 1) splits.push(`${num - 1}-${num}`);           // left

  // Vertical neighbors
  if (num > 3) splits.push(`${num - 3}-${num}`);                 // above
  if (num < 34) splits.push(`${num}-${num + 3}`);                // below

  // Special zero area
  if (num === 0) {
    splits.push('0-1', '0-2', '0-3');
  }
  if (num === 1 || num === 2 || num === 3) {
    splits.push('0-1', '0-2', '0-3');
  }

  return [...new Set(splits)]; // unique
}

function getStreetPositions(num: number): string {
  if (num === 0) return '0-1-2';
  if (num <= 3) return '1-2-3';
  const start = Math.floor((num - 1) / 3) * 3 + 1;
  return `${start}-${start + 1}-${start + 2}`;
}

function getCornerPositions(num: number): string {
  if (num === 0) return '0-1-2-3';
  if (num <= 3) return '0-1-2-3';

  if (num % 3 === 1) return `${num}-${num + 1}-${num + 3}-${num + 4}`;
  if (num % 3 === 2) return `${num - 1}-${num}-${num + 2}-${num + 3}`;
  return `${num - 2}-${num - 1}-${num + 1}-${num + 2}`;
}

function getSixLinePositions(num: number): string {
  if (num <= 6) return '1-6';
  const start = Math.floor((num - 1) / 6) * 6 + 1;
  return `${start}-${start + 5}`;
}

export function generateRouletteTask(): RouletteTask {
  let winningNumber = Math.floor(Math.random() * 37);
  if (Math.random() < 0.28) winningNumber = Math.floor(Math.random() * 4);

  const bets: Bet[] = [];
  const usedPositions = new Set<string>();

  // Straight always first
  const straightPos = winningNumber.toString();
  bets.push({ type: 'Straight', positions: straightPos, chips: Math.floor(Math.random() * 4) + 2 });
  usedPositions.add(straightPos);

  // Bet generators in desired order
  const betGenerators = [
    { type: 'Split' as const, getPositions: () => {
      const valid = getValidSplits(winningNumber);
      return valid[Math.floor(Math.random() * valid.length)] || `${winningNumber}-${winningNumber + 1}`;
    }},
    { type: 'Split' as const, getPositions: () => {
      const valid = getValidSplits(winningNumber);
      return valid[Math.floor(Math.random() * valid.length)] || `${winningNumber}-${winningNumber + 1}`;
    }},
    { type: 'Corner' as const, getPositions: () => getCornerPositions(winningNumber) },
    { type: 'Street' as const, getPositions: () => getStreetPositions(winningNumber) },
    { type: 'SixLine' as const, getPositions: () => getSixLinePositions(winningNumber) },
  ];

  const numAdditional = Math.floor(Math.random() * 3) + 2;

  for (let i = 0; i < numAdditional; i++) {
    for (const gen of betGenerators) {
      const pos = gen.getPositions();
      if (!usedPositions.has(pos) && pos.includes(winningNumber.toString())) {
        usedPositions.add(pos);
        bets.push({
          type: gen.type,
          positions: pos,
          chips: Math.floor(Math.random() * 4) + 1,
        });
        break;
      }
    }
  }

  const totalPayout = bets.reduce((sum, bet) => sum + bet.chips * betPayouts[bet.type], 0);

  // Fixed order: Straight, Split, Corner, Street, Six-Line
  const orderedBets = [...bets].sort((a, b) => {
    const order = ['Straight', 'Split', 'Corner', 'Street', 'SixLine'];
    return order.indexOf(a.type) - order.indexOf(b.type);
  });

  const description = `Winning number: **${winningNumber}**\n\n` +
    orderedBets.map(b => `${b.chips} × ${b.type} on ${b.positions}`).join('\n\n');

  const imagePrompt = `Close-up realistic roulette table, yellow casino chips stacked on bets covering winning number ${winningNumber}: ${orderedBets.map(b => `${b.chips} ${b.type} chips at ${b.positions}`).join(', ')}. Dolly marker placed exactly on number ${winningNumber}. Professional casino lighting, detailed top-down view, high quality.`;

  return {
    id: Date.now().toString(),
    winningNumber,
    description,
    bets,
    correctAnswer: totalPayout,
    difficulty: totalPayout > 450 ? 'Hard' : totalPayout > 250 ? 'Medium' : 'Easy',
    imagePrompt,
  };
}