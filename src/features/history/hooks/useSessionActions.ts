/**
 * Write actions over the durable history store.
 *
 * Deleting a session must be dual: the local copy is removed immediately so
 * the UI updates, and the cloud copy is removed through the registered
 * deleter. The deleter decides whether to write directly or queue the
 * mutation when offline, so this hook stays network-agnostic.
 */
import { useCallback } from 'react';

import { deleteWorkoutFromCloud } from '../services/cloudSync';
import { useHistoryStore } from '../store';

/** Actions returned by {@link useSessionActions}. */
export interface SessionActions {
  /** Remove a session locally and mirror the delete to the cloud. */
  removeSession: (sessionId: string) => void;
}

/** Bound history write actions for screens. */
export function useSessionActions(): SessionActions {
  const removeSessionLocal = useHistoryStore((state) => state.removeSession);

  const removeSession = useCallback(
    (sessionId: string): void => {
      removeSessionLocal(sessionId);
      deleteWorkoutFromCloud(sessionId);
    },
    [removeSessionLocal],
  );

  return { removeSession };
}
