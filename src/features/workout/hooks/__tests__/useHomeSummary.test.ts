/**
 * Tests for Home's next-routine selection.
 *
 * Product decision: the Today screen's "Next Session" block always shows
 * the routine the user explicitly marked as active. Only when no active
 * routine is set does it fall back to the most recently created one, and
 * only when there are no routines at all does it return `null`.
 */
import { act, renderHook } from '@testing-library/react-native';

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

import type { Routine } from '@domain/entities';
import { useRoutineStore } from '@features/routines/store';

import { EMPTY_WORKOUT, useActiveWorkoutStore } from '../../store';
import { useHomeSummary } from '../useHomeSummary';

/** A minimal non-archived routine for the given id and creation time. */
function routine(id: string, name: string, createdAt: number): Routine {
  return {
    id,
    name,
    exercises: [],
    createdAt,
    updatedAt: createdAt,
    isArchived: false,
  };
}

beforeEach(() => {
  mockMemory.clear();
  useActiveWorkoutStore.setState({ ...EMPTY_WORKOUT });
  useRoutineStore.setState({ routines: [], activeRoutineId: null });
});

describe('useHomeSummary nextRoutine', () => {
  it('returns the active routine when one is set', () => {
    const older = routine('routine-old', 'My Routine', 1_000);
    const newer = routine('routine-new', 'Upper / Lower', 2_000);
    useRoutineStore.setState({
      routines: [older, newer],
      activeRoutineId: older.id,
    });

    const { result } = renderHook(() => useHomeSummary());

    expect(result.current.nextRoutine?.id).toBe(older.id);
  });

  it('falls back to the most recently created routine when none is active', () => {
    const older = routine('routine-old', 'My Routine', 1_000);
    const newer = routine('routine-new', 'Upper / Lower', 2_000);
    useRoutineStore.setState({ routines: [older, newer], activeRoutineId: null });

    const { result } = renderHook(() => useHomeSummary());

    expect(result.current.nextRoutine?.id).toBe(newer.id);
  });

  it('returns null when there are no routines', () => {
    const { result } = renderHook(() => useHomeSummary());

    expect(result.current.nextRoutine).toBeNull();
  });

  it('falls back correctly after the active routine is deleted', () => {
    const active = routine('routine-active', 'My Routine', 2_000);
    const other = routine('routine-other', 'Upper / Lower', 1_000);
    useRoutineStore.setState({
      routines: [active, other],
      activeRoutineId: active.id,
    });

    const { result } = renderHook(() => useHomeSummary());
    expect(result.current.nextRoutine?.id).toBe(active.id);

    act(() => {
      useRoutineStore.getState().deleteRoutine(active.id);
    });

    expect(useRoutineStore.getState().activeRoutineId).toBeNull();
    expect(result.current.nextRoutine?.id).toBe(other.id);
  });
});
