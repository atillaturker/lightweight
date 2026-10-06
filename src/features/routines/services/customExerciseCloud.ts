/**
 * Cloud seams for custom exercises, mirroring the history feature's: a
 * swappable writer the app layer points at Firestore, and the offline-queue
 * body used when a write has to wait. Defaults are inert, so local-only
 * tests never touch the network.
 */
import type { Exercise } from '@domain/entities';
import { useOfflineQueue } from '@infrastructure/network';

/** Receives every created or edited custom exercise for mirroring. */
export type CloudCustomExerciseWriter = (exercise: Exercise) => void;

const NOOP_WRITER: CloudCustomExerciseWriter = () => undefined;
let writer: CloudCustomExerciseWriter = NOOP_WRITER;

/** Register the sink that mirrors custom exercises to the cloud. */
export function setCloudCustomExerciseWriter(next: CloudCustomExerciseWriter): void {
  writer = next;
}

/** Mirror a custom exercise through the registered writer. */
export function syncCustomExerciseToCloud(exercise: Exercise): void {
  writer(exercise);
}

/** Reset the seam. Used by tests. */
export function resetCustomExerciseCloud(): void {
  writer = NOOP_WRITER;
}

/** A queued custom-exercise write. */
export interface CustomExerciseQueueBody {
  kind: 'saveCustomExercise';
  uid: string;
  exercise: Exercise;
}

/** Type guard for a queued custom-exercise write. */
export function isCustomExerciseQueueBody(value: unknown): value is CustomExerciseQueueBody {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as { kind?: unknown; uid?: unknown; exercise?: unknown };
  return (
    record.kind === 'saveCustomExercise' &&
    typeof record.uid === 'string' &&
    typeof record.exercise === 'object' &&
    record.exercise !== null
  );
}

/** Queue an offline create/update of one custom-exercise document. */
export function enqueueCustomExerciseSave(uid: string, exercise: Exercise): void {
  useOfflineQueue.getState().enqueue({
    endpoint: `firestore/users/${uid}/exercises/${exercise.id}`,
    method: 'PUT',
    transport: 'firestore',
    scope: uid,
    body: { kind: 'saveCustomExercise', uid, exercise },
  });
}
