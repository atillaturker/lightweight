/**
 * Tests for the routine duration helpers.
 *
 * The calculated estimate is shared with the onboarding seeder, so these
 * pin the formula results and the override fallback the two screens rely
 * on.
 */
import type { Routine } from '@domain/entities';

import {
  calculatedRoutineMinutes,
  routineDurationMinutes,
} from '../routineDuration';

/** Build a routine with `exerciseCount` ordered slots. */
function makeRoutine(exerciseCount: number): Routine {
  return {
    id: 'routine-1',
    name: 'Test',
    exercises: Array.from({ length: exerciseCount }, (_, index) => ({
      exerciseId: `exercise-${index}`,
      targetSets: 3,
      targetReps: 8,
      order: index,
    })),
    createdAt: 0,
    updatedAt: 0,
    isArchived: false,
  };
}

describe('calculatedRoutineMinutes', () => {
  it('returns the formula result for 0 exercises', () => {
    expect(calculatedRoutineMinutes(makeRoutine(0))).toBe(10);
  });

  it('returns the formula result for 1 exercise', () => {
    expect(calculatedRoutineMinutes(makeRoutine(1))).toBe(18);
  });

  it('returns the formula result for 7 exercises', () => {
    expect(calculatedRoutineMinutes(makeRoutine(7))).toBe(63);
  });
});

describe('routineDurationMinutes', () => {
  it('uses the override when present', () => {
    const routine: Routine = { ...makeRoutine(7), estimatedMinutes: 45 };

    expect(routineDurationMinutes(routine)).toBe(45);
  });

  it('falls back to the formula when the override is undefined', () => {
    expect(routineDurationMinutes(makeRoutine(7))).toBe(63);
  });
});
