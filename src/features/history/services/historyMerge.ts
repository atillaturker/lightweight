/**
 * Reconcile the local history store with a cloud read.
 *
 * Finished sessions are immutable, so there are no field-level conflicts:
 * the same id on both sides is the same session and the local copy is
 * kept. What the policy has to get right is presence:
 *
 * - A deleted id (a cloud tombstone, or a delete still queued on this
 *   device) removes the session from both sides of the merge.
 * - A session only in the cloud is added.
 * - A session only on this device never reached the cloud (it was finished
 *   offline and its queued write was lost, or it predates sync), so it is
 *   returned for upload. Tombstones are what make this safe: without them a
 *   session deleted elsewhere would look exactly like one never uploaded.
 *
 * Local sessions older than a truncated read are neither uploaded nor
 * removed: the read did not reach that far, so their absence proves
 * nothing.
 */
import type { Workout } from '@domain/entities';

import { MAX_HISTORY_SESSIONS } from '../store/historyStore';
import type { RemoteHistory } from './firestoreWorkouts';

/** Outcome of {@link reconcileSessions}. */
export interface Reconciliation {
  /** The new local history, newest first and capped. */
  sessions: Workout[];
  /** Local sessions the cloud has never seen. */
  toUpload: Workout[];
}

/** Whether the read covered `startedAt`, so absence from it is meaningful. */
function isCoveredByRead(startedAt: number, remote: RemoteHistory): boolean {
  return remote.truncatedBefore === null || startedAt >= remote.truncatedBefore;
}

/**
 * Combine local and remote sessions. Local wins on id conflicts, cloud
 * tombstones remove local copies, and local-only sessions are returned for
 * upload.
 */
export function reconcileSessions(
  local: Workout[],
  remote: RemoteHistory,
): Reconciliation {
  const deleted = new Set(remote.deletedIds);
  const remoteIds = new Set(remote.workouts.map((session) => session.id));
  const byId = new Map<string, Workout>();
  const toUpload: Workout[] = [];

  for (const session of local) {
    if (deleted.has(session.id)) continue;
    byId.set(session.id, session);
    if (!remoteIds.has(session.id) && isCoveredByRead(session.startedAt, remote)) {
      toUpload.push(session);
    }
  }
  for (const session of remote.workouts) {
    // A live cloud copy can still be deleted: its delete may be queued here.
    if (deleted.has(session.id) || byId.has(session.id)) continue;
    byId.set(session.id, session);
  }

  const sessions = Array.from(byId.values())
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, MAX_HISTORY_SESSIONS);
  return { sessions, toUpload };
}
