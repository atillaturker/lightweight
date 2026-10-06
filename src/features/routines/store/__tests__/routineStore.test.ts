/**
 * Tests for the routines store.
 *
 * These pin the editor's contract: routines are created with a default
 * name, slots are appended in order with the shared default targets,
 * duplicates are skipped, and every list mutation leaves `order`
 * contiguous from zero.
 */

// In-memory MMKV double so the persist middleware has somewhere to write.
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

import {
  DEFAULT_ROUTINE_NAME,
  DEFAULT_TARGET_REPS,
  DEFAULT_TARGET_SETS,
} from '../../config';
import { useRoutineStore } from '../routineStore';

/** Reset both the store and the disk double between tests. */
beforeEach(() => {
  mockMemory.clear();
  useRoutineStore.setState({ routines: [], activeRoutineId: null, scheduleOverrides: {} });
});

/** Create a routine and return its id. */
function newRoutine(name?: string): string {
  return useRoutineStore.getState().createRoutine(name);
}

/** Read one routine by id. */
function routineById(id: string) {
  const found = useRoutineStore.getState().routines.find((r) => r.id === id);
  if (!found) throw new Error(`missing routine ${id}`);
  return found;
}

describe('createRoutine', () => {
  it('adds a routine with the default name', () => {
    const id = newRoutine();

    const routine = routineById(id);
    expect(routine.name).toBe(DEFAULT_ROUTINE_NAME);
    expect(routine.exercises).toEqual([]);
    expect(routine.isArchived).toBe(false);
  });

  it('numbers the default name so unnamed routines stay distinct', () => {
    newRoutine();
    const second = newRoutine();
    const third = newRoutine();

    expect(routineById(second).name).toBe(`${DEFAULT_ROUTINE_NAME} 2`);
    expect(routineById(third).name).toBe(`${DEFAULT_ROUTINE_NAME} 3`);
  });

  it('uses the provided name', () => {
    const id = newRoutine('Push Day');

    expect(routineById(id).name).toBe('Push Day');
  });

  it('returns a distinct id per routine', () => {
    const first = newRoutine();
    const second = newRoutine();

    expect(first).not.toBe(second);
    expect(useRoutineStore.getState().routines).toHaveLength(2);
  });
});

describe('renameRoutine', () => {
  it('updates the name', () => {
    const id = newRoutine('Old');
    useRoutineStore.getState().renameRoutine(id, 'New');

    expect(routineById(id).name).toBe('New');
  });

  it('ignores a blank name', () => {
    const id = newRoutine('Keep');
    useRoutineStore.getState().renameRoutine(id, '   ');

    expect(routineById(id).name).toBe('Keep');
  });
});

describe('setActiveRoutine', () => {
  it('marks the routine as active', () => {
    const id = newRoutine();
    useRoutineStore.getState().setActiveRoutine(id);

    expect(useRoutineStore.getState().activeRoutineId).toBe(id);
  });
});

describe('deleteRoutine', () => {
  it('removes the routine', () => {
    const id = newRoutine();
    useRoutineStore.getState().deleteRoutine(id);

    expect(useRoutineStore.getState().routines).toHaveLength(0);
  });

  it('clears activeRoutineId when the active routine is deleted', () => {
    const id = newRoutine();
    useRoutineStore.getState().setActiveRoutine(id);
    useRoutineStore.getState().deleteRoutine(id);

    expect(useRoutineStore.getState().activeRoutineId).toBeNull();
  });

  it('keeps activeRoutineId when another routine is deleted', () => {
    const keep = newRoutine('Keep');
    const drop = newRoutine('Drop');
    useRoutineStore.getState().setActiveRoutine(keep);
    useRoutineStore.getState().deleteRoutine(drop);

    expect(useRoutineStore.getState().activeRoutineId).toBe(keep);
  });
});

