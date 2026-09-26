/**
 * Tests for the active workout store.
 *
 * These pin the contract the logging loop depends on: rows are appended in
 * place, completion stamps a time, a new set clones the last one, finishing
 * returns a domain `Workout` and clears state, and the persist boundary
 * keeps only the durable fields.
 */

// In-memory MMKV double. Populated by the store's persist middleware, so
// tests can assert exactly what was written to disk.
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

// Ids are stubbed at the lib seam: the store calls `createId` from
// `@lib/id`, which is what actually needs to be deterministic here.
let idCounter = 0;
jest.mock('@lib/id', () => ({
  createId: () => `set-${(idCounter += 1)}`,
}));

import type { Exercise, Routine } from '@domain/entities';

import { EMPTY_WORKOUT, useActiveWorkoutStore } from '../activeWorkoutStore';

/** Build a routine with one slot per provided exercise id. */
function makeRoutine(exerciseIds: string[]): Routine {
  return {
    id: 'routine-1',
    name: 'Upper / Lower',
    exercises: exerciseIds.map((exerciseId, index) => ({
      exerciseId,
      targetSets: 3,
      targetReps: 8,
      order: index,
    })),
    createdAt: 1_700_000_000_000,
    updatedAt: 1_700_000_000_000,
    isArchived: false,
  };
}

/** Build a library exercise with a minimal valid shape. */
function makeExercise(id: string, name: string): Exercise {
  return {
    id,
    name,
    muscleGroup: 'chest',
    equipment: 'barbell',
    pictogramId: `ex-${id}`,
    isCustom: false,
    isArchived: false,
    createdAt: 1_700_000_000_000,
  };
}

/** Read and parse the persisted `active-workout` payload, or `null`. */
function readPersistedWorkout(): { state: Record<string, unknown> } | null {
  const raw = mockMemory.get('active-workout');
  if (!raw) return null;
  return JSON.parse(raw) as { state: Record<string, unknown> };
}

const EXERCISES = [makeExercise('bench', 'Bench Press')];

beforeEach(() => {
  mockMemory.clear();
  idCounter = 0;
  useActiveWorkoutStore.setState({ ...EMPTY_WORKOUT });
});

describe('startWorkout', () => {
  it('populates the session from the routine', () => {
    useActiveWorkoutStore
      .getState()
      .startWorkout(makeRoutine(['bench']), EXERCISES);

    const state = useActiveWorkoutStore.getState();
    expect(state.sessionId).not.toBeNull();
    expect(state.routineId).toBe('routine-1');
    expect(state.routineName).toBe('Upper / Lower');
    expect(state.startedAt).not.toBeNull();
    expect(state.exercises).toHaveLength(1);
    expect(state.exercises[0].name).toBe('Bench Press');
    expect(state.exercises[0].pictogramId).toBe('ex-bench');
  });

  it('seeds one set per target set, all pending', () => {
    useActiveWorkoutStore
      .getState()
      .startWorkout(makeRoutine(['bench']), EXERCISES);

    const sets = useActiveWorkoutStore.getState().exercises[0].sets;
    expect(sets).toHaveLength(3);
    expect(sets.every((set) => set.completed === false)).toBe(true);
    expect(sets.every((set) => set.isPR === false)).toBe(true);
  });

  it('skips routine slots whose exercise is not in the library', () => {
    useActiveWorkoutStore
      .getState()
      .startWorkout(makeRoutine(['bench', 'missing']), EXERCISES);

    expect(useActiveWorkoutStore.getState().exercises).toHaveLength(1);
  });

  it('writes the session to persistence immediately', () => {
    useActiveWorkoutStore
      .getState()
      .startWorkout(makeRoutine(['bench']), EXERCISES);

    expect(readPersistedWorkout()?.state.routineName).toBe('Upper / Lower');
  });
});

describe('logSet', () => {
  it('appends a set with a generated id', () => {
    const store = useActiveWorkoutStore.getState();
    store.startWorkout(makeRoutine(['bench']), EXERCISES);
    const before = useActiveWorkoutStore.getState().exercises[0].sets.length;

    store.logSet('bench', {
      weightKg: 80,
      reps: 8,
      type: 'normal',
      completed: false,
    });

    const sets = useActiveWorkoutStore.getState().exercises[0].sets;
    expect(sets).toHaveLength(before + 1);
    expect(sets.at(-1)?.id).toBeTruthy();
    expect(sets.at(-1)?.weightKg).toBe(80);
    expect(sets.at(-1)?.completedAt).toBeNull();
    expect(sets.at(-1)?.isPR).toBe(false);
  });
});

describe('completeSet', () => {
  it('marks the set completed and stamps a time', () => {
    const store = useActiveWorkoutStore.getState();
    store.startWorkout(makeRoutine(['bench']), EXERCISES);
    const setId = useActiveWorkoutStore.getState().exercises[0].sets[0].id;

    store.completeSet('bench', setId);

    const set = useActiveWorkoutStore
      .getState()
      .exercises[0].sets.find((entry) => entry.id === setId);
    expect(set?.completed).toBe(true);
    expect(set?.completedAt).toEqual(expect.any(Number));
  });

  it('leaves the other sets pending', () => {
    const store = useActiveWorkoutStore.getState();
    store.startWorkout(makeRoutine(['bench']), EXERCISES);
    const [first, second] = useActiveWorkoutStore.getState().exercises[0].sets;

    store.completeSet('bench', first.id);

    const sets = useActiveWorkoutStore.getState().exercises[0].sets;
    expect(sets.find((entry) => entry.id === second.id)?.completed).toBe(false);
  });
});

