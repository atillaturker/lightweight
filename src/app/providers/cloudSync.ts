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

import type { Workout } from '@domain/entities';
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
async function deleteOrQueueWorkout(uid: string, workoutId: string): Promise<void> {
  const online = await isOnline();
  if (online) {
    try {
      await deleteWorkoutFromFirestore(uid, workoutId);
      return;
    } catch (error: unknown) {
      console.warn('[firestore] workout delete failed, queueing instead', error);
    }
  }
  enqueueWorkoutDelete(uid, workoutId);
  if (online) flushQueue();
}

/** Deliver one queued Firestore mutation. */
async function deliverQueuedMutation(mutation: QueuedMutation): Promise<void> {
  if (!isWorkoutQueueBody(mutation.body)) {
    throw new Error(`Unknown Firestore mutation: ${mutation.endpoint}`);
  }
  if (mutation.body.kind === 'saveWorkout') {
    await saveWorkoutToFirestore(mutation.body.uid, mutation.body.workout);
    return;
  }
  await deleteWorkoutFromFirestore(mutation.body.uid, mutation.body.workoutId);
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
  setCloudWorkoutDeleter((workoutId) => {
    const uid = currentUid();
    if (uid === null) {
      console.warn('[firestore] no signed-in uid; workout delete skipped');
      return;
    }
    void deleteOrQueueWorkout(uid, workoutId).catch((error: unknown) => {
      console.warn('[firestore] workout delete failed', error);
    });
  });
  setQueueScopeProvider(currentUid);
  setFirestoreQueueTransport(deliverQueuedMutation);
  startOfflineQueueListener();
}
