/**
 * Tests for the active-session read hook.
 *
 * These pin the one derived fact the Home screen branches on: whether a
 * session is open. The hook itself is a thin selector, so the test drives
 * the store and asserts what the screen would see.
 */
import { renderHook } from '@testing-library/react-native';

// In-memory MMKV double, matching the pattern used across the suite.
const mockMemory = new Map<string, string>();

jest.mock('react-native-mmkv', () => ({
  createMMKV: () => ({
    getString: (key: string) => mockMemory.get(key),
    set: (key: string, value: string) => {
      mockMemory.set(key, value);
    },
    remove: (key: string) => {
      mockMemory.delete(key);
    },
  }),
}));

jest.mock('@lib/id', () => ({
  createId: () => 'set-1',
}));

import type { Exercise, Routine } from '@domain/entities';

import { EMPTY_WORKOUT, useActiveWorkoutStore } from '../../store';
import { useActiveWorkout } from '../useActiveWorkout';

/** A routine with a single slot. */
const ROUTINE: Routine = {
  id: 'routine-1',
  name: 'Upper / Lower',
  exercises: [
    { exerciseId: 'bench', targetSets: 3, targetReps: 8, order: 0 },
  ],
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
  isArchived: false,
};

/** The library exercise the routine slot points at. */
const EXERCISE: Exercise = {
  id: 'bench',
  name: 'Bench Press',
  muscleGroup: 'chest',
  equipment: 'barbell',
  pictogramId: 'ex-bench',
  isCustom: false,
  isArchived: false,
  createdAt: 1_700_000_000_000,
};

beforeEach(() => {
  mockMemory.clear();
  useActiveWorkoutStore.setState({ ...EMPTY_WORKOUT });
});

describe('useActiveWorkout', () => {
  it('returns hasActiveSession false when empty', () => {
    const { result } = renderHook(() => useActiveWorkout());

    expect(result.current.hasActiveSession).toBe(false);
    expect(result.current.sessionId).toBeNull();
    expect(result.current.exercises).toHaveLength(0);
  });

  it('returns true after startWorkout', () => {
    useActiveWorkoutStore
      .getState()
      .startWorkout(ROUTINE, [EXERCISE]);

    const { result } = renderHook(() => useActiveWorkout());

    expect(result.current.hasActiveSession).toBe(true);
    expect(result.current.routineName).toBe('Upper / Lower');
    expect(result.current.exercises).toHaveLength(1);
  });

  it('returns false again once the session is discarded', () => {
    useActiveWorkoutStore.getState().startWorkout(ROUTINE, [EXERCISE]);
    useActiveWorkoutStore.getState().discardWorkout();

    const { result } = renderHook(() => useActiveWorkout());

    expect(result.current.hasActiveSession).toBe(false);
  });
});
