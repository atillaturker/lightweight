/**
 * Read model for the post-workout summary.
 *
 * The finished session arrives through the `lastSessionStore` hand-off,
 * because the active-workout store is cleared the moment a session ends.
 * When the screen is opened for an *older* session — the route carries a
 * `sessionId` and the hand-off holds something else — the session is read
 * back from the history provider instead, so the same screen serves both
 * entry points.
 *
 * Everything derived here is pure: durations, volume, set and rep counts,
 * and the personal-record roll-up. The screen only formats and lays out.
 */
import { useMemo } from 'react';
import { useShallow } from 'zustand/react/shallow';

import type { Exercise, Set as DomainSet, Workout } from '@domain/entities';

import { getExerciseLibrary, getSessionHistory } from '../services';
import { useLastSessionStore } from '../store';
import { summarizeSessionPRs, type PRSummaryRow } from '../utils/prSummary';
import {
  countSessionReps,
  countSessionSets,
  sessionMinutes,
  sessionVolumeKg,
} from '../utils/sessionDisplay';

/** Everything the summary screen renders. */
export interface SessionSummary {
  /** The session being summarized, or `null` when it cannot be found. */
  session: Workout | null;
  /** Session length in whole minutes. */
  minutes: number;
  /** Volume in kilograms, warmups excluded. */
  volumeKg: number;
  /** Completed sets. */
  sets: number;
  /** Total reps across working sets. */
  reps: number;
  /** Volume change against the previous session, or `null` when unknown. */
  volumeDeltaPercent: number | null;
  /** One row per exercise that set a record. Empty when none did. */
  personalRecords: PRSummaryRow[];
  /** True when the session has no completed sets at all. */
  isEmpty: boolean;
}

/** Name lookup for the exercises referenced by a session. */
function toExerciseNames(library: Exercise[]): Map<string, string> {
  return new Map(library.map((exercise) => [exercise.id, exercise.name]));
}

/**
 * Working sets from every session that started before `session`. Used to
 * seed PR description replay so a lone session's first set is not counted
 * as its own record.
 */
function priorWorkingSets(session: Workout, history: Workout[]): DomainSet[] {
  return history
    .filter((entry) => entry.id !== session.id && entry.startedAt < session.startedAt)
    .flatMap((entry) => entry.sets);
}

/**
 * Find the session a summary screen should render. Prefers the hand-off
 * when it matches the requested id, and otherwise scans history.
 */
function resolveSession(sessionId: string, handedOff: Workout | null): Workout | null {
  if (handedOff !== null && handedOff.id === sessionId) return handedOff;
  return getSessionHistory().find((session) => session.id === sessionId) ?? null;
}

/** Percent change in volume against the session immediately before this one. */
function volumeDelta(
  session: Workout,
  history: Workout[],
  volumeKg: number,
): number | null {
  const earlier = history
    .filter((entry) => entry.id !== session.id && entry.startedAt < session.startedAt)
    .sort((a, b) => b.startedAt - a.startedAt);
  const previous = earlier[0];
  if (previous === undefined) return null;

  const previousVolume = sessionVolumeKg(previous);
  if (previousVolume <= 0) return null;
  return ((volumeKg - previousVolume) / previousVolume) * 100;
}

/**
 * Derive the summary for one session id. Recomputes when the hand-off
 * changes, so finishing a workout and pushing straight to this screen
 * always renders the session that just ended.
 */
export function useSessionSummary(sessionId: string): SessionSummary {
  const handedOff = useLastSessionStore(
    useShallow((state) => state.lastSession),
  );

  return useMemo((): SessionSummary => {
    const session = resolveSession(sessionId, handedOff);
    if (session === null) {
      return {
        session: null,
        minutes: 0,
        volumeKg: 0,
        sets: 0,
        reps: 0,
        volumeDeltaPercent: null,
        personalRecords: [],
        isEmpty: true,
      };
    }

    const now = Date.now();
    const history = getSessionHistory();
    const volumeKg = sessionVolumeKg(session);
    const sets = countSessionSets(session);
    const names = toExerciseNames(getExerciseLibrary());

    return {
      session,
      minutes: sessionMinutes(session, now),
      volumeKg,
      sets,
      reps: countSessionReps(session),
      volumeDeltaPercent: volumeDelta(session, history, volumeKg),
      personalRecords: summarizeSessionPRs(
        session.sets,
        names,
        priorWorkingSets(session, history),
      ),
      isEmpty: sets === 0,
    };
  }, [handedOff, sessionId]);
}
