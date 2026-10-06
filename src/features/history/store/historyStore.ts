/**
 * Durable local workout history.
 *
 * Finished workouts are persisted to MMKV under the `history` key, most
 * recent first. The workout feature writes here through its recorder seam
 * (see `app/providers/registerDataProviders`) and reads back through its
 * session-history provider, so both features share one source without
 * importing each other.
 *
 * The list is capped so a long-lived install cannot grow the persisted
 * payload without bound; the oldest session is dropped past the cap.
 */
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import type { Workout } from '@domain/entities';
import { zustandStorage } from '@infrastructure/storage';

/** Base MMKV key; the app layer scopes it per signed-in user. */
export const HISTORY_STORE_KEY = 'history';

/** Maximum sessions retained locally. Oldest are dropped past this. */
export const MAX_HISTORY_SESSIONS = 500;

/** History state plus the mutators used by the recorder and screens. */
export interface HistoryStore {
  /** Finished sessions, most recent first. */
  sessions: Workout[];
  /** Prepend a finished workout, dropping the oldest past the cap. */
  addSession: (workout: Workout) => void;
  /** Remove one session by id. No-op when it is not present. */
  removeSession: (sessionId: string) => void;
  /** Drop every stored session. */
  clearAll: () => void;
  /**
   * Add the workouts whose ids are not stored yet, keeping newest-first
   * order and the cap. Returns the ones added.
   */
  mergeSessions: (workouts: Workout[]) => Workout[];
}

/**
 * Persisted history store. Subscribe with a selector, e.g.
 * `useHistoryStore((s) => s.sessions)`.
 */
export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set, get) => ({
      sessions: [],
      addSession: (workout) =>
        set((state) => ({
          sessions: [workout, ...state.sessions].slice(0, MAX_HISTORY_SESSIONS),
        })),
      removeSession: (sessionId) =>
        set((state) => ({
          sessions: state.sessions.filter((session) => session.id !== sessionId),
        })),
      clearAll: () => set({ sessions: [] }),
      mergeSessions: (workouts) => {
        const known = new Set(get().sessions.map((session) => session.id));
        const added = workouts.filter((workout) => {
          if (known.has(workout.id)) return false;
          known.add(workout.id);
          return true;
        });
        if (added.length === 0) return [];
        const sessions = [...get().sessions, ...added]
          .sort((a, b) => b.startedAt - a.startedAt)
          .slice(0, MAX_HISTORY_SESSIONS);
        set({ sessions });
        const kept = new Set(sessions.map((session) => session.id));
        return added.filter((workout) => kept.has(workout.id));
      },
    }),
    {
      name: HISTORY_STORE_KEY,
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ sessions: state.sessions }),
    },
  ),
);
