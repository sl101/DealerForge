export interface RouletteTask {
  winningNumber: number;
  description: string;
  correctAnswer: number;
  imagePrompt: string;
}

const payoutMultipliers: Record<string, number> = {
  Straight: 35,
  Split: 17,
  Corner: 8,
  Street: 11,
  SixLine: 5,
};

export function generateRouletteTask(): RouletteTask {
  // Slight bias toward 0-3
  const winningNumber =
    Math.random() < 0.18
      ? Math.floor(Math.random() * 4)
      : Math.floor(Math.random() * 37);

  const bets: Array<{ type: string; positions: string; count: number }> = [];
  const usedPositions = new Set<string>();

  const numBets = Math.floor(Math.random() * 3) + 3; // 3–5 bets

  // 1. Straight (always first)
  bets.push({
    type: 'Straight',
    positions: winningNumber.toString(),
    count: Math.floor(Math.random() * 3) + 1,
  });
  usedPositions.add(winningNumber.toString());

  // Order of other bets
  const betTypes = ['Split', 'Corner', 'Street', 'SixLine'];

  for (let i = 0; i < numBets - 1; i++) {
    const type = betTypes[i % betTypes.length];
    let positions = '';
    const count = Math.floor(Math.random() * 4) + 1;

    // ---------- SPLIT ----------
    if (type === 'Split') {
      const possible: string[] = [];

      if (winningNumber === 0) {
        possible.push('0-1', '0-2', '0-3');
      } else {
        // Horizontal
        if (winningNumber % 3 !== 1) possible.push(`${winningNumber - 1}-${winningNumber}`);
        if (winningNumber % 3 !== 0) possible.push(`${winningNumber}-${winningNumber + 1}`);

        // Vertical
        if (winningNumber > 3) possible.push(`${winningNumber - 3}-${winningNumber}`);
        if (winningNumber < 34) possible.push(`${winningNumber}-${winningNumber + 3}`);

        // Special for 1,2,3 with zero
        if (winningNumber === 1) possible.push('0-1');
        if (winningNumber === 2) possible.push('0-2');
        if (winningNumber === 3) possible.push('0-3');
      }

      if (possible.length > 0) {
        positions = possible[Math.floor(Math.random() * possible.length)];
      }
    }

    // ---------- CORNER ----------
    else if (type === 'Corner') {
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
        positions = '32-33-35-36';
      } else if (winningNumber === 36) {
        positions = '33-34-35-36';
      } else {
        const col = (winningNumber - 1) % 3; // 0,1,2
        const rowStart = Math.floor((winningNumber - 1) / 3) * 3 + 1;

        if (col === 0) {
          // left column
          positions = `${rowStart}-${rowStart + 1}-${rowStart + 3}-${rowStart + 4}`;
        } else if (col === 1) {
          // middle
          positions = `${rowStart}-${rowStart + 1}-${rowStart + 3}-${rowStart + 4}`;
        } else {
          // right column
          positions = `${rowStart + 1}-${rowStart + 2}-${rowStart + 4}-${rowStart + 5}`;
        }
      }
    }

    // ---------- STREET ----------
    else if (type === 'Street') {
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
    }

    // ---------- SIX-LINE ----------
    else if (type === 'SixLine') {
      if (winningNumber <= 3) {
        positions = '1-6';
      } else if (winningNumber >= 34) {
        positions = '31-36';
      } else {
        const rowStart = Math.floor((winningNumber - 1) / 3) * 3 + 1;
        // Can be previous or next six-line
        if (rowStart === 1) {
          positions = '1-6';
        } else if (rowStart === 34) {
          positions = '31-36';
        } else {
          positions =
            Math.random() > 0.5
              ? `${rowStart - 3}-${rowStart + 2}`
              : `${rowStart}-${rowStart + 5}`;
        }
      }
    }

    // Add only if unique and valid
    if (positions && !usedPositions.has(positions)) {
      bets.push({ type, positions, count });
      usedPositions.add(positions);
    }
  }

  // Calculate total payout
  let totalPayout = 0;
  const descriptionParts: string[] = [];

  bets.forEach((bet) => {
    const multiplier = payoutMultipliers[bet.type] || 1;
    totalPayout += bet.count * multiplier;
    descriptionParts.push(`${bet.count} × ${bet.type} on ${bet.positions}`);
  });

  const description = `Winning number: **${winningNumber}**\n\n${descriptionParts.join('\n')}`;

  const imagePrompt = `Simple clean educational diagram of roulette table section around number ${winningNumber}. Show 3x3 grid with the winning number in the center. Mark the bets from the task with colored chip stacks. Clean minimalist style, white background, black grid lines, large readable numbers --ar 16:9`;

  return {
    winningNumber,
    description,
    correctAnswer: totalPayout,
    imagePrompt,
  };
}