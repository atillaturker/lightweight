/**
 * Client-side routine store.
 *
 * Local-first: routines are held in Zustand and persisted through MMKV.
 * Firestore is a later batch's concern. `seedFromTemplate` exists purely
 * for the onboarding flow, which materialises a starter routine from the
 * exercise library so the user lands on a populated Home screen.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Routine, RoutineExercise } from '@domain/entities';
import { zustandStorage } from '@infrastructure/storage';

import type { RoutineTemplateId } from '@features/onboarding/types';

import {
  DEFAULT_ROUTINE_NAME,
  DEFAULT_TARGET_REPS,
  DEFAULT_TARGET_SETS,
} from '../config';
import { TEMPLATE_EXERCISE_IDS } from '../services';

/** Display name per starter template. */
const TEMPLATE_NAMES: Record<RoutineTemplateId, string> = {
  ppl: 'Push / Pull / Legs',
  'upper-lower': 'Upper / Lower',
  'full-body': 'Full Body',
};

/** Default set/rep targets for a template slot. */
const TEMPLATE_SETS = 3;
const TEMPLATE_REPS = 8;

/** Routines plus the mutators used by the app. */
export interface RoutineStore {
  routines: Routine[];
  /**
   * Id of the routine the Today screen should start next. `null` when the
   * user has not chosen one, or after the active routine is deleted.
   */
  activeRoutineId: string | null;
  /**
   * Create a starter routine from an onboarding template and make it the
   * newest entry. Returns the created routine.
   */
  seedFromTemplate: (template: RoutineTemplateId) => Routine;
  /** Replace the stored routines wholesale. */
  setRoutines: (routines: Routine[]) => void;
  /** Remove every stored routine. */
  clear: () => void;
  /** Create an empty routine with a default name. Returns the id. */
  createRoutine: (name?: string) => string;
  /** Rename a routine. */
  renameRoutine: (routineId: string, name: string) => void;
  /** Mark a routine as the active one. */
  setActiveRoutine: (routineId: string) => void;
  /** Delete a routine. If it was active, clear `activeRoutineId`. */
  deleteRoutine: (routineId: string) => void;
  /**
   * Append exercises to a routine's exercise list, in order. Exercises
   * already present are skipped. Each new entry gets the default targets.
   */
  addExercisesToRoutine: (routineId: string, exerciseIds: string[]) => void;
  /** Remove one exercise from a routine. */
  removeExercise: (routineId: string, exerciseId: string) => void;
  /** Move an exercise within the routine's list. */
  reorderExercise: (routineId: string, fromIndex: number, toIndex: number) => void;
  /** Update the target sets/reps for one exercise in one routine. */
  updateExerciseTarget: (
    routineId: string,
    exerciseId: string,
    targetSets: number,
    targetReps: number,
  ) => void;
  /**
   * Set or clear a routine's duration override. Pass `null` to clear it,
   * which removes the field so the calculated estimate applies again.
   */
  setRoutineDuration: (routineId: string, minutes: number | null) => void;
}

/** Non-cryptographic id; unique enough for locally created routines. */
function createRoutineId(source: string): string {
  return `routine-${source}-${Date.now()}`;
}

/**
 * Counter disambiguating ids created within the same millisecond, so two
 * routines created back-to-back in tests never collide.
 */
let idSequence = 0;

/** Id for a routine created from scratch, not from a template. */
function createCustomRoutineId(): string {
  idSequence += 1;
  return `routine-custom-${Date.now()}-${idSequence}`;
}

/**
 * Apply `patch` to the routine with `routineId`, restamped with a fresh
 * `updatedAt`. Routines that do not exist are left untouched.
 */
function patchRoutine(
  routines: Routine[],
  routineId: string,
  patch: Partial<Routine>,
): Routine[] {
  const now = Date.now();

  return routines.map((routine) =>
    routine.id === routineId ? { ...routine, ...patch, updatedAt: now } : routine,
  );
}

/**
 * Rewrite slot `order` to match array position. Every list mutation
 * reindexes so `order` stays contiguous and starts at zero.
 */
function reindex(exercises: RoutineExercise[]): RoutineExercise[] {
  return exercises.map((exercise, index) =>
    exercise.order === index ? exercise : { ...exercise, order: index },
  );
}

/**
 * Build a routine from a template. Each slot points at a real library
 * exercise, so the routine resolves to exercise blocks when it is started.
 */
function buildTemplateRoutine(template: RoutineTemplateId): Routine {
  const now = Date.now();

  return {
    id: createRoutineId(template),
    name: TEMPLATE_NAMES[template],
    exercises: TEMPLATE_EXERCISE_IDS[template].map((exerciseId, index) => ({
      exerciseId,
      targetSets: TEMPLATE_SETS,
      targetReps: TEMPLATE_REPS,
      order: index,
    })),
    createdAt: now,
    updatedAt: now,
    isArchived: false,
  };
}

