import type { Set } from '../../entities/Set';
import { isWorkingSet, isE1RMEligible } from '../e1rm';
import {
  isBodyweightExercise,
  isTimedExercise,
  isTimedSet,
  sideCount,
} from '../exerciseKind';
import { calculateVolume, summarizeVolume } from '../volume';

function makeSet(overrides: Partial<Set> = {}): Set {
  return {
    id: 's1',
    exerciseId: 'plank',
    workoutId: 'w1',
    weightKg: 0,
    reps: 0,
    type: 'normal',
    completed: true,
    completedAt: 1,
    order: 0,
    ...overrides,
  };
}

describe('exercise kind helpers', () => {
  it('reads timed and bodyweight from the exercise', () => {
    expect(isTimedExercise({ measure: 'time' })).toBe(true);
    expect(isTimedExercise({})).toBe(false);
    expect(isBodyweightExercise({ equipment: 'bodyweight' })).toBe(true);
    expect(isBodyweightExercise({ equipment: 'barbell' })).toBe(false);
  });

  it('reads timed and per-side from the set', () => {
    expect(isTimedSet(makeSet({ durationSec: 30 }))).toBe(true);
    expect(isTimedSet(makeSet())).toBe(false);
    expect(sideCount(makeSet({ perSide: true }))).toBe(2);
    expect(sideCount(makeSet())).toBe(1);
  });
});

describe('isWorkingSet for timed sets', () => {
  it('counts a completed hold with zero reps', () => {
    expect(isWorkingSet(makeSet({ durationSec: 45 }))).toBe(true);
  });

  it('does not count a zero-second hold', () => {
    expect(isWorkingSet(makeSet({ durationSec: 0 }))).toBe(false);
  });

  it('never makes a timed set e1RM-eligible', () => {
    expect(isE1RMEligible(makeSet({ durationSec: 45, weightKg: 20, reps: 5 }))).toBe(false);
  });
});

describe('volume with per-side and timed sets', () => {
  it('counts both sides of a per-side set', () => {
    const set = makeSet({ exerciseId: 'row', weightKg: 30, reps: 8, perSide: true });
    expect(calculateVolume([set])).toBe(480);
    expect(summarizeVolume([set]).reps).toBe(16);
  });

  it('adds no volume for a timed set', () => {
    expect(calculateVolume([makeSet({ durationSec: 60, weightKg: 20 })])).toBe(0);
  });
});
