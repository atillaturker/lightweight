/**
 * Cloud seams for body weight: a swappable writer the app layer points at
 * Firestore, and the offline-queue body for writes that must wait. Inert
 * by default, so local-only tests never touch the network.
 */
import type { BodyWeightEntry } from '@domain/entities';
import { useOfflineQueue } from '@infrastructure/network';

/** Receives every logged, replaced or removed entry. */
export type CloudBodyWeightWriter = (entry: BodyWeightEntry) => void;

const NOOP: CloudBodyWeightWriter = () => undefined;
let writer: CloudBodyWeightWriter = NOOP;

/** Register the sink that mirrors entries to the cloud. */
export function setCloudBodyWeightWriter(next: CloudBodyWeightWriter): void {
  writer = next;
}

/** Mirror an entry through the registered writer. */
export function syncBodyWeightToCloud(entry: BodyWeightEntry): void {
  writer(entry);
}

/** Reset the seam. Used by tests. */
export function resetBodyWeightCloud(): void {
  writer = NOOP;
}

/** A queued body-weight write. */
export interface BodyWeightQueueBody {
  kind: 'saveBodyWeight';
  uid: string;
  entry: BodyWeightEntry;
}

/** Type guard for a queued body-weight write. */
export function isBodyWeightQueueBody(value: unknown): value is BodyWeightQueueBody {
  if (typeof value !== 'object' || value === null) return false;
  const record = value as { kind?: unknown; uid?: unknown; entry?: unknown };
  return (
    record.kind === 'saveBodyWeight' &&
    typeof record.uid === 'string' &&
    typeof record.entry === 'object' &&
    record.entry !== null
  );
}

/** Queue an offline write of one entry. */
export function enqueueBodyWeightSave(uid: string, entry: BodyWeightEntry): void {
  useOfflineQueue.getState().enqueue({
    endpoint: `firestore/users/${uid}/bodyweight/${entry.date}`,
    method: 'PUT',
    transport: 'firestore',
    scope: uid,
    body: { kind: 'saveBodyWeight', uid, entry },
  });
}
