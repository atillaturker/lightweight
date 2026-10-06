/**
 * Active workout store — the heart of the logging loop.
 *
 * Every mutation that changes a logged set is a single `set()` call, and
 * the persist middleware writes the whitelisted slice to MMKV on each of
 * them. There is deliberately no "save" action: killing the app mid-set
 * leaves the session intact, and `resumeWorkout` is a no-op because the
 * state on disk is already the source of truth.
 *
 * `isResting` and `restEndsAt` are excluded from `partialize` — a rest
 * timer that survives a cold start would be wrong (the rest already
 * elapsed while the app was closed).
 *
 * Access from screens is via the hooks in `../hooks`; the store is not
 * meant to be subscribed to directly outside them.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { createId } from '@lib/id';

import type {
  Exercise,
  Routine,
  RoutineExercise,
  Set,
  SetType,
  Workout,
} from '@domain/entities';
import {
  DEFAULT_HOLD_SECONDS,
  isBodyweightExercise,
  isTimedExercise,
} from '@domain/rules';
import { getExerciseHistory } from '@features/workout/services';
import { zustandStorage } from '@infrastructure/storage';

import type { ActiveExercise, ActiveSet } from '@features/workout/types';

/** A set payload as accepted by {@link ActiveWorkoutState.logSet}. */
export type NewActiveSet = Omit<ActiveSet, 'id' | 'completedAt' | 'isPR'>;

/** The state plus every mutator the workout hooks call. */
export interface ActiveWorkoutState {
  sessionId: string | null;
  routineId: string | null;
  /** Snapshot of the routine name taken when the session started. */
  routineName: string;
  startedAt: number | null;
  exercises: ActiveExercise[];
  isResting: boolean;
  restEndsAt: number | null;

  /** Begin a session from a routine, seeding sets from the last time. */
  startWorkout: (routine: Routine, exercises: Exercise[]) => void;
  /** No-op: an interrupted session is already on disk. */
  resumeWorkout: () => void;
  /** Append a set to an exercise, auto-numbering it from the last set. */
  logSet: (exerciseId: string, set: NewActiveSet) => void;
  /** Patch a set in place. */
  updateSet: (
    exerciseId: string,
    setId: string,
    patch: Partial<ActiveSet>,
  ) => void;
  /** Mark a set complete and stamp the completion time. */
  completeSet: (exerciseId: string, setId: string) => void;
  /** Drop a set from its exercise. */
  removeSet: (exerciseId: string, setId: string) => void;
  /** Append a clone of the exercise's last set. */
  addSet: (exerciseId: string) => void;
  /** Flag a set as a personal record. Called after the set is completed. */
  markSetPR: (exerciseId: string, setId: string) => void;
  /** Start the rest timer, ending `seconds` from now. */
  startRest: (seconds: number) => void;
  /** Clear the rest timer. */
  stopRest: () => void;
  /** Close the session, returning it as a domain `Workout`. */
  finishWorkout: () => Workout;
  /** Abandon the session without producing a workout. */
  discardWorkout: () => void;
}

/** Fields written to MMKV. Everything else is transient. */
export interface PersistedWorkout {
  sessionId: string | null;
  routineId: string | null;
  routineName: string;
  startedAt: number | null;
  exercises: ActiveExercise[];
}

/** Fallback weight/reps for the first set of an exercise with no history. */
const FALLBACK_WEIGHT_KG = 0;
const FALLBACK_REPS = 8;

/** Rest timer never runs longer than this, however it was requested. */
const MAX_REST_SECONDS = 60 * 60;

/** The empty session, used as the initial value and after a reset. */
export const EMPTY_WORKOUT: PersistedWorkout & {
  isResting: boolean;
  restEndsAt: number | null;
} = {
  sessionId: null,
  routineId: null,
  routineName: '',
  startedAt: null,
  exercises: [],
  isResting: false,
  restEndsAt: null,
};

/**
 * Units of weight to seed a new set with: the matching set index from the
 * exercise's most recent session, or a neutral default when there is no
 * history. Keeps the whole table loggable without typing on every set.
 */
interface SeedSet {
  weightKg: number;
  reps: number;
  type: SetType;
  durationSec?: number;
}

/** Convert a historical domain set into the seed for a new active set. */
function toSeed(set: Set): SeedSet {
  return { weightKg: set.weightKg, reps: set.reps, type: set.type, durationSec: set.durationSec };
}