/** Base MMKV key; the app layer scopes it per signed-in user. */
export const ROUTINES_STORE_KEY = 'routines';

/**
 * Persisted routine store. Subscribe with a selector, e.g.
 * `useRoutineStore((s) => s.routines)`.
 */
export const useRoutineStore = create<RoutineStore>()(
  persist(
    (set) => ({
      routines: [],
      activeRoutineId: null,
      seedFromTemplate: (template) => {
        const routine = buildTemplateRoutine(template);
        set((state) => ({ routines: [...state.routines, routine] }));
        return routine;
      },
      setRoutines: (routines) => set({ routines }),
      clear: () => set({ routines: [], activeRoutineId: null }),
      createRoutine: (name) => {
        const id = createCustomRoutineId();
        const now = Date.now();
        const routine: Routine = {
          id,
          name: name?.trim() ? name : DEFAULT_ROUTINE_NAME,
          exercises: [],
          createdAt: now,
          updatedAt: now,
          isArchived: false,
        };

        set((state) => ({ routines: [...state.routines, routine] }));
        return id;
      },
      renameRoutine: (routineId, name) => {
        const trimmed = name.trim();
        if (!trimmed) return;

        set((state) => ({
          routines: patchRoutine(state.routines, routineId, { name: trimmed }),
        }));
      },
      setActiveRoutine: (routineId) => set({ activeRoutineId: routineId }),
      deleteRoutine: (routineId) =>
        set((state) => ({
          routines: state.routines.filter((routine) => routine.id !== routineId),
          activeRoutineId:
            state.activeRoutineId === routineId ? null : state.activeRoutineId,
        })),
      addExercisesToRoutine: (routineId, exerciseIds) =>
        set((state) => {
          const target = state.routines.find((r) => r.id === routineId);
          if (!target) return {};

          const existing = new Set(
            target.exercises.map((entry) => entry.exerciseId),
          );
          const additions: RoutineExercise[] = [];

          for (const exerciseId of exerciseIds) {
            if (existing.has(exerciseId)) continue;
            existing.add(exerciseId);
            additions.push({
              exerciseId,
              targetSets: DEFAULT_TARGET_SETS,
              targetReps: DEFAULT_TARGET_REPS,
              order: target.exercises.length + additions.length,
            });
          }

          if (additions.length === 0) return {};
          return {
            routines: patchRoutine(state.routines, routineId, {
              exercises: [...target.exercises, ...additions],
            }),
          };
        }),
      removeExercise: (routineId, exerciseId) =>
        set((state) => {
          const target = state.routines.find((r) => r.id === routineId);
          if (!target) return {};

          const remaining = target.exercises.filter(
            (entry) => entry.exerciseId !== exerciseId,
          );
          if (remaining.length === target.exercises.length) return {};
          return {
            routines: patchRoutine(state.routines, routineId, {
              exercises: reindex(remaining),
            }),
          };
        }),
      reorderExercise: (routineId, fromIndex, toIndex) =>
        set((state) => {
          const target = state.routines.find((r) => r.id === routineId);
          if (!target) return {};

          const list = [...target.exercises];
          const inRange = (index: number): boolean =>
            index >= 0 && index < list.length;
          if (!inRange(fromIndex) || !inRange(toIndex) || fromIndex === toIndex) {
            return {};
          }

          const [moved] = list.splice(fromIndex, 1);
          list.splice(toIndex, 0, moved);
          return {
            routines: patchRoutine(state.routines, routineId, {
              exercises: reindex(list),
            }),
          };
        }),
      updateExerciseTarget: (routineId, exerciseId, targetSets, targetReps) =>
        set((state) => {
          const target = state.routines.find((r) => r.id === routineId);
          if (!target) return {};

          const exists = target.exercises.some(
            (entry) => entry.exerciseId === exerciseId,
          );
          if (!exists) return {};

          const exercises = target.exercises.map((entry) =>
            entry.exerciseId === exerciseId
              ? { ...entry, targetSets, targetReps }
              : entry,
          );
          return {
            routines: patchRoutine(state.routines, routineId, { exercises }),
          };
        }),
      setRoutineDuration: (routineId, minutes) =>
        set((state) => {
          const target = state.routines.find(
            (routine) => routine.id === routineId,
          );
          if (!target) return {};

          const now = Date.now();
          const routines = state.routines.map((routine) => {
            if (routine.id !== routineId) return routine;

            const next: Routine = { ...routine, updatedAt: now };
            if (minutes === null) {
              // Delete rather than set to undefined so the persisted JSON
              // does not carry an explicit null override.
              delete next.estimatedMinutes;
            } else {
              next.estimatedMinutes = minutes;
            }
            return next;
          });

          return { routines };
        }),
    }),
    {
      name: ROUTINES_STORE_KEY,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
