/**
 * Registers the workout feature's data providers with their real sources.
 *
 * The workout feature reads the exercise library, session history, and the
 * user's rest preference through swappable provider seams that default to
 * empty/neutral values, so it never imports another feature directly. This
 * module is the single place the app wires those seams to concrete sources
 * at startup.
 *
 * The exercise library, the rest preference, and local session history all
 * have real sources today: history is both read from and written to the
 * durable history store. Exercise history (past sets for PR detection)
 * still has no source and stays at its empty default.
 */
import { syncWorkoutToCloud } from '@features/history/services';
import { useHistoryStore } from '@features/history/store';
import { usePreferencesStore } from '@features/profile/store';
import { EXERCISE_LIBRARY } from '@features/routines/services';
import { useCustomExerciseStore } from '@features/routines/store';
import {
  setExerciseHistoryProvider,
  setExerciseLibraryProvider,
  setRestTimerSecondsProvider,
  setRpeEnabledProvider,
  setSessionHistoryProvider,
  setSessionRecorder,
  setWeightUnitProvider,
} from '@features/workout/services';

/** Point the workout feature's seams at their real sources. */
export function registerDataProviders(): void {
  // Custom exercises are included, archived ones too, so logged sets of an
  // archived exercise still resolve to a name.
  setExerciseLibraryProvider(() => [
    ...EXERCISE_LIBRARY,
    ...useCustomExerciseStore.getState().exercises,
  ]);
  setRestTimerSecondsProvider(
    () => usePreferencesStore.getState().restTimerSeconds,
  );
  setWeightUnitProvider(() => usePreferencesStore.getState().unit);
  setRpeEnabledProvider(() => usePreferencesStore.getState().rpeEnabled);
  setSessionHistoryProvider(() => useHistoryStore.getState().sessions);
  // History is stored newest first; the seam promises oldest first.
  setExerciseHistoryProvider((exerciseId) =>
    [...useHistoryStore.getState().sessions]
      .reverse()
      .flatMap((session) => session.sets.filter((set) => set.exerciseId === exerciseId)),
  );
  setSessionRecorder((workout) => {
    // Durable local history first; the cloud mirror is best-effort and
    // queues itself when offline or when Firestore rejects the write.
    useHistoryStore.getState().addSession(workout);
    syncWorkoutToCloud(workout);
  });
}
