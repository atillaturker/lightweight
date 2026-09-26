/**
 * Merge a cloud read into the local history store.
 *
 * Policy for this foundation batch: the local copy wins whenever the same
 * session id exists on both sides. Sessions that exist only in the cloud
 * are added; sessions that exist only locally are kept untouched (they are
 * either not yet synced or queued for upload). The result is newest-first
 * and capped like the store itself.
 */
import type { Workout } from '@domain/entities';

import { MAX_HISTORY_SESSIONS } from '../store/historyStore';

/**
 * Combine local and remote sessions. Local wins on id conflicts.
 */
export function mergeSessions(
  local: Workout[],
  remote: Workout[],
): Workout[] {
  const byId = new Map<string, Workout>();
  for (const session of local) byId.set(session.id, session);
  for (const session of remote) {
    if (!byId.has(session.id)) byId.set(session.id, session);
  }
  return Array.from(byId.values())
    .sort((a, b) => b.startedAt - a.startedAt)
    .slice(0, MAX_HISTORY_SESSIONS);
}