describe('addExercisesToRoutine', () => {
  it('appends in order, skipping duplicates', () => {
    const id = newRoutine();
    const { addExercisesToRoutine } = useRoutineStore.getState();

    addExercisesToRoutine(id, ['bench-press', 'barbell-row']);
    addExercisesToRoutine(id, ['barbell-row', 'pull-up']);

    const ids = routineById(id).exercises.map((e) => e.exerciseId);
    expect(ids).toEqual(['bench-press', 'barbell-row', 'pull-up']);
  });

  it('assigns the default targets to each new entry', () => {
    const id = newRoutine();
    useRoutineStore
      .getState()
      .addExercisesToRoutine(id, ['bench-press', 'pull-up']);

    for (const entry of routineById(id).exercises) {
      expect(entry.targetSets).toBe(DEFAULT_TARGET_SETS);
      expect(entry.targetReps).toBe(DEFAULT_TARGET_REPS);
    }
  });

  it('numbers order contiguously from zero', () => {
    const id = newRoutine();
    useRoutineStore
      .getState()
      .addExercisesToRoutine(id, ['bench-press', 'pull-up', 'dip']);

    const orders = routineById(id).exercises.map((e) => e.order);
    expect(orders).toEqual([0, 1, 2]);
  });

  it('leaves an unknown routine untouched', () => {
    const { addExercisesToRoutine, routines } = useRoutineStore.getState();
    addExercisesToRoutine('nope', ['bench-press']);

    expect(useRoutineStore.getState().routines).toEqual(routines);
  });

  it('is a no-op for an empty preselected list', () => {
    const id = newRoutine();
    const { addExercisesToRoutine } = useRoutineStore.getState();
    addExercisesToRoutine(id, ['bench-press']);

    const before = routineById(id);
    addExercisesToRoutine(id, []);

    // Same reference: nothing was written, so no subscriber re-rendered.
    expect(routineById(id)).toBe(before);
    expect(routineById(id).exercises).toHaveLength(1);
  });
});

describe('removeExercise', () => {
  it('removes the entry and reindexes order', () => {
    const id = newRoutine();
    const { addExercisesToRoutine } = useRoutineStore.getState();
    addExercisesToRoutine(id, ['bench-press', 'pull-up', 'dip']);

    useRoutineStore.getState().removeExercise(id, 'pull-up');

    const entries = routineById(id).exercises;
    expect(entries.map((e) => e.exerciseId)).toEqual(['bench-press', 'dip']);
    expect(entries.map((e) => e.order)).toEqual([0, 1]);
  });
});

describe('reorderExercise', () => {
  it('moves the entry correctly', () => {
    const id = newRoutine();
    const { addExercisesToRoutine } = useRoutineStore.getState();
    addExercisesToRoutine(id, ['bench-press', 'pull-up', 'dip']);

    useRoutineStore.getState().reorderExercise(id, 0, 2);

    const entries = routineById(id).exercises;
    expect(entries.map((e) => e.exerciseId)).toEqual([
      'pull-up',
      'dip',
      'bench-press',
    ]);
    expect(entries.map((e) => e.order)).toEqual([0, 1, 2]);
  });

  it('ignores an out-of-range index', () => {
    const id = newRoutine();
    const { addExercisesToRoutine } = useRoutineStore.getState();
    addExercisesToRoutine(id, ['bench-press', 'pull-up']);

    useRoutineStore.getState().reorderExercise(id, 0, 5);

    expect(routineById(id).exercises.map((e) => e.exerciseId)).toEqual([
      'bench-press',
      'pull-up',
    ]);
  });
});

describe('setRoutineDuration', () => {
  it('stores the override in minutes', () => {
    const id = newRoutine();

    useRoutineStore.getState().setRoutineDuration(id, 45);

    expect(routineById(id).estimatedMinutes).toBe(45);
  });

  it('clears the field entirely when passed null', () => {
    const id = newRoutine();
    useRoutineStore.getState().setRoutineDuration(id, 45);

    useRoutineStore.getState().setRoutineDuration(id, null);

    expect('estimatedMinutes' in routineById(id)).toBe(false);
  });

  it('leaves other routines untouched', () => {
    const keep = newRoutine('Keep');
    const drop = newRoutine('Drop');
    useRoutineStore.getState().setRoutineDuration(drop, 30);

    useRoutineStore.getState().setRoutineDuration(keep, 20);

    expect(routineById(drop).estimatedMinutes).toBe(30);
  });
});

describe('updateExerciseTarget', () => {
  it('changes sets and reps only', () => {
    const id = newRoutine();
    const { addExercisesToRoutine } = useRoutineStore.getState();
    addExercisesToRoutine(id, ['bench-press', 'pull-up']);

    useRoutineStore
      .getState()
      .updateExerciseTarget(id, 'bench-press', 5, 3);

    const entries = routineById(id).exercises;
    const bench = entries.find((e) => e.exerciseId === 'bench-press');
    const pullUp = entries.find((e) => e.exerciseId === 'pull-up');

    expect(bench).toMatchObject({
      exerciseId: 'bench-press',
      targetSets: 5,
      targetReps: 3,
      order: 0,
    });
    expect(pullUp).toMatchObject({
      targetSets: DEFAULT_TARGET_SETS,
      targetReps: DEFAULT_TARGET_REPS,
    });
  });
});

