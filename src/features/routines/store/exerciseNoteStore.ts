/**
 * The user's notes on exercises: seat height, grip, cues. One note per
 * exercise, shown wherever the exercise is logged.
 *
 * Persisted to MMKV per account (scoped in `userScope.ts`). Local-only for
 * now, like routines.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { zustandStorage } from '@infrastructure/storage';

/** Base MMKV key; the app layer scopes it per signed-in user. */
export const EXERCISE_NOTES_STORE_KEY = 'exercise-notes';

/** Longest note kept, in characters. */
export const EXERCISE_NOTE_MAX_LENGTH = 280;

/** One exercise's note. */
export interface ExerciseNote {
  text: string;
  updatedAt: number;
}

/** Notes by exercise id, and their setter. */
export interface ExerciseNoteStore {
  notes: Record<string, ExerciseNote>;
  /** Save a note; blank text removes it. Text is trimmed and capped. */
  setNote: (exerciseId: string, text: string, now?: number) => void;
  /** Merge notes from a backup, the newer edit winning; returns how many changed. */
  importNotes: (notes: Record<string, ExerciseNote>) => number;
}

/** Persisted exercise notes. */
export const useExerciseNoteStore = create<ExerciseNoteStore>()(
  persist(
    (set, get) => ({
      notes: {},
      setNote: (exerciseId, text, now = Date.now()) =>
        set((state) => {
          const trimmed = text.trim().slice(0, EXERCISE_NOTE_MAX_LENGTH);
          const { [exerciseId]: _removed, ...rest } = state.notes;
          return { notes: trimmed === '' ? rest : { ...rest, [exerciseId]: { text: trimmed, updatedAt: now } } };
        }),
      importNotes: (notes) => {
        const current = get().notes;
        const newer = Object.entries(notes).filter(
          ([exerciseId, note]) => note.text.trim() !== '' && note.updatedAt > (current[exerciseId]?.updatedAt ?? -1),
        );
        if (newer.length > 0) set({ notes: { ...current, ...Object.fromEntries(newer) } });
        return newer.length;
      },
    }),
    {
      name: EXERCISE_NOTES_STORE_KEY,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ notes: state.notes }),
    },
  ),
);

/** The note on one exercise, or `null`. */
export function useExerciseNote(exerciseId: string): string | null {
  return useExerciseNoteStore((state) => state.notes[exerciseId]?.text ?? null);
}
