/**
 * Wire the local stores to Firestore.
 *
 * This is the single place allowed to know about both auth and Firestore.
 * It registers the history feature's cloud seams, points the offline queue
 * at a Firestore delivery handler, and starts the reconnect listener. Kept
 * out of `registerDataProviders` so the local-only test harness never pulls
 * the Firebase SDK in.
 */
import NetInfo from '@react-native-community/netinfo';

import type { BodyWeightEntry, Exercise, Workout } from '@domain/entities';
import {
  enqueueBodyWeightSave,
  isBodyWeightQueueBody,
  setCloudBodyWeightWriter,
} from '@features/bodyweight/services';
import { saveBodyWeightToFirestore } from '@features/bodyweight/services/firestoreBodyWeight';
import { useAuthStore } from '@features/auth/store';
import {
  enqueueWorkoutDelete,
  enqueueWorkoutSave,
  isWorkoutQueueBody,
  setCloudWorkoutDeleter,
  setCloudWorkoutWriter,
  setCurrentUserIdProvider,
} from '@features/history/services';
import {
  deleteWorkoutFromFirestore,
  saveWorkoutToFirestore,
} from '@features/history/services/firestoreWorkouts';
import {
  enqueueCustomExerciseSave,
  isCustomExerciseQueueBody,
  setCloudCustomExerciseWriter,
} from '@features/routines/services';
import { saveCustomExerciseToFirestore } from '@features/routines/services/firestoreCustomExercises';
import {
  setFirestoreQueueTransport,
  setQueueScopeProvider,
  startOfflineQueueListener,
  useOfflineQueue,
} from '@infrastructure/network';
import type { QueuedMutation } from '@infrastructure/network';

/** The signed-in uid, or `null`. */
function currentUid(): string | null {
  return useAuthStore.getState().user?.uid ?? null;
}

/** Anything other than a confirmed connection counts as offline. */
async function isOnline(): Promise<boolean> {
  try {
    const state = await NetInfo.fetch();
    return state.isConnected === true;
  } catch {
    return false;
  }
}

/**
 * Attempt to deliver anything already waiting in the queue. A no-op failure
 * keeps the item for the reconnect listener; it never throws.
 */
function flushQueue(): void {
  void useOfflineQueue.getState().flush().catch((error: unknown) => {
    console.warn('[firestore] queue flush failed', error);
  });
}

/** Workout ids with a save or delete for `uid` still waiting in the queue. */
export interface PendingWorkoutIds {
  saves: Set<string>;
  deletes: Set<string>;
}

/** Collect the workout mutations `uid` still has queued. */
export function pendingWorkoutIds(uid: string): PendingWorkoutIds {
  const pending: PendingWorkoutIds = { saves: new Set(), deletes: new Set() };
  for (const mutation of useOfflineQueue.getState().queue) {
    const body = mutation.body;
    if (!isWorkoutQueueBody(body) || body.uid !== uid) continue;
    if (body.kind === 'saveWorkout') pending.saves.add(body.workout.id);
    else pending.deletes.add(body.workoutId);
  }
  return pending;
}

/**
 * Queue uploads for sessions the cloud has never seen. They go through the
 * queue rather than direct writes so hundreds of sessions are delivered in
 * order, offline-safe, and retried like any other write.
 */
export function queueWorkoutUploads(uid: string, workouts: Workout[]): void {
  for (const workout of workouts) enqueueWorkoutSave(uid, workout);
}

/** Custom-exercise ids `uid` still has a queued save for. */
export function pendingCustomExerciseIds(uid: string): Set<string> {
  const ids = new Set<string>();
  for (const mutation of useOfflineQueue.getState().queue) {
    const body = mutation.body;
    if (isCustomExerciseQueueBody(body) && body.uid === uid) ids.add(body.exercise.id);
  }
  return ids;
}

/** Queue uploads for custom exercises the cloud lacks or holds older. */
export function queueCustomExerciseUploads(uid: string, exercises: Exercise[]): void {
  const pending = pendingCustomExerciseIds(uid);
  for (const exercise of exercises) {
    if (!pending.has(exercise.id)) enqueueCustomExerciseSave(uid, exercise);
  }
}

/** Body-weight days `uid` still has a queued save for. */
function pendingBodyWeightDates(uid: string): Set<string> {
  const dates = new Set<string>();
  for (const mutation of useOfflineQueue.getState().queue) {
    const body = mutation.body;
    if (isBodyWeightQueueBody(body) && body.uid === uid) dates.add(body.entry.date);
  }
  return dates;
}

/** Queue uploads for body-weight entries the cloud lacks or holds older. */
export function queueBodyWeightUploads(uid: string, entries: BodyWeightEntry[]): void {
  const pending = pendingBodyWeightDates(uid);
  for (const entry of entries) {
    if (!pending.has(entry.date)) enqueueBodyWeightSave(uid, entry);
  }
}

