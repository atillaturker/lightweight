/**
 * Session Detail read model hook.
 *
 * Resolves the requested id against the durable history store — the correct
 * source for a *past* session, unlike the summary screen's hand-off — and
 * derives the screen's figures through {@link buildSessionDetail}.
 */
import { useMemo } from 'react';

import { useHistoryStore } from '@features/history';
import { getExerciseLibrary } from '@features/workout';

import { buildSessionDetail, type SessionDetailModel } from '../utils';

/**
 * Read model for one past session. Recomputes when history changes, so a
 * deletion made elsewhere is reflected immediately.
 */
export function useSessionDetail(sessionId: string): SessionDetailModel {
  const sessions = useHistoryStore((state) => state.sessions);

  return useMemo((): SessionDetailModel => {
    const session = sessions.find((entry) => entry.id === sessionId) ?? null;
    return buildSessionDetail(session, Date.now(), getExerciseLibrary(), sessions);
  }, [sessions, sessionId]);
}
