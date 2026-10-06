import type { Set } from '../../entities/Set';
import { defaultIncrementKg, nextPrescription, type ProgressionInput } from '../progression';

function set(weightKg: number, reps: number, extra: Partial<Set> = {}): Set {
  return {
    id: `${weightKg}-${reps}-${Math.random()}`,
    exerciseId: 'e',
    workoutId: 'w',
    weightKg,
    reps,
    type: 'normal',
    completed: true,
    completedAt: 1,
    order: 0,
    ...extra,
  };
}

const sets = (weightKg: number, ...reps: number[]) => reps.map((r) => set(weightKg, r));

function input(overrides: Partial<ProgressionInput>): ProgressionInput {
  return {
    policy: 'linear',
    kind: 'load',
    targetSets: 3,
    targetReps: 8,
    incrementKg: 2.5,
    sessions: [],
    ...overrides,
  };
}

describe('nextPrescription', () => {
  it('prescribes nothing when off or without history', () => {
    expect(nextPrescription(input({ policy: 'off', sessions: [sets(80, 8, 8, 8)] }))).toBeNull();
    expect(nextPrescription(input({ sessions: [] }))).toBeNull();
  });

  describe('linear', () => {
    it('adds weight after every target rep was hit', () => {
      expect(nextPrescription(input({ sessions: [sets(80, 8, 8, 8)] }))).toEqual({
        weightKg: 82.5,
        reps: 8,
        reason: 'progressed',
        change: 2.5,
      });
    });

    it('holds the weight after a miss', () => {
      expect(nextPrescription(input({ sessions: [sets(80, 8, 8, 6)] }))).toMatchObject({
        weightKg: 80,
        reason: 'held',
        change: 0,
      });
    });

    it('needs every planned set, not just the logged ones', () => {
      expect(nextPrescription(input({ sessions: [sets(80, 8, 8)] }))?.reason).toBe('held');
    });

    it('deloads by 10% after three missed sessions at one weight', () => {
      const missed = sets(100, 8, 7, 6);
      expect(nextPrescription(input({ sessions: [missed, missed, missed] }))).toMatchObject({
        weightKg: 90,
        reason: 'deload',
        change: -10,
      });
    });

    it('does not deload when the misses were at different weights', () => {
      const sessions = [sets(100, 8, 7, 6), sets(97.5, 8, 7, 6), sets(97.5, 8, 7, 6)];
      expect(nextPrescription(input({ sessions }))?.reason).toBe('held');
    });
  });

  describe('double progression', () => {
    it('aims one rep above the weakest set inside the range', () => {
      expect(nextPrescription(input({ policy: 'double', sessions: [sets(60, 10, 9, 9)] }))).toMatchObject({
        weightKg: 60,
        reps: 10,
        reason: 'reps_up',
        change: 1,
      });
    });

    it('adds weight and drops to the bottom once every set reaches the top', () => {
      expect(nextPrescription(input({ policy: 'double', sessions: [sets(60, 12, 12, 12)] }))).toMatchObject({
        weightKg: 62.5,
        reps: 8,
        reason: 'progressed',
      });
    });

    it('honours a custom range top', () => {
      const result = nextPrescription(input({ policy: 'double', repRangeMax: 10, sessions: [sets(60, 10, 10, 10)] }));
      expect(result?.reason).toBe('progressed');
    });
  });

  describe('bodyweight and timed', () => {
    it('adds a rep to an unloaded bodyweight exercise', () => {
      expect(nextPrescription(input({ kind: 'bodyweight', sessions: [sets(0, 12, 10, 9)] }))).toMatchObject({
        weightKg: 0,
        reps: 10,
        reason: 'reps_up',
      });
    });

    it('treats a bodyweight exercise with added load like a loaded one', () => {
      expect(nextPrescription(input({ kind: 'bodyweight', sessions: [sets(10, 8, 8, 8)] }))).toMatchObject({
        weightKg: 12.5,
        reason: 'progressed',
      });
    });

    it('caps bodyweight reps at the top of a double range', () => {
      const result = nextPrescription(input({ policy: 'double', kind: 'bodyweight', sessions: [sets(0, 12, 12, 12)] }));
      expect(result).toMatchObject({ reps: 12, reason: 'held' });
    });

    it('adds five seconds to a timed exercise after all sets were done', () => {
      const holds = [0, 0, 0].map((_, i) => set(0, 0, { durationSec: 40 + i * 5 }));
      expect(nextPrescription(input({ kind: 'timed', sessions: [holds] }))).toEqual({
        weightKg: 0,
        reps: 0,
        durationSec: 45,
        reason: 'hold_up',
        change: 5,
      });
    });
  });
});

describe('defaultIncrementKg', () => {
  it('uses 2.5 kg for bars and machines, 2 kg for dumbbells, 5 lb in pounds', () => {
    expect(defaultIncrementKg('barbell', 'kg')).toBe(2.5);
    expect(defaultIncrementKg('dumbbell', 'kg')).toBe(2);
    expect(defaultIncrementKg('barbell', 'lb')).toBeCloseTo(2.268, 3);
  });
});