/** Write a body-weight entry when online, otherwise (or on failure) queue it. */
async function writeOrQueueBodyWeight(uid: string, entry: BodyWeightEntry): Promise<void> {
  const online = await isOnline();
  if (online) {
    try {
      await saveBodyWeightToFirestore(uid, entry);
      return;
    } catch (error: unknown) {
      console.warn('[firestore] body weight write failed, queueing instead', error);
    }
  }
  enqueueBodyWeightSave(uid, entry);
  if (online) flushQueue();
}

/** Write a custom exercise when online, otherwise (or on failure) queue it. */
async function writeOrQueueCustomExercise(uid: string, exercise: Exercise): Promise<void> {
  const online = await isOnline();
  if (online) {
    try {
      await saveCustomExerciseToFirestore(uid, exercise);
      return;
    } catch (error: unknown) {
      console.warn('[firestore] custom exercise write failed, queueing instead', error);
    }
  }
  enqueueCustomExerciseSave(uid, exercise);
  if (online) flushQueue();
}

/**
 * Give parked mutations a fresh set of attempts and deliver what the
 * signed-in account owns. Called after each sign-in sync, so a workout
 * that failed repeatedly is retried rather than lost.
 */
export function resumeQueue(): void {
  useOfflineQueue.getState().retryFailed();
  flushQueue();
}

/**
 * Write a finished workout directly when online, otherwise queue it. A
 * failed online write also falls back to the queue so a session is never
 * lost to a transient error. Failures are logged rather than swallowed, so
 * a broken write is visible in Metro.
 */
async function writeOrQueueWorkout(uid: string, workout: Workout): Promise<void> {
  const online = await isOnline();
  if (online) {
    try {
      await saveWorkoutToFirestore(uid, workout);
      return;
    } catch (error: unknown) {
      console.warn('[firestore] workout write failed, queueing instead', error);
    }
  }
  enqueueWorkoutSave(uid, workout);
  if (online) flushQueue();
}

/** Delete a workout directly when online, otherwise queue the delete. */
async function deleteOrQueueWorkout(
  uid: string,
  workoutId: string,
  startedAt: number,
): Promise<void> {
  const online = await isOnline();
  if (online) {
    try {
      await deleteWorkoutFromFirestore(uid, workoutId, startedAt);
      return;
    } catch (error: unknown) {
      console.warn('[firestore] workout delete failed, queueing instead', error);
    }
  }
  enqueueWorkoutDelete(uid, workoutId, startedAt);
  if (online) flushQueue();
}

/** Deliver one queued Firestore mutation. */
async function deliverQueuedMutation(mutation: QueuedMutation): Promise<void> {
  if (isBodyWeightQueueBody(mutation.body)) {
    await saveBodyWeightToFirestore(mutation.body.uid, mutation.body.entry);
    return;
  }
  if (isCustomExerciseQueueBody(mutation.body)) {
    await saveCustomExerciseToFirestore(mutation.body.uid, mutation.body.exercise);
    return;
  }
  if (!isWorkoutQueueBody(mutation.body)) {
    throw new Error(`Unknown Firestore mutation: ${mutation.endpoint}`);
  }
  if (mutation.body.kind === 'saveWorkout') {
    await saveWorkoutToFirestore(mutation.body.uid, mutation.body.workout);
    return;
  }
  await deleteWorkoutFromFirestore(
    mutation.body.uid,
    mutation.body.workoutId,
    mutation.body.startedAt,
  );
}

/**
 * Register every cloud seam. Idempotent, so a fast-refresh remount is safe.
 */
export function registerCloudSync(): void {
  setCurrentUserIdProvider(currentUid);
  setCloudWorkoutWriter((workout) => {
    const uid = currentUid();
    if (uid === null) {
      console.warn('[firestore] no signed-in uid; workout write skipped');
      return;
    }
    void writeOrQueueWorkout(uid, workout).catch((error: unknown) => {
      console.warn('[firestore] workout sync failed', error);
    });
  });
  setCloudWorkoutDeleter((workoutId, startedAt) => {
    const uid = currentUid();
    if (uid === null) {
      console.warn('[firestore] no signed-in uid; workout delete skipped');
      return;
    }
    void deleteOrQueueWorkout(uid, workoutId, startedAt).catch((error: unknown) => {
      console.warn('[firestore] workout delete failed', error);
    });
  });
  setCloudCustomExerciseWriter((exercise) => {
    const uid = currentUid();
    if (uid === null) {
      console.warn('[firestore] no signed-in uid; custom exercise write skipped');
      return;
    }
    void writeOrQueueCustomExercise(uid, exercise).catch((error: unknown) => {
      console.warn('[firestore] custom exercise sync failed', error);
    });
  });
  setCloudBodyWeightWriter((entry) => {
    const uid = currentUid();
    if (uid === null) {
      console.warn('[firestore] no signed-in uid; body weight write skipped');
      return;
    }
    void writeOrQueueBodyWeight(uid, entry).catch((error: unknown) => {
      console.warn('[firestore] body weight sync failed', error);
    });
  });
  setQueueScopeProvider(currentUid);
  setFirestoreQueueTransport(deliverQueuedMutation);
  startOfflineQueueListener();
}