describe('updateExerciseTimeTarget', () => {
  it('sets sets and seconds on a timed slot', () => {
    const id = newRoutine();
    useRoutineStore.getState().addExercisesToRoutine(id, ['weighted-front-plank']);

    useRoutineStore.getState().updateExerciseTimeTarget(id, 'weighted-front-plank', 4, 45);

    expect(routineById(id).exercises[0]).toMatchObject({ targetSets: 4, targetSeconds: 45 });
  });

  it('ignores an exercise that is not in the routine', () => {
    const id = newRoutine();
    const before = routineById(id);

    useRoutineStore.getState().updateExerciseTimeTarget(id, 'missing', 4, 45);

    expect(routineById(id)).toEqual(before);
  });
});

describe('supersets', () => {
  function routineWith(ids: string[]): string {
    const id = newRoutine();
    useRoutineStore.getState().addExercisesToRoutine(id, ids);
    return id;
  }
  const groups = (id: string) => routineById(id).exercises.map((slot) => slot.supersetGroup ?? '-');

  it('links a slot with the next and unlinks it again', () => {
    const id = routineWith(['bench-press', 'barbell-row', 'back-squat']);

    useRoutineStore.getState().linkWithNext(id, 'bench-press');
    expect(groups(id)).toEqual(['A', 'A', '-']);

    useRoutineStore.getState().unlinkFromSuperset(id, 'barbell-row');
    expect(groups(id)).toEqual(['-', '-', '-']);
  });

  it('dissolves a superset that a reorder splits apart', () => {
    const id = routineWith(['bench-press', 'barbell-row', 'back-squat']);
    useRoutineStore.getState().linkWithNext(id, 'bench-press');

    useRoutineStore.getState().reorderExercise(id, 0, 2);

    expect(groups(id)).toEqual(['-', '-', '-']);
  });

  it('dissolves a pair when one member is removed', () => {
    const id = routineWith(['bench-press', 'barbell-row']);
    useRoutineStore.getState().linkWithNext(id, 'bench-press');

    useRoutineStore.getState().removeExercise(id, 'barbell-row');

    expect(groups(id)).toEqual(['-']);
  });
});

describe('setRoutineProgression', () => {
  it('sets the policy, which is off until chosen', () => {
    const id = newRoutine();
    expect(routineById(id).progression).toBeUndefined();

    useRoutineStore.getState().setRoutineProgression(id, 'double');

    expect(routineById(id).progression).toBe('double');
  });
});

describe('setRoutineDays', () => {
  it('stores the days deduplicated and sorted', () => {
    const id = newRoutine('Push');
    useRoutineStore.getState().setRoutineDays(id, [4, 1, 4]);
    expect(routineById(id).days).toEqual([1, 4]);
  });

  it('ignores an unknown routine', () => {
    useRoutineStore.getState().setRoutineDays('missing', [1]);
    expect(useRoutineStore.getState().routines).toEqual([]);
  });
});

describe('moveScheduledSession', () => {
  /** Wednesday 7 October 2026. */
  const wednesday = new Date(2026, 9, 7).getTime();
  const friday = new Date(2026, 9, 9).getTime();

  it('records a one-off move without changing the plan', () => {
    const id = newRoutine('Pull');
    useRoutineStore.getState().setRoutineDays(id, [3]);

    useRoutineStore.getState().moveScheduledSession(wednesday, friday, wednesday);

    expect(useRoutineStore.getState().scheduleOverrides).toEqual({
      '2026-10-07': null,
      '2026-10-09': id,
    });
    expect(routineById(id).days).toEqual([3]);
  });

  it('is cleared with the routines', () => {
    const id = newRoutine('Pull');
    useRoutineStore.getState().setRoutineDays(id, [3]);
    useRoutineStore.getState().moveScheduledSession(wednesday, friday, wednesday);

    useRoutineStore.getState().clear();

    expect(useRoutineStore.getState().scheduleOverrides).toEqual({});
  });
});
