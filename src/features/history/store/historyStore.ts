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
}

/**
 * Persisted history store. Subscribe with a selector, e.g.
 * `useHistoryStore((s) => s.sessions)`.
 */
export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
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
    }),
    {
      name: 'history',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({ sessions: state.sessions }),
    },
  ),
);
