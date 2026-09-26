/**
 * Read-only view of the active session.
 *
 * One shallow selector feeds the whole object, so a screen re-renders
 * exactly once per store mutation instead of once per field.
 */
import { useShallow } from 'zustand/react/shallow';

import { useActiveWorkoutStore } from '../store';
import type { ActiveExercise } from '../types';

/** Values returned by {@link useActiveWorkout}. */
export interface UseActiveWorkoutResult {
  sessionId: string | null;
  routineId: string | null;
  routineName: string;
  startedAt: number | null;
  exercises: ActiveExercise[];
  isResting: boolean;
  restEndsAt: number | null;
  /** True while a session is open, i.e. Home should offer Resume. */
  hasActiveSession: boolean;
}

/**
 * Subscribe to the active workout. `hasActiveSession` is derived from
 * `sessionId`, so screens never re-implement the check.
 */
export function useActiveWorkout(): UseActiveWorkoutResult {
  const { sessionId, routineId, routineName, startedAt, exercises, isResting, restEndsAt } =
    useActiveWorkoutStore(
      useShallow((state) => ({
        sessionId: state.sessionId,
        routineId: state.routineId,
        routineName: state.routineName,
        startedAt: state.startedAt,
        exercises: state.exercises,
        isResting: state.isResting,
        restEndsAt: state.restEndsAt,
      })),
    );

  return {
    sessionId,
    routineId,
    routineName,
    startedAt,
    exercises,
    isResting,
    restEndsAt,
    hasActiveSession: sessionId !== null,
  };
}
