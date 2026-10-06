import type { BodyWeightEntry } from '../../entities/BodyWeight';
import {
  dayStartOf,
  isoDay,
  latestEntry,
  mergeBodyWeight,
  weeklyAverageWeights,
  weightChange,
} from '../bodyWeight';

const entry = (date: string, weightKg: number, updatedAt = 1, deleted?: boolean): BodyWeightEntry => ({
  date,
  weightKg,
  updatedAt,
  ...(deleted ? { deleted } : {}),
});

// Wednesday 17 April 2024.
const NOW = new Date(2024, 3, 17, 12).getTime();

describe('isoDay', () => {
  it('formats the local day, zero-padded, and round-trips', () => {
    const ts = new Date(2024, 0, 5, 23, 30).getTime();
    expect(isoDay(ts)).toBe('2024-01-05');
    expect(dayStartOf('2024-01-05')).toBe(new Date(2024, 0, 5).getTime());
  });
});

describe('latestEntry and weightChange', () => {
  const entries = [entry('2024-03-10', 82), entry('2024-04-10', 80.5), entry('2024-04-16', 80), entry('2024-04-17', 79, 1, true)];

  it('ignores removed entries', () => {
    expect(latestEntry(entries)?.date).toBe('2024-04-16');
  });

  it('compares the latest entry with the last one at least N days old', () => {
    expect(weightChange(entries, 30, NOW)).toBe(-2);
    expect(weightChange([entry('2024-04-16', 80)], 30, NOW)).toBeNull();
  });
});

describe('weeklyAverageWeights', () => {
  it('averages each Monday-first week, oldest first, across a DST change', () => {
    const weeks = weeklyAverageWeights(
      [entry('2024-03-09', 84), entry('2024-03-11', 83), entry('2024-03-12', 81), entry('2024-04-16', 80)],
      NOW,
      6,
    );
    // Weeks start 11 Mar, 18 Mar, 25 Mar, 1 Apr, 8 Apr, 15 Apr; 9 Mar is too early.
    expect(weeks).toEqual([82, null, null, null, null, 80]);
  });
});

describe('mergeBodyWeight', () => {
  it('keeps the newer edit per day and uploads local wins', () => {
    const merge = mergeBodyWeight(
      [entry('2024-04-15', 80, 10), entry('2024-04-16', 79.5, 1)],
      [entry('2024-04-15', 81, 5), entry('2024-04-16', 79.8, 7), entry('2024-04-14', 80.2, 3)],
    );

    expect(merge.entries.map((e) => [e.date, e.weightKg])).toEqual([
      ['2024-04-14', 80.2],
      ['2024-04-15', 80],
      ['2024-04-16', 79.8],
    ]);
    expect(merge.toUpload.map((e) => e.date)).toEqual(['2024-04-15']);
  });

  it('carries a newer local removal to the cloud', () => {
    const merge = mergeBodyWeight([entry('2024-04-15', 80, 9, true)], [entry('2024-04-15', 80, 5)]);
    expect(merge.toUpload[0].deleted).toBe(true);
  });
});
