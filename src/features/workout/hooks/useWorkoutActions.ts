/**
 * Session lifecycle hook: start, finish, discard.
 *
 * `start` resolves the routine against the exercise library and hands both
 * to the store, because the store has no access to the library itself.
 *
 * `finish` closes the session, persists an authoritative `isPR` flag on
 * every set (detected against the user's full history), and hands the
 * finished workout to the history recorder seam. The recorder is what
 * dual-writes: durable local history first, then the cloud when one is
 * registered — so the summary screen never blocks on network and this hook
 * stays unaware of auth or Firestore.
 */
import { useCallback } from 'react';

import type { Exercise, Routine, Workout } from '@domain/entities';
import { useRoutineStore } from '@features/routines';

import {
  getExerciseLibrary,
  getSessionHistory,
  recordSession,
} from '../services';
import {
  useActiveWorkoutStore,
  useLastSessionStore,
} from '../store';
import {
  applyPRFlags,
  resolveRoutineExercises,
  selectNextRoutine,
} from '../utils';

/** Actions returned by {@link useWorkoutActions}. */
export interface WorkoutActions {
  /** Start a session for the given routine, or the next routine. */
  start: (routine?: Routine) => void;
  /** Close the session, returning it, with PR flags persisted. */
  finish: () => Workout;
  /** Abandon the session without producing a workout. */
  discard: () => void;
}

/**
 * Apply PR flags, falling back to the unflagged workout if detection
 * throws. The active store is already cleared when this runs, so a throw
 * here would lose the session; missing PR badges are the lesser failure.
 */
function annotateOrKeep(workout: Workout): Workout {
  try {
    return applyPRFlags(workout, getSessionHistory());
  } catch {
    return workout;
  }
}

/**
 * Session lifecycle bound to the active workout store and the routine
 * store. This is the only place a session is opened or closed.
 */
export function useWorkoutActions(): WorkoutActions {
  const startWorkout = useActiveWorkoutStore((state) => state.startWorkout);
  const finishWorkout = useActiveWorkoutStore((state) => state.finishWorkout);
  const discardWorkout = useActiveWorkoutStore((state) => state.discardWorkout);
  const setLastSession = useLastSessionStore((state) => state.setLastSession);
  const routines = useRoutineStore((state) => state.routines);
  const activeRoutineId = useRoutineStore((state) => state.activeRoutineId);

  const start = useCallback(
    (routine?: Routine): void => {
      const target = routine ?? selectNextRoutine(routines, activeRoutineId);
      if (target === null) return;

      const library: Exercise[] = getExerciseLibrary();
      startWorkout(target, resolveRoutineExercises(target, library));
    },
    [routines, activeRoutineId, startWorkout],
  );

  const finish = useCallback((): Workout => {
    const workout = finishWorkout();
    // PR detection must see every prior session: a session compared only
    // against itself marks the first working set of each exercise as a
    // record. Flags are persisted on the sets so read-only views agree.
    const annotated = annotateOrKeep(workout);
    // Persist to local history first — the returned `Workout` is the only
    // copy once the active store is cleared, so this must never be skipped.
    // The registered recorder also mirrors the session to the cloud.
    recordSession(annotated);
    // Hand the finished session to the summary screen: the store is clear
    // by now, so this is the only copy the screen can render.
    setLastSession(annotated);

    return annotated;
  }, [finishWorkout, setLastSession]);

  const discard = useCallback((): void => {
    discardWorkout();
  }, [discardWorkout]);

  return { start, finish, discard };
}
