/**
 * Aggregated read model for the Home screen.
 *
 * Owns the whole "what does Today look like" question: the next routine,
 * the weekly strip figures, and the recent-session list. The screen only
 * renders what this returns, so no business logic leaks into JSX.
 *
 * Recomputes whenever history changes, whatever changed it: a finished
 * workout, a deleted session, a cloud sync, or an account switch.
 */
import { useMemo } from 'react';

import type { Exercise, Routine, Workout } from '@domain/entities';
import { useHistoryStore } from '@features/history';
import { useRoutineStore } from '@features/routines';

import { DEFAULT_WEEK_START, RECENT_ACTIVITY_LIMIT } from '../config';
import { getExerciseLibrary } from '../services';
import { selectNextRoutine } from '../utils/routineSelection';
import {
  recentSessions,
  summarizeWeeks,
  type WeeklySummary,
} from '../utils/sessionSummary';

/** Values returned by {@link useHomeSummary}. */
export interface HomeSummary {
  /** Routine the primary CTA will start, or `null` when none exists. */
  nextRoutine: Routine | null;
  /** Exercises of `nextRoutine`, resolved against the library. */
  nextExercises: Exercise[];
  /** Every stored routine, in creation order, for the Home preview. */
  routines: Routine[];
  /** Id of the active routine, or `null` when none is set. */
  activeRoutineId: string | null;
  /** True once at least one session has ever been finished. */
  hasHistory: boolean;
  /** Weekly figures for the summary strip. */
  weekly: WeeklySummary;
  /** Most recent sessions, newest first. */
  recent: Workout[];
}

/**
 * Read model behind the Home screen. Session history is subscribed to
 * directly so every change re-renders; the exercise library comes from the
 * feature's data provider. Both start empty, which is exactly the first-run
 * state the screen has to render.
 */
export function useHomeSummary(): HomeSummary {
  const routines = useRoutineStore((state) => state.routines);
  const activeRoutineId = useRoutineStore((state) => state.activeRoutineId);
  const sessions = useHistoryStore((state) => state.sessions);

  return useMemo((): HomeSummary => {
    const library = getExerciseLibrary();
    const nextRoutine = selectNextRoutine(routines, activeRoutineId);
    const byId = new Map(library.map((exercise) => [exercise.id, exercise]));

    // `[...arr].sort()` rather than `toSorted`: Hermes does not implement
    // the ES2023 non-mutating array methods.
    const nextExercises = [...(nextRoutine?.exercises ?? [])]
      .sort((a, b) => a.order - b.order)
      .map((slot) => byId.get(slot.exerciseId))
      .filter((exercise): exercise is Exercise => exercise !== undefined);

    return {
      nextRoutine,
      nextExercises,
      routines,
      activeRoutineId,
      hasHistory: sessions.length > 0,
      weekly: summarizeWeeks(sessions, DEFAULT_WEEK_START, Date.now()),
      recent: recentSessions(sessions, RECENT_ACTIVITY_LIMIT),
    };
  }, [routines, activeRoutineId, sessions]);
}
