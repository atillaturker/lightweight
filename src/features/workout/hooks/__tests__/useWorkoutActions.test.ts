/**
 * Wiring test for the session start path.
 *
 * The Active Workout screen renders whatever `exercises` the store holds,
 * so the one thing that must never regress is that starting a routine
 * seeds real exercise blocks. That depends on three links holding at once:
 * a routine that references real library ids, a registered library
 * provider, and `start` resolving one against the other.
 *
 * If the library seam is left at its empty default — or a routine is
 * seeded with ids that are not in the library — `start` still opens a
 * session but the exercise list is empty, which is a blank screen rather
 * than an error. These tests fail on exactly that.
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

jest.mock('@react-native-community/netinfo', () => ({
  fetch: async () => ({ isConnected: true }),
}));

jest.mock('@tanstack/react-query', () => ({
  useQueryClient: () => ({ invalidateQueries: jest.fn() }),
}));

import type { Routine } from '@domain/entities';
import { registerDataProviders } from '@/app/providers';
import { useHistoryStore } from '@features/history/store';
import { useRoutineStore } from '@features/routines/store';

import { resetSessionDataProviders } from '../../services';
import { EMPTY_WORKOUT, useActiveWorkoutStore } from '../../store';
import { useWorkoutActions } from '../useWorkoutActions';

/** A routine that points at two real library exercises. */
const ROUTINE: Routine = {
  id: 'routine-1',
  name: 'Upper / Lower',
  exercises: [
    { exerciseId: 'bench-press', targetSets: 3, targetReps: 8, order: 0 },
    { exerciseId: 'barbell-row', targetSets: 3, targetReps: 8, order: 1 },
  ],
  createdAt: 1_700_000_000_000,
  updatedAt: 1_700_000_000_000,
  isArchived: false,
};

beforeEach(() => {
  mockMemory.clear();
  useActiveWorkoutStore.setState({ ...EMPTY_WORKOUT });
  useRoutineStore.setState({ routines: [] });
  useHistoryStore.setState({ sessions: [] });
  registerDataProviders();
});

afterEach(() => {
  // The provider is module-level state; never leak it into another suite.
  resetSessionDataProviders();
});

describe('useWorkoutActions.start', () => {
  it('seeds one exercise block per resolvable routine slot', () => {
    const { result } = renderHook(() => useWorkoutActions());

    act(() => {
      result.current.start(ROUTINE);
    });

    const state = useActiveWorkoutStore.getState();
    expect(state.sessionId).not.toBeNull();
    expect(state.exercises).toHaveLength(2);
    expect(state.exercises.map((block) => block.name)).toEqual([
      'Bench Press',
      'Barbell Row',
    ]);
  });

  it('seeds each block with its target number of sets', () => {
    const { result } = renderHook(() => useWorkoutActions());

    act(() => {
      result.current.start(ROUTINE);
    });

    const [bench, row] = useActiveWorkoutStore.getState().exercises;
    expect(bench.sets).toHaveLength(3);
    expect(row.sets).toHaveLength(3);
    expect(bench.sets.every((set) => set.completed === false)).toBe(true);
  });

  it('resolves a routine seeded from an onboarding template', () => {
    const routine = useRoutineStore.getState().seedFromTemplate('full-body');
    const { result } = renderHook(() => useWorkoutActions());

    act(() => {
      result.current.start(routine);
    });

    const state = useActiveWorkoutStore.getState();
    expect(state.exercises).toHaveLength(routine.exercises.length);
    expect(state.exercises.every((block) => block.sets.length > 0)).toBe(true);
  });
});

describe('useWorkoutActions.finish', () => {
  it('records the finished session in local history', () => {
    const { result } = renderHook(() => useWorkoutActions());

    act(() => {
      result.current.start(ROUTINE);
    });
    act(() => {
      result.current.finish();
    });

    const { sessions } = useHistoryStore.getState();
    expect(sessions).toHaveLength(1);
    expect(sessions[0].routineName).toBe('Upper / Lower');
  });
});
