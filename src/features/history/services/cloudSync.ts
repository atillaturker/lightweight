/**
 * Cloud seams for the history feature.
 *
 * The history store is the durable local source of truth. Two swappable
 * seams connect it to the cloud without the feature importing auth or
 * Firestore directly:
 *
 * - A writer that receives every finished workout for mirroring. Defaults
 *   to a no-op, so the local-only tests and the workout flow are unaffected.
 * - A provider for the signed-in uid, needed when building queued deletes.
 *
 * Queued workout mutations carry `transport: 'firestore'` and a tagged
 * body. The delivery handler is registered by the app layer, which is the
 * only place allowed to know about both auth and Firestore.
 */
import type { Workout } from '@domain/entities';
import { useOfflineQueue } from '@infrastructure/network';

/** Receives every finished workout so it can be mirrored to the cloud. */
export type CloudWorkoutWriter = (workout: Workout) => void;

/** Receives every deleted workout so it can be removed from the cloud. */
export type CloudWorkoutDeleter = (workoutId: string) => void;

/** Supplies the signed-in uid, or `null` when signed out. */
export type CurrentUserIdProvider = () => string | null;

const NOOP_WRITER: CloudWorkoutWriter = () => undefined;
const NOOP_DELETER: CloudWorkoutDeleter = () => undefined;
const NO_USER: CurrentUserIdProvider = () => null;

let cloudWorkoutWriter: CloudWorkoutWriter = NOOP_WRITER;
let cloudWorkoutDeleter: CloudWorkoutDeleter = NOOP_DELETER;
let currentUserIdProvider: CurrentUserIdProvider = NO_USER;

/** Register the sink that mirrors finished workouts to the cloud. */
export function setCloudWorkoutWriter(writer: CloudWorkoutWriter): void {
  cloudWorkoutWriter = writer;
}

/** Register the sink that deletes workouts from the cloud. */
export function setCloudWorkoutDeleter(deleter: CloudWorkoutDeleter): void {
  cloudWorkoutDeleter = deleter;
}

/** Register the source of the signed-in uid. */
export function setCurrentUserIdProvider(provider: CurrentUserIdProvider): void {
  currentUserIdProvider = provider;
}

/** The signed-in uid, or `null` when no provider is registered. */
export function getCurrentUserId(): string | null {
  return currentUserIdProvider();
}

/** Mirror a finished workout to the cloud through the registered writer. */
export function syncWorkoutToCloud(workout: Workout): void {
  cloudWorkoutWriter(workout);
}

/** Remove a workout from the cloud through the registered deleter. */
export function deleteWorkoutFromCloud(workoutId: string): void {
  cloudWorkoutDeleter(workoutId);
}

/** Reset every seam to its inert default. Used by tests. */
export function resetCloudSyncSeams(): void {
  cloudWorkoutWriter = NOOP_WRITER;
  cloudWorkoutDeleter = NOOP_DELETER;
  currentUserIdProvider = NO_USER;
}

/** Queue an offline create/update of one workout document. */
export function enqueueWorkoutSave(uid: string, workout: Workout): void {
  useOfflineQueue.getState().enqueue({
    endpoint: `firestore/users/${uid}/workouts/${workout.id}`,
    method: 'PUT',
    transport: 'firestore',
    body: { kind: 'saveWorkout', uid, workout },
  });
}

/** Queue an offline delete of one workout document. */
export function enqueueWorkoutDelete(uid: string, workoutId: string): void {
  useOfflineQueue.getState().enqueue({
    endpoint: `firestore/users/${uid}/workouts/${workoutId}`,
    method: 'DELETE',
    transport: 'firestore',
    body: { kind: 'deleteWorkout', uid, workoutId },
  });
}

/** A queued history mutation body. */
export type WorkoutQueueBody =
  | { kind: 'saveWorkout'; uid: string; workout: Workout }
  | { kind: 'deleteWorkout'; uid: string; workoutId: string };

/** Type guard for a queued history mutation body. */
export function isWorkoutQueueBody(value: unknown): value is WorkoutQueueBody {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as { kind?: unknown; uid?: unknown };
  if (typeof record.uid !== 'string') return false;
  return record.kind === 'saveWorkout' || record.kind === 'deleteWorkout';
}
