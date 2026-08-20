export type GridFamily =
  | 'center'
  | 'left'
  | 'right'
  | 'bottom34'
  | 'bottom35'
  | 'bottom36'
  | 'n1'
  | 'n2'
  | 'n3'
  | 'zero';

export type ChipPos =
  | 'C'
  | 'Z'
  | 'N'
  | 'S'
  | 'E'
  | 'W'
  | 'NE'
  | 'NW'
  | 'SE'
  | 'SW'
  | 'street'
  | 'six_N'
  | 'six_S'
  | 'Z_S1'
  | 'Z_S2'
  | 'Z_S3'
  | 'Z_corner'
  | 'Z_street_012'
  | 'Z_street_023';

export interface StandardCombo {
  id: string;
  family: GridFamily;
  /** Explicit focus when useful for n1/n2/n3/zero; optional for center */
  focus?: 0 | 1 | 2 | 3 | number;
  chips: ChipPos[];
  answer: number;
}

export interface ComboStats {
  known: boolean;
  ease: number;
  reps: number;
  correct: number;
  wrong: number;
}