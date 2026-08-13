export interface RouletteTask {
  winningNumber: number;
  description: string;
  correctAnswer: number;
  imagePrompt: string;
  bets: Array<{ type: string; positions: string; count: number }>;
}

export interface TaskOptions {
  minBets?: number;
  maxBets?: number;
  minChips?: number;
  maxChips?: number;
  /** Rare high stacks (level 3) */
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

function randomChips(minChips: number, maxChips: number, rareMax?: number, rareChance = 0) {
  if (rareMax && rareChance > 0 && Math.random() < rareChance) {
    return randomInt(maxChips + 1, rareMax);
  }
  return randomInt(minChips, maxChips);
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

  // Slight bias toward 0–3
  const winningNumber =
    Math.random() < 0.18
      ? Math.floor(Math.random() * 4)
      : Math.floor(Math.random() * 37);

  const bets: Array<{ type: string; positions: string; count: number }> = [];
  const usedPositions = new Set<string>();

  const numBets = randomInt(minBets, maxBets);

  // 1. Straight always first
  bets.push({
    type: 'Straight',
    positions: winningNumber.toString(),
    count: randomChips(minChips, maxChips, rareMaxChips, rareChance),
  });
  usedPositions.add(winningNumber.toString());

  const betTypes = ['Split', 'Corner', 'Street', 'SixLine'];

  // Shuffle types so higher levels get variety
  const shuffledTypes = [...betTypes].sort(() => Math.random() - 0.5);

  let attempts = 0;
  while (bets.length < numBets && attempts < 40) {
    attempts += 1;
    const type = shuffledTypes[(bets.length - 1) % shuffledTypes.length];
    let positions = '';
    const count = randomChips(minChips, maxChips, rareMaxChips, rareChance);

    if (type === 'Split') {
      const possible: string[] = [];
      if (winningNumber === 0) {
        possible.push('0-1', '0-2', '0-3');
      } else {
        if (winningNumber % 3 !== 1) possible.push(`${winningNumber - 1}-${winningNumber}`);
        if (winningNumber % 3 !== 0) possible.push(`${winningNumber}-${winningNumber + 1}`);
        if (winningNumber > 3) possible.push(`${winningNumber - 3}-${winningNumber}`);
        if (winningNumber < 34) possible.push(`${winningNumber}-${winningNumber + 3}`);
        if (winningNumber === 1) possible.push('0-1');
        if (winningNumber === 2) possible.push('0-2');
        if (winningNumber === 3) possible.push('0-3');
      }
      if (possible.length > 0) {
        positions = possible[Math.floor(Math.random() * possible.length)];
      }
    } else if (type === 'Corner') {
      if (winningNumber === 0) {
        positions = '0-1-2-3';
      } else if (winningNumber === 1) {
        positions = Math.random() > 0.5 ? '0-1-2-3' : '1-2-4-5';
      } else if (winningNumber === 2) {
        const opts = ['0-1-2-3', '1-2-4-5', '2-3-5-6'];
        positions = opts[Math.floor(Math.random() * opts.length)];
      } else if (winningNumber === 3) {
        positions = Math.random() > 0.5 ? '0-1-2-3' : '2-3-5-6';
      } else if (winningNumber === 34) {
        positions = '31-32-34-35';
      } else if (winningNumber === 35) {
        const opts = ['31-32-34-35', '32-33-35-36'];
        positions = opts[Math.floor(Math.random() * opts.length)];
      } else if (winningNumber === 36) {
        positions = '33-34-35-36';
      } else {
        const col = (winningNumber - 1) % 3;
        const rowStart = Math.floor((winningNumber - 1) / 3) * 3 + 1;
        if (col === 0) {
          positions = `${rowStart}-${rowStart + 1}-${rowStart + 3}-${rowStart + 4}`;
        } else if (col === 1) {
          // middle: can be left or right corner
          positions =
            Math.random() > 0.5
              ? `${rowStart}-${rowStart + 1}-${rowStart + 3}-${rowStart + 4}`
              : `${rowStart + 1}-${rowStart + 2}-${rowStart + 4}-${rowStart + 5}`;
        } else {
          positions = `${rowStart + 1}-${rowStart + 2}-${rowStart + 4}-${rowStart + 5}`;
        }
      }
    } else if (type === 'Street') {
      if (winningNumber === 0) {
        positions = Math.random() > 0.5 ? '0-1-2' : '0-2-3';
      } else if (winningNumber === 1) {
        positions = Math.random() > 0.5 ? '0-1-2' : '1-2-3';
      } else if (winningNumber === 2) {
        const streets = ['0-1-2', '0-2-3', '1-2-3'];
        positions = streets[Math.floor(Math.random() * streets.length)];
      } else if (winningNumber === 3) {
        positions = Math.random() > 0.5 ? '0-2-3' : '1-2-3';
      } else {
        const rowStart = Math.floor((winningNumber - 1) / 3) * 3 + 1;
        positions = `${rowStart}-${rowStart + 1}-${rowStart + 2}`;
      }
    } else if (type === 'SixLine') {
      if (winningNumber <= 3) {
        positions = '1-6';
      } else if (winningNumber >= 34) {
        positions = '31-36';
      } else {
        const rowStart = Math.floor((winningNumber - 1) / 3) * 3 + 1;
        if (rowStart <= 1) {
          positions = '1-6';
        } else if (rowStart >= 34) {
          positions = '31-36';
        } else {
          positions =
            Math.random() > 0.5
              ? `${rowStart - 3}-${rowStart + 2}`
              : `${rowStart}-${rowStart + 5}`;
        }
      }
    }

    if (positions && !usedPositions.has(positions)) {
      bets.push({ type, positions, count });
      usedPositions.add(positions);
    }
  }

  let totalPayout = 0;
  const descriptionParts: string[] = [];

  // Keep order: Straight, Split, Corner, Street, SixLine
  const order = ['Straight', 'Split', 'Corner', 'Street', 'SixLine'];
  const sortedBets = [...bets].sort(
    (a, b) => order.indexOf(a.type) - order.indexOf(b.type)
  );

  sortedBets.forEach((bet) => {
    const multiplier = payoutMultipliers[bet.type] || 1;
    totalPayout += bet.count * multiplier;
    descriptionParts.push(`${bet.count} × ${bet.type} on ${bet.positions}`);
  });

  const description = `Winning number: **${winningNumber}**\n\n${descriptionParts.join('\n')}`;

  const imagePrompt = `Simple clean educational diagram of roulette table section around number ${winningNumber}.`;

  return {
    winningNumber,
    description,
    correctAnswer: totalPayout,
    imagePrompt,
    bets: sortedBets,
  };
}