/**
 * A fresh, not-yet-completed set for an exercise. Timed exercises log
 * seconds (reps stay 0); everything else logs reps.
 */
function newActiveSet(seed: SeedSet | undefined, timed: boolean, holdSeconds: number): ActiveSet {
  const base: ActiveSet = {
    id: createId(),
    weightKg: seed?.weightKg ?? FALLBACK_WEIGHT_KG,
    reps: timed ? 0 : (seed?.reps ?? FALLBACK_REPS),
    type: seed?.type ?? 'normal',
    completed: false,
    completedAt: null,
    isPR: false,
  };
  return timed ? { ...base, durationSec: seed?.durationSec ?? holdSeconds } : base;
}

/**
 * Build the initial set list for one routine slot. Later sets in a
 * routine inherit the previous set's values, so only the first seed needs
 * to come from history.
 */
function buildInitialSets(exercise: Exercise, slot: RoutineExercise): ActiveSet[] {
  const history = getExerciseHistory(exercise.id);
  const seeds = history.length > 0 ? history.map(toSeed) : [];
  const setCount = Math.max(slot.targetSets, 1);
  const timed = isTimedExercise(exercise);
  const holdSeconds = slot.targetSeconds ?? DEFAULT_HOLD_SECONDS;

  return Array.from({ length: setCount }, (_, index) =>
    newActiveSet(seeds[index] ?? seeds.at(-1), timed, holdSeconds),
  );
}

/**
 * Build the exercise blocks for a new session, in routine order.
 * Slots whose exercise is missing from the library are skipped rather than
 * rendered blank.
 */
function buildExercises(
  routine: Routine,
  exercises: Exercise[],
): ActiveExercise[] {
  const byId = new Map(exercises.map((exercise) => [exercise.id, exercise]));
  const ordered = [...routine.exercises].sort((a, b) => a.order - b.order);

  const blocks: ActiveExercise[] = [];
  for (const slot of ordered) {
    const exercise = byId.get(slot.exerciseId);
    if (exercise === undefined) continue;

    blocks.push({
      exerciseId: exercise.id,
      name: exercise.name,
      pictogramId: exercise.pictogramId,
      order: blocks.length,
      sets: buildInitialSets(exercise, slot),
      measure: exercise.measure ?? 'reps',
      perSide: exercise.perSide === true,
      bodyweight: isBodyweightExercise(exercise),
      ...(slot.supersetGroup !== undefined ? { supersetGroup: slot.supersetGroup } : {}),
    });
  }
  return blocks;
}

/** Apply `patch` to one set inside one exercise, leaving other blocks alone. */
function patchExerciseSets(
  exercises: ActiveExercise[],
  exerciseId: string,
  patchSets: (sets: ActiveSet[]) => ActiveSet[],
): ActiveExercise[] {
  return exercises.map((block) =>
    block.exerciseId === exerciseId
      ? { ...block, sets: patchSets(block.sets) }
      : block,
  );
}

/** Total sets in the session. */
export function countTotalSets(exercises: ActiveExercise[]): number {
  return exercises.reduce((total, block) => total + block.sets.length, 0);
}

/** Total completed sets in the session. */
export function countCompletedSets(exercises: ActiveExercise[]): number {
  return exercises.reduce(
    (total, block) => total + block.sets.filter((set) => set.completed).length,
    0,
  );
}

/**
 * Convert one active set into a domain set. The single conversion used by
 * both PR detection and finishing, so new set fields cannot drift apart.
 */
export function toDomainSet(
  set: ActiveSet,
  block: Pick<ActiveExercise, 'exerciseId' | 'perSide'>,
  workoutId: string,
  order: number,
): Set {
  return {
    id: set.id,
    exerciseId: block.exerciseId,
    workoutId,
    weightKg: set.weightKg,
    reps: set.reps,
    type: set.type,
    completed: set.completed,
    rpe: set.rpe,
    completedAt: set.completedAt,
    order,
    isPR: set.isPR,
    ...(set.durationSec !== undefined ? { durationSec: set.durationSec } : {}),
    ...(block.perSide === true ? { perSide: true } : {}),
  };
}

