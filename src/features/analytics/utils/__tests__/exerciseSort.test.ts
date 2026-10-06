import { nextSortMode, sortExerciseRows } from '../exerciseSort';
import type { ExerciseProgressRow } from '../progressData';

const ROWS: ExerciseProgressRow[] = [
  { exerciseId: 'squat', name: 'Squat', deltaPercent: 5, volumeShare: 0.5 },
  { exerciseId: 'bench', name: 'Bench', deltaPercent: 12, volumeShare: 0.2 },
  { exerciseId: 'row', name: 'Row', deltaPercent: null, volumeShare: 0.3 },
];

const ids = (rows: ExerciseProgressRow[]) => rows.map((row) => row.exerciseId);

describe('sortExerciseRows', () => {
  it('puts the most improved first and rows without a delta last', () => {
    expect(ids(sortExerciseRows(ROWS, 'improved'))).toEqual(['bench', 'squat', 'row']);
  });

  it('orders by volume share', () => {
    expect(ids(sortExerciseRows(ROWS, 'volume'))).toEqual(['squat', 'row', 'bench']);
  });

  it('orders by name', () => {
    expect(ids(sortExerciseRows(ROWS, 'name'))).toEqual(['bench', 'row', 'squat']);
  });

  it('does not mutate its input', () => {
    sortExerciseRows(ROWS, 'name');
    expect(ids(ROWS)).toEqual(['squat', 'bench', 'row']);
  });
});

describe('nextSortMode', () => {
  it('cycles improved → volume → name → improved', () => {
    expect(nextSortMode('improved')).toBe('volume');
    expect(nextSortMode('volume')).toBe('name');
    expect(nextSortMode('name')).toBe('improved');
  });
});