describe('addSet', () => {
  it('clones the last set of that exercise', () => {
    const store = useActiveWorkoutStore.getState();
    store.startWorkout(makeRoutine(['bench']), EXERCISES);
    const last = useActiveWorkoutStore.getState().exercises[0].sets.at(-1);
    if (last === undefined) throw new Error('expected a seeded set');

    store.completeSet('bench', last.id);
    store.addSet('bench');

    const added = useActiveWorkoutStore.getState().exercises[0].sets.at(-1);
    expect(added?.weightKg).toBe(last.weightKg);
    expect(added?.reps).toBe(last.reps);
  });

  it('resets completion and record state on the clone', () => {
    const store = useActiveWorkoutStore.getState();
    store.startWorkout(makeRoutine(['bench']), EXERCISES);
    const last = useActiveWorkoutStore.getState().exercises[0].sets.at(-1);
    if (last === undefined) throw new Error('expected a seeded set');

    store.completeSet('bench', last.id);
    store.addSet('bench');

    const added = useActiveWorkoutStore.getState().exercises[0].sets.at(-1);
    expect(added?.id).not.toBe(last.id);
    expect(added?.completed).toBe(false);
    expect(added?.completedAt).toBeNull();
    expect(added?.isPR).toBe(false);
  });
});

describe('finishWorkout', () => {
  it('returns a Workout carrying the logged sets', () => {
    const store = useActiveWorkoutStore.getState();
    store.startWorkout(makeRoutine(['bench']), EXERCISES);
    const setId = useActiveWorkoutStore.getState().exercises[0].sets[0].id;
    store.completeSet('bench', setId);

    const workout = useActiveWorkoutStore.getState().finishWorkout();

    expect(workout.routineId).toBe('routine-1');
    expect(workout.routineName).toBe('Upper / Lower');
    expect(workout.finishedAt).toEqual(expect.any(Number));
    expect(workout.sets).toHaveLength(3);
    expect(workout.sets[0].exerciseId).toBe('bench');
    expect(workout.sets[0].completed).toBe(true);
  });

  it('clears the active session', () => {
    const store = useActiveWorkoutStore.getState();
    store.startWorkout(makeRoutine(['bench']), EXERCISES);

    store.finishWorkout();

    const state = useActiveWorkoutStore.getState();
    expect(state.sessionId).toBeNull();
    expect(state.exercises).toHaveLength(0);
    expect(state.routineName).toBe('');
  });
});

describe('discardWorkout', () => {
  it('clears the session without producing a workout', () => {
    const store = useActiveWorkoutStore.getState();
    store.startWorkout(makeRoutine(['bench']), EXERCISES);

    store.discardWorkout();

    const state = useActiveWorkoutStore.getState();
    expect(state.sessionId).toBeNull();
    expect(state.startedAt).toBeNull();
    expect(state.exercises).toHaveLength(0);
  });
});

describe('rest timer', () => {
  it('records the deadline when rest starts', () => {
    useActiveWorkoutStore.getState().startRest(90);

    const state = useActiveWorkoutStore.getState();
    expect(state.isResting).toBe(true);
    expect(state.restEndsAt).toBeGreaterThan(Date.now());
  });

  it('clears the deadline when rest stops', () => {
    useActiveWorkoutStore.getState().startRest(90);

    useActiveWorkoutStore.getState().stopRest();

    const state = useActiveWorkoutStore.getState();
    expect(state.isResting).toBe(false);
    expect(state.restEndsAt).toBeNull();
  });
});

describe('persist', () => {
  it('writes only the whitelisted fields', () => {
    const store = useActiveWorkoutStore.getState();
    store.startWorkout(makeRoutine(['bench']), EXERCISES);
    store.startRest(90);

    const persisted = readPersistedWorkout();
    expect(Object.keys(persisted?.state ?? {}).sort()).toEqual([
      'exercises',
      'routineId',
      'routineName',
      'sessionId',
      'startedAt',
    ]);
  });

  it('never persists the transient rest state', () => {
    useActiveWorkoutStore.getState().startRest(90);

    const persisted = readPersistedWorkout();
    expect(persisted?.state.isResting).toBeUndefined();
    expect(persisted?.state.restEndsAt).toBeUndefined();
  });

  it('restores the session from storage on a cold start', async () => {
    useActiveWorkoutStore.setState({ ...EMPTY_WORKOUT });
    mockMemory.set(
      'active-workout',
      JSON.stringify({
        state: {
          sessionId: 'session-1',
          routineId: 'routine-1',
          routineName: 'Upper / Lower',
          startedAt: 1_700_000_000_000,
          exercises: [
            {
              exerciseId: 'bench',
              name: 'Bench Press',
              pictogramId: 'ex-bench',
              order: 0,
              sets: [],
            },
          ],
        },
        version: 0,
      }),
    );

    await useActiveWorkoutStore.persist.rehydrate();

    const state = useActiveWorkoutStore.getState();
    expect(state.sessionId).toBe('session-1');
    expect(state.exercises).toHaveLength(1);
    // Transient fields are not restored — the rest, if any, already elapsed.
    expect(state.isResting).toBe(false);
  });
});
