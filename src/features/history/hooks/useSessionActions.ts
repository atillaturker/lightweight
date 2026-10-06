/**
 * Write actions over the durable history store.
 *
 * Deleting a session must be dual: the local copy is removed immediately so
 * the UI updates, and the cloud copy is removed through the registered
 * deleter. The deleter decides whether to write directly or queue the
 * mutation when offline, so this hook stays network-agnostic.
 */
import { useCallback } from 'react';

import type { Workout } from '@domain/entities';

import { deleteWorkoutFromCloud, syncWorkoutToCloud } from '../services/cloudSync';
import { useHistoryStore } from '../store';

/** Actions returned by {@link useSessionActions}. */
export interface SessionActions {
  /** Remove a session locally and mirror the delete to the cloud. */
  removeSession: (sessionId: string) => void;
  /**
   * Add workouts not stored yet (e.g. from a backup) and mirror each to
   * the cloud. Returns how many were added.
   */
  importSessions: (workouts: Workout[]) => number;
  /** Remove every stored session, leaving a cloud tombstone for each. */
  removeAllSessions: () => void;
}

/** Bound history write actions for screens. */
export function useSessionActions(): SessionActions {
  const removeSessionLocal = useHistoryStore((state) => state.removeSession);

  const removeSession = useCallback(
    (sessionId: string): void => {
      // Read before removing: the cloud tombstone needs the start time.
      const session = useHistoryStore
        .getState()
        .sessions.find((entry) => entry.id === sessionId);
      removeSessionLocal(sessionId);
      if (session !== undefined) deleteWorkoutFromCloud(sessionId, session.startedAt);
    },
    [removeSessionLocal],
  );

  const importSessions = useCallback((workouts: Workout[]): number => {
    const added = useHistoryStore.getState().mergeSessions(workouts);
    added.forEach(syncWorkoutToCloud);
    return added.length;
  }, []);

  const removeAllSessions = useCallback((): void => {
    const { sessions, clearAll } = useHistoryStore.getState();
    clearAll();
    sessions.forEach((session) => deleteWorkoutFromCloud(session.id, session.startedAt));
  }, []);

  return { removeSession, importSessions, removeAllSessions };
}