/** Flatten the active session into domain sets for the finished workout. */
export function toDomainSets(
  sessionId: string,
  exercises: ActiveExercise[],
): Set[] {
  return exercises.flatMap((block) =>
    block.sets.map((set, index) => toDomainSet(set, block, sessionId, index)),
  );
}

/** Read the persisted slice of the store, or the empty session. */
function toPersisted(state: ActiveWorkoutState): PersistedWorkout {
  return {
    sessionId: state.sessionId,
    routineId: state.routineId,
    routineName: state.routineName,
    startedAt: state.startedAt,
    exercises: state.exercises,
  };
}

/** Base MMKV key; the app layer scopes it per signed-in user. */
export const ACTIVE_WORKOUT_STORE_KEY = 'active-workout';

/**
 * Persisted active-session store. Subscribe through the workout hooks,
 * e.g. `useActiveWorkout()`.
 */
export const useActiveWorkoutStore = create<ActiveWorkoutState>()(
  persist(
    (set, get) => ({
      ...EMPTY_WORKOUT,

      startWorkout: (routine, exercises) => {
        const startedAt = Date.now();
        set({
          sessionId: createId(),
          routineId: routine.id,
          routineName: routine.name,
          startedAt,
          exercises: buildExercises(routine, exercises),
          isResting: false,
          restEndsAt: null,
        });
      },

      resumeWorkout: () => {
        // Nothing to do — every mutation was written to MMKV as it happened.
      },

      logSet: (exerciseId, newSet) =>
        set((state) => ({
          exercises: patchExerciseSets(state.exercises, exerciseId, (sets) => [
            ...sets,
            {
              ...newSet,
              id: createId(),
              completedAt: null,
              isPR: false,
            },
          ]),
        })),

      updateSet: (exerciseId, setId, patch) =>
        set((state) => ({
          exercises: patchExerciseSets(state.exercises, exerciseId, (sets) =>
            sets.map((entry) =>
              entry.id === setId ? { ...entry, ...patch } : entry,
            ),
          ),
        })),

      completeSet: (exerciseId, setId) =>
        set((state) => ({
          exercises: patchExerciseSets(state.exercises, exerciseId, (sets) =>
            sets.map((entry) =>
              entry.id === setId
                ? { ...entry, completed: true, completedAt: Date.now() }
                : entry,
            ),
          ),
        })),

      removeSet: (exerciseId, setId) =>
        set((state) => ({
          exercises: patchExerciseSets(state.exercises, exerciseId, (sets) =>
            sets.filter((entry) => entry.id !== setId),
          ),
        })),

      addSet: (exerciseId) =>
        set((state) => ({
          exercises: patchExerciseSets(state.exercises, exerciseId, (sets) => {
            const last = sets.at(-1);
            if (last === undefined) {
              const block = state.exercises.find((entry) => entry.exerciseId === exerciseId);
              return [newActiveSet(undefined, block?.measure === 'time', DEFAULT_HOLD_SECONDS)];
            }
            return [
              ...sets,
              {
                ...last,
                id: createId(),
                completed: false,
                completedAt: null,
                isPR: false,
              },
            ];
          }),
        })),

      markSetPR: (exerciseId, setId) =>
        set((state) => ({
          exercises: patchExerciseSets(state.exercises, exerciseId, (sets) =>
            sets.map((entry) =>
              entry.id === setId ? { ...entry, isPR: true } : entry,
            ),
          ),
        })),

      startRest: (seconds) =>
        set({
          isResting: true,
          restEndsAt:
            Date.now() +
            Math.min(Math.max(seconds, 0), MAX_REST_SECONDS) * 1000,
        }),

      stopRest: () => set({ isResting: false, restEndsAt: null }),

      finishWorkout: () => {
        const state = get();
        const finishedAt = Date.now();
        const workout: Workout = {
          id: state.sessionId ?? createId(),
          routineId: state.routineId,
          routineName: state.routineName,
          startedAt: state.startedAt ?? finishedAt,
          finishedAt,
          sets: toDomainSets(state.sessionId ?? '', state.exercises),
        };
        set({ ...EMPTY_WORKOUT });
        return workout;
      },

      discardWorkout: () => set({ ...EMPTY_WORKOUT }),
    }),
    {
      name: ACTIVE_WORKOUT_STORE_KEY,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state): PersistedWorkout => toPersisted(state),
    },
  ),
);
