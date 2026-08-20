import { StandardCombo, ChipPos, GridFamily } from './types';
import { computeAnswer } from './payout';

type Raw = {
  id: string;
  family: GridFamily;
  focus?: StandardCombo['focus'];
  chips: ChipPos[];
};

/**
 * Catalog after user review (photo mapping + focus rules).
 * answer = computeAnswer(chips) — source of truth.
 */
const RAW: Raw[] = [
  // ----- CENTER (photo 1) -----
  { id: 'sc-c-01', family: 'center', chips: ['C', 'N'] }, // 52
  { id: 'sc-c-02', family: 'center', chips: ['C', 'SW'] }, // 43
  { id: 'sc-c-03', family: 'center', chips: ['W', 'C', 'E'] }, // 69
  { id: 'sc-c-04', family: 'center', chips: ['C', 'NW', 'NE', 'SW', 'SE'] }, // 67
  { id: 'sc-c-05', family: 'center', chips: ['NW', 'N', 'NE'] }, // 33
  { id: 'sc-c-06', family: 'center', chips: ['NW', 'N', 'W', 'C', 'SW', 'S'] }, // 102
  { id: 'sc-c-07', family: 'center', chips: ['W', 'C', 'E', 'S'] }, // 86
  {
    id: 'sc-c-08',
    family: 'center',
    chips: ['NW', 'N', 'NE', 'W', 'E', 'SW', 'S', 'SE'],
  }, // 100
  { id: 'sc-c-09', family: 'center', chips: ['NW', 'NE', 'SW', 'SE'] }, // 32
  { id: 'sc-c-10', family: 'center', chips: ['N', 'S', 'W'] }, // 51
  { id: 'sc-c-11', family: 'center', chips: ['C', 'N', 'S', 'W', 'E'] }, // 103
  { id: 'sc-c-12', family: 'center', chips: ['C', 'N', 'NW', 'NE'] }, // 68

  // ----- CENTER edge (photo 2) -----
  { id: 'sc-c-13', family: 'center', chips: ['street', 'six_N', 'six_S'] }, // 21
  { id: 'sc-c-14', family: 'center', chips: ['N', 'NW', 'NE'] }, // 33
  { id: 'sc-c-15', family: 'center', chips: ['NW', 'NE', 'six_N'] }, // 21
  { id: 'sc-c-16', family: 'center', chips: ['C', 'NE', 'SE'] }, // 51
  { id: 'sc-c-17', family: 'center', chips: ['N', 'NW'] }, // 25
  { id: 'sc-c-18', family: 'center', chips: ['C', 'S', 'SW'] }, // 60
  { id: 'sc-c-19', family: 'center', chips: ['N', 'NE', 'six_N'] }, // 30
  { id: 'sc-c-20', family: 'center', chips: ['N', 'six_N'] }, // 22
  { id: 'sc-c-21', family: 'center', chips: ['street', 'C'] }, // 46
  { id: 'sc-c-22', family: 'center', chips: ['NE', 'street'] }, // 19
  { id: 'sc-c-23', family: 'center', chips: ['N', 'street'] }, // 28
  { id: 'sc-c-24', family: 'center', chips: ['NE', 'six_N'] }, // 13

  // ----- ZERO / n2 (photos 3–4) -----
  {
    id: 'sc-z-25',
    family: 'zero',
    focus: 0,
    chips: ['Z_S1', 'Z_S2', 'Z_S3'],
  }, // 51
  {
    id: 'sc-n2-26',
    family: 'n2',
    focus: 2,
    chips: ['Z_street_012', 'SW'],
  }, // 19
  {
    id: 'sc-z-27',
    family: 'zero',
    focus: 0,
    chips: ['Z', 'Z_S1', 'Z_S2', 'Z_S3'],
  }, // 86
  {
    id: 'sc-n2-28',
    family: 'n2',
    focus: 2,
    chips: ['Z_S2', 'Z_street_012', 'Z_street_023', 'street'],
  }, // 50
  {
    id: 'sc-n2-29',
    family: 'n2',
    focus: 2,
    chips: ['Z_street_012', 'Z_street_023', 'C'],
  }, // 57
  {
    id: 'sc-n2-30',
    family: 'n2',
    focus: 2,
    chips: ['Z_street_012', 'Z_street_023', 'N', 'S'],
  }, // 56
  {
    id: 'sc-z-31',
    family: 'zero',
    focus: 0,
    chips: ['Z_S1', 'Z_S2', 'Z_S3', 'Z_street_012', 'Z_street_023'],
  }, // 73
  {
    id: 'sc-n2-32',
    family: 'n2',
    focus: 2,
    chips: ['N', 'S', 'E', 'W', 'Z_street_012', 'Z_street_023', 'SE', 'SW'],
  }, // 106
  {
    id: 'sc-z-33',
    family: 'zero',
    focus: 0,
    chips: ['Z', 'Z_S1', 'Z_S2', 'Z_S3', 'Z_street_012', 'Z_street_023'],
  }, // 108
  {
    id: 'sc-n2-34',
    family: 'n2',
    focus: 2,
    chips: ['Z_corner', 'N', 'S'],
  }, // 42
  {
    id: 'sc-n2-35',
    family: 'n2',
    focus: 2,
    chips: ['Z_street_012', 'Z_street_023', 'six_S'],
  }, // 27
  {
    id: 'sc-n2-36',
    family: 'n2',
    focus: 2,
    chips: ['C', 'N', 'Z_street_023'],
  }, // 63

  { id: 'sc-z-37', family: 'zero', focus: 0, chips: ['Z_corner', 'Z'] }, // 43
  {
    id: 'sc-z-38',
    family: 'zero',
    focus: 0,
    chips: ['Z_S2', 'Z_street_012', 'Z_street_023'],
  }, // 39 — focus 0 or 2 indifferent
  {
    id: 'sc-z-39',
    family: 'zero',
    focus: 0,
    chips: ['Z_corner', 'Z_street_012', 'Z_street_023'],
  }, // 30
  {
    id: 'sc-z-40',
    family: 'zero',
    focus: 0,
    chips: ['Z', 'Z_street_012', 'Z_street_023'],
  }, // 57
  {
    id: 'sc-z-41',
    family: 'zero',
    focus: 0,
    chips: ['Z_S2', 'Z_street_012'],
  }, // 28
  {
    id: 'sc-z-42',
    family: 'zero',
    focus: 0,
    chips: ['Z', 'Z_S2', 'Z_corner'],
  }, // 60
  {
    id: 'sc-z-43',
    family: 'zero',
    focus: 0,
    chips: ['Z_corner', 'Z_S1', 'Z_street_012'],
  }, // 36
  {
    id: 'sc-z-44',
    family: 'zero',
    focus: 0,
    chips: ['Z_corner', 'Z_S2'],
  }, // 25
  {
    id: 'sc-z-45',
    family: 'zero',
    focus: 0,
    chips: ['Z', 'Z_street_023'],
  }, // 46
  {
    id: 'sc-z-46',
    family: 'zero',
    focus: 0,
    chips: ['Z_corner', 'Z_street_012'],
  }, // 19
  {
    id: 'sc-n2-47',
    family: 'n2',
    focus: 2,
    chips: ['N', 'Z_street_023'],
  }, // 28
  {
    id: 'sc-z-48',
    family: 'zero',
    focus: 0,
    chips: ['Z_street_012', 'Z_street_023'],
  }, // 22
  {
    id: 'sc-z-49',
    family: 'zero',
    focus: 0,
    chips: ['Z', 'Z_S1', 'Z_S2', 'Z_S3', 'Z_street_012', 'Z_street_023', 'Z_corner'],
  }, // 116
];

export const STANDARD_COMBOS: StandardCombo[] = RAW.map((r) => ({
  ...r,
  answer: computeAnswer(r.chips),
}));

export const TOTAL_COMBOS = STANDARD_COMBOS.length;