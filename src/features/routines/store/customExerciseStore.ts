/**
 * The user's own exercises.
 *
 * Local-first like every user-owned record: persisted to MMKV per account
 * (scoped in `userScope.ts`) and mirrored to Firestore. Exercises are never
 * deleted — logged sets keep pointing at their ids — so this store only
 * grows; `isArchived` hides one from the picker.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Equipment, Exercise, ExerciseMeasure, MuscleGroup } from '@domain/entities';
import { createId } from '@lib/id';
import { zustandStorage } from '@infrastructure/storage';

import { CUSTOM_EXERCISE_ID_PREFIX } from '../services/customExerciseDocument';

/** Base MMKV key; the app layer scopes it per signed-in user. */
export const CUSTOM_EXERCISES_STORE_KEY = 'custom-exercises';

/** What the user fills in to create an exercise. */
export interface NewCustomExercise {
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  measure: ExerciseMeasure;
  perSide: boolean;
}

/** Custom exercises and their actions. */
export interface CustomExerciseStore {
  exercises: Exercise[];
  /** Create and store an exercise; returns it. */
  createExercise: (input: NewCustomExercise, now?: number) => Exercise;
  /**
   * Archive or restore an exercise; returns the updated exercise, or
   * `null` when the id is unknown. Archived exercises leave the picker but
   * still name their logged sets.
   */
  setArchived: (exerciseId: string, archived: boolean, now?: number) => Exercise | null;
  /** Replace the list, e.g. with the result of a cloud merge. */
  setExercises: (exercises: Exercise[]) => void;
}

/** Build a library exercise from the form input. */
export function buildCustomExercise(input: NewCustomExercise, now: number): Exercise {
  const id = `${CUSTOM_EXERCISE_ID_PREFIX}${createId()}`;
  return {
    id,
    name: input.name.trim(),
    muscleGroup: input.muscleGroup,
    equipment: input.equipment,
    ...(input.measure === 'time' ? { measure: 'time' as const } : {}),
    ...(input.perSide ? { perSide: true } : {}),
    pictogramId: `ex-${id}`,
    isCustom: true,
    isArchived: false,
    createdAt: now,
    updatedAt: now,
  };
}

/** Persisted custom-exercise store. */
export const useCustomExerciseStore = create<CustomExerciseStore>()(
  persist(
    (set, get) => ({
      exercises: [],
      createExercise: (input, now = Date.now()) => {
        const exercise = buildCustomExercise(input, now);
        set((state) => ({ exercises: [...state.exercises, exercise] }));
        return exercise;
      },
      setArchived: (exerciseId, archived, now = Date.now()) => {
        const current = get().exercises.find((exercise) => exercise.id === exerciseId);
        if (current === undefined) return null;
        const updated = { ...current, isArchived: archived, updatedAt: now };
        set((state) => ({
          exercises: state.exercises.map((exercise) => (exercise.id === exerciseId ? updated : exercise)),
        }));
        return updated;
      },
      setExercises: (exercises) => set({ exercises }),
    }),
    {
      name: CUSTOM_EXERCISES_STORE_KEY,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ exercises: state.exercises }),
    },
  ),
);
